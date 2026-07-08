"use client";

import { useEffect, useRef, useState } from "react";

/* Design V2 hero motion primitives — zero deps, GPU transforms only. */

/** Two dashed orbit rings with counter-rotating tool icons around the hero. */
export function OrbitIcons() {
  const inner = ["🔳", "📄", "🖼", "🤖"];
  const outer = ["🎬", "👤", "▮▮", "📊"];
  return (
    <div className="qx-orbit hidden lg:block" aria-hidden>
      <div className="qx-orbit-ring" style={{ width: 560, height: 560 }}>
        {inner.map((e, i) => (
          <div key={e} className="absolute inset-0" style={{ transform: `rotate(${(i * 360) / inner.length}deg)` }}>
            <span className="qx-orbit-icon">{e}</span>
          </div>
        ))}
      </div>
      <div className="qx-orbit-ring r2" style={{ width: 760, height: 760 }}>
        {outer.map((e, i) => (
          <div key={e} className="absolute inset-0" style={{ transform: `rotate(${(i * 360) / outer.length + 45}deg)` }}>
            <span className="qx-orbit-icon" style={{ fontSize: 12, letterSpacing: -1 }}>{e}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Count-up statistic — eases to the target once scrolled into view. */
export function CountUp({ to, suffix = "", duration = 1400 }: { to: number; suffix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setVal(to); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setVal(Math.round(to * (1 - Math.pow(1 - p, 3)))); // ease-out cubic
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to, duration]);

  return <span ref={ref} className="qx-stat-num">{val.toLocaleString("en-US")}{suffix}</span>;
}
