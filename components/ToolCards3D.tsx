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
          /* white text reads well on all the saturated tool colors */
          --card-label: #ffffff;
          --card-desc: rgba(255,255,255,.82);
        }

        .qx-mq-stage { display: flex; flex-direction: column; gap: 20px; perspective: 2000px; }
        .qx-mq-row { width: 100%; }
        .qx-mq-rowtitle {
          font-weight: 800; font-size: 13px; letter-spacing: .08em;
          text-transform: uppercase; color: var(--text-muted);
          margin: 0 0 10px 4px; text-align: left;
        }

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
          transition: box-shadow .3s ease;
          will-change: transform, opacity;
          background: var(--c1);
          border: 2px solid rgba(0,0,0,0.18);
          box-shadow: 0 6px 0 0 rgba(0,0,0,.2), 0 14px 28px rgba(0,0,0,.28);
          overflow: hidden;
          isolation: isolate;
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
          background: #18181f;
          box-shadow: inset 0 1px 0 rgba(255,255,255,.05);
        }
        .qx-mqcard-icon-halo { display: none; }
        .qx-mqcard-icon {
          position: relative; z-index: 1;
          width: 50px; height: 50px;
          border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          background: var(--cgrad);
          box-shadow: 0 6px 18px rgba(0,0,0,.5);
        }
        .qx-mqcard-body { display: flex; flex-direction: column; gap: 4px; }
        .qx-mqcard-label {
          display: block;
          font-family: var(--font-display), "Poppins", sans-serif;
          font-size: 15px; font-weight: 800; line-height: 1.08;
          text-transform: uppercase; letter-spacing: -.005em;
          color: var(--card-label);
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

        /* HOVER — chunky lift */
        .qx-mqcard:hover, .qx-mqcard:focus-visible {
          transform: translateZ(80px) translateY(-10px) scale(1.06);
          box-shadow: 0 12px 0 0 rgba(0,0,0,.2), 0 28px 50px rgba(0,0,0,.4);
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
