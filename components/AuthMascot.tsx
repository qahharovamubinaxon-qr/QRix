"use client";

import { useEffect, useId, useRef, useState } from "react";

/* ============================================================
   QRix Auth Mascot — a polished 2D character whose eyes follow
   the cursor, and who shyly covers its eyes while the user types
   a password. Gentle idle float for life.
   ============================================================ */

export default function AuthMascot({
  covering,
  color = "#F58F20",
  size = 168,
}: {
  covering: boolean;
  color?: string;
  size?: number;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const uid = useId().replace(/:/g, "");
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height * 0.46;
      const ang = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(3.6, Math.hypot(e.clientX - cx, e.clientY - cy) / 50);
      setPupil({ x: Math.cos(ang) * dist, y: Math.sin(ang) * dist });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const loop = () => {
      t = setTimeout(() => {
        setBlink(true);
        setTimeout(() => setBlink(false), 140);
        loop();
      }, 2800 + Math.random() * 2600);
    };
    loop();
    return () => clearTimeout(t);
  }, []);

  const ink = "#15151c";
  const shut = blink || covering;

  return (
    <div style={{ animation: "qxMascotFloat 4s ease-in-out infinite" }}>
      <style>{`@keyframes qxMascotFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}`}</style>
      <svg
        ref={ref}
        width={size}
        height={size}
        viewBox="0 0 140 140"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible", display: "block" }}
      >
        <defs>
          <radialGradient id={`body${uid}`} cx="42%" cy="34%" r="75%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="38%" stopColor={color} />
            <stop offset="100%" stopColor={color} />
          </radialGradient>
          <linearGradient id={`shade${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.16" />
          </linearGradient>
        </defs>

        {/* shadow */}
        <ellipse cx="70" cy="130" rx="34" ry="6" fill="rgba(0,0,0,0.16)" />

        {/* ears */}
        <circle cx="40" cy="30" r="13" fill={color} stroke={ink} strokeWidth="3.5" />
        <circle cx="100" cy="30" r="13" fill={color} stroke={ink} strokeWidth="3.5" />
        <circle cx="40" cy="30" r="5.5" fill={ink} opacity="0.4" />
        <circle cx="100" cy="30" r="5.5" fill={ink} opacity="0.4" />

        {/* head/body */}
        <circle cx="70" cy="72" r="46" fill={`url(#body${uid})`} stroke={ink} strokeWidth="4" />
        <circle cx="70" cy="72" r="46" fill={`url(#shade${uid})`} />

        {/* eyes — white glossy */}
        <ellipse cx="53" cy="66" rx="13" ry="14" fill="#fff" stroke={ink} strokeWidth="2.5" />
        <ellipse cx="87" cy="66" rx="13" ry="14" fill="#fff" stroke={ink} strokeWidth="2.5" />

        {!shut && (
          <>
            <circle cx={53 + pupil.x} cy={66 + pupil.y} r="5.4" fill={ink} />
            <circle cx={87 + pupil.x} cy={66 + pupil.y} r="5.4" fill={ink} />
            <circle cx={53 + pupil.x + 1.8} cy={66 + pupil.y - 2} r="1.9" fill="#fff" />
            <circle cx={87 + pupil.x + 1.8} cy={66 + pupil.y - 2} r="1.9" fill="#fff" />
          </>
        )}
        {shut && (
          <>
            <path d="M44 66 Q53 72 62 66" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M78 66 Q87 72 96 66" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          </>
        )}

        {/* cheeks */}
        <circle cx="40" cy="82" r="5" fill="#ff8585" opacity="0.45" />
        <circle cx="100" cy="82" r="5" fill="#ff8585" opacity="0.45" />

        {/* nose + mouth */}
        <ellipse cx="70" cy="83" rx="3.4" ry="2.3" fill={ink} />
        {covering ? (
          <ellipse cx="70" cy="92" rx="3.8" ry="4.6" fill={ink} />
        ) : (
          <path d="M61 90 Q70 97 79 90" stroke={ink} strokeWidth="2.6" fill="none" strokeLinecap="round" />
        )}

        {/* paws — slide up to cover eyes when covering */}
        <g style={{ transform: covering ? "translate(10px,-40px)" : "translate(0,0)", transition: "transform .38s cubic-bezier(.34,1.56,.64,1)" }}>
          <ellipse cx="36" cy="106" rx="13" ry="10.5" fill={color} stroke={ink} strokeWidth="3.5" />
        </g>
        <g style={{ transform: covering ? "translate(-10px,-40px)" : "translate(0,0)", transition: "transform .38s cubic-bezier(.34,1.56,.64,1)" }}>
          <ellipse cx="104" cy="106" rx="13" ry="10.5" fill={color} stroke={ink} strokeWidth="3.5" />
        </g>
      </svg>
    </div>
  );
}
