/**
 * Client-safe plan catalog — the one place the browser learns what a plan costs.
 *
 * The money is charged by the server catalog in lib/server/billing.ts (in cents,
 * via the Stripe Price ids); the figures here mirror it and must not drift. They
 * had already started to: the homepage carried its own hand-typed copy of the
 * prices, printed the annual-prepay rate under a "/mo" label, rounded Business to
 * $40 when that rate is $40.83, and had no Enterprise tier at all. Two hardcoded
 * lists cannot stay in step, so now there is one.
 *
 * The old exports here (PRO_PRICE_USD, PRO_FEATURES, FREE_FEATURES) were imported
 * by nothing and are gone.
 */

export type PlanId = "free" | "pro" | "business" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  /** US dollars per month when billed monthly. = billing.ts PLANS[].monthly / 100 */
  monthly: number;
  /** US dollars for twelve months paid up front. = billing.ts PLANS[].yearly / 100 */
  yearly: number;
  recommended?: boolean;
  tagline: string;
  cta: string;
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free", name: "Free", monthly: 0, yearly: 0,
    tagline: "Everything you need to start", cta: "Start creating — it's free",
    features: [
      "All 185+ tools, free forever",
      "QR codes with logo & colors",
      "On-device PDF / image / video tools",
      "60 AI credits every month",
      "3 free 3D generations",
      "Basic scan analytics",
    ],
  },
  {
    id: "pro", name: "Pro", monthly: 5, yearly: 48, recommended: true,
    tagline: "For creators and small teams", cta: "Upgrade to Pro",
    features: [
      "Unlimited dynamic QR codes",
      "Real-time scan analytics",
      "1,000 AI credits / month",
      "Priority processing queue",
      "No ads, anywhere",
      "Custom branding — no QRix badge",
      "Email support",
    ],
  },
  {
    id: "business", name: "Business", monthly: 49, yearly: 490,
    tagline: "Everything unlimited — for teams that scale", cta: "Start Business trial",
    features: [
      "Everything in Pro",
      "Unlimited AI credits",
      "Unlimited team seats & roles",
      "Unlimited API access + webhooks",
      "Unlimited API keys",
      "Unlimited dynamic QR & bulk",
      "Priority SLA support",
      "White-label — no QRix badge",
    ],
  },
  {
    id: "enterprise", name: "Enterprise", monthly: 199, yearly: 1990,
    tagline: "Dedicated infrastructure and contracts", cta: "Contact sales",
    features: [
      "Everything in Business",
      "Dedicated infrastructure",
      "SSO / SAML",
      "Custom contracts & invoicing",
      "Audit log exports",
      "Named support engineer",
      "99.9% uptime SLA",
    ],
  },
];

/**
 * What a year up front actually saves, per plan — computed, not asserted. The
 * pricing toggle promised a flat "Save 20%", which is true of Pro (60 → 48) and
 * not of Business or Enterprise (588 → 490 is 17%).
 */
export function yearlySavingPct(p: Plan): number {
  if (!p.monthly) return 0;
  return Math.round((1 - p.yearly / (p.monthly * 12)) * 100);
}

/** True when Stripe checkout is configured on this deployment. */
export function billingEnabled(): boolean {
  return typeof window === "undefined"
    ? !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_PRO_MONTHLY
    : !!process.env.NEXT_PUBLIC_BILLING_ENABLED;
}
