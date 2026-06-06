import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/auth-helpers-nextjs";

export async function POST(req: Request) {
  const requestCookies = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: requestCookies,
    }
  );

  // Auth is optional - allow both guests and authenticated users
  const {
    data: { session },
  } = await supabase.auth.getSession();

  try {
    const { url, pin } = await req.json();

    const slug = Math.random()
      .toString(36)
      .substring(2, 8);

    const result = await supabase
      .from("dynamic_links")
      .insert({
        slug,
        target_url: url,
        pin: pin || null,
        user_id: session?.user?.id || null, // null for guests, user id for authenticated
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