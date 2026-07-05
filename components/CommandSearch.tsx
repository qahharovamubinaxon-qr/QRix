"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch, FiCornerDownLeft } from "react-icons/fi";
import { searchIndex, type SearchItem } from "@/lib/search-index";

/**
 * Global ⌘K / Ctrl+K command palette — instantly searches every tool,
 * page and blog post. Keyboard: ↑↓ navigate, Enter open, Esc close.
 */
export default function CommandSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const results = q ? searchIndex(q) : [];

  const close = useCallback(() => { setOpen(false); setQ(""); setSel(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        close();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30); }, [open]);

  function onInputKey(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setSel((s) => Math.min(s + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setSel((s) => Math.max(s - 1, 0)); }
    else if (e.key === "Enter" && results[sel]) { go(results[sel]); }
  }

  function go(item: SearchItem) {
    close();
    router.push(item.href);
  }

  if (!open) return null;

  let lastGroup = "";

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center px-4 pt-[12vh]"
      style={{ background: "rgba(5,5,10,0.55)", backdropFilter: "blur(6px)" }}
      onClick={close} role="dialog" aria-modal="true" aria-label="Search">
      <div className="w-full max-w-xl rounded-2xl overflow-hidden qx-page-in"
        style={{ background: "var(--surface-solid)", border: "1px solid var(--border-glass)", boxShadow: "var(--shadow-pop)" }}
        onClick={(e) => e.stopPropagation()}>
        {/* input */}
        <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
          <FiSearch size={17} style={{ color: "var(--primary-bright)" }} />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={onInputKey}
            placeholder="Search tools, pages, guides…"
            className="flex-1 bg-transparent outline-none text-[15px]"
            style={{ color: "var(--text)" }}
            aria-label="Search everything"
          />
          <kbd className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "var(--surface-2)", color: "var(--text-faint)", border: "1px solid var(--border)" }}>ESC</kbd>
        </div>

        {/* results */}
        <div className="max-h-[52vh] overflow-y-auto py-2">
          {q && results.length === 0 && (
            <p className="px-5 py-6 text-sm text-center" style={{ color: "var(--text-muted)" }}>No results for “{q}”</p>
          )}
          {!q && (
            <p className="px-5 py-6 text-sm text-center" style={{ color: "var(--text-faint)" }}>
              Type to search 55+ tools, pages and {`50+`} guides
            </p>
          )}
          {results.map((r, i) => {
            const showGroup = r.group !== lastGroup;
            lastGroup = r.group;
            return (
              <div key={r.href + r.title}>
                {showGroup && (
                  <div className="px-5 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>
                    {r.group}
                  </div>
                )}
                <button
                  onClick={() => go(r)}
                  onMouseEnter={() => setSel(i)}
                  className="w-full flex items-center justify-between gap-3 px-5 py-2.5 text-left text-[14px] font-medium"
                  style={{ background: sel === i ? "var(--surface-hover)" : "transparent", color: "var(--text)" }}>
                  {r.title}
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
