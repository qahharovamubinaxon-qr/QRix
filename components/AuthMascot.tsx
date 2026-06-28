"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   QRix Auth Mascot — a cute 2D character whose eyes follow the
   cursor, and who shyly covers its eyes when the user types a
   password ("I'm not looking at your secret!").
   ============================================================ */

export default function AuthMascot({
  covering,
  color = "#F58F20",
  size = 116,
}: {
  covering: boolean;
  color?: string;
  size?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  // eye tracking
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.46;
      const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(3.2, Math.hypot(e.clientX - cx, e.clientY - cy) / 45);
      setPupil({ x: Math.cos(ang) * dist, y: Math.sin(ang) * dist });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // occasional blink
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 150);
        loop();
      }, 2600 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  const dark = "#1c1c22";
  const eyesShut = blink || covering;

  return (
    <svg
      ref={ref}
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: "visible", display: "block" }}
    >
      {/* shadow */}
      <ellipse cx="60" cy="111" rx="30" ry="5" fill="rgba(0,0,0,0.18)" />

      {/* ears */}
      <circle cx="32" cy="26" r="12" fill={color} stroke={dark} strokeWidth="3" />
      <circle cx="88" cy="26" r="12" fill={color} stroke={dark} strokeWidth="3" />
      <circle cx="32" cy="26" r="5" fill={dark} opacity="0.45" />
      <circle cx="88" cy="26" r="5" fill={dark} opacity="0.45" />

      {/* body / head */}
      <circle cx="60" cy="62" r="40" fill={color} stroke={dark} strokeWidth="3.5" />
      {/* belly highlight */}
      <ellipse cx="60" cy="70" rx="26" ry="24" fill="#fff" opacity="0.14" />

      {/* eyes — white */}
      <g>
        <ellipse cx="46" cy="58" rx="11" ry="12" fill="#fff" stroke={dark} strokeWidth="2.5" />
        <ellipse cx="74" cy="58" rx="11" ry="12" fill="#fff" stroke={dark} strokeWidth="2.5" />

        {!eyesShut && (
          <>
            <circle cx={46 + pupil.x} cy={58 + pupil.y} r="4.6" fill={dark} />
            <circle cx={74 + pupil.x} cy={58 + pupil.y} r="4.6" fill={dark} />
            <circle cx={46 + pupil.x + 1.4} cy={58 + pupil.y - 1.6} r="1.5" fill="#fff" />
            <circle cx={74 + pupil.x + 1.4} cy={58 + pupil.y - 1.6} r="1.5" fill="#fff" />
          </>
        )}
        {eyesShut && (
          <>
            <path d="M38 58 Q46 63 54 58" stroke={dark} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M66 58 Q74 63 82 58" stroke={dark} strokeWidth="2.6" fill="none" strokeLinecap="round" />
          </>
        )}
      </g>

      {/* cheeks */}
      <circle cx="34" cy="72" r="4.5" fill="#ff7a7a" opacity="0.5" />
      <circle cx="86" cy="72" r="4.5" fill="#ff7a7a" opacity="0.5" />

      {/* nose + mouth */}
      <ellipse cx="60" cy="72" rx="3" ry="2" fill={dark} />
      {covering ? (
        <ellipse cx="60" cy="80" rx="3.4" ry="4" fill={dark} />
      ) : (
        <path d="M53 78 Q60 84 67 78" stroke={dark} strokeWidth="2.4" fill="none" strokeLinecap="round" />
      )}

      {/* paws — slide up to cover the eyes when `covering` */}
      <g
        style={{
          transform: covering ? "translate(8px,-34px)" : "translate(0,0)",
          transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <ellipse cx="30" cy="92" rx="11" ry="9" fill={color} stroke={dark} strokeWidth="3" />
      </g>
      <g
        style={{
          transform: covering ? "translate(-8px,-34px)" : "translate(0,0)",
          transition: "transform .35s cubic-bezier(.34,1.56,.64,1)",
        }}
      >
        <ellipse cx="90" cy="92" rx="11" ry="9" fill={color} stroke={dark} strokeWidth="3" />
      </g>
    </svg>
  );
}
