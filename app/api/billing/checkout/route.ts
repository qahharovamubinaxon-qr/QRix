import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

/** POST — starts a Stripe Checkout session for the Pro subscription. */
export async function POST() {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!stripe || !priceId) {
    return NextResponse.json({ ok: false, error: "billing_not_configured" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  // Reuse an existing Stripe customer or create one, then remember it.
  const { data: profile } = await admin
    .from("profiles")
    .select("stripe_customer_id, email")
    .eq("id", auth.user.id)
    .single();

  let customerId = profile?.stripe_customer_id as string | undefined;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: auth.user.email ?? profile?.email ?? undefined,
      metadata: { supabase_uid: auth.user.id },
    });
    customerId = customer.id;
    await admin.from("profiles").update({ stripe_customer_id: customerId }).eq("id", auth.user.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${SITE_URL}/dashboard?upgraded=1`,
    cancel_url: `${SITE_URL}/pricing?canceled=1`,
    metadata: { supabase_uid: auth.user.id },
  });

  return NextResponse.json({ ok: true, url: session.url });
}
