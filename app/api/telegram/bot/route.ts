import { NextRequest, NextResponse } from "next/server";
import { resolveMedia } from "@/lib/server/media-download";
import { detectPlatform } from "@/lib/downloader-platforms";
import { rateLimit } from "@/lib/server/security";
import { cronAuthorized } from "@/lib/server/cron-auth";
import { SITE_URL } from "@/lib/seo";

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
  const me = await tg("getMe", {});
  botUsername = me?.result?.username;
  return botUsername;
}

export async function GET(req: NextRequest) {
  // owner-only webhook self-registration: /api/telegram/bot?setup=1
  if (req.nextUrl.searchParams.get("setup") === "1") {
    if (!cronAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
    if (!token()) return NextResponse.json({ ok: false, reason: "TELEGRAM_PUBLIC_BOT_TOKEN missing" });
    const res = await tg("setWebhook", {
      url: `${SITE_URL}/api/telegram/bot`,
      secret_token: secret() || undefined,
      allowed_updates: ["message"],
    });
    return NextResponse.json({ ok: !!res?.ok, telegram: res });
  }
  return NextResponse.json({ ok: true, bot: !!token() });
}

export async function POST(req: NextRequest) {
  if (!token()) return NextResponse.json({ ok: true }); // not configured — swallow
  if (secret() && req.headers.get("x-telegram-bot-api-secret-token") !== secret()) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const update = await req.json().catch(() => null);
  const msg = update?.message;
  const chatId = msg?.chat?.id;
  const text: string = msg?.text || "";
  if (!chatId) return NextResponse.json({ ok: true });

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

  const proxy = (t: string) => `${SITE_URL}/api/download/file?t=${encodeURIComponent(t)}`;
  const video = info.formats.find((f) => f.type === "video");
  const audio = info.formats.find((f) => f.type === "audio");
  const image = info.formats.find((f) => f.type === "image");

  // format buttons — Telegram URL buttons need no callbacks and never expire mid-chat
  const buttons = [
    ...(video ? [[{ text: `🎬 ${video.label}`, url: proxy(video.token) }]] : []),
    ...(audio ? [[{ text: `🎵 ${audio.label}`, url: proxy(audio.token) }]] : []),
    ...(image ? [[{ text: `🖼 ${image.label}`, url: proxy(image.token) }]] : []),
    [{ text: "🌐 qrixtools.com — 185+ tools", url: `${SITE_URL}/downloader?utm_source=telegram&utm_medium=bot` }],
  ];
  const caption = `${(info.title || "").slice(0, 200)}\n\n@ QRix — qrixtools.com`;

  // try to drop the video straight into the chat (Telegram fetches URLs ≤20MB);
  // bigger files fall back to the button links, which always work
  let delivered = false;
  if (video) {
    const sent = await tg("sendVideo", {
      chat_id: chatId, video: proxy(video.token), caption,
      reply_markup: { inline_keyboard: buttons },
    });
    delivered = !!sent?.ok;
  } else if (image) {
    const sent = await tg("sendPhoto", {
      chat_id: chatId, photo: proxy(image.token), caption,
      reply_markup: { inline_keyboard: buttons },
    });
    delivered = !!sent?.ok;
  } else if (audio) {
    const sent = await tg("sendAudio", {
      chat_id: chatId, audio: proxy(audio.token), caption,
      reply_markup: { inline_keyboard: buttons },
    });
    delivered = !!sent?.ok;
  }

  if (!delivered) {
    await tg("sendMessage", {
      chat_id: chatId, parse_mode: "HTML", disable_web_page_preview: true,
      text: `✅ <b>${(info.title || "Media").slice(0, 120)}</b>\n\nФайл крупный — скачайте по кнопке ниже.\nFayl katta — quyidagi tugma orqali yuklab oling.`,
      reply_markup: { inline_keyboard: buttons },
    });
  }

  return NextResponse.json({ ok: true });
}
