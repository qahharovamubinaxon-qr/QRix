"use client";

import { useEffect, useRef } from "react";

/* ============================================================
   QRix Premium Background
   - Dark:  deep #07070f + cyan/violet neon orbs + grid
   - Light: #f4f5fb + soft violet/purple orbs
   - Canvas-based, 60fps, pointer-events: none
   - Reduced-motion: static gradient only
   ============================================================ */

interface Orb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
  alpha: number;
  pulseOffset: number;
}

export default function PremiumBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const isLight = () => document.documentElement.classList.contains("light");
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let t = 0;

    const orbsDark: Omit<Orb, "color">[] & { color: string }[] = [];
    const orbsLight: Omit<Orb, "color">[] & { color: string }[] = [];

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }

    function seedOrbs() {
      const w = canvas!.width;
      const h = canvas!.height;

      const darkColors = [
        "rgba(124,58,237,",   // violet
        "rgba(34,211,238,",   // cyan
        "rgba(99,102,241,",   // indigo
        "rgba(168,85,247,",   // purple
        "rgba(6,182,212,",    // teal-cyan
      ];
      const lightColors = [
        "rgba(124,58,237,",
        "rgba(168,85,247,",
        "rgba(139,92,246,",
        "rgba(109,40,217,",
        "rgba(192,132,252,",
      ];

      orbsDark.length = 0;
      orbsLight.length = 0;

      for (let i = 0; i < 6; i++) {
        const base = {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          r: 260 + Math.random() * 340,
          alpha: 0.13 + Math.random() * 0.1,
          pulseOffset: Math.random() * Math.PI * 2,
        };
        orbsDark.push({ ...base, color: darkColors[i % darkColors.length] });
        orbsLight.push({
          ...base,
          x: Math.random() * w,
          y: Math.random() * h,
          r: 200 + Math.random() * 280,
          alpha: 0.07 + Math.random() * 0.06,
          color: lightColors[i % lightColors.length],
        });
      }
    }

    function drawGrid(w: number, h: number, light: boolean) {
      const step = 48;
      const lineColor = light
        ? "rgba(124,58,237,0.055)"
        : "rgba(124,58,237,0.045)";
      const dotColor = light
        ? "rgba(124,58,237,0.12)"
        : "rgba(34,211,238,0.18)";

      ctx!.strokeStyle = lineColor;
      ctx!.lineWidth = 1;

      // vertical lines
      for (let x = 0; x < w; x += step) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      // horizontal lines
      for (let y = 0; y < h; y += step) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      // dot intersections (every 2nd)
      ctx!.fillStyle = dotColor;
      for (let x = step * 2; x < w; x += step * 2) {
        for (let y = step * 2; y < h; y += step * 2) {
          ctx!.beginPath();
          ctx!.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx!.fill();
        }
      }
    }

    function drawOrbs(orbs: typeof orbsDark, w: number, h: number) {
      for (const orb of orbs) {
        const pulse = 1 + 0.06 * Math.sin(t * 0.008 + orb.pulseOffset);
        const r = orb.r * pulse;
        const alpha = orb.alpha * (0.88 + 0.12 * Math.sin(t * 0.012 + orb.pulseOffset));

        const grad = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        grad.addColorStop(0, `${orb.color}${alpha})`);
        grad.addColorStop(0.45, `${orb.color}${alpha * 0.45})`);
        grad.addColorStop(1, `${orb.color}0)`);

        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(orb.x, orb.y, r, 0, Math.PI * 2);
        ctx!.fill();

        // move
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -r) orb.x = w + r;
        if (orb.x > w + r) orb.x = -r;
        if (orb.y < -r) orb.y = h + r;
        if (orb.y > h + r) orb.y = -r;
      }
    }

    function drawVignette(w: number, h: number, light: boolean) {
      const grad = ctx!.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, h * 0.85);
      if (light) {
        grad.addColorStop(0, "rgba(244,245,251,0)");
        grad.addColorStop(1, "rgba(244,245,251,0.5)");
      } else {
        grad.addColorStop(0, "rgba(7,7,15,0)");
        grad.addColorStop(1, "rgba(7,7,15,0.55)");
      }
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, w, h);
    }

    function frame() {
      const w = canvas!.width;
      const h = canvas!.height;
      const light = isLight();

      ctx!.clearRect(0, 0, w, h);

      // base bg
      ctx!.fillStyle = light ? "#f4f5fb" : "#07070f";
      ctx!.fillRect(0, 0, w, h);

      // grid (subtle)
      drawGrid(w, h, light);

      // orbs
      ctx!.save();
      ctx!.globalCompositeOperation = "screen";
      drawOrbs(light ? orbsLight : orbsDark, w, h);
      ctx!.restore();

      // vignette overlay for readability
      drawVignette(w, h, light);

      t++;
      raf = requestAnimationFrame(frame);
    }

    function drawStatic() {
      const w = canvas!.width;
      const h = canvas!.height;
      const light = isLight();
      ctx!.fillStyle = light ? "#f4f5fb" : "#07070f";
      ctx!.fillRect(0, 0, w, h);
      drawGrid(w, h, light);
      // single center orb, no animation
      const orb = light ? orbsLight[0] : orbsDark[0];
      if (orb) {
        orb.x = w * 0.5;
        orb.y = h * 0.35;
        const grad = ctx!.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r * 1.5);
        grad.addColorStop(0, `${orb.color}${orb.alpha})`);
        grad.addColorStop(1, `${orb.color}0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(orb.x, orb.y, orb.r * 1.5, 0, Math.PI * 2);
        ctx!.fill();
      }
      drawVignette(w, h, light);
    }

    resize();
    seedOrbs();

    if (prefersReduced) {
      drawStatic();
    } else {
      frame();
    }

    // theme change observer
    const observer = new MutationObserver(() => {
      if (prefersReduced) drawStatic();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("resize", () => {
      resize();
      seedOrbs();
      if (prefersReduced) drawStatic();
    });

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        pointerEvents: "none",
        display: "block",
      }}
    />
  );
}
