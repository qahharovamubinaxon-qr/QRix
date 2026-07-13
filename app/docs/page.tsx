import Link from "next/link";
import { FiArrowRight, FiChevronRight, FiCode, FiHelpCircle } from "react-icons/fi";
import { pageMeta, jsonLd, breadcrumbLd } from "@/lib/seo";
import { DOC_PAGES } from "@/lib/docs-content";

export const metadata = pageMeta({
  title: "Documentation — How QRix Works",
  description:
    "Product documentation for QRix: how the on-device tools work, QR codes explained, PDF and image guides, and how we handle privacy and security.",
  path: "/docs",
  keywords: ["qrix docs", "how qrix works", "qr codes explained", "on-device tools", "qrix privacy"],
});

export default function DocsIndex() {
  return (
    <main className="max-w-5xl mx-auto px-5 py-14">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd(breadcrumbLd([
          { name: "Home", path: "/" },
          { name: "Documentation", path: "/docs" },
        ]))}
      />

      <nav className="flex items-center gap-2 text-xs mb-6" style={{ color: "var(--text-muted)" }}>
        <Link href="/" className="hover:opacity-80">Home</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>Documentation</span>
      </nav>

      <div className="mb-12">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
          // DOCUMENTATION
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold" style={{ color: "var(--text)" }}>Documentation</h1>
        <p className="mt-3 text-base max-w-2xl" style={{ color: "var(--text-muted)" }}>
          Everything about how QRix works — the on-device model, how QR codes and each tool category behave, and how we handle your data.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-5">
        {DOC_PAGES.map((d) => (
          <Link key={d.slug} href={`/docs/${d.slug}`} className="group qx-card qx-card-lift p-6 flex flex-col">
            <span className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl mb-4"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>{d.emoji}</span>
            <h2 className="font-display text-lg font-bold" style={{ color: "var(--text)" }}>{d.title}</h2>
            <p className="text-sm mt-1.5 flex-1" style={{ color: "var(--text-muted)" }}>{d.summary}</p>
            <span className="inline-flex items-center gap-1 text-[12px] font-bold mt-4 group-hover:translate-x-0.5 transition-transform" style={{ color: "var(--primary-bright)" }}>
              Read <FiArrowRight size={12} />
            </span>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-12">
        <Link href="/help" className="group qx-card qx-card-lift p-5 flex items-center gap-3">
          <FiHelpCircle size={20} style={{ color: "var(--primary-bright)" }} />
          <span>
            <span className="block text-[14px] font-bold" style={{ color: "var(--text)" }}>Help Center</span>
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>Quick answers to common questions</span>
          </span>
        </Link>
        <Link href="/developers" className="group qx-card qx-card-lift p-5 flex items-center gap-3">
          <FiCode size={20} style={{ color: "var(--primary-bright)" }} />
          <span>
            <span className="block text-[14px] font-bold" style={{ color: "var(--text)" }}>Developer API</span>
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>REST API, keys and webhooks</span>
          </span>
        </Link>
      </div>
    </main>
  );
}
