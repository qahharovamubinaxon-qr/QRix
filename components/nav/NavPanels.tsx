"use client";

/* The parts of TopNav that only exist after a hover or a tap.
 *
 * TopNav is mounted by the root layout, so everything it imports is in the eager
 * script set of all ~800 pages. M138 took its *imports* (the homepage copy
 * registry, the auth SDK, the search catalog); this file takes its *markup*.
 *
 * What lives here is picked by one rule — can a visitor who never moves the
 * mouse and never opens the burger see it? If no, it does not belong in the
 * eager set. That is the 50-entry DROPDOWNS mega-menu (each entry building a
 * react-icons element at module scope), the account menu body, and the mobile
 * menu's account grid: 24 of TopNav's 29 icons, reachable only by a deliberate
 * gesture. TopNav keeps the five icons that paint on arrival — globe, chevron,
 * user avatar, burger, close.
 *
 * The markup below is moved verbatim, not rewritten. A hydration split that also
 * restyles cannot be verified as a hydration split.
 *
 * Deliberately NOT here: the ten primary nav links (in both the desktop bar and
 * the mobile sheet). They are the site's navigation, and navigation that depends
 * on a second chunk resolving is navigation that can fail. Everything in this
 * file degrades to "a menu did not open", never to "the visitor is stuck".
 */

import Link from "next/link";
import {
  FiLogOut, FiLink, FiWifi, FiUser, FiMessageCircle, FiType, FiRefreshCw,
  FiLayers, FiScissors, FiMinimize2, FiLock, FiDroplet,
  FiZap, FiBarChart2, FiCamera, FiImage, FiMaximize2,
  FiGrid, FiPieChart, FiSettings, FiHeart, FiClock, FiPlay, FiFilm,
} from "react-icons/fi";

/* Defined here rather than in TopNav so TopNav can `import type` it — a type-only
 * import is erased at compile time, so the label strings stay eager while this
 * whole module stays lazy. */
export type NavStrings = {
  home: string; qr: string; pdf: string; image: string; dashboard: string;
  pricing: string; blog: string; ai: string; video: string; three: string;
  signin: string; signout: string; signup: string;
};

type DropdownItem = { href: string; label: string; desc: string; icon: React.ReactNode; color: string };

const DROPDOWNS: Record<string, DropdownItem[]> = {
  "/qr-tools": [
    { href: "/qr-tools/url",       label: "URL QR",      desc: "Any website link",     icon: <FiLink size={15}/>,         color: "#4f46e5" },
    { href: "/qr-tools/wifi",      label: "WiFi QR",     desc: "Share WiFi access",    icon: <FiWifi size={15}/>,         color: "#16a34a" },
    { href: "/qr-tools/vcard",     label: "vCard QR",    desc: "Digital business card",icon: <FiUser size={15}/>,         color: "#d97706" },
    { href: "/qr-tools/whatsapp",  label: "WhatsApp QR", desc: "Direct chat link",     icon: <FiMessageCircle size={15}/>,color: "#16a34a" },
    { href: "/link-in-bio",        label: "Link-in-Bio", desc: "All your links, one page", icon: <FiLink size={15}/>,      color: "#bba9ff" },
    { href: "/poster",             label: "QR Poster",   desc: "Printable 'Scan me' flyer", icon: <FiImage size={15}/>,    color: "#ff4d1c" },
    { href: "/bulk-qr",            label: "Bulk QR",     desc: "Many QR from CSV",     icon: <FiGrid size={15}/>,         color: "#bba9ff" },
    { href: "/animated-qr",        label: "Animated QR", desc: "QR video for Stories", icon: <FiPlay size={15}/>,         color: "#ff6a13" },
    { href: "/qr-art",             label: "AI QR Art",   desc: "Beautiful AI QR poster",icon: <FiImage size={15}/>,       color: "#7c3aed" },
    { href: "/barcode",            label: "Barcode",     desc: "EAN, UPC, Code 128…",  icon: <FiBarChart2 size={15}/>,    color: "#0e7490" },
    { href: "/qr-tools",           label: "All QR Tools",desc: "25+ QR types",         icon: <FiGrid size={15}/>,         color: "#ff4d1c" },
  ],
  "/pdf-tools": [
    { href: "/pdf-tools/merge",     label: "Merge PDF",   desc: "Combine multiple PDFs",icon: <FiLayers size={15}/>,    color: "#4f46e5" },
    { href: "/pdf-tools/split",     label: "Split PDF",   desc: "Extract pages",        icon: <FiScissors size={15}/>,  color: "#0891b2" },
    { href: "/pdf-tools/compress",  label: "Compress",    desc: "Reduce file size",     icon: <FiMinimize2 size={15}/>, color: "#16a34a" },
    { href: "/pdf-tools/protect",   label: "Protect PDF", desc: "Password protect",     icon: <FiLock size={15}/>,      color: "#bba9ff" },
    { href: "/pdf-tools/watermark", label: "Watermark",   desc: "Add text/image mark",  icon: <FiDroplet size={15}/>,   color: "#0891b2" },
    { href: "/pdf-tools",           label: "All PDF Tools",desc: "8+ PDF tools",        icon: <FiGrid size={15}/>,      color: "#ff4d1c" },
  ],
  "/image-tools": [
    { href: "/image-tools/remove-bg",    label: "Remove BG",   desc: "AI background remover",icon: <FiScissors size={15}/>,   color: "#bba9ff" },
    { href: "/image-tools/image-to-text",label: "Image to Text",desc: "Extract text (OCR)",  icon: <FiType size={15}/>,       color: "#0891b2" },
    { href: "/image-tools/upscale",      label: "AI Upscale",  desc: "Enhance resolution",   icon: <FiZap size={15}/>,        color: "#d97706" },
    { href: "/image-tools/compress",     label: "Compress",    desc: "Reduce image size",    icon: <FiMinimize2 size={15}/>,  color: "#16a34a" },
    { href: "/image-tools/crop-image",   label: "Crop Image",  desc: "Crop with presets",    icon: <FiMaximize2 size={15}/>,  color: "#84cc16" },
    { href: "/image-tools/social-media-resize", label: "Social Resize", desc: "Every platform size", icon: <FiImage size={15}/>, color: "#db2777" },
    { href: "/resize",                   label: "Resize to Size",desc: "1920×1080 · 4K · A4 · ID", icon: <FiMaximize2 size={15}/>, color: "#2563eb" },
    { href: "/convert",                  label: "Convert Format",desc: "PNG · JPG · WebP · AVIF", icon: <FiRefreshCw size={15}/>, color: "#7c3aed" },
    { href: "/image-tools",              label: "All Image Tools",desc: "70+ tools",          icon: <FiImage size={15}/>,      color: "#ff4d1c" },
  ],
  "/ai-tools": [
    { href: "/ai-tools/background-remover", label: "Background Remover", desc: "Transparent PNG in seconds", icon: <FiScissors size={15}/>, color: "#bba9ff" },
    { href: "/ai-tools/image-upscaler",     label: "Image Upscaler",     desc: "2×–4× enhancement",        icon: <FiZap size={15}/>,       color: "#ff4d1c" },
    { href: "/ai-tools/ocr",                label: "AI OCR",             desc: "Image → text",              icon: <FiType size={15}/>,      color: "#0891b2" },
    { href: "/ai-tools/speech-to-text",     label: "Speech to Text",     desc: "Live dictation",            icon: <FiCamera size={15}/>,    color: "#dc2626" },
    { href: "/ai-tools/logo-generator",     label: "Logo Generator",     desc: "Monograms & wordmarks",     icon: <FiImage size={15}/>,     color: "#ea580c" },
    { href: "/ai-tools/resume-builder",     label: "Resume Builder",     desc: "ATS-friendly PDF",          icon: <FiUser size={15}/>,      color: "#059669" },
    { href: "/ai-tools/qr-generator",       label: "AI QR",              desc: "Brand-styled QR codes",     icon: <FiGrid size={15}/>,      color: "#84cc16" },
    { href: "/ai-tools",                    label: "All AI Tools",       desc: "28 tools, one toolbox",     icon: <FiZap size={15}/>,       color: "#ff4d1c" },
  ],
  "/video-tools": [
    { href: "/downloader",                 label: "Video Downloader", desc: "TikTok, Instagram, VK…", icon: <FiPlay size={15}/>,   color: "#ff0050" },
    { href: "/promo-video",                label: "Promo Video",  desc: "Animated brand promo",   icon: <FiFilm size={15}/>,      color: "#ff6a13" },
    { href: "/video-tools/compress-video", label: "Compress",     desc: "Shrink 60-85%",          icon: <FiMinimize2 size={15}/>, color: "#84cc16" },
    { href: "/video-tools/trim-video",     label: "Trim",         desc: "Timeline handles",       icon: <FiScissors size={15}/>,  color: "#ff4d1c" },
    { href: "/video-tools/merge-videos",   label: "Merge",        desc: "Join clips",             icon: <FiLayers size={15}/>,    color: "#22d3ee" },
    { href: "/video-tools/video-to-gif",   label: "Video to GIF", desc: "Real GIF encoder",       icon: <FiImage size={15}/>,     color: "#f472b6" },
    { href: "/video-tools/extract-audio",  label: "Extract Audio",desc: "Video to MP3",           icon: <FiZap size={15}/>,       color: "#a78bfa" },
    { href: "/video-tools/video-thumbnail",label: "Thumbnail",    desc: "Native-res frame grab",  icon: <FiCamera size={15}/>,    color: "#bba9ff" },
    { href: "/video-tools/subtitle-editor",label: "SRT Editor",   desc: "Fix text and timing",    icon: <FiType size={15}/>,      color: "#34d399" },
    { href: "/video-tools",                 label: "All Video Tools", desc: "29 tools, one studio", icon: <FiGrid size={15}/>,      color: "#ff4d1c" },
  ],
  "/dashboard": [
    { href: "/dashboard",          label: "Overview",    desc: "Stats & analytics",    icon: <FiPieChart size={15}/>,   color: "#4f46e5" },
    { href: "/dashboard",          label: "My QR Codes", desc: "Manage all QR codes",  icon: <FiGrid size={15}/>,       color: "#ff4d1c" },
    { href: "/dashboard",          label: "Analytics",   desc: "Scans & locations",    icon: <FiBarChart2 size={15}/>,  color: "#16a34a" },
    { href: "/dashboard",          label: "Scanner",     desc: "Scan QR codes",        icon: <FiCamera size={15}/>,     color: "#bba9ff" },
    { href: "/dashboard",          label: "Dynamic QR",  desc: "Live editable links",  icon: <FiRefreshCw size={15}/>,  color: "#0891b2" },
    { href: "/dashboard",          label: "Settings",    desc: "Account & preferences",icon: <FiSettings size={15}/>,   color: "#6b7280" },
  ],
};

/* The hover mega-menu. `menu` is the DROPDOWNS key ("/qr-tools", …); an unknown
 * key renders nothing rather than throwing, because the caller reads it out of
 * the links table and a typo there should not take the header down. */
export function NavMegaMenu({ menu }: { menu: string }) {
  const items = DROPDOWNS[menu];
  if (!items) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 z-[200] w-[340px]"
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.25))" }}>
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: "var(--surface-solid)",
          border: "1px solid var(--border)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}>
        {/* arrow */}
        <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45"
          style={{ background: "var(--surface-solid)", borderLeft: "1px solid var(--border)", borderTop: "1px solid var(--border)" }}/>
        <div className="grid grid-cols-2 gap-0">
          {items.map((item) => (
            <Link key={item.href + item.label} href={item.href}
              className="flex items-start gap-3 px-4 py-3.5 transition-all group"
              style={{ borderBottom: "1px solid var(--border)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "var(--surface-hover)")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-transform group-hover:scale-110"
                style={{ background: `${item.color}18`, color: item.color }}>
                {item.icon}
              </span>
              <div>
                <div className="text-[12px] font-semibold leading-tight" style={{ color: "var(--text)" }}>{item.label}</div>
                <div className="text-[10px] mt-0.5 leading-tight" style={{ color: "var(--text-muted)" }}>{item.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

/* The account dropdown's contents. The positioned/styled wrapper stays in TopNav
 * so the panel's box is identical whether or not this chunk has landed. `email`
 * is passed as a plain string instead of the Supabase User so this module never
 * references the auth SDK's types — M138 moved that SDK off the eager path and
 * a stray `import type` here would be a quiet way to invite it back. */
export function AccountMenuBody({ t, signedIn, email, onNavigate, onSignOut }: {
  t: NavStrings;
  /* `signedIn` and `email` are separate on purpose: Supabase sessions do not all
   * carry an email (phone auth does not), so branching sign-in/sign-out on the
   * email string would offer a "Sign up" button to someone already signed in. */
  signedIn: boolean;
  email: string | null;
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {email && <div className="px-4 py-3 text-[12px] truncate" style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>{email}</div>}
      {[
        { href: "/dashboard", label: t.dashboard, icon: <FiPieChart size={15} /> },
        { href: "/workspace", label: "Workspace", icon: <FiGrid size={15} /> },
        { href: "/account", label: "Account", icon: <FiUser size={15} /> },
        { href: "/favorites", label: "Favorites", icon: <FiHeart size={15} /> },
        { href: "/history", label: "History", icon: <FiClock size={15} /> },
        { href: "/settings", label: "Settings", icon: <FiSettings size={15} /> },
      ].map((m) => (
        <Link key={m.href + m.label} href={m.href} onClick={onNavigate}
          className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold transition-colors"
          style={{ color: "var(--text)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
          <span style={{ color: "var(--text-faint)" }}>{m.icon}</span>{m.label}
        </Link>
      ))}
      <div style={{ borderTop: "1px solid var(--border)" }}>
        {signedIn
          ? <button onClick={() => { onNavigate(); onSignOut(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold" style={{ color: "var(--danger)" }}><FiLogOut size={15} /> {t.signout}</button>
          : <div className="grid grid-cols-2 gap-2 p-3">
              <Link href="/login" onClick={onNavigate} className="qx-btn-ghost !py-2 !text-[12px] justify-center">{t.signin}</Link>
              <Link href="/register" onClick={onNavigate} className="qx-btn !py-2 !text-[12px] justify-center">{t.signup}</Link>
            </div>}
      </div>
    </>
  );
}

/* The mobile sheet's account section — the icon grid below the primary links,
 * plus the sign-out / sign-in row. The primary links themselves stay in TopNav
 * (see the file header): on a phone they are the only navigation there is. */
export function MobileAccountSection({ t, signedIn, onNavigate, onSignOut }: {
  t: NavStrings;
  signedIn: boolean;
  onNavigate: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      <div className="mt-2 pt-2 grid grid-cols-2 gap-1" style={{ borderTop: "1px solid var(--border)" }}>
        {[
          { href: "/dashboard", label: t.dashboard, icon: <FiPieChart size={16} /> },
          { href: "/account", label: "Account", icon: <FiUser size={16} /> },
          { href: "/favorites", label: "Favorites", icon: <FiHeart size={16} /> },
          { href: "/history", label: "History", icon: <FiClock size={16} /> },
          { href: "/settings", label: "Settings", icon: <FiSettings size={16} /> },
        ].map((m) => (
          <Link key={m.href} href={m.href} onClick={onNavigate}
            className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-semibold"
            style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>
            <span style={{ color: "var(--text-faint)" }}>{m.icon}</span>{m.label}
          </Link>
        ))}
      </div>
      {signedIn
        ? <button onClick={() => { onNavigate(); onSignOut(); }} className="flex items-center justify-center gap-2 px-4 py-3 mt-1 rounded-xl text-[14px] font-bold" style={{ background: "var(--surface-2)", color: "var(--danger)", border: "1px solid var(--border)" }}><FiLogOut size={15} /> {t.signout}</button>
        : (
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Link href="/login" onClick={onNavigate} className="text-center px-4 py-3 rounded-xl text-[14px] font-bold" style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>{t.signin}</Link>
          <Link href="/register" onClick={onNavigate} className="text-center px-4 py-3 rounded-xl text-[14px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{t.signup}</Link>
        </div>
      )}
    </>
  );
}
