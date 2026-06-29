"use client";

import { useRef, useState, useEffect } from "react";
import { FiEdit3, FiUpload, FiTrash2, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { PDFDocument } from "pdf-lib";
import { UploadBox } from "@/components/PdfToTextClient";

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

type Place = { xRatio: number; yRatio: number }; // cursor-center position on the page

export default function SignPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [sig, setSig] = useState<string | null>(null);
  const [sigAspect, setSigAspect] = useState(0.3); // h/w
  const [widthPct, setWidthPct] = useState(22); // % of page width
  const [scope, setScope] = useState<"page" | "all">("page");
  const [busy, setBusy] = useState(false);

  const [numPages, setNumPages] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [place, setPlace] = useState<Place | null>(null);

  const pdfRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  // load pdf
  useEffect(() => {
    if (!file) { pdfRef.current = null; setNumPages(0); setPlace(null); return; }
    let cancelled = false;
    (async () => {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const doc = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), verbosity: 0 }).promise;
      if (cancelled) return;
      pdfRef.current = doc; setNumPages(doc.numPages); setPageIndex(0); setPlace(null);
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
      const scale = Math.min(480 / base.width, 2);
      const vp = page.getViewport({ scale });
      canvas.width = vp.width; canvas.height = vp.height;
      if (cancelled) return;
      task = page.render({ canvasContext: canvas.getContext("2d"), viewport: vp });
      try { await task.promise; } catch { /* cancelled */ }
    })();
    return () => { cancelled = true; try { task && task.cancel(); } catch { /* */ } };
  }, [pageIndex, numPages]);

  function setSignature(dataUrl: string | null) {
    setSig(dataUrl);
    if (dataUrl) { const im = new Image(); im.onload = () => setSigAspect(im.naturalHeight / im.naturalWidth || 0.3); im.src = dataUrl; }
  }
  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setSignature(String(r.result)); r.readAsDataURL(f);
  }

  function pointToRatio(clientX: number, clientY: number): Place {
    const r = stageRef.current!.getBoundingClientRect();
    return { xRatio: clamp((clientX - r.left) / r.width, 0, 1), yRatio: clamp((clientY - r.top) / r.height, 0, 1) };
  }
  function onStageClick(e: React.MouseEvent) {
    if (!sig) return;
    setPlace(pointToRatio(e.clientX, e.clientY));
  }

  async function run() {
    if (!file || !sig || !place) return;
    setBusy(true);
    try {
      const { saveBlob } = await import("@/lib/save-file");
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const png = await doc.embedPng(sig);
      const pages = doc.getPages();
      const targets = scope === "all" ? pages.map((_, i) => i) : [pageIndex];
      for (const i of targets) {
        const p = pages[i];
        const pw = p.getWidth(); const ph = p.getHeight();
        const sigW = (widthPct / 100) * pw;
        const sigH = sigW * sigAspect;
        const cx = place.xRatio * pw;
        const cy = ph - place.yRatio * ph; // flip Y (PDF origin bottom-left)
        p.drawImage(png, { x: cx - sigW / 2, y: cy - sigH / 2, width: sigW, height: sigH });
      }
      const bytes = await doc.save();
      setBusy(false);
      await saveBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), file.name.replace(/\.pdf$/i, "") + "-signed.pdf");
    } catch (e) {
      setBusy(false);
      alert("Signing failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
        {/* ── left: inputs ── */}
        <div>
          <UploadBox file={file} setFile={setFile} accept=".pdf" />

          <div className="mt-5">
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Your signature</div>
            <SignaturePad value={sig} onChange={setSignature} />
            <div className="flex items-center gap-3 mt-2">
              <label className="qx-btn-ghost !text-xs cursor-pointer"><FiUpload size={12} /> Upload image<input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onUpload} /></label>
              {sig && <button onClick={() => setSignature(null)} className="qx-btn-ghost !text-xs" style={{ color: "#f87171" }}><FiTrash2 size={12} /> Clear</button>}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Apply to</div>
              <div className="grid grid-cols-2 gap-2">
                {([["page", "This page"], ["all", "All pages"]] as const).map(([v, l]) => (
                  <button key={v} onClick={() => setScope(v)} className="py-2 rounded-lg text-[11px] font-bold transition-all"
                    style={{ background: scope === v ? "#F58F20" : "var(--surface-2)", color: scope === v ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${scope === v ? "transparent" : "var(--border)"}` }}>{l}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Size: {widthPct}%</div>
              <input type="range" min={8} max={50} value={widthPct} onChange={(e) => setWidthPct(Number(e.target.value))} className="w-full accent-orange-500" />
            </div>
          </div>

          <button onClick={run} disabled={!file || !sig || !place || busy} className="qx-btn-hero w-full mt-5 disabled:opacity-50">
            {busy ? "Signing…" : <><FiEdit3 size={15} /> Sign &amp; download PDF</>}
          </button>
          {!place && file && sig && <p className="text-[11px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>👉 Click on the page (right) where the signature should go</p>}
        </div>

        {/* ── right: page preview ── */}
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
            <div className="rounded-2xl flex items-center justify-center text-sm" style={{ minHeight: 320, border: "1px solid var(--border)", color: "var(--text-faint)" }}>Upload a PDF to preview</div>
          ) : (
            <div ref={stageRef} onClick={onStageClick} className="relative rounded-xl overflow-hidden mx-auto"
              style={{ width: "fit-content", maxWidth: "100%", cursor: sig ? "crosshair" : "default", boxShadow: "0 6px 24px rgba(0,0,0,.4)" }}>
              <canvas ref={canvasRef} className="block max-w-full" />
              {sig && place && (
                <img
                  src={sig} alt="signature"
                  onPointerDown={(e) => { e.stopPropagation(); dragging.current = true; (e.target as HTMLElement).setPointerCapture(e.pointerId); }}
                  onPointerMove={(e) => { if (dragging.current) setPlace(pointToRatio(e.clientX, e.clientY)); }}
                  onPointerUp={() => { dragging.current = false; }}
                  className="absolute pointer-events-auto"
                  style={{ left: `${place.xRatio * 100}%`, top: `${place.yRatio * 100}%`, width: `${widthPct}%`, transform: "translate(-50%,-50%)", cursor: "grab", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.4))" }}
                  draggable={false}
                />
              )}
            </div>
          )}
          {file && sig && place && <p className="text-[11px] mt-2 text-center" style={{ color: "var(--text-faint)" }}>Drag the signature to fine-tune · click elsewhere to move it</p>}
        </div>
      </div>
    </div>
  );
}

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function SignaturePad({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.lineWidth = 2.5; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.strokeStyle = "#0e0e0e";
  }, []);
  function pos(e: React.PointerEvent) { const c = ref.current!; const r = c.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height }; }
  function down(e: React.PointerEvent) { drawing.current = true; const ctx = ref.current!.getContext("2d")!; const { x, y } = pos(e); ctx.beginPath(); ctx.moveTo(x, y); }
  function move(e: React.PointerEvent) { if (!drawing.current) return; const ctx = ref.current!.getContext("2d")!; const { x, y } = pos(e); ctx.lineTo(x, y); ctx.stroke(); }
  function up() { if (!drawing.current) return; drawing.current = false; onChange(ref.current!.toDataURL("image/png")); }
  function clear() { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); onChange(null); }
  return (
    <div className="relative rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
      <canvas ref={ref} width={500} height={150} className="w-full touch-none" style={{ height: 130, cursor: "crosshair" }}
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} />
      {!value && <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm" style={{ color: "#9ca3af" }}>✍️ Draw your signature here</span>}
      <button onClick={clear} className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md" style={{ background: "#f1f1f1", color: "#555" }}>Clear</button>
    </div>
  );
}
