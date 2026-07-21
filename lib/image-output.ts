/* Output decisions for the canvas image tools.
 *
 * These rules used to live inside ImageConvertClient, which meant the only way
 * to check them was to open a browser and look at the downloaded file — and the
 * in-app preview pane never hydrates the client engine, so in practice they
 * shipped on `tsc --noEmit` alone. That is exactly how M120 went out: every
 * resize returned a JPG because the sizing pages fell through to "jpeg", and a
 * transparent PNG came back flattened onto white.
 *
 * Nothing here touches a canvas or a File, so scripts/test-image-output.mjs can
 * assert the real shipped functions in plain Node. Keep it that way: anything
 * that needs a CanvasRenderingContext2D belongs in the component, anything that
 * *decides* belongs here.
 */

/** Format keys that canvas.toBlob() can actually encode with alpha intact. */
const ALPHA_MIMES = new Set(["image/png", "image/webp"]);

/** Resizing must not silently change the file's format: a transparent PNG logo
    sized to 1080×1080 has to come back as a PNG, not a JPG on white. Only the
    alpha-safe web formats round-trip; anything else (HEIC, TIFF, BMP, AVIF…)
    still lands as JPG, and the hub copy says so.

    Takes the type and name as plain strings rather than a File so it is
    testable outside a browser. Both are consulted because a file dragged from
    some file managers arrives with an empty `type`. */
export function keepFormat(type: string, name: string): "jpeg" | "png" | "webp" {
  const t = `${type} ${name}`.toLowerCase();
  if (/png/.test(t)) return "png";
  if (/webp/.test(t)) return "webp";
  return "jpeg";
}

/** Whether the chosen output format can carry transparency at all. */
export function keepsAlpha(mime: string): boolean {
  return ALPHA_MIMES.has(mime);
}

/** Preset (resize/social) path: should the frame be painted before drawing?
    In fit mode the colour is the padding the user picked, so it must be. In
    fill mode the frame is covered anyway, so painting it would only flatten
    the alpha of a transparent PNG — skip it whenever the output keeps alpha. */
export function paintsBackground(mode: "fit" | "fill", mime: string): boolean {
  return mode === "fit" || !keepsAlpha(mime);
}

/** Natural-size path: jpeg and 24-bit bmp have no alpha channel, so anything
    transparent has to be flattened onto white or it encodes as black. */
export function flattensToWhite(mime: string, fmtKey: string): boolean {
  return mime === "image/jpeg" || fmtKey === "bmp";
}

/** Centred fit/fill rect for drawing a source image into a preset frame.
    fill covers the frame (crops the overflow), fit contains it (leaves
    padding). Returns the exact args the component hands to drawImage. */
export function drawRect(
  mode: "fit" | "fill",
  frameW: number,
  frameH: number,
  srcW: number,
  srcH: number,
): { x: number; y: number; w: number; h: number } {
  const s =
    mode === "fill"
      ? Math.max(frameW / srcW, frameH / srcH)
      : Math.min(frameW / srcW, frameH / srcH);
  const w = srcW * s;
  const h = srcH * s;
  return { x: (frameW - w) / 2, y: (frameH - h) / 2, w, h };
}
