/**
 * Owner notifications + scheduled reports. `notifyOwner` is fire-and-forget
 * and throttled per event key so floods (e.g. repeated 500s) collapse into
 * one message per window. SERVER ONLY.
 */
import { tg } from "./api";
import { tgConfig, telegramConfigured } from "./config";
import { overview, analyticsDashboard } from "../analytics";
import { uzbekTrafficBlock } from "../analytics-ga";
import { creditStats } from "../credits";
import { queueStats } from "../queue";
import { db, helpers } from "../db";

const lastSent = new Map<string, number>();

/** Push a live event to the owner (throttled per key). */
export function notifyOwner(key: string, text: string, throttleMs = 60_000) {
  if (!telegramConfigured()) return;
  const now = Date.now();
  if ((lastSent.get(key) || 0) + throttleMs > now) return;
  lastSent.set(key, now);
  void tg.sendMessage(tgConfig.ownerId, text).catch(() => {});
}

export const tgEvents = {
  newUser: (email: string) => notifyOwner("user", `👤 <b>New user</b>\n${email}`, 5_000),
  newSubscription: (email: string, plan: string) => notifyOwner("sub", `💳 <b>New subscription</b>\n${email} → <b>${plan}</b>`, 0),
  paymentSuccess: (email: string, cents: number) => notifyOwner("pay", `💰 <b>Payment received</b>\n${email} — $${(cents / 100).toFixed(2)}`, 0),
  paymentRefunded: (orderId: string, cents: number) => notifyOwner("refund", `↩️ <b>Refund issued</b>\nOrder ${orderId} — $${(cents / 100).toFixed(2)}`, 0),
  creditsExhausted: (email: string) => notifyOwner(`credits:${email}`, `🪙 <b>Credits exhausted</b>\n${email} hit zero — upsell opportunity.`, 3_600_000),
  providerFailed: (provider: string, error: string) => notifyOwner(`ai:${provider}`, `🤖 <b>AI provider failing</b>\n${provider}: <i>${error.slice(0, 120)}</i>\nFallback engaged automatically.`, 600_000),
  jobFailed: (tool: string, error: string) => notifyOwner(`job:${tool}`, `⚙️ <b>Job failed</b> (retries exhausted)\n<code>${tool}</code>\n<i>${error.slice(0, 120)}</i>`, 300_000),
  queueOverload: (waiting: number) => notifyOwner("queue", `🚦 <b>Queue overload</b> — ${waiting} jobs waiting.`, 600_000),
  healthDegraded: (component: string, state: string) => notifyOwner(`health:${component}`, `🖥 <b>Health alert</b>\n${component} is <b>${state.toUpperCase()}</b>`, 900_000),
  adminLogin: (email: string, ip?: string) => notifyOwner("admin", `🔐 <b>Admin sign-in</b>\n${email}${ip ? ` from ${ip}` : ""}`, 0),
  serverError: (path: string, error: string) => notifyOwner("err500", `❗ <b>500 error</b>\n<code>${path}</code>\n<i>${error.slice(0, 140)}</i>`, 120_000),
  security: (what: string) => notifyOwner("sec", `🛡 <b>Security warning</b>\n${what}`, 60_000),
};

/* ── reports ── */
const money = (c: number) => `$${(c / 100).toFixed(2)}`;

export async function buildReport(period: "daily" | "weekly" | "monthly"): Promise<string> {
  const days = period === "daily" ? 1 : period === "weekly" ? 7 : 30;
  const a = analyticsDashboard({ days });
  const o = overview();
  const c = creditStats();
  const q = queueStats();
  const errors = db.audit.count((x) => x.action === "api.error" && x.createdAt >= helpers.daysAgo(days));
  const head = period === "daily" ? "📅 Daily report" : period === "weekly" ? "📆 Weekly report" : "🗓 Monthly report";
  const cat = (n: string) => a.breakdown.categories.find((x) => x.name === n)?.value ?? 0;

  const core = `<b>${head}</b> — ${new Date().toISOString().slice(0, 10)}
👥 Users: <b>${a.headline.users}</b> active / ${o.users} total · sessions ${a.headline.sessions}
💰 Revenue: <b>${money(Number(a.headline.revenue))}</b> · subs ${a.headline.subscriptions}
🪙 Credits: spent <b>${c.spentToday}</b> today · lifetime ${c.lifetimeUsed}
🏆 Top tools: ${a.topTools.slice(0, 5).map((t) => t.tool.split("/").pop()).join(" · ") || "—"}
🤖 AI ${cat("AI")} · 🎬 Video ${cat("Video")} · 🖼 Image ${cat("Image")} · 📄 PDF ${cat("PDF")} · 🔳 QR ${cat("QR")} · 🧊 3D ${cat("3D")}
⚙️ Queue: ${q.done} done · ${q.failed} failed
❗ Errors: <b>${errors}</b> · Health: server up ${Math.round(process.uptime() / 3600)}h`;

  /* Everything above this line comes from the in-memory mock db, which on
     Vercel is empty after every cold start — so those figures describe the
     lambda, not the site. The real visitor numbers come from GA4 and are
     appended in Uzbek, because that is the half the owner actually reads. */
  const traffic = await uzbekTrafficBlock(days);

  if (period === "weekly") {
    return `${core}
📈 Growth: ${a.funnel.map((f) => `${f.stage} ${f.value}`).join(" → ")}
🌍 Top countries: ${a.breakdown.countries.slice(0, 5).map((x) => `${x.name} ${x.value}`).join(" · ")}
🔥 Most active: ${a.activeUsers.slice(0, 3).map((u) => u.email).join(", ") || "—"}${traffic}`;
  }
  if (period === "monthly") {
    return `${core}
📊 MRR: <b>${money(o.mrr)}</b> · ARR: <b>${money(o.mrr * 12)}</b>
📈 Conversion rate: ${o.conversionRate}%
💸 Est. AI cost: $${(await (await import("../ai/manager")).providerStatus()).reduce((s, p) => s + p.costUsd, 0).toFixed(2)}
🧮 Profit estimate: ${money(Number(a.headline.revenue))} revenue − infra/AI costs.${traffic}`;
  }
  return core + traffic;
}

export async function sendReport(period: "daily" | "weekly" | "monthly"): Promise<boolean> {
  if (!telegramConfigured()) return false;
  const text = await buildReport(period);
  return !!(await tg.sendMessage(tgConfig.ownerId, text));
}
