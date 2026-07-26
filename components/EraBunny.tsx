"use client";

/* Mission 46 — mascots live INSIDE their sections now (no fixed layer, no
   gliding with the screen). Each stage smoke-materializes when its section
   reaches the viewport and dissolves back when it leaves — opacity + blur +
   a breath of scale, both directions. In the hero the still and the user's
   alpha film trade places in a slow cycle. Cursor still gets a soft nod. */

import { useEffect, useRef, useState } from "react";

/* toggle .on both ways so the smoke plays on every entry/exit.
   The synchronous first check guarantees the mascot materializes on load
   even where observer callbacks are delayed (hidden/throttled tabs). */
function useSmoke<T extends HTMLElement>(threshold = 0.22, auto = false) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    /* `auto` stages materialize from CSS (see .qx-smoke--auto) so the paint
       never waits for this bundle. Take the reveal back here: .on and the
       animation's end state are both fully materialized, so swapping one for
       the other inside a single tick cannot flash, and the observer below then
       drives entry/exit exactly as it does for every other stage. */
    if (auto) {
      el.classList.add("on");
      el.classList.remove("qx-smoke--auto");
    }
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
  }, [threshold, auto]);
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

/* hero mascot: a calm standing bunny. It briefly cross-faded a still with an alpha
   film, then (Mission 79-80) became a scroll-scrubbed canvas and a full-page
   companion — all reverted at the user's request; the scroll motion "wasn't needed".
   Back to the still it always was, with the smoke reveal on entry and the soft
   parallax drift, and nothing that moves on its own. The film (bunny-hero-live.webm)
   is deliberately not used: it washes out to white from 3.50s to 4.57s, which is the
   flash the scrub had been hiding — a still has no such problem. */
export default function EraBunny() {
  const smokeRef = useSmoke<HTMLDivElement>(0.15, true);
  const paraRef = useParallax<HTMLDivElement>(18);

  return (
    <div className="qx-hm" aria-hidden>
      {/* --auto: this is the homepage's LCP element and it is on screen at
          load, so its reveal is a CSS animation rather than something the
          observer grants after hydration. */}
      <div ref={smokeRef} className="qx-smoke qx-smoke--auto">
        <div ref={paraRef} className="qx-hm-in">
          {/* fetchPriority: the browser only gave this High after layout proved it
              was in view, ~1.2s after the HTML arrived. The hint moves it into the
              preload scanner's first wave instead. The file itself was re-encoded
              186 KB -> 103 KB at the same 613x1876 (PSNR 44.4 dB against the old
              bytes, i.e. no visible change) — it was the whole download budget of
              the first viewport. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="qx-hm-img" src="/scenes/bunny-hero.webp" alt="" draggable={false}
            fetchPriority="high" />
        </div>
      </div>
    </div>
  );
}

/* generator mascot: the small film beside the CREATE card.

   The film is 2 MB. It used to mount with the page, and even at the browser's
   Low priority that is the single heaviest thing the homepage fetches — it was
   worth ~11s of Speed Index on a throttled mobile run (16.5s home vs ~5.5s on
   every other template) for a decorative loop that sits below the fold. So the
   <video> is not rendered at all until the card is within a viewport of the
   scroll position; until then the poster still stands in, which is the same
   frame the video starts on, so the swap is invisible. Someone who never
   scrolls that far never pays for it. */
export function GenBunny() {
  const smokeRef = useSmoke<HTMLDivElement>(0.25);
  const paraRef = useParallax<HTMLDivElement>(12);
  const holderRef = useRef<HTMLDivElement>(null);
  const [reduced, setReduced] = useState(false);
  const [near, setNear] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    const el = holderRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") { setNear(true); return; }
    const io = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } },
      { rootMargin: "100% 0px" } // one viewport of lead time, so it is playing by the time it arrives
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div className="qx-gm" aria-hidden ref={holderRef}>
      <div ref={smokeRef} className="qx-smoke">
        <div ref={paraRef}>
          {reduced || !near ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="qx-gm-media" src="/scenes/bunny-blue.webp" alt="" draggable={false}
              loading="lazy" decoding="async" />
          ) : (
            <video className="qx-gm-media" src="/scenes/bunny-gen-live.webm"
              autoPlay muted loop playsInline preload="none" poster="/scenes/bunny-blue.webp" />
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
