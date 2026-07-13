"use client";

/* Shared premium building blocks for every AI tool:
   <AiDropzone>  drag & drop / click / Ctrl+V paste upload
   <BeforeAfter> draggable comparison slider + fullscreen
   <AiProcessing> staged "AI thinking" loader
   <AiResultBar> download / copy / share / reset actions
   <CloudNotice> connector notice for preview-status tools     */

import { useCallback, useEffect, useRef, useState } from "react";
import { FiUploadCloud, FiDownload, FiCopy, FiCheck, FiShare2, FiRefreshCw, FiMaximize2, FiX, FiZap } from "react-icons/fi";

/* ── Dropzone ─────────────────────────────────────────────── */
export function AiDropzone({ onFile, accept = "image/*", hint }: {
  onFile: (f: File) => void;
  accept?: string;
  hint?: string;
}) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith("image/"));
      const f = item?.getAsFile();
      if (f) onFile(f);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFile]);

  return (
    <div
      role="button" tabIndex={0} aria-label="Upload file"
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); inputRef.current?.click(); } }}
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      className="relative rounded-3xl p-10 text-center cursor-pointer transition-all"
      style={{
        border: `2px dashed ${drag ? "var(--primary-bright)" : "var(--border-glass)"}`,
        background: drag ? "color-mix(in srgb, var(--primary) 8%, transparent)" : "var(--surface)",
        boxShadow: drag ? "0 0 40px -8px color-mix(in srgb, var(--primary) 50%, transparent)" : "none",
      }}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
      <span className="mx-auto mb-4 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "var(--grad-primary)", color: "#0b0b0b", boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}>
        <FiUploadCloud size={24} />
      </span>
      <p className="font-bold text-[15px]" style={{ color: "var(--text)" }}>
        Drop a file, click to browse — or press <kbd className="px-1.5 py-0.5 rounded text-[11px]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>Ctrl+V</kbd> to paste
      </p>
      <p className="text-[12px] mt-1.5" style={{ color: "var(--text-faint)" }}>{hint || "JPG, PNG or WebP · processed on your device"}</p>
    </div>
  );
}

/* ── Before / After slider ────────────────────────────────── */
export function BeforeAfter({ before, after, alt = "" }: { before: string; after: string; alt?: string }) {
  const [pos, setPos] = useState(50);
  const [full, setFull] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const move = useCallback((clientX: number) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100)));
  }, []);

  const body = (
    <div ref={wrapRef}
      className="relative select-none rounded-2xl overflow-hidden w-full"
      style={{ background: "#101014", touchAction: "none", cursor: "ew-resize" }}
      onPointerMove={(e) => e.buttons === 1 && move(e.clientX)}
      onPointerDown={(e) => move(e.clientX)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={before} alt={alt} className="block w-full h-auto" draggable={false} />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={after} alt={alt} className="block w-full h-auto" draggable={false} />
      </div>
      {/* handle */}
      <div className="absolute inset-y-0" style={{ left: `${pos}%`, width: 2, background: "var(--primary-bright)", boxShadow: "0 0 14px var(--primary-bright)" }} />
      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-black"
        style={{ left: `${pos}%`, background: "var(--grad-primary)", color: "#0b0b0b", boxShadow: "0 4px 16px rgba(0,0,0,.4)" }}>⇆</div>
      <span className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,.55)", color: "#fff" }}>BEFORE</span>
      <span className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>AFTER</span>
      <button onClick={(e) => { e.stopPropagation(); setFull(true); }} aria-label="Fullscreen"
        className="absolute bottom-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center"
        style={{ background: "rgba(0,0,0,.55)", color: "#fff" }}>
        <FiMaximize2 size={14} />
      </button>
    </div>
  );

  return (
    <>
      {body}
      {full && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6" style={{ background: "rgba(4,4,8,.92)" }} onClick={() => setFull(false)}>
          <button className="absolute top-5 right-5 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(255,255,255,.1)", color: "#fff" }} aria-label="Close">
            <FiX size={18} />
          </button>
          <div className="w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>{body}</div>
        </div>
      )}
    </>
  );
}

/* ── Processing loader ────────────────────────────────────── */
const STAGES = ["Reading pixels…", "AI analyzing the image…", "Applying enhancement…", "Polishing the result…"];
export function AiProcessing({ label }: { label?: string }) {
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 700);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-2xl p-8 text-center" style={{ background: "var(--surface)", border: "1px solid var(--border)" }} role="status" aria-live="polite">
      <div className="relative mx-auto w-14 h-14 mb-4">
        <span className="absolute inset-0 rounded-2xl animate-ping" style={{ background: "color-mix(in srgb, var(--primary) 30%, transparent)" }} />
        <span className="relative w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>
          <FiZap size={22} className="animate-pulse" />
        </span>
      </div>
      <p className="font-bold text-[14px]" style={{ color: "var(--text)" }}>{label || STAGES[stage]}</p>
      <div className="mt-4 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto" style={{ background: "var(--surface-2)" }}>
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${((stage + 1) / STAGES.length) * 100}%`, background: "var(--grad-primary)" }} />
      </div>
    </div>
  );
}

/* ── Result actions ───────────────────────────────────────── */
export function AiResultBar({ blob, filename, onReset, shareText }: {
  blob: Blob | null;
  filename: string;
  onReset: () => void;
  shareText?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function download() {
    if (!blob) return;
    const { saveBlob } = await import("@/lib/save-file");
    await saveBlob(blob, filename);
  }
  async function copyImg() {
    if (!blob) return;
    try {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type || "image/png"]: blob })]);
      setCopied(true); setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard image not supported */ }
  }
  async function share() {
    if (!blob) return;
    const file = new File([blob], filename, { type: blob.type || "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) await navigator.share({ files: [file], text: shareText });
    } catch { /* cancelled */ }
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button onClick={download} disabled={!blob} className="qx-btn-hero !py-2.5 !px-5 text-sm disabled:opacity-40" data-magnetic>
        <FiDownload size={15} /> Download
      </button>
      <button onClick={copyImg} disabled={!blob} className="qx-btn !py-2.5 text-sm disabled:opacity-40">
        {copied ? <FiCheck size={14} /> : <FiCopy size={14} />} Copy
      </button>
      {typeof navigator !== "undefined" && "share" in navigator && (
        <button onClick={share} disabled={!blob} className="qx-btn-ghost !py-2.5 text-sm disabled:opacity-40">
          <FiShare2 size={14} /> Share
        </button>
      )}
      <button onClick={onReset} className="qx-btn-ghost !py-2.5 text-sm">
        <FiRefreshCw size={14} /> New file
      </button>
    </div>
  );
}

/* ── Cloud-engine notice for preview tools ────────────────── */
export function CloudNotice({ children }: { children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl px-4 py-3 flex items-start gap-3 text-[12.5px] leading-relaxed"
      style={{ background: "color-mix(in srgb, var(--accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)", color: "var(--text-muted)" }}>
      <FiZap size={15} className="shrink-0 mt-0.5" style={{ color: "var(--accent)" }} />
      <span>
        {children || "This tool runs an on-device preview today. Full neural processing is pre-wired through the QRix AI connector and switches on with the cloud engine — no interface changes needed."}
      </span>
    </div>
  );
}
