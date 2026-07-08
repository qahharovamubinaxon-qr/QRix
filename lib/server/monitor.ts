/**
 * Production monitoring — one aggregate health snapshot across every
 * subsystem, consumed by /api/health (liveness), /api/ready (readiness)
 * and the admin System tab. Includes env/secret validation. SERVER ONLY.
 */
import { serverConfig, isLive } from "./config";
import { cache } from "./cache";
import { storageDriver, storageAnalytics } from "./storage";
import { queueStats } from "./queue";
import { providerStatus } from "./ai/manager";
import { emailReady } from "./email";
import { creditStats } from "./credits";
import { db } from "./db";
import { dbHealthy } from "./prisma";
import { telegramConfigured, telegramMissing, tgConfig } from "./telegram/config";

export type HealthState = "ok" | "degraded" | "down";

/** Validate production configuration — surfaced in readiness + admin. */
export function envValidation(): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const prod = process.env.NODE_ENV === "production";
  if (prod && serverConfig.auth.secret === "dev-insecure-secret-change-me") issues.push("AUTH_SECRET is the insecure default");
  if (prod && !isLive.db) issues.push("DATABASE_URL not set — running on the in-memory mock store");
  if (serverConfig.billing.driver === "stripe" && !serverConfig.billing.webhookSecret) issues.push("STRIPE_WEBHOOK_SECRET missing while Stripe is live");
  if (serverConfig.storage.driver === "s3" && (!serverConfig.storage.accessKey || !serverConfig.storage.secretKey)) issues.push("S3 driver selected but S3_ACCESS_KEY_ID/S3_SECRET_ACCESS_KEY missing");
  if (serverConfig.email.driver === "resend" && !serverConfig.email.resendKey) issues.push("EMAIL_DRIVER=resend but RESEND_API_KEY missing");
  return { ok: issues.length === 0, issues };
}

export async function systemHealth() {
  const [cacheOk, storageOk, providers, pgOk] = await Promise.all([
    cache.healthy(),
    storageDriver.ping(),
    providerStatus(),
    isLive.db ? dbHealthy() : Promise.resolve(false),
  ]);
  const queue = queueStats();
  const env = envValidation();
  const aiReady = providers.some((p) => p.ready);

  const components = {
    database: {
      driver: serverConfig.db.driver,
      state: (isLive.db ? (pgOk ? "ok" : "down") : "degraded") as HealthState,
      note: isLive.db ? undefined : "mock in-memory store",
    },
    cache: { driver: cache.driver, state: (cacheOk ? "ok" : "down") as HealthState },
    storage: { ...storageAnalytics(), state: (storageOk ? "ok" : "down") as HealthState },
    queue: { ...queue, state: (queue.failed > queue.done ? "degraded" : "ok") as HealthState },
    aiProviders: { state: (aiReady ? "ok" : "degraded") as HealthState, ready: providers.filter((p) => p.ready).length, total: providers.length },
    billing: { driver: serverConfig.billing.driver, state: "ok" as HealthState },
    email: { driver: serverConfig.email.driver, state: (emailReady() ? "ok" : "degraded") as HealthState, note: emailReady() ? undefined : "console driver (dev)" },
    telegram: {
      driver: telegramConfigured() ? `@${tgConfig.username}` : "off",
      state: (telegramConfigured() ? "ok" : "degraded") as HealthState,
      note: telegramConfigured() ? undefined : `Missing Configuration: ${telegramMissing().join(", ")}`,
    },
  };

  const states = Object.values(components).map((c) => c.state);
  const overall: HealthState = states.includes("down") ? "down" : states.includes("degraded") ? "degraded" : "ok";

  return {
    overall,
    components,
    env,
    stats: {
      users: db.users.count(),
      credits: creditStats(),
      subscriptions: {
        active: db.subscriptions.count((s) => s.status === "ACTIVE"),
        trialing: db.subscriptions.count((s) => s.status === "TRIALING"),
        pastDue: db.subscriptions.count((s) => s.status === "PAST_DUE"),
        canceled: db.subscriptions.count((s) => s.status === "CANCELED"),
      },
    },
    uptime: Math.round(process.uptime()),
    version: process.env.npm_package_version || "0.1.0",
    timestamp: new Date().toISOString(),
  };
}
