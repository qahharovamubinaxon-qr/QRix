import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FiArrowRight } from "react-icons/fi";
import ToolPageShell from "@/components/ToolPageShell";
import ThreeEngineRegistry from "@/components/three/ThreeEngineRegistry";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd } from "@/lib/seo";
import { THREE_TOOLS, getThreeTool } from "@/lib/three-tools-meta";
import { AI_TOOLS } from "@/lib/ai-tools-meta";

export function generateStaticParams() {
  return THREE_TOOLS.map((t) => ({ slug: t.slug }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = getThreeTool(slug);
  if (!tool) return pageMeta({ title: "3D tool not found", path: `/3d-tools/${slug}`, noindex: true });
  return pageMeta({
    title: `${tool.title} — Free Online`,
    description: tool.desc,
    path: `/3d-tools/${tool.slug}`,
    keywords: tool.keywords,
  });
}

export default async function ThreeToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = getThreeTool(slug);
  if (!tool) notFound();

  // Related: sibling 3D tools first, then visual AI tools.
  const related = [
    ...THREE_TOOLS.filter((t) => t.slug !== tool.slug).map((t) => ({ href: `/3d-tools/${t.slug}`, title: t.title, emoji: t.emoji, grad: t.grad })),
    ...AI_TOOLS.filter((t) => t.popular).slice(0, 5).map((t) => ({ href: `/ai-tools/${t.slug}`, title: t.short, emoji: t.emoji, grad: t.grad })),
  ].slice(0, 6);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(tool.title, tool.desc, `/3d-tools/${tool.slug}`),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "3D Tools", path: "/3d-tools" },
            { name: tool.title, path: `/3d-tools/${tool.slug}` },
          ]),
          faqLd(tool.faqs),
        ])}
      />
      <ToolPageShell
        breadcrumbSchema={false}
        category="3D Tools"
        categoryHref="/3d-tools"
        title={tool.title}
        emoji={tool.emoji}
        grad={tool.grad}
        intro={tool.intro}
        about={tool.about}
        steps={tool.steps}
        /* The AI generator posts the image to /api/v1/3d; only the fallback
           preview is on-device, so the page cannot claim files never upload. */
        processing="cloud"
      >
        <ThreeEngineRegistry engine={tool.engine} />

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

        <section className="mt-7" aria-label="Related tools">
          <h2 className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>Related tools</h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link key={r.href} href={r.href} className="group qx-card qx-card-lift p-4 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: r.grad }}>{r.emoji}</span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-bold truncate" style={{ color: "var(--text)" }}>{r.title}</span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
                    Open <FiArrowRight size={11} />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      </ToolPageShell>
    </>
  );
}
