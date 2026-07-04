import Link from "next/link";
import { FiCheck } from "react-icons/fi";
import { pageMeta } from "@/lib/seo";
import { PRO_PRICE_USD, PRO_FEATURES, FREE_FEATURES } from "@/lib/plans";
import UpgradeButton from "@/components/UpgradeButton";

export const metadata = pageMeta({
  title: "Pricing — Free forever, or go Pro",
  description: "QRix is free forever for all 55+ tools. Upgrade to Pro for unlimited dynamic QR codes, analytics and an ad-free experience.",
  path: "/pricing",
  keywords: ["QRix pricing", "QR code pro", "dynamic QR subscription"],
});

export default function PricingPage() {
  return (
    <main className="max-w-5xl mx-auto px-5 py-14">
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl lg:text-5xl font-extrabold" style={{ color: "var(--text)" }}>
          Simple, honest pricing
        </h1>
        <p className="mt-3 text-base max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
          Every tool is free forever. Go Pro only when you need unlimited dynamic QR codes and analytics.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 items-stretch">
        {/* Free */}
        <div className="qx-card p-8 flex flex-col">
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Free</h2>
          <div className="mt-2 mb-6">
            <span className="font-display text-4xl font-extrabold" style={{ color: "var(--text)" }}>$0</span>
            <span className="text-sm ml-1" style={{ color: "var(--text-muted)" }}>/ forever</span>
          </div>
          <ul className="space-y-3 flex-1">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
                <FiCheck size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary-bright)" }} />{f}
              </li>
            ))}
          </ul>
          <Link href="/qr-tools" className="qx-btn-hero-ghost w-full mt-8 justify-center">Start creating</Link>
        </div>

        {/* Pro */}
        <div className="qx-card p-8 flex flex-col relative overflow-hidden" style={{ border: "1.5px solid var(--primary)" }}>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full text-white" style={{ position: "absolute", top: 20, right: 20, zIndex: 3, background: "var(--grad-primary)", boxShadow: "0 4px 14px rgba(245,143,32,.4)" }}>
            MOST POPULAR
          </span>
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>Pro</h2>
          <div className="mt-2 mb-6">
            <span className="font-display text-4xl font-extrabold" style={{ color: "var(--text)" }}>${PRO_PRICE_USD}</span>
            <span className="text-sm ml-1" style={{ color: "var(--text-muted)" }}>/ month</span>
          </div>
          <ul className="space-y-3 flex-1">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-start gap-2.5 text-sm" style={{ color: "var(--text)" }}>
                <FiCheck size={16} className="mt-0.5 shrink-0" style={{ color: "var(--primary-bright)" }} />{f}
              </li>
            ))}
          </ul>
          <div className="mt-8">
            <UpgradeButton className="qx-btn-hero w-full justify-center" />
          </div>
        </div>
      </div>

      <p className="text-center text-xs mt-8" style={{ color: "var(--text-faint)" }}>
        Cancel anytime. Secure payments by Stripe. Prices in USD.
      </p>
    </main>
  );
}
