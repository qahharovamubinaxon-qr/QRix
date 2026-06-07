import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function POST(req: Request) {
  const supabase = await createClient();

  // Auth is optional - allow both guests and authenticated users
  const {
  data: { session },
} = await supabase.auth.getSession();

console.log("SESSION:", session);

try {
    const { url, pin, customSlug } =
  await req.json();

const slug =
  customSlug ||
  Math.random()
    .toString(36)
    .substring(2, 8);

// ← ШУ ЕРГА ҚЎЙИЛАДИ
if (customSlug) {
  const { data: existing } = await supabase
    .from("dynamic_links")
    .select("slug")
    .eq("slug", customSlug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      {
        error: "Slug already exists",
      },
      {
        status: 400,
      }
    );
  }
}

const result = await supabase
  .from("dynamic_links")
  .insert({
    slug,
    target_url: url,
    pin: pin || null,
    user_id: session?.user?.id || null,
  });

    console.log("SUPABASE RESULT:", result);

    if (result.error) {
      console.error(
        "SUPABASE ERROR:",
        result.error
      );

      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      slug,
      dynamicUrl: pin ? `/pin/${slug}` : `/r/${slug}`,
    });
  } catch (error) {
    console.error("SERVER ERROR:", error);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}