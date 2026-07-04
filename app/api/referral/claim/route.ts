import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { REFERRAL_REWARD_CREDITS } from "@/lib/entitlements";

export const runtime = "nodejs";

/**
 * POST { code }  — call right after a user signs up with a referral code.
 * Validates the code, records the referral once, and credits both sides.
 * Idempotent: a user can only ever be referred once (DB unique constraint).
 */
export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string" || !/^[a-z0-9]{4,16}$/.test(code)) {
      return NextResponse.json({ ok: false, error: "invalid_code" }, { status: 400 });
    }

    // Who is calling (must be authenticated)
    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    const referredId = auth.user.id;

    const admin = createAdminClient();
    if (!admin) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

    // Resolve the referrer by code
    const { data: referrer } = await admin
      .from("profiles")
      .select("id, referred_by")
      .eq("referral_code", code)
      .single();

    if (!referrer) return NextResponse.json({ ok: false, error: "code_not_found" }, { status: 404 });
    if (referrer.id === referredId) {
      return NextResponse.json({ ok: false, error: "self_referral" }, { status: 400 });
    }

    // Has this user already been referred?
    const { data: existing } = await admin
      .from("referrals")
      .select("id")
      .eq("referred_id", referredId)
      .maybeSingle();
    if (existing) return NextResponse.json({ ok: true, already: true });

    // Record the referral (unique constraint guards against races)
    const { error: insErr } = await admin.from("referrals").insert({
      referrer_id: referrer.id,
      referred_id: referredId,
      reward_credits: REFERRAL_REWARD_CREDITS,
    });
    if (insErr) {
      // Likely the unique violation from a concurrent claim — treat as done
      return NextResponse.json({ ok: true, already: true });
    }

    // Credit both sides + link the referred user
    await admin.rpc("increment_credits", { uid: referrer.id, amount: REFERRAL_REWARD_CREDITS });
    await admin.rpc("increment_credits", { uid: referredId, amount: REFERRAL_REWARD_CREDITS });
    await admin.from("profiles").update({ referred_by: referrer.id }).eq("id", referredId);

    return NextResponse.json({ ok: true, reward: REFERRAL_REWARD_CREDITS });
  } catch {
    return NextResponse.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
