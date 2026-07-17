"use client";

import { useEffect, useRef, useState } from "react";
import { FiX, FiDownload, FiUpload, FiTrash2, FiChevronDown } from "react-icons/fi";

/* ============================================================
   QRix Design Studio — advanced QR customization
   (dot/corner shapes, gradient, logo, "SCAN ME" frame)
   Powered by qr-code-styling.
   ============================================================ */

type DotType = "square" | "dots" | "rounded" | "classy" | "classy-rounded" | "extra-rounded";
type CornerSquareType = "square" | "dot" | "extra-rounded";
type CornerDotType = "square" | "dot";

const DOT_TYPES: { id: DotType; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
  { id: "classy", label: "Classy" },
  { id: "classy-rounded", label: "Classy R." },
  { id: "extra-rounded", label: "Extra R." },
];
const CORNER_SQUARE_TYPES: { id: CornerSquareType; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "extra-rounded", label: "Rounded" },
  { id: "dot", label: "Dot" },
];
const CORNER_DOT_TYPES: { id: CornerDotType; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "dot", label: "Dot" },
];

const FG_PRESETS = ["#0e0e0e", "#F58F20", "#467434", "#7c3aed", "#2563eb", "#db2777", "#0891b2"];
const FRAME_PRESETS = ["#F58F20", "#467434", "#0e0e0e", "#7c3aed", "#2563eb", "#db2777"];

/* ── Professional ready-made templates (me-qr style) — one click applies a
   complete design: shapes, colors/gradient, background and CTA frame. Each
   card shows a REAL mini QR rendered with the template's exact options. */
type QrTemplate = {
  id: string; label: string;
  dotType: DotType; cornerSquare: CornerSquareType; cornerDot: CornerDotType;
  fg: string; useGrad: boolean; grad2: string; gradType: "linear" | "radial";
  bg: string; frameOn: boolean; frameText: string; frameColor: string;
};
const QR_TEMPLATES: QrTemplate[] = [
  { id: "classic", label: "Classic", dotType: "square", cornerSquare: "square", cornerDot: "square", fg: "#0e0e0e", useGrad: false, grad2: "#0e0e0e", gradType: "linear", bg: "#ffffff", frameOn: false, frameText: "SCAN ME", frameColor: "#0e0e0e" },
  { id: "sunset", label: "Sunset", dotType: "rounded", cornerSquare: "extra-rounded", cornerDot: "dot", fg: "#ff4d1c", useGrad: true, grad2: "#f59e0b", gradType: "linear", bg: "#ffffff", frameOn: true, frameText: "SCAN ME", frameColor: "#ff4d1c" },
  { id: "ocean", label: "Ocean", dotType: "extra-rounded", cornerSquare: "extra-rounded", cornerDot: "dot", fg: "#2563eb", useGrad: true, grad2: "#06b6d4", gradType: "linear", bg: "#ffffff", frameOn: true, frameText: "SCAN ME", frameColor: "#2563eb" },
  { id: "forest", label: "Forest", dotType: "classy-rounded", cornerSquare: "extra-rounded", cornerDot: "dot", fg: "#166534", useGrad: true, grad2: "#22c55e", gradType: "linear", bg: "#f0fdf4", frameOn: false, frameText: "SCAN ME", frameColor: "#467434" },
  { id: "berry", label: "Berry", dotType: "dots", cornerSquare: "dot", cornerDot: "dot", fg: "#db2777", useGrad: true, grad2: "#7c3aed", gradType: "radial", bg: "#ffffff", frameOn: true, frameText: "FOLLOW US", frameColor: "#db2777" },
  { id: "midnight", label: "Midnight", dotType: "rounded", cornerSquare: "extra-rounded", cornerDot: "dot", fg: "#f8fafc", useGrad: false, grad2: "#f8fafc", gradType: "linear", bg: "#0e0e0e", frameOn: false, frameText: "SCAN ME", frameColor: "#0e0e0e" },
  { id: "gold", label: "Gold", dotType: "classy", cornerSquare: "extra-rounded", cornerDot: "square", fg: "#b45309", useGrad: true, grad2: "#f59e0b", gradType: "linear", bg: "#fffbeb", frameOn: true, frameText: "VIP ACCESS", frameColor: "#b45309" },
  { id: "neon", label: "Neon", dotType: "extra-rounded", cornerSquare: "extra-rounded", cornerDot: "dot", fg: "#22d3ee", useGrad: true, grad2: "#a855f7", gradType: "linear", bg: "#0b1220", frameOn: false, frameText: "SCAN ME", frameColor: "#0b1220" },
  { id: "menu", label: "Café menu", dotType: "rounded", cornerSquare: "extra-rounded", cornerDot: "dot", fg: "#0e0e0e", useGrad: false, grad2: "#0e0e0e", gradType: "linear", bg: "#fff7ed", frameOn: true, frameText: "MENU", frameColor: "#467434" },
  { id: "wedding", label: "Wedding", dotType: "classy-rounded", cornerSquare: "extra-rounded", cornerDot: "dot", fg: "#6b2140", useGrad: true, grad2: "#db2777", gradType: "linear", bg: "#fdf2f8", frameOn: true, frameText: "RSVP", frameColor: "#db2777" },
];

export default function QRDesignStudio({
  value,
  initialFg = "#0e0e0e",
  initialBg = "#ffffff",
  initialLevel = "H",
  initialLogo = null,
  onClose,
}: {
  value: string;
  initialFg?: string;
  initialBg?: string;
  initialLevel?: "L" | "M" | "Q" | "H";
  initialLogo?: string | null;
  onClose: () => void;
}) {
  const mountRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const qrRef = useRef<any>(null);

  const [dotType, setDotType] = useState<DotType>("rounded");
  const [fg, setFg] = useState(initialFg);
  const [useGrad, setUseGrad] = useState(false);
  const [grad2, setGrad2] = useState("#F58F20");
  const [gradType, setGradType] = useState<"linear" | "radial">("linear");
  const [bg, setBg] = useState(initialBg);
  const [cornerSquare, setCornerSquare] = useState<CornerSquareType>("extra-rounded");
  const [cornerDot, setCornerDot] = useState<CornerDotType>("dot");
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">(initialLevel);
  const [logo, setLogo] = useState<string | null>(initialLogo);
  const [frameOn, setFrameOn] = useState(false);
  const [frameText, setFrameText] = useState("SCAN ME");
  const [frameColor, setFrameColor] = useState("#F58F20");
  const [dlOpen, setDlOpen] = useState(false);
  const [tplId, setTplId] = useState<string | null>(null);

  function applyTemplate(t: QrTemplate) {
    setDotType(t.dotType); setCornerSquare(t.cornerSquare); setCornerDot(t.cornerDot);
    setFg(t.fg); setUseGrad(t.useGrad); setGrad2(t.grad2); setGradType(t.gradType);
    setBg(t.bg); setFrameOn(t.frameOn); setFrameText(t.frameText); setFrameColor(t.frameColor);
    setTplId(t.id);
  }

  const RENDER = 280;

  function buildOptions() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: any = {
      width: RENDER,
      height: RENDER,
      type: "canvas",
      data: value || "https://qrix.uz",
      margin: 8,
      qrOptions: { errorCorrectionLevel: level },
      dotsOptions: useGrad
        ? { type: dotType, gradient: { type: gradType, rotation: 0, colorStops: [{ offset: 0, color: fg }, { offset: 1, color: grad2 }] } }
        : { type: dotType, color: fg },
      backgroundOptions: { color: bg },
      cornersSquareOptions: { type: cornerSquare, color: fg },
      cornersDotOptions: { type: cornerDot, color: useGrad ? grad2 : fg },
      imageOptions: { crossOrigin: "anonymous", margin: 4, imageSize: 0.4, hideBackgroundDots: true },
    };
    if (logo) opts.image = logo;
    return opts;
  }

  // create instance once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("qr-code-styling");
      if (cancelled || !mountRef.current) return;
      const QRCodeStyling = mod.default;
      const inst = new QRCodeStyling(buildOptions());
      qrRef.current = inst;
      mountRef.current.innerHTML = "";
      inst.append(mountRef.current);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // update on changes
  useEffect(() => {
    if (qrRef.current) qrRef.current.update(buildOptions());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dotType, fg, useGrad, grad2, gradType, bg, cornerSquare, cornerDot, level, logo, value]);

  const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  // ── Download ──
  // Build the final PNG blob (framed or plain) — shared by PNG + PDF export.
  const getPngBlob = async (): Promise<Blob | null> => {
    if (!frameOn) return (await qrRef.current?.getRawData("png")) as Blob | null;
    const srcCanvas = mountRef.current?.querySelector("canvas") as HTMLCanvasElement | null;
    if (!srcCanvas) return null;
    const pad = 22, capH = 56;
    const W = RENDER + pad * 2, H = RENDER + pad * 2 + capH;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    roundRect(ctx, 0, 0, W, H, 26); ctx.fillStyle = frameColor; ctx.fill();
    roundRect(ctx, pad, pad, RENDER, RENDER, 14); ctx.fillStyle = bg; ctx.fill();
    ctx.drawImage(srcCanvas, pad, pad, RENDER, RENDER);
    ctx.fillStyle = pickTextColor(frameColor);
    ctx.font = "800 26px Poppins, Inter, sans-serif";
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(frameText || "SCAN ME", W / 2, pad + RENDER + capH / 2 + 4);
    return new Promise<Blob | null>((res) => c.toBlob((b) => res(b), "image/png"));
  };

  const downloadPng = async () => {
    setDlOpen(false);
    const { saveBlob } = await import("@/lib/save-file");
    const blob = await getPngBlob();
    if (blob) await saveBlob(blob, "qrix-code.png");
  };

  const downloadSvg = async () => {
    setDlOpen(false);
    const { saveBlob } = await import("@/lib/save-file");
    const blob = (await qrRef.current?.getRawData("svg")) as Blob | null;
    if (blob) await saveBlob(blob, "qrix-code.svg");
  };

  // Print-ready PDF (embeds the high-res QR image, sized in mm).
  const downloadPdf = async () => {
    setDlOpen(false);
    const blob = await getPngBlob();
    if (!blob) return;
    const [{ saveBlob }, jspdf] = await Promise.all([import("@/lib/save-file"), import("jspdf")]);
    const dataUrl = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(blob); });
    const dims = await new Promise<{ w: number; h: number }>((res) => { const im = new Image(); im.onload = () => res({ w: im.width, h: im.height }); im.src = dataUrl; });
    const wmm = 100, hmm = wmm * (dims.h / dims.w);
    const pdf = new jspdf.jsPDF({ unit: "mm", format: [wmm + 20, hmm + 20] });
    pdf.addImage(dataUrl, "PNG", 10, 10, wmm, hmm);
    await saveBlob(pdf.output("blob"), "qrix-code.pdf");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,.65)", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div className="qx-card w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display text-lg font-extrabold flex items-center gap-2" style={{ color: "var(--text)" }}>
            🎨 QR Design Studio
          </h3>
          <button onClick={onClose} className="qx-btn-ghost !p-2" aria-label="Close"><FiX size={16} /></button>
        </div>

        {/* ── Ready-made templates — real mini previews, one click applies ── */}
        <div className="mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
            Templates — start from a pro design
          </div>
          <div className="flex gap-2.5 overflow-x-auto pb-2 -mx-1 px-1">
            {QR_TEMPLATES.map((t) => (
              <button key={t.id} onClick={() => applyTemplate(t)}
                className="shrink-0 rounded-2xl overflow-hidden text-center transition-all hover:-translate-y-1"
                style={{ border: `2px solid ${tplId === t.id ? "#F58F20" : "var(--border)"}`, boxShadow: tplId === t.id ? "0 0 0 3px rgba(245,143,32,.18)" : "none" }}>
                <MiniQr tpl={t} />
                <div className="text-[10.5px] font-bold py-1.5 px-2" style={{ background: "var(--surface-2)", color: tplId === t.id ? "#F58F20" : "var(--text-muted)" }}>
                  {t.label}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-[260px_1fr] gap-6">
          {/* ── Live preview + download ── */}
          <div className="flex flex-col items-center gap-4">
            <div className="rounded-2xl p-3" style={{ background: frameOn ? frameColor : "transparent", transition: "background .2s" }}>
              <div className="rounded-xl overflow-hidden" style={{ background: bg }}>
                <div ref={mountRef} style={{ width: RENDER, height: RENDER }} />
              </div>
              {frameOn && (
                <div className="text-center font-display font-extrabold tracking-wide pt-2 pb-1" style={{ color: pickTextColor(frameColor), fontSize: 18 }}>
                  {frameText || "SCAN ME"}
                </div>
              )}
            </div>

            <div className="relative w-full">
              <div className="flex">
                <button onClick={downloadPng} className="qx-btn-hero flex-1 !rounded-r-none">
                  <FiDownload size={15} /> Download PNG
                </button>
                <button onClick={() => setDlOpen(!dlOpen)} className="qx-btn-hero !rounded-l-none !px-3" aria-label="Format" style={{ borderLeft: "1px solid rgba(255,255,255,.25)" }}>
                  <FiChevronDown size={14} />
                </button>
              </div>
              {dlOpen && (
                <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-40"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
                  <button onClick={downloadPng} className="w-full px-4 py-2.5 text-xs font-semibold text-left hover:opacity-80" style={{ color: "var(--text)" }}>PNG {frameOn ? "(with frame)" : ""}</button>
                  <button onClick={downloadSvg} className="w-full px-4 py-2.5 text-xs font-semibold text-left hover:opacity-80" style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}>SVG (vector, no frame)</button>
                  <button onClick={downloadPdf} className="w-full px-4 py-2.5 text-xs font-semibold text-left hover:opacity-80" style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}>PDF (print-ready)</button>
                </div>
              )}
            </div>
          </div>

          {/* ── Controls ── */}
          <div className="space-y-5">
            {/* Dot shape */}
            <Group title="Dot style">
              <div className="grid grid-cols-3 gap-2">
                {DOT_TYPES.map((d) => (
                  <Chip key={d.id} active={dotType === d.id} onClick={() => setDotType(d.id)}>{d.label}</Chip>
                ))}
              </div>
            </Group>

            {/* Color + gradient */}
            <Group title="Color">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {FG_PRESETS.map((c) => (
                  <button key={c} onClick={() => setFg(c)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: fg === c ? "2px solid #F58F20" : "1px solid var(--border)", boxShadow: fg === c ? "0 0 0 3px rgba(245,143,32,.2)" : "none" }} />
                ))}
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
              <label className="flex items-center gap-2 text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                <input type="checkbox" checked={useGrad} onChange={(e) => setUseGrad(e.target.checked)} className="accent-orange-500" />
                Gradient
              </label>
              {useGrad && (
                <div className="flex items-center gap-2 mt-2">
                  <input type="color" value={grad2} onChange={(e) => setGrad2(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
                  <Chip active={gradType === "linear"} onClick={() => setGradType("linear")}>Linear</Chip>
                  <Chip active={gradType === "radial"} onClick={() => setGradType("radial")}>Radial</Chip>
                </div>
              )}
            </Group>

            {/* Corners */}
            <Group title="Corner style">
              <div className="grid grid-cols-3 gap-2 mb-2">
                {CORNER_SQUARE_TYPES.map((c) => (
                  <Chip key={c.id} active={cornerSquare === c.id} onClick={() => setCornerSquare(c.id)}>{c.label}</Chip>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {CORNER_DOT_TYPES.map((c) => (
                  <Chip key={c.id} active={cornerDot === c.id} onClick={() => setCornerDot(c.id)}>Eye: {c.label}</Chip>
                ))}
              </div>
            </Group>

            {/* Background */}
            <Group title="Background">
              <div className="flex flex-wrap items-center gap-2">
                {["#ffffff", "#f8f6f3", "#0e0e0e", "#fff7ed", "#f0fdf4"].map((c) => (
                  <button key={c} onClick={() => setBg(c)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: bg === c ? "2px solid #F58F20" : "1px solid var(--border)" }} />
                ))}
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
            </Group>

            {/* Logo */}
            <Group title="Logo">
              <div className="flex items-center gap-3">
                <label className="qx-btn-ghost !text-xs cursor-pointer">
                  <FiUpload size={13} /> Upload
                  <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
                </label>
                {logo && (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logo} alt="logo" className="w-8 h-8 rounded-lg object-contain" style={{ border: "1px solid var(--border)" }} />
                    <button onClick={() => setLogo(null)} className="qx-btn-ghost !text-xs" style={{ color: "#f87171" }}><FiTrash2 size={13} /></button>
                  </>
                )}
              </div>
            </Group>

            {/* Frame */}
            <Group title="Frame (Call-to-Action)">
              <label className="flex items-center gap-2 text-[12px] font-semibold mb-2" style={{ color: "var(--text-muted)" }}>
                <input type="checkbox" checked={frameOn} onChange={(e) => setFrameOn(e.target.checked)} className="accent-orange-500" />
                Add frame with caption
              </label>
              {frameOn && (
                <div className="space-y-2">
                  <input value={frameText} onChange={(e) => setFrameText(e.target.value.slice(0, 18))}
                    placeholder="SCAN ME" className="qx-auth-input !py-2 text-sm" />
                  <div className="flex flex-wrap items-center gap-2">
                    {FRAME_PRESETS.map((c) => (
                      <button key={c} onClick={() => setFrameColor(c)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                        style={{ background: c, border: frameColor === c ? "2px solid #fff" : "1px solid var(--border)" }} />
                    ))}
                    <input type="color" value={frameColor} onChange={(e) => setFrameColor(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
                  </div>
                </div>
              )}
            </Group>

            {/* Error level */}
            <Group title="Error correction">
              <div className="grid grid-cols-4 gap-2">
                {(["L", "M", "Q", "H"] as const).map((lv) => (
                  <Chip key={lv} active={level === lv} onClick={() => setLevel(lv)}>{lv}</Chip>
                ))}
              </div>
            </Group>
          </div>
        </div>
      </div>
    </div>
  );
}

/* A real qr-code-styling render at thumbnail size — the template preview is
   the template, not an approximation. Instances are tiny (72px) and only
   exist while the studio modal is open. */
function MiniQr({ tpl }: { tpl: QrTemplate }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("qr-code-styling");
      if (cancelled || !ref.current) return;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const opts: any = {
        width: 72, height: 72, type: "canvas", data: "https://qrixtools.com", margin: 3,
        qrOptions: { errorCorrectionLevel: "M" },
        dotsOptions: tpl.useGrad
          ? { type: tpl.dotType, gradient: { type: tpl.gradType, rotation: 0, colorStops: [{ offset: 0, color: tpl.fg }, { offset: 1, color: tpl.grad2 }] } }
          : { type: tpl.dotType, color: tpl.fg },
        backgroundOptions: { color: tpl.bg },
        cornersSquareOptions: { type: tpl.cornerSquare, color: tpl.fg },
        cornersDotOptions: { type: tpl.cornerDot, color: tpl.useGrad ? tpl.grad2 : tpl.fg },
      };
      const inst = new mod.default(opts);
      ref.current.innerHTML = "";
      inst.append(ref.current);
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="p-1.5 pb-0.5" style={{ background: tpl.frameOn ? tpl.frameColor : tpl.bg, transition: "background .2s" }}>
      <div ref={ref} className="rounded-md overflow-hidden mx-auto" style={{ width: 72, height: 72, background: tpl.bg }} />
      {tpl.frameOn && (
        <div className="text-[7px] font-extrabold tracking-wide pt-0.5 pb-1" style={{ color: pickTextColor(tpl.frameColor) }}>
          {tpl.frameText}
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>{title}</div>
      {children}
    </div>
  );
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="py-2 px-2 rounded-lg text-[11px] font-bold transition-all"
      style={{
        background: active ? "#F58F20" : "var(--surface-2)",
        color: active ? "#0c0c0c" : "var(--text-muted)",
        border: `1px solid ${active ? "transparent" : "var(--border)"}`,
      }}>
      {children}
    </button>
  );
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function pickTextColor(hex: string): string {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#0e0e0e" : "#ffffff";
}
