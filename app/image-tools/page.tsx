"use client";

/* Image Tools landing (Mission 58) — one professional studio page.
   The seven flagship tools now live INSIDE the studio grid as
   "Essentials"; the header speaks the site's era language: mono kicker,
   display type, quiet trust row over a single hairline. */

import Link from "next/link";
import ImageExpansionGrid from "@/components/image/ImageExpansionGrid";
import {
  FiImage, FiShield, FiZap, FiCheckCircle,
  FiChevronRight, FiHome, FiLink as FiLinkIcon, FiWifi, FiUser, FiFileText,
} from "react-icons/fi";

const SIDE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: <FiHome size={15} /> },
  { href: "/qr-tools/url", label: "URL QR", icon: <FiLinkIcon size={15} /> },
  { href: "/wifi-qr", label: "WiFi QR", icon: <FiWifi size={15} /> },
  { href: "/qr-tools/vcard", label: "vCard / NFC", icon: <FiUser size={15} /> },
];

export default function ImageToolsPage() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden lg:flex w-56 shrink-0 flex-col p-4 sticky top-16 max-h-[calc(100vh-4rem)] overflow-y-auto"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)" }}>
        <nav className="space-y-1">
          {SIDE_LINKS.map((l) => (<Link key={l.href} href={l.href} className="qx-navlink">{l.icon} {l.label}</Link>))}
          <div className="pt-4">
            <h3 className="text-[10px] uppercase font-bold mb-2 px-2 tracking-[0.12em]" style={{ color: "var(--text-faint)" }}>PDF Tools</h3>
            <Link href="/pdf-tools" className="qx-navlink"><FiFileText size={15} /> PDF Tools</Link>
          </div>
          <div className="pt-3">
            <h3 className="text-[10px] uppercase font-bold mb-2 px-2 tracking-[0.12em]" style={{ color: "var(--text-faint)" }}>Image Tools</h3>
            <span className="qx-navlink active"><FiImage size={15} /> Image Tools</span>
          </div>
        </nav>
        <div className="rounded-2xl p-4 mt-auto" style={{ background: "linear-gradient(135deg,#ff6a13,#e14e08)" }}>
          <div className="font-display font-bold text-white text-sm">🚀 Upgrade to Pro</div>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,.8)" }}>Unlock all features, remove limits.</p>
          <Link href="/register" className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold" style={{ background: "rgba(255,255,255,.95)", color: "#c2410c" }}><FiZap size={12} /> Upgrade Now</Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 lg:p-8 max-w-[1500px]">
        <div className="flex items-center gap-2 text-xs mb-8" style={{ color: "var(--text-muted)" }}>
          <Link href="/dashboard" className="hover:opacity-80">Dashboard</Link>
          <FiChevronRight size={12} />
          <span style={{ color: "var(--text)" }}>Image Tools</span>
        </div>

        {/* era-language header: kicker, display type, quiet trust row */}
        <header className="mb-10" data-reveal>
          <p className="qx-mono text-[11px] tracking-[0.28em] uppercase mb-4" style={{ color: "var(--primary-bright)" }}>
            // IMAGE TOOLS — 72 FREE · ON-DEVICE
          </p>
          <h1 className="font-display font-extrabold tracking-tight leading-[1.05]"
            style={{ color: "var(--text)", fontSize: "clamp(30px, 3.8vw, 48px)" }}>
            A full image studio
          </h1>
          <p className="mt-3 text-[14.5px] max-w-xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Remove backgrounds, extract text, compress, resize, convert, enhance — plus
            60+ studio tools for filters, adjustments and social formats. Everything runs
            in your browser; your photos never leave your device.
          </p>

          <div className="flex flex-wrap gap-x-10 gap-y-4 mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,106,19,0.25)" }}>
            {[
              { icon: <FiShield size={15} />, title: "100% Private", sub: "Runs in your browser", color: "#ff7a32" },
              { icon: <FiZap size={15} />, title: "AI Powered", sub: "Smart & instant", color: "#22d3ee" },
              { icon: <FiCheckCircle size={15} />, title: "No Limits", sub: "Free & unlimited", color: "#34d399" },
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
        </header>

        <ImageExpansionGrid />
      </main>
    </div>
  );
}
