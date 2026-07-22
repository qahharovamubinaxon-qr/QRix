import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowRight, FiChevronRight, FiCheck } from "react-icons/fi";
import ShareButtons from "@/components/ShareButtons";
import { pageMeta, jsonLd, breadcrumbLd, faqLd, softwareAppLd, SITE_URL } from "@/lib/seo";
import { FiGlobe } from "react-icons/fi";
import {
  USE_CASES_EN, USE_LANGS, UI, LANG_NAMES, getUseCase, localizedContent, localizedKeywords, hasTranslation, isRtl,
  freeLabel, type Lang,
} from "@/lib/usecase-content";

const isLang = (v: string): v is Lang => (USE_LANGS as string[]).includes(v);

// Only prerendered (translated) lang+slug combos are valid — a /use/ru/… URL
// 404s until its translation exists, so no fallback-English page gets indexed.
export const dynamicParams = false;

export function generateStaticParams() {
  // Only build language variants that actually have content (EN always; ru/uz
  // once translated) — avoids shipping fallback-English pages under /ru or /uz.
  const params: { lang: string; slug: string }[] = [];
  for (const u of USE_CASES_EN)
    for (const lang of USE_LANGS)
      if (hasTranslation(u.slug, lang)) params.push({ lang, slug: u.slug });
  return params;
}

function altLanguages(slug: string): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const l of USE_LANGS) if (hasTranslation(slug, l)) langs[l] = `/use/${l}/${slug}`;
  langs["x-default"] = `/use/en/${slug}`;
  return langs;
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string; slug: string }> }): Promise<Metadata> {
  const { lang, slug } = await params;
  const u = getUseCase(slug);
  if (!u || !isLang(lang)) return pageMeta({ title: "Not found", path: `/use/${lang}/${slug}`, noindex: true });
  const c = localizedContent(u, lang);
  return pageMeta({
    title: c.title,
    description: c.metaDescription,
    path: `/use/${lang}/${slug}`,
    keywords: localizedKeywords(u, lang),
    languages: altLanguages(slug),
  });
}

export default async function UseCasePage({ params }: { params: Promise<{ lang: string; slug: string }> }) {
  const { lang, slug } = await params;
  const u = getUseCase(slug);
  if (!u || !isLang(lang) || !hasTranslation(slug, lang)) notFound();
  const c = localizedContent(u, lang);
  const ui = UI[lang];
  const url = `${SITE_URL}/use/${lang}/${slug}`;

  const related = USE_CASES_EN
    .filter((x) => x.slug !== u.slug && x.category === u.category)
    .concat(USE_CASES_EN.filter((x) => x.slug !== u.slug && x.category !== u.category))
    .slice(0, 4);

  return (
    <main className="max-w-3xl mx-auto px-5 py-12" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "HowTo",
            name: c.title,
            description: c.metaDescription,
            inLanguage: lang,
            step: c.steps.map((s, i) => ({ "@type": "HowToStep", position: i + 1, name: s.title, text: s.desc })),
          },
          softwareAppLd(u.toolLabel, c.metaDescription, u.toolHref),
          breadcrumbLd([
            { name: ui.home, path: "/" },
            { name: ui.hub, path: `/use/${lang}` },
            { name: c.title, path: `/use/${lang}/${slug}` },
          ]),
          faqLd(c.faqs),
        ])}
      />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: "var(--text-muted)" }} aria-label="Breadcrumb">
        <Link href="/" className="hover:opacity-80">{ui.home}</Link>
        <FiChevronRight size={12} />
        <Link href={`/use/${lang}`} className="hover:opacity-80">{ui.hub}</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>{u.category}</span>
      </nav>

      {/* Language switcher — native details, no JS; links each translation */}
      <details className="mb-6 inline-block relative">
        <summary className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[12.5px] font-bold cursor-pointer list-none"
          style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
          <FiGlobe size={13} /> {LANG_NAMES[lang]}
        </summary>
        <div className="absolute z-20 mt-2 p-2 rounded-xl grid grid-cols-2 gap-1 w-64"
          style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
          {USE_LANGS.filter((l) => hasTranslation(slug, l)).map((l) => (
            <Link key={l} href={`/use/${l}/${slug}`} dir={isRtl(l) ? "rtl" : "ltr"}
              className="px-3 py-1.5 rounded-lg text-[12.5px] font-semibold"
              style={{ background: l === lang ? "var(--primary-dim)" : "transparent", color: l === lang ? "var(--primary-bright)" : "var(--text-muted)" }}>
              {LANG_NAMES[l]}
            </Link>
          ))}
        </div>
      </details>

      {/* Hero */}
      <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>{ui.kicker}</p>
      <div className="flex items-start gap-4">
        <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: u.grad }}>{u.emoji}</span>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>{c.title}</h1>
      </div>
      <p className="text-lg leading-relaxed mt-5" style={{ color: "var(--text-muted)" }}>{c.intro}</p>

      <div className="flex flex-wrap items-center gap-4 mt-6">
        <Link href={u.toolHref} className="qx-btn-hero inline-flex">{u.toolLabel} <FiArrowRight size={15} /></Link>
      </div>
      <div className="mt-5">
        <ShareButtons url={url} title={c.title} />
      </div>

      {/* Benefits */}
      <section className="mt-11" aria-label={ui.why}>
        <h2 className="font-display text-2xl font-bold mb-5" style={{ color: "var(--text)" }}>{ui.why}</h2>
        <ul className="space-y-3">
          {c.benefits.map((b, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ background: "var(--primary-dim)", color: "var(--primary-bright)" }}><FiCheck size={13} /></span>
              <span className="text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{b}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Steps */}
      <section className="mt-11" aria-label={ui.how}>
        <h2 className="font-display text-2xl font-bold mb-5" style={{ color: "var(--text)" }}>{ui.how}</h2>
        <div className="space-y-4">
          {c.steps.map((s, i) => (
            <div key={i} className="flex gap-4">
              <span className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0" style={{ background: "var(--grad-primary)" }}>{i + 1}</span>
              <div>
                <div className="font-bold text-[15px]" style={{ color: "var(--text)" }}>{s.title}</div>
                <div className="text-[14px] mt-0.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-12" aria-label={ui.faq}>
        <h2 className="font-display text-2xl font-bold mb-5" style={{ color: "var(--text)" }}>{ui.faq}</h2>
        <div className="space-y-4">
          {c.faqs.map((f, i) => (
            <div key={i} className="qx-card p-5">
              <h3 className="font-bold text-[15px] mb-1.5" style={{ color: "var(--text)" }}>{f.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <div className="qx-card p-7 mt-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,143,32,.16), transparent 70%)" }} />
        <div className="relative">
          <span className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-3xl mb-3" style={{ background: u.grad }}>{u.emoji}</span>
          <p className="text-sm mb-4" style={{ color: "var(--text-muted)" }}>{freeLabel(ui, u.onDevice !== false)}</p>
          <Link href={u.toolHref} className="qx-btn-hero inline-flex">{ui.open} <FiArrowRight size={15} /></Link>
        </div>
      </div>

      {/* Related use cases */}
      <section className="mt-12" aria-label={ui.related}>
        <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>{ui.related}</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {related.map((r) => (
            <Link key={r.slug} href={`/use/${lang}/${r.slug}`} className="group qx-card qx-card-lift p-5 flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: r.grad }}>{r.emoji}</span>
              <span className="min-w-0">
                <span className="block text-[13.5px] font-bold leading-snug" style={{ color: "var(--text)" }}>{localizedContent(r, lang).title}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>{ui.open} <FiArrowRight size={11} /></span>
              </span>
            </Link>
          ))}
        </div>
        <Link href={`/use/${lang}`} className="inline-flex items-center gap-1.5 text-sm font-bold mt-6" style={{ color: "var(--primary-bright)" }}>{ui.more} <FiArrowRight size={13} /></Link>
      </section>
    </main>
  );
}
