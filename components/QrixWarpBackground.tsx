"use client";

/* QRix Warp Background (Mission 72) — a textless, cinematic cyber "data-tunnel"
   that lives behind the DARK sections of the homepage (everything below the
   orange hero). Warp-speed streaks fly outward from a gently drifting vanishing
   point; SCROLLING accelerates the tunnel so the background appears to zoom in
   sync with the page. Orange light on the left, blue on the right, white sparks,
   floating dust, soft additive bloom and a readability veil so section text stays
   legible.

   Deliberately built on pure Canvas 2D (additive "lighter" compositing) — NOT
   Three.js/WebGL — to honour CLAUDE.md's lightweight / Lighthouse-95+ / no-heavy-
   library rules on the homepage. GPU-composited, ~60fps, pauses when the tab is
   hidden, and respects prefers-reduced-motion. */

import { useEffect, useRef } from "react";

type Streak = { a: number; r: number; len: number; w: number; spd: number };
type Dust = { x: number; y: number; z: number; s: number };

export default function QrixWarpBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, M = 0, dpr = 1;
    let cx = 0, cy = 0, t = 0, raf = 0, running = true;

    const N = window.innerWidth < 700 ? 170 : 320; // streak count
    const ND = window.innerWidth < 700 ? 40 : 72;  // dust count
    const streaks: Streak[] = [];
    const dust: Dust[] = [];

    // Colour by direction: left → orange, right → blue, with white sparks.
    const tint = (a: number): [number, number, number] => {
      const roll = (Math.sin(a * 12.9898) + 1) * 0.5; // stable pseudo-random per angle
      if (roll > 0.84) return [255, 255, 255];
      return Math.cos(a) < 0 ? [255, 150, 60] : [80, 155, 255];
    };

    const spawn = (s: Streak, atStart: boolean) => {
      s.a = Math.random() * Math.PI * 2;
      s.r = atStart ? Math.random() : 0.015 + Math.random() * 0.07;
      s.len = 0.04 + Math.random() * 0.15;
      s.w = 0.6 + Math.random() * 1.8;
      s.spd = 0.55 + Math.random() * 1.15;
    };

    for (let i = 0; i < N; i++) { const s = {} as Streak; spawn(s, true); streaks.push(s); }
    for (let i = 0; i < ND; i++) dust.push({ x: Math.random(), y: Math.random(), z: Math.random(), s: Math.random() });

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth; H = window.innerHeight;
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      cv.style.width = W + "px"; cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      M = Math.max(W, H);
    };
    resize();
    window.addEventListener("resize", resize);

    const REACH = 0.78;
    const draw = (boost: number) => {
      // gently drifting vanishing point → subtle cinematic camera movement
      cx = W * (0.5 + 0.045 * Math.sin(t * 0.0006));
      cy = H * (0.46 + 0.05 * Math.cos(t * 0.0005));

      // near-black base
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#05060a";
      ctx.fillRect(0, 0, W, H);

      // volumetric side light — orange left, blue right, neutral centre
      const atmo = ctx.createLinearGradient(0, 0, W, 0);
      atmo.addColorStop(0, "rgba(255,120,40,0.06)");
      atmo.addColorStop(0.5, "rgba(10,12,20,0)");
      atmo.addColorStop(1, "rgba(55,120,255,0.06)");
      ctx.fillStyle = atmo; ctx.fillRect(0, 0, W, H);

      // ── warp streaks (additive glow) ──
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "round";
      const speed = 0.0055 * (1 + boost * 2.4); // scroll accelerates the tunnel
      for (const s of streaks) {
        s.r += speed * s.spd;
        if (s.r > 1.15) { spawn(s, false); continue; }
        const r0 = Math.max(0, s.r - s.len);
        const e1 = s.r * s.r, e0 = r0 * r0; // perspective acceleration
        const dx = Math.cos(s.a), dy = Math.sin(s.a);
        const x1 = cx + dx * e1 * M * REACH, y1 = cy + dy * e1 * M * REACH;
        const x0 = cx + dx * e0 * M * REACH, y0 = cy + dy * e0 * M * REACH;
        const [r, g, b] = tint(s.a);
        const alpha = Math.min(1, s.r * 1.5) * 0.85;
        const w = s.w * (0.35 + s.r * 2.3);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        if (s.r > 0.55) {
          ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.beginPath(); ctx.arc(x1, y1, w * 0.55, 0, Math.PI * 2); ctx.fill();
        }
      }

      // floating dust
      for (const d of dust) {
        d.z += 0.0007 * (1 + boost);
        if (d.z > 1) d.z = 0;
        const px = cx + (d.x - 0.5) * W * (0.35 + d.z);
        const py = cy + (d.y - 0.5) * H * (0.35 + d.z);
        const sz = d.s * 1.8 + 0.5;
        ctx.fillStyle = `rgba(255,255,255,${0.04 + d.z * 0.12})`;
        ctx.fillRect(px, py, sz, sz);
      }

      // central bloom
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, M * 0.5);
      glow.addColorStop(0, "rgba(255,175,110,0.13)");
      glow.addColorStop(0.4, "rgba(85,125,255,0.05)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);

      // ── readability veil + vignette ──
      ctx.globalCompositeOperation = "source-over";
      const veil = ctx.createLinearGradient(0, 0, 0, H);
      veil.addColorStop(0, "rgba(5,6,10,0.58)");
      veil.addColorStop(0.32, "rgba(5,6,10,0.30)");
      veil.addColorStop(0.68, "rgba(5,6,10,0.32)");
      veil.addColorStop(1, "rgba(5,6,10,0.64)");
      ctx.fillStyle = veil; ctx.fillRect(0, 0, W, H);
      const vg = ctx.createRadialGradient(W / 2, H / 2, M * 0.28, W / 2, H / 2, M * 0.72);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(2,2,5,0.5)");
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);
    };

    // opacity below hero + scroll → progress (drives fade-in AND zoom speed)
    const state = () => {
      const vh = window.innerHeight || 1;
      const sy = window.scrollY || 0;
      const op = Math.max(0, Math.min(1, (sy - vh * 0.6) / (vh * 0.5)));
      const docH = Math.max(1, document.documentElement.scrollHeight - vh);
      const progress = Math.min(1, sy / docH);
      return { op, progress };
    };

    if (reduce) {
      // Static, non-animated frame; still hidden over the hero, revealed on scroll.
      // The shared resize() (registered earlier) reallocates + clears the canvas on
      // every resize (incl. mobile URL-bar collapse), so repaint the static frame
      // after it runs — otherwise a resize would blank the warp for the session.
      draw(0.12);
      const repaint = () => draw(0.12);
      window.addEventListener("resize", repaint, { passive: true });
      const onScroll = () => { cv.style.opacity = String(state().op); };
      window.addEventListener("scroll", onScroll, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("resize", repaint);
        window.removeEventListener("scroll", onScroll);
      };
    }

    const loop = () => {
      if (!running) return;
      t += 16;
      const { op, progress } = state();
      cv.style.opacity = String(op);
      if (op < 0.01) { raf = requestAnimationFrame(loop); return; } // idle over hero
      draw(progress);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      running = !document.hidden;
      if (running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="qx-warp" aria-hidden />;
}
