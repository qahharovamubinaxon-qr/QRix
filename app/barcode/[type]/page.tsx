import Link from "next/link";
import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import BarcodeClient from "@/components/BarcodeClient";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";
import { BARCODE_TYPES, getBarcodeType, relatedTypes, typeGrad } from "@/lib/barcode-types";

export function generateStaticParams() {
  return BARCODE_TYPES.map((t) => ({ type: t.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = getBarcodeType(type);
  if (!t) return {};
  return pageMeta({ title: t.title, description: t.desc, path: `/barcode/${t.slug}`, keywords: t.keywords });
}

export default async function BarcodeTypePage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const t = getBarcodeType(type);
  if (!t) notFound();

  const path = `/barcode/${t.slug}`;
  const related = relatedTypes(t);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(t.h1, t.desc, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "QR Tools", path: "/qr-tools" },
            { name: "Barcode Generator", path: "/barcode" },
            { name: t.name, path },
          ]),
          howToLd(t.h1, t.desc, path, t.steps),
          faqLd(t.faqs),
        ])} />

      <ToolPageShell
        category="QR Tools" categoryHref="/qr-tools"
        title={t.h1} emoji={t.emoji} grad={typeGrad(t)}
        intro={t.intro}
        about={t.about}
        steps={t.steps.map(([title, desc]) => ({ title, desc }))}
        faqs={t.faqs}
        useCases={t.useCases}
      >
        <BarcodeClient initialFormat={t.format} />
      </ToolPageShell>

      {/* Related symbologies — internal linking across the whole barcode family */}
      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10">
        <section className="qx-card p-6" aria-label="Other barcode types">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Other barcode types</h2>
          <div className="flex flex-wrap gap-2.5">
            {related.map((o) => (
              <Link key={o.slug} href={`/barcode/${o.slug}`}
                className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                <span aria-hidden>{o.emoji}</span> {o.name}
              </Link>
            ))}
            <Link href="/barcode"
              className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              All 13 barcode types →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
