"use client";

/* Metadata (view/remove/exif) + Studio special (beautifier/device/passport/removewm). */

import { useEffect, useRef, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { AiDropzone, AiResultBar, CloudNotice, BeforeAfter } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";
import { keepFormat, flattensToWhite } from "@/lib/image-output";

function loadImg(f: File): Promise<HTMLImageElement> { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); }); }
function human(b: number) { return b > 1e6 ? `${(b / 1e6).toFixed(2)} MB` : `${(b / 1e3).toFixed(0)} KB`; }

/* ── Metadata viewer / remover / exif ── */
export function ImageMetaClient({ mode }: { mode: "view" | "remove" | "exif" }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [exif, setExif] = useState<[string, string][]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [copied, setCopied] = useState(false);
  const [outExt, setOutExt] = useState("png");

  async function onFile(f: File) {
    trackTool(`img-meta-${mode}`); setFile(f); setBlob(null);
    const image = await loadImg(f); setImg(image);
    // minimal EXIF parse (JPEG APP1) for orientation/make/model/gps presence
    const buf = new DataView(await f.arrayBuffer());
    const rows: [string, string][] = [["Format", f.type || "unknown"], ["Dimensions", `${image.naturalWidth} × ${image.naturalHeight}`], ["File size", human(f.size)], ["Aspect", (image.naturalWidth / image.naturalHeight).toFixed(3)]];
    let hasExif = false;
    if (buf.getUint16(0) === 0xffd8) { for (let o = 2; o < Math.min(buf.byteLength - 2, 60000);) { const marker = buf.getUint16(o); if (marker === 0xffe1) { hasExif = true; break; } if ((marker & 0xff00) !== 0xff00) break; o += 2 + buf.getUint16(o + 2); } }
    rows.push(["EXIF metadata", hasExif ? "Present (camera/GPS/timestamp may be embedded)" : "None detected"]);
    setExif(rows);
    /* Stripping metadata must not also rewrite the format. This hardcoded
       image/png, so a JPEG came back as a far larger PNG and a WebP lost its
       format — the bug M122 fixed in ExifCleanerClient, whose registry twin
       this is. Flatten first when the target has no alpha, or a transparent
       source encodes black. */
    if (mode === "remove") {
      const fmtKey = keepFormat(f.type, f.name);
      const mime = `image/${fmtKey}`;
      const c = document.createElement("canvas"); c.width = image.naturalWidth; c.height = image.naturalHeight;
      const ctx = c.getContext("2d")!;
      if (flattensToWhite(mime, fmtKey)) { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); }
      ctx.drawImage(image, 0, 0);
      setOutExt(fmtKey === "jpeg" ? "jpg" : fmtKey);
      c.toBlob((b) => setBlob(b), mime, fmtKey === "png" ? undefined : 0.92);
    }
  }
  async function download() { if (blob) { const { saveBlob } = await import("@/lib/save-file"); await saveBlob(blob, (file?.name.replace(/\.\w+$/, "") || "clean") + "." + outExt); } }

  return <div className="qx-card p-6 space-y-5">
    {!img && <AiDropzone onFile={onFile} hint="Read locally — nothing is uploaded" />}
    {img && <>
      <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">{exif.map(([k, v]) => <div key={k} className="flex justify-between gap-4 py-1.5" style={{ borderBottom: "1px solid var(--border)" }}><span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{k}</span><span className="text-[12.5px] font-semibold text-right" style={{ color: "var(--text)" }}>{v}</span></div>)}</div>
      {mode === "view" && <button onClick={() => { navigator.clipboard.writeText(exif.map(([k, v]) => `${k}: ${v}`).join("\n")); setCopied(true); setTimeout(() => setCopied(false), 1200); }} className="qx-btn !py-2 text-xs">{copied ? <FiCheck size={13} /> : <FiCopy size={13} />} Copy report</button>}
      {(mode === "remove" || mode === "exif") && <><p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Exporting re-encodes the image, stripping all EXIF/GPS/camera metadata.</p><div className="flex gap-2"><button onClick={download} disabled={!blob} className="qx-btn-hero !py-2.5 !px-5 text-sm disabled:opacity-50" data-magnetic>Download clean copy</button><button onClick={() => setImg(null)} className="qx-btn-ghost !py-2.5 text-sm">New</button></div></>}
      {mode === "view" && <button onClick={() => setImg(null)} className="qx-btn-ghost !py-2 text-xs">New image</button>}
      {mode === "exif" && <CloudNotice>Per-field EXIF editing (rewriting values) is wired through the QRix connector; viewing and stripping work fully on-device today.</CloudNotice>}
    </>}
  </div>;
}

/* ── Screenshot beautifier / device frame ── */
const GRADS = [["#e1ff04", "#84cc16"], ["#bba9ff", "#7c3aed"], ["#38bdf8", "#1d4ed8"], ["#f472b6", "#db2777"], ["#fb923c", "#ea580c"], ["#0f172a", "#334155"]];
export function ImageStudioClient({ mode }: { mode: "beautifier" | "device" | "removewm" }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [gi, setGi] = useState(1);
  const [padding, setPadding] = useState(12);
  const [radius, setRadius] = useState(16);
  const [frame, setFrame] = useState<"browser" | "phone">("browser");
  const viewRef = useRef<HTMLCanvasElement>(null);
  // removewm brush
  const baseRef = useRef<HTMLCanvasElement | null>(null); const maskRef = useRef<HTMLCanvasElement | null>(null);
  const [origUrl, setOrigUrl] = useState<string | null>(null); const [resUrl, setResUrl] = useState<string | null>(null);
  const drawing = useRef(false); const [brush, setBrush] = useState(26);

  async function onFile(f: File) {
    trackTool(`img-${mode}`); const image = await loadImg(f); setImg(image); setBlob(null);
    if (mode === "removewm") { const sc = Math.min(1, 1400 / image.width); const b = document.createElement("canvas"); b.width = image.width * sc; b.height = image.height * sc; b.getContext("2d")!.drawImage(image, 0, 0, b.width, b.height); baseRef.current = b; const m = document.createElement("canvas"); m.width = b.width; m.height = b.height; maskRef.current = m; setOrigUrl(image.src); setResUrl(null); requestAnimationFrame(paintWm); }
  }

  function render() {
    if (!img || !viewRef.current || mode === "removewm") return;
    const iw = img.naturalWidth, ih = img.naturalHeight; const v = viewRef.current;
    if (mode === "beautifier") {
      const pad = Math.round(Math.max(iw, ih) * (padding / 100)); const W = iw + pad * 2, H = ih + pad * 2; v.width = W; v.height = H; const ctx = v.getContext("2d")!;
      const [a, b] = GRADS[gi]; const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, a); g.addColorStop(1, b); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.shadowColor = "rgba(0,0,0,.35)"; ctx.shadowBlur = pad * 0.6; ctx.shadowOffsetY = pad * 0.2; ctx.beginPath(); (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(pad, pad, iw, ih, radius); ctx.clip(); ctx.drawImage(img, pad, pad); ctx.restore();
    } else { // device
      const bar = frame === "browser" ? Math.round(iw * 0.06) : Math.round(iw * 0.04); const side = frame === "phone" ? Math.round(iw * 0.04) : 0;
      const W = iw + side * 2, H = ih + bar + side; v.width = W; v.height = H; const ctx = v.getContext("2d")!;
      ctx.fillStyle = frame === "phone" ? "#111" : "#e5e7eb"; ctx.beginPath(); (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(0, 0, W, H, frame === "phone" ? 40 : 12); ctx.fill();
      if (frame === "browser") { ["#ff5f57", "#febc2e", "#28c840"].forEach((c, i) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(20 + i * 22, bar / 2, 7, 0, 7); ctx.fill(); }); }
      ctx.drawImage(img, side, bar, iw, ih);
    }
  }
  useEffect(() => { render(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [img, gi, padding, radius, frame]);

  function paintWm() { const v = viewRef.current, b = baseRef.current, m = maskRef.current; if (!v || !b || !m) return; v.width = b.width; v.height = b.height; const ctx = v.getContext("2d")!; ctx.drawImage(b, 0, 0); const md = m.getContext("2d")!.getImageData(0, 0, m.width, m.height).data; const ov = ctx.getImageData(0, 0, v.width, v.height); for (let i = 0; i < md.length; i += 4) if (md[i + 3] > 0) { ov.data[i] = 225; ov.data[i + 1] = 255; ov.data[i + 2] = 4; } ctx.putImageData(ov, 0, 0); }
  function brushAt(e: React.PointerEvent<HTMLCanvasElement>) { const v = viewRef.current, m = maskRef.current; if (!v || !m) return; const r = v.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width * m.width, y = (e.clientY - r.top) / r.height * m.height; const ctx = m.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x, y, brush, 0, 7); ctx.fill(); paintWm(); }
  function eraseWm() { const base = baseRef.current, m = maskRef.current; if (!base || !m) return; const out = document.createElement("canvas"); out.width = base.width; out.height = base.height; const octx = out.getContext("2d")!; octx.drawImage(base, 0, 0); const blur = document.createElement("canvas"); blur.width = base.width; blur.height = base.height; const bctx = blur.getContext("2d")!; bctx.filter = "blur(22px)"; bctx.drawImage(base, 0, 0); const mb = document.createElement("canvas"); mb.width = base.width; mb.height = base.height; const mctx = mb.getContext("2d")!; mctx.filter = "blur(8px)"; mctx.drawImage(m, 0, 0); mctx.filter = "none"; mctx.globalCompositeOperation = "source-in"; mctx.drawImage(blur, 0, 0); octx.drawImage(mb, 0, 0); octx.drawImage(mb, 0, 0); out.toBlob((b) => { if (b) { setBlob(b); setResUrl(URL.createObjectURL(b)); } }, "image/png"); }

  async function download() { const v = viewRef.current; if (!v) return; const b = await new Promise<Blob | null>((r) => v.toBlob(r, "image/png")); if (b) { setBlob(b); const { saveBlob } = await import("@/lib/save-file"); await saveBlob(b, `qrix-${mode}.png`); } }

  if (mode === "removewm") return <div className="qx-card p-6 space-y-5">
    <CloudNotice>Brush-and-blend works on-device for small marks. Neural inpainting for large logos is wired through the QRix connector. Only use on images you have rights to.</CloudNotice>
    {!img && <AiDropzone onFile={onFile} />}
    {img && !resUrl && <><div className="flex items-center gap-4"><label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Brush <input type="range" min={8} max={70} value={brush} onChange={(e) => setBrush(+e.target.value)} className="w-36 accent-[#e1ff04]" /></label><button onClick={eraseWm} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>🧽 Blend marked area</button></div><canvas ref={viewRef} className="max-w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)", cursor: "crosshair", touchAction: "none" }} onPointerDown={(e) => { drawing.current = true; brushAt(e); }} onPointerMove={(e) => drawing.current && brushAt(e)} onPointerUp={() => { drawing.current = false; }} /></>}
    {resUrl && origUrl && <><BeforeAfter before={origUrl} after={resUrl} /><AiResultBar blob={blob} filename="watermark-removed.png" onReset={() => { setImg(null); setResUrl(null); }} /></>}
  </div>;

  return <div className="qx-card p-6 space-y-5">
    {!img && <AiDropzone onFile={onFile} hint={mode === "device" ? "Your screenshot → framed mockup" : "Your screenshot → polished, share-ready shot"} />}
    {img && <>
      <div className="flex flex-wrap items-center gap-4">
        {mode === "beautifier" && <><div className="flex gap-1.5">{GRADS.map(([a, b], i) => <button key={i} onClick={() => setGi(i)} className="w-8 h-8 rounded-lg" style={{ background: `linear-gradient(135deg,${a},${b})`, border: gi === i ? "2.5px solid var(--primary-bright)" : "1px solid var(--border)" }} />)}</div><label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Padding <input type="range" min={4} max={30} value={padding} onChange={(e) => setPadding(+e.target.value)} className="w-28 accent-[#e1ff04]" /></label><label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Radius <input type="range" min={0} max={40} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-24 accent-[#e1ff04]" /></label></>}
        {mode === "device" && <div className="flex gap-2">{(["browser", "phone"] as const).map((f) => <button key={f} onClick={() => setFrame(f)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold capitalize" style={{ background: frame === f ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${frame === f ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{f}</button>)}</div>}
      </div>
      <canvas ref={viewRef} className="max-w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)", maxHeight: 460 }} />
      <button onClick={download} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>Download PNG</button>
      {blob && <AiResultBar blob={blob} filename={`qrix-${mode}.png`} onReset={() => { setImg(null); setBlob(null); }} />}
    </>}
  </div>;
}

/* ── Passport photo ── */
const DOC_SIZES = [["35×45 mm (EU/Visa)", 413, 531], ["2×2 in (US)", 600, 600], ["50×70 mm", 591, 827], ["35×35 mm", 413, 413]] as [string, number, number][];
/* A country page passes the size its authority publishes; without one the tool
   keeps the four generic presets it has always had. The preset is prepended and
   selected, and the generic list stays available underneath — someone who
   landed on the India page and actually needs the US size should not have to
   navigate away to get it. */
export function PassportClient({ preset }: { preset?: { label: string; w: number; h: number } } = {}) {
  const sizes: [string, number, number][] = preset
    ? [[preset.label, preset.w, preset.h], ...DOC_SIZES]
    : DOC_SIZES;
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0.5, y: 0.45 });
  const [blob, setBlob] = useState<Blob | null>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);
  const drag = useRef(false);

  function render(target?: HTMLCanvasElement) {
    if (!img) return null;
    const [, w, h] = sizes[sizeIdx]; const c = target || document.createElement("canvas"); c.width = w; c.height = h; const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h);
    const s = Math.max(w / img.width, h / img.height) * zoom; const iw = img.width * s, ih = img.height * s;
    ctx.drawImage(img, w * off.x - iw * off.x, h * off.y - ih * off.y, iw, ih);
    return c;
  }
  useEffect(() => { if (img && viewRef.current) render(viewRef.current); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [img, sizeIdx, zoom, off]);

  async function download(sheet: boolean) {
    const c = render(); if (!c) return;
    let out = c;
    if (sheet) { const s = document.createElement("canvas"); s.width = 1800; s.height = 1200; const ctx = s.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, s.width, s.height); const cols = Math.floor(1800 / (c.width + 20)), rows = Math.floor(1200 / (c.height + 20)); for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) ctx.drawImage(c, 20 + cc * (c.width + 20), 20 + r * (c.height + 20)); out = s; }
    const b = await new Promise<Blob | null>((r) => out.toBlob(r, "image/jpeg", 0.95)); if (b) { setBlob(b); const { saveBlob } = await import("@/lib/save-file"); await saveBlob(b, sheet ? "passport-sheet.jpg" : "passport-photo.jpg"); }
  }

  return <div className="qx-card p-6 space-y-5">
    {!img && <AiDropzone onFile={async (f) => { trackTool("img-passport"); setImg(await loadImg(f)); }} hint="Upload a front-facing portrait" />}
    {img && <>
      <div className="flex flex-wrap items-center gap-4">
        <select value={sizeIdx} onChange={(e) => setSizeIdx(+e.target.value)} className="qx-auth-input !py-2 w-48">{sizes.map((d, i) => <option key={i} value={i}>{d[0]}</option>)}</select>
        <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Zoom <input type="range" min={100} max={250} value={zoom * 100} onChange={(e) => setZoom(+e.target.value / 100)} className="w-32 accent-[#e1ff04]" /></label>
      </div>
      <canvas ref={viewRef} className="rounded-xl cursor-move mx-auto" style={{ border: "1px solid var(--border)", maxHeight: 400, touchAction: "none" }}
        onPointerDown={(e) => { drag.current = true; e.currentTarget.setPointerCapture(e.pointerId); }} onPointerUp={() => { drag.current = false; }}
        onPointerMove={(e) => { if (!drag.current) return; const r = e.currentTarget.getBoundingClientRect(); setOff({ x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)) }); }} />
      <p className="text-[11px]" style={{ color: "var(--text-faint)" }}>Drag to position the face; use zoom to frame.</p>
      <div className="flex gap-2"><button onClick={() => download(false)} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>Download photo</button><button onClick={() => download(true)} className="qx-btn !py-2.5 text-sm">Print sheet (4×6)</button><button onClick={() => setImg(null)} className="qx-btn-ghost !py-2.5 text-sm">New</button></div>
      {blob && <AiResultBar blob={blob} filename="passport-photo.jpg" onReset={() => { setImg(null); setBlob(null); }} />}
    </>}
  </div>;
}
