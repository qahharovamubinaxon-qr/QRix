"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   QRix Premium Background v2
   Layer 1 — Aurora orbs (soft radial gradients, slow drift)
   Layer 2 — Dot grid (breathing + mouse distortion + glow pulses)
   Layer 3 — Vignette for readability
   Dark:  #07070f base + cyan/violet neon orbs + teal-green dots
   Light: #f4f5fb base + violet/purple orbs + purple dots
   ============================================================ */

export default function DotDistortionBackground({
  gap = 28,
  dotRadius = 1.0,
  influence = 165,
  strength = 26,
}: {
  gap?: number;
  dotRadius?: number;
  influence?: number;
  strength?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const isLight = () => document.documentElement.classList.contains("light");

    // ── Dot palette ──────────────────────────────────────────
    const palette = () =>
      isLight()
        ? { base: [124, 58, 237] as [number,number,number], bright: [168, 85, 247] as [number,number,number], baseA: 0.22 }
        : { base: [34, 197, 130] as [number,number,number], bright: [34, 211, 238] as [number,number,number], baseA: 0.18 };

    // ── Aurora orbs ──────────────────────────────────────────
    interface Orb {
      x: number; y: number;
      vx: number; vy: number;
      r: number;
      color: [number, number, number];
      alpha: number;
      phase: number;
    }
    let orbs: Orb[] = [];

    const seedOrbs = (W: number, H: number) => {
      const darkPalette: [number,number,number][] = [
        [124, 58, 237],
        [34, 211, 238],
        [99, 102, 241],
        [168, 85, 247],
        [6, 182, 212],
        [139, 92, 246],
      ];
      const lightPalette: [number,number,number][] = [
        [124, 58, 237],
        [168, 85, 247],
        [139, 92, 246],
        [109, 40, 217],
        [192, 132, 252],
        [124, 58, 237],
      ];
      const pal = isLight() ? lightPalette : darkPalette;
      orbs = pal.map((color, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: (isLight() ? 220 : 280) + Math.random() * 320,
        color,
        alpha: isLight() ? 0.055 + Math.random() * 0.035 : 0.10 + Math.random() * 0.08,
        phase: (i / pal.length) * Math.PI * 2 + Math.random() * 0.5,
      }));
    };

    // ── Dots grid ─────────────────────────────────────────────
    let W = 0, H = 0;
    type Dot = { x: number; y: number; ph: number };
    let dots: Dot[] = [];

    const build = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cols = Math.ceil(W / gap) + 1;
      const rows = Math.ceil(H / gap) + 1;
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          dots.push({ x: c * gap, y: r * gap, ph: (c + r) * 0.35 });
      seedOrbs(W, H);
    };
    build();

    // ── Mouse ────────────────────────────────────────────────
    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave, { passive: true });

    // ── Glow pulses ──────────────────────────────────────────
    type Pulse = { i: number; t: number };
    let pulses: Pulse[] = [];
    let pulseTimer = 0;

    let raf = 0;
    let t = 0;
    const R2 = influence * influence;

    const loop = () => {
      if (disposed) return;
      t += 0.016;
      const pal = palette();
      ctx.clearRect(0, 0, W, H);

      // ── Layer 1: Aurora orbs ────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (const orb of orbs) {
        const pulse = 1 + (reduce ? 0 : 0.05 * Math.sin(t * 0.7 + orb.phase));
        const r = orb.r * pulse;
        const a = orb.alpha * (reduce ? 1 : 0.88 + 0.12 * Math.sin(t * 0.9 + orb.phase));
        const [rc, gc, bc] = orb.color;

        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        grad.addColorStop(0,    `rgba(${rc},${gc},${bc},${a})`);
        grad.addColorStop(0.42, `rgba(${rc},${gc},${bc},${a * 0.38})`);
        grad.addColorStop(1,    `rgba(${rc},${gc},${bc},0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx.fill();

        if (!reduce) {
          orb.x += orb.vx;
          orb.y += orb.vy;
          if (orb.x < -orb.r) orb.x = W + orb.r;
          if (orb.x > W + orb.r) orb.x = -orb.r;
          if (orb.y < -orb.r) orb.y = H + orb.r;
          if (orb.y > H + orb.r) orb.y = -orb.r;
        }
      }
      ctx.restore();

      // ── Layer 2: Dots ────────────────────────────────────
      if (!reduce) {
        pulseTimer += 0.016;
        if (pulseTimer > 0.35) {
          pulseTimer = 0;
          for (let k = 0; k < 3; k++)
            pulses.push({ i: Math.floor(Math.random() * dots.length), t: 0 });
          pulses = pulses.filter((p) => p.t < 1.4);
        }
        for (const p of pulses) p.t += 0.016;
      }
      const pulseMap = new Map<number, number>();
      for (const p of pulses) {
        const v = Math.sin((p.t / 1.4) * Math.PI);
        pulseMap.set(p.i, Math.max(pulseMap.get(p.i) || 0, v));
      }

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        let x = d.x, y = d.y;
        let sizeBoost = 0, aBoost = 0;

        const dx = d.x - mouse.x;
        const dy = d.y - mouse.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < R2) {
          const dist = Math.sqrt(dist2) || 1;
          const f = 1 - dist / influence;
          const push = f * f * strength;
          x += (dx / dist) * push;
          y += (dy / dist) * push;
          sizeBoost = f * 1.8;
          aBoost = f * 0.75;
        }

        const breathe = reduce ? 0 : Math.sin(t * 1.6 + d.ph) * 0.22;
        const pulse = pulseMap.get(i) || 0;
        const r = dotRadius + breathe + sizeBoost + pulse * 1.1;
        const a = Math.min(1, pal.baseA + aBoost + pulse * 0.8);
        const col = pulse > 0.3 || aBoost > 0.3 ? pal.bright : pal.base;

        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.3, r), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`;
        ctx.fill();
      }

      // ── Layer 3: Vignette ────────────────────────────────
      const light = isLight();
      const vigBase = light ? "244,245,251" : "7,7,15";
      const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.88);
      vig.addColorStop(0, `rgba(${vigBase},0)`);
      vig.addColorStop(1, `rgba(${vigBase},${light ? 0.42 : 0.52})`);
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    // Theme change → re-seed orbs
    const themeObs = new MutationObserver(() => seedOrbs(W, H));
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onResize = () => build();
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("resize", onResize);
      themeObs.disconnect();
    };
  }, [gap, dotRadius, influence, strength]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0" />
    </div>
  );
}
