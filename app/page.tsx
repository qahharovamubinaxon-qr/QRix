"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import ReviewsSection from "@/components/ReviewsSection";
import ToolCards3D from "@/components/ToolCards3D";
import {
  FiLink, FiType, FiWifi, FiUser, FiGrid, FiChevronDown, FiLock,
  FiDownload, FiSliders, FiX, FiMail, FiMessageSquare, FiSend,
  FiMessageCircle, FiPlay, FiArrowRight, FiZap, FiRefreshCw,
  FiShield, FiPenTool, FiBarChart2, FiCamera, FiFileText, FiImage,
  FiUpload, FiTrash2, FiCheck,
  FiLayers, FiMinimize2, FiMaximize2, FiDroplet, FiScissors,
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

  // 1-қатор — QR функциялари
  const qrRow = [
    { href: "/qr-tools/url", label: "URL QR", desc: lang === "uz" ? "Ҳар қандай ссилка" : lang === "ru" ? "Любая ссылка" : "Any link", icon: <FiLink size={20} />, grad: "linear-gradient(135deg,#4f46e5,#3b82f6)" },
    { href: "/qr-tools/wifi", label: "WiFi QR", desc: lang === "uz" ? "WiFi улашиш" : lang === "ru" ? "Поделиться WiFi" : "Share WiFi", icon: <FiWifi size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)" },
    { href: "/qr-tools/vcard", label: "vCard / NFC", desc: lang === "uz" ? "Рақамли визитка" : lang === "ru" ? "Визитка" : "Business card", icon: <FiUser size={20} />, grad: "linear-gradient(135deg,#d97706,#fbbf24)" },
    { href: "/qr-tools/whatsapp", label: "WhatsApp QR", desc: lang === "uz" ? "Чатга тўғридан" : lang === "ru" ? "Прямо в чат" : "Straight to chat", icon: <FiMessageCircle size={20} />, grad: "linear-gradient(135deg,#16a34a,#86efac)", badge: "New" },
    { href: "/qr-tools/telegram", label: "Telegram QR", desc: lang === "uz" ? "Каналлар учун" : lang === "ru" ? "Для каналов" : "Channels & bots", icon: <FiSend size={20} />, grad: "linear-gradient(135deg,#0284c7,#38bdf8)" },
    { href: "/qr-tools", label: lang === "uz" ? "Барчаси +25" : lang === "ru" ? "Все +25" : "All +25", desc: lang === "uz" ? "QR турлари" : lang === "ru" ? "Типы QR" : "QR types", icon: <FiGrid size={20} />, grad: "linear-gradient(135deg,#7c3aed,#6366f1)" },
  ];

  // 2-қатор — PDF функциялари
  const pdfRow = [
    { href: "/pdf-tools/merge", label: "Merge PDF", desc: lang === "uz" ? "Бирлаштириш" : lang === "ru" ? "Объединить" : "Combine files", icon: <FiLayers size={20} />, grad: "linear-gradient(135deg,#4f46e5,#818cf8)" },
    { href: "/pdf-tools/split", label: "Split PDF", desc: lang === "uz" ? "Ажратиш" : lang === "ru" ? "Разделить" : "Split pages", icon: <FiScissors size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)" },
    { href: "/pdf-tools/compress", label: "Compress", desc: lang === "uz" ? "Сиқиш" : lang === "ru" ? "Сжать" : "Reduce size", icon: <FiMinimize2 size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)" },
    { href: "/pdf-tools/protect", label: "Protect PDF", desc: lang === "uz" ? "Парол қўйиш" : lang === "ru" ? "Пароль" : "Password", icon: <FiLock size={20} />, grad: "linear-gradient(135deg,#6366f1,#8b5cf6)", badge: "New" },
    { href: "/pdf-tools/watermark", label: "Watermark", desc: lang === "uz" ? "Сув белгиси" : lang === "ru" ? "Водяной знак" : "Watermark", icon: <FiDroplet size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)" },
    { href: "/pdf-tools", label: lang === "uz" ? "Барчаси +8" : lang === "ru" ? "Все +8" : "All +8", desc: lang === "uz" ? "PDF асбоблари" : lang === "ru" ? "PDF инструменты" : "PDF tools", icon: <FiFileText size={20} />, grad: "linear-gradient(135deg,#ea580c,#fb923c)" },
  ];

  // 3-қатор — Image функциялари
  const imageRow = [
    { href: "/image-tools/remove-bg", label: "Remove BG", desc: lang === "uz" ? "Фон ўчириш" : lang === "ru" ? "Удалить фон" : "Remove background", icon: <FiScissors size={20} />, grad: "linear-gradient(135deg,#7c3aed,#a855f7)", badge: "AI" },
    { href: "/image-tools/image-to-text", label: "Image to Text", desc: lang === "uz" ? "Матн олиш" : lang === "ru" ? "Текст из фото" : "Extract text", icon: <FiType size={20} />, grad: "linear-gradient(135deg,#0891b2,#22d3ee)", badge: "AI" },
    { href: "/image-tools/upscale", label: "Enhancer", desc: lang === "uz" ? "Сифат ошириш" : lang === "ru" ? "Улучшить" : "Upscale", icon: <FiZap size={20} />, grad: "linear-gradient(135deg,#f59e0b,#fbbf24)", badge: "New" },
    { href: "/image-tools/compress", label: "Compress", desc: lang === "uz" ? "Сиқиш" : lang === "ru" ? "Сжать" : "Reduce size", icon: <FiMinimize2 size={20} />, grad: "linear-gradient(135deg,#16a34a,#4ade80)" },
    { href: "/image-tools/resize", label: "Resize", desc: lang === "uz" ? "Ўлчам" : lang === "ru" ? "Размер" : "Resize", icon: <FiMaximize2 size={20} />, grad: "linear-gradient(135deg,#2563eb,#60a5fa)" },
    { href: "/image-tools", label: lang === "uz" ? "Барчаси" : lang === "ru" ? "Все" : "All tools", desc: lang === "uz" ? "Расм асбоблари" : lang === "ru" ? "Фото инструменты" : "Image tools", icon: <FiImage size={20} />, grad: "linear-gradient(135deg,#9333ea,#d946ef)" },
  ];

  const toolRows = [
    { title: lang === "uz" ? "QR Код Асбоблари" : lang === "ru" ? "QR Инструменты" : "QR Code Tools", href: "/qr-tools", items: qrRow },
    { title: lang === "uz" ? "PDF Асбоблари" : lang === "ru" ? "PDF Инструменты" : "PDF Tools", href: "/pdf-tools", items: pdfRow },
    { title: lang === "uz" ? "Расм Асбоблари" : lang === "ru" ? "Инструменты Изображений" : "Image Tools", href: "/image-tools", items: imageRow },
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

  const inputCls = "w-full px-4 py-3 text-sm rounded-xl";
  const inputStyle = {
    background: "var(--surface-2)",
    border: "1.5px solid var(--border)",
    color: "var(--text)",
  } as React.CSSProperties;

  return (
    <div className="relative overflow-x-clip">
      <style>{`
        @keyframes qxPulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.35)}50%{box-shadow:0 0 0 14px rgba(124,58,237,0)}}
        .qx-toggle{width:44px;height:24px;border-radius:99px;position:relative;transition:background .25s;cursor:pointer;border:1px solid var(--border)}
        .qx-toggle::after{content:"";position:absolute;top:2px;left:2px;width:18px;height:18px;border-radius:50%;background:#fff;transition:transform .25s;box-shadow:0 2px 6px rgba(0,0,0,.3)}
        .qx-toggle.on{background:#F58F20}.qx-toggle.on::after{transform:translateX(20px)}
        .qx-toggle.off{background:var(--surface-hover)}
      `}</style>

      {/* ================= HERO ================= */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pt-14 lg:pt-16 pb-16 relative">
        <hr className="qx-neon-line mb-12" />

        {/* ── TOP: Headline row ── */}
        <div className="text-center mb-12 relative z-10">
          <span className="qx-badge-hero inline-flex mb-6">
            <span className="qx-badge-hero-dot" />{t.badge}
          </span>
          <h1 className="qx-headline-main text-[42px] sm:text-[54px] lg:text-[66px] leading-[1.18] pb-1 mb-5 tracking-tight">
            {t.h1a}{" "}
            <span className="qx-headline-neon-orange">{t.h1b}</span>{" "}
            <span className="qx-headline-neon-green">{t.h1c}</span>
          </h1>
          <p className="text-[15px] lg:text-[17px] leading-relaxed max-w-xl mx-auto mb-7" style={{ color:"var(--text-muted)" }}>{t.sub}</p>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <a href="#generator" className="qx-btn-hero px-7 py-3">
              {t.cta} <FiArrowRight size={15}/>
            </a>
            <a href="#why" className="qx-btn-hero-ghost px-6 py-3">
              <FiPlay size={13}/> {t.demo}
            </a>
          </div>
        </div>

        {/* ── BOTTOM: 3 equal cards ── */}
        <div id="generator" className="grid lg:grid-cols-3 gap-5 items-stretch relative z-10">

          {/* LEFT — QR Type selector (Fireship green) */}
          <div className="qx-fcard flex flex-col" style={{ ["--fc" as string]:"#22b14c" } as React.CSSProperties}>
            <div className="px-2 pt-1 pb-3">
              <div className="qx-fcard-title text-[19px]">
                {lang==="uz"?"QR TURI"  : lang==="ru"?"ТИП QR" : "QR TYPE"}
              </div>
              <div className="qx-fcard-sub text-[12px] mt-0.5">
                {lang==="uz"?"Форматни танланг" : lang==="ru"?"Выберите формат" : "Pick your format"}
              </div>
            </div>
            <div className="qx-fcard-panel flex-1 overflow-auto p-1.5">
              {[...tabs, ...moreTabs].map((tb) => (
                <button key={tb.id} onClick={()=>{ setTab(tb.id); setMoreOpen(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] transition-all text-left"
                  style={{
                    background: tab===tb.id ? "rgba(34,177,76,0.18)" : "transparent",
                    color: tab===tb.id ? "#fff" : "var(--text-muted)",
                    fontWeight: tab===tb.id ? 700 : 500,
                  }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: tab===tb.id ? "#22b14c" : "var(--surface-2)", color: tab===tb.id ? "#0e0e0c" : "var(--text-faint)" }}>
                    {tb.icon}
                  </span>
                  {tb.label}
                  {tab===tb.id && <FiArrowRight size={12} className="ml-auto" style={{ color:"#22b14c" }}/>}
                </button>
              ))}
            </div>
          </div>

          {/* CENTER — Generator form (Fireship orange) */}
          <div data-mascot-anchor="generator" className="qx-fcard flex flex-col" style={{ ["--fc" as string]:"#F58F20" } as React.CSSProperties}>
            <div className="px-2 pt-1 pb-3">
              <div className="qx-fcard-title text-[19px]">
                {lang==="uz"?"QR ЯРАТИШ" : lang==="ru"?"СОЗДАТЬ QR" : "CREATE QR CODE"}
              </div>
              <div className="qx-fcard-sub text-[12px] mt-0.5">{t.cardSub}</div>
            </div>
            <div className="qx-fcard-panel flex flex-col flex-1 p-4">

            {/* Form fields */}
            <div className="space-y-2.5 flex-1">
              {tab==="url" && <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://yourwebsite.com" className={inputCls} style={inputStyle}/>}
              {tab==="text" && <textarea value={textVal} onChange={e=>setTextVal(e.target.value)} rows={3} placeholder="QRix..." className={`${inputCls} resize-none`} style={inputStyle}/>}
              {tab==="wifi" && <>
                <input value={ssid} onChange={e=>setSsid(e.target.value)} placeholder={t.ssid} className={inputCls} style={inputStyle}/>
                <input value={wifiPass} onChange={e=>setWifiPass(e.target.value)} placeholder={t.password} className={inputCls} style={inputStyle}/>
              </>}
              {tab==="vcard" && <div className="grid grid-cols-2 gap-2">
                <input value={vName} onChange={e=>setVName(e.target.value)} placeholder={t.fullName} className={inputCls} style={inputStyle}/>
                <input value={vPhone} onChange={e=>setVPhone(e.target.value)} placeholder={t.phone} className={inputCls} style={inputStyle}/>
                <input value={vEmail} onChange={e=>setVEmail(e.target.value)} placeholder={t.emailL} className={inputCls} style={inputStyle}/>
                <input value={vOrg} onChange={e=>setVOrg(e.target.value)} placeholder={t.org} className={inputCls} style={inputStyle}/>
              </div>}
              {tab==="email" && <>
                <input value={emTo} onChange={e=>setEmTo(e.target.value)} placeholder={t.emailTo} className={inputCls} style={inputStyle}/>
                <input value={emSub} onChange={e=>setEmSub(e.target.value)} placeholder={t.subject} className={inputCls} style={inputStyle}/>
                <textarea value={emBody} onChange={e=>setEmBody(e.target.value)} rows={2} placeholder={t.body} className={`${inputCls} resize-none`} style={inputStyle}/>
              </>}
              {tab==="sms" && <>
                <input value={smsNum} onChange={e=>setSmsNum(e.target.value)} placeholder={t.smsPhone} className={inputCls} style={inputStyle}/>
                <textarea value={smsMsg} onChange={e=>setSmsMsg(e.target.value)} rows={2} placeholder={t.smsMsg} className={`${inputCls} resize-none`} style={inputStyle}/>
              </>}
              {tab==="whatsapp" && <>
                <input value={waNum} onChange={e=>setWaNum(e.target.value)} placeholder={t.waPhone} className={inputCls} style={inputStyle}/>
                <textarea value={waMsg} onChange={e=>setWaMsg(e.target.value)} rows={2} placeholder={t.waMsg} className={`${inputCls} resize-none`} style={inputStyle}/>
              </>}
              {tab==="telegram" && <input value={tgUser} onChange={e=>setTgUser(e.target.value)} placeholder={t.tgUser} className={inputCls} style={inputStyle}/>}
            </div>

            {/* PIN */}
            <div className="mt-4 p-3 rounded-xl" style={{ background:"rgba(245,143,32,0.05)", border:"1px solid rgba(245,143,32,0.18)" }}>
              <div className="flex items-center gap-2 mb-2">
                <FiLock size={11} style={{ color:"#F58F20" }}/>
                <span className="text-[11px] font-semibold" style={{ color:"var(--text)" }}>{t.pin}</span>
                <span className="text-[10px]" style={{ color:"var(--text-faint)" }}>{t.pinOpt}</span>
              </div>
              <div className="flex gap-2">
                <input value={pin}
                  onChange={e=>{ setPin(e.target.value.replace(/\D/g,"").slice(0,10)); setPinConfirmed(false); setPinOn(e.target.value.length>0); }}
                  placeholder={t.pinPh} inputMode="numeric"
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
          <div className="qx-fcard flex flex-col" style={{ ["--fc" as string]:"#8b5cf6" } as React.CSSProperties}>
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
                className="flex items-center justify-center w-full" style={{ perspective:700 }}>
                <div ref={canvasWrapRef} className="p-4 rounded-2xl transition-transform duration-150"
                  style={{ background:bg, transform:`rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    boxShadow:"0 16px 40px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,0.06)" }}>
                  <QRCodeCanvas value={qrValue} size={180} bgColor={bg} fgColor={fg} level={level} marginSize={1}
                    imageSettings={logo?{src:logo,height:Math.round(qrSize*.2),width:Math.round(qrSize*.2),excavate:true}:undefined}/>
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

      {/* ================= TOOLS — 3D сузувчи карталар ================= */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-16">
        <ToolCards3D
          rows={toolRows}
          heading={lang === "uz" ? "Барча Асбоблар" : lang === "ru" ? "Все Инструменты" : "All Tools"}
        />
      </section>

      {/* ================= STATS ================= */}
      <section className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20">
        <div className="qx-card relative overflow-hidden">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-0">
            {stats.map((s, i) => (
              <div key={s.label} className="flex flex-col items-center justify-center text-center p-7 relative group"
                style={{ borderRight: i < stats.length - 1 ? "1px solid var(--card-border)" : "none" }}>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                  style={{ background:`radial-gradient(circle at 50% 50%, ${s.color}20 0%, transparent 70%)` }}/>
                <span className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-lg"
                  style={{ background:`${s.color}15`, color:s.color, boxShadow:`0 0 20px ${s.color}30` }}>
                  {s.icon}
                </span>
                <div className="qx-counter-big" style={{ textShadow:`0 0 30px ${s.color}40` }}>
                  <CountUp end={s.end} suffix={s.suffix} />
                </div>
                <div className="text-[11px] mt-1 font-medium" style={{ color:"var(--text-muted)" }}>{s.label}</div>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center text-center p-7 group relative">
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none"
                style={{ background:"radial-gradient(circle at 50%,rgba(52,211,153,.12) 0%,transparent 70%)" }}/>
              <span className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 text-lg"
                style={{ background:"rgba(52,211,153,.12)", color:"#34d399", boxShadow:"0 0 20px rgba(52,211,153,.25)" }}>
                <FiShield/>
              </span>
              <div className="qx-counter-big" style={{ color:"#34d399", textShadow:"0 0 30px rgba(52,211,153,.5)" }}>99.9%</div>
              <div className="text-[11px] mt-1 font-medium" style={{ color:"var(--text-muted)" }}>{t.statUptime}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= WHY QRIX — BENTO GRID ================= */}
      <section id="why" className="max-w-[1400px] mx-auto px-5 lg:px-8 pb-20">
        <hr className="qx-neon-line mb-16" />
        <div className="text-center mb-12">
          <h2 className="qx-section-title justify-center" style={{ color:"var(--text)", fontSize:"clamp(2rem,5vw,3.2rem)", fontWeight:900 }}>
            {t.whyTitle}{" "}
            <span className="qx-headline-neon-orange">QRix</span>?
          </h2>
          <p className="mt-4 text-[16px] max-w-[520px] mx-auto" style={{ color:"var(--text-muted)" }}>{t.whySub}</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={f.title} className={`qx-bento qx-rise qx-rise-${i+1}`}>
              {/* icon color glow */}
              <div className="absolute inset-0 opacity-40 pointer-events-none"
                style={{ background:`radial-gradient(circle at 28% 24%, ${f.grad.match(/#[0-9a-f]{6}/i)?.[0] ?? "#F58F20"}26 0%, transparent 58%)` }}/>
              <div className="qx-bento-icon text-white"
                style={{ background:f.grad, boxShadow:`0 8px 24px ${f.grad.match(/#[0-9a-f]{6}/i)?.[0] ?? "#F58F20"}45` }}>
                {f.icon}
              </div>
              <h3 className="font-display text-[17px] font-bold mb-2" style={{ color:"var(--text)" }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color:"var(--text-muted)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================= REVIEWS ================= */}
      <ReviewsSection lang={lang} />

      {/* ================= FOOTER ================= */}
      <footer className="mt-10 relative overflow-hidden">
        {/* Top neon line */}
        <hr className="qx-neon-line" />
        {/* Footer bg subtle top glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(245,143,32,.05) 0%, transparent 60%)" }} />

        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8 pt-14 pb-10 grid md:grid-cols-[1.6fr_1fr_1fr_1.2fr] gap-12">
          {/* Brand */}
          <div>
            <div className="font-display flex items-center gap-0.5 mb-5">
              <span className="text-3xl font-black tracking-tight" style={{ color: "var(--text)" }}>QR</span>
              <span className="text-3xl font-black tracking-tight" style={{ color: "#F58F20" }}>ix</span>
            </div>
            <p className="text-sm leading-relaxed max-w-[240px] mb-6" style={{ color: "var(--text-muted)" }}>{t.footAbout}</p>
            {/* Social chips */}
            <div className="flex gap-2">
              {[
                { href: "mailto:musarasulzada@gmail.com", icon: <FiMail size={14} />, label: "Email" },
                { href: "https://t.me/QRix2020", icon: <FiSend size={14} />, label: "Telegram" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all hover:scale-110"
                  style={{ background: "rgba(245,143,32,.1)", border: "1px solid rgba(245,143,32,.25)", color: "#F58F20" }}
                  aria-label={s.label}>
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-faint)" }}>{t.footProduct}</h4>
            <div className="space-y-3 text-sm">
              {[
                { href: "/url-qr", label: "URL QR" },
                { href: "/dashboard", label: "Dashboard" },
                { href: "/scanner", label: "QR Scanner" },
                { href: "/login", label: "Sign in" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="block transition-all hover:translate-x-1"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F58F20")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-faint)" }}>{t.footTools}</h4>
            <div className="space-y-3 text-sm">
              {[
                { href: "/pdf-tools", label: "PDF Tools" },
                { href: "/image-tools", label: "Image Tools" },
                { href: "/wifi-qr", label: "WiFi QR" },
                { href: "/vcard-qr", label: "vCard QR" },
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  className="block transition-all hover:translate-x-1"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F58F20")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                >{l.label}</Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-[11px] font-bold uppercase tracking-widest mb-5" style={{ color: "var(--text-faint)" }}>{t.footContact}</h4>
            <div className="space-y-3 text-sm">
              <a href="mailto:musarasulzada@gmail.com"
                className="flex items-center gap-2.5 transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F58F20")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
                <FiMail size={14} style={{ color: "#F58F20" }} /> musarasulzada@gmail.com
              </a>
              <a href="https://t.me/QRix2020" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2.5 transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#F58F20")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}>
                <FiSend size={14} style={{ color: "#F58F20" }} /> @QRix2020
              </a>
            </div>
            {/* CTA mini */}
            <Link href="/register" className="qx-btn mt-8 text-sm inline-flex">
              Get Started Free →
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="relative max-w-[1400px] mx-auto px-5 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid rgba(255,255,255,.06)" }}>
          <div className="text-[12px]" style={{ color: "var(--text-faint)" }}>
            © 2026 <span style={{ color: "#F58F20" }}>QRix</span>. {t.rights}
          </div>
          <div className="flex items-center gap-4 text-[12px]" style={{ color: "var(--text-faint)" }}>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-green-400 inline-block" style={{ boxShadow: "0 0 6px #34d399" }} />
              All systems operational
            </span>
            <span>·</span>
            <span>v2.0</span>
          </div>
        </div>
      </footer>

      {/* ================= DESIGN MODAL ================= */}
      {designOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,.6)", backdropFilter: "blur(8px)" }}
          onClick={() => setDesignOpen(false)}>
          <div className="qx-card w-full max-w-lg max-h-[88vh] overflow-y-auto p-6 relative"
            style={{ background: "var(--surface)" }}
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-lg font-bold flex items-center gap-2" style={{ color: "var(--text)" }}>
                <FiSliders style={{ color: "#F58F20" }} /> {t.designTitle}
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
                    style={{ background: c, border: fg === c ? "2px solid #F58F20" : "1px solid var(--border)", boxShadow: fg === c ? "0 0 0 3px rgba(245,143,32,0.2)" : "none" }}
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
                    style={{ background: c, border: bg === c ? "2px solid #F58F20" : "1px solid var(--border)", boxShadow: bg === c ? "0 0 0 3px rgba(245,143,32,0.2)" : "none" }}
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
                      background: level === lv ? "#F58F20" : "var(--surface-2)",
                      color: level === lv ? "#0c0c0c" : "var(--text-muted)",
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
