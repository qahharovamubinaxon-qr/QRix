"use client";

import { useEffect, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { jsonLd, faqLd } from "@/lib/seo";
import { type Lang } from "@/lib/lang";
import { loadHomeUi, type HomeUi } from "@/lib/home-i18n";

const FAQS_BASE: Partial<Record<Lang, { q: string; a: string }[]>> = {
  en: [
    { q: "Is QRix really free?", a: "Yes — all 185+ tools are free with no watermark and no signup. Pro adds unlimited dynamic QR codes, deeper analytics and an ad-free experience." },
    { q: "Are my files uploaded to a server?", a: "Mostly no. PDF, image and QR tools run entirely in your browser. The few that need a server — PDF compress and the best-quality PDF-to-Word mode — say so right on their page." },
    { q: "Do my QR codes expire?", a: "Static QR codes never expire. Dynamic QR codes stay active while your link exists, and you can edit their destination anytime." },
    { q: "Can I add my logo and brand colors to a QR code?", a: "Yes — the Design Studio supports logos, custom colors, dot shapes and 'Scan me' frames while keeping the code scannable." },
    { q: "Does QRix work on mobile?", a: "Yes — every tool is responsive and works in any modern mobile browser. You can also install QRix as an app from your browser menu." },
    { q: "What formats can I download?", a: "QR codes export as PNG or SVG; PDFs, images and barcodes export in their native high-quality formats." },
    { q: "Can I track who scans my QR code?", a: "With a dynamic QR code you get real-time scan analytics — totals, time, approximate location and devices — in your dashboard." },
    { q: "How is QRix different from other QR generators?", a: "It's a full toolbox: 30+ QR types, barcode studio, link-in-bio pages, poster maker, plus complete PDF and image toolkits — private, fast and free." },
  ],
  ru: [
    { q: "QRix действительно бесплатный?", a: "Да — все 185+ инструментов бесплатны, без водяных знаков и регистрации. Pro добавляет безлимитные динамические QR и расширенную аналитику." },
    { q: "Мои файлы загружаются на сервер?", a: "В основном нет. PDF, изображения и QR обрабатываются прямо в браузере. Немногие инструменты, которым нужен сервер — сжатие PDF и облачный режим PDF в Word — честно сообщают об этом на своей странице." },
    { q: "Истекают ли QR коды?", a: "Статические QR не истекают никогда. Динамические работают, пока активна ссылка, и их назначение можно менять." },
    { q: "Можно добавить логотип и цвета бренда?", a: "Да — студия дизайна поддерживает логотипы, цвета, формы точек и рамки «Scan me»." },
    { q: "Работает ли QRix на телефоне?", a: "Да — все инструменты адаптивны и работают в любом современном мобильном браузере." },
    { q: "В каких форматах скачивать?", a: "QR — PNG или SVG; PDF, изображения и штрих-коды — в родных форматах высокого качества." },
    { q: "Можно отслеживать сканирования?", a: "С динамическим QR вы получаете аналитику в реальном времени: количество, время, география и устройства." },
    { q: "Чем QRix отличается от других?", a: "Это полный набор: 30+ типов QR, штрих-коды, link-in-bio, постеры, плюс PDF и графические инструменты — приватно и бесплатно." },
  ],
  uz: [
    { q: "QRix ҳақиқатан бепулми?", a: "Ҳа — барча 185+ асбоб бепул, ватермарксиз ва рўйхатсиз. Pro чексиз динамик QR ва чуқур аналитика беради." },
    { q: "Файлларим серверга юкланадими?", a: "Асосан йўқ. PDF, расм ва QR асбоблари тўлиқ браузерингизда ишлайди. Сервер керак бўлган озчилиги — PDF сиқиш ва сифатли PDF-дан-Word режими — буни ўз саҳифасида очиқ айтади." },
    { q: "QR кодлар муддати тугайдими?", a: "Статик QR ҳеч қачон тугамайди. Динамик QR ҳаволангиз актив бўлса ишлайверади ва манзилини ўзгартириш мумкин." },
    { q: "Логотип ва бренд рангларини қўшсам бўладими?", a: "Ҳа — Дизайн студияси логотип, ранглар, нуқта шакллари ва «Scan me» рамкаларини қўллайди." },
    { q: "QRix телефонда ишлайдими?", a: "Ҳа — барча асбоблар мослашувчан ва ҳар қандай замонавий мобил браузерда ишлайди." },
    { q: "Қайси форматларда юклаб оламан?", a: "QR — PNG ёки SVG; PDF, расм ва штрих-кодлар — юқори сифатли асл форматларда." },
    { q: "Сканларни кузата оламанми?", a: "Динамик QR билан реал вақт аналитикаси: сонлар, вақт, тахминий жойлашув ва қурилмалар — дашбордингизда." },
    { q: "QRix бошқалардан нимаси билан фарқ қилади?", a: "Тўлиқ тўплам: 30+ QR тури, штрих-код студияси, link-in-bio, постер, PDF ва расм асбоблари — махфий, тез ва бепул." },
  ],
};
/* The twelve generated languages are NOT merged in here any more. This
 * component used to import TWO whole twelve-language registries — 85.8 KB of
 * copy — so that one visitor could read one language of each. Both now arrive
 * together as a single per-language chunk (M160). */

const TITLES_BASE: Record<"en" | "ru" | "uz", { t: string; s: string }> = {
  en: { t: "Frequently asked questions", s: "Everything you might want to know before you start." },
  ru: { t: "Частые вопросы", s: "Всё, что стоит знать перед началом." },
  uz: { t: "Кўп бериладиган саволлар", s: "Бошлашдан олдин билишингиз керак бўлган ҳаммаси." },
};
type BaseLang = "en" | "ru" | "uz";
const isBaseLang = (l: string): l is BaseLang => l === "en" || l === "ru" || l === "uz";

export default function HomeFaq({ lang }: { lang: Lang }) {
  const [open, setOpen] = useState<number>(0);
  /* This language's Q&A and headings, once the chunk lands; null for the three
   * authored languages, which never fetch. English shows until then — and if
   * the chunk fails, English is what stays. */
  const [extra, setExtra] = useState<HomeUi | null>(null);

  useEffect(() => {
    if (isBaseLang(lang)) { setExtra(null); return; }
    let alive = true;
    loadHomeUi(lang)
      .then((ui) => { if (alive && ui) setExtra(ui); })
      .catch(() => {});
    return () => { alive = false; };
  }, [lang]);

  const faqs = (isBaseLang(lang) ? FAQS_BASE[lang] : extra?.faq) || FAQS_BASE.en!;
  const tt = (isBaseLang(lang) ? TITLES_BASE[lang] : extra?.homeFaq) || TITLES_BASE.en;

  return (
    <section className="max-w-3xl mx-auto px-5 pb-16 lg:pb-20" aria-label={tt.t}>
      {/* FAQ rich results — always emit the English set for search engines */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd(faqLd(FAQS_BASE.en!))}
      />
      <div className="text-center mb-10" data-reveal>
        <h2 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>{tt.t}</h2>
        <p className="mt-3 text-sm" style={{ color: "var(--text-muted)" }}>{tt.s}</p>
      </div>
      <div className="qx-card px-6 py-2" data-reveal="scale">
        {faqs.map((f, i) => (
          <div key={i} className="qx-faq-item" data-open={open === i} style={i === faqs.length - 1 ? { borderBottom: "none" } : undefined}>
            <button className="qx-faq-q" onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>
              {f.q}
              <FiPlus size={16} />
            </button>
            <div className="qx-faq-a" aria-hidden={open !== i}>
              <div><p>{f.a}</p></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
