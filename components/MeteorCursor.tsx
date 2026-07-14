"use client";

import { useEffect, useRef } from "react";

/**
 * Meteor trail — the cursor sheds a streak of orange embers as it moves.
 *
 * Replaces the old rainbow CursorGlow (14 chained divs, hue rotating through
 * 360°, never mounted). A canvas is not just cheaper here, it is the only way to
 * get the look: embers have to leave the cursor's path, fall, and burn out at
 * their own pace. A fixed chain of DOM nodes cannot do that — every node in the
 * chain is welded to the same cursor history.
 *
 * Cost control:
 *  • one ember sprite, rasterised once, then blitted — no per-particle gradient;
 *  • embers are spawned per PIXEL TRAVELLED, not per event, so a slow drag and a
 *    fast flick lay down the same density and a 1000Hz mouse cannot flood it;
 *  • the rAF loop stops the moment the last ember burns out — an idle cursor
 *    costs zero frames.
 *
 * Off for touch (there is no cursor to trail) and for prefers-reduced-motion.
 * The cursor glyph itself is a plain CSS cursor — see :root in globals.css.
 */

type Ember = { x: number; y: number; vx: number; vy: number; life: number; decay: number; size: number };

const MAX_EMBERS = 240;
const SPAWN_EVERY_PX = 4;
const SPRITE = 64;

export default function MeteorCursor() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    /* ── backing store ─────────────────────────────────────────── */
    let w = 0;
    let h = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    /* ── the ember, drawn once ─────────────────────────────────── */
    const sprite = document.createElement("canvas");
    sprite.width = SPRITE;
    sprite.height = SPRITE;
    const sctx = sprite.getContext("2d");
    if (!sctx) return;
    const grad = sctx.createRadialGradient(SPRITE / 2, SPRITE / 2, 0, SPRITE / 2, SPRITE / 2, SPRITE / 2);
    grad.addColorStop(0, "rgba(255,246,232,1)");      // white-hot core
    grad.addColorStop(0.16, "rgba(255,206,150,0.9)"); // ember
    grad.addColorStop(0.42, "rgba(255,106,19,0.42)"); // brand orange
    grad.addColorStop(1, "rgba(255,77,28,0)");
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, SPRITE, SPRITE);

    const embers: Ember[] = [];
    let px = -1;
    let py = -1;
    let carry = 0; // leftover travel, so spacing stays exact across events
    let raf = 0;
    let burning = false;

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      // additive inside the canvas: overlapping sparks bloom, and the trail
      // still shows over white surfaces (a mix-blend-mode would erase it there)
      ctx.globalCompositeOperation = "lighter";

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life -= e.decay;
        if (e.life <= 0) {
          embers.splice(i, 1);
          continue;
        }
        e.x += e.vx;
        e.y += e.vy;
        e.vy += 0.035; // embers fall
        e.vx *= 0.965; // and drag to a stop
        e.vy *= 0.985;

        const alpha = e.life * e.life;                 // ease-out burn
        const d = e.size * (2.2 + e.life * 3.4);       // shrinking as it cools
        ctx.globalAlpha = alpha;
        ctx.drawImage(sprite, e.x - d / 2, e.y - d / 2, d, d);
      }

      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";

      if (embers.length) raf = requestAnimationFrame(tick);
      else burning = false;
    };

    const onMove = (ev: PointerEvent) => {
      const x = ev.clientX;
      const y = ev.clientY;
      if (px < 0) {
        px = x;
        py = y;
        return;
      }

      const dx = x - px;
      const dy = y - py;
      const dist = Math.hypot(dx, dy);
      px = x;
      py = y;
      if (dist < 0.5) return;

      carry += dist;
      const n = Math.min(Math.floor(carry / SPAWN_EVERY_PX), 14);
      if (n <= 0) return;
      carry -= n * SPAWN_EVERY_PX;

      for (let i = 1; i <= n; i++) {
        const t = i / n; // lay them along the path, not all at the cursor
        embers.push({
          x: x - dx + dx * t,
          y: y - dy + dy * t,
          // shed backwards along the direction of travel, with a little scatter
          vx: -dx * 0.02 + (Math.random() - 0.5) * 0.7,
          vy: -dy * 0.02 + (Math.random() - 0.5) * 0.7,
          life: 1,
          decay: 0.026 + Math.random() * 0.02,
          size: 1.5 + Math.random() * 2.4,
        });
      }
      if (embers.length > MAX_EMBERS) embers.splice(0, embers.length - MAX_EMBERS);

      if (!burning) {
        burning = true;
        raf = requestAnimationFrame(tick);
      }
    };

    // leaving the window and re-entering elsewhere must not stitch a streak
    // across the page. pointerleave on <html> only fires at the document edge.
    const onLeave = () => {
      px = -1;
      py = -1;
      carry = 0;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    window.addEventListener("blur", onLeave);
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("blur", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="qx-meteor" aria-hidden />;
}
