"use client";

/* Lightweight, dependency-free error monitoring (env-gated). When
   NEXT_PUBLIC_SENTRY_DSN is set, uncaught errors and unhandled rejections
   are reported to Sentry's store endpoint (deduped + capped per session).
   Does nothing without a DSN, so it's safe to ship. */

import { useEffect } from "react";

export default function ErrorMonitor() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn) return;
    let u: URL;
    try { u = new URL(dsn); } catch { return; }
    const key = u.username;
    const projectId = u.pathname.replace(/^\//, "");
    if (!key || !projectId) return;
    const store = `${u.protocol}//${u.host}/api/${projectId}/store/?sentry_key=${key}&sentry_version=7`;

    let sent = 0;
    const seen = new Set<string>();
    const uuid = () => {
      try { return crypto.randomUUID().replace(/-/g, ""); }
      catch { return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join(""); }
    };

    const report = (message: string, stack?: string) => {
      if (sent >= 20 || !message) return;
      const sig = message + (stack || "").slice(0, 120);
      if (seen.has(sig)) return;
      seen.add(sig); sent++;
      const body = JSON.stringify({
        event_id: uuid(),
        timestamp: new Date().toISOString(),
        platform: "javascript",
        level: "error",
        logger: "browser",
        request: { url: location.href, headers: { "User-Agent": navigator.userAgent } },
        exception: { values: [{ type: "Error", value: message.slice(0, 400) }] },
        extra: { stack: (stack || "").slice(0, 2000) },
      });
      try { fetch(store, { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } }).catch(() => {}); } catch { /* ignore */ }
    };

    const onErr = (e: ErrorEvent) => report(e.message || "Error", e.error?.stack);
    const onRej = (e: PromiseRejectionEvent) => {
      const r = e.reason;
      report("Unhandled rejection: " + (r?.message || String(r)).slice(0, 200), r?.stack);
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);
  return null;
}
