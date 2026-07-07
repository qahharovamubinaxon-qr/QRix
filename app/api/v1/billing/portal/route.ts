import { handler, ok, validate } from "@/lib/server/api";
import { portalUrl, cancelSubscription, resumeSubscription, getSubscription, listOrders } from "@/lib/server/billing";

export const runtime = "nodejs";

/** GET — subscription + invoices + portal URL. */
export const GET = handler(async ({ user }) => ok({
  subscription: getSubscription(user!.id),
  orders: listOrders(user!.id),
  portal: await portalUrl(),
}), { auth: true });

/** POST — manage the subscription: cancel | resume. */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ action: string }>(await req.json(), { action: { type: "string", enum: ["cancel", "resume"] } });
  const done = body.action === "cancel" ? cancelSubscription(user!.id) : resumeSubscription(user!.id);
  return ok({ done, subscription: getSubscription(user!.id) });
}, { auth: true, action: "billing.manage" });
