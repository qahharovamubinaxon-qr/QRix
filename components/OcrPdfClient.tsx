"use client";

import { useState } from "react";
import { FiEye, FiDownload, FiCopy, FiCheck } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { saveBlob } from "@/lib/save-file";

const LANGS = [
  { code: "eng", label: "English" },
  { code: "rus", label: "Русский" },
  { code: "uzb", label: "Oʻzbek" },
];

export default function OcrPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [lang, setLang] = useState("eng");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  async function run() {
    if (!file) return;
    setBusy(true);
    setText("");
    setStatus("Loading OCR engine…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
      const Tesseract = await import("tesseract.js");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const worker = await (Tesseract as any).createWorker(lang);

      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
      let out = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        setStatus(`Recognizing page ${i} of ${pdf.numPages}…`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvas, canvasContext: ctx, viewport }).promise;
        const { data } = await worker.recognize(canvas);
        out += `\n\n───── Page ${i} ─────\n${(data.text || "").trim()}`;
      }
      await worker.terminate();
      setText(out.trim() || "(No text recognized.)");
      setStatus("Done ✓");
    } catch (e) {
      setStatus("");
      setText("Error: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function download() {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    saveBlob(blob, (file?.name.replace(/\.pdf$/i, "") || "ocr") + ".txt");
  }
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />

      <div className="mt-4">
        <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }}>Document language</label>
        <div className="grid grid-cols-3 gap-2">
          {LANGS.map((l) => (
            <button key={l.code} onClick={() => setLang(l.code)}
              className="py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: lang === l.code ? "#F58F20" : "var(--surface-2)", color: lang === l.code ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${lang === l.code ? "transparent" : "var(--border)"}` }}>
              {l.label}
            </button>
          ))}
        </div>
      </div>

      <button onClick={run} disabled={!file || busy} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {busy ? "Recognizing…" : <><FiEye size={15} /> Run OCR</>}
      </button>
      {busy && <p className="text-[12px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>{status}</p>}
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>
        OCR runs fully in your browser. The first run downloads the language model (~a few MB), so it may take a moment.
      </p>

      {text && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold" style={{ color: "var(--text)" }}>Recognized text</span>
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
