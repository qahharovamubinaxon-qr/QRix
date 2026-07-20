import Link from "next/link";
import DownloaderClient from "@/components/DownloaderClient";
import { PLATFORMS } from "@/lib/downloader-platforms";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";

const TITLE = "Скачать видео онлайн — TikTok, Instagram, ВК и ещё 14 платформ";
const DESC = "Бесплатный онлайн-загрузчик видео, музыки и фото. Вставьте ссылку из TikTok, Instagram, ВК, Одноклассников, X — сохраните MP4, MP3 или картинку без рекламы и водяных знаков.";

const FAQS = [
  { q: "Как скачать видео?", a: "Скопируйте ссылку на пост, вставьте её в поле выше и выберите формат — видео (MP4), аудио (MP3) или изображение. Загрузка начнётся сразу, без рекламы и всплывающих окон." },
  { q: "Это бесплатно?", a: "Да — полностью бесплатно, без регистрации, водяных знаков и установки программ." },
  { q: "Какие сайты поддерживаются?", a: `QRix скачивает с: ${PLATFORMS.map((p) => p.name).join(", ")}. Список постоянно растёт.` },
  { q: "Можно ли скачать только звук (MP3)?", a: "Да. Если у ролика есть аудиодорожка, появится кнопка «Audio · MP3» — удобно для звуков из TikTok и Reels." },
  { q: "Храните ли вы мои файлы?", a: "Нет. Файл передаётся напрямую на ваше устройство — QRix ничего не хранит. Скачивайте только контент, на который у вас есть права." },
  { q: "Почему нет YouTube?", a: "QRix ориентирован на социальные платформы и не поддерживает скачивание с YouTube в соответствии с правилами платформ." },
];

export const metadata = pageMeta({
  title: TITLE,
  description: DESC,
  path: "/ru/downloader",
  keywords: ["скачать видео онлайн", "скачать видео тикток", "скачать рилс", "скачать видео вк", "скачать с одноклассников", "загрузчик видео бесплатно", "видео в mp3"],
  languages: { en: "/downloader", ru: "/ru/downloader", uz: "/uz/downloader", "x-default": "/downloader" },
});

export default function RuDownloaderPage() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(TITLE, DESC, "/ru/downloader"),
          breadcrumbLd([{ name: "Главная", path: "/" }, { name: "Загрузчик", path: "/ru/downloader" }]),
          faqLd(FAQS),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Главная</Link> <span className="mx-1">›</span> Загрузчик
        </nav>

        <header className="mb-6">
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
            Скачать видео, музыку и фото онлайн
          </h1>
          <p className="mt-2 text-[14.5px]" style={{ color: "var(--text-muted)" }}>{DESC}</p>
        </header>

        <DownloaderClient placeholder="Вставьте ссылку TikTok, Instagram, ВК, X…" />

        <section className="mt-12">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Как это работает</h2>
          <ol className="space-y-3">
            {[
              ["Скопируйте ссылку", "Откройте пост в TikTok, Instagram, ВК или X и скопируйте ссылку через «Поделиться»."],
              ["Вставьте её выше", "QRix мгновенно найдёт видео, аудио и изображения по ссылке."],
              ["Выберите формат", "Видео (MP4), аудио (MP3) или картинка — файл сохранится прямо на устройство."],
            ].map(([h, p], i) => (
              <li key={h} className="flex gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
                <div><b style={{ color: "var(--text)" }}>{h}.</b> <span style={{ color: "var(--text-muted)" }}>{p}</span></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Платформы</h2>
          <div className="flex flex-wrap gap-2.5">
            {PLATFORMS.map((p) => (
              <Link key={p.id} href={`/ru/downloader/${p.id}`}
                className="inline-flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full text-[12.5px] font-semibold transition-colors hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span className="w-5 h-5 block" aria-hidden dangerouslySetInnerHTML={{ __html: p.svg }} /> {p.name}
              </Link>
            ))}
          </div>
          <p className="mt-3 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
            Выберите платформу — на её странице подробная инструкция: TikTok без водяного знака, Reddit со звуком, SoundCloud в MP3 и другое.
          </p>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Вопросы и ответы</h2>
          <div className="space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
