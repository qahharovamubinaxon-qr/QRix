"use client";

/* Mission 29 — Coverr-style hero search: a big white pill that finds any of
   the 185+ tools as you type (lib/search-index) and routes straight to it. */

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiArrowRight } from "react-icons/fi";
import { searchIndex, type SearchItem } from "@/lib/search-index";

export default function HeroSearch({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<SearchItem[]>([]);
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) { setItems([]); setOpen(false); return; }
    const id = setTimeout(() => { setItems(searchIndex(q, 6)); setSel(0); setOpen(true); }, 110);
    return () => clearTimeout(id);
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

  return (
    <div className="qx-hsearch" ref={boxRef}>
      <form className="qx-hsearch-bar" onSubmit={(e) => { e.preventDefault(); go(); }} role="search">
        <span className="qx-hsearch-ic" aria-hidden><FiSearch size={17} /></span>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onKey}
          onFocus={() => q.trim() && items.length > 0 && setOpen(true)}
          placeholder={placeholder} aria-label={placeholder}
          autoComplete="off" spellCheck={false} />
        <button type="submit" className="qx-hsearch-go" aria-label="Search"><FiArrowRight size={18} /></button>
      </form>

      {open && items.length > 0 && (
        <div className="qx-hsearch-drop" role="listbox">
          {items.map((it, i) => (
            <button key={`${it.href}-${i}`} type="button" role="option" aria-selected={i === sel}
              data-on={i === sel} className="qx-hsearch-row"
              onMouseEnter={() => setSel(i)} onClick={() => go(it)}>
              <span className="truncate">{it.title}</span>
              <span className="qx-hsearch-grp">{it.group}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
