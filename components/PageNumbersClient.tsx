"use client";

import { useState } from "react";
import { loadPdfLib } from "@/lib/pdf-lib-loader";
import { addRecentFile, bumpPdfStats } from "@/lib/pdf-stats";
import { FiUpload, FiDownload, FiFile, FiHash } from "react-icons/fi";

const POSITIONS = [
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-right", label: "Bottom Right" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "top-center", label: "Top Center" },
  { id: "top-right", label: "Top Right" },
];

export default function PageNumbersClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [position, setPosition] = useState("bottom-center");
  const [fmt, setFmt] = useState("n"); // n  |  n/total  |  Page n
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    /* The count is a preview, not the job — a corrupt file or a dropped chunk
       must not throw here, run() reports failures. */
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch { setPageCount(null); }
  }

  async function run() {
    if (!file) return;
    setLoading(true);
    setDone(false);
    const start = Date.now();
    try {
      const { PDFDocument, StandardFonts, rgb } = await loadPdfLib();
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();
      const total = pages.length;

      pages.forEach((page, i) => {
        const n = i + 1;
        let text = String(n);
        if (fmt === "n/total") text = `${n} / ${total}`;
        else if (fmt === "Page n") text = `Page ${n}`;

        const { width, height } = page.getSize();
        const fontSize = 11;
        const tw = font.widthOfTextAtSize(text, fontSize);
        const margin = 28;

        let x = width / 2 - tw / 2;
        let y = margin;
        if (position.includes("right")) x = width - tw - margin;
        if (position.includes("left")) x = margin;
        if (position.includes("top")) y = height - margin;

        page.drawText(text, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.35) });
      });

      const out = await pdf.save();
      const ab = new ArrayBuffer(out.byteLength);
      new Uint8Array(ab).set(out);
      const blob = new Blob([ab], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "") + "-numbered.pdf";
      a.click();
      URL.revokeObjectURL(a.href);

      addRecentFile({ name: a.download, size: blob.size, tool: "Page Numbers" });
      bumpPdfStats(blob.size, (Date.now() - start) / 1000);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Error adding page numbers");
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
        {pageCount !== null && <span className="qx-badge"><FiFile size={11} /> {pageCount} pages</span>}
        <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
      </label>

      {file && (
        <>
          <div className="mt-6">
            <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>Position</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {POSITIONS.map((p) => (
                <button key={p.id} onClick={() => setPosition(p.id)}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: position === p.id ? "var(--grad-primary)" : "var(--surface-hover)", color: position === p.id ? "#fff" : "var(--text-muted)", border: `1px solid ${position === p.id ? "transparent" : "var(--border)"}` }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>Format</label>
            <div className="grid grid-cols-3 gap-2">
              {[["n", "1, 2, 3"], ["n/total", "1 / 10"], ["Page n", "Page 1"]].map(([v, lbl]) => (
                <button key={v} onClick={() => setFmt(v)}
                  className="py-2.5 rounded-xl text-xs font-bold transition-all"
                  style={{ background: fmt === v ? "var(--grad-primary)" : "var(--surface-hover)", color: fmt === v ? "#fff" : "var(--text-muted)", border: `1px solid ${fmt === v ? "transparent" : "var(--border)"}` }}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>

          <button onClick={run} disabled={loading} className="qx-btn w-full mt-6 !py-3.5 disabled:opacity-60">
            <FiHash size={15} /> {loading ? "Processing..." : "Add Page Numbers & Download"}
          </button>
          {done && <p className="mt-3 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>✓ Done! File downloaded.</p>}
        </>
      )}
    </div>
  );
}
