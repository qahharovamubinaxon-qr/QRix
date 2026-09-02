import Link from "next/link";
import { notFound } from "next/navigation";
import ToolPageShell from "@/components/ToolPageShell";
import { PassportClient } from "@/components/image/ImageSpecialClients";
import { pageMeta, jsonLd, breadcrumbLd, softwareAppLd, faqLd, howToLd } from "@/lib/seo";
import { PASSPORT_SIZES, getPassportSize, otherPassportSizes } from "@/lib/passport-sizes";

/* One page per country, each cropping to the size that country's own authority
   publishes, and each linking that authority so the number can be checked.
   The generic /image-tools/passport-photo already earns 278 impressions a week
   at position 84 on "passport photo online"; the query people actually type
   when they have a form in front of them names a country. */

export function generateStaticParams() {
  return PASSPORT_SIZES.map((p) => ({ country: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const p = getPassportSize(country);
  if (!p) return {};
  return pageMeta({
    title: `${p.country} Passport Photo Size — ${p.sizeLabel}, Free Online Tool`,
    description: `Crop a photo to the ${p.sizeLabel} ${p.country} passport photo size, at 300 DPI, in your browser. The size is quoted from ${p.authority}.`,
    path: `/passport-photo/${p.slug}`,
    keywords: [
      `${p.country.toLowerCase()} passport photo size`,
      `passport photo size ${p.country.toLowerCase()}`,
      `${p.sizeLabel} passport photo`,
      `${p.country.toLowerCase()} passport photo online`,
    ],
  });
}

export default async function PassportCountryPage({ params }: { params: Promise<{ country: string }> }) {
  const { country } = await params;
  const p = getPassportSize(country);
  if (!p) notFound();

  const path = `/passport-photo/${p.slug}`;
  const others = otherPassportSizes(p.slug);

  const steps: [string, string][] = [
    ["Upload a front-facing portrait", "Nothing is uploaded to a server — the crop happens in your browser."],
    [`Frame to ${p.sizeLabel}`, `Drag to position the face and zoom to frame it${p.headRule ? `, keeping to the published head size` : ""}.`],
    ["Download at 300 DPI", "Save one photo, or a 4×6 print sheet to take to a photo service."],
  ];

  const faqs = [
    {
      q: `What size is a ${p.country} passport photo?`,
      a: `${p.sizeLabel}, as published by ${p.authority}. This page crops to exactly that, at 300 DPI (${p.w}×${p.h} pixels).`,
    },
    ...(p.headRule ? [{ q: "How big does the head have to be?", a: p.headRule }] : []),
    { q: "What background does it need?", a: `${p.background}. This tool crops and sizes the photo; it does not replace the background — the background remover does that.` },
    { q: "Is my photo uploaded anywhere?", a: "No. The crop runs in your browser, so a photo destined for an identity document never leaves your device." },
    {
      q: "Will this photo definitely be accepted?",
      a: `It gives you the published size. Acceptance also depends on expression, glasses, head coverings, lighting, print quality and how recent the photo is — rules ${p.authority} sets and can change. Check their page before you submit; it is linked on this page and was last read on ${p.checked}.`,
    },
  ];

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          softwareAppLd(`${p.country} passport photo tool`, `Crop a photo to ${p.sizeLabel}, the ${p.country} passport photo size.`, path),
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Passport Photo", path: "/passport-photo" },
            { name: p.country, path },
          ]),
          howToLd(`Make a ${p.country} passport photo`, `Crop a portrait to ${p.sizeLabel}.`, path, steps),
          faqLd(faqs),
        ])} />

      <ToolPageShell
        breadcrumbSchema={false}
        category="Image Tools" categoryHref="/image-tools"
        title={`${p.country} passport photo size — ${p.sizeLabel}`} emoji="🪪"
        grad="linear-gradient(135deg,#ff6a13,#e14e08)"
        intro={`Crop a portrait to the ${p.sizeLabel} ${p.document.toLowerCase()}, at 300 DPI, without uploading it anywhere.`}
        about={p.context}
        steps={steps.map(([title, desc]) => ({ title, desc }))}
        faqs={faqs}
      >
        <PassportClient preset={{ label: `${p.sizeLabel} — ${p.country}`, w: p.w, h: p.h }} />
      </ToolPageShell>

      <div className="max-w-6xl mx-auto px-5 lg:px-8 pb-10 space-y-6">
        {/* The specification, and where each line came from. A page that states a
            millimetre without saying who published it is asking to be trusted
            for no reason. */}
        <section className="qx-card p-6" aria-labelledby="spec">
          <h2 id="spec" className="qx-title mb-4" style={{ color: "var(--text)" }}>
            What {p.authority} publishes
          </h2>
          <dl className="grid gap-3 sm:grid-cols-2 text-[13.5px]">
            <div><dt className="font-bold" style={{ color: "var(--text)" }}>Photo size</dt><dd style={{ color: "var(--text-muted)" }}>{p.sizeLabel}</dd></div>
            <div><dt className="font-bold" style={{ color: "var(--text)" }}>At 300 DPI</dt><dd style={{ color: "var(--text-muted)" }}>{p.w} × {p.h} pixels</dd></div>
            <div><dt className="font-bold" style={{ color: "var(--text)" }}>Background</dt><dd style={{ color: "var(--text-muted)" }}>{p.background}</dd></div>
            {p.headRule && <div><dt className="font-bold" style={{ color: "var(--text)" }}>Head size</dt><dd style={{ color: "var(--text-muted)" }}>{p.headRule}</dd></div>}
          </dl>

          {p.notes.length > 0 && (
            <ul className="mt-5 space-y-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
              {p.notes.map((n) => <li key={n} className="flex gap-2"><span aria-hidden style={{ color: "var(--primary-bright)" }}>·</span>{n}</li>)}
            </ul>
          )}

          <p className="mt-5 text-[12.5px]" style={{ color: "var(--text-faint)" }}>
            Source:{" "}
            <a href={p.source} target="_blank" rel="nofollow noopener" style={{ color: "var(--primary-bright)" }}>
              {p.authority}
            </a>{" "}
            · last read {p.checked}. Requirements change — check the authority&rsquo;s page before you submit.
          </p>
        </section>

        <section className="qx-card p-6" aria-label="Other countries">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Other countries</h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map((o) => (
              <Link key={o.slug} href={`/passport-photo/${o.slug}`}
                className="inline-flex items-center gap-2 pl-2.5 pr-3.5 py-2 rounded-full text-[12.5px] font-semibold transition-opacity hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                {o.country} — {o.sizeLabel}
              </Link>
            ))}
            <Link href="/passport-photo"
              className="inline-flex items-center px-3.5 py-2 rounded-full text-[12.5px] font-bold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border-hover)", color: "var(--primary-bright)" }}>
              All sizes →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
