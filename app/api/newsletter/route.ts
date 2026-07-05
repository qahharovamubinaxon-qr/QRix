import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/** POST { email } — stores a newsletter subscriber (idempotent per email). */
export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (typeof email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email) || email.length > 200) {
      return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
    }
    const admin = createAdminClient();
    if (!admin) {
      // Not configured yet — accept gracefully so the UI works pre-launch.
      return NextResponse.json({ ok: true, stored: false });
    }
    const { error } = await admin
      .from("newsletter_subscribers")
      .upsert({ email: email.toLowerCase().trim() }, { onConflict: "email" });
    if (error) return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
    return NextResponse.json({ ok: true, stored: true });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
