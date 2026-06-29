"use client";

import { useState } from "react";
import { FiScissors } from "react-icons/fi";
import { PDFDocument } from "pdf-lib";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

export default function SplitPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFile(f: File | null) {
    setFile(f);
    setPageCount(null);
    if (!f) return;
    try {
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch { setPageCount(null); }
  }

  async function splitPdf() {
    if (!file) return;
    const src = await PDFDocument.load(await file.arrayBuffer());
    const nums = pages.split(",").map((p) => parseInt(p.trim())).filter((p) => !isNaN(p) && p > 0 && p <= src.getPageCount());
    if (!nums.length) { alert("Enter valid page numbers, e.g. 1,3,5"); return; }
    const outName = file.name.replace(/\.pdf$/i, "") + "-pages.pdf";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setLoading(true);
    try {
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, nums.map((p) => p - 1));
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      setLoading(false);
      await finishSave(target, new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), outName);
    } catch (e) {
      setLoading(false);
      alert("Split failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={onFile} accept=".pdf" />

      {file && (
        <div className="mt-4 flex items-center gap-4 text-[12px]" style={{ color: "var(--text-muted)" }}>
          {pageCount !== null && <span><b style={{ color: "var(--text)" }}>{pageCount}</b> pages</span>}
          <span><b style={{ color: "var(--text)" }}>{(file.size / 1024 / 1024).toFixed(2)}</b> MB</span>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text)" }}>Pages to extract</label>
        <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="e.g. 1,3,5,8" className="qx-auth-input" />
        <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>Comma-separated page numbers.</p>
      </div>

      <button onClick={splitPdf} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? "Splitting…" : <><FiScissors size={15} /> Split PDF</>}
      </button>
    </div>
  );
}
