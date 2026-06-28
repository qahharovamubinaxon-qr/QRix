"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL = 14; // думча узунлиги (нечта нуқта)

export default function CursorGlow() {
  const dotRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const trailRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduce) return;
    setEnabled(true);

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let gx = mx, gy = my;     // нур
    let hue = 0;              // камалак ранги айланади
    // Думча учун охирги нуқталар тарихи
    const hist: { x: number; y: number }[] = Array.from({ length: TRAIL }, () => ({ x: mx, y: my }));
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dotRef.current) dotRef.current.style.transform = `translate(${mx}px, ${my}px)`;
    };

    const tick = () => {
      // Нур lerp билан эргашади
      gx += (mx - gx) * 0.1;
      gy += (my - gy) * 0.1;
      hue = (hue + 2.2) % 360; // ранг доимий айланади (камалак)

      if (dotRef.current) {
        dotRef.current.style.background = `hsl(${hue}, 95%, 65%)`;
        dotRef.current.style.boxShadow = `0 0 12px hsl(${hue}, 95%, 60%)`;
      }
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${gx}px, ${gy}px)`;
        glowRef.current.style.background = `radial-gradient(circle, hsla(${hue},95%,60%,0.22), hsla(${(hue + 60) % 360},95%,55%,0.10) 45%, transparent 70%)`;
      }

      // Думчани силжитамиз — ҳар бир нуқта олдингисини қувлайди
      hist.unshift({ x: mx, y: my });
      hist.pop();
      for (let i = 0; i < TRAIL; i++) {
        const el = trailRefs.current[i];
        if (!el) continue;
        const p = hist[i];
        const t = 1 - i / TRAIL; // олдингилари каттароқ/ёрқинроқ
        const h = (hue - i * 10 + 360) % 360; // ҳар нуқта бошқа ранг → камалак
        el.style.transform = `translate(${p.x}px, ${p.y}px) scale(${t})`;
        el.style.background = `hsl(${h}, 95%, 62%)`;
        el.style.opacity = `${t * 0.55}`;
        el.style.boxShadow = `0 0 ${10 * t}px hsl(${h}, 95%, 60%)`;
      }

      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]" aria-hidden style={{ mixBlendMode: "screen" }}>
      {/* Нур (катта, орқада) */}
      <div
        ref={glowRef}
        className="absolute top-0 left-0"
        style={{ width: 300, height: 300, marginLeft: -150, marginTop: -150, borderRadius: "50%", filter: "blur(10px)", willChange: "transform" }}
      />

      {/* Камалак думчаси */}
      {Array.from({ length: TRAIL }).map((_, i) => (
        <div
          key={i}
          ref={(el) => { trailRefs.current[i] = el; }}
          className="absolute top-0 left-0"
          style={{
            width: 16,
            height: 16,
            marginLeft: -8,
            marginTop: -8,
            borderRadius: "50%",
            filter: "blur(2px)",
            willChange: "transform, opacity",
          }}
        />
      ))}

      {/* Марказий нуқта (курсорда, ёрқин) */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0"
        style={{ width: 9, height: 9, marginLeft: -4.5, marginTop: -4.5, borderRadius: "50%", willChange: "transform" }}
      />
    </div>
  );
}
