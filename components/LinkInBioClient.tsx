"use client";

/* Link-in-Bio editor (pro pass Mission 87) — the same URL-encoded page
   builder, reorganized into a professional tabbed editor: Templates ·
   Profile · Design · Links · Share, with a live iPhone preview. Templates
   render as real mini-page previews (theme gradient + accent buttons),
   me-qr style, instead of plain chips. */

import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus, FiTrash2, FiCopy, FiCheck, FiDownload, FiExternalLink, FiUser, FiLink, FiShare2, FiGrid } from "react-icons/fi";
import { HiOutlineSparkles } from "react-icons/hi2";
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
  { id: "fitness", label: "Fitness Coach", emoji: "💪", page: { t: "Coach Dilnoza", s: "Personal training & meal plans — start your journey 💪", av: "💪", c: "#16a34a", th: "forest", bs: "solid", pat: "fitness",
    l: [{ label: "🏋️ Training programs", url: "" }, { label: "🥗 Meal plans", url: "" }, { label: "📸 Transformations", url: "" }, { label: "💬 Free consultation", url: "" }] } },
  { id: "education", label: "Courses / Teacher", emoji: "🎓", page: { t: "EnglishPro Academy", s: "IELTS 7+ in 4 months — join the next group 🎓", av: "🎓", c: "#2563eb", th: "light", bs: "pill", pat: "work",
    l: [{ label: "📚 Our courses", url: "" }, { label: "🎯 Free level test", url: "" }, { label: "⭐ Student results", url: "" }, { label: "📝 Enroll now", url: "" }] } },
  { id: "photographer", label: "Photographer", emoji: "📸", page: { t: "Lens by Malika", s: "Weddings · portraits · brand shoots — book a session 📷", av: "📸", c: "#0e0e0e", th: "dark", bs: "outline", pat: "travel",
    l: [{ label: "🖼️ Portfolio", url: "" }, { label: "💰 Packages & pricing", url: "" }, { label: "📅 Check availability", url: "" }, { label: "📸 Instagram", url: "" }] } },
];

type Tab = "templates" | "profile" | "design" | "links" | "share";
const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "templates", label: "Templates", icon: <FiGrid size={13} /> },
  { id: "profile", label: "Profile", icon: <FiUser size={13} /> },
  { id: "design", label: "Design", icon: <HiOutlineSparkles size={14} /> },
  { id: "links", label: "Links", icon: <FiLink size={13} /> },
  { id: "share", label: "Share", icon: <FiShare2 size={13} /> },
];

export default function LinkInBioClient() {
  const [tab, setTab] = useState<Tab>("templates");
  const [appliedId, setAppliedId] = useState<string | null>(null);
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
    if (!shareUrl || shareUrl.length > 2800 || tab !== "share") return;
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
  }, [shareUrl, accent, tab]);

  // the Share tab remounts its QR container — force a fresh instance each time
  useEffect(() => { if (tab !== "share") qrRef.current = null; }, [tab]);

  function applyTemplate(tp: Template) {
    setTitle(tp.page.t); setSubtitle(tp.page.s || ""); setAvatar(tp.page.av || "🚀");
    setAccent(tp.page.c || "#F58F20"); setLinks(tp.page.l.map((l) => ({ ...l })));
    setTheme(tp.page.th || "dark"); setBtnStyle(tp.page.bs || "outline"); setPattern(tp.page.pat || "");
    setAppliedId(tp.id);
    trackTool("link-in-bio", { action: "template", id: tp.id });
  }

  /** Animated GIFs must be embedded as-is (canvas would freeze them) — cap the size so the link stays shareable. */
  const GIF_LIMIT = 400 * 1024;
  function readGifAsDataUrl(file: File): Promise<string> {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result as string);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  function gifTooBig(file: File): boolean {
    if (file.size <= GIF_LIMIT) return false;
    alert(`This GIF is ${(file.size / 1024).toFixed(0)} KB — too large to live inside the link (max ${GIF_LIMIT / 1024} KB). Tip: paste a GIF URL (e.g. from Giphy/Tenor) instead — the animation plays and the link stays short.`);
    return true;
  }

  /** Upload a photo → center-crop to 96×96 JPEG data-URL. GIFs are kept as-is so they stay animated. */
  async function uploadAvatar(file: File) {
    if (file.type === "image/gif") {
      if (gifTooBig(file)) return;
      setAvatarUrl(await readGifAsDataUrl(file));
      trackTool("link-in-bio", { action: "avatar-upload-gif" });
      return;
    }
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

  /** Upload a background photo → downscale to ≤640px JPEG data-URL. GIFs are kept as-is (animated). */
  async function uploadBackground(file: File) {
    if (file.type === "image/gif") {
      if (gifTooBig(file)) return;
      setBgImage(await readGifAsDataUrl(file));
      trackTool("link-in-bio", { action: "bg-upload-gif" });
      return;
    }
    const img = new Image();
    const url = URL.createObjectURL(file);
    try {
      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
      const MAX = 640;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
      setBgImage(canvas.toDataURL("image/jpeg", 0.55));
      trackTool("link-in-bio", { action: "bg-upload" });
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

  const label = (t: string) => (
    <div className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: "var(--text-faint)" }}>{t}</div>
  );

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        {/* ── editor ── */}
        <div className="min-w-0">
          {/* tab bar */}
          <div className="flex gap-1.5 mb-6 overflow-x-auto pb-1 -mx-1 px-1" role="tablist" aria-label="Editor sections">
            {TABS.map((t) => (
              <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all"
                style={{
                  background: tab === t.id ? "var(--grad-primary)" : "var(--surface-2)",
                  color: tab === t.id ? "#fff" : "var(--text-muted)",
                  border: `1px solid ${tab === t.id ? "transparent" : "var(--border)"}`,
                }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          {/* ══ TEMPLATES ══ */}
          {tab === "templates" && (
            <div>
              {label("Start from a professional template")}
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                {TEMPLATES.map((tp) => {
                  const th = BIO_THEMES[tp.page.th || "dark"];
                  const applied = appliedId === tp.id;
                  return (
                    <button key={tp.id} onClick={() => applyTemplate(tp)}
                      className="group text-left rounded-2xl overflow-hidden transition-all hover:-translate-y-1"
                      style={{ border: `2px solid ${applied ? "var(--primary)" : "var(--border)"}`, boxShadow: applied ? "0 0 0 3px rgba(255,77,28,.18)" : "var(--shadow-card)" }}>
                      {/* mini page preview */}
                      <div className="relative px-4 pt-4 pb-3" style={{ background: th.bg }}>
                        <div className="flex flex-col items-center">
                          <span className="w-9 h-9 rounded-full flex items-center justify-center text-[17px] mb-1.5"
                            style={{ background: th.surface, border: `2px solid ${tp.page.c}` }}>{tp.page.av}</span>
                          <span className="text-[11px] font-extrabold leading-none" style={{ color: th.text }}>{tp.page.t}</span>
                          <span className="text-[8px] mt-1 truncate max-w-full" style={{ color: th.muted }}>{tp.page.s}</span>
                        </div>
                        <div className="mt-2.5 space-y-1.5">
                          {tp.page.l.slice(0, 3).map((l, i) => (
                            <div key={i} className="h-[18px] rounded-full flex items-center justify-center overflow-hidden"
                              style={{
                                background: tp.page.bs === "outline" ? "transparent" : tp.page.bs === "solid" ? tp.page.c : `${tp.page.c}22`,
                                border: tp.page.bs === "outline" ? `1.5px solid ${tp.page.c}` : `1.5px solid ${tp.page.bs === "pill" ? tp.page.c + "55" : "transparent"}`,
                              }}>
                              <span className="text-[7.5px] font-bold truncate px-2"
                                style={{ color: tp.page.bs === "solid" ? "#fff" : th.text }}>{l.label}</span>
                            </div>
                          ))}
                        </div>
                        {applied && (
                          <span className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center text-white"
                            style={{ background: "var(--primary)" }}><FiCheck size={11} /></span>
                        )}
                      </div>
                      {/* caption */}
                      <div className="flex items-center justify-between px-3.5 py-2.5" style={{ background: "var(--surface-2)" }}>
                        <span className="text-[12px] font-bold" style={{ color: "var(--text)" }}>{tp.emoji} {tp.label}</span>
                        <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-full transition-colors"
                          style={{ background: applied ? "var(--primary-dim)" : "var(--surface-hover)", color: applied ? "var(--primary-bright)" : "var(--text-faint)", border: "1px solid var(--border)" }}>
                          {applied ? "Applied ✓" : "Use"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11.5px] mt-3" style={{ color: "var(--text-faint)" }}>
                One click fills the whole page — then open <b>Profile</b> and <b>Links</b> to make it yours.
              </p>
            </div>
          )}

          {/* ══ PROFILE ══ */}
          {tab === "profile" && (
            <div className="space-y-5">
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

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  {label("Emoji avatar")}
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
                  {label("Photo avatar (overrides emoji)")}
                  <div className="flex items-center gap-2.5">
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
              </div>

              <div>
                {label("Social icons (optional)")}
                <div className="grid sm:grid-cols-3 grid-cols-2 gap-2">
                  {([["ig", "Instagram @"], ["tg", "Telegram @"], ["wa", "WhatsApp no."], ["yt", "YouTube @"], ["tk", "TikTok @"], ["fb", "Facebook"]] as [keyof BioSocials, string][]).map(([k, ph]) => (
                    <input key={k} value={socials[k] || ""} onChange={(e) => setSocials((s) => ({ ...s, [k]: e.target.value.slice(0, 60) }))}
                      placeholder={ph} className="qx-auth-input !py-2 !text-[12.5px]" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ══ DESIGN ══ */}
          {tab === "design" && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-6">
                <div>
                  {label("Page theme")}
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
                  {label("Accent")}
                  <div className="flex flex-wrap items-center gap-2">
                    {ACCENTS.map((c) => (
                      <button key={c} onClick={() => setAccent(c)} className="w-7 h-7 rounded-lg transition-transform hover:scale-110"
                        style={{ background: c, border: accent === c ? "2px solid var(--primary)" : "1px solid var(--border)" }} />
                    ))}
                    <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} className="w-7 h-7 rounded-lg cursor-pointer !p-0 !border-0" />
                  </div>
                </div>
                <div>
                  {label("Buttons")}
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
                {label("Background — pick your niche")}
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
                <div className="flex items-center gap-2.5 mt-2.5">
                  <label className="qx-btn-ghost !text-xs !py-2 cursor-pointer shrink-0">
                    🖼️ Upload background
                    <input type="file" accept="image/*" className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadBackground(f); e.target.value = ""; }} />
                  </label>
                  {bgImage && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={bgImage} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" style={{ border: "1px solid var(--border)" }} />
                      <button onClick={() => setBgImage("")} className="qx-btn-ghost !text-xs !py-2 shrink-0">✕ Remove</button>
                    </>
                  )}
                </div>
                <input value={bgImage.startsWith("data:") ? "" : bgImage}
                  onChange={(e) => setBgImage(e.target.value.slice(0, 300))}
                  placeholder={bgImage.startsWith("data:") ? "Uploaded background in use" : "…or paste a background photo URL (cover + dark overlay)"}
                  className="qx-auth-input mt-2 !py-2 !text-[12px]" />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={hideBadge} onChange={(e) => setHideBadge(e.target.checked)} className="accent-[#F58F20] w-4 h-4" />
                <span className="text-[12.5px] font-semibold" style={{ color: "var(--text)" }}>Hide “Made with QRix” badge</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white" style={{ background: "var(--grad-primary)" }}>PRO</span>
              </label>
            </div>
          )}

          {/* ══ LINKS ══ */}
          {tab === "links" && (
            <div>
              {label(`Links (${links.length}/8)`)}
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
              <p className="text-[11.5px] mt-3" style={{ color: "var(--text-faint)" }}>
                Tip: put your most important link first — it gets the most taps.
              </p>
            </div>
          )}

          {/* ══ SHARE ══ */}
          {tab === "share" && (
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
          )}
        </div>

        {/* ── live iPhone preview ── */}
        <div className="flex justify-center">
          <div className="relative w-full max-w-[320px]">
            {/* side buttons */}
            <div className="absolute -left-[3px] top-[110px] w-[3px] h-8 rounded-l" style={{ background: "#3a3d45" }} />
            <div className="absolute -left-[3px] top-[155px] w-[3px] h-14 rounded-l" style={{ background: "#3a3d45" }} />
            <div className="absolute -left-[3px] top-[218px] w-[3px] h-14 rounded-l" style={{ background: "#3a3d45" }} />
            <div className="absolute -right-[3px] top-[170px] w-[3px] h-20 rounded-r" style={{ background: "#3a3d45" }} />

            {/* titanium body */}
            <div className="rounded-[54px] p-[10px]"
              style={{
                background: "linear-gradient(145deg,#4a4d55,#23252b 40%,#3c3f47)",
                boxShadow: "0 30px 80px rgba(0,0,0,.5), inset 0 1px 1px rgba(255,255,255,.25), inset 0 -1px 1px rgba(0,0,0,.5)",
              }}>
              {/* screen */}
              <div className="relative rounded-[44px] overflow-hidden flex flex-col" style={{ background: "#000", minHeight: 600 }}>
                {/* status bar */}
                <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-7 pt-3.5 pointer-events-none">
                  <span className="text-[13px] font-bold tracking-tight" style={{ color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,.5)" }}>9:41</span>
                  <span className="flex items-center gap-1.5" style={{ color: "#fff", filter: "drop-shadow(0 1px 2px rgba(0,0,0,.5))" }}>
                    {/* signal */}
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.8"/><rect x="4.3" y="5" width="3" height="6" rx="0.8"/><rect x="8.6" y="2.5" width="3" height="8.5" rx="0.8"/><rect x="12.9" y="0" width="3" height="11" rx="0.8"/></svg>
                    {/* wifi */}
                    <svg width="15" height="11" viewBox="0 0 15 11" fill="currentColor"><path d="M7.5 9.2a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8Z"/><path d="M7.5 5.6c1.5 0 2.9.6 3.9 1.6l-1.3 1.3a3.7 3.7 0 0 0-5.2 0L3.6 7.2a5.5 5.5 0 0 1 3.9-1.6Z"/><path d="M7.5 2c2.5 0 4.8 1 6.5 2.7l-1.3 1.3A7.3 7.3 0 0 0 7.5 3.8c-2 0-3.8.8-5.2 2.2L1 4.7A9.1 9.1 0 0 1 7.5 2Z"/></svg>
                    {/* battery */}
                    <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor"/><path d="M23 4v4c1-.3 1.6-1 1.6-2S24 4.3 23 4Z" fill="currentColor" opacity=".45"/></svg>
                  </span>
                </div>

                {/* dynamic island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 w-[102px] h-[26px] rounded-full flex items-center justify-end pr-2"
                  style={{ background: "#000", boxShadow: "inset 0 0 3px rgba(255,255,255,.12)" }}>
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 35%, #1b2b4a, #050508 65%)" }} />
                </div>

                {/* page content — fills the screen; status bar & island float above it */}
                <div className="flex-1 flex flex-col [&>div]:flex-1 [&>div]:pt-8" style={{ minHeight: 600 }}>
                  <BioView page={page} preview />
                </div>

                {/* home indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 w-[110px] h-[4.5px] rounded-full pointer-events-none"
                  style={{ background: "rgba(255,255,255,.85)", mixBlendMode: "difference" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
