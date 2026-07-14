"use client";

/* Homepage — ALL TOOLS as a quiet index (Mission 54).
   After nine louder takes, restraint: no cards, no borders, no per-category
   colors, no motion tricks. A whitespace grid where type does the premium
   work — one orange accent, mono indexes, real links. */

import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

type Cat = {
  name: string; count: string; href: string;
  tools: { label: string; href: string }[];
};

const CATS: Cat[] = [
  {
    name: "QR Tools", count: "30+", href: "/qr-tools",
    tools: [
      { label: "URL QR Code", href: "/url-qr" },
      { label: "WiFi QR", href: "/qr-tools/wifi" },
      { label: "vCard QR", href: "/qr-tools/vcard" },
      { label: "Bulk QR from CSV", href: "/bulk-qr" },
      { label: "QR Scanner", href: "/scanner" },
    ],
  },
  {
    name: "PDF Tools", count: "24+", href: "/pdf-tools",
    tools: [
      { label: "Merge PDF", href: "/pdf-tools/merge" },
      { label: "Compress PDF", href: "/pdf-tools/compress" },
      { label: "PDF to Word", href: "/pdf-tools/pdf-to-word" },
      { label: "Split PDF", href: "/pdf-tools/split" },
      { label: "OCR PDF", href: "/pdf-tools/ocr" },
    ],
  },
  {
    name: "Image Tools", count: "70+", href: "/image-tools",
    tools: [
      { label: "Remove Background", href: "/image-tools/remove-bg" },
      { label: "Compress Image", href: "/image-tools/compress" },
      { label: "Crop Image", href: "/image-tools/crop-image" },
      { label: "Watermark", href: "/image-tools/watermark-image" },
      { label: "Color Picker", href: "/image-tools/color-picker" },
    ],
  },
  {
    name: "AI Tools", count: "28+", href: "/ai-tools",
    tools: [
      { label: "Image Upscaler", href: "/ai-tools/image-upscaler" },
      { label: "AI Background Remover", href: "/ai-tools/background-remover" },
      { label: "Logo Generator", href: "/ai-tools/logo-generator" },
      { label: "Colorize Photo", href: "/ai-tools/colorize-photo" },
      { label: "Face Enhancer", href: "/ai-tools/face-enhancer" },
    ],
  },
  {
    name: "Video Tools", count: "29+", href: "/video-tools",
    tools: [
      { label: "Compress Video", href: "/video-tools/compress-video" },
      { label: "Trim Video", href: "/video-tools/trim-video" },
      { label: "GIF Maker", href: "/video-tools/create-gif" },
      { label: "Merge Videos", href: "/video-tools/merge-videos" },
      { label: "Resize Video", href: "/video-tools/resize-video" },
    ],
  },
  {
    name: "3D Tools", count: "New", href: "/3d-tools",
    tools: [
      { label: "Image to 3D Model", href: "/3d-tools/image-to-3d" },
      { label: "3D Preview & Orbit", href: "/3d-tools/image-to-3d" },
      { label: "GLB · OBJ · STL · USDZ", href: "/3d-tools/image-to-3d" },
    ],
  },
];

export default function CategoryShowcase() {
  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20 lg:pb-28" aria-label="All tools">
      <div className="mb-12 lg:mb-16 qx-legible" data-reveal>
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
          185+ free tools
        </p>
        <h2 className="font-display font-extrabold tracking-tight leading-[1.05]"
          style={{ color: "var(--text)", fontSize: "clamp(28px, 3.6vw, 46px)" }}>
          All tools
        </h2>
      </div>

      <div className="qx-qi" data-stagger>
        {CATS.map((cat, i) => (
          <div key={cat.name} className="qx-qi-col qx-legible" data-reveal
            style={{ ["--rv-delay" as string]: `${i * 60}ms` } as React.CSSProperties}>
            <div className="qx-qi-head">
              <span className="qx-mono qx-qi-idx">0{i + 1}</span>
              <h3 className="qx-qi-name">{cat.name}</h3>
              <span className="qx-mono qx-qi-count">{cat.count}</span>
            </div>
            <ul className="qx-qi-list">
              {cat.tools.map((tool) => (
                <li key={tool.label}>
                  <Link href={tool.href} className="qx-qi-link">
                    <span>{tool.label}</span>
                    <FiArrowUpRight size={13} className="qx-qi-ic" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={cat.href} className="qx-qi-all">
              All {cat.name.toLowerCase()} <FiArrowRight size={12} aria-hidden />
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .qx-qi {
          display: grid; grid-template-columns: repeat(3, 1fr);
          column-gap: clamp(32px, 5vw, 84px); row-gap: clamp(44px, 6vh, 72px);
        }
        .qx-qi-head {
          display: flex; align-items: baseline; gap: 12px;
          padding-bottom: 14px; margin-bottom: 6px;
          border-bottom: 1px solid rgba(255, 106, 19, 0.22);
        }
        .qx-qi-idx { font-size: 11px; letter-spacing: 0.2em; color: var(--primary-bright); }
        .qx-qi-name {
          font-family: var(--font-display); font-weight: 800;
          font-size: 19px; letter-spacing: -0.01em; color: var(--text);
        }
        .qx-qi-count { margin-left: auto; font-size: 11px; letter-spacing: 0.14em; color: var(--text-faint); }

        .qx-qi-list { display: flex; flex-direction: column; }
        .qx-qi-link {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 8px 0; font-size: 14.5px; color: var(--text-muted);
          text-decoration: none;
          transition: color 0.22s, padding-left 0.22s;
        }
        .qx-qi-link:hover { color: var(--text); padding-left: 6px; }
        .qx-qi-ic {
          opacity: 0; transform: translate(-4px, 4px); flex-shrink: 0;
          color: var(--primary-bright);
          transition: opacity 0.22s, transform 0.22s;
        }
        .qx-qi-link:hover .qx-qi-ic { opacity: 1; transform: none; }

        .qx-qi-all {
          margin-top: 14px; display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 700; color: var(--primary-bright);
          text-decoration: none; transition: gap 0.25s;
        }
        .qx-qi-all:hover { gap: 11px; }

        @media (max-width: 1023px) { .qx-qi { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 620px) { .qx-qi { grid-template-columns: 1fr; row-gap: 36px; } }
        @media (prefers-reduced-motion: reduce) {
          .qx-qi-link, .qx-qi-ic { transition: none; }
        }
      `}</style>
    </section>
  );
}
