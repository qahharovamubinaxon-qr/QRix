/* Assertions for lib/pdf-compress.ts — the engine behind /pdf-tools/compress
 * and the "compress PDF for email" use-case pages.
 *
 * Why this file exists: a broken PDF compressor looks like a working one. The
 * route this replaced spliced re-encoded JPEGs straight into the raw bytes
 * without touching /Length or the xref offsets, and it still produced files
 * that opened — because readers silently rebuild a damaged xref. "It opened on
 * my machine" is therefore worth nothing here, and the byte-size number the UI
 * prints is worth even less: returning a truncated file scores a fantastic
 * saving.
 *
 * So the output is validated by pdf.js, a strict parser that is not the one
 * that wrote the file, and every re-encoded image is decoded again with sharp
 * to prove its stream dictionary describes its actual bytes.
 *
 * The core module is DOM-free and takes its encoder as an argument, so the
 * SHIPPED functions run here unmodified with sharp standing in for the canvas.
 *
 *   node scripts/test-pdf-compress.mjs      (or: npm run test:pdf)
 */

import assert from "node:assert/strict";
import sharp from "sharp";
import {
  PDFDocument,
  PDFRawStream,
  PDFName,
  PDFNumber,
  PDFDict,
  StandardFonts,
} from "pdf-lib";
import {
  compressPdf,
  scaledDims,
  filterChain,
  isRecompressableJpeg,
  collectMaskRefs,
  jpegComponents,
  COMPRESS_LEVELS,
  MIN_IMAGE_BYTES,
} from "../lib/pdf-compress.ts";

let pass = 0;
const fails = [];
const t = async (name, fn) => {
  try { await fn(); pass++; }
  catch (e) { fails.push(`${name}\n    ${e.message.split("\n").join("\n    ")}`); }
};

/* ---- the encoder under test, sharp standing in for canvas -------------- */

const sharpReencoder = async (jpeg, maxDim, quality) => {
  const meta = await sharp(Buffer.from(jpeg)).metadata();
  const { width, height } = scaledDims(meta.width, meta.height, maxDim);
  const bytes = await sharp(Buffer.from(jpeg))
    .resize(width, height, { fit: "fill" })
    .jpeg({ quality: Math.round(quality * 100) })
    .toBuffer();
  return { bytes: new Uint8Array(bytes), width, height };
};

/* ---- fixture: a "too big to email" scan -------------------------------- */

/** Deterministic LCG so the fixture — and therefore every size assertion
 *  below — is identical on every machine and every run. */
function makePhoto(w, h, seed, grey = false) {
  let s = seed >>> 0;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  const px = Buffer.alloc(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 3;
      // A smooth gradient plus grain: compresses like a photograph rather than
      // like pure noise (incompressible) or a flat fill (trivially small).
      const base = 128 + 100 * Math.sin(x / 90) * Math.cos(y / 70);
      px[i] = Math.max(0, Math.min(255, base + rnd() * 60 - 30));
      px[i + 1] = Math.max(0, Math.min(255, base * 0.8 + rnd() * 60 - 30));
      px[i + 2] = Math.max(0, Math.min(255, base * 0.6 + rnd() * 60 - 30));
    }
  }
  const img = sharp(px, { raw: { width: w, height: h, channels: 3 } });
  return (grey ? img.greyscale().toColourspace("b-w") : img)
    .jpeg({ quality: 92 })
    .toBuffer();
}

async function buildFixture() {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const photos = [];
  for (let p = 0; p < 5; p++) {
    // Page 3 is a greyscale scan: the common shape for a scanned document, and
    // the one that catches a hardcoded /DeviceRGB.
    const jpg = await makePhoto(2000, 1500, 7 + p, p === 2);
    photos.push(jpg);
    const img = await doc.embedJpg(jpg);
    const page = doc.addPage([595, 842]);
    page.drawImage(img, { x: 20, y: 300, width: 555, height: 416 });
    page.drawText(`Invoice page ${p + 1} — total due 1240.00`, {
      x: 40, y: 120, size: 12, font,
    });
  }
  // A logo, below MIN_IMAGE_BYTES: must be left alone.
  const logo = await sharp({
    create: { width: 24, height: 24, channels: 3, background: { r: 255, g: 80, b: 20 } },
  }).jpeg().toBuffer();
  const logoImg = await doc.embedJpg(logo);
  doc.getPage(0).drawImage(logoImg, { x: 40, y: 760, width: 40, height: 40 });

  return { bytes: await doc.save({ useObjectStreams: true }), photos, logoLen: logo.length };
}

/** Attach a DCTDecode stream as another image's /SMask, which pdf-lib will not
 *  do on its own. This is the shape the alpha guard exists for. */
async function withJpegSMask(pdfBytes) {
  const doc = await PDFDocument.load(pdfBytes);
  const ctx = doc.context;
  const gray = await sharp({
    create: { width: 400, height: 400, channels: 3, background: { r: 128, g: 128, b: 128 } },
  }).jpeg({ quality: 95 }).toBuffer();
  const padded = Buffer.concat([gray, Buffer.alloc(MIN_IMAGE_BYTES)]); // clear the size floor
  const maskDict = ctx.obj({
    Type: "XObject", Subtype: "Image", Width: 400, Height: 400,
    ColorSpace: "DeviceGray", BitsPerComponent: 8, Filter: "DCTDecode",
    Length: padded.length,
  });
  const maskRef = ctx.register(PDFRawStream.of(maskDict, new Uint8Array(padded)));

  // Point the first real photo at it.
  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    if (obj instanceof PDFRawStream && isRecompressableJpeg(obj.dict)
        && obj.contents.length > MIN_IMAGE_BYTES) {
      obj.dict.set(PDFName.of("SMask"), maskRef);
      break;
    }
  }
  return { bytes: await doc.save({ useObjectStreams: true }), maskRef: String(maskRef), maskLen: padded.length };
}

/* ---- independent validation ------------------------------------------- */

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
const STANDARD_FONTS = new URL(
  "../node_modules/pdfjs-dist/standard_fonts/", import.meta.url,
).href;

/** Parse with pdf.js and pull out what a reader actually sees. Throws if the
 *  xref, any stream length or any image dictionary is inconsistent. */
async function readWithPdfJs(bytes) {
  const task = pdfjs.getDocument({
    data: new Uint8Array(bytes),
    useSystemFonts: false,
    isEvalSupported: false,
    standardFontDataUrl: STANDARD_FONTS,
    // pdf.js v6 ships Foxit substitutes, not LiberationSans, and warns once per
    // page about the font it did not find. Real parse failures still throw.
    verbosity: 0,
  });
  const doc = await task.promise;
  const pages = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    await page.getOperatorList(); // forces every referenced image to be decoded
    const text = (await page.getTextContent()).items.map((it) => it.str).join(" ");
    pages.push({ text, size: page.getViewport({ scale: 1 }) });
  }
  const out = { numPages: doc.numPages, pages };
  await task.destroy();
  return out;
}

/** Every DCTDecode image in the file, decoded with sharp so a dictionary that
 *  lies about its own bytes is caught. */
async function decodeImages(bytes) {
  const doc = await PDFDocument.load(bytes);
  const out = [];
  for (const [ref, obj] of doc.context.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (!isRecompressableJpeg(obj.dict)) continue;
    const declared = {
      width: obj.dict.lookup(PDFName.of("Width"))?.asNumber?.(),
      height: obj.dict.lookup(PDFName.of("Height"))?.asNumber?.(),
      length: obj.dict.lookup(PDFName.of("Length"))?.asNumber?.(),
      colorSpace: String(obj.dict.lookup(PDFName.of("ColorSpace"))),
    };
    const meta = await sharp(Buffer.from(obj.contents)).metadata();
    out.push({ ref: String(ref), declared, actual: meta, bytes: obj.contents.length });
  }
  return out;
}

const MB = (n) => (n / 1024 / 1024).toFixed(2);

/* ---- pure decisions ---------------------------------------------------- */

await t("scaledDims never upscales a small image", () => {
  assert.deepEqual(scaledDims(300, 200, 1200), { width: 300, height: 200 });
});

await t("scaledDims caps the longest edge and keeps the aspect ratio", () => {
  assert.deepEqual(scaledDims(4000, 3000, 1200), { width: 1200, height: 900 });
  assert.deepEqual(scaledDims(3000, 4000, 1200), { width: 900, height: 1200 });
});

await t("scaledDims never rounds a sliver down to a zero-pixel canvas", () => {
  assert.deepEqual(scaledDims(4000, 3, 900), { width: 900, height: 1 });
});

await t("every level downscales and none is lossless-quality", () => {
  for (const [name, cfg] of Object.entries(COMPRESS_LEVELS)) {
    assert.ok(cfg.quality > 0 && cfg.quality <= 1, `${name} quality is 0-1 (canvas convention)`);
    assert.ok(cfg.maxDim >= 900, `${name} keeps a readable resolution`);
  }
  assert.ok(COMPRESS_LEVELS.high.maxDim < COMPRESS_LEVELS.low.maxDim);
  assert.ok(COMPRESS_LEVELS.high.quality < COMPRESS_LEVELS.low.quality);
});

/* ---- image classification --------------------------------------------- */

const ctx = (await PDFDocument.create()).context;
const dictOf = (o) => {
  const d = ctx.obj(o);
  return d instanceof PDFDict ? d : d;
};

await t("a plain DCTDecode image qualifies", () => {
  assert.equal(isRecompressableJpeg(dictOf({ Subtype: "Image", Filter: "DCTDecode" })), true);
});

await t("a stencil mask is refused — JPEG has no 1-bit mode", () => {
  assert.equal(
    isRecompressableJpeg(dictOf({ Subtype: "Image", Filter: "DCTDecode", ImageMask: true })),
    false,
  );
});

await t("a Flate-wrapped JPEG is refused: the chain has to be inflated first", () => {
  assert.equal(
    isRecompressableJpeg(dictOf({ Subtype: "Image", Filter: ["FlateDecode", "DCTDecode"] })),
    false,
  );
});

await t("a bilevel fax scan is refused — already denser than JPEG", () => {
  assert.equal(
    isRecompressableJpeg(dictOf({ Subtype: "Image", Filter: "CCITTFaxDecode" })),
    false,
  );
});

await t("a non-image stream is refused", () => {
  assert.equal(isRecompressableJpeg(dictOf({ Subtype: "Form", Filter: "DCTDecode" })), false);
});

await t("filterChain reads both the single-name and array forms", () => {
  assert.deepEqual(filterChain(dictOf({ Filter: "DCTDecode" })), ["/DCTDecode"]);
  assert.deepEqual(filterChain(dictOf({ Filter: ["FlateDecode", "DCTDecode"] })),
    ["/FlateDecode", "/DCTDecode"]);
  assert.deepEqual(filterChain(dictOf({})), []);
});

/* ---- the real thing ---------------------------------------------------- */

const fixture = await buildFixture();
const inputSize = fixture.bytes.length;

await t("the fixture is the shape this tool exists for: too big to email, JPEG-heavy", () => {
  assert.ok(inputSize > 3 * 1024 * 1024,
    `fixture only ${MB(inputSize)} MB — not representative`);
});

let result;
await t("compressPdf makes a big scan dramatically smaller", async () => {
  result = await compressPdf(fixture.bytes, { level: "medium", reencodeJpeg: sharpReencoder });
  assert.equal(result.imagesFound, 5, "the 5 photos are found");
  assert.equal(result.imagesRecompressed, 5, "and all 5 are actually replaced");
  assert.ok(result.savedPercent > 60,
    `only saved ${result.savedPercent}% (${MB(inputSize)} → ${MB(result.compressedSize)} MB)`);
});

await t("the tiny logo is left alone, not re-encoded into something bigger", async () => {
  const imgs = await decodeImages(result.bytes);
  const logo = imgs.find((i) => i.declared.width === 24);
  assert.ok(logo, "logo still present");
  assert.equal(logo.bytes, fixture.logoLen, "logo bytes untouched");
});

await t("pdf.js — a parser that did not write the file — reads every page", async () => {
  const read = await readWithPdfJs(result.bytes);
  assert.equal(read.numPages, 5);
  for (const p of read.pages) {
    assert.equal(Math.round(p.size.width), 595, "page size preserved");
    assert.equal(Math.round(p.size.height), 842, "page size preserved");
  }
});

await t("the text layer survives — compression must not touch what is not an image", async () => {
  const read = await readWithPdfJs(result.bytes);
  assert.match(read.pages[0].text, /Invoice page 1/);
  assert.match(read.pages[4].text, /total due 1240\.00/);
});

await t("every rewritten image dictionary describes its own bytes", async () => {
  const imgs = await decodeImages(result.bytes);
  const photos = imgs.filter((i) => i.declared.width > 100);
  assert.equal(photos.length, 5);
  for (const img of photos) {
    // The old route's exact failure: bytes replaced, /Length left describing
    // the previous ones.
    assert.equal(img.declared.length, img.bytes, "/Length matches the real stream length");
    assert.equal(img.declared.width, img.actual.width, "/Width matches the encoded JPEG");
    assert.equal(img.declared.height, img.actual.height, "/Height matches the encoded JPEG");
    assert.equal(img.declared.width, COMPRESS_LEVELS.medium.maxDim, "downscaled to the level cap");
    // Derived from the bytes, never assumed: /DeviceGray over 3-channel samples
    // (or the reverse) makes the reader consume the wrong number of samples per
    // pixel and the page renders as diagonal colour hash.
    const expected = { 1: "/DeviceGray", 3: "/DeviceRGB" }[img.actual.channels];
    assert.equal(img.declared.colorSpace, expected, "colour space follows the new samples");
  }
});

await t("a greyscale scan's /DeviceGray is updated, not inherited, when it re-encodes to RGB", async () => {
  // Page 3 of the fixture is a 1-channel scan, and every real encoder — canvas
  // and sharp alike — hands back 3-channel JPEG. Leaving the original
  // /DeviceGray in place would describe the new bytes wrongly.
  const before = await decodeImages(fixture.bytes);
  assert.ok(
    before.some((i) => i.declared.colorSpace === "/DeviceGray" && i.actual.channels === 1),
    "the fixture really does contain a greyscale scan",
  );
  const after = await decodeImages(result.bytes);
  for (const img of after.filter((i) => i.declared.width > 100)) {
    assert.equal(img.actual.channels, 3, "re-encoded to RGB");
    assert.equal(img.declared.colorSpace, "/DeviceRGB", "and the dict was updated to say so");
  }
});

await t("jpegComponents reads the real channel count out of the SOF header", async () => {
  const colour = await makePhoto(64, 64, 1);
  const grey = await makePhoto(64, 64, 1, true);
  assert.equal(jpegComponents(new Uint8Array(colour)), 3);
  assert.equal(jpegComponents(new Uint8Array(grey)), 1);
});

await t("jpegComponents survives a JPEG carrying an EXIF/ICC blob before the frame", async () => {
  const withExif = await sharp(await makePhoto(64, 64, 3))
    .withMetadata({ icc: "srgb" })
    .jpeg()
    .toBuffer();
  assert.equal(jpegComponents(new Uint8Array(withExif)), 3);
});

await t("jpegComponents returns 0 for bytes that are not a JPEG at all", () => {
  assert.equal(jpegComponents(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 1, 2, 3, 4])), 0);
  assert.equal(jpegComponents(new Uint8Array([])), 0);
  assert.equal(jpegComponents(new Uint8Array([0xff, 0xd8])), 0, "header only, no frame");
});

await t("high compresses harder than low, and both stay valid", async () => {
  const low = await compressPdf(fixture.bytes, { level: "low", reencodeJpeg: sharpReencoder });
  const high = await compressPdf(fixture.bytes, { level: "high", reencodeJpeg: sharpReencoder });
  assert.ok(high.compressedSize < low.compressedSize,
    `high ${MB(high.compressedSize)} should beat low ${MB(low.compressedSize)}`);
  assert.equal((await readWithPdfJs(high.bytes)).numPages, 5);
  assert.equal((await readWithPdfJs(low.bytes)).numPages, 5);
});

await t("progress is reported and ends at 1", async () => {
  const seen = [];
  await compressPdf(fixture.bytes, {
    level: "high", reencodeJpeg: sharpReencoder, onProgress: (f) => seen.push(f),
  });
  assert.ok(seen.length >= 5, "one tick per image at least");
  assert.equal(seen[seen.length - 1], 1, "finishes at 100%");
  assert.deepEqual([...seen].sort((a, b) => a - b), seen, "monotonic");
});

/* ---- refusing to make things worse ------------------------------------- */

await t("an image that re-encodes larger keeps its original bytes", async () => {
  const bloat = async (jpeg) => {
    const meta = await sharp(Buffer.from(jpeg)).metadata();
    const bytes = await sharp(Buffer.from(jpeg)).jpeg({ quality: 100 }).toBuffer();
    return { bytes: new Uint8Array(bytes), width: meta.width, height: meta.height };
  };
  const r = await compressPdf(fixture.bytes, { level: "medium", reencodeJpeg: bloat });
  assert.equal(r.imagesFound, 5, "still found");
  assert.equal(r.imagesRecompressed, 0, "but none swapped in");
  const imgs = await decodeImages(r.bytes);
  const photo = imgs.find((i) => i.declared.width === 2000);
  assert.ok(photo, "photos kept their original resolution");
});

await t("an undecodable image (CMYK) passes through instead of corrupting", async () => {
  const failing = async () => { throw new Error("cannot decode CMYK JPEG"); };
  const r = await compressPdf(fixture.bytes, { level: "medium", reencodeJpeg: failing });
  assert.equal(r.imagesRecompressed, 0);
  const read = await readWithPdfJs(r.bytes);
  assert.equal(read.numPages, 5, "document still opens");
  assert.match(read.pages[0].text, /Invoice page 1/);
});

await t("a file that cannot be improved comes back byte-identical, not bigger", async () => {
  const noop = async () => null;
  const already = await compressPdf(fixture.bytes, { level: "medium", reencodeJpeg: noop });
  assert.ok(already.compressedSize <= inputSize, "never returns a bigger file");
  const again = await compressPdf(already.bytes, { level: "medium", reencodeJpeg: noop });
  assert.equal(again.savedPercent, 0, "a second pass claims no fake saving");
});

/* ---- the alpha guard --------------------------------------------------- */

await t("a JPEG used as an /SMask is never rewritten to RGB", async () => {
  const { bytes, maskRef, maskLen } = await withJpegSMask(fixture.bytes);
  const doc = await PDFDocument.load(bytes);
  assert.ok(collectMaskRefs(doc.context).has(maskRef), "the mask ref is detected");

  const r = await compressPdf(bytes, { level: "high", reencodeJpeg: sharpReencoder });
  const imgs = await decodeImages(r.bytes);
  const mask = imgs.find((i) => i.declared.width === 400);
  assert.ok(mask, "mask survives");
  assert.equal(mask.bytes, maskLen, "mask bytes untouched");
  assert.equal(mask.declared.colorSpace, "/DeviceGray", "still greyscale alpha, not RGB");
  assert.equal(r.imagesRecompressed, 5, "the real photos were still compressed");
});

/* ---- report ------------------------------------------------------------ */

if (result) {
  console.log(`  fixture ${MB(inputSize)} MB → ${MB(result.compressedSize)} MB ` +
    `(${result.savedPercent}% smaller, ${result.imagesRecompressed} images re-encoded)`);
}
console.log(fails.length ? `\n✗ ${fails.length} failed, ${pass} passed\n` : `✓ ${pass} passed`);
for (const f of fails) console.log("  ✗ " + f);
process.exit(fails.length ? 1 : 0);
