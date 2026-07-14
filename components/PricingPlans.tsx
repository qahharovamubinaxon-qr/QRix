"use client";

import { useState } from "react";
import Link from "next/link";
import { FiCheck, FiZap, FiShield, FiLock, FiTrendingUp } from "react-icons/fi";
import UpgradeButton from "@/components/UpgradeButton";
import { PLANS, yearlySavingPct } from "@/lib/plans";

/* CRO pricing (Mission 19): monthly/yearly toggle with animated savings,
   recommended plan spotlight, comparison rows, trust strip.

   The plans themselves live in lib/plans.ts, which mirrors the server catalog
   (lib/server/billing PLANS) — this file used to keep its own copy, and the
   homepage kept a third, which is how the homepage ended up advertising prices
   that did not match checkout. */

/** The best saving any plan offers, for the toggle's badge. Pro saves 20%,
    Business and Enterprise 17% — the badge used to hardcode 20% for all of them. */
const BEST_SAVING = Math.max(...PLANS.map(yearlySavingPct));

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
            style={{ background: "rgba(74,222,128,.14)", color: "#4ade80" }}>Save up to {BEST_SAVING}%</span>
        </span>
      </div>

      {/* Plans */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch" data-reveal data-stagger>
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
                /* "2 months free" was only true of Business and Enterprise (490/49 = 10
                   months). Pro's year is 9.6 months of its monthly rate, so state the
                   saving each plan actually gives. */
                <p className="text-[11px] -mt-4 mb-4" style={{ color: "#4ade80" }}>
                  Billed ${p.yearly}/year — save {yearlySavingPct(p)}%
                </p>
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
                    ? <UpgradeButton className="qx-btn-hero w-full justify-center" plan="pro" interval={yearly ? "year" : "month"} />
                    : p.id === "business"
                      ? <UpgradeButton className="qx-btn w-full justify-center !text-sm font-bold" label={p.cta} plan="business" interval={yearly ? "year" : "month"} />
                      : <Link href="/contact" className="qx-btn-hero-ghost w-full justify-center !text-sm">{p.cta}</Link>}
              </div>
              {(p.id === "pro" || p.id === "business") && <p className="text-[10.5px] text-center mt-2.5" style={{ color: "var(--text-faint)" }}>14-day free trial · cancel anytime</p>}
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
