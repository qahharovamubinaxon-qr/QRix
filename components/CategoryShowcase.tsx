"use client";

/* Homepage — ALL TOOLS: six category rows, each a 3D coverflow gallery
   (adapted from the user's Originkit "Coverflow Gallery" Framer component).
   The active card sits upright in the spotlight, neighbours tilt back in
   perspective. Click a side card to bring it to centre; the centre card is a
   real link to its tool. Autoplay alternates direction per row, pauses on
   hover/focus and only runs while the row is on screen. Every card is a
   crawlable <Link>. */

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";

type Tool = { label: string; href: string; emoji: string; hint: string };
type Cat = {
  name: string; count: string; color: string; href: string;
  tools: Tool[];
};

const CATS: Cat[] = [
  {
    name: "QR Tools", count: "30+", color: "#22c55e", href: "/qr-tools",
    tools: [
      { label: "URL QR Code", href: "/url-qr", emoji: "🔗", hint: "Link → QR in a click" },
      { label: "WiFi QR", href: "/qr-tools/wifi", emoji: "📶", hint: "Share WiFi without passwords" },
      { label: "vCard QR", href: "/qr-tools/vcard", emoji: "👤", hint: "Contact card in one scan" },
      { label: "Bulk QR from CSV", href: "/bulk-qr", emoji: "🗂️", hint: "Hundreds of codes at once" },
      { label: "QR Scanner", href: "/scanner", emoji: "📷", hint: "Decode any QR in-browser" },
    ],
  },
  {
    name: "PDF Tools", count: "24+", color: "#60a5fa", href: "/pdf-tools",
    tools: [
      { label: "Merge PDF", href: "/pdf-tools/merge", emoji: "🧩", hint: "Combine files into one" },
      { label: "Compress PDF", href: "/pdf-tools/compress", emoji: "🗜️", hint: "Shrink size, keep quality" },
      { label: "PDF to Word", href: "/pdf-tools/pdf-to-word", emoji: "📝", hint: "Editable .docx output" },
      { label: "Split PDF", href: "/pdf-tools/split", emoji: "✂️", hint: "Extract the pages you need" },
      { label: "OCR PDF", href: "/pdf-tools/ocr", emoji: "🔍", hint: "Scans → searchable text" },
    ],
  },
  {
    name: "Image Tools", count: "70+", color: "#c084fc", href: "/image-tools",
    tools: [
      { label: "Remove Background", href: "/image-tools/remove-bg", emoji: "🪄", hint: "Clean cutouts in seconds" },
      { label: "Compress Image", href: "/image-tools/compress", emoji: "🗜️", hint: "Lighter files, same look" },
      { label: "Crop Image", href: "/image-tools/crop-image", emoji: "✂️", hint: "Perfect framing, any ratio" },
      { label: "Watermark", href: "/image-tools/watermark-image", emoji: "💧", hint: "Protect your work" },
      { label: "Color Picker", href: "/image-tools/color-picker", emoji: "🎨", hint: "Grab any pixel's color" },
    ],
  },
  {
    name: "AI Tools", count: "28+", color: "#fbbf24", href: "/ai-tools",
    tools: [
      { label: "Image Upscaler", href: "/ai-tools/image-upscaler", emoji: "✨", hint: "Sharper, larger, cleaner" },
      { label: "AI Background Remover", href: "/ai-tools/background-remover", emoji: "🤖", hint: "AI-precise subject cutout" },
      { label: "Logo Generator", href: "/ai-tools/logo-generator", emoji: "💠", hint: "Brand marks in minutes" },
      { label: "Colorize Photo", href: "/ai-tools/colorize-photo", emoji: "🌈", hint: "B&W memories in color" },
      { label: "Face Enhancer", href: "/ai-tools/face-enhancer", emoji: "😊", hint: "Restore blurry portraits" },
    ],
  },
  {
    name: "Video Tools", count: "29+", color: "#f472b6", href: "/video-tools",
    tools: [
      { label: "Compress Video", href: "/video-tools/compress-video", emoji: "🎬", hint: "Smaller files, smooth play" },
      { label: "Trim Video", href: "/video-tools/trim-video", emoji: "✂️", hint: "Cut to the exact moment" },
      { label: "GIF Maker", href: "/video-tools/create-gif", emoji: "🌀", hint: "Video → looping GIF" },
      { label: "Merge Videos", href: "/video-tools/merge-videos", emoji: "🧵", hint: "Stitch clips together" },
      { label: "Resize Video", href: "/video-tools/resize-video", emoji: "📐", hint: "Any platform, any ratio" },
    ],
  },
  {
    name: "3D Tools", count: "New", color: "#22d3ee", href: "/3d-tools",
    tools: [
      { label: "Image to 3D Model", href: "/3d-tools/image-to-3d", emoji: "🧊", hint: "Photo → textured mesh" },
      { label: "3D Preview & Orbit", href: "/3d-tools/image-to-3d", emoji: "🕹️", hint: "Inspect from every angle" },
      { label: "GLB · OBJ · STL · USDZ", href: "/3d-tools/image-to-3d", emoji: "📦", hint: "Export-ready formats" },
    ],
  },
];

/* ── coverflow geometry (fixed internals) ─────────────────────────────── */
const CARD_W = 300;
const CARD_H = 200;
const SPACING = 190;      // px between card centres
const DEPTH = 150;        // px pushed back per step
const TILT = 24;          // deg rotateY per step
const SIDE_TILT = 4;      // deg rotateZ per step
const SCALE_STEP = 0.11;
const MAX_VISIBLE = 2;
const DIM = 0.45;         // inactive-card darkening
const DUR = 0.6;
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const HOLD = 3.2;         // autoplay seconds per card

function CoverflowRow({ cat, reverse }: { cat: Cat; reverse: boolean }) {
  const n = cat.tools.length;
  const [active, setActive] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const hoverRef = useRef(false);
  const visibleRef = useRef(false);
  const lockRef = useRef(false);

  const lock = useCallback(() => {
    lockRef.current = true;
    window.setTimeout(() => { lockRef.current = false; }, DUR * 1000);
  }, []);

  const step = useCallback((dir: number) => {
    if (lockRef.current) return;
    lock();
    setActive((a) => (((a + dir) % n) + n) % n);
  }, [n, lock]);

  // Autoplay: only while the row is on screen, not hovered, and motion is allowed.
  useEffect(() => {
    if (n < 2) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stage = stageRef.current;
    if (!stage) return;
    const io = new IntersectionObserver(([e]) => { visibleRef.current = e.isIntersecting; }, { threshold: 0.25 });
    io.observe(stage);
    const dir = reverse ? -1 : 1;
    const id = window.setInterval(() => {
      if (reduce.matches || !visibleRef.current || hoverRef.current) return;
      step(dir);
    }, HOLD * 1000);
    return () => { io.disconnect(); window.clearInterval(id); };
  }, [n, reverse, step]);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
  }, [step]);

  return (
    <div className="qx-cf-row" data-reveal>
      {/* row header — category name leads the row */}
      <div className="qx-cf-head">
        <span className="qx-cf-dot" style={{ background: cat.color }} aria-hidden />
        <h3 className="qx-cf-name font-display">{cat.name}</h3>
        <span className="qx-mono qx-cf-count">{cat.count}</span>
        <Link href={cat.href} className="qx-cf-all">
          All {cat.name.toLowerCase()} <FiArrowRight size={13} aria-hidden />
        </Link>
      </div>

      {/* 3D stage */}
      <div
        ref={stageRef}
        className="qx-cf-stage"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label={`${cat.name} showcase`}
        onKeyDown={onKeyDown}
        onMouseEnter={() => { hoverRef.current = true; }}
        onMouseLeave={() => { hoverRef.current = false; }}
        onFocus={() => { hoverRef.current = true; }}
        onBlur={() => { hoverRef.current = false; }}
      >
        <div className="qx-cf-space">
          {cat.tools.map((tool, i) => {
            let rel = i - active;
            if (rel > n / 2) rel -= n;
            if (rel < -n / 2) rel += n;
            const ax = Math.abs(rel);
            const visible = ax <= MAX_VISIBLE;
            const isActive = rel === 0;
            const sc = Math.max(0.4, 1 - ax * SCALE_STEP);
            return (
              <Link
                key={`${tool.label}-${i}`}
                href={tool.href}
                className={`qx-cf-card${isActive ? " is-active" : ""}`}
                aria-hidden={!visible}
                tabIndex={-1}
                onClick={(e) => {
                  if (!isActive) { e.preventDefault(); if (!lockRef.current) { lock(); setActive(i); } }
                }}
                style={{
                  transform: `translate(-50%, -50%) translateX(${rel * SPACING}px) translateZ(${-ax * DEPTH}px) rotateY(${-rel * TILT}deg) rotateZ(${rel * SIDE_TILT}deg) scale(${sc})`,
                  opacity: visible ? 1 : 0,
                  pointerEvents: visible ? "auto" : "none",
                  ["--cf-accent" as string]: cat.color,
                  ["--cf-dim" as string]: isActive ? 0 : DIM,
                } as React.CSSProperties}
              >
                <span className="qx-cf-emoji" aria-hidden>{tool.emoji}</span>
                <span className="qx-cf-body">
                  <span className="qx-cf-title">{tool.label}</span>
                  <span className="qx-cf-hint">{tool.hint}</span>
                </span>
                <span className="qx-cf-open" aria-hidden>
                  Open <FiArrowRight size={12} />
                </span>
                <span className="qx-cf-shade" aria-hidden />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function CategoryShowcase() {
  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20 lg:pb-24" aria-label="All tools">
      {/* section header */}
      <div className="mb-8 lg:mb-10" data-reveal>
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
          185+ free tools
        </p>
        <h2 className="font-display font-extrabold tracking-tight leading-[1.05]"
          style={{ color: "var(--text)", fontSize: "clamp(28px, 3.6vw, 46px)" }}>
          All tools
        </h2>
      </div>

      <div className="qx-cf-rows">
        {CATS.map((cat, i) => (
          <CoverflowRow key={cat.name} cat={cat} reverse={i % 2 === 1} />
        ))}
      </div>

      <style>{`
        .qx-cf-rows { display: flex; flex-direction: column; gap: 14px; }

        .qx-cf-head {
          display: flex; align-items: center; gap: 10px;
          padding: 0 2px 2px;
        }
        .qx-cf-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .qx-cf-name { font-weight: 700; font-size: 17px; letter-spacing: -0.01em; color: var(--text); }
        .qx-cf-count { font-size: 11px; letter-spacing: 0.12em; color: var(--text-faint); }
        .qx-cf-all {
          margin-left: auto; display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600; color: var(--primary-bright); text-decoration: none;
          transition: gap 0.25s;
        }
        .qx-cf-all:hover { gap: 11px; }

        .qx-cf-stage {
          position: relative; height: ${CARD_H + 56}px;
          display: flex; align-items: center; justify-content: center;
          perspective: 1400px; overflow: hidden; outline: none;
          border-radius: 18px;
        }
        .qx-cf-stage:focus-visible { box-shadow: 0 0 0 2px var(--primary-dim); }
        .qx-cf-space {
          position: relative; width: ${CARD_W}px; height: ${CARD_H}px;
          transform-style: preserve-3d;
        }

        .qx-cf-card {
          position: absolute; left: 50%; top: 50%;
          width: ${CARD_W}px; height: ${CARD_H}px;
          border-radius: 16px; overflow: hidden;
          display: flex; flex-direction: column; justify-content: flex-end;
          padding: 18px 20px; text-decoration: none;
          background:
            radial-gradient(120% 90% at 82% -10%, color-mix(in srgb, var(--cf-accent) 26%, transparent) 0%, transparent 55%),
            var(--qx-cf-bg, #141414);
          border: 1px solid var(--qx-cf-line, rgba(255,255,255,0.09));
          transform-origin: center center;
          transition: transform ${DUR}s ${EASE}, opacity ${DUR}s ${EASE}, border-color 0.3s;
          cursor: pointer;
        }
        .qx-cf-card.is-active { cursor: pointer; }
        .qx-cf-card.is-active:hover { border-color: color-mix(in srgb, var(--cf-accent) 55%, transparent); }
        html.light .qx-cf-card { --qx-cf-bg: #ffffff; --qx-cf-line: rgba(0,0,0,0.09); }

        .qx-cf-emoji {
          position: absolute; top: 16px; left: 20px;
          font-size: 40px; line-height: 1; filter: saturate(1.05);
        }
        .qx-cf-body { position: relative; z-index: 2; display: flex; flex-direction: column; gap: 4px; }
        .qx-cf-title {
          font-family: var(--font-display); font-weight: 700; font-size: 17px;
          letter-spacing: -0.01em; color: var(--text); line-height: 1.15;
        }
        .qx-cf-hint { font-size: 12px; color: var(--text-muted); }
        .qx-cf-open {
          position: absolute; top: 18px; right: 18px; z-index: 2;
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 600; color: var(--cf-accent);
          opacity: 0; transform: translateX(-4px); transition: opacity 0.25s, transform 0.25s;
        }
        .qx-cf-card.is-active:hover .qx-cf-open { opacity: 1; transform: none; }

        /* darkens inactive cards; fades out on the spotlight card */
        .qx-cf-shade {
          position: absolute; inset: 0; background: #000;
          opacity: var(--cf-dim, 0); transition: opacity ${DUR}s ${EASE};
          pointer-events: none;
        }
        html.light .qx-cf-shade { background: #f3f2ef; }

        @media (max-width: 640px) {
          .qx-cf-stage { height: ${CARD_H + 36}px; }
          .qx-cf-all { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .qx-cf-card, .qx-cf-shade { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
