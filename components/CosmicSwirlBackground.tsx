"use client";

/* Cosmic Swirl — the site background for the DARK sections (everything below the
   orange hero). An original Canvas 2D particle vortex: a few thousand white points
   orbiting a drifting core, with the angular speed rising toward the centre so the
   field naturally winds itself into spiral filaments. Behind it sits a sparse, slowly
   twinkling starfield with a handful of bright stars — one of which flares hard, like
   a distant lightning strike.

   Monochrome on black by design: it reads as depth rather than decoration, so the copy
   stays the loudest thing on the page.

   Deliberately hand-written Canvas 2D — no three.js, no particle library (CLAUDE.md:
   keep the bundle light, Lighthouse 95+). GPU-composited, pauses when the tab is
   hidden, and honours prefers-reduced-motion (renders one still frame). */

import { useEffect, useRef } from "react";

type Particle = { a: number; r: number; spd: number; size: number; alpha: number };
type Star = { x: number; y: number; size: number; base: number; phase: number; spd: number; bright: boolean };

/** Peak opacity of the field. It is almost black, so it can sit high without
    fighting the copy — unlike a coloured background. */
const MAX_OPACITY = 0.9;

export default function CosmicSwirlBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduce =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0, H = 0, M = 0, dpr = 1;
    let cx = 0, cy = 0, t = 0, raf = 0, running = true;

    const small = window.innerWidth < 700;
    const N_SWIRL = small ? 700 : 1700; // vortex particles
    const N_STARS = small ? 180 : 420;  // distant starfield

    const swirl: Particle[] = [];
    const stars: Star[] = [];

    const spawn = (p: Particle, seeded: boolean) => {
      p.a = Math.random() * Math.PI * 2;
      // Bias toward the core so the centre reads dense and the rim stays sparse.
      const u = Math.random();
      p.r = 0.04 + Math.pow(u, 0.65) * (seeded ? 1.15 : 1.15);
      p.spd = 0.55 + Math.random() * 0.9;
      p.size = Math.random() < 0.08 ? 1.7 : 0.6 + Math.random() * 0.85;
      p.alpha = 0.3 + Math.random() * 0.7;
    };

    for (let i = 0; i < N_SWIRL; i++) {
      const p = {} as Particle;
      spawn(p, true);
      swirl.push(p);
    }
    for (let i = 0; i < N_STARS; i++) {
      const bright = Math.random() < 0.05;
      stars.push({
        x: Math.random(),
        y: Math.random(),
        size: bright ? 1.6 + Math.random() * 1.6 : 0.5 + Math.random() * 0.9,
        base: bright ? 0.75 : 0.18 + Math.random() * 0.5,
        phase: Math.random() * Math.PI * 2,
        spd: 0.4 + Math.random() * 1.6,
        bright,
      });
    }

    // One star flares hard on an irregular beat — the "lightning" in the reference.
    let flareAt = 2 + Math.random() * 5;
    let flare = 0;
    const flareStar = stars.length ? stars[(Math.random() * stars.length) | 0] : null;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      cv.style.width = W + "px";
      cv.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      M = Math.max(W, H);
    };
    resize();
    window.addEventListener("resize", resize);

    const REACH = 0.62;

    const draw = (dt: number) => {
      // The core drifts slowly, so the composition never sits still.
      cx = W * (0.47 + 0.05 * Math.sin(t * 0.00013));
      cy = H * (0.44 + 0.06 * Math.cos(t * 0.00011));

      ctx.fillStyle = "#040406";
      ctx.fillRect(0, 0, W, H);

      // ── distant starfield ──
      for (const s of stars) {
        s.phase += 0.0016 * s.spd * dt;
        const tw = 0.55 + 0.45 * Math.sin(s.phase);
        let a = s.base * tw;
        const x = s.x * W;
        const y = s.y * H;
        if (s === flareStar && flare > 0) a = Math.min(1, a + flare);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        const sz = s.size + (s === flareStar ? flare * 1.6 : 0);
        ctx.fillRect(x, y, sz, sz);
        if (s.bright || (s === flareStar && flare > 0.15)) {
          // soft bloom for the few bright ones
          const g = ctx.createRadialGradient(x, y, 0, x, y, sz * 6);
          g.addColorStop(0, `rgba(255,255,255,${a * 0.35})`);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - sz * 6, y - sz * 6, sz * 12, sz * 12);
        }
      }

      // ── the vortex ──
      for (const p of swirl) {
        // Differential rotation: inner particles sweep faster, which shears the field
        // into spiral filaments all by itself.
        const omega = (0.00055 * p.spd) / (p.r + 0.10);
        p.a += omega * dt;
        p.r -= 0.000022 * dt * (0.4 + p.r); // slow inward drift
        if (p.r < 0.035) spawn(p, false);

        const rr = Math.pow(p.r, 1.08) * M * REACH;
        const x = cx + Math.cos(p.a) * rr;
        const y = cy + Math.sin(p.a) * rr * 0.62; // flatten → disc seen at an angle

        // Fade out at the rim so the field dissolves instead of ending on an edge.
        const rim = p.r > 0.95 ? Math.max(0, 1 - (p.r - 0.95) / 0.2) : 1;
        ctx.fillStyle = `rgba(255,255,255,${p.alpha * rim})`;
        ctx.fillRect(x, y, p.size, p.size);
      }

      // core glow
      const core = ctx.createRadialGradient(cx, cy, 0, cx, cy, M * 0.13);
      core.addColorStop(0, "rgba(255,255,255,0.13)");
      core.addColorStop(0.45, "rgba(255,255,255,0.03)");
      core.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, W, H);

      // vignette keeps the copy legible near the edges
      const vg = ctx.createRadialGradient(W / 2, H / 2, M * 0.3, W / 2, H / 2, M * 0.78);
      vg.addColorStop(0, "rgba(4,4,6,0)");
      vg.addColorStop(1, "rgba(4,4,6,0.72)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    };

    /** Opacity gate: invisible over the orange hero, full below it. */
    const opacity = () => {
      const vh = window.innerHeight || 1;
      const sy = window.scrollY || 0;
      return Math.max(0, Math.min(1, (sy - vh * 0.6) / (vh * 0.5))) * MAX_OPACITY;
    };

    if (reduce) {
      draw(16);
      const onScroll = () => { cv.style.opacity = String(opacity()); };
      const repaint = () => { resize(); draw(16); };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", repaint, { passive: true });
      onScroll();
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("resize", repaint);
        window.removeEventListener("scroll", onScroll);
      };
    }

    let last = 0;
    const loop = (now: number) => {
      if (!running) return;
      const dt = last ? Math.min(48, now - last) : 16;
      last = now;
      t += dt;

      const op = opacity();
      cv.style.opacity = String(op);
      if (op < 0.01) { raf = requestAnimationFrame(loop); return; } // idle over the hero

      // irregular lightning-like flare
      flareAt -= dt / 1000;
      if (flareAt <= 0) { flare = 1; flareAt = 3 + Math.random() * 7; }
      if (flare > 0) flare = Math.max(0, flare - dt / 260);

      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      running = !document.hidden;
      if (running) { last = 0; cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} className="qx-swirl" aria-hidden />;
}
