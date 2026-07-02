"use client";

import { useState } from "react";
import Link from "next/link";
import { QR_TOOLS } from "@/lib/qr-tools-meta";
import {
  FiGrid, FiImage, FiFileText, FiHome, FiShield, FiZap, FiCheckCircle,
  FiArrowRight, FiChevronRight, FiSearch,
} from "react-icons/fi";

const SIDE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: <FiHome size={15} /> },
  { href: "/qr-tools", label: "QR Tools", icon: <FiGrid size={15} />, active: true },
  { href: "/pdf-tools", label: "PDF Tools", icon: <FiFileText size={15} /> },
  { href: "/image-tools", label: "Image Tools", icon: <FiImage size={15} /> },
];

export default function QRToolsPage() {
  const [sort, setSort] = useState<"popular" | "az">("popular");
  const [query, setQuery] = useState("");

  const filtered = QR_TOOLS
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()) || t.desc.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (sort === "popular" ? b.popularity - a.popularity : a.title.localeCompare(b.title)));

  const FEATURED = [
    { href: "/link-in-bio", emoji: "🔗", title: "Link-in-Bio Page", desc: "All your links on one page — free, no signup.", grad: "linear-gradient(135deg,#7c3aed,#a78bfa)", badge: "New" },
    { href: "/poster", emoji: "🖼️", title: "QR Poster Maker", desc: "Printable ‘Scan me’ flyers for menus, reviews & more.", grad: "linear-gradient(135deg,#F58F20,#e07a10)", badge: "New" },
    { href: "/bulk-qr", emoji: "📦", title: "Bulk QR Generator", desc: "Create many QR codes from a CSV and download a ZIP.", grad: "linear-gradient(135deg,#0891b2,#22d3ee)" },
    { href: "/qr-tools/decode", emoji: "🔎", title: "QR Decoder", desc: "Read a QR code from any photo or screenshot.", grad: "linear-gradient(135deg,#0891b2,#22d3ee)", badge: "New" },
    { href: "/scanner", emoji: "📷", title: "QR Scanner", desc: "Scan any QR code with your camera.", grad: "linear-gradient(135deg,#16a34a,#4ade80)" },
  ];

  return (
    <div className="flex min-h-screen">
      {/* Чап мини-сайдбар */}
      <aside className="hidden lg:flex w-56 shrink-0 flex-col p-4 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
        <nav className="space-y-1">
          {SIDE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className={`qx-navlink ${l.active ? "active" : ""}`}>
              <span style={{ color: l.active ? "var(--primary-bright)" : undefined }}>{l.icon}</span> {l.label}
            </Link>
          ))}
        </nav>
        <div className="rounded-2xl p-4 mt-auto" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7 60%,#6366f1)" }}>
          <div className="font-display font-bold text-white text-sm">🚀 Upgrade to Pro</div>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,.75)" }}>Dynamic QR, analytics, no limits.</p>
          <Link href="/register" className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold" style={{ background: "rgba(255,255,255,.95)", color: "#6d28d9" }}>
            <FiZap size={12} /> Upgrade Now
          </Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 lg:p-7 max-w-[1500px]">
        <div className="flex items-center gap-2 text-xs mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/dashboard" className="hover:opacity-80">Dashboard</Link>
          <FiChevronRight size={12} />
          <span style={{ color: "var(--text)" }}>QR Tools</span>
        </div>

        {/* HERO */}
        <div className="qx-card qx-rise p-7 lg:p-8 relative overflow-hidden mb-8">
          <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,.25), transparent 70%)" }} />
          <div className="relative flex items-start gap-5">
            <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#7c3aed,#6366f1)", boxShadow: "0 12px 32px rgba(124,58,237,.4)" }}>
              <FiGrid size={28} />
            </span>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>QR Code Tools</h1>
              <p className="mt-2 text-sm max-w-md" style={{ color: "var(--text-muted)" }}>
                {QR_TOOLS.length}+ professional QR code generators — URL, WiFi, vCard, social, payments and more. Customize colors, add your logo, download PNG or SVG.
              </p>
            </div>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            {[
              { icon: <FiZap size={16} />, title: `${QR_TOOLS.length}+ QR Types`, sub: "Every use case", color: "#a78bfa" },
              { icon: <FiShield size={16} />, title: "Custom Design", sub: "Colors, logo, frames", color: "#22d3ee" },
              { icon: <FiCheckCircle size={16} />, title: "PNG & SVG", sub: "Free & unlimited", color: "#34d399" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${f.color} 14%, transparent)`, color: f.color }}>{f.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: "var(--text)" }}>{f.title}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured tools */}
        <h2 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--text)" }}>Featured</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-9">
          {FEATURED.map((tool, i) => (
            <Link key={tool.href} href={tool.href} className={`group qx-card qx-card-lift p-4 relative qx-rise qx-rise-${(i % 4) + 1}`}>
              {tool.badge && (
                <span className="absolute top-2.5 right-2.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--grad-primary)" }}>{tool.badge}</span>
              )}
              <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: tool.grad, boxShadow: "0 6px 18px rgba(0,0,0,.25)" }}>{tool.emoji}</span>
              <h3 className="text-sm font-bold leading-tight" style={{ color: "var(--text)" }}>{tool.title}</h3>
              <p className="text-[11px] mt-1 leading-snug" style={{ color: "var(--text-muted)" }}>{tool.desc}</p>
              <span className="flex items-center gap-1 text-[11px] font-bold mt-3 transition-transform group-hover:translate-x-1" style={{ color: "var(--primary-bright)" }}>
                Open <FiArrowRight size={11} />
              </span>
            </Link>
          ))}
        </div>

        {/* Search + sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>All QR Codes</h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
              <FiSearch size={14} style={{ color: "var(--text-faint)" }} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search QR types..."
                className="bg-transparent outline-none text-xs !border-0 !shadow-none w-32" style={{ color: "var(--text)", background: "transparent", border: "none" }} />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as "popular" | "az")} className="!text-xs !py-2 !px-3 font-semibold cursor-pointer" style={{ color: "var(--text)" }}>
              <option value="popular">Most Popular</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>

        {/* Карталар — кичик, кўп */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3">
          {filtered.map((tool, i) => (
            <Link key={tool.slug} href={`/qr-tools/${tool.slug}`} className={`group qx-card qx-card-lift p-4 relative qx-rise qx-rise-${(i % 4) + 1}`}>
              {tool.badge && (
                <span className="absolute top-2.5 right-2.5 text-[8px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--grad-primary)" }}>{tool.badge}</span>
              )}
              <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: tool.grad, boxShadow: "0 6px 18px rgba(0,0,0,.25)" }}>{tool.emoji}</span>
              <h3 className="text-sm font-bold leading-tight" style={{ color: "var(--text)" }}>{tool.title}</h3>
              <p className="text-[11px] mt-1 leading-snug" style={{ color: "var(--text-muted)" }}>{tool.desc}</p>
              <span className="flex items-center gap-1 text-[11px] font-bold mt-3 transition-transform group-hover:translate-x-1" style={{ color: "var(--primary-bright)" }}>
                Create <FiArrowRight size={11} />
              </span>
            </Link>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-sm py-12 text-center" style={{ color: "var(--text-muted)" }}>No QR types match "{query}"</div>
        )}
      </main>
    </div>
  );
}
