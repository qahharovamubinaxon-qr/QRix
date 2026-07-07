import { handler, ok, validate, badRequest } from "@/lib/server/api";
import { createWebhook, listWebhooks, listDeliveries, WEBHOOK_EVENTS } from "@/lib/server/webhooks";

export const runtime = "nodejs";

/** GET — the caller's webhook endpoints + recent deliveries + event catalog. */
export const GET = handler(async ({ user }) => ok({
  webhooks: listWebhooks(user!.id),
  deliveries: listDeliveries(user!.id).slice(0, 30),
  events: WEBHOOK_EVENTS,
}), { auth: true });

/** POST — register an endpoint. The signing secret is returned exactly once. */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ url: string; events?: string }>(await req.json(), {
    url: { type: "string", min: 12, max: 300 },
    events: { type: "string", optional: true, max: 500 },
  });
  if (!/^https?:\/\//.test(body.url)) throw badRequest("url must be http(s)");
  const events = body.events ? body.events.split(",").map((e) => e.trim()) : [...WEBHOOK_EVENTS];
  const { webhook, secret } = createWebhook(user!.id, body.url, events);
  return ok({ id: webhook.id, url: webhook.url, events: webhook.events, secret });
}, { auth: true, action: "webhook.create" });
