"use client";

import { useState } from "react";
import Link from "next/link";
import { FiCheck, FiZap, FiShield, FiLock, FiTrendingUp } from "react-icons/fi";
import UpgradeButton from "@/components/UpgradeButton";

/* CRO pricing (Mission 19): monthly/yearly toggle with animated savings,
   recommended plan spotlight, comparison rows, trust strip. Mirrors the
   server plan catalog (lib/server/billing PLANS). */

const PLANS = [
  {
    id: "free", name: "Free", monthly: 0, yearly: 0,
    tagline: "Everything you need to start", cta: "Start creating — it's free",
    features: ["All 185+ tools, free forever", "QR codes with logo & colors", "On-device PDF / image / video tools", "60 AI credits every month", "3 free 3D generations", "Basic scan analytics"],
  },
  {
    id: "pro", name: "Pro", monthly: 5, yearly: 48, recommended: true,
    tagline: "For creators and small teams", cta: "Upgrade to Pro",
    features: ["Unlimited dynamic QR codes", "Real-time scan analytics", "1,000 AI credits / month", "Priority processing queue", "No ads, anywhere", "Custom branding — no QRix badge", "Email support"],
  },
  {
    id: "business", name: "Business", monthly: 49, yearly: 490,
    tagline: "Everything unlimited — for teams that scale", cta: "Start Business trial",
    features: ["Everything in Pro", "Unlimited AI credits", "Unlimited team seats & roles", "Unlimited API access + webhooks", "Unlimited API keys", "Unlimited dynamic QR & bulk", "Priority SLA support", "White-label — no QRix badge"],
  },
];

export default function PricingPlans() {
  const [yearly, setYearly] = useState(true);

  return (
    <>
      {/* Billing toggle */}
      <div className="flex items-center justify-center gap-3 mb-10" data-reveal>
        <span className="text-[13px] font-semibold" style={{ color: yearly ? "var(--text-faint)" : "var(--text)" }}>Monthly</span>
        <button onClick={() => setYearly(!yearly)} role="switch" aria-checked={yearly} aria-label="Bill yearly"
          className="relative w-14 h-7 rounded-full transition-colors"
          style={{ background: yearly ? "var(--grad-primary)" : "var(--surface-2)", border: "1px solid var(--border)" }}>
          <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform"
            style={{ left: 2, transform: yearly ? "translateX(26px)" : "translateX(0)" }} />
        </button>
        <span className="text-[13px] font-semibold" style={{ color: yearly ? "var(--text)" : "var(--text-faint)" }}>
          Yearly
          <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full align-middle"
            style={{ background: "rgba(74,222,128,.14)", color: "#4ade80" }}>Save 20%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-5 items-stretch" data-reveal data-stagger>
        {PLANS.map((p) => {
          const price = yearly ? (p.yearly / 12) : p.monthly;
          return (
            <div key={p.id} className="qx-card p-7 flex flex-col relative overflow-hidden"
              style={p.recommended ? { border: "1.5px solid var(--primary)", boxShadow: "var(--el-3), var(--el-glow)", transform: "scale(1.02)" } : undefined}>
              {p.recommended && (
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
                  style={{ position: "absolute", top: 18, right: 18, background: "var(--grad-primary)", color: "#0b0b0b" }}>
                  RECOMMENDED
                </span>
              )}
              <h2 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{p.name}</h2>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--text-faint)" }}>{p.tagline}</p>
              <div className="mt-4 mb-6 flex items-baseline gap-1.5">
                <span className="font-display text-[42px] leading-none font-extrabold qx-stat-num" style={{ color: "var(--text)" }}>
                  ${price % 1 ? price.toFixed(2) : price}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>/ mo</span>
                {yearly && p.monthly > 0 && (
                  <span className="text-[11px] line-through ml-1" style={{ color: "var(--text-faint)" }}>${p.monthly}</span>
                )}
              </div>
              {yearly && p.yearly > 0 && (
                <p className="text-[11px] -mt-4 mb-4" style={{ color: "#4ade80" }}>Billed ${p.yearly}/year — 2 months free</p>
              )}
              <ul className="space-y-2.5 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13.5px]" style={{ color: p.recommended ? "var(--text)" : "var(--text-muted)" }}>
                    <FiCheck size={15} className="mt-0.5 shrink-0" style={{ color: "var(--primary-bright)" }} />{f}
                  </li>
                ))}
              </ul>
              <div className="mt-7">
                {p.id === "free"
                  ? <Link href="/qr-tools" className="qx-btn-hero-ghost w-full justify-center !text-sm">{p.cta}</Link>
                  : p.id === "pro"
                    ? <UpgradeButton className="qx-btn-hero w-full justify-center" />
                    : <Link href="/register?plan=business" className="qx-btn w-full justify-center !text-sm font-bold">{p.cta}</Link>}
              </div>
              {p.id !== "free" && <p className="text-[10.5px] text-center mt-2.5" style={{ color: "var(--text-faint)" }}>14-day free trial · cancel anytime</p>}
            </div>
          );
        })}
      </div>

      {/* Trust strip */}
      <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-12 text-[12px] font-semibold" style={{ color: "var(--text-muted)" }} data-reveal>
        <span className="inline-flex items-center gap-1.5"><FiLock size={13} style={{ color: "var(--primary-bright)" }} /> Secure payments by Stripe</span>
        <span className="inline-flex items-center gap-1.5"><FiShield size={13} style={{ color: "var(--primary-bright)" }} /> Files processed on your device</span>
        <span className="inline-flex items-center gap-1.5"><FiZap size={13} style={{ color: "var(--primary-bright)" }} /> Cancel anytime, keep Free forever</span>
        <span className="inline-flex items-center gap-1.5"><FiTrendingUp size={13} style={{ color: "var(--primary-bright)" }} /> 120,000+ QR codes created</span>
      </div>
    </>
  );
}
