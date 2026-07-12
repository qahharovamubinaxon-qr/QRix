"use client";

/* Homepage — ALL TOOLS as an interactive scrolling story (Mission 53).
   Archetype: thanh's interactive-scrolling-story on 21st.dev — a pinned
   split screen where scrolling advances chapters: text fades/slides on the
   left, the visual slides in on the right. Re-authored for QRix: six tool
   chapters + a "QRix in numbers" finale, orange progress rail, category
   color washes, every link real. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FiArrowRight, FiShield } from "react-icons/fi";

type Chapter = {
  kind: "cat";
  name: string; count: string; color: string; href: string; emoji: string;
  copy: string;
  tools: { label: string; href: string }[];
} | {
  kind: "stats";
  name: string; color: string;
};

const CHAPTERS: Chapter[] = [
  {
    kind: "cat", name: "QR Tools", count: "30+", color: "#22c55e", href: "/qr-tools", emoji: "🔳",
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
    kind: "cat", name: "PDF Tools", count: "24+", color: "#60a5fa", href: "/pdf-tools", emoji: "📄",
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
    kind: "cat", name: "Image Tools", count: "70+", color: "#c084fc", href: "/image-tools", emoji: "🖼️",
    copy: "Cut, compress and perfect any picture — nothing leaves your device.",
    tools: [
      { label: "Remove BG", href: "/image-tools/remove-bg" },
      { label: "Compress", href: "/image-tools/compress" },
      { label: "Crop", href: "/image-tools/crop-image" },
      { label: "Watermark", href: "/image-tools/watermark-image" },
    ],
  },
  {
    kind: "cat", name: "AI Tools", count: "28+", color: "#fbbf24", href: "/ai-tools", emoji: "✨",
    copy: "Upscale, colorize, generate — AI working on your files.",
    tools: [
      { label: "Upscaler", href: "/ai-tools/image-upscaler" },
      { label: "AI Remove BG", href: "/ai-tools/background-remover" },
      { label: "Logo Maker", href: "/ai-tools/logo-generator" },
      { label: "Colorize", href: "/ai-tools/colorize-photo" },
    ],
  },
  {
    kind: "cat", name: "Video Tools", count: "29+", color: "#f472b6", href: "/video-tools", emoji: "🎬",
    copy: "Trim, compress, GIF — no upload, no watermark.",
    tools: [
      { label: "Compress", href: "/video-tools/compress-video" },
      { label: "Trim", href: "/video-tools/trim-video" },
      { label: "GIF Maker", href: "/video-tools/create-gif" },
      { label: "Merge", href: "/video-tools/merge-videos" },
    ],
  },
  {
    kind: "cat", name: "3D Tools", count: "New", color: "#22d3ee", href: "/3d-tools", emoji: "🧊",
    copy: "Turn a photo into a textured, export-ready 3D model.",
    tools: [
      { label: "Image to 3D", href: "/3d-tools/image-to-3d" },
      { label: "GLB · OBJ · STL", href: "/3d-tools/image-to-3d" },
    ],
  },
  { kind: "stats", name: "QRix in numbers", color: "#ff6a13" },
];

const STATS = [
  { num: "1 000 000+", label: "QR CODES CREATED" },
  { num: "50 000 000+", label: "TOTAL SCANS" },
  { num: "150+", label: "COUNTRIES REACHED" },
  { num: "10 000+", label: "HAPPY BUSINESSES" },
];

const N = CHAPTERS.length;

export default function CategoryShowcase() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  /* scroll progress through the tall wrapper drives the active chapter */
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    let raf = 0, last = -1;
    const tick = () => {
      const r = wrap.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = r.height - vh;
      const p = Math.min(0.999, Math.max(0, -r.top / Math.max(1, total)));
      const i = Math.min(N - 1, Math.floor(p * N));
      if (i !== last) { last = i; setIdx(i); }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const jump = (i: number) => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const top = wrap.getBoundingClientRect().top + window.scrollY;
    const vh = window.innerHeight;
    const total = wrap.offsetHeight - vh;
    window.scrollTo({ top: top + (total * (i + 0.5)) / N, behavior: "smooth" });
  };

  const active = CHAPTERS[idx];

  return (
    <section aria-label="All tools">
      <div className="qx-st-wrap" ref={wrapRef} style={{ height: `${N * 92}vh` }}>
        <div className="qx-st" style={{ ["--st" as string]: active.color } as React.CSSProperties}>
          {/* ambient wash follows the chapter color */}
          <div className="qx-st-glow" aria-hidden />

          {/* header */}
          <div className="qx-st-head">
            <p className="qx-mono qx-st-kick">185+ FREE TOOLS</p>
            <h2 className="qx-st-title font-display">All tools</h2>
          </div>

          {/* progress rail */}
          <div className="qx-st-rail" role="tablist" aria-label="Chapters">
            {CHAPTERS.map((ch, i) => (
              <button key={ch.name} type="button" role="tab" aria-selected={i === idx}
                className={`qx-st-dot${i === idx ? " on" : ""}`}
                onClick={() => jump(i)} aria-label={ch.name}>
                <i /><span>{ch.name}</span>
              </button>
            ))}
          </div>

          <div className="qx-st-stage">
            {/* LEFT: chapter text */}
            <div className="qx-st-left">
              {CHAPTERS.map((ch, i) => (
                <div key={ch.name}
                  className={`qx-st-copybox${i === idx ? " is-on" : i < idx ? " is-past" : " is-next"}`}
                  style={{ ["--st" as string]: ch.color } as React.CSSProperties}
                  aria-hidden={i !== idx}
                >
                  <span className="qx-mono qx-st-idx">0{i + 1} / 0{N}</span>
                  {ch.kind === "cat" ? (
                    <>
                      <h3 className="qx-st-name">{ch.name}</h3>
                      <p className="qx-st-copy">{ch.copy}</p>
                      <div className="qx-st-chips">
                        {ch.tools.map((tool) => (
                          <Link key={tool.label} href={tool.href} className="qx-st-chip"
                            tabIndex={i === idx ? 0 : -1}>{tool.label}</Link>
                        ))}
                      </div>
                      <Link href={ch.href} className="qx-st-all" tabIndex={i === idx ? 0 : -1}>
                        All {ch.name.toLowerCase()} <FiArrowRight size={13} aria-hidden />
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="qx-st-name">QRix in numbers</h3>
                      <p className="qx-st-copy">
                        Every day thousands of teams run their QR, PDF and media work on QRix — no signup, no paywall.
                      </p>
                      <p className="qx-mono qx-st-uptime">
                        <FiShield size={12} aria-hidden /> 99.9% UPTIME &amp; RELIABLE
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* RIGHT: chapter visual */}
            <div className="qx-st-right" aria-hidden>
              {CHAPTERS.map((ch, i) => (
                <div key={ch.name}
                  className={`qx-st-visual${i === idx ? " is-on" : i < idx ? " is-past" : " is-next"}`}
                  style={{ ["--st" as string]: ch.color } as React.CSSProperties}
                >
                  {ch.kind === "cat" ? (
                    <div className="qx-st-card">
                      <span className="qx-st-emoji">{ch.emoji}</span>
                      <span className="qx-st-bigcount font-display">{ch.count}</span>
                      <span className="qx-mono qx-st-biglbl">TOOLS INSIDE</span>
                    </div>
                  ) : (
                    <div className="qx-st-card qx-st-card--stats">
                      {STATS.map((s) => (
                        <div key={s.label} className="qx-st-stat">
                          <span className="qx-st-stat-num font-display">{s.num}</span>
                          <span className="qx-mono qx-st-stat-lbl">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .qx-st-wrap { position: relative; }
        .qx-st {
          position: sticky; top: 0; height: 100vh; overflow: hidden;
          display: flex; flex-direction: column;
        }
        .qx-st-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(60% 50% at 72% 55%, color-mix(in srgb, var(--st) 10%, transparent) 0%, transparent 65%);
          transition: background 0.9s var(--ease-in-out);
        }

        .qx-st-head {
          max-width: 1400px; width: 100%; margin: 0 auto;
          padding: clamp(60px, 9vh, 100px) 2rem 0;
        }
        .qx-st-kick { font-size: 11px; letter-spacing: 0.28em; color: var(--primary-bright); margin-bottom: 10px; }
        .qx-st-title {
          font-weight: 800; letter-spacing: -0.02em; line-height: 1;
          font-size: clamp(28px, 3.4vw, 44px); color: var(--text);
        }

        .qx-st-stage {
          flex: 1; position: relative;
          max-width: 1400px; width: 100%; margin: 0 auto;
          display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: clamp(20px, 4vw, 60px);
          padding: 0 2rem clamp(30px, 6vh, 70px);
          align-items: center;
        }

        /* left column: stacked chapter texts, fade + slide */
        .qx-st-left { position: relative; min-height: 320px; }
        .qx-st-copybox {
          position: absolute; inset: 0;
          display: flex; flex-direction: column; justify-content: center;
          align-items: flex-start; gap: 14px;
          transition: opacity 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
                      visibility 0s 0.55s;
          opacity: 0; visibility: hidden;
        }
        .qx-st-copybox.is-past { transform: translateY(-28px); }
        .qx-st-copybox.is-next { transform: translateY(28px); }
        .qx-st-copybox.is-on {
          opacity: 1; visibility: visible; transform: none;
          transition-delay: 0.08s, 0.08s, 0s;
        }
        .qx-st-idx { font-size: 11px; letter-spacing: 0.24em; color: var(--st); }
        .qx-st-name {
          font-family: "Unbounded", var(--font-display), sans-serif;
          font-weight: 800; text-transform: uppercase;
          font-size: clamp(30px, 4.4vw, 56px); line-height: 1.04;
          letter-spacing: -0.015em; color: var(--text);
        }
        .qx-st-copy { font-size: 15px; line-height: 1.7; color: var(--text-muted); max-width: 420px; }
        .qx-st-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .qx-st-chip {
          font-size: 12.5px; font-weight: 600; text-decoration: none;
          padding: 7px 14px; border-radius: 99px; color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.13);
          background: rgba(255, 255, 255, 0.04);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .qx-st-chip:hover {
          color: var(--text);
          border-color: color-mix(in srgb, var(--st) 55%, transparent);
          background: color-mix(in srgb, var(--st) 13%, transparent);
        }
        html.light .qx-st-chip { border-color: rgba(0, 0, 0, 0.1); background: rgba(0, 0, 0, 0.03); }
        .qx-st-all {
          display: inline-flex; align-items: center; gap: 7px; margin-top: 4px;
          font-size: 13.5px; font-weight: 700; color: var(--st); text-decoration: none;
          transition: gap 0.25s;
        }
        .qx-st-all:hover { gap: 12px; }
        .qx-st-uptime { display: inline-flex; align-items: center; gap: 8px; font-size: 11px; letter-spacing: 0.22em; color: var(--st); }

        /* right column: sliding visual cards */
        .qx-st-right { position: relative; min-height: 340px; perspective: 1000px; }
        .qx-st-visual {
          position: absolute; inset: 0;
          display: flex; align-items: center; justify-content: center;
          transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                      transform 0.6s cubic-bezier(0.22, 1, 0.36, 1),
                      visibility 0s 0.6s;
          opacity: 0; visibility: hidden;
        }
        .qx-st-visual.is-past { transform: translateX(-46px) rotateY(7deg) scale(0.95); }
        .qx-st-visual.is-next { transform: translateX(46px) rotateY(-7deg) scale(0.95); }
        .qx-st-visual.is-on {
          opacity: 1; visibility: visible; transform: none;
          transition-delay: 0.08s, 0.08s, 0s;
        }
        .qx-st-card {
          width: min(100%, 460px); aspect-ratio: 1.24;
          border-radius: 26px; position: relative; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px;
          background:
            radial-gradient(120% 100% at 80% -10%, color-mix(in srgb, var(--st) 22%, transparent) 0%, transparent 60%),
            rgba(14, 9, 6, 0.6);
          backdrop-filter: var(--glass-blur);
          border: 1px solid color-mix(in srgb, var(--st) 38%, transparent);
          box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
        }
        html.light .qx-st-card { background: radial-gradient(120% 100% at 80% -10%, color-mix(in srgb, var(--st) 14%, transparent) 0%, transparent 60%), rgba(255, 255, 255, 0.8); border-color: rgba(0,0,0,0.1); }
        .qx-st-emoji { font-size: clamp(64px, 8vw, 110px); line-height: 1; filter: drop-shadow(0 12px 30px rgba(0,0,0,0.4)); }
        .qx-st-bigcount {
          font-weight: 800; font-size: clamp(44px, 5.6vw, 84px); line-height: 1;
          color: var(--st); letter-spacing: -0.03em;
          text-shadow: 0 0 40px color-mix(in srgb, var(--st) 55%, transparent);
        }
        .qx-st-biglbl { font-size: 10px; letter-spacing: 0.3em; color: var(--text-faint); }

        .qx-st-card--stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0;
          align-items: stretch; justify-items: stretch; padding: 10px;
        }
        .qx-st-stat {
          display: flex; flex-direction: column; gap: 8px;
          align-items: flex-start; justify-content: center; padding: 18px 22px;
        }
        .qx-st-stat:nth-child(even) { border-left: 1px solid rgba(255, 106, 19, 0.22); }
        .qx-st-stat:nth-child(n+3) { border-top: 1px solid rgba(255, 106, 19, 0.22); }
        .qx-st-stat-num {
          font-weight: 800; font-size: clamp(20px, 2.2vw, 32px); line-height: 1;
          color: #ff7a32; letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
          text-shadow: 0 0 22px rgba(255, 106, 19, 0.4);
        }
        .qx-st-stat-lbl { font-size: 9.5px; letter-spacing: 0.2em; color: rgba(255, 160, 100, 0.85); }

        /* progress rail */
        .qx-st-rail {
          position: absolute; right: clamp(10px, 2vw, 28px); top: 50%;
          transform: translateY(-50%); z-index: 5;
          display: flex; flex-direction: column; gap: 14px;
        }
        .qx-st-dot {
          display: flex; align-items: center; gap: 10px; flex-direction: row-reverse;
          background: none; border: 0; cursor: pointer; padding: 2px;
        }
        .qx-st-dot i {
          width: 9px; height: 9px; border-radius: 50%;
          background: rgba(255, 106, 19, 0.25);
          border: 1px solid rgba(255, 106, 19, 0.4);
          transition: background 0.3s, box-shadow 0.3s, transform 0.3s;
        }
        .qx-st-dot span {
          font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
          font-family: "Space Mono", monospace; color: var(--text-faint);
          opacity: 0; transform: translateX(6px);
          transition: opacity 0.25s, transform 0.25s, color 0.25s;
          white-space: nowrap;
        }
        .qx-st-dot:hover span { opacity: 1; transform: none; }
        .qx-st-dot.on i {
          background: #ff6a13; transform: scale(1.35);
          box-shadow: 0 0 12px rgba(255, 106, 19, 0.9);
        }
        .qx-st-dot.on span { opacity: 1; transform: none; color: var(--primary-bright); }

        @media (max-width: 900px) {
          .qx-st-stage { grid-template-columns: 1fr; align-items: start; padding-top: 2vh; }
          .qx-st-right { display: none; }
          .qx-st-left { min-height: 380px; }
          .qx-st-rail { right: 8px; }
          .qx-st-dot span { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .qx-st-copybox, .qx-st-visual, .qx-st-glow { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
