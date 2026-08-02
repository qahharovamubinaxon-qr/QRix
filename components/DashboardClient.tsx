"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardLinks from "@/components/DashboardLinks";
import LogoutButton from "@/components/LogoutButton";
import InviteCard from "@/components/InviteCard";
import DashboardExtras from "@/components/DashboardExtras";
import { useModalA11y } from "@/lib/use-modal-a11y";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  FiSearch, FiBell, FiPlus, FiGrid, FiBarChart2,
  FiLink, FiWifi, FiMail, FiSend, FiMessageSquare, FiUser,
  FiFileText, FiImage, FiMessageCircle, FiChevronDown, FiZap,
  FiMenu, FiX,
} from "react-icons/fi";

type LinkItem = {
  id?: string | number;
  slug: string;
  target_url: string;
  scans: number;
  pin?: string | null;
  created_at?: string;
};

type ScanItem = {
  id: string | number;
  slug: string;
  country?: string | null;
  device?: string | null;
  browser?: string | null;
  scanned_at: string;
};

type Props = {
  links: LinkItem[];
  scans: ScanItem[];
  email: string;
  now: string;
};

const DONUT_COLORS = ["#8b5cf6", "#22d3ee", "#3b82f6", "#ec4899", "#f59e0b", "#64748b"];

const DAY_MS = 24 * 60 * 60 * 1000;

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeAgo(date: string, nowMs: number) {
  const diff = Math.max(0, nowMs - new Date(date).getTime());
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  return `${d} d ago`;
}

function pctChange(current: number, prev: number) {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 1000) / 10;
}

export default function DashboardClient({ links, scans, email, now }: Props) {
  const [search, setSearch] = useState("");
  const [range, setRange] = useState(7);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // the drawer owns the screen while open — don't scroll the page behind it
  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileNavOpen]);

  const drawerRef = useModalA11y<HTMLDivElement>(mobileNavOpen, () => setMobileNavOpen(false));

  const nowMs = useMemo(() => new Date(now).getTime(), [now]);
  const userName = email.split("@")[0] || "User";


  /* ============ РЕАЛ ҲИСОБ-КИТОБЛАР ============ */

  const totalLinks = links.length;
  const totalScans = links.reduce((s, l) => s + (l.scans || 0), 0);

  const countriesCount = useMemo(
    () => new Set(scans.map((s) => s.country).filter(Boolean)).size,
    [scans]
  );
  const devicesCount = useMemo(
    () => new Set(scans.map((s) => s.device).filter(Boolean)).size,
    [scans]
  );

  // Ҳафталик ўсиш — реал: бу ҳафта vs ўтган ҳафта
  const weekStats = useMemo(() => {
    const weekAgo = nowMs - 7 * DAY_MS;
    const twoWeeksAgo = nowMs - 14 * DAY_MS;
    const thisWeek = scans.filter((s) => new Date(s.scanned_at).getTime() >= weekAgo);
    const prevWeek = scans.filter((s) => {
      const t = new Date(s.scanned_at).getTime();
      return t >= twoWeeksAgo && t < weekAgo;
    });
    const linksThis = links.filter(
      (l) => l.created_at && new Date(l.created_at).getTime() >= weekAgo
    ).length;
    const linksPrev = links.filter((l) => {
      if (!l.created_at) return false;
      const t = new Date(l.created_at).getTime();
      return t >= twoWeeksAgo && t < weekAgo;
    }).length;

    const cThis = new Set(thisWeek.map((s) => s.country).filter(Boolean)).size;
    const cPrev = new Set(prevWeek.map((s) => s.country).filter(Boolean)).size;
    const dThis = new Set(thisWeek.map((s) => s.device).filter(Boolean)).size;
    const dPrev = new Set(prevWeek.map((s) => s.device).filter(Boolean)).size;

    return {
      scans: pctChange(thisWeek.length, prevWeek.length),
      links: pctChange(linksThis, linksPrev),
      countries: pctChange(cThis, cPrev),
      devices: pctChange(dThis, dPrev),
    };
  }, [scans, links, nowMs]);

  // Кунлик сканлар (танланган range бўйича) — Scan Analytics чарт
  const chartData = useMemo(() => {
    const days: { date: string; label: string; scans: number }[] = [];
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date(nowMs - i * DAY_MS);
      const key = d.toISOString().split("T")[0];
      days.push({ date: key, label: fmtDate(d), scans: 0 });
    }
    const map = new Map(days.map((d) => [d.date, d]));
    for (const s of scans) {
      const key = new Date(s.scanned_at).toISOString().split("T")[0];
      const row = map.get(key);
      if (row) row.scans++;
    }
    return days;
  }, [scans, range, nowMs]);

  // Мини-спарклайнлар учун кунлик маълумот (7 кун)
  const spark = useMemo(() => {
    const mk = () =>
      Array.from({ length: 7 }, (_, i) => {
        const d = new Date(nowMs - (6 - i) * DAY_MS);
        return { key: d.toISOString().split("T")[0], v: 0 };
      });
    const scansArr = mk(), linksArr = mk(), countryArr = mk(), deviceArr = mk();
    const cSets = countryArr.map(() => new Set<string>());
    const dSets = deviceArr.map(() => new Set<string>());

    for (const s of scans) {
      const key = new Date(s.scanned_at).toISOString().split("T")[0];
      const idx = scansArr.findIndex((r) => r.key === key);
      if (idx >= 0) {
        scansArr[idx].v++;
        if (s.country) cSets[idx].add(s.country);
        if (s.device) dSets[idx].add(s.device);
      }
    }
    for (const l of links) {
      if (!l.created_at) continue;
      const key = new Date(l.created_at).toISOString().split("T")[0];
      const idx = linksArr.findIndex((r) => r.key === key);
      if (idx >= 0) linksArr[idx].v++;
    }
    cSets.forEach((set, i) => (countryArr[i].v = set.size));
    dSets.forEach((set, i) => (deviceArr[i].v = set.size));
    return { scansArr, linksArr, countryArr, deviceArr };
  }, [scans, links, nowMs]);

  // Top Countries — реал агрегация
  const topCountries = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const s of scans) {
      const c = s.country || "Unknown";
      counts[c] = (counts[c] || 0) + 1;
    }
    const total = scans.length || 1;
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const top = sorted.slice(0, 5).map(([name, count]) => ({
      name,
      count,
      pct: Math.round((count / total) * 1000) / 10,
    }));
    const restCount = sorted.slice(5).reduce((s, [, c]) => s + c, 0);
    if (restCount > 0) {
      top.push({ name: "Others", count: restCount, pct: Math.round((restCount / total) * 1000) / 10 });
    }
    return top;
  }, [scans]);

  // Recent Activity — реал сканлар
  const recentActivity = scans.slice(0, 5);

  // Notifications — охирги 24 соатдаги сканлар
  const notif24h = useMemo(
    () => scans.filter((s) => nowMs - new Date(s.scanned_at).getTime() < DAY_MS),
    [scans, nowMs]
  );

  // Search — линкларни реал фильтрлаш
  const filteredLinks = useMemo(() => {
    if (!search.trim()) return links;
    const q = search.toLowerCase();
    return links.filter(
      (l) =>
        l.slug.toLowerCase().includes(q) ||
        (l.target_url || "").toLowerCase().includes(q)
    );
  }, [links, search]);

  const dateRange = `${fmtDate(new Date(nowMs - (range - 1) * DAY_MS))} - ${fmtDate(
    new Date(nowMs)
  )}, ${new Date(nowMs).getFullYear()}`;

  const statCards = [
    { label: "Total QR Codes", value: totalLinks, pct: weekStats.links, color: "#a78bfa", data: spark.linksArr, tint: "rgba(139,92,246,.16)", icon: <FiGrid /> },
    { label: "Total Scans", value: totalScans, pct: weekStats.scans, color: "#2dd4bf", data: spark.scansArr, tint: "rgba(45,212,191,.14)", icon: <FiBarChart2 /> },
    { label: "Countries", value: countriesCount, pct: weekStats.countries, color: "#38bdf8", data: spark.countryArr, tint: "rgba(56,189,248,.14)", icon: <FiSend /> },
    { label: "Devices", value: devicesCount, pct: weekStats.devices, color: "#ec4899", data: spark.deviceArr, tint: "rgba(236,72,153,.14)", icon: <FiUser /> },
  ];

  const navMain = [
    { href: "/dashboard", label: "Dashboard", icon: <FiGrid size={16} />, active: true },
    { href: "/qr-tools/url", label: "URL QR", icon: <FiLink size={16} /> },
    { href: "/qr-tools/wifi", label: "WiFi QR", icon: <FiWifi size={16} /> },
    { href: "/qr-tools/whatsapp", label: "WhatsApp QR", icon: <FiMessageCircle size={16} /> },
    { href: "/qr-tools/email", label: "Email QR", icon: <FiMail size={16} /> },
    { href: "/qr-tools/telegram", label: "Telegram QR", icon: <FiSend size={16} /> },
    { href: "/qr-tools/sms", label: "SMS QR", icon: <FiMessageSquare size={16} /> },
    { href: "/qr-tools/vcard", label: "vCard / NFC", icon: <FiUser size={16} /> },
    { href: "/pdf-tools", label: "PDF Tools", icon: <FiFileText size={16} /> },
    { href: "/image-tools", label: "Image Tools", icon: <FiImage size={16} /> },
  ];

  const quickCreate = [
    { href: "/qr-tools/url", label: "URL QR", desc: "Generate QR for any link", icon: <FiLink size={20} />, grad: "linear-gradient(135deg,#4f46e5,#3b82f6)" },
    { href: "/qr-tools/wifi", label: "WiFi QR", desc: "Share WiFi instantly", icon: <FiWifi size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)" },
    { href: "/qr-tools/vcard", label: "vCard / NFC", desc: "Digital business card", icon: <FiUser size={20} />, grad: "linear-gradient(135deg,#d97706,#fbbf24)" },
    { href: "/qr-tools/email", label: "Email QR", desc: "Pre-filled emails", icon: <FiMail size={20} />, grad: "linear-gradient(135deg,#db2777,#f472b6)" },
    { href: "/qr-tools/sms", label: "SMS QR", desc: "Instant messages", icon: <FiMessageSquare size={20} />, grad: "linear-gradient(135deg,#7c3aed,#a78bfa)" },
    { href: "/pdf-tools", label: "PDF Tools", desc: "Convert & compress", icon: <FiFileText size={20} />, grad: "linear-gradient(135deg,#ea580c,#fb923c)" },
  ];

  const sidebarInner = (
    <>
      <Link href="/" className="font-display flex items-center gap-1 px-2 mb-7 mt-1">
        <span className="text-[26px] font-bold tracking-tight" style={{ color: "var(--text)" }}>QR</span>
        <span
          className="text-[26px] font-bold tracking-tight"
          style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}
        >
          ix
        </span>
      </Link>

      <nav className="flex-1 space-y-1">
        {navMain.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileNavOpen(false)}
            className={`qx-navlink ${item.active ? "active" : ""}`}
          >
            <span style={{ color: item.active ? "var(--primary-bright)" : undefined }}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Upgrade card — расмдагидек */}
      <div
        className="rounded-2xl p-4 mt-6"
        style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7 60%,#6366f1)", boxShadow: "var(--shadow-pop)" }}
      >
        <div className="font-display font-bold text-white text-sm">Upgrade to Pro</div>
        <p className="text-[11px] mt-1 leading-relaxed" style={{ color: "rgba(255,255,255,.75)" }}>
          Unlock advanced features, custom domains, and more.
        </p>
        <Link
          href="/register"
          className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition hover:opacity-90"
          style={{ background: "rgba(255,255,255,.95)", color: "#6d28d9" }}
        >
          <FiZap size={13} /> Upgrade Now
        </Link>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* ================= SIDEBAR — desktop only; phones get the drawer ================= */}
      <aside
        className="hidden lg:flex w-60 shrink-0 min-h-screen sticky top-0 max-h-screen overflow-y-auto flex-col p-4"
        style={{ background: "var(--surface)", borderRight: "1px solid var(--border)", backdropFilter: "blur(20px)" }}
      >
        {sidebarInner}
      </aside>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileNavOpen && (
        <div ref={drawerRef} className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Dashboard menu">
          <div className="absolute inset-0" style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(4px)" }}
            onClick={() => setMobileNavOpen(false)} />
          <aside
            className="absolute left-0 top-0 bottom-0 w-[270px] max-w-[82vw] overflow-y-auto flex flex-col p-4"
            style={{ background: "var(--surface-solid)", borderRight: "1px solid var(--border)", overscrollBehavior: "contain" }}
          >
            <button onClick={() => setMobileNavOpen(false)} aria-label="Close menu"
              className="qx-btn-ghost !p-2 self-end -mb-9"><FiX size={16} /></button>
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* ================= MAIN ================= */}
      <main className="flex-1 min-w-0">
        {/* Header — расмдагидек */}
        <header
          className="sticky top-0 z-40 px-4 lg:px-7 py-3.5 flex items-center gap-3 lg:gap-4"
          style={{
            background: "color-mix(in srgb, var(--surface-solid) 75%, transparent)",
            borderBottom: "1px solid var(--border)",
            backdropFilter: "blur(20px)",
          }}
        >
          {/* Hamburger — opens the drawer on phones */}
          <button onClick={() => setMobileNavOpen(true)} aria-label="Open dashboard menu"
            className="qx-btn-ghost !p-2.5 lg:hidden shrink-0">
            <FiMenu size={16} />
          </button>

          {/* Search — реал фильтр */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl flex-1 min-w-0 max-w-md"
            style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}
          >
            <FiSearch size={15} style={{ color: "var(--text-faint)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your QR codes..."
              className="bg-transparent outline-none text-sm flex-1 !border-0 !shadow-none"
              style={{ color: "var(--text)", background: "transparent", border: "none" }}
            />
          </div>

          <div className="flex items-center gap-2.5 ml-auto shrink-0">
            <Link href="/qr-tools/url" className="qx-btn !py-2.5">
              <FiPlus size={15} /> <span className="hidden sm:inline">Create QR</span>
            </Link>

            {/* Notifications — реал (охирги 24 соат) */}
            <div className="relative">
              <button onClick={() => setNotifOpen(!notifOpen)} className="qx-btn-ghost !p-2.5 relative" aria-label="Notifications">
                <FiBell size={15} />
                {notif24h.length > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center text-white"
                    style={{ background: "linear-gradient(135deg,#7c3aed,#a855f7)" }}
                  >
                    {notif24h.length > 99 ? "99+" : notif24h.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-72 rounded-2xl overflow-hidden z-50"
                  style={{ background: "var(--surface-solid)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-pop)" }}
                >
                  <div className="px-4 py-3 text-xs font-bold" style={{ borderBottom: "1px solid var(--border)", color: "var(--text)" }}>
                    Scans — last 24h ({notif24h.length})
                  </div>
                  {notif24h.slice(0, 5).map((s) => (
                    <div key={s.id} className="px-4 py-2.5 text-xs" style={{ borderBottom: "1px solid var(--border)" }}>
                      <span className="font-semibold" style={{ color: "var(--text)" }}>{s.slug}</span>
                      <span style={{ color: "var(--text-muted)" }}> — {s.country || "Unknown"} · {timeAgo(s.scanned_at, nowMs)}</span>
                    </div>
                  ))}
                  {notif24h.length === 0 && (
                    <div className="px-4 py-4 text-xs" style={{ color: "var(--text-muted)" }}>No scans in the last 24 hours</div>
                  )}
                </div>
              )}
            </div>

            {/* User — реал email */}
            <div className="flex items-center gap-2.5 pl-2">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold uppercase"
                style={{ background: "var(--grad-primary)" }}
              >
                {userName.slice(0, 2)}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-bold leading-tight" style={{ color: "var(--text)" }}>{userName}</div>
                <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>{email}</div>
              </div>
              <div className="hidden md:block"><LogoutButton /></div>
            </div>
          </div>
        </header>

        {/* ============ CONTENT ============ */}
        <div className="p-4 sm:p-7 max-w-[1500px]">
          {/* Title row */}
          <div className="flex flex-wrap items-end justify-between gap-4 qx-rise">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Dashboard</h1>
              <p className="mt-1.5 text-sm" style={{ color: "var(--text-muted)" }}>Welcome back, {userName}! 👋</p>
            </div>
            <div className="qx-btn-ghost !text-xs !cursor-default">📅 {dateRange}</div>
          </div>

          {/* Stat cards — реал рақамлар + спарклайн */}
          <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-5 mt-7">
            {statCards.map((card, i) => (
              <div key={card.label} className={`qx-card qx-card-lift qx-rise qx-rise-${i + 1} p-5 pb-2`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[13px] font-medium" style={{ color: "var(--text-muted)" }}>{card.label}</p>
                    <div className="font-display text-[34px] font-bold mt-1 leading-none" style={{ color: "var(--text)" }}>
                      {card.value.toLocaleString()}
                    </div>
                    <div className="text-[11px] font-semibold mt-2" style={{ color: card.pct >= 0 ? "#34d399" : "#f87171" }}>
                      {card.pct >= 0 ? "↑" : "↓"} {Math.abs(card.pct)}% this week
                    </div>
                  </div>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: card.tint, color: card.color }}>
                    {card.icon}
                  </div>
                </div>
                <div className="h-12 mt-2 -mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={card.data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`sp${i}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={card.color} stopOpacity={0.35} />
                          <stop offset="100%" stopColor={card.color} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={card.color} strokeWidth={2} fill={`url(#sp${i})`} dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {/* Referral / invite-friends growth card */}
          <DashboardExtras />
          <InviteCard />

          {/* Scan Analytics + Top Countries + Recent Activity */}
          <div className="grid xl:grid-cols-[1.6fr_1fr_1fr] lg:grid-cols-2 gap-5 mt-6">
            {/* Scan Analytics — реал, фильтрли */}
            <div className="qx-card p-6 lg:col-span-2 xl:col-span-1">
              <div className="flex items-center justify-between mb-5">
                <h2 className="qx-title" style={{ color: "var(--text)" }}>Scan Analytics</h2>
                <select
                  value={range}
                  onChange={(e) => setRange(Number(e.target.value))}
                  className="!text-xs !py-1.5 !px-3 font-semibold cursor-pointer"
                  style={{ color: "var(--text)" }}
                >
                  <option value={7}>7 Days</option>
                  <option value={14}>14 Days</option>
                  <option value={30}>30 Days</option>
                </select>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                    <defs>
                      <linearGradient id="qxMain" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 6" stroke="rgba(139,92,246,.12)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: "#9b9bb3", fontSize: 10 }} axisLine={false} tickLine={false} dy={8} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: "#9b9bb3", fontSize: 10 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "rgba(17,17,32,.95)", border: "1px solid rgba(139,92,246,.3)", borderRadius: 12, color: "#f4f4f8", fontSize: 12 }}
                      labelStyle={{ color: "#9b9bb3", marginBottom: 4 }}
                    />
                    <Area type="monotone" dataKey="scans" name="Scans" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#qxMain)"
                      dot={{ r: 3, fill: "#8b5cf6", strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#22d3ee", strokeWidth: 2, stroke: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Countries — реал донат */}
            <div className="qx-card p-6">
              <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Top Countries</h2>
              {topCountries.length === 0 ? (
                <div className="h-60 flex items-center justify-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No scan data yet
                </div>
              ) : (
                <>
                  <div className="h-44 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={topCountries} dataKey="count" nameKey="name" innerRadius={52} outerRadius={72} paddingAngle={3} strokeWidth={0}>
                          {topCountries.map((_, i) => (
                            <Cell key={i} fill={DONUT_COLORS[i % DONUT_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ background: "rgba(17,17,32,.95)", border: "1px solid rgba(139,92,246,.3)", borderRadius: 12, color: "#f4f4f8", fontSize: 12 }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <div className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{totalScans.toLocaleString()}</div>
                      <div className="text-[10px]" style={{ color: "var(--text-muted)" }}>Total</div>
                    </div>
                  </div>
                  <div className="space-y-2 mt-3">
                    {topCountries.map((c, i) => (
                      <div key={c.name} className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2" style={{ color: "var(--text)" }}>
                          <span className="w-2.5 h-2.5 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                          {c.name}
                        </span>
                        <span className="font-bold" style={{ color: "var(--text-muted)" }}>{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Recent Activity — реал */}
            <div className="qx-card p-6">
              <h2 className="qx-title mb-4" style={{ color: "var(--text)" }}>Recent Activity</h2>
              <div className="space-y-2.5">
                {recentActivity.length === 0 && (
                  <div className="text-sm py-8 text-center" style={{ color: "var(--text-muted)" }}>No activity yet</div>
                )}
                {recentActivity.map((s, i) => (
                  <div key={s.id} className="flex items-center gap-3 p-2.5 rounded-xl transition-colors"
                    style={{ background: "var(--surface-hover)", border: "1px solid var(--border)" }}>
                    <div className="w-9 h-9 rounded-lg shrink-0 flex items-center justify-center text-white text-xs"
                      style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }}>
                      <FiBarChart2 size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate" style={{ color: "var(--text)" }}>{s.slug}</div>
                      <div className="text-[10px] truncate" style={{ color: "var(--text-muted)" }}>
                        Scanned from {s.country || "Unknown"}{s.device ? ` · ${s.device}` : ""}
                      </div>
                    </div>
                    <div className="text-[10px] shrink-0" style={{ color: "var(--text-faint)" }}>{timeAgo(s.scanned_at, nowMs)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Create — реал линклар */}
          <div className="qx-card p-6 mt-6">
            <h2 className="qx-title mb-5" style={{ color: "var(--text)" }}>Quick Create</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {quickCreate.map((q) => (
                <Link key={q.href + q.label} href={q.href} className="qx-tile !items-center text-center">
                  <span className="qx-tile-icon text-white" style={{ background: q.grad }}>{q.icon}</span>
                  <span>{q.label}</span>
                  <span className="text-[10px] font-normal -mt-1" style={{ color: "var(--text-muted)" }}>{q.desc}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Dynamic QR Links — Edit / Analytics / Delete реал ишлайди */}
          <div className="qx-card p-6 mt-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="qx-title" style={{ color: "var(--text)" }}>My QR Codes</h2>
              {search && (
                <span className="qx-badge">🔍 "{search}" — {filteredLinks.length} found</span>
              )}
            </div>
            {filteredLinks.length === 0 ? (
              <div className="text-sm py-10 text-center" style={{ color: "var(--text-muted)" }}>
                {search ? "Nothing matches your search" : "No QR codes yet — create your first one!"}
              </div>
            ) : (
              <DashboardLinks links={filteredLinks} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
