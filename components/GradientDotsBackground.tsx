"use client";

import { useEffect, useRef } from "react";
import { GradientDots } from "@/components/ui/gradient-dots";

/**
 * The 21st.dev gradient-dots field used as the site background BELOW the orange hero.
 *
 * It lives inside the fixed `.qx-scenes` layer (z-index:-1), so it sits behind all page
 * content but on top of the era/deep/dusk scene gradients. Its opacity is driven by
 * scroll: 0 while the orange hero is on screen, ramping to 1 once you scroll past it —
 * so the hero stays exactly as it was and the dots carry every dark section down to the
 * footer.
 *
 * Scroll is read in a rAF-throttled passive listener; the dot animation itself is pure
 * CSS (no JS per frame).
 */
export default function GradientDotsBackground() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let raf = 0;
    const apply = () => {
      raf = 0;
      const vh = window.innerHeight || 1;
      // Fade in across the half-viewport after the hero.
      const op = Math.max(0, Math.min(1, (window.scrollY - vh * 0.6) / (vh * 0.5)));
      el.style.opacity = String(op);
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
    <div ref={ref} className="qx-gdots-layer" aria-hidden>
      <GradientDots dotSize={8} spacing={10} duration={20} colorCycleDuration={6} backgroundColor="#080808" />
    </div>
  );
}
