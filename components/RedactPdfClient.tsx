"use client";

import { useEffect, useRef, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiRotateCcw, FiTrash2, FiShield } from "react-icons/fi";
import { loadPdfLib, warmPdfLib } from "@/lib/pdf-lib-loader";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

/* eslint-disable @typescript-eslint/no-explicit-any */

// rectangle in page-ratio coordinates (0..1)
type Rect = { x: number; y: number; w: number; h: number };

export default function RedactPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [rects, setRects] = useState<Record<number, Rect[]>>({});
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  const pdfRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [draft, setDraft] = useState<Rect | null>(null);

  // load pdf
  useEffect(() => {
    if (!file) { pdfRef.current = null; setNumPages(0); setRects({}); return; }
    let cancelled = false;
    warmPdfLib(); // the export button needs it; fetch it while they draw boxes
    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), verbosity: 0 }).promise;
      if (cancelled) return;
      pdfRef.current = doc; setNumPages(doc.numPages); setPageIndex(0); setRects({});
    })();
    return () => { cancelled = true; };
  }, [file]);

  // render current page
  useEffect(() => {
    const doc = pdfRef.current; const canvas = canvasRef.current;
    if (!doc || !canvas) return;
    let cancelled = false; let task: any;
    (async () => {
      const page = await doc.getPage(pageIndex + 1);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(520 / base.width, 2);
      const vp = page.getViewport({ scale });
      canvas.width = vp.width; canvas.height = vp.height;
      if (cancelled) return;
      task = page.render({ canvas, canvasContext: canvas.getContext("2d"), viewport: vp });
      try { await task.promise; } catch { /* cancelled */ }
    })();
    return () => { cancelled = true; try { task && task.cancel(); } catch { /* */ } };
  }, [pageIndex, numPages]);

  function ratioPoint(e: React.PointerEvent) {
    const r = stageRef.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  }
  function onDown(e: React.PointerEvent) {
    if (!file) return;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = ratioPoint(e);
    setDraft(null);
  }
  function onMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const p = ratioPoint(e);
    setDraft({
      x: Math.min(drag.current.x, p.x),
      y: Math.min(drag.current.y, p.y),
      w: Math.abs(p.x - drag.current.x),
      h: Math.abs(p.y - drag.current.y),
    });
  }
  function onUp() {
    if (drag.current && draft && draft.w > 0.01 && draft.h > 0.005) {
      setRects((rs) => ({ ...rs, [pageIndex]: [...(rs[pageIndex] || []), draft] }));
    }
    drag.current = null;
    setDraft(null);
  }
  function undo() {
    setRects((rs) => {
      const cur = rs[pageIndex] || [];
      return { ...rs, [pageIndex]: cur.slice(0, -1) };
    });
  }
  function clearPage() {
    setRects((rs) => ({ ...rs, [pageIndex]: [] }));
  }

  const totalRects = Object.values(rects).reduce((n, arr) => n + arr.length, 0);

  async function exportPdf() {
    if (!file || !pdfRef.current || totalRects === 0) return;
    const outName = file.name.replace(/\.pdf$/i, "") + "-redacted.pdf";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setBusy(true);
    trackTool("redact-pdf", { rects: totalRects });
    try {
      const src = pdfRef.current;
      const { PDFDocument } = await loadPdfLib();
      const out = await PDFDocument.create();
      for (let i = 0; i < src.numPages; i++) {
        setProgress(`Securing page ${i + 1} of ${src.numPages}…`);
        const page = await src.getPage(i + 1);
        const vp = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = vp.width; canvas.height = vp.height;
        const ctx = canvas.getContext("2d")!;
        await page.render({ canvas, canvasContext: ctx, viewport: vp }).promise;
        // burn the black boxes into the pixels — content underneath is destroyed
        for (const r of rects[i] || []) {
          ctx.fillStyle = "#000000";
          ctx.fillRect(r.x * canvas.width, r.y * canvas.height, r.w * canvas.width, r.h * canvas.height);
        }
        const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b as Blob), "image/jpeg", 0.92));
        const img = await out.embedJpg(new Uint8Array(await blob.arrayBuffer()));
        const base = page.getViewport({ scale: 1 });
        const p = out.addPage([base.width, base.height]);
        p.drawImage(img, { x: 0, y: 0, width: base.width, height: base.height });
      }
      const bytes = await out.save();
      setBusy(false); setProgress("");
      await finishSave(target, new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), outName);
    } catch (e) {
      setBusy(false); setProgress("");
      alert("Redaction failed: " + (e as Error).message);
    }
  }

  const pageRects = rects[pageIndex] || [];

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[340px_1fr] gap-6">
        {/* controls */}
        <div>
          <UploadBox file={file} setFile={setFile} accept=".pdf" />
          <div className="mt-4 rounded-xl p-3 text-[12px] leading-relaxed" style={{ background: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.25)", color: "var(--text-muted)" }}>
            🖤 Drag on the page to draw black boxes over anything sensitive. On export the page is <b style={{ color: "var(--text)" }}>flattened</b>, so covered content is <b style={{ color: "var(--text)" }}>permanently destroyed</b> — not just hidden.
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={undo} disabled={!pageRects.length} className="qx-btn-ghost !text-xs !py-2 disabled:opacity-30"><FiRotateCcw size={13} /> Undo</button>
            <button onClick={clearPage} disabled={!pageRects.length} className="qx-btn-ghost !text-xs !py-2 disabled:opacity-30" style={{ color: "#f87171" }}><FiTrash2 size={13} /> Clear page</button>
          </div>
          <button onClick={exportPdf} disabled={!file || totalRects === 0 || busy} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
            {busy ? "Securing…" : <><FiShield size={15} /> Redact &amp; download ({totalRects})</>}
          </button>
          {progress && <p className="text-[12px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>{progress}</p>}
        </div>

        {/* page stage */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-bold" style={{ color: "var(--text)" }}>Document</span>
            {numPages > 1 && (
              <div className="flex items-center gap-2">
                <button onClick={() => setPageIndex((i) => Math.max(0, i - 1))} disabled={pageIndex === 0} className="qx-btn-ghost !p-1.5 disabled:opacity-40"><FiChevronLeft size={14} /></button>
                <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Page {pageIndex + 1} / {numPages}</span>
                <button onClick={() => setPageIndex((i) => Math.min(numPages - 1, i + 1))} disabled={pageIndex === numPages - 1} className="qx-btn-ghost !p-1.5 disabled:opacity-40"><FiChevronRight size={14} /></button>
              </div>
            )}
          </div>

          {!file ? (
            <div className="rounded-2xl flex items-center justify-center text-sm" style={{ minHeight: 320, border: "1px solid var(--border)", color: "var(--text-faint)" }}>Upload a PDF to start</div>
          ) : (
            <div
              ref={stageRef}
              onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
              className="relative rounded-xl overflow-hidden mx-auto touch-none select-none"
              style={{ width: "fit-content", maxWidth: "100%", cursor: "crosshair", boxShadow: "0 6px 24px rgba(0,0,0,.4)" }}
            >
              <canvas ref={canvasRef} className="block max-w-full" />
              {pageRects.map((r, i) => (
                <div key={i} className="absolute" style={{ left: `${r.x * 100}%`, top: `${r.y * 100}%`, width: `${r.w * 100}%`, height: `${r.h * 100}%`, background: "#000" }} />
              ))}
              {draft && (
                <div className="absolute pointer-events-none" style={{ left: `${draft.x * 100}%`, top: `${draft.y * 100}%`, width: `${draft.w * 100}%`, height: `${draft.h * 100}%`, background: "rgba(0,0,0,0.75)", border: "2px dashed #f87171" }} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
