import { track } from "@vercel/analytics";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  interface Window { gtag?: (...args: any[]) => void }
}

/** Record a tool usage event — mirrored to Vercel Analytics AND GA4, so the
    "delivered results" north-star metric lives in both dashboards. */
export function trackTool(tool: string, extra?: Record<string, string | number | boolean>) {
  try {
    track("tool_used", { tool, ...extra });
  } catch {
    /* analytics not available (e.g. local dev) — ignore */
  }
  try {
    if (typeof window !== "undefined") window.gtag?.("event", "tool_used", { tool, ...extra });
  } catch { /* ignore */ }
}
