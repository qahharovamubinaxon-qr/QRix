"use client";

/* Text-AI engines: Captions, Prompt Builder, Translator (connector preview). */

import { useMemo, useState } from "react";
import { FiCopy, FiCheck, FiRefreshCw, FiRepeat, FiExternalLink } from "react-icons/fi";
import { CloudNotice } from "@/components/ai/AiKit";
import { trackTool } from "@/lib/track";

function CopyBtn({ text, small }: { text: string; small?: boolean }) {
  const [ok, setOk] = useState(false);
  return (
    <button onClick={async () => { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1400); }}
      className={`qx-btn ${small ? "!py-1.5 !px-3 !text-[11px]" : "!py-2 text-xs"}`}>
      {ok ? <FiCheck size={13} /> : <FiCopy size={13} />} {ok ? "Copied" : "Copy"}
    </button>
  );
}

/* ── Caption Generator ────────────────────────────────────── */
const HOOKS: Record<string, string[]> = {
  fun: ["POV: {t} just changed everything 😮‍💨", "Nobody: … Me with {t}: 🤩", "Warning: {t} may cause serious happiness ⚡", "That {t} feeling >>> everything", "Plot twist: {t} was the main character all along 🎬"],
  professional: ["How {t} is quietly reshaping the industry.", "3 lessons {t} taught us this quarter.", "The real ROI of {t} — explained simply.", "{t}: what most people get wrong.", "A practical look at {t} — no fluff."],
  inspiring: ["Every big journey starts with {t} ✨", "They said {t} was impossible. Watch us.", "Chase {t} like it already belongs to you �au", "Small steps. Big {t}. Keep going.", "One day or day one? {t} starts now."],
  sales: ["{t} — yours before it sells out 🔥", "Stop scrolling: {t} is finally here.", "The {t} upgrade you've been waiting for → link in bio", "Last chance energy: {t} won't wait ⏳", "Meet {t}. Your cart already knows."],
};
const CTA: Record<string, string[]> = {
  instagram: ["Double-tap if you agree ❤️", "Save this for later 📌", "Tag someone who needs this 👇"],
  tiktok: ["Follow for part 2 🎬", "Comment your take 👇", "Watch till the end 👀"],
  linkedin: ["What's your experience? Share below.", "Repost if this resonates ♻️", "Follow for more practical insights."],
  x: ["RT if you agree.", "Bookmark this 🔖", "Your take? 👇"],
};
function hashtags(topic: string, platform: string): string {
  const base = topic.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, "").split(/\s+/).filter(Boolean).slice(0, 3).map((w) => "#" + w.replace(/\s/g, ""));
  const extra: Record<string, string[]> = {
    instagram: ["#instadaily", "#explorepage", "#reels"],
    tiktok: ["#fyp", "#viral", "#foryou"],
    linkedin: ["#career", "#growth", "#business"],
    x: ["#trending"],
  };
  return [...base, ...(extra[platform] || [])].join(" ");
}

export function AiCaptionsClient() {
  const [topic, setTopic] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [tone, setTone] = useState("fun");
  const [seed, setSeed] = useState(0);

  const captions = useMemo(() => {
    if (!topic.trim()) return [];
    const hooks = HOOKS[tone] || HOOKS.fun;
    const ctas = CTA[platform] || CTA.instagram;
    const t = topic.trim();
    return Array.from({ length: 4 }, (_, i) => {
      const h = hooks[(i + seed) % hooks.length].replaceAll("{t}", t);
      const c = ctas[(i + seed) % ctas.length];
      return `${h}\n\n${c}\n\n${hashtags(t, platform)}`;
    });
  }, [topic, platform, tone, seed]);

  return (
    <div className="qx-card p-6 space-y-5">
      <div className="grid sm:grid-cols-3 gap-3">
        <input value={topic} onChange={(e) => setTopic(e.target.value.slice(0, 80))} placeholder="Topic — e.g. new coffee menu"
          className="qx-auth-input sm:col-span-1" aria-label="Topic" />
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="qx-auth-input" aria-label="Platform">
          <option value="instagram">Instagram</option><option value="tiktok">TikTok</option>
          <option value="linkedin">LinkedIn</option><option value="x">X (Twitter)</option>
        </select>
        <select value={tone} onChange={(e) => setTone(e.target.value)} className="qx-auth-input" aria-label="Tone">
          <option value="fun">Fun</option><option value="professional">Professional</option>
          <option value="inspiring">Inspiring</option><option value="sales">Sales</option>
        </select>
      </div>
      {topic.trim() && (
        <>
          <button onClick={() => { setSeed((s) => s + 1); trackTool("ai-captions", { platform, tone }); }} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic>
            <FiRefreshCw size={14} /> Regenerate
          </button>
          <div className="grid sm:grid-cols-2 gap-3">
            {captions.map((c, i) => (
              <div key={i} className="rounded-2xl p-4 flex flex-col gap-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                <p className="text-[13px] leading-relaxed whitespace-pre-wrap flex-1" style={{ color: "var(--text)" }}>{c}</p>
                <CopyBtn text={c} small />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── Prompt Builder ───────────────────────────────────────── */
const P = {
  style: ["photorealistic", "cinematic film still", "digital painting", "watercolor illustration", "3D render, octane", "anime key visual", "isometric vector art", "dark fantasy oil painting"],
  light: ["golden hour sunlight", "soft studio lighting", "neon cyberpunk glow", "dramatic rim light", "overcast diffused light", "candlelit warm ambience"],
  camera: ["85mm portrait lens, f/1.8", "wide-angle 24mm", "macro close-up", "aerial drone shot", "low-angle hero shot"],
  mood: ["serene and minimal", "epic and dramatic", "cozy and nostalgic", "futuristic and clean", "mysterious and moody"],
  palette: ["muted earth tones", "vibrant complementary colors", "monochrome with one accent", "pastel color grade", "high-contrast teal and orange"],
  quality: "highly detailed, sharp focus, professional composition, 8k",
};
type PKey = keyof Omit<typeof P, "quality">;

export function AiPromptClient() {
  const [subject, setSubject] = useState("");
  const [sel, setSel] = useState<Record<PKey, string>>({ style: P.style[0], light: P.light[0], camera: P.camera[0], mood: P.mood[0], palette: P.palette[0] });
  const [model, setModel] = useState<"midjourney" | "dalle" | "sd">("midjourney");

  const prompt = useMemo(() => {
    if (!subject.trim()) return "";
    const core = `${subject.trim()}, ${sel.style}, ${sel.light}, ${sel.camera}, ${sel.mood}, ${sel.palette}, ${P.quality}`;
    if (model === "midjourney") return `${core} --ar 3:2 --v 6`;
    if (model === "sd") return `${core}\n\nNegative prompt: blurry, low quality, deformed, watermark`;
    return core;
  }, [subject, sel, model]);

  function randomize() {
    setSel({
      style: P.style[Math.floor(Math.random() * P.style.length)],
      light: P.light[Math.floor(Math.random() * P.light.length)],
      camera: P.camera[Math.floor(Math.random() * P.camera.length)],
      mood: P.mood[Math.floor(Math.random() * P.mood.length)],
      palette: P.palette[Math.floor(Math.random() * P.palette.length)],
    });
    trackTool("ai-prompt", { model });
  }

  return (
    <div className="qx-card p-6 space-y-5">
      <input value={subject} onChange={(e) => setSubject(e.target.value.slice(0, 160))}
        placeholder="Subject — e.g. a fox reading a book in a forest library" className="qx-auth-input" aria-label="Subject" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {(Object.keys(sel) as PKey[]).map((k) => (
          <label key={k} className="block">
            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{k}</span>
            <select value={sel[k]} onChange={(e) => setSel((s) => ({ ...s, [k]: e.target.value }))} className="qx-auth-input mt-1 !py-2 !text-[12.5px]">
              {P[k].map((v) => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>
        ))}
        <label className="block">
          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Target model</span>
          <select value={model} onChange={(e) => setModel(e.target.value as typeof model)} className="qx-auth-input mt-1 !py-2 !text-[12.5px]">
            <option value="midjourney">Midjourney</option><option value="dalle">DALL·E 3</option><option value="sd">Stable Diffusion</option>
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={randomize} className="qx-btn-hero !py-2.5 !px-5 text-sm" data-magnetic><FiRepeat size={14} /> Surprise me</button>
        {prompt && <CopyBtn text={prompt} />}
      </div>
      {prompt && (
        <pre className="rounded-2xl p-4 text-[13px] leading-relaxed whitespace-pre-wrap font-mono"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text)" }}>{prompt}</pre>
      )}
    </div>
  );
}

/* ── Translator (connector preview) ───────────────────────── */
const LANGS = ["English", "Uzbek", "Russian", "Turkish", "German", "French", "Spanish", "Arabic", "Chinese", "Korean", "Japanese", "Hindi", "Kazakh", "Tajik"];

export function AiTranslateClient() {
  const [from, setFrom] = useState("English");
  const [to, setTo] = useState("Uzbek");
  const [text, setText] = useState("");

  return (
    <div className="qx-card p-6 space-y-4">
      <CloudNotice engine="translate">
        Neural translation runs through the QRix AI connector and activates with the cloud engine.
        Until then, the workspace below is ready — and the button opens your text in Google Translate so you're never blocked.
      </CloudNotice>
      <div className="flex items-center gap-2">
        <select value={from} onChange={(e) => setFrom(e.target.value)} className="qx-auth-input !py-2 flex-1" aria-label="From language">
          {LANGS.map((l) => <option key={l}>{l}</option>)}
        </select>
        <button onClick={() => { setFrom(to); setTo(from); }} className="qx-btn-ghost !p-2.5" aria-label="Swap languages"><FiRepeat size={14} /></button>
        <select value={to} onChange={(e) => setTo(e.target.value)} className="qx-auth-input !py-2 flex-1" aria-label="To language">
          {LANGS.map((l) => <option key={l}>{l}</option>)}
        </select>
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 5000))} rows={5}
        placeholder="Type or paste text to translate…" className="qx-auth-input w-full resize-y" aria-label="Text to translate" />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <span className="text-[11px]" style={{ color: "var(--text-faint)" }}>{text.length} / 5000</span>
        <a
          href={`https://translate.google.com/?sl=auto&tl=${to.slice(0, 2).toLowerCase()}&text=${encodeURIComponent(text)}&op=translate`}
          target="_blank" rel="noopener noreferrer"
          className={`qx-btn-hero !py-2.5 !px-5 text-sm ${!text.trim() ? "pointer-events-none opacity-40" : ""}`}
          onClick={() => trackTool("ai-translate", { from, to })}>
          Translate <FiExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}
