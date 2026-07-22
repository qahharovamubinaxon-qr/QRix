"use client";

import { useEffect, useRef, useState } from "react";
import { FiDownload, FiChevronDown, FiImage, FiX } from "react-icons/fi";
import { pickSave, finishSave } from "@/lib/save-file";
import { trackTool } from "@/lib/track";
import { POSTER_W, POSTER_H, posterLayout, wrapLines } from "@/lib/poster-layout";

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

const W = POSTER_W, H = POSTER_H;
const HEADING_FONT = "800 110px Poppins, Inter, sans-serif";
const SUB_FONT = "500 42px Inter, sans-serif";
const LOGO_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/gif", "image/avif"];

export default function PosterMakerClient() {
  const [tplId, setTplId] = useState("menu");
  const [url, setUrl] = useState("https://yourwebsite.com");
  const [heading, setHeading] = useState(TEMPLATES[0].heading);
  const [sub, setSub] = useState(TEMPLATES[0].sub);
  const [accent, setAccent] = useState(TEMPLATES[0].accent);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [logo, setLogo] = useState<{ src: string; name: string } | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [credit, setCredit] = useState(true);
  const [dlOpen, setDlOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
    let cancelled = false;
    (async () => {
      const [qrImg, logoImg] = await Promise.all([loadImage(qrUrl), logo ? loadImage(logo.src) : null]);
      if (cancelled || !qrImg) return;
      const ctx = canvas.getContext("2d")!;
      const headingText = (heading || "SCAN ME").toUpperCase();
      const subText = sub.trim();

      // measure first — the layout below flows from how many lines these take
      ctx.font = HEADING_FONT;
      const headingLines = wrapLines(headingText, W - 160, (s) => ctx.measureText(s).width);
      ctx.font = SUB_FONT;
      const subLines = subText ? wrapLines(subText, W - 200, (s) => ctx.measureText(s).width) : [];
      const L = posterLayout({
        headingLines: headingLines.length,
        subLines: subLines.length,
        logo: logoImg ? { w: logoImg.naturalWidth || logoImg.width, h: logoImg.naturalHeight || logoImg.height } : null,
      });

      // background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = tint(accent, 0.08);
      ctx.fillRect(0, 0, W, H);
      // top band
      ctx.fillStyle = accent;
      ctx.fillRect(0, 0, W, 26);
      ctx.fillRect(0, H - 26, W, 26);
      // logo
      if (logoImg && L.logo) ctx.drawImage(logoImg, L.logo.x, L.logo.y, L.logo.w, L.logo.h);
      // heading
      ctx.fillStyle = "#111118";
      ctx.textAlign = "center";
      ctx.font = HEADING_FONT;
      headingLines.forEach((line, i) => ctx.fillText(line, W / 2, L.headingBaseline + i * L.headingLineH));
      // accent underline
      ctx.fillStyle = accent;
      ctx.fillRect(W / 2 - 90, L.underlineY, 180, 12);
      // QR with a soft card
      const { x: qx, y: qy, size: qrSize } = L.qr;
      roundRect(ctx, qx - 36, qy - 36, qrSize + 72, qrSize + 72, 40);
      ctx.fillStyle = "#ffffff";
      ctx.shadowColor = "rgba(0,0,0,0.18)"; ctx.shadowBlur = 40; ctx.shadowOffsetY = 14;
      ctx.fill();
      ctx.shadowColor = "transparent"; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
      ctx.drawImage(qrImg, qx, qy, qrSize, qrSize);
      // "scan" pill
      ctx.fillStyle = accent;
      roundRect(ctx, W / 2 - 150, L.pillY, 300, 92, 46); ctx.fill();
      ctx.fillStyle = pickText(accent);
      ctx.font = "800 44px Poppins, Inter, sans-serif";
      ctx.fillText("📷  SCAN ME", W / 2, L.pillTextBaseline);
      // subtext
      if (subLines.length) {
        ctx.fillStyle = "#4a5568";
        ctx.font = SUB_FONT;
        subLines.forEach((line, i) => ctx.fillText(line, W / 2, L.subBaseline + i * L.subLineH));
      }
      // credit — optional, so "no watermark" stays true
      if (credit) {
        ctx.fillStyle = "#9aa3b2";
        ctx.font = "600 28px Inter, sans-serif";
        ctx.fillText("Made with QRix", W / 2, L.footerBaseline);
      }
    })();
    return () => { cancelled = true; };
  }, [qrUrl, heading, sub, accent, logo, credit]);

  function onLogoPick(file: File | null | undefined) {
    if (!file) return;
    if (!LOGO_TYPES.includes(file.type)) {
      setLogoError("Use a PNG, JPG, WebP, GIF, AVIF or SVG file.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setLogoError("That file is over 8 MB — resize it first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const src = String(reader.result);
      // an SVG with no intrinsic size never decodes — catch it before it silently vanishes
      const probe = await loadImage(src);
      if (!probe || !(probe.naturalWidth || probe.width)) {
        setLogoError("That image could not be read. An SVG needs a width and height.");
        return;
      }
      setLogoError(null);
      setLogo({ src, name: file.name });
      trackTool("poster", { logo: "added" });
    };
    reader.onerror = () => setLogoError("That file could not be read.");
    reader.readAsDataURL(file);
  }

  async function download(kind: "pdf" | "png") {
    setDlOpen(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    trackTool("poster", { format: kind, template: tplId, logo: logo ? "yes" : "no", credit: credit ? "yes" : "no" });
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
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Logo (optional)</div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml,image/gif,image/avif"
              className="hidden"
              onChange={(e) => { onLogoPick(e.target.files?.[0]); e.target.value = ""; }}
            />
            {logo ? (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logo.src} alt="" className="w-7 h-7 object-contain rounded" />
                <span className="text-[11px] font-semibold truncate flex-1" style={{ color: "var(--text-muted)" }}>{logo.name}</span>
                <button onClick={() => logoInputRef.current?.click()} className="text-[11px] font-bold" style={{ color: "#F58F20" }}>Change</button>
                <button onClick={() => setLogo(null)} aria-label="Remove logo" className="opacity-70 hover:opacity-100" style={{ color: "var(--text-muted)" }}><FiX size={14} /></button>
              </div>
            ) : (
              <button
                onClick={() => logoInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-bold transition-all hover:opacity-80"
                style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px dashed var(--border)" }}
              >
                <FiImage size={14} /> Upload your logo
              </button>
            )}
            <p className="text-[10.5px] mt-1.5 leading-snug" style={{ color: logoError ? "#ef4444" : "var(--text-faint)" }}>
              {logoError || "PNG, JPG, WebP or SVG — placed above the heading. It never leaves your browser."}
            </p>
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input type="checkbox" checked={credit} onChange={(e) => setCredit(e.target.checked)} className="w-4 h-4 accent-[#F58F20]" />
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Show “Made with QRix” credit</span>
          </label>
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
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
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
