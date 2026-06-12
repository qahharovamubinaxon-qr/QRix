"use client";

import { useState } from "react";
import { PDFDocument, degrees } from "pdf-lib";
import { addRecentFile, bumpPdfStats } from "@/lib/pdf-stats";
import { FiUpload, FiRotateCw, FiDownload, FiFile } from "react-icons/fi";

export default function RotatePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [angle, setAngle] = useState<90 | 180 | 270>(90);
  const [pages, setPages] = useState(""); // бўш = ҳамма саҳифа
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    const bytes = await f.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    setPageCount(pdf.getPageCount());
  }

  async function rotatePdf() {
    if (!file) return;
    setLoading(true);
    setDone(false);
    const start = Date.now();
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const total = pdf.getPageCount();

      // Қайси саҳифалар: бўш бўлса ҳаммаси
      let targets: number[];
      if (pages.trim()) {
        targets = pages
          .split(",")
          .map((p) => parseInt(p.trim(), 10) - 1)
          .filter((n) => !isNaN(n) && n >= 0 && n < total);
      } else {
        targets = Array.from({ length: total }, (_, i) => i);
      }

      for (const idx of targets) {
        const page = pdf.getPage(idx);
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + angle) % 360));
      }

      const out = await pdf.save();
      const ab = new ArrayBuffer(out.byteLength);
      new Uint8Array(ab).set(out);
      const blob = new Blob([ab], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "") + "-rotated.pdf";
      a.click();
      URL.revokeObjectURL(a.href);

      addRecentFile({ name: a.download, size: blob.size, tool: "Rotate PDF" });
      bumpPdfStats(blob.size, (Date.now() - start) / 1000);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Error rotating PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qx-card p-7 max-w-2xl">
      {/* Upload */}
      <label
        className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl cursor-pointer transition-colors"
        style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}
      >
        <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {file ? file.name : "Choose a PDF file"}
        </span>
        {pageCount !== null && (
          <span className="qx-badge"><FiFile size={11} /> {pageCount} pages</span>
        )}
        <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
      </label>

      {file && (
        <>
          {/* Angle */}
          <div className="mt-6">
            <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>
              Rotation angle
            </label>
            <div className="grid grid-cols-3 gap-2">
              {([90, 180, 270] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => setAngle(a)}
                  className="py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                  style={{
                    background: angle === a ? "var(--grad-primary)" : "var(--surface-hover)",
                    color: angle === a ? "#fff" : "var(--text-muted)",
                    border: `1px solid ${angle === a ? "transparent" : "var(--border)"}`,
                  }}
                >
                  <FiRotateCw size={14} /> {a}°
                </button>
              ))}
            </div>
          </div>

          {/* Pages */}
          <div className="mt-5">
            <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>
              Pages (e.g. 1,3,5) — leave empty for all pages
            </label>
            <input
              value={pages}
              onChange={(e) => setPages(e.target.value)}
              placeholder="All pages"
              className="w-full px-4 py-3 text-sm"
            />
          </div>

          <button onClick={rotatePdf} disabled={loading} className="qx-btn w-full mt-6 !py-3.5 disabled:opacity-60">
            <FiDownload size={15} /> {loading ? "Rotating..." : "Rotate & Download"}
          </button>

          {done && (
            <p className="mt-3 text-center text-sm font-semibold" style={{ color: "var(--success)" }}>
              ✓ Done! File downloaded.
            </p>
          )}
        </>
      )}
    </div>
  );
}
