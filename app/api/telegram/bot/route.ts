import { NextRequest, NextResponse } from "next/server";
import { resolveMedia } from "@/lib/server/media-download";
import { detectPlatform } from "@/lib/downloader-platforms";
import { rateLimit } from "@/lib/server/security";
import { cronAuthorized } from "@/lib/server/cron-auth";
import { SITE_URL } from "@/lib/seo";
import { recordStart, recordUse, cleanSource, sourceStats } from "@/lib/server/telegram/attribution";

export const runtime = "nodejs";
export const maxDuration = 60;

/* PUBLIC Telegram tool-bot (separate from the owner-only admin bot):
   send it a TikTok/Instagram/VK/… link → it replies with the video right in
   the chat plus buttons for every format (MP3, HD…). The CIS market lives in
   Telegram, and bots spread virally — this is distribution engineering.

   Env (all optional — absent = route no-ops):
     TELEGRAM_PUBLIC_BOT_TOKEN   @BotFather token for the PUBLIC bot
     TELEGRAM_PUBLIC_SECRET      webhook secret (any random string)

   One-time setup after deploy (owner): open
     /api/telegram/bot?setup=1  with the usual cron Authorization header —
   the server registers its own webhook with Telegram. */

const token = () => process.env.TELEGRAM_PUBLIC_BOT_TOKEN;
const secret = () => process.env.TELEGRAM_PUBLIC_SECRET || "";

async function tg(method: string, payload: Record<string, unknown>): Promise<any | null> {
  const t = token();
  if (!t) return null;
  try {
    const r = await fetch(`https://api.telegram.org/bot${t}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(30_000),
    });
    return await r.json();
  } catch { return null; }
}

const HELP =
  "👋 <b>QRix Downloader Bot</b>\n\n" +
  "Отправьте ссылку на видео — верну файл прямо в чат.\n" +
  "Havolani tashlang — videoni chatga qaytaraman.\n" +
  "Send a link — I'll reply with the file.\n\n" +
  "✅ TikTok · Instagram · VK · OK · X · Pinterest · SoundCloud …\n" +
  "🎬 MP4 · 🎵 MP3 · 🖼 JPG — без рекламы и водяных знаков\n" +
  "🌐 185+ tools: qrixtools.com";

/** Buttons shown with the welcome card — the share link is the viral loop. */
function welcomeKeyboard(botUser?: string) {
  const share = botUser
    ? `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/${botUser}`)}&text=${encodeURIComponent("Скачивай видео без водяных знаков / Videolarni suv belgisisiz yuklab ol")}`
    : `https://t.me/share/url?url=${encodeURIComponent(SITE_URL + "/downloader")}`;
  return [
    [{ text: "🌐 qrixtools.com — 185+ tools", url: `${SITE_URL}/downloader?utm_source=telegram&utm_medium=bot&utm_campaign=welcome` }],
    [{ text: "📤 Поделиться · Ulashish · Share", url: share }],
  ];
}

/** Cached bot username (for the share deep-link); one getMe per cold start. */
let botUsername: string | undefined;
async function whoAmI(): Promise<string | undefined> {
  if (botUsername) return botUsername;
  // tg() already unwraps `result`, so the username sits at the top level
  const me = await tg("getMe", {});
  botUsername = me?.username;
  return botUsername;
}

/** Signed streaming URL for a format token. */
const proxy = (t: string) => `${SITE_URL}/api/download/file?t=${encodeURIComponent(t)}`;

/* ── Inline mode ──────────────────────────────────────────────────────────
   `@qrix_downloader_bot <link>` typed inside ANY chat or group. This is the
   only way a bot legitimately reaches groups: a member invokes it, Telegram
   stamps every result "via @bot" for everyone to see, and no admin has to add
   anything — so there is nothing to ban. Telegram wants an answer within ~10s,
   so a slow extraction falls back to a deep link rather than timing out. */

type Lang = "ru" | "uz" | "en";
const pickLang = (code?: string): Lang =>
  /^uz/i.test(code || "") ? "uz" : /^(ru|be|kk|ky|tg|hy|az)/i.test(code || "") ? "ru" : "en";

const T = {
  ru: {
    open: "Открыть в боте", paste: "Вставьте ссылку на видео",
    hint: "TikTok · Instagram · VK · OK · Pinterest · SoundCloud",
    big: "Файл готов — откройте бота", unsupported: "Платформа не поддерживается",
    failed: "Не удалось прочитать ссылку", pm: "Открыть QRix",
    tools: "185+ бесплатных инструментов",
  },
  uz: {
    open: "Botda ochish", paste: "Video havolasini tashlang",
    hint: "TikTok · Instagram · VK · OK · Pinterest · SoundCloud",
    big: "Fayl tayyor — botni oching", unsupported: "Bu platforma qo'llab-quvvatlanmaydi",
    failed: "Havolani o'qib bo'lmadi", pm: "QRix'ni ochish",
    tools: "185+ bepul vosita",
  },
  en: {
    open: "Open in the bot", paste: "Paste a video link",
    hint: "TikTok · Instagram · VK · OK · Pinterest · SoundCloud",
    big: "File ready — open the bot", unsupported: "Platform not supported",
    failed: "Couldn't read that link", pm: "Open QRix",
    tools: "185+ free tools",
  },
} as const;

/** Icon to fall back on when a source gives us no thumbnail (required by Telegram). */
const FALLBACK_THUMB = `${SITE_URL}/icon.png`;

/** Deep link that opens the bot with the link pre-filled, and tags the placement. */
const deepLink = (bot: string, payload: string) =>
  `https://t.me/${bot}?start=${encodeURIComponent(payload)}`;

/** What we show when someone opens inline with no link yet — the tools, not an ad. */
function promoResults(l: Lang) {
  const t = T[l];
  const utm = "utm_source=telegram&utm_medium=inline";
  const items = [
    { id: "p_dl", title: "⬇️ Downloader", desc: t.hint, path: "/downloader" },
    { id: "p_qr", title: "🔳 QR Code Generator", desc: "URL · WiFi · vCard · WhatsApp", path: "/qr-tools" },
    { id: "p_pdf", title: "📄 PDF Tools", desc: "Merge · Split · Compress · Sign", path: "/pdf-tools" },
    { id: "p_img", title: "🖼 Image Tools", desc: "Compress · Resize · Remove background", path: "/image-tools" },
  ];
  return items.map((i) => ({
    type: "article",
    id: i.id,
    title: i.title,
    description: i.desc,
    thumbnail_url: FALLBACK_THUMB,
    input_message_content: {
      message_text: `<b>${i.title}</b> — ${t.tools}\n${SITE_URL}${i.path}?${utm}`,
      parse_mode: "HTML",
    },
  }));
}

async function handleInline(iq: any): Promise<void> {
  const id = iq?.id;
  if (!id) return;
  const query: string = String(iq?.query || "").trim();
  const l = pickLang(iq?.from?.language_code);
  const t = T[l];
  const bot = (await whoAmI()) || "qrix_downloader_bot";

  const answer = (results: unknown[], cache = 30) =>
    tg("answerInlineQuery", {
      inline_query_id: id, results, cache_time: cache, is_personal: true,
      button: { text: t.pm, start_parameter: "inline" },
    });

  const url = query.match(/https?:\/\/\S+/)?.[0];
  if (!url) { await answer(promoResults(l), 300); return; }

  if (!detectPlatform(url)) {
    await answer([{
      type: "article", id: "unsup", title: t.unsupported, description: t.hint,
      thumbnail_url: FALLBACK_THUMB,
      input_message_content: { message_text: `${t.hint}\n${SITE_URL}/downloader?utm_source=telegram&utm_medium=inline`, parse_mode: "HTML" },
    }]);
    return;
  }

  // Race the extraction: an inline answer that arrives late is an answer that
  // never happened, so hand back a deep link instead of losing the user.
  const info = await Promise.race([
    resolveMedia(url),
    new Promise<null>((r) => setTimeout(() => r(null), 6_000)),
  ]).catch(() => null);

  if (!info || !info.ok) {
    await answer([{
      type: "article", id: "open", title: info ? t.failed : t.big, description: t.open,
      thumbnail_url: FALLBACK_THUMB,
      input_message_content: { message_text: `${t.open}: ${deepLink(bot, "inline")}\n${url}`, disable_web_page_preview: true },
      reply_markup: { inline_keyboard: [[{ text: t.open, url: deepLink(bot, "inline") }]] },
    }], 0);
    return;
  }

  const title = (info.title || "QRix").slice(0, 90);
  const caption = `${title}\n\n@ QRix — qrixtools.com`;
  const thumb = info.thumbnail || FALLBACK_THUMB;
  const video = info.formats.find((f) => f.type === "video");
  const audio = info.formats.find((f) => f.type === "audio");
  const image = info.formats.find((f) => f.type === "image");

  const results: Record<string, unknown>[] = [];
  if (video) results.push({
    type: "video", id: "v", video_url: proxy(video.token), mime_type: "video/mp4",
    thumbnail_url: thumb, title: `🎬 ${title}`, description: video.label, caption,
  });
  if (audio) results.push({
    type: "audio", id: "a", audio_url: proxy(audio.token),
    title: `🎵 ${title}`, performer: info.author || "QRix", caption,
  });
  if (image) results.push({
    type: "photo", id: "i", photo_url: proxy(image.token), thumbnail_url: thumb,
    title: `🖼 ${title}`, caption,
  });
  if (!results.length) results.push({
    type: "article", id: "open", title: t.open, description: title,
    thumbnail_url: thumb,
    input_message_content: { message_text: `${t.open}: ${deepLink(bot, "inline")}`, disable_web_page_preview: true },
  });

  await answer(results, 0);
  void recordUse(iq?.from?.id, iq?.from?.language_code);
}

/** Callback buttons for the formats a link actually offers. */
function formatKeyboard(has: { video: boolean; audio: boolean; image: boolean }) {
  const row: { text: string; callback_data: string }[][] = [];
  if (has.video) row.push([{ text: "🎬 Video · HD", callback_data: "f:v" }]);
  if (has.audio) row.push([{ text: "🎵 Audio · MP3", callback_data: "f:a" }]);
  if (has.image) row.push([{ text: "🖼 Image", callback_data: "f:i" }]);
  return [...row, [{ text: "🌐 qrixtools.com — 185+ tools", url: `${SITE_URL}/downloader?utm_source=telegram&utm_medium=bot` }]];
}

export async function GET(req: NextRequest) {
  // owner-only webhook self-registration: /api/telegram/bot?setup=1
  if (req.nextUrl.searchParams.get("setup") === "1") {
    if (!cronAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
    if (!token()) return NextResponse.json({ ok: false, reason: "TELEGRAM_PUBLIC_BOT_TOKEN missing" });
    const res = await tg("setWebhook", {
      url: `${SITE_URL}/api/telegram/bot`,
      secret_token: secret() || undefined,
      allowed_updates: ["message", "callback_query", "inline_query"],
    });
    return NextResponse.json({ ok: !!res?.ok, telegram: res });
  }
  // owner-only: which placement actually brought users, and who came back
  if (req.nextUrl.searchParams.get("stats") === "1") {
    if (!cronAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
    return NextResponse.json({ ok: true, sources: await sourceStats() });
  }
  return NextResponse.json({ ok: true, bot: !!token() });
}

export async function POST(req: NextRequest) {
  if (!token()) return NextResponse.json({ ok: true }); // not configured — swallow
  if (secret() && req.headers.get("x-telegram-bot-api-secret-token") !== secret()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json().catch(() => null);

  // `@bot <link>` typed in any chat or group — the group-reach path
  if (update?.inline_query) {
    await handleInline(update.inline_query);
    return NextResponse.json({ ok: true });
  }

  // a tapped format button → deliver that file into the chat
  if (update?.callback_query) {
    await handleCallback(update.callback_query);
    return NextResponse.json({ ok: true });
  }

  const msg = update?.message;
  const chatId = msg?.chat?.id;
  const text: string = msg?.text || "";
  if (!chatId) return NextResponse.json({ ok: true });

  // "/start g_toshkent" — credit the placement that brought this user (once).
  const start = text.match(/^\/start(?:\s+(\S+))?/);
  if (start) {
    void recordStart(msg?.from?.id, cleanSource(start[1]), msg?.from?.language_code);
  }

  // per-chat fair-use limit
  const rl = await rateLimit(`tgbot:${chatId}`, { max: 20, windowMs: 3_600_000 });
  if (!rl.ok) {
    await tg("sendMessage", { chat_id: chatId, text: "⏳ Слишком много запросов — попробуйте через час. / Juda ko'p so'rov — bir soatdan keyin urinib ko'ring." });
    return NextResponse.json({ ok: true });
  }

  const urlMatch = text.match(/https?:\/\/\S+/);
  if (!urlMatch) {
    await tg("sendMessage", {
      chat_id: chatId, text: HELP, parse_mode: "HTML", disable_web_page_preview: true,
      reply_markup: { inline_keyboard: welcomeKeyboard(await whoAmI()) },
    });
    return NextResponse.json({ ok: true });
  }

  const url = urlMatch[0];
  if (!detectPlatform(url)) {
    await tg("sendMessage", {
      chat_id: chatId, parse_mode: "HTML", disable_web_page_preview: true,
      text: "❌ Эта платформа пока не поддерживается.\nBu platforma hozircha qo'llab-quvvatlanmaydi.\n\n✅ TikTok · Instagram · VK · OK · X · Pinterest · Reddit · SoundCloud · Vimeo …",
    });
    return NextResponse.json({ ok: true });
  }

  await tg("sendChatAction", { chat_id: chatId, action: "upload_video" });
  const info = await resolveMedia(url);
  if (!info.ok) {
    await tg("sendMessage", {
      chat_id: chatId, parse_mode: "HTML",
      text: "😕 Не удалось прочитать ссылку — возможно, пост приватный или удалён.\nHavolani o'qib bo'lmadi — post yopiq yoki o'chirilgan bo'lishi mumkin.",
    });
    return NextResponse.json({ ok: true });
  }

  const video = info.formats.find((f) => f.type === "video");
  const audio = info.formats.find((f) => f.type === "audio");
  const image = info.formats.find((f) => f.type === "image");
  const caption = `${(info.title || "").slice(0, 200)}\n\n@ QRix — qrixtools.com`;

  // Format buttons are CALLBACKS, not links: tapping one delivers the file into
  // the chat instead of bouncing the user to a browser. callback_data is capped
  // at 64 bytes (our signed tokens are far longer), so the handler re-reads the
  // original link from the message we are replying to — stateless, no storage.
  const kb = formatKeyboard({ video: !!video, audio: !!audio, image: !!image });
  // retention signal: the metric that separates a real placement from a tap
  void recordUse(msg?.from?.id, msg?.from?.language_code);

  const first = video
    ? await tg("sendVideo", { chat_id: chatId, video: proxy(video.token), caption, reply_to_message_id: msg.message_id, reply_markup: { inline_keyboard: kb } })
    : image
      ? await tg("sendPhoto", { chat_id: chatId, photo: proxy(image.token), caption, reply_to_message_id: msg.message_id, reply_markup: { inline_keyboard: kb } })
      : audio
        ? await tg("sendAudio", { chat_id: chatId, audio: proxy(audio.token), caption, reply_to_message_id: msg.message_id, reply_markup: { inline_keyboard: kb } })
        : null;

  // Telegram only fetches remote files up to ~20MB — bigger media (or a hiccup)
  // still gets delivered as a direct link.
  if (!first) {
    const big = video || audio || image;
    await tg("sendMessage", {
      chat_id: chatId, parse_mode: "HTML", disable_web_page_preview: true,
      reply_to_message_id: msg.message_id,
      text: `✅ <b>${(info.title || "Media").slice(0, 120)}</b>\n\nФайл крупный для Telegram — скачайте по кнопке.\nFayl Telegram uchun katta — tugma orqali yuklab oling.`,
      reply_markup: {
        inline_keyboard: [
          ...(big ? [[{ text: `⬇️ ${big.label}`, url: proxy(big.token) }]] : []),
          [{ text: "🌐 qrixtools.com — 185+ tools", url: `${SITE_URL}/downloader?utm_source=telegram&utm_medium=bot` }],
        ],
      },
    });
  }

  return NextResponse.json({ ok: true });
}

/** Deliver one format into the chat when its button is tapped. */
async function handleCallback(cq: any): Promise<void> {
  const chatId = cq?.message?.chat?.id;
  const want = String(cq?.data || "").replace(/^f:/, "");   // v | a | i
  // the link lives in the user message our media message replied to
  const src: string = cq?.message?.reply_to_message?.text || cq?.message?.reply_to_message?.caption || "";
  const url = src.match(/https?:\/\/\S+/)?.[0];

  if (!chatId || !url) {
    await tg("answerCallbackQuery", { callback_query_id: cq?.id, text: "Отправьте ссылку заново / Havolani qayta tashlang", show_alert: false });
    return;
  }
  await tg("answerCallbackQuery", { callback_query_id: cq.id, text: "⏳ Готовлю файл… / Fayl tayyorlanmoqda…" });

  const type = want === "a" ? "audio" : want === "i" ? "image" : "video";
  await tg("sendChatAction", { chat_id: chatId, action: type === "audio" ? "upload_voice" : "upload_video" });

  const info = await resolveMedia(url);
  if (!info.ok) return;
  const f = info.formats.find((x) => x.type === type);
  if (!f) {
    await tg("sendMessage", { chat_id: chatId, text: "😕 Этот формат недоступен для ссылки. / Bu format mavjud emas." });
    return;
  }

  const title = (info.title || "QRix").slice(0, 120);
  const method = type === "audio" ? "sendAudio" : type === "image" ? "sendPhoto" : "sendVideo";
  const key = type === "audio" ? "audio" : type === "image" ? "photo" : "video";
  const sent = await tg(method, {
    chat_id: chatId, [key]: proxy(f.token),
    caption: `${title}\n\n@ QRix — qrixtools.com`,
    ...(type === "audio" ? { title, performer: info.author || "QRix" } : {}),
  });

  if (!sent) {
    await tg("sendMessage", {
      chat_id: chatId, parse_mode: "HTML", disable_web_page_preview: true,
      text: "Файл крупный для Telegram — скачайте по кнопке.\nFayl Telegram uchun katta — tugma orqali yuklab oling.",
      reply_markup: { inline_keyboard: [[{ text: `⬇️ ${f.label}`, url: proxy(f.token) }]] },
    });
  }
}
