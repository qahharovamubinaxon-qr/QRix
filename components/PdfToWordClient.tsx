"use client";

import { useState } from "react";
import { FiFileText } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default function PdfToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  async function convert() {
    if (!file) return;
    const outName = file.name.replace(/\.pdf$/i, "") + ".docx";
    const target = await pickSave(outName);
    if (target.kind === "cancelled") return;
    setLoading(true);
    setProgress("Reading PDF…");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
      const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer(), verbosity: 0 }).promise;

      const { Document, Packer, Paragraph, TextRun, ImageRun, HeadingLevel } = await import("docx");

      // collect blocks + sizes
      const pages: Block[][] = [];
      const allSizes: number[] = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        setProgress(`Analyzing page ${n} of ${pdf.numPages}…`);
        const page = await pdf.getPage(n);
        const content = await page.getTextContent();
        const lines = buildLines(content.items);
        lines.forEach((l) => l.runs.forEach((r) => allSizes.push(r.size)));
        let images: ImgBlock[] = [];
        try { images = await extractImagesPositioned(page, pdfjsLib); } catch { images = []; }

        let blocks: Block[] = [
          ...lines.map((l) => ({ kind: "line" as const, y: l.y, runs: l.runs })),
          ...images.map((im) => ({ kind: "img" as const, y: im.yTop, img: im })),
        ];
        blocks.sort((a, b) => b.y - a.y);

        // scanned page fallback: no text + no images → embed the whole page image
        if (lines.length === 0 && images.length === 0) {
          const full = await renderPagePng(page);
          if (full) blocks = [{ kind: "img", y: 0, img: { data: full.data, srcW: full.w, srcH: full.h, wPt: 0, yTop: 0 } }];
        }
        pages.push(blocks);
      }

      const median = allSizes.length ? allSizes.slice().sort((a, b) => a - b)[Math.floor(allSizes.length / 2)] : 12;

      const children: any[] = [];
      for (let n = 0; n < pages.length; n++) {
        if (n > 0) children.push(new Paragraph({ children: [], pageBreakBefore: true }));
        for (const b of pages[n]) {
          if (b.kind === "line") {
            const lineSize = Math.max(...b.runs.map((r) => r.size));
            const isHeading = b.runs.length <= 10 && lineSize >= median * 1.35;
            children.push(new Paragraph({
              heading: isHeading ? (lineSize >= median * 1.8 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2) : undefined,
              spacing: { after: isHeading ? 120 : 60 },
              children: b.runs.map((r) => new TextRun({ text: r.text, bold: r.bold || isHeading, italics: r.italic, size: Math.round(clamp(r.size, 8, 36) * 2), font: "Calibri" })),
            }));
          } else {
            const im = b.img;
            const wPx = clamp((im.wPt ? im.wPt * (96 / 72) : im.srcW), 40, 620);
            const hPx = Math.round((im.srcH / im.srcW) * wPx);
            children.push(new Paragraph({ spacing: { before: 80, after: 80 }, children: [
              new ImageRun({ data: im.data, type: "png", transformation: { width: Math.round(wPx), height: hPx } }),
            ] }));
          }
        }
      }

      setProgress("Building Word document…");
      const doc = new Document({ sections: [{ properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } }, children }] });
      const blob = await Packer.toBlob(doc);
      setProgress("");
      await finishSave(target, blob, outName);
    } catch (e) {
      setProgress("");
      alert("Conversion failed: " + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" />
      <button onClick={convert} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? "Converting…" : <><FiFileText size={15} /> Convert to Word</>}
      </button>
      {progress && <p className="text-[12px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>⏳ {progress}</p>}
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>
        Rebuilds editable text (correct reading order, fonts &amp; sizes) and keeps the PDF&apos;s images in their place.
        Scanned pages are embedded as images automatically. Runs privately in your browser.
      </p>
    </div>
  );
}

/* ── types ── */
type Run = { text: string; size: number; bold: boolean; italic: boolean };
type LineBlock = { kind: "line"; y: number; runs: Run[] };
type ImgBlock = { data: Uint8Array; srcW: number; srcH: number; wPt: number; yTop: number };
type Block = LineBlock | { kind: "img"; y: number; img: ImgBlock };

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

function buildLines(items: any[]): { y: number; runs: Run[] }[] {
  const rows: { y: number; items: any[] }[] = [];
  for (const it of items) {
    if (typeof it.str !== "string" || !it.transform) continue;
    const y = it.transform[5];
    const size = Math.hypot(it.transform[2], it.transform[3]) || Math.abs(it.transform[3]) || 12;
    let row = rows.find((r) => Math.abs(r.y - y) <= size * 0.5);
    if (!row) { row = { y, items: [] }; rows.push(row); }
    row.items.push({ ...it, x: it.transform[4], size });
  }
  rows.sort((a, b) => b.y - a.y);
  const lines: { y: number; runs: Run[] }[] = [];
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
    if (runs.map((r) => r.text).join("").trim()) lines.push({ y: row.y, runs });
  }
  return lines;
}

/* track the CTM through the operator list to capture each image's position+size */
async function extractImagesPositioned(page: any, pdfjsLib: any): Promise<ImgBlock[]> {
  const ops = await page.getOperatorList();
  const OPS = pdfjsLib.OPS;
  let ctm: number[] = [1, 0, 0, 1, 0, 0];
  const stack: number[][] = [];
  const found: { name: string; m: number[] }[] = [];
  for (let i = 0; i < ops.fnArray.length; i++) {
    const fn = ops.fnArray[i];
    const args = ops.argsArray[i];
    if (fn === OPS.save) stack.push(ctm.slice());
    else if (fn === OPS.restore) { if (stack.length) ctm = stack.pop()!; }
    else if (fn === OPS.transform) ctm = mul(ctm, args as number[]);
    else if (fn === OPS.paintImageXObject || fn === OPS.paintJpegXObject) {
      const nm = args?.[0];
      if (typeof nm === "string") found.push({ name: nm, m: ctm.slice() });
    }
  }
  const out: ImgBlock[] = [];
  for (const f of found) {
    try {
      const obj: any = await new Promise((res) => { if (page.objs.has(f.name)) res(page.objs.get(f.name)); else page.objs.get(f.name, res); });
      if (!obj || !obj.width || !obj.height || !obj.data) continue;
      if (obj.width * obj.height < 2500) continue;
      const png = await imgObjToPng(obj);
      if (!png) continue;
      const wPt = Math.hypot(f.m[0], f.m[1]);
      const hPt = Math.hypot(f.m[2], f.m[3]);
      const yTop = f.m[5] + hPt; // top edge in PDF coords
      out.push({ data: png, srcW: obj.width, srcH: obj.height, wPt, yTop });
    } catch { /* skip */ }
  }
  return out;
}

function mul(m1: number[], m2: number[]): number[] {
  return [
    m1[0] * m2[0] + m1[2] * m2[1],
    m1[1] * m2[0] + m1[3] * m2[1],
    m1[0] * m2[2] + m1[2] * m2[3],
    m1[1] * m2[2] + m1[3] * m2[3],
    m1[0] * m2[4] + m1[2] * m2[5] + m1[4],
    m1[1] * m2[4] + m1[3] * m2[5] + m1[5],
  ];
}

async function imgObjToPng(obj: any): Promise<Uint8Array | null> {
  const { width, height, data, kind } = obj;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const out = ctx.createImageData(width, height);
  const px = out.data;
  if (kind === 3) px.set(data.subarray(0, width * height * 4));
  else if (kind === 2) { for (let i = 0, j = 0; i < width * height; i++) { px[j++] = data[i * 3]; px[j++] = data[i * 3 + 1]; px[j++] = data[i * 3 + 2]; px[j++] = 255; } }
  else { for (let i = 0, j = 0; i < width * height; i++) { const v = data[i] ?? 0; px[j++] = v; px[j++] = v; px[j++] = v; px[j++] = 255; } }
  ctx.putImageData(out, 0, 0);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
  if (!blob) return null;
  return new Uint8Array(await blob.arrayBuffer());
}

async function renderPagePng(page: any): Promise<{ data: Uint8Array; w: number; h: number } | null> {
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  canvas.width = viewport.width; canvas.height = viewport.height;
  await page.render({ canvasContext: ctx, viewport }).promise;
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
  if (!blob) return null;
  return { data: new Uint8Array(await blob.arrayBuffer()), w: canvas.width, h: canvas.height };
}
