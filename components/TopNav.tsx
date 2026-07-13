"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  FiMoon, FiSun, FiGlobe, FiChevronDown, FiLogOut, FiSend, FiMenu, FiX,
  FiLink, FiWifi, FiUser, FiMessageCircle, FiType, FiRefreshCw,
  FiLayers, FiScissors, FiMinimize2, FiLock, FiDroplet,
  FiZap, FiBarChart2, FiCamera, FiImage, FiMaximize2,
  FiGrid, FiPieChart, FiSettings, FiHeart, FiClock, FiPlay, FiFilm,
} from "react-icons/fi";

import { type Lang, SITE_LANGS, isLang } from "@/lib/lang";
import { HOME_I18N } from "@/lib/home-i18n";

const LANGUAGES = SITE_LANGS;

type NavStrings = { home: string; qr: string; pdf: string; image: string; dashboard: string; pricing: string; blog: string; ai: string; video: string; three: string; signin: string; signout: string; signup: string };
const NAV_BASE: Record<"en" | "ru" | "uz", NavStrings> = {
  en: { home: "Home", qr: "QR Tools", pdf: "PDF Tools", image: "Image Tools", dashboard: "Dashboard", pricing: "Pricing", blog: "Blog", ai: "AI Tools", video: "Video Tools", three: "3D Tools", signin: "Sign in", signout: "Sign out", signup: "Sign up" },
  ru: { home: "Главная", qr: "QR Инструменты", pdf: "PDF Инструменты", image: "Изображения", dashboard: "Панель", pricing: "Тарифы", blog: "Блог", ai: "AI Инструменты", video: "Видео", three: "3D Инструменты", signin: "Войти", signout: "Выйти", signup: "Регистрация" },
  uz: { home: "Бош саҳифа", qr: "QR Асбоблар", pdf: "PDF Асбоблар", image: "Расм Асбоблар", dashboard: "Дашбоард", pricing: "Нархлар", blog: "Блог", ai: "AI Асбоблар", video: "Видео Асбоблар", three: "3D Асбоблар", signin: "Кириш", signout: "Чиқиш", signup: "Рўйхатдан ўтиш" },
};
// Merge the 12 generated languages; fall back to English per language.
const NAV: Record<string, NavStrings> = { ...NAV_BASE };
for (const [code, v] of Object.entries(HOME_I18N)) NAV[code] = { ...NAV_BASE.en, ...(v.nav as Partial<NavStrings>) };

const DROPDOWNS: Record<string, { href: string; label: string; desc: string; icon: React.ReactNode; color: string }[]> = {
  "/qr-tools": [
    { href: "/qr-tools/url",       label: "URL QR",      desc: "Any website link",     icon: <FiLink size={15}/>,         color: "#4f46e5" },
    { href: "/qr-tools/wifi",      label: "WiFi QR",     desc: "Share WiFi access",    icon: <FiWifi size={15}/>,         color: "#16a34a" },
    { href: "/qr-tools/vcard",     label: "vCard QR",    desc: "Digital business card",icon: <FiUser size={15}/>,         color: "#d97706" },
    { href: "/qr-tools/whatsapp",  label: "WhatsApp QR", desc: "Direct chat link",     icon: <FiMessageCircle size={15}/>,color: "#16a34a" },
    { href: "/link-in-bio",        label: "Link-in-Bio", desc: "All your links, one page", icon: <FiLink size={15}/>,      color: "#bba9ff" },
    { href: "/poster",             label: "QR Poster",   desc: "Printable 'Scan me' flyer", icon: <FiImage size={15}/>,    color: "#ff4d1c" },
    { href: "/bulk-qr",            label: "Bulk QR",     desc: "Many QR from CSV",     icon: <FiGrid size={15}/>,         color: "#bba9ff" },
    { href: "/animated-qr",        label: "Animated QR", desc: "QR video for Stories", icon: <FiPlay size={15}/>,         color: "#ff6a13" },
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

function NavDropdown({ items }: { items: typeof DROPDOWNS[string] }) {
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

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [dark, setDark] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // sliding glass pill behind the nav items
  const itemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [pill, setPill] = useState<{ x: number; y: number; w: number; h: number; show: boolean }>({ x: 0, y: 0, w: 0, h: 0, show: false });
  const moveTo = (idx: number) => {
    const el = itemRefs.current[idx];
    if (!el) return;
    setPill({ x: el.offsetLeft, y: el.offsetTop, w: el.offsetWidth, h: el.offsetHeight, show: true });
  };

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);

    const savedLang = localStorage.getItem("language");
    if (isLang(savedLang)) setLang(savedLang);

    let mounted = true;
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem("theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("light", !next);
  };

  const changeLang = (code: string) => {
    setLang(code as Lang);
    localStorage.setItem("language", code);
    setLangOpen(false);
    window.dispatchEvent(new Event("qrix-lang"));
  };

  const signOut = async () => {
    await supabaseBrowser.auth.signOut();
    location.reload();
  };

  const onEnter = (key: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setHovered(key);
  };
  const onLeave = () => {
    hoverTimer.current = setTimeout(() => setHovered(null), 120);
  };

  const t = NAV[lang] ?? NAV.en;
  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const links = [
    { href: "/",            label: t.home,      dropdown: null },
    { href: "/qr-tools",   label: t.qr,        dropdown: "/qr-tools" },
    { href: "/pdf-tools",  label: t.pdf,       dropdown: "/pdf-tools" },
    { href: "/image-tools",label: t.image,     dropdown: "/image-tools" },
    { href: "/ai-tools",   label: t.ai,        dropdown: "/ai-tools" },
    { href: "/video-tools",label: t.video,     dropdown: "/video-tools" },
    { href: "/3d-tools",   label: t.three,     dropdown: null },
    { href: "/dashboard",  label: t.dashboard, dropdown: "/dashboard" },
    { href: "/pricing",    label: t.pricing,   dropdown: null },
    { href: "/blog",       label: t.blog,      dropdown: null },
  ];

  const activeIndex = links.findIndex((l) => (l.href === "/" ? pathname === "/" : pathname.startsWith(l.href)));
  const moveToActive = () => { if (activeIndex >= 0) moveTo(activeIndex); else setPill((p) => ({ ...p, show: false })); };
  useEffect(() => {
    const t = setTimeout(moveToActive, 60);
    window.addEventListener("resize", moveToActive);
    return () => { clearTimeout(t); window.removeEventListener("resize", moveToActive); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, lang]);

  // Transparent at top → floating glass after scroll (Design V2).
  useEffect(() => {
    const onScroll = () => document.documentElement.setAttribute("data-scrolled", window.scrollY > 24 ? "1" : "0");
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="qx-topnav qx-nav sticky top-0 z-50 px-5 lg:px-10">
      <div className="qx-nav-inner max-w-[1400px] mx-auto h-[68px] flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="shrink-0" aria-label="QRix home">
          <Logo size={30} />
        </Link>

        {/* Nav links */}
        <nav aria-label="Primary" className="hidden md:flex items-center gap-0.5 mx-auto relative" onMouseLeave={moveToActive}>
          {/* sliding glass pill */}
          <span className="qx-nav-glasspill" style={{ transform: `translateX(${pill.x}px)`, top: pill.y, width: pill.w, height: pill.h, opacity: pill.show ? 1 : 0 }} />
          {links.map((l, idx) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            const hasDropdown = !!l.dropdown;
            return (
              <div key={l.href} ref={(el) => { itemRefs.current[idx] = el; }} className="qx-nav-item"
                onMouseEnter={() => { moveTo(idx); l.dropdown && onEnter(l.dropdown); }}
                onMouseLeave={onLeave}
                onFocus={hasDropdown ? () => { moveTo(idx); onEnter(l.dropdown!); } : undefined}
                onBlur={hasDropdown ? (e) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onLeave(); } : undefined}
                onKeyDown={hasDropdown ? (e) => { if (e.key === "Escape") { setHovered(null); (e.currentTarget.querySelector("a") as HTMLElement | null)?.focus(); } } : undefined}>
                <Link href={l.href}
                  aria-haspopup={hasDropdown ? "true" : undefined}
                  aria-expanded={hasDropdown ? hovered === l.dropdown : undefined}
                  className={`relative flex items-center gap-1 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-colors ${active ? "qx-nav-active" : ""}`}
                  style={{ color: active ? "var(--text)" : "var(--text-muted)" }}>
                  {l.label}
                  {hasDropdown && <FiChevronDown size={11} style={{ opacity: 0.6, transform: hovered === l.dropdown ? "rotate(180deg)" : "none", transition: "transform .2s" }}/>}
                </Link>
                {hasDropdown && hovered === l.dropdown && (
                  <div onMouseEnter={() => l.dropdown && onEnter(l.dropdown)} onMouseLeave={onLeave}>
                    <NavDropdown items={DROPDOWNS[l.dropdown!]} />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          {/* Theme */}
          <button onClick={toggleTheme} className="qx-btn-ghost !p-2.5" aria-label="Toggle theme">
            {dark ? <FiMoon size={16}/> : <FiSun size={16} style={{ color: "#f59e0b" }}/>}
          </button>

          {/* Language */}
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="qx-btn-ghost !px-3 !py-2.5"
              aria-label="Change language" aria-haspopup="true" aria-expanded={langOpen}>
              <FiGlobe size={14}/>
              <span className="text-[12px] font-bold">{currentLang.label}</span>
              <FiChevronDown size={11} style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}/>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl overflow-y-auto z-50 max-h-[70vh]"
                style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => changeLang(l.code)} dir={l.rtl ? "rtl" : "ltr"}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-left transition-colors"
                    style={{ color: lang === l.code ? "var(--primary)" : "var(--text-muted)", background: lang === l.code ? "var(--surface-hover)" : "transparent" }}>
                    <span>{l.flag}</span> {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Account menu — always available (favorites/history/settings work for guests too) */}
          <div className="relative" onMouseLeave={() => setUserOpen(false)}>
            <button onClick={() => setUserOpen((v) => !v)} className="flex items-center gap-2 rounded-xl px-2 py-1.5"
              style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }} aria-haspopup="true" aria-expanded={userOpen} aria-label="Account menu">
              <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold uppercase shrink-0"
                style={{ background: "var(--grad-primary)", color: "#0b0b0b" }}>
                {user ? (user.email || "U").slice(0, 2) : <FiUser size={13} />}
              </span>
              {user && <span className="text-xs font-medium max-w-[130px] truncate hidden lg:inline" style={{ color: "var(--text)" }}>{user.email}</span>}
              <FiChevronDown size={11} style={{ color: "var(--text-faint)", transform: userOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
            </button>
            {userOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-50"
                style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
                {user && <div className="px-4 py-3 text-[12px] truncate" style={{ borderBottom: "1px solid var(--border)", color: "var(--text-muted)" }}>{user.email}</div>}
                {[
                  { href: "/dashboard", label: t.dashboard, icon: <FiPieChart size={15} /> },
                  { href: "/workspace", label: "Workspace", icon: <FiGrid size={15} /> },
                  { href: "/account", label: "Account", icon: <FiUser size={15} /> },
                  { href: "/favorites", label: "Favorites", icon: <FiHeart size={15} /> },
                  { href: "/history", label: "History", icon: <FiClock size={15} /> },
                  { href: "/settings", label: "Settings", icon: <FiSettings size={15} /> },
                ].map((m) => (
                  <Link key={m.href + m.label} href={m.href} onClick={() => setUserOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold transition-colors"
                    style={{ color: "var(--text)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-hover)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                    <span style={{ color: "var(--text-faint)" }}>{m.icon}</span>{m.label}
                  </Link>
                ))}
                <div style={{ borderTop: "1px solid var(--border)" }}>
                  {user
                    ? <button onClick={() => { setUserOpen(false); signOut(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold" style={{ color: "var(--danger)" }}><FiLogOut size={15} /> {t.signout}</button>
                    : <div className="grid grid-cols-2 gap-2 p-3">
                        <Link href="/login" onClick={() => setUserOpen(false)} className="qx-btn-ghost !py-2 !text-[12px] justify-center">{t.signin}</Link>
                        <Link href="/register" onClick={() => setUserOpen(false)} className="qx-btn !py-2 !text-[12px] justify-center">{t.signup}</Link>
                      </div>}
                </div>
              </div>
            )}
          </div>
          {!user && <Link href="/register" className="qx-btn !py-2 !px-4 text-[13px] font-bold hidden lg:inline-flex">{t.signup}</Link>}

          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileOpen((v) => !v)} className="qx-btn-ghost !p-2.5 md:hidden" aria-label="Menu" aria-haspopup="true" aria-expanded={mobileOpen}>
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="md:hidden pb-4 pt-1 max-w-[1400px] mx-auto">
          <nav aria-label="Mobile" className="flex flex-col gap-1">
            {links.map((l) => {
              const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 rounded-xl text-[15px] font-semibold"
                  style={{ background: active ? "var(--surface-hover)" : "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>
                  {l.label}
                  <FiChevronDown size={14} style={{ transform: "rotate(-90deg)", opacity: .7 }} />
                </Link>
              );
            })}
            {/* Account section */}
            <div className="mt-2 pt-2 grid grid-cols-2 gap-1" style={{ borderTop: "1px solid var(--border)" }}>
              {[
                { href: "/dashboard", label: t.dashboard, icon: <FiPieChart size={16} /> },
                { href: "/account", label: "Account", icon: <FiUser size={16} /> },
                { href: "/favorites", label: "Favorites", icon: <FiHeart size={16} /> },
                { href: "/history", label: "History", icon: <FiClock size={16} /> },
                { href: "/settings", label: "Settings", icon: <FiSettings size={16} /> },
              ].map((m) => (
                <Link key={m.href} href={m.href} onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[14px] font-semibold"
                  style={{ background: "var(--surface)", color: "var(--text)", border: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--text-faint)" }}>{m.icon}</span>{m.label}
                </Link>
              ))}
            </div>
            {user
              ? <button onClick={() => { setMobileOpen(false); signOut(); }} className="flex items-center justify-center gap-2 px-4 py-3 mt-1 rounded-xl text-[14px] font-bold" style={{ background: "var(--surface-2)", color: "var(--danger)", border: "1px solid var(--border)" }}><FiLogOut size={15} /> {t.signout}</button>
              : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-center px-4 py-3 rounded-xl text-[14px] font-bold" style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>{t.signin}</Link>
                <Link href="/register" onClick={() => setMobileOpen(false)} className="text-center px-4 py-3 rounded-xl text-[14px] font-bold text-white" style={{ background: "var(--grad-primary)" }}>{t.signup}</Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
