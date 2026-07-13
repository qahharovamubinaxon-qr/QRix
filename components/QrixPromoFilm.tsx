"use client";

/* QRix Brand Film (Mission 63, orange edition) — the site's own promo.
   A scripted five-scene canvas film (wordmark → 185+ tools → benefits →
   live QR → CTA) with the bunny mascot, on a vibrant orange backdrop with
   white/dark type. Rendered on-device, recordable to MP4/WebM, and
   embeddable (16:9, autoplay, no chrome) on the homepage. Pauses when
   scrolled off-screen. */

import { useEffect, useRef, useState } from "react";
import { FiFilm, FiImage, FiZap, FiDownload } from "react-icons/fi";
import { saveBlob } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

type Preset = { id: string; label: string; w: number; h: number };
const PRESETS: Preset[] = [
  { id: "wide", label: "Landscape 16:9", w: 1920, h: 1080 },
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
  { id: "square", label: "Square 1:1", w: 1080, h: 1080 },
];

const DUR = 15;
const FPS = 30;
const SITE = "qrix.uz";
const CATS = ["QR Codes", "PDF", "Images", "Video", "AI", "3D"];
const BENEFITS = ["100% free — no limits", "Runs on your device", "No signup, no watermark", "Works in any browser"];

// Orange palette — vibrant backdrop, white/dark ink.
const C = {
  bgA: "#ff8a2e", bgB: "#d2440a",
  inkW: "#ffffff", inkSoft: "rgba(255,255,255,0.94)",
  dark: "#3a1400", pillInk: "#c2410c",
  chipBg: "rgba(255,255,255,0.95)", chipInk: "#c2410c",
  shadow: "rgba(70,22,0,0.55)",
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
const fadeInOut = (t: number, a: number, b: number, fin = 0.16, fout = 0.16) => {
  const p = seg(t, a, b);
  return Math.min(clamp01(p / fin), clamp01((1 - p) / fout));
};

async function loadImg(src: string): Promise<HTMLCanvasElement | null> {
  try {
    const blob = await fetch(src).then((r) => (r.ok ? r.blob() : Promise.reject()));
    const bmp = await createImageBitmap(blob);
    const c = document.createElement("canvas");
    c.width = bmp.width; c.height = bmp.height;
    c.getContext("2d")!.drawImage(bmp, 0, 0);
    return c;
  } catch { return null; }
}

export default function QrixPromoFilm({ embed = false }: { embed?: boolean }) {
  const [preset, setPreset] = useState(PRESETS[0]);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  const [visible, setVisible] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef(0);
  const rafRef = useRef(0);
  const mascots = useRef<Record<string, HTMLCanvasElement | null>>({});
  const qrRef = useRef<HTMLCanvasElement | null>(null);
  const [ready, setReady] = useState(false);

  const activePreset = embed ? PRESETS[0] : preset;

  /* preload mascots + QR once */
  useEffect(() => {
    let dead = false;
    (async () => {
      const [hero, point, blue, walk] = await Promise.all([
        loadImg("/scenes/bunny-hero.webp"),
        loadImg("/scenes/bunny-point.webp"),
        loadImg("/scenes/bunny-blue.webp"),
        loadImg("/scenes/bunny-walk.webp"),
      ]);
      if (dead) return;
      mascots.current = { hero, point, blue, walk };
      try {
        const mod = await import("qr-code-styling");
        const qr = new mod.default({
          width: 480, height: 480, type: "canvas", data: `https://${SITE}`, margin: 0,
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { type: "rounded", color: "#0e0e0e" },
          cornersSquareOptions: { type: "extra-rounded", color: "#0e0e0e" },
          backgroundOptions: { color: "#ffffff" },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const b = (await (qr as any).getRawData("png")) as Blob | null;
        if (b && !dead) {
          const bmp = await createImageBitmap(b);
          const c = document.createElement("canvas");
          c.width = bmp.width; c.height = bmp.height;
          c.getContext("2d")!.drawImage(bmp, 0, 0);
          qrRef.current = c;
        }
      } catch { /* qr optional */ }
      if (!dead) setReady(true);
    })();
    return () => { dead = true; };
  }, []);

  /* pause the render loop when scrolled off-screen (perf) */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((es) => setVisible(es[0]?.isIntersecting ?? true), { threshold: 0.05 });
    io.observe(cv);
    return () => io.disconnect();
  }, []);

  const drawMascot = (ctx: CanvasRenderingContext2D, key: string, cx: number, cy: number, h: number, alpha: number) => {
    const img = mascots.current[key];
    if (!img || alpha <= 0) return;
    const w = (img.width / img.height) * h;
    ctx.globalAlpha = alpha;
    ctx.drawImage(img, cx - w / 2, cy - h, w, h);
    ctx.globalAlpha = 1;
  };

  const drawFrame = (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
    const M = Math.min(W, H);
    const portrait = H > W;
    // orange backdrop
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, C.bgA); g.addColorStop(1, C.bgB);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // moving highlight
    const gx = W * (0.5 + 0.26 * Math.sin(t * Math.PI * 2));
    const gy = H * (0.36 + 0.16 * Math.cos(t * Math.PI * 2));
    const hg = ctx.createRadialGradient(gx, gy, 0, gx, gy, M * 0.85);
    hg.addColorStop(0, "rgba(255,214,168,0.4)"); hg.addColorStop(1, "transparent");
    ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H);
    // corner vignette for text contrast
    const vg = ctx.createRadialGradient(W / 2, H / 2, M * 0.3, W / 2, H / 2, M * 0.95);
    vg.addColorStop(0, "transparent"); vg.addColorStop(1, "rgba(90,30,0,0.5)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // light sparks
    for (let i = 0; i < 20; i++) {
      const sx = ((i * 379) % 997) / 997;
      const sp = 0.3 + ((i * 131) % 7) / 12;
      const sy = 1.15 - (((t * sp + i * 0.13) % 1) * 1.3);
      ctx.globalAlpha = 0.28 * (1 - Math.abs(0.5 - sy) * 1.6);
      ctx.fillStyle = "#ffffff";
      const r = 2 + (i % 3) * 1.6;
      ctx.fillRect(sx * W, sy * H, r, r);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = "center";
    const float = Math.sin(t * Math.PI * 6) * M * 0.012;
    const shadow = (blur: number) => { ctx.shadowColor = C.shadow; ctx.shadowBlur = blur; };
    const noShadow = () => { ctx.shadowBlur = 0; };

    // ── Scene 1 · brand ─────────────────────────────────────────
    const a1 = fadeInOut(t, 0.0, 0.2, 0.18, 0.2);
    if (a1 > 0) {
      const p = easeOut(seg(t, 0.0, 0.2));
      drawMascot(ctx, "hero", W / 2, H * (portrait ? 0.86 : 0.98) + float, M * (portrait ? 0.46 : 0.52), a1 * 0.97);
      ctx.save(); ctx.globalAlpha = a1;
      ctx.translate(W / 2, H * (portrait ? 0.32 : 0.36)); ctx.scale(0.9 + 0.1 * p, 0.9 + 0.1 * p);
      ctx.font = `800 ${M * 0.15}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = C.inkW; shadow(30);
      ctx.fillText("QRix", 0, 0); noShadow();
      ctx.font = `500 ${M * 0.04}px "Space Mono", monospace`;
      ctx.fillStyle = C.inkSoft;
      ctx.fillText("Everything you need. Free.", 0, M * 0.09);
      ctx.restore();
    }

    // ── Scene 2 · 185+ tools ────────────────────────────────────
    const a2 = fadeInOut(t, 0.2, 0.44, 0.14, 0.16);
    if (a2 > 0) {
      const p = seg(t, 0.2, 0.44);
      drawMascot(ctx, "point", W * (portrait ? 0.5 : 0.82), H * (portrait ? 0.88 : 1.0) + float, M * (portrait ? 0.4 : 0.48), a2 * 0.96);
      ctx.save(); ctx.globalAlpha = a2 * easeOut(clamp01(p / 0.3));
      ctx.translate(W * (portrait ? 0.5 : 0.36), H * (portrait ? 0.3 : 0.36));
      ctx.font = `800 ${M * 0.2}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = C.inkW; shadow(28);
      ctx.fillText("185+", 0, 0); noShadow();
      ctx.font = `700 ${M * 0.05}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = C.dark;
      ctx.fillText("FREE TOOLS", 0, M * 0.08);
      ctx.restore();
      // category chips cascade
      ctx.font = `600 ${M * 0.032}px Unbounded, Arial, sans-serif`;
      const chipY = H * (portrait ? 0.5 : 0.58);
      const widths = CATS.map((c) => ctx.measureText(c).width + M * 0.06);
      const total = widths.reduce((s, w) => s + w + M * 0.02, 0);
      let cxp = W * (portrait ? 0.5 : 0.36) - total / 2;
      CATS.forEach((c, i) => {
        const cp = easeOut(clamp01((p - 0.25 - i * 0.06) / 0.4));
        const w = widths[i];
        if (cp > 0) {
          ctx.globalAlpha = a2 * cp;
          ctx.fillStyle = C.chipBg;
          ctx.beginPath();
          ctx.roundRect(cxp, chipY - M * 0.03 + (1 - cp) * M * 0.04, w, M * 0.06, M * 0.03);
          ctx.fill();
          ctx.fillStyle = C.chipInk; ctx.textAlign = "center";
          ctx.fillText(c, cxp + w / 2, chipY + M * 0.011 + (1 - cp) * M * 0.04);
        }
        cxp += w + M * 0.02;
      });
      ctx.globalAlpha = 1;
    }

    // ── Scene 3 · benefits ──────────────────────────────────────
    const a3 = fadeInOut(t, 0.44, 0.66, 0.12, 0.14);
    if (a3 > 0) {
      const p = seg(t, 0.44, 0.66);
      drawMascot(ctx, "blue", W * (portrait ? 0.5 : 0.83) + float, H * (portrait ? 0.9 : 1.0), M * (portrait ? 0.38 : 0.48), a3 * 0.96);
      ctx.save(); ctx.textAlign = "left";
      ctx.font = `600 ${M * 0.046}px Unbounded, Arial, sans-serif`;
      const x = W * 0.16;
      const rowH = M * 0.1;
      let y = H * (portrait ? 0.4 : 0.5) - (BENEFITS.length * rowH) / 2 + rowH / 2;
      BENEFITS.forEach((b, i) => {
        const rp = easeOut(clamp01((p - i * 0.1) / 0.4));
        if (rp <= 0) { y += rowH; return; }
        ctx.globalAlpha = a3 * rp;
        const dx = x - (1 - rp) * M * 0.06;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(dx, y - M * 0.013, M * 0.026, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = C.pillInk; ctx.lineWidth = M * 0.008;
        ctx.beginPath();
        ctx.moveTo(dx - M * 0.011, y - M * 0.013);
        ctx.lineTo(dx - M * 0.002, y - M * 0.004);
        ctx.lineTo(dx + M * 0.013, y - M * 0.024);
        ctx.stroke();
        ctx.fillStyle = C.inkW; shadow(14);
        ctx.fillText(b, dx + M * 0.05, y); noShadow();
        y += rowH;
      });
      ctx.restore();
      ctx.globalAlpha = 1;
    }

    // ── Scene 4 · live QR reveal ────────────────────────────────
    const a4 = fadeInOut(t, 0.66, 0.84, 0.12, 0.14);
    if (a4 > 0) {
      const p = seg(t, 0.66, 0.84);
      ctx.save(); ctx.globalAlpha = a4; ctx.textAlign = "center";
      ctx.font = `700 ${M * 0.055}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = C.inkW; shadow(18);
      ctx.fillText("Scan. Convert. Create.", W / 2, H * (portrait ? 0.26 : 0.24)); noShadow();
      const qr = qrRef.current;
      if (qr) {
        const qs = M * (portrait ? 0.42 : 0.34) * (0.85 + 0.15 * easeOut(p));
        const pad = qs * 0.08, cs = qs + pad * 2;
        const cx = W / 2, cy = H * (portrait ? 0.52 : 0.56);
        shadow(50 * easeOut(p));
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.roundRect(cx - cs / 2, cy - cs / 2, cs, cs, cs * 0.08); ctx.fill();
        noShadow();
        const TILES = 11, ts = qs / TILES;
        for (let r = 0; r < TILES; r++) for (let c = 0; c < TILES; c++) {
          const delay = ((r + c) / (TILES * 2 - 2)) * 0.5;
          const k = easeOut(clamp01((p - delay) / 0.3));
          if (k <= 0) continue;
          ctx.globalAlpha = a4 * k;
          ctx.drawImage(qr, (qr.width / TILES) * c, (qr.height / TILES) * r, qr.width / TILES, qr.height / TILES,
            cx - qs / 2 + c * ts, cy - qs / 2 + r * ts, ts, ts);
        }
      }
      ctx.restore(); ctx.globalAlpha = 1;
    }

    // ── Scene 5 · CTA ───────────────────────────────────────────
    const a5 = fadeInOut(t, 0.84, 1.0, 0.12, 0.02);
    if (a5 > 0) {
      const p = easeOut(seg(t, 0.84, 1.0));
      drawMascot(ctx, "hero", W * (portrait ? 0.5 : 0.82), H * (portrait ? 0.92 : 1.0) + float, M * (portrait ? 0.4 : 0.5), a5 * 0.97);
      ctx.save(); ctx.globalAlpha = a5; ctx.textAlign = "center";
      ctx.font = `800 ${M * 0.075}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = C.inkW; shadow(22);
      ctx.fillText("Start free today", W * (portrait ? 0.5 : 0.4), H * (portrait ? 0.34 : 0.4)); noShadow();
      // white pill w/ orange ink
      ctx.font = `800 ${M * 0.05}px Unbounded, Arial, sans-serif`;
      const label = SITE;
      const tw = ctx.measureText(label).width, pw = tw + M * 0.12, ph = M * 0.12;
      const cx = W * (portrait ? 0.5 : 0.4), cy = H * (portrait ? 0.46 : 0.56);
      ctx.translate(cx, cy); ctx.scale(0.85 + 0.15 * p, 0.85 + 0.15 * p);
      shadow(36 * p);
      ctx.fillStyle = "#ffffff";
      ctx.beginPath(); ctx.roundRect(-pw / 2, -ph / 2, pw, ph, ph / 2); ctx.fill();
      noShadow();
      ctx.fillStyle = C.pillInk; ctx.textBaseline = "middle";
      ctx.fillText(label, 0, M * 0.004); ctx.textBaseline = "alphabetic";
      ctx.restore();
    }

    // watermark + progress
    ctx.globalAlpha = 0.7; ctx.textAlign = "left";
    ctx.font = `600 ${M * 0.022}px "Space Mono", monospace`;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(SITE, M * 0.05, H - M * 0.05);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, H - M * 0.008, W * t, M * 0.008);
  };

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = activePreset.w; cv.height = activePreset.h;
    const ctx = cv.getContext("2d")!;
    // draw a first frame immediately so it never shows blank
    drawFrame(ctx, 0, activePreset.w, activePreset.h);
    // reduced-motion → a static poster frame, no loop (unless recording)
    const reduce = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce && !recording) { drawFrame(ctx, 0.9, activePreset.w, activePreset.h); return; }
    if (!visible && !recording) return; // paused off-screen
    startRef.current = performance.now();
    const loop = (now: number) => {
      const t = ((now - startRef.current) / 1000 / DUR) % 1;
      drawFrame(ctx, t, activePreset.w, activePreset.h);
      if (recording) setProgress(Math.min(100, Math.round(((now - startRef.current) / 1000 / DUR) * 100)));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePreset, ready, recording, visible]);

  const record = async () => {
    const cv = canvasRef.current;
    if (!cv || recording) return;
    setErr(null);
    const mime = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"]
      .find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
    if (!mime) { setErr("Video recording is not supported in this browser."); return; }
    const stream = cv.captureStream(FPS);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 10_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    setRecording(true);
    startRef.current = performance.now();
    rec.start(250);
    trackTool("qrix-promo-film");
    window.setTimeout(() => {
      rec.stop();
      rec.onstop = async () => {
        setRecording(false); setProgress(0);
        const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
        await saveBlob(new Blob(chunks, { type: mime.split(";")[0] }), `qrix-promo-${activePreset.id}.${ext}`);
      };
    }, DUR * 1000 + 150);
  };

  const savePng = async () => {
    const cv = document.createElement("canvas");
    cv.width = activePreset.w; cv.height = activePreset.h;
    drawFrame(cv.getContext("2d")!, 0.9, activePreset.w, activePreset.h);
    cv.toBlob(async (b) => { if (b) await saveBlob(b, `qrix-promo-${activePreset.id}.png`); }, "image/png");
  };

  // Embedded on the homepage — just the auto-playing 16:9 canvas.
  if (embed) {
    return (
      <canvas ref={canvasRef} role="img" aria-label="QRix brand promo film — 185+ free on-device tools for QR codes, PDFs, images, video and AI"
        style={{ width: "100%", aspectRatio: "1920 / 1080", borderRadius: 16, display: "block", boxShadow: "0 20px 60px rgba(180,60,8,.35)" }} />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-center">
        <canvas ref={canvasRef} role="img" aria-label="QRix brand promo film preview"
          style={{
            width: "100%",
            maxWidth: activePreset.w > activePreset.h ? 760 : activePreset.w === activePreset.h ? 480 : 380,
            aspectRatio: `${activePreset.w} / ${activePreset.h}`,
            borderRadius: 20,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <div className="flex gap-2">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" onClick={() => setPreset(p)}
              className="px-4 py-2 rounded-full text-[12.5px] font-semibold"
              style={{ background: preset.id === p.id ? "var(--primary-bright)" : "var(--surface-2)", color: preset.id === p.id ? "#0e0e0e" : "var(--text-muted)", border: "1px solid var(--border)" }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button type="button" onClick={record} disabled={recording} className="qx-btn-hero disabled:opacity-60">
          {recording ? <><FiZap size={15} /> Recording… {progress}%</> : <><FiFilm size={15} /> Record film ({DUR}s)</>}
        </button>
        <button type="button" onClick={savePng} className="qx-btn-ghost !py-3 text-sm">
          <FiImage size={14} /> Poster frame (PNG)
        </button>
      </div>
      {err && <p className="text-[12.5px] text-center" style={{ color: "var(--danger)" }}>{err}</p>}
      <p className="text-[11.5px] leading-relaxed text-center max-w-md mx-auto" style={{ color: "var(--text-faint)" }}>
        <FiDownload size={11} className="inline -mt-0.5 mr-1" />
        Chrome/Edge save MP4, WebM otherwise. Rendered entirely on your device — pick a format and post it to your site, YouTube, Reels or ads.
      </p>
    </div>
  );
}
