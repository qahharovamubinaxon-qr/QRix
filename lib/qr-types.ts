import type { QrType } from "@/components/QRGenerator";
import { buildWifi, buildEvent } from "./qr-payload";

const enc = encodeURIComponent;

export const QR_TYPES: Record<string, QrType> = {
  url: {
    id: "url",
    fields: [{ key: "url", label: "Website URL", placeholder: "https://example.com", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://qrixtools.com",
  },
  text: {
    id: "text",
    fields: [{ key: "text", label: "Your text", placeholder: "Type any text...", type: "textarea", full: true }],
    build: (v) => v.text?.trim() || "QRix",
  },
  email: {
    id: "email",
    fields: [
      { key: "to", label: "Recipient email", placeholder: "name@example.com", type: "email" },
      { key: "subject", label: "Subject", placeholder: "Subject" },
      { key: "body", label: "Message", placeholder: "Your message...", type: "textarea", full: true },
    ],
    build: (v) => `mailto:${v.to || ""}?subject=${enc(v.subject || "")}&body=${enc(v.body || "")}`,
  },
  phone: {
    id: "phone",
    fields: [{ key: "phone", label: "Phone number", placeholder: "+998901234567", type: "tel", full: true }],
    build: (v) => `tel:${(v.phone || "").replace(/\s/g, "")}`,
  },
  sms: {
    id: "sms",
    fields: [
      { key: "phone", label: "Phone number", placeholder: "+998901234567", type: "tel" },
      { key: "msg", label: "Message", placeholder: "Your message...", type: "textarea", full: true },
    ],
    build: (v) => `SMSTO:${v.phone || ""}:${v.msg || ""}`,
  },
  wifi: {
    id: "wifi",
    fields: [
      { key: "ssid", label: "Network name (SSID)", placeholder: "MyWiFi" },
      { key: "password", label: "Password", placeholder: "Password", type: "password" },
      { key: "enc", label: "Encryption", type: "select", options: [
        { value: "WPA", label: "WPA/WPA2" }, { value: "WEP", label: "WEP" }, { value: "nopass", label: "No password" },
      ] },
      { key: "hidden", label: "Hidden network", type: "select", options: [
        { value: "no", label: "No — network is visible" }, { value: "yes", label: "Yes — SSID is hidden" },
      ] },
    ],
    build: (v) => buildWifi(v),
  },
  whatsapp: {
    id: "whatsapp",
    fields: [
      { key: "phone", label: "WhatsApp number", placeholder: "998901234567", type: "tel" },
      { key: "msg", label: "Pre-filled message", placeholder: "Hello!", type: "textarea", full: true },
    ],
    build: (v) => `https://wa.me/${(v.phone || "").replace(/\D/g, "")}${v.msg ? `?text=${enc(v.msg)}` : ""}`,
  },
  telegram: {
    id: "telegram",
    fields: [{ key: "user", label: "Telegram username", placeholder: "username (without @)", full: true }],
    build: (v) => `https://t.me/${(v.user || "").replace("@", "")}`,
  },
  instagram: {
    id: "instagram",
    fields: [{ key: "user", label: "Instagram username", placeholder: "username (without @)", full: true }],
    build: (v) => `https://instagram.com/${(v.user || "").replace("@", "")}`,
  },
  facebook: {
    id: "facebook",
    fields: [{ key: "url", label: "Facebook page URL or username", placeholder: "facebook.com/yourpage", full: true }],
    build: (v) => { const x = v.url || ""; return x.startsWith("http") ? x : `https://facebook.com/${x}`; },
  },
  twitter: {
    id: "twitter",
    fields: [{ key: "user", label: "X / Twitter username", placeholder: "username (without @)", full: true }],
    build: (v) => `https://twitter.com/${(v.user || "").replace("@", "")}`,
  },
  youtube: {
    id: "youtube",
    fields: [{ key: "url", label: "YouTube video or channel URL", placeholder: "https://youtube.com/...", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://youtube.com",
  },
  tiktok: {
    id: "tiktok",
    fields: [{ key: "user", label: "TikTok username", placeholder: "username (without @)", full: true }],
    build: (v) => `https://tiktok.com/@${(v.user || "").replace("@", "")}`,
  },
  linkedin: {
    id: "linkedin",
    fields: [{ key: "url", label: "LinkedIn profile URL", placeholder: "https://linkedin.com/in/you", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://linkedin.com",
  },
  vcard: {
    id: "vcard",
    fields: [
      { key: "first", label: "First name", placeholder: "John" },
      { key: "last", label: "Last name", placeholder: "Doe" },
      { key: "phone", label: "Phone", placeholder: "+998901234567", type: "tel" },
      { key: "email", label: "Email", placeholder: "john@example.com", type: "email" },
      { key: "org", label: "Company", placeholder: "Company Inc." },
      { key: "title", label: "Job title", placeholder: "Manager" },
      { key: "url", label: "Website", placeholder: "https://example.com", type: "url" },
      { key: "address", label: "Address", placeholder: "Street, City" },
    ],
    build: (v) =>
      `BEGIN:VCARD\nVERSION:3.0\nN:${v.last || ""};${v.first || ""}\nFN:${v.first || ""} ${v.last || ""}\nTEL:${v.phone || ""}\nEMAIL:${v.email || ""}\nORG:${v.org || ""}\nTITLE:${v.title || ""}\nURL:${v.url || ""}\nADR:;;${v.address || ""}\nEND:VCARD`,
  },
  mecard: {
    id: "mecard",
    fields: [
      { key: "name", label: "Full name", placeholder: "John Doe" },
      { key: "phone", label: "Phone", placeholder: "+998901234567", type: "tel" },
      { key: "email", label: "Email", placeholder: "john@example.com", type: "email" },
    ],
    build: (v) => `MECARD:N:${v.name || ""};TEL:${v.phone || ""};EMAIL:${v.email || ""};;`,
  },
  event: {
    id: "event",
    fields: [
      { key: "title", label: "Event title", placeholder: "Meeting", full: true },
      { key: "location", label: "Location", placeholder: "Office", full: true },
      { key: "start", label: "Start", type: "datetime-local" },
      { key: "end", label: "End", type: "datetime-local" },
      { key: "description", label: "Description / notes", placeholder: "Agenda, dress code, parking…", type: "textarea", full: true },
    ],
    build: (v) => buildEvent(v),
  },
  geo: {
    id: "geo",
    fields: [
      { key: "lat", label: "Latitude", placeholder: "41.3111", type: "number" },
      { key: "lng", label: "Longitude", placeholder: "69.2797", type: "number" },
    ],
    build: (v) => `geo:${v.lat || "0"},${v.lng || "0"}`,
  },
  maps: {
    id: "maps",
    fields: [{ key: "query", label: "Place or address", placeholder: "Tashkent, Uzbekistan", full: true }],
    build: (v) => `https://maps.google.com/?q=${enc(v.query || "")}`,
  },
  paypal: {
    id: "paypal",
    fields: [
      { key: "user", label: "PayPal.me username", placeholder: "yourname" },
      { key: "amount", label: "Amount (optional)", placeholder: "10", type: "number" },
    ],
    build: (v) => `https://paypal.me/${v.user || ""}${v.amount ? `/${v.amount}` : ""}`,
  },
  upi: {
    id: "upi",
    fields: [
      { key: "vpa", label: "UPI ID (VPA)", placeholder: "yourname@bank", full: true },
      { key: "name", label: "Payee name", placeholder: "Your name" },
      { key: "amount", label: "Amount ₹ (optional)", placeholder: "100", type: "number" },
      { key: "note", label: "Note (optional)", placeholder: "Payment for…" },
    ],
    build: (v) => {
      const parts = [`pa=${enc((v.vpa || "").trim())}`];
      if (v.name) parts.push(`pn=${enc(v.name.trim())}`);
      if (v.amount) parts.push(`am=${enc(String(v.amount).trim())}`, "cu=INR");
      if (v.note) parts.push(`tn=${enc(v.note.trim())}`);
      return `upi://pay?${parts.join("&")}`;
    },
  },
  gs1: {
    id: "gs1",
    fields: [
      { key: "gtin", label: "GTIN (product barcode number)", placeholder: "09506000134352", full: true },
      { key: "domain", label: "Resolver domain", placeholder: "id.gs1.org" },
      { key: "batch", label: "Batch / Lot (optional)", placeholder: "ABC123" },
      { key: "serial", label: "Serial (optional)", placeholder: "1000001" },
      { key: "expiry", label: "Expiry YYMMDD (optional)", placeholder: "271231" },
    ],
    build: (v) => {
      const domain = (v.domain || "id.gs1.org").trim().replace(/^https?:\/\//i, "").replace(/\/+$/, "") || "id.gs1.org";
      const gtin = (v.gtin || "").replace(/\D/g, "").padStart(14, "0").slice(-14);
      let url = `https://${domain}/01/${gtin}`;
      if (v.batch?.trim()) url += `/10/${enc(v.batch.trim())}`;
      if (v.serial?.trim()) url += `/21/${enc(v.serial.trim())}`;
      const exp = (v.expiry || "").replace(/\D/g, "");
      if (exp) url += `?17=${exp}`;
      return url;
    },
  },
  bitcoin: {
    id: "bitcoin",
    fields: [
      { key: "address", label: "Bitcoin address", placeholder: "bc1q...", full: true },
      { key: "amount", label: "Amount (BTC, optional)", placeholder: "0.001", type: "number" },
    ],
    build: (v) => `bitcoin:${v.address || ""}${v.amount ? `?amount=${v.amount}` : ""}`,
  },
  appstore: {
    id: "appstore",
    fields: [{ key: "url", label: "App Store / Play Store URL", placeholder: "https://apps.apple.com/...", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://apps.apple.com",
  },
  spotify: {
    id: "spotify",
    fields: [{ key: "url", label: "Spotify track / playlist URL", placeholder: "https://open.spotify.com/...", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://open.spotify.com",
  },
  zoom: {
    id: "zoom",
    fields: [{ key: "url", label: "Zoom meeting URL", placeholder: "https://zoom.us/j/...", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://zoom.us",
  },
  skype: {
    id: "skype",
    fields: [{ key: "user", label: "Skype username", placeholder: "username", full: true }],
    build: (v) => `skype:${v.user || ""}?call`,
  },
  facetime: {
    id: "facetime",
    fields: [{ key: "contact", label: "Phone or Apple ID", placeholder: "+998901234567 or email", full: true }],
    build: (v) => `facetime:${v.contact || ""}`,
  },
  youtubeChannel: {
    id: "youtubeChannel",
    fields: [{ key: "url", label: "YouTube channel URL", placeholder: "https://youtube.com/@channel", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://youtube.com",
  },
  pdf: {
    id: "pdf",
    fields: [{ key: "url", label: "PDF file URL", placeholder: "https://example.com/file.pdf", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://qrixtools.com",
  },
  app: {
    id: "app",
    fields: [{ key: "url", label: "App / website link", placeholder: "https://example.com", type: "url", full: true }],
    build: (v) => v.url?.trim() || "https://qrixtools.com",
  },
  crypto: {
    id: "crypto",
    fields: [
      { key: "coin", label: "Coin", type: "select", options: [
        { value: "ethereum", label: "Ethereum" }, { value: "litecoin", label: "Litecoin" }, { value: "dogecoin", label: "Dogecoin" },
      ] },
      { key: "address", label: "Wallet address", placeholder: "0x...", full: true },
    ],
    build: (v) => `${v.coin || "ethereum"}:${v.address || ""}`,
  },
  wifiGuest: {
    id: "wifiGuest",
    fields: [
      { key: "ssid", label: "Guest network name", placeholder: "Guest-WiFi" },
      { key: "password", label: "Password", placeholder: "Password", type: "password" },
      { key: "enc", label: "Encryption", type: "select", options: [
        { value: "WPA", label: "WPA/WPA2" }, { value: "nopass", label: "Open — no password" },
      ] },
    ],
    build: (v) => buildWifi(v),
  },
};
