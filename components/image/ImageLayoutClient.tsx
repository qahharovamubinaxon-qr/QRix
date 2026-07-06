"use client";

/* Layout engine: split | join | collage | compare */

import { useEffect, useRef, useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import { AiDropzone, AiResultBar, BeforeAfter } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

function loadImg(f: File): Promise<HTMLImageElement> { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); }); }

export default function ImageLayoutClient({ preset }: { preset: "split" | "join" | "collage" | "compare" }) {
  const single = preset === "split";
  const [imgs, setImgs] = useState<HTMLImageElement[]>([]);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [dir, setDir] = useState<"h" | "v">("h");
  const [gap, setGap] = useState(8);
  const [bg, setBg] = useState("#ffffff");
  const [radius, setRadius] = useState(8);
  const viewRef = useRef<HTMLCanvasElement>(null);

  async function onFile(f: File) { trackTool(`img-${preset}`); const im = await loadImg(f); setImgs((a) => single || preset === "compare" ? (preset === "compare" ? [...a, im].slice(-2) : [im]) : [...a, im]); setBlob(null); }

  function build(): HTMLCanvasElement | null {
    if (!imgs.length) return null;
    const c = document.createElement("canvas"); const ctx = c.getContext("2d")!;
    if (preset === "join") {
      const maxH = Math.max(...imgs.map((i) => i.height)), maxW = Math.max(...imgs.map((i) => i.width));
      if (dir === "h") { const scaled = imgs.map((i) => ({ w: i.width * (maxH / i.height), h: maxH, i })); c.width = scaled.reduce((s, x) => s + x.w, 0) + gap * (imgs.length - 1); c.height = maxH; ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); let x = 0; scaled.forEach((s) => { ctx.drawImage(s.i, x, 0, s.w, s.h); x += s.w + gap; }); }
      else { const scaled = imgs.map((i) => ({ w: maxW, h: i.height * (maxW / i.width), i })); c.width = maxW; c.height = scaled.reduce((s, x) => s + x.h, 0) + gap * (imgs.length - 1); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height); let y = 0; scaled.forEach((s) => { ctx.drawImage(s.i, 0, y, s.w, s.h); y += s.h + gap; }); }
    } else if (preset === "collage") {
      const cell = 400; const n = imgs.length; const cc = Math.ceil(Math.sqrt(n)); const cr = Math.ceil(n / cc);
      c.width = cc * cell + gap * (cc + 1); c.height = cr * cell + gap * (cr + 1); ctx.fillStyle = bg; ctx.fillRect(0, 0, c.width, c.height);
      imgs.forEach((im, k) => { const col = k % cc, row = Math.floor(k / cc); const x = gap + col * (cell + gap), y = gap + row * (cell + gap); ctx.save(); ctx.beginPath(); (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(x, y, cell, cell, radius); ctx.clip(); const s = Math.max(cell / im.width, cell / im.height); ctx.drawImage(im, x + (cell - im.width * s) / 2, y + (cell - im.height * s) / 2, im.width * s, im.height * s); ctx.restore(); });
    }
    return c;
  }

  useEffect(() => { if (preset === "join" || preset === "collage") { const c = build(); if (c && viewRef.current) { const v = viewRef.current; v.width = c.width; v.height = c.height; v.getContext("2d")!.drawImage(c, 0, 0); } } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgs, dir, gap, bg, radius]);

  async function doSplit() {
    if (!imgs[0]) return; const im = imgs[0]; const { default: JSZip } = await import("jszip"); const zip = new JSZip();
    const cw = im.width / cols, ch = im.height / rows;
    for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) { const c = document.createElement("canvas"); c.width = cw; c.height = ch; c.getContext("2d")!.drawImage(im, cc * cw, r * ch, cw, ch, 0, 0, cw, ch); const b = await new Promise<Blob | null>((res) => c.toBlob(res, "image/png")); if (b) zip.file(`tile-${r + 1}-${cc + 1}.png`, b); }
    const zb = await zip.generateAsync({ type: "blob" }); const { saveBlob } = await import("@/lib/save-file"); await saveBlob(zb, `split-${rows}x${cols}.zip`);
  }
  async function download() { const c = build(); if (!c) return; const b = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png")); if (b) { setBlob(b); const { saveBlob } = await import("@/lib/save-file"); await saveBlob(b, `qrix-${preset}.png`); } }
  async function compareExport() { if (imgs.length < 2) return; const [a, b] = imgs; const h = Math.max(a.height, b.height), c = document.createElement("canvas"); c.width = a.width * (h / a.height) + b.width * (h / b.height) + 4; c.height = h; const ctx = c.getContext("2d")!; ctx.fillStyle = "#000"; ctx.fillRect(0, 0, c.width, c.height); const aw = a.width * (h / a.height); ctx.drawImage(a, 0, 0, aw, h); ctx.drawImage(b, aw + 4, 0, b.width * (h / b.height), h); const bl = await new Promise<Blob | null>((r) => c.toBlob(r, "image/png")); if (bl) { const { saveBlob } = await import("@/lib/save-file"); await saveBlob(bl, "comparison.png"); } }

  return <div className="qx-card p-6 space-y-5">
    {(single ? imgs.length === 0 : preset === "compare" ? imgs.length < 2 : true) && <AiDropzone onFile={onFile} hint={single ? "One image to split into a grid" : preset === "compare" ? "Add the before and after images" : "Add multiple images"} />}
    {!single && imgs.length > 0 && preset !== "compare" && <div className="flex flex-wrap gap-2">{imgs.map((im, i) => <div key={i} className="relative"><img src={im.src} alt="" className="w-16 h-16 object-cover rounded-lg" style={{ border: "1px solid var(--border)" }} /><button onClick={() => setImgs((a) => a.filter((_, k) => k !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--danger)", color: "#fff" }}><FiX size={11} /></button></div>)}</div>}

    {single && imgs[0] && <><img src={imgs[0].src} alt="" className="max-w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)", maxHeight: 360 }} /><div className="flex items-center gap-4"><label className="text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Rows <input type="number" min={1} max={10} value={rows} onChange={(e) => setRows(+e.target.value)} className="qx-auth-input !py-1 !px-2 w-16 ml-1" /></label><label className="text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Cols <input type="number" min={1} max={10} value={cols} onChange={(e) => setCols(+e.target.value)} className="qx-auth-input !py-1 !px-2 w-16 ml-1" /></label><button onClick={doSplit} className="qx-btn-hero !py-2 !px-4 text-sm" data-magnetic><FiDownload size={13} /> Split → ZIP</button></div></>}

    {(preset === "join" || preset === "collage") && imgs.length > 0 && <><div className="flex flex-wrap items-center gap-4">{preset === "join" && <div className="flex gap-2">{(["h", "v"] as const).map((d) => <button key={d} onClick={() => setDir(d)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold" style={{ background: dir === d ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${dir === d ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{d === "h" ? "Side by side" : "Stacked"}</button>)}</div>}<label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Gap <input type="range" min={0} max={40} value={gap} onChange={(e) => setGap(+e.target.value)} className="w-28 accent-[#e1ff04]" /></label>{preset === "collage" && <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Radius <input type="range" min={0} max={60} value={radius} onChange={(e) => setRadius(+e.target.value)} className="w-24 accent-[#e1ff04]" /></label>}<input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-9 h-9 rounded cursor-pointer" /></div><canvas ref={viewRef} className="max-w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)", maxHeight: 460 }} /><button onClick={download} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>Download PNG</button>{blob && <AiResultBar blob={blob} filename={`qrix-${preset}.png`} onReset={() => { setImgs([]); setBlob(null); }} />}</>}

    {preset === "compare" && imgs.length === 2 && <><BeforeAfter before={imgs[0].src} after={imgs[1].src} /><div className="flex gap-2"><button onClick={compareExport} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic><FiDownload size={13} /> Export side-by-side</button><button onClick={() => setImgs([])} className="qx-btn-ghost !py-2.5 text-sm">New</button></div></>}
  </div>;
}
