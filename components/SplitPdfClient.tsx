"use client";

import { useState } from "react";
import { FiScissors } from "react-icons/fi";
import { loadPdfLib } from "@/lib/pdf-lib-loader";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";
import { toolUI, type ToolLang } from "@/lib/tool-ui-i18n";

export default function SplitPdfClient({ lang = "en" }: { lang?: ToolLang }) {
  const t = toolUI(lang);
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pages, setPages] = useState("");
  const [loading, setLoading] = useState(false);

  async function onFile(f: File | null) {
    setFile(f);
    setPageCount(null);
    if (!f) return;
    try {
      const { PDFDocument } = await loadPdfLib();
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      setPageCount(pdf.getPageCount());
    } catch { setPageCount(null); }
  }

  async function splitPdf() {
    if (!file) return;
    /* This load runs before the save picker, outside the try below, so the
       loader gets its own guard — a dropped chunk must not be an unhandled
       rejection on a button press. */
    const lib = await loadPdfLib().catch(() => null);
    if (!lib) { alert(t.split.engineFailed); return; }
    const src = await lib.PDFDocument.load(await file.arrayBuffer());
    const nums = pages.split(",").map((p) => parseInt(p.trim())).filter((p) => !isNaN(p) && p > 0 && p <= src.getPageCount());
    if (!nums.length) { alert(t.split.invalidPages); return; }
    const outName = file.name.replace(/\.pdf$/i, "") + "-pages.pdf";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setLoading(true);
    try {
      const out = await lib.PDFDocument.create();
      const copied = await out.copyPages(src, nums.map((p) => p - 1));
      copied.forEach((p) => out.addPage(p));
      const bytes = await out.save();
      setLoading(false);
      await finishSave(target, new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), outName);
    } catch (e) {
      setLoading(false);
      alert(t.split.failed + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={onFile} accept=".pdf" />

      {file && (
        <div className="mt-4 flex items-center gap-4 text-[12px]" style={{ color: "var(--text-muted)" }}>
          {pageCount !== null && <span><b style={{ color: "var(--text)" }}>{pageCount}</b> {t.split.pagesCount}</span>}
          <span><b style={{ color: "var(--text)" }}>{(file.size / 1024 / 1024).toFixed(2)}</b> MB</span>
        </div>
      )}

      <div className="mt-4">
        <label className="block text-xs font-bold mb-1.5" style={{ color: "var(--text)" }}>{t.split.pagesLabel}</label>
        <input value={pages} onChange={(e) => setPages(e.target.value)} placeholder={t.split.pagesPlaceholder} className="qx-auth-input" />
        <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>{t.split.pagesHint}</p>
      </div>

      <button onClick={splitPdf} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? t.split.splitting : <><FiScissors size={15} /> {t.split.splitBtn}</>}
      </button>
    </div>
  );
}
