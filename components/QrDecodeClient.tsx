"use client";

import { useState } from "react";
import Link from "next/link";
import { FiSearch, FiCopy, FiCheck, FiExternalLink, FiShield, FiAlertTriangle } from "react-icons/fi";
import { UploadBox } from "@/components/PdfToTextClient";
import { trackTool } from "@/lib/track";
import { readWifiField } from "@/lib/qr-payload";

/* eslint-disable @next/next/no-img-element */

type Decoded = { text: string; kind: string; hint?: string };

// Anti-quishing: analyse a decoded link and surface the real destination +
// risk signals BEFORE the user opens it (the #1 QR safety complaint).
type Flag = { level: "warn" | "danger"; msg: string };
type Safety = { level: "safe" | "caution" | "danger"; host: string; flags: Flag[] };

const SHORTENERS = ["bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly", "is.gd", "buff.ly", "rebrand.ly", "cutt.ly", "rb.gy", "shorturl.at", "tiny.cc", "bl.ink", "lnkd.in"];
const BRANDS = ["paypal", "apple", "google", "microsoft", "amazon", "facebook", "instagram", "netflix", "binance", "whatsapp", "telegram", "coinbase"];

function analyzeUrl(raw: string): Safety {
  let u: URL;
  try { u = new URL(raw); } catch { return { level: "caution", host: raw.slice(0, 60), flags: [{ level: "warn", msg: "This isn't a standard web address — inspect it before trusting it." }] }; }
  const host = u.hostname.toLowerCase();
  const flags: Flag[] = [];
  if (u.protocol === "http:") flags.push({ level: "warn", msg: "Not secure (http) — the connection isn't encrypted." });
  if (SHORTENERS.includes(host)) flags.push({ level: "warn", msg: "Shortened / redirect link — the real destination is hidden until you open it." });
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) flags.push({ level: "danger", msg: "Uses a raw IP address instead of a domain — a common scam signal." });
  if (u.username || u.password) flags.push({ level: "danger", msg: "Login details are embedded in the link — a classic phishing trick." });
  if (/xn--/.test(host)) flags.push({ level: "danger", msg: "Punycode domain — may impersonate a real site (look-alike letters)." });
  const parts = host.split(".");
  const reg = parts.slice(-2).join(".");
  if (parts.length >= 5) flags.push({ level: "warn", msg: "Unusually many subdomains — check the real domain at the end." });
  for (const b of BRANDS) {
    if (host.includes(b) && reg !== `${b}.com` && !reg.startsWith(`${b}.`)) {
      flags.push({ level: "danger", msg: `Mentions “${b}” but the real domain is ${reg} — likely impersonation.` });
      break;
    }
  }
  const level = flags.some((f) => f.level === "danger") ? "danger" : flags.length ? "caution" : "safe";
  return { level, host: u.hostname, flags };
}

function classify(text: string): Decoded {
  const t = text.trim();
  if (/^https?:\/\//i.test(t)) return { text: t, kind: "🔗 Website link" };
  if (/^WIFI:/i.test(t)) {
    const ssid = readWifiField(t, "S");
    const pass = readWifiField(t, "P");
    const hidden = readWifiField(t, "H") === "true";
    return {
      text: t,
      kind: "📶 WiFi network",
      hint: `SSID: ${ssid || "?"}${pass ? ` · Password: ${pass}` : ""}${hidden ? " · Hidden" : ""}`,
    };
  }
  if (/^BEGIN:VCARD/i.test(t)) {
    const name = (t.match(/FN:(.*)/) || [])[1];
    return { text: t, kind: "🪪 Contact card (vCard)", hint: name ? `Name: ${name.trim()}` : undefined };
  }
  if (/^mailto:/i.test(t)) return { text: t, kind: "📧 Email address" };
  if (/^tel:/i.test(t)) return { text: t, kind: "📞 Phone number" };
  if (/^SMSTO:/i.test(t)) return { text: t, kind: "💬 SMS message" };
  if (/^bitcoin:|^ethereum:/i.test(t)) return { text: t, kind: "🪙 Crypto payment" };
  if (/^BEGIN:VEVENT/i.test(t)) return { text: t, kind: "📅 Calendar event" };
  if (/^geo:/i.test(t)) return { text: t, kind: "📍 Location" };
  return { text: t, kind: "📝 Plain text" };
}

export default function QrDecodeClient() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<Decoded | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function onFile(f: File | null) {
    setFile(f); setResult(null); setError("");
    if (preview) URL.revokeObjectURL(preview);
    setPreview(f ? URL.createObjectURL(f) : null);
    if (!f) return;
    setBusy(true);
    try {
      const jsQR = (await import("jsqr")).default;
      const img = await loadImage(f);
      // try a few scales — small/large photos both decode better at ~1000px
      const sizes = [1000, 600, 1600];
      let found: string | null = null;
      for (const target of sizes) {
        const scale = Math.min(1, target / Math.max(img.naturalWidth, img.naturalHeight));
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0, w, h);
        const data = ctx.getImageData(0, 0, w, h);
        const code = jsQR(data.data, w, h, { inversionAttempts: "attemptBoth" });
        if (code?.data) { found = code.data; break; }
      }
      if (found) {
        setResult(classify(found));
        trackTool("qr-decode", { ok: true });
      } else {
        setError("No QR code found in this image. Try a sharper, closer photo with the full code visible.");
      }
    } catch (e) {
      setError("Could not read the image: " + (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  const isLink = result && /^https?:\/\//i.test(result.text);
  const safety = isLink && result ? analyzeUrl(result.text) : null;
  const SAFE_UI = {
    safe: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", bd: "rgba(34,197,94,0.3)", icon: <FiShield size={15} />, label: "Looks safe" },
    caution: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", bd: "rgba(245,158,11,0.3)", icon: <FiAlertTriangle size={15} />, label: "Be careful" },
    danger: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", bd: "rgba(239,68,68,0.35)", icon: <FiAlertTriangle size={15} />, label: "High risk — don't visit unless you trust it" },
  } as const;

  return (
    <div className="qx-card p-6 max-w-2xl">
      <UploadBox file={file} setFile={onFile} accept="image/*" />

      {busy && <p className="text-[12px] mt-3 text-center" style={{ color: "var(--primary-bright)" }}>🔍 Scanning image…</p>}
      {error && <p className="text-[13px] mt-4 px-3 py-2.5 rounded-lg" style={{ color: "#fca5a5", background: "rgba(224,82,82,0.1)", border: "1px solid rgba(224,82,82,0.25)" }}>{error}</p>}

      {preview && (
        <div className="mt-4 flex justify-center">
          <img src={preview} alt="uploaded" className="max-h-44 rounded-xl" style={{ border: "1px solid var(--border)" }} />
        </div>
      )}

      {result && (
        <div className="mt-5 rounded-2xl p-4" style={{ background: "rgba(70,116,52,0.08)", border: "1px solid rgba(70,116,52,0.3)" }}>
          <div className="text-[12px] font-bold mb-1" style={{ color: "var(--success)" }}>✅ Decoded — {result.kind}</div>
          {result.hint && <div className="text-[12px] mb-1.5" style={{ color: "var(--text-muted)" }}>{result.hint}</div>}
          <div className="text-[13px] break-all font-mono p-2.5 rounded-lg" style={{ background: "var(--surface-2)", color: "var(--text)", border: "1px solid var(--border)" }}>
            {result.text}
          </div>

          {/* Anti-quishing safety check — shown before you open the link */}
          {safety && (
            <div className="mt-3 rounded-xl p-3.5" style={{ background: SAFE_UI[safety.level].bg, border: `1px solid ${SAFE_UI[safety.level].bd}` }}>
              <div className="flex items-center gap-2 text-[13px] font-bold" style={{ color: SAFE_UI[safety.level].color }}>
                {SAFE_UI[safety.level].icon} {SAFE_UI[safety.level].label}
              </div>
              <div className="mt-2 text-[12px]" style={{ color: "var(--text-muted)" }}>
                You&apos;re about to visit:{" "}
                <span className="font-bold font-mono" style={{ color: "var(--text)" }}>{safety.host}</span>
              </div>
              {safety.flags.length > 0 && (
                <ul className="mt-2 space-y-1.5">
                  {safety.flags.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12px]" style={{ color: f.level === "danger" ? SAFE_UI.danger.color : "var(--text-muted)" }}>
                      <FiAlertTriangle size={12} className="mt-0.5 shrink-0" style={{ color: f.level === "danger" ? SAFE_UI.danger.color : SAFE_UI.caution.color }} />
                      {f.msg}
                    </li>
                  ))}
                </ul>
              )}
              {safety.level === "safe" && <div className="mt-1.5 text-[11.5px]" style={{ color: "var(--text-faint)" }}>No obvious red flags — but always make sure you recognise the site before entering any details.</div>}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <button onClick={copy} className="qx-btn !text-xs !py-2">{copied ? <FiCheck size={13} /> : <FiCopy size={13} />} Copy</button>
            {isLink && (
              <a href={result.text} target="_blank" rel="noopener noreferrer"
                className={safety?.level === "danger" ? "qx-btn-ghost !text-xs !py-2" : "qx-btn !text-xs !py-2"}
                style={safety?.level === "danger" ? { color: SAFE_UI.danger.color, borderColor: SAFE_UI.danger.bd } : undefined}>
                <FiExternalLink size={13} /> {safety?.level === "danger" ? "Open anyway (risky)" : "Open link"}
              </a>
            )}
            <Link href="/" className="qx-btn-ghost !text-xs !py-2"><FiSearch size={13} /> Create your own QR</Link>
          </div>
        </div>
      )}
    </div>
  );
}

function loadImage(f: File): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = url;
  });
}
