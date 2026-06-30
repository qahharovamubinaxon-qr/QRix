import { track } from "@vercel/analytics";

/** Record a tool usage event (shows up in Vercel Analytics → Events). */
export function trackTool(tool: string, extra?: Record<string, string | number | boolean>) {
  try {
    track("tool_used", { tool, ...extra });
  } catch {
    /* analytics not available (e.g. local dev) — ignore */
  }
}
