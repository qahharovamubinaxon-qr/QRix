"use client";

/* Mission 41 — the QRix bunny mascot.
   Default export: the hero bunny on a fixed stage. It stands centre-stage over
   the giant headline, glides smoothly to the LEFT as the generator section
   scrolls in (cards take the right), then fades out below it. Reacts to the
   cursor with a soft parallax. Reduced motion pins it in the hero only. */

import { useEffect, useRef, useState } from "react";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3); // easeOutCubic

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

    let mx = 0, my = 0;          // cursor target
    let cmx = 0, cmy = 0;        // smoothed cursor
    let raf = 0;

    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 26;
      my = (e.clientY / window.innerHeight - 0.5) * 14;
    };

    const tick = () => {
      const gen = document.getElementById("generator");
      const vh = window.innerHeight;
      const y = window.scrollY;

      // travel: centre (hero) -> left column while the generator scrolls in
      let p = 0, fade = 1;
      if (gen) {
        const top = gen.getBoundingClientRect().top + y;
        const bottom = top + gen.offsetHeight;
        p = ease(clamp((y - (top - vh * 0.92)) / (vh * 0.72), 0, 1));
        // fade out once the generator is mostly passed
        fade = 1 - clamp((y - (bottom - vh * 0.55)) / (vh * 0.4), 0, 1);
      }

      cmx += (mx - cmx) * 0.06;
      cmy += (my - cmy) * 0.06;

      const xvw = -34 * p;                       // slide to the left column
      const scale = 1 - 0.16 * p;
      const rot = (cmx / 26) * 2.4 * (1 - p * 0.5);
      el.style.transform =
        `translateX(-50%) translate3d(calc(${xvw}vw + ${cmx * (1 - p * 0.6)}px), ${cmy}px, 0) scale(${scale}) rotate(${rot}deg)`;
      el.style.opacity = String(fade);
      el.style.visibility = fade <= 0.01 ? "hidden" : "visible";
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
    <div ref={ref} className={`qx-bunny-stage${reduced ? " qx-bunny-stage--static" : ""}`} aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/scenes/bunny-hero.webp" alt="" draggable={false} className="qx-bunny-img" />
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
