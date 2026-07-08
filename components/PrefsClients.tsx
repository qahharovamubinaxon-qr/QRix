"use client";

/* Client views for /favorites /history /settings /account — all localStorage
   backed via lib/user-prefs. Premium empty states + suggested tools. */

import Link from "next/link";
import Illustration from "@/components/Illustrations";
import { useEffect, useState } from "react";
import {
  FiHeart, FiClock, FiTrash2, FiDownload, FiArrowRight, FiSettings, FiUser,
  FiCheckCircle, FiSearch, FiAward, FiZap, FiShield, FiBell, FiGlobe, FiSun, FiMoon,
} from "react-icons/fi";
import { supabaseBrowser } from "@/lib/supabase-browser";
import {
  useFavorites, useRecents, useHistory, useSettings, useBookmarks, toggleFavorite,
  toggleBookmark, deleteJob, clearHistory, type ToolRef, type Job,
} from "@/lib/user-prefs";
import { toast } from "@/lib/toast";

const SUGGESTED: ToolRef[] = [
  { href: "/ai-tools/background-remover", title: "Background Remover", group: "AI" },
  { href: "/pdf-tools/merge", title: "Merge PDF", group: "PDF" },
  { href: "/image-tools/crop-image", title: "Crop Image", group: "Image" },
  { href: "/video-tools/compress-video", title: "Compress Video", group: "Video" },
  { href: "/qr-tools/url", title: "URL QR Code", group: "QR" },
  { href: "/barcode", title: "Barcode Generator", group: "QR" },
];

function PageHead({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-4 mb-8" data-reveal>
      <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: "var(--grad-primary)", color: "#0b0b0b", boxShadow: "0 10px 30px rgba(0,0,0,.3)" }}>{icon}</span>
      <div><h1 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>{title}</h1><p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{sub}</p></div>
    </div>
  );
}

function EmptyState({ emoji, title, desc, cta, href }: { emoji: string; title: string; desc: string; cta: string; href: string }) {
  // Illustration system (Mission 18): consistent art instead of a lone emoji.
  const art = emoji.includes("❤") || emoji.includes("⭐") ? "empty" : emoji.includes("🕘") || emoji.includes("🕐") || emoji.includes("📜") ? "analytics" : "empty";
  return (
    <div className="qx-card p-10 text-center" data-reveal="scale">
      <Illustration name={art as "empty"} size={130} className="mx-auto mb-4" />
      <h2 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{title}</h2>
      <p className="text-sm mt-2 max-w-sm mx-auto" style={{ color: "var(--text-muted)" }}>{desc}</p>
      <Link href={href} className="qx-btn-hero inline-flex mt-6" data-magnetic>{cta} <FiArrowRight size={15} /></Link>
      <div className="mt-8 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
        <div className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-faint)" }}>Suggested tools</div>
        <div className="flex flex-wrap gap-2 justify-center">
          {SUGGESTED.slice(0, 5).map((t) => <Link key={t.href} href={t.href} className="qx-btn-ghost !text-xs !py-1.5">{t.title}</Link>)}
        </div>
      </div>
    </div>
  );
}

function ToolRow({ t, onRemove }: { t: ToolRef; onRemove?: () => void }) {
  return (
    <div className="group qx-card qx-card-lift p-4 flex items-center gap-3" data-reveal>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)" }}><FiZap size={16} /></span>
      <Link href={t.href} className="flex-1 min-w-0"><span className="block text-[14px] font-bold truncate" style={{ color: "var(--text)" }}>{t.title}</span>{t.group && <span className="block text-[11px]" style={{ color: "var(--text-faint)" }}>{t.group}</span>}</Link>
      <Link href={t.href} className="qx-btn-ghost !p-2" aria-label="Open"><FiArrowRight size={14} /></Link>
      {onRemove && <button onClick={onRemove} className="qx-btn-ghost !p-2" aria-label="Remove"><FiTrash2 size={13} /></button>}
    </div>
  );
}

/* ── Favorites ── */
export function FavoritesView() {
  const favorites = useFavorites();
  const bookmarks = useBookmarks();
  return (
    <main className="max-w-4xl mx-auto px-5 py-12">
      <PageHead icon={<FiHeart size={22} />} title="Favorites" sub="Your pinned tools and saved articles, one click away." />
      {favorites.length === 0 && bookmarks.length === 0
        ? <EmptyState emoji="💛" title="Nothing saved yet" desc="Tap the heart on any tool page — or Save on a blog article — to pin it here." cta="Browse tools" href="/qr-tools" />
        : <>
          {favorites.length > 0 && <div className="grid sm:grid-cols-2 gap-3" data-stagger>{favorites.map((t) => <ToolRow key={t.href} t={t} onRemove={() => { toggleFavorite(t); toast.info("Removed from favorites"); }} />)}</div>}
          {bookmarks.length > 0 && <>
            <h2 className="qx-title mt-8 mb-3" style={{ color: "var(--text)" }}>📑 Saved articles</h2>
            <div className="grid sm:grid-cols-2 gap-3" data-stagger>{bookmarks.map((t) => <ToolRow key={t.href} t={t} onRemove={() => { toggleBookmark(t); toast.info("Bookmark removed"); }} />)}</div>
          </>}
        </>}
    </main>
  );
}

/* ── History ── */
function fmtAgo(at: number) {
  const s = (Date.now() - at) / 1000;
  if (s < 60) return "just now"; if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`; return `${Math.floor(s / 86400)}d ago`;
}
export function HistoryView() {
  const history = useHistory();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "done" | "failed">("all");
  const shown = history.filter((j) => (filter === "all" || j.status === filter) && (!q || j.file.toLowerCase().includes(q.toLowerCase()) || j.tool.toLowerCase().includes(q.toLowerCase())));
  return (
    <main className="max-w-4xl mx-auto px-5 py-12">
      <PageHead icon={<FiClock size={22} />} title="History" sub="Your recent downloads and processed files." />
      {history.length === 0
        ? <EmptyState emoji="🗂️" title="No history yet" desc="Files you create and download will appear here so you can grab them again." cta="Start creating" href="/pdf-tools" />
        : <>
          <div className="flex flex-wrap items-center gap-3 mb-5">
            <div className="flex items-center gap-2 rounded-full px-4 py-2 flex-1 min-w-[200px]" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}><FiSearch size={14} style={{ color: "var(--text-faint)" }} /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search history…" className="flex-1 bg-transparent outline-none text-[13px]" style={{ color: "var(--text)" }} /></div>
            <div className="flex gap-1.5">{(["all", "done", "failed"] as const).map((f) => <button key={f} onClick={() => setFilter(f)} className="px-3 py-1.5 rounded-lg text-[12px] font-bold capitalize" style={{ background: filter === f ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${filter === f ? "var(--primary-bright)" : "var(--border)"}`, color: "var(--text)" }}>{f}</button>)}</div>
            <button onClick={() => { clearHistory(); toast.warning("History cleared"); }} className="qx-btn-ghost !py-1.5 !text-xs"><FiTrash2 size={13} /> Clear all</button>
          </div>
          <div className="space-y-2" data-stagger>
            {shown.map((j: Job) => (
              <div key={j.id} className="qx-card p-3.5 flex items-center gap-3" data-reveal>
                <span className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: j.status === "done" ? "color-mix(in srgb,#34d399 14%,transparent)" : "color-mix(in srgb,#f87171 14%,transparent)", color: j.status === "done" ? "#34d399" : "#f87171" }}>{j.status === "done" ? <FiCheckCircle size={16} /> : <FiTrash2 size={15} />}</span>
                <div className="flex-1 min-w-0"><span className="block text-[13.5px] font-bold truncate" style={{ color: "var(--text)" }}>{j.file}</span><span className="block text-[11px]" style={{ color: "var(--text-faint)" }}>{j.tool} · {fmtAgo(j.at)}</span></div>
                {j.href && <Link href={j.href} className="qx-btn-ghost !p-2" aria-label="Open tool"><FiDownload size={14} /></Link>}
                <button onClick={() => deleteJob(j.id)} className="qx-btn-ghost !p-2" aria-label="Delete"><FiTrash2 size={13} /></button>
              </div>
            ))}
            {shown.length === 0 && <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No matching entries.</p>}
          </div>
        </>}
    </main>
  );
}

/* ── Settings ── */
export function SettingsView() {
  const [s, set] = useSettings();
  const [dark, setDark] = useState(true);
  const [lang, setLangState] = useState("en");
  useEffect(() => { setDark(!document.documentElement.classList.contains("light")); setLangState(localStorage.getItem("language") || "en"); }, []);
  useEffect(() => {
    const perf = s.performance || !s.animations;
    document.documentElement.classList.toggle("qx-perf", perf);
  }, [s.performance, s.animations]);

  function toggleTheme() {
    const nextDark = !dark; setDark(nextDark);
    if (nextDark) { document.documentElement.classList.remove("light"); localStorage.setItem("theme", "dark"); }
    else { document.documentElement.classList.add("light"); localStorage.setItem("theme", "light"); }
  }
  function changeLang(code: string) { setLangState(code); localStorage.setItem("language", code); toast.success("Language saved — reloading…"); setTimeout(() => location.reload(), 700); }

  const Toggle = ({ on, onClick }: { on: boolean; onClick: () => void }) => (
    <button onClick={onClick} role="switch" aria-checked={on} className="w-11 h-6 rounded-full relative transition-colors shrink-0" style={{ background: on ? "var(--grad-primary)" : "var(--surface-hover)" }}>
      <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: on ? 22 : 2, boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
    </button>
  );
  const Row = ({ icon, title, desc, children }: { icon: React.ReactNode; title: string; desc: string; children: React.ReactNode }) => (
    <div className="flex items-center gap-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
      <span className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "var(--surface-2)", color: "var(--primary-bright)" }}>{icon}</span>
      <div className="flex-1"><div className="text-[14px] font-bold" style={{ color: "var(--text)" }}>{title}</div><div className="text-[12px]" style={{ color: "var(--text-muted)" }}>{desc}</div></div>
      {children}
    </div>
  );

  return (
    <main className="max-w-2xl mx-auto px-5 py-12">
      <PageHead icon={<FiSettings size={22} />} title="Settings" sub="Personalize your QRix experience." />
      <div className="qx-card px-6 py-2" data-reveal="scale">
        <Row icon={dark ? <FiMoon size={17} /> : <FiSun size={17} />} title="Theme" desc={dark ? "Dark mode" : "Light mode"}><Toggle on={dark} onClick={toggleTheme} /></Row>
        <Row icon={<FiGlobe size={17} />} title="Language" desc="Interface language">
          <select value={lang} onChange={(e) => changeLang(e.target.value)} className="qx-auth-input !py-1.5 !px-3 w-32 !text-[13px]"><option value="en">English</option><option value="ru">Русский</option><option value="uz">Oʻzbek</option></select>
        </Row>
        <Row icon={<FiZap size={17} />} title="Animations" desc="Motion, reveals and floating effects"><Toggle on={s.animations} onClick={() => set("animations", !s.animations)} /></Row>
        <Row icon={<FiZap size={17} />} title="Performance mode" desc="Disable heavy decorative animations"><Toggle on={s.performance} onClick={() => set("performance", !s.performance)} /></Row>
        <Row icon={<FiBell size={17} />} title="Notifications" desc="Show toast notifications"><Toggle on={s.notifications} onClick={() => set("notifications", !s.notifications)} /></Row>
        <Row icon={<FiShield size={17} />} title="Privacy" desc="Files always processed on-device, never uploaded"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: "color-mix(in srgb,#34d399 14%,transparent)", color: "#34d399" }}>ON</span></Row>
      </div>
      <p className="text-[11px] text-center mt-4" style={{ color: "var(--text-faint)" }}>Preferences are stored locally on this device.</p>
    </main>
  );
}

/* ── Account ── */
export function AccountView() {
  const favorites = useFavorites();
  const recents = useRecents();
  const history = useHistory();
  const [email, setEmail] = useState<string | null>(null);
  useEffect(() => { supabaseBrowser.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null)); }, []);

  const initials = (email || "QX").slice(0, 2).toUpperCase();
  const downloads = history.length;
  const stats = [
    { label: "Favorites", value: favorites.length, icon: <FiHeart size={16} /> },
    { label: "Tools used", value: recents.length, icon: <FiZap size={16} /> },
    { label: "Downloads", value: downloads, icon: <FiDownload size={16} /> },
  ];
  const ACH = [
    { emoji: "🚀", title: "First download", got: downloads >= 1 },
    { emoji: "⭐", title: "Curator (3 favorites)", got: favorites.length >= 3 },
    { emoji: "🔥", title: "Explorer (5 tools)", got: recents.length >= 5 },
    { emoji: "💎", title: "Power user (20 downloads)", got: downloads >= 20 },
  ];

  return (
    <main className="max-w-3xl mx-auto px-5 py-12">
      <PageHead icon={<FiUser size={22} />} title="Account" sub="Your profile, stats and achievements." />
      <div className="qx-card p-6 flex items-center gap-4 mb-5" data-reveal>
        <span className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white" style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>{initials}</span>
        <div className="flex-1 min-w-0"><div className="text-[16px] font-bold truncate" style={{ color: "var(--text)" }}>{email || "Guest"}</div><div className="text-[12px]" style={{ color: "var(--text-muted)" }}>{email ? "QRix member" : "Not signed in — favorites & history stay on this device"}</div></div>
        {!email && <Link href="/register" className="qx-btn-hero !py-2 !px-4 text-sm">Sign up</Link>}
      </div>
      <div className="grid grid-cols-3 gap-3 mb-6" data-stagger>
        {stats.map((s) => <div key={s.label} className="qx-card p-5 text-center" data-reveal="scale"><span className="inline-flex mb-2" style={{ color: "var(--primary-bright)" }}>{s.icon}</span><div className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>{s.value}</div><div className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</div></div>)}
      </div>
      <h2 className="qx-title mb-3" style={{ color: "var(--text)" }}><FiAward size={16} style={{ color: "var(--primary-bright)" }} /> Achievements</h2>
      <div className="grid sm:grid-cols-2 gap-3" data-stagger>
        {ACH.map((a) => <div key={a.title} className="qx-card p-4 flex items-center gap-3" data-reveal style={{ opacity: a.got ? 1 : 0.5 }}><span className="text-2xl">{a.emoji}</span><div className="flex-1"><div className="text-[13.5px] font-bold" style={{ color: "var(--text)" }}>{a.title}</div><div className="text-[11px]" style={{ color: a.got ? "#34d399" : "var(--text-faint)" }}>{a.got ? "Unlocked" : "Locked"}</div></div>{a.got && <FiCheckCircle size={16} style={{ color: "#34d399" }} />}</div>)}
      </div>
    </main>
  );
}
