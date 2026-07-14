"use client";

/* Matrix rain field (adapted from a Uiverse concept by solowzrd) — the background for
   the DARK sections, below the orange hero.

   Two changes from the source:
   • Palette. The original pulses blue → cyan → pink → white. That fights an orange /
     black brand, so it now breathes in QRix's own colours: dim orange at rest, rising
     through amber and a green accent to a white peak.
   • The grid is generated for the actual viewport instead of ~700 hard-coded <span>s,
     so we render only what's on screen and re-fill on resize.

   Everything animates in CSS (no JS per frame). Opacity is scroll-driven — 0 over the
   orange hero, up to a capped peak below it — so the hero is untouched. */

import { useEffect, useRef, useState } from "react";

const GLYPHS =
  "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ".split("");

/** Cell size must match --mx-cell in the CSS. */
const CELL = 44;

/** Kept well below 1: this sits behind the copy, it is not the copy. */
const MAX_OPACITY = 0.5;

export default function MatrixBackground() {
  const layerRef = useRef<HTMLDivElement>(null);
  const [cells, setCells] = useState<string[]>([]);

  // Fill the viewport with glyphs, and re-fill when it changes size.
  useEffect(() => {
    const fill = () => {
      const cols = Math.ceil(window.innerWidth / CELL) + 1;
      const rows = Math.ceil(window.innerHeight / CELL) + 1;
      const n = Math.min(cols * rows, 1600); // hard cap: never explode the DOM
      const next: string[] = new Array(n);
      for (let i = 0; i < n; i++) next[i] = GLYPHS[(Math.random() * GLYPHS.length) | 0];
      setCells(next);
    };
    fill();

    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(fill, 200); // debounce — refilling is a full re-render
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Scroll gate: invisible over the hero, fading in below it.
  useEffect(() => {
    const el = layerRef.current;
    if (!el) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      const op = Math.max(0, Math.min(1, (window.scrollY - vh * 0.6) / (vh * 0.5)));
      el.style.opacity = String(op * MAX_OPACITY);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div ref={layerRef} className="qx-matrix-layer" aria-hidden>
      <div className="qx-matrix">
        {cells.map((g, i) => (
          <span key={i}>{g}</span>
        ))}
      </div>
    </div>
  );
}
