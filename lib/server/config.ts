/**
 * Central backend configuration. Every subsystem reads its driver + credentials
 * from here, so the whole platform is switchable through environment variables
 * and falls back to safe mock drivers when nothing is configured. SERVER ONLY.
 */

const env = (k: string) => process.env[k]?.trim() || undefined;
const bool = (k: string) => env(k) === "1" || env(k) === "true";

export const serverConfig = {
  /** Data layer. `prisma` requires DATABASE_URL; otherwise the in-memory mock. */
  db: {
    driver: env("DATABASE_URL") ? "prisma" : "mock",
    url: env("DATABASE_URL"),
  },

  /** Auth providers — each lights up only when its keys are present. */
  auth: {
    secret: env("AUTH_SECRET") || "dev-insecure-secret-change-me",
    sessionDays: Number(env("AUTH_SESSION_DAYS") || 30),
    supabase: !!env("NEXT_PUBLIC_SUPABASE_URL") && !!env("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    providers: {
      credentials: true,
      google: !!env("GOOGLE_CLIENT_ID") && !!env("GOOGLE_CLIENT_SECRET"),
      github: !!env("GITHUB_CLIENT_ID") && !!env("GITHUB_CLIENT_SECRET"),
      email: !!env("EMAIL_SERVER") || bool("AUTH_MAGIC_LINK"),
    },
  },

  /** File storage. local | s3 | supabase. */
  storage: {
    driver: (env("STORAGE_DRIVER") as "local" | "s3" | "supabase") || "local",
    bucket: env("STORAGE_BUCKET") || "qrix-uploads",
    region: env("S3_REGION"),
    endpoint: env("S3_ENDPOINT"),
    accessKey: env("S3_ACCESS_KEY_ID"),
    secretKey: env("S3_SECRET_ACCESS_KEY"),
    tempTtlMinutes: Number(env("STORAGE_TEMP_TTL") || 60),
  },

  /** Cache / rate-limit backing store. redis | memory. */
  cache: {
    driver: env("REDIS_URL") ? "redis" : "memory",
    url: env("REDIS_URL"),
  },

  /** Background job queue. redis-backed when available, else in-process. */
  queue: {
    driver: env("REDIS_URL") ? "redis" : "memory",
    maxAttempts: Number(env("JOB_MAX_ATTEMPTS") || 3),
    concurrency: Number(env("JOB_CONCURRENCY") || 2),
  },

  /** Provider abstractions — switch engines without touching tool code. */
  providers: {
    ai: (env("AI_PROVIDER") as AiProvider) || "local",
    video: (env("VIDEO_PROVIDER") as VideoProvider) || "local",
    image: (env("IMAGE_PROVIDER") as ImageProvider) || "local",
    keys: {
      openai: env("OPENAI_API_KEY"),
      gemini: env("GEMINI_API_KEY"),
      replicate: env("REPLICATE_API_TOKEN"),
      // Must match the envKey the Cloudflare adapter/manager actually resolve
      // (lib/server/ai/providers.ts). CLOUDFLARE_AI_TOKEN is kept as a fallback
      // alias so an older deployment's value still works.
      cloudflare: env("CLOUDFLARE_API_KEY") || env("CLOUDFLARE_AI_TOKEN"),
      cloudflareAccount: env("CLOUDFLARE_ACCOUNT_ID"),
      encoderUrl: env("VIDEO_ENCODER_URL"),
    },
  },

  /** Billing — real Stripe when keyed, otherwise a fully-working mock. */
  billing: {
    driver: env("STRIPE_SECRET_KEY") ? "stripe" : "mock",
    secret: env("STRIPE_SECRET_KEY"),
    webhookSecret: env("STRIPE_WEBHOOK_SECRET"),
    trialDays: Number(env("BILLING_TRIAL_DAYS") || 14),
    prices: {
      proMonthly: env("STRIPE_PRICE_PRO_MONTHLY"),
      proYearly: env("STRIPE_PRICE_PRO_YEARLY"),
      bizMonthly: env("STRIPE_PRICE_BUSINESS_MONTHLY"),
      bizYearly: env("STRIPE_PRICE_BUSINESS_YEARLY"),
    },
  },

  /** Transactional email. smtp | resend | mailgun | console(mock). */
  email: {
    driver: (env("EMAIL_DRIVER") as "smtp" | "resend" | "mailgun" | "console") || "console",
    from: env("EMAIL_FROM") || "QRix <no-reply@qrixtools.com>",
    resendKey: env("RESEND_API_KEY"),
    smtp: env("EMAIL_SERVER"),
  },

  security: {
    rateLimit: { windowMs: 60_000, max: Number(env("RATE_LIMIT_MAX") || 60) },
    admins: (env("ADMIN_EMAILS") || "musarasulzada@gmail.com").split(",").map((s) => s.trim().toLowerCase()),
  },
} as const;

export type AiProvider = "openai" | "gemini" | "replicate" | "cloudflare" | "local";
export type VideoProvider = "ffmpeg" | "cloud" | "local";
export type ImageProvider = "local" | "ai" | "cloud";

/** True when a subsystem is running on its real driver (not the mock). */
export const isLive = {
  db: serverConfig.db.driver !== "mock",
  billing: serverConfig.billing.driver !== "mock",
  cache: serverConfig.cache.driver !== "memory",
  queue: serverConfig.queue.driver !== "memory",
  email: serverConfig.email.driver !== "console",
};
