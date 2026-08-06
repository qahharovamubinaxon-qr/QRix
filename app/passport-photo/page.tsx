import Link from "next/link";
import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { PASSPORT_SIZES } from "@/lib/passport-sizes";

/* The hub, and the crawlable parent of the country pages — designed in from the
   start after M147e, where 167 pages sat in the sitemap and nowhere else and
   Google never fetched one of them. */

export const metadata = pageMeta({
  title: "Passport Photo Size by Country — Sourced, With a Free Tool",
  description:
    "Passport photo dimensions for each country, quoted from the issuing authority and linked so you can check them, with a browser tool that crops to the exact size at 300 DPI.",
  path: "/passport-photo",
  keywords: ["passport photo size", "passport photo size by country", "visa photo size", "passport photo maker"],
});

const HUB_FAQS = [
  {
    q: "Where do these sizes come from?",
    a: "Each one is copied from the issuing authority's own published page, which is linked on the country page along with the date it was last read. Nothing here is included on the strength of what other sites repeat.",
  },
  {
    q: "Why isn't Schengen listed?",
    a: "Because the European Commission's own page defers to ICAO guidelines rather than stating dimensions, and a number repeated across the web is not a sourced number. It will be added when a primary source is found, not before.",
  },
  {
    q: "Is my photo uploaded?",
    a: "No. The crop runs in your browser, which matters for a photo that is going onto an identity document.",
  },
  {
    q: "Does the right size mean my photo will be accepted?",
    a: "No — size is one rule of several. Expression, glasses, head coverings, background, lighting, print quality and how recent the photo is are all set by the authority, and they change. The country page links their rules.",
  },
];

export default function PassportPhotoHub() {
  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Image Tools", path: "/image-tools" },
            { name: "Passport Photo", path: "/passport-photo" },
          ]),
          faqLd(HUB_FAQS),
        ])} />

      <main className="max-w-[1100px] mx-auto px-5 lg:px-8 py-12 lg:py-16">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
          // PASSPORT PHOTO — {PASSPORT_SIZES.length} COUNTRIES · SOURCED
        </p>
        <h1 className="font-display font-extrabold tracking-tight leading-[1.05] mb-4"
          style={{ color: "var(--text)", fontSize: "clamp(30px, 3.8vw, 48px)" }}>
          Passport photo size, by country
        </h1>
        <p className="text-[15px] max-w-2xl leading-relaxed mb-10" style={{ color: "var(--text-muted)" }}>
          Every size below is quoted from the authority that issues the document, and linked so you can
          check it yourself. The tool crops to that exact size at 300 DPI in your browser — the photo is
          never uploaded, which is the point when it is going onto an identity document.
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mb-14">
          {PASSPORT_SIZES.map((p) => (
            <Link key={p.slug} href={`/passport-photo/${p.slug}`}
              className="rounded-2xl p-5 transition-opacity hover:opacity-90"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <div className="font-bold text-[15px] mb-1" style={{ color: "var(--text)" }}>{p.country}</div>
              <div className="qx-mono text-[13px] mb-2" style={{ color: "var(--primary-bright)" }}>{p.sizeLabel}</div>
              <div className="text-[12.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {p.background} background · {p.authority}
              </div>
            </Link>
          ))}
        </div>

        <section aria-labelledby="hub-faq" className="mb-12">
          <h2 id="hub-faq" className="font-display font-bold text-[22px] mb-5" style={{ color: "var(--text)" }}>
            Before you print anything
          </h2>
          <div className="space-y-4">
            {HUB_FAQS.map((f) => (
              <div key={f.q} className="rounded-2xl p-5" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="font-bold text-[14px] mb-1.5" style={{ color: "var(--text)" }}>{f.q}</p>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-wrap gap-3">
          <Link href="/image-tools/passport-photo" className="qx-btn">Open the generic tool</Link>
          <Link href="/remove-background/id-photo" className="qx-btn-ghost">Fix the background first</Link>
        </div>
      </main>
    </>
  );
}
