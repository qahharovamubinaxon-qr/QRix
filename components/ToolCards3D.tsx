"use client";

import Link from "next/link";
import type { ReactNode } from "react";

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
  return (
    <div className="qx-mq-wrap">
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
          --card-label: #ffffff;
          --card-desc: rgba(235,235,245,.58);
        }
        html.light .qx-mq-wrap {
          --card-label: #15151c;
          --card-desc: rgba(40,40,60,.60);
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
          padding: 30px 0;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
                  mask-image: linear-gradient(to right, transparent, #000 6%, #000 94%, transparent);
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

        /* ===== Clean 3D card ===== */
        .qx-mqcard {
          flex: 0 0 auto;
          width: 165px; height: 210px;
          border-radius: 18px;
          padding: 16px 14px 14px;
          position: relative;
          display: flex; flex-direction: column; justify-content: space-between;
          text-decoration: none;
          transform-style: preserve-3d;
          transform: translateZ(0) scale(1);
          transition: transform .45s cubic-bezier(.22,.9,.3,1.1), box-shadow .45s ease, border-color .25s;
          background: #161616;
          border: 1px solid rgba(255,255,255,0.07);
          box-shadow: 0 4px 16px rgba(0,0,0,.4);
          overflow: hidden;
          isolation: isolate;
        }
        .qx-mqcard::before { display: none; }
        /* subtle gloss sheen */
        .qx-mqcard::after {
          content: ""; position: absolute; inset: 0; z-index: 0;
          background: linear-gradient(135deg, rgba(255,255,255,.04), transparent 50%);
          pointer-events: none;
        }
        .qx-mqcard > * { position: relative; z-index: 1; }

        /* top subtle glow — very muted */
        .qx-mqcard-glow {
          position: absolute; z-index: 0;
          top: -60%; left: -20%; right: -20%; height: 80%;
          background: radial-gradient(58% 70% at 50% 0%, rgba(245,143,32,0.12), transparent 75%);
          opacity: .6; pointer-events: none;
          transition: opacity .45s ease;
        }

        /* icon wrap with halo */
        .qx-mqcard-icon-wrap {
          position: relative;
          display: inline-flex;
          align-items: center; justify-content: center;
          width: 46px; height: 46px;
          z-index: 1;
        }
        .qx-mqcard-icon-halo {
          position: absolute; inset: -6px;
          border-radius: 16px;
          background: var(--cgrad);
          filter: blur(12px);
          opacity: .5;
        }
        .qx-mqcard-icon {
          position: relative; z-index: 1;
          width: 46px; height: 46px;
          border-radius: 13px;
          display: flex; align-items: center; justify-content: center;
          color: #fff;
          background: var(--cgrad);
          box-shadow: 0 6px 20px rgba(0,0,0,.45);
        }
        .qx-mqcard-body { display: flex; flex-direction: column; gap: 5px; }
        .qx-mqcard-label {
          display: block; font-size: 15px; font-weight: 900; line-height: 1.1;
          color: var(--card-label);
          text-shadow: 0 1px 10px rgba(0,0,0,.4);
          letter-spacing: -.01em;
        }
        .qx-mqcard-desc {
          display: block; font-size: 12px; line-height: 1.35;
          color: var(--card-desc);
        }
        .qx-mqcard-badge {
          position: absolute; top: 13px; right: 13px; z-index: 3;
          font-size: 9px; font-weight: 800; letter-spacing: .04em; color: #0c0c0c;
          background: #F58F20;
          padding: 3px 8px; border-radius: 8px;
          box-shadow: 0 2px 6px rgba(0,0,0,.3);
        }

        /* HOVER — lift forward, tangerine shadow */
        .qx-mqcard:hover, .qx-mqcard:focus-visible {
          transform: translateZ(100px) translateY(-12px) scale(1.08);
          box-shadow:
            0 30px 60px rgba(0,0,0,.5),
            0 0 30px rgba(245,143,32,0.15);
          border-color: rgba(245,143,32,0.3);
          z-index: 6; outline: none;
        }
        .qx-mqcard:hover .qx-mqcard-glow,
        .qx-mqcard:focus-visible .qx-mqcard-glow { opacity: 1; }

        /* light theme overrides */
        html.light .qx-mqcard {
          background: #ffffff;
          border-color: rgba(0,0,0,0.08);
          box-shadow: 0 2px 12px rgba(0,0,0,.08);
        }
        html.light .qx-mqcard:hover {
          border-color: rgba(245,143,32,0.4);
          box-shadow: 0 20px 50px rgba(0,0,0,.12), 0 0 20px rgba(245,143,32,0.12);
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
