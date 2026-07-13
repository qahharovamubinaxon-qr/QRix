"use client";

/* Promo Video Maker (Mission 62) — turn a brand, a headline, a few
   benefits and a link into a short animated promo film. Four scenes
   (intro → headline → features → CTA+QR) render on a canvas timeline and
   record with MediaRecorder (MP4 where the browser can, WebM otherwise).
   Everything runs on-device; nothing is uploaded. */

import { useEffect, useRef, useState } from "react";
import { FiFilm, FiImage, FiZap, FiUploadCloud, FiX, FiDownload } from "react-icons/fi";
import { saveBlob } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

type Preset = { id: string; label: string; w: number; h: number };
type Theme = {
  id: string; label: string;
  bgA: string; bgB: string; glow: string; accent: string;
  text: string; sub: string; onAccent: string;
};

const PRESETS: Preset[] = [
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
  { id: "square", label: "Square 1:1", w: 1080, h: 1080 },
  { id: "wide", label: "Landscape 16:9", w: 1920, h: 1080 },
];

const THEMES: Theme[] = [
  { id: "qrix", label: "QRix Orange", bgA: "#12060a", bgB: "#2a0f06", glow: "#ff6a13", accent: "#ff6a13", text: "#ffffff", sub: "#ffb27a", onAccent: "#0e0e0e" },
  { id: "midnight", label: "Midnight", bgA: "#05060d", bgB: "#0f1a35", glow: "#5b8cff", accent: "#5b8cff", text: "#ffffff", sub: "#9db8ff", onAccent: "#05060d" },
  { id: "sunset", label: "Sunset", bgA: "#170617", bgB: "#3a0f2e", glow: "#f472b6", accent: "#f472b6", text: "#ffffff", sub: "#f9a8d4", onAccent: "#170617" },
  { id: "clean", label: "Clean Light", bgA: "#eceae4", bgB: "#ffffff", glow: "#ff6a13", accent: "#ff6a13", text: "#141414", sub: "#c2410c", onAccent: "#ffffff" },
];

const FPS = 30;
const DURATIONS = [8, 12, 15];

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
function fadeInOut(t: number, a: number, b: number, fin = 0.14, fout = 0.14) {
  const p = seg(t, a, b);
  return Math.min(clamp01(p / fin), clamp01((1 - p) / fout));
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let cur = "";
  for (const w of words) {
    const test = cur ? cur + " " + w : w;
    if (ctx.measureText(test).width > maxW && cur) { lines.push(cur); cur = w; }
    else cur = test;
  }
  if (cur) lines.push(cur);
  return lines;
}

export default function PromoVideoClient() {
  const [brand, setBrand] = useState("Your Brand");
  const [headline, setHeadline] = useState("Big things, made simple.");
  const [subline, setSubline] = useState("The all-in-one tool your customers will love.");
  const [features, setFeatures] = useState("Fast & private\nNo signup needed\nWorks on any device");
  const [cta, setCta] = useState("Get started today");
  const [link, setLink] = useState("https://qrix.uz");
  const [preset, setPreset] = useState(PRESETS[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [dur, setDur] = useState(12);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLCanvasElement | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const startRef = useRef<number>(0);
  const rafRef = useRef(0);

  const featureList = features.split("\n").map((f) => f.trim()).filter(Boolean).slice(0, 4);

  /* build the QR bitmap when the link changes */
  useEffect(() => {
    let dead = false;
    const url = link.trim();
    if (!url) { qrRef.current = null; return; }
    const id = setTimeout(async () => {
      try {
        const mod = await import("qr-code-styling");
        const QRCodeStyling = mod.default;
        const qr = new QRCodeStyling({
          width: 480, height: 480, type: "canvas", data: url, margin: 0,
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { type: "rounded", color: "#0e0e0e" },
          cornersSquareOptions: { type: "extra-rounded", color: "#0e0e0e" },
          backgroundOptions: { color: "#ffffff" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = (await (qr as any).getRawData("png")) as Blob | null;
        if (!blob || dead) return;
        const bmp = await createImageBitmap(blob);
        const c = document.createElement("canvas");
        c.width = bmp.width; c.height = bmp.height;
        c.getContext("2d")!.drawImage(bmp, 0, 0);
        qrRef.current = c;
      } catch { /* keep previous */ }
    }, 250);
    return () => { dead = true; clearTimeout(id); };
  }, [link]);

  const onLogo = async (file?: File) => {
    if (!file) return;
    try {
      const bmp = await createImageBitmap(file);
      const c = document.createElement("canvas");
      c.width = bmp.width; c.height = bmp.height;
      c.getContext("2d")!.drawImage(bmp, 0, 0);
      logoRef.current = c;
      setHasLogo(true);
    } catch { setErr("Couldn't read that image."); }
  };

  /* one frame of the promo at time t (0..1) */
  const drawFrame = (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
    const th = theme;
    const M = Math.min(W, H);
    const light = th.id === "clean";

    // animated backdrop
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, th.bgB); g.addColorStop(1, th.bgA);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const gx = W * (0.5 + 0.28 * Math.sin(t * Math.PI * 2));
    const gy = H * (0.42 + 0.18 * Math.cos(t * Math.PI * 2));
    const rg = ctx.createRadialGradient(gx, gy, 0, gx, gy, M * 0.85);
    rg.addColorStop(0, th.glow + (light ? "26" : "40")); rg.addColorStop(1, "transparent");
    ctx.fillStyle = rg; ctx.fillRect(0, 0, W, H);
    // drifting sparks
    for (let i = 0; i < 18; i++) {
      const sx = ((i * 379) % 997) / 997;
      const sp = 0.3 + ((i * 131) % 7) / 12;
      const sy = 1.15 - (((t * sp + i * 0.13) % 1) * 1.3);
      ctx.globalAlpha = (light ? 0.18 : 0.32) * (1 - Math.abs(0.5 - sy) * 1.6);
      ctx.fillStyle = th.glow;
      const r = 2 + (i % 3) * 1.6;
      ctx.fillRect(sx * W, sy * H, r, r);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";

    // persistent brand chip (after the intro hands off)
    const chip = seg(t, 0.2, 0.28);
    if (chip > 0 && brand.trim()) {
      ctx.globalAlpha = chip * 0.9;
      ctx.font = `700 ${M * 0.028}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = th.sub;
      ctx.fillText(brand.trim().toUpperCase().slice(0, 26), W / 2, H * 0.085);
      ctx.globalAlpha = 1;
    }

    // ── Scene 1 · intro (logo + brand) ──────────────────────────
    const a1 = fadeInOut(t, 0.0, 0.2, 0.2, 0.22);
    if (a1 > 0) {
      const p = easeOut(seg(t, 0.0, 0.2));
      ctx.save();
      ctx.globalAlpha = a1;
      const logo = logoRef.current;
      let by = H * 0.5;
      if (logo) {
        const ls = M * 0.26 * (0.8 + 0.2 * p);
        const lw = (logo.width / logo.height) * ls;
        ctx.drawImage(logo, W / 2 - lw / 2, H * 0.4 - ls / 2, lw, ls);
        by = H * 0.4 + ls / 2 + M * 0.09;
      }
      ctx.font = `800 ${M * 0.075}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = th.text;
      ctx.translate(W / 2, by); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p);
      ctx.fillText(brand.trim().slice(0, 22) || "Your Brand", 0, 0);
      ctx.restore();
    }

    // ── Scene 2 · headline + subline ────────────────────────────
    const a2 = fadeInOut(t, 0.2, 0.52, 0.12, 0.16);
    if (a2 > 0) {
      const p = seg(t, 0.2, 0.52);
      ctx.save();
      ctx.font = `800 ${M * 0.088}px Unbounded, Arial, sans-serif`;
      const lines = wrapLines(ctx, headline.trim() || "Big things, made simple.", W * 0.82);
      const lh = M * 0.105;
      const startY = H * 0.42 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, i) => {
        const lp = easeOut(clamp01((p - i * 0.06) / 0.4));
        ctx.globalAlpha = a2 * lp;
        ctx.fillStyle = th.text;
        ctx.fillText(ln, W / 2, startY + i * lh + (1 - lp) * M * 0.05);
      });
      // accent underline
      ctx.globalAlpha = a2 * easeOut(clamp01((p - 0.15) / 0.3));
      ctx.fillStyle = th.accent;
      const uw = M * 0.16 * easeOut(clamp01((p - 0.15) / 0.3));
      ctx.fillRect(W / 2 - uw / 2, startY + lines.length * lh - lh * 0.15, uw, M * 0.012);
      // subline
      ctx.globalAlpha = a2 * easeOut(clamp01((p - 0.3) / 0.4));
      ctx.font = `500 ${M * 0.036}px "Space Mono", monospace`;
      ctx.fillStyle = th.sub;
      const subLines = wrapLines(ctx, subline.trim(), W * 0.74);
      subLines.slice(0, 2).forEach((ln, i) => {
        ctx.fillText(ln, W / 2, startY + lines.length * lh + M * 0.06 + i * M * 0.052);
      });
      ctx.restore();
    }

    // ── Scene 3 · feature bullets ───────────────────────────────
    const a3 = fadeInOut(t, 0.5, 0.8, 0.1, 0.14);
    if (a3 > 0 && featureList.length) {
      const p = seg(t, 0.5, 0.8);
      ctx.save();
      ctx.textAlign = "left";
      ctx.font = `600 ${M * 0.05}px Unbounded, Arial, sans-serif`;
      const rowH = M * 0.11;
      const blockH = featureList.length * rowH;
      const x = W * 0.2;
      let y = H * 0.5 - blockH / 2 + rowH / 2;
      featureList.forEach((f, i) => {
        const rp = easeOut(clamp01((p - i * 0.12) / 0.45));
        if (rp <= 0) { y += rowH; return; }
        ctx.globalAlpha = a3 * rp;
        const dx = x - (1 - rp) * M * 0.08;
        // check dot
        ctx.fillStyle = th.accent;
        ctx.beginPath();
        ctx.arc(dx, y - M * 0.014, M * 0.028, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = th.onAccent; ctx.lineWidth = M * 0.008;
        ctx.beginPath();
        ctx.moveTo(dx - M * 0.012, y - M * 0.014);
        ctx.lineTo(dx - M * 0.003, y - M * 0.005);
        ctx.lineTo(dx + M * 0.014, y - M * 0.026);
        ctx.stroke();
        // label
        ctx.fillStyle = th.text;
        ctx.fillText(f.slice(0, 32), dx + M * 0.055, y);
        y += rowH;
      });
      ctx.restore();
    }

    // ── Scene 4 · CTA + QR ──────────────────────────────────────
    const a4 = fadeInOut(t, 0.78, 1.0, 0.12, 0.02);
    if (a4 > 0) {
      const p = easeOut(seg(t, 0.78, 1.0));
      ctx.save();
      ctx.globalAlpha = a4;
      ctx.textAlign = "center";
      const qr = qrRef.current;
      const centerY = qr ? H * 0.4 : H * 0.46;
      // QR card
      if (qr) {
        const qs = M * 0.34 * (0.85 + 0.15 * p);
        const pad = qs * 0.08;
        const cs = qs + pad * 2;
        const cx = W / 2, cy = centerY;
        ctx.save();
        ctx.shadowColor = th.glow; ctx.shadowBlur = 50 * p;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(cx - cs / 2, cy - cs / 2, cs, cs, cs * 0.08);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.drawImage(qr, cx - qs / 2, cy - qs / 2, qs, qs);
        ctx.restore();
      }
      // CTA pill
      const pillY = qr ? centerY + M * 0.32 : centerY;
      ctx.font = `800 ${M * 0.05}px Unbounded, Arial, sans-serif`;
      const label = (cta.trim() || "Get started").slice(0, 26);
      const tw = ctx.measureText(label).width;
      const pw = tw + M * 0.1, ph = M * 0.11;
      const scale = 0.85 + 0.15 * p;
      ctx.translate(W / 2, pillY); ctx.scale(scale, scale);
      ctx.shadowColor = th.glow; ctx.shadowBlur = 40 * p;
      ctx.fillStyle = th.accent;
      ctx.beginPath();
      ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = th.onAccent;
      ctx.textBaseline = "middle";
      ctx.fillText(label, 0, M * 0.004);
      ctx.textBaseline = "alphabetic";
      ctx.restore();
      // url caption
      if (link.trim()) {
        ctx.globalAlpha = a4;
        ctx.font = `500 ${M * 0.03}px "Space Mono", monospace`;
        ctx.fillStyle = th.sub;
        ctx.fillText(link.trim().replace(/^https?:\/\//, "").slice(0, 42), W / 2, (qr ? centerY + M * 0.32 : centerY) + M * 0.1);
        ctx.globalAlpha = 1;
      }
    }

    // progress line
    ctx.fillStyle = th.accent;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, H - M * 0.008, W * t, M * 0.008);
    ctx.globalAlpha = 1;
  };

  /* live preview loop */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = preset.w; cv.height = preset.h;
    const ctx = cv.getContext("2d")!;
    startRef.current = performance.now();
    const loop = (now: number) => {
      const t = ((now - startRef.current) / 1000 / dur) % 1;
      drawFrame(ctx, t, preset.w, preset.h);
      if (recording) setProgress(Math.min(100, Math.round(((now - startRef.current) / 1000 / dur) * 100)));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, theme, dur, brand, headline, subline, features, cta, link, hasLogo, recording]);

  const record = async () => {
    const cv = canvasRef.current;
    if (!cv || recording) return;
    setErr(null);
    const mime = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"]
      .find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
    if (!mime) { setErr("Video recording is not supported in this browser."); return; }
    const stream = cv.captureStream(FPS);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 9_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    setRecording(true);
    startRef.current = performance.now();
    rec.start(250);
    trackTool("promo-video");
    window.setTimeout(() => {
      rec.stop();
      rec.onstop = async () => {
        setRecording(false);
        setProgress(0);
        const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: mime.split(";")[0] });
        await saveBlob(blob, `qrix-promo.${ext}`);
      };
    }, dur * 1000 + 150);
  };

  const savePng = async () => {
    const cv = document.createElement("canvas");
    cv.width = preset.w; cv.height = preset.h;
    drawFrame(cv.getContext("2d")!, 0.9, preset.w, preset.h);
    cv.toBlob(async (b) => { if (b) await saveBlob(b, "qrix-promo.png"); }, "image/png");
  };

  const field = "w-full px-4 py-3 rounded-xl text-[14px]";
  const fieldStyle = { background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)" } as const;
  const lbl = "block text-[12px] font-semibold mb-1.5";

  return (
    <div className="grid lg:grid-cols-[minmax(0,440px)_1fr] gap-8 items-start">
      {/* controls */}
      <div className="space-y-4">
        <label className="block">
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Brand name</span>
          <input value={brand} onChange={(e) => setBrand(e.target.value)} maxLength={24} className={field} style={fieldStyle} />
        </label>
        <label className="block">
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Headline</span>
          <input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={60} className={field} style={fieldStyle} />
        </label>
        <label className="block">
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Subheadline</span>
          <input value={subline} onChange={(e) => setSubline(e.target.value)} maxLength={90} className={field} style={fieldStyle} />
        </label>
        <label className="block">
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Key points (one per line, up to 4)</span>
          <textarea value={features} onChange={(e) => setFeatures(e.target.value)} rows={4} className={field} style={fieldStyle} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className={lbl} style={{ color: "var(--text-muted)" }}>CTA</span>
            <input value={cta} onChange={(e) => setCta(e.target.value)} maxLength={26} className={field} style={fieldStyle} />
          </label>
          <label className="block">
            <span className={lbl} style={{ color: "var(--text-muted)" }}>Link (optional QR)</span>
            <input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…" className={field} style={fieldStyle} />
          </label>
        </div>

        {/* logo upload */}
        <div>
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Logo (optional)</span>
          {hasLogo ? (
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--primary-bright)" }}>Logo added</span>
              <button type="button" onClick={() => { logoRef.current = null; setHasLogo(false); }} className="qx-btn-ghost !p-1.5" aria-label="Remove logo"><FiX size={13} /></button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-[12.5px] font-semibold w-fit"
              style={{ background: "var(--surface-2)", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
              <FiUploadCloud size={15} /> Upload logo
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onLogo(e.target.files?.[0])} />
            </label>
          )}
        </div>

        <div>
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Format</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPreset(p)}
                className="px-3.5 py-2 rounded-full text-[12px] font-semibold"
                style={{ background: preset.id === p.id ? "var(--primary-bright)" : "var(--surface-2)", color: preset.id === p.id ? "#0e0e0e" : "var(--text-muted)", border: "1px solid var(--border)" }}>{p.label}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className={lbl} style={{ color: "var(--text-muted)" }}>Theme</span>
            <div className="flex flex-wrap gap-2">
              {THEMES.map((th) => (
                <button key={th.id} type="button" onClick={() => setTheme(th)}
                  className="w-8 h-8 rounded-full"
                  title={th.label}
                  style={{ background: th.glow, outline: theme.id === th.id ? "2px solid var(--text)" : "1px solid var(--border)", outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div>
            <span className={lbl} style={{ color: "var(--text-muted)" }}>Length</span>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button key={d} type="button" onClick={() => setDur(d)}
                  className="px-3 py-2 rounded-lg text-[12px] font-bold"
                  style={{ background: dur === d ? "var(--primary-dim)" : "var(--surface-2)", color: dur === d ? "var(--primary-bright)" : "var(--text-muted)", border: `1px solid ${dur === d ? "var(--border-hover)" : "var(--border)"}` }}>{d}s</button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-1 space-y-2.5">
          <button type="button" onClick={record} disabled={recording} className="qx-btn-hero w-full disabled:opacity-60">
            {recording ? <><FiZap size={15} /> Recording… {progress}%</> : <><FiFilm size={15} /> Record promo ({dur}s)</>}
          </button>
          <button type="button" onClick={savePng} className="qx-btn-ghost w-full !py-3 text-sm">
            <FiImage size={14} /> Download poster frame (PNG)
          </button>
          {err && <p className="text-[12.5px]" style={{ color: "var(--danger)" }}>{err}</p>}
          <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
            <FiDownload size={11} className="inline -mt-0.5 mr-1" />
            Chrome/Edge save MP4, WebM otherwise — ready for Reels, Stories, Shorts and ads. Rendered on your device; nothing is uploaded.
          </p>
        </div>
      </div>

      {/* live preview */}
      <div className="flex justify-center lg:sticky lg:top-24">
        <canvas ref={canvasRef} role="img" aria-label="Promo video live preview"
          style={{
            width: "100%",
            maxWidth: preset.w > preset.h ? 620 : preset.w === preset.h ? 460 : 360,
            aspectRatio: `${preset.w} / ${preset.h}`,
            borderRadius: 18,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }} />
      </div>
    </div>
  );
}
