/* The browser half of the PDF compressor: the JpegReencoder that lib/pdf-compress.ts
 * calls for each embedded image. Split out so the core stays free of DOM APIs and
 * can be asserted in plain Node against a sharp-backed encoder instead.
 */

import { scaledDims } from "@/lib/pdf-compress";
import type { JpegReencoder } from "@/lib/pdf-compress";

/** OffscreenCanvas keeps the decode off the layout path; Safari < 17 needs the
 *  DOM fallback, and this tool's whole point is chewing through big files
 *  without a server, so it is worth supporting both. */
function makeCanvas(w: number, h: number): OffscreenCanvas | HTMLCanvasElement {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function toBlob(
  canvas: OffscreenCanvas | HTMLCanvasElement,
  quality: number,
): Promise<Blob | null> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: "image/jpeg", quality });
  }
  return new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/jpeg", quality),
  );
}

export const canvasJpegReencoder: JpegReencoder = async (jpeg, maxDim, quality) => {
  // createImageBitmap throws on JPEGs the browser can't decode — Adobe CMYK
  // scans are the common case. compressPdf treats a throw as "keep the
  // original", so those images pass through untouched rather than corrupting.
  const bmp = await createImageBitmap(
    new Blob([new Uint8Array(jpeg) as unknown as BlobPart], { type: "image/jpeg" }),
  );
  try {
    const { width, height } = scaledDims(bmp.width, bmp.height, maxDim);
    const canvas = makeCanvas(width, height);
    const ctx = canvas.getContext("2d") as
      | OffscreenCanvasRenderingContext2D
      | CanvasRenderingContext2D
      | null;
    if (!ctx) return null;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, width, height);
    const blob = await toBlob(canvas, quality);
    if (!blob) return null;
    return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height };
  } finally {
    bmp.close();
  }
};
