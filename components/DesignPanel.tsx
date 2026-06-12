"use client";
import { useState } from "react";
import { FiSliders, FiX, FiChevronDown, FiChevronUp, FiUpload } from "react-icons/fi";

type Props = {
  color: string; setColor: (v: string) => void;
  bgColor: string; setBgColor: (v: string) => void;
  size: number; setSize: (v: number) => void;
  style: string; setStyle: (v: string) => void;
  outerMarker?: string; setOuterMarker?: (v: string) => void;
  innerMarker?: string; setInnerMarker?: (v: string) => void;
  markerColor?: string; setMarkerColor?: (v: string) => void;
  frameStyle?: string; setFrameStyle?: (v: string) => void;
  frameText?: string; setFrameText?: (v: string) => void;
  logo?: string; setLogo?: (v: string) => void;
  dark?: boolean;
};

const PRESET_QR_COLORS = ["#000000","#1a1a2e","#0f3460","#e94560","#533483","#1b4332","#7b2d8b","#c0392b"];
const PRESET_BG_COLORS = ["#ffffff","#f8f9fa","#fef3c7","#dbeafe","#f0fdf4","#fdf4ff","#fff7ed","#f1f5f9"];

const QR_STYLES = [
  { value: "square", label: "Classic" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Soft" },
];

const OUTER_MARKERS = [
  { value: "square", svg: <rect x="2" y="2" width="20" height="20" rx="0" fill="none" stroke="currentColor" strokeWidth="2.5"/> },
  { value: "rounded-sm", svg: <rect x="2" y="2" width="20" height="20" rx="3" fill="none" stroke="currentColor" strokeWidth="2.5"/> },
  { value: "rounded-md", svg: <rect x="2" y="2" width="20" height="20" rx="6" fill="none" stroke="currentColor" strokeWidth="2.5"/> },
  { value: "rounded-lg", svg: <rect x="2" y="2" width="20" height="20" rx="9" fill="none" stroke="currentColor" strokeWidth="2.5"/> },
  { value: "circle", svg: <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2.5"/> },
  { value: "diamond", svg: <polygon points="12,2 22,12 12,22 2,12" fill="none" stroke="currentColor" strokeWidth="2.5"/> },
  { value: "shield", svg: <path d="M12 2 L22 6 L22 14 Q22 20 12 22 Q2 20 2 14 L2 6 Z" fill="none" stroke="currentColor" strokeWidth="2"/> },
  { value: "star", svg: <polygon points="12,2 14.5,9 22,9 16,14 18.5,21 12,17 5.5,21 8,14 2,9 9.5,9" fill="none" stroke="currentColor" strokeWidth="1.5"/> },
];

const INNER_MARKERS = [
  { value: "square", svg: <rect x="5" y="5" width="14" height="14" rx="0" fill="currentColor"/> },
  { value: "rounded", svg: <rect x="5" y="5" width="14" height="14" rx="3" fill="currentColor"/> },
  { value: "circle", svg: <circle cx="12" cy="12" r="7" fill="currentColor"/> },
  { value: "diamond", svg: <polygon points="12,5 19,12 12,19 5,12" fill="currentColor"/> },
  { value: "star", svg: <polygon points="12,4 13.8,9.5 19.5,9.5 15,13 16.8,18.5 12,15 7.2,18.5 9,13 4.5,9.5 10.2,9.5" fill="currentColor"/> },
  { value: "cross", svg: <><rect x="10" y="4" width="4" height="16" rx="1" fill="currentColor"/><rect x="4" y="10" width="16" height="4" rx="1" fill="currentColor"/></> },
  { value: "heart", svg: <path d="M12 20 C12 20 4 14 4 9 C4 6.2 6.2 4 9 4 C10.5 4 11.8 4.7 12 5 C12.2 4.7 13.5 4 15 4 C17.8 4 20 6.2 20 9 C20 14 12 20 12 20Z" fill="currentColor"/> },
  { value: "leaf", svg: <path d="M12 4 Q20 4 20 12 Q20 20 12 20 Q4 20 4 12 Q4 4 12 4Z" fill="currentColor"/> },
];

const LOGOS = [
  { name: "None", url: null, emoji: "✕" },
  { name: "WhatsApp", url: "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg", emoji: "💬" },
  { name: "Telegram", url: "https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg", emoji: "📱" },
  { name: "Instagram", url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png", emoji: "📸" },
  { name: "YouTube", url: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg", emoji: "▶️" },
  { name: "Facebook", url: "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", emoji: "👤" },
  { name: "Twitter", url: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg", emoji: "🐦" },
  { name: "LinkedIn", url: "https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png", emoji: "💼" },
  { name: "TikTok", url: "https://upload.wikimedia.org/wikipedia/en/a/a9/TikTok_logo.svg", emoji: "🎵" },
  { name: "Discord", url: "https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png", emoji: "🎮" },
  { name: "Spotify", url: "https://upload.wikimedia.org/wikipedia/commons/2/26/Spotify_logo_with_text.svg", emoji: "🎵" },
  { name: "Google", url: "https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg", emoji: "🔍" },
  { name: "Chrome", url: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Chrome_icon_%28September_2014%29.svg", emoji: "🌐" },
  { name: "GitHub", url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png", emoji: "⚙️" },
  { name: "WiFi", url: null, emoji: "📶" },
  { name: "Email", url: null, emoji: "📧" },
];

const FRAMES = [
  { value: "none", label: "None", preview: "✕" },
  { value: "banner", label: "Banner", preview: "━" },
  { value: "ribbon", label: "Ribbon", preview: "🎀" },
  { value: "box", label: "Box", preview: "⬜" },
  { value: "phone", label: "Phone", preview: "📱" },
];

const SIZES = [150, 180, 200, 220, 250, 300];

type Section = "colors" | "design" | "logo" | "frame" | "size";

export default function DesignPanel({
  color, setColor, bgColor, setBgColor,
  size, setSize, style, setStyle,
  outerMarker = "square", setOuterMarker,
  innerMarker = "square", setInnerMarker,
  markerColor, setMarkerColor,
  frameStyle = "none", setFrameStyle,
  frameText = "Scan me", setFrameText,
  logo, setLogo,
  dark = true,
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<Section | null>(null);

  const bg = dark ? "rgba(8,8,20,0.98)" : "rgba(255,255,255,0.98)";
  const borderC = dark ? "rgba(255,255,255,0.08)" : "#d1d5db";
  const text = dark ? "text-white" : "text-zinc-900";
  const muted = dark ? "text-zinc-400" : "text-zinc-600";
  const faintBg = dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)";
  const faintBorder = dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)";
  const sectionBg = dark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)";

  const SectionHeader = ({ id, label, icon }: { id: Section; label: string; icon: string }) => (
    <button
      onClick={() => setActiveSection(activeSection === id ? null : id)}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeSection === id ? "bg-purple-500/10" : ""}`}
      style={{ border: `1px solid ${activeSection === id ? "rgba(168,85,247,0.3)" : faintBorder}` }}
    >
      <span className={`flex items-center gap-2 text-xs font-bold ${activeSection === id ? "text-purple-400" : text}`}>
        <span>{icon}</span> {label}
      </span>
      {activeSection === id ? <FiChevronUp size={14} className="text-purple-400" /> : <FiChevronDown size={14} className={muted} />}
    </button>
  );

  return (
    <>
      {/* Customize Design button */}
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition hover:-translate-y-0.5"
        style={{
          background: "linear-gradient(135deg,rgba(168,85,247,0.15),rgba(99,102,241,0.1))",
          border: "1px solid rgba(168,85,247,0.3)",
          color: "#c084fc",
          boxShadow: "0 0 15px rgba(168,85,247,0.15)",
        }}
      >
        <FiSliders size={13} /> Customize Design ✦
      </button>

      {/* Full modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }}
          onClick={e => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-lg rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: bg,
              border: `1px solid ${borderC}`,
              maxHeight: "90vh",
              boxShadow: "0 0 60px rgba(168,85,247,0.2)",
            }}
          >
            {/* Neon top */}
            <div className="h-px" style={{ background: "linear-gradient(90deg,transparent,#a855f7,#6366f1,transparent)" }} />

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: faintBorder }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)", boxShadow: "0 0 15px rgba(168,85,247,0.4)" }}>
                  <FiSliders size={14} className="text-white" />
                </div>
                <div>
                  <div className={`font-black text-sm ${text}`}>QR Design Studio</div>
                  <div className={`text-[10px] ${muted}`}>Customize your QR code appearance</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)}
                className={`w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-500/20 hover:text-red-400 transition ${muted}`}
                style={{ border: `1px solid ${faintBorder}` }}>
                <FiX size={14} />
              </button>
            </div>

            {/* Sections */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">

              {/* 1. Colors */}
              <SectionHeader id="colors" label="Colors" icon="🎨" />
              {activeSection === "colors" && (
                <div className="rounded-xl p-4 space-y-4" style={{ background: sectionBg, border: `1px solid ${faintBorder}` }}>
                  <div className="grid grid-cols-2 gap-3">
                    {/* QR Color */}
                    <div>
                      <div className={`text-[11px] font-bold ${muted} mb-2`}>QR Color</div>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <div className="w-8 h-8 rounded-lg border-2 overflow-hidden" style={{ background: color, borderColor: faintBorder }}>
                          <input type="color" value={color} onChange={e => setColor(e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                        </div>
                        <span className={`text-[11px] font-mono ${muted}`}>{color}</span>
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_QR_COLORS.map(c => (
                          <button key={c} onClick={() => setColor(c)} className="w-5 h-5 rounded-md border transition hover:scale-110"
                            style={{ background: c, borderColor: color === c ? "#a855f7" : faintBorder, boxShadow: color === c ? "0 0 8px rgba(168,85,247,0.6)" : "none" }} />
                        ))}
                      </div>
                    </div>
                    {/* BG Color */}
                    <div>
                      <div className={`text-[11px] font-bold ${muted} mb-2`}>Background</div>
                      <label className="flex items-center gap-2 cursor-pointer mb-2">
                        <div className="w-8 h-8 rounded-lg border-2 overflow-hidden" style={{ background: bgColor, borderColor: faintBorder }}>
                          <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                        </div>
                        <span className={`text-[11px] font-mono ${muted}`}>{bgColor}</span>
                      </label>
                      <div className="flex flex-wrap gap-1">
                        {PRESET_BG_COLORS.map(c => (
                          <button key={c} onClick={() => setBgColor(c)} className="w-5 h-5 rounded-md border transition hover:scale-110"
                            style={{ background: c, borderColor: bgColor === c ? "#06b6d4" : faintBorder, boxShadow: bgColor === c ? "0 0 8px rgba(6,182,212,0.6)" : "none" }} />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Marker color */}
                  {setMarkerColor && (
                    <div>
                      <div className={`text-[11px] font-bold ${muted} mb-2`}>Marker Color (optional)</div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <div className="w-8 h-8 rounded-lg border-2 overflow-hidden" style={{ background: markerColor || color, borderColor: faintBorder }}>
                          <input type="color" value={markerColor || color} onChange={e => setMarkerColor(e.target.value)} className="opacity-0 w-full h-full cursor-pointer" />
                        </div>
                        <span className={`text-[11px] font-mono ${muted}`}>{markerColor || color}</span>
                        <button onClick={() => setMarkerColor("")} className={`text-[10px] ${muted} hover:text-red-400 transition`}>Reset</button>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* 2. Design */}
              <SectionHeader id="design" label="Design & Markers" icon="🔲" />
              {activeSection === "design" && (
                <div className="rounded-xl p-4 space-y-4" style={{ background: sectionBg, border: `1px solid ${faintBorder}` }}>
                  {/* QR Style */}
                  <div>
                    <div className={`text-[11px] font-bold ${muted} mb-2`}>QR Style</div>
                    <div className="flex flex-wrap gap-2">
                      {QR_STYLES.map(s => (
                        <button key={s.value} onClick={() => setStyle(s.value)}
                          className="px-3 py-1.5 rounded-lg text-[11px] font-bold transition"
                          style={{
                            background: style === s.value ? "linear-gradient(135deg,rgba(168,85,247,0.2),rgba(99,102,241,0.1))" : faintBg,
                            border: `1px solid ${style === s.value ? "#a855f7" : faintBorder}`,
                            color: style === s.value ? "#a855f7" : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                            boxShadow: style === s.value ? "0 0 10px rgba(168,85,247,0.2)" : "none",
                          }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outer marker */}
                  {setOuterMarker && (
                    <div>
                      <div className={`text-[11px] font-bold ${muted} mb-2`}>Outer Marker</div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {OUTER_MARKERS.map(m => (
                          <button key={m.value} onClick={() => setOuterMarker(m.value)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition hover:scale-110"
                            style={{
                              background: outerMarker === m.value ? "rgba(168,85,247,0.15)" : faintBg,
                              border: `1px solid ${outerMarker === m.value ? "#a855f7" : faintBorder}`,
                              color: outerMarker === m.value ? "#a855f7" : dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                              boxShadow: outerMarker === m.value ? "0 0 8px rgba(168,85,247,0.3)" : "none",
                            }}>
                            <svg width="20" height="20" viewBox="0 0 24 24">{m.svg}</svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Inner marker */}
                  {setInnerMarker && (
                    <div>
                      <div className={`text-[11px] font-bold ${muted} mb-2`}>Inner Marker</div>
                      <div className="grid grid-cols-8 gap-1.5">
                        {INNER_MARKERS.map(m => (
                          <button key={m.value} onClick={() => setInnerMarker(m.value)}
                            className="w-9 h-9 rounded-lg flex items-center justify-center transition hover:scale-110"
                            style={{
                              background: innerMarker === m.value ? "rgba(6,182,212,0.15)" : faintBg,
                              border: `1px solid ${innerMarker === m.value ? "#06b6d4" : faintBorder}`,
                              color: innerMarker === m.value ? "#06b6d4" : dark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)",
                              boxShadow: innerMarker === m.value ? "0 0 8px rgba(6,182,212,0.3)" : "none",
                            }}>
                            <svg width="20" height="20" viewBox="0 0 24 24">{m.svg}</svg>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 3. Logo */}
              <SectionHeader id="logo" label="Logo" icon="🏷️" />
              {activeSection === "logo" && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: sectionBg, border: `1px solid ${faintBorder}` }}>
                  {/* Upload */}
                  {setLogo && (
                    <label className="flex items-center justify-center gap-2 py-2.5 rounded-xl cursor-pointer transition hover:opacity-80"
                      style={{ background: "rgba(168,85,247,0.1)", border: "1px dashed rgba(168,85,247,0.3)", color: "#a855f7" }}>
                      <FiUpload size={13} />
                      <span className="text-xs font-bold">Upload Logo</span>
                      <input type="file" accept="image/*" className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = () => setLogo(reader.result as string);
                          reader.readAsDataURL(file);
                        }} />
                    </label>
                  )}

                  {/* Preset logos */}
                  <div className={`text-[11px] font-bold ${muted} mb-1`}>Or choose from presets</div>
                  <div className="grid grid-cols-5 gap-2">
                    {LOGOS.map(l => (
                      <button key={l.name}
                        onClick={() => setLogo && setLogo(l.url || "")}
                        className="flex flex-col items-center gap-1 p-2 rounded-xl transition hover:scale-105"
                        style={{
                          background: logo === l.url ? "rgba(168,85,247,0.15)" : faintBg,
                          border: `1px solid ${logo === l.url ? "#a855f7" : faintBorder}`,
                          boxShadow: logo === l.url ? "0 0 8px rgba(168,85,247,0.3)" : "none",
                        }}>
                        {l.url ? (
                          <img src={l.url} alt={l.name} className="w-7 h-7 object-contain rounded" />
                        ) : (
                          <span className="text-xl leading-none">{l.emoji}</span>
                        )}
                        <span className={`text-[8px] font-medium ${muted} truncate w-full text-center`}>{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Frame */}
              <SectionHeader id="frame" label="Frame" icon="🖼️" />
              {activeSection === "frame" && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: sectionBg, border: `1px solid ${faintBorder}` }}>
                  <div className="flex gap-2 flex-wrap">
                    {FRAMES.map(f => (
                      <button key={f.value}
                        onClick={() => setFrameStyle && setFrameStyle(f.value)}
                        className="flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl text-xs font-bold transition"
                        style={{
                          background: frameStyle === f.value ? "rgba(236,72,153,0.15)" : faintBg,
                          border: `1px solid ${frameStyle === f.value ? "#ec4899" : faintBorder}`,
                          color: frameStyle === f.value ? "#ec4899" : dark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)",
                          boxShadow: frameStyle === f.value ? "0 0 10px rgba(236,72,153,0.2)" : "none",
                        }}>
                        <span className="text-base">{f.preview}</span>
                        <span className="text-[9px]">{f.label}</span>
                      </button>
                    ))}
                  </div>
                  {frameStyle !== "none" && setFrameText && (
                    <div>
                      <div className={`text-[11px] font-bold ${muted} mb-2`}>Frame Text</div>
                      <input
                        value={frameText}
                        onChange={e => setFrameText(e.target.value)}
                        placeholder="Scan me"
                        className="w-full rounded-xl px-3 py-2 text-sm focus:outline-none transition"
                        style={{
                          background: dark ? "rgba(255,255,255,0.05)" : "white",
                          border: `1px solid ${faintBorder}`,
                          color: dark ? "white" : "#111827",
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 5. Size */}
              <SectionHeader id="size" label="Size" icon="📐" />
              {activeSection === "size" && (
                <div className="rounded-xl p-4 space-y-3" style={{ background: sectionBg, border: `1px solid ${faintBorder}` }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold ${muted}`}>QR Size</span>
                    <span className="text-green-400 font-mono text-xs font-bold">{size}px</span>
                  </div>
                  <div className="grid grid-cols-6 gap-1.5">
                    {SIZES.map(s => (
                      <button key={s} onClick={() => setSize(s)}
                        className="py-2 rounded-xl text-[10px] font-bold transition hover:-translate-y-0.5"
                        style={{
                          background: size === s ? "rgba(34,197,94,0.15)" : faintBg,
                          border: `1px solid ${size === s ? "#22c55e" : faintBorder}`,
                          color: size === s ? "#22c55e" : dark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                          boxShadow: size === s ? "0 0 8px rgba(34,197,94,0.2)" : "none",
                        }}>
                        {s}
                      </button>
                    ))}
                  </div>
                  <input type="range" min={100} max={400} value={size} onChange={e => setSize(Number(e.target.value))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ background: `linear-gradient(90deg,#22c55e ${((size-100)/300)*100}%,${dark?"rgba(255,255,255,0.1)":"rgba(0,0,0,0.1)"} ${((size-100)/300)*100}%)` }} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t" style={{ borderColor: faintBorder }}>
              <button onClick={() => setOpen(false)}
                className="w-full py-2.5 rounded-xl text-sm font-black text-white transition hover:opacity-90"
                style={{ background: "linear-gradient(135deg,#a855f7,#6366f1)", boxShadow: "0 0 20px rgba(168,85,247,0.4)" }}>
                ✓ Apply Design
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
