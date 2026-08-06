"use client";

/* Homepage — ALL TOOLS.
   The six categories are rendered as "spec sheet" cards (adapted from a Uiverse
   concept by uiverse-astronaut): a mono header bar with an index badge, the category
   name and a LIVE chip, then the tool count as the headline figure, the top tools as
   links, and a jump to the full category. The source's ember accent (#f65a1a) is
   swapped for the QRix brand orange. */

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
      { label: "URL QR Code", href: "/qr-tools/url" },
      { label: "WiFi QR", href: "/qr-tools/wifi" },
      { label: "vCard QR", href: "/qr-tools/vcard" },
      { label: "Bulk QR from CSV", href: "/bulk-qr" },
      { label: "QR Scanner", href: "/scanner" },
      /* Same orphan problem as /convert and /resize: 14 barcode URLs that
         nothing on the site linked to. Barcodes sit next to QR for a reader. */
      { label: "Barcode Generator", href: "/barcode" },
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
      /* /convert and /resize are image operations and belong here, but the
         reason they are listed at all is that they had no internal link from
         anywhere: Google had never crawled either hub, or any of the 153 pages
         under them, because a sitemap entry was their only route in (M147e). */
      { label: "Convert Image Format", href: "/convert" },
      { label: "Resize to Exact Size", href: "/resize" },
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
      <div className="mb-12 lg:mb-16" data-reveal>
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
          <article key={cat.name} className="qx-spec" data-reveal
            style={{ ["--rv-delay" as string]: `${i * 60}ms` } as React.CSSProperties}>
            <header className="qx-spec__bar">
              <span className="qx-spec__id">0{i + 1}</span>
              <span className="qx-spec__title">{cat.name}</span>
              <span className="qx-spec__status qx-spec__status--live">Live</span>
            </header>

            <div className="qx-spec__body">
              <div className="qx-spec__eyebrow">Tools available</div>
              <div className="qx-spec__figure">
                {cat.count}
                {/\d/.test(cat.count) && <span className="qx-spec__unit">tools</span>}
              </div>

              <ul className="qx-spec__list">
                {cat.tools.map((tool) => (
                  <li key={tool.label}>
                    <Link href={tool.href} className="qx-spec__link">
                      <span>{tool.label}</span>
                      <FiArrowUpRight size={13} className="qx-spec__ic" aria-hidden />
                    </Link>
                  </li>
                ))}
              </ul>

              <Link href={cat.href} className="qx-spec__all">
                All {cat.name.toLowerCase()} <FiArrowRight size={12} aria-hidden />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <style>{`
        .qx-qi {
          display: grid; grid-template-columns: repeat(3, 1fr);
          column-gap: clamp(20px, 2.4vw, 32px); row-gap: clamp(20px, 2.4vw, 32px);
        }

        /* ── spec-sheet card ── */
        /* Same spec-sheet layout, but on the SITE's material instead of the near-black
           graphite it shipped with — that graphite read as a different theme against
           the navy page. Now it is the site card glass (--card-bg / --glass-blur /
           --card-border), rounded like the rest of the cards, so the row sits in the
           same world as everything else. Standard backdrop-filter only (Lightning CSS
           drops the standard property if a -webkit- prefix follows it). */
        .qx-spec {
          --spec-ink: #0b0b0c;
          --spec-border: var(--card-border, rgba(255, 255, 255, 0.10));
          --spec-text: var(--text, #ecebe7);
          --spec-muted: #9aa3b2;
          --spec-accent: var(--primary, #ff4d1c);
          --spec-edge: rgba(255, 255, 255, 0.05);

          display: flex; flex-direction: column;
          background: var(--card-bg, linear-gradient(160deg, rgba(24,26,38,0.78), rgba(15,17,26,0.82)));
          backdrop-filter: var(--glass-blur, blur(20px) saturate(160%));
          border: 1px solid var(--spec-border);
          border-radius: 16px;
          box-shadow: var(--card-shadow, 0 10px 40px rgba(0,0,0,.45));
          overflow: hidden;
          transition: border-color .28s, box-shadow .28s, transform .28s var(--ease-out);
        }
        .qx-spec:hover {
          border-color: color-mix(in srgb, var(--spec-accent) 45%, var(--spec-border));
          box-shadow: var(--card-shadow, 0 10px 40px rgba(0,0,0,.45)), 0 16px 44px rgba(255,77,28,.14);
          transform: translateY(-3px);
        }

        .qx-spec__bar {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 16px;
          border-bottom: 1px solid var(--spec-border);
          background: linear-gradient(180deg, rgba(255,255,255,.02), transparent);
        }
        .qx-spec__id {
          display: inline-flex; align-items: center; justify-content: center;
          min-width: 28px; height: 22px; padding: 0 4px;
          border-radius: 2px;
          background: var(--spec-accent); color: var(--spec-ink);
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 11px; font-weight: 700; letter-spacing: .04em;
        }
        .qx-spec__title {
          flex: 1;
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 11px; text-transform: uppercase; letter-spacing: .12em;
          color: var(--spec-text);
        }
        .qx-spec__status {
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 11px; text-transform: uppercase; letter-spacing: .04em;
          color: var(--spec-muted);
          padding: 2px 8px;
          border: 1px solid var(--spec-border); border-radius: 2px;
        }
        .qx-spec__status--live {
          color: var(--spec-accent);
          border-color: color-mix(in srgb, var(--spec-accent) 55%, transparent);
        }

        .qx-spec__body { padding: 24px; display: flex; flex-direction: column; flex: 1; }
        .qx-spec__eyebrow {
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 10px; letter-spacing: .16em; text-transform: uppercase;
          color: var(--spec-muted); margin-bottom: 8px;
        }
        .qx-spec__figure {
          font-family: var(--font-display);
          font-size: 40px; font-weight: 800; letter-spacing: -.02em;
          color: var(--spec-text); line-height: 1.05;
          margin-bottom: 18px;
        }
        .qx-spec__unit {
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 12px; letter-spacing: .08em; text-transform: uppercase;
          color: var(--spec-muted); margin-left: 8px;
        }

        .qx-spec__list {
          display: flex; flex-direction: column;
          border-top: 1px solid var(--spec-border);
          padding-top: 6px; margin-bottom: 6px;
        }
        .qx-spec__link {
          display: flex; align-items: center; justify-content: space-between; gap: 10px;
          padding: 8px 0; font-size: 14px; color: var(--spec-muted);
          text-decoration: none;
          transition: color .22s, padding-left .22s;
        }
        .qx-spec__link:hover { color: var(--spec-text); padding-left: 5px; }
        .qx-spec__ic {
          opacity: 0; transform: translate(-4px, 4px); flex-shrink: 0;
          color: var(--spec-accent);
          transition: opacity .22s, transform .22s;
        }
        .qx-spec__link:hover .qx-spec__ic { opacity: 1; transform: none; }

        .qx-spec__all {
          margin-top: auto; padding-top: 12px;
          display: inline-flex; align-items: center; gap: 7px;
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 11px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;
          color: var(--spec-accent); text-decoration: none;
          transition: gap .25s;
        }
        .qx-spec__all:hover { gap: 11px; }

        @media (max-width: 1023px) { .qx-qi { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 620px)  { .qx-qi { grid-template-columns: 1fr; } }
        @media (prefers-reduced-motion: reduce) {
          .qx-spec, .qx-spec__link, .qx-spec__ic, .qx-spec__all { transition: none; }
        }
      `}</style>
    </section>
  );
}
