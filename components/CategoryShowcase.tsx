"use client";

/* Homepage — ALL TOOLS as a glass bento (Mission 49).
   Layout anatomy studied via the 21st.dev catalog (kokonutd's bento):
   icon chip + status badge on top, title + copy, tag links, hover CTA,
   mixed column spans. Re-authored here in QRix language: translucent
   glass tiles over the glitter canvas, category color washes, Unbounded
   titles, every link real. QR takes the featured 2x2 cell. */

import Link from "next/link";
import { FiArrowRight, FiArrowUpRight } from "react-icons/fi";

type Tool = { label: string; href: string; hint?: string };
type Cat = {
  name: string; count: string; color: string; href: string; emoji: string;
  copy: string;
  tools: Tool[];
  area: string;
};

const CATS: Cat[] = [
  {
    name: "QR Tools", count: "30+", color: "#22c55e", href: "/qr-tools", emoji: "🔳", area: "qr",
    copy: "Dynamic codes with live analytics, PIN protection and full design control.",
    tools: [
      { label: "URL QR Code", href: "/url-qr", hint: "Link → QR in a click" },
      { label: "WiFi QR", href: "/qr-tools/wifi", hint: "Share WiFi without passwords" },
      { label: "vCard QR", href: "/qr-tools/vcard", hint: "Contact card in one scan" },
      { label: "Bulk QR from CSV", href: "/bulk-qr", hint: "Hundreds of codes at once" },
      { label: "QR Scanner", href: "/scanner", hint: "Decode any QR in-browser" },
    ],
  },
  {
    name: "PDF Tools", count: "24+", color: "#60a5fa", href: "/pdf-tools", emoji: "📄", area: "pdf",
    copy: "Merge, compress, convert and OCR — right in the browser.",
    tools: [
      { label: "Merge PDF", href: "/pdf-tools/merge" },
      { label: "Compress", href: "/pdf-tools/compress" },
      { label: "PDF to Word", href: "/pdf-tools/pdf-to-word" },
      { label: "OCR", href: "/pdf-tools/ocr" },
    ],
  },
  {
    name: "Image Tools", count: "70+", color: "#c084fc", href: "/image-tools", emoji: "🖼️", area: "img",
    copy: "Cut, compress and perfect any picture.",
    tools: [
      { label: "Remove BG", href: "/image-tools/remove-bg" },
      { label: "Compress", href: "/image-tools/compress" },
      { label: "Crop", href: "/image-tools/crop-image" },
    ],
  },
  {
    name: "AI Tools", count: "28+", color: "#fbbf24", href: "/ai-tools", emoji: "✨", area: "ai",
    copy: "Upscale, colorize, generate — AI on your files.",
    tools: [
      { label: "Upscaler", href: "/ai-tools/image-upscaler" },
      { label: "AI Remove BG", href: "/ai-tools/background-remover" },
      { label: "Logo Maker", href: "/ai-tools/logo-generator" },
    ],
  },
  {
    name: "Video Tools", count: "29+", color: "#f472b6", href: "/video-tools", emoji: "🎬", area: "vid",
    copy: "Trim, compress, GIF — no upload, no watermark.",
    tools: [
      { label: "Compress", href: "/video-tools/compress-video" },
      { label: "Trim", href: "/video-tools/trim-video" },
      { label: "GIF Maker", href: "/video-tools/create-gif" },
      { label: "Merge", href: "/video-tools/merge-videos" },
    ],
  },
  {
    name: "3D Tools", count: "New", color: "#22d3ee", href: "/3d-tools", emoji: "🧊", area: "d3",
    copy: "Turn a photo into a textured 3D model.",
    tools: [
      { label: "Image to 3D", href: "/3d-tools/image-to-3d" },
      { label: "GLB · OBJ · STL", href: "/3d-tools/image-to-3d" },
    ],
  },
];

export default function CategoryShowcase() {
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

      <div className="qx-bn" data-stagger>
        {CATS.map((cat, i) => {
          const featured = cat.area === "qr";
          return (
            <div key={cat.name}
              className={`qx-bn-cell qx-bn-cell--${cat.area}`}
              style={{ ["--bn" as string]: cat.color, ["--rv-delay" as string]: `${i * 70}ms` } as React.CSSProperties}
              data-reveal
            >
              <div className="qx-bn-dots" aria-hidden />

              <div className="qx-bn-top">
                <span className="qx-bn-ico" aria-hidden>{cat.emoji}</span>
                <span className="qx-mono qx-bn-count">{cat.count} TOOLS</span>
              </div>

              <h3 className="qx-bn-name">{cat.name}</h3>
              <p className="qx-bn-copy">{cat.copy}</p>

              {featured ? (
                <ul className="qx-bn-list">
                  {cat.tools.map((tool) => (
                    <li key={tool.label}>
                      <Link href={tool.href} className="qx-bn-row">
                        <span className="qx-bn-row-label">{tool.label}</span>
                        <span className="qx-bn-row-hint">{tool.hint}</span>
                        <FiArrowUpRight size={13} className="qx-bn-row-ic" aria-hidden />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="qx-bn-chips">
                  {cat.tools.map((tool) => (
                    <Link key={tool.label} href={tool.href} className="qx-bn-chip">{tool.label}</Link>
                  ))}
                </div>
              )}

              <Link href={cat.href} className="qx-bn-all">
                All {cat.name.toLowerCase()} <FiArrowRight size={12} aria-hidden />
              </Link>
            </div>
          );
        })}
      </div>

      <style>{`
        .qx-bn {
          display: grid; gap: 12px;
          grid-template-columns: repeat(4, 1fr);
          grid-template-areas:
            "qr qr pdf pdf"
            "qr qr img ai"
            "vid vid d3 d3";
        }
        .qx-bn-cell--qr { grid-area: qr; }
        .qx-bn-cell--pdf { grid-area: pdf; }
        .qx-bn-cell--img { grid-area: img; }
        .qx-bn-cell--ai { grid-area: ai; }
        .qx-bn-cell--vid { grid-area: vid; }
        .qx-bn-cell--d3 { grid-area: d3; }

        .qx-bn-cell {
          position: relative; overflow: hidden;
          display: flex; flex-direction: column;
          padding: 22px 24px 18px; border-radius: 20px;
          background:
            radial-gradient(120% 90% at 85% -10%, color-mix(in srgb, var(--bn) 14%, transparent) 0%, transparent 55%),
            rgba(255, 255, 255, 0.045);
          backdrop-filter: var(--glass-blur);
          border: 1px solid rgba(255, 255, 255, 0.11);
          transition: transform 0.3s var(--ease-out), border-color 0.3s, background 0.3s;
          will-change: transform;
        }
        .qx-bn-cell:hover {
          transform: translateY(-3px);
          border-color: color-mix(in srgb, var(--bn) 45%, transparent);
        }
        html.light .qx-bn-cell {
          background:
            radial-gradient(120% 90% at 85% -10%, color-mix(in srgb, var(--bn) 10%, transparent) 0%, transparent 55%),
            rgba(255, 255, 255, 0.72);
          border-color: rgba(0, 0, 0, 0.09);
        }

        /* dotted texture breathes in on hover (bento archetype) */
        .qx-bn-dots {
          position: absolute; inset: 0; opacity: 0; pointer-events: none;
          background-image: radial-gradient(circle at center, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 5px 5px;
          transition: opacity 0.35s;
        }
        .qx-bn-cell:hover .qx-bn-dots { opacity: 1; }

        .qx-bn-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .qx-bn-ico {
          width: 38px; height: 38px; border-radius: 12px;
          display: grid; place-items: center; font-size: 19px;
          background: color-mix(in srgb, var(--bn) 18%, transparent);
          border: 1px solid color-mix(in srgb, var(--bn) 30%, transparent);
        }
        .qx-bn-count {
          font-size: 9.5px; letter-spacing: 0.2em; padding: 5px 10px;
          border-radius: 99px; color: var(--bn);
          border: 1px solid color-mix(in srgb, var(--bn) 35%, transparent);
          background: color-mix(in srgb, var(--bn) 10%, transparent);
        }

        .qx-bn-name {
          font-family: "Unbounded", var(--font-display), sans-serif;
          font-weight: 800; font-size: 17px; letter-spacing: -0.01em;
          color: var(--text); line-height: 1.15;
        }
        .qx-bn-cell--qr .qx-bn-name { font-size: 22px; }
        .qx-bn-copy { margin-top: 6px; font-size: 12.5px; line-height: 1.6; color: var(--text-muted); }

        /* featured cell: real tool rows */
        .qx-bn-list { margin-top: 14px; display: flex; flex-direction: column; flex: 1; }
        .qx-bn-row {
          display: grid; grid-template-columns: auto 1fr auto;
          align-items: baseline; gap: 10px;
          padding: 8px 2px; text-decoration: none;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          transition: padding-left 0.2s ease-out;
        }
        .qx-bn-row:hover { padding-left: 8px; }
        .qx-bn-row-label { font-weight: 650; font-size: 13.5px; color: var(--text); white-space: nowrap; }
        .qx-bn-row-hint {
          font-size: 11.5px; color: var(--text-muted);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .qx-bn-row-ic { opacity: 0; transform: translate(-4px, 4px); transition: 0.2s; color: var(--bn); align-self: center; }
        .qx-bn-row:hover .qx-bn-row-ic { opacity: 1; transform: none; }

        /* compact cells: tool chips */
        .qx-bn-chips { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
        .qx-bn-chip {
          font-size: 11.5px; font-weight: 600; text-decoration: none;
          padding: 5px 11px; border-radius: 99px; color: var(--text-muted);
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.04);
          transition: color 0.2s, border-color 0.2s, background 0.2s;
        }
        .qx-bn-chip:hover {
          color: var(--text);
          border-color: color-mix(in srgb, var(--bn) 50%, transparent);
          background: color-mix(in srgb, var(--bn) 12%, transparent);
        }
        html.light .qx-bn-chip { border-color: rgba(0, 0, 0, 0.1); background: rgba(0, 0, 0, 0.03); }

        .qx-bn-all {
          margin-top: auto; padding-top: 14px;
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 700; color: var(--bn); text-decoration: none;
          opacity: 0.85; transition: opacity 0.25s, gap 0.25s;
        }
        .qx-bn-all:hover { opacity: 1; gap: 10px; }

        @media (max-width: 1023px) {
          .qx-bn {
            grid-template-columns: 1fr 1fr;
            grid-template-areas:
              "qr qr"
              "pdf img"
              "ai vid"
              "d3 d3";
          }
        }
        @media (max-width: 560px) {
          .qx-bn { grid-template-columns: 1fr; grid-template-areas: "qr" "pdf" "img" "ai" "vid" "d3"; }
        }
        @media (prefers-reduced-motion: reduce) {
          .qx-bn-cell, .qx-bn-dots, .qx-bn-row { transition: none !important; }
        }
      `}</style>
    </section>
  );
}
