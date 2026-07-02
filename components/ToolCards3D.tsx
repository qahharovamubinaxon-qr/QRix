"use client";

import Link from "next/link";
import { useEffect, useRef, type ReactNode } from "react";

/* ============================================================
   QRix — Premium 3D floating card marquee rows
   Auto-scroll marquee with 3D hover effects and glow borders.
   Row 1 (QR tools): right-to-left
   Row 2 (PDF tools): left-to-right
   Row 3 (Image tools): right-to-left
   Hover: card lifts toward viewer with deep shadow + color glow.
   ============================================================ */

export type CardItem = {
  href: string;
  label: string;
  desc: string;
  grad: string;
  icon?: ReactNode;
  emoji?: string;
  badge?: string;
};

export type CardRow = {
  title?: string;
  items: CardItem[];
};

function firstHex(grad: string): string {
  const m = grad.match(/#[0-9a-fA-F]{3,8}/g);
  return m && m.length ? m[0] : "#6366f1";
}

export default function ToolCards3D({ rows, heading }: { rows: CardRow[]; heading?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  // Coverflow: each card scales / rotates / fades by its distance from the
  // centre of its row, so the middle card pops forward while the side cards
  // recede in 3D — while the row keeps auto-scrolling.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const viewports = Array.from(wrap.querySelectorAll<HTMLElement>(".qx-mq-viewport"));
    const cardsByVp = viewports.map((vp) => Array.from(vp.querySelectorAll<HTMLElement>(".qx-mqcard")));
    let raf = 0;

    const loop = () => {
      for (let v = 0; v < viewports.length; v++) {
        const r = viewports[v].getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const half = r.width / 2 || 1;
        for (const card of cardsByVp[v]) {
          const cr = card.getBoundingClientRect();
          if (cr.right < r.left - 80 || cr.left > r.right + 80) continue; // offscreen
          let dx = (cr.left + cr.width / 2 - cx) / half;
          dx = Math.max(-1, Math.min(1, dx));
          const abs = Math.abs(dx);
          const scale = 1.06 - abs * 0.36;
          const ry = dx * -34;
          const tz = -abs * 150;
          card.style.transform = `translateZ(${tz.toFixed(1)}px) rotateY(${ry.toFixed(1)}deg) scale(${scale.toFixed(3)})`;
          card.style.opacity = (1 - abs * 0.5).toFixed(2);
          card.style.zIndex = String(Math.round((1 - abs) * 100));
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [rows]);

  return (
    <div className="qx-mq-wrap" ref={wrapRef}>
      {heading && (
        <h2 className="font-display text-2xl lg:text-3xl font-extrabold mb-8 text-center" style={{ color: "var(--text)" }}>
          {heading}
        </h2>
      )}

      <div className="qx-mq-stage">
        {/* 3D animated backdrop: receding neon grid + drifting orb */}
        <div className="qx-mq-3dbg" aria-hidden="true" />
        {rows.map((row, ri) => {
          const dir = ri % 2 === 1 ? "right" : "left";
          const approxW = 178;
          const reps = Math.max(2, Math.ceil(1800 / (row.items.length * approxW)));
          const base = Array.from({ length: reps }).flatMap(() => row.items);
          const doubled = [...base, ...base];
          const dur = Math.max(35, base.length * 5);
          return (
            <section key={ri} className="qx-mq-row" aria-label={row.title}>
              {row.title && <h3 className="qx-mq-rowtitle">{row.title}</h3>}
              <div className="qx-mq-viewport">
                <div className={`qx-mq-track qx-mq-${dir}`} style={{ animationDuration: `${dur}s` }}>
                  {doubled.map((it, i) => (
                    <Link
                      key={`${ri}-${i}-${it.label}`}
                      href={it.href}
                      className="qx-mqcard"
                      style={{
                        ["--cgrad" as string]: it.grad,
                        ["--c1" as string]: firstHex(it.grad),
                      }}
                      aria-hidden={i >= base.length ? true : undefined}
                      tabIndex={i >= base.length ? -1 : undefined}
                    >
                      {it.badge && <span className="qx-mqcard-badge">{it.badge}</span>}
                      {/* top glow */}
                      <span className="qx-mqcard-glow" />
                      {/* icon with halo */}
                      <span className="qx-mqcard-icon-wrap">
                        <span className="qx-mqcard-icon-halo" />
                        <span className="qx-mqcard-icon">
                          {it.icon ?? <span style={{ fontSize: 20 }}>{it.emoji}</span>}
                        </span>
                      </span>
                      <span className="qx-mqcard-body">
                        <span className="qx-mqcard-label">{it.label}</span>
                        <span className="qx-mqcard-desc">{it.desc}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      <style>{`
        .qx-mq-wrap {
          width: 100%;
          --card-label: #ffffff;
          --card-desc: rgba(235,238,245,.78);
        }
        html.light .qx-mq-wrap {
          --card-label: #14141c;
          --card-desc: rgba(30,30,45,.62);
        }

        .qx-mq-stage { display: flex; flex-direction: column; gap: 20px; perspective: 1400px; position: relative; }
        .qx-mq-row { width: 100%; }
        .qx-mq-rowtitle {
          font-weight: 800; font-size: 13px; letter-spacing: .08em;
          text-transform: uppercase; color: var(--text-muted);
          margin: 0 0 10px 4px; text-align: left;
          display: flex; align-items: center; gap: 8px;
        }
        .qx-mq-rowtitle::before {
          content: ""; width: 22px; height: 3px; border-radius: 99px;
          background: linear-gradient(90deg, #F58F20, #7c3aed);
          box-shadow: 0 0 10px rgba(245,143,32,.6);
        }

        /* ===== 3D animated backdrop ===== */
        .qx-mq-3dbg { position: absolute; inset: -50px -6%; z-index: -1; overflow: hidden; pointer-events: none; }
        .qx-mq-3dbg::before {
          content: ""; position: absolute; left: -20%; right: -20%; top: 40%; bottom: -35%;
          background-image:
            linear-gradient(rgba(245,143,32,0.14) 1px, transparent 1px),
            linear-gradient(90deg, rgba(124,58,237,0.14) 1px, transparent 1px);
          background-size: 52px 52px;
          transform: perspective(650px) rotateX(62deg);
          transform-origin: top center;
          animation: qxGridMove 4s linear infinite;
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 75%, transparent);
                  mask-image: linear-gradient(to bottom, transparent, black 30%, black 75%, transparent);
        }
        .qx-mq-3dbg::after {
          content: ""; position: absolute; width: 460px; height: 460px; left: 4%; top: -10%;
          background: radial-gradient(circle, rgba(124,58,237,0.20), rgba(34,211,238,0.10) 45%, transparent 68%);
          filter: blur(12px);
          animation: qxOrbDrift 13s ease-in-out infinite alternate;
        }
        @keyframes qxGridMove { from { background-position: 0 0, 0 0; } to { background-position: 0 52px, 0 0; } }
        @keyframes qxOrbDrift { from { transform: translate(0,0) scale(1); } to { transform: translate(55vw, 40px) scale(1.15); } }
        html.light .qx-mq-3dbg::before { opacity: .55; }
        html.light .qx-mq-3dbg::after { opacity: .5; }

        .qx-mq-viewport {
          overflow: hidden;
          padding: 38px 0;
          perspective: 1100px;
          perspective-origin: center center;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
                  mask-image: linear-gradient(to right, transparent, #000 8%, #000 92%, transparent);
        }
        .qx-mq-track {
          display: flex;
          gap: 16px;
          width: max-content;
          transform-style: preserve-3d;
          will-change: transform;
        }
        .qx-mq-left  { animation: qxMqLeft  linear infinite; }
        .qx-mq-right { animation: qxMqRight linear infinite; }
        .qx-mq-track:hover, .qx-mq-track:focus-within { animation-play-state: paused; }
        @keyframes qxMqLeft  { from { transform: translateX(0); }    to { transform: translateX(-50%); } }
        @keyframes qxMqRight { from { transform: translateX(-50%); } to { transform: translateX(0); } }

        /* ===== Fireship-style solid color card ===== */
        .qx-mqcard {
          flex: 0 0 auto;
          width: 172px; height: 218px;
          border-radius: 20px;
          padding: 14px;
          position: relative;
          display: flex; flex-direction: column; gap: 12px;
          text-decoration: none;
          transform-style: preserve-3d;
          transform: translateZ(0) scale(1);
          transition: transform .4s cubic-bezier(.22,.9,.3,1.1), box-shadow .3s ease, border-color .3s ease;
          will-change: transform, opacity;
          background: linear-gradient(160deg, rgba(255,255,255,0.10), rgba(18,18,26,0.55));
          backdrop-filter: blur(14px) saturate(150%);
          -webkit-backdrop-filter: blur(14px) saturate(150%);
          border: 1.5px solid var(--c1);
          box-shadow:
            0 0 18px -3px var(--c1),
            0 0 46px -14px var(--c1),
            0 12px 30px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.12);
          overflow: hidden;
          isolation: isolate;
        }
        html.light .qx-mqcard {
          background: linear-gradient(160deg, rgba(255,255,255,0.85), rgba(245,245,250,0.6));
        }
        .qx-mqcard::before { display: none; }
        /* subtle top gloss */
        .qx-mqcard::after {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(160deg, rgba(255,255,255,.18), transparent 42%);
          pointer-events: none;
        }
        .qx-mqcard > * { position: relative; z-index: 1; }
        .qx-mqcard-glow { display: none; }

        /* dark logo panel holding the icon */
        .qx-mqcard-icon-wrap {
          position: relative;
          display: flex;
          align-items: center; justify-content: center;
          width: 100%; height: 96px;
          border-radius: 13px;
          background: rgba(10,10,16,0.55);
          border: 1px solid color-mix(in srgb, var(--c1) 35%, transparent);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.06), inset 0 0 22px -6px var(--c1);
        }
        .qx-mqcard-icon-halo { display: none; }
        .qx-mqcard-icon {
          position: relative; z-index: 1;
          width: 50px; height: 50px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          background: var(--cgrad);
          box-shadow: 0 0 16px -2px var(--c1), 0 6px 18px rgba(0,0,0,.5);
        }
        .qx-mqcard-body { display: flex; flex-direction: column; gap: 4px; }
        .qx-mqcard-label {
          display: block;
          font-family: var(--font-display), "Poppins", sans-serif;
          font-size: 15px; font-weight: 800; line-height: 1.08;
          text-transform: uppercase; letter-spacing: -.005em;
          color: var(--card-label);
          text-shadow: 0 0 14px color-mix(in srgb, var(--c1) 45%, transparent);
        }
        .qx-mqcard-desc {
          display: block; font-size: 11.5px; line-height: 1.3; font-weight: 600;
          color: var(--card-desc);
        }
        .qx-mqcard-badge {
          position: absolute; top: 12px; right: 12px; z-index: 3;
          font-size: 9px; font-weight: 800; letter-spacing: .04em; color: #fff;
          background: #161208;
          padding: 3px 9px; border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,.3);
        }

        /* HOVER — 3D pop toward the viewer + brighter neon */
        .qx-mqcard:hover, .qx-mqcard:focus-visible {
          transform: translateZ(70px) translateY(-10px) scale(1.05);
          border-color: var(--c1);
          box-shadow:
            0 0 26px -2px var(--c1),
            0 0 64px -12px var(--c1),
            0 28px 50px rgba(0,0,0,0.5),
            inset 0 1px 0 rgba(255,255,255,0.14);
          z-index: 6; outline: none;
        }

        @media (prefers-reduced-motion: reduce) {
          .qx-mq-left, .qx-mq-right { animation: none; }
          .qx-mq-viewport { overflow-x: auto; }
        }
        @media (max-width: 640px) {
          .qx-mqcard { width: 138px; height: 175px; }
          .qx-mqcard-label { font-size: 13px; }
        }
      `}</style>
    </div>
  );
}
