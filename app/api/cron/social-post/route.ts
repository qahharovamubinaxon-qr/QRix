import { NextRequest, NextResponse } from "next/server";
import { cronAuthorized } from "@/lib/server/cron-auth";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";
export const maxDuration = 30;

/* Daily Telegram-channel autoposter (growth engine, env-gated).
   Needs: TELEGRAM_BOT_TOKEN (already used by the admin bot) and
   TELEGRAM_CHANNEL_ID (e.g. "@qrixtools" — the bot must be a channel admin).
   Without them the route no-ops with an honest reason. Picks a tool of the
   day from a curated rotation and posts a trilingual card with a UTM link. */

type Promo = { title: string; href: string; en: string; ru: string; uz: string; tags: string };

const PROMOS: Promo[] = [
  { title: "📥 TikTok Downloader — No Watermark", href: "/downloader/tiktok",
    en: "Save any TikTok in HD without the watermark, or keep just the sound as MP3.",
    ru: "Скачивайте TikTok в HD без водяного знака — или только звук в MP3.",
    uz: "TikTok videoni HD sifatda watermark'siz yuklab oling — yoki faqat ovozini MP3 qilib.",
    tags: "#tiktok #downloader" },
  { title: "🎨 AI QR Code Art", href: "/qr-art",
    en: "Turn a boring QR code into art — AI blends your design into a scannable image.",
    ru: "Превратите QR-код в арт — ИИ вплетает дизайн прямо в рабочий код.",
    uz: "QR kodni san'at asariga aylantiring — AI dizaynni skanerlanadigan rasmga singdiradi.",
    tags: "#qrcode #ai" },
  { title: "🖼 Image → 3D Model", href: "/3d-tools/image-to-3d",
    en: "One photo → a textured 3D model. Export GLB, OBJ, STL — free, in the browser.",
    ru: "Одно фото → 3D-модель. Экспорт GLB, OBJ, STL — бесплатно, в браузере.",
    uz: "Bitta rasm → 3D model. GLB, OBJ, STL eksport — bepul, brauzerda.",
    tags: "#3d #ai" },
  { title: "📄 PDF → Word (1:1)", href: "/pdf-tools/pdf-to-word",
    en: "Convert PDF to an editable Word file with tables and layout kept 1:1.",
    ru: "PDF в редактируемый Word — таблицы и вёрстка сохраняются 1:1.",
    uz: "PDF'ni tahrirlanadigan Word'ga aylantiring — jadvallar va dizayn 1:1 saqlanadi.",
    tags: "#pdf #word" },
  { title: "🎵 Instagram Reels → MP3", href: "/downloader/instagram",
    en: "Save Reels in HD or extract the trending sound as an MP3.",
    ru: "Скачивайте Reels в HD или вытащите трендовый звук в MP3.",
    uz: "Reels'ni HD yuklab oling yoki trend ovozini MP3 qilib ajratib oling.",
    tags: "#instagram #reels" },
  { title: "🪄 AI Background Remover", href: "/image-tools/remove-bg",
    en: "Erase any photo background in one click — free, full resolution.",
    ru: "Удалите фон с фото в один клик — бесплатно, в полном разрешении.",
    uz: "Rasm fonini bir klikda o'chiring — bepul, to'liq sifatda.",
    tags: "#ai #design" },
  { title: "🔗 Link-in-Bio Page", href: "/link-in-bio",
    en: "One beautiful page for all your links — with a QR code to match.",
    ru: "Одна красивая страница для всех ваших ссылок — плюс QR-код к ней.",
    uz: "Barcha havolalaringiz uchun bitta chiroyli sahifa — QR kodi bilan.",
    tags: "#linkinbio #smm" },
  { title: "🧾 Bulk QR from CSV", href: "/bulk-qr",
    en: "Generate hundreds of QR codes from a spreadsheet at once.",
    ru: "Сотни QR-кодов из таблицы за один раз.",
    uz: "Jadvaldan bir vaqtning o'zida yuzlab QR kod yarating.",
    tags: "#qrcode #business" },
  { title: "🎬 Video Tools — 29 free tools", href: "/video-tools",
    en: "Trim, compress, GIF, extract audio — all in the browser, nothing installed.",
    ru: "Обрезка, сжатие, GIF, извлечение звука — всё в браузере.",
    uz: "Kesish, siqish, GIF, ovoz ajratish — hammasi brauzerda.",
    tags: "#video #tools" },
  { title: "🖋 AI Avatar Generator", href: "/ai-tools/avatar-generator",
    en: "Selfie → stylish profile picture. Cartoon, anime, cyberpunk — free.",
    ru: "Селфи → стильная аватарка. Мультяшный, аниме, киберпанк — бесплатно.",
    uz: "Selfi → zamonaviy avatar. Multfilm, anime, cyberpunk — bepul.",
    tags: "#ai #avatar" },
  { title: "🛡 QR Safety Checker", href: "/qr-tools/decode",
    en: "Paste or scan any QR to see where it REALLY leads before you open it.",
    ru: "Проверьте, куда НА САМОМ ДЕЛЕ ведёт QR-код, прежде чем открыть.",
    uz: "QR kod ASLIDA qayerga olib borishini ochishdan oldin tekshiring.",
    tags: "#security #qrcode" },
  { title: "📸 Pinterest Video Downloader", href: "/downloader/pinterest",
    en: "Save video pins as MP4 and images in full resolution.",
    ru: "Скачивайте видео-пины в MP4 и картинки в полном разрешении.",
    uz: "Video pinlarni MP4, rasmlarni to'liq sifatda yuklab oling.",
    tags: "#pinterest #downloader" },
  { title: "✍️ OCR — Image to Text", href: "/image-tools/image-to-text",
    en: "Pull editable text out of any photo or scan — English, Russian, Uzbek.",
    ru: "Извлеките текст из фото или скана — русский, узбекский, английский.",
    uz: "Rasm yoki skandan matnni ajratib oling — o'zbek, rus, ingliz.",
    tags: "#ocr #productivity" },
  { title: "🔊 SoundCloud → MP3", href: "/downloader/soundcloud",
    en: "Save any public SoundCloud track as an MP3 with cover-art preview.",
    ru: "Скачивайте публичные треки SoundCloud в MP3.",
    uz: "SoundCloud treklarini MP3 qilib yuklab oling.",
    tags: "#soundcloud #music" },
];

export async function GET(req: NextRequest) {
  const token = process.env.TELEGRAM_PUBLIC_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const channel = process.env.TELEGRAM_CHANNEL_ID;

  // Unauthenticated readiness probe — booleans only, never the values.
  if (req.nextUrl.searchParams.get("status") === "1") {
    return NextResponse.json({ ok: true, bot: !!token, channel: !!channel, tools: PROMOS.length });
  }
  if (!cronAuthorized(req)) return NextResponse.json({ ok: false }, { status: 401 });
  if (!token || !channel) {
    return NextResponse.json({ ok: false, reason: "channel_not_configured" });
  }

  // tool of the day — stable rotation, no repeats until the list wraps
  const day = Math.floor(Date.now() / 86_400_000);
  const p = PROMOS[day % PROMOS.length];
  const url = `${SITE_URL}${p.href}?utm_source=telegram&utm_medium=channel&utm_campaign=daily`;

  const text =
    `<b>${p.title}</b>\n\n` +
    `${p.en}\n` +
    `🇷🇺 ${p.ru}\n` +
    `🇺🇿 ${p.uz}\n\n` +
    `👉 <a href="${url}">qrixtools.com${p.href}</a>\n\n` +
    `${p.tags} #qrix`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: channel, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(15_000),
    });
    const j = await r.json();
    return NextResponse.json({ ok: !!j.ok, tool: p.href, ...(j.ok ? {} : { reason: j.description }) });
  } catch (e) {
    return NextResponse.json({ ok: false, reason: (e as Error).message }, { status: 502 });
  }
}
