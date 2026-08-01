import type { Metadata } from "next";
import Link from "next/link";
import { FiCheck, FiX, FiArrowRight, FiShield, FiSlash, FiZap, FiEye } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd, faqLd, SITE_URL } from "@/lib/seo";
import { COUNTS, STUDY_DATE } from "@/lib/qr-generator-study";
import { SITE_LANGS } from "@/lib/lang";

const STUDY_PATH = "/free-qr-code-generator-comparison";

export const metadata: Metadata = pageMeta({
  title: "Free QR Code Generator — No Expiry, No Signup, No Watermark",
  description:
    "Most 'free' QR generators expire your codes, cap scans, add watermarks or demand a credit card. QRix doesn't. Truly free QR codes that never expire — no signup, no tricks, private on your device.",
  path: "/free-forever",
  keywords: [
    "free qr code generator no expiration", "qr code no signup", "qr code no watermark",
    "free qr code generator no credit card", "qr code that never expires", "unlimited qr code generator free",
  ],
});

const PROMISES = [
  { icon: <FiSlash size={16} />, t: "Codes never expire", d: "Static QR codes hold the data inside the code itself — not on our server. No one can ever switch them off." },
  { icon: <FiZap size={16} />, t: "No scan limits", d: "Your code won't die on your busiest day. Unlimited scans, always." },
  { icon: <FiShield size={16} />, t: "No watermark, no ads", d: "Clean codes you fully own. We never stamp a logo or inject ads into your scan flow." },
  { icon: <FiCheck size={16} />, t: "No signup, no credit card", d: "Open the tool and go. We never ask for a card 'to start a free trial.'" },
  { icon: <FiEye size={16} />, t: "Private by design", d: "QR and most PDF/image tools run entirely in your browser. The few that use a server — like PDF compress — say so right on their page." },
  /* M151. This card used to be headed "Free features others charge for" and
     listed vector SVG, bulk CSV, a design studio and 15 languages. The study
     measured exactly ONE of those against other vendors (vector); the other
     three asserted something about competitors that nobody had checked — the
     same defect M148 removed from the table, surviving one card higher up.
     The comparative clause is now the measured one and reads COUNTS; the rest
     are stated as what QRix includes, which is a claim about us alone.
     The language count is deliberately "navigation": SITE_LANGS is 15 and
     TopNav + the homepage really do render all 15, but tool UI copy is only
     EN/RU/UZ (M149/M150), so an unqualified "15 languages" would overstate it. */
  { icon: <FiArrowRight size={16} />, t: "Vector, bulk and studio — free", d: `Print-ready SVG export, bulk CSV generation and the QR design studio cost nothing here, with navigation in ${SITE_LANGS.length} languages. Vector is the one we measured against others: ${COUNTS.vectorPaywalled} of ${COUNTS.total} paywall it.` },
];

/* Every "others" cell below is a COUNT out of the 20 generators in
   lib/qr-generator-study.ts, derived from that dataset rather than typed here.
   Before M148 this table held invented ranges ("~100–500, then the code dies",
   "1–9 languages") that no one had measured. Rows we did not measure were
   deleted rather than rewritten — a comparison row with nothing behind it is
   the exact thing this page accuses other vendors of. */
const ROWS: { label: string; qrix: string; others: string; othersBad?: boolean }[] = [
  { label: "Do your codes expire?", qrix: "Never (static codes are permanent)", others: `${COUNTS.limited} of ${COUNTS.total} can switch a free code off`, othersBad: true },
  { label: "Scan limits", qrix: "Unlimited", others: `${COUNTS.scanCapped} of ${COUNTS.total} cap free-tier scans`, othersBad: true },
  { label: "Ads or watermark on free codes", qrix: "Never", others: `${COUNTS.branded} of ${COUNTS.total} brand what your scanner sees`, othersBad: true },
  { label: "Account / signup", qrix: "Not required", others: `${COUNTS.accountRequired} of ${COUNTS.total} require one`, othersBad: true },
  { label: "Vector SVG / print export", qrix: "Free", others: `${COUNTS.vectorPaywalled} of ${COUNTS.total} paywall it`, othersBad: true },
  { label: "Your files & data", qrix: "Stay on your device", others: "Varies — check each tool's own page", othersBad: false },
];

const FAQS = [
  { q: "Is QRix really free with no catch?", a: "Yes. Every generator and tool is free with no watermark, no signup and no credit card. There's an optional Pro plan for advanced dynamic-QR analytics and higher limits, but the free tools are genuinely free — not a trial that charges you later." },
  { q: "Will my QR code stop working after a while?", a: "No. A static QR code stores its data inside the code itself, so it works forever — even offline, even if QRix disappeared tomorrow. There's nothing on our servers to 'switch off,' which is exactly the trap other generators use." },
  { q: "Do you cap how many times my code can be scanned?", a: "No. There are no scan limits on your codes. The horror story of a menu QR dying on a busy Saturday because it hit a hidden scan cap simply can't happen here." },
  { q: "Do I need to give a credit card?", a: "Never for the free tools. We don't run 'free trials' that quietly convert into a subscription." },
  { q: "Are my files or links uploaded to your servers?", a: "Most tools run entirely in your browser, so your files stay on your device. A few need a server to work — PDF compress and the best-quality PDF-to-Word mode — and each of those says so on its own page. Dynamic QR codes (optional, for analytics) store only the destination link you choose." },
  { q: "Can I download a print-ready vector (SVG)?", a: "Yes, for free. Export crisp SVG or PNG at any size — ideal for packaging, signage and posters that need to stay sharp." },
];

export default function FreeForeverPage() {
  return (
    <main className="max-w-4xl mx-auto px-5 py-12 lg:py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Free forever", path: "/free-forever" }]),
          faqLd(FAQS),
        ])}
      />

      {/* Hero */}
      <header className="text-center mb-12">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
          // ACTUALLY FREE
        </p>
        <h1 className="font-display font-extrabold leading-[1.05]" style={{ color: "var(--text)", fontSize: "clamp(2rem,5vw,3.4rem)" }}>
          QR codes that never expire.<br />No tricks.
        </h1>
        <p className="mt-4 text-[16px] max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
          We read the pricing and FAQ pages of {COUNTS.total} &quot;free&quot; QR generators on {STUDY_DATE}.{" "}
          {COUNTS.limited} of them can switch a free code off — a trial that ends, a scan pool that runs out, or the
          vendor&apos;s own ad in front of your scanner.{" "}
          <Link href={STUDY_PATH} className="underline underline-offset-4" style={{ color: "var(--primary-bright)" }}>
            See all {COUNTS.total}, with the source page for every row
          </Link>
          .
        </p>
        <div className="flex flex-wrap justify-center gap-3 mt-7">
          <Link href="/qr-tools" className="qx-btn-hero inline-flex">Make a free QR code <FiArrowRight size={15} /></Link>
          <Link href="/qr-tools/url" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold"
            style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            Dynamic QR + analytics <FiArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* Promises */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14" aria-label="Our promise">
        {PROMISES.map((p) => (
          <div key={p.t} className="qx-card p-5">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
              style={{ background: "var(--primary-dim)", color: "var(--primary-bright)", border: "1px solid var(--border-hover)" }}>
              {p.icon}
            </span>
            <h2 className="text-[15px] font-bold" style={{ color: "var(--text)" }}>{p.t}</h2>
            <p className="text-[13px] mt-1.5 leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.d}</p>
          </div>
        ))}
      </section>

      {/* Comparison */}
      <section className="mb-14" aria-label="QRix vs other free generators">
        <h2 className="font-display text-2xl lg:text-3xl font-bold text-center mb-6" style={{ color: "var(--text)" }}>
          QRix vs a typical &quot;free&quot; generator
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
            <thead>
              <tr>
                <th className="p-3 text-[12px] font-bold uppercase tracking-wide" style={{ color: "var(--text-faint)" }}></th>
                <th className="p-3 text-center text-[13px] font-extrabold rounded-t-xl" style={{ color: "#0e0e0e", background: "var(--grad-primary)" }}>QRix</th>
                <th className="p-3 text-center text-[13px] font-bold" style={{ color: "var(--text-muted)" }}>Typical &quot;free&quot; tool</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={r.label} style={{ background: i % 2 ? "var(--surface)" : "transparent" }}>
                  <td className="p-3 text-[13.5px] font-semibold" style={{ color: "var(--text)" }}>{r.label}</td>
                  <td className="p-3 text-center text-[13px]" style={{ background: "color-mix(in srgb, var(--primary-bright) 8%, transparent)" }}>
                    <span className="inline-flex items-center gap-1.5 font-bold" style={{ color: "var(--text)" }}>
                      <FiCheck size={14} style={{ color: "#22c55e" }} /> {r.qrix}
                    </span>
                  </td>
                  <td className="p-3 text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
                    <span className="inline-flex items-center gap-1.5">
                      {r.othersBad && <FiX size={14} style={{ color: "var(--danger)" }} />} {r.others}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[11.5px] mt-3 text-center" style={{ color: "var(--text-faint)" }}>
          Counts are from our own reading of {COUNTS.total} generators&apos; live pricing and FAQ pages on {STUDY_DATE}.
          No accounts were created, so each count is what those vendors state about themselves —{" "}
          <Link href={STUDY_PATH} className="underline underline-offset-4">the working, vendor by vendor</Link>.
        </p>
      </section>

      {/* FAQ */}
      <section className="mb-12" aria-label="Frequently asked questions">
        <h2 className="font-display text-2xl font-bold mb-5" style={{ color: "var(--text)" }}>Straight answers</h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div key={f.q} className="qx-card p-5">
              <h3 className="font-bold text-[15px] mb-1.5" style={{ color: "var(--text)" }}>{f.q}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="qx-card p-7 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,143,32,.16), transparent 70%)" }} />
        <div className="relative">
          <h2 className="font-display text-xl lg:text-2xl font-bold" style={{ color: "var(--text)" }}>Make a QR code the honest way</h2>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Free, permanent, private — no signup, no watermark, no surprises.
          </p>
          <Link href="/qr-tools" className="qx-btn-hero inline-flex mt-5">Start free <FiArrowRight size={15} /></Link>
        </div>
      </div>
    </main>
  );
}
