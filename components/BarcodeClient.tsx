"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiDownload, FiCopy, FiCheck, FiAlertCircle } from "react-icons/fi";
import { trackTool } from "@/lib/track";
import { barcodeTool, type ToolLang } from "@/lib/barcode-types-i18n";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Format = {
  id: string;
  name: string;
  hint: string;
  sample: string;
  numeric?: boolean;
  fixedLen?: number[];
  twoD?: boolean;   // 2D stacked/matrix code — rendered by bwip-js, not JsBarcode
  bcid?: string;    // bwip-js symbology id for 2D formats
};

const FORMATS: Format[] = [
  { id: "PDF417", name: "PDF417", hint: "2D stacked barcode used on ID cards, driver's licenses, boarding passes and shipping labels — holds a lot of text.", sample: "QRIX PDF417 — https://qrixtools.com", twoD: true, bcid: "pdf417" },
  { id: "AZTEC", name: "Aztec Code", hint: "Compact 2D code common on transport and event tickets — scans without a quiet zone.", sample: "QRIX AZTEC TICKET 2026", twoD: true, bcid: "azteccode" },
  { id: "DATAMATRIX", name: "Data Matrix", hint: "Tiny square 2D code for marking small parts, electronics and pharma packaging.", sample: "QRIX-DM-0001", twoD: true, bcid: "datamatrix" },
  { id: "CODE128", name: "Code 128", hint: "Any text or numbers — the universal barcode for logistics and inventory.", sample: "QRIX-12345" },
  { id: "EAN13", name: "EAN-13", hint: "13-digit retail product code used worldwide (12 digits + auto checksum).", sample: "590123412345", numeric: true, fixedLen: [12, 13] },
  { id: "EAN8", name: "EAN-8", hint: "Short 8-digit retail code for small packages.", sample: "9638507", numeric: true, fixedLen: [7, 8] },
  { id: "UPC", name: "UPC-A", hint: "12-digit product code standard in the US and Canada.", sample: "12345678901", numeric: true, fixedLen: [11, 12] },
  { id: "CODE39", name: "Code 39", hint: "Letters, numbers and - . $ / + % — common in industry and ID badges.", sample: "QRIX-39" },
  { id: "ITF14", name: "ITF-14", hint: "14-digit carton/case code used on shipping boxes.", sample: "1234567890123", numeric: true, fixedLen: [13, 14] },
  { id: "ITF", name: "ITF (Interleaved 2 of 5)", hint: "Even number of digits — warehousing and distribution.", sample: "123456", numeric: true },
  { id: "MSI", name: "MSI", hint: "Numeric code for inventory shelves and warehouse labels.", sample: "123456", numeric: true },
  { id: "pharmacode", name: "Pharmacode", hint: "Pharmaceutical packaging code (number from 3 to 131070).", sample: "1234", numeric: true },
  { id: "codabar", name: "Codabar", hint: "Libraries, blood banks and logistics (digits + - $ : / . +).", sample: "A123456A" },
];

const PRESET_COLORS = ["#000000", "#1e293b", "#7c3aed", "#0e7490", "#166534", "#F58F20"];

export default function BarcodeClient({ initialFormat, lang = "en" }: { initialFormat?: string; lang?: ToolLang } = {}) {
  const t = barcodeTool(lang);
  /* Ids are derived from the language so the RU and UZ twins of a page can
     never collide if both ever render on one document; more practically, it
     keeps every id in one place instead of six string literals in the JSX. */
  const uid = (part: string) => `bc-${lang}-${part}`;
  // /barcode/<type> pages preselect their symbology; the hub starts on the first.
  const start = FORMATS.find((f) => f.id === initialFormat) ?? FORMATS[0];
  const [format, setFormat] = useState<Format>(start);
  const [value, setValue] = useState(start.sample);
  const [lineColor, setLineColor] = useState("#000000");
  const [showText, setShowText] = useState(true);
  const [height, setHeight] = useState(90);
  const [valid, setValid] = useState(true);
  const [copied, setCopied] = useState(false);
  const [bulk, setBulk] = useState("");
  const [bulkBusy, setBulkBusy] = useState(false);
  const [bulkDone, setBulkDone] = useState<{ ok: number; fail: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validationMsg = useMemo(() => {
    if (!value) return t.needValue;
    if (format.twoD) return null;   // 2D codes accept arbitrary text
    if (format.numeric && !/^\d+$/.test(value) && format.id !== "codabar") return t.digitsOnly;
    if (format.fixedLen && !format.fixedLen.includes(value.length)) return t.fixedLen(format.fixedLen.join(" / "));
    return null;
  }, [value, format, t]);

  useEffect(() => {
    if (!value) return;
    let cancelled = false;
    (async () => {
      // ── 2D codes (PDF417 / Aztec / Data Matrix) via bwip-js ──
      if (format.twoD) {
        try {
          const bwipjs = (await import("bwip-js")).default as any;
          if (cancelled || !canvasRef.current) return;
          bwipjs.toCanvas(canvasRef.current, {
            bcid: format.bcid, text: value, scale: 4,
            includetext: showText, textxalign: "center",
            barcolor: lineColor.replace("#", ""), backgroundcolor: "FFFFFF",
            paddingwidth: 6, paddingheight: 6,
          });
          setValid(true);
        } catch { setValid(false); }
        return;
      }
      // ── 1D linear codes via JsBarcode ──
      if (!svgRef.current) return;
      const JsBarcode = (await import("jsbarcode")).default;
      if (cancelled || !svgRef.current) return;
      try {
        JsBarcode(svgRef.current, value, {
          format: format.id, lineColor, background: "#ffffff",
          height, width: 2, margin: 14, displayValue: showText,
          font: "monospace", fontSize: 15,
          valid: (ok: boolean) => setValid(ok),
        });
      } catch { setValid(false); }
    })();
    return () => { cancelled = true; };
  }, [value, format, lineColor, showText, height]);

  function pickFormat(f: Format) {
    setFormat(f);
    setValue(f.sample);
  }

  async function downloadSvg() {
    if (!valid) return;
    trackTool("barcode", { format: format.id, type: "svg" });
    const { saveBlob } = await import("@/lib/save-file");
    // 2D → bwip-js emits a crisp vector SVG string
    if (format.twoD) {
      const bwipjs = (await import("bwip-js")).default as any;
      const svg = bwipjs.toSVG({ bcid: format.bcid, text: value, scale: 4, includetext: showText, textxalign: "center", barcolor: lineColor.replace("#", "") });
      await saveBlob(new Blob([svg], { type: "image/svg+xml" }), `barcode-${format.id.toLowerCase()}.svg`);
      return;
    }
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    await saveBlob(new Blob([xml], { type: "image/svg+xml" }), `barcode-${format.id.toLowerCase()}.svg`);
  }

  async function downloadPng() {
    if (!valid) return;
    trackTool("barcode", { format: format.id, type: "png" });
    // 2D → straight from the bwip-js canvas
    if (format.twoD && canvasRef.current) {
      const blob = await new Promise<Blob | null>((r) => canvasRef.current!.toBlob(r, "image/png"));
      if (blob) { const { saveBlob } = await import("@/lib/save-file"); await saveBlob(blob, `barcode-${format.id.toLowerCase()}.png`); }
      return;
    }
    if (!svgRef.current) return;
    const xml = new XMLSerializer().serializeToString(svgRef.current);
    const img = new Image();
    const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const scale = 3;
    const canvas = document.createElement("canvas");
    canvas.width = img.width * scale; canvas.height = img.height * scale;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    URL.revokeObjectURL(url);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
    if (blob) {
      const { saveBlob } = await import("@/lib/save-file");
      await saveBlob(blob, `barcode-${format.id.toLowerCase()}.png`);
    }
  }

  async function copyValue() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  /** Bulk: one value per line → ZIP of PNG barcodes in the selected format. */
  async function generateBulk() {
    const lines = bulk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(0, 200);
    if (!lines.length) return;
    setBulkBusy(true); setBulkDone(null);
    trackTool("barcode", { format: format.id, type: "bulk", count: lines.length });
    try {
      const [{ default: JsBarcode }, { default: JSZip }] = await Promise.all([import("jsbarcode"), import("jszip")]);
      const bwipjs = format.twoD ? ((await import("bwip-js")).default as any) : null;
      const zip = new JSZip();
      let ok = 0, fail = 0;
      for (const line of lines) {
        try {
          // 2D codes: render each line via bwip-js to an offscreen canvas
          if (format.twoD) {
            const cv = document.createElement("canvas");
            bwipjs.toCanvas(cv, { bcid: format.bcid, text: line, scale: 4, includetext: showText, textxalign: "center", barcolor: lineColor.replace("#", "") });
            const blob = await new Promise<Blob | null>((r) => cv.toBlob(r, "image/png"));
            if (blob) { zip.file(`${line.replace(/[^\w.-]+/g, "_").slice(0, 40)}.png`, blob); ok++; } else fail++;
            continue;
          }
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          let lineOk = true;
          JsBarcode(svg, line, {
            format: format.id, lineColor, background: "#ffffff", height, width: 2, margin: 14,
            displayValue: showText, font: "monospace", fontSize: 15,
            valid: (v: boolean) => { lineOk = v; },
          });
          if (!lineOk) { fail++; continue; }
          const xml = new XMLSerializer().serializeToString(svg);
          const img = new Image();
          const url = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml" }));
          await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
          const canvas = document.createElement("canvas");
          canvas.width = img.width * 3; canvas.height = img.height * 3;
          const ctx = canvas.getContext("2d")!;
          ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
          if (blob) { zip.file(`${line.replace(/[^\w.-]+/g, "_").slice(0, 40)}.png`, blob); ok++; }
          else fail++;
        } catch { fail++; }
      }
      if (ok > 0) {
        const zipBlob = await zip.generateAsync({ type: "blob" });
        const { saveBlob } = await import("@/lib/save-file");
        await saveBlob(zipBlob, `barcodes-${format.id.toLowerCase()}-${ok}.zip`);
      }
      setBulkDone({ ok, fail });
    } finally {
      setBulkBusy(false);
    }
  }

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[1fr_420px] gap-8">
        {/* ── controls ── */}
        <div className="space-y-5">
          <div role="group" aria-labelledby={uid("type-label")}>
            <div id={uid("type-label")} className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
              {t.typeLabel(FORMATS.length)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FORMATS.map((f) => (
                <button key={f.id} onClick={() => pickFormat(f)}
                  className="px-3 py-2.5 rounded-xl text-left text-[12.5px] font-bold transition-all"
                  style={{
                    background: format.id === f.id ? "rgba(245,143,32,0.14)" : "var(--surface-2)",
                    border: `1px solid ${format.id === f.id ? "var(--primary)" : "var(--border)"}`,
                    color: format.id === f.id ? "var(--primary-bright)" : "var(--text)",
                  }}>
                  {f.name}
                </button>
              ))}
            </div>
            {/* The picker is a button group, so the selected format has to be
                announced somewhere a screen reader will reach. */}
            <p className="sr-only" aria-live="polite">{format.name}</p>
            <p className="text-[11.5px] mt-2.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{format.hint}</p>
          </div>

          <div className="block">
            <label htmlFor={uid("value")} className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
              {t.value}
            </label>
            <input
              id={uid("value")}
              value={value}
              onChange={(e) => setValue(e.target.value.slice(0, 60))}
              placeholder={format.sample}
              className="qx-auth-input mt-1 font-mono"
              aria-invalid={!valid || Boolean(validationMsg)}
              aria-describedby={validationMsg || !valid ? uid("value-err") : undefined}
            />
            {(validationMsg || !valid) && (
              <span id={uid("value-err")} role="status" className="flex items-center gap-1.5 text-[12px] mt-1.5" style={{ color: "#f59e0b" }}>
                <FiAlertCircle size={13} /> {validationMsg || t.invalidGeneric}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-6">
            <div role="group" aria-labelledby={uid("color-label")}>
              <div id={uid("color-label")} className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>{t.barColor}</div>
              <div className="flex flex-wrap items-center gap-2">
                {PRESET_COLORS.map((c, i) => (
                  <button key={c} onClick={() => setLineColor(c)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: lineColor === c ? "2px solid var(--primary)" : "1px solid var(--border)" }}
                    aria-label={t.colorNames[i] ?? c} aria-pressed={lineColor === c} />
                ))}
                <label htmlFor={uid("color")} className="sr-only">{t.customColor}</label>
                <input id={uid("color")} type="color" value={lineColor} onChange={(e) => setLineColor(e.target.value)}
                  className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
            </div>
            <div>
              <label htmlFor={uid("height")} className="block text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
                {t.height(height)}
              </label>
              <input id={uid("height")} type="range" min={40} max={160} value={height}
                onChange={(e) => setHeight(Number(e.target.value))} className="w-44 accent-[#F58F20]"
                aria-valuetext={`${height}px`} />
            </div>
            <div className="flex items-center gap-2 self-end pb-1">
              <input id={uid("showtext")} type="checkbox" checked={showText}
                onChange={(e) => setShowText(e.target.checked)} className="accent-[#F58F20] w-4 h-4 cursor-pointer" />
              <label htmlFor={uid("showtext")} className="text-[12.5px] font-semibold cursor-pointer" style={{ color: "var(--text)" }}>
                {t.showText}
              </label>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button onClick={downloadPng} disabled={!valid || !value} className="qx-btn-hero !py-2.5 !px-5 text-sm disabled:opacity-40">
              <FiDownload size={14} /> {t.downloadPng}
            </button>
            <button onClick={downloadSvg} disabled={!valid || !value} className="qx-btn !py-2.5 text-sm disabled:opacity-40">
              <FiDownload size={14} /> {t.downloadSvg}
            </button>
            <button onClick={copyValue} className="qx-btn-ghost !py-2.5 text-sm">
              {copied ? <FiCheck size={14} /> : <FiCopy size={14} />} {copied ? t.copied : t.copyValue}
            </button>
          </div>

          {/* Bulk generation */}
          <div className="rounded-2xl p-4 mt-2" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
            <div className="flex items-center gap-2 mb-2">
              <label htmlFor={uid("bulk")} className="text-[12px] font-bold" style={{ color: "var(--text)" }}>{t.bulkTitle}</label>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--grad-primary)" }}>PRO</span>
            </div>
            <textarea id={uid("bulk")} value={bulk} onChange={(e) => setBulk(e.target.value)} rows={3}
              placeholder={t.bulkPlaceholder}
              aria-describedby={uid("bulk-note")}
              className="qx-auth-input !py-2 font-mono !text-[12px] w-full resize-y" />
            <div className="flex items-center gap-3 mt-2.5">
              <button onClick={generateBulk} disabled={bulkBusy || !bulk.trim()} className="qx-btn !py-2 !text-xs disabled:opacity-40">
                <FiDownload size={13} /> {bulkBusy ? t.bulkBusy : t.bulkGo}
              </button>
              {bulkDone && (
                <span role="status" className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                  {bulkDone.fail > 0 ? "⚠️" : "✅"} {t.bulkResult(bulkDone.ok, bulkDone.fail)}
                </span>
              )}
            </div>
            <p id={uid("bulk-note")} className="text-[10.5px] mt-2" style={{ color: "var(--text-faint)" }}>
              {t.bulkNote}
            </p>
          </div>
        </div>

        {/* ── live preview ── */}
        <div className="flex items-center justify-center">
          <div className="rounded-2xl p-6 w-full flex items-center justify-center min-h-[260px]"
            style={{ background: "#ffffff", border: "1px solid var(--border)", boxShadow: "0 16px 44px rgba(0,0,0,.25)" }}>
            {/* refs stay mounted so the render effect always has its target */}
            <canvas ref={canvasRef} className={format.twoD && value && valid ? "max-w-full h-auto" : "hidden"} style={{ maxHeight: 300 }} />
            <svg ref={svgRef} className={!format.twoD && value && valid ? "max-w-full h-auto" : "hidden"} />
            {(!value || !valid) && (
              <div className="text-center text-sm px-6" style={{ color: "#94a3b8" }}>
                {value ? t.previewInvalid : t.previewEmpty}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
