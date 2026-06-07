import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

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

  const headersList = await headers();

const userAgent =
  headersList.get("user-agent") ||
  "unknown";

const scanResult = await supabase
  .from("qr_scans")
  .insert({
    slug,
    user_agent: userAgent,
  });

console.log(
  "PIN SCAN RESULT:",
  JSON.stringify(scanResult, null, 2)
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
  new URL(data.target_url),
  303
);
}
