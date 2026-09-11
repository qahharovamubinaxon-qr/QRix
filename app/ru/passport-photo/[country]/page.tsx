import Link from "next/link";
import { notFound } from "next/navigation";
import AdsterraSlot from "@/components/AdsterraSlot";
import { PassportClient } from "@/components/image/ImageSpecialClients";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";
import { getPassportRu, PASSPORT_RU_SLUGS } from "@/lib/passport-sizes-i18n";

/* /ru/passport-photo/<country> — the Russian-language twin of
   /passport-photo/<country>, built only for countries with real Russian
   demand (see lib/passport-sizes-i18n.ts for why). Yandex's own query list
   made "сделать фото 413x531" this site's #1 clicked query while the only
   page answering it was in English.

   A SERVER component on purpose: a "use client" route inherits the homepage
   title and canonical and cannot rank (see the client-page-canonical trap).
   It does not wrap ToolPageShell — that shell's chrome (breadcrumb labels,
   trust strip, "How to use") is English, and a Russian page with English
   furniture reads as a template. It emits its OWN single BreadcrumbList, so
   there is exactly one on the page. */

export function generateStaticParams() {
  return PASSPORT_RU_SLUGS.map((country) => ({ country }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const hit = getPassportRu(country);
  if (!hit) return {};
  const { ru, size } = hit;
  const en = `/passport-photo/${size.slug}`;
  const path = `/ru/passport-photo/${size.slug}`;
  return pageMeta({
    title: ru.title,
    description: ru.desc,
    path,
    keywords: ru.keywords,
    // Reciprocal with the English page, which declares the same pair back.
    languages: { en, ru: path, "x-default": en },
  });
}

const dt = { color: "var(--text)" } as const;
const dd = { color: "var(--text-muted)" } as const;

export default async function PassportCountryRuPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const hit = getPassportRu(country);
  if (!hit) notFound();
  const { ru, size } = hit;

  const path = `/ru/passport-photo/${size.slug}`;
  const en = `/passport-photo/${size.slug}`;

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(`Фото на паспорт РФ — ${ru.sizeLabel}`, ru.desc, path),
          breadcrumbLd([
            { name: "Главная", path: "/" },
            { name: "Инструменты для изображений", path: "/image-tools" },
            { name: "Фото на документы", path: "/ru/passport-photo" },
            { name: "Паспорт РФ", path },
          ]),
          howToLd(ru.h1, `Обрезать портрет до ${ru.sizeLabel}.`, path, ru.steps),
          faqLd(ru.faqs),
        ])} />

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pt-8 pb-10 space-y-6">
        {/* Visible breadcrumb — matches the BreadcrumbList above one-to-one. */}
        <nav aria-label="Навигация" className="text-[12.5px]" style={dd}>
          <Link href="/" className="hover:opacity-80">Главная</Link>
          <span aria-hidden> › </span>
          <Link href="/image-tools" className="hover:opacity-80">Инструменты для изображений</Link>
          <span aria-hidden> › </span>
          <Link href="/ru/passport-photo" className="hover:opacity-80">Фото на документы</Link>
          <span aria-hidden> › </span>
          <span style={dt}>Паспорт РФ</span>
        </nav>

        <header>
          <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
            🪪 Бесплатно · в браузере · без регистрации
          </p>
          <h1 className="font-display font-extrabold tracking-tight leading-[1.05] text-[30px] sm:text-[38px]" style={dt}>
            {ru.h1}
          </h1>
          <p className="mt-3 text-[15px] max-w-2xl leading-relaxed" style={dd}>{ru.intro}</p>
        </header>

        <section className="qx-card p-4 sm:p-6" aria-label="Инструмент">
          <PassportClient lang="ru" preset={{ label: `${ru.sizeLabel} — паспорт РФ`, w: size.w, h: size.h }} />
        </section>

        {/* Below the tool, matching every other tool page. */}
        <AdsterraSlot format="native" />

        {/* The specification, and who published it — a millimetre with no
            author is asking to be trusted for no reason. */}
        <section className="qx-card p-6" aria-labelledby="spec">
          <h2 id="spec" className="qx-title mb-4" style={dt}>Что публикует {ru.authority}</h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-[13.5px]">
            <div><dt className="font-bold" style={dt}>Документ</dt><dd style={dd}>{ru.document}</dd></div>
            <div><dt className="font-bold" style={dt}>Размер фото</dt><dd style={dd}>{ru.sizeLabel}</dd></div>
            <div><dt className="font-bold" style={dt}>При 300 DPI</dt><dd style={dd}>{size.w} × {size.h} пикселей</dd></div>
            <div><dt className="font-bold" style={dt}>Фон</dt><dd style={dd}>{ru.background}</dd></div>
            {ru.headRule && <div className="sm:col-span-2"><dt className="font-bold" style={dt}>Размер головы</dt><dd style={dd}>{ru.headRule}</dd></div>}
          </dl>
          <ul className="mt-5 space-y-2 text-[13px]" style={dd}>
            {ru.notes.map((n) => <li key={n} className="flex gap-2"><span aria-hidden style={{ color: "var(--primary-bright)" }}>·</span>{n}</li>)}
          </ul>
          <p className="mt-5 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
            Источник:{" "}
            <a href={size.source} target="_blank" rel="nofollow noopener" style={{ color: "var(--primary-bright)" }}>{ru.authority}</a>
            {" "}· проверено {size.checked}. Требования меняются — сверьтесь с первоисточником перед подачей.
          </p>
        </section>

        <section className="qx-card p-6" aria-labelledby="howto">
          <h2 id="howto" className="qx-title mb-4" style={dt}>Как сделать фото 413×531</h2>
          <ol className="space-y-3 text-[13.5px]">
            {ru.steps.map(([title, desc], i) => (
              <li key={title} id={`step-${i + 1}`} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[12px] font-bold" style={{ background: "var(--primary)", color: "#fff" }}>{i + 1}</span>
                <div><div className="font-bold" style={dt}>{title}</div><div style={dd}>{desc}</div></div>
              </li>
            ))}
          </ol>
        </section>

        <section className="qx-card p-6" aria-labelledby="faq">
          <h2 id="faq" className="qx-title mb-4" style={dt}>Вопросы и ответы</h2>
          <div className="space-y-4 text-[13.5px]">
            {ru.faqs.map((f) => (
              <div key={f.q}>
                <h3 className="font-bold" style={dt}>{f.q}</h3>
                <p className="mt-1" style={dd}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="qx-card p-6" aria-label="Связанные инструменты">
          <h2 className="qx-title mb-4" style={dt}>Связанные инструменты</h2>
          <div className="flex flex-wrap gap-2.5">
            {[
              { href: "/ru/resize/413x531", label: "Изменить размер до 413×531 (без разметки)" },
              { href: "/ru/passport-photo", label: "Фото на документы — все размеры" },
              { href: "/ru/background-remover", label: "Удалить фон — сделать белым" },
              { href: en, label: "English version" },
            ].map((l) => (
              <Link key={l.href} href={l.href}
                className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {l.label}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
