/** Minimal Telegram Bot API client — fetch only, zero deps. SERVER ONLY. */
import { tgConfig } from "./config";
import { log } from "../logger";

export type InlineKeyboard = { text: string; callback_data?: string; url?: string }[][];

export interface TgUpdate {
  update_id: number;
  message?: { message_id: number; from?: { id: number; username?: string }; chat: { id: number }; text?: string };
  callback_query?: { id: string; from: { id: number; username?: string }; message?: { message_id: number; chat: { id: number } }; data?: string };
}

async function call<T = unknown>(method: string, payload?: Record<string, unknown>): Promise<T | null> {
  if (!tgConfig.token) return null;
  try {
    // getUpdates long-polls up to 25s — its abort window must outlast that.
    const r = await fetch(`https://api.telegram.org/bot${tgConfig.token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload ? JSON.stringify(payload) : undefined,
      signal: AbortSignal.timeout(method === "getUpdates" ? 35_000 : 15_000),
    });
    const j = (await r.json()) as { ok: boolean; result?: T; description?: string };
    if (!j.ok) { log.warn("telegram_api_error", { method, description: j.description }); return null; }
    return j.result ?? null;
  } catch (e) {
    log.warn("telegram_api_unreachable", { method, error: e instanceof Error ? e.message : String(e) });
    return null;
  }
}

export const tg = {
  getMe: () => call<{ id: number; username: string }>("getMe"),

  sendMessage: (chatId: number, text: string, keyboard?: InlineKeyboard) =>
    call<{ message_id: number }>("sendMessage", {
      chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true,
      ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
    }),

  editMessage: (chatId: number, messageId: number, text: string, keyboard?: InlineKeyboard) =>
    call("editMessageText", {
      chat_id: chatId, message_id: messageId, text, parse_mode: "HTML", disable_web_page_preview: true,
      ...(keyboard ? { reply_markup: { inline_keyboard: keyboard } } : {}),
    }),

  answerCallback: (id: string, text?: string) =>
    call("answerCallbackQuery", { callback_query_id: id, ...(text ? { text, show_alert: false } : {}) }),

  setWebhook: (url: string) =>
    call<boolean>("setWebhook", { url, secret_token: tgConfig.secretToken, allowed_updates: ["message", "callback_query"], drop_pending_updates: true }),

  deleteWebhook: (dropPending = true) => call<boolean>("deleteWebhook", { drop_pending_updates: dropPending }),

  getWebhookInfo: () => call<{ url: string; pending_update_count: number; last_error_message?: string }>("getWebhookInfo"),

  getUpdates: (offset: number) =>
    call<TgUpdate[]>("getUpdates", { offset, timeout: 25, allowed_updates: ["message", "callback_query"] }),
};
