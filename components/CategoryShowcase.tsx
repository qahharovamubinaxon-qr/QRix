"use client";

/* Homepage — ALL TOOLS as an editorial type index (Mission 46).
   Six oversized Unbounded rows; hovering (or focusing / tapping) a row
   lights it in its category color and a glass tool panel smokes in on the
   right with five real links. Down-scaled screens get a tap accordion.
   No cards, no carousels — type does the premium work. */

import Link from "next/link";
import { useState } from "react";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

type Tool = { label: string; href: string; hint: string };
type Cat = {
  name: string; count: string; color: string; href: string;
  tools: Tool[];
};

const CATS: Cat[] = [
  {
    name: "QR Tools", count: "30+", color: "#22c55e", href: "/qr-tools",
    tools: [
      { label: "URL QR Code", href: "/url-qr", hint: "Link → QR in a click" },
      { label: "WiFi QR", href: "/qr-tools/wifi", hint: "Share WiFi without passwords" },
      { label: "vCard QR", href: "/qr-tools/vcard", hint: "Contact card in one scan" },
      { label: "Bulk QR from CSV", href: "/bulk-qr", hint: "Hundreds of codes at once" },
      { label: "QR Scanner", href: "/scanner", hint: "Decode any QR in-browser" },
    ],
  },
  {
    name: "PDF Tools", count: "24+", color: "#60a5fa", href: "/pdf-tools",
    tools: [
      { label: "Merge PDF", href: "/pdf-tools/merge", hint: "Combine files into one" },
      { label: "Compress PDF", href: "/pdf-tools/compress", hint: "Shrink size, keep quality" },
      { label: "PDF to Word", href: "/pdf-tools/pdf-to-word", hint: "Editable .docx output" },
      { label: "Split PDF", href: "/pdf-tools/split", hint: "Extract the pages you need" },
      { label: "OCR PDF", href: "/pdf-tools/ocr", hint: "Scans → searchable text" },
    ],
  },
  {
    name: "Image Tools", count: "70+", color: "#c084fc", href: "/image-tools",
    tools: [
      { label: "Remove Background", href: "/image-tools/remove-bg", hint: "Clean cutouts in seconds" },
      { label: "Compress Image", href: "/image-tools/compress", hint: "Lighter files, same look" },
      { label: "Crop Image", href: "/image-tools/crop-image", hint: "Perfect framing, any ratio" },
      { label: "Watermark", href: "/image-tools/watermark-image", hint: "Protect your work" },
      { label: "Color Picker", href: "/image-tools/color-picker", hint: "Grab any pixel's color" },
    ],
  },
  {
    name: "AI Tools", count: "28+", color: "#fbbf24", href: "/ai-tools",
    tools: [
      { label: "Image Upscaler", href: "/ai-tools/image-upscaler", hint: "Sharper, larger, cleaner" },
      { label: "AI Background Remover", href: "/ai-tools/background-remover", hint: "AI-precise subject cutout" },
      { label: "Logo Generator", href: "/ai-tools/logo-generator", hint: "Brand marks in minutes" },
      { label: "Colorize Photo", href: "/ai-tools/colorize-photo", hint: "B&W memories in color" },
      { label: "Face Enhancer", href: "/ai-tools/face-enhancer", hint: "Restore blurry portraits" },
    ],
  },
  {
    name: "Video Tools", count: "29+", color: "#f472b6", href: "/video-tools",
    tools: [
      { label: "Compress Video", href: "/video-tools/compress-video", hint: "Smaller files, smooth play" },
      { label: "Trim Video", href: "/video-tools/trim-video", hint: "Cut to the exact moment" },
      { label: "GIF Maker", href: "/video-tools/create-gif", hint: "Video → looping GIF" },
      { label: "Merge Videos", href: "/video-tools/merge-videos", hint: "Stitch clips together" },
      { label: "Resize Video", href: "/video-tools/resize-video", hint: "Any platform, any ratio" },
    ],
  },
  {
    name: "3D Tools", count: "New", color: "#22d3ee", href: "/3d-tools",
    tools: [
      { label: "Image to 3D Model", href: "/3d-tools/image-to-3d", hint: "Photo → textured mesh" },
      { label: "3D Preview & Orbit", href: "/3d-tools/image-to-3d", hint: "Inspect from every angle" },
      { label: "GLB · OBJ · STL · USDZ", href: "/3d-tools/image-to-3d", hint: "Export-ready formats" },
    ],
  },
];

export default function CategoryShowcase() {
  const [open, setOpen] = useState(-1);

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

      <ol className="qx-ti" onMouseLeave={() => setOpen(-1)}>
        {CATS.map((cat, i) => {
          const isOpen = i === open;
          return (
            <li key={cat.name}
              className={`qx-ti-row${isOpen ? " is-open" : ""}`}
              style={{ ["--ti" as string]: cat.color } as React.CSSProperties}
              onMouseEnter={() => setOpen(i)}
              onFocusCapture={() => setOpen(i)}
            >
              <Link href={cat.href} className="qx-ti-line"
                onClick={(e) => {
                  // first tap on touch opens the panel; second follows the link
                  if (window.matchMedia("(hover: none)").matches && !isOpen) {
                    e.preventDefault();
                    setOpen(i);
                  }
                }}>
                <span className="qx-mono qx-ti-idx">0{i + 1}</span>
                <span className="qx-ti-name">{cat.name}</span>
                <span className="qx-mono qx-ti-count">{cat.count}</span>
                <FiArrowRight className="qx-ti-go" size={26} aria-hidden />
              </Link>

              {/* the tool panel smokes in beside the row */}
              <div className="qx-ti-panel" aria-hidden={!isOpen}>
                <ul>
                  {cat.tools.map((tool) => (
                    <li key={tool.label}>
                      <Link href={tool.href} className="qx-ti-tool" tabIndex={isOpen ? 0 : -1}>
                        <span className="qx-ti-tool-label">{tool.label}</span>
                        <span className="qx-ti-tool-hint">{tool.hint}</span>
                        <FiArrowUpRight size={13} className="qx-ti-tool-ic" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link href={cat.href} className="qx-ti-all" tabIndex={isOpen ? 0 : -1}>
                  All {cat.name.toLowerCase()} <FiArrowRight size={12} aria-hidden />
                </Link>
              </div>
            </li>
          );
        })}
      </ol>

      <style>{`
        .qx-ti { position: relative; counter-reset: none; }
        .qx-ti-row {
          position: relative;
          border-top: 1px solid rgba(255, 140, 80, 0.14);
        }
        .qx-ti-row:last-child { border-bottom: 1px solid rgba(255, 140, 80, 0.14); }

        .qx-ti-line {
          display: flex; align-items: baseline; gap: clamp(16px, 3vw, 38px);
          padding: clamp(16px, 2.6vh, 26px) 6px;
          text-decoration: none; position: relative; z-index: 1;
        }
        .qx-ti-idx {
          font-size: 12px; letter-spacing: 0.2em;
          color: var(--text-faint);
          transition: color 0.25s;
        }
        .qx-ti-name {
          font-family: "Unbounded", var(--font-display), sans-serif;
          font-weight: 800; text-transform: uppercase;
          font-size: clamp(26px, 4.6vw, 58px);
          line-height: 1.05; letter-spacing: -0.015em;
          color: var(--text-muted);
          transition: color 0.3s, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .qx-ti-count {
          font-size: 12px; letter-spacing: 0.18em;
          color: var(--text-faint); transition: color 0.25s;
        }
        .qx-ti-go {
          margin-left: auto; align-self: center;
          color: var(--text-faint); opacity: 0;
          transform: translateX(-10px) rotate(-45deg);
          transition: opacity 0.3s, transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), color 0.3s;
        }
        .qx-ti-row.is-open .qx-ti-name { color: var(--ti); transform: translateX(14px); }
        .qx-ti-row.is-open .qx-ti-idx,
        .qx-ti-row.is-open .qx-ti-count { color: var(--ti); }
        .qx-ti-row.is-open .qx-ti-go { opacity: 1; transform: translateX(0) rotate(0); color: var(--ti); }

        /* glass panel, smoked in on the right of the row */
        .qx-ti-panel {
          position: absolute; right: 0; top: 50%; z-index: 5;
          width: min(380px, 34vw);
          transform: translateY(-50%) scale(1.04);
          padding: 18px 20px 14px;
          border-radius: 18px;
          background: rgba(16, 10, 7, 0.88);
          backdrop-filter: var(--glass-blur);
          border: 1px solid color-mix(in srgb, var(--ti) 40%, transparent);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
          opacity: 0; filter: blur(14px); pointer-events: none;
          transition: opacity 0.45s ease-out, filter 0.45s ease-out, transform 0.45s ease-out;
        }
        .qx-ti-row.is-open .qx-ti-panel {
          opacity: 1; filter: blur(0); transform: translateY(-50%) scale(1);
          pointer-events: auto;
        }
        html.light .qx-ti-panel { background: rgba(255, 248, 242, 0.94); }

        .qx-ti-tool {
          display: grid; grid-template-columns: auto 1fr auto;
          align-items: baseline; gap: 10px;
          padding: 7px 2px; text-decoration: none;
          border-top: 1px solid rgba(255, 150, 90, 0.1);
          transition: padding-left 0.2s ease-out;
        }
        .qx-ti-panel li:first-child .qx-ti-tool { border-top: 0; }
        .qx-ti-tool:hover { padding-left: 8px; }
        .qx-ti-tool-label { font-weight: 650; font-size: 13.5px; color: var(--text); white-space: nowrap; }
        .qx-ti-tool-hint {
          font-size: 11.5px; color: var(--text-muted);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .qx-ti-tool-ic { opacity: 0; transform: translate(-4px, 4px); transition: 0.2s; color: var(--ti); align-self: center; }
        .qx-ti-tool:hover .qx-ti-tool-ic { opacity: 1; transform: none; }
        .qx-ti-all {
          margin-top: 10px; display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 700; color: var(--ti); text-decoration: none;
          transition: gap 0.25s;
        }
        .qx-ti-all:hover { gap: 10px; }

        /* stacked: panel flows under the row */
        @media (max-width: 1023px) {
          .qx-ti-panel {
            position: static; width: 100%; transform: none;
            margin: 0 0 14px; max-height: 0; overflow: hidden;
            padding: 0 16px; opacity: 0; filter: none;
            transition: max-height 0.45s ease-out, opacity 0.35s, padding 0.3s;
          }
          .qx-ti-row.is-open .qx-ti-panel {
            max-height: 420px; opacity: 1; transform: none; padding: 14px 16px 12px;
          }
          .qx-ti-row.is-open .qx-ti-name { transform: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .qx-ti-name, .qx-ti-go, .qx-ti-panel { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
