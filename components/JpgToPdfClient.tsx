"use client";

import { useState } from "react";
import { FiUploadCloud, FiFilePlus, FiImage } from "react-icons/fi";
import { PDFDocument } from "pdf-lib";
import ReorderGrid, { type ReorderItem } from "@/components/ReorderGrid";
import { saveBlob } from "@/lib/save-file";

type Img = ReorderItem & { file: File };
type PageSize = "a4" | "letter" | "fit";
const SIZES: Record<string, [number, number]> = { a4: [595.28, 841.89], letter: [612, 792] };

export default function JpgToPdfClient() {
  const [imgs, setImgs] = useState<Img[]>([]);
  const [size, setSize] = useState<PageSize>("a4");
  const [margin, setMargin] = useState(24);
  const [busy, setBusy] = useState(false);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    const next: Img[] = list.map((f) => ({ id: `${f.name}-${f.size}-${Math.random().toString(36).slice(2, 7)}`, file: f, thumb: URL.createObjectURL(f), label: f.name }));
    setImgs((prev) => [...prev, ...next]);
  }

  async function toPngBytes(file: File): Promise<{ data: Uint8Array; w: number; h: number }> {
    const url = URL.createObjectURL(file);
    try {
      const img = await new Promise<HTMLImageElement>((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url; });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b as Blob), "image/png"));
      return { data: new Uint8Array(await blob.arrayBuffer()), w: canvas.width, h: canvas.height };
    } finally { URL.revokeObjectURL(url); }
  }

  async function convert() {
    if (!imgs.length) return;
    setBusy(true);
    try {
      const doc = await PDFDocument.create();
      for (const it of imgs) {
        const png = await toPngBytes(it.file);
        const embedded = await doc.embedPng(png.data);
        const ratio = png.h / png.w;
        let pw: number, ph: number;
        if (size === "fit") {
          pw = png.w * 0.75; ph = png.h * 0.75;
          doc.addPage([pw, ph]).drawImage(embedded, { x: 0, y: 0, width: pw, height: ph });
          continue;
        }
        [pw, ph] = SIZES[size];
        if (png.w > png.h) [pw, ph] = [Math.max(pw, ph), Math.min(pw, ph)]; // landscape
        const page = doc.addPage([pw, ph]);
        const availW = pw - margin * 2;
        const availH = ph - margin * 2;
        let finalW = availW;
        let finalH = finalW * ratio;
        if (finalH > availH) { finalH = availH; finalW = finalH / ratio; }
        page.drawImage(embedded, { x: (pw - finalW) / 2, y: (ph - finalH) / 2, width: finalW, height: finalH });
      }
      const bytes = await doc.save();
      setBusy(false);
      await saveBlob(new Blob([new Uint8Array(bytes)], { type: "application/pdf" }), "images.pdf");
    } catch (e) {
      setBusy(false);
      alert("Conversion failed: " + (e as Error).message);
    }
  }

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[300px_1fr] gap-6">
        {/* left — controls */}
        <div>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="block rounded-2xl p-6 text-center cursor-pointer"
            style={{ border: "2px dashed var(--border-strong)" }}>
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
            <span className="w-11 h-11 rounded-xl inline-flex items-center justify-center mb-2" style={{ background: "var(--surface-hover)", color: "var(--primary-bright)" }}><FiUploadCloud size={20} /></span>
            <p className="text-sm" style={{ color: "var(--text)" }}>Drop images or <span className="font-bold" style={{ color: "var(--primary-bright)" }}>browse</span></p>
            <p className="text-[11px] mt-1" style={{ color: "var(--text-faint)" }}>JPG, PNG, WEBP, GIF…</p>
          </label>

          <label className="qx-btn-ghost !text-xs cursor-pointer w-full mt-3 justify-center">
            <FiFilePlus size={13} /> Add more
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
          </label>

          <div className="mt-4">
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Page size</div>
            <div className="grid grid-cols-3 gap-2">
              {([["a4", "A4"], ["letter", "Letter"], ["fit", "Fit"]] as const).map(([v, l]) => (
                <button key={v} onClick={() => setSize(v)} className="py-2 rounded-lg text-[11px] font-bold transition-all"
                  style={{ background: size === v ? "#F58F20" : "var(--surface-2)", color: size === v ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${size === v ? "transparent" : "var(--border)"}` }}>{l}</button>
              ))}
            </div>
            <div className="mt-3">
              <label className="block text-[11px] font-bold mb-1" style={{ color: "var(--text)" }}>Margin: {margin}px</label>
              <input type="range" min={0} max={60} value={margin} onChange={(e) => setMargin(Number(e.target.value))} className="w-full accent-orange-500" disabled={size === "fit"} />
            </div>
          </div>

          <button onClick={convert} disabled={!imgs.length || busy} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
            {busy ? "Creating PDF…" : <><FiImage size={15} /> Convert to PDF</>}
          </button>
        </div>

        {/* right — selected images, drag to reorder */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[13px] font-bold" style={{ color: "var(--text)" }}>Selected images <span style={{ color: "var(--primary-bright)" }}>({imgs.length})</span></span>
            {imgs.length > 0 && <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>↔ drag to reorder</span>}
          </div>
          {imgs.length === 0 ? (
            <div className="rounded-2xl flex items-center justify-center text-sm" style={{ minHeight: 220, border: "1px solid var(--border)", color: "var(--text-faint)" }}>No images yet</div>
          ) : (
            <ReorderGrid items={imgs} onChange={(it) => setImgs(it as Img[])} />
          )}
        </div>
      </div>
    </div>
  );
}
