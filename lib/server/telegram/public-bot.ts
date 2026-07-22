/* Admin-side control of the PUBLIC downloader bot.

   The bot's own webhook route self-registers via ?setup=1 behind CRON_SECRET,
   which means reaching for a terminal and a secret every time. The owner
   already authenticates to /admin with a magic link, so the same actions are
   exposed there — no secret handling, no curl.

   Kept separate from app/api/telegram/bot/route.ts on purpose: a Next route
   file should export route handlers and nothing else. */

import { SITE_URL } from "@/lib/seo";

const token = () => process.env.TELEGRAM_PUBLIC_BOT_TOKEN;

export function publicBotConfigured(): boolean {
  return !!token();
}

async function call(method: string, payload: Record<string, unknown> = {}): Promise<any | null> {
  const t = token();
  if (!t) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${t}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(15_000),
    });
    const j = await r.json();
    return j?.ok ? j.result : null;
  } catch { return null; }
}

export type BotStatus = {
  configured: boolean;
  username?: string;
  /* Inline needs BOTH halves and they fail independently, so report them
     separately — a single "inline on" chip would go green off the webhook
     alone while typing @bot in a chat still does nothing. */
  /** BotFather /setinline was run (getMe reports it). */
  inlineAllowed: boolean;
  /** inline_query is in the webhook's allowed_updates, so Telegram delivers it. */
  inlineSubscribed: boolean;
  webhookUrl?: string;
  pendingUpdates?: number;
  lastError?: string;
};

export async function botStatus(): Promise<BotStatus> {
  if (!token()) return { configured: false, inlineAllowed: false, inlineSubscribed: false };
  const [me, hook] = await Promise.all([call("getMe"), call("getWebhookInfo")]);
  const allowed: string[] = hook?.allowed_updates || [];
  return {
    configured: true,
    username: me?.username,
    inlineAllowed: !!me?.supports_inline_queries,
    // an empty allowed_updates means "all except chat_member", which includes inline
    inlineSubscribed: allowed.length === 0 || allowed.includes("inline_query"),
    webhookUrl: hook?.url || undefined,
    pendingUpdates: hook?.pending_update_count,
    lastError: hook?.last_error_message || undefined,
  };
}

/** (Re)register the webhook including inline_query — the button behind /admin. */
export async function registerWebhook(): Promise<{ ok: boolean; status: BotStatus }> {
  if (!token()) return { ok: false, status: { configured: false, inlineAllowed: false, inlineSubscribed: false } };
  const res = await call("setWebhook", {
    url: `${SITE_URL}/api/telegram/bot`,
    secret_token: process.env.TELEGRAM_PUBLIC_SECRET || undefined,
    allowed_updates: ["message", "callback_query", "inline_query"],
  });
  return { ok: !!res, status: await botStatus() };
}
