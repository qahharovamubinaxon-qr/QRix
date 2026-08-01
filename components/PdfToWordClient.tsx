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
import { saveBlob } from "@/lib/save-file";
import { toolUI, type ToolLang } from "@/lib/tool-ui-i18n";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Mode = "cloud" | "exact" | "flow";

export default function PdfToWordClient({ lang = "en" }: { lang?: ToolLang }) {
  const t = toolUI(lang);
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<Mode>("exact");
  const [cloudReady, setCloudReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");

  // Is the high-fidelity server chain configured? If so, offer it and make it
  // the default (it matches desktop converters); otherwise the on-device modes
  // are all there is.
  useEffect(() => {
    let dead = false;
    fetch("/api/pdf-to-word")
      .then((r) => r.json())
      .then((j) => { if (!dead && j?.available) { setCloudReady(true); setMode("cloud"); } })
      .catch(() => {});
    return () => { dead = true; };
  }, []);

  // Warm the pipeline while the user is still looking at the button —
  // by the time they click Convert, the 2MB of pdf.js + docx is cached.
  useEffect(() => {
    if (!file || mode === "cloud") return;
    import("pdfjs-dist").catch(() => {});
    import("docx").catch(() => {});
    fetch("/pdf.worker.min.mjs").catch(() => {});
  }, [file, mode]);

  /** High-fidelity cloud path: upload the PDF to the provider chain. Falls back
      to on-device exact mode if the server has no providers or errors. */
  async function convertCloud(f: File): Promise<boolean> {
    setProgress(t.pdfToWord.onServer);
    try {
      const res = await fetch("/api/pdf-to-word", {
        method: "POST",
        headers: { "Content-Type": "application/pdf" },
        body: await f.arrayBuffer(),
      });
      if (!res.ok) return false;
      const blob = await res.blob();
      if (blob.size < 1000) return false;
      setProgress("");
      await saveBlob(blob, f.name.replace(/\.pdf$/i, "") + ".docx");
      return true;
    } catch {
      return false;
    }
  }

  async function convert() {
    if (!file) return;
    // Cloud mode: try the server; if it can't, transparently fall back on-device.
    if (mode === "cloud") {
      setLoading(true);
      const ok = await convertCloud(file);
      if (ok) { setLoading(false); return; }
      setProgress(t.pdfToWord.serverUnavailable);
      // fall through to the on-device path below (exact layout)
    }
    const outName = file.name.replace(/\.pdf$/i, "") + ".docx";
    // Build the .docx FIRST, save LAST. The old flow opened the save picker
    // up front, which creates the target file empty — so any error during
    // conversion left the user with a 0-byte Word file. Now the file is only
    // written once the bytes exist; a failure downloads nothing.
    setLoading(true);
    setProgress(t.pdfToWord.readingPdf);
    // when cloud fell through, the on-device fallback uses the exact layout
    const onDevice: "exact" | "flow" = mode === "flow" ? "flow" : "exact";
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
        // Resolve the REAL font faces: item.fontName is an opaque id
        // ("g_d0_f1"); the loaded font object in commonObjs knows the true
        // PostScript name ("ABCDEE+Verdana-Bold") — that's where bold/italic
        // and the actual family live.
        const fontInfo: Record<string, { family: string; bold: boolean; italic: boolean }> = {};
        for (const it of content.items as any[]) {
          const fn = it?.fontName;
          if (!fn || fontInfo[fn]) continue;
          let psName = "";
          try { if (page.commonObjs.has(fn)) psName = String(page.commonObjs.get(fn)?.name || ""); } catch { /* opaque */ }
          const lower = psName.toLowerCase();
          const fam = String((content.styles || {})[fn]?.fontFamily || "").toLowerCase();
          const pick =
            lower.includes("verdana") ? "Verdana" :
            lower.includes("tahoma") ? "Tahoma" :
            lower.includes("georgia") ? "Georgia" :
            lower.includes("courier") || fam.includes("monospace") ? "Courier New" :
            lower.includes("times") || (fam.includes("serif") && !fam.includes("sans")) ? "Times New Roman" :
            // Tahoma, not Arial: some Windows builds ship a replaced/broken
            // Arial that Word substitutes with an OCR-style face (seen in the
            // wild); Tahoma is present everywhere and metrically close.
            "Tahoma";
          fontInfo[fn] = {
            family: pick,
            bold: lower.includes("bold") || lower.includes("black") || lower.includes("semibold") || lower.includes("heavy"),
            italic: lower.includes("italic") || lower.includes("oblique"),
          };
        }
        // exact mode: split form/table rows into independently positioned cells
        const lines = buildLines(content.items, fontInfo, onDevice === "exact");
        let images: ImgBlock[] = [];
        let full: { data: Uint8Array; w: number; h: number } | null = null;
        let bg: Uint8Array | null = null;
        if (onDevice === "exact") {
          // Everything that is not text (vector table borders, logos, stamps,
          // photos) lives in a full-page render with the text lines covered
          // over; the editable text frames sit on top. No per-object plumbing
          // — object stores can leave a getter waiting forever (seen in the
          // wild: images parked in commonObjs, not page.objs).
          try { bg = await renderPageBackground(page, lines, vp.width, vp.height); } catch { bg = null; }
          // Frame width must fit WORD's rendering of the text, not the PDF's —
          // different font metrics made long lines wrap inside their frame.
          const mctx = document.createElement("canvas").getContext("2d");
          if (mctx) {
            for (const ln of lines) {
              let wsum = 0;
              for (const r of ln.runs) {
                mctx.font = `${r.bold ? "bold " : ""}${r.italic ? "italic " : ""}${ln.size}px ${r.font}`;
                wsum += mctx.measureText(r.text).width;
              }
              ln.wMeasured = wsum;
            }
          }
        } else {
          try { images = await extractImagesPositioned(page, pdfjsLib, vp.height); } catch { images = []; }
          if (lines.length === 0 && images.length === 0) {
            try { full = await renderPagePng(page); } catch { full = null; }
          }
        }
        pageData[n] = { wPt: vp.width, hPt: vp.height, lines, images, full, bg };
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

      setProgress(t.pdfToWord.buildingDoc);
      const doc = onDevice === "exact" ? buildExactDoc(docx, pageData) : buildFlowDoc(docx, pageData);
      const blob = await docx.Packer.toBlob(doc);
      if (!blob || blob.size < 1000) throw new Error("empty document");
      setProgress("");
      // Save only now that we have real bytes — never a 0-byte file.
      await saveBlob(blob, outName);
    } catch (e) {
      setProgress("");
      alert(t.pdfToWord.failed + (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={setFile} accept=".pdf" lang={lang} />

      {/* conversion mode */}
      <div className={`grid gap-2 mt-4 ${cloudReady ? "sm:grid-cols-3 grid-cols-1" : "grid-cols-2"}`}>
        {((cloudReady ? (["cloud", "exact", "flow"] as const) : (["exact", "flow"] as const))
          .map((id) => [id, t.pdfToWord.modes[id].label, t.pdfToWord.modes[id].hint] as [Mode, string, string])
        ).map(([id, label, hint]) => (
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
        {loading ? t.pdfToWord.converting : <><FiFileText size={15} /> {t.pdfToWord.convertBtn}</>}
      </button>
      {progress && <p className="text-[12px] mt-2 text-center" style={{ color: "var(--primary-bright)" }}>⏳ {progress}</p>}
      <p className="text-[11px] mt-3" style={{ color: "var(--text-faint)" }}>
        {mode === "cloud" ? t.pdfToWord.noteCloud : t.pdfToWord.noteDevice}
      </p>
    </div>
  );
}

/* ── types ── */
type Run = { text: string; size: number; bold: boolean; italic: boolean; font: string };
type Line = { y: number; x0: number; x1: number; size: number; runs: Run[]; color?: string; wMeasured?: number };
type ImgBlock = { data: Uint8Array; srcW: number; srcH: number; wPt: number; hPt: number; xPt: number; topPt: number };
type PageData = { wPt: number; hPt: number; lines: Line[]; images: ImgBlock[]; full: { data: Uint8Array; w: number; h: number } | null; bg: Uint8Array | null };

const T = 20;      // pt → twips
const EMU = 12700; // pt → EMU

function clamp(n: number, a: number, b: number) { return Math.max(a, Math.min(b, n)); }

/* ── the 1:1 document: one section per page, frame-positioned lines ── */
function buildExactDoc(d: any, pages: PageData[]) {
  const { Document, Paragraph, TextRun, ImageRun, FrameAnchorType, FrameWrap, HorizontalPositionRelativeFrom, VerticalPositionRelativeFrom, TextWrappingType } = d;
  const sections = pages.map((pg) => {
    const children: any[] = [];

    // the page's graphics layer (vector lines, logos, stamps, photos, scans)
    // — a full-page render with the text whited out, behind everything
    if (pg.bg) {
      children.push(new Paragraph({
        spacing: { before: 0, after: 0 },
        children: [new ImageRun({
          data: pg.bg, type: "jpg",
          transformation: { width: Math.round(pg.wPt * (96 / 72)), height: Math.round(pg.hPt * (96 / 72)) },
          floating: {
            horizontalPosition: { relative: HorizontalPositionRelativeFrom.PAGE, offset: 0 },
            verticalPosition: { relative: VerticalPositionRelativeFrom.PAGE, offset: 0 },
            wrap: { type: TextWrappingType.NONE }, behindDocument: true,
          },
        })],
      }));
    }

    // every line at its exact position, in an absolutely anchored frame
    for (const ln of pg.lines) {
      const ascent = ln.size * 0.82;
      const topPt = clamp(pg.hPt - (ln.y + ascent), 0, pg.hPt);
      // width headroom: Word's font metrics beat the PDF's measured width or
      // the line wraps INSIDE its frame and the layout stacks up
      const widthPt = Math.max(ln.x1 - ln.x0, ln.wMeasured || 0, ln.size) + ln.size * 0.9;
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
          color: ln.color || undefined,
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

/* ── text extraction: lines with geometry + resolved fonts ── */
type FontInfo = Record<string, { family: string; bold: boolean; italic: boolean }>;

/* splitCols: a visual row in a form/table holds SEVERAL independent cells
   (label … value, columns). Gluing them into one frame drags the right-hand
   text to the left frame's x and wrecks the layout — measured 70 of 160
   segments misplaced on a real policy PDF. In exact mode every run of text
   separated by a wide gap becomes its own positioned segment. */
function buildLines(items: any[], fonts: FontInfo, splitCols = false): Line[] {
  const rows: { y: number; items: any[] }[] = [];
  for (const it of items) {
    if (typeof it.str !== "string" || !it.transform) continue;
    const y = it.transform[5];
    const size = Math.hypot(it.transform[2], it.transform[3]) || Math.abs(it.transform[3]) || 12;
    // 0.62: filled-in form values often sit on a slightly shifted baseline —
    // 0.5 pushed them onto their own row below the label
    let row = rows.find((r) => Math.abs(r.y - y) <= size * 0.62);
    if (!row) { row = { y, items: [] }; rows.push(row); }
    row.items.push({ ...it, x: it.transform[4], size });
  }
  rows.sort((a, b) => b.y - a.y);
  const lines: Line[] = [];
  for (const row of rows) {
    row.items.sort((a, b) => a.x - b.x);
    let runs: Run[] = [];
    let prevEnd: number | null = null;
    let prevLen = 99;
    let x0 = Infinity, x1 = -Infinity, maxSize = 0;
    const flush = () => {
      if (runs.map((r) => r.text).join("").trim()) lines.push({ y: row.y, x0, x1, size: maxSize, runs });
      runs = []; x0 = Infinity; x1 = -Infinity; maxSize = 0; prevEnd = null; prevLen = 99;
    };
    for (const it of row.items) {
      // whitespace-only items bridge column gaps and mask the split point —
      // in column mode drop them; real word spacing comes from the gap rule
      if (splitCols && !it.str.trim()) continue;
      if (splitCols && prevEnd !== null && it.x - prevEnd > it.size * 1.1) flush();
      const info = fonts[it.fontName] || { family: "Tahoma", bold: false, italic: false };
      const bold = info.bold;
      const italic = info.italic;
      const font = info.family;
      let text = it.str;
      // word gap ≈ 0.24em; but per-GLYPH PDFs ("H","y","u"…) space letters up
      // to ~0.45em apart, so single-char neighbours need a wider bar before a
      // real space is inserted
      const gapNeeded = prevLen <= 2 && text.trim().length <= 2 ? it.size * 0.5 : it.size * 0.24;
      if (prevEnd !== null && it.x - prevEnd > Math.max(gapNeeded, 0.8) && !text.startsWith(" ")) text = " " + text;
      const end = it.x + (it.width || 0);
      prevEnd = end;
      prevLen = text.trim().length;
      x0 = Math.min(x0, it.x); x1 = Math.max(x1, end); maxSize = Math.max(maxSize, it.size);
      const last = runs[runs.length - 1];
      if (last && last.bold === bold && last.italic === italic && last.font === font && Math.abs(last.size - it.size) < 0.6) last.text += text;
      else runs.push({ text, size: it.size, bold, italic, font });
    }
    flush();
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
      // document-global objects ("g_…") live in commonObjs, not page.objs —
      // asking the wrong store leaves the getter waiting forever. Cap the
      // wait regardless: an unresolved object is skipped, never a hang.
      const store = f.name.startsWith("g_") ? page.commonObjs : page.objs;
      const obj: any = await Promise.race([
        new Promise((res) => { try { if (store.has(f.name)) res(store.get(f.name)); else store.get(f.name, res); } catch { res(null); } }),
        new Promise((res) => setTimeout(() => res(null), 2500)),
      ]);
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

/* Full-page render for the exact mode's graphics layer. For every text
   segment we sample the pixels FIRST: the local background color (so the
   cover box repaints a blue table header blue, not white) and the text's
   own color (so blue headings stay blue and white-on-blue text stays
   white — written into ln.color for the TextRun). Then the segment box is
   painted over with the sampled background and only borders/logos/images
   remain. A near-blank result is dropped entirely. */
async function renderPageBackground(page: any, lines: Line[], wPt: number, hPt: number): Promise<Uint8Array | null> {
  const scale = Math.min(2, 2400 / Math.max(wPt, hPt));
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  canvas.width = Math.round(viewport.width); canvas.height = Math.round(viewport.height);
  ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvas, canvasContext: ctx, viewport }).promise;

  const W = canvas.width, H = canvas.height;
  const cl = (v: number, hi: number) => Math.max(0, Math.min(hi, Math.round(v)));
  const boxes = lines.map((ln) => ({
    x: cl((ln.x0 - ln.size * 0.2) * scale, W - 1),
    y: cl((hPt - (ln.y + ln.size * 1.0)) * scale, H - 1),
    w: cl((ln.x1 - ln.x0 + ln.size * 0.6) * scale, W),
    h: cl(ln.size * 1.45 * scale, H),
  }));

  // pass 1 — sample colors while the original pixels are still there
  lines.forEach((ln, i) => {
    const b = boxes[i];
    if (b.w < 2 || b.h < 2) return;
    // Local background = the DOMINANT quantized color of the whole box
    // interior. Glyphs cover a minority of the box, so the dominant bucket is
    // the true background everywhere: white cells stay white, blue header
    // bands stay blue, and border lines (a thin minority) can't hijack it.
    const buckets = new Map<string, { n: number; r: number; g: number; b: number }>();
    const inner = ctx.getImageData(b.x, b.y, Math.min(b.w, W - b.x), Math.min(b.h, H - b.y)).data;
    for (let k = 0; k < inner.length; k += 8) {
      const key = `${inner[k] >> 4}-${inner[k + 1] >> 4}-${inner[k + 2] >> 4}`;
      const e = buckets.get(key) || { n: 0, r: 0, g: 0, b: 0 };
      e.n++; e.r += inner[k]; e.g += inner[k + 1]; e.b += inner[k + 2];
      buckets.set(key, e);
    }
    const top = [...buckets.values()].sort((m, n) => n.n - m.n)[0];
    let bg = top ? [Math.round(top.r / top.n), Math.round(top.g / top.n), Math.round(top.b / top.n)] : [255, 255, 255];
    // snap near-white to pure white — JPEG-noise grays read as dirty patches
    if (bg[0] > 235 && bg[1] > 235 && bg[2] > 235) bg = [255, 255, 255];
    // text color: the in-box pixels most distant from the background
    const img = ctx.getImageData(b.x, b.y, Math.min(b.w, W - b.x), Math.min(b.h, H - b.y)).data;
    const far: { d: number; c: number[] }[] = [];
    for (let k = 0; k < img.length; k += 8) {
      const dr = img[k] - bg[0], dg = img[k + 1] - bg[1], db = img[k + 2] - bg[2];
      const d = dr * dr + dg * dg + db * db;
      if (d > 3600) far.push({ d, c: [img[k], img[k + 1], img[k + 2]] });
    }
    if (far.length > 4) {
      far.sort((m, n) => n.d - m.d);
      const top = far.slice(0, Math.max(4, Math.floor(far.length / 4)));
      const avg = [0, 1, 2].map((idx) => Math.round(top.reduce((s, p) => s + p.c[idx], 0) / top.length));
      const bgLum = bg[0] * 0.299 + bg[1] * 0.587 + bg[2] * 0.114;
      const txLum = avg[0] * 0.299 + avg[1] * 0.587 + avg[2] * 0.114;
      // On a LIGHT background any LIGHT sample is an antialiasing/JPEG
      // artifact — readable text there is dark or saturated (INGOS blue is
      // lum≈70 and passes). Snap artifacts to black; on dark backgrounds
      // keep light samples: that's genuine white-on-color text.
      const hex = bgLum >= 128 && txLum > 150 ? "000000"
        : avg.map((v) => v.toString(16).padStart(2, "0")).join("").toUpperCase();
      ln.color = hex;
    }
    (b as any).bg = bg;
  });

  // pass 2 — cover every segment with its own local background color
  for (const b of boxes as any[]) {
    const bg = b.bg || [255, 255, 255];
    ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }

  // pass 3 — residual-ink sweep: stylized fonts (condensed digits, spaced
  // wordmarks) report a smaller size than they paint, leaving glyph edges
  // sticking out of the covered box as gray ghosts. Where the expanded ring
  // still holds ink, repaint the wider box too.
  for (let i = 0; i < boxes.length; i++) {
    const b: any = boxes[i];
    if (b.w < 2 || b.h < 2) continue;
    const bg = b.bg || [255, 255, 255];
    // white-background boxes only: repainting an expanded ring near a colored
    // band would bleed; and require CHUNKY ink (5%+) so a thin table border
    // crossing the ring never triggers a wipe
    if (!(bg[0] > 235 && bg[1] > 235 && bg[2] > 235)) continue;
    const pad = Math.max(2, Math.round(lines[i].size * 0.28 * scale));
    const ex = cl(b.x - pad, W - 1), ey = cl(b.y - pad, H - 1);
    const ew = Math.min(b.w + pad * 2, W - ex), eh = Math.min(b.h + pad * 2, H - ey);
    if (ew < 2 || eh < 2) continue;
    const ring = ctx.getImageData(ex, ey, ew, eh).data;
    let ink = 0, seen = 0;
    for (let k = 0; k < ring.length; k += 16) {
      seen++;
      const dr = ring[k] - bg[0], dg = ring[k + 1] - bg[1], db = ring[k + 2] - bg[2];
      if (dr * dr + dg * dg + db * db > 4000) ink++;
    }
    if (ink > seen * 0.05) {
      ctx.fillStyle = `rgb(${bg[0]},${bg[1]},${bg[2]})`;
      ctx.fillRect(ex, ey, ew, eh);
    }
  }

  // blank detection on a 64px thumbnail: if almost nothing survived the
  // cover pass, skip the background image altogether
  const th = document.createElement("canvas");
  th.width = 64; th.height = 64;
  const tctx = th.getContext("2d")!;
  tctx.drawImage(canvas, 0, 0, 64, 64);
  const d = tctx.getImageData(0, 0, 64, 64).data;
  let ink = 0;
  for (let i = 0; i < d.length; i += 4) {
    if (d[i] < 242 || d[i + 1] < 242 || d[i + 2] < 242) ink++;
  }
  if (ink < 64 * 64 * 0.004) return null;

  const blob = await new Promise<Blob | null>((res) => canvas.toBlob((b) => res(b), "image/jpeg", 0.85));
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
