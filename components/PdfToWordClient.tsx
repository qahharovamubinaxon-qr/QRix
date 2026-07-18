"use client";

/* PDF → Word (Mission 93 pro pass).

   Two conversion modes, like the commercial converters:

   · "Exact layout" (default) — every text LINE becomes an absolutely
     positioned Word text frame at its precise PDF coordinates, on a page
     of the exact PDF size; images float at their true positions (behind
     the text). The DOCX opens looking 1:1 like the PDF and every line is
     editable. This is the same technique desktop converters use for
     "layout-preserving" output.

   · "Flowing text" — reconstructed paragraphs (merged lines, headings,
     alignment) that reflow naturally when edited. Best for plain
     documents you want to rewrite heavily.

   Speed: the heavy chunks (pdf.js + its worker + docx) are prefetched the
   moment a file is picked, and pages are analyzed concurrently (pool of
   4) instead of one-by-one. Everything runs privately in the browser. */

import { useEffect, useState } from "react";
import { FiFileText } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { pickSave, finishSave } from "@/lib/save-file";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Mode = "exact" | "flow";

export default function PdfToWordClient() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("exact");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  // Warm the pipeline while the user is still looking at the button —
  // by the time they click Convert, the 2MB of pdf.js + docx is cached.
  useEffect(() => {
    if (!file) return;
    import("pdfjs-dist").catch(() => {});
    import("docx").catch(() => {});
    fetch("/pdf.worker.min.mjs").catch(() => {});
  }, [file]);

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
      const docx = await import("docx");

      // ── analyze pages concurrently (pool of 4) ──
      const pageData: PageData[] = new Array(pdf.numPages);
      let analyzed = 0;
      const analyze = async (n: number) => {
        const page = await pdf.getPage(n + 1);
        const vp = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();
        const lines = buildLines(content.items, content.styles || {});
        let images: ImgBlock[] = [];
        try { images = await extractImagesPositioned(page, pdfjsLib, vp.height); } catch { images = []; }
        let full: { data: Uint8Array; w: number; h: number } | null = null;
        if (lines.length === 0 && images.length === 0) {
          try { full = await renderPagePng(page); } catch { full = null; }
        }
        pageData[n] = { wPt: vp.width, hPt: vp.height, lines, images, full };
        analyzed++;
        setProgress(`Analyzing page ${analyzed} of ${pdf.numPages}…`);
      };
      {
        const queue = Array.from({ length: pdf.numPages }, (_, i) => i);
        await Promise.all(Array.from({ length: Math.min(4, queue.length) }, async () => {
          for (;;) {
            const n = queue.shift();
            if (n === undefined) return;
            await analyze(n);
          }
        }));
      }

      setProgress("Building Word document…");
      const doc = mode === "exact" ? buildExactDoc(docx, pageData) : buildFlowDoc(docx, pageData);
      const blob = await docx.Packer.toBlob(doc);
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

      {/* conversion mode */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        {([
          ["exact", "Exact layout (1:1)", "Looks identical to the PDF — every line stays in place"],
          ["flow", "Flowing text", "Clean paragraphs that reflow as you edit"],
        ] as [Mode, string, string][]).map(([id, label, hint]) => (
          <button key={id} type="button" onClick={() => setMode(id)}
            className="rounded-xl px-3 py-2.5 text-left transition-all"
            style={{
              background: mode === id ? "var(--primary-dim, rgba(255,77,28,.14))" : "var(--surface-2)",
              border: `2px solid ${mode === id ? "var(--primary)" : "var(--border)"}`,
            }}>
            <span className="block text-[12.5px] font-extrabold" style={{ color: mode === id ? "var(--primary-bright)" : "var(--text)" }}>{label}</span>
            <span className="block text-[10.5px] mt-0.5 leading-tight" style={{ color: "var(--text-faint)" }}>{hint}</span>
          </button>
        ))}
      </div>

      <button onClick={convert} disabled={!file || loading} className="qx-btn-hero w-full mt-4 disabled:opacity-50">
        {loading ? "Converting…" : <><FiFileText size={15} /> Convert to Word</>}
      </button>
      {progress && <p className="text-[12px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>⏳ {progress}</p>}
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>
        Exact layout keeps the page size, positions, fonts and images 1:1 with the PDF while the text stays editable.
        Scanned pages are embedded as images automatically. Runs privately in your browser.
      </p>
    </div>
  );
}

/* ── types ── */
type Run = { text: string; size: number; bold: boolean; italic: boolean; font: string };
type Line = { y: number; x0: number; x1: number; size: number; runs: Run[] };
type ImgBlock = { data: Uint8Array; srcW: number; srcH: number; wPt: number; hPt: number; xPt: number; topPt: number };
type PageData = { wPt: number; hPt: number; lines: Line[]; images: ImgBlock[]; full: { data: Uint8Array; w: number; h: number } | null };

const T = 20;      // pt → twips
const EMU = 12700; // pt → EMU

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

/* ── the 1:1 document: one section per page, frame-positioned lines ── */
function buildExactDoc(d: any, pages: PageData[]) {
  const { Document, Paragraph, TextRun, ImageRun, FrameAnchorType, FrameWrap, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType } = d;
  const sections = pages.map((pg) => {
    const children: any[] = [];

    // floating images (and the scanned-page fallback), behind the text
    const floats: any[] = [];
    if (pg.full) {
      floats.push(new ImageRun({
        data: pg.full.data, type: "png",
        transformation: { width: Math.round(pg.wPt * (96 / 72)), height: Math.round(pg.hPt * (96 / 72)) },
        floating: {
          horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
          verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
          wrap: { type: TextWrappingType.NONE }, behindDocument: true,
        },
      }));
    }
    for (const im of pg.images) {
      const wPt = im.wPt || im.srcW * (72 / 96);
      const hPt = im.hPt || (im.srcH / im.srcW) * wPt;
      floats.push(new ImageRun({
        data: im.data, type: "png",
        transformation: { width: Math.round(wPt * (96 / 72)), height: Math.round(hPt * (96 / 72)) },
        floating: {
          horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: Math.round(im.xPt * EMU) },
          verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: Math.round(im.topPt * EMU) },
          wrap: { type: TextWrappingType.NONE }, behindDocument: true,
        },
      }));
    }
    if (floats.length) children.push(new Paragraph({ spacing: { before: 0, after: 0 }, children: floats }));

    // every line at its exact position, in an absolutely anchored frame
    for (const ln of pg.lines) {
      const ascent = ln.size * 0.82;
      const topPt = clamp(pg.hPt - (ln.y + ascent), 0, pg.hPt);
      const widthPt = Math.max(ln.x1 - ln.x0, ln.size) + ln.size * 1.2; // headroom so Word never wraps the line
      children.push(new Paragraph({
        frame: {
          type: "absolute",
          position: { x: Math.round(ln.x0 * T), y: Math.round(topPt * T) },
          width: Math.round(widthPt * T),
          height: Math.round(ln.size * 1.35 * T),
          anchor: { horizontal: FrameAnchorType.PAGE, vertical: FrameAnchorType.PAGE },
          wrap: FrameWrap.NONE,
        },
        spacing: { before: 0, after: 0, line: Math.round(ln.size * 1.15 * T), lineRule: "exact" },
        children: ln.runs.map((r) => new TextRun({
          text: r.text, bold: r.bold, italics: r.italic,
          size: Math.round(clamp(r.size, 4, 96) * 2), font: r.font,
        })),
      }));
    }

    if (!children.length) children.push(new Paragraph({ children: [] }));
    return {
      properties: {
        page: {
          size: { width: Math.round(pg.wPt * T), height: Math.round(pg.hPt * T) },
          margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0, gutter: 0 },
        },
      },
      children,
    };
  });
  return new Document({ sections });
}

/* ── the reflowing document: merged paragraphs, headings, alignment ── */
function buildFlowDoc(d: any, pages: PageData[]) {
  const { Document, Paragraph, TextRun, ImageRun, HeadingLevel, AlignmentType } = d;
  const allSizes: number[] = [];
  pages.forEach((p) => p.lines.forEach((l) => l.runs.forEach((r) => allSizes.push(r.size))));
  const median = allSizes.length ? allSizes.slice().sort((a, b) => a - b)[Math.floor(allSizes.length / 2)] : 12;

  const children: any[] = [];
  pages.forEach((pg, n) => {
    if (n > 0) children.push(new Paragraph({ children: [], pageBreakBefore: true }));

    type Blk = { kind: "line"; y: number; ln: Line } | { kind: "img"; y: number; im: ImgBlock } | { kind: "full"; y: number };
    let blocks: Blk[] = [
      ...pg.lines.map((ln) => ({ kind: "line" as const, y: ln.y, ln })),
      ...pg.images.map((im) => ({ kind: "img" as const, y: pg.hPt - im.topPt, im })),
    ];
    blocks.sort((a, b) => b.y - a.y);
    if (pg.full) blocks = [{ kind: "full", y: 0 }];

    // merge consecutive text lines into paragraphs: same size, small gap
    let para: { runs: Run[]; size: number; x0: number; x1: number; lastY: number } | null = null;
    const flushPara = () => {
      if (!para) return;
      const isHeading = para.runs.length <= 10 && para.size >= median * 1.35;
      const mid = (para.x0 + para.x1) / 2;
      const centered = Math.abs(mid - pg.wPt / 2) < pg.wPt * 0.05 && para.x0 > pg.wPt * 0.14;
      children.push(new Paragraph({
        heading: isHeading ? (para.size >= median * 1.8 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2) : undefined,
        alignment: centered ? AlignmentType.CENTER : para.x0 > pg.wPt * 0.5 ? AlignmentType.RIGHT : undefined,
        spacing: { after: isHeading ? 160 : 120 },
        children: para.runs.map((r) => new TextRun({
          text: r.text, bold: r.bold || isHeading, italics: r.italic,
          size: Math.round(clamp(r.size, 6, 72) * 2), font: r.font,
        })),
      }));
      para = null;
    };

    for (const b of blocks) {
      if (b.kind === "full") {
        if (pg.full) {
          flushPara();
          children.push(new Paragraph({ children: [
            new ImageRun({ data: pg.full.data, type: "png", transformation: { width: 620, height: Math.round((pg.full.h / pg.full.w) * 620) } }),
          ] }));
        }
        continue;
      }
      if (b.kind === "img") {
        flushPara();
        const wPx = clamp(b.im.wPt * (96 / 72) || b.im.srcW, 40, 620);
        children.push(new Paragraph({ spacing: { before: 80, after: 80 }, children: [
          new ImageRun({ data: b.im.data, type: "png", transformation: { width: Math.round(wPx), height: Math.round((b.im.srcH / b.im.srcW) * wPx) } }),
        ] }));
        continue;
      }
      const ln = b.ln;
      const joinable = para
        && Math.abs(para.size - ln.size) < 0.7
        && para.lastY - ln.y < ln.size * 1.7
        && !(ln.runs.length <= 10 && ln.size >= median * 1.35);
      if (joinable && para) {
        const glue = /[-‐‑]$/.test(para.runs[para.runs.length - 1].text) ? "" : " ";
        if (glue) para.runs[para.runs.length - 1].text += glue;
        para.runs.push(...ln.runs.map((r) => ({ ...r })));
        para.x0 = Math.min(para.x0, ln.x0); para.x1 = Math.max(para.x1, ln.x1); para.lastY = ln.y;
      } else {
        flushPara();
        para = { runs: ln.runs.map((r) => ({ ...r })), size: ln.size, x0: ln.x0, x1: ln.x1, lastY: ln.y };
      }
    }
    flushPara();
  });

  return new Document({ sections: [{ properties: { page: { margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 } } }, children }] });
}

/* ── text extraction: lines with geometry + mapped fonts ── */
function mapFont(styles: any, fontName: string): string {
  const fam = String(styles?.[fontName]?.fontFamily || "").toLowerCase();
  const fn = String(fontName || "").toLowerCase();
  if (fam.includes("monospace") || fn.includes("courier") || fn.includes("mono")) return "Courier New";
  if (fam.includes("serif") && !fam.includes("sans") || fn.includes("times") || fn.includes("georgia") || fn.includes("garamond")) return "Times New Roman";
  return "Arial";
}

function buildLines(items: any[], styles: any): Line[] {
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
  const lines: Line[] = [];
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    const runs: Run[] = [];
    let prevEnd: number | null = null;
    let x0 = Infinity, x1 = -Infinity, maxSize = 0;
    for (const it of row.items) {
      const fn = String(it.fontName || "").toLowerCase();
      const bold = fn.includes("bold") || fn.includes("black") || fn.includes("semibold");
      const italic = fn.includes("italic") || fn.includes("oblique");
      const font = mapFont(styles, it.fontName);
      let text = it.str;
      if (prevEnd !== null && it.x - prevEnd > it.size * 0.25 && !text.startsWith(" ")) text = " " + text;
      const end = it.x + (it.width || 0);
      prevEnd = end;
      x0 = Math.min(x0, it.x); x1 = Math.max(x1, end); maxSize = Math.max(maxSize, it.size);
      const last = runs[runs.length - 1];
      if (last && last.bold === bold && last.italic === italic && last.font === font && Math.abs(last.size - it.size) < 0.6) last.text += text;
      else runs.push({ text, size: it.size, bold, italic, font });
    }
    if (runs.map((r) => r.text).join("").trim()) lines.push({ y: row.y, x0, x1, size: maxSize, runs });
  }
  return lines;
}

/* track the CTM through the operator list to capture each image's position+size */
async function extractImagesPositioned(page: any, pdfjsLib: any, pageHPt: number): Promise<ImgBlock[]> {
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
      out.push({
        data: png, srcW: obj.width, srcH: obj.height, wPt, hPt,
        xPt: f.m[4],
        topPt: clamp(pageHPt - (f.m[5] + hPt), 0, pageHPt),
      });
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
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/png"));
  if (!blob) return null;
  return { data: new Uint8Array(await blob.arrayBuffer()), w: canvas.width, h: canvas.height };
}
