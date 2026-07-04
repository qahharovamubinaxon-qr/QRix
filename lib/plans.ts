// Client-safe plan config. Prices are display-only; the real charge is defined
// by the Stripe Price referenced by STRIPE_PRICE_PRO_MONTHLY on the server.

export const PRO_PRICE_USD = 5; // per month, display value

export const PRO_FEATURES = [
  "Unlimited dynamic QR codes",
  "Real-time scan analytics",
  "No ads, anywhere",
  "Bulk generation & CSV export",
  "Custom branding — remove “Made with QRix”",
  "Priority processing",
];

export const FREE_FEATURES = [
  "All 55+ tools, free forever",
  "QR codes with logo & colors",
  "PDF / image tools in your browser",
  "Basic scan analytics",
];

/** True when Stripe checkout is configured on this deployment. */
export function billingEnabled(): boolean {
  return typeof window === "undefined"
    ? !!process.env.STRIPE_SECRET_KEY && !!process.env.STRIPE_PRICE_PRO_MONTHLY
    : !!process.env.NEXT_PUBLIC_BILLING_ENABLED;
}
