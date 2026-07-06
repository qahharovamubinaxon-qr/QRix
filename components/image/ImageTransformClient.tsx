"use client";

/* Transform engine: crop rotate flip mirror rounded border frame canvas
   transparent smartcrop facecrop. Canvas-based, live preview. */

import { useEffect, useRef, useState } from "react";
import { AiDropzone, AiResultBar } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

type TF = "crop" | "rotate" | "flip" | "mirror" | "rounded" | "border" | "frame" | "canvas" | "transparent" | "smartcrop" | "facecrop";

function loadImg(f: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); });
}

export default function ImageTransformClient({ preset }: { preset: TF }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const viewRef = useRef<HTMLCanvasElement>(null);

  // controls
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(preset === "mirror");
  const [flipV, setFlipV] = useState(false);
  const [radius, setRadius] = useState(24);
  const [borderW, setBorderW] = useState(20);
  const [borderC, setBorderC] = useState("#ffffff");
  const [pad, setPad] = useState(80);
  const [bg, setBg] = useState("#ffffff");
  const [frameStyle, setFrameStyle] = useState<"clean" | "film" | "shadow">("clean");
  const [tol, setTol] = useState(30);
  const [crop, setCrop] = useState({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [ratio, setRatio] = useState<number | null>(null);
  const drag = useRef<string | null>(null);

  async function onFile(f: File) {
    trackTool(`img-${preset}`, { size: f.size });
    const image = await loadImg(f);
    setImg(image); setBlob(null); setUrl(null);
    if (preset === "smartcrop") autoCrop(image);
    else if (preset === "facecrop") faceCrop(image);
  }

  function render() {
    if (!img) return null;
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d")!;
    const iw = img.naturalWidth, ih = img.naturalHeight;
    if (preset === "rotate") {
      const rad = (angle * Math.PI) / 180, sin = Math.abs(Math.sin(rad)), cos = Math.abs(Math.cos(rad));
      c.width = Math.round(iw * cos + ih * sin); c.height = Math.round(iw * sin + ih * cos);
      ctx.translate(c.width / 2, c.height / 2); ctx.rotate(rad); ctx.drawImage(img, -iw / 2, -ih / 2);
    } else if (preset === "flip" || preset === "mirror") {
      c.width = iw; c.height = ih;
      ctx.translate(flipH ? iw : 0, flipV ? ih : 0); ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1); ctx.drawImage(img, 0, 0);
    } else if (preset === "rounded") {
      c.width = iw; c.height = ih; const r = Math.min(iw, ih) * (radius / 100);
      ctx.beginPath(); (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(0, 0, iw, ih, r); ctx.clip(); ctx.drawImage(img, 0, 0);
    } else if (preset === "border") {
      c.width = iw + borderW * 2; c.height = ih + borderW * 2; ctx.fillStyle = borderC; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, borderW, borderW);
    } else if (preset === "canvas") {
      c.width = iw + pad * 2; c.height = ih + pad * 2; ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, pad, pad);
    } else if (preset === "frame") {
      const b = frameStyle === "film" ? Math.round(Math.min(iw, ih) * 0.08) : Math.round(Math.min(iw, ih) * 0.05);
      c.width = iw + b * 2; c.height = ih + b * 2;
      ctx.fillStyle = frameStyle === "film" ? "#111" : "#fff"; ctx.fillRect(0, 0, c.width, c.height);
      if (frameStyle === "shadow") { ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = b; ctx.shadowOffsetY = b * 0.3; }
      ctx.drawImage(img, b, b);
      if (frameStyle === "film") { ctx.fillStyle = "#fff"; const hole = b * 0.35; for (let x = b; x < c.width - b; x += hole * 2) { ctx.fillRect(x, b * 0.3, hole, hole); ctx.fillRect(x, c.height - b * 0.65, hole, hole); } }
    } else if (preset === "transparent") {
      c.width = iw; c.height = ih; ctx.drawImage(img, 0, 0);
      const im = ctx.getImageData(0, 0, iw, ih); const d = im.data;
      const kr = parseInt(bg.slice(1, 3), 16), kg = parseInt(bg.slice(3, 5), 16), kb = parseInt(bg.slice(5, 7), 16);
      const t = tol * 4;
      for (let i = 0; i < d.length; i += 4) { if (Math.abs(d[i] - kr) + Math.abs(d[i + 1] - kg) + Math.abs(d[i + 2] - kb) < t) d[i + 3] = 0; }
      ctx.putImageData(im, 0, 0);
    } else { // crop / smartcrop / facecrop use crop rect
      const sx = crop.x * iw, sy = crop.y * ih, sw = crop.w * iw, sh = crop.h * ih;
      c.width = Math.max(1, Math.round(sw)); c.height = Math.max(1, Math.round(sh));
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, c.width, c.height);
    }
    return c;
  }

  // live preview
  useEffect(() => {
    if (!img || !viewRef.current) return;
    const c = render(); if (!c) return;
    const v = viewRef.current; v.width = c.width; v.height = c.height;
    const ctx = v.getContext("2d")!;
    if (preset === "transparent" || preset === "rounded") { // checkerboard
      const s = 12; for (let y = 0; y < v.height; y += s) for (let x = 0; x < v.width; x += s) { ctx.fillStyle = ((x / s + y / s) & 1) ? "#e5e5e5" : "#fafafa"; ctx.fillRect(x, y, s, s); }
    }
    ctx.drawImage(c, 0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img, angle, flipH, flipV, radius, borderW, borderC, pad, bg, frameStyle, tol, crop]);

  function autoCrop(image: HTMLImageElement) {
    const c = document.createElement("canvas"); const s = 200; const sc = Math.min(1, s / Math.max(image.width, image.height));
    c.width = image.width * sc; c.height = image.height * sc; const ctx = c.getContext("2d")!; ctx.drawImage(image, 0, 0, c.width, c.height);
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    const corner = [d[0], d[1], d[2]]; let minX = c.width, minY = c.height, maxX = 0, maxY = 0;
    for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) { const i = (y * c.width + x) * 4; if (Math.abs(d[i] - corner[0]) + Math.abs(d[i + 1] - corner[1]) + Math.abs(d[i + 2] - corner[2]) > 40) { minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); } }
    if (maxX > minX) setCrop({ x: minX / c.width, y: minY / c.height, w: (maxX - minX) / c.width, h: (maxY - minY) / c.height });
  }
  async function faceCrop(image: HTMLImageElement) {
    // @ts-expect-error FaceDetector is experimental
    if (typeof window !== "undefined" && window.FaceDetector) {
      try {
        // @ts-expect-error experimental
        const faces = await new window.FaceDetector().detect(image);
        if (faces[0]) { const b = faces[0].boundingBox; const m = b.width * 0.5; const size = Math.max(b.width, b.height) + m * 2; const cx = b.x + b.width / 2, cy = b.y + b.height / 2; setCrop({ x: Math.max(0, (cx - size / 2) / image.width), y: Math.max(0, (cy - size / 2) / image.height), w: Math.min(1, size / image.width), h: Math.min(1, size / image.height) }); return; }
      } catch { /* fall through */ }
    }
    const size = Math.min(image.width, image.height) * 0.7;
    setCrop({ x: (image.width - size) / 2 / image.width, y: (image.height - size) / 2.6 / image.height, w: size / image.width, h: size / image.height });
  }

  async function download() {
    const c = render(); if (!c) return;
    const b = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png"));
    if (b) { setBlob(b); const { saveBlob } = await import("@/lib/save-file"); await saveBlob(b, `qrix-${preset}.png`); }
  }

  const usesCropBox = preset === "crop";
  const RATIOS: [string, number | null][] = [["Free", null], ["1:1", 1], ["4:3", 4 / 3], ["16:9", 16 / 9], ["3:4", 3 / 4], ["9:16", 9 / 16]];

  return (
    <div className="qx-card p-6 space-y-5">
      {!img && <AiDropzone onFile={onFile} />}
      {img && (
        <>
          {/* controls */}
          <div className="flex flex-wrap items-center gap-4">
            {preset === "rotate" && (<>
              <div className="flex gap-2">{[90, 180, 270].map((a) => <button key={a} onClick={() => setAngle(a)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold" style={{ background: angle === a ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${angle === a ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{a}°</button>)}</div>
              <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Fine <input type="range" min={-180} max={180} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-40 accent-[#e1ff04]" /> {angle}°</label>
            </>)}
            {(preset === "flip" || preset === "mirror") && (<div className="flex gap-4">
              <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer" style={{ color: "var(--text)" }}><input type="checkbox" checked={flipH} onChange={(e) => setFlipH(e.target.checked)} className="accent-[#e1ff04] w-4 h-4" /> Horizontal</label>
              <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer" style={{ color: "var(--text)" }}><input type="checkbox" checked={flipV} onChange={(e) => setFlipV(e.target.checked)} className="accent-[#e1ff04] w-4 h-4" /> Vertical</label>
            </div>)}
            {preset === "rounded" && <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Radius <input type="range" min={0} max={50} value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="w-44 accent-[#e1ff04]" /> {radius === 50 ? "circle" : `${radius}%`}</label>}
            {preset === "border" && (<><label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Width <input type="range" min={2} max={120} value={borderW} onChange={(e) => setBorderW(Number(e.target.value))} className="w-40 accent-[#e1ff04]" /></label><input type="color" value={borderC} onChange={(e) => setBorderC(e.target.value)} className="w-9 h-9 rounded cursor-pointer" /></>)}
            {preset === "canvas" && (<><label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Padding <input type="range" min={0} max={400} value={pad} onChange={(e) => setPad(Number(e.target.value))} className="w-40 accent-[#e1ff04]" /></label><input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer" /></>)}
            {preset === "frame" && <div className="flex gap-2">{(["clean", "film", "shadow"] as const).map((f) => <button key={f} onClick={() => setFrameStyle(f)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold capitalize" style={{ background: frameStyle === f ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${frameStyle === f ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{f}</button>)}</div>}
            {preset === "transparent" && (<><label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Key color <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer" /></label><label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Tolerance <input type="range" min={5} max={80} value={tol} onChange={(e) => setTol(Number(e.target.value))} className="w-40 accent-[#e1ff04]" /></label></>)}
            {usesCropBox && <div className="flex gap-1.5 flex-wrap">{RATIOS.map(([lbl, r]) => <button key={lbl} onClick={() => { setRatio(r); if (r) { const w = 0.8, h = Math.min(0.9, w / r / (img.naturalWidth / img.naturalHeight)); setCrop((c) => ({ ...c, w, h, x: (1 - w) / 2, y: (1 - h) / 2 })); } }} className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold" style={{ background: ratio === r ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${ratio === r ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{lbl}</button>)}</div>}
          </div>

          {/* preview with optional crop overlay */}
          <div className="relative inline-block max-w-full">
            <canvas ref={viewRef} className="max-w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)" }} />
            {usesCropBox && (
              <div className="absolute inset-0" onPointerMove={(e) => { if (!drag.current) return; const r = e.currentTarget.getBoundingClientRect(); const rx = (e.clientX - r.left) / r.width, ry = (e.clientY - r.top) / r.height; setCrop((c) => drag.current === "move" ? { ...c, x: Math.max(0, Math.min(1 - c.w, rx - c.w / 2)), y: Math.max(0, Math.min(1 - c.h, ry - c.h / 2)) } : { ...c, w: Math.max(0.1, Math.min(1 - c.x, rx - c.x)), h: ratio ? Math.max(0.1, Math.min(1 - c.y, rx - c.x)) : Math.max(0.1, Math.min(1 - c.y, ry - c.y)) }); }} onPointerUp={() => { drag.current = null; }}>
                <div className="absolute cursor-move" style={{ left: `${crop.x * 100}%`, top: `${crop.y * 100}%`, width: `${crop.w * 100}%`, height: `${crop.h * 100}%`, border: "2px solid var(--primary-bright)", boxShadow: "0 0 0 9999px rgba(5,5,10,.5)" }} onPointerDown={(e) => { drag.current = "move"; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}>
                  <div className="absolute -bottom-2 -right-2 w-5 h-5 rounded-full cursor-nwse-resize" style={{ background: "var(--primary-bright)" }} onPointerDown={(e) => { e.stopPropagation(); drag.current = "se"; (e.target as HTMLElement).setPointerCapture(e.pointerId); }} />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button onClick={download} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>Download PNG</button>
            <button onClick={() => { setImg(null); setBlob(null); }} className="qx-btn-ghost !py-2.5 text-sm">New image</button>
          </div>
          {blob && <AiResultBar blob={blob} filename={`qrix-${preset}.png`} onReset={() => { setImg(null); setBlob(null); }} />}
        </>
      )}
    </div>
  );
}
