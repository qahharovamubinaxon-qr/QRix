"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FiSearch, FiCornerDownLeft, FiHeart, FiClock, FiSun, FiMoon, FiGlobe,
  FiGrid, FiSettings, FiUser, FiHome, FiArrowRight,
} from "react-icons/fi";
import { searchIndex } from "@/lib/search-index";
import { useFavorites, useRecents, useRecentSearches, recordSearch } from "@/lib/user-prefs";

type Row = { key: string; group: string; label: string; sub?: string; icon?: React.ReactNode; run: () => void };

/** Global ⌘K / Ctrl+K command palette — search + quick actions + favorites,
    recents and recent searches. Keyboard: ↑↓ navigate · Enter · Esc. */
export default function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const favorites = useFavorites();
  const recents = useRecents();
  const recentSearches = useRecentSearches();

  const close = useCallback(() => { setOpen(false); setQ(""); setSel(0); }, []);
  const nav = useCallback((href: string) => { recordSearch(q); close(); router.push(href); }, [q, close, router]);

  const toggleTheme = useCallback(() => {
    const dark = !document.documentElement.classList.contains("light");
    if (dark) { document.documentElement.classList.add("light"); localStorage.setItem("theme", "light"); }
    else { document.documentElement.classList.remove("light"); localStorage.setItem("theme", "dark"); }
    close();
  }, [close]);
  const setLang = useCallback((code: string) => { localStorage.setItem("language", code); close(); location.reload(); }, [close]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); setOpen((v) => !v); }
      else if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);
  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    const s = q.trim().toLowerCase();

    const COMMANDS: Row[] = [
      { key: "c-theme", group: "Actions", label: "Toggle theme", icon: <FiSun size={15} />, run: toggleTheme },
      { key: "c-en", group: "Actions", label: "Language: English", icon: <FiGlobe size={15} />, run: () => setLang("en") },
      { key: "c-ru", group: "Actions", label: "Language: Русский", icon: <FiGlobe size={15} />, run: () => setLang("ru") },
      { key: "c-uz", group: "Actions", label: "Language: Oʻzbek", icon: <FiGlobe size={15} />, run: () => setLang("uz") },
      { key: "n-dash", group: "Go to", label: "Dashboard", icon: <FiGrid size={15} />, run: () => nav("/dashboard") },
      { key: "n-fav", group: "Go to", label: "Favorites", icon: <FiHeart size={15} />, run: () => nav("/favorites") },
      { key: "n-hist", group: "Go to", label: "History", icon: <FiClock size={15} />, run: () => nav("/history") },
      { key: "n-set", group: "Go to", label: "Settings", icon: <FiSettings size={15} />, run: () => nav("/settings") },
      { key: "n-acc", group: "Go to", label: "Account", icon: <FiUser size={15} />, run: () => nav("/account") },
      { key: "n-home", group: "Go to", label: "Home", icon: <FiHome size={15} />, run: () => nav("/") },
    ];

    if (s) {
      COMMANDS.filter((c) => c.label.toLowerCase().includes(s)).forEach((c) => out.push(c));
      searchIndex(q, 14).forEach((r) => out.push({ key: r.href + r.title, group: r.group, label: r.title, icon: <FiArrowRight size={13} />, run: () => nav(r.href) }));
      return out;
    }
    favorites.slice(0, 5).forEach((f) => out.push({ key: "f" + f.href, group: "Favorites", label: f.title, sub: f.group, icon: <FiHeart size={14} style={{ color: "#f87171" }} />, run: () => nav(f.href) }));
    recents.slice(0, 5).forEach((r) => out.push({ key: "r" + r.href, group: "Recent", label: r.title, sub: r.group, icon: <FiClock size={14} />, run: () => nav(r.href) }));
    recentSearches.slice(0, 4).forEach((rs) => out.push({ key: "s" + rs, group: "Recent searches", label: rs, icon: <FiSearch size={13} />, run: () => setQ(rs) }));
    COMMANDS.forEach((c) => out.push(c));
    return out;
  }, [q, favorites, recents, recentSearches, nav, toggleTheme, setLang]);

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
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") { e.preventDefault(); setSel((n) => Math.min(n + 1, rows.length - 1)); }
              else if (e.key === "ArrowUp") { e.preventDefault(); setSel((n) => Math.max(n - 1, 0)); }
              else if (e.key === "Enter" && rows[sel]) { e.preventDefault(); rows[sel].run(); }
            }}
            placeholder="Search tools, run a command…"
            className="flex-1 bg-transparent outline-none text-[15px]" style={{ color: "var(--text)" }} aria-label="Search" />
          <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-faint)", border: "1px solid var(--border)" }}>ESC</kbd>
        </div>

        <div className="max-h-[56vh] overflow-y-auto py-2">
          {rows.length === 0 && <p className="px-5 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>No results for “{q}”</p>}
          {rows.map((r, i) => {
            const showGroup = r.group !== lastGroup; lastGroup = r.group;
            return (
              <div key={r.key}>
                {showGroup && <div className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{r.group}</div>}
                <button onClick={r.run} onMouseEnter={() => setSel(i)}
                  className="w-full flex items-center gap-3 px-5 py-2.5 text-left"
                  style={{ background: sel === i ? "var(--surface-hover)" : "transparent" }}>
                  <span style={{ color: "var(--text-faint)" }}>{r.icon}</span>
                  <span className="flex-1 text-[14px] font-medium truncate" style={{ color: "var(--text)" }}>{r.label}{r.sub && <span className="text-[11px] font-normal ml-2" style={{ color: "var(--text-faint)" }}>{r.sub}</span>}</span>
                  {sel === i && <FiCornerDownLeft size={13} style={{ color: "var(--primary-bright)" }} />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
