/** Analytics + audit logging and the aggregations the admin dashboard renders.
    Writes to the Event/AuditLog collections (mock) or the DB when live. */
import { db, uid, helpers } from "./db";

/** Record a product event (tool use, download, signup, conversion, page view). */
export function track(name: string, opts: { userId?: string | null; tool?: string | null; meta?: unknown } = {}) {
  db.events.insert({ id: uid("evt"), name, userId: opts.userId ?? null, tool: opts.tool ?? null, meta: opts.meta ?? null, createdAt: helpers.now() });
}

/** Record an admin/security-relevant action. */
export function audit(actorId: string | null, action: string, target?: string, ip?: string, meta?: unknown) {
  db.audit.insert({ id: uid("aud"), actorId, action, target: target ?? null, ip: ip ?? null, meta: meta ?? null, createdAt: helpers.now() });
}

const dayKey = (iso: string) => iso.slice(0, 10);

/** A daily time series (last `days`) for one or all event names. */
export function series(name: string | null, days = 30): { date: string; value: number }[] {
  const buckets = new Map<string, number>();
  for (let d = days - 1; d >= 0; d--) buckets.set(dayKey(helpers.daysAgo(d)), 0);
  for (const e of db.events.all()) {
    if (name && e.name !== name) continue;
    const k = dayKey(e.createdAt);
    if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + 1);
  }
  return [...buckets.entries()].map(([date, value]) => ({ date, value }));
}

/** Headline metrics for the admin overview + revenue dashboard. */
export function overview() {
  const users = db.users.all();
  const events = db.events.all();
  const since = (days: number) => helpers.daysAgo(days);
  const active = (days: number) =>
    new Set(events.filter((e) => e.createdAt >= since(days) && e.userId).map((e) => e.userId)).size;

  const paidOrders = db.orders.filter((o) => o.status === "paid");
  const revenue = paidOrders.reduce((s, o) => s + o.amount, 0);
  const mrr = db.subscriptions
    .filter((s) => s.status === "ACTIVE" || s.status === "TRIALING")
    .reduce((s, sub) => s + (sub.plan === "BUSINESS" ? 4900 : sub.plan === "ENTERPRISE" ? 19900 : 500) / (sub.interval === "YEAR" ? 12 : 1), 0);

  const signups = events.filter((e) => e.name === "signup").length;
  const conversions = events.filter((e) => e.name === "conversion").length;

  return {
    users: users.length,
    dau: active(1),
    mau: active(30),
    pro: users.filter((u) => u.plan !== "FREE").length,
    toolUses: events.filter((e) => e.name === "tool_use").length,
    downloads: events.filter((e) => e.name === "download").length,
    revenue,
    mrr: Math.round(mrr),
    activeSubs: db.subscriptions.count((s) => s.status === "ACTIVE" || s.status === "TRIALING"),
    conversionRate: signups ? Math.round((conversions / signups) * 1000) / 10 : 0,
  };
}

/** Top tools by usage over the window. */
export function topTools(limit = 8, days = 30) {
  const since = helpers.daysAgo(days);
  const counts = new Map<string, number>();
  for (const e of db.events.all()) {
    if (e.name !== "tool_use" || !e.tool || e.createdAt < since) continue;
    counts.set(e.tool, (counts.get(e.tool) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([tool, count]) => ({ tool, count }));
}
