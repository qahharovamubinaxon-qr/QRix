import { handler, ok, validate } from "@/lib/server/api";
import { portalUrl, cancelSubscription, resumeSubscription, getSubscription, listOrders, changePlan } from "@/lib/server/billing";
import type { Plan, Interval } from "@/lib/server/models";

export const runtime = "nodejs";

/** GET — subscription + invoices + portal URL. */
export const GET = handler(async ({ user }) => ok({
  subscription: getSubscription(user!.id),
  orders: listOrders(user!.id),
  portal: await portalUrl(),
}), { auth: true });

/** POST — manage the subscription: cancel | resume | upgrade | downgrade. */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ action: string; plan?: string; interval?: string }>(await req.json(), {
    action: { type: "string", enum: ["cancel", "resume", "upgrade", "downgrade"] },
    plan: { type: "string", optional: true, enum: ["FREE", "PRO", "BUSINESS", "ENTERPRISE"] },
    interval: { type: "string", optional: true, enum: ["MONTH", "YEAR"] },
  });
  let done = false; let effective: "now" | "period_end" | undefined;
  if (body.action === "cancel") done = cancelSubscription(user!.id);
  else if (body.action === "resume") done = resumeSubscription(user!.id);
  else {
    const res = changePlan(user!.id, (body.plan || "PRO") as Plan, body.interval as Interval | undefined);
    done = res.ok; effective = res.effective;
  }
  return ok({ done, effective, subscription: getSubscription(user!.id) });
}, { auth: true, action: "billing.manage" });
