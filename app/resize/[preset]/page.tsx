import Link from "next/link";
import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import ImageEngineRegistry from "@/components/image/ImageEngineRegistry";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";
import { RESIZE_PRESETS, getPreset, relatedPresets, presetGrad } from "@/lib/resize-presets";

export function generateStaticParams() {
  return RESIZE_PRESETS.map((p) => ({ preset: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ preset: string }> }) {
  const { preset } = await params;
  const p = getPreset(preset);
  if (!p) return {};
  return pageMeta({ title: p.title, description: p.desc, path: `/resize/${p.slug}`, keywords: p.keywords });
}

export default async function ResizePresetPage({ params }: { params: Promise<{ preset: string }> }) {
  const { preset } = await params;
  const p = getPreset(preset);
  if (!p) notFound();

  const path = `/resize/${p.slug}`;
  const related = relatedPresets(p);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(p.h1, p.desc, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Resize", path: "/resize" },
            { name: p.h1, path },
          ]),
          howToLd(p.h1, p.desc, path, p.steps),
          faqLd(p.faqs),
        ])} />

      <ToolPageShell
        category="Image Tools" categoryHref="/image-tools"
        title={p.h1} emoji={p.emoji} grad={presetGrad(p)}
        intro={p.intro}
        about={p.about}
        steps={p.steps.map(([title, desc]) => ({ title, desc }))}
        faqs={p.faqs}
      >
        <ImageEngineRegistry engine={`resize:${p.w}x${p.h}`} />
      </ToolPageShell>

      {/* Related sizes — internal linking across the whole preset family */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Related sizes">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Other popular sizes</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((o) => (
              <Link key={o.slug} href={`/resize/${o.slug}`}
                className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span aria-hidden>{o.emoji}</span> {o.w}×{o.h}
              </Link>
            ))}
            <Link href="/resize"
              className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              All sizes →
            </Link>
          </div>
          <div className="mt-5 pt-5 flex flex-wrap gap-2.5" style={{ borderTop: "1px solid var(--border)" }}>
            <Link href="/image-tools/resize" className="text-[12.5px] font-semibold hover:opacity-80" style={{ color: "var(--primary-bright)" }}>
              Custom width & height →
            </Link>
            <Link href="/image-tools/compress" className="text-[12.5px] font-semibold hover:opacity-80" style={{ color: "var(--primary-bright)" }}>
              Compress an image →
            </Link>
            <Link href="/convert" className="text-[12.5px] font-semibold hover:opacity-80" style={{ color: "var(--primary-bright)" }}>
              Convert the format →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
