import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

/** POST — opens the Stripe customer portal so a subscriber can manage/cancel. */
export async function POST() {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ ok: false, error: "billing_not_configured" }, { status: 503 });

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", auth.user.id)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json({ ok: false, error: "no_customer" }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${SITE_URL}/dashboard`,
  });

  return NextResponse.json({ ok: true, url: session.url });
}
