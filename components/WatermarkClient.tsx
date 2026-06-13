"use client";

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
import { addRecentFile, bumpPdfStats } from "@/lib/pdf-stats";
import { FiUpload, FiDownload, FiFile, FiDroplet } from "react-icons/fi";

export default function WatermarkClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [text, setText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState(20);
  const [diagonal, setDiagonal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    const pdf = await PDFDocument.load(await f.arrayBuffer());
    setPageCount(pdf.getPageCount());
  }

  async function run() {
    if (!file || !text.trim()) return;
    // Helvetica фақат лотин ҳарфларни қўллайди — кирилл/ўзбек ёзувини текширамиз
    if (/[^\x00-\xFF]/.test(text)) {
      alert("Watermark text supports Latin letters only (A-Z, 0-9). Please use Latin, e.g. CONFIDENTIAL, NAMUNA, MAXFIY.");
      return;
    }
    setLoading(true);
    setDone(false);
    const start = Date.now();
    try {
      const pdf = await PDFDocument.load(await file.arrayBuffer());
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const op = opacity / 100;

      for (const page of pdf.getPages()) {
        const { width, height } = page.getSize();
        const fontSize = Math.min(width, height) / 12;
        const tw = font.widthOfTextAtSize(text, fontSize);
        page.drawText(text, {
          x: width / 2 - (diagonal ? tw / 2.6 : tw / 2),
          y: height / 2 - (diagonal ? 0 : fontSize / 2),
          size: fontSize,
          font,
          color: rgb(0.5, 0.3, 0.85),
          opacity: op,
          rotate: diagonal ? degrees(45) : degrees(0),
        });
      }

      const out = await pdf.save();
      const ab = new ArrayBuffer(out.byteLength);
      new Uint8Array(ab).set(out);
      const blob = new Blob([ab], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "") + "-watermark.pdf";
      a.click();
      URL.revokeObjectURL(a.href);

      addRecentFile({ name: a.download, size: blob.size, tool: "Watermark" });
      bumpPdfStats(blob.size, (Date.now() - start) / 1000);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Error adding watermark. Try Latin text only (A-Z, 0-9).");
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
            <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Watermark text (Latin letters only)</label>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="CONFIDENTIAL"
              className="w-full px-4 py-3 text-sm rounded-xl" style={{ background: "var(--surface-hover)", border: "1.5px solid var(--border-strong)", color: "var(--text)" }} />
            <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>Use Latin text, e.g. CONFIDENTIAL, DRAFT, NAMUNA, MAXFIY</p>
          </div>

          <div className="mt-5">
            <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Opacity: {opacity}%</label>
            <input type="range" min={5} max={60} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-violet-500" />
          </div>

          <label className="flex items-center gap-2 text-xs cursor-pointer mt-4" style={{ color: "var(--text-muted)" }}>
            <input type="checkbox" checked={diagonal} onChange={(e) => setDiagonal(e.target.checked)} className="accent-violet-500" />
            Diagonal (45°) — recommended
          </label>

          <button onClick={run} disabled={loading} className="qx-btn w-full mt-6 !py-3.5 disabled:opacity-60">
            <FiDroplet size={15} /> {loading ? "Processing..." : "Add Watermark & Download"}
          </button>
          {done && <p className="mt-3 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>✓ Done! File downloaded.</p>}
        </>
      )}
    </div>
  );
}
