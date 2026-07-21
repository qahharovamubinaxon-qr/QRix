/* Client-side TIFF decoding.

   No browser can point an <img> at a .tiff, so every "TIFF to X" converter on
   the web either uploads your file to a server or quietly fails. This decodes
   it locally instead, keeping the no-upload promise the /convert pages make.

   A hand-rolled baseline decoder was considered and rejected: real-world TIFFs
   (scanners, Photoshop, GIS exports) are overwhelmingly LZW- or Deflate-
   compressed, so baseline-only support would reject most files users actually
   have. UTIF (MIT, ~58 KB) covers those plus PackBits, CCITT fax, bit depths
   other than 8 and the non-RGB photometric interpretations. It is imported
   dynamically, so nothing ships to users who never drop a TIFF.

   TIFF is a container, not a codec, and UTIF does not cover all of it — it
   returns *plausible but wrong* pixels for JPEG-, WebP- and ZSTD-compressed
   payloads, and for tile-based layouts. Those are detected from the tags up
   front and refused with an explanation. Handing someone a silently corrupted
   image is worse than telling them the file needs re-saving. */

import type { UtifApi } from "utif";

export const TIFF_ACCEPT = "image/*,.tif,.tiff";

/** Extension-first: Windows often reports an empty or wrong MIME for .tif. */
export function isTiff(f: File): boolean {
  return /\.tiff?$/i.test(f.name) || f.type === "image/tiff" || f.type === "image/tif";
}

/** Compression tag (259) values whose pixels UTIF reproduces exactly.
    Verified by round-tripping libtiff-written files against the source pixels. */
const SUPPORTED_COMPRESSION = new Set([
  1,      // uncompressed
  3, 4,   // CCITT Group 3 / Group 4 fax — scanned black-and-white documents
  5,      // LZW — Photoshop's default
  8,      // Deflate / ZIP
  32773,  // PackBits
]);

/** Everything else, named so the error can tell the user what to re-save from.
    Note 2 and 32946 look supported but are not: UTIF's decompressor has no
    branch for either, so it returns a zero-filled (black) image rather than
    failing. Anything not in the allowlist above must be refused. */
const CODEC_NAME: Record<number, string> = {
  2: "CCITT Huffman", 6: "old-style JPEG", 7: "JPEG", 9: "JBIG", 10: "JBIG",
  32946: "Adobe Deflate", 34712: "JPEG 2000", 34925: "LZMA",
  50000: "ZSTD", 50001: "WebP", 50002: "JPEG XL",
};

export class TiffUnsupportedError extends Error {
  constructor(message: string) { super(message); this.name = "TiffUnsupportedError"; }
}

const RESAVE = "Re-save it with LZW compression (in Photoshop: Save As → TIFF → LZW) and try again.";

/** UTIF returns tags as arrays; a few come through as bare numbers. */
function tagNum(ifd: Record<string, unknown>, tag: number): number | undefined {
  const v = ifd[`t${tag}`];
  const n = Array.isArray(v) ? v[0] : v;
  return typeof n === "number" ? n : undefined;
}

function assertDecodable(ifd: Record<string, unknown>) {
  // Tiled layouts (tag 322 TileWidth) come from GIS and very large Photoshop
  // exports. UTIF reads the strip tags instead and produces scrambled output.
  if (tagNum(ifd, 322) !== undefined) {
    throw new TiffUnsupportedError(
      `This TIFF stores its image in tiles rather than strips, which can't be decoded in the browser. ${RESAVE}`
    );
  }
  const comp = tagNum(ifd, 259) ?? 1;
  if (!SUPPORTED_COMPRESSION.has(comp)) {
    const what = CODEC_NAME[comp]
      ? `${CODEC_NAME[comp]}-compressed`
      : `compressed with an unsupported codec (type ${comp})`;
    throw new TiffUnsupportedError(
      `This TIFF is ${what} inside the TIFF container, which can't be decoded in the browser. ${RESAVE}`
    );
  }
}

/* utif is CommonJS. Depending on the bundler the dynamic import lands either as
   the API itself or wrapped in `.default`, so unwrap rather than trusting one
   shape — guessing wrong makes every TIFF look "corrupted". */
async function loadUtif(): Promise<UtifApi> {
  const mod = await import("utif");
  const api = (typeof mod.decode === "function" ? mod : mod.default) as UtifApi | undefined;
  if (!api || typeof api.decode !== "function") throw new Error("utif failed to load");
  return api;
}

export type TiffPage = { rgba: Uint8Array; width: number; height: number; pages: number };

/** Decode one page (0-based) to raw RGBA, and report how many pages exist. */
export async function decodeTiffPage(buf: ArrayBuffer, page = 0): Promise<TiffPage> {
  const UTIF = await loadUtif();
  let ifds;
  try { ifds = UTIF.decode(buf); } catch { throw new TiffUnsupportedError("This file isn't a readable TIFF — it may be truncated or corrupted."); }
  if (!ifds.length) throw new TiffUnsupportedError("This TIFF contains no pages.");

  const ifd = ifds[Math.min(Math.max(page, 0), ifds.length - 1)];
  assertDecodable(ifd as unknown as Record<string, unknown>);

  UTIF.decodeImage(buf, ifd, ifds);
  const rgba = UTIF.toRGBA8(ifd);
  if (!ifd.width || !ifd.height || rgba.length < ifd.width * ifd.height * 4) {
    throw new TiffUnsupportedError("This TIFF uses a layout the browser decoder can't read. " + RESAVE);
  }
  return { rgba, width: ifd.width, height: ifd.height, pages: ifds.length };
}

/** Decode a page straight into an <img> the rest of the pipeline can draw. */
export async function tiffPageToImage(buf: ArrayBuffer, page = 0): Promise<{ img: HTMLImageElement; pages: number }> {
  const { rgba, width, height, pages } = await decodeTiffPage(buf, page);
  const c = document.createElement("canvas");
  c.width = width; c.height = height;
  // copy rather than view: UTIF's buffer type is ArrayBufferLike, and ImageData
  // needs a plain ArrayBuffer
  const data = new Uint8ClampedArray(width * height * 4);
  data.set(rgba.subarray(0, data.length));
  c.getContext("2d")!.putImageData(new ImageData(data, width, height), 0, 0);
  const blob = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
  if (!blob) throw new TiffUnsupportedError("The decoded TIFF was too large for this device to hold in memory.");
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i); i.onerror = rej;
    i.src = URL.createObjectURL(blob);
  });
  return { img, pages };
}
