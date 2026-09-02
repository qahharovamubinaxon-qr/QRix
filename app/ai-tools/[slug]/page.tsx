import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowRight } from "react-icons/fi";
import ToolPageShell from "@/components/ToolPageShell";
import AiEngineRegistry from "@/components/ai/AiEngineRegistry";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";
import { AI_TOOLS, getAiTool } from "@/lib/ai-tools-meta";
import { engineProcessing } from "@/lib/ai-connector";
import { getLocTool } from "@/lib/localized-tools";
import { allPostsSorted } from "@/lib/blog";

export function generateStaticParams() {
  return AI_TOOLS.map((t) => ({ slug: t.slug }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getAiTool(slug);
  if (!tool) return pageMeta({ title: "AI tool not found", path: `/ai-tools/${slug}`, noindex: true });
  // tools with a localized RU/UZ twin advertise the hreflang alternates
  const loc = getLocTool(tool.slug);
  return pageMeta({
    title: `${tool.title} — Free Online`,
    description: tool.desc,
    path: `/ai-tools/${tool.slug}`,
    keywords: tool.keywords,
    ...(loc ? { languages: { en: `/ai-tools/${tool.slug}`, ru: `/ru/${tool.slug}`, uz: `/uz/${tool.slug}`, "x-default": `/ai-tools/${tool.slug}` } } : {}),
  });
}

export default async function AiToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getAiTool(slug);
  if (!tool) notFound();

  // 4–8 related AI tools: same category first, then popular
  const related = [
    ...AI_TOOLS.filter((t) => t.slug !== tool.slug && t.category === tool.category),
    ...AI_TOOLS.filter((t) => t.slug !== tool.slug && t.category !== tool.category && t.popular),
  ].slice(0, 6);

  // related guide from the blog (keyword overlap)
  const guide = allPostsSorted().find((p) =>
    tool.keywords.some((k) => p.keywords.some((pk) => pk.includes(k.split(" ")[0]) || k.includes(pk.split(" ")[0])))
  );

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(tool.title, tool.desc, `/ai-tools/${tool.slug}`),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "AI Tools", path: "/ai-tools" },
            { name: tool.title, path: `/ai-tools/${tool.slug}` },
          ]),
          faqLd(tool.faqs),
        ])}
      />
      <ToolPageShell
        breadcrumbSchema={false}
        category="AI Tools"
        categoryHref="/ai-tools"
        title={tool.title}
        emoji={tool.emoji}
        grad={tool.grad}
        intro={tool.intro}
        about={tool.about}
        steps={tool.steps}
        /* Not a constant: these engines move their work to the cloud the
           moment NEXT_PUBLIC_AI_ENGINE is set. */
        processing={engineProcessing(tool.engine)}
      >
        <AiEngineRegistry engine={tool.engine} status={tool.status} />

        {/* FAQ (visible; schema is emitted above) */}
        <section className="qx-card p-6 mt-7" aria-label="Frequently asked questions">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {tool.faqs.map((f, i) => (
              <div key={i}>
                <h3 className="text-[14px] font-bold mb-1" style={{ color: "var(--text)" }}>{f.q}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Related AI tools */}
        <section className="mt-7" aria-label="Related AI tools">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>More AI tools</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.slug} href={`/ai-tools/${r.slug}`} className="group qx-card qx-card-lift p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: r.grad }}>{r.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold truncate" style={{ color: "var(--text)" }}>{r.short}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
                    Open <FiArrowRight size={11} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Related guide */}
        {guide && (
          <Link href={`/blog/${guide.slug}`} className="group qx-card qx-card-lift p-5 mt-7 flex items-center justify-between gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--primary-bright)" }}>From the blog</div>
              <div className="font-bold text-[15px]" style={{ color: "var(--text)" }}>{guide.title}</div>
            </div>
            <FiArrowRight size={18} className="shrink-0 group-hover:translate-x-1 transition-transform" style={{ color: "var(--primary-bright)" }} />
          </Link>
        )}
      </ToolPageShell>
    </>
  );
}
