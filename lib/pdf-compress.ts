/* Client-side PDF compression.
 *
 * The funnel page for this tool targets "my PDF is too big to email" — files
 * well over 25 MB. The server route it used to call can never serve that: the
 * platform rejects request bodies over ~4.5 MB at the edge, so the one file
 * shape the page is built to sell was the one shape guaranteed to fail.
 *
 * So the work moves into the browser, where there is no upload limit and the
 * "never leaves your device" claim the page used to make falsely becomes true.
 *
 * How it works: nearly all of a large PDF's bytes are its embedded photos, and
 * in a scan or an export those are DCTDecode (JPEG) image XObjects. We walk the
 * indirect objects, re-encode each one smaller through an injected encoder, and
 * write it back as a properly formed stream — /Length, /Width, /Height,
 * /ColorSpace and /Filter all updated to describe the new bytes. Text, vectors,
 * links and form fields are never touched.
 *
 * The encoder is injected rather than imported so this module stays free of
 * both DOM and Node APIs: the browser passes a canvas encoder, the test suite
 * passes a sharp one, and both exercise this identical object surgery.
 *
 * What the old server route did instead, for the record: it scanned the raw
 * file for FF D8 FF byte pairs and spliced re-encoded JPEGs of a different
 * length straight into the byte stream, leaving every /Length and every xref
 * offset after the first image pointing at the wrong place. Readers that
 * rebuild a broken xref opened the result anyway, which is why it looked like
 * it worked.
 */

import {
  PDFDocument,
  PDFRawStream,
  PDFName,
  PDFNumber,
  PDFArray,
  PDFBool,
  PDFDict,
} from "pdf-lib";
import type { PDFRef, PDFContext } from "pdf-lib";

export type ReencodedImage = { bytes: Uint8Array; width: number; height: number };

/** Re-encode one JPEG smaller. Returns null when the image can't be decoded —
 *  a CMYK or otherwise exotic JPEG — in which case the original is kept. */
export type JpegReencoder = (
  jpeg: Uint8Array,
  maxDim: number,
  quality: number,
) => Promise<ReencodedImage | null>;

export type CompressLevel = "low" | "medium" | "high";

/** quality is 0-1 (canvas convention); maxDim is the longest edge in pixels. */
export const COMPRESS_LEVELS: Record<CompressLevel, { quality: number; maxDim: number }> = {
  low: { quality: 0.82, maxDim: 1600 },
  medium: { quality: 0.65, maxDim: 1200 },
  high: { quality: 0.45, maxDim: 900 },
};

/** Below this an image is structure, not payload — a logo or an icon. Re-encoding
 *  it costs more in JPEG headers than it saves. */
export const MIN_IMAGE_BYTES = 3072;

const N = (s: string) => PDFName.of(s);

const nameOf = (v: unknown): string | null => (v instanceof PDFName ? String(v) : null);

/** /Filter is either one name or an array of them applied in order. */
export function filterChain(dict: PDFDict): string[] {
  const f = dict.lookup(N("Filter"));
  if (f instanceof PDFName) return [String(f)];
  if (f instanceof PDFArray) {
    const out: string[] = [];
    for (let i = 0; i < f.size(); i++) {
      const n = nameOf(f.lookup(i));
      if (n) out.push(n);
    }
    return out;
  }
  return [];
}

/** True for image XObjects whose bytes are a plain JPEG we can hand to a decoder.
 *
 *  Deliberately excluded:
 *  - /ImageMask stencils: 1-bit shape masks. JPEG has no 1-bit mode, so
 *    re-encoding one both inflates it and destroys the mask.
 *  - anything but a lone /DCTDecode: a Flate-wrapped JPEG has to be inflated
 *    first, and CCITT/JBIG2 scans are bilevel and already far denser than JPEG.
 */
export function isRecompressableJpeg(dict: PDFDict): boolean {
  if (nameOf(dict.lookup(N("Subtype"))) !== "/Image") return false;
  const mask = dict.lookup(N("ImageMask"));
  if (mask instanceof PDFBool && mask.asBoolean()) return false;
  const chain = filterChain(dict);
  return chain.length === 1 && chain[0] === "/DCTDecode";
}

/** Refs used as an alpha channel by some other image.
 *
 *  These are grayscale by spec, and this compressor's encoder emits RGB. Writing
 *  an RGB JPEG into an /SMask slot with /DeviceGray still on the dict makes the
 *  reader misread the alpha and paint the image as noise, so they are left alone.
 */
export function collectMaskRefs(ctx: PDFContext): Set<string> {
  const masks = new Set<string>();
  for (const [, obj] of ctx.enumerateIndirectObjects()) {
    const dict = obj instanceof PDFRawStream ? obj.dict : obj instanceof PDFDict ? obj : null;
    if (!dict) continue;
    for (const key of ["SMask", "Mask"]) {
      const raw = dict.get(N(key));
      if (raw && "tag" in (raw as object)) masks.add(String(raw));
    }
  }
  return masks;
}

/** Colour components declared in a JPEG's SOF header: 1 grey, 3 YCbCr, 4 CMYK.
 *
 *  The /ColorSpace we write has to match what the encoder actually produced,
 *  and it is not safe to assume. A browser canvas always emits 3-channel JPEG,
 *  but this module takes its encoder as an argument and a library encoder will
 *  happily keep a greyscale scan greyscale — writing /DeviceRGB over 1-channel
 *  bytes tells the reader to consume three samples per pixel and the page comes
 *  out as diagonal colour hash. So the header is read rather than presumed.
 *
 *  Returns 0 when no frame header is found, which makes the caller keep the
 *  original image instead of guessing.
 */
export function jpegComponents(bytes: Uint8Array): number {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return 0;
  let i = 2;
  while (i + 9 < bytes.length) {
    if (bytes[i] !== 0xff) { i++; continue; }
    const marker = bytes[i + 1];
    // Standalone markers carry no length field.
    if (marker === 0xff || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2;
      continue;
    }
    const len = (bytes[i + 2] << 8) | bytes[i + 3];
    // SOF0-SOF15, excluding DHT (C4), JPG (C8) and DAC (CC).
    const isFrameHeader =
      marker >= 0xc0 && marker <= 0xcf &&
      marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrameHeader) return bytes[i + 9];
    if (marker === 0xda) return 0; // scan data reached without a frame header
    if (len < 2) return 0;
    i += 2 + len;
  }
  return 0;
}

const COLOR_SPACE_BY_COMPONENTS: Record<number, string> = {
  1: "DeviceGray",
  3: "DeviceRGB",
};

/** Longest-edge downscale, never an upscale — enlarging a small image would
 *  add bytes to a file the user asked to shrink. Lives here rather than in the
 *  canvas encoder so both encoders size identically and it can be asserted. */
export function scaledDims(
  w: number,
  h: number,
  maxDim: number,
): { width: number; height: number } {
  const scale = Math.min(1, maxDim / Math.max(w, h));
  return {
    width: Math.max(1, Math.round(w * scale)),
    height: Math.max(1, Math.round(h * scale)),
  };
}

export type CompressResult = {
  bytes: Uint8Array;
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
  imagesFound: number;
  imagesRecompressed: number;
};

export type CompressOptions = {
  level?: CompressLevel;
  reencodeJpeg: JpegReencoder;
  /** 0-1, reported while the images are re-encoded. */
  onProgress?: (fraction: number) => void;
};

export async function compressPdf(
  input: Uint8Array,
  opts: CompressOptions,
): Promise<CompressResult> {
  const cfg = COMPRESS_LEVELS[opts.level ?? "medium"] ?? COMPRESS_LEVELS.medium;
  const originalSize = input.length;

  const doc = await PDFDocument.load(input, {
    ignoreEncryption: true,
    updateMetadata: false,
  });
  const ctx = doc.context;
  const maskRefs = collectMaskRefs(ctx);

  const targets: Array<[PDFRef, PDFRawStream]> = [];
  for (const [ref, obj] of ctx.enumerateIndirectObjects()) {
    if (!(obj instanceof PDFRawStream)) continue;
    if (maskRefs.has(String(ref))) continue;
    if (!isRecompressableJpeg(obj.dict)) continue;
    if (obj.contents.length < MIN_IMAGE_BYTES) continue;
    targets.push([ref, obj]);
  }

  let imagesRecompressed = 0;
  for (let i = 0; i < targets.length; i++) {
    const [ref, stream] = targets[i];
    opts.onProgress?.(i / Math.max(1, targets.length));
    let out: ReencodedImage | null = null;
    try {
      out = await opts.reencodeJpeg(stream.contents, cfg.maxDim, cfg.quality);
    } catch {
      out = null; // undecodable image — keep the original bytes
    }
    // Only swap when it is genuinely smaller: re-encoding an already-optimised
    // photo routinely comes back larger, and shipping that would make the tool
    // grow the file it promised to shrink.
    if (!out || out.bytes.length >= stream.contents.length) continue;

    // A CMYK result would also need a /Decode array to say whether the samples
    // are Adobe-inverted, so rather than guess that, keep the original.
    const colorSpace = COLOR_SPACE_BY_COMPONENTS[jpegComponents(out.bytes)];
    if (!colorSpace) continue;

    const dict = stream.dict;
    dict.set(N("Width"), PDFNumber.of(out.width));
    dict.set(N("Height"), PDFNumber.of(out.height));
    dict.set(N("BitsPerComponent"), PDFNumber.of(8));
    dict.set(N("ColorSpace"), N(colorSpace));
    dict.set(N("Filter"), N("DCTDecode"));
    // Both describe the bytes we just replaced. A /Decode array inverting a
    // CMYK scan, or /DecodeParms from the previous filter, would be applied to
    // the new RGB samples and wreck the colours.
    dict.delete(N("DecodeParms"));
    dict.delete(N("Decode"));
    ctx.assign(ref, PDFRawStream.of(dict, out.bytes));
    imagesRecompressed++;
  }
  opts.onProgress?.(1);

  doc.setTitle("");
  doc.setAuthor("");
  doc.setSubject("");
  doc.setKeywords([]);
  doc.setProducer("QRix");
  doc.setCreator("QRix");

  const saved = await doc.save({ useObjectStreams: true });

  // A re-save can legitimately come out bigger — a linearised or already
  // object-streamed PDF is close to optimal. Hand back the original then, so
  // the tool never returns a file worse than the one it was given.
  if (saved.length >= originalSize) {
    return {
      bytes: input,
      originalSize,
      compressedSize: originalSize,
      savedPercent: 0,
      imagesFound: targets.length,
      imagesRecompressed,
    };
  }

  return {
    bytes: saved,
    originalSize,
    compressedSize: saved.length,
    savedPercent: Math.max(0, Math.round(((originalSize - saved.length) / originalSize) * 100)),
    imagesFound: targets.length,
    imagesRecompressed,
  };
}
