"use client";

/* GDPR / AdSense cookie consent (Mission 65). Consent Mode v2 defaults to
   "denied" (set in layout <head>); this banner lets the user grant or
   decline non-essential (ads/analytics) storage and updates gtag consent
   accordingly. The choice persists in localStorage as `qrix_consent`.

   It renders in the SERVER HTML and is hidden by CSS unless the pre-paint
   script in layout <head> found no stored choice and set data-consent="pending"
   on <html> (M135). It used to start at show=false and flip in an effect, so on
   a first visit the banner appeared only after hydration — and since it is the
   largest text block in the viewport, LCP waited for it: 2.25 s of element
   render delay on the tool templates, against a TTFB of ~0.2 s. Deciding
   visibility before paint keeps the returning-visitor case flash-free without
   putting the banner behind the JS bundle. */

import { useState } from "react";
import Link from "next/link";
import { FiShield } from "react-icons/fi";

type Consent = "granted" | "denied";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gtag?: (...args: any[]) => void;
  }
}

function apply(v: Consent) {
  try { localStorage.setItem("qrix_consent", v); } catch { /* ignore */ }
  window.gtag?.("consent", "update", {
    ad_storage: v,
    ad_user_data: v,
    ad_personalization: v,
    analytics_storage: v,
  });
}

export default function CookieConsent() {
  const [done, setDone] = useState(false);

  if (done) return null;

  const choose = (v: Consent) => {
    apply(v);
    // Drop the pre-paint flag too, so the banner cannot come back if this
    // subtree is re-rendered before the next navigation.
    try { document.documentElement.removeAttribute("data-consent"); } catch { /* ignore */ }
    setDone(true);
  };

  return (
    <div role="dialog" aria-label="Cookie consent" aria-live="polite"
      className="qx-consent fixed inset-x-3 bottom-3 z-[9999] mx-auto max-w-3xl rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4"
      style={{ background: "var(--surface-solid)", border: "1px solid var(--border-hover)", boxShadow: "0 20px 60px rgba(0,0,0,.4)", backdropFilter: "var(--glass-blur, blur(10px))" }}>
      <span className="w-10 h-10 rounded-xl hidden sm:flex items-center justify-center shrink-0"
        style={{ background: "var(--primary-dim)", color: "var(--primary-bright)", border: "1px solid var(--border-hover)" }}>
        <FiShield size={18} />
      </span>
      <p className="text-[12.5px] leading-relaxed flex-1" style={{ color: "var(--text-muted)" }}>
        We use essential cookies to run QRix, and — with your consent — analytics and advertising
        cookies (Google AdSense) to improve the site and show relevant ads. See our{" "}
        <Link href="/privacy" className="font-semibold underline" style={{ color: "var(--primary-bright)" }}>Privacy Policy</Link>.
      </p>
      <div className="flex gap-2 shrink-0">
        <button type="button" onClick={() => choose("denied")}
          className="px-4 py-2.5 rounded-xl text-[12.5px] font-bold"
          style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
          Decline
        </button>
        <button type="button" onClick={() => choose("granted")}
          className="px-5 py-2.5 rounded-xl text-[12.5px] font-bold"
          style={{ background: "var(--grad-primary)", color: "#0e0e0e" }}>
          Accept all
        </button>
      </div>
    </div>
  );
}
