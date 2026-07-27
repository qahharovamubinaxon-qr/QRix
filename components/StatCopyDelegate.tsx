"use client";

import { useEffect } from "react";

/* One listener for every copy button on the page.
 *
 * /qr-code-statistics renders 26 stat cards and each one offers its embed
 * snippet. The obvious build is a small client component per card — and that is
 * 26 islands hydrating on a page whose chart was deliberately written in CSS so
 * there would be nothing to hydrate at all (and M139 had just finished taking
 * catalogs OUT of eager bundles, so putting 26 components back in would be a
 * regression bought with a nicety).
 *
 * So the snippet markup is server-rendered inside a native <details> — it works
 * with JavaScript off, where the reader selects the text and copies it — and
 * this single delegated listener upgrades any [data-copy] button in the document
 * to a real clipboard write. One island, no per-card state, and nothing breaks
 * if it never loads. */
export default function StatCopyDelegate() {
  useEffect(() => {
    const onClick = async (e: MouseEvent) => {
      const btn = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-copy]");
      if (!btn) return;
      const text = btn.getAttribute("data-copy");
      if (!text) return;
      e.preventDefault();

      const label = btn.querySelector<HTMLElement>("[data-copy-label]") || btn;
      const original = label.textContent;
      try {
        await navigator.clipboard.writeText(text);
        label.textContent = "Copied";
      } catch {
        /* clipboard is permission-gated and absent over plain http — say so
           rather than silently doing nothing; the text is right there to select. */
        label.textContent = "Press ⌘/Ctrl+C";
        const box = btn.closest("details")?.querySelector("textarea");
        if (box) {
          box.focus();
          box.select();
        }
      }
      window.setTimeout(() => {
        label.textContent = original;
      }, 1800);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
