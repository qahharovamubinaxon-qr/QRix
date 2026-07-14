"use client";

/* Homepage pricing — the four real plans, not a hand-typed summary of three.
   Names and prices come from lib/plans.ts, the same catalog /pricing reads, so
   the two pages cannot disagree again. Only the short marketing copy lives here,
   because a teaser says less than a pricing page and says it in three languages.

   The headline figure is the MONTHLY price. The old teaser printed the
   annual-prepay rate ($4, $40) under a "/mo" label, which undersells the monthly
   plan by a fifth without telling anyone a year is being committed to. The yearly
   rate is still here — on its own line, where it can be read as what it is. */

import Link from "next/link";
import { FiCheck, FiArrowRight } from "react-icons/fi";
import { PLANS, yearlySavingPct, type PlanId } from "@/lib/plans";
import type { Lang } from "@/lib/lang";

type Copy = { tagline: string; highlights: string[]; cta: string };

type TeaserCopy = {
  title: string; sub: string; popular: string; perMo: string;
  yearHint: (yr: number, pct: number) => string;
  compare: string;
  plans: Record<PlanId, Copy>;
};

/* Lang carries twelve locales; the homepage is written in three and falls the rest
   back to English. Partial + a required `en` says exactly that, and keeps the
   fallback below free of a non-null assertion. */
const I18N: Partial<Record<Lang, TeaserCopy>> & { en: TeaserCopy } = {
  en: {
    title: "Simple pricing",
    sub: "Everything starts free — upgrade only when you need scale.",
    popular: "MOST POPULAR",
    perMo: "/mo",
    yearHint: (yr, pct) => `or $${yr}/year — save ${pct}%`,
    compare: "Compare all features",
    plans: {
      free: {
        tagline: "Everything you need to start",
        highlights: ["All 185+ tools, forever", "60 AI credits every month", "3 free 3D generations", "Basic scan analytics"],
        cta: "Start free",
      },
      pro: {
        tagline: "For creators and small teams",
        highlights: ["Unlimited dynamic QR codes", "1,000 AI credits / month", "Real-time scan analytics", "No ads · custom branding"],
        cta: "Go Pro",
      },
      business: {
        tagline: "Everything unlimited",
        highlights: ["Unlimited AI credits", "Unlimited team seats & API", "Priority SLA support", "White-label — no QRix badge"],
        cta: "Start trial",
      },
      enterprise: {
        tagline: "Dedicated infrastructure",
        highlights: ["Everything in Business", "SSO / SAML", "99.9% uptime SLA", "Named support engineer"],
        cta: "Contact sales",
      },
    },
  },
  ru: {
    title: "Простые тарифы",
    sub: "Всё начинается бесплатно — платите, только когда нужен масштаб.",
    popular: "ПОПУЛЯРНЫЙ",
    perMo: "/мес",
    yearHint: (yr, pct) => `или $${yr}/год — экономия ${pct}%`,
    compare: "Сравнить все возможности",
    plans: {
      free: {
        tagline: "Всё для старта",
        highlights: ["185+ инструментов, навсегда", "60 AI-кредитов каждый месяц", "3 бесплатные 3D-генерации", "Базовая аналитика сканов"],
        cta: "Начать бесплатно",
      },
      pro: {
        tagline: "Для авторов и небольших команд",
        highlights: ["Безлимитные динамические QR", "1 000 AI-кредитов / месяц", "Аналитика в реальном времени", "Без рекламы · свой бренд"],
        cta: "Перейти на Pro",
      },
      business: {
        tagline: "Всё безлимитно",
        highlights: ["Безлимитные AI-кредиты", "Безлимит команды и API", "Приоритетная поддержка SLA", "White-label — без бейджа QRix"],
        cta: "Начать пробный период",
      },
      enterprise: {
        tagline: "Выделенная инфраструктура",
        highlights: ["Всё из Business", "SSO / SAML", "SLA 99,9% аптайма", "Персональный инженер"],
        cta: "Связаться с продажами",
      },
    },
  },
  uz: {
    title: "Оддий нархлар",
    sub: "Ҳаммаси бепул бошланади — кенгайиш керак бўлгандагина тўлайсиз.",
    popular: "ЭНГ ОММАБОП",
    perMo: "/ойига",
    yearHint: (yr, pct) => `ёки $${yr}/йил — ${pct}% тежанг`,
    compare: "Барча имкониятларни солиштириш",
    plans: {
      free: {
        tagline: "Бошлаш учун ҳаммаси бор",
        highlights: ["185+ восита, абадий бепул", "Ойига 60 AI кредит", "3 та бепул 3D генерация", "Асосий скан аналитикаси"],
        cta: "Бепул бошлаш",
      },
      pro: {
        tagline: "Ижодкорлар ва кичик жамоалар учун",
        highlights: ["Чексиз динамик QR кодлар", "Ойига 1 000 AI кредит", "Реал вақтда аналитика", "Рекламасиз · ўз брендингиз"],
        cta: "Pro'га ўтиш",
      },
      business: {
        tagline: "Ҳаммаси чексиз",
        highlights: ["Чексиз AI кредитлар", "Чексиз жамоа ва API", "Устувор SLA қўллаб-қувватлаш", "White-label — QRix белгисисиз"],
        cta: "Синовни бошлаш",
      },
      enterprise: {
        tagline: "Алоҳида инфратузилма",
        highlights: ["Business'даги ҳаммаси", "SSO / SAML", "99.9% ишлаш кафолати", "Шахсий муҳандис"],
        cta: "Сотув бўлими билан боғланиш",
      },
    },
  },
};

export default function PricingTeaser({ lang }: { lang: Lang }) {
  const t = I18N[lang] ?? I18N.en;

  return (
    <section data-scene="dusk" className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-24 relative" aria-label="Pricing">
      <div className="text-center mb-10 lg:mb-12" data-reveal>
        <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
          {t.title}
        </h2>
        <p className="mt-2.5 text-[14.5px]" style={{ color: "var(--text-muted)" }}>{t.sub}</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch" data-reveal data-stagger>
        {PLANS.map((p) => {
          const c = t.plans[p.id];
          const hot = !!p.recommended;

          return (
            <div key={p.id}
              className={`qx-card p-6 lg:p-7 flex flex-col relative overflow-hidden rounded-2xl${hot ? " qx-border-anim" : ""}`}
              style={hot ? { border: "1.5px solid var(--primary)", boxShadow: "var(--el-3), var(--el-glow)" } : undefined}>

              {hot && (
                <span className="absolute top-0 right-0 text-[9.5px] font-bold tracking-wider px-3 py-1.5 rounded-bl-xl"
                  style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>
                  {t.popular}
                </span>
              )}

              <h3 className="font-display text-lg font-extrabold" style={{ color: "var(--text)" }}>{p.name}</h3>
              <p className="text-[12px] mt-1 leading-snug min-h-[32px]" style={{ color: "var(--text-faint)" }}>{c.tagline}</p>

              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="font-display text-[40px] leading-none font-extrabold qx-stat-num" style={{ color: "var(--text)" }}>
                  ${p.monthly}
                </span>
                <span className="text-[13px] font-semibold" style={{ color: "var(--text-faint)" }}>{t.perMo}</span>
              </div>

              {/* The yearly rate, stated as a yearly rate — not disguised as a monthly one. */}
              <p className="text-[11.5px] mt-2 min-h-[18px]" style={{ color: p.yearly > 0 ? "#4ade80" : "transparent" }}>
                {p.yearly > 0 ? t.yearHint(p.yearly, yearlySavingPct(p)) : " "}
              </p>

              <ul className="space-y-2.5 mt-5 mb-6 flex-1">
                {c.highlights.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[13px] leading-snug"
                    style={{ color: hot ? "var(--text)" : "var(--text-muted)" }}>
                    <FiCheck size={14} className="mt-0.5 shrink-0" style={{ color: "var(--primary-bright)" }} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link href="/pricing"
                className={`${hot ? "qx-btn-hero" : "qx-btn-hero-ghost"} w-full justify-center !text-[13px] mt-auto`}>
                {c.cta} <FiArrowRight size={13} />
              </Link>
            </div>
          );
        })}
      </div>

      <div className="text-center mt-9">
        <Link href="/pricing" className="inline-flex items-center gap-1.5 text-[13px] font-bold"
          style={{ color: "var(--primary-bright)" }}>
          {t.compare} <FiArrowRight size={13} />
        </Link>
      </div>
    </section>
  );
}
