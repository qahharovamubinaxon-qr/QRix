"use client";

import { useState } from "react";
import { loadPdfLib } from "@/lib/pdf-lib-loader";
import { addRecentFile, bumpPdfStats } from "@/lib/pdf-stats";
import { FiUpload, FiDownload, FiFile } from "react-icons/fi";

// Парсинг: "1,3,5-8" → [0,2,4,5,6,7] (0-indexed)
function parsePages(input: string, total: number): number[] {
  const set = new Set<number>();
  for (const part of input.split(",")) {
    const p = part.trim();
    if (!p) continue;
    if (p.includes("-")) {
      const [a, b] = p.split("-").map((x) => parseInt(x.trim(), 10));
      if (!isNaN(a) && !isNaN(b)) for (let i = a; i <= b; i++) if (i >= 1 && i <= total) set.add(i - 1);
    } else {
      const n = parseInt(p, 10);
      if (!isNaN(n) && n >= 1 && n <= total) set.add(n - 1);
    }
  }
  return [...set].sort((a, b) => a - b);
}

export default function PageSelectClient({ mode }: { mode: "delete" | "extract" }) {
  const [file, setFile] = useState<File | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    /* Preview count only — run() is where a failure has to be reported. */
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      setTotal(pdf.getPageCount());
    } catch { setTotal(null); }
  }

  async function run() {
    if (!file || !total) return;
    const selected = parsePages(pages, total);
    if (selected.length === 0) { alert("Enter valid page numbers, e.g. 1,3,5-8"); return; }

    setLoading(true);
    setDone(false);
    const start = Date.now();
    try {
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(await file.arrayBuffer());
      const out = await PDFDocument.create();

      // delete → ҳаммасидан танланганларни олиб ташлаймиз; extract → фақат танланганлар
      const keep = mode === "extract"
        ? selected
        : Array.from({ length: total }, (_, i) => i).filter((i) => !selected.includes(i));

      if (keep.length === 0) { alert("Result would be empty — adjust your selection."); setLoading(false); return; }

      const copied = await out.copyPages(src, keep);
      copied.forEach((p) => out.addPage(p));

      const saved = await out.save();
      const ab = new ArrayBuffer(saved.byteLength);
      new Uint8Array(ab).set(saved);
      const blob = new Blob([ab], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "") + (mode === "extract" ? "-extracted.pdf" : "-deleted.pdf");
      a.click();
      URL.revokeObjectURL(a.href);

      addRecentFile({ name: a.download, size: blob.size, tool: mode === "extract" ? "Extract Pages" : "Delete Pages" });
      bumpPdfStats(blob.size, (Date.now() - start) / 1000);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Error processing PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qx-card p-7 max-w-2xl">
      <label className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl cursor-pointer"
        style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}>
        <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>{file ? file.name : "Choose a PDF file"}</span>
        {total !== null && <span className="qx-badge"><FiFile size={11} /> {total} pages</span>}
        <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
      </label>

      {file && (
        <>
          <div className="mt-6">
            <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>
              {mode === "extract" ? "Pages to extract" : "Pages to delete"} (e.g. 1,3,5-8)
            </label>
            <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder="1, 3, 5-8"
              className="w-full px-4 py-3 text-sm rounded-xl" style={{ background: "var(--surface-hover)", border: "1.5px solid var(--border-strong)", color: "var(--text)" }} />
            <p className="text-[11px] mt-2" style={{ color: "var(--text-faint)" }}>
              {mode === "extract"
                ? "Only these pages will be kept in the new PDF."
                : "These pages will be removed; the rest will be kept."}
            </p>
          </div>

          <button onClick={run} disabled={loading} className="qx-btn w-full mt-6 !py-3.5 disabled:opacity-60">
            <FiDownload size={15} /> {loading ? "Processing..." : mode === "extract" ? "Extract & Download" : "Delete & Download"}
          </button>
          {done && <p className="mt-3 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>✓ Done! File downloaded.</p>}
        </>
      )}
    </div>
  );
}
