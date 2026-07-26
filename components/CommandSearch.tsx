"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch, FiCornerDownLeft, FiHeart, FiClock, FiGlobe,
  FiGrid, FiSettings, FiUser, FiHome, FiArrowRight, FiTrendingUp,
  FiStar, FiZap, FiMic,
} from "react-icons/fi";
import { searchIndex, suggestFor, type SearchGroup } from "@/lib/search-index";
import { trackTool } from "@/lib/track";
import { useFavorites, useRecents, useRecentSearches, recordSearch } from "@/lib/user-prefs";

type Row = { key: string; group: string; label: string; sub?: string; icon?: React.ReactNode; href?: string; run: () => void };

const FILTERS: { id: string; label: string; groups?: SearchGroup[] }[] = [
  { id: "all", label: "All" },
  { id: "tools", label: "Tools", groups: ["QR Tools", "PDF Tools", "Image Tools", "Video Tools"] },
  { id: "ai", label: "AI", groups: ["AI Tools"] },
  { id: "blog", label: "Blog", groups: ["Blog"] },
  { id: "docs", label: "Docs", groups: ["Docs", "FAQ"] },
  { id: "pages", label: "Pages", groups: ["Pages", "Categories"] },
];

const PIN_KEY = "qrix_pinned_commands";
const readPins = (): { href: string; label: string }[] => {
  try { return JSON.parse(localStorage.getItem(PIN_KEY) || "[]"); } catch { return []; }
};

/** Global ⌘K / Ctrl+K command palette — full-text search across every module
    (tools, AI, blog, docs, FAQ, pages) with filters, trending, pinned commands,
    debounced instant results, voice input and keyboard navigation. */
export default function CommandSearch({ defaultOpen = false }: { defaultOpen?: boolean } = {}) {
  const router = useRouter();
  const [open, setOpen] = useState(defaultOpen);
  const [q, setQ] = useState("");
  const [dq, setDq] = useState(""); // debounced query
  // Log searches that find NOTHING — users literally telling us which tool to
  // build next. Once per unique query per session.
  const missLogged = useRef<Set<string>>(new Set());
  useEffect(() => {
    const s = dq.trim().toLowerCase();
    if (s.length < 3 || missLogged.current.has(s)) return;
    if (searchIndex(dq, 1).length === 0) {
      missLogged.current.add(s);
      trackTool("search_miss", { q: s.slice(0, 60) });
    }
  }, [dq]);
  const [sel, setSel] = useState(0);
  const [filter, setFilter] = useState("all");
  const [pins, setPins] = useState<{ href: string; label: string }[]>([]);
  const [trending, setTrending] = useState<{ q: string; count: number }[]>([]);
  const [popular, setPopular] = useState<{ q: string; count: number }[]>([]);
  const [listening, setListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const favorites = useFavorites();
  const recents = useRecents();
  const recentSearches = useRecentSearches();

  // Debounce keystrokes → instant-feeling search without wasted renders.
  useEffect(() => {
    const t = setTimeout(() => setDq(q), 120);
    return () => clearTimeout(t);
  }, [q]);

  const close = useCallback(() => { setOpen(false); setQ(""); setDq(""); setSel(0); setFilter("all"); }, []);
  const nav = useCallback((href: string) => {
    if (q.trim().length >= 2) {
      recordSearch(q);
      fetch("/api/v1/search", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ q }) }).catch(() => {});
    }
    close();
    router.push(href);
  }, [q, close, router]);

  const setLang = useCallback((code: string) => { localStorage.setItem("language", code); close(); location.reload(); }, [close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); }
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (!open) return;
    setTimeout(() => inputRef.current?.focus(), 30);
    setPins(readPins());
    fetch("/api/v1/search").then((r) => r.json()).then((j) => {
      if (j?.ok) { setTrending(j.data.trending || []); setPopular(j.data.popular || []); }
    }).catch(() => {});
  }, [open]);

  const togglePin = useCallback((href: string, label: string) => {
    const cur = readPins();
    const next = cur.some((p) => p.href === href) ? cur.filter((p) => p.href !== href) : [{ href, label }, ...cur].slice(0, 6);
    localStorage.setItem(PIN_KEY, JSON.stringify(next));
    setPins(next);
  }, []);

  /** Voice search — progressive enhancement over the Web Speech API. */
  const voice = useCallback(() => {
    type SR = { new (): { lang: string; onresult: (e: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void; onend: () => void; start(): void } };
    const w = window as unknown as { SpeechRecognition?: SR; webkitSpeechRecognition?: SR };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) return;
    const rec = new Ctor();
    rec.lang = localStorage.getItem("language") === "ru" ? "ru-RU" : "en-US";
    rec.onresult = (e) => { setQ(e.results[0][0].transcript); setSel(0); };
    rec.onend = () => setListening(false);
    setListening(true);
    rec.start();
  }, []);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    const s = dq.trim().toLowerCase();
    const groups = FILTERS.find((f) => f.id === filter)?.groups;

    const COMMANDS: Row[] = [
      { key: "c-en", group: "Actions", label: "Language: English", icon: <FiGlobe size={15} />, run: () => setLang("en") },
      { key: "c-ru", group: "Actions", label: "Language: Русский", icon: <FiGlobe size={15} />, run: () => setLang("ru") },
      { key: "c-uz", group: "Actions", label: "Language: Oʻzbek", icon: <FiGlobe size={15} />, run: () => setLang("uz") },
      { key: "n-dash", group: "Go to", label: "Dashboard", icon: <FiGrid size={15} />, href: "/dashboard", run: () => nav("/dashboard") },
      { key: "n-ws", group: "Go to", label: "Workspace", icon: <FiGrid size={15} />, href: "/workspace", run: () => nav("/workspace") },
      { key: "n-fav", group: "Go to", label: "Favorites", icon: <FiHeart size={15} />, href: "/favorites", run: () => nav("/favorites") },
      { key: "n-hist", group: "Go to", label: "History", icon: <FiClock size={15} />, href: "/history", run: () => nav("/history") },
      { key: "n-set", group: "Go to", label: "Settings", icon: <FiSettings size={15} />, href: "/settings", run: () => nav("/settings") },
      { key: "n-acc", group: "Go to", label: "Account", icon: <FiUser size={15} />, href: "/account", run: () => nav("/account") },
      { key: "n-dev", group: "Go to", label: "Developers", icon: <FiZap size={15} />, href: "/developers", run: () => nav("/developers") },
      { key: "n-home", group: "Go to", label: "Home", icon: <FiHome size={15} />, href: "/", run: () => nav("/") },
    ];

    if (s) {
      if (filter === "all") COMMANDS.filter((c) => c.label.toLowerCase().includes(s)).forEach((c) => out.push(c));
      const hits = searchIndex(dq, 16, groups);
      hits.forEach((r) => out.push({ key: r.href + r.title, group: r.group, label: r.title, icon: <FiArrowRight size={13} />, href: r.href, run: () => nav(r.href) }));
      if (!hits.length) {
        // No-result suggestions: closest matches + popular tools.
        suggestFor(dq).forEach((r) => out.push({ key: "sug" + r.href, group: "Did you mean", label: r.title, sub: r.group, icon: <FiSearch size={13} />, href: r.href, run: () => nav(r.href) }));
        popular.slice(0, 4).forEach((p) => out.push({ key: "pop" + p.q, group: "Popular tools", label: p.q, icon: <FiTrendingUp size={13} />, href: p.q, run: () => nav(p.q) }));
      }
      return out;
    }

    pins.forEach((p) => out.push({ key: "pin" + p.href, group: "Pinned", label: p.label, icon: <FiStar size={14} style={{ color: "#fbbf24" }} />, href: p.href, run: () => nav(p.href) }));
    favorites.slice(0, 5).forEach((f) => out.push({ key: "f" + f.href, group: "Favorites", label: f.title, sub: f.group, icon: <FiHeart size={14} style={{ color: "#f87171" }} />, href: f.href, run: () => nav(f.href) }));
    recents.slice(0, 5).forEach((r) => out.push({ key: "r" + r.href, group: "Recent", label: r.title, sub: r.group, icon: <FiClock size={14} />, href: r.href, run: () => nav(r.href) }));
    trending.slice(0, 4).forEach((t) => out.push({ key: "t" + t.q, group: "Trending searches", label: t.q, sub: `${t.count}×`, icon: <FiTrendingUp size={13} />, run: () => setQ(t.q) }));
    recentSearches.slice(0, 4).forEach((rs) => out.push({ key: "s" + rs, group: "Recent searches", label: rs, icon: <FiSearch size={13} />, run: () => setQ(rs) }));
    COMMANDS.forEach((c) => out.push(c));
    return out;
  }, [dq, filter, favorites, recents, recentSearches, trending, popular, pins, nav, setLang]);

  useEffect(() => { setSel(0); }, [dq, filter]);

  if (!open) return null;
  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "rgba(5,5,10,0.55)", backdropFilter: "blur(6px)" }}
      onClick={close} role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="w-full max-w-xl rounded-2xl overflow-hidden qx-page-in"
        style={{ background: "var(--surface-solid)", border: "1px solid var(--border-glass)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <FiSearch size={17} style={{ color: "var(--primary-bright)" }} />
          <input ref={inputRef} value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((n) => Math.min(n + 1, rows.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel((n) => Math.max(n - 1, 0)); }
              else if (e.key === "Enter" && rows[sel]) { e.preventDefault(); rows[sel].run(); }
              else if (e.key === "Tab") { e.preventDefault(); const i = FILTERS.findIndex((f) => f.id === filter); setFilter(FILTERS[(i + 1) % FILTERS.length].id); }
            }}
            placeholder="Search tools, docs, blog… (Tab = filter)"
            className="flex-1 bg-transparent outline-none text-[15px]" style={{ color: "var(--text)" }} aria-label="Search" />
          <button onClick={voice} title="Voice search" aria-label="Voice search" className="p-1"
            style={{ color: listening ? "#f87171" : "var(--text-faint)" }}>
            <FiMic size={15} className={listening ? "animate-pulse" : ""} />
          </button>
          <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-faint)", border: "1px solid var(--border)" }}>ESC</kbd>
        </div>

        {/* Filters */}
        <div className="flex gap-1 px-4 py-2 flex-wrap" style={{ borderBottom: "1px solid var(--border)" }} role="tablist" aria-label="Search filters">
          {FILTERS.map((f) => (
            <button key={f.id} role="tab" aria-selected={filter === f.id} onClick={() => setFilter(f.id)}
              className="px-2.5 py-1 rounded-lg text-[11px] font-bold"
              style={filter === f.id ? { background: "var(--grad-primary)", color: "#0b0b0b" } : { background: "transparent", color: "var(--text-faint)" }}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="max-h-[52vh] overflow-y-auto py-2">
          {rows.length === 0 && (
            <div className="px-5 py-8 text-center">
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>No results for “{dq}”</p>
              <p className="text-[12px] mt-1" style={{ color: "var(--text-faint)" }}>Try a different filter or fewer words.</p>
            </div>
          )}
          {rows.map((r, i) => {
            const showGroup = r.group !== lastGroup; lastGroup = r.group;
            const pinned = r.href ? pins.some((p) => p.href === r.href) : false;
            return (
              <div key={r.key}>
                {showGroup && <div className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{r.group}</div>}
                <div className="group/row flex items-center" style={{ background: sel === i ? "var(--surface-hover)" : "transparent" }}>
                  <button onClick={r.run} onMouseEnter={() => setSel(i)}
                    className="flex-1 flex items-center gap-3 px-5 py-2.5 text-left min-w-0">
                    <span style={{ color: "var(--text-faint)" }}>{r.icon}</span>
                    <span className="flex-1 text-[14px] font-medium truncate" style={{ color: "var(--text)" }}>{r.label}{r.sub && <span className="text-[11px] font-normal ml-2" style={{ color: "var(--text-faint)" }}>{r.sub}</span>}</span>
                    {sel === i && <FiCornerDownLeft size={13} style={{ color: "var(--primary-bright)" }} />}
                  </button>
                  {r.href && (
                    <button onClick={() => togglePin(r.href!, r.label)} title={pinned ? "Unpin" : "Pin command"} aria-label="Pin"
                      className="px-3 py-2.5 opacity-0 group-hover/row:opacity-100 transition-opacity"
                      style={{ color: pinned ? "#fbbf24" : "var(--text-faint)", opacity: pinned ? 1 : undefined }}>
                      <FiStar size={13} fill={pinned ? "#fbbf24" : "none"} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
