/* Viral QR export — composites a downloaded QR canvas onto a slightly taller
   canvas with a subtle "qrixtools.com" footer. Every printed/shared QR becomes
   a quiet ad; the branding is deliberately small and tasteful (design rules),
   and Pro will later pass `brand:false` to drop it (monetization hook). */

export type QrExportOpts = {
  brand?: boolean;   // add the footer (default true)
  scale?: number;    // upscale for crisp print (default 2)
  label?: string;    // footer text (default the domain)
};

/** Returns a PNG data URL of the QR with an optional branded footer. */
export function exportQrPng(source: HTMLCanvasElement, opts: QrExportOpts = {}): string {
  const { brand = true, scale = 2, label = "qrixtools.com" } = opts;
  const s = Math.max(1, scale);
  const w = source.width * s;
  const qr = source.height * s;
  const footer = brand ? Math.round(source.width * 0.13 * s) : 0;

  const out = document.createElement("canvas");
  out.width = w;
  out.height = qr + footer;
  const ctx = out.getContext("2d");
  if (!ctx) return source.toDataURL("image/png");

  // sample the QR's background colour so the footer band blends in
  const probe = source.getContext("2d");
  let bg = "#ffffff";
  try {
    const px = probe?.getImageData(1, 1, 1, 1).data;
    if (px) bg = `rgb(${px[0]},${px[1]},${px[2]})`;
  } catch { /* tainted canvas — keep white */ }

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, out.width, out.height);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(source, 0, 0, w, qr);

  if (brand && footer) {
    // pick readable text colour against the sampled background
    const m = bg.match(/\d+/g);
    const lum = m ? (0.299 * +m[0] + 0.587 * +m[1] + 0.114 * +m[2]) : 255;
    ctx.fillStyle = lum > 140 ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.7)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `600 ${Math.round(footer * 0.42)}px system-ui, -apple-system, Segoe UI, sans-serif`;
    ctx.fillText(label, out.width / 2, qr + footer / 2);
  }
  return out.toDataURL("image/png");
}

/** Trigger a browser download of a data URL. */
export function saveDataUrl(dataUrl: string, filename: string): void {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
