"use client";

/* /video-tools landing — premium hero, instant search, category filters,
   popular/new rails, full grid. Mirrors the AI landing pattern. */

import Link from "next/link";
import { useMemo, useState } from "react";
import { FiSearch, FiArrowRight, FiFilm } from "react-icons/fi";
import { VIDEO_TOOLS, VIDEO_CATEGORIES, type VideoCategory } from "@/lib/video-tools-meta";

function ToolCard({ t, i }: { t: (typeof VIDEO_TOOLS)[number]; i: number }) {
  return (
    <Link href={`/video-tools/${t.slug}`}
      className="group qx-card qx-card-lift p-5 flex flex-col"
      data-reveal="scale" style={{ ["--rv-delay" as string]: `${Math.min(i, 8) * 70}ms` } as React.CSSProperties}>
      <div className="flex items-start justify-between mb-3">
        <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: t.grad, boxShadow: "0 8px 22px rgba(0,0,0,.3)" }}>
          {t.emoji}
        </span>
        <span className="flex gap-1.5">
          {t.status === "preview" && (
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "color-mix(in srgb, var(--accent) 16%, transparent)", color: "var(--accent)", border: "1px solid color-mix(in srgb, var(--accent) 35%, transparent)" }}>SOON+</span>
          )}
          {t.isNew && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ position: "relative", background: "color-mix(in srgb, var(--accent) 85%, #000)" }}>NEW</span>}
          {t.popular && <span className="text-[9px] font-bold px-2 py-0.5 rounded-full" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)", border: "1px solid var(--border-hover)" }}>POPULAR</span>}
        </span>
      </div>
      <h3 className="font-display text-[15.5px] font-bold leading-snug" style={{ color: "var(--text)" }}>{t.title}</h3>
      <p className="text-[12px] mt-1.5 leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>{t.intro}</p>
      <span className="inline-flex items-center gap-1 text-[12px] font-bold mt-3 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
        Open tool <FiArrowRight size={12} />
      </span>
    </Link>
  );
}

export default function VideoToolsLanding() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<VideoCategory | "All">("All");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return VIDEO_TOOLS.filter((t) =>
      (cat === "All" || t.category === cat) &&
      (!s || t.title.toLowerCase().includes(s) || t.keywords.some((k) => k.includes(s)))
    );
  }, [q, cat]);

  const popular = VIDEO_TOOLS.filter((t) => t.popular);
  const fresh = VIDEO_TOOLS.filter((t) => t.isNew);
  const liveCount = VIDEO_TOOLS.filter((t) => t.status === "live").length;

  return (
    <main className="max-w-[1400px] mx-auto px-5 lg:px-8 py-12 lg:py-16">
      <div className="text-center mb-12 relative">
        <div className="absolute inset-x-0 -top-10 h-64 pointer-events-none" aria-hidden
          style={{ background: "radial-gradient(600px circle at 50% 0%, color-mix(in srgb, var(--primary) 10%, transparent), transparent 70%)" }} />
        <span className="qx-badge-hero inline-flex mb-5 relative">
          <FiFilm size={13} style={{ marginRight: 6 }} /> {liveCount} tools live · on-device processing · free forever
        </span>
        <h1 className="font-display text-4xl lg:text-6xl font-extrabold relative" style={{ color: "var(--text)" }}>
          The <span className="qx-aurora">video studio</span> in your browser
        </h1>
        <p className="mt-4 text-[15px] max-w-xl mx-auto relative" style={{ color: "var(--text-muted)" }}>
          Trim, compress, convert, GIF, subtitles — no uploads, no queues, no watermarks. Your files never leave your device.
        </p>

        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="flex items-center gap-3 rounded-full px-5 py-3.5"
            style={{ background: "var(--surface-solid)", border: "1px solid var(--border-glass)", boxShadow: "var(--shadow-card)" }}>
            <FiSearch size={17} style={{ color: "var(--primary-bright)" }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search video tools…"
              className="flex-1 bg-transparent outline-none text-[14.5px]" style={{ color: "var(--text)" }} aria-label="Search video tools" />
          </div>
        </div>
        <div className="mt-5 flex flex-wrap justify-center gap-2 relative">
          {(["All", ...VIDEO_CATEGORIES] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className="px-4 py-2 rounded-full text-[12.5px] font-bold transition-all"
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

      {!q && cat === "All" && (
        <>
          <section className="mb-10" aria-label="Popular video tools">
            <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>🔥 Most popular</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
              {popular.map((t, i) => <ToolCard key={t.slug} t={t} i={i} />)}
            </div>
          </section>
          {fresh.length > 0 && (
            <section className="mb-10" aria-label="New video tools">
              <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>✨ Just added</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {fresh.map((t, i) => <ToolCard key={t.slug} t={t} i={i} />)}
              </div>
            </section>
          )}
        </>
      )}

      <section aria-label="All video tools">
        <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>
          {q || cat !== "All" ? `Results (${filtered.length})` : `All video tools (${VIDEO_TOOLS.length})`}
        </h2>
        {filtered.length === 0 ? (
          <p className="text-sm py-10 text-center" style={{ color: "var(--text-muted)" }}>Nothing matches “{q}” — try another word.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((t, i) => <ToolCard key={t.slug} t={t} i={i} />)}
          </div>
        )}
      </section>
    </main>
  );
}
