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
/* premium ease-out-expo — the Linear/Vercel curve */
const expo = (t: number) => (clamp01(t) >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp01(t)));
/* slight overshoot for hero elements (≈6%) */
const backOut = (t: number) => { const c = 1.70158, x = clamp01(t) - 1; return 1 + (c + 1) * x * x * x + c * x * x; };
const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/* cheap seeded pseudo-random for stable grain */
const prand = (s: number) => { const x = Math.sin(s * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function fadeInOut(t: number, a: number, b: number, fin = 0.14, fout = 0.14) {
  const p = seg(t, a, b);
  return Math.min(clamp01(p / fin), clamp01((1 - p) / fout));
}

/* Procedural minimal-tech bed (120 BPM): pad + four-on-floor kick with
   sidechain + offbeat hats + final boom. Mixed straight into the recording
   stream — the exported video ships with a soundtrack, all on-device. */
function buildMusic(ac: AudioContext, dest: AudioNode, seconds: number) {
  const t0 = ac.currentTime + 0.05;
  const beat = 0.5;
  const master = ac.createGain(); master.gain.value = 0.9; master.connect(dest);
  // pad: detuned saws → lowpass → sidechained gain
  const padGain = ac.createGain(); padGain.gain.value = 0.045;
  const lp = ac.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 850;
  padGain.connect(lp); lp.connect(master);
  [220, 261.63, 329.63].forEach((f, i) => {
    const o = ac.createOscillator(); o.type = "sawtooth";
    o.frequency.value = f; o.detune.value = i * 4 - 4;
    o.connect(padGain); o.start(t0); o.stop(t0 + seconds);
  });
  lp.frequency.setValueAtTime(850, t0 + seconds - 2);
  lp.frequency.linearRampToValueAtTime(300, t0 + seconds);        // outro filter-down
  padGain.gain.setValueAtTime(0.045, t0 + seconds - 1.2);
  padGain.gain.linearRampToValueAtTime(0.0001, t0 + seconds);
  // kick (from bar 2) + sidechain duck
  for (let bt = beat * 4; bt < seconds - 1.6; bt += beat) {
    const o = ac.createOscillator(); const g = ac.createGain();
    o.frequency.setValueAtTime(140, t0 + bt);
    o.frequency.exponentialRampToValueAtTime(46, t0 + bt + 0.1);
    g.gain.setValueAtTime(0.85, t0 + bt);
    g.gain.exponentialRampToValueAtTime(0.001, t0 + bt + 0.24);
    o.connect(g); g.connect(master); o.start(t0 + bt); o.stop(t0 + bt + 0.26);
    padGain.gain.cancelScheduledValues(t0 + bt);
    padGain.gain.setValueAtTime(0.02, t0 + bt);
    padGain.gain.linearRampToValueAtTime(0.045, t0 + bt + 0.24);
  }
  // offbeat hats
  const nb = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.05), ac.sampleRate);
  const nd = nb.getChannelData(0);
  for (let i = 0; i < nd.length; i++) nd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nd.length, 2.2);
  for (let bt = beat * 4.5; bt < seconds - 1.6; bt += beat) {
    const s = ac.createBufferSource(); s.buffer = nb;
    const hp = ac.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 6500;
    const g = ac.createGain(); g.gain.value = 0.2;
    s.connect(hp); hp.connect(g); g.connect(master); s.start(t0 + bt);
  }
  // final boom under the CTA
  const bo = ac.createOscillator(); const bg = ac.createGain();
  const bAt = t0 + Math.max(1, seconds - 1.4);
  bo.frequency.setValueAtTime(75, bAt);
  bo.frequency.exponentialRampToValueAtTime(40, bAt + 0.7);
  bg.gain.setValueAtTime(0.9, bAt);
  bg.gain.exponentialRampToValueAtTime(0.001, bAt + 1.2);
  bo.connect(bg); bg.connect(master); bo.start(bAt); bo.stop(bAt + 1.3);
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
  const [music, setMusic] = useState(true);
  const [recording, setRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [err, setErr] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef = useRef<HTMLCanvasElement | null>(null);
  const [hasLogo, setHasLogo] = useState(false);
  // background photo (whole clip) + one timed overlay image (appears where/when)
  const bgRef = useRef<HTMLCanvasElement | null>(null);
  const [hasBg, setHasBg] = useState(false);
  const ovRef = useRef<HTMLCanvasElement | null>(null);
  const [hasOv, setHasOv] = useState(false);
  const [ovPos, setOvPos] = useState({ x: 0.5, y: 0.28 });   // center fraction
  const [ovScale, setOvScale] = useState(0.4);               // width as fraction of canvas
  const [ovStart, setOvStart] = useState(0.3);               // appears at % of the video
  const [ovEnd, setOvEnd] = useState(0.75);                  // disappears at %
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

  const readToCanvas = async (file: File) => {
    const bmp = await createImageBitmap(file);
    const c = document.createElement("canvas");
    c.width = bmp.width; c.height = bmp.height;
    c.getContext("2d")!.drawImage(bmp, 0, 0);
    return c;
  };
  const onBg = async (file?: File) => { if (!file) return; try { bgRef.current = await readToCanvas(file); setHasBg(true); } catch { setErr("Couldn't read that image."); } };
  const onOverlay = async (file?: File) => { if (!file) return; try { ovRef.current = await readToCanvas(file); setHasOv(true); } catch { setErr("Couldn't read that image."); } };

  /* one frame of the promo at time t (0..1) */
  const drawFrame = (ctx: CanvasRenderingContext2D, t: number, W: number, H: number) => {
    const th = theme;
    const M = Math.min(W, H);
    const light = th.id === "clean";

    // animated backdrop
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, th.bgB); g.addColorStop(1, th.bgA);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // background photo: cover-fit with a slow Ken-Burns zoom + dark scrim so text stays legible
    const bg = bgRef.current;
    if (bg) {
      const z = 1.06 + 0.06 * t;
      const s = Math.max(W / bg.width, H / bg.height) * z;
      const bw = bg.width * s, bh = bg.height * s;
      ctx.drawImage(bg, (W - bw) / 2, (H - bh) / 2, bw, bh);
      ctx.fillStyle = light ? "rgba(255,255,255,0.42)" : "rgba(8,8,10,0.52)";
      ctx.fillRect(0, 0, W, H);
    }
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

    // ── Scene 1 · intro (logo + brand, hero overshoot) ──────────
    const a1 = fadeInOut(t, 0.0, 0.2, 0.2, 0.22);
    if (a1 > 0) {
      const p = backOut(seg(t, 0.0, 0.16));
      ctx.save();
      ctx.globalAlpha = a1;
      const logo = logoRef.current;
      let by = H * 0.5;
      if (logo) {
        const ls = M * 0.26 * (0.7 + 0.3 * p);
        const lw = (logo.width / logo.height) * ls;
        ctx.shadowColor = th.glow; ctx.shadowBlur = 60 * p;
        ctx.drawImage(logo, W / 2 - lw / 2, H * 0.4 - ls / 2, lw, ls);
        ctx.shadowBlur = 0;
        by = H * 0.4 + ls / 2 + M * 0.09;
      }
      // masked-line brand reveal
      const bs = M * 0.075, bh = bs * 1.3;
      const lp = expo(seg(t, 0.04, 0.16));
      ctx.beginPath(); ctx.rect(0, by - bh, W, bh * 1.2); ctx.clip();
      ctx.font = `800 ${bs}px Unbounded, Arial, sans-serif`;
      ctx.fillStyle = th.text;
      ctx.fillText(brand.trim().slice(0, 22) || "Your Brand", W / 2, by + (1 - lp) * bh);
      ctx.restore();
    }

    // ── Scene 2 · headline (masked-line kinetic) + subline ──────
    const a2 = fadeInOut(t, 0.2, 0.52, 0.12, 0.16);
    if (a2 > 0) {
      const p = seg(t, 0.2, 0.52);
      ctx.save();
      ctx.globalAlpha = a2;
      ctx.font = `800 ${M * 0.088}px Unbounded, Arial, sans-serif`;
      const lines = wrapLines(ctx, headline.trim() || "Big things, made simple.", W * 0.82);
      const lh = M * 0.105;
      const startY = H * 0.42 - ((lines.length - 1) * lh) / 2;
      lines.forEach((ln, i) => {
        const lp = expo(clamp01((p - i * 0.05) / 0.3));            // 3f-style stagger
        const y = startY + i * lh;
        ctx.save();
        ctx.beginPath(); ctx.rect(0, y - lh * 0.92, W, lh * 1.12); ctx.clip();
        ctx.fillStyle = i === lines.length - 1 ? th.accent : th.text; // last line in accent
        ctx.fillText(ln, W / 2, y + (1 - lp) * lh);
        ctx.restore();
      });
      // accent underline sweeps in
      const up = expo(clamp01((p - 0.18) / 0.28));
      ctx.fillStyle = th.accent;
      const uw = M * 0.16 * up;
      ctx.fillRect(W / 2 - uw / 2, startY + lines.length * lh - lh * 0.15, uw, M * 0.012);
      // subline — blur-in block
      const sp = expo(clamp01((p - 0.3) / 0.35));
      ctx.globalAlpha = a2 * sp;
      ctx.font = `500 ${M * 0.036}px "Space Mono", monospace`;
      ctx.fillStyle = th.sub;
      const subLines = wrapLines(ctx, subline.trim(), W * 0.74);
      subLines.slice(0, 2).forEach((ln, i) => {
        ctx.fillText(ln, W / 2, startY + lines.length * lh + M * 0.06 + i * M * 0.052 + (1 - sp) * M * 0.02);
      });
      ctx.restore();
    }

    // ── Scene 3 · feature bullets (masked stagger + glow ticks) ─
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
        const rp = expo(clamp01((p - i * 0.1) / 0.32));
        if (rp <= 0) { y += rowH; return; }
        ctx.save();
        ctx.globalAlpha = a3;
        ctx.beginPath(); ctx.rect(0, y - rowH * 0.7, W, rowH); ctx.clip(); // row mask
        const dx = x;
        const ty = y + (1 - rp) * rowH * 0.8;                      // rises out of its mask
        ctx.shadowColor = th.glow; ctx.shadowBlur = 26 * rp;
        ctx.fillStyle = th.accent;
        ctx.beginPath(); ctx.arc(dx, ty - M * 0.014, M * 0.028, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = th.onAccent; ctx.lineWidth = M * 0.008;
        ctx.beginPath();
        ctx.moveTo(dx - M * 0.012, ty - M * 0.014);
        ctx.lineTo(dx - M * 0.003, ty - M * 0.005);
        ctx.lineTo(dx + M * 0.014, ty - M * 0.026);
        ctx.stroke();
        ctx.fillStyle = th.text;
        ctx.fillText(f.slice(0, 32), dx + M * 0.055, ty);
        ctx.restore();
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
      // QR card — overshoot entrance + top-down wipe reveal + glow pulse
      if (qr) {
        const pop = backOut(seg(t, 0.78, 0.9));
        const qs = M * 0.34 * (0.7 + 0.3 * pop);
        const pad = qs * 0.08;
        const cs = qs + pad * 2;
        const cx = W / 2, cy = centerY;
        const pulse = 0.5 + 0.5 * Math.sin(t * 40);
        ctx.save();
        ctx.shadowColor = th.glow; ctx.shadowBlur = (40 + 26 * pulse) * p;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.roundRect(cx - cs / 2, cy - cs / 2, cs, cs, cs * 0.08);
        ctx.fill();
        ctx.shadowBlur = 0;
        const wipe = expo(seg(t, 0.8, 0.94));                     // QR paints in top→down
        ctx.beginPath(); ctx.rect(cx - qs / 2, cy - qs / 2, qs, qs * wipe); ctx.clip();
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

    // ── timed overlay image: appears only within [ovStart, ovEnd] ──
    const ov = ovRef.current;
    if (ov && ovEnd > ovStart) {
      const oa = fadeInOut(t, ovStart, ovEnd, 0.12, 0.12);
      if (oa > 0) {
        const ow = W * ovScale;
        const oh = ow * (ov.height / ov.width);
        const ox = W * ovPos.x - ow / 2;
        const oy = H * ovPos.y - oh / 2;
        const pop = easeOut(seg(t, ovStart, ovStart + 0.12));
        ctx.save();
        ctx.globalAlpha = oa;
        ctx.translate(W * ovPos.x, H * ovPos.y);
        ctx.scale(0.9 + 0.1 * pop, 0.9 + 0.1 * pop);
        ctx.translate(-W * ovPos.x, -H * ovPos.y);
        ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = M * 0.04; ctx.shadowOffsetY = M * 0.012;
        const r = Math.min(ow, oh) * 0.06;
        ctx.beginPath(); ctx.roundRect(ox, oy, ow, oh, r); ctx.closePath(); ctx.clip();
        ctx.drawImage(ov, ox, oy, ow, oh);
        ctx.restore();
      }
    }

    // ── film grade: light sweep → vignette → grain ──────────────
    // one diagonal specular sweep per scene (4 scenes)
    const sceneP = (t * 4) % 1;
    const sx0 = -W * 0.4 + (W * 1.8) * expo(seg(sceneP, 0.15, 0.75));
    const sg = ctx.createLinearGradient(sx0, 0, sx0 + W * 0.22, H * 0.35);
    sg.addColorStop(0, "rgba(255,255,255,0)");
    sg.addColorStop(0.5, light ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.07)");
    sg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, 0, W, H);
    // offset vignette (lower third stays readable)
    const vg = ctx.createRadialGradient(W / 2, H * 0.42, M * 0.35, W / 2, H * 0.42, M * 0.95);
    vg.addColorStop(0, "rgba(0,0,0,0)");
    vg.addColorStop(1, light ? "rgba(0,0,0,0.14)" : "rgba(0,0,0,0.42)");
    ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    // fine grain, reseeded every frame (static grain = dirty screen)
    const gseed = Math.floor(t * 1000);
    ctx.globalAlpha = light ? 0.025 : 0.045;
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 260; i++) {
      const rx = prand(gseed + i * 2.7) * W;
      const ry = prand(gseed * 1.3 + i * 5.1) * H;
      ctx.fillRect(rx, ry, 1.6, 1.6);
    }
    ctx.globalAlpha = 1;

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
  }, [preset, theme, dur, brand, headline, subline, features, cta, link, hasLogo, hasBg, hasOv, ovPos, ovScale, ovStart, ovEnd, recording]);

  const record = async () => {
    const cv = canvasRef.current;
    if (!cv || recording) return;
    setErr(null);
    const mime = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm"]
      .find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m));
    if (!mime) { setErr("Video recording is not supported in this browser."); return; }
    const stream = cv.captureStream(FPS);
    // procedural soundtrack mixed into the recording (nothing uploaded)
    let ac: AudioContext | null = null;
    if (music) {
      try {
        ac = new AudioContext();
        const dst = ac.createMediaStreamDestination();
        buildMusic(ac, dst, dur);
        const track = dst.stream.getAudioTracks()[0];
        if (track) stream.addTrack(track);
      } catch { ac = null; /* record silent video */ }
    }
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 9_000_000 });
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => { if (e.data.size) chunks.push(e.data); };
    setRecording(true);
    startRef.current = performance.now();
    rec.start(250);
    trackTool("promo-video", music ? { music: 1 } : undefined);
    window.setTimeout(() => {
      rec.stop();
      rec.onstop = async () => {
        setRecording(false);
        setProgress(0);
        try { await ac?.close(); } catch { /* ignore */ }
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

  const field = "qx-tool-in";
  const fieldStyle = {} as const;
  const lbl = "block text-[12px] font-semibold mb-1.5";

  return (
    <div className="grid lg:grid-cols-[minmax(0,440px)_1fr] gap-8 items-start">
      {/* controls */}
      <div className="qx-tool-card p-5 space-y-4">
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

        {/* background photo */}
        <div>
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Background photo (optional)</span>
          {hasBg ? (
            <div className="flex items-center gap-2">
              <span className="text-[12.5px] font-semibold" style={{ color: "var(--primary-bright)" }}>Background added</span>
              <button type="button" onClick={() => { bgRef.current = null; setHasBg(false); }} className="qx-btn-ghost !p-1.5" aria-label="Remove background"><FiX size={13} /></button>
            </div>
          ) : (
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-[12.5px] font-semibold w-fit"
              style={{ background: "var(--surface-2)", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
              <FiImage size={15} /> Upload background
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onBg(e.target.files?.[0])} />
            </label>
          )}
        </div>

        {/* timed overlay image — appears WHERE and WHEN you choose */}
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)" }}>
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[12px] font-bold uppercase tracking-[0.12em]" style={{ color: "var(--text)" }}>Overlay image</span>
            {hasOv && <button type="button" onClick={() => { ovRef.current = null; setHasOv(false); }} className="qx-btn-ghost !p-1.5" aria-label="Remove overlay"><FiX size={13} /></button>}
          </div>
          {!hasOv ? (
            <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl cursor-pointer text-[12.5px] font-semibold w-fit"
              style={{ background: "var(--surface-2)", border: "1px dashed var(--border)", color: "var(--text-muted)" }}>
              <FiUploadCloud size={15} /> Upload an image that appears during the video
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onOverlay(e.target.files?.[0])} />
            </label>
          ) : (
            <div className="space-y-3">
              {/* WHERE — 9-dot position grid */}
              <div>
                <span className="block text-[11.5px] font-semibold mb-1.5" style={{ color: "var(--text-muted)" }}>Where it appears</span>
                <div className="grid grid-cols-3 gap-1 p-1.5 rounded-xl w-fit" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
                  {[0.18, 0.5, 0.82].flatMap((y) => [0.2, 0.5, 0.8].map((x) => {
                    const on = Math.abs(ovPos.x - x) < 0.08 && Math.abs(ovPos.y - y) < 0.08;
                    return <button key={`${x}-${y}`} type="button" aria-label="Position" onClick={() => setOvPos({ x, y })}
                      className="w-6 h-6 rounded-md transition-colors" style={{ background: on ? "var(--primary-bright)" : "var(--surface-hover)", border: "1px solid var(--border)" }} />;
                  }))}
                </div>
              </div>
              {/* SIZE */}
              <label className="block">
                <span className="block text-[11.5px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Size — {Math.round(ovScale * 100)}%</span>
                <input type="range" min={15} max={80} value={Math.round(ovScale * 100)} onChange={(e) => setOvScale(+e.target.value / 100)} className="w-full accent-[#ff4d1c]" />
              </label>
              {/* WHEN — appear / disappear time */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="block text-[11.5px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Appears at — {Math.round(ovStart * dur * 10) / 10}s</span>
                  <input type="range" min={0} max={90} value={Math.round(ovStart * 100)} onChange={(e) => setOvStart(Math.min(+e.target.value / 100, ovEnd - 0.1))} className="w-full accent-[#ff4d1c]" />
                </label>
                <label className="block">
                  <span className="block text-[11.5px] font-semibold mb-1" style={{ color: "var(--text-muted)" }}>Disappears at — {Math.round(ovEnd * dur * 10) / 10}s</span>
                  <input type="range" min={10} max={100} value={Math.round(ovEnd * 100)} onChange={(e) => setOvEnd(Math.max(+e.target.value / 100, ovStart + 0.1))} className="w-full accent-[#ff4d1c]" />
                </label>
              </div>
            </div>
          )}
        </div>

        <div>
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Format</span>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" onClick={() => setPreset(p)}
                className={`qx-chip2 px-3.5 py-2 text-[12px] !rounded-full ${preset.id === p.id ? "on" : ""}`}>{p.label}</button>
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
                  title={th.label} aria-label={`Theme: ${th.label}`} aria-pressed={theme.id === th.id}
                  style={{ background: th.glow, outline: theme.id === th.id ? "2px solid var(--text)" : "1px solid var(--border)", outlineOffset: 2 }} />
              ))}
            </div>
          </div>
          <div>
            <span className={lbl} style={{ color: "var(--text-muted)" }}>Length</span>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button key={d} type="button" onClick={() => setDur(d)}
                  className={`qx-chip2 px-3 py-2 text-[12px] ${dur === d ? "on" : ""}`}>{d}s</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <span className={lbl} style={{ color: "var(--text-muted)" }}>Soundtrack</span>
          <div className="flex gap-2">
            {([true, false] as const).map((on) => (
              <button key={String(on)} type="button" onClick={() => setMusic(on)}
                className={`qx-chip2 px-3.5 py-2 text-[12px] ${music === on ? "on" : ""}`}>
                {on ? "🎵 Music on" : "Silent"}
              </button>
            ))}
          </div>
          <p className="text-[11px] mt-1.5" style={{ color: "var(--text-faint)" }}>A beat-matched electronic bed is composed on your device and baked into the video.</p>
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
          className="qx-tool-preview"
          style={{
            width: "100%",
            maxWidth: preset.w > preset.h ? 620 : preset.w === preset.h ? 460 : 360,
            aspectRatio: `${preset.w} / ${preset.h}`,
          }} />
      </div>
    </div>
  );
}
