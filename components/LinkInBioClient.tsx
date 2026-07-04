"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiTrash2, FiCopy, FiCheck, FiDownload, FiExternalLink } from "react-icons/fi";
import { encodeBio, type BioPage, type LinkItem } from "@/lib/linkpage";
import BioView from "@/components/BioView";
import { trackTool } from "@/lib/track";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ACCENTS = ["#F58F20", "#16a34a", "#7c3aed", "#2563eb", "#db2777", "#0891b2", "#0e0e0e"];
const AVATARS = ["😀", "🚀", "🌟", "🎵", "🍕", "💼", "📸", "❤️"];

/* Ready-made business templates — one click fills the whole page */
type Template = { id: string; label: string; emoji: string; page: Omit<BioPage, "l"> & { l: LinkItem[] } };
const TEMPLATES: Template[] = [
  { id: "restaurant", label: "Restaurant / Café", emoji: "🍕", page: { t: "Bella Cucina", s: "Fresh pasta & wood-fired pizza — order or book below 👇", av: "🍕", c: "#e05252",
    l: [{ label: "📖 View our menu", url: "" }, { label: "🛵 Order delivery", url: "" }, { label: "📅 Book a table", url: "" }, { label: "⭐ Leave a review", url: "" }, { label: "📍 Find us on the map", url: "" }] } },
  { id: "shop", label: "Shop / Store", emoji: "🛍️", page: { t: "Nova Store", s: "New arrivals every week — shop online or visit us 🛍️", av: "🛍️", c: "#7c3aed",
    l: [{ label: "🛒 Shop online", url: "" }, { label: "🔥 This week's deals", url: "" }, { label: "📸 Instagram", url: "" }, { label: "💬 WhatsApp us", url: "" }, { label: "📍 Store location", url: "" }] } },
  { id: "salon", label: "Salon / Beauty", emoji: "💅", page: { t: "Glow Studio", s: "Hair · nails · lashes — book your slot in seconds ✨", av: "💅", c: "#db2777",
    l: [{ label: "📅 Book an appointment", url: "" }, { label: "💰 Price list", url: "" }, { label: "📸 Our work (Instagram)", url: "" }, { label: "💬 Ask a question", url: "" }] } },
  { id: "freelancer", label: "Freelancer", emoji: "💼", page: { t: "Alex Karimov", s: "Web developer & designer — let's build something great", av: "💼", c: "#2563eb",
    l: [{ label: "🗂️ My portfolio", url: "" }, { label: "💼 LinkedIn", url: "" }, { label: "✉️ Hire me", url: "" }, { label: "📄 Download CV", url: "" }] } },
  { id: "musician", label: "Musician / Creator", emoji: "🎵", page: { t: "DJ Nightwave", s: "New single out now — stream it everywhere 🎧", av: "🎵", c: "#0891b2",
    l: [{ label: "🎧 Spotify", url: "" }, { label: "▶️ YouTube", url: "" }, { label: "🎬 TikTok", url: "" }, { label: "🎟️ Upcoming shows", url: "" }] } },
  { id: "event", label: "Event / Wedding", emoji: "🎉", page: { t: "Aziza & Timur", s: "We're getting married! All the details below 💍", av: "🎉", c: "#F58F20",
    l: [{ label: "📅 Save the date", url: "" }, { label: "📍 Venue & directions", url: "" }, { label: "✅ RSVP", url: "" }, { label: "🎁 Gift registry", url: "" }] } },
];

export default function LinkInBioClient() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [avatar, setAvatar] = useState("🚀");
  const [accent, setAccent] = useState("#F58F20");
  const [links, setLinks] = useState<LinkItem[]>([
    { label: "My website", url: "" },
    { label: "Instagram", url: "" },
  ]);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const qrMount = useRef<HTMLDivElement>(null);
  const qrRef = useRef<any>(null);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const page: BioPage = useMemo(
    () => ({ t: title, s: subtitle || undefined, av: avatar, c: accent, l: links }),
    [title, subtitle, avatar, accent, links]
  );

  const shareUrl = useMemo(() => {
    if (!origin) return "";
    return `${origin}/p?d=${encodeBio(page)}`;
  }, [origin, page]);

  // live QR of the share URL
  useEffect(() => {
    if (!shareUrl) return;
    let cancelled = false;
    (async () => {
      const mod = await import("qr-code-styling");
      if (cancelled || !qrMount.current) return;
      const opts: any = {
        width: 170, height: 170, type: "canvas", data: shareUrl, margin: 4,
        qrOptions: { errorCorrectionLevel: "M" },
        dotsOptions: { type: "rounded", color: "#0e0e0e" },
        cornersSquareOptions: { type: "extra-rounded", color: accent },
        backgroundOptions: { color: "#ffffff" },
      };
      if (!qrRef.current) {
        qrRef.current = new mod.default(opts);
        qrMount.current.innerHTML = "";
        qrRef.current.append(qrMount.current);
      } else {
        qrRef.current.update(opts);
      }
    })();
    return () => { cancelled = true; };
  }, [shareUrl, accent]);

  function setLink(i: number, patch: Partial<LinkItem>) {
    setLinks((ls) => ls.map((l, j) => (j === i ? { ...l, ...patch } : l)));
  }

  async function copyLink() {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    trackTool("link-in-bio", { action: "copy" });
    setTimeout(() => setCopied(false), 1500);
  }

  async function downloadQr() {
    if (!qrRef.current) return;
    trackTool("link-in-bio", { action: "qr-download" });
    const { saveBlob } = await import("@/lib/save-file");
    const blob = (await qrRef.current.getRawData("png")) as Blob | null;
    if (blob) await saveBlob(blob, "bio-page-qr.png");
  }

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* ── editor ── */}
        <div className="space-y-5">
          {/* Business templates */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
              Start from a template
            </div>
            <div className="flex flex-wrap gap-2">
              {TEMPLATES.map((tp) => (
                <button key={tp.id}
                  onClick={() => {
                    setTitle(tp.page.t); setSubtitle(tp.page.s || ""); setAvatar(tp.page.av || "🚀");
                    setAccent(tp.page.c || "#F58F20"); setLinks(tp.page.l.map((l) => ({ ...l })));
                    trackTool("link-in-bio", { action: "template", id: tp.id });
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12.5px] font-bold transition-all hover:-translate-y-0.5"
                  style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text)" }}>
                  <span>{tp.emoji}</span> {tp.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] mt-2" style={{ color: "var(--text-faint)" }}>
              One click fills the page — then just paste your own links.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Name / title</span>
              <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 40))} placeholder="Alex's Coffee ☕" className="qx-auth-input mt-1" />
            </label>
            <label className="block">
              <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Bio (optional)</span>
              <input value={subtitle} onChange={(e) => setSubtitle(e.target.value.slice(0, 90))} placeholder="Best coffee in town — order below 👇" className="qx-auth-input mt-1" />
            </label>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Avatar</div>
              <div className="flex flex-wrap gap-1.5">
                {AVATARS.map((a) => (
                  <button key={a} onClick={() => setAvatar(a)} className="w-9 h-9 rounded-xl text-lg transition-transform hover:scale-110"
                    style={{ background: avatar === a ? "rgba(245,143,32,0.18)" : "var(--surface-2)", border: `1px solid ${avatar === a ? "var(--primary)" : "var(--border)"}` }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Accent</div>
              <div className="flex flex-wrap items-center gap-2">
                {ACCENTS.map((c) => (
                  <button key={c} onClick={() => setAccent(c)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                    style={{ background: c, border: accent === c ? "2px solid var(--primary)" : "1px solid var(--border)" }} />
                ))}
                <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Links ({links.length}/8)</div>
            <div className="space-y-2.5">
              {links.map((l, i) => (
                <div key={i} className="flex gap-2">
                  <input value={l.label} onChange={(e) => setLink(i, { label: e.target.value.slice(0, 40) })} placeholder="Button label" className="qx-auth-input !py-2.5 flex-[2]" />
                  <input value={l.url} onChange={(e) => setLink(i, { url: e.target.value })} placeholder="https://…" className="qx-auth-input !py-2.5 flex-[3]" />
                  <button onClick={() => setLinks((ls) => ls.filter((_, j) => j !== i))} disabled={links.length <= 1}
                    className="qx-btn-ghost !px-3 disabled:opacity-30" aria-label="Remove link">
                    <FiTrash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
            {links.length < 8 && (
              <button onClick={() => setLinks((ls) => [...ls, { label: "", url: "" }])} className="qx-btn-ghost !text-xs mt-3">
                <FiPlus size={13} /> Add link
              </button>
            )}
          </div>

          {/* share */}
          <div className="rounded-2xl p-4" style={{ background: "rgba(245,143,32,0.06)", border: "1px solid rgba(245,143,32,0.22)" }}>
            <div className="text-[12px] font-bold mb-2" style={{ color: "var(--text)" }}>Your page link + QR</div>
            <div className="flex flex-col sm:flex-row gap-4 items-start">
              <div ref={qrMount} className="rounded-xl overflow-hidden shrink-0" style={{ background: "#fff", border: "1px solid var(--border)" }} />
              <div className="flex-1 min-w-0 space-y-2 w-full">
                <div className="text-[11px] break-all p-2.5 rounded-lg font-mono" style={{ background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border)", maxHeight: 76, overflow: "hidden" }}>
                  {shareUrl || "…"}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={copyLink} className="qx-btn !text-xs !py-2">{copied ? <FiCheck size={13} /> : <FiCopy size={13} />} Copy link</button>
                  <button onClick={downloadQr} className="qx-btn !text-xs !py-2"><FiDownload size={13} /> QR PNG</button>
                  {shareUrl && (
                    <a href={shareUrl} target="_blank" rel="noopener noreferrer" className="qx-btn-ghost !text-xs !py-2">
                      <FiExternalLink size={13} /> Open page
                    </a>
                  )}
                </div>
                <p className="text-[10.5px]" style={{ color: "var(--text-faint)" }}>
                  The whole page lives inside this link — no account, nothing stored on our servers. Anyone who scans the QR sees your page.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── live phone preview ── */}
        <div className="flex justify-center">
          <div className="w-full max-w-[340px] rounded-[36px] p-3" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", boxShadow: "0 20px 60px rgba(0,0,0,.35)" }}>
            <div className="rounded-[28px] overflow-hidden" style={{ background: "var(--bg)", border: "1px solid var(--border)", minHeight: 560 }}>
              <BioView page={page} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
