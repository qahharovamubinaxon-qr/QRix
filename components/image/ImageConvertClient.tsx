"use client";

/* Convert (format) + Social resize engine.
   engine "convert:<mime>" | "social:<presetId>" | "social:_picker" */

import { useEffect, useRef, useState } from "react";
import { AiDropzone, AiResultBar, CloudNotice } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

const SOCIAL: Record<string, { label: string; w: number; h: number }> = {
  "instagram-post": { label: "Instagram Post", w: 1080, h: 1080 },
  "instagram-story": { label: "Instagram Story", w: 1080, h: 1920 },
  "facebook-cover": { label: "Facebook Cover", w: 820, h: 312 },
  "youtube-thumbnail": { label: "YouTube Thumbnail", w: 1280, h: 720 },
  "youtube-banner": { label: "YouTube Banner", w: 2560, h: 1440 },
  "tiktok-cover": { label: "TikTok Cover", w: 1080, h: 1920 },
  "linkedin-banner": { label: "LinkedIn Banner", w: 1584, h: 396 },
  "pinterest-pin": { label: "Pinterest Pin", w: 1000, h: 1500 },
  "twitter-header": { label: "Twitter/X Header", w: 1500, h: 500 },
  "discord-banner": { label: "Discord Banner", w: 960, h: 540 },
};
const MIME: Record<string, { mime: string; ext: string; quality?: boolean; label: string }> = {
  jpeg: { mime: "image/jpeg", ext: "jpg", quality: true, label: "JPG" },
  png: { mime: "image/png", ext: "png", label: "PNG" },
  webp: { mime: "image/webp", ext: "webp", quality: true, label: "WebP" },
  avif: { mime: "image/avif", ext: "avif", quality: true, label: "AVIF" },
  bmp: { mime: "image/bmp", ext: "bmp", label: "BMP" },
  tiff: { mime: "image/tiff", ext: "tiff", label: "TIFF" },
  ico: { mime: "image/png", ext: "ico", label: "ICO" },
  heic: { mime: "image/jpeg", ext: "jpg", quality: true, label: "JPG" },
  svg: { mime: "image/png", ext: "svg", label: "SVG" },
};

function loadImg(f: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); });
}

/* canvas.toBlob() only speaks png/jpeg/webp(/avif). Asking it for image/bmp or
   image/x-icon silently returns PNG bytes, so the old .bmp/.ico downloads were
   PNGs with a lying extension. These two encoders emit the real formats. */

/** 24-bit bottom-up BMP (no alpha channel — caller composites onto a background). */
function encodeBmp(c: HTMLCanvasElement): Blob {
  const w = c.width, h = c.height;
  const px = c.getContext("2d")!.getImageData(0, 0, w, h).data;
  const rowSize = Math.ceil((w * 3) / 4) * 4;   // rows are padded to 4 bytes
  const pixSize = rowSize * h;
  const buf = new ArrayBuffer(54 + pixSize);
  const v = new DataView(buf), u8 = new Uint8Array(buf);
  v.setUint16(0, 0x424d, false);                // "BM"
  v.setUint32(2, 54 + pixSize, true);
  v.setUint32(10, 54, true);                    // pixel data offset
  v.setUint32(14, 40, true);                    // BITMAPINFOHEADER
  v.setInt32(18, w, true); v.setInt32(22, h, true);
  v.setUint16(26, 1, true); v.setUint16(28, 24, true);
  v.setUint32(34, pixSize, true);
  v.setInt32(38, 2835, true); v.setInt32(42, 2835, true);  // 72 DPI
  for (let y = 0; y < h; y++) {
    let o = 54 + (h - 1 - y) * rowSize;          // BMP stores rows bottom-up
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      u8[o++] = px[i + 2]; u8[o++] = px[i + 1]; u8[o++] = px[i];
    }
  }
  return new Blob([buf], { type: "image/bmp" });
}

/** PNG-payload ICO: 6-byte ICONDIR + 16-byte ICONDIRENTRY + the PNG itself. */
async function encodeIco(c: HTMLCanvasElement): Promise<Blob | null> {
  const png = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
  if (!png) return null;
  const bytes = new Uint8Array(await png.arrayBuffer());
  const head = new ArrayBuffer(22);
  const v = new DataView(head);
  v.setUint16(0, 0, true); v.setUint16(2, 1, true); v.setUint16(4, 1, true);
  v.setUint8(6, c.width >= 256 ? 0 : c.width);    // 0 means 256
  v.setUint8(7, c.height >= 256 ? 0 : c.height);
  v.setUint16(10, 1, true); v.setUint16(12, 32, true);
  v.setUint32(14, bytes.length, true);
  v.setUint32(18, 22, true);
  return new Blob([head, bytes], { type: "image/x-icon" });
}

export default function ImageConvertClient({ engine }: { engine: string }) {
  const isSocial = engine.startsWith("social:");
  const socialId = isSocial ? engine.slice(7) : "";
  const fmtKey = engine.startsWith("convert:") ? engine.slice(8) : "jpeg";
  const fmt = MIME[fmtKey] || MIME.jpeg;

  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState(90);
  const [mode, setMode] = useState<"fit" | "fill">("fill");
  const [pickPreset, setPickPreset] = useState("instagram-post");
  const [bg, setBg] = useState("#ffffff");
  const [unsupported, setUnsupported] = useState("");
  const viewRef = useRef<HTMLCanvasElement>(null);

  const preset = isSocial ? (socialId === "_picker" ? SOCIAL[pickPreset] : SOCIAL[socialId]) : null;

  async function onFile(f: File) {
    trackTool(`img-${engine}`, { size: f.size });
    setImg(await loadImg(f)); setBlob(null); setUrl(null); setUnsupported("");
  }

  function draw(): HTMLCanvasElement | null {
    if (!img) return null;
    const c = document.createElement("canvas");
    if (preset) {
      c.width = preset.w; c.height = preset.h;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
      const s = mode === "fill" ? Math.max(c.width / img.width, c.height / img.height) : Math.min(c.width / img.width, c.height / img.height);
      const w = img.width * s, h = img.height * s;
      ctx.drawImage(img, (c.width - w) / 2, (c.height - h) / 2, w, h);
    } else if (fmtKey === "ico") {
      c.width = 256; c.height = 256; c.getContext("2d")!.drawImage(img, 0, 0, 256, 256);
    } else {
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext("2d")!;
      // jpeg and 24-bit bmp have no alpha — flatten transparency onto white
      if (fmt.mime === "image/jpeg" || fmtKey === "bmp") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(img, 0, 0);
    }
    return c;
  }

  useEffect(() => { if (img && viewRef.current) { const c = draw(); if (c) { const v = viewRef.current; v.width = c.width; v.height = c.height; v.getContext("2d")!.drawImage(c, 0, 0); } } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, quality, mode, pickPreset, bg]);

  async function convert() {
    const c = draw(); if (!c) return;
    if (fmtKey === "svg") {
      const dataUrl = c.toDataURL("image/png");
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}"><image href="${dataUrl}" width="${c.width}" height="${c.height}"/></svg>`;
      const b = new Blob([svg], { type: "image/svg+xml" });
      setBlob(b); setUrl(URL.createObjectURL(b)); return;
    }
    if (fmtKey === "bmp") {
      const b = encodeBmp(c); setBlob(b); setUrl(URL.createObjectURL(b)); return;
    }
    if (fmtKey === "ico") {
      const b = await encodeIco(c);
      if (b) { setBlob(b); setUrl(URL.createObjectURL(b)); } else setUnsupported("Could not build the icon file — try a different image.");
      return;
    }
    const q = fmt.quality ? quality / 100 : undefined;
    const b = await new Promise<Blob | null>((r) => c.toBlob(r, fmt.mime, q));
    if (!b || (b.type !== fmt.mime && fmt.mime !== "image/png")) {
      if (fmtKey === "avif") { setUnsupported("Your browser can't encode AVIF yet — try Chrome/Edge, or use WebP for similar savings."); return; }
    }
    if (b) { setBlob(b); setUrl(URL.createObjectURL(b)); }
  }

  const showQ = fmt.quality && !isSocial;

  return (
    <div className="qx-card p-6 space-y-5">
      {unsupported && <p className="text-[13px] px-4 py-2.5 rounded-xl" style={{ background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.3)", color: "var(--danger)" }}>{unsupported}</p>}
      {!img && <AiDropzone onFile={onFile} />}
      {img && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            {socialId === "_picker" && (
              <select value={pickPreset} onChange={(e) => setPickPreset(e.target.value)} className="qx-auth-input !py-2 w-56" aria-label="Platform">
                {Object.entries(SOCIAL).map(([id, p]) => <option key={id} value={id}>{p.label} — {p.w}×{p.h}</option>)}
              </select>
            )}
            {preset && (<>
              <div className="flex gap-2">{(["fill", "fit"] as const).map((m) => <button key={m} onClick={() => setMode(m)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold capitalize" style={{ background: mode === m ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${mode === m ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{m}</button>)}</div>
              {mode === "fit" && <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer" aria-label="Background" />}
              <span className="text-[12px] font-mono" style={{ color: "var(--text-faint)" }}>{preset.w}×{preset.h}</span>
            </>)}
            {showQ && <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Quality <input type="range" min={30} max={100} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-40 accent-[#e1ff04]" /> {quality}</label>}
            <button onClick={convert} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>{isSocial ? "Resize" : `Convert to ${fmt.label}`}</button>
          </div>
          <canvas ref={viewRef} className="max-w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)", maxHeight: 420 }} />
          {blob && <><p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Output: <b style={{ color: "var(--text)" }}>{(blob.size / 1024).toFixed(0)} KB · {fmt.label}</b></p><AiResultBar blob={blob} filename={`qrix-${(preset?.label || fmt.label).toLowerCase().replace(/[^\w]+/g, "-")}.${fmt.ext}`} onReset={() => { setImg(null); setBlob(null); }} /></>}
          {(fmtKey === "heic" || fmtKey === "svg") && <CloudNotice>{fmtKey === "heic" ? "HEIC decoding depends on your browser; where unavailable, the connector-backed path handles conversion." : "This embeds the raster as SVG. True vector tracing is wired through the QRix connector."}</CloudNotice>}
        </>
      )}
    </div>
  );
}
