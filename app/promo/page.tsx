import type { Metadata } from "next";
import Link from "next/link";
import { FiArrowRight, FiFilm, FiShield, FiZap } from "react-icons/fi";
import QrixPromoFilm from "@/components/QrixPromoFilm";
import { pageMeta, jsonLd, breadcrumbLd, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "QRix Brand Film — See the All-in-One Toolkit in Motion",
  description: "Watch the QRix promo: 185+ free, on-device tools for QR codes, PDFs, images, video and AI — no signup, no watermark. Grab the film in MP4 for Landscape, Story or Square, or make your own promo.",
  path: "/promo",
  keywords: ["QRix promo", "QRix brand film", "free online tools", "QR PDF image video AI tools", "all in one toolkit"],
});

export default function PromoPage() {
  return (
    <main className="max-w-5xl mx-auto px-5 lg:px-8 py-12 lg:py-16">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Brand Film", path: "/promo" }]),
          {
            "@context": "https://schema.org",
            "@type": "VideoObject",
            name: "QRix Brand Film",
            description: "QRix — 185+ free, on-device tools for QR codes, PDFs, images, video and AI.",
            thumbnailUrl: [`${SITE_URL}/scenes/bunny-hero.webp`],
            uploadDate: "2026-07-13",
            contentUrl: `${SITE_URL}/promo`,
          },
        ])}
      />

      <header className="text-center mb-10">
        <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-3" style={{ color: "var(--primary-bright)" }}>
          // QRIX BRAND FILM
        </p>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold" style={{ color: "var(--text)" }}>
          The whole toolkit, in motion
        </h1>
        <p className="mt-3 text-[15px] max-w-xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
          185+ free tools for QR codes, PDFs, images, video and AI — all on-device, no signup,
          no watermark. Play it, then download the MP4 for your site, YouTube, Reels or ads.
        </p>
      </header>

      <QrixPromoFilm />

      {/* trust row */}
      <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 mt-12 pt-8" style={{ borderTop: "1px solid rgba(255,106,19,0.25)" }}>
        {[
          { icon: <FiShield size={15} />, title: "100% private", sub: "Rendered on your device", color: "#22d3ee" },
          { icon: <FiZap size={15} />, title: "No watermark", sub: "Clean MP4 you own", color: "#ff7a32" },
          { icon: <FiFilm size={15} />, title: "Any format", sub: "Landscape · Story · Square", color: "#34d399" },
        ].map((f) => (
          <div key={f.title} className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${f.color} 13%, transparent)`, color: f.color, border: `1px solid color-mix(in srgb, ${f.color} 28%, transparent)` }}>
              {f.icon}
            </span>
            <div>
              <div className="text-xs font-bold" style={{ color: "var(--text)" }}>{f.title}</div>
              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{f.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* make your own */}
      <section className="qx-card p-7 mt-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(245,143,32,.16), transparent 70%)" }} />
        <div className="relative">
          <h2 className="font-display text-xl lg:text-2xl font-bold" style={{ color: "var(--text)" }}>Want one for your brand?</h2>
          <p className="text-sm mt-2 max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            The Promo Video Maker builds the same kind of animated promo from your own brand,
            headline, benefits and link — free and on-device.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-5">
            <Link href="/promo-video" className="qx-btn-hero inline-flex">Make your promo <FiArrowRight size={15} /></Link>
            <Link href="/qr-tools" className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold"
              style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
              Explore all tools <FiArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
