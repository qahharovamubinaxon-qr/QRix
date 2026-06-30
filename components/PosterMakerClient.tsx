"use client";

import { useEffect, useRef, useState } from "react";
import { FiDownload, FiChevronDown } from "react-icons/fi";
import { pickSave, finishSave } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

/* eslint-disable @typescript-eslint/no-explicit-any */

type Tpl = { id: string; label: string; emoji: string; heading: string; sub: string; accent: string };

const TEMPLATES: Tpl[] = [
  { id: "menu", label: "Menu", emoji: "🍽️", heading: "SCAN FOR MENU", sub: "Point your camera to view our full menu", accent: "#16a34a" },
  { id: "review", label: "Review", emoji: "⭐", heading: "LEAVE A REVIEW", sub: "We'd love your feedback — scan to review us", accent: "#F58F20" },
  { id: "follow", label: "Follow", emoji: "📱", heading: "FOLLOW US", sub: "Scan to follow us on social media", accent: "#7c3aed" },
  { id: "pay", label: "Pay", emoji: "💳", heading: "PAY HERE", sub: "Scan to pay quickly and securely", accent: "#2563eb" },
  { id: "website", label: "Website", emoji: "🌐", heading: "VISIT OUR WEBSITE", sub: "Scan to learn more about us", accent: "#0891b2" },
  { id: "custom", label: "Custom", emoji: "✨", heading: "SCAN ME", sub: "", accent: "#F58F20" },
];

const W = 1240, H = 1754; // A4 portrait @ ~150dpi

export default function PosterMakerClient() {
  const [tplId, setTplId] = useState("menu");
  const [url, setUrl] = useState("https://yourwebsite.com");
  const [heading, setHeading] = useState(TEMPLATES[0].heading);
  const [sub, setSub] = useState(TEMPLATES[0].sub);
  const [accent, setAccent] = useState(TEMPLATES[0].accent);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [dlOpen, setDlOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function applyTemplate(t: Tpl) {
    setTplId(t.id);
    setHeading(t.heading);
    setSub(t.sub);
    setAccent(t.accent);
  }

  // generate QR whenever the link changes
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const mod = await import("qr-code-styling");
      const qr = new mod.default({
        width: 600, height: 600, type: "canvas", data: url || "https://qrix.uz", margin: 6,
        qrOptions: { errorCorrectionLevel: "H" },
        dotsOptions: { type: "rounded", color: "#0e0e0e" },
        cornersSquareOptions: { type: "extra-rounded", color: "#0e0e0e" },
        backgroundOptions: { color: "#ffffff" },
      } as any);
      const blob = (await (qr as any).getRawData("png")) as Blob | null;
      if (!blob || cancelled) return;
      const reader = new FileReader();
      reader.onload = () => !cancelled && setQrUrl(String(reader.result));
      reader.readAsDataURL(blob);
    })();
    return () => { cancelled = true; };
  }, [url]);

  // draw the poster on every change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !qrUrl) return;
    const ctx = canvas.getContext("2d")!;
    const img = new Image();
    img.onload = () => {
      // background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = tint(accent, 0.08);
      ctx.fillRect(0, 0, W, H);
      // top band
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, W, 26);
      ctx.fillRect(0, H - 26, W, 26);
      // heading
      ctx.fillStyle = "#111118";
      ctx.textAlign = "center";
      ctx.font = "800 110px Poppins, Inter, sans-serif";
      wrapText(ctx, (heading || "SCAN ME").toUpperCase(), W / 2, 250, W - 160, 116);
      // accent underline
      ctx.fillStyle = accent;
      ctx.fillRect(W / 2 - 90, 300, 180, 12);
      // QR with a soft card
      const qrSize = 720, qx = (W - qrSize) / 2, qy = 430;
      roundRect(ctx, qx - 36, qy - 36, qrSize + 72, qrSize + 72, 40);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.18)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
      ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.drawImage(img, qx, qy, qrSize, qrSize);
      // "scan" pill
      ctx.fillStyle = accent;
      roundRect(ctx, W / 2 - 150, qy + qrSize + 70, 300, 92, 46); ctx.fill();
      ctx.fillStyle = pickText(accent);
      ctx.font = "800 44px Poppins, Inter, sans-serif";
      ctx.fillText("📷  SCAN ME", W / 2, qy + qrSize + 132);
      // subtext
      if (sub.trim()) {
        ctx.fillStyle = "#4a5568";
        ctx.font = "500 42px Inter, sans-serif";
        wrapText(ctx, sub, W / 2, qy + qrSize + 250, W - 200, 56);
      }
      // footer
      ctx.fillStyle = "#9aa3b2";
      ctx.font = "600 28px Inter, sans-serif";
      ctx.fillText("Made with QRix", W / 2, H - 70);
    };
    img.src = qrUrl;
  }, [qrUrl, heading, sub, accent]);

  async function download(kind: "pdf" | "png") {
    setDlOpen(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    trackTool("poster", { format: kind, template: tplId });
    if (kind === "png") {
      const blob = await new Promise<Blob | null>((r) => canvas.toBlob((b) => r(b), "image/png"));
      if (blob) await saveAndStore(blob, "qr-poster.png");
      return;
    }
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    doc.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 210, 297);
    const blob = doc.output("blob");
    await saveAndStore(blob, "qr-poster.pdf");
  }
  async function saveAndStore(blob: Blob, name: string) {
    const t = await pickSave(name);
    if (t.kind === "cancelled") return;
    await finishSave(t, blob, name);
  }

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[320px_1fr] gap-6">
        {/* controls */}
        <div className="space-y-5">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Template</div>
            <div className="grid grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button key={t.id} onClick={() => applyTemplate(t)} className="py-2 rounded-lg text-[11px] font-bold transition-all"
                  style={{ background: tplId === t.id ? "#F58F20" : "var(--surface-2)", color: tplId === t.id ? "#0c0c0c" : "var(--text-muted)", border: `1px solid ${tplId === t.id ? "transparent" : "var(--border)"}` }}>
                  {t.emoji} {t.label}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Link / content</span>
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="qx-auth-input mt-1" />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Heading</span>
            <input value={heading} onChange={(e) => setHeading(e.target.value.slice(0, 40))} className="qx-auth-input mt-1" />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Subtext</span>
            <input value={sub} onChange={(e) => setSub(e.target.value.slice(0, 90))} className="qx-auth-input mt-1" />
          </label>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Accent color</div>
            <div className="flex flex-wrap items-center gap-2">
              {["#F58F20", "#16a34a", "#7c3aed", "#2563eb", "#0891b2", "#db2777", "#0e0e0e"].map((c) => (
                <button key={c} onClick={() => setAccent(c)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                  style={{ background: c, border: accent === c ? "2px solid #F58F20" : "1px solid var(--border)" }} />
              ))}
              <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
            </div>
          </div>
          <div className="relative">
            <div className="flex">
              <button onClick={() => download("pdf")} className="qx-btn-hero flex-1 !rounded-r-none"><FiDownload size={15} /> Download PDF</button>
              <button onClick={() => setDlOpen(!dlOpen)} className="qx-btn-hero !rounded-l-none !px-3" style={{ borderLeft: "1px solid rgba(255,255,255,.25)" }}><FiChevronDown size={14} /></button>
            </div>
            {dlOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-40" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
                <button onClick={() => download("pdf")} className="w-full px-4 py-2.5 text-xs font-semibold text-left hover:opacity-80" style={{ color: "var(--text)" }}>PDF (print-ready A4)</button>
                <button onClick={() => download("png")} className="w-full px-4 py-2.5 text-xs font-semibold text-left hover:opacity-80" style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}>PNG image</button>
              </div>
            )}
          </div>
        </div>

        {/* live preview */}
        <div className="flex items-start justify-center">
          <canvas ref={canvasRef} width={W} height={H} className="rounded-xl w-full max-w-[420px]" style={{ boxShadow: "0 12px 50px rgba(0,0,0,.4)", border: "1px solid var(--border)" }} />
        </div>
      </div>
    </div>
  );
}

/* helpers */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath(); ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}
function wrapText(ctx: CanvasRenderingContext2D, text: string, cx: number, y: number, maxW: number, lh: number) {
  const words = text.split(" "); let line = ""; let yy = y;
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, cx, yy); line = w; yy += lh; }
    else line = test;
  }
  ctx.fillText(line, cx, yy);
}
function tint(hex: string, a: number) {
  const n = parseInt(hex.replace("#", ""), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}
function pickText(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6 ? "#0e0e0e" : "#ffffff";
}
