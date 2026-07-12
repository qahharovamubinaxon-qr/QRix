"use client";

/* The full image studio (Mission 58): ONE grid for everything.
   The seven flagship tools lead as "Essentials", followed by the whole
   config-driven studio (lib/image-tools-meta) — instant search + category
   chips cover all of it together. */

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { IMAGE_TOOLS, IMG_CATEGORIES, type ImgCategory } from "@/lib/image-tools-meta";

type Item = {
  href: string; emoji: string; title: string; intro: string;
  category: string; keywords: string[];
  isNew?: boolean; popular?: boolean; ai?: boolean;
};

const ESSENTIALS: Item[] = [
  { href: "/image-tools/remove-bg", emoji: "🪄", title: "Background Remover", intro: "Remove the background automatically with AI — clean transparent PNG in seconds.", category: "Essentials", keywords: ["background", "remove", "transparent", "cutout"], ai: true, popular: true },
  { href: "/image-tools/image-to-text", emoji: "🔤", title: "Image to Text (OCR)", intro: "Extract text from photos and screenshots in English, Russian & Uzbek.", category: "Essentials", keywords: ["ocr", "text", "extract", "scan"], ai: true },
  { href: "/image-tools/compress", emoji: "🗜️", title: "Compress Image", intro: "Shrink JPG, PNG and WebP by up to 80% without visible quality loss.", category: "Essentials", keywords: ["compress", "size", "optimize"], popular: true },
  { href: "/image-tools/resize", emoji: "📐", title: "Resize Image", intro: "Exact pixel dimensions with optional aspect-ratio lock.", category: "Essentials", keywords: ["resize", "dimensions", "scale"] },
  { href: "/image-tools/convert", emoji: "🔄", title: "Convert Image", intro: "Switch between JPG, PNG and WebP in one click.", category: "Essentials", keywords: ["convert", "jpg", "png", "webp", "format"] },
  { href: "/image-tools/upscale", emoji: "✨", title: "Image Enhancer", intro: "Upscale 2×–4× and sharpen blurry photos.", category: "Essentials", keywords: ["upscale", "enhance", "sharpen", "enlarge"], isNew: true },
  { href: "/image-tools/exif-remover", emoji: "🛡️", title: "EXIF Remover", intro: "Strip GPS location and hidden metadata before sharing.", category: "Essentials", keywords: ["exif", "metadata", "gps", "privacy"], isNew: true },
];

const STUDIO: Item[] = IMAGE_TOOLS.map((t) => ({
  href: `/image-tools/${t.slug}`, emoji: t.emoji, title: t.title, intro: t.intro,
  category: t.category, keywords: t.keywords,
  isNew: t.isNew, popular: t.popular,
}));

const ALL_ITEMS: Item[] = [...ESSENTIALS, ...STUDIO];
const CATS = ["All", "Essentials", ...IMG_CATEGORIES] as const;

export default function ImageExpansionGrid() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<(typeof CATS)[number]>("All");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return ALL_ITEMS.filter((t) => (cat === "All" || t.category === cat) &&
      (!s || t.title.toLowerCase().includes(s) || t.keywords.some((k) => k.includes(s))));
  }, [q, cat]);

  return (
    <section aria-label="All image tools">
      {/* search + category chips */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 rounded-full px-5 py-3 w-full lg:max-w-sm"
          style={{ background: "var(--surface-solid)", border: "1px solid var(--border-glass)", boxShadow: "var(--shadow-card)" }}>
          <FiSearch size={16} style={{ color: "var(--primary-bright)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${ALL_ITEMS.length} image tools…`}
            className="flex-1 bg-transparent outline-none text-[14px]" style={{ color: "var(--text)" }}
            aria-label="Search image tools" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
              style={{
                background: cat === c ? "var(--grad-primary)" : "var(--surface-2)",
                color: cat === c ? "#0b0b0b" : "var(--text)",
                border: `1px solid ${cat === c ? "transparent" : "var(--border)"}`,
              }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((t, i) => (
          <Link key={t.href} href={t.href} className="group qx-card qx-card-lift p-5 flex flex-col relative"
            data-reveal="scale" style={{ ["--rv-delay" as string]: `${Math.min(i, 8) * 50}ms` } as React.CSSProperties}>
            <span className="flex gap-1.5 absolute" style={{ top: 12, right: 12, zIndex: 3 }}>
              {t.ai && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(124,58,237,.18)", color: "#c4b5fd", border: "1px solid rgba(124,58,237,.4)" }}>AI</span>}
              {t.isNew && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "color-mix(in srgb, var(--accent) 85%, #000)" }}>NEW</span>}
              {t.popular && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)", border: "1px solid var(--border-hover)" }}>POPULAR</span>}
            </span>
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>{t.emoji}</span>
            <h3 className="text-[14.5px] font-bold leading-tight" style={{ color: "var(--text)" }}>{t.title}</h3>
            <p className="text-[11.5px] mt-1.5 leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>{t.intro}</p>
            <span className="inline-flex items-center gap-1 text-[11.5px] font-bold mt-3 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>Open <FiArrowRight size={11} /></span>
          </Link>
        ))}
      </div>
      {filtered.length === 0 && <p className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>Nothing matches “{q}”.</p>}
    </section>
  );
}
