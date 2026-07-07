import { handler, ok, validate } from "@/lib/server/api";
import { createCheckout } from "@/lib/server/billing";
import type { Plan, Interval } from "@/lib/server/models";

export const runtime = "nodejs";

/** POST — start checkout (mock activates instantly with trial; stripe redirects). */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ plan: string; interval?: string; coupon?: string }>(await req.json(), {
    plan: { type: "string", enum: ["PRO", "BUSINESS", "ENTERPRISE"] },
    interval: { type: "string", optional: true, enum: ["MONTH", "YEAR"] },
    coupon: { type: "string", optional: true, max: 30 },
  });
  const res = await createCheckout(user!.id, body.plan as Plan, (body.interval as Interval) || "MONTH", body.coupon);
  return ok(res);
}, { auth: true, action: "billing.checkout" });
