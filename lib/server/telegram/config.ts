/** Telegram Admin Bot configuration — env only, never hardcoded. SERVER ONLY. */

const env = (k: string) => process.env[k]?.trim().replace(/^<|>$/g, "") || undefined;

export const tgConfig = {
  get token() { return env("TELEGRAM_BOT_TOKEN"); },
  get ownerId() { return Number(env("TELEGRAM_OWNER_ID") || 0); },
  get username() { return env("TELEGRAM_BOT_USERNAME"); },
  get secretToken() { return env("TELEGRAM_SECRET_TOKEN"); },
};

export function telegramMissing(): string[] {
  const missing: string[] = [];
  if (!tgConfig.token) missing.push("TELEGRAM_BOT_TOKEN");
  if (!tgConfig.ownerId) missing.push("TELEGRAM_OWNER_ID");
  if (!tgConfig.username) missing.push("TELEGRAM_BOT_USERNAME");
  if (!tgConfig.secretToken) missing.push("TELEGRAM_SECRET_TOKEN");
  return missing;
}

export const telegramConfigured = () => telegramMissing().length === 0;
