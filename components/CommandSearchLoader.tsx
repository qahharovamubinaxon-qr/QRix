"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/* CommandSearch pulls lib/search-index, which pulls every metadata registry on
 * the site — the QR/AI/video/image/3D tool tables, the whole blog, all 40 convert
 * pairs and all 25 resize presets. That is the single biggest download on every
 * page (~245 KB raw), and the palette has exactly one opener: Ctrl/⌘+K. There is
 * no search button anywhere in the chrome. So on a phone the catalog shipped to
 * every page in the site for a feature the device cannot reach at all.
 *
 * This is the ~30 lines that listen for the shortcut. The palette itself arrives
 * when someone actually presses it — and on a device with a real pointer (i.e.
 * one that has a keyboard to press it with) the chunk is warmed at idle, so the
 * first ⌘K is still instant. Same signal M135 used to stop running the canvas on
 * touch devices. */
const CommandSearch = dynamic(() => import("./CommandSearch"), { ssr: false });

export default function CommandSearchLoader() {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (armed) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setArmed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [armed]);

  // Warm the chunk once the page is idle, but only where the shortcut exists.
  useEffect(() => {
    if (armed) return;
    if (!window.matchMedia?.("(pointer: fine)").matches) return;
    const warm = () => { void import("./CommandSearch"); };
    const ric = window.requestIdleCallback;
    if (ric) {
      const id = ric(warm, { timeout: 4000 });
      return () => window.cancelIdleCallback?.(id);
    }
    const t = setTimeout(warm, 2500);
    return () => clearTimeout(t);
  }, [armed]);

  // Mounted only after the shortcut fired, so it opens itself; from then on
  // CommandSearch's own listener owns the toggle.
  return armed ? <CommandSearch defaultOpen /> : null;
}
