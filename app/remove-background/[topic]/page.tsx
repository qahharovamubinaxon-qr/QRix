import Link from "next/link";
import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import RemoveBgClient from "@/components/RemoveBgClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";
import { BG_USE_CASES, getBgUseCase, relatedBgUseCases } from "@/lib/removebg-usecases";

/* One page per background-removal intent, each mounting the REAL tool — the
   same @imgly on-device model /image-tools/remove-bg uses. The parent earns 65%
   of the site's impressions at position 88 and no clicks, because it competes
   for head terms owned by remove.bg and Canva; these target the tail where the
   query names what is being cut out. */

export function generateStaticParams() {
  return BG_USE_CASES.map((u) => ({ topic: u.slug }));
}

/* An unknown slug must 404, not render an empty 200 — the defect M118 fixed
   across twenty other routes. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const u = getBgUseCase(topic);
  if (!u) return {};
  return pageMeta({
    title: u.title, description: u.desc, path: `/remove-background/${u.slug}`, keywords: u.keywords,
  });
}

export default async function RemoveBgUseCasePage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const u = getBgUseCase(topic);
  if (!u) notFound();

  const path = `/remove-background/${u.slug}`;
  const related = relatedBgUseCases(u);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(u.h1, u.desc, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Remove Background", path: "/remove-background" },
            { name: u.h1, path },
          ]),
          howToLd(u.h1, u.desc, path, u.steps.map((s, i) => [`Step ${i + 1}`, s] as [string, string])),
          faqLd(u.faqs),
        ])} />

      <ToolPageShell
        category="Image Tools" categoryHref="/image-tools"
        title={u.h1} emoji={u.emoji} grad="linear-gradient(135deg,#ff6a13,#e14e08)"
        intro={u.intro}
        about={u.about}
        steps={u.steps.map((s, i) => ({ title: `Step ${i + 1}`, desc: s }))}
        faqs={u.faqs}
      >
        <RemoveBgClient />
      </ToolPageShell>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Related background removal pages">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Other things people cut out</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((o) => (
              <Link key={o.slug} href={`/remove-background/${o.slug}`}
                className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span aria-hidden>{o.emoji}</span> {o.h1.replace(/^Remove (the )?background (from )?/i, "")}
              </Link>
            ))}
            <Link href="/remove-background"
              className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              All background removal →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
