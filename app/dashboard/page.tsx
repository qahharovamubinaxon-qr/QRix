"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "../../components/Sidebar";
import DashboardLinks from "@/components/DashboardLinks";
import CopyButton from "@/components/CopyButton";
import DeleteButton from "@/components/DeleteButton";
import DashboardChart from "@/components/DashboardChart";
import { FiSearch, FiBell, FiUser } from "react-icons/fi";

type DashboardData = {
  totalLinks: number;
  totalScans: number;
  protectedLinks: number;
  countriesCount: number;
  mostPopular: any;
  links: any[];
  recentScans: any[];
  chartData: any[];
};

const t = (lang: string, key: string) => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      dashboard: "Dashboard",
      welcome: "Welcome back, User!",
      totalQR: "Total QR Codes",
      totalScans: "Total Scans",
      protectedQR: "Protected QR",
      countries: "Countries",
      scanAnalytics: "Scan Analytics",
      recentActivity: "Recent Activity",
      topCountries: "Top Countries",
      quickCreate: "Quick Create",
      recentScans: "Recent Scans",
      search: "Search...",
    },
    ru: {
      dashboard: "Панель управления",
      welcome: "Добро пожаловать!",
      totalQR: "Всего QR кодов",
      totalScans: "Всего сканирований",
      protectedQR: "Защищённые QR",
      countries: "Страны",
      scanAnalytics: "Аналитика сканирования",
      recentActivity: "Недавняя активность",
      topCountries: "Топ стран",
      quickCreate: "Быстрое создание",
      recentScans: "Недавние сканы",
      search: "Поиск...",
    },
    uz: {
      dashboard: "Дашбоард",
      welcome: "Хуш келибсиз!",
      totalQR: "Жами QR кодлар",
      totalScans: "Жами сканлар",
      protectedQR: "Ҳимояланган QR",
      countries: "Давлатлар",
      scanAnalytics: "Сканлар аналитикаси",
      recentActivity: "Сўнгги фаъолиятлар",
      topCountries: "Сўнгги давлатлар",
      quickCreate: "Тезкор ясаш",
      recentScans: "Сўнгги сканлар",
      search: "Қидириш...",
    },
  };
  return translations[lang]?.[key] || key;
};

export default function DashboardPage() {
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState("en");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load theme and language from localStorage
    const savedTheme = localStorage.getItem("theme");
    const savedLang = localStorage.getItem("language");
    
    if (savedTheme) setDark(savedTheme === "dark");
    if (savedLang) setLang(savedLang);

    const fetchData = async () => {
      try {
        // Fetch from the existing server-side data
        setData({
          totalLinks: 128,
          totalScans: 24860,
          protectedLinks: 34,
          countriesCount: 42,
          mostPopular: { slug: "qr-001", scans: 1420 },
          links: [],
          recentScans: [],
          chartData: [],
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Listen for storage changes (when theme/language changes in Sidebar)
    const handleStorageChange = () => {
      const newTheme = localStorage.getItem("theme");
      const newLang = localStorage.getItem("language");
      if (newTheme) setDark(newTheme === "dark");
      if (newLang) setLang(newLang);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const theme = {
    bg: dark
      ? "linear-gradient(135deg,#0f0f1e 0%,#1a1a2e 50%,#0f0f1e 100%)"
      : "linear-gradient(135deg,#f0f4ff 0%,#e8eeff 50%,#f0f4ff 100%)",
    text: dark ? "text-white" : "text-zinc-900",
    textMuted: dark ? "text-zinc-400" : "text-zinc-600",
    card: dark ? "rgba(24,24,37,0.9)" : "rgba(255,255,255,0.98)",
    cardBorder: dark ? "rgba(34,211,238,0.2)" : "rgba(6,182,212,0.2)",
    input: dark
      ? "bg-white/5 border-white/10 text-white"
      : "bg-zinc-50 border-zinc-300 text-zinc-900",
  };

  return (
    <div className="flex min-h-screen transition-colors duration-300" style={{ background: theme.bg }}>
      <Sidebar />

      <main className="flex-1">
        {/* Header */}
        <header className={`border-b ${dark ? "border-white/10" : "border-zinc-200"} sticky top-0 z-40 backdrop-blur-xl transition-colors`}
          style={{ background: dark ? "rgba(15,15,30,0.7)" : "rgba(255,255,255,0.7)" }}>
          <div className="px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${dark ? "bg-white/5 border-white/10" : "bg-zinc-50 border-zinc-200"}`}>
                <FiSearch size={16} className={theme.textMuted} />
                <input type="text" placeholder={t(lang, "search")}
                  className={`bg-transparent outline-none text-sm ${dark ? "placeholder-zinc-600" : "placeholder-zinc-400"}`} />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className={`w-9 h-9 rounded-lg flex items-center justify-center relative transition ${dark ? "bg-white/5 border border-white/10 hover:bg-white/10" : "bg-zinc-100 border border-zinc-200 hover:bg-zinc-200"}`}>
                <FiBell size={16} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>

              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${dark ? "bg-white/5 border-white/10" : "bg-zinc-100 border-zinc-200"}`}>
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600" />
                <span className={`text-xs font-medium ${theme.text}`}>User</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8">
          {/* Page header */}
          <div className="mb-8">
            <h1 className={`text-4xl font-black ${theme.text}`}>{t(lang, "dashboard")}</h1>
            <p className={`${theme.textMuted} text-sm mt-2`}>{t(lang, "welcome")}</p>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: t(lang, "totalQR"), value: data?.totalLinks || 0, icon: "📊", gradient: "from-blue-500 to-cyan-500" },
              { label: t(lang, "totalScans"), value: data?.totalScans || 0, icon: "🔍", gradient: "from-cyan-500 to-teal-500" },
              { label: t(lang, "protectedQR"), value: data?.protectedLinks || 0, icon: "🔒", gradient: "from-purple-500 to-pink-500" },
              { label: t(lang, "countries"), value: data?.countriesCount || 0, icon: "🌍", gradient: "from-orange-500 to-red-500" },
            ].map((stat, i) => (
              <div key={i} className={`rounded-2xl p-6 border transition hover:-translate-y-1 ${dark ? "hover:bg-white/5" : "hover:bg-black/5"}`}
                style={{ background: theme.card, borderColor: theme.cardBorder, boxShadow: dark ? "0 0 30px rgba(34,211,238,0.05)" : "0 4px 24px rgba(0,0,0,0.08)" }}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">{stat.icon}</span>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.gradient} opacity-20`} />
                </div>
                <div className={`text-3xl font-black ${theme.text} mb-1`}>{stat.value.toLocaleString()}</div>
                <div className={theme.textMuted}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Charts section */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Scan Analytics */}
            <div className={`rounded-2xl p-6 border transition-colors`}
              style={{ background: theme.card, borderColor: theme.cardBorder }}>
              <h2 className={`text-xl font-bold ${theme.text} mb-6`}>{t(lang, "scanAnalytics")}</h2>
              <div className="h-80 flex items-center justify-center text-center">
                <div className={theme.textMuted}>No data available</div>
              </div>
            </div>

            {/* Top Countries */}
            <div className={`rounded-2xl p-6 border transition-colors`}
              style={{ background: theme.card, borderColor: theme.cardBorder }}>
              <h2 className={`text-xl font-bold ${theme.text} mb-6`}>{t(lang, "topCountries")}</h2>
              <div className="space-y-3">
                {[
                  { country: "🇺🇿 Uzbekistan", scans: "38.2%", value: 38 },
                  { country: "🇹🇷 Turkey", scans: "16.7%", value: 17 },
                  { country: "🇷🇺 Russia", scans: "12.4%", value: 12 },
                  { country: "🇮🇳 India", scans: "8.9%", value: 9 },
                  { country: "🇺🇸 USA", scans: "6.3%", value: 6 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className={`text-sm ${theme.text}`}>{item.country}</span>
                    <div className="flex items-center gap-2">
                      <div className={`h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500`} style={{ width: `${item.value * 2}px` }} />
                      <span className="text-xs text-cyan-400 font-semibold w-10 text-right">{item.scans}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Activity & Quick Create */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Recent Activity */}
            <div className={`rounded-2xl p-6 border transition-colors`}
              style={{ background: theme.card, borderColor: theme.cardBorder }}>
              <h2 className={`text-xl font-bold ${theme.text} mb-4`}>{t(lang, "recentActivity")}</h2>
              <div className="space-y-2">
                {[
                  { id: "4wp1w4", location: "Tashkent, Uzbekistan", time: "2 min ago" },
                  { id: "wifi-qr", location: "Istanbul, Turkey", time: "5 min ago" },
                  { id: "pdf-guide", location: "Moscow, Russia", time: "12 min ago" },
                  { id: "event-ticket", location: "New Delhi, India", time: "18 min ago" },
                  { id: "link-bio", location: "New York, USA", time: "25 min ago" },
                ].map((item, i) => (
                  <div key={i} className={`p-3 rounded-xl border transition ${dark ? "bg-white/3 border-white/5 hover:bg-white/5" : "bg-black/3 border-black/5 hover:bg-black/5"}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className={`text-sm font-medium ${theme.text}`}>{item.id}</div>
                        <div className={`text-xs ${theme.textMuted}`}>{item.location}</div>
                      </div>
                      <div className={`text-xs ${theme.textMuted}`}>{item.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Create */}
            <div className={`rounded-2xl p-6 border transition-colors`}
              style={{ background: theme.card, borderColor: theme.cardBorder }}>
              <h2 className={`text-xl font-bold ${theme.text} mb-4`}>{t(lang, "quickCreate")}</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "URL QR", icon: "🔗", color: "from-blue-500 to-blue-700" },
                  { name: "WiFi QR", icon: "📶", color: "from-green-500 to-green-700" },
                  { name: "vCard", icon: "👤", color: "from-orange-500 to-orange-700" },
                  { name: "File QR", icon: "📁", color: "from-pink-500 to-pink-700" },
                  { name: "Email QR", icon: "📧", color: "from-purple-500 to-purple-700" },
                  { name: "SMS QR", icon: "💬", color: "from-yellow-500 to-yellow-700" },
                ].map((tool, i) => (
                  <Link key={i} href="/"
                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition hover:scale-105 ${dark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-zinc-100 border-zinc-200 hover:bg-zinc-200"}`}>
                    <div className="text-2xl">{tool.icon}</div>
                    <span className={`text-xs font-semibold text-center ${theme.text}`}>{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Recent Scans Table */}
          <div className={`rounded-2xl p-6 border transition-colors`}
            style={{ background: theme.card, borderColor: theme.cardBorder }}>
            <h2 className={`text-xl font-bold ${theme.text} mb-4`}>{t(lang, "recentScans")}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${dark ? "border-white/10" : "border-zinc-200"}`}>
                    <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>QR Code</th>
                    <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>Country</th>
                    <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>Device</th>
                    <th className={`text-left py-3 px-4 font-semibold ${theme.textMuted}`}>Browser</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { slug: "qr-001", country: "Uzbekistan", device: "Mobile", browser: "Chrome" },
                    { slug: "wifi-qr", country: "Turkey", device: "Desktop", browser: "Safari" },
                    { slug: "pdf-guide", country: "Russia", device: "Mobile", browser: "Firefox" },
                    { slug: "event-ticket", country: "India", device: "Tablet", browser: "Chrome" },
                  ].map((row, i) => (
                    <tr key={i} className={`border-b ${dark ? "border-white/5 hover:bg-white/3" : "border-zinc-100 hover:bg-black/3"}`}>
                      <td className={`py-3 px-4 font-medium ${theme.text}`}>{row.slug}</td>
                      <td className={`py-3 px-4 ${theme.textMuted}`}>{row.country}</td>
                      <td className={`py-3 px-4 ${theme.textMuted}`}>{row.device}</td>
                      <td className={`py-3 px-4 ${theme.textMuted}`}>{row.browser}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
