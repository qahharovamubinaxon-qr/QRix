"use client";

/* Dashboard widgets — Quick Actions + Favorites + Recently used. localStorage. */

import Link from "next/link";
import { FiHeart, FiClock, FiArrowRight, FiZap, FiSettings, FiUser, FiGrid, FiFileText, FiImage, FiVideo, FiCpu } from "react-icons/fi";
import { useFavorites, useRecents } from "@/lib/user-prefs";

const QUICK = [
  { href: "/qr-tools", label: "QR Tools", icon: <FiGrid size={18} />, c: "#22c55e" },
  { href: "/pdf-tools", label: "PDF Tools", icon: <FiFileText size={18} />, c: "#60a5fa" },
  { href: "/image-tools", label: "Image Tools", icon: <FiImage size={18} />, c: "#c084fc" },
  { href: "/ai-tools", label: "AI Tools", icon: <FiCpu size={18} />, c: "#fbbf24" },
  { href: "/video-tools", label: "Video Tools", icon: <FiVideo size={18} />, c: "#f472b6" },
  { href: "/history", label: "History", icon: <FiClock size={18} />, c: "#22d3ee" },
];

export default function DashboardExtras() {
  const favorites = useFavorites();
  const recents = useRecents();

  return (
    <div className="space-y-6 mt-6">
      {/* Quick actions */}
      <div className="qx-card p-6" data-reveal>
        <div className="flex items-center justify-between mb-4">
          <h2 className="qx-title" style={{ color: "var(--text)" }}><FiZap size={16} style={{ color: "var(--primary-bright)" }} /> Quick actions</h2>
          <span className="flex gap-2"><Link href="/settings" className="qx-btn-ghost !p-2" aria-label="Settings"><FiSettings size={15} /></Link><Link href="/account" className="qx-btn-ghost !p-2" aria-label="Account"><FiUser size={15} /></Link></span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {QUICK.map((q) => (
            <Link key={q.href} href={q.href} className="group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center text-white transition-transform group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${q.c}, ${q.c})`, boxShadow: `0 6px 16px -4px ${q.c}` }}>{q.icon}</span>
              <span className="text-[11px] font-bold text-center" style={{ color: "var(--text)" }}>{q.label}</span>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Favorites */}
        <div className="qx-card p-6" data-reveal>
          <div className="flex items-center justify-between mb-4"><h2 className="qx-title" style={{ color: "var(--text)" }}><FiHeart size={16} style={{ color: "#f87171" }} /> Favorites</h2><Link href="/favorites" className="text-[12px] font-bold" style={{ color: "var(--primary-bright)" }}>View all</Link></div>
          {favorites.length === 0 ? <p className="text-[13px] py-6 text-center" style={{ color: "var(--text-muted)" }}>💛 Heart any tool to pin it here.</p>
            : <div className="space-y-2">{favorites.slice(0, 4).map((t) => <Link key={t.href} href={t.href} className="group flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "var(--surface-2)" }}><span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)" }}><FiZap size={14} /></span><span className="flex-1 text-[13px] font-semibold truncate" style={{ color: "var(--text)" }}>{t.title}</span><FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--text-faint)" }} /></Link>)}</div>}
        </div>

        {/* Recently used */}
        <div className="qx-card p-6" data-reveal>
          <div className="flex items-center justify-between mb-4"><h2 className="qx-title" style={{ color: "var(--text)" }}><FiClock size={16} style={{ color: "var(--primary-bright)" }} /> Recently used</h2></div>
          {recents.length === 0 ? <p className="text-[13px] py-6 text-center" style={{ color: "var(--text-muted)" }}>Tools you open will show up here.</p>
            : <div className="space-y-2">{recents.slice(0, 4).map((t) => <Link key={t.href} href={t.href} className="group flex items-center gap-3 p-2.5 rounded-xl" style={{ background: "var(--surface-2)" }}><span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "var(--surface-hover)", color: "var(--text-muted)" }}><FiClock size={14} /></span><span className="flex-1 min-w-0"><span className="block text-[13px] font-semibold truncate" style={{ color: "var(--text)" }}>{t.title}</span>{t.group && <span className="block text-[10.5px]" style={{ color: "var(--text-faint)" }}>{t.group}</span>}</span><FiArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--text-faint)" }} /></Link>)}</div>}
        </div>
      </div>
    </div>
  );
}
