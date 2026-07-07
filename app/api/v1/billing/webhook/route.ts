import { handler, ok, badRequest } from "@/lib/server/api";
import { handleWebhook } from "@/lib/server/billing";
import { serverConfig } from "@/lib/server/config";

export const runtime = "nodejs";

/** POST — billing webhooks. Mock driver accepts Stripe-shaped JSON events;
    the live driver keeps signature verification in app/api/billing/webhook. */
export const POST = handler(async ({ req }) => {
  if (serverConfig.billing.driver === "stripe") {
    return ok({ forwarded: "/api/billing/webhook" });
  }
  const event = (await req.json().catch(() => null)) as { type?: string; data?: { userId?: string } } | null;
  if (!event?.type) throw badRequest("invalid event");
  await handleWebhook(event as { type: string; data?: { userId?: string } });
  return ok({ received: true });
}, { rateLimit: { max: 120 } });
