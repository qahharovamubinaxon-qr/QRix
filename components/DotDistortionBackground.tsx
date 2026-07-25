"use client";

import { useEffect, useRef, useState } from "react";

/* The CSS twin of the canvas, for every device without a cursor. Positions are
   fixed rather than random so the server and the client render the same tree;
   the drift comes from one keyframe on `transform`, so this whole layer lives
   on the compositor and costs no main-thread time at all. */
const CSS_ORBS = [
  { c: "124,58,237", size: 62, x: 8,  y: 12, dur: 34, delay: 0 },
  { c: "34,211,238", size: 54, x: 68, y: 4,  dur: 41, delay: -6 },
  { c: "99,102,241", size: 70, x: 40, y: 55, dur: 47, delay: -13 },
  { c: "168,85,247", size: 48, x: 78, y: 62, dur: 38, delay: -21 },
  { c: "6,182,212",  size: 58, x: 2,  y: 68, dur: 44, delay: -9 },
  { c: "139,92,246", size: 52, x: 52, y: 26, dur: 36, delay: -17 },
];

function CssBackdrop() {
  return (
    <div className="qx-bgcss">
      <div className="qx-bgcss-orbs">
        {CSS_ORBS.map((o, i) => (
          <div
            key={i}
            className="qx-bgcss-orb"
            style={{
              left: `${o.x}%`,
              top: `${o.y}%`,
              width: `${o.size}vmax`,
              height: `${o.size}vmax`,
              marginLeft: `-${o.size / 2}vmax`,
              marginTop: `-${o.size / 2}vmax`,
              background: `radial-gradient(circle, rgba(${o.c},0.13) 0%, rgba(${o.c},0.05) 42%, rgba(${o.c},0) 70%)`,
              animationDuration: `${o.dur}s`,
              animationDelay: `${o.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

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
  const [useCanvas, setUseCanvas] = useState(false);

  /* Pushing the dots around is the only thing the canvas does that the CSS
     layer cannot, and it needs a cursor to do it. On touch — and on every
     Lighthouse mobile run — the canvas was repainting a full-screen,
     screen-blended composite forever to render an effect nobody could
     trigger. It now mounts only where a fine pointer exists. */
  useEffect(() => {
    setUseCanvas(
      window.matchMedia("(pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useEffect(() => {
    if (!useCanvas) return;
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
    let hidden = false;
    const R2 = influence * influence;

    /* Per-frame createRadialGradient is the single most expensive thing this
       canvas used to do: six orb gradients plus a full-screen vignette, all
       re-evaluated per pixel every frame. Both are cached instead — the orbs
       as unit sprites drawn with globalAlpha, the vignette as one bitmap that
       only changes on resize or theme flip. */
    const SPRITE_R = 128;
    const orbSprites = new Map<string, HTMLCanvasElement>();
    const orbSprite = (color: [number, number, number]) => {
      const key = color.join(",");
      const cached = orbSprites.get(key);
      if (cached) return cached;
      const s = document.createElement("canvas");
      s.width = s.height = SPRITE_R * 2;
      const sc = s.getContext("2d")!;
      const g = sc.createRadialGradient(SPRITE_R, SPRITE_R, 0, SPRITE_R, SPRITE_R, SPRITE_R);
      g.addColorStop(0, `rgba(${key},1)`);
      g.addColorStop(0.42, `rgba(${key},0.38)`);
      g.addColorStop(1, `rgba(${key},0)`);
      sc.fillStyle = g;
      sc.fillRect(0, 0, SPRITE_R * 2, SPRITE_R * 2);
      orbSprites.set(key, s);
      return s;
    };

    let vigCanvas: HTMLCanvasElement | null = null;
    let vigKey = "";
    const vignette = () => {
      const light = isLight();
      const key = `${W}x${H}:${light}`;
      if (vigCanvas && vigKey === key) return vigCanvas;
      const c = document.createElement("canvas");
      c.width = Math.max(1, W);
      c.height = Math.max(1, H);
      const vc = c.getContext("2d")!;
      const vigBase = light ? "244,245,251" : "7,7,15";
      const vig = vc.createRadialGradient(W / 2, H / 2, H * 0.28, W / 2, H / 2, H * 0.88);
      vig.addColorStop(0, `rgba(${vigBase},0)`);
      vig.addColorStop(1, `rgba(${vigBase},${light ? 0.42 : 0.52})`);
      vc.fillStyle = vig;
      vc.fillRect(0, 0, W, H);
      vigCanvas = c;
      vigKey = key;
      return c;
    };

    /* `k` scales anything that used to advance once per 60 Hz frame, so the
       drift reads at the same speed under the 30 fps cap below. */
    const drawFrame = (k = 1) => {
      t += 0.016 * k;
      const pal = palette();
      ctx.clearRect(0, 0, W, H);

      // ── Layer 1: Aurora orbs ────────────────────────────
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (const orb of orbs) {
        const pulse = 1 + (reduce ? 0 : 0.05 * Math.sin(t * 0.7 + orb.phase));
        const r = orb.r * pulse;
        const a = orb.alpha * (reduce ? 1 : 0.88 + 0.12 * Math.sin(t * 0.9 + orb.phase));

        ctx.globalAlpha = a;
        ctx.drawImage(orbSprite(orb.color), orb.x - r, orb.y - r, r * 2, r * 2);

        if (!reduce) {
          orb.x += orb.vx * k;
          orb.y += orb.vy * k;
          if (orb.x < -orb.r) orb.x = W + orb.r;
          if (orb.x > W + orb.r) orb.x = -orb.r;
          if (orb.y < -orb.r) orb.y = H + orb.r;
          if (orb.y > H + orb.r) orb.y = -orb.r;
        }
      }
      ctx.restore();

      // ── Layer 2: Dots ────────────────────────────────────
      if (!reduce) {
        pulseTimer += 0.016 * k;
        if (pulseTimer > 0.35) {
          pulseTimer = 0;
          for (let n = 0; n < 3; n++)
            pulses.push({ i: Math.floor(Math.random() * dots.length), t: 0 });
          pulses = pulses.filter((p) => p.t < 1.4);
        }
        for (const p of pulses) p.t += 0.016 * k;
      }
      const pulseMap = new Map<number, number>();
      for (const p of pulses) {
        const v = Math.sin((p.t / 1.4) * Math.PI);
        pulseMap.set(p.i, Math.max(pulseMap.get(p.i) || 0, v));
      }

      /* Every dot that is neither under the cursor nor pulsing shares one
         colour, so they go into a single path and cost one fill() between
         them instead of one each. */
      const baseStyle = `rgba(${pal.base[0]},${pal.base[1]},${pal.base[2]},${pal.baseA})`;
      ctx.beginPath();
      const boosted: { x: number; y: number; r: number; a: number; col: [number, number, number] }[] = [];

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
        const r = Math.max(0.3, dotRadius + breathe + sizeBoost + pulse * 1.1);

        if (aBoost === 0 && pulse === 0) {
          ctx.moveTo(x + r, y);
          ctx.arc(x, y, r, 0, Math.PI * 2);
        } else {
          boosted.push({
            x, y, r,
            a: Math.min(1, pal.baseA + aBoost + pulse * 0.8),
            col: pulse > 0.3 || aBoost > 0.3 ? pal.bright : pal.base,
          });
        }
      }
      ctx.fillStyle = baseStyle;
      ctx.fill();

      for (const b of boosted) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${b.col[0]},${b.col[1]},${b.col[2]},${b.a})`;
        ctx.fill();
      }

      // ── Layer 3: Vignette ────────────────────────────────
      ctx.drawImage(vignette(), 0, 0, W, H);
    };

    /* 30 fps. The orbs drift at 0.15 px/frame and the dots breathe over
       seconds — nothing here reads as motion at 60 Hz that does not read the
       same at 30, and it halves the main-thread cost of the whole layer. */
    const FRAME_MS = 1000 / 30;
    let lastFrame = 0;

    const loop = (now: number) => {
      if (disposed) return;
      const dt = lastFrame ? now - lastFrame : FRAME_MS;
      if (dt >= FRAME_MS - 1) {
        lastFrame = now;
        drawFrame(Math.min(dt, 100) / (1000 / 60));
      }
      if (!hidden) raf = requestAnimationFrame(loop);
    };

    /* The background is decoration behind the fold-one content, but it used to
       start competing for the main thread the moment it hydrated — inside the
       window LCP and TBT are measured in. It now paints one frame straight
       away (so the page never looks unfinished) and only starts animating once
       the document has loaded and the thread is idle. */
    const startLoop = () => {
      if (disposed || reduce) return;
      lastFrame = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
    };
    const whenIdle = (fn: () => void) => {
      const ric = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void })
        .requestIdleCallback;
      if (ric) ric(fn, { timeout: 3000 });
      else setTimeout(fn, 1200);
    };

    drawFrame(0); // one static frame, immediately
    if (!reduce) {
      if (document.readyState === "complete") whenIdle(startLoop);
      else window.addEventListener("load", () => whenIdle(startLoop), { once: true });
    }

    // Pause the loop while the tab is hidden (saves CPU / battery)
    const onVis = () => {
      hidden = document.hidden;
      if (!hidden && !reduce && !disposed) startLoop();
    };
    document.addEventListener("visibilitychange", onVis);

    // Theme change → re-seed orbs (and repaint once if we're in static mode)
    const themeObs = new MutationObserver(() => { seedOrbs(W, H); if (reduce) drawFrame(0); });
    themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const onResize = () => { build(); drawFrame(0); };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      themeObs.disconnect();
    };
  }, [useCanvas, gap, dotRadius, influence, strength]);

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {useCanvas ? <canvas ref={canvasRef} className="absolute inset-0" /> : <CssBackdrop />}
    </div>
  );
}
