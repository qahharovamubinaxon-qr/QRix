"use client";

import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Mode = "editable" | "exact";

export default function PdfToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [mode, setMode] = useState<Mode>("editable");

  async function convert() {
    if (!file) return;
    setLoading(true);
    setProgress("Reading PDF…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const bytes = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: bytes, verbosity: 0 }).promise;
      if (mode === "exact") await convertExact(pdf);
      else await convertEditable(pdf, pdfjsLib);
      setProgress("");
    } catch (e) {
      setProgress("");
      alert("Conversion failed: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // ── EDITABLE: position-aware text + embedded images ──
  async function convertEditable(pdf: any, pdfjsLib: any) {
    const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel } = await import("docx");
    const { saveAs } = await import("file-saver");

    // first pass: median font size for heading detection
    const allSizes: number[] = [];
    const pageData: { lines: Line[]; images: PngImg[] }[] = [];

    for (let n = 1; n <= pdf.numPages; n++) {
      setProgress(`Analyzing page ${n} of ${pdf.numPages}…`);
      const page = await pdf.getPage(n);
      const content = await page.getTextContent();
      const lines = buildLines(content.items);
      lines.forEach((l) => l.runs.forEach((r) => allSizes.push(r.size)));
      const images = await extractImages(page, pdfjsLib).catch(() => []);
      pageData.push({ lines, images });
    }

    const median = allSizes.length ? allSizes.slice().sort((a, b) => a - b)[Math.floor(allSizes.length / 2)] : 12;

    const children: any[] = [];
    for (let n = 0; n < pageData.length; n++) {
      if (n > 0) children.push(new Paragraph({ children: [], pageBreakBefore: true }));
      const { lines, images } = pageData[n];

      for (const line of lines) {
        const lineSize = Math.max(...line.runs.map((r) => r.size));
        const isHeading = line.runs.length <= 8 && lineSize >= median * 1.35;
        children.push(
          new Paragraph({
            heading: isHeading ? (lineSize >= median * 1.8 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2) : undefined,
            spacing: { after: isHeading ? 120 : 60 },
            children: line.runs.map(
              (r) => new TextRun({ text: r.text, bold: r.bold || isHeading, italics: r.italic, size: Math.round(clamp(r.size, 8, 36) * 2), font: "Calibri" })
            ),
          })
        );
      }

      for (const img of images) {
        const w = Math.min(520, img.width);
        children.push(new Paragraph({ spacing: { before: 120, after: 120 }, children: [
          new ImageRun({ data: img.data, type: "png", transformation: { width: w, height: Math.round((img.height / img.width) * w) } }),
        ] }));
      }
    }

    setProgress("Building Word document…");
    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } }, children }] });
    saveAs(await Packer.toBlob(doc), file!.name.replace(/\.pdf$/i, "") + ".docx");
    alert("Word file created (editable) ✅");
  }

  // ── EXACT: each page as a high-res image (pixel-perfect look) ──
  async function convertExact(pdf: any) {
    const { Document, Packer, Paragraph, ImageRun } = await import("docx");
    const { saveAs } = await import("file-saver");
    const children: any[] = [];
    for (let n = 1; n <= pdf.numPages; n++) {
      setProgress(`Rendering page ${n} of ${pdf.numPages}…`);
      const page = await pdf.getPage(n);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) continue;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport }).promise;
      const blob = await new Promise<Blob>((res) => canvas.toBlob((b) => res(b as Blob), "image/png", 1));
      const u8 = new Uint8Array(await blob.arrayBuffer());
      if (n > 1) children.push(new Paragraph({ children: [], pageBreakBefore: true }));
      const w = 600;
      children.push(new Paragraph({ children: [new ImageRun({ data: u8, type: "png", transformation: { width: w, height: Math.round((canvas.height / canvas.width) * w) } })] }));
    }
    const doc = new Document({ sections: [{ properties: { page: { margin: { top: 720, right: 720, bottom: 720, left: 720 } } }, children }] });
    saveAs(await Packer.toBlob(doc), file!.name.replace(/\.pdf$/i, "") + "-exact.docx");
    alert("Word file created (exact layout) ✅");
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />

      <div className="grid grid-cols-2 gap-3 mt-4">
        <ModeCard active={mode === "editable"} onClick={() => setMode("editable")} title="📝 Editable" sub="Text stays editable, images kept, reading order preserved" />
        <ModeCard active={mode === "exact"} onClick={() => setMode("exact")} title="🖼️ Exact layout" sub="Pixel-perfect look (each page as image, not editable)" />
      </div>

      <button onClick={convert} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? "Converting…" : <><FiFileText size={15} /> Convert to Word</>}
      </button>
      {progress && <p className="text-[12px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>⏳ {progress}</p>}
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>
        Runs privately in your browser. <b>Editable</b> rebuilds real text with fonts &amp; sizes and embeds images — best for text PDFs.
        <b> Exact layout</b> guarantees an identical look for scans and complex designs.
      </p>
    </div>
  );
}

function ModeCard({ active, onClick, title, sub }: { active: boolean; onClick: () => void; title: string; sub: string }) {
  return (
    <button onClick={onClick} className="text-left p-3 rounded-xl transition-all"
      style={{ background: active ? "rgba(245,143,32,0.12)" : "var(--surface-2)", border: `1px solid ${active ? "var(--primary)" : "var(--border)"}` }}>
      <div className="text-[13px] font-bold" style={{ color: active ? "var(--primary-bright)" : "var(--text)" }}>{title}</div>
      <div className="text-[11px] mt-1 leading-snug" style={{ color: "var(--text-muted)" }}>{sub}</div>
    </button>
  );
}

/* ── helpers ── */

type Run = { text: string; size: number; bold: boolean; italic: boolean };
type Line = { y: number; runs: Run[] };
type PngImg = { data: Uint8Array; width: number; height: number };

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function buildLines(items: any[]): Line[] {
  const rows: { y: number; items: any[] }[] = [];
  for (const it of items) {
    if (!it.str && it.str !== "") continue;
    if (typeof it.str !== "string" || !it.transform) continue;
    const y = it.transform[5];
    const size = Math.hypot(it.transform[2], it.transform[3]) || Math.abs(it.transform[3]) || 12;
    let row = rows.find((r) => Math.abs(r.y - y) <= size * 0.5);
    if (!row) { row = { y, items: [] }; rows.push(row); }
    row.items.push({ ...it, x: it.transform[4], size });
  }
  rows.sort((a, b) => b.y - a.y); // top → bottom (PDF origin is bottom-left)
  const lines: Line[] = [];
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    const runs: Run[] = [];
    let prevEnd: number | null = null;
    for (const it of row.items) {
      const fn = String(it.fontName || "").toLowerCase();
      const bold = fn.includes("bold") || fn.includes("black") || fn.includes("semibold");
      const italic = fn.includes("italic") || fn.includes("oblique");
      let text = it.str;
      if (prevEnd !== null && it.x - prevEnd > it.size * 0.25 && !text.startsWith(" ")) text = " " + text;
      prevEnd = it.x + (it.width || 0);
      const last = runs[runs.length - 1];
      if (last && last.bold === bold && last.italic === italic && Math.abs(last.size - it.size) < 0.6) last.text += text;
      else runs.push({ text, size: it.size, bold, italic });
    }
    const joined = runs.map((r) => r.text).join("").trim();
    if (joined) lines.push({ y: row.y, runs });
  }
  return lines;
}

async function extractImages(page: any, pdfjsLib: any): Promise<PngImg[]> {
  const ops = await page.getOperatorList();
  const OPS = pdfjsLib.OPS;
  const names: string[] = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject) {
      const nm = ops.argsArray[i]?.[0];
      if (typeof nm === "string" && !names.includes(nm)) names.push(nm);
    }
  }
  const out: PngImg[] = [];
  for (const nm of names) {
    try {
      const obj: any = await new Promise((res) => {
        if (page.objs.has(nm)) res(page.objs.get(nm));
        else page.objs.get(nm, res);
      });
      if (!obj || !obj.width || !obj.height || !obj.data) continue;
      if (obj.width * obj.height < 2500) continue; // skip tiny icons/spacers
      const png = await imgObjToPng(obj);
      if (png) out.push({ data: png, width: obj.width, height: obj.height });
    } catch { /* skip */ }
  }
  return out;
}

async function imgObjToPng(obj: any): Promise<Uint8Array | null> {
  const { width, height, data, kind } = obj;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const out = ctx.createImageData(width, height);
  const px = out.data;
  // pdfjs ImageKind: 1=GRAYSCALE_1BPP, 2=RGB_24BPP, 3=RGBA_32BPP
  if (kind === 3) {
    px.set(data.subarray(0, width * height * 4));
  } else if (kind === 2) {
    for (let i = 0, j = 0; i < width * height; i++) {
      px[j++] = data[i * 3]; px[j++] = data[i * 3 + 1]; px[j++] = data[i * 3 + 2]; px[j++] = 255;
    }
  } else {
    // grayscale or unknown: best-effort treat as luminance bytes
    for (let i = 0, j = 0; i < width * height; i++) {
      const v = data[i] ?? 0; px[j++] = v; px[j++] = v; px[j++] = v; px[j++] = 255;
    }
  }
  ctx.putImageData(out, 0, 0);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}
