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
    // Start only after the document fully loads (+ a settle beat) so React has
    // finished hydrating every streamed subtree — fixed 180ms raced slow loads.
    let raf = 0;
    const start = () => {
      raf = window.setTimeout(() => {
        attach();
        mo.observe(document.body, { childList: true, subtree: true });
        parallaxReady = true;
        onParallax();
      }, 250);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    /* ── mouse-follow glow on cards + global cursor spotlight ──── */
    const root = document.documentElement;
    const onMove = (ev: PointerEvent) => {
      // Root-level cursor vars drive the hero spotlight (.qx-hero-light).
      root.style.setProperty("--px", `${ev.clientX}px`);
      root.style.setProperty("--py", `${ev.clientY}px`);
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

    /* ── 3D tilt: [data-tilt] cards follow the cursor in perspective ── */
    const onTiltMove = (ev: PointerEvent) => {
      const el = (ev.target as HTMLElement).closest?.("[data-tilt]") as HTMLElement | null;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const rx = ((ev.clientY - r.top) / r.height - 0.5) * -7;
      const ry = ((ev.clientX - r.left) / r.width - 0.5) * 9;
      el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(0)`;
    };
    const onTiltLeave = (ev: PointerEvent) => {
      const el = (ev.target as HTMLElement).closest?.("[data-tilt]") as HTMLElement | null;
      if (el && !el.contains(ev.relatedTarget as Node)) el.style.transform = "";
    };

    /* ── parallax: [data-parallax="0.15"] drifts against scroll ── */
    let ticking = false;
    let parallaxReady = false; // gated until hydration settles (see timeout below)
    const onParallax = () => {
      if (ticking || !parallaxReady) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const vh = window.innerHeight;
        document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
          const speed = Number(el.dataset.parallax) || 0.12;
          const r = el.getBoundingClientRect();
          const delta = (r.top + r.height / 2 - vh / 2) * -speed;
          el.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`;
        });
      });
    };

    /* ── ripple on primary buttons ── */
    const onRipple = (ev: PointerEvent) => {
      const btn = (ev.target as HTMLElement).closest?.(".qx-btn, .qx-btn-hero") as HTMLElement | null;
      if (!btn) return;
      const r = btn.getBoundingClientRect();
      const d = Math.max(r.width, r.height);
      const span = document.createElement("span");
      span.className = "qx-ripple";
      span.style.cssText = `width:${d}px;height:${d}px;left:${ev.clientX - r.left - d / 2}px;top:${ev.clientY - r.top - d / 2}px`;
      btn.appendChild(span);
      setTimeout(() => span.remove(), 700);
    };

    if (!reduced) {
      document.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointermove", onMagnet, { passive: true });
      document.addEventListener("pointermove", onTiltMove, { passive: true });
      document.addEventListener("pointerout", onLeave, { passive: true });
      document.addEventListener("pointerout", onTiltLeave, { passive: true });
      document.addEventListener("pointerdown", onRipple, { passive: true });
      window.addEventListener("scroll", onParallax, { passive: true });
      onParallax();
    }
    return () => {
      clearTimeout(raf);
      window.removeEventListener("load", start);
      io.disconnect();
      mo.disconnect();
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointermove", onMagnet);
      document.removeEventListener("pointermove", onTiltMove);
      document.removeEventListener("pointerout", onLeave);
      document.removeEventListener("pointerout", onTiltLeave);
      document.removeEventListener("pointerdown", onRipple);
      window.removeEventListener("scroll", onParallax);
    };
  }, []);

  return null;
}
