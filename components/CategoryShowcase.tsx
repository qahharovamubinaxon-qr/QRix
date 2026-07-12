"use client";

/* Homepage — ALL TOOLS as a 3D interactive timeline (Mission 50).
   Archetype: dhiluxui's 3d-interactive-timeline on 21st.dev (vertical spine,
   alternating cards, pulsing nodes, 3D hover tilt) — re-authored for QRix:
   the spine burns ORANGE and fills with scroll progress, every card is dark
   glass with an orange NEON glow chasing its border, nodes pulse as they
   enter, cards tilt in 3D under the cursor. All tool links stay real. */

import Link from "next/link";
import { useEffect, useRef } from "react";
import { FiArrowRight } from "react-icons/fi";

type Cat = {
  name: string; count: string; color: string; href: string; emoji: string;
  copy: string;
  tools: { label: string; href: string }[];
};

const CATS: Cat[] = [
  {
    name: "QR Tools", count: "30+", color: "#22c55e", href: "/qr-tools", emoji: "🔳",
    copy: "Dynamic codes with live analytics, PIN protection and full design control.",
    tools: [
      { label: "URL QR", href: "/url-qr" },
      { label: "WiFi QR", href: "/qr-tools/wifi" },
      { label: "vCard QR", href: "/qr-tools/vcard" },
      { label: "Bulk CSV", href: "/bulk-qr" },
      { label: "Scanner", href: "/scanner" },
    ],
  },
  {
    name: "PDF Tools", count: "24+", color: "#60a5fa", href: "/pdf-tools", emoji: "📄",
    copy: "Merge, compress, convert and OCR — right in the browser.",
    tools: [
      { label: "Merge", href: "/pdf-tools/merge" },
      { label: "Compress", href: "/pdf-tools/compress" },
      { label: "PDF to Word", href: "/pdf-tools/pdf-to-word" },
      { label: "Split", href: "/pdf-tools/split" },
      { label: "OCR", href: "/pdf-tools/ocr" },
    ],
  },
  {
    name: "Image Tools", count: "70+", color: "#c084fc", href: "/image-tools", emoji: "🖼️",
    copy: "Cut, compress and perfect any picture — nothing leaves your device.",
    tools: [
      { label: "Remove BG", href: "/image-tools/remove-bg" },
      { label: "Compress", href: "/image-tools/compress" },
      { label: "Crop", href: "/image-tools/crop-image" },
      { label: "Watermark", href: "/image-tools/watermark-image" },
    ],
  },
  {
    name: "AI Tools", count: "28+", color: "#fbbf24", href: "/ai-tools", emoji: "✨",
    copy: "Upscale, colorize, generate — AI working on your files.",
    tools: [
      { label: "Upscaler", href: "/ai-tools/image-upscaler" },
      { label: "AI Remove BG", href: "/ai-tools/background-remover" },
      { label: "Logo Maker", href: "/ai-tools/logo-generator" },
      { label: "Colorize", href: "/ai-tools/colorize-photo" },
    ],
  },
  {
    name: "Video Tools", count: "29+", color: "#f472b6", href: "/video-tools", emoji: "🎬",
    copy: "Trim, compress, GIF — no upload, no watermark.",
    tools: [
      { label: "Compress", href: "/video-tools/compress-video" },
      { label: "Trim", href: "/video-tools/trim-video" },
      { label: "GIF Maker", href: "/video-tools/create-gif" },
      { label: "Merge", href: "/video-tools/merge-videos" },
    ],
  },
  {
    name: "3D Tools", count: "New", color: "#22d3ee", href: "/3d-tools", emoji: "🧊",
    copy: "Turn a photo into a textured, export-ready 3D model.",
    tools: [
      { label: "Image to 3D", href: "/3d-tools/image-to-3d" },
      { label: "GLB · OBJ · STL", href: "/3d-tools/image-to-3d" },
    ],
  },
];

export default function CategoryShowcase() {
  const spineRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* the orange spine fills as the section scrolls through the viewport */
  useEffect(() => {
    const wrap = wrapRef.current, fill = spineRef.current;
    if (!wrap || !fill) return;
    let raf = 0;
    const tick = () => {
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.8 - r.top) / (r.height + vh * 0.3)));
      fill.style.height = `${(p * 100).toFixed(2)}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  /* 3D tilt under the cursor (per card) */
  const onTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const rx = ((e.clientY - r.top) / r.height - 0.5) * -7;
    const ry = ((e.clientX - r.left) / r.width - 0.5) * 9;
    el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
  };
  const offTilt = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  };

  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20 lg:pb-24" aria-label="All tools">
      <div className="mb-10 lg:mb-14 text-center" data-reveal>
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
          185+ free tools
        </p>
        <h2 className="font-display font-extrabold tracking-tight leading-[1.05]"
          style={{ color: "var(--text)", fontSize: "clamp(28px, 3.6vw, 46px)" }}>
          All tools
        </h2>
      </div>

      <div className="qx-tl" ref={wrapRef}>
        {/* the orange spine + scroll fill */}
        <div className="qx-tl-spine" aria-hidden>
          <div className="qx-tl-fill" ref={spineRef} />
        </div>

        {CATS.map((cat, i) => {
          const left = i % 2 === 0;
          return (
            <div key={cat.name} className={`qx-tl-row${left ? " is-left" : ""}`}>
              {/* pulsing node on the spine */}
              <span className="qx-tl-node" aria-hidden><i /></span>

              <div className="qx-tl-slot" data-reveal={left ? "left" : "right"}
                style={{ ["--tl" as string]: cat.color, ["--rv-delay" as string]: `${(i % 2) * 60}ms` } as React.CSSProperties}>
                <div className="qx-tl-card" onMouseMove={onTilt} onMouseLeave={offTilt}>
                  <span className="qx-tl-neon" aria-hidden />
                  <div className="qx-tl-in">
                    <div className="qx-tl-top">
                      <span className="qx-tl-ico" aria-hidden>{cat.emoji}</span>
                      <span className="qx-mono qx-tl-idx">0{i + 1}</span>
                      <span className="qx-mono qx-tl-count">{cat.count} TOOLS</span>
                    </div>
                    <h3 className="qx-tl-name">{cat.name}</h3>
                    <p className="qx-tl-copy">{cat.copy}</p>
                    <div className="qx-tl-chips">
                      {cat.tools.map((tool) => (
                        <Link key={tool.label} href={tool.href} className="qx-tl-chip">{tool.label}</Link>
                      ))}
                    </div>
                    <Link href={cat.href} className="qx-tl-all">
                      All {cat.name.toLowerCase()} <FiArrowRight size={12} aria-hidden />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @property --qx-ang {
          syntax: "<angle>"; initial-value: 0deg; inherits: false;
        }

        .qx-tl { position: relative; }

        /* central orange spine, glowing, filled by scroll.
           It overruns the section's bottom padding (pb-20/lg:pb-24) so it
           meets the QRIX IN NUMBERS wire in the next section seamlessly. */
        .qx-tl-spine {
          position: absolute; top: 0; bottom: -5rem; left: 50%;
          width: 3px; transform: translateX(-50%);
          background: rgba(255, 106, 19, 0.16);
          border-radius: 3px;
        }
        @media (min-width: 1024px) { .qx-tl-spine { bottom: -6rem; } }
        .qx-tl-fill {
          width: 100%; height: 0%;
          background: linear-gradient(180deg, #ffb27a 0%, #ff6a13 55%, #e14e08 100%);
          border-radius: 3px;
          box-shadow: 0 0 14px rgba(255, 106, 19, 0.8), 0 0 34px rgba(255, 106, 19, 0.35);
        }

        .qx-tl-row {
          position: relative;
          display: grid; grid-template-columns: 1fr 72px 1fr;
          padding: 22px 0;
        }
        .qx-tl-slot { grid-column: 3; perspective: 900px; }
        .qx-tl-row.is-left .qx-tl-slot { grid-column: 1; justify-self: end; }
        .qx-tl-slot { width: min(100%, 520px); }

        /* pulsing node */
        .qx-tl-node {
          position: absolute; left: 50%; top: 54px;
          transform: translateX(-50%); z-index: 2;
        }
        .qx-tl-node i {
          display: block; width: 14px; height: 14px; border-radius: 50%;
          background: #ff6a13; border: 3px solid #2a1206;
          box-shadow: 0 0 12px rgba(255, 106, 19, 0.9);
          animation: qxNodePulse 2.6s ease-in-out infinite;
        }
        @keyframes qxNodePulse {
          0%, 100% { box-shadow: 0 0 10px rgba(255, 106, 19, 0.8), 0 0 0 0 rgba(255, 106, 19, 0.4); }
          50%      { box-shadow: 0 0 16px rgba(255, 106, 19, 1), 0 0 0 9px rgba(255, 106, 19, 0); }
        }

        /* card: dark glass + neon chase around the border */
        .qx-tl-card {
          position: relative; border-radius: 22px;
          transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1);
          transform-style: preserve-3d; will-change: transform;
        }
        .qx-tl-neon {
          position: absolute; inset: -1.5px; border-radius: 23px;
          padding: 1.5px; pointer-events: none;
          background: conic-gradient(from var(--qx-ang),
            transparent 0%, transparent 72%,
            rgba(255, 106, 19, 0.55) 82%,
            #ff6a13 88%, #ffc9a3 92%,
            rgba(255, 106, 19, 0.55) 96%, transparent 100%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
          mask-composite: exclude;
          animation: qxNeonChase 4.5s linear infinite;
          filter: drop-shadow(0 0 6px rgba(255, 106, 19, 0.7));
        }
        @keyframes qxNeonChase { to { --qx-ang: 360deg; } }

        .qx-tl-in {
          position: relative; border-radius: 22px; overflow: hidden;
          padding: 22px 24px 18px;
          background:
            radial-gradient(120% 90% at 85% -10%, color-mix(in srgb, var(--tl) 13%, transparent) 0%, transparent 55%),
            rgba(20, 12, 8, 0.66);
          backdrop-filter: var(--glass-blur);
          border: 1px solid rgba(255, 140, 80, 0.16);
        }
        html.light .qx-tl-in {
          background:
            radial-gradient(120% 90% at 85% -10%, color-mix(in srgb, var(--tl) 10%, transparent) 0%, transparent 55%),
            rgba(255, 255, 255, 0.82);
          border-color: rgba(0, 0, 0, 0.09);
        }

        .qx-tl-top { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .qx-tl-ico {
          width: 36px; height: 36px; border-radius: 11px;
          display: grid; place-items: center; font-size: 18px;
          background: color-mix(in srgb, var(--tl) 18%, transparent);
          border: 1px solid color-mix(in srgb, var(--tl) 30%, transparent);
        }
        .qx-tl-idx { font-size: 11px; letter-spacing: 0.2em; color: var(--text-faint); }
        .qx-tl-count {
          margin-left: auto;
          font-size: 9.5px; letter-spacing: 0.2em; padding: 5px 10px;
          border-radius: 99px; color: var(--tl);
          border: 1px solid color-mix(in srgb, var(--tl) 35%, transparent);
          background: color-mix(in srgb, var(--tl) 10%, transparent);
        }
        .qx-tl-name {
          font-family: "Unbounded", var(--font-display), sans-serif;
          font-weight: 800; font-size: 19px; letter-spacing: -0.01em;
          color: var(--text); line-height: 1.15;
        }
        .qx-tl-copy { margin-top: 6px; font-size: 12.5px; line-height: 1.6; color: var(--text-muted); }

        .qx-tl-chips { margin-top: 13px; display: flex; flex-wrap: wrap; gap: 6px; }
        .qx-tl-chip {
          font-size: 11.5px; font-weight: 600; text-decoration: none;
          padding: 5px 11px; border-radius: 99px; color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .qx-tl-chip:hover {
          color: var(--text);
          border-color: color-mix(in srgb, var(--tl) 50%, transparent);
          background: color-mix(in srgb, var(--tl) 12%, transparent);
        }
        html.light .qx-tl-chip { border-color: rgba(0, 0, 0, 0.1); background: rgba(0, 0, 0, 0.03); }

        .qx-tl-all {
          margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 700; color: var(--tl); text-decoration: none;
          opacity: 0.85; transition: opacity 0.25s, gap 0.25s;
        }
        .qx-tl-all:hover { opacity: 1; gap: 10px; }

        /* spine hugs the left edge on small screens */
        @media (max-width: 900px) {
          .qx-tl-spine { left: 14px; transform: none; }
          .qx-tl-node { left: 14px; transform: translateX(-50%); }
          .qx-tl-row { grid-template-columns: 40px 1fr; padding: 14px 0; }
          .qx-tl-slot, .qx-tl-row.is-left .qx-tl-slot { grid-column: 2; justify-self: stretch; width: 100%; }
        }
        @media (prefers-reduced-motion: reduce) {
          .qx-tl-neon, .qx-tl-node i { animation: none; }
          .qx-tl-card { transition: none; }
        }
      `}</style>
    </section>
  );
}
