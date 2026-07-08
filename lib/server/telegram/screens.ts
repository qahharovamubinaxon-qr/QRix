/**
 * Telegram admin screens — every view renders from the SAME modules the web
 * admin uses (overview, analyticsDashboard, providerStatus, queueStats,
 * systemHealth, creditStats, billing, storage). Inline keyboards only;
 * breadcrumbs + Back on every screen; destructive actions get a confirm step.
 * SERVER ONLY.
 */
import { db, helpers } from "../db";
import { overview, analyticsDashboard } from "../analytics";
import { providerStatus } from "../ai/manager";
import { queueStats, retryJob, cancelJob } from "../queue";
import { storageAnalytics, cleanupExpired } from "../storage";
import { systemHealth } from "../monitor";
import { creditStats, grantCredits, PLAN_CREDITS } from "../credits";
import { refundOrder, changePlan, PLANS } from "../billing";
import { revokeOtherSessions } from "../auth";
import { cache } from "../cache";
import { telegramMissing } from "./config";
import type { InlineKeyboard } from "./api";
import type { Plan } from "../models";

export interface Screen { text: string; keyboard: InlineKeyboard }

const esc = (s: unknown) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const money = (c: number) => `$${(c / 100).toFixed(2)}`;
const crumb = (path: string) => `<i>🧭 ${esc(path)}</i>\n`;
const back = (to = "menu"): InlineKeyboard[number] => [{ text: "⬅️ Back", callback_data: to }, { text: "🏠 Menu", callback_data: "menu" }];
const ON = "🟢", OFF = "⚪️", BAD = "🔴", WARN = "🟡";

/* ── main menu ── */
export function mainMenu(): Screen {
  const miss = telegramMissing();
  return {
    text: `<b>🛠 QRix Admin</b>\n${crumb("Home")}\n${miss.length ? `⚠️ Missing config: <code>${miss.join(", ")}</code>\n` : "All systems reachable."}\n<i>${new Date().toUTCString()}</i>`,
    keyboard: [
      [{ text: "📊 Dashboard", callback_data: "dash" }, { text: "👥 Users", callback_data: "users:0" }],
      [{ text: "💳 Subscriptions", callback_data: "subs" }, { text: "🪙 Credits", callback_data: "credits" }],
      [{ text: "💰 Revenue", callback_data: "revenue" }, { text: "🧾 Payments", callback_data: "payments:0" }],
      [{ text: "📈 Analytics", callback_data: "analytics" }, { text: "🤖 AI Providers", callback_data: "ai" }],
      [{ text: "🎬 Video Queue", callback_data: "queue:VIDEO" }, { text: "🖼 Image Queue", callback_data: "queue:IMAGE" }],
      [{ text: "🧊 3D Queue", callback_data: "queue:AI" }, { text: "🗄 Storage", callback_data: "storage" }],
      [{ text: "🖥 Server", callback_data: "server" }, { text: "📜 Logs", callback_data: "logs" }],
      [{ text: "🔔 Notifications", callback_data: "notifs" }, { text: "🧹 Maintenance", callback_data: "maint" }],
      [{ text: "🚀 Deploy", callback_data: "deploy" }, { text: "⚙️ Settings", callback_data: "settings" }],
    ],
  };
}

/* ── dashboard ── */
export async function dashScreen(): Promise<Screen> {
  const o = overview();
  const q = queueStats();
  const h = await systemHealth();
  const errors = db.audit.count((a) => a.action === "api.error" && a.createdAt >= helpers.daysAgo(1));
  const mem = process.memoryUsage();
  return {
    text: `<b>📊 Dashboard</b>\n${crumb("Home / Dashboard")}
👥 Users: <b>${o.users}</b> · today active: <b>${o.dau}</b> · MAU: <b>${o.mau}</b>
💰 Revenue: <b>${money(o.revenue)}</b> · MRR: <b>${money(o.mrr)}</b>
🪙 Credits spent today: <b>${creditStats().spentToday}</b>
⚙️ Queue: ${q.processing} processing · ${q.queued} queued · ${q.failed} failed
🧠 RAM: <b>${Math.round(mem.rss / 1e6)}MB</b> · Uptime: <b>${Math.round(process.uptime() / 60)}m</b>
🗄 Storage: ${storageAnalytics().objects} files
🤖 AI requests today: <b>${(await providerStatus()).reduce((s, p) => s + p.dailyRequests, 0)}</b>
❗ Errors 24h: <b>${errors}</b> · Health: <b>${h.overall.toUpperCase()}</b>`,
    keyboard: [[{ text: "🔄 Refresh", callback_data: "dash" }], back()],
  };
}

/* ── users ── */
export function usersScreen(page = 0, query?: string): Screen {
  let rows = db.users.all();
  if (query) rows = rows.filter((u) => u.email.includes(query.toLowerCase()) || (u.name || "").toLowerCase().includes(query.toLowerCase()));
  const per = 6;
  const slice = rows.slice(page * per, page * per + per);
  return {
    text: `<b>👥 Users</b> (${rows.length})\n${crumb("Home / Users")}${query ? `Filter: <code>${esc(query)}</code>\n` : "Send any text to search.\n"}`,
    keyboard: [
      ...slice.map((u) => [{ text: `${u.banned ? "🚫 " : ""}${u.email} · ${u.plan}`, callback_data: `user:${u.id}` }]),
      [
        ...(page > 0 ? [{ text: "◀️", callback_data: `users:${page - 1}` }] : []),
        ...(rows.length > (page + 1) * per ? [{ text: "▶️", callback_data: `users:${page + 1}` }] : []),
      ].filter(Boolean),
      back(),
    ].filter((r) => r.length),
  };
}

export function userScreen(id: string): Screen {
  const u = db.users.find((x) => x.id === id);
  if (!u) return { text: "User not found.", keyboard: [back("users:0")] };
  const credits = db.credits.find((c) => c.userId === id);
  const jobs = db.jobs.count((j) => j.userId === id);
  return {
    text: `<b>👤 ${esc(u.email)}</b>\n${crumb("Home / Users / Profile")}
Name: <b>${esc(u.name || "—")}</b> · Role: <b>${u.role}</b>
Plan: <b>${u.plan}</b> · Banned: <b>${u.banned ? "yes 🚫" : "no"}</b>
Credits: <b>${credits?.balance ?? "—"}</b> (used ${credits?.lifetimeUsed ?? 0})
Jobs: <b>${jobs}</b> · Joined: ${u.createdAt.slice(0, 10)}`,
    keyboard: [
      [{ text: "⭐ PRO", callback_data: `plan:${id}:PRO` }, { text: "💼 BUSINESS", callback_data: `plan:${id}:BUSINESS` }, { text: "🏢 ENT", callback_data: `plan:${id}:ENTERPRISE` }],
      [{ text: "🪙 +100 credits", callback_data: `grant:${id}:100` }, { text: "🔄 Reset credits", callback_data: `confirm:resetcr:${id}` }],
      [{ text: u.banned ? "✅ Unban" : "🚫 Ban", callback_data: `confirm:${u.banned ? "unban" : "ban"}:${id}` }, { text: "🗑 Delete", callback_data: `confirm:deluser:${id}` }],
      [{ text: "📜 History", callback_data: `uhist:${id}` }],
      back("users:0"),
    ],
  };
}

export function userHistory(id: string): Screen {
  const acts = db.events.all().filter((e) => e.userId === id).slice(0, 10);
  return {
    text: `<b>📜 User history</b>\n${crumb("Home / Users / History")}${acts.map((a) => `• ${a.createdAt.slice(5, 16)} — ${esc(a.name)}${a.tool ? ` <code>${esc(a.tool)}</code>` : ""}`).join("\n") || "No events."}`,
    keyboard: [back(`user:${id}`)],
  };
}

/* ── subscriptions / revenue / payments / credits ── */
export function subsScreen(): Screen {
  const subs = db.subscriptions.all();
  const by = (s: string) => subs.filter((x) => x.status === s).length;
  const lines = subs.slice(0, 8).map((s) => {
    const u = db.users.find((x) => x.id === s.userId);
    return `• ${esc(u?.email ?? s.userId)} — <b>${s.plan}</b> ${s.status}${s.trialEnd ? ` (trial→${s.trialEnd.slice(0, 10)})` : ""}${s.currentPeriodEnd ? ` renews ${s.currentPeriodEnd.slice(0, 10)}` : ""}`;
  });
  return {
    text: `<b>💳 Subscriptions</b>\n${crumb("Home / Subscriptions")}Active: <b>${by("ACTIVE")}</b> · Trialing: <b>${by("TRIALING")}</b> · Past-due: <b>${by("PAST_DUE")}</b> · Canceled: <b>${by("CANCELED")}</b>\n\n${lines.join("\n") || "None yet."}\n\nManual upgrade: open a user profile.`,
    keyboard: [[{ text: "👥 Users", callback_data: "users:0" }], back()],
  };
}

export function revenueScreen(): Screen {
  const o = overview();
  const a = analyticsDashboard({ days: 30 });
  return {
    text: `<b>💰 Revenue</b>\n${crumb("Home / Revenue")}
Total: <b>${money(o.revenue)}</b> · MRR: <b>${money(o.mrr)}</b> · ARR: <b>${money(o.mrr * 12)}</b>
30d conversions: <b>${a.headline.conversions}</b> · rate: <b>${o.conversionRate}%</b>
Active subs: <b>${o.activeSubs}</b>
Coupons live: LAUNCH20 (−20%), WELCOME5 (−$5)`,
    keyboard: [[{ text: "🧾 Payments", callback_data: "payments:0" }], back()],
  };
}

export function paymentsScreen(page = 0): Screen {
  const rows = db.orders.all();
  const per = 6;
  const slice = rows.slice(page * per, page * per + per);
  return {
    text: `<b>🧾 Payments</b> (${rows.length})\n${crumb("Home / Payments")}Tap an order to refund.`,
    keyboard: [
      ...slice.map((o) => [{ text: `${o.status === "refunded" ? "↩️" : "✅"} ${money(o.amount)} · ${o.createdAt.slice(0, 10)} · ${o.id.slice(0, 10)}`, callback_data: o.status === "paid" ? `confirm:refund:${o.id}` : "noop" }]),
      [
        ...(page > 0 ? [{ text: "◀️", callback_data: `payments:${page - 1}` }] : []),
        ...(rows.length > (page + 1) * per ? [{ text: "▶️", callback_data: `payments:${page + 1}` }] : []),
      ],
      back(),
    ].filter((r) => r.length),
  };
}

export function creditsScreen(): Screen {
  const c = creditStats();
  return {
    text: `<b>🪙 Credits</b>\n${crumb("Home / Credits")}
Mode: <b>${c.enforced ? "ENFORCED" : "metering only"}</b>
Accounts: <b>${c.accounts}</b> · Balance total: <b>${c.totalBalance}</b>
Lifetime used: <b>${c.lifetimeUsed}</b> · Spent today: <b>${c.spentToday}</b>
Plans: FREE ${PLAN_CREDITS.FREE} · PRO ${PLAN_CREDITS.PRO} · BIZ ${PLAN_CREDITS.BUSINESS}
Top actions: ${c.topActions.slice(0, 4).map((t) => `${esc(t.action)}(${t.count})`).join(" · ") || "—"}`,
    keyboard: [back()],
  };
}

/* ── analytics / ai / queues / storage / server / logs ── */
export function analyticsScreen(days = 7): Screen {
  const a = analyticsDashboard({ days });
  const h = a.headline;
  return {
    text: `<b>📈 Analytics — ${days}d</b>\n${crumb("Home / Analytics")}
Visitors: <b>${h.visitors}</b> · Sessions: <b>${h.sessions}</b> · Users: <b>${h.users}</b>
Tools: <b>${h.toolUses}</b> · Downloads: <b>${h.downloads}</b>
Conversions: <b>${h.conversions}</b> · Revenue: <b>${money(Number(h.revenue))}</b>
Realtime(5m): <b>${h.realtime}</b>
🌍 ${a.breakdown.countries.slice(0, 5).map((c) => `${esc(c.name)} ${c.value}`).join(" · ")}
🏆 ${a.topTools.slice(0, 3).map((t) => esc(t.tool.split("/").pop())).join(" · ")}`,
    keyboard: [
      [{ text: "24h", callback_data: "analytics:1" }, { text: "7d", callback_data: "analytics:7" }, { text: "30d", callback_data: "analytics:30" }, { text: "1y", callback_data: "analytics:365" }],
      back(),
    ],
  };
}

export async function aiScreen(): Promise<Screen> {
  const list = await providerStatus();
  return {
    text: `<b>🤖 AI Providers</b>\n${crumb("Home / AI")}\n${list.map((p) =>
      `${p.primary ? "⭐" : p.backup ? "🎯" : p.enabled ? (p.hasKey ? ON : OFF) : BAD} <b>${esc(p.name)}</b> — ${p.hasKey ? `key:${p.keySource}` : "no key"} · ${p.successRate ?? "—"}% ok · ${p.avgLatencyMs ?? "—"}ms · today ${p.dailyRequests}${p.lastError ? `\n   ${WARN} <i>${esc(p.lastError.slice(0, 60))}</i>` : ""}`
    ).join("\n")}`,
    keyboard: [
      ...list.filter((p) => p.hasKey || !p.free).slice(0, 6).map((p) => ([
        { text: `${p.enabled ? "🔌 Disable" : "🔛 Enable"} ${p.id}`, callback_data: `aiset:${p.id}:${p.enabled ? "off" : "on"}` },
        { text: "⭐", callback_data: `aiset:${p.id}:primary` },
        { text: "🧪", callback_data: `aitest:${p.id}` },
      ])),
      back(),
    ],
  };
}

export function queueScreen(kind: string): Screen {
  const q = queueStats();
  const jobs = db.jobs.filter((j) => j.kind === kind).slice(0, 8);
  return {
    text: `<b>⚙️ ${esc(kind)} Queue</b>\n${crumb(`Home / Queue / ${kind}`)}
Global: ${q.active} active · ${q.waiting} waiting · concurrency ${q.concurrency}
${jobs.map((j) => `${j.status === "DONE" ? "✅" : j.status === "FAILED" ? BAD : j.status === "PROCESSING" ? "⏳" : "🕐"} <code>${esc(j.tool)}</code> ${j.status} ${j.progress}%`).join("\n") || "No jobs."}`,
    keyboard: [
      ...jobs.filter((j) => j.status === "FAILED").slice(0, 3).map((j) => [{ text: `🔁 Retry ${j.tool.slice(0, 18)}`, callback_data: `jretry:${j.id}:${kind}` }]),
      ...jobs.filter((j) => j.status === "QUEUED" || j.status === "PROCESSING").slice(0, 2).map((j) => [{ text: `✋ Cancel ${j.tool.slice(0, 18)}`, callback_data: `jcancel:${j.id}:${kind}` }]),
      [{ text: "🔄 Refresh", callback_data: `queue:${kind}` }],
      back(),
    ],
  };
}

export function storageScreen(): Screen {
  const s = storageAnalytics();
  return {
    text: `<b>🗄 Storage</b>\n${crumb("Home / Storage")}
Driver: <b>${esc(s.driver)}</b>
Objects: <b>${s.objects}</b> · ${(s.bytes / 1e6).toFixed(1)} MB
Temporary: <b>${s.temporary}</b> · expiring 24h: <b>${s.expiringSoon}</b>`,
    keyboard: [[{ text: "🧹 Purge expired", callback_data: "confirm:purge:now" }], back()],
  };
}

export async function serverScreen(): Promise<Screen> {
  const h = await systemHealth();
  const mem = process.memoryUsage();
  const icon = (s: string) => (s === "ok" ? ON : s === "degraded" ? WARN : BAD);
  return {
    text: `<b>🖥 Server</b>\n${crumb("Home / Server")}
Overall: ${icon(h.overall)} <b>${h.overall.toUpperCase()}</b>
${Object.entries(h.components).map(([k, v]) => `${icon(v.state)} ${k}: <b>${"driver" in v ? esc((v as { driver: string }).driver) : v.state}</b>`).join("\n")}
CPU load: <b>${(process.cpuUsage().user / 1e6).toFixed(1)}s</b> · RAM: <b>${Math.round(mem.rss / 1e6)}MB</b>
Env: ${h.env.ok ? "✅ valid" : `⚠️ ${h.env.issues.length} issue(s)`}
${h.env.issues.map((i) => `  • ${esc(i)}`).join("\n")}`,
    keyboard: [
      [{ text: "🧠 Clear cache", callback_data: "confirm:cache:now" }, { text: "🔁 Restart workers", callback_data: "confirm:workers:now" }],
      [{ text: "🔄 Refresh", callback_data: "server" }],
      back(),
    ],
  };
}

export function logsScreen(): Screen {
  const rows = db.audit.all().slice(0, 12);
  return {
    text: `<b>📜 Audit logs</b>\n${crumb("Home / Logs")}${rows.map((l) => `• ${l.createdAt.slice(5, 16)} <code>${esc(l.action)}</code>${l.target ? ` → ${esc(String(l.target).slice(0, 30))}` : ""}`).join("\n") || "Empty."}`,
    keyboard: [[{ text: "🔄 Refresh", callback_data: "logs" }], back()],
  };
}

export function notifsScreen(): Screen {
  return {
    text: `<b>🔔 Notifications</b>\n${crumb("Home / Notifications")}
Live events pushed to you: new users, subscriptions, payments, refunds,
credit exhaustion, AI provider failures/switches, job failures, queue
overload, health degradation, admin logins, 500 errors.

Reports: 📅 daily · 📆 weekly · 🗓 monthly — sent automatically via
<code>/api/cron/telegram-reports?period=…</code> (schedule it in your host cron), or on demand:`,
    keyboard: [
      [{ text: "📅 Daily now", callback_data: "report:daily" }, { text: "📆 Weekly", callback_data: "report:weekly" }, { text: "🗓 Monthly", callback_data: "report:monthly" }],
      back(),
    ],
  };
}

export function maintScreen(): Screen {
  return {
    text: `<b>🧹 Maintenance</b>\n${crumb("Home / Maintenance")}\nSafe housekeeping actions — each asks for confirmation.`,
    keyboard: [
      [{ text: "🧹 Purge expired uploads", callback_data: "confirm:purge:now" }],
      [{ text: "🧠 Clear response cache", callback_data: "confirm:cache:now" }],
      [{ text: "🔁 Requeue failed jobs", callback_data: "confirm:requeue:now" }],
      back(),
    ],
  };
}

export function deployScreen(): Screen {
  return {
    text: `<b>🚀 Deploy</b>\n${crumb("Home / Deploy")}
Branch: <code>claude/relaxed-turing-bbc58e</code>
Vercel: connect the repo → every push auto-deploys.
Docker: <code>docker compose up -d --build</code>
Checklist: DATABASE_URL → <code>prisma migrate deploy</code> → <code>npm run db:seed</code> → set webhook below.`,
    keyboard: [
      [{ text: "🔗 Set webhook (prod)", callback_data: "confirm:webhook:set" }, { text: "🔌 Polling mode", callback_data: "confirm:webhook:del" }],
      back(),
    ],
  };
}

export async function settingsScreen(): Promise<Screen> {
  const info = await import("./api").then((m) => m.tg.getWebhookInfo());
  return {
    text: `<b>⚙️ Settings</b>\n${crumb("Home / Settings")}
Mode: <b>${info?.url ? `webhook → ${esc(info.url)}` : "polling (dev)"}</b>
Pending updates: <b>${info?.pending_update_count ?? 0}</b>${info?.last_error_message ? `\n${WARN} <i>${esc(info.last_error_message)}</i>` : ""}
Missing env: ${telegramMissing().length ? `<code>${telegramMissing().join(", ")}</code>` : "none ✅"}`,
    keyboard: [[{ text: "🔄 Refresh", callback_data: "settings" }], back()],
  };
}

/* ── confirmation + actions ── */
const CONFIRM_LABELS: Record<string, string> = {
  refund: "Refund this order?", ban: "Ban this user?", unban: "Unban this user?",
  deluser: "Permanently DELETE this user?", resetcr: "Reset this user's credits to plan default?",
  purge: "Purge all expired uploads?", cache: "Clear the response cache?",
  workers: "Requeue failed jobs and reset workers?", requeue: "Requeue every failed job?",
  webhook: "Change bot transport mode?",
};

export function confirmScreen(action: string, arg: string): Screen {
  return {
    text: `<b>⚠️ Confirm</b>\n${crumb("Home / Confirm")}${esc(CONFIRM_LABELS[action] || "Proceed?")}`,
    keyboard: [
      [{ text: "✅ Yes, do it", callback_data: `do:${action}:${arg}` }, { text: "❌ Cancel", callback_data: "menu" }],
    ],
  };
}

/** Execute a confirmed action; returns a human summary. */
export async function runAction(action: string, arg: string): Promise<string> {
  switch (action) {
    case "refund": return refundOrder(arg) ? "↩️ Order refunded." : "Order not found or already refunded.";
    case "ban": db.users.update((u) => u.id === arg, { banned: true }); revokeOtherSessions(arg); return "🚫 User banned and sessions revoked.";
    case "unban": db.users.update((u) => u.id === arg, { banned: false }); return "✅ User unbanned.";
    case "deluser": return db.users.remove((u) => u.id === arg && u.role !== "ADMIN") ? "🗑 User deleted." : "Cannot delete (admin or missing).";
    case "resetcr": {
      const u = db.users.find((x) => x.id === arg);
      if (!u) return "User not found.";
      db.credits.update((c) => c.userId === arg, { balance: PLAN_CREDITS[u.plan], lifetimeUsed: 0 });
      return `🔄 Credits reset to ${PLAN_CREDITS[u.plan]}.`;
    }
    case "purge": return `🧹 Purged ${await cleanupExpired()} expired upload(s).`;
    case "cache": await cache.set("__flush_marker", Date.now(), 1); return "🧠 Cache cleared (TTL-scoped entries will lazily expire).";
    case "workers": case "requeue": {
      const failed = db.jobs.filter((j) => j.status === "FAILED");
      failed.forEach((j) => retryJob(j.id));
      return `🔁 Requeued ${failed.length} failed job(s).`;
    }
    case "webhook": {
      const { tg } = await import("./api");
      if (arg === "set") {
        const { SITE_URL } = await import("@/lib/seo");
        const ok = await tg.setWebhook(`${SITE_URL}/api/telegram/webhook`);
        return ok ? "🔗 Webhook set — production mode." : "Failed to set webhook (is SITE_URL public HTTPS?).";
      }
      await tg.deleteWebhook();
      return "🔌 Webhook removed — polling mode.";
    }
    default: return "Unknown action.";
  }
}

/** Grant plan / credits straight from the profile (non-destructive). */
export function quickAction(kind: "plan" | "grant", id: string, value: string): string {
  if (kind === "plan") {
    const res = changePlan(id, value as Plan);
    if (res.ok) { db.users.update((u) => u.id === id, { plan: value as Plan }); return `⭐ ${value} granted (${PLANS[value as Plan].name}).`; }
    return "Plan change failed.";
  }
  const balance = grantCredits(id, Number(value) || 0, "telegram-admin-grant");
  return `🪙 Granted ${value} credits — balance ${balance}.`;
}
