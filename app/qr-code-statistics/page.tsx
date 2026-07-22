import type { Metadata } from "next";
import Link from "next/link";
import { FiExternalLink, FiAlertTriangle, FiCheckCircle, FiArrowRight, FiSlash } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, faqLd, SITE_URL, SITE_NAME } from "@/lib/seo";
import { STAT_GROUPS, ALL_STATS, REJECTED, FTC_ALERT, type SourceKind } from "@/lib/qr-stats";
import StatsQrTool from "./StatsQrTool";

const PATH = "/qr-code-statistics";
const UPDATED = "2026-07-22";

export const metadata: Metadata = pageMeta({
  title: "QR Code Statistics (2026) — 26 Numbers, Every One Sourced",
  description:
    "QR code statistics you can actually cite: 26 figures on scan-to-pay volume, regional scan growth and marketer behaviour — each linked to the report it came from, each with its limitation stated. Plus the popular numbers we checked and threw out.",
  path: PATH,
  keywords: [
    "qr code statistics", "qr code usage statistics", "qr code statistics 2026",
    "qr code scan statistics", "qr code payment statistics", "how many people scan qr codes",
    "qr code adoption data", "qr code market data",
  ],
});

/* How much weight a number can carry, said plainly next to it. */
const KIND_LABEL: Record<SourceKind, string> = {
  government: "Government statistic",
  regulator: "Regulator",
  analyst: "Research house",
  "vendor-platform": "Vendor platform data",
  "vendor-survey": "Vendor survey",
};

const KIND_TONE: Record<SourceKind, string> = {
  government: "var(--success)",
  regulator: "var(--success)",
  analyst: "var(--primary-bright)",
  "vendor-platform": "var(--primary-bright)",
  "vendor-survey": "var(--text-faint)",
};

/* The regional figures, drawn as a bar chart in CSS — no chart library, no
   client JS, nothing to hydrate. Values are read from the dataset so the chart
   cannot drift away from the cards above it. */
const REGIONS: { label: string; id: string }[] = [
  { label: "Europe", id: "scan-eu" },
  { label: "Latin America", id: "scan-latam" },
  { label: "Asia-Pacific", id: "scan-apac" },
  { label: "MENA", id: "scan-mena" },
  { label: "Sub-Saharan Africa", id: "scan-ssa" },
  { label: "North America", id: "scan-na" },
];

const pct = (id: string) => Number((ALL_STATS.find((s) => s.id === id)?.value || "0").replace(/[^0-9.]/g, ""));

const FAQS = [
  {
    q: "How many QR codes are scanned every day?",
    a: "Nobody credibly knows, and anyone who gives you a single worldwide number is guessing. QR codes are decoded by the phone itself, so there is no central counter — a static code can be scanned a million times without anyone being able to observe it. The honest figures are narrower: a payment network's transaction count, or one provider's scans of the codes it hosts. That is why this page reports regional growth rates and payment volumes rather than a global daily total.",
  },
  {
    q: "What is the most reliable QR code statistic?",
    a: "India's UPI figures. They are published as official government statistics rather than marketing material, they count completed transactions rather than impressions, and they are released monthly — 21.63 billion transactions in December 2025, growing 29% year on year. The caveat is that UPI includes payments made without scanning anything, so it is an upper bound on QR-driven volume, not a measure of it.",
  },
  {
    q: "Are QR codes still being used, or was it a pandemic fad?",
    a: "The best available evidence says scans are growing faster than new codes are being created — in Europe, codes created grew 7% while scans grew 53% over the same period. That pattern is the opposite of a fad: it means the codes already in the world are being used more, not that more codes are being printed and ignored. North America is the slowest region at +8%, which reads as maturity rather than decline.",
  },
  {
    q: "Why does this page have fewer statistics than other QR statistics posts?",
    a: "Because the longer lists include numbers we could not stand behind. \"Over 2 billion QR codes are scanned every day\" has no primary source and contradicts the annual totals printed on the same pages that carry it. A widely-quoted set of QR phishing percentages traces back to a roundup of 69 statistics that names a source for three or four of them. We list what we rejected, and why, at the bottom of this page.",
  },
  {
    q: "Can I cite or reuse these statistics?",
    a: "Yes. Quote the figure, and please link to the original source listed beside it rather than to us — every entry names the report it came from and the date that report was published. If you cite this page as well, link to qrixtools.com/qr-code-statistics. The one thing we would ask is that you carry the caveat along with the number, because most of these measure something narrower than they sound like.",
  },
  {
    q: "How often is this page updated?",
    a: "It is re-checked when a load-bearing source publishes a new edition — the payment forecasts and the annual scan report are the two that move. Each figure carries its own period and its source's publication date, so you can see how fresh any individual number is instead of trusting a single \"updated\" stamp at the top.",
  },
];

export default function QrCodeStatisticsPage() {
  const maxPct = Math.max(...REGIONS.map((r) => pct(r.id)));

  return (
    <main className="max-w-4xl mx-auto px-5 py-12 lg:py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "QR code statistics", path: PATH }]),
          faqLd(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: "QR Code Statistics (2026) — 26 Numbers, Every One Sourced",
            description:
              "26 sourced QR code statistics covering scan-to-pay value, regional scan growth and marketer behaviour, each with its original source and its limitation — plus the widely-repeated figures that did not survive checking.",
            datePublished: UPDATED,
            dateModified: UPDATED,
            inLanguage: "en",
            mainEntityOfPage: { "@type": "WebPage", "@id": SITE_URL + PATH },
            author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            citation: Array.from(new Set(ALL_STATS.map((s) => s.source.url))).map((url) => ({
              "@type": "CreativeWork",
              url,
            })),
          },
        ])}
      />

      {/* ---------------------------------------------------------- hero */}
      <header className="mb-12">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
          // SOURCED DATA · UPDATED JULY 2026
        </p>
        <h1
          className="font-display font-extrabold leading-[1.05]"
          style={{ color: "var(--text)", fontSize: "clamp(2rem,5vw,3.4rem)" }}
        >
          QR code statistics,<br />with the receipts.
        </h1>
        <p className="mt-5 text-[16px] max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {ALL_STATS.length} figures on QR codes. Every one links to the page it was read off, states the period it
          covers, and says what it does <em>not</em> prove. Most QR statistics posts are longer than this one because
          they repeat numbers that have no source — we checked those too, and{" "}
          <a href="#rejected" className="underline underline-offset-4" style={{ color: "var(--primary-bright)" }}>
            list what we threw out
          </a>
          .
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {STAT_GROUPS.map((g) => (
            <a
              key={g.id}
              href={`#${g.id}`}
              className="px-3 py-1.5 rounded-full text-xs font-semibold transition-colors"
              style={{ background: "var(--surface-hover)", border: "1px solid var(--border)", color: "var(--text-muted)" }}
            >
              {g.title}
            </a>
          ))}
        </div>
      </header>

      {/* ------------------------------------------------------- method */}
      <section className="qx-card p-6 mb-14" aria-labelledby="method-h">
        <h2 id="method-h" className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
          How we checked
        </h2>
        <ul className="space-y-3 text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          {[
            "A figure only appears here if we opened the page it came from. No number is quoted from another roundup.",
            "Each stat names its source's own publication date, so you can tell a 2026 measurement from a 2025 forecast reprinted as news.",
            "Every source is labelled by what kind of thing it is. A government statistic and a vendor's survey of its own customers are not the same evidence, and the page never lets them look the same.",
            "Anything weaker than an official statistic carries a written caveat naming what it does not prove. That is enforced by a test, not by good intentions.",
          ].map((line, i) => (
            <li key={i} className="flex gap-3">
              <FiCheckCircle size={16} className="shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* -------------------------------------------------------- groups */}
      {STAT_GROUPS.map((group) => (
        <section key={group.id} id={group.id} className="mb-14 scroll-mt-24" aria-labelledby={`${group.id}-h`}>
          <h2
            id={`${group.id}-h`}
            className="font-display font-extrabold mb-3"
            style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}
          >
            {group.title}
          </h2>
          <p className="text-[15px] leading-relaxed mb-6 max-w-2xl" style={{ color: "var(--text-muted)" }}>
            {group.intro}
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {group.stats.map((s) => (
              <article key={s.id} className="qx-card p-5 flex flex-col">
                <div
                  className="font-display font-extrabold leading-none mb-3"
                  style={{ color: "var(--primary-bright)", fontSize: "clamp(1.5rem,3.4vw,2.1rem)" }}
                >
                  {s.value}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text)" }}>
                  {s.claim}
                </p>

                <div className="mt-auto pt-3 space-y-2" style={{ borderTop: "1px solid var(--border)" }}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="qx-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full"
                      style={{ color: KIND_TONE[s.source.kind], border: `1px solid ${KIND_TONE[s.source.kind]}` }}
                    >
                      {KIND_LABEL[s.source.kind]}
                    </span>
                    <span className="qx-mono text-[10px]" style={{ color: "var(--text-faint)" }}>
                      {s.period}
                    </span>
                  </div>

                  <a
                    href={s.source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-start gap-1.5 text-xs leading-snug hover:underline underline-offset-2"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <FiExternalLink size={12} className="shrink-0 mt-0.5" />
                    <span>
                      {s.source.name} <span style={{ color: "var(--text-faint)" }}>· {s.source.published}</span>
                    </span>
                  </a>

                  {s.caveat && (
                    <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-faint)" }}>
                      <strong style={{ color: "var(--text-faint)" }}>What it doesn&rsquo;t prove:</strong> {s.caveat}
                    </p>
                  )}
                </div>
              </article>
            ))}
          </div>

          {/* The regional numbers are easier to read as bars than as six cards. */}
          {group.id === "scans" && (
            <figure className="qx-card p-6 mt-6">
              <figcaption className="text-sm font-bold mb-5" style={{ color: "var(--text)" }}>
                Change in scan rate by region, 2024 → 2025
              </figcaption>
              <div className="space-y-3">
                {REGIONS.map((r) => {
                  const v = pct(r.id);
                  return (
                    <div key={r.id} className="flex items-center gap-3">
                      <span className="text-xs w-[132px] shrink-0" style={{ color: "var(--text-muted)" }}>
                        {r.label}
                      </span>
                      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: "var(--surface-hover)" }}>
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${(v / maxPct) * 100}%`, background: "var(--grad-primary)" }}
                        />
                      </div>
                      <span className="qx-mono text-xs w-[46px] text-right shrink-0" style={{ color: "var(--text)" }}>
                        +{v}%
                      </span>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] mt-5 leading-relaxed" style={{ color: "var(--text-faint)" }}>
                Source: Bitly, “The State of QR Code Scans in 2026” (10 March 2026). These are growth rates on one
                provider&rsquo;s platform — they show which regions are accelerating, not how large each region is.
              </p>
            </figure>
          )}
        </section>
      ))}

      {/* ------------------------------------------------------ security */}
      <section className="mb-14" aria-labelledby="security-h">
        <h2
          id="security-h"
          className="font-display font-extrabold mb-3"
          style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}
        >
          The one topic we have no good numbers for
        </h2>
        <div className="qx-card p-6">
          <div className="flex gap-3 mb-4">
            <FiAlertTriangle size={18} className="shrink-0 mt-0.5" style={{ color: "var(--primary-bright)" }} />
            <p className="text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
              QR phishing — “quishing” — is the fastest-moving QR story and the worst-documented. The percentages that
              circulate (“12% of phishing attacks carry a QR code”, “68% target mobile users”) trace back to a roundup
              listing 69 such statistics that names an original report for three or four of them. The attacks are real;
              the public numbers describing them are not checkable, so none appear above.
            </p>
          </div>
          <p className="text-[15px] leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
            What is citable is that consumer regulators now publish QR-specific warnings. The US Federal Trade
            Commission has an alert on codes arriving on unexpected packages — a scam that works precisely because a
            printed code hides its destination until you have already opened it.
          </p>
          <a
            href={FTC_ALERT.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline underline-offset-2"
            style={{ color: "var(--primary-bright)" }}
          >
            <FiExternalLink size={14} />
            {FTC_ALERT.name} · {FTC_ALERT.published}
          </a>
          <p className="text-[13px] mt-5 leading-relaxed" style={{ color: "var(--text-faint)" }}>
            If you want to see where a code actually points before you follow it, our{" "}
            <Link href="/qr-tools/decode" className="underline underline-offset-2" style={{ color: "var(--text-muted)" }}>
              QR scanner
            </Link>{" "}
            decodes the payload in your browser and shows you the URL as text instead of opening it.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ rejected */}
      <section id="rejected" className="mb-14 scroll-mt-24" aria-labelledby="rejected-h">
        <h2
          id="rejected-h"
          className="font-display font-extrabold mb-3"
          style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}
        >
          Numbers we checked and threw out
        </h2>
        <p className="text-[15px] leading-relaxed mb-6 max-w-2xl" style={{ color: "var(--text-muted)" }}>
          These are the QR statistics you will meet most often. Each one failed the same test: we could not find the
          study underneath it. They are listed here so that this page is checkable in both directions — what it
          contains, and what it deliberately doesn&rsquo;t.
        </p>
        <div className="space-y-4">
          {REJECTED.map((r, i) => (
            <article key={i} className="qx-card p-5">
              <div className="flex gap-3">
                <FiSlash size={16} className="shrink-0 mt-1" style={{ color: "var(--text-faint)" }} />
                <div>
                  <h3 className="text-sm font-bold mb-2" style={{ color: "var(--text)" }}>
                    {r.claim}
                  </h3>
                  <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {r.finding}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------- tool */}
      <section className="mb-14" aria-labelledby="tool-h">
        <h2
          id="tool-h"
          className="font-display font-extrabold mb-3"
          style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}
        >
          Make one, since you&rsquo;re here
        </h2>
        <p className="text-[15px] leading-relaxed mb-6 max-w-2xl" style={{ color: "var(--text-muted)" }}>
          A static QR code stores its destination inside the pattern itself, which is why the codes counted above keep
          working for years and why no one can produce a global scan count. This generator runs entirely in your
          browser — the URL you type is never sent anywhere.
        </p>
        <StatsQrTool />
      </section>

      {/* ----------------------------------------------------------- faq */}
      <section className="mb-14" aria-labelledby="faq-h">
        <h2
          id="faq-h"
          className="font-display font-extrabold mb-6"
          style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}
        >
          Questions about these numbers
        </h2>
        <div className="space-y-3">
          {FAQS.map((f) => (
            <details key={f.q} className="qx-card p-5 group">
              <summary className="cursor-pointer text-sm font-bold list-none" style={{ color: "var(--text)" }}>
                {f.q}
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                {f.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------- related */}
      <section aria-labelledby="related-h">
        <h2 id="related-h" className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
          Related
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/", t: "QR code generator", d: "Free, no signup, codes that never expire." },
            { href: "/free-forever", t: "Why ours is actually free", d: "What the other “free” generators charge for." },
            { href: "/qr-tools", t: "All QR tools", d: "URL, WiFi, vCard, event, payment and more." },
            { href: "/bulk-qr", t: "Bulk QR from CSV", d: "Hundreds of codes in one pass." },
            { href: "/qr-tools/decode", t: "QR scanner & decoder", d: "See where a code points before you follow it." },
            { href: "/blog", t: "QR guides", d: "How dynamic codes, tracking and print sizing work." },
          ].map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="qx-card p-4 flex items-start justify-between gap-3 transition-colors hover:opacity-90"
            >
              <span>
                <span className="block text-sm font-bold" style={{ color: "var(--text)" }}>
                  {l.t}
                </span>
                <span className="block text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {l.d}
                </span>
              </span>
              <FiArrowRight size={15} className="shrink-0 mt-1" style={{ color: "var(--primary-bright)" }} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
