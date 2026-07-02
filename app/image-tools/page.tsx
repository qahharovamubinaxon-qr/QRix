"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FiScissors, FiType, FiMinimize2, FiMaximize2, FiRefreshCw,
  FiImage, FiShield, FiZap, FiCheckCircle, FiArrowRight,
  FiChevronRight, FiHome, FiLink as FiLinkIcon, FiWifi, FiUser, FiFileText,
} from "react-icons/fi";

type Tool = {
  href: string; title: string; desc: string; info: string;
  icon: React.ReactNode; grad: string; badge?: string; popularity: number;
};

const TOOLS: Tool[] = [
  { href: "/image-tools/remove-bg", title: "Background Remover", desc: "Remove image background automatically with AI.", info: "Get a clean transparent PNG in seconds. Perfect for product photos, logos and profile pictures. Runs privately in your browser.", icon: <FiScissors size={20} />, grad: "linear-gradient(135deg,#7c3aed,#a855f7)", badge: "AI", popularity: 100 },
  { href: "/image-tools/image-to-text", title: "Image to Text (OCR)", desc: "Extract text from images and screenshots.", info: "Reads text from photos in English, Russian & Uzbek. Great for receipts, documents and notes. Copy or download as .txt.", icon: <FiType size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)", badge: "AI", popularity: 95 },
  { href: "/image-tools/compress", title: "Compress Image", desc: "Reduce image file size without losing quality.", info: "Shrink JPG, PNG and WebP files by up to 80% while keeping them sharp. Ideal for faster websites and email attachments.", icon: <FiMinimize2 size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)", popularity: 90 },
  { href: "/image-tools/resize", title: "Resize Image", desc: "Change image dimensions to exact pixels.", info: "Set a precise width and height with optional aspect-ratio lock. Perfect for social media, thumbnails and avatars.", icon: <FiMaximize2 size={20} />, grad: "linear-gradient(135deg,#2563eb,#60a5fa)", popularity: 80 },
  { href: "/image-tools/convert", title: "Convert Image", desc: "Convert between JPG, PNG and WebP.", info: "Switch formats in one click. JPG for photos, PNG for transparency, WebP for the smallest web-ready files.", icon: <FiRefreshCw size={20} />, grad: "linear-gradient(135deg,#db2777,#f472b6)", popularity: 75 },
  { href: "/image-tools/upscale", title: "Image Enhancer", desc: "Upscale and sharpen blurry images.", info: "Make small or blurry photos larger and clearer with 2×–4× AI-style upscaling and smart sharpening. Great for thumbnails and old photos.", icon: <FiZap size={20} />, grad: "linear-gradient(135deg,#f59e0b,#fbbf24)", badge: "New", popularity: 85 },
  { href: "/image-tools/exif-remover", title: "EXIF Remover", desc: "Strip GPS & metadata from photos.", info: "Photos secretly carry GPS location, device model and timestamps. Remove all hidden metadata before sharing — private, in your browser.", icon: <FiShield size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)", badge: "New", popularity: 88 },
];

const SIDE_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: <FiHome size={15} /> },
  { href: "/url-qr", label: "URL QR", icon: <FiLinkIcon size={15} /> },
  { href: "/wifi-qr", label: "WiFi QR", icon: <FiWifi size={15} /> },
  { href: "/vcard-qr", label: "vCard / NFC", icon: <FiUser size={15} /> },
];

export default function ImageToolsPage() {
  const [sort, setSort] = useState<"popular" | "az">("popular");
  const sorted = [...TOOLS].sort((a, b) => sort === "popular" ? b.popularity - a.popularity : a.title.localeCompare(b.title));

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
        <div className="rounded-2xl p-4 mt-auto" style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7 60%,#6366f1)" }}>
          <div className="font-display font-bold text-white text-sm">🚀 Upgrade to Pro</div>
          <p className="text-[11px] mt-1" style={{ color: "rgba(255,255,255,.75)" }}>Unlock all features, remove limits.</p>
          <Link href="/register" className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold" style={{ background: "rgba(255,255,255,.95)", color: "#6d28d9" }}><FiZap size={12} /> Upgrade Now</Link>
        </div>
      </aside>

      <main className="flex-1 min-w-0 p-5 lg:p-7 max-w-[1500px]">
        <div className="flex items-center gap-2 text-xs mb-5" style={{ color: "var(--text-muted)" }}>
          <Link href="/dashboard" className="hover:opacity-80">Dashboard</Link>
          <FiChevronRight size={12} />
          <span style={{ color: "var(--text)" }}>Image Tools</span>
        </div>

        <div className="qx-card qx-rise p-7 lg:p-8 relative overflow-hidden mb-8">
          <div className="absolute inset-y-0 right-0 w-1/2 pointer-events-none" style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(168,85,247,.25), transparent 70%)" }} />
          <div className="absolute right-12 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none">
            <div className="w-32 h-32 rounded-3xl rotate-12" style={{ background: "linear-gradient(135deg,#a855f7,#d946ef)", opacity: .8, boxShadow: "0 20px 50px rgba(168,85,247,.4)" }} />
            <div className="w-32 h-32 rounded-3xl absolute top-0 -left-8 -rotate-6" style={{ background: "linear-gradient(135deg,#7c3aed,#3b82f6)", opacity: .55 }} />
          </div>
          <div className="relative flex items-start gap-5">
            <span className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shrink-0" style={{ background: "linear-gradient(135deg,#9333ea,#d946ef)", boxShadow: "0 12px 32px rgba(147,51,234,.4)" }}><FiImage size={28} /></span>
            <div>
              <h1 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>Image Tools</h1>
              <p className="mt-2 text-sm max-w-md" style={{ color: "var(--text-muted)" }}>Powerful AI-powered image tools to remove backgrounds, extract text, compress, resize and convert — all in your browser.</p>
            </div>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-4 mt-7 pt-6" style={{ borderTop: "1px solid var(--border)" }}>
            {[
              { icon: <FiShield size={16} />, title: "100% Private", sub: "Runs in your browser", color: "#a78bfa" },
              { icon: <FiZap size={16} />, title: "AI Powered", sub: "Smart & instant", color: "#22d3ee" },
              { icon: <FiCheckCircle size={16} />, title: "No Limits", sub: "Free & unlimited", color: "#34d399" },
            ].map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `color-mix(in srgb, ${f.color} 14%, transparent)`, color: f.color }}>{f.icon}</span>
                <div>
                  <div className="text-xs font-bold" style={{ color: "var(--text)" }}>{f.title}</div>
                  <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-2xl font-bold" style={{ color: "var(--text)" }}>All Image Tools</h2>
          <div className="flex items-center gap-2 text-xs" style={{ color: "var(--text-muted)" }}>
            Sort by:
            <select value={sort} onChange={(e) => setSort(e.target.value as "popular" | "az")} className="!text-xs !py-1.5 !px-3 font-semibold cursor-pointer" style={{ color: "var(--text)" }}>
              <option value="popular">Most Popular</option>
              <option value="az">A → Z</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {sorted.map((tool, i) => (
            <Link key={tool.title} href={tool.href} className={`group qx-card qx-card-lift p-6 relative qx-rise qx-rise-${(i % 4) + 1}`}>
              {tool.badge && (<span className="absolute top-4 right-4 text-[9px] font-bold px-2 py-0.5 rounded-full text-white" style={{ background: "var(--grad-primary)" }}>{tool.badge}</span>)}
              <span className="w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4" style={{ background: tool.grad, boxShadow: "0 6px 18px rgba(0,0,0,.25)" }}>{tool.icon}</span>
              <h3 className="text-base font-bold mb-1.5" style={{ color: "var(--text)" }}>{tool.title}</h3>
              <p className="text-xs font-medium mb-3" style={{ color: "var(--text-muted)" }}>{tool.desc}</p>
              <p className="text-[11px] leading-relaxed pt-3" style={{ color: "var(--text-faint)", borderTop: "1px solid var(--border)" }}>{tool.info}</p>
              <span className="flex items-center gap-1 text-xs font-bold mt-4 transition-transform group-hover:translate-x-1" style={{ color: "var(--primary-bright)" }}>Open tool <FiArrowRight size={13} /></span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
