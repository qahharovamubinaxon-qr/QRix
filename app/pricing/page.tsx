import { pageMeta, jsonLd, breadcrumbLd, faqLd } from "@/lib/seo";
import PricingPlans from "@/components/PricingPlans";

export const metadata = pageMeta({
  title: "Pricing — Free forever, or go Pro",
  description: "QRix is free forever for all 185+ tools. Pro adds unlimited dynamic QR codes, 1,000 AI credits and priority processing — from $4/month billed yearly.",
  path: "/pricing",
  keywords: ["QRix pricing", "QR code pro", "dynamic QR subscription", "AI credits plans"],
});

const FAQS = [
  { q: "Is the Free plan really free forever?", a: "Yes. All 185+ tools stay free with no watermark and no signup. Paid plans only add scale: more AI credits, unlimited dynamic QR codes and priority processing." },
  { q: "What are credits?", a: "Credits meter AI-powered work (image generation 5, 3D models 20, video AI 10…). Free includes 60 per month, Pro 1,000, Business 5,000 — they refresh monthly." },
  { q: "Can I cancel anytime?", a: "Anytime, in one click from your account. You keep Pro until the period ends, then move to Free automatically — nothing is deleted." },
  { q: "Do you offer a trial?", a: "Every paid plan starts with a 14-day free trial. No charge until it ends." },
];

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-5 py-14 relative">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={jsonLd([
          breadcrumbLd([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }]),
          faqLd(FAQS),
        ])}
      />
      <div className="qx-aurora-bg" aria-hidden />

      <div className="text-center mb-10 relative" data-reveal>
        <span className="qx-badge-hero inline-flex mb-5"><span className="qx-badge-hero-dot" />14-day free trial on every paid plan</span>
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          Simple, honest pricing
        </h1>
        <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Every tool is free forever. Upgrade only when you need more AI credits,
          unlimited dynamic QR codes and priority speed.
        </p>
      </div>

      <PricingPlans />

      {/* FAQ */}
      <section className="max-w-2xl mx-auto mt-16" aria-label="Pricing FAQ" data-reveal>
        <h2 className="font-display text-2xl font-extrabold mb-5 text-center" style={{ color: "var(--text)" }}>Questions, answered</h2>
        {FAQS.map((f) => (
          <div key={f.q} className="qx-card p-5 mb-3">
            <h3 className="font-bold text-[14px] mb-1" style={{ color: "var(--text)" }}>{f.q}</h3>
            <p className="text-[13px] leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.a}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
