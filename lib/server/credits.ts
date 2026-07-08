/**
 * Credit Engine — one reusable metering core every premium feature calls.
 *
 *   chargeCredits(userId, "ai-image")  →  { ok, balance, cost }
 *
 * Monthly allowances per plan, admin-tunable action costs, grants/refunds
 * and full statistics. Charging is DISABLED by default (CREDITS_ENFORCED=1
 * turns it on) — the engine runs and records usage either way, so enabling
 * billing later is a flag flip, not a refactor. Ready for future 3D / voice /
 * OCR / API actions: register a cost, call charge. SERVER ONLY.
 */
import { db, uid, helpers } from "./db";
import { track } from "./analytics";
import type { Plan } from "./models";

export interface CreditAccount {
  userId: string;
  balance: number;
  monthlyAllowance: number;
  periodStart: string; // ISO month anchor
  lifetimeUsed: number;
}

export interface CreditEntry {
  id: string;
  userId: string;
  action: string;
  amount: number; // negative = spend, positive = grant/refund
  balance: number;
  createdAt: string;
}

/** Plan allowances (credits per month). Enterprise is custom via env/admin. */
export const PLAN_CREDITS: Record<Plan, number> = {
  FREE: 60,
  PRO: 1000,
  BUSINESS: 5000,
  ENTERPRISE: Number(process.env.ENTERPRISE_CREDITS || 50_000),
};

/** Default action costs — admin-modifiable at runtime (stored in db). */
const DEFAULT_COSTS: Record<string, number> = {
  "ai-text": 1, "ai-summarize": 1, "ai-translate": 1, "ai-code": 1,
  "ai-image": 5, "ai-image-analyze": 2, "ai-ocr": 2,
  "ai-video": 10, "video-encode": 8,
  "3d-generate": 20, "voice-clone": 15, "transcribe": 3,
  "api-call": 1,
};

export const creditsEnforced = () => process.env.CREDITS_ENFORCED === "1";

// ── Costs (admin-tunable) ───────────────────────────────────────────────
export function getCosts(): Record<string, number> {
  const overrides = Object.fromEntries(db.creditCosts.all().map((c) => [c.action, c.cost]));
  return { ...DEFAULT_COSTS, ...overrides };
}

export function setCost(action: string, cost: number) {
  if (db.creditCosts.find((c) => c.action === action)) db.creditCosts.update((c) => c.action === action, { cost });
  else db.creditCosts.insert({ action, cost });
}

export const costOf = (action: string) => getCosts()[action] ?? 1;

// ── Accounts ────────────────────────────────────────────────────────────
const monthKey = () => new Date().toISOString().slice(0, 7);

/** Get (or provision) the account; rolls the balance on a new month. */
export function getAccount(userId: string, plan: Plan = "FREE"): CreditAccount {
  let acc = db.credits.find((a) => a.userId === userId);
  const allowance = PLAN_CREDITS[plan];
  if (!acc) {
    acc = { userId, balance: allowance, monthlyAllowance: allowance, periodStart: monthKey(), lifetimeUsed: 0 };
    db.credits.insert(acc);
    return acc;
  }
  if (acc.periodStart !== monthKey()) {
    // Monthly reset — refresh to the plan allowance (no rollover on free tiers).
    db.credits.update((a) => a.userId === userId, { balance: allowance, monthlyAllowance: allowance, periodStart: monthKey() });
    acc = db.credits.find((a) => a.userId === userId)!;
  } else if (acc.monthlyAllowance !== allowance) {
    // Plan changed mid-cycle — grant the difference upward (never claw back).
    const bump = Math.max(0, allowance - acc.monthlyAllowance);
    db.credits.update((a) => a.userId === userId, { monthlyAllowance: allowance, balance: acc.balance + bump });
    acc = db.credits.find((a) => a.userId === userId)!;
  }
  return acc;
}

function ledger(userId: string, action: string, amount: number, balance: number) {
  db.creditLedger.insert({ id: uid("cr"), userId, action, amount, balance, createdAt: helpers.now() });
}

/** THE entry point premium features call. Deducts (when enforced) and records.
    `opts.force` enforces deduction regardless of the global flag — used by
    premium-only features like 3D generation after the free allowance. */
export function chargeCredits(userId: string, action: string, plan: Plan = "FREE", opts: { force?: boolean } = {}): { ok: boolean; cost: number; balance: number; enforced: boolean } {
  const cost = costOf(action);
  const acc = getAccount(userId, plan);

  if (!creditsEnforced() && !opts.force) {
    // Metering only: record usage, never block, never deduct.
    ledger(userId, `${action} (metered)`, 0, acc.balance);
    track("credit_use", { userId, tool: action, meta: { cost, enforced: false } });
    return { ok: true, cost, balance: acc.balance, enforced: false };
  }

  if (acc.balance < cost) return { ok: false, cost, balance: acc.balance, enforced: true };
  const balance = acc.balance - cost;
  db.credits.update((a) => a.userId === userId, { balance, lifetimeUsed: acc.lifetimeUsed + cost });
  ledger(userId, action, -cost, balance);
  track("credit_use", { userId, tool: action, meta: { cost, enforced: true } });
  return { ok: true, cost, balance, enforced: true };
}

/** Grant credits (signup bonus, referral reward, support, purchase). */
export function grantCredits(userId: string, amount: number, reason = "grant"): number {
  const acc = getAccount(userId);
  const balance = acc.balance + Math.max(0, amount);
  db.credits.update((a) => a.userId === userId, { balance });
  ledger(userId, reason, amount, balance);
  return balance;
}

/** Refund a failed charge. */
export function refundCredits(userId: string, action: string): number {
  return grantCredits(userId, costOf(action), `refund:${action}`);
}

export const creditHistory = (userId: string, limit = 50) =>
  db.creditLedger.filter((e) => e.userId === userId).slice(0, limit);

/** Platform statistics for the admin dashboard. */
export function creditStats() {
  const accounts = db.credits.all();
  const entries = db.creditLedger.all();
  const spentToday = entries.filter((e) => e.amount < 0 && e.createdAt >= helpers.daysAgo(1)).reduce((s, e) => s - e.amount, 0);
  const byAction = new Map<string, number>();
  for (const e of entries) if (e.amount <= 0) byAction.set(e.action, (byAction.get(e.action) || 0) + 1);
  return {
    enforced: creditsEnforced(),
    accounts: accounts.length,
    totalBalance: accounts.reduce((s, a) => s + a.balance, 0),
    lifetimeUsed: accounts.reduce((s, a) => s + a.lifetimeUsed, 0),
    spentToday,
    topActions: [...byAction.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([action, count]) => ({ action, count })),
    costs: getCosts(),
    planAllowances: PLAN_CREDITS,
  };
}
