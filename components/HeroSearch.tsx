"use client";

/* Mission 29 — Coverr-style hero search: a big white pill that finds any of
   the 185+ tools as you type (lib/search-index) and routes straight to it.
   Mission 41: Cyrillic queries transliterate on the fly ("жпг то пдф" works),
   and the top match flies in from the screen corner, settling above the bar —
   click it to open the tool. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import type { SearchItem } from "@/lib/search-index";

/* phonetic Cyrillic → Latin so "жпг то пдф" finds "jpg to pdf" */
const CYR: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
  қ: "q", ғ: "g", ў: "o", ҳ: "h", ђ: "g", ị: "i",
};
function translit(s: string): string {
  if (!/[Ѐ-ӿ]/.test(s)) return s;
  return s.toLowerCase().split("").map((ch) => CYR[ch] ?? ch).join("");
}

const GROUP_ICON: Record<string, string> = {
  "QR Tools": "🔗", "PDF Tools": "📄", "Image Tools": "🖼️", "AI Tools": "✨",
  "Video Tools": "🎬", "3D Tools": "🧊", Pages: "⚡", Categories: "🗂️", Blog: "📚",
};

export default function HeroSearch({ placeholder, fly = false }: { placeholder: string; fly?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  /* lib/search-index pulls every metadata registry on the site — the tool
     tables, the whole blog, all 40 convert pairs, all 25 resize presets — and
     this bar sits on the homepage, where it was the single biggest thing the
     page downloaded before it could paint. Most visitors never type in it. So
     the catalog is fetched on the first focus (see onFocus below), which is a
     whole intent ahead of the first keystroke, and the 110 ms debounce below
     covers the rest. */
  const indexRef = useRef<typeof import("@/lib/search-index").searchIndex | null>(null);
  const loadIndex = () =>
    indexRef.current
      ? Promise.resolve(indexRef.current)
      : import("@/lib/search-index").then((m) => (indexRef.current = m.searchIndex));

  useEffect(() => {
    if (!q.trim()) { setItems([]); setOpen(false); return; }
    let cancelled = false;
    const id = setTimeout(() => {
      loadIndex().then((searchIndex) => {
        if (cancelled) return;
        const qq = translit(q);
        let found = searchIndex(qq, 6);
        if (!found.length && qq !== q) found = searchIndex(q, 6);
        setItems(found); setSel(0); setOpen(true);
      });
    }, 110);
    return () => { cancelled = true; clearTimeout(id); };
  }, [q]);

  useEffect(() => {
    const close = (e: PointerEvent) => { if (!boxRef.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  const go = (item?: SearchItem) => {
    const t = item ?? items[sel] ?? items[0];
    if (t) { setOpen(false); router.push(t.href); }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, items.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Escape") setOpen(false);
  };

  const top = items[0];
  const rest = fly && open ? items.slice(1) : items;

  return (
    <div className="qx-hsearch" ref={boxRef}>
      {/* the best match flies in from the corner and parks above the bar */}
      {fly && open && top && (
        <button key={top.href} type="button" className="qx-hs-fly" onClick={() => go(top)}>
          <span className="qx-hs-fly-ic" aria-hidden>{GROUP_ICON[top.group] || "⚡"}</span>
          <span className="qx-hs-fly-body">
            <span className="qx-hs-fly-title">{top.title}</span>
            <span className="qx-hs-fly-grp qx-mono">{top.group}</span>
          </span>
          <span className="qx-hs-fly-go" aria-hidden><FiArrowRight size={14} /></span>
        </button>
      )}

      <form className="qx-hsearch-bar" onSubmit={(e) => { e.preventDefault(); go(); }} role="search">
        <span className="qx-hsearch-ic" aria-hidden><FiSearch size={17} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
          onFocus={() => { void loadIndex(); if (q.trim() && items.length > 0) setOpen(true); }}
          placeholder={placeholder} aria-label={placeholder}
          autoComplete="off" spellCheck={false} />
        <button type="submit" className="qx-hsearch-go" aria-label="Search"><FiArrowRight size={18} /></button>
      </form>

      {open && rest.length > 0 && (
        <div className="qx-hsearch-drop" role="listbox">
          {rest.map((it, i) => {
            const idx = fly ? i + 1 : i;
            return (
              <button key={`${it.href}-${idx}`} type="button" role="option" aria-selected={idx === sel}
                data-on={idx === sel} className="qx-hsearch-row"
                onMouseEnter={() => setSel(idx)} onClick={() => go(it)}>
                <span className="truncate">{it.title}</span>
                <span className="qx-hsearch-grp">{it.group}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
