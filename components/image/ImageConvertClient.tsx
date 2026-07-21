"use client";

/* Convert (format) + Social/fixed-size resize engine.
   engine "convert:<mime>" | "social:<presetId>" | "social:_picker" | "resize:<w>x<h>" */

import { useEffect, useRef, useState } from "react";
import { AiDropzone, AiResultBar, CloudNotice } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";
import { isTiff, tiffPageToImage, TiffUnsupportedError, TIFF_ACCEPT } from "@/lib/tiff-decode";

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

/* canvas.toBlob() only speaks png/jpeg/webp(/avif). Asking it for image/bmp,
   image/tiff or image/x-icon silently returns PNG bytes, so those downloads were
   PNGs with a lying extension. These encoders emit the real formats. */

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

/** Baseline uncompressed TIFF (little-endian, single strip, 8 bits/sample).
    RGB when the image is fully opaque, RGBA + ExtraSamples=2 when it isn't. */
function encodeTiff(c: HTMLCanvasElement): Blob {
  const w = c.width, h = c.height;
  const px = c.getContext("2d")!.getImageData(0, 0, w, h).data;
  let hasAlpha = false;
  for (let i = 3; i < px.length; i += 4) if (px[i] !== 255) { hasAlpha = true; break; }
  const spp = hasAlpha ? 4 : 3;                     // samples per pixel

  const TAGS = 12 + (hasAlpha ? 1 : 0);
  const ifdOff = 8;                                 // IFD sits right after the header
  const ifdSize = 2 + TAGS * 12 + 4;                // count + entries + next-IFD pointer
  const bpsOff = ifdOff + ifdSize;                  // BitsPerSample array (spp shorts)
  const xresOff = bpsOff + spp * 2;                 // XResolution rational
  const yresOff = xresOff + 8;
  const pixOff = yresOff + 8;
  const pixSize = w * h * spp;

  const buf = new ArrayBuffer(pixOff + pixSize);
  const v = new DataView(buf), u8 = new Uint8Array(buf);

  v.setUint16(0, 0x4949, true);                     // "II" — little-endian
  v.setUint16(2, 42, true);                         // TIFF magic
  v.setUint32(4, ifdOff, true);
  v.setUint16(ifdOff, TAGS, true);

  let e = ifdOff + 2;
  /* SHORT(3) and LONG(4) values with count 1 live inline in the value field. */
  const tag = (id: number, type: number, count: number, value: number) => {
    v.setUint16(e, id, true); v.setUint16(e + 2, type, true); v.setUint32(e + 4, count, true);
    if (type === 3 && count === 1) { v.setUint16(e + 8, value, true); v.setUint16(e + 10, 0, true); }
    else v.setUint32(e + 8, value, true);
    e += 12;
  };
  tag(256, 4, 1, w);            // ImageWidth
  tag(257, 4, 1, h);            // ImageLength
  tag(258, 3, spp, bpsOff);     // BitsPerSample -> array, too wide to inline
  tag(259, 3, 1, 1);            // Compression: none
  tag(262, 3, 1, 2);            // PhotometricInterpretation: RGB
  tag(273, 4, 1, pixOff);       // StripOffsets
  tag(277, 3, 1, spp);          // SamplesPerPixel
  tag(278, 4, 1, h);            // RowsPerStrip — one strip for the whole image
  tag(279, 4, 1, pixSize);      // StripByteCounts
  tag(282, 5, 1, xresOff);      // XResolution
  tag(283, 5, 1, yresOff);      // YResolution
  tag(296, 3, 1, 2);            // ResolutionUnit: inch
  if (hasAlpha) tag(338, 3, 1, 2);  // ExtraSamples: unassociated alpha
  v.setUint32(e, 0, true);          // no further IFDs

  for (let i = 0; i < spp; i++) v.setUint16(bpsOff + i * 2, 8, true);
  v.setUint32(xresOff, 72, true); v.setUint32(xresOff + 4, 1, true);   // 72/1 dpi
  v.setUint32(yresOff, 72, true); v.setUint32(yresOff + 4, 1, true);

  if (hasAlpha) u8.set(px, pixOff);                 // canvas is already RGBA
  else for (let p = 0, o = pixOff; p < px.length; p += 4) {
    u8[o++] = px[p]; u8[o++] = px[p + 1]; u8[o++] = px[p + 2];
  }
  return new Blob([buf], { type: "image/tiff" });
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

/** "resize:1920x1080" -> a one-off preset, so the /resize/<preset> pages reuse
    the social sizing UI (fit/fill + background) without a duplicate size table. */
function parseResize(engine: string): { label: string; w: number; h: number } | null {
  const m = /^resize:(\d{1,5})x(\d{1,5})$/.exec(engine);
  if (!m) return null;
  const w = Number(m[1]), h = Number(m[2]);
  if (!w || !h) return null;
  return { label: `${w}×${h}`, w, h };
}

export default function ImageConvertClient({ engine }: { engine: string }) {
  const resize = parseResize(engine);
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
  /* TIFF needs its own decode path, and the source buffer is kept so a
     multi-page scan can be re-decoded when the user picks another page. */
  const [tiff, setTiff] = useState<{ buf: ArrayBuffer; pages: number; page: number } | null>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);

  const preset = resize || (isSocial ? (socialId === "_picker" ? SOCIAL[pickPreset] : SOCIAL[socialId]) : null);

  async function onFile(f: File) {
    trackTool(`img-${engine}`, { size: f.size });
    setBlob(null); setUrl(null); setUnsupported(""); setTiff(null);
    if (isTiff(f)) {
      try {
        const buf = await f.arrayBuffer();
        const { img: decoded, pages } = await tiffPageToImage(buf, 0);
        setTiff({ buf, pages, page: 0 }); setImg(decoded);
      } catch (e) {
        setImg(null);
        setUnsupported(e instanceof TiffUnsupportedError ? e.message : "This TIFF couldn't be decoded in your browser.");
      }
      return;
    }
    try { setImg(await loadImg(f)); }
    catch { setImg(null); setUnsupported("That file couldn't be opened as an image — it may be corrupted or in a format your browser doesn't support."); }
  }

  /** Re-decode another page of a multi-page TIFF (scanned documents). */
  async function pickPage(p: number) {
    if (!tiff) return;
    try {
      const { img: decoded } = await tiffPageToImage(tiff.buf, p);
      setTiff({ ...tiff, page: p }); setImg(decoded); setBlob(null); setUrl(null); setUnsupported("");
    } catch {
      setUnsupported(`Page ${p + 1} of this TIFF couldn't be decoded.`);
    }
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
    if (fmtKey === "tiff") {
      const b = encodeTiff(c); setBlob(b); setUrl(URL.createObjectURL(b)); return;
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
      {!img && <AiDropzone onFile={onFile} accept={TIFF_ACCEPT} hint="JPG, PNG, WebP, TIFF · processed on your device" />}
      {img && (
        <>
          <div className="flex flex-wrap items-center gap-4">
            {socialId === "_picker" && (
              <select value={pickPreset} onChange={(e) => setPickPreset(e.target.value)} className="qx-auth-input !py-2 w-56" aria-label="Platform">
                {Object.entries(SOCIAL).map(([id, p]) => <option key={id} value={id}>{p.label} — {p.w}×{p.h}</option>)}
              </select>
            )}
            {tiff && tiff.pages > 1 && (
              <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>
                Page
                <select value={tiff.page} onChange={(e) => pickPage(Number(e.target.value))} className="qx-auth-input !py-2 w-28" aria-label="TIFF page">
                  {Array.from({ length: tiff.pages }, (_, i) => <option key={i} value={i}>{i + 1} of {tiff.pages}</option>)}
                </select>
              </label>
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
          {blob && <><p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Output: <b style={{ color: "var(--text)" }}>{(blob.size / 1024).toFixed(0)} KB · {fmt.label}</b></p><AiResultBar blob={blob} filename={`qrix-${(preset?.label || fmt.label).toLowerCase().replace(/[^\w]+/g, "-")}.${fmt.ext}`} onReset={() => { setImg(null); setBlob(null); setTiff(null); setUnsupported(""); }} /></>}
          {(fmtKey === "heic" || fmtKey === "svg") && <CloudNotice>{fmtKey === "heic" ? "HEIC decoding depends on your browser; where unavailable, the connector-backed path handles conversion." : "This embeds the raster as SVG. True vector tracing is wired through the QRix connector."}</CloudNotice>}
        </>
      )}
    </div>
  );
}
