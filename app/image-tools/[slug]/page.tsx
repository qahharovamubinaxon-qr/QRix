import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowRight } from "react-icons/fi";
import ToolPageShell from "@/components/ToolPageShell";
import ImageEngineRegistry from "@/components/image/ImageEngineRegistry";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";
import { IMAGE_TOOLS, getImgTool } from "@/lib/image-tools-meta";
import { LOC_TOOLS } from "@/lib/localized-tools";
import { allPostsSorted } from "@/lib/blog";
import { PASSPORT_SIZES } from "@/lib/passport-sizes";

export function generateStaticParams() {
  return IMAGE_TOOLS.map((t) => ({ slug: t.slug }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getImgTool(slug);
  if (!tool) return pageMeta({ title: "Image tool not found", path: `/image-tools/${slug}`, noindex: true });
  /* hreflang has to be RECIPROCAL or a search engine may ignore it. The
     localized twins at /ru/<slug> and /uz/<slug> already point back here, so
     the English page has to point at them — and deriving that from LOC_TOOLS
     rather than hand-listing it means the next localized tool is wired the
     moment it enters the registry, instead of shipping a one-way pair nobody
     notices. Matched on enPath because a localized slug need not equal the
     English one. */
  const loc = LOC_TOOLS.find((l) => l.enPath === `/image-tools/${tool.slug}`);
  return pageMeta({
    title: `${tool.title} — Free Online`, description: tool.desc,
    path: `/image-tools/${tool.slug}`, keywords: tool.keywords,
    ...(loc ? { languages: { en: loc.enPath, ru: `/ru/${loc.slug}`, uz: `/uz/${loc.slug}`, "x-default": loc.enPath } } : {}),
  });
}

export default async function ImageToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getImgTool(slug);
  if (!tool) notFound();

  const related = [
    ...IMAGE_TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category),
    ...IMAGE_TOOLS.filter((t) => t.slug !== tool.slug && t.category !== tool.category && t.popular),
  ].slice(0, 6);
  const guide = allPostsSorted().find((p) => tool.keywords.some((k) => p.keywords.some((pk) => pk.includes(k.split(" ")[0]) || k.includes(pk.split(" ")[0]))));

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(tool.title, tool.desc, `/image-tools/${tool.slug}`),
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Image Tools", path: "/image-tools" }, { name: tool.title, path: `/image-tools/${tool.slug}` }]),
          faqLd(tool.faqs),
        ])}
      />
      <ToolPageShell category="Image Tools" categoryHref="/image-tools" title={tool.title} emoji={tool.emoji} grad={tool.grad} intro={tool.intro} about={tool.about} steps={tool.steps}>
        <ImageEngineRegistry engine={tool.engine} />

        <section className="qx-card p-6 mt-7" aria-label="Frequently asked questions">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {tool.faqs.map((f, i) => (<div key={i}><h3 className="text-[14px] font-bold mb-1" style={{ color: "var(--text)" }}>{f.q}</h3><p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p></div>))}
          </div>
        </section>

        {tool.slug === "passport-photo" && (
          // /image-tools/passport-photo earns 278 impressions/wk (SEO_STRATEGY.md
          // baseline) and had no link to the country-specific sizes built for the
          // exact-intent tail of that same query family (M151, /passport-photo/*).
          // Same shape as the remove-bg fix above: link the generic page to the
          // pages built to win its own long tail.
          <section className="qx-card p-6 mt-7" aria-label="Passport photo size by country">
            <h2 className="qx-title mb-1" style={{ color: "var(--text)" }}>By country</h2>
            <p className="text-[13px] mb-4" style={{ color: "var(--text-muted)" }}>
              Crop to the exact size your country&rsquo;s authority publishes, sourced and dated.
            </p>
            <div className="flex flex-wrap gap-2.5">
              {PASSPORT_SIZES.map((p) => (
                <Link key={p.slug} href={`/passport-photo/${p.slug}`}
                  className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                  {p.country} — {p.sizeLabel}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-7" aria-label="Related image tools">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>More image tools</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/image-tools/${r.slug}`} className="group qx-card qx-card-lift p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: r.grad }}>{r.emoji}</span>
                <span className="min-w-0"><span className="block text-[13px] font-bold truncate" style={{ color: "var(--text)" }}>{r.short}</span><span className="inline-flex items-center gap-1 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>Open <FiArrowRight size={11} /></span></span>
              </Link>
            ))}
          </div>
        </section>

        {guide && (
          <Link href={`/blog/${guide.slug}`} className="group qx-card qx-card-lift p-5 mt-7 flex items-center justify-between gap-4">
            <div><div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary-bright)" }}>From the blog</div><div className="font-bold text-[15px]" style={{ color: "var(--text)" }}>{guide.title}</div></div>
            <FiArrowRight size={18} className="shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: "var(--primary-bright)" }} />
          </Link>
        )}
      </ToolPageShell>
    </>
  );
}
