"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import ReviewsSection from "@/components/ReviewsSection";
import {
  FiLink, FiType, FiWifi, FiUser, FiGrid, FiChevronDown, FiLock,
  FiDownload, FiSliders, FiX, FiMail, FiMessageSquare, FiSend,
  FiMessageCircle, FiPlay, FiArrowRight, FiZap, FiRefreshCw,
  FiShield, FiPenTool, FiBarChart2, FiCamera, FiFileText, FiImage,
  FiUpload, FiTrash2, FiCheck,
} from "react-icons/fi";

type Lang = "en" | "ru" | "uz";

/* ================= I18N ================= */
const T: Record<Lang, Record<string, string>> = {
  en: {
    badge: "🚀 The All-in-One QR Platform",
    h1a: "Generate. Track.", h1b: "Analyze.", h1c: "Grow.",
    sub: "QRix helps you create powerful QR codes for any purpose, track every scan in real-time, and grow your business smarter.",
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
    sub: "QRix помогает создавать мощные QR коды для любых целей, отслеживать каждое сканирование в реальном времени и развивать бизнес умнее.",
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
    sub: "QRix ҳар қандай мақсад учун кучли QR кодлар яратиш, ҳар бир сканни реал вақтда кузатиш ва бизнесингизни ақлли ўстиришга ёрдам беради.",
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

const COLOR_PRESETS = ["#000000", "#7c3aed", "#2563eb", "#0891b2", "#16a34a", "#dc2626", "#db2777", "#d97706"];
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

  /* ===== Tabs & forms ===== */
  const [tab, setTab] = useState("url");
  const [moreOpen, setMoreOpen] = useState(false);
  const [url, setUrl] = useState("");
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

  const buildValue = (): string => {
    switch (tab) {
      case "url": return url.trim() || "https://qrix.uz";
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

  const tools = [
    { href: "/url-qr", label: "URL QR", desc: lang === "uz" ? "Ҳар қандай ссилка учун" : lang === "ru" ? "QR для любой ссылки" : "Create QR for any link", icon: <FiLink size={20} />, grad: "linear-gradient(135deg,#4f46e5,#3b82f6)" },
    { href: "/wifi-qr", label: "WiFi QR", desc: lang === "uz" ? "WiFi'ни бирдан улашинг" : lang === "ru" ? "Делитесь WiFi мгновенно" : "Share WiFi instantly", icon: <FiWifi size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)" },
    { href: "/vcard-qr", label: "vCard / NFC", desc: lang === "uz" ? "Рақамли визитка" : lang === "ru" ? "Цифровая визитка" : "Digital business card", icon: <FiUser size={20} />, grad: "linear-gradient(135deg,#d97706,#fbbf24)" },
    { href: "/whatsapp-qr", label: "WhatsApp QR", desc: lang === "uz" ? "Чатга тўғридан" : lang === "ru" ? "Прямо в чат" : "Straight to chat", icon: <FiMessageCircle size={20} />, grad: "linear-gradient(135deg,#16a34a,#86efac)", badge: "New" },
    { href: "/telegram-qr", label: "Telegram QR", desc: lang === "uz" ? "Каналлар учун" : lang === "ru" ? "Для каналов" : "For channels & bots", icon: <FiSend size={20} />, grad: "linear-gradient(135deg,#0284c7,#38bdf8)" },
    { href: "/email-qr", label: "Email QR", desc: lang === "uz" ? "Тайёр хатлар" : lang === "ru" ? "Готовые письма" : "Pre-filled emails", icon: <FiMail size={20} />, grad: "linear-gradient(135deg,#db2777,#f472b6)", badge: "New" },
    { href: "/sms-qr", label: "SMS QR", desc: lang === "uz" ? "Тезкор хабарлар" : lang === "ru" ? "Быстрые сообщения" : "Instant messages", icon: <FiMessageSquare size={20} />, grad: "linear-gradient(135deg,#7c3aed,#a78bfa)" },
    { href: "/scanner", label: "QR Scanner", desc: lang === "uz" ? "Камера орқали ўқиш" : lang === "ru" ? "Чтение через камеру" : "Scan with camera", icon: <FiCamera size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)", badge: "New" },
    { href: "/pdf-tools", label: "PDF Tools", desc: lang === "uz" ? "Конверт ва сиқиш" : lang === "ru" ? "Конвертация и сжатие" : "Convert & compress", icon: <FiFileText size={20} />, grad: "linear-gradient(135deg,#ea580c,#fb923c)" },
    { href: "/image-tools", label: "Image Tools", desc: lang === "uz" ? "Расм асбоблари" : lang === "ru" ? "Работа с фото" : "Edit & convert images", icon: <FiImage size={20} />, grad: "linear-gradient(135deg,#9333ea,#d946ef)" },
  ];

  const stats = [
    { end: 1000000, suffix: "+", label: t.statQr, icon: <FiGrid />, color: "#a78bfa" },
    { end: 50000000, suffix: "+", label: t.statScans, icon: <FiBarChart2 />, color: "#22d3ee" },
    { end: 150, suffix: "+", label: t.statCountries, icon: <FiSend />, color: "#3b82f6" },
    { end: 10000, suffix: "+", label: t.statBiz, icon: <FiUser />, color: "#ec4899" },
  ];

  const features = [
    { title: t.f1, desc: t.f1d, icon: <FiZap size={20} />, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)" },
    { title: t.f2, desc: t.f2d, icon: <FiRefreshCw size={20} />, grad: "linear-gradient(135deg,#059669,#34d399)" },
    { title: t.f3, desc: t.f3d, icon: <FiShield size={20} />, grad: "linear-gradient(135deg,#d97706,#fbbf24)" },
    { title: t.f4, desc: t.f4d, icon: <FiPenTool size={20} />, grad: "linear-gradient(135deg,#7c3aed,#d946ef)" },
  ];

  const inputCls = "w-full px-4 py-3 text-sm";

  return (
    <div className="relative overflow-x-clip">
      {/* ===== Жонли фон орблари ===== */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="qx-orb" style={{ top: "-10%", left: "-5%", background: "rgba(124,58,237,.22)", animationDelay: "0s" }} />
        <div className="qx-orb" style={{ top: "30%", right: "-8%", background: "rgba(34,211,238,.14)", animationDelay: "-7s" }} />
        <div className="qx-orb" style={{ bottom: "-15%", left: "30%", background: "rgba(99,102,241,.16)", animationDelay: "-14s" }} />
      </div>
      <style>{`
        .qx-orb{position:absolute;width:540px;height:540px;border-radius:50%;filter:blur(110px);animation:qxFloat 22s ease-in-out infinite;}
        @keyframes qxFloat{0%,100%{transform:translate(0,0) scale(1)}33%{transform:translate(60px,-40px) scale(1.12)}66%{transform:translate(-50px,40px) scale(.94)}}
        @keyframes qxPulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.35)}50%{box-shadow:0 0 0 14px rgba(124,58,237,0)}}
        .qx-toggle{width:44px;height:24px;border-radius:99px;position:relative;transition:background .25s;cursor:pointer;border:1px solid var(--border)}
        .qx-toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s;box-shadow:0 2px 6px rgba(0,0,0,.3)}
        .qx-toggle.on{background:var(--grad-primary)}.qx-toggle.on::after{transform:translateX(20px)}
        .qx-toggle.off{background:var(--surface-hover)}
        @media (prefers-reduced-motion: reduce){.qx-orb{animation:none}}
      `}</style>

      {/* ================= HERO ================= */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pt-12 pb-16 grid lg:grid-cols-[1.1fr_1.25fr_0.85fr] gap-7 items-start">
        {/* Чап — матн */}
        <div className="qx-rise pt-4">
          <span className="qx-badge mb-6">{t.badge}</span>
          <h1 className="font-display text-[44px] lg:text-[54px] font-bold leading-[1.05] tracking-tight" style={{ color: "var(--text)" }}>
            {t.h1a}<br />{t.h1b}{" "}
            <span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
              {t.h1c}
            </span>
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed max-w-md" style={{ color: "var(--text-muted)" }}>{t.sub}</p>

          <div className="flex flex-wrap gap-3 mt-7">
            <a href="#generator" className="qx-btn !px-6 !py-3.5" style={{ animation: "qxPulse 2.5s infinite" }}>
              {t.cta} <FiArrowRight size={15} />
            </a>
            <a href="#why" className="qx-btn-ghost !px-6 !py-3.5">
              <FiPlay size={14} /> {t.demo}
            </a>
          </div>

          <div className="flex items-center gap-3 mt-8">
            <div className="flex -space-x-2.5">
              {["#8b5cf6", "#22d3ee", "#ec4899", "#34d399", "#f59e0b"].map((c, i) => (
                <span key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-bold text-white"
                  style={{ background: c, borderColor: "var(--bg)" }}>
                  {String.fromCharCode(65 + i)}
                </span>
              ))}
            </div>
            <div>
              <div style={{ color: "#fbbf24", letterSpacing: 2 }}>★★★★★</div>
              <div className="text-xs" style={{ color: "var(--text-muted)" }}>{t.rating}</div>
            </div>
          </div>
        </div>

        {/* Марказ — генератор */}
        <div id="generator" className="qx-card qx-rise qx-rise-1 p-6 lg:p-7">
          <h2 className="font-display text-xl font-bold" style={{ color: "var(--text)" }}>{t.cardTitle}</h2>
          <p className="text-xs mt-1 mb-5" style={{ color: "var(--text-muted)" }}>{t.cardSub}</p>

          {/* Tabs */}
          <div className="flex flex-wrap gap-1.5 mb-5">
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => { setTab(tb.id); setMoreOpen(false); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: tab === tb.id ? "linear-gradient(135deg,rgba(124,58,237,.25),rgba(99,102,241,.15))" : "var(--surface-hover)",
                  border: `1px solid ${tab === tb.id ? "var(--border-strong)" : "var(--border)"}`,
                  color: tab === tb.id ? "var(--primary-bright)" : "var(--text-muted)",
                }}>
                {tb.icon} {tb.label}
              </button>
            ))}
            <div className="relative">
              <button onClick={() => setMoreOpen(!moreOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
                style={{
                  background: moreTabs.some((m) => m.id === tab) ? "linear-gradient(135deg,rgba(124,58,237,.25),rgba(99,102,241,.15))" : "var(--surface-hover)",
                  border: `1px solid ${moreTabs.some((m) => m.id === tab) ? "var(--border-strong)" : "var(--border)"}`,
                  color: moreTabs.some((m) => m.id === tab) ? "var(--primary-bright)" : "var(--text-muted)",
                }}>
                <FiGrid size={14} /> {moreTabs.find((m) => m.id === tab)?.label || t.more} <FiChevronDown size={12} />
              </button>
              {moreOpen && (
                <div className="absolute left-0 top-full mt-2 w-44 rounded-xl overflow-hidden z-40"
                  style={{ background: "var(--surface-solid)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-pop)" }}>
                  {moreTabs.map((m) => (
                    <button key={m.id} onClick={() => { setTab(m.id); setMoreOpen(false); }}
                      className="w-full flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-left transition-colors"
                      style={{ color: tab === m.id ? "var(--primary-bright)" : "var(--text-muted)", background: tab === m.id ? "var(--surface-hover)" : "transparent" }}>
                      {m.icon} {m.label} QR
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Forms */}
          <div className="space-y-3">
            {tab === "url" && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>{t.enterUrl}</label>
                <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://yourwebsite.com" className={inputCls} />
              </div>
            )}
            {tab === "text" && (
              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: "var(--text)" }}>{t.enterText}</label>
                <textarea value={textVal} onChange={(e) => setTextVal(e.target.value)} rows={3} placeholder="QRix..." className={`${inputCls} resize-none`} />
              </div>
            )}
            {tab === "wifi" && (
              <>
                <input value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder={t.ssid} className={inputCls} />
                <input value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder={t.password} className={inputCls} />
              </>
            )}
            {tab === "vcard" && (
              <div className="grid grid-cols-2 gap-3">
                <input value={vName} onChange={(e) => setVName(e.target.value)} placeholder={t.fullName} className={inputCls} />
                <input value={vPhone} onChange={(e) => setVPhone(e.target.value)} placeholder={t.phone} className={inputCls} />
                <input value={vEmail} onChange={(e) => setVEmail(e.target.value)} placeholder={t.emailL} className={inputCls} />
                <input value={vOrg} onChange={(e) => setVOrg(e.target.value)} placeholder={t.org} className={inputCls} />
              </div>
            )}
            {tab === "email" && (
              <>
                <input value={emTo} onChange={(e) => setEmTo(e.target.value)} placeholder={t.emailTo} className={inputCls} />
                <input value={emSub} onChange={(e) => setEmSub(e.target.value)} placeholder={t.subject} className={inputCls} />
                <textarea value={emBody} onChange={(e) => setEmBody(e.target.value)} rows={2} placeholder={t.body} className={`${inputCls} resize-none`} />
              </>
            )}
            {tab === "sms" && (
              <>
                <input value={smsNum} onChange={(e) => setSmsNum(e.target.value)} placeholder={t.smsPhone} className={inputCls} />
                <textarea value={smsMsg} onChange={(e) => setSmsMsg(e.target.value)} rows={2} placeholder={t.smsMsg} className={`${inputCls} resize-none`} />
              </>
            )}
            {tab === "whatsapp" && (
              <>
                <input value={waNum} onChange={(e) => setWaNum(e.target.value)} placeholder={t.waPhone} className={inputCls} />
                <textarea value={waMsg} onChange={(e) => setWaMsg(e.target.value)} rows={2} placeholder={t.waMsg} className={`${inputCls} resize-none`} />
              </>
            )}
            {tab === "telegram" && (
              <input value={tgUser} onChange={(e) => setTgUser(e.target.value)} placeholder={t.tgUser} className={inputCls} />
            )}
          </div>

          {/* PIN — реал динамик ссилка */}
          <div className="mt-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FiLock size={13} style={{ color: "var(--text-muted)" }} />
                <span className="text-xs font-semibold" style={{ color: "var(--text)" }}>{t.pin}</span>
                <span className="text-[10px]" style={{ color: "var(--text-faint)" }}>{t.pinOpt}</span>
              </div>
              <button type="button" onClick={() => setPinOn(!pinOn)} className={`qx-toggle ${pinOn ? "on" : "off"}`} aria-label="PIN toggle" />
            </div>
            {pinOn && (
              <div className="mt-3">
                <input value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder={t.pinPh} inputMode="numeric" className={inputCls} />
                <p className="text-[10px] mt-1.5" style={{ color: "var(--text-faint)" }}>{t.pinInfo}</p>
              </div>
            )}
          </div>

          <button onClick={generate} disabled={busy} className="qx-btn w-full mt-5 !py-3.5 disabled:opacity-60">
            {busy ? t.generating : t.generate} <FiArrowRight size={15} />
          </button>

          {protectedUrl && (
            <div className="mt-3 p-3 rounded-xl text-xs break-all"
              style={{ background: "rgba(52,211,153,.08)", border: "1px solid rgba(52,211,153,.3)", color: "var(--success)" }}>
              <FiCheck className="inline mr-1" size={12} /> {t.protected} <b>{protectedUrl}</b>
            </div>
          )}
        </div>

        {/* Ўнг — превью (3D tilt) */}
        <div className="qx-card qx-rise qx-rise-2 p-6 lg:sticky lg:top-24">
          <h3 className="font-display text-base font-bold mb-4" style={{ color: "var(--text)" }}>{t.yourQr}</h3>
          <div
            ref={qrBoxRef}
            onMouseMove={onTilt}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            className="flex items-center justify-center"
            style={{ perspective: 700 }}
          >
            <div
              ref={canvasWrapRef}
              className="p-4 rounded-2xl transition-transform duration-150"
              style={{
                background: bg,
                transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                boxShadow: "0 20px 50px rgba(0,0,0,.35), 0 0 30px rgba(124,58,237,.15)",
              }}
            >
              <QRCodeCanvas
                value={qrValue}
                size={qrSize}
                bgColor={bg}
                fgColor={fg}
                level={level}
                marginSize={1}
                imageSettings={logo ? { src: logo, height: Math.round(qrSize * 0.2), width: Math.round(qrSize * 0.2), excavate: true } : undefined}
              />
            </div>
          </div>
          {/* SVG юклаб олиш учун яширин нусха */}
          <div id="qrix-svg-hidden" style={{ display: "none" }}>
            <QRCodeSVG value={qrValue} size={qrSize} bgColor={bg} fgColor={fg} level={level} marginSize={1} />
          </div>

          <div className="mt-5 space-y-2.5">
            <div className="relative">
              <div className="flex">
                <button onClick={downloadPng} className="qx-btn flex-1 !rounded-r-none">
                  <FiDownload size={14} /> {t.dlPng}
                </button>
                <button onClick={() => setDlOpen(!dlOpen)} className="qx-btn !rounded-l-none !px-3" style={{ borderLeft: "1px solid rgba(255,255,255,.2)" }} aria-label="Format">
                  <FiChevronDown size={14} />
                </button>
              </div>
              {dlOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-40"
                  style={{ background: "var(--surface-solid)", border: "1px solid var(--border-strong)", boxShadow: "var(--shadow-pop)" }}>
                  <button onClick={downloadPng} className="w-full px-4 py-2.5 text-xs font-medium text-left transition-colors hover:opacity-80" style={{ color: "var(--text)" }}>PNG</button>
                  <button onClick={downloadSvg} className="w-full px-4 py-2.5 text-xs font-medium text-left transition-colors hover:opacity-80" style={{ color: "var(--text)", borderTop: "1px solid var(--border)" }}>SVG</button>
                </div>
              )}
            </div>
            <button onClick={() => setDesignOpen(true)} className="qx-btn-ghost w-full">
              <FiSliders size={14} /> {t.customize}
            </button>
          </div>
        </div>
      </section>

      {/* ================= TOOLS ================= */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {tools.map((tool) => (
            <Link key={tool.href + tool.label} href={tool.href} className="qx-tile relative !items-center text-center">
              {tool.badge && (
                <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: "var(--grad-primary)" }}>
                  {tool.badge}
                </span>
              )}
              <span className="qx-tile-icon text-white" style={{ background: tool.grad }}>{tool.icon}</span>
              <span>{tool.label}</span>
              <span className="text-[10px] font-normal -mt-1" style={{ color: "var(--text-muted)" }}>{tool.desc}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20">
        <div className="qx-card p-7 grid grid-cols-2 lg:grid-cols-5 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `color-mix(in srgb, ${s.color} 14%, transparent)`, color: s.color }}>
                {s.icon}
              </span>
              <div>
                <div className="font-display text-xl font-bold" style={{ color: s.color }}>
                  <CountUp end={s.end} suffix={s.suffix} />
                </div>
                <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{s.label}</div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: "rgba(52,211,153,.14)", color: "#34d399" }}>
              <FiShield />
            </span>
            <div>
              <div className="font-display text-xl font-bold" style={{ color: "#34d399" }}>99.9%</div>
              <div className="text-[11px]" style={{ color: "var(--text-muted)" }}>{t.statUptime}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY QRIX ================= */}
      <section id="why" className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20">
        <h2 className="font-display text-3xl lg:text-4xl font-bold" style={{ color: "var(--text)" }}>
          {t.whyTitle}{" "}
          <span style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>QRix</span>?
        </h2>
        <p className="mt-2 text-sm mb-9" style={{ color: "var(--text-muted)" }}>{t.whySub}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <div key={f.title} className={`qx-card qx-card-lift qx-rise qx-rise-${i + 1} p-6`}>
              <span className="qx-tile-icon text-white mb-4" style={{ background: f.grad }}>{f.icon}</span>
              <h3 className="font-display text-[15px] font-bold mb-2" style={{ color: "var(--text)" }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <ReviewsSection lang={lang} />

      {/* ================= FOOTER ================= */}
      <footer className="mt-10" style={{ borderTop: "1px solid var(--border)", background: "var(--surface)" }}>
        <div className="max-w-[1400px] mx-auto px-5 lg:px-8 py-14 grid md:grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10">
          <div>
            <div className="font-display flex items-center gap-0.5 mb-4">
              <span className="text-2xl font-bold" style={{ color: "var(--text)" }}>QR</span>
              <span className="text-2xl font-bold" style={{ background: "var(--grad-text)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>ix</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: "var(--text-muted)" }}>{t.footAbout}</p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text)" }}>{t.footProduct}</h4>
            <div className="space-y-2.5 text-xs">
              <Link href="/url-qr" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>URL QR</Link>
              <Link href="/dashboard" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>Dashboard</Link>
              <Link href="/scanner" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>QR Scanner</Link>
              <Link href="/login" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>Sign in</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text)" }}>{t.footTools}</h4>
            <div className="space-y-2.5 text-xs">
              <Link href="/pdf-tools" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>PDF Tools</Link>
              <Link href="/image-tools" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>Image Tools</Link>
              <Link href="/wifi-qr" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>WiFi QR</Link>
              <Link href="/vcard-qr" className="block transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>vCard QR</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider mb-4" style={{ color: "var(--text)" }}>{t.footContact}</h4>
            <div className="space-y-2.5 text-xs">
              <a href="mailto:musarasulzada@gmail.com" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                <FiMail size={13} style={{ color: "var(--primary-bright)" }} /> musarasulzada@gmail.com
              </a>
              <a href="https://t.me/QRix2020" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 transition-colors hover:opacity-80" style={{ color: "var(--text-muted)" }}>
                <FiSend size={13} style={{ color: "var(--accent)" }} /> @QRix2020
              </a>
            </div>
          </div>
        </div>
        <div className="py-5 text-center text-[11px]" style={{ borderTop: "1px solid var(--border)", color: "var(--text-faint)" }}>
          © 2026 QRix. {t.rights}
        </div>
      </footer>

      {/* ================= DESIGN MODAL ================= */}
      {designOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setDesignOpen(false)}>
          <div className="qx-card w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 relative"
            style={{ background: "var(--surface-solid)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <FiSliders style={{ color: "var(--primary-bright)" }} /> {t.designTitle}
              </h3>
              <button onClick={() => setDesignOpen(false)} className="qx-btn-ghost !p-2" aria-label="Close">
                <FiX size={16} />
              </button>
            </div>

            {/* Live mini preview */}
            <div className="flex justify-center mb-6">
              <div className="p-3 rounded-xl" style={{ background: bg, boxShadow: "0 8px 28px rgba(0,0,0,.3)" }}>
                <QRCodeCanvas value={qrValue} size={120} bgColor={bg} fgColor={fg} level={level} marginSize={1}
                  imageSettings={logo ? { src: logo, height: 24, width: 24, excavate: true } : undefined} />
              </div>
            </div>

            {/* QR Color */}
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>🎨 {t.qrColor}</label>
              <div className="flex flex-wrap items-center gap-2">
                {COLOR_PRESETS.map((c) => (
                  <button key={c} onClick={() => setFg(c)} className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: fg === c ? "2px solid var(--primary-bright)" : "1px solid var(--border)", boxShadow: fg === c ? "var(--glow-primary)" : "none" }}
                    aria-label={c} />
                ))}
                <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
            </div>

            {/* BG Color */}
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>🖼 {t.bgColor}</label>
              <div className="flex flex-wrap items-center gap-2">
                {BG_PRESETS.map((c) => (
                  <button key={c} onClick={() => setBg(c)} className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: bg === c ? "2px solid var(--primary-bright)" : "1px solid var(--border)", boxShadow: bg === c ? "var(--glow-primary)" : "none" }}
                    aria-label={c} />
                ))}
                <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="w-8 h-8 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
            </div>

            {/* Size */}
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>📐 {t.size}: {qrSize}px</label>
              <input type="range" min={140} max={340} value={qrSize} onChange={(e) => setQrSize(Number(e.target.value))}
                className="w-full accent-violet-500" />
            </div>

            {/* Error level */}
            <div className="mb-5">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>🛡 {t.errLevel}</label>
              <div className="grid grid-cols-4 gap-2">
                {(["L", "M", "Q", "H"] as const).map((lv) => (
                  <button key={lv} onClick={() => setLevel(lv)}
                    className="py-2 rounded-xl text-xs font-bold transition-all"
                    style={{
                      background: level === lv ? "var(--grad-primary)" : "var(--surface-hover)",
                      color: level === lv ? "#fff" : "var(--text-muted)",
                      border: `1px solid ${level === lv ? "transparent" : "var(--border)"}`,
                    }}>
                    {lv}
                  </button>
                ))}
              </div>
            </div>

            {/* Logo */}
            <div className="mb-6">
              <label className="block text-xs font-bold mb-2.5" style={{ color: "var(--text)" }}>⭐ {t.logo}</label>
              <div className="flex items-center gap-3">
                <label className="qx-btn-ghost !text-xs cursor-pointer">
                  <FiUpload size={13} /> {t.uploadLogo}
                  <input type="file" accept="image/*" onChange={onLogoUpload} className="hidden" />
                </label>
                {logo && (
                  <>
                    <img src={logo} alt="logo" className="w-9 h-9 rounded-lg object-contain" style={{ border: "1px solid var(--border)" }} />
                    <button onClick={() => setLogo(null)} className="qx-btn-ghost !text-xs !text-red-400">
                      <FiTrash2 size={13} /> {t.removeLogo}
                    </button>
                  </>
                )}
              </div>
            </div>

            <button onClick={() => setDesignOpen(false)} className="qx-btn w-full">
              <FiCheck size={14} /> {t.done}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
