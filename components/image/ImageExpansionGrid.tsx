"use client";

/* Premium grid of the NEW image tools (lib/image-tools-meta) with instant
   search + category filter. Rendered below the existing landing grid. */

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { IMAGE_TOOLS, IMG_CATEGORIES, type ImgCategory } from "@/lib/image-tools-meta";

export default function ImageExpansionGrid() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<ImgCategory | "All">("All");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return IMAGE_TOOLS.filter((t) => (cat === "All" || t.category === cat) &&
      (!s || t.title.toLowerCase().includes(s) || t.keywords.some((k) => k.includes(s))));
  }, [q, cat]);

  return (
    <section className="mt-14" aria-label="More image tools">
      <div className="text-center mb-8" data-reveal>
        <span className="qx-badge-hero inline-flex mb-4">✨ {IMAGE_TOOLS.length} more image tools</span>
        <h2 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>
          A full <span className="qx-aurora">image studio</span>
        </h2>
        <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: "var(--text-muted)" }}>
          Adjust, filter, transform, convert, resize for social, and more — all private and on-device.
        </p>
      </div>

      <div className="max-w-md mx-auto mb-5">
        <div className="flex items-center gap-3 rounded-full px-5 py-3" style={{ background: "var(--surface-solid)", border: "1px solid var(--border-glass)", boxShadow: "var(--shadow-card)" }}>
          <FiSearch size={16} style={{ color: "var(--primary-bright)" }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search image tools…" className="flex-1 bg-transparent outline-none text-[14px]" style={{ color: "var(--text)" }} aria-label="Search image tools" />
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {(["All", ...IMG_CATEGORIES] as const).map((c) => (
          <button key={c} onClick={() => setCat(c)} className="px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all"
            style={{ background: cat === c ? "var(--grad-primary)" : "var(--surface-2)", color: cat === c ? "#0b0b0b" : "var(--text)", border: `1px solid ${cat === c ? "transparent" : "var(--border)"}` }}>
            {c}
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((t, i) => (
          <Link key={t.slug} href={`/image-tools/${t.slug}`} className="group qx-card qx-card-lift p-5 flex flex-col relative"
            data-reveal="scale" style={{ ["--rv-delay" as string]: `${Math.min(i, 8) * 60}ms` } as React.CSSProperties}>
            <span className="flex gap-1.5 absolute" style={{ top: 12, right: 12, zIndex: 3 }}>
              {t.isNew && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "color-mix(in srgb, var(--accent) 85%, #000)" }}>NEW</span>}
              {t.popular && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)", border: "1px solid var(--border-hover)" }}>POPULAR</span>}
            </span>
            <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: t.grad, boxShadow: "0 6px 18px rgba(0,0,0,.25)" }}>{t.emoji}</span>
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
