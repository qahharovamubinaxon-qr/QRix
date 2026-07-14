"use client";

/* The hero bunny, extended down the page as a scroll companion (Mission 80).
   Below the hero it settles into the left gutter and travels with you: as each
   content section reaches the middle of the screen it raises its arm and points at
   it, and lowers the arm in the gaps. It reuses the hero scrub's own frames —
   frame 0 is arm-down, the last frame is the full point — so "point at each
   section" is just choosing a frame by how centred the nearest section is. No new
   assets, no video, no timer.

   The centred layout is the constraint here: at ~1440px the cards and the reviews
   form reach almost to the viewport edge, leaving no gutter for a companion to
   stand in without covering them. So this does not guess with a width media query —
   it MEASURES the tightest section's left edge every resize and only appears when
   that gutter is genuinely wide enough (≈1600px+ in practice), sizing itself to fit
   inside it. Narrower than that and it renders nothing; the hero keeps its own big
   bunny either way. It also skips the hero and generator bands, which already have
   their own bunny, so two are never on screen at once. pointer-events:none, off on
   touch and under reduced motion. That combination is what makes it safe to leave
   in and trivial to pull back out. */

import { useEffect, useRef, useState } from "react";
import { BUNNY_FRAMES, BUNNY_W, BUNNY_H, bunnyFrameSrc } from "@/lib/bunny-frames";

// The sections the bunny points at — and, via the first one, the band it lives in.
// #generator is deliberately absent: it has GenBunny, and this fades in below it.
const POINT_AT = [
  'section[aria-label="All tools"]',
  "#reviews",
  'section[aria-label="Pricing"]',
];
const BAND_START = 'section[aria-label="All tools"]'; // fade in as this arrives
const GUTTER_REF = 'section[aria-label="All tools"]'; // the tightest content edge
const MIN_GUTTER = 122;  // below this there is no room; stay hidden
const MAX_WIDTH = 176;

export default function BunnyCompanion() {
  const [enabled, setEnabled] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Coarse gate before rendering anything: fine pointer, motion OK. Width is decided
  // later by measuring the real gutter, not by a media query.
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const apply = () => setEnabled(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = BUNNY_W * dpr;
    canvas.height = BUNNY_H * dpr;
    ctx.scale(dpr, dpr);

    /* frames: the same lazy, paint-on-first-arrival load the hero stage uses */
    const frames: (HTMLImageElement | null)[] = new Array(BUNNY_FRAMES).fill(null);
    let dead = false;
    let drawn = -1;
    let want = 0;
    const nearest = (i: number): HTMLImageElement | null => {
      for (let d = 0; d < BUNNY_FRAMES; d++) {
        if (frames[i - d]) return frames[i - d];
        if (frames[i + d]) return frames[i + d];
      }
      return null;
    };
    const paint = () => {
      const img = frames[want] ?? nearest(want);
      if (!img) return;
      ctx.clearRect(0, 0, BUNNY_W, BUNNY_H);
      ctx.drawImage(img, 0, 0, BUNNY_W, BUNNY_H);
      drawn = want;
    };
    for (let i = 0; i < BUNNY_FRAMES; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = bunnyFrameSrc(i);
      img.onload = () => { if (dead) return; frames[i] = img; if (drawn < 0 || i === want) paint(); };
    }

    const q = (s: string) => document.querySelector<HTMLElement>(s);
    const footer = q("footer");
    const bandStart = q(BAND_START);
    const gutterRef = q(GUTTER_REF);
    const targets = POINT_AT.map(q).filter((el): el is HTMLElement => !!el);

    /* the gutter can only change on resize — measure it there, not every scroll */
    let width = 0;
    const measure = () => {
      const gutter = gutterRef ? gutterRef.getBoundingClientRect().left : 0;
      width = gutter >= MIN_GUTTER ? Math.min(MAX_WIDTH, gutter - 22) : 0;
      wrap.style.setProperty("--w", `${width}px`);
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        if (width === 0) { wrap.style.setProperty("--vis", "0"); return; }

        const vh = window.innerHeight;
        const mid = vh / 2;

        // visible band: fade in as the first content section arrives, out over the footer
        let vis = 1;
        if (bandStart) {
          const top = bandStart.getBoundingClientRect().top;
          if (top > vh * 0.55) vis = Math.max(0, 1 - (top - vh * 0.55) / (vh * 0.4));
        }
        if (footer) {
          const ftop = footer.getBoundingClientRect().top;
          if (ftop < vh) vis = Math.min(vis, Math.max(0, ftop / vh));
        }
        wrap.style.setProperty("--vis", vis.toFixed(3));

        // arm intensity: the strongest of the sections' bell curves (peak = centred)
        let intensity = 0;
        for (const el of targets) {
          const r = el.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - mid) / vh;
          intensity = Math.max(intensity, Math.exp(-((d / 0.42) ** 2)));
        }
        wrap.style.setProperty("--point", intensity.toFixed(3));

        const next = Math.round(intensity * (BUNNY_FRAMES - 1));
        if (next !== drawn) { want = next; paint(); }
      });
    };

    measure();
    onScroll();
    const onResize = () => { measure(); onScroll(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      dead = true;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div ref={wrapRef} className="qx-bc" aria-hidden>
      <span className="qx-bc-glow" />
      <canvas ref={canvasRef} className="qx-bc-canvas" style={{ aspectRatio: `${BUNNY_W} / ${BUNNY_H}` }} />

      <style>{`
        .qx-bc {
          --vis: 0;
          --point: 0;
          --w: 0px;
          position: fixed;
          left: clamp(8px, 1.6vw, 34px);
          bottom: 0;
          z-index: 30;
          width: var(--w);
          pointer-events: none;
          opacity: var(--vis);
          transition: opacity .45s ease-out;
          animation: qx-bc-bob 4.5s ease-in-out infinite;
          will-change: opacity, transform;
        }
        /* width 0 → nothing to see; also skip painting cost */
        .qx-bc[style*="--w: 0px"] { display: none; }

        .qx-bc-canvas {
          position: relative;
          z-index: 1;
          width: 100%;
          display: block;
          filter: drop-shadow(0 18px 30px rgba(0, 0, 0, .45));
        }
        /* a warm floor glow that swells as the arm rises — the "look here" beat */
        .qx-bc-glow {
          position: absolute;
          left: 50%;
          bottom: 6%;
          width: 130%;
          aspect-ratio: 1;
          transform: translateX(-50%);
          background: radial-gradient(circle, rgba(255,168,92,.22) 0%, rgba(255,122,40,.10) 40%, transparent 66%);
          opacity: calc(.3 + var(--point) * .5);
          pointer-events: none;
        }
        /* the arm-rise lift is folded into the idle bob so they never fight */
        @keyframes qx-bc-bob {
          0%, 100% { transform: translateY(calc(6px - var(--point) * 11px)); }
          50%      { transform: translateY(calc(0px - var(--point) * 11px)); }
        }
      `}</style>
    </div>
  );
}
