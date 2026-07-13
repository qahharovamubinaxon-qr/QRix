"use client";

import Link from "next/link";
import { FiChevronRight, FiInfo, FiArrowRight, FiShield, FiZap, FiGift, FiSmartphone, FiGlobe, FiSlash } from "react-icons/fi";
import GlobalFileDrop from "@/components/GlobalFileDrop";
import AdSlot from "@/components/AdSlot";
import FavoriteButton from "@/components/FavoriteButton";
import RecordVisit from "@/components/RecordVisit";
import { usePathname } from "next/navigation";

function ToolFavorite({ title, group }: { title: string; group: string }) {
  const pathname = usePathname();
  return <FavoriteButton tool={{ href: pathname || "", title, group }} />;
}

type Step = { title: string; desc: string };
type Faq = { q: string; a: string };

// Universal trust points — the "why it's good" that applies to every QRix tool.
const WHY_QRIX = [
  { icon: <FiGift size={16} />, title: "100% free", desc: "Every tool, unlimited — no paywall.", color: "#34d399" },
  { icon: <FiShield size={16} />, title: "Private by design", desc: "Runs in your browser; files never upload.", color: "#22d3ee" },
  { icon: <FiSlash size={16} />, title: "No watermark", desc: "Clean output you fully own.", color: "#a78bfa" },
  { icon: <FiZap size={16} />, title: "Instant", desc: "No queue, no waiting on a server.", color: "#ff7a32" },
  { icon: <FiSmartphone size={16} />, title: "No signup", desc: "Just open the page and go.", color: "#f472b6" },
  { icon: <FiGlobe size={16} />, title: "Works everywhere", desc: "Any modern browser, any device.", color: "#60a5fa" },
];

export default function ToolPageShell({
  category,
  categoryHref,
  title,
  emoji,
  grad,
  intro,
  about,
  steps,
  faqs,
  useCases,
  children,
}: {
  category: string;
  categoryHref: string;
  title: string;
  emoji: string;
  grad: string;
  intro: string;
  about: string;
  steps: Step[];
  faqs?: Faq[];
  useCases?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto p-5 lg:p-8">
      <GlobalFileDrop />
      <RecordVisit title={title} group={category} />
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs mb-5" style={{ color: "var(--text-muted)" }}>
        <Link href="/dashboard" className="hover:opacity-80">Dashboard</Link>
        <FiChevronRight size={12} />
        <Link href={categoryHref} className="hover:opacity-80">{category}</Link>
        <FiChevronRight size={12} />
        <span style={{ color: "var(--text)" }}>{title}</span>
      </div>

      {/* Hero */}
      <div className="qx-card qx-rise p-7 mb-7 relative overflow-hidden">
        <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(124,58,237,.2), transparent 70%)" }} />
        <div className="relative flex items-start gap-4">
          <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shrink-0"
            style={{ background: grad, boxShadow: "0 12px 32px rgba(124,58,237,.35)" }}>
            {emoji}
          </span>
          <div className="flex-1">
            <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>{title}</h1>
            <p className="mt-2 text-sm max-w-xl" style={{ color: "var(--text-muted)" }}>{intro}</p>
          </div>
          <ToolFavorite title={title} group={category} />
        </div>
      </div>

      {/* Tool */}
      <div className="qx-rise qx-rise-1">{children}</div>

      {/* In-content ad (renders only when AdSense is configured) */}
      <AdSlot slot="0000000000" />

      {/* About + How-to */}
      <div className="grid lg:grid-cols-2 gap-6 mt-8">
        <div className="qx-card p-6">
          <h2 className="qx-title mb-3" style={{ color: "var(--text)" }}>
            <FiInfo size={16} style={{ color: "var(--primary-bright)" }} /> About this tool
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{about}</p>
        </div>

        <div className="qx-card p-6">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>How to use</h2>
          <div className="space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-3">
                <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                  style={{ background: "var(--grad-primary)" }}>
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-bold" style={{ color: "var(--text)" }}>{s.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Popular use cases (rendered when the tool provides them) */}
      {useCases && useCases.length > 0 && (
        <section className="qx-card p-6 mt-8" aria-label="Popular use cases">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Popular use cases</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-3">
            {useCases.map((u, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <FiArrowRight size={14} className="mt-1 shrink-0" style={{ color: "var(--primary-bright)" }} />
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{u}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Why QRix — universal trust strip */}
      <section className="mt-8" aria-label={`Why use ${title}`}>
        <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Why use QRix for this</h2>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {WHY_QRIX.map((w) => (
            <div key={w.title} className="qx-card p-4 flex items-start gap-3">
              <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${w.color} 14%, transparent)`, color: w.color, border: `1px solid color-mix(in srgb, ${w.color} 30%, transparent)` }}>
                {w.icon}
              </span>
              <div>
                <div className="text-[13.5px] font-bold" style={{ color: "var(--text)" }}>{w.title}</div>
                <div className="text-[11.5px] mt-0.5 leading-snug" style={{ color: "var(--text-muted)" }}>{w.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ (rendered when the tool provides questions; JSON-LD is emitted by the page) */}
      {faqs && faqs.length > 0 && (
        <section className="qx-card p-6 mt-8" aria-label="Frequently asked questions">
          <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Frequently asked questions</h2>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
            {faqs.map((f, i) => (
              <div key={i}>
                <h3 className="text-[14px] font-bold mb-1" style={{ color: "var(--text)" }}>{f.q}</h3>
                <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Closing CTA */}
      <div className="qx-card p-7 mt-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,143,32,.16), transparent 70%)" }} />
        <div className="relative">
          <span className="inline-flex w-14 h-14 rounded-2xl items-center justify-center text-3xl mb-3" style={{ background: grad }}>{emoji}</span>
          <h2 className="font-display text-xl lg:text-2xl font-bold" style={{ color: "var(--text)" }}>Ready to try {title}?</h2>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            It's free, private and works right in your browser — no signup, no watermark.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="qx-btn-hero inline-flex">Use the tool <FiArrowRight size={15} /></a>
            <Link href={categoryHref} className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
              Explore all {category} <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
