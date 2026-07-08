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

// ── Enterprise analytics dashboard (Mission 12) ─────────────────────────
export interface AnalyticsFilters {
  days?: number;                 // 1 | 7 | 30 | 365
  country?: string;
  device?: string;
  plan?: string;
  tool?: string;
  userId?: string;
}

type Meta = { country?: string; device?: string; browser?: string; referrer?: string; hour?: number };

function filteredEvents(f: AnalyticsFilters) {
  const since = helpers.daysAgo(f.days ?? 30);
  const planUsers = f.plan ? new Set(db.users.filter((u) => u.plan === f.plan).map((u) => u.id)) : null;
  return db.events.all().filter((e) => {
    if (e.createdAt < since) return false;
    const m = (e.meta ?? {}) as Meta;
    if (f.country && m.country !== f.country) return false;
    if (f.device && m.device !== f.device) return false;
    if (f.tool && e.tool !== f.tool) return false;
    if (f.userId && e.userId !== f.userId) return false;
    if (planUsers && (!e.userId || !planUsers.has(e.userId))) return false;
    return true;
  });
}

const countBy = (rows: { meta?: unknown }[], key: keyof Meta, limit = 10) => {
  const m = new Map<string, number>();
  for (const r of rows) {
    const v = String(((r.meta ?? {}) as Meta)[key] ?? "unknown");
    m.set(v, (m.get(v) || 0) + 1);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([name, value]) => ({ name, value }));
};

/** Everything the analytics board renders, filtered + range-scoped. */
export function analyticsDashboard(f: AnalyticsFilters = {}) {
  const days = f.days ?? 30;
  const events = filteredEvents(f);
  const nowMs = Date.now();

  const of = (name: string) => events.filter((e) => e.name === name);
  const pageViews = of("page_view");
  const toolUses = of("tool_use");
  const uniqueUsers = (rows: typeof events) => new Set(rows.filter((e) => e.userId).map((e) => e.userId)).size;

  // Sessions ≈ unique user×day pairs (anonymous events count as traffic only).
  const sessions = new Set(events.map((e) => `${e.userId ?? "anon"}:${e.createdAt.slice(0, 10)}`)).size;

  // Per-category usage from tool href prefixes.
  const catOf = (t: string) => t.startsWith("/qr") || t.startsWith("/barcode") || t.startsWith("/bulk-qr") || t.startsWith("/poster") ? "QR"
    : t.startsWith("/pdf") ? "PDF" : t.startsWith("/image") ? "Image" : t.startsWith("/video") ? "Video"
    : t.startsWith("/ai") || t.startsWith("ai:") ? "AI" : "Other";
  const byCategory = new Map<string, number>();
  for (const e of toolUses) if (e.tool) byCategory.set(catOf(e.tool), (byCategory.get(catOf(e.tool)) || 0) + 1);

  // Funnel: traffic → tool use → signup → paid conversion.
  const funnel = [
    { stage: "Visitors", value: pageViews.length || events.length },
    { stage: "Tool used", value: toolUses.length },
    { stage: "Signed up", value: of("signup").length },
    { stage: "Converted", value: of("conversion").length },
  ];

  // Retention: of users active on day N, % active again within 7 days (last 8 cohorts).
  const cohorts: { day: string; size: number; retained: number }[] = [];
  for (let d = Math.min(days, 8); d >= 2; d--) {
    const day = helpers.daysAgo(d).slice(0, 10);
    const cohort = new Set(db.events.all().filter((e) => e.createdAt.slice(0, 10) === day && e.userId).map((e) => e.userId!));
    if (!cohort.size) continue;
    const later = new Set(db.events.all().filter((e) => e.createdAt.slice(0, 10) > day && e.userId && cohort.has(e.userId)).map((e) => e.userId!));
    cohorts.push({ day, size: cohort.size, retained: Math.round((later.size / cohort.size) * 100) });
  }

  // Heatmap: weekday × hour activity grid.
  const heat: number[][] = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const e of events) {
    const m = (e.meta ?? {}) as Meta;
    const dt = new Date(e.createdAt);
    heat[dt.getUTCDay()][m.hour ?? dt.getUTCHours()]++;
  }

  // Most active users.
  const perUser = new Map<string, number>();
  for (const e of events) if (e.userId) perUser.set(e.userId, (perUser.get(e.userId) || 0) + 1);
  const activeUsers = [...perUser.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id, count]) => ({
    email: db.users.find((u) => u.id === id)?.email ?? id, count,
  }));

  // Revenue & credits within range.
  const since = helpers.daysAgo(days);
  const orders = db.orders.filter((o) => o.status === "paid" && o.createdAt >= since);
  const creditSpend = db.creditLedger.all().filter((e) => e.amount < 0 && e.createdAt >= since).reduce((s, e) => s - e.amount, 0);

  return {
    range: { days },
    headline: {
      visitors: pageViews.length || events.length,
      sessions,
      users: uniqueUsers(events),
      toolUses: toolUses.length,
      downloads: of("download").length,
      uploads: db.uploads.count((u) => u.createdAt >= since),
      conversions: of("conversion").length,
      revenue: orders.reduce((s, o) => s + o.amount, 0),
      subscriptions: db.subscriptions.count((s) => s.status === "ACTIVE" || s.status === "TRIALING"),
      creditsSpent: creditSpend,
      realtime: db.events.all().filter((e) => nowMs - new Date(e.createdAt).getTime() < 5 * 60_000).length,
    },
    series: {
      traffic: series(null, days),
      toolUse: series("tool_use", days),
      signups: series("signup", days),
      revenueDaily: (() => {
        const buckets = new Map<string, number>();
        for (let d = days - 1; d >= 0; d--) buckets.set(helpers.daysAgo(d).slice(0, 10), 0);
        for (const o of orders) { const k = o.createdAt.slice(0, 10); if (buckets.has(k)) buckets.set(k, (buckets.get(k) || 0) + o.amount); }
        return [...buckets.entries()].map(([date, value]) => ({ date, value }));
      })(),
    },
    breakdown: {
      countries: countBy(events, "country"),
      devices: countBy(events, "device", 4),
      browsers: countBy(events, "browser", 6),
      referrers: countBy(events, "referrer", 8),
      categories: [...byCategory.entries()].sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value })),
    },
    topTools: topTools(10, days),
    activeUsers,
    funnel,
    retention: cohorts,
    heatmap: heat,
  };
}

/** Flatten the dashboard into rows for CSV/Excel/PDF/JSON export. */
export function analyticsExportRows(f: AnalyticsFilters = {}): [string, string | number][] {
  const d = analyticsDashboard(f);
  const rows: [string, string | number][] = [["metric", "value"] as [string, string]];
  for (const [k, v] of Object.entries(d.headline)) rows.push([k, v]);
  for (const t of d.topTools) rows.push([`tool:${t.tool}`, t.count]);
  for (const c of d.breakdown.countries) rows.push([`country:${c.name}`, c.value]);
  for (const c of d.breakdown.devices) rows.push([`device:${c.name}`, c.value]);
  for (const s of d.funnel) rows.push([`funnel:${s.stage}`, s.value]);
  return rows;
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
