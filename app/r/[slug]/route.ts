import { NextResponse, type NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { getGeo } from "@/lib/geoip";
import { anonymizeIp, clientIp } from "@/lib/ip";

export const runtime = "nodejs";

/**
 * Dynamic QR redirect.
 *
 * This is a Route Handler, NOT a page, on purpose: calling next/navigation's
 * redirect() to an EXTERNAL url from a Server Component makes Next render an HTML
 * document with <meta http-equiv="refresh" content="1;url=…">, which stalls every
 * scan on a blank page for a second. A Route Handler returns a real HTTP 307, so
 * the scan resolves instantly — which is the whole point of a QR redirector.
 */
function notFound(): NextResponse {
  return new NextResponse(
    `<!doctype html><meta charset="utf-8"><title>Link not found</title>
     <div style="min-height:100vh;display:flex;align-items:center;justify-content:center;background:#080808;color:#fff;font-family:system-ui,sans-serif">
       <div style="text-align:center">
         <div style="font-size:40px">🔍</div>
         <h1 style="font-size:20px;margin:12px 0 6px">Link not found</h1>
         <p style="color:#9a9a9a;font-size:14px">This QR code does not exist or was removed.</p>
         <p style="margin-top:20px"><a href="/" style="color:#ff7a50">Go to QRix →</a></p>
       </div>
     </div>`,
    { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;

  const { data } = await supabase.from("dynamic_links").select("*").eq("slug", slug).single();
  if (!data) return notFound();

  // PIN-protected links are gated by the PIN page.
  if (data.pin) {
    return NextResponse.redirect(new URL(`/pin/${slug}`, req.url), 307);
  }

  // Defense-in-depth: only ever redirect to a safe http(s) destination, and append
  // UTM params so the destination's own analytics attributes scan → conversion.
  let target: string;
  try {
    const u = new URL(String(data.target_url || "").trim());
    if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("unsafe");
    if (!u.searchParams.has("utm_source")) {
      u.searchParams.set("utm_source", "qr");
      u.searchParams.set("utm_medium", "qr_code");
      u.searchParams.set("utm_campaign", slug);
    }
    target = u.toString();
  } catch {
    return notFound();
  }

  const userAgent = req.headers.get("user-agent") || "unknown";
  const ip = clientIp(req.headers);

  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iPhone")) os = "iPhone";
  else if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";

  const device =
    userAgent.includes("Android") || userAgent.includes("iPhone") ? "Mobile" : "Desktop";

  const geo = await getGeo(req.headers, ip);

  await supabase.from("qr_scans").insert({
    slug,
    user_agent: userAgent,
    // GDPR: the raw IP resolves geo above, but only a coarsened form is stored.
    ip: anonymizeIp(ip),
    browser,
    os,
    device,
    country: geo.country,
    city: geo.city,
  });

  await supabase
    .from("dynamic_links")
    .update({ scans: (data.scans || 0) + 1 })
    .eq("slug", slug);

  return NextResponse.redirect(target, 307);
}
