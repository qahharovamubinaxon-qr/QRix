"use client";

import { useState } from "react";
import { loadPdfLib } from "@/lib/pdf-lib-loader";
import { addRecentFile, bumpPdfStats } from "@/lib/pdf-stats";
import { FiUpload, FiDownload, FiArrowUp, FiArrowDown, FiFile } from "react-icons/fi";

export default function ReorderPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [order, setOrder] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setDone(false);
    /* The page list is a preview — savePdf() is where a failure is reported. */
    try {
      const bytes = await f.arrayBuffer();
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.load(bytes);
      setOrder(Array.from({ length: pdf.getPageCount() }, (_, i) => i));
    } catch { setOrder([]); }
  }

  function move(idx: number, dir: -1 | 1) {
    setOrder((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function savePdf() {
    if (!file) return;
    setLoading(true);
    setDone(false);
    const start = Date.now();
    try {
      const bytes = await file.arrayBuffer();
      const { PDFDocument } = await loadPdfLib();
      const src = await PDFDocument.load(bytes);
      const out = await PDFDocument.create();
      const copied = await out.copyPages(src, order);
      copied.forEach((p) => out.addPage(p));

      const saved = await out.save();
      const ab = new ArrayBuffer(saved.byteLength);
      new Uint8Array(ab).set(saved);
      const blob = new Blob([ab], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = file.name.replace(/\.pdf$/i, "") + "-reordered.pdf";
      a.click();
      URL.revokeObjectURL(a.href);

      addRecentFile({ name: a.download, size: blob.size, tool: "Reorder Pages" });
      bumpPdfStats(blob.size, (Date.now() - start) / 1000);
      setDone(true);
    } catch (err) {
      console.error(err);
      alert("Error reordering PDF");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qx-card p-7 max-w-2xl">
      <label
        className="flex flex-col items-center justify-center gap-3 p-10 rounded-2xl cursor-pointer transition-colors"
        style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}
      >
        <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
        <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {file ? file.name : "Choose a PDF file"}
        </span>
        {order.length > 0 && (
          <span className="qx-badge"><FiFile size={11} /> {order.length} pages</span>
        )}
        <input type="file" accept="application/pdf" onChange={handleFile} className="hidden" />
      </label>

      {order.length > 0 && (
        <>
          <p className="mt-5 mb-3 text-xs" style={{ color: "var(--text-muted)" }}>
            Use the arrows to change page order, then download:
          </p>
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {order.map((pageIdx, pos) => (
              <div
                key={`${pageIdx}-${pos}`}
                className="flex items-center gap-3 p-3 rounded-xl"
                style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}
              >
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "var(--grad-primary)" }}
                >
                  {pos + 1}
                </span>
                <span className="text-sm flex-1" style={{ color: "var(--text)" }}>
                  Page {pageIdx + 1}
                  {pageIdx !== pos && (
                    <span className="text-[10px] ml-2" style={{ color: "var(--text-faint)" }}>
                      (was #{pageIdx + 1})
                    </span>
                  )}
                </span>
                <button onClick={() => move(pos, -1)} disabled={pos === 0}
                  className="qx-btn-ghost !p-2 disabled:opacity-30" aria-label="Up">
                  <FiArrowUp size={14} />
                </button>
                <button onClick={() => move(pos, 1)} disabled={pos === order.length - 1}
                  className="qx-btn-ghost !p-2 disabled:opacity-30" aria-label="Down">
                  <FiArrowDown size={14} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={savePdf} disabled={loading} className="qx-btn w-full mt-6 !py-3.5 disabled:opacity-60">
            <FiDownload size={15} /> {loading ? "Saving..." : "Save & Download"}
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
