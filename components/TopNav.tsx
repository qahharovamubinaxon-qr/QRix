"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  FiMoon, FiSun, FiGlobe, FiChevronDown, FiLogOut, FiSend,
  FiLink, FiWifi, FiUser, FiMessageCircle, FiType, FiRefreshCw,
  FiLayers, FiScissors, FiMinimize2, FiLock, FiDroplet,
  FiZap, FiBarChart2, FiCamera, FiImage, FiMaximize2,
  FiGrid, FiPieChart, FiSettings,
} from "react-icons/fi";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "ru", label: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "uz", label: "UZ", name: "O'zbek", flag: "🇺🇿" },
];

const NAV = {
  en: { home: "Home", qr: "QR Tools", pdf: "PDF Tools", image: "Image Tools", dashboard: "Dashboard", signin: "Sign in", signout: "Sign out", signup: "Sign up" },
  ru: { home: "Главная", qr: "QR Инструменты", pdf: "PDF Инструменты", image: "Изображения", dashboard: "Панель", signin: "Войти", signout: "Выйти", signup: "Регистрация" },
  uz: { home: "Бош саҳифа", qr: "QR Асбоблар", pdf: "PDF Асбоблар", image: "Расм Асбоблар", dashboard: "Дашбоард", signin: "Кириш", signout: "Чиқиш", signup: "Рўйхатдан ўтиш" },
};

const DROPDOWNS: Record<string, { href: string; label: string; desc: string; icon: React.ReactNode; color: string }[]> = {
  "/qr-tools": [
    { href: "/qr-tools/url",       label: "URL QR",      desc: "Any website link",     icon: <FiLink size={15}/>,         color: "#4f46e5" },
    { href: "/qr-tools/wifi",      label: "WiFi QR",     desc: "Share WiFi access",    icon: <FiWifi size={15}/>,         color: "#16a34a" },
    { href: "/qr-tools/vcard",     label: "vCard QR",    desc: "Digital business card",icon: <FiUser size={15}/>,         color: "#d97706" },
    { href: "/qr-tools/whatsapp",  label: "WhatsApp QR", desc: "Direct chat link",     icon: <FiMessageCircle size={15}/>,color: "#16a34a" },
    { href: "/bulk-qr",            label: "Bulk QR",     desc: "Many QR from CSV",     icon: <FiGrid size={15}/>,         color: "#7c3aed" },
    { href: "/qr-tools",           label: "All QR Tools",desc: "25+ QR types",         icon: <FiGrid size={15}/>,         color: "#F58F20" },
  ],
  "/pdf-tools": [
    { href: "/pdf-tools/merge",     label: "Merge PDF",   desc: "Combine multiple PDFs",icon: <FiLayers size={15}/>,    color: "#4f46e5" },
    { href: "/pdf-tools/split",     label: "Split PDF",   desc: "Extract pages",        icon: <FiScissors size={15}/>,  color: "#0891b2" },
    { href: "/pdf-tools/compress",  label: "Compress",    desc: "Reduce file size",     icon: <FiMinimize2 size={15}/>, color: "#16a34a" },
    { href: "/pdf-tools/protect",   label: "Protect PDF", desc: "Password protect",     icon: <FiLock size={15}/>,      color: "#7c3aed" },
    { href: "/pdf-tools/watermark", label: "Watermark",   desc: "Add text/image mark",  icon: <FiDroplet size={15}/>,   color: "#0891b2" },
    { href: "/pdf-tools",           label: "All PDF Tools",desc: "8+ PDF tools",        icon: <FiGrid size={15}/>,      color: "#F58F20" },
  ],
  "/image-tools": [
    { href: "/image-tools/remove-bg",    label: "Remove BG",   desc: "AI background remover",icon: <FiScissors size={15}/>,   color: "#7c3aed" },
    { href: "/image-tools/image-to-text",label: "Image to Text",desc: "Extract text (OCR)",  icon: <FiType size={15}/>,       color: "#0891b2" },
    { href: "/image-tools/upscale",      label: "AI Upscale",  desc: "Enhance resolution",   icon: <FiZap size={15}/>,        color: "#d97706" },
    { href: "/image-tools/compress",     label: "Compress",    desc: "Reduce image size",    icon: <FiMinimize2 size={15}/>,  color: "#16a34a" },
    { href: "/image-tools/resize",       label: "Resize",      desc: "Change dimensions",    icon: <FiMaximize2 size={15}/>,  color: "#2563eb" },
    { href: "/image-tools",              label: "All Image Tools",desc: "10+ tools",          icon: <FiImage size={15}/>,      color: "#F58F20" },
  ],
  "/dashboard": [
    { href: "/dashboard",          label: "Overview",    desc: "Stats & analytics",    icon: <FiPieChart size={15}/>,   color: "#4f46e5" },
    { href: "/dashboard",          label: "My QR Codes", desc: "Manage all QR codes",  icon: <FiGrid size={15}/>,       color: "#F58F20" },
    { href: "/dashboard",          label: "Analytics",   desc: "Scans & locations",    icon: <FiBarChart2 size={15}/>,  color: "#16a34a" },
    { href: "/dashboard",          label: "Scanner",     desc: "Scan QR codes",        icon: <FiCamera size={15}/>,     color: "#7c3aed" },
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
  const [lang, setLang] = useState<keyof typeof NAV>("en");
  const [langOpen, setLangOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("light", !isDark);

    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang in NAV) setLang(savedLang as keyof typeof NAV);

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
    setLang(code as keyof typeof NAV);
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

  const t = NAV[lang];
  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const links = [
    { href: "/",            label: t.home,      dropdown: null },
    { href: "/qr-tools",   label: t.qr,        dropdown: "/qr-tools" },
    { href: "/pdf-tools",  label: t.pdf,       dropdown: "/pdf-tools" },
    { href: "/image-tools",label: t.image,     dropdown: "/image-tools" },
    { href: "/dashboard",  label: t.dashboard, dropdown: "/dashboard" },
  ];

  return (
    <header className="qx-topnav sticky top-0 z-50 px-5 lg:px-10">
      <div className="max-w-[1400px] mx-auto h-[68px] flex items-center gap-6">
        {/* Logo */}
        <Link href="/" className="qx-logo-glow font-display flex items-center gap-0.5 shrink-0">
          <span className="text-[25px] font-extrabold tracking-tight" style={{ color: "#fff" }}>QR</span>
          <span className="text-[25px] font-extrabold tracking-tight" style={{ color: "#161208" }}>ix</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-0.5 mx-auto">
          {links.map((l) => {
            const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            const hasDropdown = !!l.dropdown;
            return (
              <div key={l.href} className="relative"
                onMouseEnter={() => l.dropdown && onEnter(l.dropdown)}
                onMouseLeave={onLeave}>
                <Link href={l.href}
                  className={`relative flex items-center gap-1 px-4 py-2.5 rounded-xl text-[13.5px] font-semibold transition-all border ${active ? "qx-nav-active" : "border-transparent hover:border-[var(--border)] hover:bg-[var(--surface-hover)]"}`}
                  style={{ color: active ? "var(--primary)" : "var(--text-muted)" }}>
                  {l.label}
                  {hasDropdown && <FiChevronDown size={11} style={{ opacity: 0.6, transform: hovered === l.dropdown ? "rotate(180deg)" : "none", transition: "transform .2s" }}/>}
                  {active && (
                    <span className="absolute -bottom-[10px] left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-full"
                      style={{ background: "#fff", boxShadow: "0 0 8px rgba(255,255,255,0.6)" }}/>
                  )}
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
            <button onClick={() => setLangOpen(!langOpen)} className="qx-btn-ghost !px-3 !py-2.5">
              <FiGlobe size={14}/>
              <span className="text-[12px] font-bold">{currentLang.label}</span>
              <FiChevronDown size={11} style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}/>
            </button>
            {langOpen && (
              <div className="absolute right-0 top-full mt-2 w-40 rounded-xl overflow-hidden z-50"
                style={{ background: "var(--surface-solid)", border: "1px solid var(--border)", boxShadow: "var(--shadow-pop)" }}>
                {LANGUAGES.map((l) => (
                  <button key={l.code} onClick={() => changeLang(l.code)}
                    className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-left transition-colors"
                    style={{ color: lang === l.code ? "var(--primary)" : "var(--text-muted)", background: lang === l.code ? "var(--surface-hover)" : "transparent" }}>
                    <span>{l.flag}</span> {l.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
                style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0"
                  style={{ background: "var(--grad-primary)" }}>
                  {(user.email || "U").slice(0, 2)}
                </span>
                <span className="text-xs font-medium max-w-[160px] truncate" style={{ color: "var(--text)" }}>{user.email}</span>
              </div>
              <button onClick={signOut} className="qx-btn-ghost !p-2.5" title={t.signout} aria-label={t.signout}>
                <FiLogOut size={14}/>
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="qx-btn-ghost !py-2 !px-4 text-[13px] font-semibold">{t.signin}</Link>
              <Link href="/register" className="qx-btn !py-2 !px-4 text-[13px] font-bold hidden sm:inline-flex">{t.signup}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
