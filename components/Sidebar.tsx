"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import {
  FiChevronDown, FiHome, FiLink, FiWifi,
  FiMessageCircle, FiMail, FiSend, FiMessageSquare, FiUser,
  FiFileText, FiImage,
} from "react-icons/fi";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "ru", label: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "uz", label: "UZ", name: "O'zbek", flag: "🇺🇿" },
];

export default function Sidebar() {
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);

  useEffect(() => {
    const savedLang = localStorage.getItem("language");
    if (savedLang) setLang(savedLang);

    let mounted = true;

    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted) {
        setUser(data.session?.user ?? null);
      }
    });

    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const changeLang = (code: string) => {
    setLang(code);
    localStorage.setItem("language", code);
    setLangOpen(false);
    window.dispatchEvent(new Event("qrix-lang"));
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const qrLinks = [
    { href: "/url-qr", label: "URL QR", icon: <FiLink size={15} /> },
    { href: "/wifi-qr", label: "WiFi QR", icon: <FiWifi size={15} /> },
    { href: "/whatsapp-qr", label: "WhatsApp QR", icon: <FiMessageCircle size={15} /> },
    { href: "/email-qr", label: "Email QR", icon: <FiMail size={15} /> },
    { href: "/telegram-qr", label: "Telegram QR", icon: <FiSend size={15} /> },
    { href: "/sms-qr", label: "SMS QR", icon: <FiMessageSquare size={15} /> },
    { href: "/vcard-qr", label: "vCard QR", icon: <FiUser size={15} /> },
  ];

  return (
    <aside
      className="w-72 min-h-screen p-5 flex flex-col sticky top-0 max-h-screen overflow-y-auto"
      style={{
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <Link href="/" className="font-display flex items-center gap-2 mb-7 px-1">
        <span
          className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm"
          style={{ background: "var(--grad-primary)", boxShadow: "var(--glow-primary)" }}
        >
          QR
        </span>
        <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          QR<span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>ix</span>
        </span>
      </Link>

      {/* User section — логика ўша */}
      {user ? (
        <div className="qx-card mb-5 p-4 text-sm" style={{ borderRadius: 16 }}>
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-9 h-9 rounded-full shrink-0"
              style={{ background: "var(--grad-accent)" }}
            />
            <div className="min-w-0">
              <div className="font-semibold text-xs" style={{ color: "var(--text)" }}>
                Signed in as
              </div>
              <div className="truncate text-xs" style={{ color: "var(--text-muted)" }}>
                {user.email}
              </div>
            </div>
          </div>
          <LogoutButton />
        </div>
      ) : (
        <div className="qx-card mb-5 p-4" style={{ borderRadius: 16 }}>
          <div className="font-semibold text-sm mb-3" style={{ color: "var(--text)" }}>
            Auth required
          </div>
          <Link href="/login" className="qx-btn w-full mb-2 !py-2.5 text-xs">
            Login
          </Link>
          <Link href="/register" className="qx-btn-ghost w-full !py-2.5 text-xs">
            Register
          </Link>
        </div>
      )}

      {/* Language (QRix is dark-only — the theme toggle was removed) */}
      <div className="flex gap-2 mb-7">
        <div className="flex-1 relative">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="qx-btn-ghost w-full !px-2"
          >
            <span className="text-sm">{currentLang.flag}</span>
            <span className="text-xs font-semibold">{currentLang.label}</span>
            <FiChevronDown size={12} style={{ transform: langOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
          </button>
          {langOpen && (
            <div
              className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
              style={{
                background: "var(--surface-solid)",
                border: "1px solid var(--border-strong)",
                boxShadow: "var(--shadow-pop)",
              }}
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
                  <span>{l.flag}</span>
                  <span>{l.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Navigation — линклар ўша */}
      <nav className="flex-1 space-y-7">
        <Link href="/dashboard" className="qx-navlink active">
          <FiHome size={16} />
          Dashboard
        </Link>

        <div>
          <h3
            className="text-[10px] uppercase font-bold mb-2.5 px-2 tracking-[0.12em]"
            style={{ color: "var(--text-faint)" }}
          >
            QR Tools
          </h3>
          <div className="space-y-0.5">
            {qrLinks.map((item) => (
              <Link key={item.href} href={item.href} className="qx-navlink">
                <span style={{ color: "var(--primary-bright)" }}>{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3
            className="text-[10px] uppercase font-bold mb-2.5 px-2 tracking-[0.12em]"
            style={{ color: "var(--text-faint)" }}
          >
            PDF Tools
          </h3>
          <Link href="/pdf-tools" className="qx-navlink">
            <span style={{ color: "var(--accent)" }}><FiFileText size={15} /></span>
            PDF Tools
          </Link>
        </div>

        <div>
          <h3
            className="text-[10px] uppercase font-bold mb-2.5 px-2 tracking-[0.12em]"
            style={{ color: "var(--text-faint)" }}
          >
            Image Tools
          </h3>
          <Link href="/image-tools" className="qx-navlink">
            <span style={{ color: "var(--success)" }}><FiImage size={15} /></span>
            Image Tools
          </Link>
        </div>
      </nav>

      <div
        className="text-[11px] text-center pt-5 mt-5"
        style={{ color: "var(--text-faint)", borderTop: "1px solid var(--border)" }}
      >
        QRix © 2026
      </div>
    </aside>
  );
}
