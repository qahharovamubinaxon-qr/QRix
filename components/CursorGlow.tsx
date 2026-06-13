"use client";

import { useEffect, useRef, useState } from "react";

const TRAIL = 14; // думча узунлиги (нечта нуқта)

export default function CursorGlow() {
  const ringRef = useRef<HTMLDivElement>(null);
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
    let rx = mx, ry = my;     // ҳалқа
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

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, input, textarea, select, [role=button], label");
      if (ringRef.current) {
        ringRef.current.style.width = interactive ? "60px" : "36px";
        ringRef.current.style.height = interactive ? "60px" : "36px";
        ringRef.current.style.opacity = interactive ? "1" : "0.9";
      }
    };

    const onDown = () => { if (ringRef.current) ringRef.current.style.transform += " scale(0.8)"; };

    const tick = () => {
      // Ҳалқа ва нур lerp билан эргашади
      rx += (mx - rx) * 0.22;
      ry += (my - ry) * 0.22;
      gx += (mx - gx) * 0.1;
      gy += (my - gy) * 0.1;
      hue = (hue + 2.2) % 360; // ранг доимий айланади (камалак)

      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${rx}px, ${ry}px)`;
        ringRef.current.style.borderColor = `hsl(${hue}, 95%, 65%)`;
        ringRef.current.style.boxShadow = `0 0 18px hsl(${hue}, 95%, 60%), inset 0 0 8px hsl(${(hue + 40) % 360}, 95%, 65%)`;
      }
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
    window.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
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

      {/* Ҳалқа (эргашади, ранги айланади) */}
      <div
        ref={ringRef}
        className="absolute top-0 left-0"
        style={{
          width: 36,
          height: 36,
          marginLeft: -18,
          marginTop: -18,
          borderRadius: "50%",
          border: "2px solid #a78bfa",
          transition: "width .25s, height .25s, opacity .25s",
          willChange: "transform",
        }}
      />

      {/* Марказий нуқта (курсорда, ёрқин) */}
      <div
        ref={dotRef}
        className="absolute top-0 left-0"
        style={{ width: 9, height: 9, marginLeft: -4.5, marginTop: -4.5, borderRadius: "50%", willChange: "transform" }}
      />
    </div>
  );
}
