import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";
import { getGeoData } from "@/lib/geoip";

export async function POST(
  req: Request,
  context: {
    params: Promise<{
      slug: string;
    }>;
  }
) {
  const formData = await req.formData();

  const pin = formData.get("pin");

  const { slug } = await context.params;

  const { data } = await supabase
    .from("dynamic_links")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!data) {
    return NextResponse.redirect(
      new URL("/", req.url)
    );
  }

  // PIN текшириш — хато бўлса чиройли саҳифага қайтарамиз
  if (String(pin) !== String(data.pin)) {
    return NextResponse.redirect(
      new URL(`/pin/${slug}?error=1`, req.url),
      303
    );
  }

  const headersList = await headers();

  const userAgent =
    headersList.get("user-agent") ||
    "unknown";

  const ip =
    headersList.get("x-forwarded-for") ||
    headersList.get("x-real-ip") ||
    "unknown";

  const geo = await getGeoData(ip);

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

  await supabase
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

  await supabase
    .from("dynamic_links")
    .update({
      scans: (data.scans || 0) + 1,
    })
    .eq("slug", slug);

  // target_url'ni to'g'rilash: http/https bo'lmasa qo'shamiz
  let target = String(data.target_url || "").trim();
  if (target && !/^https?:\/\//i.test(target) && !/^(mailto:|tel:|sms:|geo:|bitcoin:|WIFI:|BEGIN:)/i.test(target)) {
    target = "https://" + target;
  }
  if (!target) {
    target = new URL("/", req.url).toString();
  }

  return NextResponse.redirect(target, 303);
}