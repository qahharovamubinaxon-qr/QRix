"use client";

/* Unified on-device AI image pipeline. One engine, many tools:
   enhance · portrait · sharpen · deblur · denoise · restore ·
   colorize(preview) · cartoon · sketch
   All processing = canvas 2D (filters + convolution + blends). */

import { useCallback, useEffect, useRef, useState } from "react";
import { AiDropzone, BeforeAfter, AiProcessing, AiResultBar, CloudNotice } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

type Preset = "enhance" | "portrait" | "sharpen" | "deblur" | "denoise" | "restore" | "colorize" | "cartoon" | "sketch";

const MAX_DIM = 2200;

/* ── low-level ops ────────────────────────────────────────── */
function drawScaled(img: HTMLImageElement): HTMLCanvasElement {
  const scale = Math.min(1, MAX_DIM / Math.max(img.width, img.height));
  const c = document.createElement("canvas");
  c.width = Math.round(img.width * scale);
  c.height = Math.round(img.height * scale);
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return c;
}

function withFilter(src: HTMLCanvasElement, filter: string): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = src.width; c.height = src.height;
  const ctx = c.getContext("2d")!;
  ctx.filter = filter;
  ctx.drawImage(src, 0, 0);
  return c;
}

/** Unsharp mask: sharpened = src + amount * (src - blurred). */
function unsharp(src: HTMLCanvasElement, radius: number, amount: number): HTMLCanvasElement {
  const blurred = withFilter(src, `blur(${radius}px)`);
  const w = src.width, h = src.height;
  const a = src.getContext("2d")!.getImageData(0, 0, w, h);
  const b = blurred.getContext("2d")!.getImageData(0, 0, w, h);
  const d = a.data, e = b.data;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.max(0, Math.min(255, d[i] + amount * (d[i] - e[i])));
    d[i + 1] = Math.max(0, Math.min(255, d[i + 1] + amount * (d[i + 1] - e[i + 1])));
    d[i + 2] = Math.max(0, Math.min(255, d[i + 2] + amount * (d[i + 2] - e[i + 2])));
  }
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  out.getContext("2d")!.putImageData(a, 0, 0);
  return out;
}

/** Edge-preserving denoise: blend a blurred copy back in flat areas only. */
function denoise(src: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const blurred = withFilter(src, `blur(${1 + strength * 2}px)`);
  const w = src.width, h = src.height;
  const a = src.getContext("2d")!.getImageData(0, 0, w, h);
  const b = blurred.getContext("2d")!.getImageData(0, 0, w, h);
  const d = a.data, e = b.data;
  for (let i = 0; i < d.length; i += 4) {
    const diff = Math.abs(d[i] - e[i]) + Math.abs(d[i + 1] - e[i + 1]) + Math.abs(d[i + 2] - e[i + 2]);
    // flat area (small diff) → take smoothed; edge (big diff) → keep original
    const k = diff < 60 ? strength : Math.max(0, strength - diff / 255);
    d[i] = d[i] * (1 - k) + e[i] * k;
    d[i + 1] = d[i + 1] * (1 - k) + e[i + 1] * k;
    d[i + 2] = d[i + 2] * (1 - k) + e[i + 2] * k;
  }
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  out.getContext("2d")!.putImageData(a, 0, 0);
  return out;
}

function posterize(src: HTMLCanvasElement, levels: number): HTMLCanvasElement {
  const w = src.width, h = src.height;
  const im = src.getContext("2d")!.getImageData(0, 0, w, h);
  const d = im.data, step = 255 / (levels - 1);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = Math.round(d[i] / step) * step;
    d[i + 1] = Math.round(d[i + 1] / step) * step;
    d[i + 2] = Math.round(d[i + 2] / step) * step;
  }
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  out.getContext("2d")!.putImageData(im, 0, 0);
  return out;
}

/** Sobel edge map drawn as dark ink lines (for cartoon). */
function edgeInk(src: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const gray = withFilter(src, "grayscale(1)");
  const w = src.width, h = src.height;
  const g = gray.getContext("2d")!.getImageData(0, 0, w, h).data;
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  const octx = out.getContext("2d")!;
  const im = octx.createImageData(w, h);
  const d = im.data;
  const lum = (x: number, y: number) => g[(Math.min(h - 1, Math.max(0, y)) * w + Math.min(w - 1, Math.max(0, x))) * 4];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const gx = -lum(x - 1, y - 1) - 2 * lum(x - 1, y) - lum(x - 1, y + 1) + lum(x + 1, y - 1) + 2 * lum(x + 1, y) + lum(x + 1, y + 1);
      const gy = -lum(x - 1, y - 1) - 2 * lum(x, y - 1) - lum(x + 1, y - 1) + lum(x - 1, y + 1) + 2 * lum(x, y + 1) + lum(x + 1, y + 1);
      const mag = Math.min(255, Math.hypot(gx, gy) * strength);
      const i = (y * w + x) * 4;
      d[i] = 0; d[i + 1] = 0; d[i + 2] = 0; d[i + 3] = mag > 70 ? 235 : 0;
    }
  }
  octx.putImageData(im, 0, 0);
  return out;
}

/** Pencil sketch via color-dodge of inverted blur. */
function sketch(src: HTMLCanvasElement, softness: number): HTMLCanvasElement {
  const gray = withFilter(src, "grayscale(1)");
  const invBlur = withFilter(gray, `invert(1) blur(${4 + softness * 14}px)`);
  const w = src.width, h = src.height;
  const a = gray.getContext("2d")!.getImageData(0, 0, w, h);
  const b = invBlur.getContext("2d")!.getImageData(0, 0, w, h);
  const d = a.data, e = b.data;
  for (let i = 0; i < d.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const base = d[i + c], blend = e[i + c];
      d[i + c] = blend === 255 ? 255 : Math.min(255, (base * 255) / (255 - blend));
    }
  }
  const out = document.createElement("canvas");
  out.width = w; out.height = h;
  out.getContext("2d")!.putImageData(a, 0, 0);
  return out;
}

function vignette(src: HTMLCanvasElement, strength: number): HTMLCanvasElement {
  const ctx = src.getContext("2d")!;
  const g = ctx.createRadialGradient(src.width / 2, src.height / 2, Math.min(src.width, src.height) * 0.45, src.width / 2, src.height / 2, Math.max(src.width, src.height) * 0.75);
  g.addColorStop(0, "rgba(0,0,0,0)");
  g.addColorStop(1, `rgba(0,0,0,${0.25 * strength})`);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, src.width, src.height);
  return src;
}

/* ── per-preset pipelines (strength s ∈ [0..1]) ───────────── */
function runPreset(preset: Preset, base: HTMLCanvasElement, s: number, edge: number): HTMLCanvasElement {
  switch (preset) {
    case "sharpen":
      return unsharp(base, 2, 0.6 + s * 1.6);
    case "deblur": {
      const pass1 = unsharp(base, 6, 0.5 + s * 1.1);
      return unsharp(pass1, 1.5, 0.4 + s * 0.9);
    }
    case "denoise":
      return denoise(base, 0.35 + s * 0.55);
    case "enhance": {
      const t = withFilter(base, `brightness(${1 + s * 0.06}) contrast(${1 + s * 0.1}) saturate(${1 + s * 0.15})`);
      return unsharp(denoise(t, 0.2 * s), 1.6, 0.5 + s * 0.7);
    }
    case "portrait": {
      const t = withFilter(base, `brightness(${1 + s * 0.05}) contrast(${1 + s * 0.16}) saturate(${1 + s * 0.22})`);
      return vignette(unsharp(t, 2, 0.5 + s * 0.8), s);
    }
    case "restore": {
      const dn = denoise(base, 0.3 + s * 0.4);
      const t = withFilter(dn, `contrast(${1 + s * 0.28}) brightness(${1 + s * 0.05}) saturate(${1 + s * 0.2})`);
      return unsharp(t, 2, 0.4 + s * 0.7);
    }
    case "colorize":
      // warm-tone preview until the cloud engine is live
      return withFilter(base, `grayscale(1) sepia(${0.5 + s * 0.5}) saturate(${1.1 + s * 0.9}) contrast(1.05)`);
    case "cartoon": {
      const flat = posterize(withFilter(base, `saturate(${1.2 + s * 0.6}) blur(1px)`), Math.round(8 - s * 4));
      const ink = edgeInk(base, 0.8 + edge * 2.2);
      const ctx = flat.getContext("2d")!;
      ctx.drawImage(ink, 0, 0);
      return flat;
    }
    case "sketch":
      return sketch(base, s);
  }
}

/* ── component ────────────────────────────────────────────── */
export default function AiImageFxClient({ preset, isPreviewTool }: { preset: Preset; isPreviewTool?: boolean }) {
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const [afterUrl, setAfterUrl] = useState<string | null>(null);
  const [afterBlob, setAfterBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);
  const [strength, setStrength] = useState(0.6);
  const [edge, setEdge] = useState(0.5);
  const baseRef = useRef<HTMLCanvasElement | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const process = useCallback((canvas: HTMLCanvasElement, s: number, e: number) => {
    setBusy(true);
    // let the loader paint before heavy pixel work
    setTimeout(() => {
      try {
        const out = runPreset(preset, canvas, s, e);
        out.toBlob((blob) => {
          if (blob) {
            setAfterBlob(blob);
            setAfterUrl((old) => { if (old) URL.revokeObjectURL(old); return URL.createObjectURL(blob); });
          }
          setBusy(false);
        }, "image/png");
      } catch {
        setBusy(false);
      }
    }, 60);
  }, [preset]);

  async function onFile(f: File) {
    trackTool(`ai-${preset}`, { size: f.size });
    const img = new Image();
    const url = URL.createObjectURL(f);
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
    const base = drawScaled(img);
    baseRef.current = base;
    setBeforeUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
    process(base, strength, edge);
  }

  // live re-process on slider change
  useEffect(() => {
    if (!baseRef.current) return;
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => process(baseRef.current!, strength, edge), 220);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [strength, edge, process]);

  function reset() {
    setBeforeUrl(null); setAfterUrl(null); setAfterBlob(null); baseRef.current = null;
  }

  return (
    <div className="qx-card p-6 space-y-5">
      {isPreviewTool && <CloudNotice />}
      {!beforeUrl && <AiDropzone onFile={onFile} />}

      {beforeUrl && (
        <>
          <div className="flex flex-wrap items-center gap-6">
            <label className="flex items-center gap-3">
              <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Strength</span>
              <input type="range" min={0} max={100} value={strength * 100}
                onChange={(e) => setStrength(Number(e.target.value) / 100)}
                className="w-44 accent-[#e1ff04]" aria-label="Effect strength" />
            </label>
            {preset === "cartoon" && (
              <label className="flex items-center gap-3">
                <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Edges</span>
                <input type="range" min={0} max={100} value={edge * 100}
                  onChange={(e) => setEdge(Number(e.target.value) / 100)}
                  className="w-36 accent-[#e1ff04]" aria-label="Edge strength" />
              </label>
            )}
          </div>

          {busy && !afterUrl ? (
            <AiProcessing />
          ) : (
            afterUrl && (
              <div className="relative">
                {busy && <div className="absolute inset-0 z-10 rounded-2xl flex items-center justify-center" style={{ background: "rgba(8,8,14,.35)", backdropFilter: "blur(2px)" }}><span className="text-[12px] font-bold px-3 py-1.5 rounded-full" style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>Updating…</span></div>}
                <BeforeAfter before={beforeUrl} after={afterUrl} />
              </div>
            )
          )}

          <AiResultBar blob={afterBlob} filename={`qrix-ai-${preset}.png`} onReset={reset} />
        </>
      )}
    </div>
  );
}
