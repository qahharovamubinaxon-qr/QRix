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
  console.log("HELLO VERIFY ROUTE");

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

  if (String(pin) !== String(data.pin)) {
    return new Response(
      "Wrong PIN",
      { status: 401 }
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

const geo = await getGeoData(ip);

console.log("GEO DATA:", geo);

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
  
 console.log(
  "PIN SCAN RESULT:",
  JSON.stringify(scanResult, null, 2)
); 

console.log(
  "PIN SCAN RESULT:",
  scanResult
);

  await supabase
  .from("dynamic_links")
  .update({
    scans: (data.scans || 0) + 1,
  })
  .eq("slug", slug);

console.log(
  "TARGET URL:",
  data.target_url
);

return NextResponse.redirect(
  data.target_url,
  303
);
}