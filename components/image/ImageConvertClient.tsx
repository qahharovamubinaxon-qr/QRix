"use client";

/* Convert (format) + Social/fixed-size resize engine.
   engine "convert:<mime>" | "social:<presetId>" | "social:_picker" | "resize:<w>x<h>" */

import { useEffect, useRef, useState } from "react";
import { AiDropzone, AiResultBar, CloudNotice } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";
import { isTiff, tiffPageToImage, TiffUnsupportedError, TIFF_ACCEPT } from "@/lib/tiff-decode";
import { keepFormat, paintsBackground, flattensToWhite, drawRect } from "@/lib/image-output";

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

/* keepFormat / paintsBackground / flattensToWhite / drawRect live in
   lib/image-output.ts so they can be asserted in Node — see that file. */

export default function ImageConvertClient({ engine }: { engine: string }) {
  const resize = parseResize(engine);
  const isSocial = engine.startsWith("social:");
  const socialId = isSocial ? engine.slice(7) : "";
  const isConvert = engine.startsWith("convert:");
  /* Sizing pages follow the source format; converter pages force their own. */
  const [srcFmt, setSrcFmt] = useState<"jpeg" | "png" | "webp">("jpeg");
  const fmtKey = isConvert ? engine.slice(8) : srcFmt;
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
  /* The whole dropped selection. queue[0] is what the preview shows; anything
     beyond it turns the page into a batch job sharing the same settings. */
  const [queue, setQueue] = useState<File[]>([]);
  const [batchBusy, setBatchBusy] = useState(false);
  const [batchDone, setBatchDone] = useState(0);
  const viewRef = useRef<HTMLCanvasElement>(null);

  const preset = resize || (isSocial ? (socialId === "_picker" ? SOCIAL[pickPreset] : SOCIAL[socialId]) : null);

  async function onFile(f: File) {
    trackTool(`img-${engine}`, { size: f.size });
    setBlob(null); setUrl(null); setUnsupported(""); setTiff(null);
    if (!isConvert) setSrcFmt(keepFormat(f.type, f.name));
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

  /** Whole selection: the first drives the preview, the rest ride along in the batch. */
  async function onFiles(list: File[]) {
    if (!list.length) return;
    setQueue(list);
    setBatchDone(0);
    await onFile(list[0]);
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

  /* `source` lets the batch path reuse the exact sizing/flattening rules the
     preview uses; it defaults to the previewed image for the single-file path. */
  function draw(source?: HTMLImageElement | null): HTMLCanvasElement | null {
    const src = source ?? img;
    if (!src) return null;
    const c = document.createElement("canvas");
    if (preset) {
      c.width = preset.w; c.height = preset.h;
      const ctx = c.getContext("2d")!;
      if (paintsBackground(mode, fmt.mime)) { ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); }
      const r = drawRect(mode, c.width, c.height, src.width, src.height);
      ctx.drawImage(src, r.x, r.y, r.w, r.h);
    } else if (fmtKey === "ico") {
      c.width = 256; c.height = 256; c.getContext("2d")!.drawImage(src, 0, 0, 256, 256);
    } else {
      c.width = src.naturalWidth || src.width; c.height = src.naturalHeight || src.height;
      const ctx = c.getContext("2d")!;
      if (flattensToWhite(fmt.mime, fmtKey)) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(src, 0, 0);
    }
    return c;
  }

  /** Canvas → Blob in this page's target format. Shared by the single and batch paths. */
  async function encode(c: HTMLCanvasElement): Promise<Blob | null> {
    if (fmtKey === "svg") {
      const dataUrl = c.toDataURL("image/png");
      return new Blob([`<svg xmlns="http://www.w3.org/2000/svg" width="${c.width}" height="${c.height}"><image href="${dataUrl}" width="${c.width}" height="${c.height}"/></svg>`], { type: "image/svg+xml" });
    }
    if (fmtKey === "bmp") return encodeBmp(c);
    if (fmtKey === "tiff") return encodeTiff(c);
    if (fmtKey === "ico") return encodeIco(c);
    const q = fmt.quality ? quality / 100 : undefined;
    return new Promise<Blob | null>((r) => c.toBlob(r, fmt.mime, q));
  }

  /** File → decoded image, taking the TIFF path when the source is a TIFF. */
  async function fileToImage(f: File): Promise<HTMLImageElement> {
    if (isTiff(f)) return (await tiffPageToImage(await f.arrayBuffer(), 0)).img;
    return loadImg(f);
  }

  useEffect(() => { if (img && viewRef.current) { const c = draw(); if (c) { const v = viewRef.current; v.width = c.width; v.height = c.height; v.getContext("2d")!.drawImage(c, 0, 0); } } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, quality, mode, pickPreset, bg]);

  async function convert() {
    const c = draw(); if (!c) return;
    const b = await encode(c);
    if (fmtKey === "ico" && !b) { setUnsupported("Could not build the icon file — try a different image."); return; }
    if ((!b || (b.type !== fmt.mime && fmt.mime !== "image/png")) && fmtKey === "avif") {
      setUnsupported("Your browser can't encode AVIF yet — try Chrome/Edge, or use WebP for similar savings."); return;
    }
    if (b) { setBlob(b); setUrl(URL.createObjectURL(b)); }
  }

  /* Batch: every queued file goes through the same draw()+encode() the preview
     used, so the real BMP/ICO/TIFF encoders apply here too — then one ZIP. */
  async function convertAll() {
    if (queue.length < 2) return;
    setBatchBusy(true); setBatchDone(0); setUnsupported("");
    trackTool(`img-${engine}`, { batch: queue.length });
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    const taken = new Set<string>();
    let failed = 0;
    for (let i = 0; i < queue.length; i++) {
      const f = queue[i];
      try {
        const c = draw(await fileToImage(f));
        const b = c && await encode(c);
        if (b) {
          // two "photo.png" and "photo.jpg" inputs must not collide in the ZIP
          const stem = f.name.replace(/\.\w+$/, "") || `image-${i + 1}`;
          let name = `${stem}.${fmt.ext}`;
          for (let n = 2; taken.has(name); n++) name = `${stem}-${n}.${fmt.ext}`;
          taken.add(name);
          zip.file(name, b);
        } else failed++;
      } catch { failed++; }
      setBatchDone(i + 1);
    }
    setBatchBusy(false);
    if (!taken.size) { setUnsupported("None of those files could be converted in your browser."); return; }
    const zb = await zip.generateAsync({ type: "blob" });
    const { saveBlob } = await import("@/lib/save-file");
    await saveBlob(zb, `qrix-${(preset?.label || fmt.label).toLowerCase().replace(/[^\w]+/g, "-")}-${taken.size}-files.zip`);
    if (failed) setUnsupported(`${failed} of ${queue.length} file${queue.length > 1 ? "s" : ""} couldn't be converted and ${failed === 1 ? "was" : "were"} skipped.`);
  }

  const showQ = fmt.quality && !isSocial;

  return (
    <div className="qx-card p-6 space-y-5">
      {unsupported && <p className="text-[13px] px-4 py-2.5 rounded-xl" style={{ background: "rgba(224,82,82,.1)", border: "1px solid rgba(224,82,82,.3)", color: "var(--danger)" }}>{unsupported}</p>}
      {!img && <AiDropzone onFiles={onFiles} multiple accept={TIFF_ACCEPT} hint="JPG, PNG, WebP, TIFF · one file or many · processed on your device" />}
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
            <button onClick={convert} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>{preset ? "Resize" : `Convert to ${fmt.label}`}</button>
            {queue.length > 1 && (
              <button onClick={convertAll} disabled={batchBusy} className="qx-btn-ghost !py-2.5 !px-5 text-sm font-bold disabled:opacity-50">
                {batchBusy ? `Processing ${batchDone}/${queue.length}…` : `${preset ? "Resize" : "Convert"} all ${queue.length} → ZIP`}
              </button>
            )}
          </div>
          {queue.length > 1 && (
            <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>
              {queue.length} files selected — the settings above apply to every one of them. Preview shows the first.
            </p>
          )}
          {batchBusy && <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}><div className="h-full rounded-full transition-all" style={{ width: `${(batchDone / queue.length) * 100}%`, background: "var(--grad-primary)" }} /></div>}
          <canvas ref={viewRef} className="max-w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)", maxHeight: 420 }} />
          {blob && <><p className="text-[12px]" style={{ color: "var(--text-muted)" }}>Output: <b style={{ color: "var(--text)" }}>{(blob.size / 1024).toFixed(0)} KB · {fmt.label}</b></p><AiResultBar blob={blob} filename={`qrix-${(preset?.label || fmt.label).toLowerCase().replace(/[^\w]+/g, "-")}.${fmt.ext}`} onReset={() => { setImg(null); setBlob(null); setTiff(null); setUnsupported(""); setQueue([]); setBatchDone(0); }} /></>}
          {(fmtKey === "heic" || fmtKey === "svg") && <CloudNotice>{fmtKey === "heic" ? "HEIC decoding depends on your browser; where unavailable, the connector-backed path handles conversion." : "This embeds the raster as SVG. True vector tracing is wired through the QRix connector."}</CloudNotice>}
        </>
      )}
    </div>
  );
}
