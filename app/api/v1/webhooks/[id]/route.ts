import { handler, ok, notFound } from "@/lib/server/api";
import { deleteWebhook, toggleWebhook, testWebhook, listDeliveries } from "@/lib/server/webhooks";

export const runtime = "nodejs";

/** GET — delivery history for one endpoint. */
export const GET = handler(async ({ user, params }) => ok(listDeliveries(user!.id, params.id)), { auth: true });

/** POST — {test:true} fires a test delivery; {active} toggles the endpoint. */
export const POST = handler(async ({ req, user, params }) => {
  const body = (await req.json().catch(() => ({}))) as { test?: boolean; active?: boolean };
  if (body.test) {
    if (!testWebhook(user!.id, params.id)) throw notFound("webhook not found");
    return ok({ queued: true });
  }
  if (typeof body.active === "boolean") {
    if (!toggleWebhook(user!.id, params.id, body.active)) throw notFound("webhook not found");
    return ok({ active: body.active });
  }
  return ok({ noop: true });
}, { auth: true, action: "webhook.manage" });

export const DELETE = handler(async ({ user, params }) => {
  if (!deleteWebhook(user!.id, params.id)) throw notFound("webhook not found");
  return ok({ deleted: true });
}, { auth: true, action: "webhook.delete" });
