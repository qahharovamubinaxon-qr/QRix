"use client";

import Link from "next/link";
import { FiCheck } from "react-icons/fi";
import AuthMascot from "@/components/AuthMascot";

export default function AuthShell({
  accent,
  mascotColor,
  leftTitle,
  leftPoints,
  covering,
  heading,
  sub,
  children,
  footer,
}: {
  accent: string;
  mascotColor: string;
  leftTitle: string;
  leftPoints: string[];
  covering: boolean;
  heading: string;
  sub: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-14">
      <div className="qx-card w-full max-w-[920px] overflow-hidden grid grid-cols-1 md:grid-cols-2" style={{ padding: 0 }}>
        {/* ===== LEFT — branded mascot panel ===== */}
        <div
          className="relative flex flex-col items-center justify-center text-center px-8 py-10 md:py-12 overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${accent} 0%, ${shade(accent)} 100%)` }}
        >
          {/* dotted texture */}
          <div className="absolute inset-0 pointer-events-none" style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 80% 80% at 50% 40%, black 30%, transparent 100%)",
          }} />

          <div className="relative z-10 flex flex-col items-center">
            <span className="font-display text-[20px] font-extrabold mb-5 tracking-tight" style={{ color: "#fff" }}>
              QR<span style={{ color: "#161208" }}>ix</span>
            </span>

            <AuthMascot covering={covering} color={mascotColor} size={172} />

            {/* speech bubble */}
            <div className="relative mt-5 px-4 py-2.5 rounded-2xl max-w-[230px]" style={{ background: "rgba(0,0,0,0.28)", backdropFilter: "blur(6px)" }}>
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45" style={{ background: "rgba(0,0,0,0.28)" }} />
              <p className="text-[12.5px] font-semibold leading-snug" style={{ color: "#fff" }}>
                {covering ? "Don't worry — I'm not peeking at your password! 🙈" : leftTitle}
              </p>
            </div>

            <ul className="mt-6 space-y-2.5 text-left">
              {leftPoints.map((p) => (
                <li key={p} className="flex items-center gap-2.5 text-[13px] font-medium" style={{ color: "rgba(255,255,255,0.95)" }}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(255,255,255,0.25)" }}>
                    <FiCheck size={11} color="#fff" />
                  </span>
                  {p}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ===== RIGHT — form ===== */}
        <div className="px-7 py-9 md:px-9 flex flex-col justify-center">
          <div className="mb-6">
            <h1 className="font-display text-[24px] font-extrabold mb-1.5" style={{ color: "var(--text)" }}>{heading}</h1>
            <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{sub}</p>
          </div>
          {children}
          <div className="mt-6 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
            {footer}
          </div>
        </div>
      </div>

      <Link href="/" className="mt-5 text-[12px]" style={{ color: "var(--text-faint)" }}>← Back to home</Link>
    </main>
  );
}

/* darken a hex color for the gradient end */
function shade(hex: string): string {
  const m = hex.replace("#", "");
  const n = parseInt(m.length === 3 ? m.split("").map((c) => c + c).join("") : m, 16);
  const r = Math.max(0, ((n >> 16) & 255) - 46);
  const g = Math.max(0, ((n >> 8) & 255) - 46);
  const b = Math.max(0, (n & 255) - 46);
  return `rgb(${r},${g},${b})`;
}
