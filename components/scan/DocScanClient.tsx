"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiUploadCloud, FiDownload, FiRotateCw, FiX } from "react-icons/fi";
import {
  DOC_STANDARDS, PAGES, detectQuad, warpToRect, flattenIllumination,
  composePage, targetSize,
  type DocStandard, type PageSize, type Img, type Quad, type Point,
} from "@/lib/doc-scan";
import { trackTool } from "@/lib/track";
import { saveBlob } from "@/lib/save-file";

/* The interactive half of the scanner. The geometry all lives in lib/doc-scan,
   which is tested against synthetic photos; this file is the part that has to
   handle a person: showing what was detected, and letting them fix it.

   The draggable corners are not a nicety. No detector is right on every photo —
   a document on a patterned tablecloth, a hand in frame, a page that blends
   into the desk — and a scanner that fails with no way to intervene is a
   scanner people stop using after the first bad photo. */

type Side = { name: string; img: Img | null; url: string | null; quad: Quad | null; auto: boolean };

const emptySide = (name: string): Side => ({ name, img: null, url: null, quad: null, auto: false });

/* Written through createImageData rather than `new ImageData(buffer, …)`: the
   constructor's type demands a Uint8ClampedArray backed specifically by an
   ArrayBuffer, and the buffers coming out of lib/doc-scan are typed loosely
   enough that it will not accept them. Copying into a canvas-owned buffer is
   also the portable path across browsers. */
function paint(canvas: HTMLCanvasElement, img: Img): void {
  canvas.width = img.width; canvas.height = img.height;
  const ctx = canvas.getContext("2d")!;
  const id = ctx.createImageData(img.width, img.height);
  id.data.set(img.data);
  ctx.putImageData(id, 0, 0);
}

function imgToCanvas(img: Img): HTMLCanvasElement {
  const c = document.createElement("canvas");
  paint(c, img);
  return c;
}

async function fileToImg(file: File): Promise<Img> {
  const bitmap = await createImageBitmap(file);
  /* Cap the working size. A 12-megapixel phone photo is far more detail than a
     1011 px card crop can use, and the full-resolution warp costs seconds on a
     mid-range phone for pixels nobody sees. */
  const maxSide = 2400;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const data = c.getContext("2d")!.getImageData(0, 0, w, h);
  return { data: data.data, width: w, height: h };
}

/** A sensible starting quad when detection declines to answer: an inset
    rectangle the person can drag onto the document, rather than nothing. */
const fallbackQuad = (img: Img): Quad => {
  const mx = img.width * 0.1, my = img.height * 0.1;
  return [
    { x: mx, y: my }, { x: img.width - mx, y: my },
    { x: img.width - mx, y: img.height - my }, { x: mx, y: img.height - my },
  ];
};

export default function DocScanClient() {
  const [sides, setSides] = useState<Side[]>([emptySide("Front")]);
  const [std, setStd] = useState<DocStandard>("id1");
  const [page, setPage] = useState<PageSize>("a4");
  const [enhance, setEnhance] = useState(true);
  const [grayscale, setGrayscale] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  /* Object URLs are revoked when the side changes or the component unmounts —
     a scanner is used repeatedly in one sitting, and leaking a 4 MB blob per
     photo is how a tab ends up killed on a phone. */
  useEffect(() => () => { sides.forEach((s) => s.url && URL.revokeObjectURL(s.url)); }, [sides]);

  const addSide = () => setSides((s) => (s.length < 2 ? [...s, emptySide("Back")] : s));

  const loadInto = useCallback(async (index: number, file: File) => {
    setBusy("Reading the photo…");
    try {
      const img = await fileToImg(file);
      const detected = detectQuad(img);
      setSides((prev) => {
        const next = [...prev];
        if (next[index].url) URL.revokeObjectURL(next[index].url!);
        next[index] = {
          ...next[index],
          img,
          url: URL.createObjectURL(file),
          quad: detected ?? fallbackQuad(img),
          auto: !!detected,
        };
        return next;
      });
      trackTool("doc-scan-load", { detected: !!detected });
    } finally { setBusy(null); }
  }, []);

  const corrected = useMemo(() => {
    return sides
      .filter((s) => s.img && s.quad)
      .map((s) => {
        const size = targetSize(std, s.quad!);
        const warped = warpToRect(s.img!, s.quad!, size.w, size.h);
        return enhance ? flattenIllumination(warped, { grayscale }) : warped;
      });
  }, [sides, std, enhance, grayscale]);

  /* Draw the composed sheet whenever anything changes, so what is downloaded is
     what is on screen — a preview generated by a different path than the export
     is a preview that eventually lies. */
  useEffect(() => {
    if (!corrected.length || !previewRef.current) return;
    const sheet = composePage(corrected, { doc: std, page });
    paint(previewRef.current, sheet);
    setPreview(`${sheet.width}×${sheet.height}`);
  }, [corrected, std, page]);

  async function download(kind: "png" | "pdf") {
    if (!corrected.length) return;
    setBusy(kind === "pdf" ? "Building the PDF…" : "Rendering…");
    try {
      const sheet = composePage(corrected, { doc: std, page });
      const canvas = imgToCanvas(sheet);
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.92));
      if (!blob) return;

      if (kind === "png") {
        await saveBlob(blob, "scan.jpg");
      } else {
        const { PDFDocument } = await import("@/lib/pdf-lib-loader").then((m) => m.loadPdfLib());
        const doc = await PDFDocument.create();
        const p = PAGES[page];
        /* PDF points are 1/72 inch; the sheet is already at its true millimetre
           size, so the page is sized in points and the image fills it exactly.
           Printed at 100% this comes out the right size on a ruler. */
        const ptW = (p.w / 25.4) * 72, ptH = (p.h / 25.4) * 72;
        const embedded = await doc.embedJpg(new Uint8Array(await blob.arrayBuffer()));
        doc.addPage([ptW, ptH]).drawImage(embedded, { x: 0, y: 0, width: ptW, height: ptH });
        const bytes = await doc.save();
        await saveBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "scan.pdf");
      }
      trackTool("doc-scan-export", { kind, sides: corrected.length, std });
    } finally { setBusy(null); }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {sides.map((side, i) => (
          <SideEditor
            key={i} side={side} index={i}
            onFile={(f) => loadInto(i, f)}
            onQuad={(q) => setSides((prev) => { const n = [...prev]; n[i] = { ...n[i], quad: q }; return n; })}
            onClear={() => setSides((prev) => {
              const n = [...prev];
              if (n[i].url) URL.revokeObjectURL(n[i].url!);
              n[i] = emptySide(n[i].name);
              return n;
            })}
          />
        ))}
      </div>

      {sides.length === 1 && sides[0].img && (
        <button onClick={addSide} className="qx-btn-ghost !text-[13px]">
          + Add the back of the card
        </button>
      )}

      <div className="qx-card p-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-faint)" }}>Document</span>
          <select value={std} onChange={(e) => setStd(e.target.value as DocStandard)} className="qx-auth-input !py-2 w-full">
            {Object.entries(DOC_STANDARDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="block text-[11px] uppercase tracking-wider mb-1.5" style={{ color: "var(--text-faint)" }}>Sheet</span>
          <select value={page} onChange={(e) => setPage(e.target.value as PageSize)} className="qx-auth-input !py-2 w-full">
            {Object.entries(PAGES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </label>
        <label className="flex items-end gap-2 text-[13px] pb-2" style={{ color: "var(--text-muted)" }}>
          <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} />
          Clean up lighting
        </label>
        <label className="flex items-end gap-2 text-[13px] pb-2" style={{ color: "var(--text-muted)" }}>
          <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} disabled={!enhance} />
          Black &amp; white
        </label>
      </div>

      {corrected.length > 0 && (
        <div className="qx-card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <p className="font-bold text-[14px]" style={{ color: "var(--text)" }}>Result</p>
              <p className="qx-mono text-[11px]" style={{ color: "var(--text-faint)" }}>
                {DOC_STANDARDS[std].w} × {DOC_STANDARDS[std].h} mm on {PAGES[page].label} · {preview} px at 300 DPI
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => download("pdf")} disabled={!!busy} className="qx-btn !py-2.5 text-sm">
                <FiDownload size={14} /> PDF
              </button>
              <button onClick={() => download("png")} disabled={!!busy} className="qx-btn-ghost !py-2.5 text-sm">
                <FiDownload size={14} /> Image
              </button>
            </div>
          </div>
          <canvas ref={previewRef} className="w-full h-auto rounded-lg"
            style={{ border: "1px solid var(--border)", background: "#fff", maxHeight: 560, objectFit: "contain" }} />
        </div>
      )}

      {busy && <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{busy}</p>}

      <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>
        Everything here runs in your browser — the photo is never uploaded, which is the
        point when the document is an ID card or a passport.
      </p>
    </div>
  );
}

/* ── one photo, with its corners ─────────────────────────────────────────── */

function SideEditor({
  side, index, onFile, onQuad, onClear,
}: {
  side: Side; index: number;
  onFile: (f: File) => void; onQuad: (q: Quad) => void; onClear: () => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<number | null>(null);

  /* Display coordinates and image coordinates are different spaces, and mixing
     them is the classic bug here: the handle lands where the pointer was on a
     desktop and half a document away on a phone. One conversion, used both
     ways. */
  const toImage = (clientX: number, clientY: number): Point | null => {
    const el = wrapRef.current;
    if (!el || !side.img) return null;
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(side.img.width, ((clientX - r.left) / r.width) * side.img.width)),
      y: Math.max(0, Math.min(side.img.height, ((clientY - r.top) / r.height) * side.img.height)),
    };
  };

  const move = (e: React.PointerEvent) => {
    if (drag === null || !side.quad) return;
    const p = toImage(e.clientX, e.clientY);
    if (!p) return;
    const q = [...side.quad] as Quad;
    q[drag] = p;
    onQuad(q);
  };

  if (!side.img) {
    return (
      <label className="rounded-2xl p-8 text-center cursor-pointer block"
        style={{ border: "2px dashed var(--border-glass)", background: "var(--surface)" }}>
        <input type="file" accept="image/*" className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); e.currentTarget.value = ""; }} />
        <span className="mx-auto mb-3 w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>
          <FiUploadCloud size={20} />
        </span>
        <span className="block font-bold text-[14px]" style={{ color: "var(--text)" }}>
          {index === 0 ? "Photo of the document" : "Photo of the back"}
        </span>
        <span className="block text-[12px] mt-1" style={{ color: "var(--text-faint)" }}>
          A phone photo is fine — crooked and uneven light are what this fixes.
        </span>
      </label>
    );
  }

  const pct = (p: Point) => ({ left: `${(p.x / side.img!.width) * 100}%`, top: `${(p.y / side.img!.height) * 100}%` });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)", background: "var(--surface)" }}>
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-[12px] font-bold" style={{ color: "var(--text)" }}>
          {side.name} · {side.auto ? "corners detected" : "place the corners"}
        </span>
        <button onClick={onClear} aria-label={`Remove ${side.name}`} className="p-1" style={{ color: "var(--text-faint)" }}>
          <FiX size={15} />
        </button>
      </div>

      <div ref={wrapRef} className="relative select-none touch-none"
        onPointerMove={move} onPointerUp={() => setDrag(null)} onPointerLeave={() => setDrag(null)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={side.url!} alt="" className="block w-full h-auto" draggable={false} />

        {side.quad && (
          <>
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${side.img.width} ${side.img.height}`} preserveAspectRatio="none">
              <polygon
                points={side.quad.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="rgba(255,106,19,0.14)" stroke="#ff6a13"
                strokeWidth={Math.max(2, side.img.width / 300)} />
            </svg>
            {side.quad.map((p, i) => (
              <button key={i} aria-label={`Corner ${i + 1}`}
                onPointerDown={(e) => { (e.target as HTMLElement).setPointerCapture(e.pointerId); setDrag(i); }}
                className="absolute w-7 h-7 -ml-3.5 -mt-3.5 rounded-full"
                style={{ ...pct(p), background: "#ff6a13", border: "2px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,.4)", touchAction: "none" }} />
            ))}
          </>
        )}
      </div>

      {!side.auto && (
        <p className="px-3 py-2 text-[11.5px]" style={{ color: "var(--text-muted)" }}>
          <FiRotateCw size={11} className="inline mr-1" aria-hidden />
          Nothing was detected confidently — drag the four dots onto the document&rsquo;s corners.
        </p>
      )}
    </div>
  );
}
