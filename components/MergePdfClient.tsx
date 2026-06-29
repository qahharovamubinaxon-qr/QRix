"use client";

import { useState } from "react";
import { FiUploadCloud, FiFilePlus, FiLayers } from "react-icons/fi";
import { PDFDocument } from "pdf-lib";
import ReorderGrid, { type ReorderItem } from "@/components/ReorderGrid";
import { pickSave, finishSave } from "@/lib/save-file";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Pdf = ReorderItem & { file: File };

export default function MergePdfClient() {
  const [pdfs, setPdfs] = useState<Pdf[]>([]);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  async function firstPageThumb(file: File): Promise<string> {
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), verbosity: 0 }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width; canvas.height = viewport.height;
      await page.render({ canvasContext: canvas.getContext("2d")!, viewport }).promise;
      return canvas.toDataURL("image/jpeg", 0.7);
    } catch { return ""; }
  }

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.name.toLowerCase().endsWith(".pdf"));
    const next: Pdf[] = [];
    for (const f of list) {
      const thumb = await firstPageThumb(f);
      next.push({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`, file: f, thumb, label: f.name });
    }
    setPdfs((prev) => [...prev, ...next]);
  }

  async function merge() {
    if (pdfs.length < 2) { alert("Add at least 2 PDFs."); return; }
    const target = await pickSave("merged.pdf");
    if (target.kind === "cancelled") return;
    setBusy(true);
    setProgress("Merging…");
    try {
      const out = await PDFDocument.create();
      for (const it of pdfs) {
        const src = await PDFDocument.load(await it.file.arrayBuffer());
        const copied = await out.copyPages(src, src.getPageIndices());
        copied.forEach((p) => out.addPage(p));
      }
      const bytes = await out.save();
      setBusy(false); setProgress("");
      await finishSave(target, new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "merged.pdf");
    } catch (e) {
      setBusy(false); setProgress("");
      alert("Merge failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        <div>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="block rounded-2xl p-6 text-center cursor-pointer"
            style={{ border: "2px dashed var(--border-strong)" }}>
            <input type="file" accept=".pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <span className="w-11 h-11 rounded-xl inline-flex items-center justify-center mb-2" style={{ background: "var(--surface-hover)", color: "var(--primary-bright)" }}><FiUploadCloud size={20} /></span>
            <p className="text-sm" style={{ color: "var(--text)" }}>Drop PDFs or <span className="font-bold" style={{ color: "var(--primary-bright)" }}>browse</span></p>
            <p className="text-[11px] mt-1" style={{ color: "var(--text-faint)" }}>2 or more PDF files</p>
          </label>

          <label className="qx-btn-ghost !text-xs cursor-pointer w-full mt-3 justify-center">
            <FiFilePlus size={13} /> Add more
            <input type="file" accept=".pdf" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>

          <button onClick={merge} disabled={pdfs.length < 2 || busy} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
            {busy ? "Merging…" : <><FiLayers size={15} /> Merge PDF</>}
          </button>
          {progress && <p className="text-[12px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>{progress}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-bold" style={{ color: "var(--text)" }}>Files <span style={{ color: "var(--primary-bright)" }}>({pdfs.length})</span></span>
            {pdfs.length > 0 && <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>↔ drag to set merge order</span>}
          </div>
          {pdfs.length === 0 ? (
            <div className="rounded-2xl flex items-center justify-center text-sm" style={{ minHeight: 220, border: "1px solid var(--border)", color: "var(--text-faint)" }}>No PDFs yet</div>
          ) : (
            <ReorderGrid items={pdfs} onChange={(it) => setPdfs(it as Pdf[])} />
          )}
        </div>
      </div>
    </div>
  );
}
