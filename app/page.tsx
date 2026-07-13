"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import ReviewsSection from "@/components/ReviewsSection";
import { trackTool } from "@/lib/track";
import { QR_TOOLS } from "@/lib/qr-tools-meta";
import CategoryShowcase from "@/components/CategoryShowcase";
import TrustedBy from "@/components/TrustedBy";
import HomeFaq from "@/components/HomeFaq";
import LatestPosts from "@/components/LatestPosts";
import QRDesignStudio from "@/components/QRDesignStudio";
import { OrbitIcons } from "@/components/HeroMotion";
import HeroSearch from "@/components/HeroSearch";
import EraBunny, { GenBunny } from "@/components/EraBunny";
import GlitterField from "@/components/GlitterField";
import QrixPromoFilm from "@/components/QrixPromoFilm";
import {
  FiLink, FiType, FiWifi, FiUser, FiGrid, FiChevronDown, FiLock,
  FiDownload, FiSliders, FiX, FiMail, FiMessageSquare, FiSend,
  FiMessageCircle, FiPlay, FiArrowRight, FiZap, FiRefreshCw,
  FiShield, FiPenTool, FiBarChart2, FiCamera, FiFileText, FiImage,
  FiUpload, FiTrash2, FiCheck,
  FiLayers, FiMinimize2, FiMaximize2, FiDroplet, FiScissors,
  FiTrendingUp,
} from "react-icons/fi";

type Lang = "en" | "ru" | "uz";

/* ================= I18N ================= */
const T: Record<Lang, Record<string, string>> = {
  en: {
    badge: "🚀 The All-in-One QR Platform",
    h1a: "Generate. Track.", h1b: "Analyze.", h1c: "Grow.",
    sub: "185+ free tools in your browser — QR codes with live analytics, PDF & image converters, AI generators, video and 3D. Nothing leaves your device.",
    cta: "Create Your First QR Code", demo: "Watch Demo", rating: "4.9/5 from 2,847+ users",
    cardTitle: "Create Your QR Code", cardSub: "It's fast, easy and free to get started.",
    url: "URL", text: "Text", wifi: "WiFi", vcard: "vCard", more: "More",
    enterUrl: "Enter your URL", enterText: "Enter your text",
    ssid: "Network name (SSID)", password: "Password",
    fullName: "Full name", phone: "Phone", emailL: "Email", org: "Company",
    emailTo: "Recipient email", subject: "Subject", body: "Message",
    smsPhone: "Phone number", smsMsg: "Message",
    waPhone: "WhatsApp number (998...)", waMsg: "Message (optional)",
    tgUser: "Telegram username (without @)",
    pin: "Add PIN Protection", pinOpt: "(optional)", pinPh: "Enter 4–10 digit PIN",
    pinInfo: "Scans will require this PIN. Creates a protected dynamic link.",
    confirmPin: "Confirm PIN", pinSet: "PIN set — it will be added to the QR code.",
    generate: "Generate QR Code", generating: "Creating...",
    yourQr: "Your QR Code", dlPng: "Download PNG", dlSvg: "Download SVG",
    customize: "Customize Design",
    protected: "PIN-protected link created:",
    designTitle: "QR Design Studio", qrColor: "QR Color", bgColor: "Background",
    size: "Size", errLevel: "Error Correction", logo: "Logo", uploadLogo: "Upload logo",
    removeLogo: "Remove", done: "Done",
    statQr: "QR Codes Created", statScans: "Total Scans", statCountries: "Countries Reached",
    statBiz: "Happy Businesses", statUptime: "Uptime & Reliable",
    whyTitle: "Why", whySub: "Everything you need to create, manage and track QR codes",
    f1: "Real-time Analytics", f1d: "Track scans, locations, devices and much more in real-time.",
    f2: "Dynamic QR Codes", f2d: "Update your destination anytime without changing the QR code.",
    f3: "Advanced Security", f3d: "PIN protection, expiry, limits and spam protection.",
    f4: "Beautiful Customization", f4d: "Custom colors, logos, frames and unique designs.",
    toolsTitle: "All tools in one place",
    footAbout: "Professional QR code generator with real-time analytics, PDF and image tools — all in one platform.",
    footProduct: "Product", footTools: "Tools", footContact: "Contact",
    rights: "All rights reserved.",
  },
  ru: {
    badge: "🚀 Всё-в-одном QR платформа",
    h1a: "Создавай. Отслеживай.", h1b: "Анализируй.", h1c: "Расти.",
    sub: "185+ бесплатных инструментов в браузере — QR коды с аналитикой, PDF и фото конвертеры, AI генераторы, видео и 3D. Файлы не покидают устройство.",
    cta: "Создать первый QR код", demo: "Смотреть демо", rating: "4.9/5 от 2,847+ пользователей",
    cardTitle: "Создайте ваш QR код", cardSub: "Быстро, легко и бесплатно.",
    url: "URL", text: "Текст", wifi: "WiFi", vcard: "vCard", more: "Ещё",
    enterUrl: "Введите URL", enterText: "Введите текст",
    ssid: "Имя сети (SSID)", password: "Пароль",
    fullName: "Полное имя", phone: "Телефон", emailL: "Email", org: "Компания",
    emailTo: "Email получателя", subject: "Тема", body: "Сообщение",
    smsPhone: "Номер телефона", smsMsg: "Сообщение",
    waPhone: "Номер WhatsApp (998...)", waMsg: "Сообщение (необязательно)",
    tgUser: "Telegram username (без @)",
    pin: "PIN защита", pinOpt: "(опционально)", pinPh: "PIN из 4–10 цифр",
    pinInfo: "Для сканирования потребуется PIN. Создаётся защищённая динамическая ссылка.",
    confirmPin: "Подтвердить", pinSet: "PIN установлен — добавлен в QR код.",
    generate: "Создать QR код", generating: "Создание...",
    yourQr: "Ваш QR код", dlPng: "Скачать PNG", dlSvg: "Скачать SVG",
    customize: "Настроить дизайн",
    protected: "Создана PIN-защищённая ссылка:",
    designTitle: "Студия дизайна QR", qrColor: "Цвет QR", bgColor: "Фон",
    size: "Размер", errLevel: "Коррекция ошибок", logo: "Логотип", uploadLogo: "Загрузить лого",
    removeLogo: "Удалить", done: "Готово",
    statQr: "QR кодов создано", statScans: "Всего сканирований", statCountries: "Стран охвачено",
    statBiz: "Довольных бизнесов", statUptime: "Аптайм и надёжность",
    whyTitle: "Почему", whySub: "Всё для создания, управления и отслеживания QR кодов",
    f1: "Аналитика в реальном времени", f1d: "Отслеживайте сканы, локации, устройства и многое другое.",
    f2: "Динамические QR коды", f2d: "Меняйте назначение в любой момент без замены QR кода.",
    f3: "Продвинутая безопасность", f3d: "PIN защита, срок действия, лимиты и антиспам.",
    f4: "Красивая кастомизация", f4d: "Свои цвета, логотипы, рамки и уникальные дизайны.",
    toolsTitle: "Все инструменты в одном месте",
    footAbout: "Профессиональный генератор QR кодов с аналитикой, PDF и графическими инструментами — всё на одной платформе.",
    footProduct: "Продукт", footTools: "Инструменты", footContact: "Контакты",
    rights: "Все права защищены.",
  },
  uz: {
    badge: "🚀 Ҳаммаси-бирда QR платформа",
    h1a: "Яратинг. Кузатинг.", h1b: "Таҳлил қилинг.", h1c: "Ўсинг.",
    sub: "Браузерингизда 185+ бепул асбоб — аналитикали QR кодлар, PDF ва расм конвертерлари, AI генераторлар, видео ва 3D. Файллар қурилмангиздан чиқмайди.",
    cta: "Биринчи QR кодингизни яратинг", demo: "Демо кўриш", rating: "4.9/5 — 2,847+ фойдаланувчи",
    cardTitle: "QR кодингизни яратинг", cardSub: "Тез, осон ва бепул.",
    url: "URL", text: "Матн", wifi: "WiFi", vcard: "vCard", more: "Яна",
    enterUrl: "URL киритинг", enterText: "Матн киритинг",
    ssid: "Тармоқ номи (SSID)", password: "Парол",
    fullName: "Тўлиқ исм", phone: "Телефон", emailL: "Email", org: "Компания",
    emailTo: "Қабул қилувчи email", subject: "Мавзу", body: "Хабар",
    smsPhone: "Телефон рақам", smsMsg: "Хабар",
    waPhone: "WhatsApp рақам (998...)", waMsg: "Хабар (ихтиёрий)",
    tgUser: "Telegram username (@сиз)",
    pin: "PIN ҳимояси", pinOpt: "(ихтиёрий)", pinPh: "4–10 рақамли PIN",
    pinInfo: "Сканлаш учун PIN сўралади. Ҳимояланган динамик ссилка яратилади.",
    confirmPin: "Тасдиқлаш", pinSet: "PIN ўрнатилди — QR кодга қўшилади.",
    generate: "QR код яратиш", generating: "Яратилмоқда...",
    yourQr: "Сизнинг QR кодингиз", dlPng: "PNG юклаб олиш", dlSvg: "SVG юклаб олиш",
    customize: "Дизайнни созлаш",
    protected: "PIN-ҳимояланган ссилка яратилди:",
    designTitle: "QR Дизайн Студияси", qrColor: "QR ранги", bgColor: "Фон",
    size: "Ўлчам", errLevel: "Хато тузатиш", logo: "Логотип", uploadLogo: "Лого юклаш",
    removeLogo: "Ўчириш", done: "Тайёр",
    statQr: "QR код яратилган", statScans: "Жами сканлар", statCountries: "Давлат қамраб олинган",
    statBiz: "Мамнун бизнеслар", statUptime: "Аптайм ва ишончлилик",
    whyTitle: "Нега айнан", whySub: "QR кодлар яратиш, бошқариш ва кузатиш учун ҳамма нарса",
    f1: "Реал вақт аналитикаси", f1d: "Сканлар, жойлашув, қурилмалар ва кўп нарсани реал вақтда кузатинг.",
    f2: "Динамик QR кодлар", f2d: "QR кодни ўзгартирмасдан манзилни исталган пайт янгиланг.",
    f3: "Кучли хавфсизлик", f3d: "PIN ҳимояси, муддат, лимитлар ва спамдан ҳимоя.",
    f4: "Чиройли дизайн", f4d: "Ўз рангларингиз, логотиплар, рамкалар ва ноёб дизайнлар.",
    toolsTitle: "Барча асбоблар бир жойда",
    footAbout: "Реал вақт аналитикаси, PDF ва расм асбоблари билан профессионал QR генератор — ҳаммаси битта платформада.",
    footProduct: "Маҳсулот", footTools: "Асбоблар", footContact: "Алоқа",
    rights: "Барча ҳуқуқлар ҳимояланган.",
  },
};

const COLOR_PRESETS = ["#000000", "#bba9ff", "#2563eb", "#0891b2", "#16a34a", "#dc2626", "#db2777", "#d97706"];
const BG_PRESETS = ["#ffffff", "#f4f4f8", "#fef9c3", "#e0f2fe", "#f3e8ff", "#dcfce7", "#ffe4e6", "#0a0a14"];

/* Жонли санагич */
function CountUp({ end, suffix = "" }: { end: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        obs.disconnect();
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / dur);
          setVal(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [end]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("en");
  const t = T[lang];
  // Mission 41: NEW TOOLS ERA hero — the bunny carries the entrance now.

  /* ===== Tabs & forms ===== */
  const [tab, setTab] = useState("url");
  const [moreOpen, setMoreOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [utmOn, setUtmOn] = useState(false);
  const [utmSource, setUtmSource] = useState("");
  const [utmMedium, setUtmMedium] = useState("qr");
  const [utmCampaign, setUtmCampaign] = useState("");
  const [textVal, setTextVal] = useState("");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [vName, setVName] = useState("");
  const [vPhone, setVPhone] = useState("");
  const [vEmail, setVEmail] = useState("");
  const [vOrg, setVOrg] = useState("");
  const [emTo, setEmTo] = useState("");
  const [emSub, setEmSub] = useState("");
  const [emBody, setEmBody] = useState("");
  const [smsNum, setSmsNum] = useState("");
  const [smsMsg, setSmsMsg] = useState("");
  const [waNum, setWaNum] = useState("");
  const [waMsg, setWaMsg] = useState("");
  const [tgUser, setTgUser] = useState("");

  /* ===== PIN ===== */
  const [pinOn, setPinOn] = useState(false);
  const [pin, setPin] = useState("");
  const [pinConfirmed, setPinConfirmed] = useState(false);
  const [protectedUrl, setProtectedUrl] = useState("");

  /* ===== QR & design ===== */
  const [qrValue, setQrValue] = useState("https://qrix.uz");
  const [busy, setBusy] = useState(false);
  const [fg, setFg] = useState("#000000");
  const [bg, setBg] = useState("#ffffff");
  const [qrSize, setQrSize] = useState(220);
  const [level, setLevel] = useState<"L" | "M" | "Q" | "H">("H");
  const [logo, setLogo] = useState<string | null>(null);
  const [designOpen, setDesignOpen] = useState(false);
  const [dlOpen, setDlOpen] = useState(false);

  /* 3D tilt */
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const qrBoxRef = useRef<HTMLDivElement>(null);
  const canvasWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("language");
    if (saved === "ru" || saved === "uz" || saved === "en") setLang(saved);
    const onLang = () => {
      const l = localStorage.getItem("language");
      if (l === "ru" || l === "uz" || l === "en") setLang(l);
    };
    window.addEventListener("qrix-lang", onLang);
    return () => window.removeEventListener("qrix-lang", onLang);
  }, []);

  const buildUrlWithUtm = (raw: string): string => {
    if (!utmOn || (!utmSource && !utmCampaign)) return raw;
    try {
      const u = new URL(/^https?:\/\//.test(raw) ? raw : `https://${raw}`);
      if (utmSource) u.searchParams.set("utm_source", utmSource);
      if (utmMedium) u.searchParams.set("utm_medium", utmMedium);
      if (utmCampaign) u.searchParams.set("utm_campaign", utmCampaign);
      return u.toString();
    } catch {
      return raw;
    }
  };

  const buildValue = (): string => {
    switch (tab) {
      case "url": return buildUrlWithUtm(url.trim() || "https://qrix.uz");
      case "text": return textVal.trim() || "QRix";
      case "wifi": return `WIFI:T:WPA;S:${ssid};P:${wifiPass};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vName}\nTEL:${vPhone}\nEMAIL:${vEmail}\nORG:${vOrg}\nEND:VCARD`;
      case "email": return `mailto:${emTo}?subject=${encodeURIComponent(emSub)}&body=${encodeURIComponent(emBody)}`;
      case "sms": return `SMSTO:${smsNum}:${smsMsg}`;
      case "whatsapp": return `https://wa.me/${waNum.replace(/\D/g, "")}${waMsg ? `?text=${encodeURIComponent(waMsg)}` : ""}`;
      case "telegram": return `https://t.me/${tgUser.replace("@", "")}`;
      default: return "https://qrix.uz";
    }
  };

  /* Generate — PIN бўлса реал динамик ссилка яратади */
  const generate = async () => {
    setProtectedUrl("");
    trackTool("qr-generate", { type: tab });
    const raw = buildValue();

    if (pinOn && pin.length >= 4 && tab === "url") {
      setBusy(true);
      try {
        const res = await fetch("/api/create-dynamic", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: raw, pin }),
        });
        const data = await res.json();
        if (res.ok && data.dynamicUrl) {
          const full = `${location.origin}${data.dynamicUrl}`;
          setQrValue(full);
          setProtectedUrl(full);
        } else {
          setQrValue(raw);
        }
      } catch {
        setQrValue(raw);
      } finally {
        setBusy(false);
      }
    } else {
      setQrValue(raw);
    }
  };

  const downloadPng = () => {
    const canvas = canvasWrapRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = "qrix-code.png";
    a.click();
    setDlOpen(false);
  };

  const downloadSvg = () => {
    const svg = document.getElementById("qrix-svg-hidden")?.querySelector("svg");
    if (!svg) return;
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qrix-code.svg";
    a.click();
    URL.revokeObjectURL(a.href);
    setDlOpen(false);
  };

  const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setLogo(reader.result as string);
    reader.readAsDataURL(file);
  };

  const onTilt = (e: React.MouseEvent) => {
    const box = qrBoxRef.current;
    if (!box) return;
    const r = box.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: y * -10, y: x * 10 });
  };

  const tabs = [
    { id: "url", label: t.url, icon: <FiLink size={14} /> },
    { id: "text", label: t.text, icon: <FiType size={14} /> },
    { id: "wifi", label: t.wifi, icon: <FiWifi size={14} /> },
    { id: "vcard", label: t.vcard, icon: <FiUser size={14} /> },
  ];
  const moreTabs = [
    { id: "email", label: "Email", icon: <FiMail size={14} /> },
    { id: "sms", label: "SMS", icon: <FiMessageSquare size={14} /> },
    { id: "whatsapp", label: "WhatsApp", icon: <FiMessageCircle size={14} /> },
    { id: "telegram", label: "Telegram", icon: <FiSend size={14} /> },
  ];


  const stats = [
    { end: 185, suffix: "+", label: lang === "uz" ? "Текин восита" : lang === "ru" ? "Бесплатных инструментов" : "Free tools", icon: <FiGrid />, color: "#ff6a13" },
    { end: 1000000, suffix: "+", label: t.statQr, icon: <FiZap />, color: "#a78bfa" },
    { end: 50000000, suffix: "+", label: t.statScans, icon: <FiBarChart2 />, color: "#22d3ee" },
    { end: 150, suffix: "+", label: t.statCountries, icon: <FiSend />, color: "#3b82f6" },
    { end: 10000, suffix: "+", label: t.statBiz, icon: <FiUser />, color: "#ec4899" },
  ];

  const features = [
    { title: t.f1, desc: t.f1d, icon: <FiZap size={20} />, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { title: t.f2, desc: t.f2d, icon: <FiRefreshCw size={20} />, grad: "linear-gradient(135deg,#059669,#34d399)" },
    { title: t.f3, desc: t.f3d, icon: <FiShield size={20} />, grad: "linear-gradient(135deg,#d97706,#fbbf24)" },
    { title: t.f4, desc: t.f4d, icon: <FiPenTool size={20} />, grad: "linear-gradient(135deg,#bba9ff,#d946ef)" },
  ];

  const inputCls = "w-full px-4 py-3 text-sm rounded-xl";
  const inputStyle = {
    background: "var(--surface-2)",
    border: "1.5px solid var(--border)",
    color: "var(--text)",
  } as React.CSSProperties;

  return (
    <main className="relative overflow-x-clip">
      {/* Katana-style scroll scenes: fixed full-viewport canvas that cross-fades
          between rich gradient scenes as sections pass the viewport center. */}
      <div className="qx-scenes" aria-hidden>
        <div className="qx-scene on" data-scene="era" />
        <div className="qx-scene" data-scene="deep" />
        <div className="qx-scene" data-scene="dusk" />
        {/* Originkit Glitter Wrap — sparks live on the dark scenes only */}
        <GlitterField />
      </div>
      <style>{`
        @keyframes qxPulse{0%,100%{box-shadow:0 0 0 0 rgba(187,169,255,.35)}50%{box-shadow:0 0 0 14px rgba(187,169,255,0)}}
        .qx-toggle{width:44px;height:24px;border-radius:99px;position:relative;transition:background .25s;cursor:pointer;border:1px solid var(--border)}
        .qx-toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s;box-shadow:0 2px 6px rgba(0,0,0,.3)}
        .qx-toggle.on{background:#ff4d1c}.qx-toggle.on::after{transform:translateX(20px)}
        .qx-toggle.off{background:var(--surface-hover)}
      `}</style>

      {/* ================= HERO — NEW TOOLS ERA (Mission 41) ================= */}
      <section data-scene="era" className="qx-era relative">
        <EraBunny />
        <div className="max-w-[1480px] mx-auto px-5 lg:px-8 relative flex flex-col min-h-[96svh] pt-6 lg:pt-8">
          <span className="qx-era-ghost" aria-hidden>QRIX</span>

          <h1 className="qx-era-title">
            {(lang === "uz" ? "ЯНГИ ВОСИТАЛАР ДАВРИ" : lang === "ru" ? "НОВАЯ ЭРА ИНСТРУМЕНТОВ" : "NEW TOOLS ERA")
              .split(" ").map((w, i) => (
                <span className="qx-era-w" key={`${w}-${i}`}>
                  <span style={{ ["--i" as string]: i } as React.CSSProperties}>{w}</span>
                </span>
              ))}
            <span className="sr-only"> — QRix. {t.sub}</span>
          </h1>

          <div className="qx-era-stage">
            {/* left of the bunny — who QRix is */}
            <div className="qx-era-side qx-era-side--left">
              <p className="qx-era-kicker qx-mono">
                {lang === "uz" ? "// МЕН QRIX — БАРЧАСИ БРАУЗЕРИНГИЗДА"
                  : lang === "ru" ? "// Я QRIX — ВСЁ В ВАШЕМ БРАУЗЕРЕ"
                  : "// I'M QRIX — EVERYTHING IN YOUR BROWSER"}
              </p>
              <p className="qx-era-copy">{t.sub}</p>
            </div>

            {/* right of the bunny — the tool finder */}
            <div className="qx-era-side qx-era-side--right">
              <p className="qx-era-kicker qx-mono">
                {lang === "uz" ? "// ИШИНГИЗГА МОС ВОСИТА ТОПИНГ"
                  : lang === "ru" ? "// ИНСТРУМЕНТЫ ПОД ВАШИ ЗАДАЧИ"
                  : "// TOOLS THAT SPEAK YOUR WORKFLOW"}
              </p>
              <HeroSearch fly placeholder={
                lang === "uz" ? "Асбоб қидиринг… (жпг то пдф ҳам бўлади)"
                : lang === "ru" ? "Найдите инструмент… (можно кириллицей)"
                : "Search 185+ tools… (e.g. jpg to pdf)"
              } />
            </div>
          </div>

          {/* the reference's brand row — our six tool families, drifting */}
          <div className="qx-era-marq" aria-label="Tool categories">
            <div className="qx-era-marq-track">
              {[0, 1].map((dup) => (
                <div className="qx-era-marq-seg" key={dup} aria-hidden={dup === 1}>
                  {([["QR TOOLS", "/qr-tools"], ["PDF TOOLS", "/pdf-tools"], ["IMAGE TOOLS", "/image-tools"],
                     ["AI TOOLS", "/ai-tools"], ["VIDEO TOOLS", "/video-tools"], ["3D TOOLS", "/3d-tools"]] as const
                  ).map(([label, href]) => (
                    <Link key={`${href}-${dup}`} href={href} className="qx-era-cat" tabIndex={dup === 1 ? -1 : 0}>{label}</Link>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ================= GENERATOR — mascot left, two big glass cards ================= */}
      <section data-scene="deep" className="max-w-[1400px] mx-auto px-5 lg:px-8 pt-20 lg:pt-28 pb-24 relative">
        <GenBunny />
        <div id="generator" className="lg:ml-[24vw] grid lg:grid-cols-2 gap-6 items-stretch relative z-10">

          {/* LEFT — Generator form; type selector lives inside as a chip row (Mission 42) */}
          <div data-mascot-anchor="generator" className="qx-fcard flex flex-col" style={{ ["--fc" as string]:"#ffffff" } as React.CSSProperties}>
            <div className="px-2 pt-1 pb-3">
              <div className="qx-fcard-title text-[21px]">
                {lang==="uz"?"QR ЯРАТИШ" : lang==="ru"?"СОЗДАТЬ QR" : "CREATE QR CODE"}
              </div>
              <div className="qx-fcard-sub text-[12.5px] mt-0.5">{t.cardSub}</div>
            </div>
            <div className="qx-fcard-panel flex flex-col flex-1 p-4">

            {/* format chips — the old type card, compressed */}
            <div className="flex flex-wrap gap-1.5 mb-3.5">
              {[...tabs, ...moreTabs].map((tb) => (
                <button key={tb.id} onClick={()=>{ setTab(tb.id); setMoreOpen(false); }}
                  className="qx-typechip inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                  style={{
                    background: tab===tb.id ? "#ff4d1c" : "var(--surface-2)",
                    color: tab===tb.id ? "#0e0e0c" : "var(--text-muted)",
                    border: "1px solid " + (tab===tb.id ? "#ff4d1c" : "var(--card-border)"),
                  }}>
                  {tb.icon}{tb.label}
                </button>
              ))}
              <Link href="/qr-tools"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold"
                style={{ color:"var(--primary-bright)", border:"1px dashed var(--card-border)" }}>
                {lang==="uz"?"Барча форматлар" : lang==="ru"?"Все форматы" : "All formats"} <FiArrowRight size={11}/>
              </Link>
            </div>

            {/* Form fields */}
            <div className="space-y-2.5 flex-1">
              {tab==="url" && <>
                <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://yourwebsite.com" aria-label="Website URL" className={inputCls} style={inputStyle}/>
                <div className="rounded-xl p-2.5" style={{ background:"rgba(70,116,52,0.06)", border:"1px solid rgba(70,116,52,0.2)" }}>
                  <label className="flex items-center gap-2 text-[11px] font-semibold cursor-pointer" style={{ color:"var(--text)" }}>
                    <input type="checkbox" checked={utmOn} onChange={e=>setUtmOn(e.target.checked)} className="accent-green-600"/>
                    <FiBarChart2 size={12} style={{ color:"#467434" }}/>
                    {lang==="uz"?"UTM кузатув қўшиш" : lang==="ru"?"Добавить UTM-метки" : "Add UTM tracking"}
                    <span className="text-[10px] font-normal" style={{ color:"var(--text-faint)" }}>(Google Analytics)</span>
                  </label>
                  {utmOn && (
                    <div className="grid grid-cols-3 gap-1.5 mt-2">
                      <input value={utmSource} onChange={e=>setUtmSource(e.target.value)} placeholder="source" aria-label="UTM source" className={inputCls} style={{ ...inputStyle, fontSize:"12px", padding:"6px 8px" }}/>
                      <input value={utmMedium} onChange={e=>setUtmMedium(e.target.value)} placeholder="medium" aria-label="UTM medium" className={inputCls} style={{ ...inputStyle, fontSize:"12px", padding:"6px 8px" }}/>
                      <input value={utmCampaign} onChange={e=>setUtmCampaign(e.target.value)} placeholder="campaign" aria-label="UTM campaign" className={inputCls} style={{ ...inputStyle, fontSize:"12px", padding:"6px 8px" }}/>
                    </div>
                  )}
                </div>
              </>}
              {tab==="text" && <textarea value={textVal} onChange={e=>setTextVal(e.target.value)} rows={3} placeholder="QRix..." aria-label="Text to encode" className={`${inputCls} resize-none`} style={inputStyle}/>}
              {tab==="wifi" && <>
                <input value={ssid} onChange={e=>setSsid(e.target.value)} placeholder={t.ssid} aria-label={t.ssid} className={inputCls} style={inputStyle}/>
                <input value={wifiPass} onChange={e=>setWifiPass(e.target.value)} placeholder={t.password} aria-label={t.password} className={inputCls} style={inputStyle}/>
              </>}
              {tab==="vcard" && <div className="grid grid-cols-2 gap-2">
                <input value={vName} onChange={e=>setVName(e.target.value)} placeholder={t.fullName} aria-label={t.fullName} className={inputCls} style={inputStyle}/>
                <input value={vPhone} onChange={e=>setVPhone(e.target.value)} placeholder={t.phone} aria-label={t.phone} className={inputCls} style={inputStyle}/>
                <input value={vEmail} onChange={e=>setVEmail(e.target.value)} placeholder={t.emailL} aria-label={t.emailL} className={inputCls} style={inputStyle}/>
                <input value={vOrg} onChange={e=>setVOrg(e.target.value)} placeholder={t.org} aria-label={t.org} className={inputCls} style={inputStyle}/>
              </div>}
              {tab==="email" && <>
                <input value={emTo} onChange={e=>setEmTo(e.target.value)} placeholder={t.emailTo} aria-label={t.emailTo} className={inputCls} style={inputStyle}/>
                <input value={emSub} onChange={e=>setEmSub(e.target.value)} placeholder={t.subject} aria-label={t.subject} className={inputCls} style={inputStyle}/>
                <textarea value={emBody} onChange={e=>setEmBody(e.target.value)} rows={2} placeholder={t.body} aria-label={t.body} className={`${inputCls} resize-none`} style={inputStyle}/>
              </>}
              {tab==="sms" && <>
                <input value={smsNum} onChange={e=>setSmsNum(e.target.value)} placeholder={t.smsPhone} aria-label={t.smsPhone} className={inputCls} style={inputStyle}/>
                <textarea value={smsMsg} onChange={e=>setSmsMsg(e.target.value)} rows={2} placeholder={t.smsMsg} aria-label={t.smsMsg} className={`${inputCls} resize-none`} style={inputStyle}/>
              </>}
              {tab==="whatsapp" && <>
                <input value={waNum} onChange={e=>setWaNum(e.target.value)} placeholder={t.waPhone} aria-label={t.waPhone} className={inputCls} style={inputStyle}/>
                <textarea value={waMsg} onChange={e=>setWaMsg(e.target.value)} rows={2} placeholder={t.waMsg} aria-label={t.waMsg} className={`${inputCls} resize-none`} style={inputStyle}/>
              </>}
              {tab==="telegram" && <input value={tgUser} onChange={e=>setTgUser(e.target.value)} placeholder={t.tgUser} aria-label={t.tgUser} className={inputCls} style={inputStyle}/>}
            </div>

            {/* PIN */}
            <div className="mt-4 p-3 rounded-xl" style={{ background:"rgba(255,77,28,0.05)", border:"1px solid rgba(255,77,28,0.18)" }}>
              <div className="flex items-center gap-2 mb-2">
                <FiLock size={11} style={{ color:"#ff4d1c" }}/>
                <span className="text-[11px] font-semibold" style={{ color:"var(--text)" }}>{t.pin}</span>
                <span className="text-[10px]" style={{ color:"var(--text-faint)" }}>{t.pinOpt}</span>
              </div>
              <div className="flex gap-2">
                <input value={pin}
                  onChange={e=>{ setPin(e.target.value.replace(/\D/g,"").slice(0,10)); setPinConfirmed(false); setPinOn(e.target.value.length>0); }}
                  placeholder={t.pinPh} inputMode="numeric" aria-label={t.pin}
                  className={`${inputCls} flex-1`} style={{ ...inputStyle, fontSize:"13px" }}/>
                <button type="button" onClick={()=>{ if(pin.length>=4) setPinConfirmed(true); }}
                  disabled={pin.length<4} className="qx-btn !px-3 !py-2 text-xs shrink-0 disabled:opacity-35">
                  {pinConfirmed ? <FiCheck size={14}/> : t.confirmPin}
                </button>
              </div>
              {pinConfirmed && <p className="text-[10px] mt-1.5 flex items-center gap-1" style={{ color:"var(--success)" }}><FiCheck size={10}/>{t.pinSet}</p>}
              {!pinConfirmed && <p className="text-[10px] mt-1.5" style={{ color:"var(--text-faint)" }}>{t.pinInfo}</p>}
            </div>

            <button onClick={generate} disabled={busy} className="qx-btn-hero w-full mt-4 disabled:opacity-60">
              {busy ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"/>{t.generating}</> : <>{t.generate} <FiArrowRight size={15}/></>}
            </button>
            {protectedUrl && (
              <div className="mt-2.5 p-2.5 rounded-xl text-[11px] break-all"
                style={{ background:"rgba(52,211,153,.08)", border:"1px solid rgba(52,211,153,.3)", color:"var(--success)" }}>
                <FiCheck className="inline mr-1" size={11}/> {t.protected} <b>{protectedUrl}</b>
              </div>
            )}
            </div>{/* closes center panel */}
          </div>

          {/* RIGHT — QR Preview (Fireship purple) */}
          <div className="qx-fcard flex flex-col" style={{ ["--fc" as string]:"#bba9ff" } as React.CSSProperties}>
            <div className="px-2 pt-1 pb-3">
              <div className="qx-fcard-title text-[19px]">
                {lang==="uz"?"СИЗНИНГ QR" : lang==="ru"?"ВАШ QR КОД" : "YOUR QR CODE"}
              </div>
              <div className="qx-fcard-sub text-[12px] mt-0.5">
                {lang==="uz"?"Юклаб олинг" : lang==="ru"?"Скачать и настроить" : "Download & customize"}
              </div>
            </div>
            <div className="qx-fcard-panel flex flex-col flex-1 p-4">
            <div className="flex-1 flex flex-col items-center justify-center py-2">
              <div ref={qrBoxRef} onMouseMove={onTilt} onMouseLeave={()=>setTilt({x:0,y:0})}
                className="qx-float-stage flex items-center justify-center w-full" style={{ perspective:700 }}>
                {/* floating platform: gentle levitation + reflection; cursor tilt on the tile inside */}
                <div className="qx-float-panel relative rounded-2xl">
                  <div ref={canvasWrapRef} role="img" aria-label={`QR code for ${qrValue}`} className="p-4 rounded-2xl transition-transform duration-150"
                    style={{ background:bg, transform:`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                      boxShadow:"0 0 0 1px rgba(255,255,255,0.06)" }}>
                    <QRCodeCanvas value={qrValue} size={180} bgColor={bg} fgColor={fg} level={level} marginSize={1}
                      imageSettings={logo?{src:logo,height:Math.round(qrSize*.2),width:Math.round(qrSize*.2),excavate:true}:undefined}/>
                  </div>
                </div>
              </div>
              <div id="qrix-svg-hidden" style={{ display:"none" }}>
                <QRCodeSVG value={qrValue} size={qrSize} bgColor={bg} fgColor={fg} level={level} marginSize={1}/>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="relative">
                <div className="flex">
                  <button onClick={downloadPng} className="qx-btn flex-1 !rounded-r-none !py-2.5 text-sm">
                    <FiDownload size={14}/> {t.dlPng}
                  </button>
                  <button onClick={()=>setDlOpen(!dlOpen)} className="qx-btn !rounded-l-none !px-3 !py-2.5" style={{ borderLeft:"1px solid rgba(255,255,255,.15)" }} aria-label="Format">
                    <FiChevronDown size={13}/>
                  </button>
                </div>
                {dlOpen && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl overflow-hidden z-40"
                    style={{ background:"var(--surface-2)", border:"1px solid var(--border)", boxShadow:"var(--shadow-pop)" }}>
                    <button onClick={downloadPng} className="w-full px-4 py-2.5 text-xs font-medium text-left hover:opacity-80" style={{ color:"var(--text)" }}>PNG</button>
                    <button onClick={downloadSvg} className="w-full px-4 py-2.5 text-xs font-medium text-left hover:opacity-80" style={{ color:"var(--text)", borderTop:"1px solid var(--border)" }}>SVG</button>
                  </div>
                )}
              </div>
              <button onClick={()=>setDesignOpen(true)} className="qx-btn-ghost w-full !py-2.5 text-sm">
                <FiSliders size={13}/> {t.customize}
              </button>
            </div>
            </div>{/* closes right panel */}
          </div>

        </div>{/* closes 3-col grid */}
      </section>

      {/* ================= CINEMATIC STATEMENT (Mission 21) ================= */}
      {/* ================= PREMIUM CATEGORY SHOWCASE ================= */}
      <div data-scene="deep">
        <CategoryShowcase />
      </div>

      {/* ================= QRIX IN NUMBERS — quiet band ================= */}
      <section data-scene="deep" className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20 lg:pb-28" aria-label="QRix in numbers">
        <div className="qx-num" data-reveal>
          <p className="qx-mono qx-num-kick">
            {lang === "uz" ? "// QRIX РАҚАМЛАРДА" : lang === "ru" ? "// QRIX В ЦИФРАХ" : "// QRIX IN NUMBERS"}
          </p>
          <div className="qx-num-row">
            {stats.map((s) => (
              <div key={s.label} className="qx-num-item">
                <span className="qx-num-ic" aria-hidden>{s.icon}</span>
                <span className="qx-num-val"><CountUp end={s.end} suffix={s.suffix} /></span>
                <span className="qx-num-lbl qx-mono">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BRAND FILM (auto-playing 16:9) ================= */}
      <section data-scene="deep" className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-16 lg:pb-24" aria-label="QRix brand film">
        <div className="relative overflow-hidden rounded-[28px] p-6 sm:p-8 lg:p-10" data-reveal
          style={{ background: "linear-gradient(135deg,#ff8a2e 0%,#f5731a 45%,#d2440a 100%)", boxShadow: "0 30px 80px rgba(190,60,8,.4)" }}>
          <div className="absolute inset-0 pointer-events-none" aria-hidden
            style={{ background: "radial-gradient(600px circle at 88% 12%, rgba(255,220,180,.35), transparent 60%)" }} />
          <div className="relative grid lg:grid-cols-[1fr_minmax(0,60%)] gap-7 lg:gap-10 items-center">
            {/* copy — white / dark ink on orange */}
            <div>
              <span className="qx-mono text-[11px] tracking-[0.24em] uppercase font-bold" style={{ color: "#3a1400" }}>
                {lang === "uz" ? "// QRIX РОЛИГИ" : lang === "ru" ? "// ФИЛЬМ QRIX" : "// THE QRIX FILM"}
              </span>
              <h2 className="font-display font-extrabold leading-[1.05] mt-2" style={{ color: "#ffffff", fontSize: "clamp(1.9rem,3.4vw,3rem)", textShadow: "0 2px 20px rgba(90,30,0,.35)" }}>
                {lang === "uz" ? "QRix'ни ҳаракатда кўринг" : lang === "ru" ? "Посмотрите QRix в движении" : "See QRix in motion"}
              </h2>
              <p className="mt-3 text-[15px] leading-relaxed max-w-md font-medium" style={{ color: "rgba(255,255,255,.95)" }}>
                {lang === "uz"
                  ? "185+ текин восита — битта қисқа роликда. Ролик ўзи ўйнаяпти; тўлиқ кўриб MP4 юклаб олинг ёки ўзингизники ясанг."
                  : lang === "ru"
                  ? "185+ бесплатных инструментов в одном коротком ролике. Он уже играет; смотрите полностью, скачивайте MP4 или создайте свой."
                  : "185+ free tools in one short film. It's already playing — watch the full cut, grab the MP4, or make your own."}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <Link href="/promo" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ background: "#ffffff", color: "#c2410c", boxShadow: "0 8px 24px rgba(90,30,0,.28)" }}>
                  {lang === "uz" ? "Тўлиқ кўриш & MP4" : lang === "ru" ? "Смотреть & MP4" : "Watch & download"} <FiArrowRight size={15} />
                </Link>
                <Link href="/promo-video" className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl text-sm font-bold"
                  style={{ background: "rgba(58,20,0,.28)", color: "#ffffff", border: "1px solid rgba(255,255,255,.4)" }}>
                  {lang === "uz" ? "Ўзингизники ясанг" : lang === "ru" ? "Создать свой" : "Make your own"} <FiArrowRight size={14} />
                </Link>
              </div>
            </div>
            {/* the auto-playing 16:9 film */}
            <QrixPromoFilm embed />
          </div>
        </div>
      </section>

      {/* ================= WHY QRIX — BENTO GRID ================= */}
      <section id="why" data-scene="deep" className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-24 lg:pb-32">
        <hr className="qx-neon-line mb-16" />
        <div className="text-center mb-12" data-reveal="perspective">
          <h2 className="qx-section-title justify-center" style={{ color:"var(--text)", fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900 }}>
            {t.whyTitle}{" "}
            <span className="qx-headline-neon-orange">QRix</span>?
          </h2>
          <p className="mt-4 text-[16px] max-w-[520px] mx-auto" style={{ color:"var(--text-muted)" }}>{t.whySub}</p>
        </div>
        {/* editorial statements — no cards, the reasons land one after another */}
        <div className="max-w-[880px] mx-auto">
          {features.map((f, i) => (
            <div key={f.title} className="qx-why-line"
              data-reveal={i % 2 ? "right" : "left"}
              style={{ ["--rv-delay" as string]: `${(i % 2) * 160 + 60}ms` } as React.CSSProperties}>
              <span className="qx-why-mark" aria-hidden />
              <div className="min-w-0">
                <h3 className="qx-why-title">{f.title}</h3>
                <p className="qx-why-desc">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= TRUSTED BY (continues the proof zone) ================= */}
      <div data-scene="deep">
        <TrustedBy heading={lang === "uz" ? "Жаҳон жамоалари ишонган воситалар тоифаси" : lang === "ru" ? "Инструменты уровня мировых команд" : "The tool quality world-class teams expect"} />
      </div>

      {/* ================= FAQ ================= */}
      <div className="qx-sec-mesh" data-reveal="mask" data-scene="deep">
        <HomeFaq lang={lang} />
      </div>

      {/* ================= LATEST BLOG ================= */}
      <div data-reveal="left" data-scene="deep">
      <LatestPosts
        heading={lang === "uz" ? "Сўнгги қўлланмалар" : lang === "ru" ? "Свежие гайды" : "Latest guides"}
        cta={lang === "uz" ? "Барчаси" : lang === "ru" ? "Все статьи" : "View all"}
      />
      </div>

      {/* ================= REVIEWS ================= */}
      <div data-scene="dusk"><ReviewsSection lang={lang} /></div>

      {/* ================= PRICING TEASER (trust sits right above) ================= */}
      <section data-scene="dusk" className="max-w-4xl mx-auto px-5 pb-24 relative" data-reveal="perspective" aria-label="Pricing">
        <div className="text-center mb-8">
          <h2 className="font-display text-3xl lg:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text)" }}>
            {lang === "uz" ? "Оддий нархлар" : lang === "ru" ? "Простые тарифы" : "Simple pricing"}
          </h2>
          <p className="mt-2 text-[14px]" style={{ color: "var(--text-muted)" }}>
            {lang === "uz" ? "Ҳаммаси бепул бошланади — керак бўлгандагина Pro" : lang === "ru" ? "Всё начинается бесплатно — Pro только когда нужно" : "Everything starts free — go Pro only when you need scale"}
          </p>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { n: "Free", p: "$0", d: lang === "uz" ? "185+ асбоб, абадий" : lang === "ru" ? "185+ инструментов навсегда" : "185+ tools, forever", hot: false },
            { n: "Pro", p: "$4", d: lang === "uz" ? "1000 AI кредит · чексиз динамик QR" : lang === "ru" ? "1000 AI кредитов · безлимит QR" : "1,000 AI credits · unlimited dynamic QR", hot: true },
            { n: "Business", p: "$40", d: lang === "uz" ? "Жамоа · API · 5000 кредит" : lang === "ru" ? "Команда · API · 5000 кредитов" : "Teams · API · 5,000 credits", hot: false },
          ].map((t) => (
            <Link key={t.n} href="/pricing"
              className={`qx-card qx-card-lift p-6 text-center rounded-2xl${t.hot ? " qx-border-anim" : ""}`}
              style={t.hot ? { border: "1.5px solid var(--primary)" } : undefined}>
              <span className="block font-display text-lg font-extrabold" style={{ color: "var(--text)" }}>{t.n}</span>
              <span className="block font-display text-4xl font-extrabold mt-2 qx-stat-num" style={{ color: "var(--text)" }}>{t.p}<span className="text-sm font-semibold" style={{ color: "var(--text-faint)" }}>/mo</span></span>
              <span className="block text-[12.5px] mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>{t.d}</span>
              <span className="inline-flex items-center gap-1 text-[12px] font-bold mt-4" style={{ color: "var(--primary-bright)" }}>
                {lang === "uz" ? "Батафсил" : lang === "ru" ? "Подробнее" : "See plans"} <FiArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="max-w-3xl mx-auto px-5 pb-24 lg:pb-32 text-center relative" data-reveal="scale">
        <h2 className="font-display text-3xl lg:text-5xl font-extrabold leading-tight" style={{ color: "var(--text)" }}>
          {lang === "uz" ? "Бугуноқ бошланг — бепул" : lang === "ru" ? "Начните сегодня — бесплатно" : "Start creating today — free"}
        </h2>
        <p className="mt-4 text-[15px] max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
          {lang === "uz" ? "Рўйхатсиз. Ватермарксиз. 55+ асбоб — браузерингизда." : lang === "ru" ? "Без регистрации. Без водяных знаков. 55+ инструментов в браузере." : "No signup. No watermark. 55+ tools right in your browser."}
        </p>
        <a href="#generator" className="qx-btn-hero inline-flex mt-8" data-magnetic>
          {t.cta} <FiArrowRight size={15} />
        </a>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-10 relative overflow-hidden" data-scene="dusk">
        <hr className="qx-neon-line" />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,77,28,.06) 0%, transparent 60%)" }} />

        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8 pt-16 pb-12 grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.2fr]">
          {/* brand */}
          <div>
            <div className="font-display flex items-center gap-0.5 mb-5">
              <span className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>QR</span>
              <span className="text-3xl font-black tracking-tight" style={{ color: "var(--primary-bright)" }}>ix</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[260px] mb-6" style={{ color: "var(--text-muted)" }}>{t.footAbout}</p>
            <div className="flex gap-2 mb-6">
              {[
                { href: "mailto:musarasulzada@gmail.com", icon: <FiMail size={15} />, label: "Email" },
                { href: "https://t.me/QRix2020", icon: <FiSend size={15} />, label: "Telegram" },
              ].map((so) => (
                <a key={so.label} href={so.href} target="_blank" rel="noopener noreferrer"
                  className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-110 hover:-translate-y-0.5"
                  style={{ background: "rgba(255,77,28,.1)", border: "1px solid rgba(255,77,28,.25)", color: "#ff4d1c" }}
                  aria-label={so.label}>
                  {so.icon}
                </a>
              ))}
            </div>
            <p className="qx-mono text-[10.5px] tracking-[0.18em] uppercase" style={{ color: "var(--text-faint)" }}>
              <FiShield className="inline -mt-0.5 mr-1.5" size={11} aria-hidden />
              {lang === "uz" ? "Файллар қурилмангиздан чиқмайди" : lang === "ru" ? "Файлы не покидают устройство" : "Files never leave your device"}
            </p>
          </div>

          {/* product */}
          <div>
            <h3 className="qx-foot-h">{t.footProduct}</h3>
            <div className="space-y-3 text-sm">
              {[
                { href: "/url-qr", label: "URL QR" },
                { href: "/bulk-qr", label: "Bulk QR" },
                { href: "/scanner", label: "QR Scanner" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/pricing", label: "Pricing" },
                { href: "/developers", label: "Developer API" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="qx-foot-link">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* tools */}
          <div>
            <h3 className="qx-foot-h">{t.footTools}</h3>
            <div className="space-y-3 text-sm">
              {[
                { href: "/qr-tools", label: "QR Tools" },
                { href: "/pdf-tools", label: "PDF Tools" },
                { href: "/image-tools", label: "Image Tools" },
                { href: "/ai-tools", label: "AI Tools" },
                { href: "/video-tools", label: "Video Tools" },
                { href: "/3d-tools", label: "3D Tools" },
                { href: "/use/en", label: lang === "uz" ? "Ҳолатлар" : lang === "ru" ? "Сценарии" : "Use cases" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="qx-foot-link">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* company */}
          <div>
            <h3 className="qx-foot-h">{lang === "uz" ? "Компания" : lang === "ru" ? "Компания" : "Company"}</h3>
            <div className="space-y-3 text-sm">
              {[
                { href: "/about", label: lang === "uz" ? "Биз ҳақимизда" : lang === "ru" ? "О нас" : "About" },
                { href: "/blog", label: lang === "uz" ? "Блог" : lang === "ru" ? "Блог" : "Blog" },
                { href: "/help", label: lang === "uz" ? "Ёрдам маркази" : lang === "ru" ? "Помощь" : "Help Center" },
                { href: "/docs", label: lang === "uz" ? "Ҳужжатлар" : lang === "ru" ? "Документация" : "Docs" },
                { href: "/contact", label: lang === "uz" ? "Алоқа" : lang === "ru" ? "Контакты" : "Contact" },
                { href: "/privacy", label: lang === "uz" ? "Махфийлик" : lang === "ru" ? "Конфиденциальность" : "Privacy" },
                { href: "/terms", label: lang === "uz" ? "Шартлар" : lang === "ru" ? "Условия" : "Terms" },
              ].map((l) => (
                <Link key={l.href} href={l.href} className="qx-foot-link">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* contact + cta */}
          <div>
            <h3 className="qx-foot-h">{t.footContact}</h3>
            <div className="space-y-3 text-sm mb-7">
              <a href="mailto:musarasulzada@gmail.com" className="qx-foot-link flex items-center gap-2.5">
                <FiMail size={14} style={{ color: "#ff4d1c" }} /> musarasulzada@gmail.com
              </a>
              <a href="https://t.me/QRix2020" target="_blank" rel="noopener noreferrer" className="qx-foot-link flex items-center gap-2.5">
                <FiSend size={14} style={{ color: "#ff4d1c" }} /> @QRix2020
              </a>
            </div>
            <Link href="/register" className="qx-btn-hero inline-flex text-sm px-6 py-3" data-magnetic>
              {lang === "uz" ? "Бепул бошлаш" : lang === "ru" ? "Начать бесплатно" : "Get Started Free"} <FiArrowRight size={14} />
            </Link>
          </div>
        </div>

        {/* bottom bar */}
        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(255,255,255,.07)" }}>
          <div className="text-[12px]" style={{ color: "var(--text-faint)" }}>
            © 2026 <span style={{ color: "#ff4d1c", fontWeight: 700 }}>QRix</span> · {t.rights}
          </div>
          <div className="qx-mono flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase" style={{ color: "var(--text-muted)" }}>
            <span className="qx-status-dot" aria-hidden />
            {lang === "uz" ? "Барча тизимлар ишлаяпти" : lang === "ru" ? "Все системы работают" : "All systems operational"}
          </div>
          <div className="flex items-center gap-4 text-[12px]">
            {[["/about", "About"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/contact", "Contact"]].map(([h, l]) => (
              <Link key={h} href={h} className="qx-foot-link">{l}</Link>
            ))}
          </div>
        </div>
      </footer>

      {/* ================= DESIGN STUDIO ================= */}
      {designOpen && (
        <QRDesignStudio
          value={qrValue}
          initialFg={fg}
          initialBg={bg}
          initialLevel={level}
          initialLogo={logo}
          onClose={() => setDesignOpen(false)}
        />
      )}
    </main>
  );
}


/* Cinematic 3D statement — scroll-scrubbed perspective text (Mission 21). */
