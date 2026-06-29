"use client";

import { useState } from "react";
import { FiCrop } from "react-icons/fi";
import { PDFDocument } from "pdf-lib";
import { UploadBox } from "@/components/PdfToTextClient";

export default function CropPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(8); // % trimmed from each side

  async function run() {
    if (!file) return;
    setBusy(true);
    try {
      const src = await PDFDocument.load(await file.arrayBuffer());
      const f = Math.min(40, Math.max(0, pct)) / 100;
      for (const p of src.getPages()) {
        const w = p.getWidth();
        const h = p.getHeight();
        const mx = w * f;
        const my = h * f;
        p.setCropBox(mx, my, w - 2 * mx, h - 2 * my);
      }
      const bytes = await src.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = (file.name.replace(/\.pdf$/i, "") || "cropped") + "-cropped.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert("Crop failed: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />

      <div className="mt-5">
        <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>
          Trim margins from each side: <span style={{ color: "var(--primary-bright)" }}>{pct}%</span>
        </label>
        <input type="range" min={0} max={30} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="w-full accent-orange-500" />
        <div className="mt-3 mx-auto relative" style={{ width: 120, height: 150, background: "var(--surface-2)", border: "1px solid var(--border)", borderRadius: 6 }}>
          <div className="absolute" style={{ inset: `${pct * 1.5}%`, border: "2px dashed #F58F20", borderRadius: 3 }} />
        </div>
      </div>

      <button onClick={run} disabled={!file || busy} className="qx-btn-hero w-full mt-5 disabled:opacity-50">
        {busy ? "Cropping…" : <><FiCrop size={15} /> Crop PDF</>}
      </button>
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>Trims equal margins from all four sides of every page (visible crop box).</p>
    </div>
  );
}
