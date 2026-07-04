"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiTrash2, FiCopy, FiCheck, FiDownload, FiExternalLink } from "react-icons/fi";
import { encodeBio, BIO_THEMES, BIO_PATTERNS, type BioPage, type LinkItem, type BioTheme, type BioButtonStyle, type BioSocials, type BioPattern } from "@/lib/linkpage";
import BioView from "@/components/BioView";
import { trackTool } from "@/lib/track";

/* eslint-disable @typescript-eslint/no-explicit-any */

const ACCENTS = ["#F58F20", "#16a34a", "#7c3aed", "#2563eb", "#db2777", "#0891b2", "#0e0e0e"];
const AVATARS = ["😀", "🚀", "🌟", "🎵", "🍕", "💼", "📸", "❤️"];

/* Ready-made business templates — one click fills the whole page */
type Template = { id: string; label: string; emoji: string; page: Omit<BioPage, "l"> & { l: LinkItem[] } };
const TEMPLATES: Template[] = [
  { id: "restaurant", label: "Restaurant / Café", emoji: "🍕", page: { t: "Bella Cucina", s: "Fresh pasta & wood-fired pizza — order or book below 👇", av: "🍕", c: "#e05252", th: "sunset", bs: "solid", pat: "food",
    l: [{ label: "📖 View our menu", url: "" }, { label: "🛵 Order delivery", url: "" }, { label: "📅 Book a table", url: "" }, { label: "⭐ Leave a review", url: "" }, { label: "📍 Find us on the map", url: "" }] } },
  { id: "shop", label: "Shop / Store", emoji: "🛍️", page: { t: "Nova Store", s: "New arrivals every week — shop online or visit us 🛍️", av: "🛍️", c: "#7c3aed", th: "dark", bs: "pill", pat: "shop",
    l: [{ label: "🛒 Shop online", url: "" }, { label: "🔥 This week's deals", url: "" }, { label: "📸 Instagram", url: "" }, { label: "💬 WhatsApp us", url: "" }, { label: "📍 Store location", url: "" }] } },
  { id: "salon", label: "Salon / Beauty", emoji: "💅", page: { t: "Glow Studio", s: "Hair · nails · lashes — book your slot in seconds ✨", av: "💅", c: "#db2777", th: "light", bs: "pill", pat: "beauty",
    l: [{ label: "📅 Book an appointment", url: "" }, { label: "💰 Price list", url: "" }, { label: "📸 Our work (Instagram)", url: "" }, { label: "💬 Ask a question", url: "" }] } },
  { id: "freelancer", label: "Freelancer", emoji: "💼", page: { t: "Alex Karimov", s: "Web developer & designer — let's build something great", av: "💼", c: "#2563eb", th: "ocean", bs: "solid", pat: "work",
    l: [{ label: "🗂️ My portfolio", url: "" }, { label: "💼 LinkedIn", url: "" }, { label: "✉️ Hire me", url: "" }, { label: "📄 Download CV", url: "" }] } },
  { id: "musician", label: "Musician / Creator", emoji: "🎵", page: { t: "DJ Nightwave", s: "New single out now — stream it everywhere 🎧", av: "🎵", c: "#0891b2", th: "dark", bs: "outline", pat: "music",
    l: [{ label: "🎧 Spotify", url: "" }, { label: "▶️ YouTube", url: "" }, { label: "🎬 TikTok", url: "" }, { label: "🎟️ Upcoming shows", url: "" }] } },
  { id: "event", label: "Event / Wedding", emoji: "🎉", page: { t: "Aziza & Timur", s: "We're getting married! All the details below 💍", av: "🎉", c: "#F58F20", th: "light", bs: "solid", pat: "party",
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
  const [theme, setTheme] = useState<BioTheme>("dark");
  const [btnStyle, setBtnStyle] = useState<BioButtonStyle>("outline");
  const [socials, setSocials] = useState<BioSocials>({});
  const [avatarUrl, setAvatarUrl] = useState("");
  const [pattern, setPattern] = useState<BioPattern | "">("");
  const [bgImage, setBgImage] = useState("");
  const [hideBadge, setHideBadge] = useState(false);
  const [copied, setCopied] = useState(false);
  const [origin, setOrigin] = useState("");
  const qrMount = useRef<HTMLDivElement>(null);
  const qrRef = useRef<any>(null);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const page: BioPage = useMemo(() => {
    const soc = Object.fromEntries(Object.entries(socials).filter(([, v]) => v && v.trim())) as BioSocials;
    return {
      t: title, s: subtitle || undefined, av: avatar, avu: avatarUrl.trim() || undefined,
      c: accent, th: theme, bs: btnStyle,
      soc: Object.keys(soc).length ? soc : undefined,
      nb: hideBadge ? 1 : undefined,
      pat: pattern || undefined,
      bgi: bgImage.trim() || undefined,
      l: links,
    };
  }, [title, subtitle, avatar, avatarUrl, accent, theme, btnStyle, socials, hideBadge, pattern, bgImage, links]);

  const shareUrl = useMemo(() => {
    if (!origin) return "";
    return `${origin}/p?d=${encodeBio(page)}`;
  }, [origin, page]);

  // live QR of the share URL (skipped when the URL is too dense for a scannable QR)
  useEffect(() => {
    if (!shareUrl || shareUrl.length > 2800) return;
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

  /** Upload a photo → center-crop to 96×96 JPEG data-URL (small enough to live in the link). */
  async function uploadAvatar(file: File) {
    const img = new Image();
    const url = URL.createObjectURL(file);
    try {
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const S = 96;
      const canvas = document.createElement("canvas");
      canvas.width = S; canvas.height = S;
      const ctx = canvas.getContext("2d")!;
      const scale = Math.max(S / img.width, S / img.height);
      const w = img.width * scale, h = img.height * scale;
      ctx.drawImage(img, (S - w) / 2, (S - h) / 2, w, h);
      setAvatarUrl(canvas.toDataURL("image/jpeg", 0.62));
      trackTool("link-in-bio", { action: "avatar-upload" });
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  const qrTooLong = shareUrl.length > 2800;

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
                    setTheme(tp.page.th || "dark"); setBtnStyle(tp.page.bs || "outline"); setPattern(tp.page.pat || "");
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

          {/* Theme + button style */}
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Page theme</div>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(BIO_THEMES) as BioTheme[]).map((th) => (
                  <button key={th} onClick={() => setTheme(th)} title={BIO_THEMES[th].label}
                    className="w-11 h-9 rounded-lg text-[9px] font-bold flex items-end justify-center pb-0.5 transition-transform hover:scale-105"
                    style={{ background: BIO_THEMES[th].bg, color: BIO_THEMES[th].muted, border: theme === th ? "2px solid var(--primary)" : "1px solid var(--border)" }}>
                    {BIO_THEMES[th].label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Buttons</div>
              <div className="flex gap-2">
                {([["outline", "Outline"], ["solid", "Solid"], ["pill", "Pill"]] as [BioButtonStyle, string][]).map(([v, lbl]) => (
                  <button key={v} onClick={() => setBtnStyle(v)}
                    className="px-3 py-2 text-[12px] font-bold transition-all"
                    style={{
                      borderRadius: v === "pill" ? 99 : 10,
                      background: v === "solid" ? (btnStyle === v ? "var(--grad-primary)" : "var(--surface-hover)") : "var(--surface-2)",
                      color: v === "solid" && btnStyle === v ? "#fff" : "var(--text)",
                      border: `2px solid ${btnStyle === v ? "var(--primary)" : "var(--border)"}`,
                    }}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Background: niche pattern or custom photo */}
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>
              Background — pick your niche
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setPattern("")}
                className="px-3 py-2 rounded-xl text-[12px] font-bold"
                style={{ background: "var(--surface-2)", border: `2px solid ${pattern === "" ? "var(--primary)" : "var(--border)"}`, color: "var(--text)" }}>
                None
              </button>
              {(Object.keys(BIO_PATTERNS) as BioPattern[]).map((p) => (
                <button key={p} onClick={() => setPattern(p)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold transition-transform hover:scale-105"
                  style={{ background: "var(--surface-2)", border: `2px solid ${pattern === p ? "var(--primary)" : "var(--border)"}`, color: "var(--text)" }}>
                  {BIO_PATTERNS[p].emoji} {BIO_PATTERNS[p].label}
                </button>
              ))}
            </div>
            <input value={bgImage} onChange={(e) => setBgImage(e.target.value.slice(0, 300))}
              placeholder="…or paste a background photo URL (cover + dark overlay)"
              className="qx-auth-input mt-2.5 !py-2 !text-[12px]" />
          </div>

          {/* Socials + avatar photo */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>Social icons (optional)</div>
              <div className="grid grid-cols-2 gap-2">
                {([["ig", "Instagram @"], ["tg", "Telegram @"], ["wa", "WhatsApp no."], ["yt", "YouTube @"], ["tk", "TikTok @"], ["fb", "Facebook"]] as [keyof BioSocials, string][]).map(([k, ph]) => (
                  <input key={k} value={socials[k] || ""} onChange={(e) => setSocials((s) => ({ ...s, [k]: e.target.value.slice(0, 60) }))}
                    placeholder={ph} className="qx-auth-input !py-2 !text-[12.5px]" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Photo avatar</span>
                <div className="flex items-center gap-2.5 mt-1.5">
                  {avatarUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: `2px solid ${accent}` }} />
                  )}
                  <label className="qx-btn-ghost !text-xs !py-2 cursor-pointer">
                    📷 Upload photo
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAvatar(f); e.target.value = ""; }} />
                  </label>
                  {avatarUrl && (
                    <button onClick={() => setAvatarUrl("")} className="qx-btn-ghost !text-xs !py-2">✕ Remove</button>
                  )}
                </div>
                <input value={avatarUrl.startsWith("data:") ? "" : avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value.slice(0, 300))}
                  placeholder={avatarUrl.startsWith("data:") ? "Uploaded photo in use" : "…or paste an image URL"}
                  className="qx-auth-input mt-2 !py-2 !text-[12px]" />
              </div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={hideBadge} onChange={(e) => setHideBadge(e.target.checked)} className="accent-[#F58F20] w-4 h-4" />
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>Hide “Made with QRix” badge</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--grad-primary)" }}>PRO</span>
              </label>
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
              <div className="shrink-0">
                <div ref={qrMount} className="rounded-xl overflow-hidden" style={{ background: "#fff", border: "1px solid var(--border)", display: qrTooLong ? "none" : undefined }} />
                {qrTooLong && (
                  <div className="w-[170px] rounded-xl p-3 text-[11px] leading-snug" style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                    ⚠️ The uploaded photo makes this link too dense for a scannable QR. Share the link directly, or use a photo <b>URL</b> instead of an upload to keep the QR.
                  </div>
                )}
              </div>
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
