import { notFound } from "next/navigation";
import Link from "next/link";
import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import { COMPARE_SOURCES } from "@/lib/compare-sources";

/* Honest comparison pages — "QRix vs X" queries convert at the highest rate
   of any SEO content. Each page: feature table, honest verdict (including
   where the competitor is stronger — credibility IS the conversion), FAQ.

   M152. The competitor column no longer lives here. Every cell about a NAMED
   product is read from that vendor's own page and dated, in
   lib/compare-sources.ts — three of the hand-typed cells this file used to
   hold turned out to be factually wrong, and an unsourced table is precisely
   the thing that hides that. Prose in this file may describe QRix freely; it
   may not assert a fact about a competitor that the dataset does not carry. */

type Cmp = {
  name: string; title: string; desc: string; intro: string;
  keywords: string[]; competitorNote: string;
  verdict: string; cta: { href: string; label: string };
  faqs: { q: string; a: string }[];
};

const COMPARES: Record<string, Cmp> = {
  "qrix-vs-ilovepdf": {
    name: "iLovePDF",
    title: "QRix vs iLovePDF (2026): Free PDF Tools Compared",
    desc: "An honest comparison of QRix and iLovePDF: PDF to Word quality, file limits, watermarks, pricing and privacy — which free PDF toolbox fits you.",
    intro: "iLovePDF is the best-known PDF suite on the web, and it earned that. QRix takes a different angle: the same everyday PDF jobs plus 160+ non-PDF tools, with no signup and no file-size ceiling — because most of them finish in your browser. Here is the breakdown, with iLovePDF's column read from its own pricing page.",
    keywords: ["qrix vs ilovepdf", "ilovepdf alternative", "ilovepdf free alternative", "best free pdf tools", "pdf to word free no limit"],
    competitorNote: "iLovePDF's pricing page states its free limit as file size per task, not a daily task count, and lists Premium at 4–7 US$/month depending on billing period (read 2026-08-01).",
    verdict: "iLovePDF is a mature, polished PDF suite with desktop and mobile apps, and its free tier is more generous than the version of it this page used to describe — its own pricing table caps file size per task, not the number of tasks. Where QRix differs is scope and ceiling: the same everyday conversions with no size cap, because most of them run in your browser, plus QR, barcode, image, AI and downloader tools in the same tab. If you work in PDFs all day and want native apps, iLovePDF earns its price.",
    cta: { href: "/pdf-tools/pdf-to-word", label: "Try PDF → Word free" },
    faqs: [
      { q: "Is QRix's PDF to Word really comparable?", a: "QRix uses a cloud conversion engine that preserves tables, fonts and layout. We compared its DOCX output side-by-side against iLovePDF's on real documents while building it — both files dissected and rendered through Word — and closed the gaps that comparison exposed. That was our own testing, not an independent benchmark." },
      { q: "Does QRix limit tasks per day?", a: "No. Fair-use rate limits prevent abuse, but there is no daily task counter and no file-size cap." },
      { q: "What is iLovePDF's free limit, exactly?", a: "Its pricing page states file size per task: 100 MB for Merge and Split, 200 MB for Compress, against 4 GB on Premium. Its own Batch processing row reads Unlimited for free and paid alike, and it states no daily task cap. Read 2026-08-01 — check the page itself before relying on it." },
    ],
  },
  "qrix-vs-tinywow": {
    name: "TinyWow",
    title: "QRix vs TinyWow (2026): Which Free Toolbox Is Better?",
    desc: "TinyWow and QRix both promise free everything. Honest comparison: ads, AI tools, QR studio, downloader, speed and privacy.",
    intro: "TinyWow proved the 'everything free' model works, funded by ads it is open about charging to remove. QRix follows the same philosophy with a different mix and a different funding model: a real QR design studio, an AI/3D lab, a social downloader — and a single unobtrusive ad below the tool rather than around it.",
    keywords: ["qrix vs tinywow", "tinywow alternative", "sites like tinywow", "free online tools no signup", "tinywow without ads"],
    competitorNote: "TinyWow is ad-supported: its own pricing page sells Premium on \"No advertisements\" and \"Skip all CAPTCHAs\", at 20 US$/month or 15 US$/month billed yearly (read 2026-08-01).",
    verdict: "TinyWow has the bigger brand and a huge tool count, and it is upfront about its model — its pricing page names ads and CAPTCHAs as the things Premium removes. That is the honest summary of the difference: on QRix those are not there to remove. Where TinyWow is genuinely ahead is reach and maturity; where QRix is ahead is that most tools finish on your device, and the QR side is a studio rather than a single generator.",
    cta: { href: "/", label: "Open the QRix toolbox" },
    faqs: [
      { q: "Is QRix really ad-free?", a: "Tool pages are kept clean — no pop-ups and no interstitial ads between you and your file." },
      { q: "What exactly does TinyWow charge for?", a: "Its pricing page lists three things Premium gives you: no advertisements, skipping all CAPTCHAs, and priority processing. It also lists cheaper single-category plans at 3 US$/month. Read 2026-08-01, and prices there vary by currency and region." },
      { q: "Which has more tools?", a: "QRix has 185+. We have not counted TinyWow's catalogue, so this page does not claim a winner on count — compare the QR studio or the downloader head-to-head and judge depth in two minutes." },
      { q: "Is my file uploaded?", a: "On QRix most image/PDF/video tools run inside your browser — the file never leaves your device. Cloud-powered tools say so explicitly." },
    ],
  },
  "qrix-vs-snaptik": {
    name: "SnapTik",
    title: "QRix vs SnapTik (2026): TikTok Downloader Without the Ads",
    desc: "SnapTik vs QRix for downloading TikTok without a watermark: MP3 support, photo slideshows, other platforms and ads — compared against what each site actually states.",
    intro: "SnapTik does one job — TikTok videos without the watermark — and does it fast. QRix does the same job ad-free, adds MP3 audio that SnapTik deliberately does not offer, and covers 16 more platforms in the same box.",
    keywords: ["qrix vs snaptik", "snaptik alternative", "snaptik without ads", "tiktok downloader no watermark safe", "ssstik alternative"],
    competitorNote: "SnapTik is free and ad-supported. This page reports only what its own site states and what the HTML it served us contains — not what its ads do after you click, which a fetched page cannot show.",
    verdict: "SnapTik is good at the one thing it does, and it is straight about a limit most of its rivals ignore: it declines to offer MP3 extraction on intellectual-property grounds. If you want the audio, or you want Instagram, VK, X and a dozen more without visiting a different site each time, that is where QRix differs — and the one ad sits below the download buttons, never around them. This page previously credited SnapTik with MP3 support it does not claim and downgraded its photo-slideshow support it does; both are corrected above.",
    cta: { href: "/downloader/tiktok", label: "Download a TikTok (no watermark)" },
    faqs: [
      { q: "Is QRix's downloader really free with no catch?", a: "Yes — no signup, no watermark added, and nothing to install. There is one ad below the download buttons; it is never placed where it could be mistaken for one. A fair-use limit of 40 downloads/hour keeps it fast for everyone." },
      { q: "Can I get the sound as MP3?", a: "On QRix, yes. SnapTik's own FAQ says it will not provide MP3 download because it \"respects the intellectual property rights of the tracks\" — so if audio is what you came for, that is a real difference rather than a marketing one. Read 2026-08-01." },
      { q: "Why do free downloader sites carry ads?", a: "Ads are usually their only revenue. QRix is part of a larger toolbox with its own model, so the downloader stays clean. We are not characterising any particular site's ad behaviour here — we can only see what a page serves us, not what its ad slots fill with later." },
      { q: "Is it safe?", a: "QRix serves files over HTTPS from the platform's own CDN through a signed proxy — no bundled installers, no notification-permission tricks." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(COMPARES).map((slug) => ({ slug }));
}

/* Params outside the registry must 404, not render an empty 200 page. */
export const dynamicParams = false;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPARES[slug];
  if (!c) return {};
  return pageMeta({ title: c.title, description: c.desc, path: `/compare/${slug}`, keywords: c.keywords });
}

export default async function ComparePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = COMPARES[slug];
  const src = COMPARE_SOURCES[slug];
  if (!c || !src) notFound();
  const others = Object.entries(COMPARES).filter(([s]) => s !== slug);

  return (
    <>
      <script type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: `QRix vs ${c.name}`, path: `/compare/${slug}` }]),
          faqLd(c.faqs),
        ])} />

      <main className="max-w-3xl mx-auto px-5 lg:px-8 pt-10 lg:pt-16 pb-24">
        <nav className="text-[12px] mb-4" style={{ color: "var(--text-faint)" }}>
          <Link href="/" className="hover:underline">Home</Link> <span className="mx-1">›</span> QRix vs {c.name}
        </nav>

        <header className="mb-8">
          <h1 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>{c.title.replace(/ \(2026\).*/, "")}</h1>
          <p className="mt-3 text-[14.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.intro}</p>
          <p className="mt-2 text-[12.5px]" style={{ color: "var(--text-faint)" }}>{c.competitorNote}</p>
        </header>

        {/* comparison table */}
        <div className="overflow-x-auto rounded-2xl" style={{ border: "1px solid var(--border)" }}>
          <table className="w-full text-[13px]" style={{ color: "var(--text)" }}>
            <thead>
              <tr style={{ background: "var(--surface-2)" }}>
                <th className="text-left px-4 py-3 font-bold">Feature</th>
                <th className="text-left px-4 py-3 font-bold" style={{ color: "var(--primary-bright)" }}>QRix</th>
                <th className="text-left px-4 py-3 font-bold">{c.name}</th>
              </tr>
            </thead>
            <tbody>
              {src.rows.map((r) => (
                <tr key={r.feature} style={{ borderTop: "1px solid var(--border)" }}>
                  <td className="px-4 py-3 font-semibold" style={{ color: "var(--text-muted)" }}>{r.feature}</td>
                  <td className="px-4 py-3">{r.qrix}</td>
                  <td className="px-4 py-3" style={{ color: "var(--text-muted)" }}>
                    {r.theirs}
                    {!r.stated && (
                      <span className="ml-1.5 align-middle qx-mono text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: "var(--surface-2)", color: "var(--text-faint)", border: "1px solid var(--border)" }}>
                        not stated
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Where the competitor column came from. A comparison page that names a
            company and cites nothing is the thing this site accuses others of. */}
        <p className="mt-3 text-[12px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
          {src.sourceNote}{" "}
          {src.sources.map((s) => (
            <a key={s.url} href={s.url} target="_blank" rel="nofollow noopener" className="underline underline-offset-2"
              style={{ color: "var(--text-muted)" }}>
              {s.label} (read {s.checked})
            </a>
          ))}
          . Cells marked <span className="qx-mono">not stated</span> are questions that page does not answer — we would rather leave a gap than guess on someone else&apos;s behalf.
        </p>

        {/* verdict */}
        <section className="mt-8 qx-card p-5">
          <h2 className="font-display text-lg font-bold mb-2" style={{ color: "var(--text)" }}>The honest verdict</h2>
          <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{c.verdict}</p>
          <Link href={c.cta.href} className="qx-btn-hero inline-flex mt-4 !px-6">{c.cta.label}</Link>
        </section>

        {/* faq */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-4" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
          <div className="space-y-3">
            {c.faqs.map((f) => (
              <details key={f.q} className="qx-card p-4">
                <summary className="font-bold text-[14px] cursor-pointer" style={{ color: "var(--text)" }}>{f.q}</summary>
                <p className="mt-2 text-[13.5px]" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* other comparisons */}
        <section className="mt-10">
          <h2 className="font-display text-xl font-bold mb-3" style={{ color: "var(--text)" }}>More comparisons</h2>
          <div className="flex flex-wrap gap-2.5">
            {others.map(([s, o]) => (
              <Link key={s} href={`/compare/${s}`} className="inline-flex px-3 py-1.5 rounded-full text-[12.5px] font-semibold hover:opacity-80"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                QRix vs {o.name}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
