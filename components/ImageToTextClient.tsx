"use client";

import { useState, useRef } from "react";
import { FiUpload, FiCopy, FiDownload, FiImage, FiCheck, FiLoader } from "react-icons/fi";
import { toolUI, type ToolLang } from "@/lib/tool-ui-i18n";

/* Tesseract's recognition languages. These are endonyms — "Русский" is already
   Russian — so they are NOT translated; they name the alphabet being read, not
   the interface. Deliberately kept separate from the `lang` PROP, which is the
   UI locale: the two were easy to conflate, and the pre-M150 code had only
   this one, which is why the tool looked localized while its chrome was not. */
const OCR_LANGS = [
  { code: "eng", label: "English" },
  { code: "rus", label: "Русский" },
  { code: "uzb", label: "O'zbek" },
  { code: "eng+rus", label: "English + Русский" },
];

export default function ImageToTextClient({ lang = "en" }: { lang?: ToolLang }) {
  const t = toolUI(lang);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [ocrLang, setOcrLang] = useState("eng+rus");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setText("");
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const extract = async () => {
    if (!file) return;
    setBusy(true);
    setProgress(0);
    setText("");
    try {
      // Tesseract.js'ни динамик юклаймиз (фақат керак бўлганда)
      const Tesseract = (await import("tesseract.js")).default;
      const result = await Tesseract.recognize(file, ocrLang, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") setProgress(Math.round(m.progress * 100));
        },
      });
      setText(result.data.text.trim() || t.imageToText.noText);
    } catch (err) {
      console.error(err);
      setText(t.imageToText.error);
    } finally {
      setBusy(false);
      setProgress(100);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadTxt = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "extracted-text.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {/* Чап — расм */}
      <div className="qx-card p-6">
        <label
          className="flex flex-col items-center justify-center gap-3 p-8 rounded-2xl cursor-pointer transition-colors min-h-[260px]"
          style={{ border: "2px dashed var(--border-strong)", background: "var(--surface-hover)" }}
        >
          {preview ? (
            <img src={preview} alt="preview" className="max-h-64 rounded-xl object-contain" />
          ) : (
            <>
              <FiUpload size={28} style={{ color: "var(--primary-bright)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                {t.common.chooseImage}
              </span>
              <span className="text-xs" style={{ color: "var(--text-faint)" }}>
                {t.imageToText.hint}
              </span>
            </>
          )}
          <input type="file" accept="image/*" onChange={(e) => handleFile(e.target.files?.[0])} className="hidden" />
        </label>

        <div className="mt-5">
          <label className="block text-xs font-bold mb-2" style={{ color: "var(--text)" }} htmlFor="qx-ocr-lang">
            {t.imageToText.recogLang}
          </label>
          <select id="qx-ocr-lang" value={ocrLang} onChange={(e) => setOcrLang(e.target.value)} className="w-full px-4 py-3 text-sm" style={{ color: "var(--text)" }}>
            {OCR_LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <button onClick={extract} disabled={!file || busy} className="qx-btn w-full mt-5 !py-3.5 disabled:opacity-50">
          {busy ? (
            <><FiLoader size={15} className="animate-spin" /> {t.imageToText.extracting} {progress}%</>
          ) : (
            <><FiImage size={15} /> {t.imageToText.extractBtn}</>
          )}
        </button>

        {busy && (
          <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-hover)" }}>
            <div className="h-full transition-all" style={{ width: `${progress}%`, background: "var(--grad-primary)" }} />
          </div>
        )}
      </div>

      {/* Ўнг — текст */}
      <div className="qx-card p-6 flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm font-bold" style={{ color: "var(--text)" }}>{t.imageToText.extractedText}</h3>
          {text && (
            <div className="flex gap-2">
              <button onClick={copy} className="qx-btn-ghost !text-xs !py-1.5">
                {copied ? <><FiCheck size={12} /> {t.common.copied}</> : <><FiCopy size={12} /> {t.common.copy}</>}
              </button>
              <button onClick={downloadTxt} className="qx-btn-ghost !text-xs !py-1.5">
                <FiDownload size={12} /> .txt
              </button>
            </div>
          )}
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t.imageToText.placeholder}
          aria-label={t.imageToText.extractedText}
          className="flex-1 min-h-[300px] w-full px-4 py-3 text-sm resize-none font-mono"
          style={{ color: "var(--text)" }}
        />
      </div>
    </div>
  );
}
