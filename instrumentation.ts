/**
 * Next.js instrumentation — runs once when the server boots.
 * Starts the Telegram admin bot's dev long-polling loop immediately
 * (production uses the webhook instead), so the bot answers without
 * waiting for any route to be hit first.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startPollingIfDev } = await import("@/lib/server/telegram/bot");
    startPollingIfDev();
  }
}
