import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getGeoData } from "@/lib/geoip";
import { rateLimit } from "@/lib/server/security";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;

  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "unknown";
  const ip =
    headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headersList.get("x-real-ip") ||
    "unknown";

  // Brute-force protection: a 4-digit PIN is only 10k combinations, so cap
  // attempts BEFORE comparing — 5 tries per 10 minutes per (slug, IP).
  const rl = await rateLimit(`pin:${slug}:${ip}`, { max: 5, windowMs: 600_000 });
  if (!rl.ok) {
    return NextResponse.redirect(new URL(`/pin/${slug}?error=rate`, req.url), 303);
  }

  const formData = await req.formData();
  const pin = formData.get("pin");

  const { data } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (String(pin) !== String(data.pin)) {
    return NextResponse.redirect(new URL(`/pin/${slug}?error=1`, req.url), 303);
  }

  // Defense-in-depth: only ever redirect to a safe http(s) destination, and pass
  // UTM params so the destination's own analytics can attribute scan → conversion
  // (mirrors app/r/[slug]/page.tsx).
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
    return NextResponse.redirect(new URL("/", req.url), 303);
  }

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

  const geo = await getGeoData(ip);

  await supabase.from("qr_scans").insert({
    slug,
    user_agent: userAgent,
    ip,
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

  return NextResponse.redirect(target, 303);
}
