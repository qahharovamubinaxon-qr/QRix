import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getGeoData } from "@/lib/geoip";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function Page({
  params,
}: Props) {
  const { slug } = await params;

  const { data } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return (
      <h1 className="text-white p-10">
        Link not found
      </h1>
    );
  }

  // If this slug is PIN protected, redirect to the PIN page.
  if (data.pin) {
  redirect(`/pin/${slug}`);
}

const headersList = await headers();

const userAgent =
  headersList.get("user-agent") || "unknown";

  const ip =
  headersList.get("x-forwarded-for") ||
  headersList.get("x-real-ip") ||
  "unknown";

const geo = await getGeoData(ip);

console.log("GEO DATA:", geo);

let browser = "Unknown";

if (userAgent.includes("Chrome"))
  browser = "Chrome";
else if (userAgent.includes("Firefox"))
  browser = "Firefox";
else if (userAgent.includes("Safari"))
  browser = "Safari";
else if (userAgent.includes("Edge"))
  browser = "Edge";

let os = "Unknown";

if (userAgent.includes("Android"))
  os = "Android";
else if (userAgent.includes("iPhone"))
  os = "iPhone";
else if (userAgent.includes("Windows"))
  os = "Windows";
else if (userAgent.includes("Mac"))
  os = "MacOS";

let device = "Desktop";

if (
  userAgent.includes("Android") ||
  userAgent.includes("iPhone")
) {
  device = "Mobile";
}

const scanResult = await supabase
  .from("qr_scans")
  .insert({
  slug,
  user_agent: userAgent,
  ip,
  browser,
  os,
  device,
  country: geo.country,
  city: geo.city,
});
void scanResult;

await supabase
  .from("dynamic_links")
  .update({
    scans: (data.scans || 0) + 1,
  })
  .eq("slug", slug);

// Defense-in-depth: only ever redirect to safe http(s) destinations, and
// pass UTM params so the destination's own analytics (e.g. GA4) can attribute
// the scan → conversion — the practical way to measure QR conversions.
let target = data.target_url as string;
let safeTarget = false;
try {
  const u = new URL(data.target_url);
  safeTarget = u.protocol === "http:" || u.protocol === "https:";
  if (safeTarget && !u.searchParams.has("utm_source")) {
    u.searchParams.set("utm_source", "qr");
    u.searchParams.set("utm_medium", "qr_code");
    u.searchParams.set("utm_campaign", slug);
    target = u.toString();
  }
} catch { safeTarget = false; }

if (!safeTarget) {
  return <h1 className="text-white p-10">This link points to an unsupported destination.</h1>;
}

redirect(target);
}