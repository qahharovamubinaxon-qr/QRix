"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiCopy, FiCheck, FiDownload } from "react-icons/fi";
import { AiDropzone } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

const hex = (r: number, g: number, b: number) => "#" + [r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("");
function loadImg(f: File): Promise<HTMLImageElement> { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = URL.createObjectURL(f); }); }
function Swatch({ c }: { c: string }) {
  const [ok, setOk] = useState(false);
  return <button onClick={() => { navigator.clipboard.writeText(c); setOk(true); setTimeout(() => setOk(false), 1200); }} className="rounded-xl overflow-hidden text-left group" style={{ border: "1px solid var(--border)" }}>
    <div style={{ background: c, height: 64 }} />
    <div className="px-2 py-1.5 flex items-center justify-between" style={{ background: "var(--surface)" }}><span className="text-[11px] font-mono font-bold" style={{ color: "var(--text)" }}>{c}</span>{ok ? <FiCheck size={12} style={{ color: "var(--primary-bright)" }} /> : <FiCopy size={11} style={{ color: "var(--text-faint)" }} />}</div>
  </button>;
}

function quantColors(img: HTMLImageElement, n: number): string[] {
  const c = document.createElement("canvas"); const s = 120; const sc = Math.min(1, s / Math.max(img.width, img.height));
  c.width = img.width * sc; c.height = img.height * sc; const ctx = c.getContext("2d")!; ctx.drawImage(img, 0, 0, c.width, c.height);
  const d = ctx.getImageData(0, 0, c.width, c.height).data; const buckets = new Map<string, { c: number[]; n: number }>();
  for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; const key = `${d[i] >> 4}-${d[i + 1] >> 4}-${d[i + 2] >> 4}`; const b = buckets.get(key) || { c: [0, 0, 0], n: 0 }; b.c[0] += d[i]; b.c[1] += d[i + 1]; b.c[2] += d[i + 2]; b.n++; buckets.set(key, b); }
  return [...buckets.values()].sort((a, b) => b.n - a.n).slice(0, n).map((b) => hex(Math.round(b.c[0] / b.n), Math.round(b.c[1] / b.n), Math.round(b.c[2] / b.n)));
}

export function ColorPickerClient() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [picked, setPicked] = useState<{ hex: string; rgb: string } | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => { if (img && ref.current) { const v = ref.current; const sc = Math.min(1, 700 / img.width); v.width = img.width * sc; v.height = img.height * sc; v.getContext("2d", { willReadFrequently: true })!.drawImage(img, 0, 0, v.width, v.height); } }, [img]);
  return <div className="qx-card p-6 space-y-5">
    {!img && <AiDropzone onFile={async (f) => { trackTool("img-color-picker"); setImg(await loadImg(f)); }} />}
    {img && <><canvas ref={ref} className="max-w-full h-auto rounded-2xl cursor-crosshair" style={{ border: "1px solid var(--border)" }} onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); const x = Math.floor((e.clientX - r.left) * (e.currentTarget.width / r.width)); const y = Math.floor((e.clientY - r.top) * (e.currentTarget.height / r.height)); const d = e.currentTarget.getContext("2d", { willReadFrequently: true })!.getImageData(x, y, 1, 1).data; setPicked({ hex: hex(d[0], d[1], d[2]), rgb: `rgb(${d[0]}, ${d[1]}, ${d[2]})` }); }} />
      {picked && <div className="flex items-center gap-4"><div className="w-16 h-16 rounded-xl" style={{ background: picked.hex, border: "1px solid var(--border)" }} /><div><Swatch c={picked.hex} /><p className="text-[12px] mt-1 font-mono" style={{ color: "var(--text-muted)" }}>{picked.rgb}</p></div></div>}
      <button onClick={() => setImg(null)} className="qx-btn-ghost !py-2 text-xs">New image</button></>}
  </div>;
}

export function DominantColorClient({ palette }: { palette?: boolean }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const colors = useMemo(() => img ? quantColors(img, palette ? 6 : 5) : [], [img, palette]);
  return <div className="qx-card p-6 space-y-5">
    {!img && <AiDropzone onFile={async (f) => { trackTool(palette ? "img-palette" : "img-dominant"); setImg(await loadImg(f)); }} />}
    {img && <><div className="grid grid-cols-3 sm:grid-cols-6 gap-3">{colors.map((c) => <Swatch key={c} c={c} />)}</div>
      {palette && <button onClick={() => { const cv = document.createElement("canvas"); cv.width = colors.length * 200; cv.height = 200; const ctx = cv.getContext("2d")!; colors.forEach((c, i) => { ctx.fillStyle = c; ctx.fillRect(i * 200, 0, 200, 200); }); cv.toBlob(async (b) => { if (b) { const { saveBlob } = await import("@/lib/save-file"); await saveBlob(b, "palette.png"); } }); }} className="qx-btn !py-2 text-xs"><FiDownload size={13} /> Download swatches</button>}
      <button onClick={() => setImg(null)} className="qx-btn-ghost !py-2 text-xs">New image</button></>}
  </div>;
}

export function GradientClient() {
  const [c1, setC1] = useState("#e1ff04"); const [c2, setC2] = useState("#bba9ff"); const [angle, setAngle] = useState(135);
  const css = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
  const [ok, setOk] = useState(false);
  async function dl() { const cv = document.createElement("canvas"); cv.width = 1920; cv.height = 1080; const ctx = cv.getContext("2d")!; const rad = angle * Math.PI / 180; const x = Math.cos(rad), y = Math.sin(rad); const g = ctx.createLinearGradient(960 - x * 960, 540 - y * 540, 960 + x * 960, 540 + y * 540); g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.fillRect(0, 0, 1920, 1080); cv.toBlob(async (b) => { if (b) { const { saveBlob } = await import("@/lib/save-file"); await saveBlob(b, "gradient.png"); } }); trackTool("img-gradient"); }
  return <div className="qx-card p-6 space-y-5">
    <div className="rounded-2xl h-56" style={{ background: css, border: "1px solid var(--border)" }} />
    <div className="flex flex-wrap items-center gap-4">
      <input type="color" value={c1} onChange={(e) => setC1(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
      <input type="color" value={c2} onChange={(e) => setC2(e.target.value)} className="w-10 h-10 rounded cursor-pointer" />
      <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Angle <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(Number(e.target.value))} className="w-40 accent-[#e1ff04]" /> {angle}°</label>
    </div>
    <div className="flex gap-2 items-center">
      <code className="text-[12px] px-3 py-2 rounded-lg font-mono flex-1 truncate" style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>{`background: ${css};`}</code>
      <button onClick={() => { navigator.clipboard.writeText(`background: ${css};`); setOk(true); setTimeout(() => setOk(false), 1200); }} className="qx-btn !py-2 text-xs">{ok ? <FiCheck size={13} /> : <FiCopy size={13} />} CSS</button>
      <button onClick={dl} className="qx-btn-hero !py-2 !px-4 text-xs" data-magnetic><FiDownload size={13} /> PNG</button>
    </div>
  </div>;
}

export function HistogramClient() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!img || !ref.current) return;
    const c = document.createElement("canvas"); const s = 300; const sc = Math.min(1, s / Math.max(img.width, img.height)); c.width = img.width * sc; c.height = img.height * sc;
    const d = c.getContext("2d")!; d.drawImage(img, 0, 0, c.width, c.height); const px = d.getImageData(0, 0, c.width, c.height).data;
    const R = new Array(256).fill(0), Gc = new Array(256).fill(0), B = new Array(256).fill(0), L = new Array(256).fill(0);
    for (let i = 0; i < px.length; i += 4) { R[px[i]]++; Gc[px[i + 1]]++; B[px[i + 2]]++; L[Math.round(0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2])]++; }
    const v = ref.current; v.width = 512; v.height = 240; const ctx = v.getContext("2d")!; ctx.fillStyle = "#0a0a12"; ctx.fillRect(0, 0, 512, 240);
    const max = Math.max(...R, ...Gc, ...B); const plot = (arr: number[], color: string) => { ctx.strokeStyle = color; ctx.globalAlpha = 0.8; ctx.beginPath(); arr.forEach((n, i) => { const x = i * 2, y = 240 - (n / max) * 235; if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }); ctx.stroke(); };
    plot(R, "#f87171"); plot(Gc, "#4ade80"); plot(B, "#60a5fa"); ctx.globalAlpha = 0.5; plot(L, "#e5e7eb");
  }, [img]);
  return <div className="qx-card p-6 space-y-5">
    {!img && <AiDropzone onFile={async (f) => { trackTool("img-histogram"); setImg(await loadImg(f)); }} />}
    {img && <><canvas ref={ref} className="w-full max-w-lg rounded-2xl" style={{ border: "1px solid var(--border)" }} /><p className="text-[12px]" style={{ color: "var(--text-muted)" }}><b style={{ color: "#f87171" }}>Red</b> · <b style={{ color: "#4ade80" }}>Green</b> · <b style={{ color: "#60a5fa" }}>Blue</b> · <b style={{ color: "var(--text)" }}>Luminance</b></p><button onClick={() => setImg(null)} className="qx-btn-ghost !py-2 text-xs">New image</button></>}
  </div>;
}
