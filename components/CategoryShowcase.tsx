"use client";

/* Homepage — the tool directory, senior-minimal (Vercel/Linear language):
   a hairline-divided grid of six category cells. Category color appears ONLY
   as an 8px dot; every function is a real link to its page; one ember accent
   for the "all tools" action. No cards, no glow, no gimmicks — hierarchy,
   whitespace and real navigation do the premium work. */

import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

type Cat = {
  name: string; count: string; color: string; href: string;
  tools: { label: string; href: string }[];
};

const CATS: Cat[] = [
  {
    name: "QR Tools", count: "30+", color: "#22c55e", href: "/qr-tools",
    tools: [
      { label: "URL QR Code", href: "/url-qr" },
      { label: "WiFi QR", href: "/qr-tools/wifi" },
      { label: "vCard QR", href: "/qr-tools/vcard" },
      { label: "Bulk QR from CSV", href: "/bulk-qr" },
      { label: "QR Scanner", href: "/scanner" },
    ],
  },
  {
    name: "PDF Tools", count: "24+", color: "#60a5fa", href: "/pdf-tools",
    tools: [
      { label: "Merge PDF", href: "/pdf-tools/merge" },
      { label: "Compress PDF", href: "/pdf-tools/compress" },
      { label: "PDF to Word", href: "/pdf-tools/pdf-to-word" },
      { label: "Split PDF", href: "/pdf-tools/split" },
      { label: "OCR PDF", href: "/pdf-tools/ocr" },
    ],
  },
  {
    name: "Image Tools", count: "70+", color: "#c084fc", href: "/image-tools",
    tools: [
      { label: "Remove Background", href: "/image-tools/remove-bg" },
      { label: "Compress Image", href: "/image-tools/compress" },
      { label: "Crop Image", href: "/image-tools/crop-image" },
      { label: "Watermark", href: "/image-tools/watermark-image" },
      { label: "Color Picker", href: "/image-tools/color-picker" },
    ],
  },
  {
    name: "AI Tools", count: "28+", color: "#fbbf24", href: "/ai-tools",
    tools: [
      { label: "Image Upscaler", href: "/ai-tools/image-upscaler" },
      { label: "AI Background Remover", href: "/ai-tools/background-remover" },
      { label: "Logo Generator", href: "/ai-tools/logo-generator" },
      { label: "Colorize Photo", href: "/ai-tools/colorize-photo" },
      { label: "Face Enhancer", href: "/ai-tools/face-enhancer" },
    ],
  },
  {
    name: "Video Tools", count: "29+", color: "#f472b6", href: "/video-tools",
    tools: [
      { label: "Compress Video", href: "/video-tools/compress-video" },
      { label: "Trim Video", href: "/video-tools/trim-video" },
      { label: "GIF Maker", href: "/video-tools/create-gif" },
      { label: "Merge Videos", href: "/video-tools/merge-videos" },
      { label: "Resize Video", href: "/video-tools/resize-video" },
    ],
  },
  {
    name: "3D Tools", count: "New", color: "#22d3ee", href: "/3d-tools",
    tools: [
      { label: "Image to 3D Model", href: "/3d-tools/image-to-3d" },
      { label: "3D Preview & Export", href: "/3d-tools/image-to-3d" },
      { label: "GLB · OBJ · STL · USDZ", href: "/3d-tools/image-to-3d" },
    ],
  },
];

export default function CategoryShowcase() {
  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20 lg:pb-24" aria-label="Tool directory">
      {/* header */}
      <div className="mb-10 lg:mb-14" data-reveal>
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
          185+ tools
        </p>
        <h2 className="font-display font-extrabold tracking-tight leading-[1.05]"
          style={{ color: "var(--text)", fontSize: "clamp(28px, 3.6vw, 46px)" }}>
          Every tool. One place.
        </h2>
      </div>

      {/* hairline directory grid */}
      <div className="qx-dir" role="list">
        {CATS.map((cat, i) => (
          <div key={cat.name} className="qx-dir-cell" role="listitem" data-reveal
            style={{ ["--rv-delay" as string]: `${i * 70}ms` } as React.CSSProperties}>
            <div className="qx-dir-head">
              <span className="qx-dir-dot" style={{ background: cat.color }} aria-hidden />
              <span className="qx-dir-name">{cat.name}</span>
              <span className="qx-mono qx-dir-count">{cat.count}</span>
            </div>
            <ul className="qx-dir-list">
              {cat.tools.map((t) => (
                <li key={t.label}>
                  <Link href={t.href} className="qx-dir-link">
                    <span>{t.label}</span>
                    <FiArrowUpRight size={13} className="qx-dir-link-ic" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={cat.href} className="qx-dir-all">
              All {cat.name.toLowerCase()} <FiArrowRight size={13} aria-hidden />
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .qx-dir {
          display: grid; grid-template-columns: 1fr;
          border: 1px solid var(--qx-dir-line, rgba(255,255,255,0.07));
          border-radius: 18px; overflow: hidden;
          background: var(--qx-dir-bg, rgba(10, 8, 8, 0.42));
          backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
        }
        @media (min-width: 680px) { .qx-dir { grid-template-columns: repeat(2, 1fr); } }
        @media (min-width: 1100px) { .qx-dir { grid-template-columns: repeat(3, 1fr); } }
        .qx-dir-cell {
          display: flex; flex-direction: column;
          padding: 30px 32px 26px;
          border-top: 1px solid var(--qx-dir-line, rgba(255,255,255,0.07));
          border-left: 1px solid var(--qx-dir-line, rgba(255,255,255,0.07));
          margin-top: -1px; margin-left: -1px;
          transition: background 0.3s;
        }
        .qx-dir-cell:hover { background: rgba(255, 255, 255, 0.018); }
        html.light .qx-dir { --qx-dir-line: rgba(0,0,0,0.09); --qx-dir-bg: rgba(255,255,255,0.6); }
        html.light .qx-dir-cell:hover { background: rgba(0, 0, 0, 0.02); }

        .qx-dir-head { display: flex; align-items: center; gap: 10px; margin-bottom: 18px; }
        .qx-dir-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .qx-dir-name { font-family: var(--font-display); font-weight: 700; font-size: 15.5px; color: var(--text); letter-spacing: -0.01em; }
        .qx-dir-count { margin-left: auto; font-size: 11px; letter-spacing: 0.12em; color: var(--text-faint); }

        .qx-dir-list { display: flex; flex-direction: column; margin-bottom: 18px; }
        .qx-dir-link {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 7px 0; font-size: 14px; color: var(--text-muted); text-decoration: none;
          transition: color 0.22s, padding-left 0.22s;
        }
        .qx-dir-link:hover { color: var(--text); padding-left: 4px; }
        .qx-dir-link-ic { opacity: 0; transform: translate(-4px, 4px); transition: opacity 0.22s, transform 0.22s; color: var(--text-faint); flex-shrink: 0; }
        .qx-dir-link:hover .qx-dir-link-ic { opacity: 1; transform: none; }

        .qx-dir-all {
          margin-top: auto; display: inline-flex; align-items: center; gap: 7px;
          font-size: 13px; font-weight: 600; color: var(--primary-bright); text-decoration: none;
          transition: gap 0.25s;
        }
        .qx-dir-all:hover { gap: 11px; }
      `}</style>
    </section>
  );
}
