"use client";

/* Homepage — ALL TOOLS as six expanding panels (Mission 43).
   One panel is in the spotlight at a time: it grows wide and reveals the
   category's real tools; the others compress into slim Unbounded spines.
   Hover / focus / tap moves the spotlight (Kowalski: single layout
   transition, 550ms expo-out, content fades in after the panel settles).
   Dark-orange glass over the glitter starfield; every link is real. */

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

type Tool = { label: string; href: string; hint: string };
type Cat = {
  name: string; count: string; color: string; href: string; emoji: string;
  tools: Tool[];
};

const CATS: Cat[] = [
  {
    name: "QR Tools", count: "30+", color: "#22c55e", href: "/qr-tools", emoji: "🔳",
    tools: [
      { label: "URL QR Code", href: "/url-qr", hint: "Link → QR in a click" },
      { label: "WiFi QR", href: "/qr-tools/wifi", hint: "Share WiFi without passwords" },
      { label: "vCard QR", href: "/qr-tools/vcard", hint: "Contact card in one scan" },
      { label: "Bulk QR from CSV", href: "/bulk-qr", hint: "Hundreds of codes at once" },
      { label: "QR Scanner", href: "/scanner", hint: "Decode any QR in-browser" },
    ],
  },
  {
    name: "PDF Tools", count: "24+", color: "#60a5fa", href: "/pdf-tools", emoji: "📄",
    tools: [
      { label: "Merge PDF", href: "/pdf-tools/merge", hint: "Combine files into one" },
      { label: "Compress PDF", href: "/pdf-tools/compress", hint: "Shrink size, keep quality" },
      { label: "PDF to Word", href: "/pdf-tools/pdf-to-word", hint: "Editable .docx output" },
      { label: "Split PDF", href: "/pdf-tools/split", hint: "Extract the pages you need" },
      { label: "OCR PDF", href: "/pdf-tools/ocr", hint: "Scans → searchable text" },
    ],
  },
  {
    name: "Image Tools", count: "70+", color: "#c084fc", href: "/image-tools", emoji: "🖼️",
    tools: [
      { label: "Remove Background", href: "/image-tools/remove-bg", hint: "Clean cutouts in seconds" },
      { label: "Compress Image", href: "/image-tools/compress", hint: "Lighter files, same look" },
      { label: "Crop Image", href: "/image-tools/crop-image", hint: "Perfect framing, any ratio" },
      { label: "Watermark", href: "/image-tools/watermark-image", hint: "Protect your work" },
      { label: "Color Picker", href: "/image-tools/color-picker", hint: "Grab any pixel's color" },
    ],
  },
  {
    name: "AI Tools", count: "28+", color: "#fbbf24", href: "/ai-tools", emoji: "✨",
    tools: [
      { label: "Image Upscaler", href: "/ai-tools/image-upscaler", hint: "Sharper, larger, cleaner" },
      { label: "AI Background Remover", href: "/ai-tools/background-remover", hint: "AI-precise subject cutout" },
      { label: "Logo Generator", href: "/ai-tools/logo-generator", hint: "Brand marks in minutes" },
      { label: "Colorize Photo", href: "/ai-tools/colorize-photo", hint: "B&W memories in color" },
      { label: "Face Enhancer", href: "/ai-tools/face-enhancer", hint: "Restore blurry portraits" },
    ],
  },
  {
    name: "Video Tools", count: "29+", color: "#f472b6", href: "/video-tools", emoji: "🎬",
    tools: [
      { label: "Compress Video", href: "/video-tools/compress-video", hint: "Smaller files, smooth play" },
      { label: "Trim Video", href: "/video-tools/trim-video", hint: "Cut to the exact moment" },
      { label: "GIF Maker", href: "/video-tools/create-gif", hint: "Video → looping GIF" },
      { label: "Merge Videos", href: "/video-tools/merge-videos", hint: "Stitch clips together" },
      { label: "Resize Video", href: "/video-tools/resize-video", hint: "Any platform, any ratio" },
    ],
  },
  {
    name: "3D Tools", count: "New", color: "#22d3ee", href: "/3d-tools", emoji: "🧊",
    tools: [
      { label: "Image to 3D Model", href: "/3d-tools/image-to-3d", hint: "Photo → textured mesh" },
      { label: "3D Preview & Orbit", href: "/3d-tools/image-to-3d", hint: "Inspect from every angle" },
      { label: "GLB · OBJ · STL · USDZ", href: "/3d-tools/image-to-3d", hint: "Export-ready formats" },
    ],
  },
];

export default function CategoryShowcase() {
  const [open, setOpen] = useState(0);

  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20 lg:pb-24" aria-label="All tools">
      <div className="mb-8 lg:mb-10" data-reveal>
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
          185+ free tools
        </p>
        <h2 className="font-display font-extrabold tracking-tight leading-[1.05]"
          style={{ color: "var(--text)", fontSize: "clamp(28px, 3.6vw, 46px)" }}>
          All tools
        </h2>
      </div>

      <div className="qx-xp" data-reveal>
        {CATS.map((cat, i) => {
          const isOpen = i === open;
          return (
            <div
              key={cat.name}
              className={`qx-xp-panel${isOpen ? " is-open" : ""}`}
              style={{ ["--xp" as string]: cat.color } as React.CSSProperties}
              onMouseEnter={() => setOpen(i)}
              onFocusCapture={() => setOpen(i)}
            >
              {/* collapsed spine */}
              <button
                type="button"
                className="qx-xp-spine"
                aria-expanded={isOpen}
                aria-label={`${cat.name} — ${cat.count}`}
                onClick={() => setOpen(i)}
                tabIndex={isOpen ? -1 : 0}
              >
                <span className="qx-xp-spine-emoji" aria-hidden>{cat.emoji}</span>
                <span className="qx-xp-spine-name">{cat.name}</span>
                <span className="qx-xp-spine-dot" aria-hidden />
              </button>

              {/* open face */}
              <div className="qx-xp-body" aria-hidden={!isOpen}>
                <div className="qx-xp-head">
                  <span className="qx-xp-emoji" aria-hidden>{cat.emoji}</span>
                  <div>
                    <h3 className="qx-xp-name">{cat.name}</h3>
                    <span className="qx-mono qx-xp-count">{cat.count} TOOLS</span>
                  </div>
                </div>
                <ul className="qx-xp-list">
                  {cat.tools.map((tool) => (
                    <li key={tool.label}>
                      <Link href={tool.href} className="qx-xp-link" tabIndex={isOpen ? 0 : -1}>
                        <span className="qx-xp-link-label">{tool.label}</span>
                        <span className="qx-xp-link-hint">{tool.hint}</span>
                        <FiArrowUpRight size={14} className="qx-xp-link-ic" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={cat.href} className="qx-xp-all" tabIndex={isOpen ? 0 : -1}>
                  All {cat.name.toLowerCase()} <FiArrowRight size={13} aria-hidden />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .qx-xp {
          display: flex; gap: 12px; height: 500px;
        }
        .qx-xp-panel {
          position: relative; overflow: hidden; border-radius: 20px;
          flex: 1 1 0%; min-width: 76px; cursor: pointer;
          background:
            radial-gradient(130% 100% at 85% -12%, color-mix(in srgb, var(--xp) 20%, transparent) 0%, transparent 55%),
            linear-gradient(168deg, rgba(64, 28, 12, 0.72) 0%, rgba(34, 15, 7, 0.82) 55%, rgba(22, 10, 5, 0.88) 100%);
          border: 1px solid rgba(255, 140, 80, 0.14);
          transition: flex 0.55s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s;
        }
        .qx-xp-panel.is-open {
          flex: 4.6 1 0%; cursor: default;
          border-color: color-mix(in srgb, var(--xp) 45%, transparent);
        }
        html.light .qx-xp-panel {
          background:
            radial-gradient(130% 100% at 85% -12%, color-mix(in srgb, var(--xp) 14%, transparent) 0%, transparent 55%),
            linear-gradient(168deg, #fff4ec 0%, #ffe9da 100%);
          border-color: rgba(140, 60, 15, 0.14);
        }

        /* collapsed spine — vertical Unbounded name */
        .qx-xp-spine {
          position: absolute; inset: 0; z-index: 2;
          display: flex; flex-direction: column; align-items: center;
          padding: 20px 0 22px; gap: 14px;
          background: none; border: 0; cursor: pointer;
          opacity: 1; transition: opacity 0.25s ease-out;
        }
        .qx-xp-panel.is-open .qx-xp-spine { opacity: 0; pointer-events: none; }
        .qx-xp-spine-emoji { font-size: 22px; line-height: 1; }
        .qx-xp-spine-name {
          font-family: "Unbounded", var(--font-display), sans-serif;
          font-weight: 700; font-size: 13.5px; letter-spacing: 0.14em;
          text-transform: uppercase; color: var(--text);
          writing-mode: vertical-rl; transform: rotate(180deg);
          margin: auto 0;
          white-space: nowrap;
        }
        .qx-xp-spine-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: var(--xp); box-shadow: 0 0 12px var(--xp);
        }

        /* open face — fades in once the panel has landed */
        .qx-xp-body {
          position: absolute; inset: 0; z-index: 1;
          display: flex; flex-direction: column;
          padding: 26px 28px 22px;
          opacity: 0; transform: translateY(8px);
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
          min-width: 330px;
        }
        .qx-xp-panel.is-open .qx-xp-body {
          opacity: 1; transform: none;
          transition-delay: 0.22s;
        }
        .qx-xp-head { display: flex; align-items: center; gap: 14px; margin-bottom: 16px; }
        .qx-xp-emoji { font-size: 34px; line-height: 1; }
        .qx-xp-name {
          font-family: "Unbounded", var(--font-display), sans-serif;
          font-weight: 800; font-size: 19px; letter-spacing: -0.01em;
          color: var(--text); line-height: 1.1;
        }
        .qx-xp-count { display: block; margin-top: 4px; font-size: 10px; letter-spacing: 0.2em; color: var(--xp); }

        .qx-xp-list { display: flex; flex-direction: column; flex: 1; min-height: 0; }
        .qx-xp-link {
          display: grid; grid-template-columns: minmax(0, auto) 1fr auto;
          align-items: baseline; gap: 12px;
          padding: 9px 2px; text-decoration: none;
          border-top: 1px solid rgba(255, 150, 90, 0.1);
          transition: padding-left 0.22s ease-out;
        }
        .qx-xp-link:hover { padding-left: 8px; }
        .qx-xp-link-label { font-weight: 650; font-size: 14.5px; color: var(--text); white-space: nowrap; }
        .qx-xp-link-hint {
          font-size: 12px; color: var(--text-muted);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .qx-xp-link-ic { opacity: 0; transform: translate(-4px, 4px); transition: opacity 0.22s, transform 0.22s; color: var(--xp); align-self: center; }
        .qx-xp-link:hover .qx-xp-link-ic { opacity: 1; transform: none; }

        .qx-xp-all {
          margin-top: 14px; display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700; color: var(--xp); text-decoration: none;
          transition: gap 0.25s;
        }
        .qx-xp-all:hover { gap: 11px; }

        /* vertical accordion below 1024px */
        @media (max-width: 1023px) {
          .qx-xp { flex-direction: column; height: auto; gap: 10px; }
          .qx-xp-panel { min-width: 0; min-height: 64px; flex: none; transition: border-color 0.3s; }
          .qx-xp-panel.is-open { min-height: 430px; }
          .qx-xp-spine { flex-direction: row; padding: 0 18px; gap: 12px; align-items: center; }
          .qx-xp-spine-name { writing-mode: horizontal-tb; transform: none; margin: 0 auto 0 0; }
          .qx-xp-body { position: relative; min-width: 0; padding: 20px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .qx-xp-panel, .qx-xp-body, .qx-xp-spine { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
