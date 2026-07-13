"use client";

/* Share buttons (Mission 67) — a small virality loop placed on content pages
   (blog, use-cases, tools). Uses the native Web Share API when available and
   falls back to per-network share intents. Also copies the link. Nothing is
   sent automatically — each button opens the network's own compose window. */

import { useState } from "react";
import { FiShare2, FiCopy, FiCheck } from "react-icons/fi";
import { FaXTwitter, FaWhatsapp, FaTelegram, FaFacebookF, FaLinkedinIn } from "react-icons/fa6";

type Net = { key: string; label: string; icon: React.ReactNode; color: string; href: (u: string, t: string) => string };

const NETS: Net[] = [
  { key: "x", label: "Share on X", icon: <FaXTwitter size={15} />, color: "#000000", href: (u, t) => `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  { key: "wa", label: "Share on WhatsApp", icon: <FaWhatsapp size={16} />, color: "#25D366", href: (u, t) => `https://wa.me/?text=${t}%20${u}` },
  { key: "tg", label: "Share on Telegram", icon: <FaTelegram size={16} />, color: "#26A5E4", href: (u, t) => `https://t.me/share/url?url=${u}&text=${t}` },
  { key: "fb", label: "Share on Facebook", icon: <FaFacebookF size={15} />, color: "#1877F2", href: (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  { key: "in", label: "Share on LinkedIn", icon: <FaLinkedinIn size={15} />, color: "#0A66C2", href: (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
];

export default function ShareButtons({ url, title, label = "Share" }: { url?: string; title: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const link = () => url || (typeof window !== "undefined" ? window.location.href : "");
  const enc = (s: string) => encodeURIComponent(s);

  const native = async () => {
    try {
      if (navigator.share) { await navigator.share({ title, url: link() }); }
      else await copy();
    } catch { /* user cancelled */ }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  };

  const open = (n: Net) => window.open(n.href(enc(link()), enc(title)), "_blank", "noopener,noreferrer");

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      <span className="inline-flex items-center gap-1.5 text-[12.5px] font-bold mr-1" style={{ color: "var(--text-muted)" }}>
        <FiShare2 size={13} /> {label}
      </span>
      {NETS.map((n) => (
        <button key={n.key} type="button" onClick={() => open(n)} aria-label={n.label} title={n.label}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--surface-2)", color: n.color, border: "1px solid var(--border)" }}>
          {n.icon}
        </button>
      ))}
      <button type="button" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"} title="Copy link"
        className="inline-flex items-center gap-1.5 h-9 px-3 rounded-xl text-[12.5px] font-bold transition-colors"
        style={{ background: copied ? "var(--primary-dim)" : "var(--surface-2)", color: copied ? "var(--primary-bright)" : "var(--text)", border: "1px solid var(--border)" }}>
        {copied ? <><FiCheck size={13} /> Copied</> : <><FiCopy size={13} /> Copy</>}
      </button>
      <button type="button" onClick={native} aria-label="Share…" title="More share options"
        className="w-9 h-9 rounded-xl flex items-center justify-center sm:hidden"
        style={{ background: "var(--grad-primary)", color: "#0e0e0e" }}>
        <FiShare2 size={15} />
      </button>
    </div>
  );
}
