"use client";

/* Client-side user data — favorites, recent tools, bookmarks, download history
   and settings — persisted in localStorage with a tiny pub/sub so React views
   stay in sync across tabs. Zero deps, SSR-safe. */

import { useCallback, useEffect, useState } from "react";

export type ToolRef = { href: string; title: string; group?: string };
export type Job = { id: string; tool: string; file: string; href?: string; status: "done" | "failed"; at: number };
export type Settings = {
  animations: boolean;
  performance: boolean;
  notifications: boolean;
  reduceData: boolean;
};

const KEYS = {
  fav: "qrix_favorites",
  recent: "qrix_recents",
  bmk: "qrix_bookmarks",
  hist: "qrix_history",
  search: "qrix_recent_searches",
  settings: "qrix_settings",
} as const;

const DEFAULT_SETTINGS: Settings = { animations: true, performance: false, notifications: true, reduceData: false };

/* ── low-level ── */
function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try { const v = localStorage.getItem(key); return v ? (JSON.parse(v) as T) : fallback; } catch { return fallback; }
}
function write<T>(key: string, val: T) {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* quota */ }
  window.dispatchEvent(new CustomEvent("qrix-prefs", { detail: key }));
}

/** Subscribe to changes for a key (returns unsubscribe). */
function subscribe(key: string, cb: () => void) {
  const on = (e: Event) => { if ((e as CustomEvent).detail === key || (e as StorageEvent).key === key) cb(); };
  window.addEventListener("qrix-prefs", on);
  window.addEventListener("storage", on);
  return () => { window.removeEventListener("qrix-prefs", on); window.removeEventListener("storage", on); };
}

/* ── favorites ── */
export function isFavorite(href: string): boolean { return read<ToolRef[]>(KEYS.fav, []).some((f) => f.href === href); }
export function toggleFavorite(t: ToolRef) {
  const list = read<ToolRef[]>(KEYS.fav, []);
  const next = list.some((f) => f.href === t.href) ? list.filter((f) => f.href !== t.href) : [t, ...list];
  write(KEYS.fav, next);
}

/* ── recents ── */
export function recordRecent(t: ToolRef) {
  const list = read<ToolRef[]>(KEYS.recent, []).filter((r) => r.href !== t.href);
  write(KEYS.recent, [{ ...t, }, ...list].slice(0, 24));
}

/* ── bookmarks (blog) ── */
export function isBookmarked(href: string): boolean { return read<ToolRef[]>(KEYS.bmk, []).some((f) => f.href === href); }
export function toggleBookmark(t: ToolRef) {
  const list = read<ToolRef[]>(KEYS.bmk, []);
  const next = list.some((f) => f.href === t.href) ? list.filter((f) => f.href !== t.href) : [t, ...list];
  write(KEYS.bmk, next);
}

/* ── download history ── */
export function logJob(j: Omit<Job, "id" | "at">) {
  const list = read<Job[]>(KEYS.hist, []);
  write(KEYS.hist, [{ ...j, id: Math.random().toString(36).slice(2), at: Date.now() }, ...list].slice(0, 200));
}
export function clearHistory() { write(KEYS.hist, []); }
export function deleteJob(id: string) { write(KEYS.hist, read<Job[]>(KEYS.hist, []).filter((j) => j.id !== id)); }

/* ── recent searches ── */
export function recordSearch(q: string) {
  const s = q.trim(); if (!s) return;
  const list = read<string[]>(KEYS.search, []).filter((x) => x.toLowerCase() !== s.toLowerCase());
  write(KEYS.search, [s, ...list].slice(0, 8));
}

/* ── settings ── */
export function getSettings(): Settings { return { ...DEFAULT_SETTINGS, ...read<Partial<Settings>>(KEYS.settings, {}) }; }
export function setSetting<K extends keyof Settings>(k: K, v: Settings[K]) { write(KEYS.settings, { ...getSettings(), [k]: v }); }

/* ── React hook: live list for a key ── */
export function useStored<T>(key: keyof typeof KEYS, fallback: T): T {
  const realKey = KEYS[key];
  const [val, setVal] = useState<T>(fallback);
  useEffect(() => {
    const load = () => setVal(read<T>(realKey, fallback));
    load();
    return subscribe(realKey, load);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realKey]);
  return val;
}

export function useFavorites() { return useStored<ToolRef[]>("fav", []); }
export function useRecents() { return useStored<ToolRef[]>("recent", []); }
export function useBookmarks() { return useStored<ToolRef[]>("bmk", []); }
export function useHistory() { return useStored<Job[]>("hist", []); }
export function useRecentSearches() { return useStored<string[]>("search", []); }
export function useSettings(): [Settings, <K extends keyof Settings>(k: K, v: Settings[K]) => void] {
  const raw = useStored<Partial<Settings>>("settings", {});
  const s = { ...DEFAULT_SETTINGS, ...raw };
  const set = useCallback(<K extends keyof Settings>(k: K, v: Settings[K]) => setSetting(k, v), []);
  return [s, set];
}
