"use client";

/* Mission 43 — GlitterField: the user's Originkit "Glitter Wrap" starfield,
   adapted as the living layer of the site's dark scenes. White/warm sparks
   drift toward the viewer with occasional glitter flashes. It rides inside
   the fixed .qx-scenes canvas, fades out while the orange era scene is on,
   and freezes to a static field under prefers-reduced-motion. */

import { useEffect, useRef } from "react";

const CFG = {
  particleCount: 500,
  colors: ["#ffffff", "#f7f4fc", "#ffd9c8"] as const,
  stepZ: 3 * 0.0008,          // speed 3
  density: 100,
  focalDepth: 5 / 100,        // focalDepth 5
  starScale: 19 * 0.15,       // starSize 19
  turbulence: 7 * 0.2,        // turbulence 7
  glitter: 3 * 0.1,           // glitterIntensity 3
  brightness: 72 / 100,       // brightness 72
  trail: 3 / 100,             // trailAmount 3
};

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

type Star = {
  x: number; y: number; z: number;
  px: number; py: number;
  seed: number; vmul: number; colorIdx: number;
  flashUntil: number; nextFlash: number;
};

export default function GlitterField() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const palette = CFG.colors.map(hexToRgb);
    const rgbStrs = palette.map(([r, g, b]) => `rgb(${r}, ${g}, ${b})`);

    const stars: Star[] = [];
    let elapsed = 0;
    let lastT = performance.now();
    let raf = 0;
    const size = { w: 0, h: 0, dpr: 1 };

    const resetStar = (s: Star, initial = false) => {
      const angle = Math.random() * Math.PI * 2;
      const radius = (0.2 + Math.random() * 0.8) * (CFG.density / 15);
      s.x = Math.cos(angle) * radius;
      s.y = Math.sin(angle) * radius;
      s.z = initial ? Math.random() : 1.0;
      s.px = NaN; s.py = NaN;
      s.seed = Math.random() * 1000;
      s.vmul = 0.6 + Math.random() * 0.8;
      s.colorIdx = Math.floor(Math.random() * 3);
      s.flashUntil = 0;
      s.nextFlash = elapsed + 1 + Math.random() * 4 * (1 / Math.max(0.0001, CFG.glitter));
    };

    for (let i = 0; i < CFG.particleCount; i++) {
      const s: Star = { x: 0, y: 0, z: 0, px: NaN, py: NaN, seed: 0, vmul: 1, colorIdx: 0, flashUntil: 0, nextFlash: 0 };
      resetStar(s, true);
      stars.push(s);
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.max(1, wrap.clientWidth || window.innerWidth);
      const h = Math.max(1, wrap.clientHeight || window.innerHeight);
      if (size.w === w && size.h === h && size.dpr === dpr) return;
      size.w = w; size.h = h; size.dpr = dpr;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const drawFrame = (deltaSec: number) => {
      const { w, h } = size;
      const cx = w / 2, cy = h / 2;
      const projScale = Math.min(w, h) * 0.9;
      const dt = Math.max(0.001, Math.min(0.1, deltaSec)) * 60;

      const keep = Math.pow(Math.min(0.98, Math.max(0, CFG.trail)), dt);
      const trailAlpha = Math.max(0.02, 1 - keep);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${trailAlpha})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.z -= CFG.stepZ * s.vmul * dt;
        if (s.z <= CFG.focalDepth) { resetStar(s); continue; }

        let tx = s.x, ty = s.y;
        const t = elapsed * 1.2 + s.seed;
        const amp = CFG.turbulence * (1 - s.z) * 0.25;
        tx += Math.sin(t + s.seed) * amp;
        ty += Math.cos(t * 1.13 + s.seed * 0.7) * amp;

        const persp = CFG.focalDepth / Math.max(s.z, 0.0001);
        const sx = cx + tx * persp * projScale;
        const sy = cy + ty * persp * projScale;
        if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) { resetStar(s); continue; }

        let flashMult = 1;
        if (elapsed >= s.nextFlash && s.flashUntil < elapsed) {
          s.flashUntil = elapsed + 0.04 + Math.random() * 0.07;
          s.nextFlash = elapsed + 1 + Math.random() * 4 * (1 / Math.max(0.0001, CFG.glitter));
        }
        if (elapsed <= s.flashUntil) flashMult = 1 + 2.5 * CFG.glitter;

        const sizePersp = Math.min(2.5, (CFG.focalDepth / Math.max(s.z, 0.0001)) * 0.6);
        const baseR = Math.max(0.25, CFG.starScale * (0.4 + sizePersp));
        const maxR = 1 + CFG.starScale * 2.5;
        const r = Math.min(baseR * flashMult, maxR);

        const lifeT = 1 - s.z;
        const a = Math.min(1, lifeT * 0.9 + 0.05) * CFG.brightness * (flashMult > 1 ? 1 : 0.85);
        const colStr = rgbStrs[s.colorIdx];

        if (!Number.isNaN(s.px) && !Number.isNaN(s.py)) {
          ctx.globalAlpha = a * 0.5;
          ctx.strokeStyle = colStr;
          ctx.lineWidth = Math.max(0.4, r * 0.4);
          ctx.beginPath();
          ctx.moveTo(s.px, s.py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }

        ctx.globalAlpha = a;
        ctx.fillStyle = colStr;
        ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
        if (flashMult > 1) {
          const rf = Math.min(r * 1.4, maxR * 1.4);
          ctx.globalAlpha = a * 0.5;
          ctx.fillRect(sx - rf, sy - rf, rf * 2, rf * 2);
        }

        s.px = sx; s.py = sy;
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
      elapsed += Math.min(0.1, Math.max(0, deltaSec));
    };

    if (reduced) {
      // static populated field, no motion
      for (let i = 0; i < 80; i++) drawFrame(1 / 60);
      return () => ro.disconnect();
    }

    const eraScene = document.querySelector('.qx-scene[data-scene="era"]');
    let hidden = false;
    const loop = (t: number) => {
      const deltaSec = (t - lastT) / 1000;
      lastT = t;
      // the orange era owns the viewport → hide + skip work
      const eraOn = eraScene?.classList.contains("on") ?? false;
      wrap.style.opacity = eraOn ? "0" : "1";
      if (!eraOn) drawFrame(deltaSec);
      if (!hidden) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      hidden = document.hidden;
      if (!hidden) { lastT = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className="qx-glitter" aria-hidden>
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }} />
    </div>
  );
}
