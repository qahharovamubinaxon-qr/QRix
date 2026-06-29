"use client";

import { useState } from "react";
import { FiMinimize2, FiCheck } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

const LEVELS: { id: string; label: string }[] = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Medium" },
  { id: "high", label: "High" },
];

export default function CompressPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [level, setLevel] = useState("medium");
  const [result, setResult] = useState<{ originalSize: number; compressedSize: number; savedPercent: number } | null>(null);

  const toMB = (b: number) => (b / 1024 / 1024).toFixed(2);

  async function compressPdf() {
    if (!file) return;
    const outName = file.name.replace(/\.pdf$/i, "") + "-compressed.pdf";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("level", level);
      const res = await fetch("/api/pdf/compress", { method: "POST", body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.message || "Compression failed"); }
      const blob = await res.blob();
      const originalSize = Number(res.headers.get("X-Original-Size") || file.size);
      const compressedSize = Number(res.headers.get("X-Compressed-Size") || blob.size);
      const savedPercent = Number(res.headers.get("X-Saved-Percent") || 0);
      setLoading(false);
      await finishSave(target, blob, outName);
      setResult({ originalSize, compressedSize, savedPercent });
    } catch (e) {
      setLoading(false);
      alert("Compression failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={(f) => { setFile(f); setResult(null); }} accept=".pdf" />

      <div className="mt-4">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Compression level</div>
        <div className="grid grid-cols-3 gap-2">
          {LEVELS.map((l) => (
            <button key={l.id} onClick={() => setLevel(l.id)} className="py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: level === l.id ? "#F58F20" : "var(--surface-2)", color: level === l.id ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${level === l.id ? "transparent" : "var(--border)"}` }}>{l.label}</button>
          ))}
        </div>
      </div>

      {file && <div className="mt-3 text-[12px]" style={{ color: "var(--text-muted)" }}>Original size: <b style={{ color: "var(--text)" }}>{toMB(file.size)} MB</b></div>}

      <button onClick={compressPdf} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? "Compressing…" : <><FiMinimize2 size={15} /> Compress PDF</>}
      </button>

      {result && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(70,116,52,0.1)", border: "1px solid rgba(70,116,52,0.3)" }}>
          <div className="text-[13px] font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--success)" }}><FiCheck size={13} /> Compressed</div>
          <div className="text-[12px] space-y-1" style={{ color: "var(--text-muted)" }}>
            <div className="flex justify-between"><span>Original</span><b style={{ color: "var(--text)" }}>{toMB(result.originalSize)} MB</b></div>
            <div className="flex justify-between"><span>Compressed</span><b style={{ color: "var(--text)" }}>{toMB(result.compressedSize)} MB</b></div>
            <div className="flex justify-between"><span>Saved</span><b style={{ color: "var(--primary-bright)" }}>{result.savedPercent > 0 ? `${result.savedPercent}% smaller` : "Already optimized"}</b></div>
          </div>
        </div>
      )}
    </div>
  );
}
