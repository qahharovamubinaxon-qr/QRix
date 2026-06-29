"use client";

import { useRef, useState, useEffect } from "react";
import { FiEdit3, FiUpload, FiTrash2, FiDownload } from "react-icons/fi";
import { PDFDocument } from "pdf-lib";
import { UploadBox } from "@/components/PdfToTextClient";

/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */

const ANCHORS = [
  ["TL", "TC", "TR"],
  ["ML", "MC", "MR"],
  ["BL", "BC", "BR"],
] as const;
type Anchor = (typeof ANCHORS)[number][number];

export default function SignPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [sig, setSig] = useState<string | null>(null); // dataURL PNG
  const [anchor, setAnchor] = useState<Anchor>("BR");
  const [scope, setScope] = useState<"first" | "last" | "all">("first");
  const [width, setWidth] = useState(160);
  const [busy, setBusy] = useState(false);

  async function run() {
    if (!file || !sig) return;
    setBusy(true);
    try {
      const doc = await PDFDocument.load(await file.arrayBuffer());
      const png = await doc.embedPng(sig);
      const pages = doc.getPages();
      let targets: number[] = [];
      if (scope === "first") targets = [0];
      else if (scope === "last") targets = [pages.length - 1];
      else targets = pages.map((_, i) => i);

      const margin = 28;
      for (const i of targets) {
        const p = pages[i];
        const { width: pw, height: ph } = p.getSize();
        const sw = Math.min(width, pw - margin * 2);
        const sh = (png.height / png.width) * sw;
        const a = anchor;
        const left = a.endsWith("L") ? margin : a.endsWith("R") ? pw - sw - margin : (pw - sw) / 2;
        const top = a.startsWith("T") ? ph - sh - margin : a.startsWith("B") ? margin : (ph - sh) / 2;
        p.drawImage(png, { x: left, y: top, width: sw, height: sh });
      }

      const bytes = await doc.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = file.name.replace(/\.pdf$/i, "") + "-signed.pdf";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      alert("Signing failed: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setSig(String(r.result));
    r.readAsDataURL(f);
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />

      {/* Signature */}
      <div className="mt-5">
        <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Your signature</div>
        <SignaturePad value={sig} onChange={setSig} />
        <div className="flex items-center gap-3 mt-2">
          <label className="qx-btn-ghost !text-xs cursor-pointer">
            <FiUpload size={12} /> Upload image
            <input type="file" accept="image/png,image/jpeg" className="hidden" onChange={onUpload} />
          </label>
          {sig && <button onClick={() => setSig(null)} className="qx-btn-ghost !text-xs" style={{ color: "#f87171" }}><FiTrash2 size={12} /> Clear</button>}
        </div>
      </div>

      {/* Placement */}
      <div className="grid sm:grid-cols-2 gap-5 mt-5">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Position</div>
          <div className="inline-grid grid-cols-3 gap-1.5 p-2 rounded-xl" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            {ANCHORS.flat().map((a) => (
              <button key={a} onClick={() => setAnchor(a)} className="w-9 h-9 rounded-lg transition-all"
                style={{ background: anchor === a ? "#F58F20" : "var(--surface)", border: `1px solid ${anchor === a ? "transparent" : "var(--border)"}` }} aria-label={a} />
            ))}
          </div>
        </div>
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Apply to</div>
          <div className="grid grid-cols-3 gap-2">
            {([["first", "First"], ["last", "Last"], ["all", "All"]] as const).map(([v, l]) => (
              <button key={v} onClick={() => setScope(v)} className="py-2 rounded-lg text-xs font-bold transition-all"
                style={{ background: scope === v ? "#F58F20" : "var(--surface-2)", color: scope === v ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${scope === v ? "transparent" : "var(--border)"}` }}>{l}</button>
            ))}
          </div>
          <div className="mt-3">
            <label className="block text-[11px] font-bold mb-1" style={{ color: "var(--text)" }}>Size: {width}px</label>
            <input type="range" min={80} max={300} value={width} onChange={(e) => setWidth(Number(e.target.value))} className="w-full accent-orange-500" />
          </div>
        </div>
      </div>

      <button onClick={run} disabled={!file || !sig || busy} className="qx-btn-hero w-full mt-5 disabled:opacity-50">
        {busy ? "Signing…" : <><FiEdit3 size={15} /> Sign &amp; download PDF</>}
      </button>
    </div>
  );
}

function SignaturePad({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0e0e0e";
  }, []);

  function pos(e: React.PointerEvent) {
    const c = ref.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * c.width, y: ((e.clientY - r.top) / r.height) * c.height };
  }
  function down(e: React.PointerEvent) { drawing.current = true; const ctx = ref.current!.getContext("2d")!; const { x, y } = pos(e); ctx.beginPath(); ctx.moveTo(x, y); }
  function move(e: React.PointerEvent) { if (!drawing.current) return; const ctx = ref.current!.getContext("2d")!; const { x, y } = pos(e); ctx.lineTo(x, y); ctx.stroke(); }
  function up() { if (!drawing.current) return; drawing.current = false; onChange(ref.current!.toDataURL("image/png")); }
  function clear() { const c = ref.current!; c.getContext("2d")!.clearRect(0, 0, c.width, c.height); onChange(null); }

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)" }}>
        <canvas ref={ref} width={500} height={150} className="w-full touch-none" style={{ height: 130, cursor: "crosshair" }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} />
        {!value && <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm" style={{ color: "#9ca3af" }}>✍️ Draw your signature here</span>}
        <button onClick={clear} className="absolute top-2 right-2 text-[10px] px-2 py-1 rounded-md" style={{ background: "#f1f1f1", color: "#555" }}>Clear</button>
      </div>
    </div>
  );
}
