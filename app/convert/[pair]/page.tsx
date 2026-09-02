import Link from "next/link";
import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import ImageEngineRegistry from "@/components/image/ImageEngineRegistry";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";
import { CONVERT_PAIRS, getPair, relatedPairs, pairGrad } from "@/lib/convert-pairs";

export function generateStaticParams() {
  return CONVERT_PAIRS.map((p) => ({ pair: p.slug }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = getPair(pair);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.desc, path: `/convert/${p.slug}`, keywords: p.keywords,
    languages: { en: `/convert/${p.slug}`, ru: `/ru/convert/${p.slug}`, uz: `/uz/convert/${p.slug}`, "x-default": `/convert/${p.slug}` } });
}

export default async function ConvertPairPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params;
  const p = getPair(pair);
  if (!p) notFound();

  const path = `/convert/${p.slug}`;
  const related = relatedPairs(p);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(p.h1, p.desc, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Convert", path: "/convert" },
            { name: p.h1, path },
          ]),
          howToLd(p.h1, p.desc, path, p.steps),
          faqLd(p.faqs),
        ])} />

      <ToolPageShell
        breadcrumbSchema={false}
        category="Image Tools" categoryHref="/image-tools"
        title={p.h1} emoji={p.emoji} grad={pairGrad(p)}
        intro={p.intro}
        about={p.about}
        steps={p.steps.map(([title, desc]) => ({ title, desc }))}
        faqs={p.faqs}
      >
        <ImageEngineRegistry engine={p.engine} />
      </ToolPageShell>

      {/* Related converters — internal linking across the whole pair family */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Related converters">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Related converters</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((o) => (
              <Link key={o.slug} href={`/convert/${o.slug}`}
                className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span aria-hidden>{o.emoji}</span> {o.from} to {o.to}
              </Link>
            ))}
            <Link href="/convert"
              className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              All converters →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
