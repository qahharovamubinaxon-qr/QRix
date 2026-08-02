"use client";

import { useState } from "react";
import { FiCrop } from "react-icons/fi";
import { loadPdfLib, warmPdfLib } from "@/lib/pdf-lib-loader";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

export default function CropPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(8); // % trimmed from each side

  async function run() {
    if (!file) return;
    const outName = (file.name.replace(/\.pdf$/i, "") || "cropped") + "-cropped.pdf";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setBusy(true);
    try {
      const { PDFDocument } = await loadPdfLib();
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
      await finishSave(target, new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), outName);
    } catch (e) {
      alert("Crop failed: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={(f: File | null) => { if (f) warmPdfLib(); setFile(f); }} accept=".pdf" />

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
