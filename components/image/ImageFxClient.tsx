"use client";

/* Unified on-device image adjust/filter engine. One component, ~24 tools via
   preset keys. Canvas 2D filters + convolution. Live slider + before/after. */

import { useCallback, useEffect, useRef, useState } from "react";
import { AiDropzone, BeforeAfter, AiResultBar } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

type Preset =
  | "brightness" | "contrast" | "exposure" | "gamma" | "saturation" | "hue"
  | "vibrance" | "temperature" | "tint" | "grayscale" | "sepia" | "invert"
  | "posterize" | "pixelate" | "mosaic" | "blur" | "gaussian" | "sharpen"
  | "emboss" | "edge" | "denoise" | "glow" | "vignette" | "shadow";

const MAX = 2400;

// which preset uses which slider label + default (0..100 UI)
const CONTROL: Record<Preset, { label: string; def: number } | null> = {
  brightness: { label: "Brightness", def: 60 }, contrast: { label: "Contrast", def: 60 },
  exposure: { label: "Exposure", def: 55 }, gamma: { label: "Gamma", def: 50 },
  saturation: { label: "Saturation", def: 65 }, hue: { label: "Hue rotate", def: 30 },
  vibrance: { label: "Vibrance", def: 60 }, temperature: { label: "Warmth", def: 60 },
  tint: { label: "Tint", def: 50 }, grayscale: { label: "Amount", def: 100 },
  sepia: { label: "Amount", def: 80 }, invert: { label: "Amount", def: 100 },
  posterize: { label: "Levels", def: 40 }, pixelate: { label: "Block size", def: 30 },
  mosaic: { label: "Tile size", def: 45 }, blur: { label: "Radius", def: 40 },
  gaussian: { label: "Radius", def: 45 }, sharpen: { label: "Strength", def: 55 },
  emboss: { label: "Strength", def: 60 }, edge: { label: "Strength", def: 60 },
  denoise: { label: "Strength", def: 50 }, glow: { label: "Strength", def: 55 },
  vignette: { label: "Darkness", def: 55 }, shadow: { label: "Softness", def: 55 },
};

function scaled(img: HTMLImageElement): HTMLCanvasElement {
  const s = Math.min(1, MAX / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}
function withFilter(src: HTMLCanvasElement, f: string): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
  const ctx = c.getContext("2d")!; ctx.filter = f; ctx.drawImage(src, 0, 0); return c;
}
function perPixel(src: HTMLCanvasElement, fn: (r: number, g: number, b: number, i: number, d: Uint8ClampedArray) => void): HTMLCanvasElement {
  const c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
  const ctx = c.getContext("2d")!; ctx.drawImage(src, 0, 0);
  const im = ctx.getImageData(0, 0, c.width, c.height); const d = im.data;
  for (let i = 0; i < d.length; i += 4) fn(d[i], d[i + 1], d[i + 2], i, d);
  ctx.putImageData(im, 0, 0); return c;
}
function convolve(src: HTMLCanvasElement, k: number[], divisor = 1, bias = 0): HTMLCanvasElement {
  const w = src.width, h = src.height;
  const sctx = src.getContext("2d")!; const s = sctx.getImageData(0, 0, w, h).data;
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const octx = c.getContext("2d")!; const out = octx.createImageData(w, h); const o = out.data;
  const side = Math.sqrt(k.length), half = side >> 1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let r = 0, g = 0, b = 0;
    for (let cy = 0; cy < side; cy++) for (let cx = 0; cx < side; cx++) {
      const px = Math.min(w - 1, Math.max(0, x + cx - half));
      const py = Math.min(h - 1, Math.max(0, y + cy - half));
      const idx = (py * w + px) * 4, wt = k[cy * side + cx];
      r += s[idx] * wt; g += s[idx + 1] * wt; b += s[idx + 2] * wt;
    }
    const oi = (y * w + x) * 4;
    o[oi] = r / divisor + bias; o[oi + 1] = g / divisor + bias; o[oi + 2] = b / divisor + bias; o[oi + 3] = 255;
  }
  octx.putImageData(out, 0, 0); return c;
}
const clamp = (n: number) => Math.max(0, Math.min(255, n));

function run(preset: Preset, base: HTMLCanvasElement, v: number): HTMLCanvasElement {
  const s = v / 100; // 0..1
  switch (preset) {
    case "brightness": return withFilter(base, `brightness(${0.4 + s * 1.6})`);
    case "contrast": return withFilter(base, `contrast(${0.4 + s * 1.6})`);
    case "exposure": return withFilter(base, `brightness(${0.5 + s}) contrast(${0.9 + s * 0.4})`);
    case "gamma": { const g = 0.4 + (1 - s) * 1.6; return perPixel(base, (r, gg, b, i, d) => { d[i] = clamp(255 * Math.pow(r / 255, g)); d[i + 1] = clamp(255 * Math.pow(gg / 255, g)); d[i + 2] = clamp(255 * Math.pow(b / 255, g)); }); }
    case "saturation": return withFilter(base, `saturate(${s * 2})`);
    case "hue": return withFilter(base, `hue-rotate(${Math.round(s * 360)}deg)`);
    case "vibrance": return perPixel(base, (r, g, b, i, d) => { const mx = Math.max(r, g, b), avg = (r + g + b) / 3, amt = ((mx - avg) / 255) * s * 1.6; d[i] = clamp(r + (r - avg) * amt); d[i + 1] = clamp(g + (g - avg) * amt); d[i + 2] = clamp(b + (b - avg) * amt); });
    case "temperature": { const t = (s - 0.5) * 90; return perPixel(base, (r, g, b, i, d) => { d[i] = clamp(r + t); d[i + 2] = clamp(b - t); }); }
    case "tint": { const t = (s - 0.5) * 90; return perPixel(base, (r, g, b, i, d) => { d[i] = clamp(r + t); d[i + 1] = clamp(g - t); d[i + 2] = clamp(b + t); }); }
    case "grayscale": return withFilter(base, `grayscale(${s})`);
    case "sepia": return withFilter(base, `sepia(${s})`);
    case "invert": return withFilter(base, `invert(${s})`);
    case "posterize": { const levels = Math.max(2, Math.round(2 + (1 - s) * 14)); const step = 255 / (levels - 1); return perPixel(base, (r, g, b, i, d) => { d[i] = Math.round(r / step) * step; d[i + 1] = Math.round(g / step) * step; d[i + 2] = Math.round(b / step) * step; }); }
    case "pixelate": case "mosaic": { const px = Math.max(2, Math.round(2 + s * (preset === "mosaic" ? 60 : 40))); const w = base.width, h = base.height; const c = document.createElement("canvas"); c.width = w; c.height = h; const ctx = c.getContext("2d")!; ctx.imageSmoothingEnabled = false; const sw = Math.max(1, Math.round(w / px)), sh = Math.max(1, Math.round(h / px)); ctx.drawImage(base, 0, 0, sw, sh); ctx.drawImage(c, 0, 0, sw, sh, 0, 0, w, h); return c; }
    case "blur": return withFilter(base, `blur(${Math.round(s * 20)}px)`);
    case "gaussian": return withFilter(base, `blur(${(s * 18).toFixed(1)}px)`);
    case "sharpen": { const a = 0.2 + s * 1.6; return convolve(base, [0, -a, 0, -a, 1 + 4 * a, -a, 0, -a, 0]); }
    case "emboss": return convolve(base, [-2, -1, 0, -1, 1, 1, 0, 1, 2], 1, 128 * s);
    case "edge": { const g = convolve(withFilter(base, "grayscale(1)"), [-1, -1, -1, -1, 8, -1, -1, -1, -1]); return withFilter(g, `contrast(${1 + s})`); }
    case "denoise": { const blurred = withFilter(base, `blur(${(1 + s * 2).toFixed(1)}px)`); const bd = blurred.getContext("2d")!.getImageData(0, 0, base.width, base.height).data; return perPixel(base, (r, g, b, i, d) => { const diff = Math.abs(r - bd[i]) + Math.abs(g - bd[i + 1]) + Math.abs(b - bd[i + 2]); const k = diff < 60 ? s * 0.8 : Math.max(0, s * 0.8 - diff / 255); d[i] = r * (1 - k) + bd[i] * k; d[i + 1] = g * (1 - k) + bd[i + 1] * k; d[i + 2] = b * (1 - k) + bd[i + 2] * k; }); }
    case "glow": { const c = document.createElement("canvas"); c.width = base.width; c.height = base.height; const ctx = c.getContext("2d")!; ctx.drawImage(base, 0, 0); const bloom = withFilter(base, `blur(${8 + s * 20}px) brightness(1.2)`); ctx.globalCompositeOperation = "screen"; ctx.globalAlpha = 0.4 + s * 0.5; ctx.drawImage(bloom, 0, 0); return c; }
    case "vignette": { const c = document.createElement("canvas"); c.width = base.width; c.height = base.height; const ctx = c.getContext("2d")!; ctx.drawImage(base, 0, 0); const g = ctx.createRadialGradient(c.width / 2, c.height / 2, Math.min(c.width, c.height) * (0.5 - s * 0.25), c.width / 2, c.height / 2, Math.max(c.width, c.height) * 0.75); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${0.3 + s * 0.5})`); ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height); return c; }
    case "shadow": { const pad = Math.round(Math.max(base.width, base.height) * 0.12); const c = document.createElement("canvas"); c.width = base.width + pad * 2; c.height = base.height + pad * 2; const ctx = c.getContext("2d")!; ctx.shadowColor = `rgba(0,0,0,${0.35 + s * 0.35})`; ctx.shadowBlur = pad * (0.4 + s); ctx.shadowOffsetY = pad * 0.3; ctx.drawImage(base, pad, pad); return c; }
  }
}

export default function ImageFxClient({ preset }: { preset: Preset }) {
  const ctrl = CONTROL[preset];
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [val, setVal] = useState(ctrl?.def ?? 60);
  const [busy, setBusy] = useState(false);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const deb = useRef<ReturnType<typeof setTimeout> | null>(null);

  const process = useCallback((base: HTMLCanvasElement, v: number) => {
    setBusy(true);
    setTimeout(() => {
      try {
        const out = run(preset, base, v);
        out.toBlob((b) => {
          if (b) { setBlob(b); setAfterUrl((o) => { if (o) URL.revokeObjectURL(o); return URL.createObjectURL(b); }); }
          setBusy(false);
        }, "image/png");
      } catch { setBusy(false); }
    }, 30);
  }, [preset]);

  async function onFile(f: File) {
    trackTool(`img-${preset}`, { size: f.size });
    const img = new Image(); const url = URL.createObjectURL(f);
    await new Promise((r, j) => { img.onload = r; img.onerror = j; img.src = url; });
    const base = scaled(img); baseRef.current = base;
    setBeforeUrl((o) => { if (o) URL.revokeObjectURL(o); return url; });
    process(base, val);
  }

  useEffect(() => {
    if (!baseRef.current) return;
    if (deb.current) clearTimeout(deb.current);
    deb.current = setTimeout(() => process(baseRef.current!, val), 160);
    return () => { if (deb.current) clearTimeout(deb.current); };
  }, [val, process]);

  function reset() { setBeforeUrl(null); setAfterUrl(null); setBlob(null); baseRef.current = null; }

  return (
    <div className="qx-card p-6 space-y-5">
      {!beforeUrl && <AiDropzone onFile={onFile} />}
      {beforeUrl && (
        <>
          {ctrl && (
            <label className="flex items-center gap-3">
              <span className="text-[12px] font-bold uppercase tracking-wider w-24" style={{ color: "var(--text-faint)" }}>{ctrl.label}</span>
              <input type="range" min={0} max={100} value={val} onChange={(e) => setVal(Number(e.target.value))} className="flex-1 max-w-xs accent-[#e1ff04]" aria-label={ctrl.label} />
              <span className="text-[12px] font-mono w-8" style={{ color: "var(--text-muted)" }}>{val}</span>
            </label>
          )}
          {afterUrl && (
            <div className="relative">
              {busy && <div className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(8,8,14,.3)" }}><span className="text-[12px] font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>Updating…</span></div>}
              <BeforeAfter before={beforeUrl} after={afterUrl} />
            </div>
          )}
          <AiResultBar blob={blob} filename={`qrix-${preset}.png`} onReset={reset} />
        </>
      )}
    </div>
  );
}
