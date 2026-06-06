import { NextResponse } from "next/server";
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

  if (String(pin) !== String(data.pin)) {
    return new Response(
      "Wrong PIN",
      { status: 401 }
    );
  }

  await supabase
    .from("dynamic_links")
    .update({
      scans: data.scans + 1,
    })
    .eq("slug", slug);

  return NextResponse.redirect(
    data.target_url
  );
}