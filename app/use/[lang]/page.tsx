import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowRight } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, SITE_URL } from "@/lib/seo";
import {
  USE_CASES_EN, USE_LANGS, UI, localizedContent, hasTranslation, isRtl, type Lang,
} from "@/lib/usecase-content";

const isLang = (v: string): v is Lang => (USE_LANGS as string[]).includes(v);
const langReady = (l: Lang) => l === "en" || USE_CASES_EN.some((u) => hasTranslation(u.slug, l));
const CATS: Array<"QR" | "PDF" | "Image" | "Video" | "AI"> = ["QR", "PDF", "Image", "Video", "AI"];

export const dynamicParams = false;

export function generateStaticParams() {
  return USE_LANGS.filter(langReady).map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLang(lang)) return pageMeta({ title: "Not found", path: `/use/${lang}`, noindex: true });
  const ui = UI[lang];
  const languages: Record<string, string> = { "x-default": "/use/en" };
  for (const l of USE_LANGS) if (langReady(l)) languages[l] = `/use/${l}`;
  return pageMeta({
    title: `${ui.hubTitle} | QRix`,
    description: ui.hubDesc,
    path: `/use/${lang}`,
    keywords: ["free online tools", "qr code generator", "pdf tools", "image tools", "video tools"],
    languages,
  });
}

export default async function UseHub({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLang(lang) || !langReady(lang)) notFound();
  const ui = UI[lang];

  return (
    <main className="max-w-5xl mx-auto px-5 py-14" dir={isRtl(lang) ? "rtl" : "ltr"}>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: ui.home, path: "/" }, { name: ui.hub, path: `/use/${lang}` }]),
          {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: ui.hubTitle,
            url: `${SITE_URL}/use/${lang}`,
            inLanguage: lang,
          },
        ])}
      />

      <header className="text-center mb-12">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>{ui.kicker}S</p>
        <h1 className="font-display text-3xl lg:text-5xl font-extrabold" style={{ color: "var(--text)" }}>{ui.hubTitle}</h1>
        <p className="mt-3 text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>{ui.hubDesc}</p>
      </header>

      <div className="space-y-12">
        {CATS.map((cat) => {
          const items = USE_CASES_EN.filter((u) => u.category === cat);
          if (!items.length) return null;
          return (
            <section key={cat} aria-label={cat}>
              <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-3" style={{ color: "var(--text)" }}>
                {cat}<span className="h-px flex-1" style={{ background: "var(--border)" }} />
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((u) => (
                  <Link key={u.slug} href={`/use/${lang}/${u.slug}`} className="group qx-card qx-card-lift p-5 flex flex-col">
                    <span className="w-11 h-11 rounded-xl flex items-center justify-center text-xl mb-3" style={{ background: u.grad }}>{u.emoji}</span>
                    <h3 className="text-[14.5px] font-bold leading-snug flex-1" style={{ color: "var(--text)" }}>{localizedContent(u, lang).title}</h3>
                    <span className="inline-flex items-center gap-1 text-[11.5px] font-bold mt-3 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>{ui.open} <FiArrowRight size={11} /></span>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
