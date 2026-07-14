"use client";

/* The hero bunny, driven by the scrollbar.
   Prototype (Mission 79) — the bunny's pointing take is cut into 53 frames
   (scripts/gen-bunny-frames.mjs) and the scroll position picks which one to draw.
   Scroll down and it raises its arm and points; scroll back and it lowers it. The
   animation has no clock of its own — it is entirely yours.

   Why a canvas and not the <video> it replaces: seeking a video costs a decode
   unless every frame is a keyframe, and making every frame a keyframe inflates the
   file roughly tenfold. Blitting a decoded image costs nothing, and the 53 frames
   come to 0.99 MB — half of what the 2.05 MB video weighed.

   Depth comes from three layers moving at different rates against the scroll: a
   glow well behind, the bunny, and its contact shadow. */

import { useEffect, useRef, useState } from "react";
import { BUNNY_FRAMES, BUNNY_W, BUNNY_H, bunnyFrameSrc } from "@/lib/bunny-frames";

export default function BunnyScrollStage() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = BUNNY_W * dpr;
    canvas.height = BUNNY_H * dpr;
    ctx.scale(dpr, dpr);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── load ─────────────────────────────────────────────────────────────────
       Every frame is requested at once, but nothing waits for all of them: the
       first frame to land is painted immediately, and a scroll that asks for a
       frame still in flight gets the nearest one that has arrived. A hero that
       shows nothing until a megabyte has downloaded is worse than a hero whose
       bunny is briefly a few frames behind. */
    const frames: (HTMLImageElement | null)[] = new Array(BUNNY_FRAMES).fill(null);
    let painted = false;
    let dead = false;

    const nearestLoaded = (want: number): HTMLImageElement | null => {
      for (let d = 0; d < BUNNY_FRAMES; d++) {
        const lo = frames[want - d];
        if (lo) return lo;
        const hi = frames[want + d];
        if (hi) return hi;
      }
      return null;
    };

    let target = 0;
    let drawn = -1;
    const draw = () => {
      const img = frames[target] ?? nearestLoaded(target);
      if (!img) return;
      ctx.clearRect(0, 0, BUNNY_W, BUNNY_H);
      ctx.drawImage(img, 0, 0, BUNNY_W, BUNNY_H);
      drawn = target;
      if (!painted) { painted = true; setReady(true); }
    };

    for (let i = 0; i < BUNNY_FRAMES; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = bunnyFrameSrc(i);
      img.onload = () => {
        if (dead) return;
        frames[i] = img;
        // Repaint if this frame is the one the scroll is currently asking for, or
        // if nothing has been painted yet.
        if (!painted || i === target) draw();
      };
    }

    /* ── scrub ───────────────────────────────────────────────────────────────── */
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;

        const hero = wrap.closest<HTMLElement>(".qx-era");
        const span = (hero?.offsetHeight ?? window.innerHeight) * 0.9;
        const p = Math.min(1, Math.max(0, window.scrollY / span));

        // The layers travel different distances over the same scroll — that is the
        // parallax. The glow barely moves, the bunny drifts, the shadow follows it
        // and spreads as the bunny "lifts".
        wrap.style.setProperty("--p", p.toFixed(4));

        const next = Math.round(p * (BUNNY_FRAMES - 1));
        if (next !== drawn) { target = next; draw(); }
      });
    };

    if (reduced) {
      // No scrubbing: hold the pose mid-point, where the bunny is already pointing.
      target = Math.floor(BUNNY_FRAMES * 0.45);
      draw();
    } else {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    }

    return () => {
      dead = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={wrapRef} className={`qx-bs${ready ? " is-ready" : ""}`} aria-hidden>
      <span className="qx-bs-glow" />
      <canvas ref={canvasRef} className="qx-bs-canvas" />
      <span className="qx-bs-shadow" />

      <style>{`
        /* Fills .qx-hm-in, which the hero already sizes and centres. The frames are
           720x1260, the same 0.5715 ratio the mascot slot was built for, so contain
           is a formality rather than a crop. */
        .qx-bs {
          --p: 0;
          position: absolute;
          inset: 0;
        }

        /* the bunny — drifts up a little as you scroll, so it does not feel welded
           to the page */
        .qx-bs-canvas {
          position: absolute;
          inset: 0;
          z-index: 2;
          width: 100%;
          height: 100%;
          object-fit: contain;
          opacity: 0;
          transform: translate3d(0, calc(var(--p) * -26px), 0);
          transition: opacity .7s ease-out;
        }
        .qx-bs.is-ready .qx-bs-canvas { opacity: 1; }

        /* far layer: a warm bloom that hardly moves — the further away, the slower */
        .qx-bs-glow {
          position: absolute;
          z-index: 1;
          left: 50%;
          bottom: 12%;
          width: 118%;
          aspect-ratio: 1;
          transform: translate3d(-50%, calc(var(--p) * -8px), 0) scale(calc(1 + var(--p) * .06));
          background: radial-gradient(circle, rgba(255,196,140,.30) 0%, rgba(255,122,40,.13) 38%, transparent 68%);
          pointer-events: none;
        }

        /* near layer: the contact shadow, which travels furthest and softens as the
           bunny lifts away from it */
        .qx-bs-shadow {
          position: absolute;
          z-index: 0;
          left: 50%;
          bottom: 1.5%;
          width: 46%;
          height: 3.2%;
          transform: translate3d(-50%, calc(var(--p) * 6px), 0) scaleX(calc(1 - var(--p) * .12));
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(90, 28, 4, .5) 0%, transparent 72%);
          filter: blur(calc(4px + var(--p) * 5px));
          opacity: calc(.75 - var(--p) * .3);
          pointer-events: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .qx-bs-canvas, .qx-bs-glow, .qx-bs-shadow { transform: none; transition: none; }
          .qx-bs-canvas { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
