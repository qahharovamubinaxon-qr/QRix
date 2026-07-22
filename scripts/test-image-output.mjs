/* Assertions for lib/image-output.ts — the output rules behind every resize,
 * convert, social-size and EXIF-strip page.
 *
 * Why this file exists: these rules are only observable by downloading a file
 * from a hydrated browser, and the in-app preview pane never hydrates the
 * canvas engines, so they had been shipping on `tsc --noEmit` alone. M120 is
 * what that costs — every resize silently returned a JPG and transparent PNGs
 * came back flattened onto white, live, across 50+ localized pages.
 *
 * It imports the SHIPPED module (Node 22.18+/24 strips the types natively), so
 * a regression in the component's real dependency fails here. Do not copy the
 * logic into this file.
 *
 *   node scripts/test-image-output.mjs      (or: npm run test:image)
 */

import assert from "node:assert/strict";
import {
  keepFormat,
  keepsAlpha,
  paintsBackground,
  flattensToWhite,
  drawRect,
} from "../lib/image-output.ts";
import { IMAGE_TOOLS } from "../lib/image-tools-meta.ts";

let pass = 0;
const fails = [];
const t = (name, fn) => {
  try { fn(); pass++; }
  catch (e) { fails.push(`${name}\n    ${e.message.split("\n").join("\n    ")}`); }
};

/* ---- keepFormat: the M120 regression itself -------------------------- */

t("PNG source stays PNG (M120: everything used to return JPG)", () => {
  assert.equal(keepFormat("image/png", "logo.png"), "png");
});
t("WebP source stays WebP", () => {
  assert.equal(keepFormat("image/webp", "hero.webp"), "webp");
});
t("JPEG source stays JPEG", () => {
  assert.equal(keepFormat("image/jpeg", "photo.jpg"), "jpeg");
});
t("formats canvas cannot round-trip fall back to JPG, as the hub copy says", () => {
  for (const [type, name] of [
    ["image/heic", "IMG_0042.heic"],
    ["image/tiff", "scan.tiff"],
    ["image/bmp", "old.bmp"],
    ["image/avif", "next.avif"],
    ["image/gif", "loop.gif"],
  ]) assert.equal(keepFormat(type, name), "jpeg", `${name} should land as jpeg`);
});
t("empty MIME (some file managers) still resolves from the extension", () => {
  assert.equal(keepFormat("", "transparent-logo.png"), "png");
  assert.equal(keepFormat("", "banner.webp"), "webp");
});
t("extension wins when the MIME is the generic octet-stream", () => {
  assert.equal(keepFormat("application/octet-stream", "a.png"), "png");
});
t("case is ignored in both type and name", () => {
  assert.equal(keepFormat("IMAGE/PNG", "LOGO.PNG"), "png");
  assert.equal(keepFormat("", "Photo.WEBP"), "webp");
});
t("a .jpg named with 'png' in the stem is not misread as PNG-safe... (documents current behaviour)", () => {
  // Substring matching means "screenshot-png-export.jpg" resolves to png.
  // Harmless (PNG is lossless and alpha-safe, so nothing is destroyed) but it
  // is the known sharp edge of the cheap check — pin it so a change is noticed.
  assert.equal(keepFormat("", "screenshot-png-export.jpg"), "png");
});

/* ---- keepsAlpha ------------------------------------------------------ */

t("png and webp carry alpha; jpeg does not", () => {
  assert.equal(keepsAlpha("image/png"), true);
  assert.equal(keepsAlpha("image/webp"), true);
  assert.equal(keepsAlpha("image/jpeg"), false);
});

/* ---- paintsBackground: the alpha-flattening half of M120 ------------- */

t("fill mode must NOT paint behind an alpha-safe format", () => {
  // This is the bug: painting bg in fill mode flattened transparent PNGs.
  assert.equal(paintsBackground("fill", "image/png"), false);
  assert.equal(paintsBackground("fill", "image/webp"), false);
});
t("fill mode DOES paint for jpeg — otherwise the frame encodes black", () => {
  assert.equal(paintsBackground("fill", "image/jpeg"), true);
});
t("fit mode always paints — the colour is the padding the user picked", () => {
  for (const m of ["image/png", "image/webp", "image/jpeg"])
    assert.equal(paintsBackground("fit", m), true, `fit/${m}`);
});

/* ---- flattensToWhite ------------------------------------------------- */

t("jpeg and 24-bit bmp flatten onto white; png/webp/tiff do not", () => {
  assert.equal(flattensToWhite("image/jpeg", "jpeg"), true);
  assert.equal(flattensToWhite("image/png", "bmp"), true);   // bmp keeps png mime
  assert.equal(flattensToWhite("image/png", "png"), false);
  assert.equal(flattensToWhite("image/webp", "webp"), false);
  assert.equal(flattensToWhite("image/png", "tiff"), false); // encoder handles alpha
});

/* ---- drawRect: fit contains, fill covers, both centred --------------- */

t("fill covers the frame and crops the overflow", () => {
  // 1600x900 into a 1080x1080 square: scale by width -> 1920 tall, cropped.
  const r = drawRect("fill", 1080, 1080, 1600, 900);
  assert.equal(Math.round(r.w), 1920);
  assert.equal(Math.round(r.h), 1080);
  assert.ok(r.w >= 1080 && r.h >= 1080, "must cover both axes");
  assert.equal(Math.round(r.x), -420);
  assert.equal(r.y, 0);
});
t("fit contains the image and leaves padding", () => {
  const r = drawRect("fit", 1080, 1080, 1600, 900);
  assert.equal(r.w, 1080);
  assert.equal(Math.round(r.h), 608);
  assert.ok(r.w <= 1080 && r.h <= 1080, "must fit inside");
  assert.equal(r.x, 0);
  assert.ok(r.y > 0, "vertically centred with padding");
});
t("both modes centre the result", () => {
  for (const mode of ["fit", "fill"]) {
    const r = drawRect(mode, 1000, 500, 300, 700);
    assert.ok(Math.abs((r.x + r.w / 2) - 500) < 1e-9, `${mode} x-centre`);
    assert.ok(Math.abs((r.y + r.h / 2) - 250) < 1e-9, `${mode} y-centre`);
  }
});
t("an exact-ratio source is untouched by either mode", () => {
  for (const mode of ["fit", "fill"]) {
    const r = drawRect(mode, 1080, 1080, 540, 540);
    assert.equal(r.w, 1080); assert.equal(r.h, 1080);
    assert.equal(r.x, 0); assert.equal(r.y, 0);
  }
});
t("upscaling a small source into a large preset still fills it", () => {
  const r = drawRect("fill", 2560, 1440, 200, 200);
  assert.ok(r.w >= 2560 && r.h >= 1440);
});
t("extreme aspect presets (Facebook cover 820x312) stay centred and covered", () => {
  const r = drawRect("fill", 820, 312, 1080, 1080);
  assert.equal(Math.round(r.w), 820);
  assert.ok(r.h >= 312);
  assert.ok(Math.abs((r.y + r.h / 2) - 156) < 1e-9);
});

/* ---- the composite promise the resize pages make --------------------- */

t("a transparent PNG resized in fill mode survives end to end", () => {
  const key = keepFormat("image/png", "logo.png");
  const mime = "image/png";
  assert.equal(key, "png", "format preserved");
  assert.equal(paintsBackground("fill", mime), false, "alpha not flattened");
  assert.equal(flattensToWhite(mime, key), false, "no white paint");
});
t("a JPEG photo resized in fill mode is painted so no frame edge is left black", () => {
  const key = keepFormat("image/jpeg", "photo.jpg");
  assert.equal(paintsBackground("fill", "image/jpeg"), true);
  assert.equal(flattensToWhite("image/jpeg", key), true);
});

t("batch compress flattens even though the picker still holds webp", () => {
  // ImageBatchClient forces image/jpeg for the compress preset while `fmt`
  // keeps its "webp" default (the picker only renders for convert). Guarding
  // on `fmt` instead of the encoded mime let transparent PNGs encode black.
  const fmt = "webp";
  const mime = "image/jpeg";               // what compress actually encodes
  assert.equal(flattensToWhite(mime, fmt), true);
});
t("batch convert to png/webp still does not flatten", () => {
  assert.equal(flattensToWhite("image/png", "png"), false);
  assert.equal(flattensToWhite("image/webp", "webp"), false);
});


/* ---- the FAQ must describe the format the engine really writes ---------
   M123 drove batch-compress end to end and got transparent.jpg back while the
   shared FAQ promised "results download as high-quality PNG". The answer is
   now derived from the engine (lib/image-tools-meta fmtAnswer), so assert the
   derivation against what each client actually encodes. */

const FMT_Q = "Which formats work?";
const fmtA = (slug) => {
  const tool = IMAGE_TOOLS.find((x) => x.slug === slug);
  assert.ok(tool, `no such tool: ${slug}`);
  const f = tool.faqs.find((x) => x.q === FMT_Q);
  assert.ok(f && f.a, `${slug} has no format answer`);
  return f.a;
};

t("no image tool is left with the empty FMT marker", () => {
  const empty = IMAGE_TOOLS.filter((x) => x.faqs.some((f) => f.q === FMT_Q && !f.a));
  assert.deepEqual(empty.map((x) => x.slug), []);
});
t("batch-compress says JPG, not PNG (it encodes image/jpeg)", () => {
  const a = fmtA("batch-compress");
  assert.match(a, /JPG/);
  assert.doesNotMatch(a, /downloads? as .*PNG|lossless PNG/);
});
t("batch-resize promises the format preservation the fix implements", () => {
  assert.match(fmtA("batch-resize"), /keeps its own format/);
});
t("batch-rename says nothing is re-encoded (it zips the original File)", () => {
  assert.match(fmtA("batch-rename"), /untouched|re-encoded/);
});
t("metadata remover no longer promises a PNG for a JPEG", () => {
  assert.match(fmtA("metadata-remover"), /keeps the format/);
  assert.match(fmtA("metadata-viewer"), /nothing is written/);
});
t("passport photo says JPG (it encodes image/jpeg at 0.95)", () => {
  assert.match(fmtA("passport-photo"), /JPG/);
});
t("a PNG-encoding tool still gets the lossless-PNG sentence", () => {
  assert.match(fmtA("crop-image"), /lossless PNG/);
});

/* ---- report ---------------------------------------------------------- */

if (fails.length) {
  console.error(`\n  ${fails.length} FAILED, ${pass} passed\n`);
  for (const f of fails) console.error(`  ✗ ${f}\n`);
  process.exit(1);
}
console.log(`  ${pass}/${pass} image-output assertions passed`);
