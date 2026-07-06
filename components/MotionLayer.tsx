"use client";

import { useEffect } from "react";

/**
 * Site-wide premium motion layer — zero dependencies, GPU-only transforms.
 *
 *  • Scroll reveal: any element with [data-reveal] animates in once when it
 *    enters the viewport. Variants: fade-up (default) | left | right | scale |
 *    blur. Children of [data-stagger] get an automatic 90ms cascade.
 *  • Mouse-follow glow: .qx-card gets --mx/--my custom props on pointermove
 *    (used by the CSS ::before spotlight).
 *  • Magnetic buttons: [data-magnetic] elements gently follow the cursor.
 *
 * Respects prefers-reduced-motion (everything stays visible & static).
 */
export default function MotionLayer() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ── scroll reveal ─────────────────────────────────────────── */
    const revealEls = () => document.querySelectorAll<HTMLElement>("[data-reveal]:not(.rv-done)");
    if (reduced) {
      revealEls().forEach((el) => el.classList.add("rv-in", "rv-done"));
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          el.classList.add("rv-in", "rv-done");
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    // Observing writes nothing to the DOM (hydration-safe); the rv-in class is
    // only added when an element actually intersects, i.e. on user scroll.
    const attach = () => {
      if (!reduced) revealEls().forEach((el) => io.observe(el));
    };
    // Wait one frame so React finishes hydrating page subtrees before the
    // observer can add rv-in (prevents hydration-attribute mismatches).
    const mo = new MutationObserver(() => attach());
    const raf = window.setTimeout(() => {
      attach();
      mo.observe(document.body, { childList: true, subtree: true });
    }, 180);

    /* ── mouse-follow glow on cards ───────────────────────────── */
    const onMove = (ev: PointerEvent) => {
      const card = (ev.target as HTMLElement).closest?.(".qx-card, .qx-card-glow, .qx-card-premium") as HTMLElement | null;
      if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${(((ev.clientX - r.left) / r.width) * 100).toFixed(1)}%`);
      card.style.setProperty("--my", `${(((ev.clientY - r.top) / r.height) * 100).toFixed(1)}%`);
    };

    /* ── magnetic buttons ─────────────────────────────────────── */
    const onMagnet = (ev: PointerEvent) => {
      const el = (ev.target as HTMLElement).closest?.("[data-magnetic]") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = ev.clientX - (r.left + r.width / 2);
      const dy = ev.clientY - (r.top + r.height / 2);
      el.style.transform = `translate(${(dx * 0.18).toFixed(1)}px, ${(dy * 0.22).toFixed(1)}px)`;
    };
    const onLeave = (ev: PointerEvent) => {
      const el = (ev.target as HTMLElement).closest?.("[data-magnetic]") as HTMLElement | null;
      if (el) el.style.transform = "";
    };

    if (!reduced) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointermove", onMagnet, { passive: true });
      document.addEventListener("pointerout", onLeave, { passive: true });
    }
    return () => {
      clearTimeout(raf);
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointermove", onMagnet);
      document.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return null;
}
