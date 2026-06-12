"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase-browser";
import type { User } from "@supabase/supabase-js";
import QRPreview from "../components/QRPreview";
import { getBaseUrl } from "@/lib/site-url";
import QRTabs from "../components/QRTabs";
import HistoryPanel from "../components/HistoryPanel";
import FavoritesPanel from "../components/FavoritesPanel";
import StatsPanel from "../components/StatsPanel";
import DesignPanel from "../components/DesignPanel";
import { t } from "@/lib/i18n";
import {
  FiZap, FiShield, FiRefreshCw, FiStar,
  FiFileText, FiImage, FiChevronRight,
  FiWifi, FiMail, FiMessageSquare, FiUser,
  FiLink, FiGlobe, FiTwitter, FiInstagram,
  FiGithub, FiSend, FiMoon, FiSun, FiLock,
  FiArrowRight,
} from "react-icons/fi";

const LANGUAGES = [
  { code: "en", label: "EN", name: "English", flag: "🇬🇧" },
  { code: "ru", label: "RU", name: "Русский", flag: "🇷🇺" },
  { code: "uz", label: "UZ", name: "O'zbek", flag: "🇺🇿" },
  { code: "fr", label: "FR", name: "Français", flag: "🇫🇷" },
  { code: "de", label: "DE", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", label: "ES", name: "Español", flag: "🇪🇸" },
  { code: "it", label: "IT", name: "Italiano", flag: "🇮🇹" },
  { code: "ar", label: "AR", name: "العربية", flag: "🇸🇦" },
  { code: "ja", label: "JA", name: "日本語", flag: "🇯🇵" },
  { code: "ko", label: "KO", name: "한국어", flag: "🇰🇷" },
  { code: "zh", label: "ZH", name: "中文", flag: "🇨🇳" },
];

const QR_TYPES = [
  { icon: <FiLink size={18} />, label: "URL QR", desc: "Any link", color: "from-blue-500 to-blue-700", href: "/", neon: "#3b82f6", shadow: "rgba(59,130,246,0.35)" },
  { icon: <FiWifi size={18} />, label: "WiFi QR", desc: "Share WiFi", color: "from-green-500 to-green-700", href: "/", neon: "#22c55e", shadow: "rgba(34,197,94,0.35)" },
  { icon: <FiUser size={18} />, label: "vCard", desc: "Business card", color: "from-orange-500 to-orange-700", href: "/", neon: "#f97316", shadow: "rgba(249,115,22,0.35)" },
  { icon: <FiFileText size={18} />, label: "File QR", desc: "Any file", color: "from-pink-500 to-pink-700", href: "/", neon: "#ec4899", shadow: "rgba(236,72,153,0.35)" },
  { icon: <FiMail size={18} />, label: "Email QR", desc: "Quick email", color: "from-purple-500 to-purple-700", href: "/", badge: "New", neon: "#a855f7", shadow: "rgba(168,85,247,0.35)" },
  { icon: <FiMessageSquare size={18} />, label: "SMS QR", desc: "Send SMS", color: "from-yellow-500 to-yellow-700", href: "/", neon: "#eab308", shadow: "rgba(234,179,8,0.35)" },
  { icon: <FiSend size={18} />, label: "WhatsApp", desc: "WA chat", color: "from-emerald-500 to-emerald-700", href: "/", badge: "New", neon: "#10b981", shadow: "rgba(16,185,129,0.35)" },
  { icon: <FiStar size={18} />, label: "Telegram", desc: "TG link", color: "from-cyan-500 to-cyan-700", href: "/", neon: "#06b6d4", shadow: "rgba(6,182,212,0.35)" },
];

const STATS = [
  { value: "1M+", label: "QR Codes Created", icon: "📊" },
  { value: "50M+", label: "Total Scans", icon: "🔍" },
  { value: "150+", label: "Countries", icon: "🌍" },
  { value: "10K+", label: "Businesses", icon: "🏢" },
  { value: "99.9%", label: "Uptime", icon: "⚡" },
];

const FEATURES = [
  { icon: <FiZap size={20} />, color: "from-yellow-500 to-orange-500", title: "Real-time Analytics", desc: "Track scans, locations, devices in real-time." },
  { icon: <FiRefreshCw size={20} />, color: "from-green-500 to-emerald-500", title: "Dynamic QR Codes", desc: "Update destination without changing QR." },
  { icon: <FiShield size={20} />, color: "from-blue-500 to-cyan-500", title: "Advanced Security", desc: "PIN protection, expiry and spam protection." },
  { icon: <FiStar size={20} />, color: "from-purple-500 to-pink-500", title: "Beautiful Design", desc: "Custom colors, logos and unique styles." },
];

const REVIEWS = [
  { name: "Sarah M.", role: "Marketing Manager", text: "QRix transformed how we share content. The analytics are incredible!", rating: 5, avatar: "S", avatarColor: "from-cyan-500 to-blue-600" },
  { name: "Alex K.", role: "Restaurant Owner", text: "Our menu QR codes look professional. Customers love scanning them!", rating: 5, avatar: "A", avatarColor: "from-purple-500 to-pink-600" },
  { name: "David L.", role: "Event Organizer", text: "PIN-protected QR codes saved us at our last event. Amazing tool!", rating: 5, avatar: "D", avatarColor: "from-orange-500 to-red-600" },
];

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [lang, setLang] = useState("en");
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState("URL");
  const [url, setUrl] = useState("https://qrix.com");
  const [pin, setPin] = useState("");
  const [pinEnabled, setPinEnabled] = useState(false);
  const [customSlug, setCustomSlug] = useState("");
  const [color, setColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [style, setStyle] = useState("square");
  const [size, setSize] = useState(220);
  const [logo, setLogo] = useState("");
  const [outerMarker, setOuterMarker] = useState("square");
  const [innerMarker, setInnerMarker] = useState("square");
  const [markerColor, setMarkerColor] = useState("");
  const [frameStyle, setFrameStyle] = useState("none");
  const [frameText, setFrameText] = useState("Scan me");
  const [history, setHistory] = useState<string[]>([]);
  const [totalQR, setTotalQR] = useState(0);
  const [wifiName, setWifiName] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [telegram, setTelegram] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [textContent, setTextContent] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [protectedUrl, setProtectedUrl] = useState("");
  const [confirmedPin, setConfirmedPin] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [reviewName, setReviewName] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const theme = {
    bg: dark
      ? "linear-gradient(135deg,#020208 0%,#050510 40%,#020208 100%)"
      : "linear-gradient(135deg,#f0f4ff 0%,#e8eeff 40%,#f5f0ff 100%)",
    text: dark ? "text-white" : "text-zinc-900",
    textMuted: dark ? "text-zinc-400" : "text-zinc-700",
    textFaint: dark ? "text-zinc-600" : "text-zinc-500",
    card: dark ? "rgba(8,8,20,0.9)" : "rgba(255,255,255,0.98)",
    cardBorderColor: dark ? "rgba(255,255,255,0.08)" : "#d1d5db",
    navBg: dark ? "bg-black/40" : "bg-white/90",
    navBorder: dark ? "border-white/5" : "border-zinc-200",
    inputStyle: {
      background: dark ? "rgba(255,255,255,0.05)" : "#ffffff",
      border: `1px solid ${dark ? "rgba(255,255,255,0.1)" : "#d1d5db"}`,
      color: dark ? "#ffffff" : "#111827",
    } as React.CSSProperties,
    btnSecondary: dark
      ? "bg-white/5 border-white/10 text-white hover:bg-white/10"
      : "bg-zinc-100 border-zinc-300 text-zinc-800 hover:bg-zinc-200",
    tagBg: dark
      ? "bg-white/5 border-white/10 text-zinc-300"
      : "bg-zinc-100 border-zinc-300 text-zinc-600",
    statCard: dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.95)",
    placeholderClass: dark ? "placeholder-zinc-600" : "placeholder-zinc-400",
  };

  useEffect(() => {
    let mounted = true;
    supabaseBrowser.auth.getSession().then(({ data }) => {
      if (mounted) setUser(data.session?.user ?? null);
    });
    const { data: listener } = supabaseBrowser.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });
    return () => { mounted = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const h = localStorage.getItem("qrix-history");
    const f = localStorage.getItem("qrix-favorites");
    const tt = localStorage.getItem("qrix-total");
    if (h) setHistory(JSON.parse(h));
    if (f) setFavorites(JSON.parse(f));
    if (tt) setTotalQR(Number(tt));
  }, []);

  let qrValue = url;
  if (active === "WiFi") qrValue = `WIFI:T:WPA;S:${wifiName};P:${wifiPassword};;`;
  if (active === "WhatsApp") qrValue = `https://wa.me/${phone}`;
  if (active === "Email") qrValue = `mailto:${email}`;
  if (active === "Telegram") qrValue = `https://t.me/${telegram.replace("@", "")}`;
  if (active === "SMS") qrValue = `sms:${phone}?body=${encodeURIComponent(message)}`;
  if (active === "vCard") qrValue = `BEGIN:VCARD\nVERSION:3.0\nFN:${contactName}\nTEL:${contactPhone}\nEMAIL:${contactEmail}\nEND:VCARD`;
  if (active === "Text") qrValue = textContent;

  const confirmPin = useCallback(async () => {
    if (!pin || pin.length < 4) { alert("PIN must be 4+ digits"); return; }
    setConfirmedPin(pin);
    try {
      const res = await fetch("/api/create-dynamic", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, pin, customSlug }),
      });
      const data = await res.json();
      if (data.dynamicUrl) setProtectedUrl(getBaseUrl() + data.dynamicUrl);
    } catch (e) { console.error(e); }
  }, [pin, url, customSlug]);

  useEffect(() => {
    const handler = () => confirmPin();
    window.addEventListener("confirm-pin", handler);
    return () => window.removeEventListener("confirm-pin", handler);
  }, [confirmPin]);

  const saveToHistory = () => {
    if (!qrValue) return;
    const updated = [qrValue, ...history];
    setHistory(updated);
    localStorage.setItem("qrix-history", JSON.stringify(updated));
    const newTotal = totalQR + 1;
    setTotalQR(newTotal);
    localStorage.setItem("qrix-total", String(newTotal));
  };

  const addToFavorites = () => {
    if (!qrValue) return;
    const updated = [qrValue, ...favorites];
    setFavorites(updated);
    localStorage.setItem("qrix-favorites", JSON.stringify(updated));
  };

  const createDynamicQR = async () => {
    if (!url) return;
    try {
      const res = await fetch("/api/create-dynamic", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, pin, customSlug }),
      });
      const data = await res.json();
      if (data.error) { alert(data.error); return; }
      if (data.dynamicUrl) setUrl(getBaseUrl() + data.dynamicUrl);
    } catch (e) { console.error(e); }
  };

  const currentLang = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

  return (
    <main className={`min-h-screen ${theme.text} overflow-x-hidden transition-all duration-500`}
      style={{ background: theme.bg }}>

      {/* ═══════════ NAVBAR ═══════════ */}
      <header className={`border-b ${theme.navBorder} backdrop-blur-xl ${theme.navBg} sticky top-0 z-50 transition-all duration-500`}>
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-cyan-500/30">Q</div>
            <span className="text-lg font-black tracking-tight">QR<span className="text-cyan-400">ix</span></span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {[
              { href: "/", key: "home" },
              { href: "/pdf-tools", key: "pdfTools" },
              { href: "/image-tools", key: "imageTools" },
              { href: "/dashboard", key: "dashboard" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className={`px-3 py-1.5 rounded-lg ${theme.textMuted} ${dark ? "hover:text-white hover:bg-white/5" : "hover:text-zinc-900 hover:bg-zinc-100"} transition text-xs font-medium`}>
                {t(lang, item.key)}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <button onClick={() => setDark(!dark)}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition ${dark ? "bg-white/5 border border-white/10 text-yellow-400 hover:bg-white/10" : "bg-zinc-100 border border-zinc-200 text-zinc-600 hover:bg-zinc-200"}`}>
              {dark ? <FiSun size={14} /> : <FiMoon size={14} />}
            </button>

            <div className="relative">
              <button onClick={() => setLangOpen(!langOpen)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition ${dark ? "bg-white/5 border border-white/10 text-white hover:bg-white/10" : "bg-zinc-100 border border-zinc-200 text-zinc-700 hover:bg-zinc-200"}`}>
                <FiGlobe size={12} />
                <span>{currentLang.flag} {currentLang.label}</span>
                <span className={theme.textFaint}>▾</span>
              </button>
              {langOpen && (
                <div className={`absolute right-0 top-10 w-44 ${dark ? "bg-zinc-900 border-white/10" : "bg-white border-zinc-200"} border rounded-xl shadow-2xl overflow-hidden z-50 max-h-72 overflow-y-auto`}>
                  {LANGUAGES.map((l) => (
                    <button key={l.code} onClick={() => { setLang(l.code); setLangOpen(false); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition text-left ${lang === l.code ? "text-cyan-400" : dark ? "text-zinc-300 hover:bg-white/5" : "text-zinc-700 hover:bg-zinc-50"}`}>
                      <span>{l.flag}</span><span>{l.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {user ? (
              <>
                <Link href="/dashboard" className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition">
                  {t(lang, "dashboard")}
                </Link>
                <button onClick={async () => { await supabaseBrowser.auth.signOut(); router.push("/login"); }}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold hover:bg-red-500/20 transition">
                  {t(lang, "logout")}
                </button>
              </>
            ) : (
              <>
                <Link href="/login"
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${theme.btnSecondary} border`}>
                  {t(lang, "login")}
                </Link>
                <Link href="/register"
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold hover:opacity-90 transition shadow-lg shadow-cyan-500/20">
                  {t(lang, "register")}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ═══════════ HERO — 3 COLUMN ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <div className="grid lg:grid-cols-[260px_1fr_280px] gap-5 items-start">

          {/* LEFT */}
          <div className="flex flex-col pt-2">
            <div className={`inline-flex items-center gap-2 ${theme.tagBg} border rounded-full px-3 py-1 text-[11px] mb-5 w-fit`}>
              🚀 {t(lang, "tagline")}
            </div>
            <h1 className="text-4xl font-black leading-tight mb-4">
              {t(lang, "hero1")}<br />{t(lang, "hero2")}<br />{t(lang, "hero3")}<br />
              <span className="bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent"
                style={{ filter: dark ? "drop-shadow(0 0 20px rgba(34,211,238,0.5))" : "none" }}>
                {t(lang, "hero4")}
              </span>
            </h1>
            <p className={`${theme.textMuted} text-sm leading-relaxed mb-5`}>{t(lang, "heroDesc")}</p>
            <div className="flex flex-col gap-2">
              <Link href="/dashboard"
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition text-sm shadow-lg shadow-cyan-500/25">
                {t(lang, "createBtn")}
              </Link>
              <button className={`flex items-center justify-center gap-2 ${theme.btnSecondary} border font-bold px-5 py-2.5 rounded-xl transition text-sm`}>
                {t(lang, "watchDemo")}
              </button>
            </div>
            <div className="flex items-center gap-3 mt-5">
              <div className="flex -space-x-2">
                {["bg-blue-400","bg-green-400","bg-purple-400","bg-orange-400"].map((c, i) => (
                  <div key={i} className={`w-7 h-7 rounded-full border-2 ${dark ? "border-black" : "border-white"} ${c} flex items-center justify-center text-[10px] font-black text-white`}>
                    {["S","A","D","M"][i]}
                  </div>
                ))}
              </div>
              <div>
                <div className="text-yellow-400 text-xs">★★★★★</div>
                <div className={`${theme.textFaint} text-[10px]`}>4.9/5 from 2,847+ users</div>
              </div>
            </div>
          </div>

          {/* CENTER — QR Generator (расмдаги каби) */}
          <div className="rounded-2xl border relative overflow-hidden transition-all duration-500"
            style={{
              background: theme.card,
              backdropFilter: "blur(20px)",
              borderColor: theme.cardBorderColor,
              boxShadow: dark ? "0 0 40px rgba(34,211,238,0.05), inset 0 1px 0 rgba(255,255,255,0.05)" : "0 4px 24px rgba(0,0,0,0.08)",
            }}>
            {dark && <>
              <div className="absolute top-0 left-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-20 h-20 bg-violet-500/10 rounded-full blur-2xl pointer-events-none" />
            </>}

            {/* Card header */}
            <div className="px-5 pt-5 pb-3">
              <h2 className={`text-base font-bold ${theme.text}`}>{t(lang, "createQR")}</h2>
              <p className={`${theme.textFaint} text-xs`}>{t(lang, "createQRDesc")}</p>
            </div>

            {/* QR Tabs */}
            <div className="px-5 pb-3">
              <QRTabs active={active} setActive={setActive} dark={dark} />
            </div>

            {/* Form area */}
            <div className="px-5 pb-5 space-y-3">

              {/* URL input — расмдаги каби */}
              {active === "URL" && (
                <>
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1.5`}>Enter your URL</label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <FiLink size={14} className={theme.textFaint} />
                      </div>
                      <input
                        value={url}
                        onChange={e => setUrl(e.target.value)}
                        placeholder="https://yourwebsite.com"
                        className={`w-full rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`}
                        style={theme.inputStyle}
                      />
                    </div>
                  </div>

                  {/* PIN toggle */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <FiLock size={13} className={theme.textFaint} />
                        <span className={`text-xs font-medium ${theme.textMuted}`}>
                          Add PIN Protection <span className={`${theme.textFaint} text-[11px]`}>(optional)</span>
                        </span>
                      </div>
                      <button
                        onClick={() => setPinEnabled(!pinEnabled)}
                        className="relative w-10 h-5 rounded-full transition-all duration-300"
                        style={{ background: pinEnabled ? "linear-gradient(135deg,#06b6d4,#3b82f6)" : dark ? "rgba(255,255,255,0.1)" : "#d1d5db" }}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300 ${pinEnabled ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                    {pinEnabled && (
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <FiLock size={13} className={theme.textFaint} />
                          </div>
                          <input
                            value={pin}
                            onChange={e => setPin(e.target.value)}
                            placeholder="Enter 4-10 digit PIN"
                            maxLength={10}
                            className={`w-full rounded-xl pl-9 pr-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`}
                            style={theme.inputStyle}
                          />
                        </div>
                        <button
                          onClick={() => window.dispatchEvent(new Event("confirm-pin"))}
                          className="px-4 py-3 rounded-xl text-xs font-bold text-white transition hover:opacity-90"
                          style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 12px rgba(124,58,237,0.3)" }}>
                          Confirm PIN
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Custom slug */}
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1.5`}>Custom Slug (Optional)</label>
                    <input
                      value={customSlug}
                      onChange={e => setCustomSlug(e.target.value)}
                      placeholder="myyoutube"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`}
                      style={theme.inputStyle}
                    />
                  </div>

                  {/* Generate QR button — расмдаги каби катта */}
                  <button
                    onClick={saveToHistory}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}
                  >
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </>
              )}

              {/* Text */}
              {active === "Text" && (
                <div>
                  <label className={`${theme.textFaint} text-[11px] block mb-1.5`}>Text Content</label>
                  <textarea value={textContent} onChange={e => setTextContent(e.target.value)}
                    placeholder="Enter your text..." rows={4}
                    className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition resize-none ${theme.placeholderClass}`}
                    style={theme.inputStyle} />
                  <button onClick={saveToHistory} className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* WiFi */}
              {active === "WiFi" && (
                <div className="space-y-3">
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>WiFi Name (SSID)</label>
                    <input value={wifiName} onChange={e => setWifiName(e.target.value)} placeholder="WiFi Name"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Password</label>
                    <input value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} placeholder="WiFi Password" type="password"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* WhatsApp */}
              {active === "WhatsApp" && (
                <div className="space-y-3">
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Phone Number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998901234567"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* Email */}
              {active === "Email" && (
                <div className="space-y-3">
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Email Address</label>
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="example@email.com"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* Telegram */}
              {active === "Telegram" && (
                <div className="space-y-3">
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Telegram Username</label>
                    <input value={telegram} onChange={e => setTelegram(e.target.value)} placeholder="@username"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* SMS */}
              {active === "SMS" && (
                <div className="space-y-3">
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Phone Number</label>
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+998901234567"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Message</label>
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Your message..." rows={3}
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition resize-none ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </div>
              )}

              {/* vCard */}
              {active === "vCard" && (
                <div className="space-y-3">
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Full Name</label>
                    <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="John Doe"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Phone</label>
                    <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+998901234567"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <div>
                    <label className={`${theme.textFaint} text-[11px] block mb-1`}>Email</label>
                    <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="example@email.com"
                      className={`w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
                  </div>
                  <button onClick={saveToHistory} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition hover:opacity-90"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>
                    Generate QR Code <FiArrowRight size={15} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT — QR Preview (расмдаги каби) */}
          <div className="rounded-2xl border flex flex-col relative overflow-hidden transition-all duration-500"
            style={{
              background: theme.card,
              backdropFilter: "blur(20px)",
              borderColor: theme.cardBorderColor,
              boxShadow: dark ? "0 0 40px rgba(99,102,241,0.08)" : "0 4px 24px rgba(0,0,0,0.08)",
            }}>
            {dark && <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl pointer-events-none" />}

            {/* Header */}
            <div className="px-5 pt-5 pb-3">
              <h3 className={`text-sm font-bold ${theme.textMuted}`}>{t(lang, "yourQR")}</h3>
            </div>

            {/* QR Preview */}
            <div className="px-4">
              <QRPreview
                value={confirmedPin ? protectedUrl : qrValue}
                color={color}
                bgColor={bgColor}
                size={size}
                logo={logo}
                style={style}
                outerMarker={outerMarker}
                innerMarker={innerMarker}
                markerColor={markerColor}
                frameStyle={frameStyle}
                frameText={frameText}
                dark={dark}
                onDownload={saveToHistory}
              />
            </div>

            {/* Customize Design button */}
            <div className="px-4 pb-4 mt-2">
              <DesignPanel
                color={color} setColor={setColor}
                bgColor={bgColor} setBgColor={setBgColor}
                size={size} setSize={setSize}
                style={style} setStyle={setStyle}
                outerMarker={outerMarker} setOuterMarker={setOuterMarker}
                innerMarker={innerMarker} setInnerMarker={setInnerMarker}
                markerColor={markerColor} setMarkerColor={setMarkerColor}
                frameStyle={frameStyle} setFrameStyle={setFrameStyle}
                frameText={frameText} setFrameText={setFrameText}
                logo={logo} setLogo={setLogo}
                dark={dark}
              />

              {/* Favorites & Dynamic */}
              <div className="flex flex-col gap-2 mt-2">
                <button onClick={addToFavorites}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition hover:opacity-80 flex items-center justify-center gap-2"
                  style={{ background: dark ? "rgba(234,179,8,0.08)" : "rgba(234,179,8,0.1)", border: "1px solid rgba(234,179,8,0.25)", color: "#ca8a04" }}>
                  ⭐ {t(lang, "addFavorites")}
                </button>
                <button onClick={createDynamicQR}
                  className="w-full py-2.5 rounded-xl text-xs font-bold transition hover:opacity-90 flex items-center justify-center gap-2 text-white"
                  style={{ background: "linear-gradient(135deg,#7c3aed,#6d28d9)", boxShadow: "0 0 15px rgba(124,58,237,0.2)" }}>
                  ⚡ {t(lang, "createDynamic")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR TYPES */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
          {QR_TYPES.map((type, i) => (
            <Link key={i} href={type.href}
              className="relative rounded-2xl p-3 flex flex-col items-center gap-2 cursor-pointer group transition-all duration-300 hover:-translate-y-1"
              style={{ background: dark ? "rgba(255,255,255,0.02)" : "rgba(255,255,255,0.9)", border: `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}` }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${type.neon}`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${type.shadow}`;
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.border = `1px solid ${dark ? "rgba(255,255,255,0.06)" : "#e5e7eb"}`;
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}>
              {(type as any).badge && (
                <span className="absolute -top-1.5 -right-1 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">
                  {(type as any).badge}
                </span>
              )}
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {type.icon}
              </div>
              <span className={`${theme.text} text-[10px] font-bold text-center`}>{type.label}</span>
              <span className={`${theme.textFaint} text-[9px] text-center leading-tight`}>{type.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {STATS.map((s, i) => (
            <div key={i}
              className="rounded-2xl px-4 py-4 flex items-center gap-3 border transition group cursor-default hover:-translate-y-0.5"
              style={{ background: dark ? theme.statCard : "white", borderColor: dark ? "rgba(255,255,255,0.05)" : "#e5e7eb" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(6,182,212,0.4)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = dark ? "rgba(255,255,255,0.05)" : "#e5e7eb"; }}>
              <span className="text-2xl">{s.icon}</span>
              <div>
                <div className={`text-xl font-black ${theme.text} group-hover:text-cyan-400 transition`}>{s.value}</div>
                <div className={`${theme.textFaint} text-[10px]`}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* WHY QRIX */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className={`text-3xl font-black mb-2 ${theme.text}`}>{t(lang, "whyQrix")} <span className="text-cyan-400">QRix</span>?</h2>
            <p className={`${theme.textMuted} text-sm mb-6`}>{t(lang, "whyDesc")}</p>
            <div className="grid grid-cols-2 gap-3">
              {FEATURES.map((f, i) => (
                <div key={i} className="rounded-2xl p-4 border transition group hover:-translate-y-1"
                  style={{ background: dark ? "rgba(255,255,255,0.02)" : "white", borderColor: dark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }}>
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                    {f.icon}
                  </div>
                  <h3 className={`${theme.text} font-bold text-xs mb-1`}>{f.title}</h3>
                  <p className={`${theme.textFaint} text-[10px] leading-relaxed`}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border p-5"
            style={{ background: dark ? "rgba(8,8,20,0.9)" : "white", borderColor: theme.cardBorderColor, boxShadow: dark ? "0 0 40px rgba(34,211,238,0.05)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
            <div className="flex items-center gap-2 mb-4">
              <span className={`font-black text-sm ${theme.text}`}>QR<span className="text-cyan-400">ix</span></span>
              <span className={`${theme.textFaint} text-xs`}>Dashboard</span>
            </div>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[{ label:"Total Scans",value:"24,860",up:"+18.7%"},{ label:"QR Codes",value:"128",up:"+12.5%"},{ label:"Countries",value:"42",up:"+8.3%"},{ label:"Devices",value:"16,320",up:"+15.5%"}].map((item,i) => (
                <div key={i} className="rounded-xl p-2.5"
                  style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "#e5e7eb"}` }}>
                  <div className={`${theme.textFaint} text-[9px] mb-1`}>{item.label}</div>
                  <div className={`${theme.text} font-black text-xs`}>{item.value}</div>
                  <div className="text-green-400 text-[9px]">{item.up}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl p-3 mb-3" style={{ background: dark ? "rgba(255,255,255,0.03)" : "#f9fafb", border: `1px solid ${dark ? "rgba(255,255,255,0.05)" : "#e5e7eb"}` }}>
              <div className="flex justify-between mb-2">
                <span className={`${theme.text} text-[10px] font-bold`}>Scan Analytics</span>
                <span className={`${theme.textFaint} text-[9px]`}>7 Days</span>
              </div>
              <div className="flex items-end gap-1 h-12">
                {[30,55,40,70,45,85,60].map((h,i) => (
                  <div key={i} className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-600 to-blue-400 opacity-80" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>
            {[{c:"🇺🇿 Uzbekistan",p:"38.2%"},{c:"🇹🇷 Turkey",p:"16.7%"},{c:"🇺🇸 USA",p:"12.4%"}].map((c,i) => (
              <div key={i} className="flex justify-between py-1" style={{ borderBottom: `1px solid ${dark ? "rgba(255,255,255,0.03)" : "#f3f4f6"}` }}>
                <span className={`${theme.textFaint} text-[10px]`}>{c.c}</span>
                <span className={`${theme.text} text-[10px] font-bold`}>{c.p}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className={`text-3xl font-black ${theme.text} mb-2`}>{t(lang, "reviews")}</h2>
          <p className={`${theme.textMuted} text-sm`}>{t(lang, "reviewsDesc")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {REVIEWS.map((r, i) => (
            <div key={i} className="rounded-2xl p-5 border transition hover:-translate-y-1"
              style={{ background: dark ? "rgba(255,255,255,0.02)" : "white", borderColor: dark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }}>
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${r.avatarColor} flex items-center justify-center text-white font-black text-sm`}>{r.avatar}</div>
                <div>
                  <div className={`${theme.text} font-bold text-xs`}>{r.name}</div>
                  <div className={`${theme.textFaint} text-[10px]`}>{r.role}</div>
                </div>
                <div className="ml-auto text-yellow-400 text-xs">{"★".repeat(r.rating)}</div>
              </div>
              <p className={`${theme.textMuted} text-xs leading-relaxed`}>{r.text}</p>
            </div>
          ))}
        </div>
        <div className="max-w-xl mx-auto rounded-2xl p-6 border"
          style={{ background: dark ? "rgba(255,255,255,0.02)" : "white", borderColor: dark ? "rgba(255,255,255,0.06)" : "#e5e7eb" }}>
          <h3 className={`${theme.text} font-black text-base mb-4`}>{t(lang, "leaveReview")}</h3>
          {reviewSubmitted ? (
            <div className="text-center py-4"><div className="text-3xl mb-2">🎉</div><div className="text-green-400 font-bold text-sm">{t(lang, "thankYou")}</div></div>
          ) : (
            <div className="space-y-3">
              <input value={reviewName} onChange={e => setReviewName(e.target.value)} placeholder={t(lang, "yourName")}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition ${theme.placeholderClass}`} style={theme.inputStyle} />
              <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} placeholder={t(lang, "shareExp")} rows={3}
                className={`w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none transition resize-none ${theme.placeholderClass}`} style={theme.inputStyle} />
              <button onClick={() => { if (reviewName && reviewText) setReviewSubmitted(true); }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-bold hover:opacity-90 transition">
                {t(lang, "submitReview")}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* PDF & IMAGE TOOLS */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-4">
          <Link href="/pdf-tools" className="group rounded-2xl p-6 border transition hover:-translate-y-1"
            style={{ background: dark ? "rgba(59,130,246,0.05)" : "white", borderColor: dark ? "rgba(59,130,246,0.15)" : "#bfdbfe" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = dark ? "rgba(59,130,246,0.4)" : "#60a5fa"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = dark ? "rgba(59,130,246,0.15)" : "#bfdbfe"; }}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform"><FiFileText size={20} /></div>
            <h3 className={`text-xl font-black ${theme.text} mb-1`}>{t(lang, "pdfTools")}</h3>
            <p className={`${theme.textMuted} text-xs mb-3`}>{t(lang, "explorePDF")}</p>
            <span className="flex items-center gap-1 text-blue-400 text-xs font-bold">{t(lang, "explore")} <FiChevronRight size={14} /></span>
          </Link>
          <Link href="/image-tools" className="group rounded-2xl p-6 border transition hover:-translate-y-1"
            style={{ background: dark ? "rgba(139,92,246,0.05)" : "white", borderColor: dark ? "rgba(139,92,246,0.15)" : "#ddd6fe" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = dark ? "rgba(139,92,246,0.4)" : "#a78bfa"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = dark ? "rgba(139,92,246,0.15)" : "#ddd6fe"; }}>
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform"><FiImage size={20} /></div>
            <h3 className={`text-xl font-black ${theme.text} mb-1`}>{t(lang, "imageTools")}</h3>
            <p className={`${theme.textMuted} text-xs mb-3`}>{t(lang, "exploreImage")}</p>
            <span className="flex items-center gap-1 text-purple-400 text-xs font-bold">{t(lang, "explore")} <FiChevronRight size={14} /></span>
          </Link>
        </div>
      </section>

      {/* STATS/HISTORY/FAVORITES */}
      <div className="max-w-7xl mx-auto px-4 pb-8">
        <StatsPanel totalQR={totalQR} historyCount={history.length} favoritesCount={favorites.length} />
        <div className="mt-4">
          <HistoryPanel history={history} onClear={() => { setHistory([]); localStorage.removeItem("qrix-history"); }} />
          <div className="mt-4">
            <FavoritesPanel favorites={favorites} onClear={() => { setFavorites([]); localStorage.removeItem("qrix-favorites"); }} />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className={`border-t ${dark ? "border-white/5" : "border-zinc-200"} mt-8`}>
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-black text-xs">Q</div>
                <span className={`text-lg font-black ${theme.text}`}>QR<span className="text-cyan-400">ix</span></span>
              </div>
              <p className={`${theme.textFaint} text-xs leading-relaxed mb-4`}>The all-in-one QR code platform for businesses and creators.</p>
              <div className="flex gap-2">
                {[FiTwitter, FiInstagram, FiGithub].map((Icon, i) => (
                  <div key={i} className={`w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border ${dark ? "bg-white/5 border-white/10 text-zinc-400 hover:text-white" : "bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900"} transition`}>
                    <Icon size={14} />
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className={`${theme.text} font-bold text-xs mb-3`}>{t(lang, "product")}</h4>
              <ul className="space-y-2">
                {["QR Generator","PDF Tools","Image Tools","Dashboard","Analytics"].map(item => (
                  <li key={item}><a href="#" className={`${theme.textFaint} text-xs hover:text-cyan-400 transition`}>{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`${theme.text} font-bold text-xs mb-3`}>{t(lang, "company")}</h4>
              <ul className="space-y-2">
                {["About Us","Blog","Careers","Press","Partners"].map(item => (
                  <li key={item}><a href="#" className={`${theme.textFaint} text-xs hover:text-cyan-400 transition`}>{item}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className={`${theme.text} font-bold text-xs mb-3`}>{t(lang, "contact")}</h4>
              <ul className="space-y-2">
                <li className={`flex items-center gap-2 ${theme.textFaint} text-xs`}><FiMail size={11} /> support@qrix.com</li>
                <li className={`flex items-center gap-2 ${theme.textFaint} text-xs`}><FiGlobe size={11} /> www.qrix.com</li>
                <li className={`flex items-center gap-2 ${theme.textFaint} text-xs`}><FiSend size={11} /> @qrix_official</li>
              </ul>
              <div className="mt-4">
                <h4 className={`${theme.text} font-bold text-xs mb-2`}>{t(lang, "newsletter")}</h4>
                <div className="flex gap-2">
                  <input placeholder="Email" className={`flex-1 rounded-lg px-3 py-1.5 text-[11px] focus:outline-none ${theme.placeholderClass}`} style={theme.inputStyle} />
                  <button className="px-3 py-1.5 rounded-lg bg-cyan-500 text-black text-[11px] font-bold hover:bg-cyan-400 transition">→</button>
                </div>
              </div>
            </div>
          </div>
          <div className={`border-t ${dark ? "border-white/5" : "border-zinc-200"} pt-6 flex flex-col md:flex-row justify-between items-center gap-3`}>
            <p className={`${theme.textFaint} text-[11px]`}>{t(lang, "allRights")}</p>
            <div className="flex gap-4">
              {["Privacy Policy","Terms of Service","Cookie Policy"].map(item => (
                <a key={item} href="#" className={`${theme.textFaint} text-[11px] hover:text-cyan-400 transition`}>{item}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
