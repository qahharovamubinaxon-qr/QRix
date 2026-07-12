"use client";

/* Mission 45 — the mascot as premium stills (user's picks, gamma-lifted,
   keyed at full res). Two fixed slots cross-FADE between states on scroll:
   standing bunny centre-stage in the hero, blue-sneaker bunny beside the
   CREATE card. A slow float keeps them alive; the cursor adds parallax.
   Reduced motion pins the hero still only. */

import { useEffect, useRef, useState } from "react";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export default function EraBunny() {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onMq = () => setReduced(mq.matches);
    mq.addEventListener?.("change", onMq);
    return () => mq.removeEventListener?.("change", onMq);
  }, []);

  useEffect(() => {
    if (reduced) return;
    const el = ref.current;
    if (!el) return;
    const heroEl = el.querySelector<HTMLElement>("[data-pose='hero']");
    const genEl = el.querySelector<HTMLElement>("[data-pose='gen']");
    if (!heroEl || !genEl) return;

    let mx = 0, my = 0, cmx = 0, cmy = 0, raf = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 24;
      my = (e.clientY / window.innerHeight - 0.5) * 12;
    };

    const tick = () => {
      const gen = document.getElementById("generator");
      const vh = window.innerHeight;
      const y = window.scrollY;

      let p = 0, tail = 1;
      if (gen) {
        const top = gen.getBoundingClientRect().top + y;
        const bottom = top + gen.offsetHeight;
        p = ease(clamp((y - (top - vh * 0.95)) / (vh * 0.6), 0, 1));
        tail = 1 - clamp((y - (bottom - vh * 0.5)) / (vh * 0.4), 0, 1);
      }

      cmx += (mx - cmx) * 0.06;
      cmy += (my - cmy) * 0.06;

      const heroO = clamp(1 - p * 2.2, 0, 1);
      const genO = clamp((p - 0.5) * 2.2, 0, 1) * tail;
      heroEl.style.opacity = String(heroO);
      genEl.style.opacity = String(genO);
      heroEl.style.visibility = heroO <= 0.01 ? "hidden" : "visible";
      genEl.style.visibility = genO <= 0.01 ? "hidden" : "visible";

      const drift = `translate3d(${cmx}px, ${cmy}px, 0) rotate(${cmx / 12}deg)`;
      heroEl.style.transform = drift;
      genEl.style.transform = drift;

      el.style.visibility = (heroO <= 0.01 && genO <= 0.01) ? "hidden" : "visible";
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div ref={ref} className={`qx-bunny-fixed${reduced ? " qx-bunny-fixed--static" : ""}`} aria-hidden>
      {/* hero: standing bunny, centre stage */}
      <div className="qx-bunny-slot qx-bunny-slot--hero" data-pose="hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="qx-bunny-media" src="/scenes/bunny-hero.webp" alt="" draggable={false} />
      </div>
      {/* generator: blue-sneaker bunny beside the CREATE card */}
      <div className="qx-bunny-slot qx-bunny-slot--gen" data-pose="gen" style={{ opacity: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="qx-bunny-media" src="/scenes/bunny-blue.webp" alt="" draggable={false} />
      </div>
    </div>
  );
}

/* A smaller static bunny for lower sections — reveals with the section and
   leans gently toward the cursor. */
export function BunnyPeek({ pose, side }: { pose: "point" | "walk"; side: "left" | "right" }) {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 18;
      ty = (e.clientY / window.innerHeight - 0.5) * 10;
    };
    const tick = () => {
      cx += (tx - cx) * 0.07; cy += (ty - cy) * 0.07;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0) rotate(${cx / 9}deg)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, []);

  return (
    <div className={`qx-bunny-peek qx-bunny-peek--${side}`} data-reveal={side === "left" ? "left" : "right"} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={ref} src={`/scenes/bunny-${pose}.webp`} alt="" draggable={false} />
    </div>
  );
}
