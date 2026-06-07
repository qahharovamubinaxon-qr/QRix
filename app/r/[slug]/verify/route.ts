import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { supabase } from "@/lib/supabase";

throw new Error("VERIFY FILE TEST");

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