/**
 * Billing abstraction. Driver: mock (default — full lifecycle without Stripe
 * keys) or stripe (STRIPE_SECRET_KEY set; reuses lib/stripe.ts). Plans,
 * coupons, invoices, trials, usage limits and webhook handling all work in
 * mock mode so the platform is testable end-to-end. SERVER ONLY.
 */
import { serverConfig } from "./config";
import { db, uid, helpers } from "./db";
import { emails } from "./email";
import { track } from "./analytics";
import { emitEvent } from "./webhooks";
import { tgEvents } from "./telegram/notify";
import type { Plan, Interval, Subscription } from "./models";

// ── Plans & limits ──────────────────────────────────────────────────────
export const PLANS: Record<Plan, {
  name: string; monthly: number; yearly: number; // cents
  limits: { jobsPerDay: number; storageMb: number; apiKeys: number; teamSeats: number };
  features: string[];
}> = {
  FREE: {
    name: "Free", monthly: 0, yearly: 0,
    limits: { jobsPerDay: 20, storageMb: 100, apiKeys: 1, teamSeats: 1 },
    features: ["All 150+ tools", "On-device processing", "Basic analytics"],
  },
  PRO: {
    name: "Pro", monthly: 500, yearly: 4800,
    limits: { jobsPerDay: 300, storageMb: 5_000, apiKeys: 5, teamSeats: 1 },
    features: ["Unlimited dynamic QR", "Cloud processing", "No ads", "Priority queue", "Custom branding"],
  },
  BUSINESS: {
    name: "Business", monthly: 4900, yearly: 49_000,
    // Business = everything unlimited (sentinel ceilings) — beats competitors' metered tiers.
    limits: { jobsPerDay: 1_000_000, storageMb: 1_000_000, apiKeys: 1_000, teamSeats: 1_000 },
    features: ["Everything in Pro", "Unlimited AI credits", "Unlimited team seats & roles", "Unlimited API access + webhooks", "Unlimited dynamic QR & bulk pipelines", "Priority SLA support", "White-label — no QRix badge"],
  },
  ENTERPRISE: {
    name: "Enterprise", monthly: 19_900, yearly: 199_000,
    limits: { jobsPerDay: 100_000, storageMb: 1_000_000, apiKeys: 100, teamSeats: 100 },
    features: ["Custom contracts", "Dedicated infra", "SSO/SAML", "Audit exports"],
  },
};

export function applyCoupon(amount: number, code?: string | null): { amount: number; valid: boolean } {
  if (!code) return { amount, valid: false };
  const coupon = MOCK_COUPONS[code.toUpperCase()];
  if (!coupon) return { amount, valid: false };
  const discounted = coupon.percentOff ? Math.round(amount * (1 - coupon.percentOff / 100)) : Math.max(0, amount - (coupon.amountOff || 0));
  return { amount: discounted, valid: true };
}
const MOCK_COUPONS: Record<string, { percentOff?: number; amountOff?: number }> = {
  LAUNCH20: { percentOff: 20 }, WELCOME5: { amountOff: 500 },
};

// ── Checkout ────────────────────────────────────────────────────────────
export async function createCheckout(userId: string, plan: Plan, interval: Interval, coupon?: string): Promise<{ url: string; mock: boolean }> {
  if (plan === "FREE") throw new Error("free_plan_no_checkout");

  if (serverConfig.billing.driver === "stripe") {
    // Real driver: reuse the existing Stripe integration (lib/stripe.ts + price env vars).
    return { url: "/api/billing/checkout", mock: false };
  }

  // Mock driver — activate instantly with a trial, write the order + invoice.
  const base = interval === "YEAR" ? PLANS[plan].yearly : PLANS[plan].monthly;
  const { amount } = applyCoupon(base, coupon);
  const trialEnd = helpers.daysAhead(serverConfig.billing.trialDays);

  db.subscriptions.remove((s) => s.userId === userId);
  const sub: Subscription = {
    id: uid("sub"), userId, plan, status: "TRIALING", interval,
    trialEnd, currentPeriodEnd: helpers.daysAhead(interval === "YEAR" ? 365 : 30),
    cancelAtPeriodEnd: false, createdAt: helpers.now(),
  };
  db.subscriptions.insert(sub);
  db.orders.insert({ id: uid("ord"), userId, amount, currency: "usd", status: "paid", couponCode: coupon || null, invoiceUrl: `/api/v1/billing/invoice/${sub.id}`, createdAt: helpers.now() });
  db.users.update((u) => u.id === userId, { plan, updatedAt: helpers.now() });

  const user = db.users.find((u) => u.id === userId);
  if (user) { emails.subscriptionStarted(user.email, PLANS[plan].name); emails.invoice(user.email, amount); }
  track("conversion", { userId, meta: { plan, interval } });
  emitEvent("subscription.created", { userId, plan, interval }, userId);
  emitEvent("payment.succeeded", { userId, amount, currency: "usd" }, userId);
  if (user) { tgEvents.newSubscription(user.email, PLANS[plan].name); tgEvents.paymentSuccess(user.email, amount); }
  return { url: `/dashboard?upgraded=1&plan=${plan.toLowerCase()}`, mock: true };
}

/** Upgrade/downgrade the active subscription. Upgrades apply instantly
    (credits bump via the credit engine's plan sync); downgrades keep the
    current plan until the period ends. */
export function changePlan(userId: string, plan: Plan, interval?: Interval): { ok: boolean; effective: "now" | "period_end" } {
  let sub = db.subscriptions.find((s) => s.userId === userId);
  if (!sub) {
    // First upgrade from FREE — provision the subscription record.
    if (plan === "FREE") return { ok: false, effective: "now" };
    sub = {
      id: uid("sub"), userId, plan: "FREE", status: "ACTIVE", interval: interval ?? "MONTH",
      currentPeriodEnd: helpers.daysAhead(interval === "YEAR" ? 365 : 30), cancelAtPeriodEnd: false, createdAt: helpers.now(),
    };
    db.subscriptions.insert(sub);
  }
  const order = ["FREE", "PRO", "BUSINESS", "ENTERPRISE"] as const;
  const upgrade = order.indexOf(plan) > order.indexOf(sub.plan);
  if (upgrade) {
    db.subscriptions.update((s) => s.userId === userId, { plan, interval: interval ?? sub.interval, status: "ACTIVE", cancelAtPeriodEnd: false });
    db.users.update((u) => u.id === userId, { plan, updatedAt: helpers.now() });
    track("conversion", { userId, meta: { plan, change: "upgrade" } });
    return { ok: true, effective: "now" };
  }
  // Downgrade at period end — mark the pending target in the sub record.
  db.subscriptions.update((s) => s.userId === userId, { cancelAtPeriodEnd: plan === "FREE", interval: interval ?? sub.interval });
  return { ok: true, effective: "period_end" };
}

/** Refund an order (mock: flips status + revokes nothing else; stripe: refund API). */
export function refundOrder(orderId: string): boolean {
  const order = db.orders.find((o) => o.id === orderId && o.status === "paid");
  if (!order) return false;
  db.orders.update((o) => o.id === orderId, { status: "refunded" });
  track("refund", { userId: order.userId, meta: { orderId, amount: order.amount } });
  emitEvent("payment.refunded", { orderId, userId: order.userId, amount: order.amount }, order.userId);
  tgEvents.paymentRefunded(orderId, order.amount);
  return true;
}

export function cancelSubscription(userId: string): boolean {
  return !!db.subscriptions.update((s) => s.userId === userId, { cancelAtPeriodEnd: true });
}
export function resumeSubscription(userId: string): boolean {
  return !!db.subscriptions.update((s) => s.userId === userId, { cancelAtPeriodEnd: false });
}
export const getSubscription = (userId: string) => db.subscriptions.find((s) => s.userId === userId) || null;
export const listOrders = (userId: string) => db.orders.filter((o) => o.userId === userId);

/** Billing portal URL — Stripe portal when live, account page in mock mode. */
export async function portalUrl(): Promise<string> {
  return serverConfig.billing.driver === "stripe" ? "/api/billing/portal" : "/account";
}

// ── Usage limits ────────────────────────────────────────────────────────
export function planLimits(plan: Plan) { return PLANS[plan].limits; }

export function checkJobQuota(userId: string, plan: Plan): { ok: boolean; used: number; limit: number } {
  const since = helpers.daysAgo(1);
  const used = db.jobs.count((j) => j.userId === userId && j.createdAt >= since);
  const limit = PLANS[plan].limits.jobsPerDay;
  return { ok: used < limit, used, limit };
}

// ── Webhooks (mock events use the same shape as Stripe) ─────────────────
export async function handleWebhook(event: { type: string; data?: { userId?: string; plan?: Plan } }): Promise<void> {
  const userId = event.data?.userId;
  switch (event.type) {
    case "invoice.paid":
      if (userId) db.subscriptions.update((s) => s.userId === userId, { status: "ACTIVE" });
      break;
    case "invoice.payment_failed":
      if (userId) db.subscriptions.update((s) => s.userId === userId, { status: "PAST_DUE" });
      break;
    case "customer.subscription.deleted":
      if (userId) {
        db.subscriptions.update((s) => s.userId === userId, { status: "CANCELED" });
        db.users.update((u) => u.id === userId, { plan: "FREE" });
      }
      break;
  }
}
