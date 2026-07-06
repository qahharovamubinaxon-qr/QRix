"use client";

/* Batch engine: convert | resize | compress | rename. Queue + progress + ZIP. */

import { useState } from "react";
import { FiX, FiDownload } from "react-icons/fi";
import { AiDropzone } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

type Job = { file: File; url: string };
function loadImg(src: string): Promise<HTMLImageElement> { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; }); }

export default function ImageBatchClient({ preset }: { preset: "convert" | "resize" | "compress" | "rename" }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(0);
  const [fmt, setFmt] = useState<"jpeg" | "png" | "webp">("webp");
  const [quality, setQuality] = useState(80);
  const [maxDim, setMaxDim] = useState(1280);
  const [pattern, setPattern] = useState("image-###");

  function add(f: File) { setJobs((j) => [...j, { file: f, url: URL.createObjectURL(f) }]); }

  async function process() {
    if (!jobs.length) return;
    setBusy(true); setDone(0);
    trackTool(`img-batch-${preset}`, { count: jobs.length });
    const { default: JSZip } = await import("jszip"); const zip = new JSZip();
    const ext = fmt === "jpeg" ? "jpg" : fmt;
    for (let k = 0; k < jobs.length; k++) {
      const j = jobs[k];
      if (preset === "rename") { zip.file(pattern.replace(/#+/, (m) => String(k + 1).padStart(m.length, "0")) + "." + (j.file.name.split(".").pop() || "png"), j.file); }
      else {
        const img = await loadImg(j.url); let w = img.width, h = img.height;
        if (preset === "resize" && Math.max(w, h) > maxDim) { const s = maxDim / Math.max(w, h); w = Math.round(w * s); h = Math.round(h * s); }
        const c = document.createElement("canvas"); c.width = w; c.height = h; const ctx = c.getContext("2d")!;
        if (fmt === "jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
        ctx.drawImage(img, 0, 0, w, h);
        const mime = preset === "compress" ? "image/jpeg" : `image/${fmt}`;
        const q = (preset === "compress" || fmt !== "png") ? quality / 100 : undefined;
        const b = await new Promise<Blob | null>((r) => c.toBlob(r, mime, q));
        if (b) zip.file(j.file.name.replace(/\.\w+$/, "") + "." + (preset === "compress" ? "jpg" : ext), b);
      }
      setDone(k + 1);
    }
    const zb = await zip.generateAsync({ type: "blob" });
    const { saveBlob } = await import("@/lib/save-file"); await saveBlob(zb, `batch-${preset}-${jobs.length}.zip`);
    setBusy(false);
  }

  return <div className="qx-card p-6 space-y-5">
    <AiDropzone onFile={add} hint="Add multiple images — processed on your device, downloaded as a ZIP" />
    {jobs.length > 0 && <>
      <div className="flex flex-wrap gap-2">{jobs.map((j, i) => <div key={i} className="relative"><img src={j.url} alt="" className="w-14 h-14 object-cover rounded-lg" style={{ border: "1px solid var(--border)" }} /><button onClick={() => setJobs((a) => a.filter((_, k) => k !== i))} className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "var(--danger)", color: "#fff" }}><FiX size={11} /></button></div>)}</div>
      <div className="flex flex-wrap items-center gap-4">
        {preset === "convert" && <div className="flex gap-2">{(["jpeg", "png", "webp"] as const).map((f) => <button key={f} onClick={() => setFmt(f)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold uppercase" style={{ background: fmt === f ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${fmt === f ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{f === "jpeg" ? "jpg" : f}</button>)}</div>}
        {preset === "resize" && <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Max dimension <input type="number" value={maxDim} onChange={(e) => setMaxDim(+e.target.value)} className="qx-auth-input !py-1 !px-2 w-24" /> px</label>}
        {(preset === "convert" || preset === "compress") && fmt !== "png" && <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Quality <input type="range" min={30} max={100} value={quality} onChange={(e) => setQuality(+e.target.value)} className="w-32 accent-[#e1ff04]" /> {quality}</label>}
        {preset === "rename" && <label className="flex items-center gap-2 text-[12px] font-bold" style={{ color: "var(--text-faint)" }}>Pattern <input value={pattern} onChange={(e) => setPattern(e.target.value)} className="qx-auth-input !py-1.5 !px-2 w-40" placeholder="photo-###" /></label>}
        <button onClick={process} disabled={busy} className="qx-btn-hero !py-2.5 !px-5 text-sm disabled:opacity-50" data-magnetic><FiDownload size={14} /> {busy ? `Processing ${done}/${jobs.length}…` : `Process ${jobs.length} → ZIP`}</button>
      </div>
      {busy && <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}><div className="h-full rounded-full transition-all" style={{ width: `${(done / jobs.length) * 100}%`, background: "var(--grad-primary)" }} /></div>}
    </>}
  </div>;
}
