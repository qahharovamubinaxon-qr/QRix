import type { Metadata } from "next";
import Link from "next/link";
import { FiExternalLink, FiCheck, FiX, FiMinus, FiHelpCircle, FiArrowRight, FiAlertTriangle } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, faqLd, SITE_URL, SITE_NAME } from "@/lib/seo";
import { OPERATOR } from "@/lib/operator";
import {
  VENDORS, SELF, CHECK_LABELS, COUNTS, LIMITED, NO_LIMIT_FOUND, STUDY_DATE,
  type Vendor, type Verdict,
} from "@/lib/qr-generator-study";
import QRGeneratorByType from "@/components/QRGeneratorByType";

const PATH = "/free-qr-code-generator-comparison";

export const metadata: Metadata = pageMeta({
  title: `We Checked ${COUNTS.total} “Free” QR Code Generators — ${COUNTS.limited} Have a Catch`,
  description:
    `Which free QR code generators actually stay free? We read the pricing and FAQ pages of ${COUNTS.total} of them on ${STUDY_DATE} and recorded, per vendor, what switches a free code off: trial expiry, scan caps, watermarks and ads on scan. Every answer links to the page it came from.`,
  path: PATH,
  keywords: [
    "free qr code generator comparison", "best free qr code generator",
    "qr code generator without expiration", "free qr code generator no watermark",
    "do free qr codes expire", "qr code generator no sign up",
    "qr code generator scan limit", "free qr code generator no credit card",
  ],
});

/* Verdict rendering lives here rather than in the dataset: the dataset is a
   record of what vendors say, and should stay readable as prose without any
   knowledge of icons or colour tokens. */
const MARK: Record<Verdict, { icon: React.ReactNode; label: string; color: string }> = {
  ok: { icon: <FiCheck size={13} />, label: "No limit found", color: "#22c55e" },
  limit: { icon: <FiX size={13} />, label: "Limited", color: "var(--danger)" },
  na: { icon: <FiMinus size={13} />, label: "Not offered", color: "var(--text-faint)" },
  unknown: { icon: <FiHelpCircle size={13} />, label: "Not stated", color: "var(--text-faint)" },
};

const FAQS = [
  {
    q: "Do free QR codes expire?",
    a: `It depends entirely on whether the code is static or dynamic, and that distinction is the single most useful thing to understand before printing anything. A static QR code carries its data inside the pattern itself — there is no server in the loop, so no company can switch it off, and it works even if the generator that made it disappears tomorrow. A dynamic code is a redirect: the pattern points at the vendor's short link, and the vendor decides whether that link keeps resolving. Of the ${COUNTS.total} generators we checked on ${STUDY_DATE}, ${COUNTS.limited} attach at least one condition to a code they call free — a trial that ends, a monthly scan pool that runs out, or a plan that has to stay paid. Every one of those conditions applies to dynamic codes. Not one of them can apply to a static code, from any vendor, ever.`,
  },
  {
    q: "Which free QR code generator has no catch?",
    a: `On this evidence, the generators with nothing that bites after you print are the ones that never host your code: ${NO_LIMIT_FOUND.filter((v) => v.shape === "static-only").map((v) => v.name).join(", ")}. They make static codes and hand you the file. That is not a coincidence and it is not really a compliment to them — a company that does not store your code has nothing to switch off, nothing to meter and no reason to put an ad in front of a scanner. If you need an editable destination or scan analytics, you are choosing a hosting relationship, and the honest question stops being "is it free" and becomes "what happens to my printed code if this company changes its mind".`,
  },
  {
    q: "What exactly did you test, and what didn't you test?",
    a: `We fetched each vendor's own live pricing and/or FAQ page on ${STUDY_DATE} and read it for six specific questions: do free codes keep working, can you get one without an account, is there a free dynamic code, is there a scan cap, is vector output free, and does free output carry the vendor's branding. What we recorded is what each vendor states about itself, with the page linked next to every row. We did not create accounts, enter card details, or push a code through a signup flow — so nothing here is a claim about behaviour inside a logged-in product. Where a page did not answer a question, we wrote "not stated" rather than guessing. That is why several rows are blank: an honest blank is worth more than a confident invention.`,
  },
  {
    q: "Isn't this page biased? You make a QR generator too.",
    a: `Yes, we do, and that is exactly why QRix is measured by the same six questions further down this page — including the one where we come off badly. Our dynamic codes resolve through our redirect, so if this site stops running, they stop working. That is the same dependency every hosted generator on this page has, ours included, and no amount of "free forever" marketing changes it. What you should do with a comparison written by a competitor is check it: every vendor row links to the page we read, so you can open it and disagree with us.`,
  },
  {
    q: "How many of them require an account?",
    a: `${COUNTS.accountRequired} of ${COUNTS.total}. That is much higher than the number with a genuine catch, which is why we count it separately — needing to sign up is disclosed at the door, and you find out before you have printed a thousand flyers. It is friction, not a trap. The traps are the ${COUNTS.scanCapped} that cap scans on a free tier, the ${COUNTS.branded} that put their own ads or watermark in front of the person scanning your code, and the ones whose free dynamic codes are really a trial.`,
  },
  {
    q: "Will this page stay accurate?",
    a: `Not automatically — pricing pages change, and a vendor changing its plans does not make this page wrong so much as dated. That is why the date we read each page is printed on every single row rather than as one "last updated" stamp at the top, and why every row links to the source. If you find a row that no longer matches the vendor's live page, tell us at ${OPERATOR.email} and we will re-check it and correct the row.`,
  },
];

function Mark({ v }: { v: Verdict }) {
  const m = MARK[v];
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-lg shrink-0"
      style={{ color: m.color, background: "var(--surface-2)", border: "1px solid var(--border)" }}
      title={m.label}
      aria-label={m.label}
    >
      {m.icon}
    </span>
  );
}

function VendorCard({ v, self = false }: { v: Vendor; self?: boolean }) {
  const external = v.sourceUrl.startsWith("http");
  return (
    <article
      id={v.id}
      className="qx-card p-5 scroll-mt-24"
      style={self ? { borderColor: "var(--primary-bright)" } : undefined}
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <h3 className="font-display text-[17px] font-extrabold" style={{ color: "var(--text)" }}>
          {v.name}
        </h3>
        <span className="qx-mono text-[11px]" style={{ color: "var(--text-faint)" }}>
          {v.host} · read {v.checked}
        </span>
      </div>

      <p className="mt-2 text-[14px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
        {v.headline}
      </p>

      <dl className="mt-4 space-y-2.5">
        {CHECK_LABELS.map((c) => {
          const check = v.checks[c.key];
          return (
            <div key={c.key} className="flex items-start gap-2.5">
              <Mark v={check.v} />
              <div className="min-w-0">
                <dt className="text-[12px] font-bold" style={{ color: "var(--text)" }}>
                  {c.label}
                </dt>
                <dd className="text-[12.5px] leading-relaxed mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {check.note}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>

      <p className="mt-4 text-[12px]">
        {external ? (
          <a
            href={v.sourceUrl}
            rel="nofollow noopener"
            target="_blank"
            className="inline-flex items-center gap-1.5 underline underline-offset-4"
            style={{ color: "var(--primary-bright)" }}
          >
            {v.sourceLabel} <FiExternalLink size={12} />
          </a>
        ) : (
          <Link href={v.sourceUrl} className="inline-flex items-center gap-1.5 underline underline-offset-4" style={{ color: "var(--primary-bright)" }}>
            {v.sourceLabel} <FiArrowRight size={12} />
          </Link>
        )}
      </p>
    </article>
  );
}

export default function FreeQrGeneratorComparisonPage() {
  const staticClean = NO_LIMIT_FOUND.filter((v) => v.shape === "static-only");

  return (
    <main className="max-w-4xl mx-auto px-5 py-12 lg:py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([
            { name: "Home", path: "/" },
            { name: "Free QR generator comparison", path: PATH },
          ]),
          faqLd(FAQS),
          {
            "@context": "https://schema.org",
            "@type": "Article",
            headline: `We Checked ${COUNTS.total} “Free” QR Code Generators — ${COUNTS.limited} Have a Catch`,
            description:
              `A per-vendor record of what ${COUNTS.total} QR code generators state about their own free tiers — expiry, scan caps, account walls, vector export and branding — read off their live pricing and FAQ pages on ${STUDY_DATE}.`,
            datePublished: STUDY_DATE,
            dateModified: STUDY_DATE,
            inLanguage: "en",
            mainEntityOfPage: { "@type": "WebPage", "@id": SITE_URL + PATH },
            author: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
            citation: VENDORS.map((v) => ({ "@type": "CreativeWork", name: v.name, url: v.sourceUrl })),
          },
        ])}
      />

      {/* ------------------------------------------------------------ hero */}
      <header className="mb-11">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
          // {COUNTS.total} VENDORS · READ {STUDY_DATE}
        </p>
        <h1 className="font-display font-extrabold leading-[1.05]" style={{ color: "var(--text)", fontSize: "clamp(2rem,5vw,3.4rem)" }}>
          {COUNTS.limited} of {COUNTS.total} “free” QR<br />generators have a catch.
        </h1>
        <p className="mt-5 text-[16px] max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Not an opinion round-up. We opened the pricing and FAQ page of {COUNTS.total} QR code generators on{" "}
          {STUDY_DATE} and asked each one the same six questions — starting with the only one that matters after
          you have printed a thousand menus: <em>can this code stop working?</em> Every answer below links to the
          page we read it from, and says “not stated” where the vendor did not answer.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-7">
          {[
            { n: COUNTS.limited, l: "attach a catch to something they call free" },
            { n: COUNTS.scanCapped, l: "cap how many times a free code may be scanned" },
            { n: COUNTS.branded, l: "put their own ad or watermark in front of your scanner" },
            { n: COUNTS.clean, l: "had nothing that bites after you print" },
          ].map((s) => (
            <div key={s.l} className="qx-card p-4">
              <div className="font-display text-3xl font-extrabold" style={{ color: "var(--primary-bright)" }}>
                {s.n}
              </div>
              <div className="text-[12px] mt-1 leading-snug" style={{ color: "var(--text-muted)" }}>
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* --------------------------------------------------------- finding */}
      <section className="mb-12" aria-labelledby="finding-h">
        <h2 id="finding-h" className="font-display font-extrabold mb-4" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          The pattern: the catch arrives with the hosting
        </h2>
        <div className="space-y-4 text-[15px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
          <p>
            Sort the {COUNTS.total} by whether anything can bite after you print, and the line does not fall between
            good companies and bad ones. It falls between generators that hand you a file and generators that keep
            your code on their servers. All {staticClean.length} of the static-only tools —{" "}
            {staticClean.map((v) => v.name).join(", ")} — had nothing that could switch a printed code off, because
            there is nothing of yours in their possession to switch off. A static QR code stores its payload inside
            the pattern; the phone decodes it without contacting anyone.
          </p>
          <p>
            Every generator that hosts the destination, meanwhile, had at least one lever. Sometimes it is
            disclosed plainly — one vendor's own pricing FAQ states outright that for your QR codes to work, the
            account linked to them has to stay active, which is the whole business model in a single sentence.
            Sometimes it is a row in a feature table: on one platform “watermark-free QR codes” carries a cross on
            the free plan and a tick on every paid one, so the watermark <em>is</em> the free tier. Sometimes it is
            arithmetic — a free plan advertised as “Free Forever” that pauses every scan across all your codes once
            the shared pool of 1,000 a month runs out, which on a busy shop counter is a fortnight.
          </p>
          <p>
            The {COUNTS.branded} that put their own branding in the scan path deserve their own mention, because it
            is the limit nobody discovers by reading a pricing page — you discover it when a customer scans your
            menu and gets someone else's advert first. One vendor's FAQ confirms it by answering a question about
            removing ads on a paid plan; another notes its lead-capture pages carry a “powered by” footer.
          </p>
          <p style={{ color: "var(--text)" }}>
            None of this makes dynamic codes a scam. An editable destination and real scan analytics are worth
            paying for, and most of these companies charge fairly for them. It makes the word <em>free</em>, applied
            to a hosted code, a description of a trial period rather than a property of the code.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------- correction */}
      <section className="mb-12">
        <div className="qx-card p-5" style={{ borderColor: "var(--border-hover)" }}>
          <h2 className="text-[15px] font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
            <FiAlertTriangle size={15} style={{ color: "var(--primary-bright)" }} /> Why this page exists, and what it corrected
          </h2>
          <p className="mt-2 text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Our own <Link href="/free-forever" className="underline underline-offset-4" style={{ color: "var(--primary-bright)" }}>free-forever page</Link>{" "}
            claimed that a test of {COUNTS.total} free QR generators found 14 with hidden limits. That test had never
            been run and the number had no source, which by our own rules makes it a fabrication regardless of
            whether it turned out to be close. So we ran it. The real figure is {COUNTS.limited}, the page has been
            changed to say {COUNTS.limited}, and this page is the working it should have shown in the first place.
            We would rather publish the smaller true number than keep the larger invented one.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ the table */}
      <section className="mb-12" aria-labelledby="table-h">
        <h2 id="table-h" className="font-display font-extrabold mb-2" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          All {COUNTS.total}, side by side
        </h2>
        <p className="text-[13.5px] mb-5" style={{ color: "var(--text-muted)" }}>
          <span className="inline-flex items-center gap-1.5 mr-3"><Mark v="ok" /> no limit found</span>
          <span className="inline-flex items-center gap-1.5 mr-3"><Mark v="limit" /> limited</span>
          <span className="inline-flex items-center gap-1.5 mr-3"><Mark v="na" /> not offered</span>
          <span className="inline-flex items-center gap-1.5"><Mark v="unknown" /> not stated on the page we read</span>
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "separate", borderSpacing: 0, minWidth: 640 }}>
            <caption className="sr-only">
              Six free-tier checks across {COUNTS.total} QR code generators, read from each vendor&apos;s own pages on {STUDY_DATE}
            </caption>
            <thead>
              <tr>
                <th scope="col" className="p-2.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                  Generator
                </th>
                {CHECK_LABELS.map((c) => (
                  <th key={c.key} scope="col" className="p-2.5 text-center text-[11px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}>
                    {c.short}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[SELF, ...VENDORS].map((v, i) => (
                <tr key={v.id} style={{ background: v.id === "qrix" ? "color-mix(in srgb, var(--primary-bright) 8%, transparent)" : i % 2 ? "var(--surface)" : "transparent" }}>
                  <th scope="row" className="p-2.5 text-[13px] font-semibold" style={{ color: "var(--text)" }}>
                    <a href={`#${v.id}`} className="hover:underline underline-offset-4">{v.name}</a>
                  </th>
                  {CHECK_LABELS.map((c) => (
                    <td key={c.key} className="p-2.5 text-center">
                      <Mark v={v.checks[c.key].v} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11.5px] mt-3" style={{ color: "var(--text-faint)" }}>
          A tick means we found no limit on the page we read — not that none exists. Read the note under each
          vendor below for what its page actually said.
        </p>
      </section>

      {/* ---------------------------------------------------------- ourselves */}
      <section className="mb-12" aria-labelledby="self-h">
        <h2 id="self-h" className="font-display font-extrabold mb-2" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          Us, by the same six questions
        </h2>
        <p className="text-[14px] mb-5 max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
          A comparison written by a competitor is worth nothing if the competitor exempts itself, so here is QRix
          graded on the same scale — including the row where we lose. Our dynamic codes resolve through our
          redirect. If this site stops running, they stop working. That is the same dependency every hosted
          generator above carries, and marketing language does not remove it.
        </p>
        <VendorCard v={SELF} self />
      </section>

      {/* ---------------------------------------------------- vendor detail */}
      <section className="mb-12" aria-labelledby="limited-h">
        <h2 id="limited-h" className="font-display font-extrabold mb-2" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          The {COUNTS.limited} with a catch
        </h2>
        <p className="text-[13.5px] mb-5" style={{ color: "var(--text-muted)" }}>
          Listed with the specific thing that can switch a free code off, and the page it was read from.
        </p>
        <div className="grid gap-4">
          {LIMITED.map((v) => <VendorCard key={v.id} v={v} />)}
        </div>
      </section>

      <section className="mb-12" aria-labelledby="clean-h">
        <h2 id="clean-h" className="font-display font-extrabold mb-2" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          The {COUNTS.clean} with nothing that bites
        </h2>
        <p className="text-[13.5px] mb-5" style={{ color: "var(--text-muted)" }}>
          {COUNTS.cleanAndStaticOnly} of these {COUNTS.clean} are static-only generators, which is the whole
          finding in one line. The other two host codes but did not state a free-tier limit on the pages we read —
          absence of a stated limit is not proof of absence, and both rows say so.
        </p>
        <div className="grid gap-4">
          {NO_LIMIT_FOUND.map((v) => <VendorCard key={v.id} v={v} />)}
        </div>
      </section>

      {/* --------------------------------------------------------- the tool */}
      <section className="mb-12" aria-labelledby="tool-h">
        <h2 id="tool-h" className="font-display font-extrabold mb-2" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          Make one now and check it against the list
        </h2>
        <p className="text-[14px] mb-5 max-w-2xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
          This is a static QR code generator: it runs in your browser, it asks for nothing, and the code it gives
          you carries its destination inside the pattern. Nothing on this page — including anything we could ever
          decide — can switch off the file you download from it.
        </p>
        <QRGeneratorByType typeId="url" />
      </section>

      {/* ------------------------------------------------------------- how */}
      <section className="mb-12" aria-labelledby="method-h">
        <h2 id="method-h" className="font-display font-extrabold mb-4" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          How to check any generator yourself, in three steps
        </h2>
        <ol className="space-y-4">
          {[
            {
              t: "Find out whether your code is static or dynamic",
              d: "This decides everything else. If the tool offers to let you edit the destination later, or shows you scan analytics, the code is a redirect through the vendor's domain and its life depends on them. If it does neither, the data is in the pattern and no one can revoke it. Scan your own finished code with any reader: if the decoded text is your URL, it is static. If it is the vendor's short domain, it is dynamic.",
            },
            {
              t: "Open the pricing page and look for the free column, not the free headline",
              d: "The headline says free. The comparison table says what free means. Read down the rows for a scan quota, a code quota, a watermark row, or the word trial — a limit written as a number in a table is the vendor being honest, and it is where every finding on this page came from.",
            },
            {
              t: "Search that vendor's own FAQ for the word “expire”",
              d: "Almost every generator answers it, because almost every generator gets asked. The answers are more candid than the marketing above them — that is where we found the account that has to stay active, the codes that go inactive after a trial, and the monthly scan pool that pauses.",
            },
          ].map((s, i) => (
            <li key={s.t} className="qx-card p-5 flex gap-4">
              <span
                className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-display font-extrabold text-[14px]"
                style={{ background: "var(--primary-dim)", color: "var(--primary-bright)", border: "1px solid var(--border-hover)" }}
              >
                {i + 1}
              </span>
              <span>
                <span className="block text-[15px] font-bold" style={{ color: "var(--text)" }}>{s.t}</span>
                <span className="block text-[13.5px] mt-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{s.d}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------- faq */}
      <section className="mb-12" aria-labelledby="faq-h">
        <h2 id="faq-h" className="font-display font-extrabold mb-6" style={{ color: "var(--text)", fontSize: "clamp(1.4rem,3vw,2rem)" }}>
          Questions about this comparison
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

      {/* --------------------------------------------------------- related */}
      <section aria-labelledby="related-h">
        <h2 id="related-h" className="font-display text-lg font-bold mb-4" style={{ color: "var(--text)" }}>
          Related
        </h2>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { href: "/free-forever", t: "What free means here", d: "Our own terms, now with this study behind them." },
            { href: "/qr-code-statistics", t: "QR code statistics", d: "26 figures, each linked to its source and its caveat." },
            { href: "/qr-tools", t: "All QR tools", d: "URL, WiFi, vCard, event, payment and more." },
            { href: "/qr-tools/url", t: "URL QR generator", d: "Static, permanent, no account." },
            { href: "/qr-tools/decode", t: "QR scanner & decoder", d: "Decode a code to see if it is static or a redirect." },
            { href: "/about", t: "Who runs QRix", d: "Who checked these pages, and how to correct one." },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="qx-card p-4 flex items-start justify-between gap-3 transition-colors hover:opacity-90">
              <span>
                <span className="block text-sm font-bold" style={{ color: "var(--text)" }}>{l.t}</span>
                <span className="block text-xs mt-1" style={{ color: "var(--text-muted)" }}>{l.d}</span>
              </span>
              <FiArrowRight size={15} className="shrink-0 mt-1" style={{ color: "var(--primary-bright)" }} />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
