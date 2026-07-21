import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiChevronRight, FiArrowRight, FiArrowLeft } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, SITE_URL, SITE_NAME } from "@/lib/seo";
import { DOC_PAGES, getDocPage } from "@/lib/docs-content";

export function generateStaticParams() {
  return DOC_PAGES.map((d) => ({ slug: d.slug }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doc = getDocPage(slug);
  if (!doc) return pageMeta({ title: "Doc not found", path: `/docs/${slug}`, noindex: true });
  return pageMeta({
    title: `${doc.title} — QRix Docs`,
    description: doc.summary,
    path: `/docs/${doc.slug}`,
    keywords: [doc.title.toLowerCase(), "qrix docs", "how qrix works"],
  });
}

export default async function DocPageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getDocPage(slug);
  if (!doc) notFound();

  const idx = DOC_PAGES.findIndex((d) => d.slug === doc.slug);
  const prev = idx > 0 ? DOC_PAGES[idx - 1] : null;
  const next = idx < DOC_PAGES.length - 1 ? DOC_PAGES[idx + 1] : null;

  return (
    <main className="max-w-3xl mx-auto px-5 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          {
            "@context": "https://schema.org",
            "@type": "TechArticle",
            headline: doc.title,
            description: doc.summary,
            mainEntityOfPage: `${SITE_URL}/docs/${doc.slug}`,
            author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL, logo: { "@type": "ImageObject", url: `${SITE_URL}/icon` } },
          },
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Documentation", path: "/docs" },
            { name: doc.title, path: `/docs/${doc.slug}` },
          ]),
        ])}
      />

      <nav className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:opacity-80">Home</Link>
        <FiChevronRight size={12} />
        <Link href="/docs" className="hover:opacity-80">Docs</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>{doc.title}</span>
      </nav>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{doc.emoji}</span>
        <h1 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>{doc.title}</h1>
      </div>
      <p className="text-lg leading-relaxed mt-2 mb-8" style={{ color: "var(--text-muted)" }}>{doc.summary}</p>

      <article className="space-y-9">
        {doc.sections.map((s, i) => (
          <section key={i}>
            <h2 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text)" }}>{s.h}</h2>
            {s.p.map((para, j) => (
              <p key={j} className="text-[15px] leading-relaxed mb-3" style={{ color: "var(--text-muted)" }}>{para}</p>
            ))}
          </section>
        ))}
      </article>

      {/* Prev / next */}
      <div className="grid sm:grid-cols-2 gap-4 mt-12 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
        {prev ? (
          <Link href={`/docs/${prev.slug}`} className="group qx-card qx-card-lift p-4">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold" style={{ color: "var(--text-faint)" }}><FiArrowLeft size={11} /> Previous</span>
            <div className="text-[14px] font-bold mt-1" style={{ color: "var(--text)" }}>{prev.title}</div>
          </Link>
        ) : <span />}
        {next && (
          <Link href={`/docs/${next.slug}`} className="group qx-card qx-card-lift p-4 sm:text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold sm:justify-end w-full" style={{ color: "var(--text-faint)" }}>Next <FiArrowRight size={11} /></span>
            <div className="text-[14px] font-bold mt-1" style={{ color: "var(--text)" }}>{next.title}</div>
          </Link>
        )}
      </div>
    </main>
  );
}
