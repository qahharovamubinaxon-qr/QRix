"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Production client glue: registers the PWA service worker and records
    page-view analytics on route changes (respects the reduce-data setting).
    Zero render cost — mounts nothing. */
export default function PwaVitals() {
  const pathname = usePathname();
  const last = useRef<string>("");

  // Service worker — production only (dev HMR and SW caching don't mix).
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);

  // Page-view tracking on every route change.
  useEffect(() => {
    if (!pathname || pathname === last.current) return;
    last.current = pathname;
    try {
      const s = JSON.parse(localStorage.getItem("qrix_settings") || "{}");
      if (s.reduceData) return;
    } catch { /* default: track */ }
    const send = () => fetch("/api/v1/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "page_view", tool: pathname }),
      keepalive: true,
    }).catch(() => {});
    // Defer off the critical path.
    if ("requestIdleCallback" in window) (window as Window & { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(send);
    else setTimeout(send, 800);
  }, [pathname]);

  return null;
}
