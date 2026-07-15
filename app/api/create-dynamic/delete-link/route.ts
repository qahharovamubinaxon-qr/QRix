import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { supabase as db } from "@/lib/supabase"; // service-role, for the RLS-locked dynamic_links

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const { slug } = await req.json();

    // .eq("user_id", ...) is the ownership guard now that service-role bypasses RLS.
    const { error } = await db
      .from("dynamic_links")
      .delete()
      .eq("slug", slug)
      .eq("user_id", session.user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}