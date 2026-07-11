"use client";

/* Mission 42 — the QRix bunny lives as film now.
   Two transparent VP9 loops cut from the user's Kling render:
   - walk loop: centre-stage in the hero
   - idle close-up: left of the generator cards
   No gliding — the mascot cross-FADES between states as you scroll
   (fade out by mid-travel, swap position + clip, fade back in), then fades
   away below the generator. Cursor gives a soft parallax. Browsers without
   VP9-alpha get the static webp posters. */

import { useEffect, useRef, useState } from "react";

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const ease = (t: number) => 1 - Math.pow(1 - t, 3);

function useAlphaVideoOk() {
  const [ok, setOk] = useState(true);
  useEffect(() => {
    const v = document.createElement("video");
    setOk(v.canPlayType('video/webm; codecs="vp9"') !== "");
  }, []);
  return ok;
}

export default function EraBunny() {
  const ref = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const alphaOk = useAlphaVideoOk();

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
    const walkEl = el.querySelector<HTMLElement>("[data-pose='walk']");
    const idleEl = el.querySelector<HTMLElement>("[data-pose='idle']");
    if (!walkEl || !idleEl) return;

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

      // cross-fade, no travel: walk owns p<0.5, idle owns p>0.5
      const walkO = clamp(1 - p * 2.2, 0, 1);
      const idleO = clamp((p - 0.5) * 2.2, 0, 1) * tail;
      walkEl.style.opacity = String(walkO);
      idleEl.style.opacity = String(idleO);
      walkEl.style.visibility = walkO <= 0.01 ? "hidden" : "visible";
      idleEl.style.visibility = idleO <= 0.01 ? "hidden" : "visible";

      const drift = `translate3d(${cmx}px, ${cmy}px, 0) rotate(${cmx / 12}deg)`;
      walkEl.style.transform = drift;
      idleEl.style.transform = drift;

      el.style.visibility = (walkO <= 0.01 && idleO <= 0.01) ? "hidden" : "visible";
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
      {/* hero: walking loop, centre stage */}
      <div className="qx-bunny-slot qx-bunny-slot--hero" data-pose="walk">
        {alphaOk && !reduced ? (
          <video className="qx-bunny-media" src="/scenes/bunny-walk-loop.webm"
            autoPlay muted loop playsInline poster="/scenes/bunny-walk-loop.webp" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="qx-bunny-media" src="/scenes/bunny-hero.webp" alt="" draggable={false} />
        )}
      </div>
      {/* generator: idle close-up on the left */}
      <div className="qx-bunny-slot qx-bunny-slot--gen" data-pose="idle" style={{ opacity: 0 }}>
        {alphaOk && !reduced ? (
          <video className="qx-bunny-media" src="/scenes/bunny-idle-loop.webm"
            autoPlay muted loop playsInline poster="/scenes/bunny-idle-loop.webp" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="qx-bunny-media" src="/scenes/bunny-idle-loop.webp" alt="" draggable={false} />
        )}
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
