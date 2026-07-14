"use client";

/* Mission 46 — mascots live INSIDE their sections now (no fixed layer, no
   gliding with the screen). Each stage smoke-materializes when its section
   reaches the viewport and dissolves back when it leaves — opacity + blur +
   a breath of scale, both directions. In the hero the still and the user's
   alpha film trade places in a slow cycle. Cursor still gets a soft nod. */

import { useEffect, useRef, useState } from "react";
import BunnyScrollStage from "@/components/BunnyScrollStage";

/* toggle .on both ways so the smoke plays on every entry/exit.
   The synchronous first check guarantees the mascot materializes on load
   even where observer callbacks are delayed (hidden/throttled tabs). */
function useSmoke<T extends HTMLElement>(threshold = 0.22) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      el.classList.toggle("on", r.bottom > vh * 0.06 && r.top < vh * 0.94);
    };
    const id = window.setTimeout(check, 60); // after first layout
    const io = new IntersectionObserver(
      ([e]) => el.classList.toggle("on", e.isIntersecting),
      { threshold, rootMargin: "-6% 0px -6% 0px" }
    );
    io.observe(el);
    return () => { window.clearTimeout(id); io.disconnect(); };
  }, [threshold]);
  return ref;
}

function useParallax<T extends HTMLElement>(amp = 16) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    const el = ref.current;
    if (!el) return;
    let raf = 0, tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * amp;
      ty = (e.clientY / window.innerHeight - 0.5) * (amp * 0.5);
    };
    const tick = () => {
      cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => { window.removeEventListener("pointermove", onMove); cancelAnimationFrame(raf); };
  }, [amp]);
  return ref;
}

/* hero mascot (Mission 79 prototype): the bunny is scrubbed by the scrollbar.
   It used to be the still cross-fading with bunny-hero-live.webm on a 6.5s timer —
   a loop that ran whether or not anyone was there, and that flashed the bunny white
   for a second every pass (the source video washes out from 3.50s to 4.57s; see
   scripts/gen-bunny-frames.mjs). Now the pointing take is 53 frames and the scroll
   position chooses which one, so the bunny answers the reader instead of a clock,
   and the flashing frames are simply not in the sequence.
   The smoke reveal and the parallax drift are unchanged — BunnyScrollStage slots
   into the same .qx-hm-in box the film used. */
export default function EraBunny() {
  const smokeRef = useSmoke<HTMLDivElement>(0.15);
  const paraRef = useParallax<HTMLDivElement>(18);

  return (
    <div className="qx-hm" aria-hidden>
      <div ref={smokeRef} className="qx-smoke">
        <div ref={paraRef} className="qx-hm-in">
          <BunnyScrollStage />
        </div>
      </div>
    </div>
  );
}

/* generator mascot: the small film beside the CREATE card */
export function GenBunny() {
  const smokeRef = useSmoke<HTMLDivElement>(0.25);
  const paraRef = useParallax<HTMLDivElement>(12);
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  return (
    <div className="qx-gm" aria-hidden>
      <div ref={smokeRef} className="qx-smoke">
        <div ref={paraRef}>
          {reduced ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="qx-gm-media" src="/scenes/bunny-blue.webp" alt="" draggable={false} />
          ) : (
            <video className="qx-gm-media" src="/scenes/bunny-gen-live.webm"
              autoPlay muted loop playsInline poster="/scenes/bunny-blue.webp" />
          )}
        </div>
      </div>
    </div>
  );
}

/* smaller cousins for lower sections — same smoke, gentler parallax */
export function BunnyPeek({ pose, side }: { pose: "point" | "walk"; side: "left" | "right" }) {
  const smokeRef = useSmoke<HTMLDivElement>(0.3);
  const paraRef = useParallax<HTMLImageElement>(14);

  return (
    <div className={`qx-bunny-peek qx-bunny-peek--${side}`} aria-hidden>
      <div ref={smokeRef} className="qx-smoke">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={paraRef} src={`/scenes/bunny-${pose}.webp`} alt="" draggable={false} />
      </div>
    </div>
  );
}
