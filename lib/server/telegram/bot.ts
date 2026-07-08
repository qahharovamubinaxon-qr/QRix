/**
 * Telegram Admin Bot — update processing with strict security:
 *   • OWNER-only: every update from anyone else is silently rejected
 *   • webhook secret-token validation (handled by the route)
 *   • replay protection (monotonic update_id)
 *   • per-minute rate limiting + full audit logging
 *   • command whitelist (/start /menu /help) — everything else is buttons
 * Transport auto-detect: production → webhook; dev → long-polling loop.
 * SERVER ONLY.
 */
import { tg, type TgUpdate } from "./api";
import { tgConfig, telegramConfigured } from "./config";
import {
  mainMenu, dashScreen, usersScreen, userScreen, userHistory, subsScreen,
  revenueScreen, paymentsScreen, creditsScreen, analyticsScreen, aiScreen,
  queueScreen, storageScreen, serverScreen, logsScreen, notifsScreen,
  maintScreen, deployScreen, settingsScreen, confirmScreen, runAction, quickAction,
  type Screen,
} from "./screens";
import { buildReport } from "./notify";
import { updateProviderSettings } from "../ai/manager";
import { PROVIDERS, type ProviderId } from "../ai/providers";
import { rateLimit } from "../security";
import { audit } from "../analytics";
import { log } from "../logger";

let lastUpdateId = 0; // replay protection

async function screenFor(data: string): Promise<Screen | { toast: string }> {
  const [cmd, a, b] = data.split(":");
  switch (cmd) {
    case "menu": return mainMenu();
    case "dash": return dashScreen();
    case "users": return usersScreen(Number(a) || 0);
    case "user": return userScreen(a);
    case "uhist": return userHistory(a);
    case "subs": return subsScreen();
    case "revenue": return revenueScreen();
    case "payments": return paymentsScreen(Number(a) || 0);
    case "credits": return creditsScreen();
    case "analytics": return analyticsScreen(Number(a) || 7);
    case "ai": return aiScreen();
    case "queue": return queueScreen(a || "AI");
    case "storage": return storageScreen();
    case "server": return serverScreen();
    case "logs": return logsScreen();
    case "notifs": return notifsScreen();
    case "maint": return maintScreen();
    case "deploy": return deployScreen();
    case "settings": return settingsScreen();
    case "confirm": return confirmScreen(a, b ?? "");
    case "do": return { toast: await runAction(a, b ?? "") };
    case "plan": return { toast: quickAction("plan", a, b) };
    case "grant": return { toast: quickAction("grant", a, b) };
    case "report": return { toast: "📤 Report sent below." , };
    case "aiset": {
      if (!PROVIDERS[a as ProviderId]) return { toast: "Unknown provider" };
      await updateProviderSettings(a as ProviderId, b === "primary" ? { primary: true } : { enabled: b === "on" });
      return aiScreen();
    }
    case "aitest": {
      const key = process.env[PROVIDERS[a as ProviderId]?.envKey]?.trim();
      if (!key) return { toast: `${a}: no key configured` };
      const t0 = Date.now();
      try {
        await PROVIDERS[a as ProviderId].call(PROVIDERS[a as ProviderId].capabilities[0], { prompt: "ping", maxTokens: 8 }, key);
        return { toast: `🧪 ${a}: OK in ${Date.now() - t0}ms` };
      } catch (e) {
        return { toast: `🧪 ${a}: failed — ${e instanceof Error ? e.message.slice(0, 60) : "error"}` };
      }
    }
    case "noop": return { toast: "Nothing to do." };
    default: return mainMenu();
  }
}

/** Process one validated update. Returns true if handled. */
export async function handleUpdate(update: TgUpdate): Promise<boolean> {
  if (!telegramConfigured()) return false;

  // Replay protection — ignore stale/duplicate update ids.
  if (update.update_id <= lastUpdateId) return false;
  lastUpdateId = update.update_id;

  const from = update.message?.from ?? update.callback_query?.from;
  const chatId = update.message?.chat.id ?? update.callback_query?.message?.chat.id;
  if (!from || !chatId) return false;

  // OWNER-only. Anyone else: silent reject + audit; never reveal anything.
  if (from.id !== tgConfig.ownerId) {
    audit(null, "telegram.rejected", `uid:${from.id}${from.username ? ` @${from.username}` : ""}`);
    log.warn("telegram_rejected", { from: from.id });
    return true;
  }

  // Rate limit the owner too (fat-finger/flood safety).
  const rl = await rateLimit(`tg:${from.id}`, { max: 40, windowMs: 60_000 });
  if (!rl.ok) return true;

  // Callback buttons — the primary interface.
  if (update.callback_query) {
    const q = update.callback_query;
    const data = q.data || "menu";
    audit(String(from.id), "telegram.action", data);
    const res = await screenFor(data);

    if ("toast" in res) {
      await tg.answerCallback(q.id, res.toast.slice(0, 190));
      if (data.startsWith("report:")) {
        await tg.sendMessage(chatId, await buildReport(data.split(":")[1] as "daily" | "weekly" | "monthly"));
      } else if (data.startsWith("do:") || data.startsWith("plan:") || data.startsWith("grant:")) {
        // After an action, land back on a sensible screen.
        const home = data.startsWith("do:refund") ? paymentsScreen(0) : mainMenu();
        await tg.editMessage(chatId, q.message!.message_id, home.text, home.keyboard).catch(() => {});
      }
      return true;
    }
    await tg.answerCallback(q.id);
    await tg.editMessage(chatId, q.message!.message_id, res.text, res.keyboard);
    return true;
  }

  // Text messages — whitelist only.
  const text = (update.message?.text || "").trim();
  audit(String(from.id), "telegram.message", text.slice(0, 60));
  if (text === "/start" || text === "/menu") {
    const m = mainMenu();
    await tg.sendMessage(chatId, m.text, m.keyboard);
  } else if (text === "/help") {
    await tg.sendMessage(chatId, "🛠 <b>QRix Admin Bot</b>\n\n/start · /menu — open the admin menu\n/help — this message\n\nEverything else works through the inline buttons. Send plain text while on the Users screen to search by email.");
  } else if (text && !text.startsWith("/")) {
    // Plain text = user search shortcut.
    const s = usersScreen(0, text);
    await tg.sendMessage(chatId, s.text, s.keyboard);
  } else {
    await tg.sendMessage(chatId, "Unknown command. Use /menu.");
  }
  return true;
}

/* ── dev long-polling (auto-detected; production uses the webhook) ── */
let polling = false;
export function startPollingIfDev() {
  if (polling || !telegramConfigured()) return;
  if (process.env.NODE_ENV === "production" || process.env.TELEGRAM_FORCE_WEBHOOK === "1") return;
  polling = true;
  log.info("telegram_polling_started", { bot: tgConfig.username });
  (async function loop() {
    // Ensure no webhook blocks getUpdates; KEEP pending updates so a /start
    // sent before the server booted still gets answered.
    await tg.deleteWebhook(false);
    let offset = 0;
    for (;;) {
      if (!polling) return;
      try {
        const updates = (await tg.getUpdates(offset)) || [];
        for (const u of updates) {
          offset = Math.max(offset, u.update_id + 1);
          await handleUpdate(u).catch((e) => log.error("telegram_update_failed", { error: String(e) }));
        }
      } catch {
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  })();
}
export function stopPolling() { polling = false; }
