"use client";

import { useState } from "react";
import { FiMinimize2, FiCheck } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";
import { toolUI, type ToolLang } from "@/lib/tool-ui-i18n";

/* The level ids stay the load-bearing values (they are passed to compressPdf);
   only their labels and hints are localized, out of lib/tool-ui-i18n. */
const LEVEL_IDS = ["low", "medium", "high"] as const;

type Result = {
  originalSize: number;
  compressedSize: number;
  savedPercent: number;
  imagesFound: number;
  imagesRecompressed: number;
};

/* Compression runs entirely in this component now. It used to POST to
   /api/pdf/compress, which capped the tool at ~4.3 MB — the platform rejects
   bigger request bodies at the edge — on a page whose whole promise is getting
   a 25 MB attachment under Gmail's limit. In the browser there is no upload
   limit, and the file genuinely never leaves the device. */
export default function CompressPdfClient({ lang = "en" }: { lang?: ToolLang }) {
  const t = toolUI(lang);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [level, setLevel] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<Result | null>(null);

  const toMB = (b: number) => (b / 1024 / 1024).toFixed(2);

  async function runCompress() {
    if (!file) return;
    const outName = file.name.replace(/\.pdf$/i, "") + "-compressed.pdf";
    // Asked for before the work starts: the save picker needs the click gesture.
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setLoading(true);
    setProgress(0);
    setResult(null);
    try {
      // Loaded on demand — pdf-lib is a big chunk and most visitors to the page
      // read the copy without ever compressing anything.
      const [{ compressPdf }, { canvasJpegReencoder }] = await Promise.all([
        import("@/lib/pdf-compress"),
        import("@/lib/pdf-compress-canvas"),
      ]);
      const input = new Uint8Array(await file.arrayBuffer());
      const out = await compressPdf(input, {
        level,
        reencodeJpeg: canvasJpegReencoder,
        onProgress: setProgress,
      });
      setLoading(false);
      const blob = new Blob([out.bytes as unknown as BlobPart], { type: "application/pdf" });
      await finishSave(target, blob, outName);
      setResult(out);
    } catch (e) {
      setLoading(false);
      alert(t.compress.failed + (e as Error).message);
    }
  }

  // Nothing to re-encode means the weight is text, vectors or already-dense
  // scans — saying "already optimized" alone reads like the tool did nothing.
  const noImages = result != null && result.imagesRecompressed === 0;

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={(f) => { setFile(f); setResult(null); }} accept=".pdf" lang={lang} />

      <div className="mt-4">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>{t.compress.levelLabel}</div>
        <div className="grid grid-cols-3 gap-2">
          {LEVEL_IDS.map((id) => (
            <button key={id} onClick={() => setLevel(id)} title={t.compress.levels[id].hint} className="py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: level === id ? "#F58F20" : "var(--surface-2)", color: level === id ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${level === id ? "transparent" : "var(--border)"}` }}>{t.compress.levels[id].label}</button>
          ))}
        </div>
      </div>

      {file && (
        <div className="mt-3 text-[12px]" style={{ color: "var(--text-muted)" }}>
          {t.compress.originalSize} <b style={{ color: "var(--text)" }}>{toMB(file.size)} MB</b> · {t.compress.onDevice}
        </div>
      )}

      <button onClick={runCompress} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? `${t.compress.compressing} ${Math.round(progress * 100)}%` : <><FiMinimize2 size={15} /> {t.compress.compressBtn}</>}
      </button>

      {loading && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-2)" }}>
          <div className="h-full rounded-full transition-[width] duration-300" style={{ width: `${Math.max(4, progress * 100)}%`, background: "#F58F20" }} />
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-xl" style={{ background: "rgba(70,116,52,0.1)", border: "1px solid rgba(70,116,52,0.3)" }}>
          <div className="text-[13px] font-bold mb-2 flex items-center gap-1.5" style={{ color: "var(--success)" }}><FiCheck size={13} /> {t.compress.doneTitle}</div>
          <div className="text-[12px] space-y-1" style={{ color: "var(--text-muted)" }}>
            <div className="flex justify-between"><span>{t.compress.rowOriginal}</span><b style={{ color: "var(--text)" }}>{toMB(result.originalSize)} MB</b></div>
            <div className="flex justify-between"><span>{t.compress.rowCompressed}</span><b style={{ color: "var(--text)" }}>{toMB(result.compressedSize)} MB</b></div>
            <div className="flex justify-between"><span>{t.compress.rowSaved}</span><b style={{ color: "var(--primary-bright)" }}>{result.savedPercent > 0 ? t.compress.smaller(result.savedPercent) : t.compress.alreadyOptimized}</b></div>
          </div>
          {noImages && (
            <div className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
              {t.compress.noImagesNote}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
