import { handler, ok, validate } from "@/lib/server/api";
import { track } from "@/lib/server/analytics";

export const runtime = "nodejs";

/** Minimal UA classification — enough for device/browser analytics. */
function classify(ua: string) {
  const device = /Mobi|Android.*Mobile|iPhone/.test(ua) ? "mobile" : /iPad|Tablet|Android/.test(ua) ? "tablet" : "desktop";
  const browser = /Edg\//.test(ua) ? "Edge" : /OPR\//.test(ua) ? "Opera" : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "Other";
  return { device, browser };
}

/** POST — record a product event (tool_use, download, page_view, conversion).
    Works for guests too; userId attaches automatically when signed in.
    Enriched server-side with country/device/browser/referrer for analytics. */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ name: string; tool?: string }>(await req.json(), {
    name: { type: "string", min: 2, max: 40 },
    tool: { type: "string", optional: true, max: 160 },
  });
  const ua = req.headers.get("user-agent") || "";
  const referrerHost = (() => {
    try { return new URL(req.headers.get("referer") || "").hostname.replace(/^www\./, "") || "direct"; } catch { return "direct"; }
  })();
  track(body.name, {
    userId: user?.id ?? null,
    tool: body.tool ?? null,
    meta: {
      country: req.headers.get("x-vercel-ip-country") || req.headers.get("cf-ipcountry") || "??",
      ...classify(ua),
      referrer: referrerHost,
      hour: new Date().getUTCHours(),
    },
  });
  return ok({ tracked: true });
}, { rateLimit: { max: 120 } });
