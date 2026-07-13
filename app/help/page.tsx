import Link from "next/link";
import { FiArrowRight, FiChevronRight, FiHelpCircle, FiMail, FiBookOpen } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd } from "@/lib/seo";
import { HELP_CATEGORIES } from "@/lib/help-content";

export const metadata = pageMeta({
  title: "Help Center — QRix Support & FAQ",
  description:
    "Answers to common questions about QRix: is it free, are my files private, how QR codes work, supported formats and more. Get help with every QRix tool.",
  path: "/help",
  keywords: ["qrix help", "qrix support", "qr code faq", "is qrix free", "are files private", "qrix help center"],
});

export default function HelpCenter() {
  const total = HELP_CATEGORIES.reduce((n, c) => n + c.articles.length, 0);
  // A few high-intent questions surfaced on the index.
  const popular = HELP_CATEGORIES.flatMap((c) => c.articles.slice(0, 1).map((a) => ({ ...a, cat: c.slug }))).slice(0, 6);

  return (
    <main className="max-w-5xl mx-auto px-5 py-14">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd(breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Help Center", path: "/help" },
        ]))}
      />

      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:opacity-80">Home</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>Help Center</span>
      </nav>

      <div className="text-center mb-12">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
          // HELP CENTER
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold" style={{ color: "var(--text)" }}>How can we help?</h1>
        <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          {total > 0 ? `${total} answers` : "Answers"} across every QRix tool — free, private and on-device by design.
        </p>
      </div>

      {/* Category grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {HELP_CATEGORIES.map((c) => (
          <Link key={c.slug} href={`/help/${c.slug}`} className="group qx-card qx-card-lift p-6 flex flex-col">
            <span className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>{c.emoji}</span>
            <h2 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>{c.title}</h2>
            <p className="text-sm mt-1.5 flex-1" style={{ color: "var(--text-muted)" }}>{c.blurb}</p>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold mt-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
              {c.articles.length} articles <FiArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>

      {/* Popular questions */}
      {popular.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold mb-5 flex items-center gap-2" style={{ color: "var(--text)" }}>
            <FiHelpCircle size={20} style={{ color: "var(--primary-bright)" }} /> Popular questions
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {popular.map((a, i) => (
              <Link key={i} href={`/help/${a.cat}`} className="group qx-card qx-card-lift p-5">
                <h3 className="font-bold text-[15px] leading-snug" style={{ color: "var(--text)" }}>{a.q}</h3>
                <p className="text-[13px] mt-1.5 line-clamp-2" style={{ color: "var(--text-muted)" }}>{a.a}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Still need help */}
      <section className="qx-card p-7 mt-14 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,143,32,.16), transparent 70%)" }} />
        <div className="relative">
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>Still need a hand?</h2>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>Browse the docs for deeper guides, or reach out and we'll help.</p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link href="/docs" className="qx-btn-hero inline-flex"><FiBookOpen size={15} /> Read the docs</Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
              <FiMail size={14} /> Contact us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
