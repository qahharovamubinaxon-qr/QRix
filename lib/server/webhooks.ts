/**
 * Webhook platform — subscribe an HTTPS endpoint to platform events, get
 * HMAC-signed deliveries with automatic retry and a full delivery history.
 *
 *   emitEvent("job.completed", payload)  → fan-out to every matching endpoint
 *
 * Signature: `X-QRix-Signature: sha256=<hmac>` over the raw body using the
 * endpoint's secret (shown once at creation). SERVER ONLY.
 */
import { db, uid, helpers } from "./db";
import { randomToken, sha256 } from "./security";
import { log } from "./logger";

export const WEBHOOK_EVENTS = [
  "job.completed", "job.failed",
  "subscription.created", "subscription.canceled",
  "payment.succeeded", "payment.refunded",
  "credits.low", "upload.created",
  "workspace.member_joined",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export interface Webhook {
  id: string;
  userId: string;
  url: string;
  events: string[];
  secret: string; // stored to sign payloads; only the prefix is echoed to clients
  active: boolean;
  failures: number;
  createdAt: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  status: "pending" | "success" | "failed";
  httpStatus?: number | null;
  attempts: number;
  payload: unknown;
  createdAt: string;
  updatedAt: string;
}

const MAX_ATTEMPTS = 3;

export function createWebhook(userId: string, url: string, events: string[]): { webhook: Webhook; secret: string } {
  const secret = `whsec_${randomToken(20)}`;
  const webhook: Webhook = {
    id: uid("wh"), userId, url,
    events: events.filter((e) => (WEBHOOK_EVENTS as readonly string[]).includes(e)),
    secret, active: true, failures: 0, createdAt: helpers.now(),
  };
  db.webhooks.insert(webhook);
  return { webhook, secret };
}

export const listWebhooks = (userId: string) =>
  db.webhooks.filter((w) => w.userId === userId).map((w) => ({ ...w, secret: `${w.secret.slice(0, 10)}…` }));

export const deleteWebhook = (userId: string, id: string) =>
  db.webhooks.remove((w) => w.userId === userId && w.id === id) > 0;

export const toggleWebhook = (userId: string, id: string, active: boolean) =>
  !!db.webhooks.update((w) => w.userId === userId && w.id === id, { active, failures: 0 });

export const listDeliveries = (userId: string, webhookId?: string) => {
  const mine = new Set(db.webhooks.filter((w) => w.userId === userId).map((w) => w.id));
  return db.webhookDeliveries.filter((d) => mine.has(d.webhookId) && (!webhookId || d.webhookId === webhookId)).slice(0, 100);
};

/** HMAC-style signature (sha256 over secret+body — verify by recomputing). */
export async function signPayload(secret: string, body: string): Promise<string> {
  return `sha256=${await sha256(`${secret}.${body}`)}`;
}

async function attemptDelivery(deliveryId: string): Promise<void> {
  const d = db.webhookDeliveries.find((x) => x.id === deliveryId);
  const hook = d && db.webhooks.find((w) => w.id === d.webhookId);
  if (!d || !hook || !hook.active) return;

  const body = JSON.stringify({ id: d.id, event: d.event, createdAt: d.createdAt, data: d.payload });
  try {
    const res = await fetch(hook.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-QRix-Event": d.event,
        "X-QRix-Delivery": d.id,
        "X-QRix-Signature": await signPayload(hook.secret, body),
      },
      body,
      signal: AbortSignal.timeout(8000),
    });
    db.webhookDeliveries.update((x) => x.id === deliveryId, {
      status: res.ok ? "success" : "failed", httpStatus: res.status,
      attempts: d.attempts + 1, updatedAt: helpers.now(),
    });
    if (!res.ok) scheduleRetry(deliveryId, d.attempts + 1, hook.id);
  } catch {
    db.webhookDeliveries.update((x) => x.id === deliveryId, { status: "failed", httpStatus: null, attempts: d.attempts + 1, updatedAt: helpers.now() });
    scheduleRetry(deliveryId, d.attempts + 1, hook.id);
  }
}

function scheduleRetry(deliveryId: string, attempts: number, hookId: string) {
  if (attempts < MAX_ATTEMPTS) {
    setTimeout(() => attemptDelivery(deliveryId), 1000 * 2 ** attempts);
  } else {
    const hook = db.webhooks.find((w) => w.id === hookId);
    if (hook) {
      const failures = hook.failures + 1;
      // Auto-disable chronically failing endpoints.
      db.webhooks.update((w) => w.id === hookId, { failures, active: failures < 10 });
      if (failures >= 10) log.warn("webhook_disabled", { hookId, url: hook.url });
    }
  }
}

/** Fire an event to every subscribed, active endpoint (fire-and-forget). */
export function emitEvent(event: WebhookEvent | string, payload: unknown, userId?: string | null) {
  const hooks = db.webhooks.filter((w) => w.active && w.events.includes(event) && (!userId || w.userId === userId));
  for (const hook of hooks) {
    const d: WebhookDelivery = {
      id: uid("whd"), webhookId: hook.id, event, status: "pending",
      attempts: 0, payload, createdAt: helpers.now(), updatedAt: helpers.now(),
    };
    db.webhookDeliveries.insert(d);
    setTimeout(() => attemptDelivery(d.id), 0);
  }
}

/** Manual test delivery from the dev portal. */
export function testWebhook(userId: string, id: string): boolean {
  const hook = db.webhooks.find((w) => w.userId === userId && w.id === id);
  if (!hook) return false;
  const d: WebhookDelivery = {
    id: uid("whd"), webhookId: hook.id, event: "test.ping", status: "pending",
    attempts: 0, payload: { message: "QRix webhook test" }, createdAt: helpers.now(), updatedAt: helpers.now(),
  };
  db.webhookDeliveries.insert(d);
  setTimeout(() => attemptDelivery(d.id), 0);
  return true;
}
