"use client";

/* Generator engines: AI QR, Logo Maker, Avatar Maker, Thumbnail/Banner templates. */

import { useEffect, useMemo, useRef, useState } from "react";
import { FiRefreshCw, FiDownload, FiUpload } from "react-icons/fi";
import { trackTool } from "@/lib/track";

/* eslint-disable @typescript-eslint/no-explicit-any */

async function saveCanvas(canvas: HTMLCanvasElement, name: string) {
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/png"));
  if (!blob) return;
  const { saveBlob } = await import("@/lib/save-file");
  await saveBlob(blob, name);
}

/* ── shared style vocabulary: brand words → palettes ──────── */
type Palette = { name: string; bg: string; fg: string; accent: string; dot: "rounded" | "dots" | "classy" | "square"; match: RegExp };
const PALETTES: Palette[] = [
  { name: "Minimal Tech", bg: "#ffffff", fg: "#0a0a0a", accent: "#5b46d6", dot: "square", match: /tech|minimal|startup|saas|software|clean|модерн|texnolog/i },
  { name: "Warm Artisan", bg: "#fdf6ec", fg: "#7c3f00", accent: "#d97706", dot: "rounded", match: /bakery|coffee|cafe|warm|food|restaurant|нон|кафе|таом/i },
  { name: "Neon Night", bg: "#0a0a12", fg: "#e1ff04", accent: "#bba9ff", dot: "dots", match: /neon|night|club|music|gaming|киберспорт|неон/i },
  { name: "Fresh Nature", bg: "#f2fbf4", fg: "#14532d", accent: "#22c55e", dot: "rounded", match: /nature|eco|green|organic|farm|табиат|эко/i },
  { name: "Luxury Noir", bg: "#111114", fg: "#e8d9b0", accent: "#c9a24b", dot: "classy", match: /luxury|premium|gold|beauty|salon|люкс|олтин/i },
  { name: "Ocean Calm", bg: "#eef7fb", fg: "#0c3550", accent: "#0891b2", dot: "rounded", match: /ocean|travel|calm|health|clinic|сув|саёҳат/i },
  { name: "Bold Play", bg: "#fff7ed", fg: "#9a3412", accent: "#f43f5e", dot: "dots", match: /kids|fun|play|sport|bold|болалар|спорт/i },
];
function pickPalette(vibe: string, seed: number): Palette {
  const hit = PALETTES.filter((p) => p.match.test(vibe));
  const pool = hit.length ? hit : PALETTES;
  return pool[seed % pool.length];
}

/* ── AI QR Generator ──────────────────────────────────────── */
export function AiQrClient() {
  const [data, setData] = useState("https://qrix.uz");
  const [vibe, setVibe] = useState("");
  const [seed, setSeed] = useState(0);
  const mount = useRef<HTMLDivElement>(null);
  const qrRef = useRef<any>(null);
  const pal = useMemo(() => pickPalette(vibe, seed), [vibe, seed]);

  useEffect(() => {
    let dead = false;
    (async () => {
      const mod = await import("qr-code-styling");
      if (dead || !mount.current) return;
      const opts: any = {
        width: 280, height: 280, type: "canvas", data: data || "https://qrix.uz", margin: 10,
        qrOptions: { errorCorrectionLevel: "M" },
        dotsOptions: { type: pal.dot, color: pal.fg },
        cornersSquareOptions: { type: pal.dot === "square" ? "square" : "extra-rounded", color: pal.accent },
        backgroundOptions: { color: pal.bg },
      };
      if (!qrRef.current) {
        qrRef.current = new mod.default(opts);
        mount.current.innerHTML = "";
        qrRef.current.append(mount.current);
      } else qrRef.current.update(opts);
    })();
    return () => { dead = true; };
  }, [data, pal]);

  return (
    <div className="qx-card p-6">
      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-4">
          <label className="block">
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Link or text</span>
            <input value={data} onChange={(e) => setData(e.target.value)} className="qx-auth-input mt-1" placeholder="https://your-site.com" />
          </label>
          <label className="block">
            <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>Describe the vibe</span>
            <input value={vibe} onChange={(e) => setVibe(e.target.value.slice(0, 80))} className="qx-auth-input mt-1"
              placeholder="warm bakery · minimal tech · neon nightlife…" />
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setSeed((s) => s + 1); trackTool("ai-qr", { vibe }); }} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>
              <FiRefreshCw size={14} /> Generate style
            </button>
            <button onClick={async () => { const c = mount.current?.querySelector("canvas"); if (c) await saveCanvas(c as HTMLCanvasElement, "ai-qr.png"); }}
              className="qx-btn !py-2.5 text-sm"><FiDownload size={14} /> Download PNG</button>
          </div>
          <p className="text-[12px]" style={{ color: "var(--text-faint)" }}>
            AI style: <b style={{ color: "var(--text)" }}>{pal.name}</b> — contrast & quiet-zone validated, always scannable.
          </p>
        </div>
        <div className="flex items-center justify-center rounded-2xl p-6" style={{ background: pal.bg, border: "1px solid var(--border)" }}>
          <div ref={mount} />
        </div>
      </div>
    </div>
  );
}

/* ── Logo Generator ───────────────────────────────────────── */
const LOGO_FONTS = ["800 68px SUSE, sans-serif", "800 64px Poppins, sans-serif", "700 66px Inter, sans-serif"];
function drawLogo(canvas: HTMLCanvasElement, name: string, tagline: string, pal: Palette, variant: number) {
  const W = 640, H = 400;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = pal.bg; ctx.fillRect(0, 0, W, H);
  const initials = name.trim().split(/\s+/).map((w) => w[0] || "").join("").slice(0, 2).toUpperCase() || "Q";

  const cx = W / 2;
  // mark
  const my = 140, r = 64;
  ctx.save();
  if (variant % 3 === 0) { // rounded tile
    ctx.fillStyle = pal.accent;
    ctx.beginPath(); (ctx as any).roundRect(cx - r, my - r, r * 2, r * 2, 24); ctx.fill();
  } else if (variant % 3 === 1) { // circle ring
    ctx.strokeStyle = pal.accent; ctx.lineWidth = 10;
    ctx.beginPath(); ctx.arc(cx, my, r - 5, 0, Math.PI * 2); ctx.stroke();
  } else { // diamond
    ctx.fillStyle = pal.accent;
    ctx.translate(cx, my); ctx.rotate(Math.PI / 4);
    (ctx as any).roundRect ? ((ctx as any).roundRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44, 16), ctx.fill()) : ctx.fillRect(-r * 0.72, -r * 0.72, r * 1.44, r * 1.44);
  }
  ctx.restore();
  // initials
  ctx.fillStyle = variant % 3 === 1 ? pal.accent : pal.bg;
  ctx.font = "800 52px SUSE, Poppins, sans-serif";
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(initials, cx, my + 2);
  // wordmark
  ctx.fillStyle = pal.fg;
  ctx.font = LOGO_FONTS[variant % LOGO_FONTS.length].replace(/6[0-9]px/, "46px");
  ctx.fillText(name.trim() || "Your Brand", cx, 268);
  if (tagline.trim()) {
    ctx.fillStyle = pal.accent;
    ctx.font = "600 17px Inter, sans-serif";
    ctx.letterSpacing = "6px" as any;
    ctx.fillText(tagline.trim().toUpperCase(), cx, 312);
    ctx.letterSpacing = "0px" as any;
  }
}

export function AiLogoClient() {
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [vibe, setVibe] = useState("");
  const [seed, setSeed] = useState(0);
  const refs = useRef<(HTMLCanvasElement | null)[]>([]);

  const variants = useMemo(() => Array.from({ length: 6 }, (_, i) => ({ pal: pickPalette(vibe, seed + i), variant: seed + i })), [vibe, seed]);

  useEffect(() => {
    variants.forEach((v, i) => {
      const c = refs.current[i];
      if (c) drawLogo(c, name || "Your Brand", tagline, v.pal, v.variant);
    });
  }, [variants, name, tagline]);

  return (
    <div className="qx-card p-6 space-y-5">
      <div className="grid sm:grid-cols-3 gap-3">
        <input value={name} onChange={(e) => setName(e.target.value.slice(0, 24))} placeholder="Brand name" className="qx-auth-input" />
        <input value={tagline} onChange={(e) => setTagline(e.target.value.slice(0, 32))} placeholder="Tagline (optional)" className="qx-auth-input" />
        <input value={vibe} onChange={(e) => setVibe(e.target.value.slice(0, 60))} placeholder="Vibe — tech, luxury, eco…" className="qx-auth-input" />
      </div>
      <button onClick={() => { setSeed((s) => s + 6); trackTool("ai-logo", { vibe }); }} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>
        <FiRefreshCw size={14} /> Generate new set
      </button>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {variants.map((v, i) => (
          <div key={i} className="group relative rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
            <canvas ref={(el) => { refs.current[i] = el; }} className="w-full h-auto block" />
            <button
              onClick={async () => { const c = refs.current[i]; if (c) await saveCanvas(c, `logo-${(name || "brand").toLowerCase().replace(/\s+/g, "-")}-${i + 1}.png`); }}
              className="absolute bottom-2 right-2 qx-btn !py-1.5 !px-3 !text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
              <FiDownload size={12} /> PNG
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Avatar Generator ─────────────────────────────────────── */
const AV_GRADS: [string, string][] = [
  ["#e1ff04", "#84cc16"], ["#bba9ff", "#7c3aed"], ["#f472b6", "#db2777"],
  ["#38bdf8", "#2563eb"], ["#fb923c", "#ea580c"], ["#34d399", "#059669"],
  ["#0a0a12", "#3f3f46"], ["#f59e0b", "#b91c1c"],
];
function drawAvatar(canvas: HTMLCanvasElement, text: string, gi: number, ring: boolean) {
  const S = 512;
  canvas.width = S; canvas.height = S;
  const ctx = canvas.getContext("2d")!;
  const [a, b] = AV_GRADS[gi % AV_GRADS.length];
  const g = ctx.createLinearGradient(0, 0, S, S);
  g.addColorStop(0, a); g.addColorStop(1, b);
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2, 0, Math.PI * 2); ctx.fill();
  if (ring) {
    ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.arc(S / 2, S / 2, S / 2 - 22, 0, Math.PI * 2); ctx.stroke();
  }
  const isEmoji = /\p{Extended_Pictographic}/u.test(text);
  ctx.fillStyle = "#fff";
  ctx.font = `${isEmoji ? "" : "800 "}${isEmoji ? 230 : 190}px ${isEmoji ? "serif" : "SUSE, Poppins, sans-serif"}`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 24;
  ctx.fillText(text || "Q", S / 2, S / 2 + (isEmoji ? 10 : 14));
}

export function AiAvatarClient() {
  const [text, setText] = useState("QX");
  const [gi, setGi] = useState(0);
  const [ring, setRing] = useState(true);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => { if (ref.current) drawAvatar(ref.current, text.slice(0, 2), gi, ring); }, [text, gi, ring]);

  return (
    <div className="qx-card p-6">
      <div className="grid sm:grid-cols-[1fr_240px] gap-8 items-start">
        <div className="space-y-4">
          <input value={text} onChange={(e) => setText(e.target.value.slice(0, 2))} placeholder="Initials or emoji"
            className="qx-auth-input text-center text-lg font-bold w-40" aria-label="Initials or emoji" />
          <div className="flex flex-wrap gap-2">
            {AV_GRADS.map(([a, b], i) => (
              <button key={i} onClick={() => setGi(i)} aria-label={`Style ${i + 1}`}
                className="w-9 h-9 rounded-full transition-transform hover:scale-110"
                style={{ background: `linear-gradient(135deg,${a},${b})`, border: gi === i ? "3px solid var(--primary-bright)" : "2px solid var(--border)" }} />
            ))}
          </div>
          <label className="flex items-center gap-2 cursor-pointer text-[13px] font-semibold" style={{ color: "var(--text)" }}>
            <input type="checkbox" checked={ring} onChange={(e) => setRing(e.target.checked)} className="accent-[#e1ff04] w-4 h-4" /> White ring
          </label>
          <button onClick={async () => { if (ref.current) { trackTool("ai-avatar"); await saveCanvas(ref.current, "avatar.png"); } }}
            className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic><FiDownload size={14} /> Download 512×512</button>
        </div>
        <canvas ref={ref} className="w-full max-w-[240px] h-auto rounded-full mx-auto" style={{ boxShadow: "0 20px 60px rgba(0,0,0,.35)" }} />
      </div>
    </div>
  );
}

/* ── Thumbnail / Banner templates ─────────────────────────── */
type TplKind = "thumbnail" | "banner";
const BANNER_SIZES = [
  { id: "youtube", label: "YouTube 2560×1440", w: 2560, h: 1440, safe: { w: 1546, h: 423 } },
  { id: "x", label: "X / Twitter 1500×500", w: 1500, h: 500 },
  { id: "linkedin", label: "LinkedIn 1584×396", w: 1584, h: 396 },
  { id: "facebook", label: "Facebook 820×312", w: 820, h: 312 },
];
const TPL_BGS: [string, string][] = [["#0a0a12", "#26263a"], ["#5b21b6", "#1e1b4b"], ["#e1ff04", "#65a30d"], ["#0e7490", "#164e63"], ["#b91c1c", "#450a0a"], ["#0f172a", "#334155"]];

function drawTemplate(canvas: HTMLCanvasElement, kind: TplKind, sizeId: string, title: string, sub: string, bgi: number, sticker: string, photo: HTMLImageElement | null) {
  const size = kind === "thumbnail" ? { w: 1280, h: 720 } : (BANNER_SIZES.find((s) => s.id === sizeId) || BANNER_SIZES[0]);
  canvas.width = size.w; canvas.height = size.h;
  const ctx = canvas.getContext("2d")!;
  const [a, b] = TPL_BGS[bgi % TPL_BGS.length];

  if (photo) {
    const scale = Math.max(size.w / photo.width, size.h / photo.height);
    const pw = photo.width * scale, ph = photo.height * scale;
    ctx.drawImage(photo, (size.w - pw) / 2, (size.h - ph) / 2, pw, ph);
    ctx.fillStyle = "rgba(6,6,12,.52)";
    ctx.fillRect(0, 0, size.w, size.h);
  } else {
    const g = ctx.createLinearGradient(0, 0, size.w, size.h);
    g.addColorStop(0, a); g.addColorStop(1, b);
    ctx.fillStyle = g; ctx.fillRect(0, 0, size.w, size.h);
    // accent blob
    ctx.fillStyle = "rgba(255,255,255,.06)";
    ctx.beginPath(); ctx.arc(size.w * 0.85, size.h * 0.2, size.h * 0.5, 0, Math.PI * 2); ctx.fill();
  }

  const light = bgi === 2 && !photo;
  const fg = light ? "#0a0a0a" : "#ffffff";
  const base = kind === "thumbnail" ? 110 : Math.round(size.h * 0.22);
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  // title with outline for readability
  ctx.font = `800 ${base}px SUSE, Poppins, sans-serif`;
  let fs = base;
  while (ctx.measureText(title).width > size.w * 0.86 && fs > 28) { fs -= 4; ctx.font = `800 ${fs}px SUSE, Poppins, sans-serif`; }
  ctx.lineWidth = Math.max(4, fs * 0.1);
  ctx.strokeStyle = light ? "rgba(255,255,255,.9)" : "rgba(0,0,0,.55)";
  ctx.strokeText(title || "YOUR TITLE", size.w / 2, size.h / 2 - (sub ? fs * 0.32 : 0));
  ctx.fillStyle = fg;
  ctx.fillText(title || "YOUR TITLE", size.w / 2, size.h / 2 - (sub ? fs * 0.32 : 0));
  if (sub) {
    ctx.font = `600 ${Math.round(fs * 0.36)}px Inter, sans-serif`;
    ctx.fillStyle = light ? "rgba(10,10,10,.75)" : "rgba(255,255,255,.85)";
    ctx.fillText(sub, size.w / 2, size.h / 2 + fs * 0.55);
  }
  if (sticker) {
    ctx.font = `${Math.round(size.h * 0.28)}px serif`;
    ctx.fillText(sticker, size.w * 0.87, size.h * 0.78);
  }
  // safe zone hint for YouTube banner
  if (kind === "banner" && sizeId === "youtube") {
    ctx.strokeStyle = "rgba(255,255,255,.25)"; ctx.setLineDash([14, 10]); ctx.lineWidth = 3;
    ctx.strokeRect((size.w - 1546) / 2, (size.h - 423) / 2, 1546, 423);
    ctx.setLineDash([]);
  }
}

export function AiTemplateClient({ kind }: { kind: TplKind }) {
  const [title, setTitle] = useState("");
  const [sub, setSub] = useState("");
  const [bgi, setBgi] = useState(0);
  const [sticker, setSticker] = useState("🔥");
  const [sizeId, setSizeId] = useState("youtube");
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (ref.current) drawTemplate(ref.current, kind, sizeId, title, sub, bgi, sticker, photo);
  }, [kind, sizeId, title, sub, bgi, sticker, photo]);

  async function onPhoto(f: File) {
    const img = new Image();
    img.src = URL.createObjectURL(f);
    await new Promise((r) => { img.onload = r; });
    setPhoto(img);
  }

  return (
    <div className="qx-card p-6 space-y-5">
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={title} onChange={(e) => setTitle(e.target.value.slice(0, 46))} placeholder="Big title" className="qx-auth-input" />
        <input value={sub} onChange={(e) => setSub(e.target.value.slice(0, 60))} placeholder="Subtitle (optional)" className="qx-auth-input" />
      </div>
      <div className="flex flex-wrap items-center gap-4">
        {kind === "banner" && (
          <select value={sizeId} onChange={(e) => setSizeId(e.target.value)} className="qx-auth-input !py-2 w-56" aria-label="Platform size">
            {BANNER_SIZES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        )}
        <div className="flex gap-1.5">
          {TPL_BGS.map(([a, b], i) => (
            <button key={i} onClick={() => { setBgi(i); setPhoto(null); }} aria-label={`Background ${i + 1}`}
              className="w-8 h-8 rounded-lg transition-transform hover:scale-110"
              style={{ background: `linear-gradient(135deg,${a},${b})`, border: bgi === i && !photo ? "2.5px solid var(--primary-bright)" : "1px solid var(--border)" }} />
          ))}
        </div>
        <label className="qx-btn-ghost !py-2 !text-xs cursor-pointer">
          <FiUpload size={13} /> Photo background
          <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onPhoto(f); e.currentTarget.value = ""; }} />
        </label>
        <div className="flex gap-1">
          {["🔥", "😱", "✅", "⚡", "🎯", ""].map((s) => (
            <button key={s || "none"} onClick={() => setSticker(s)}
              className="w-9 h-9 rounded-lg text-lg"
              style={{ background: sticker === s ? "var(--primary-dim)" : "var(--surface-2)", border: `1px solid ${sticker === s ? "var(--primary-bright)" : "var(--border)"}` }}>
              {s || "—"}
            </button>
          ))}
        </div>
      </div>
      <canvas ref={ref} className="w-full h-auto rounded-2xl" style={{ border: "1px solid var(--border)", boxShadow: "0 16px 50px rgba(0,0,0,.3)" }} />
      <button onClick={async () => { if (ref.current) { trackTool(`ai-${kind}`); await saveCanvas(ref.current, `${kind}.png`); } }}
        className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic><FiDownload size={14} /> Download PNG</button>
    </div>
  );
}
