"use client";

/* Animated QR Studio (Mission 57) — turn any link into a short animated
   video for Stories/Reels: the QR materializes tile by tile, a shine
   sweeps across, the CTA pops. Rendered on canvas, recorded with
   MediaRecorder (mp4 where the browser can, webm otherwise) — everything
   on-device, nothing uploaded. */

import { useEffect, useRef, useState } from "react";
import { FiDownload, FiFilm, FiImage, FiZap } from "react-icons/fi";
import { saveBlob } from "@/lib/save-file";
import { trackTool } from "@/lib/track";

type Preset = { id: string; label: string; w: number; h: number };
type Theme = {
  id: string; label: string;
  bgA: string; bgB: string; glow: string;
  card: string; qrDark: string; text: string; sub: string;
};

const PRESETS: Preset[] = [
  { id: "story", label: "Story 9:16", w: 1080, h: 1920 },
  { id: "square", label: "Post 1:1", w: 1080, h: 1080 },
];

const THEMES: Theme[] = [
  { id: "qrix", label: "QRix Orange", bgA: "#1a0a04", bgB: "#3a1408", glow: "#ff6a13", card: "#ffffff", qrDark: "#0e0e0e", text: "#ffffff", sub: "#ffb27a" },
  { id: "midnight", label: "Midnight", bgA: "#05060d", bgB: "#101a33", glow: "#5b8cff", card: "#ffffff", qrDark: "#0b1020", text: "#ffffff", sub: "#9db8ff" },
  { id: "clean", label: "Clean White", bgA: "#f4f1ec", bgB: "#ffffff", glow: "#ff6a13", card: "#ffffff", qrDark: "#111111", text: "#111111", sub: "#c2410c" },
];

const DUR = 6; // seconds per loop
const FPS = 30;

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

export default function AnimatedQrClient() {
  const [data, setData] = useState("https://qrix.uz");
  const [preset, setPreset] = useState(PRESETS[0]);
  const [theme, setTheme] = useState(THEMES[0]);
  const [cta, setCta] = useState("SCAN ME");
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrImgRef = useRef<HTMLCanvasElement | null>(null);
  const startRef = useRef<number>(0);
  const rafRef = useRef(0);
  const recRef = useRef<{ rec: MediaRecorder; chunks: Blob[] } | null>(null);

  /* build the QR bitmap whenever inputs change */
  useEffect(() => {
    let dead = false;
    const id = setTimeout(async () => {
      try {
        const mod = await import("qr-code-styling");
        const QRCodeStyling = mod.default;
        const qr = new QRCodeStyling({
          width: 720, height: 720, type: "canvas",
          data: data.trim() || "https://qrix.uz",
          margin: 0,
          qrOptions: { errorCorrectionLevel: "H" },
          dotsOptions: { type: "rounded", color: theme.qrDark },
          cornersSquareOptions: { type: "extra-rounded", color: theme.qrDark },
          cornersDotOptions: { type: "dot", color: theme.qrDark },
          backgroundOptions: { color: theme.card },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blob = (await (qr as any).getRawData("png")) as Blob | null;
        if (!blob || dead) return;
        const bmp = await createImageBitmap(blob);
        const c = document.createElement("canvas");
        c.width = bmp.width; c.height = bmp.height;
        c.getContext("2d")!.drawImage(bmp, 0, 0);
        qrImgRef.current = c;
      } catch {
        /* qr build failed — keep previous */
      }
    }, 250);
    return () => { dead = true; clearTimeout(id); };
  }, [data, theme]);

  /* one frame of the film at time t (0..1) */
  const drawFrame = (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
    const th = theme;
    // backdrop
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, th.bgB); g.addColorStop(1, th.bgA);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    // ambient glow behind the card
    const glowR = Math.min(W, H) * (0.5 + 0.06 * Math.sin(t * Math.PI * 4));
    const rg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, glowR);
    rg.addColorStop(0, th.glow + "3d"); rg.addColorStop(1, "transparent");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
    // drifting sparks
    for (let i = 0; i < 16; i++) {
      const sx = ((i * 379) % 997) / 997;
      const sp = 0.35 + ((i * 131) % 7) / 10;
      const sy = 1.15 - (((t * sp + i * 0.13) % 1) * 1.3);
      ctx.globalAlpha = 0.35 * (1 - Math.abs(0.5 - sy) * 1.6);
      ctx.fillStyle = th.glow;
      const r = 2 + (i % 3) * 1.5;
      ctx.fillRect(sx * W, sy * H, r, r);
    }
    ctx.globalAlpha = 1;

    // QR card geometry
    const qrSize = Math.min(W, H) * 0.62;
    const pad = qrSize * 0.075;
    const cardS = qrSize + pad * 2;
    const cx = W / 2, cy = H * (H > W ? 0.44 : 0.47);
    const x0 = cx - cardS / 2, y0 = cy - cardS / 2;

    // card pops in
    const popT = easeOut((t - 0.06) / 0.14);
    if (popT > 0) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(0.85 + 0.15 * popT, 0.85 + 0.15 * popT);
      ctx.translate(-cx, -cy);
      ctx.globalAlpha = popT;
      ctx.shadowColor = th.glow; ctx.shadowBlur = 60 * popT;
      const rr = cardS * 0.055;
      ctx.fillStyle = th.card;
      ctx.beginPath();
      ctx.roundRect(x0, y0, cardS, cardS, rr);
      ctx.fill();
      ctx.shadowBlur = 0;

      // tile-cascade reveal of the QR bitmap
      const img = qrImgRef.current;
      if (img) {
        const TILES = 11;
        const ts = qrSize / TILES;
        for (let r = 0; r < TILES; r++) {
          for (let c = 0; c < TILES; c++) {
            const delay = 0.16 + ((r + c) / (TILES * 2 - 2)) * 0.34;
            const k = easeOut((t - delay) / 0.16);
            if (k <= 0) continue;
            const sx = (img.width / TILES) * c, sy = (img.height / TILES) * r;
            const dx = x0 + pad + c * ts, dy = y0 + pad + r * ts;
            ctx.globalAlpha = popT * k;
            const sc = 0.5 + 0.5 * k;
            const off = (ts * (1 - sc)) / 2;
            ctx.drawImage(img, sx, sy, img.width / TILES, img.height / TILES,
              dx + off, dy + off, ts * sc, ts * sc);
          }
        }
        ctx.globalAlpha = popT;
        // shine sweep
        const sh = (t - 0.58) / 0.16;
        if (sh > 0 && sh < 1) {
          ctx.save();
          ctx.beginPath();
          ctx.roundRect(x0, y0, cardS, cardS, rr);
          ctx.clip();
          const bx = x0 - cardS + sh * cardS * 2.4;
          const sg = ctx.createLinearGradient(bx, y0, bx + cardS * 0.5, y0 + cardS);
          sg.addColorStop(0, "rgba(255,255,255,0)");
          sg.addColorStop(0.5, "rgba(255,255,255,0.55)");
          sg.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = sg;
          ctx.fillRect(x0, y0, cardS, cardS);
          ctx.restore();
        }
      }
      ctx.restore();
    }

    // CTA
    const ctaT = easeOut((t - 0.7) / 0.14);
    if (ctaT > 0) {
      ctx.save();
      ctx.globalAlpha = ctaT;
      ctx.textAlign = "center";
      const fs = Math.min(W, H) * 0.085;
      ctx.font = `800 ${fs}px Unbounded, Arial, sans-serif`;
      ctx.translate(cx, y0 + cardS + fs * (H > W ? 1.5 : 1.25));
      ctx.scale(0.9 + 0.1 * ctaT, 0.9 + 0.1 * ctaT);
      ctx.fillStyle = th.text;
      ctx.shadowColor = th.glow; ctx.shadowBlur = 34;
      ctx.fillText(cta.toUpperCase().slice(0, 18) || "SCAN ME", 0, 0);
      ctx.shadowBlur = 0;
      ctx.font = `500 ${fs * 0.34}px "Space Mono", monospace`;
      ctx.fillStyle = th.sub;
      ctx.fillText(data.trim().replace(/^https?:\/\//, "").slice(0, 42), 0, fs * 0.75);
      ctx.restore();
    }
  };

  /* live preview loop */
  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    cv.width = preset.w; cv.height = preset.h;
    const ctx = cv.getContext("2d")!;
    startRef.current = performance.now();
    const loop = (now: number) => {
      const t = ((now - startRef.current) / 1000 / DUR) % 1;
      drawFrame(ctx, t, preset.w, preset.h);
      if (recording) setProgress(Math.min(100, Math.round(((now - startRef.current) / 1000 / DUR) * 100)));
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preset, theme, cta, data, recording]);

  const record = async () => {
    const cv = canvasRef.current;
    if (!cv || recording) return;
    setErr(null);
    const mime = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"]
      .find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
    if (!mime) { setErr("Video recording is not supported in this browser."); return; }
    const stream = cv.captureStream(FPS);
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 8_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    recRef.current = { rec, chunks };
    setRecording(true);
    startRef.current = performance.now(); // restart the loop so we capture one clean cycle
    rec.start(250);
    trackTool("animated-qr");
    window.setTimeout(() => {
      rec.stop();
      rec.onstop = async () => {
        setRecording(false);
        setProgress(0);
        const ext = mime.startsWith("video/mp4") ? "mp4" : "webm";
        const blob = new Blob(chunks, { type: mime.split(";")[0] });
        await saveBlob(blob, `qrix-animated-qr.${ext}`);
      };
    }, DUR * 1000 + 120);
  };

  const savePng = async () => {
    const cv = document.createElement("canvas");
    cv.width = preset.w; cv.height = preset.h;
    drawFrame(cv.getContext("2d")!, 0.99, preset.w, preset.h);
    cv.toBlob(async (b) => { if (b) await saveBlob(b, "qrix-animated-qr.png"); }, "image/png");
  };

  return (
    <div className="grid lg:grid-cols-[minmax(0,420px)_1fr] gap-8 items-start">
      {/* controls */}
      <div className="space-y-5">
        <label className="block">
          <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Link or text</span>
          <input value={data} onChange={(e) => setData(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="w-full px-4 py-3 rounded-xl text-[14px]"
            style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)" }} />
        </label>

        <label className="block">
          <span className="block text-[12px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>CTA text</span>
          <input value={cta} onChange={(e) => setCta(e.target.value)} maxLength={18}
            className="w-full px-4 py-3 rounded-xl text-[14px]"
            style={{ background: "var(--surface-2)", border: "1.5px solid var(--border)", color: "var(--text)" }} />
        </label>

        <div>
          <span className="block text-[12px] font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Format</span>
          <div className="flex gap-2">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPreset(p)}
                className="px-4 py-2 rounded-full text-[12.5px] font-semibold"
                style={{
                  background: preset.id === p.id ? "var(--primary-bright)" : "var(--surface-2)",
                  color: preset.id === p.id ? "#0e0e0e" : "var(--text-muted)",
                  border: "1px solid var(--border)",
                }}>{p.label}</button>
            ))}
          </div>
        </div>

        <div>
          <span className="block text-[12px] font-semibold mb-2" style={{ color: "var(--text-muted)" }}>Theme</span>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((th) => (
              <button key={th.id} type="button" onClick={() => setTheme(th)}
                className="px-4 py-2 rounded-full text-[12.5px] font-semibold inline-flex items-center gap-2"
                style={{
                  background: theme.id === th.id ? "var(--primary-dim)" : "var(--surface-2)",
                  color: theme.id === th.id ? "var(--primary-bright)" : "var(--text-muted)",
                  border: `1px solid ${theme.id === th.id ? "var(--border-hover)" : "var(--border)"}`,
                }}>
                <i style={{ width: 10, height: 10, borderRadius: 99, background: th.glow, display: "inline-block" }} />
                {th.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 space-y-2.5">
          <button type="button" onClick={record} disabled={recording}
            className="qx-btn-hero w-full disabled:opacity-60">
            {recording
              ? <><FiZap size={15} /> Recording… {progress}%</>
              : <><FiFilm size={15} /> Record video ({DUR}s)</>}
          </button>
          <button type="button" onClick={savePng} className="qx-btn-ghost w-full !py-3 text-sm">
            <FiImage size={14} /> Download final frame (PNG)
          </button>
          {err && <p className="text-[12.5px]" style={{ color: "var(--danger)" }}>{err}</p>}
          <p className="text-[11.5px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
            <FiDownload size={11} className="inline -mt-0.5 mr-1" />
            Chrome/Edge save MP4 when supported, WebM otherwise — both upload fine to
            Stories, Reels and Shorts. Rendering happens on your device.
          </p>
        </div>
      </div>

      {/* live preview */}
      <div className="flex justify-center">
        <canvas ref={canvasRef}
          style={{
            width: "100%",
            maxWidth: preset.w >= preset.h ? 560 : 340,
            aspectRatio: `${preset.w} / ${preset.h}`,
            borderRadius: 18,
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow-card)",
          }} />
      </div>
    </div>
  );
}
