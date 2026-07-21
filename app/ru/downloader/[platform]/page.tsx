import { notFound } from "next/navigation";
import Link from "next/link";
import DownloaderClient from "@/components/DownloaderClient";
import { PLATFORMS } from "@/lib/downloader-platforms";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";

/* Русские SEO-страницы загрузчика: /ru/downloader/tiktok … — РУ-рынок ищет
   «скачать … без водяного знака» с огромным объёмом и слабой конкуренцией.
   hreflang связывает каждую страницу с её английской парой. */

type RuCopy = {
  title: string; h1: string; desc: string; intro: string;
  keywords: string[];
  features?: [string, string][];
  faqs?: { q: string; a: string }[];
};

/* Индивидуальные тексты для главных платформ; остальные собираются из шаблона. */
const RU: Record<string, Partial<RuCopy>> = {
  tiktok: {
    title: "Скачать видео из TikTok без водяного знака — бесплатно в HD",
    h1: "Скачать видео TikTok без водяного знака",
    desc: "Скачивайте видео из TikTok без водяного знака в HD или сохраняйте звук в MP3. Бесплатно, без приложений и регистрации.",
    intro: "Вставьте ссылку на любое публичное видео TikTok — и сохраните его в HD без логотипа, либо заберите только звук в MP3. Работает с короткими ссылками vt.tiktok.com, на телефоне и компьютере.",
    keywords: ["скачать видео тикток", "тикток без водяного знака", "tiktok скачать", "скачать звук из тиктока", "тикток в mp3"],
    features: [
      ["Без водяного знака", "HD-версия сохраняется без плавающего логотипа TikTok."],
      ["Звук в MP3", "Оригинальный звук ролика можно сохранить отдельным MP3-файлом."],
      ["HD и SD", "Полное качество или компактный файл — на выбор."],
      ["Без приложений", "Всё работает в браузере на iPhone, Android и ПК."],
    ],
    faqs: [
      { q: "Как скачать TikTok без водяного знака?", a: "Скопируйте ссылку через «Поделиться» в TikTok, вставьте её выше и выберите «Video · HD (no watermark)» — файл сохранится чистым MP4." },
      { q: "Можно ли сохранить только звук?", a: "Да — на вкладке Audio сохраните оригинальный звук в MP3. Удобно для трендовых звуков." },
      { q: "Работают ли короткие ссылки vt.tiktok.com?", a: "Да, короткие ссылки распознаются автоматически." },
      { q: "Скачиваются ли приватные видео?", a: "Нет, только публичные ролики — закрытые аккаунты остаются закрытыми." },
    ],
  },
  instagram: {
    title: "Скачать видео и Reels из Instagram — MP4, MP3, фото",
    h1: "Скачать Reels и видео из Instagram",
    desc: "Скачивайте Reels, видео и фото из Instagram в HD или вытаскивайте звук в MP3. Бесплатный онлайн-загрузчик без логина.",
    intro: "Вставьте ссылку на публичный Reel, видео или фото — QRix сохранит его в исходном качестве, а звук ролика можно забрать отдельным MP3.",
    keywords: ["скачать рилс инстаграм", "скачать видео из инстаграм", "инстаграм фото скачать", "reels в mp3", "инста загрузчик"],
    faqs: [
      { q: "Как скачать Reels?", a: "Откройте Reel → Поделиться → Скопировать ссылку, вставьте её выше и выберите Video · HD." },
      { q: "Можно ли скачать фото?", a: "Да — фото-посты и карусели сохраняются в полном размере." },
      { q: "Нужно ли входить в аккаунт?", a: "Нет. QRix читает только публичные посты — логин не нужен." },
      { q: "Работают ли Stories?", a: "Нет, только публичные посты и Reels." },
    ],
  },
  vk: {
    title: "Скачать видео и клипы ВКонтакте (VK) — бесплатно MP4",
    h1: "Скачать видео из ВК",
    desc: "Скачивайте видео и клипы ВКонтакте как MP4 — поддерживаются vk.com и vkvideo.ru. Бесплатно, без логина.",
    intro: "Сохраняйте публичные видео и клипы ВК в MP4. Поддерживаются обе ссылки — vk.com и vkvideo.ru; просто вставьте адрес ролика.",
    keywords: ["скачать видео вк", "скачать клип вк", "vk video скачать", "vkvideo.ru скачать", "загрузчик вк"],
    faqs: [
      { q: "Как скачать видео из ВК?", a: "Скопируйте ссылку на видео (vk.com или vkvideo.ru), вставьте выше и выберите Video · HD." },
      { q: "Поддерживаются ли Клипы?", a: "Да — ссылки на клипы скачиваются так же, как обычные видео." },
      { q: "Почему ссылка иногда не читается?", a: "Часть видео ВК доступна только авторизованным пользователям или ограничена по региону — такие ролики прочитать нельзя." },
      { q: "Какое качество я получу?", a: "Лучшее из доступных, вплоть до 1080p." },
    ],
  },
  ok: {
    title: "Скачать видео с Одноклассников (OK.ru) — бесплатно в HD",
    h1: "Скачать видео с Одноклассников",
    desc: "Скачивайте видео с OK.ru в MP4 до 1080p — бесплатный онлайн-загрузчик Одноклассников, без регистрации.",
    intro: "Вставьте ссылку ok.ru/video/… — и сохраните ролик в лучшем качестве с живым прогрессом загрузки. Звук можно извлечь в MP3 прямо в браузере.",
    keywords: ["скачать видео с одноклассников", "ok.ru скачать видео", "одноклассники загрузчик", "ок ру видео скачать"],
    faqs: [
      { q: "Как скачать видео с OK.ru?", a: "Скопируйте ссылку вида ok.ru/video/…, вставьте её выше и нажмите Save на строке Video · HD." },
      { q: "Какое качество?", a: "Лучшее, что отдаёт сама платформа — обычно 720p или 1080p." },
      { q: "Можно ли получить только звук?", a: "Да — QRix извлечёт аудиодорожку в MP3 прямо в вашем браузере." },
      { q: "Скачиваются ли закрытые видео?", a: "Нет, только публичные ролики." },
    ],
  },
  twitter: {
    title: "Скачать видео из X (Twitter) — MP4 в HD",
    h1: "Скачать видео из X / Twitter",
    desc: "Скачивайте видео и GIF из X (Twitter) в MP4. Бесплатно, поддерживаются короткие ссылки t.co.",
    intro: "Вставьте ссылку на пост — видео или GIF сохранится в MP4 в лучшем качестве. Короткие ссылки t.co распознаются автоматически.",
    keywords: ["скачать видео твиттер", "скачать видео из x", "twitter video скачать", "твиттер гиф скачать"],
  },
  pinterest: {
    title: "Скачать видео и картинки с Pinterest — бесплатно",
    h1: "Скачать с Pinterest",
    desc: "Скачивайте видео-пины в MP4 и изображения в полном разрешении. Поддерживаются короткие ссылки pin.it.",
    intro: "Любой публичный пин: видео сохранится как MP4, картинка — в оригинальном разрешении. Короткие ссылки pin.it работают автоматически.",
    keywords: ["скачать с пинтереста", "pinterest видео скачать", "пинтерест картинки скачать", "pin.it скачать"],
  },
  reddit: {
    title: "Скачать видео с Reddit со звуком — MP4",
    h1: "Скачать видео с Reddit",
    desc: "Скачивайте видео с Reddit со звуком в MP4 — v.redd.it и share-ссылки поддерживаются.",
    intro: "Reddit хранит видео и звук отдельно — поэтому простые сохранялки отдают немые ролики. QRix склеивает дорожки, и ваш MP4 будет со звуком.",
    keywords: ["скачать видео с реддита", "reddit video скачать", "v.redd.it скачать", "реддит видео со звуком"],
  },
  soundcloud: {
    title: "Скачать музыку с SoundCloud в MP3 — бесплатно",
    h1: "SoundCloud в MP3",
    desc: "Скачивайте публичные треки SoundCloud в MP3 с обложкой и названием. Бесплатно и без регистрации.",
    intro: "Вставьте ссылку на трек — увидите обложку и исполнителя, нажмите Save и получите MP3 для офлайн-прослушивания.",
    keywords: ["soundcloud скачать mp3", "скачать музыку саундклауд", "soundcloud downloader", "саундклауд в мп3"],
  },
};

const nameRu: Record<string, string> = {
  facebook: "Facebook", snapchat: "Snapchat", vimeo: "Vimeo", twitch: "Twitch",
  dailymotion: "Dailymotion", threads: "Threads", tumblr: "Tumblr", bilibili: "Bilibili",
};

function copyFor(id: string, name: string): RuCopy {
  const o = RU[id] || {};
  const n = o.h1 ? name : nameRu[id] || name;
  return {
    title: o.title || `Скачать видео с ${n} — бесплатно в MP4`,
    h1: o.h1 || `Скачать видео с ${n}`,
    desc: o.desc || `Скачивайте видео с ${n} в MP4 бесплатно — онлайн-загрузчик без регистрации, рекламы и водяных знаков.`,
    intro: o.intro || `Вставьте ссылку на публичный пост ${n} — QRix найдёт видео, аудио и изображения и сохранит их в исходном качестве прямо из браузера.`,
    keywords: o.keywords || [`скачать видео ${n.toLowerCase()}`, `${n.toLowerCase()} скачать`, `${n.toLowerCase()} загрузчик`, "скачать видео бесплатно"],
    features: o.features || [
      ["MP4 в лучшем качестве", `Видео сохраняется в максимальном качестве, которое отдаёт ${n}.`],
      ["Звук в MP3", "Аудиодорожку можно сохранить отдельно, когда она доступна."],
      ["Без регистрации", "Никаких аккаунтов, рекламы и водяных знаков."],
      ["Телефон и ПК", "Работает в любом браузере — ничего не нужно устанавливать."],
    ],
    faqs: o.faqs || [
      { q: `Как скачать видео с ${n}?`, a: "Скопируйте ссылку на пост через «Поделиться», вставьте её в поле выше и выберите формат — MP4, MP3 или изображение." },
      { q: "Это бесплатно?", a: "Да — полностью бесплатно, без регистрации и водяных знаков." },
      { q: "Скачивается ли приватный контент?", a: "Нет. Работают только публичные посты — закрытые остаются закрытыми." },
      { q: "Хранит ли QRix мои файлы?", a: "Нет. Файл передаётся напрямую на ваше устройство, QRix ничего не хранит." },
    ],
  };
}

export function generateStaticParams() {
  return PLATFORMS.map((p) => ({ platform: p.id }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = PLATFORMS.find((x) => x.id === platform);
  if (!p) return {};
  const c = copyFor(p.id, p.name);
  return pageMeta({
    title: c.title, description: c.desc, path: `/ru/downloader/${platform}`, keywords: c.keywords,
    languages: { en: `/downloader/${platform}`, ru: `/ru/downloader/${platform}`, uz: `/uz/downloader/${platform}`, "x-default": `/downloader/${platform}` },
  });
}

export default async function RuPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = PLATFORMS.find((x) => x.id === platform);
  if (!p) notFound();
  const c = copyFor(p.id, p.name);
  const others = PLATFORMS.filter((x) => x.id !== platform);
  const steps: [string, string][] = [
    ["Скопируйте ссылку", `Откройте пост в ${p.name} и нажмите «Поделиться» → «Скопировать ссылку».`],
    ["Вставьте её в QRix", "Загрузчик мгновенно найдёт все доступные версии файла."],
    ["Выберите формат", "Видео (MP4), аудио (MP3) или изображение — файл сохранится с живым прогрессом."],
  ];

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(c.title, c.desc, `/ru/downloader/${platform}`),
          breadcrumbLd([{ name: "Главная", path: "/" }, { name: "Загрузчик", path: "/ru/downloader" }, { name: p.name, path: `/ru/downloader/${platform}` }]),
          faqLd(c.faqs!),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Главная</Link> <span className="mx-1">›</span>
          <Link href="/ru/downloader" className="hover:underline">Загрузчик</Link> <span className="mx-1">›</span> {p.name}
        </nav>

        <header className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 block shrink-0" aria-hidden dangerouslySetInnerHTML={{ __html: p.svg }} />
            <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>{c.h1}</h1>
          </div>
          <p className="text-[14.5px]" style={{ color: "var(--text-muted)" }}>{c.intro}</p>
        </header>

        <DownloaderClient placeholder={`Вставьте ссылку ${p.name}…`} />

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Как скачать с {p.name}</h2>
          <ol className="space-y-3">
            {steps.map(([h, body], i) => (
              <li key={h} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                <div><b style={{ color: "var(--text)" }}>{h}.</b> <span style={{ color: "var(--text-muted)" }}>{body}</span></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Почему QRix</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {c.features!.map(([h, body]) => (
              <div key={h} className="qx-card p-4">
                <h3 className="font-bold text-[14px] mb-1" style={{ color: "var(--text)" }}>{h}</h3>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Вопросы и ответы</h2>
          <div className="space-y-3">
            {c.faqs!.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Другие платформы</h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map((o) => (
              <Link key={o.id} href={`/ru/downloader/${o.id}`}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span className="w-5 h-5 block" aria-hidden dangerouslySetInnerHTML={{ __html: o.svg }} /> {o.name}
              </Link>
            ))}
            <Link href={`/downloader/${platform}`} className="inline-flex items-center px-3 py-1.5 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              English version →
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
