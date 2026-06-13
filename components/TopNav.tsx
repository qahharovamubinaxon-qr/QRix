"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import { FiMoon, FiSun, FiGlobe, FiChevronDown, FiLogOut } from "react-icons/fi";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "ru", label: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "uz", label: "UZ", name: "O'zbek", flag: "🇺🇿" },
];

const NAV = {
  en: { home: "Home", qr: "QR Tools", pdf: "PDF Tools", image: "Image Tools", dashboard: "Dashboard", signin: "Sign in", signout: "Sign out", getStarted: "Get Started Free" },
  ru: { home: "Главная", qr: "QR Инструменты", pdf: "PDF Инструменты", image: "Изображения", dashboard: "Панель", signin: "Войти", signout: "Выйти", getStarted: "Начать бесплатно" },
  uz: { home: "Бош саҳифа", qr: "QR Асбоблар", pdf: "PDF Асбоблар", image: "Расм Асбоблар", dashboard: "Дашбоард", signin: "Кириш", signout: "Чиқиш", getStarted: "Бошлаш" },
};

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<keyof typeof NAV>("en");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("theme") === "light") {
      setDark(false);
      document.documentElement.classList.add("light");
    }
    const savedLang = localStorage.getItem("language");
    if (savedLang && savedLang in NAV) setLang(savedLang as keyof typeof NAV);

    let mounted = true;
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
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

  const t = NAV[lang];
  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const links = [
    { href: "/", label: t.home },
    { href: "/qr-tools", label: t.qr },
    { href: "/pdf-tools", label: t.pdf },
    { href: "/image-tools", label: t.image },
    { href: "/dashboard", label: t.dashboard },
  ];

  return (
    <header
      className="sticky top-0 z-50 px-5 lg:px-8 h-16 flex items-center gap-5"
      style={{
        background: "color-mix(in srgb, var(--surface-solid) 78%, transparent)",
        borderBottom: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="font-display flex items-center gap-0.5 shrink-0">
        <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>QR</span>
        <span
          className="text-2xl font-bold tracking-tight"
          style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          ix
        </span>
      </Link>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 mx-auto">
        {links.map((l) => {
          const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className="relative px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={{
                color: active ? "var(--text)" : "var(--text-muted)",
                background: active ? "var(--surface-hover)" : "transparent",
              }}
            >
              {l.label}
              {active && (
                <span
                  className="absolute -bottom-[13px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                  style={{ background: "var(--grad-primary)", boxShadow: "var(--glow-primary)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 ml-auto md:ml-0">
        {/* Theme */}
        <button onClick={toggleTheme} className="qx-btn-ghost !p-2.5" aria-label="Toggle theme">
          {dark ? <FiMoon size={15} /> : <FiSun size={15} style={{ color: "#f59e0b" }} />}
        </button>

        {/* Language */}
        <div className="relative">
          <button onClick={() => setLangOpen(!langOpen)} className="qx-btn-ghost !px-3 !py-2.5">
            <FiGlobe size={14} />
            <span className="text-xs font-bold">{currentLang.label}</span>
            <FiChevronDown size={12} style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {langOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-40 rounded-xl overflow-hidden z-50"
              style={{ background: "var(--surface-solid)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-pop)" }}
            >
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => changeLang(l.code)}
                  className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-left transition-colors"
                  style={{
                    color: lang === l.code ? "var(--primary-bright)" : "var(--text-muted)",
                    background: lang === l.code ? "var(--surface-hover)" : "transparent",
                  }}
                >
                  <span>{l.flag}</span> {l.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Auth */}
        {user ? (
          <div className="flex items-center gap-2">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
              style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}
            >
              <span
                className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0"
                style={{ background: "var(--grad-primary)" }}
              >
                {(user.email || "U").slice(0, 2)}
              </span>
              <span className="text-xs font-medium max-w-[160px] truncate" style={{ color: "var(--text)" }}>
                {user.email}
              </span>
            </div>
            <button onClick={signOut} className="qx-btn-ghost !p-2.5" title={t.signout} aria-label={t.signout}>
              <FiLogOut size={14} />
            </button>
          </div>
        ) : (
          <>
            <Link href="/login" className="qx-btn-ghost !py-2.5 text-xs">{t.signin}</Link>
            <Link href="/register" className="qx-btn !py-2.5 text-xs hidden sm:inline-flex">
              {t.getStarted} →
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
