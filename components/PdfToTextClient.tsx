"use client";

import { useState } from "react";
import { FiUploadCloud, FiFileText, FiDownload, FiCopy, FiCheck } from "react-icons/fi";
import { saveBlob } from "@/lib/save-file";
import { toolUI, type ToolLang } from "@/lib/tool-ui-i18n";

export default function PdfToTextClient() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!file) return;
    setBusy(true);
    setText("");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes }).promise;
      let out = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const tc = await page.getTextContent();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const strs = tc.items.map((it: any) => ("str" in it ? it.str : "")).join(" ");
        out += `\n\n───── Page ${i} ─────\n${strs}`;
      }
      const cleaned = out.trim();
      setText(cleaned || "(No selectable text found — this PDF is likely scanned. Try the OCR PDF tool instead.)");
    } catch (e) {
      setText("Error: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveBlob(blob, (file?.name.replace(/\.pdf$/i, "") || "extracted") + ".txt");
  }

  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />
      <button onClick={run} disabled={!file || busy} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {busy ? "Extracting…" : <><FiFileText size={15} /> Extract text</>}
      </button>

      {text && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Extracted text</span>
            <div className="flex gap-2">
              <button onClick={copy} className="qx-btn-ghost !text-xs !py-1.5">{copied ? <FiCheck size={12} /> : <FiCopy size={12} />} Copy</button>
              <button onClick={download} className="qx-btn !text-xs !py-1.5"><FiDownload size={12} /> .txt</button>
            </div>
          </div>
          <textarea readOnly value={text} rows={12} className="qx-auth-input font-mono !text-[12px]" style={{ resize: "vertical" }} />
        </div>
      )}
    </div>
  );
}

export function UploadBox({ file, setFile, accept, lang = "en" }: { file: File | null; setFile: (f: File | null) => void; accept: string; lang?: ToolLang }) {
  const [drag, setDrag] = useState(false);
  const t = toolUI(lang).common;
  return (
    <label
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) setFile(f); }}
      className="block rounded-2xl p-8 text-center cursor-pointer transition-all"
      style={{ border: `2px dashed ${drag ? "var(--primary)" : "var(--border-strong)"}`, background: drag ? "var(--surface-hover)" : "transparent" }}
    >
      <input type="file" accept={accept} className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <span className="w-12 h-12 rounded-xl inline-flex items-center justify-center mb-3" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--primary-bright)" }}>
        <FiUploadCloud size={20} />
      </span>
      <p className="text-sm" style={{ color: "var(--text)" }}>
        {file ? <><b style={{ color: "var(--primary-bright)" }}>{file.name}</b> {t.selectedSuffix}</> : <>{t.dropFileOr} <span className="font-bold" style={{ color: "var(--primary-bright)" }}>{t.browse}</span></>}
      </p>
    </label>
  );
}
