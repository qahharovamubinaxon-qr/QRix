import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiChevronRight, FiArrowRight, FiMail } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { HELP_CATEGORIES, getHelpCategory } from "@/lib/help-content";

export function generateStaticParams() {
  return HELP_CATEGORIES.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params;
  const cat = getHelpCategory(category);
  if (!cat) return pageMeta({ title: "Help topic not found", path: `/help/${category}`, noindex: true });
  return pageMeta({
    title: `${cat.title} — QRix Help`,
    description: cat.blurb,
    path: `/help/${cat.slug}`,
    keywords: [`${cat.title} help`, "qrix support", "qr code faq"],
  });
}

export default async function HelpCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const cat = getHelpCategory(category);
  if (!cat) notFound();

  const others = HELP_CATEGORIES.filter((c) => c.slug !== cat.slug);

  return (
    <main className="max-w-3xl mx-auto px-5 py-12">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Help Center", path: "/help" },
            { name: cat.title, path: `/help/${cat.slug}` },
          ]),
          faqLd(cat.articles),
        ])}
      />

      <nav className="flex items-center gap-2 text-xs mb-6 flex-wrap" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:opacity-80">Home</Link>
        <FiChevronRight size={12} />
        <Link href="/help" className="hover:opacity-80">Help Center</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>{cat.title}</span>
      </nav>

      <div className="flex items-center gap-4 mb-8">
        <span className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>{cat.emoji}</span>
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold" style={{ color: "var(--text)" }}>{cat.title}</h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>{cat.blurb}</p>
        </div>
      </div>

      <div className="space-y-4">
        {cat.articles.map((a, i) => (
          <div key={i} className="qx-card p-6">
            <h2 className="font-display text-lg font-bold mb-2" style={{ color: "var(--text)" }}>{a.q}</h2>
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{a.a}</p>
          </div>
        ))}
      </div>

      {/* Other topics */}
      {others.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>Other help topics</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {others.map((c) => (
              <Link key={c.slug} href={`/help/${c.slug}`} className="group qx-card qx-card-lift p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>{c.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-[13.5px] font-bold truncate" style={{ color: "var(--text)" }}>{c.title}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
                    Open <FiArrowRight size={11} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="qx-card p-6 mt-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="font-bold text-[15px]" style={{ color: "var(--text)" }}>Didn't find your answer?</div>
          <div className="text-sm" style={{ color: "var(--text-muted)" }}>We're happy to help directly.</div>
        </div>
        <Link href="/contact" className="qx-btn-hero inline-flex"><FiMail size={15} /> Contact support</Link>
      </div>
    </main>
  );
}
