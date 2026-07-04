import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase-admin";

export const runtime = "nodejs";

/**
 * Stripe webhook. Set the endpoint to /api/billing/webhook in the Stripe
 * dashboard and put its signing secret in STRIPE_WEBHOOK_SECRET.
 * Keeps profiles.plan / pro_until in sync with the subscription.
 */
export async function POST(request: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) {
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 });

  const sig = request.headers.get("stripe-signature");
  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch {
    return NextResponse.json({ ok: false, error: "bad_signature" }, { status: 400 });
  }

  // Stripe moved current_period_end onto subscription items — read it from there.
  function periodEnd(sub: Stripe.Subscription): string {
    const ts = sub.items?.data?.[0]?.current_period_end;
    return new Date((ts ?? Math.floor(Date.now() / 1000) + 30 * 86400) * 1000).toISOString();
  }

  async function setPlanByCustomer(customerId: string, plan: "free" | "pro", proUntil: string | null, subId: string | null) {
    await admin!
      .from("profiles")
      .update({ plan, pro_until: proUntil, stripe_subscription_id: subId })
      .eq("stripe_customer_id", customerId);
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.customer && s.subscription) {
          const sub = await stripe.subscriptions.retrieve(s.subscription as string);
          await setPlanByCustomer(s.customer as string, "pro", periodEnd(sub), sub.id);
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created": {
        const sub = event.data.object as Stripe.Subscription;
        const active = sub.status === "active" || sub.status === "trialing";
        await setPlanByCustomer(sub.customer as string, active ? "pro" : "free", active ? periodEnd(sub) : null, sub.id);
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await setPlanByCustomer(sub.customer as string, "free", null, null);
        break;
      }
    }
  } catch {
    return NextResponse.json({ ok: false, error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
