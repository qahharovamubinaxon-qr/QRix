"use client";

import { useEffect, useState } from "react";
import { FiMail, FiCheck, FiArrowRight } from "react-icons/fi";
import { type Lang } from "@/lib/lang";
import { loadHomeUi } from "@/lib/home-i18n";

type NL = { t: string; s: string; ph: string; btn: string; ok: string; err: string };
const T_BASE: Record<"en" | "ru" | "uz", NL> = {
  en: { t: "Stay in the loop", s: "New tools, guides and growth tips — once a month, no spam.", ph: "you@example.com", btn: "Subscribe", ok: "You're in! Check your inbox soon.", err: "Couldn't subscribe — try again." },
  ru: { t: "Будьте в курсе", s: "Новые инструменты и гайды — раз в месяц, без спама.", ph: "you@example.com", btn: "Подписаться", ok: "Готово! Скоро напишем.", err: "Не удалось — попробуйте ещё раз." },
  uz: { t: "Янгиликлардан хабардор бўлинг", s: "Янги асбоблар ва қўлланмалар — ойига бир марта, спамсиз.", ph: "you@example.com", btn: "Обуна бўлиш", ok: "Тайёр! Тез орада ёзамиз.", err: "Бўлмади — қайта уриниб кўринг." },
};
/* The other twelve languages arrive as a per-language chunk instead of being
 * merged in at module scope, which used to import all twelve (M160). */
type BaseLang = "en" | "ru" | "uz";
const isBaseLang = (l: string): l is BaseLang => l === "en" || l === "ru" || l === "uz";

export default function NewsletterSection({ lang }: { lang: Lang }) {
  const [extra, setExtra] = useState<NL | null>(null);

  useEffect(() => {
    if (isBaseLang(lang)) { setExtra(null); return; }
    let alive = true;
    loadHomeUi(lang)
      .then((ui) => { if (alive && ui) setExtra(ui.newsletter); })
      .catch(() => {});
    return () => { alive = false; };
  }, [lang]);

  const t = (isBaseLang(lang) ? T_BASE[lang] : extra) || T_BASE.en;
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "ok" | "err">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return;
    setState("busy");
    try {
      const r = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setState(r.ok ? "ok" : "err");
      if (r.ok) setEmail("");
    } catch {
      setState("err");
    }
  }

  return (
    <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-24 lg:pb-32" aria-label={t.t}>
      <div className="qx-card relative overflow-hidden p-10 lg:p-14 text-center" data-reveal="scale">
        <div className="absolute inset-0 pointer-events-none" aria-hidden
          style={{ background: "radial-gradient(600px circle at 50% -10%, color-mix(in srgb, var(--primary) 14%, transparent), transparent 70%)" }} />
        <FiMail size={28} className="mx-auto mb-4 relative" style={{ color: "var(--primary-bright)" }} />
        <h2 className="font-display text-3xl lg:text-4xl font-extrabold relative" style={{ color: "var(--text)" }}>{t.t}</h2>
        <p className="mt-3 text-sm max-w-md mx-auto relative" style={{ color: "var(--text-muted)" }}>{t.s}</p>

        {state === "ok" ? (
          <p className="mt-7 inline-flex items-center gap-2 text-sm font-bold relative" style={{ color: "var(--primary-bright)" }}>
            <FiCheck size={16} /> {t.ok}
          </p>
        ) : (
          <form onSubmit={submit} className="mt-7 flex flex-col sm:flex-row gap-3 max-w-md mx-auto relative">
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t.ph} aria-label="Email"
              className="qx-auth-input flex-1 !py-3 !rounded-full !px-5 text-center sm:text-left"
            />
            <button type="submit" disabled={state === "busy"} className="qx-btn-hero !py-3 !px-6 justify-center disabled:opacity-60" data-magnetic>
              {state === "busy" ? "…" : <>{t.btn} <FiArrowRight size={15} /></>}
            </button>
          </form>
        )}
        {state === "err" && <p className="mt-3 text-[12px] relative" style={{ color: "var(--danger)" }}>{t.err}</p>}
      </div>
    </section>
  );
}
