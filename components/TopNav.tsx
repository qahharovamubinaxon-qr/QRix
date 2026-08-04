"use client";

import Link from "next/link";
import Logo from "@/components/Logo";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
/* Five icons, not twenty-nine: only these paint before a gesture. The other
 * twenty-four moved to components/nav/NavPanels with the markup that uses them. */
import { FiGlobe, FiChevronDown, FiUser, FiMenu, FiX } from "react-icons/fi";

import { type Lang, SITE_LANGS, isLang } from "@/lib/lang";
import { NAV_I18N } from "@/lib/nav-i18n";
/* Type-only, so it is erased at compile time and drags no chunk with it. */
import type { NavStrings } from "@/components/nav/NavPanels";

const LANGUAGES = SITE_LANGS;

/* The gesture-gated panels. Each `dynamic` names the same module, so all three
 * resolve from one chunk — and from the same module registry entry `warmPanels`
 * primes, which is what makes the warm actually count. */
const NavMegaMenu = dynamic(() => import("@/components/nav/NavPanels").then((m) => m.NavMegaMenu), { ssr: false });
const AccountMenuBody = dynamic(() => import("@/components/nav/NavPanels").then((m) => m.AccountMenuBody), { ssr: false });
const MobileAccountSection = dynamic(() => import("@/components/nav/NavPanels").then((m) => m.MobileAccountSection), { ssr: false });

/* Warmed on the gesture BEFORE the opening one — entering the nav bar at all,
 * focusing into it, or touching the burger — so the chunk is in flight while the
 * pointer is still travelling and the panel is there when it opens. Cached at
 * module scope: the point is one fetch per document, not one per hover.
 * (M155 shipped this shape for QRDesignStudio; same reasoning, same trap avoided
 * — a lazily-loaded panel that starts loading only when it is asked for reads to
 * the visitor as a menu that does not open.) */
let panelsWarm: Promise<unknown> | null = null;
const warmPanels = () => { panelsWarm ??= import("@/components/nav/NavPanels"); };

const NAV_BASE: Record<"en" | "ru" | "uz", NavStrings> = {
  en: { home: "Home", qr: "QR Tools", pdf: "PDF Tools", image: "Image Tools", dashboard: "Dashboard", pricing: "Pricing", blog: "Blog", ai: "AI Tools", video: "Video Tools", three: "3D Tools", signin: "Sign in", signout: "Sign out", signup: "Sign up" },
  ru: { home: "Главная", qr: "QR Инструменты", pdf: "PDF Инструменты", image: "Изображения", dashboard: "Панель", pricing: "Тарифы", blog: "Блог", ai: "AI Инструменты", video: "Видео", three: "3D Инструменты", signin: "Войти", signout: "Выйти", signup: "Регистрация" },
  uz: { home: "Бош саҳифа", qr: "QR Асбоблар", pdf: "PDF Асбоблар", image: "Расм Асбоблар", dashboard: "Дашбоард", pricing: "Нархлар", blog: "Блог", ai: "AI Асбоблар", video: "Видео Асбоблар", three: "3D Асбоблар", signin: "Кириш", signout: "Чиқиш", signup: "Рўйхатдан ўтиш" },
};
// Merge the 12 generated languages; fall back to English per language.
const NAV: Record<string, NavStrings> = { ...NAV_BASE };
for (const [code, v] of Object.entries(NAV_I18N)) NAV[code] = { ...NAV_BASE.en, ...(v as Partial<NavStrings>) };

export default function TopNav() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
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

  // TopNav is mounted by the root layout, so a static `import { supabaseBrowser }`
  // put the whole auth SDK in the eager bundle of every page on the site — for a
  // session read that cannot paint before hydration anyway. Importing it inside
  // the effect puts it in its own chunk, off the hydration critical path. By the
  // time the account menu can be clicked the chunk is already resolved.
  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (isLang(savedLang)) setLang(savedLang);

    let mounted = true;
    let unsubscribe: (() => void) | undefined;
    import("@/lib/supabase-browser").then(({ supabaseBrowser }) => {
      if (!mounted) return;
      supabaseBrowser.auth.getSession().then(({ data }) => {
        if (mounted) setUser(data.session?.user ?? null);
      });
      const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
        setUser(session?.user ?? null);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    });
    return () => { mounted = false; unsubscribe?.(); };
  }, []);

  const changeLang = (code: string) => {
    setLang(code as Lang);
    localStorage.setItem("language", code);
    setLangOpen(false);
    window.dispatchEvent(new Event("qrix-lang"));
  };

  const signOut = async () => {
    const { supabaseBrowser } = await import("@/lib/supabase-browser");
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

  // Scan-landing pages (/pin/…, /r/…) must read as a clean lock screen — the
  // person arriving scanned a QR, they are not browsing the site. No chrome.
  // The dashboard is an app shell with its own sidebar + sticky header; a second
  // sticky bar on top overlapped its search on phones, so it goes chromeless too.
  // (After every hook so the hook order stays stable across routes.)
  if (pathname && (pathname.startsWith("/pin") || pathname.startsWith("/r/") || pathname.startsWith("/dashboard"))) return null;

  // xl:px-6 — between 1280 and ~1450 the bar is viewport-limited rather than capped
  // by max-w, so the header's 40px side padding is the difference between the ten
  // links sitting on one line and "Tools" dropping under "QR". Above that width the
  // 1400px cap binds instead and the side padding stops mattering.
  return (
    <header className="qx-topnav qx-nav sticky top-0 z-50 px-5 lg:px-10 xl:px-6">
      <div className="qx-nav-inner max-w-[1400px] mx-auto h-[68px] flex items-center gap-2">
        {/* Logo */}
        <Link href="/" className="shrink-0" aria-label="QRix home">
          <Logo size={30} />
        </Link>

        {/* Nav links */}
        {/* xl and up only: ten single-line links need ~1280px of window. Below that
            the burger carries the same links rather than a squeezed, wrapping bar. */}
        <nav aria-label="Primary" className="hidden xl:flex items-center gap-0 mx-auto relative"
          onPointerEnter={warmPanels} onFocusCapture={warmPanels} onMouseLeave={moveToActive}>
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
                {/* "QR Tools" was breaking onto two lines — not because the label was
                    allowed to wrap, but because ten flex items were being squeezed
                    below their content width. The fix is room, not white-space:nowrap:
                    forcing nowrap makes the bar overflow (ru/uz labels need ~1500px of
                    a 1400px bar) and pushes Sign in off the edge. With the padding and
                    type below, English needs ~1170px of the ~1234px bar at xl, so it
                    never squeezes and never wraps — and a locale whose labels genuinely
                    do not fit still wraps instead of breaking the bar. */}
                <Link href={l.href}
                  aria-haspopup={hasDropdown ? "true" : undefined}
                  aria-expanded={hasDropdown ? hovered === l.dropdown : undefined}
                  className={`relative flex items-center gap-1 px-2 2xl:px-3 py-2.5 rounded-xl text-[12.5px] 2xl:text-[13.5px] font-semibold transition-colors ${active ? "qx-nav-active" : ""}`}
                  style={{ color: active ? "var(--text)" : "var(--text-muted)" }}>
                  {l.label}
                  {hasDropdown && <FiChevronDown size={11} style={{ opacity: 0.6, transform: hovered === l.dropdown ? "rotate(180deg)" : "none", transition: "transform .2s" }}/>}
                </Link>
                {hasDropdown && hovered === l.dropdown && (
                  <div onMouseEnter={() => l.dropdown && onEnter(l.dropdown)} onMouseLeave={onLeave}>
                    <NavMegaMenu menu={l.dropdown!} />
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 ml-auto md:ml-0">

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
          <div className="relative" onPointerEnter={warmPanels} onMouseLeave={() => setUserOpen(false)}>
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
                <AccountMenuBody t={t} signedIn={!!user} email={user?.email ?? null}
                  onNavigate={() => setUserOpen(false)} onSignOut={signOut} />
              </div>
            )}
          </div>
          {!user && <Link href="/register" className="qx-btn !py-2 !px-4 text-[13px] font-bold hidden lg:inline-flex">{t.signup}</Link>}

          {/* Hamburger — mobile only */}
          <button onClick={() => setMobileOpen((v) => !v)} onPointerDown={warmPanels} className="qx-btn-ghost !p-2.5 xl:hidden" aria-label="Menu" aria-haspopup="true" aria-expanded={mobileOpen}>
            {mobileOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <div className="xl:hidden pb-4 pt-1 max-w-[1400px] mx-auto">
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
            {/* Account section — deferred; the primary links above are not, so a
                slow or failed chunk costs a phone its shortcuts, never its nav. */}
            <MobileAccountSection t={t} signedIn={!!user}
              onNavigate={() => setMobileOpen(false)} onSignOut={signOut} />
          </nav>
        </div>
      )}
    </header>
  );
}
