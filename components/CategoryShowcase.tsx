"use client";

/* Homepage — six tool categories in jitter.video's template-card anatomy
   (measured live): a flat preview tile (3:2, no border/shadow chrome) with ONE
   focused mock crossfading through 3 tool previews, caption under the tile on
   the page canvas (accent dot + bold title + muted meta + hover arrow), "new"
   badge for fresh categories. Whole item is the link. Zero deps. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowRight, FiZap, FiShield, FiGift, FiGlobe,
  FiGrid, FiFileText, FiImage, FiVideo, FiCpu, FiCheckCircle, FiBox,
} from "react-icons/fi";

type ChipT = { label: string; icon: React.ReactNode };
type Cat = {
  key: "qr" | "pdf" | "image" | "ai" | "video" | "3d";
  label: string; href: string; count: string; tagline: string; desc: string;
  icon: React.ReactNode; c1: string; c2: string;
  slides: string[];       // preview carousel labels (3)
  chips: ChipT[];         // 3 highlighted tools
};

const CATS: Cat[] = [
  {
    key: "qr", label: "QR Tools", href: "/qr-tools", count: "30+ Tools", tagline: "Instant Results",
    desc: "Create, customize and track QR codes with powerful advanced options.",
    icon: <FiGrid size={22} />, c1: "#22c55e", c2: "#16a34a",
    slides: ["QR Generator", "Dynamic QR", "WiFi QR"],
    chips: [{ label: "QR Generator", icon: <FiGrid size={16} /> }, { label: "QR Scan", icon: <FiZap size={16} /> }, { label: "Customizer", icon: <FiImage size={16} /> }],
  },
  {
    key: "pdf", label: "PDF Tools", href: "/pdf-tools", count: "24+ Tools", tagline: "Secure & Private",
    desc: "Edit, convert, merge and secure your PDF files with ease.",
    icon: <FiFileText size={22} />, c1: "#60a5fa", c2: "#2563eb",
    slides: ["Merge PDF", "Compress", "PDF to Word"],
    chips: [{ label: "Merge PDF", icon: <FiFileText size={16} /> }, { label: "Compress", icon: <FiZap size={16} /> }, { label: "To Word", icon: <FiFileText size={16} /> }],
  },
  {
    key: "image", label: "Image Tools", href: "/image-tools", count: "70+ Tools", tagline: "High Quality",
    desc: "Edit, convert and enhance images like a pro in your browser.",
    icon: <FiImage size={22} />, c1: "#c084fc", c2: "#7c3aed",
    slides: ["Remove BG", "Upscale", "Compress"],
    chips: [{ label: "Editor", icon: <FiImage size={16} /> }, { label: "Remove BG", icon: <FiZap size={16} /> }, { label: "Compress", icon: <FiGrid size={16} /> }],
  },
  {
    key: "ai", label: "AI Tools", href: "/ai-tools", count: "28+ Tools", tagline: "Smart & Fast",
    desc: "AI-powered tools to write, generate and automate your tasks.",
    icon: <FiCpu size={22} />, c1: "#fbbf24", c2: "#d97706",
    slides: ["Logo Maker", "Image Gen", "Resume"],
    chips: [{ label: "Logo Maker", icon: <FiZap size={16} /> }, { label: "Image Gen", icon: <FiImage size={16} /> }, { label: "Prompt", icon: <FiCpu size={16} /> }],
  },
  {
    key: "video", label: "Video Tools", href: "/video-tools", count: "29+ Tools", tagline: "No Watermark",
    desc: "Edit, convert, compress and enhance videos online for free.",
    icon: <FiVideo size={22} />, c1: "#f472b6", c2: "#db2777",
    slides: ["Compressor", "Trim", "GIF Maker"],
    chips: [{ label: "Compress", icon: <FiVideo size={16} /> }, { label: "Trim", icon: <FiZap size={16} /> }, { label: "GIF", icon: <FiImage size={16} /> }],
  },
  {
    key: "3d", label: "3D Tools", href: "/3d-tools", count: "New", tagline: "Image → 3D",
    desc: "Turn one photo into a textured 3D model — preview and export GLB, OBJ, STL, USDZ.",
    icon: <FiBox size={22} />, c1: "#22d3ee", c2: "#0e7490",
    slides: ["Image to 3D", "3D Preview", "AR Export"],
    chips: [{ label: "Image to 3D", icon: <FiBox size={16} /> }, { label: "Preview", icon: <FiImage size={16} /> }, { label: "Export", icon: <FiZap size={16} /> }],
  },
];

const FEATURES = [
  { icon: <FiGift size={18} />, title: "100% Free", sub: "Most tools completely free to use." },
  { icon: <FiZap size={18} />, title: "No Sign Up", sub: "Start instantly without registration." },
  { icon: <FiShield size={18} />, title: "Secure & Private", sub: "Files stay on your device." },
  { icon: <FiCheckCircle size={18} />, title: "Fast & Reliable", sub: "Lightning-fast on-device processing." },
  { icon: <FiGlobe size={18} />, title: "Works Everywhere", sub: "All devices and browsers." },
];

/* ── themed preview mocks — each slide is a DIFFERENT tool preview ── */
function Lbl({ t }: { t: string }) {
  return <span style={{ position: "absolute", bottom: 8, left: 8, fontSize: 9, fontWeight: 800, letterSpacing: ".02em", padding: "3px 7px", borderRadius: 99, background: "rgba(0,0,0,.55)", color: "#fff", backdropFilter: "blur(4px)" }}>{t}</span>;
}
function qrCode(accent: string, rounded: boolean, logo: boolean, seed: number) {
  const cells = [];
  for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
    const fnd = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
    const mid = logo && x > 3 && x < 7 && y > 3 && y < 7;
    if (fnd || mid) continue;
    if ((x * 7 + y * 13 + seed * 17) % 3 === 0) cells.push(<rect key={`${x}-${y}`} x={x * 8 + 6} y={y * 8 + 6} width="6" height="6" rx={rounded ? 3 : 1} fill={rounded ? accent : "#0e0e0e"} />);
  }
  return (
    <svg viewBox="0 0 100 100" width="72%" height="72%">
      {[[6, 6], [70, 6], [6, 70]].map(([fx, fy], i) => (<g key={i}><rect x={fx} y={fy} width="24" height="24" rx={rounded ? 8 : 5} fill="none" stroke={rounded ? accent : "#0e0e0e"} strokeWidth="5" /><rect x={fx + 8} y={fy + 8} width="8" height="8" rx="2" fill={accent} /></g>))}
      {cells}
      {logo && <circle cx="50" cy="50" r="12" fill={accent} />}
    </svg>
  );
}

function Mock({ kind, v, c1, c2 }: { kind: Cat["key"]; v: number; c1: string; c2: string }) {
  /* ── QR: Generator · Scan · Customizer ── */
  if (kind === "qr") {
    if (v === 0) return <div className="qx-mk" style={{ background: "#fff", position: "relative" }}>{qrCode(c1, false, false, 1)}<Lbl t="Generator" /></div>;
    if (v === 1) return (
      <div className="qx-mk" style={{ background: "#0c1220", position: "relative", overflow: "hidden" }}>
        <div style={{ width: "58%", height: "62%", position: "relative", background: "#fff", borderRadius: 8 }}>{qrCode("#0e0e0e", false, false, 2)}
          {["-1px -1px", "-1px auto -1px -1px", "auto -1px -1px auto", "-1px auto auto -1px"].map((_, i) => (
            <span key={i} style={{ position: "absolute", width: 14, height: 14, borderColor: c1, borderStyle: "solid", borderWidth: i === 0 ? "3px 0 0 3px" : i === 1 ? "3px 3px 0 0" : i === 2 ? "0 3px 3px 0" : "0 0 3px 3px", top: i < 2 ? -3 : "auto", bottom: i >= 2 ? -3 : "auto", left: i % 3 === 0 ? -3 : "auto", right: i % 3 !== 0 ? -3 : "auto" }} />
          ))}
        </div>
        <div style={{ position: "absolute", left: "18%", right: "18%", height: 2, background: c1, boxShadow: `0 0 12px 2px ${c1}`, top: "50%" }} />
        <Lbl t="Scanner" />
      </div>
    );
    return (
      <div className="qx-mk" style={{ background: "#fff", position: "relative" }}>{qrCode(c1, true, true, 3)}
        <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 3 }}>{[c1, c2, "#ff4d1c"].map((c) => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />)}</div>
        <Lbl t="Customizer" />
      </div>
    );
  }
  /* ── PDF: Merge · Compress · To Word ── */
  if (kind === "pdf") {
    const doc = (bg: string, badge?: string, badgeC = "#e0392b") => (
      <div style={{ width: 62, height: 80, background: bg, borderRadius: 7, padding: "10px 8px", position: "relative", boxShadow: "0 10px 24px rgba(0,0,0,.4)" }}>
        {badge && <span style={{ position: "absolute", top: 7, right: 7, background: badgeC, color: "#fff", fontSize: 7, fontWeight: 800, padding: "2px 5px", borderRadius: 3 }}>{badge}</span>}
        {[70, 88, 58].map((w, i) => <div key={i} style={{ height: 4, borderRadius: 2, background: "#d5dae5", width: `${w}%`, marginBottom: 5 }} />)}
      </div>
    );
    if (v === 0) return <div className="qx-mk" style={{ background: "linear-gradient(160deg,#1a2440,#0f1830)", position: "relative", gap: 8 }}>
      <div style={{ position: "relative", width: 40 }}>{doc("#fff", "PDF")}<div style={{ position: "absolute", top: 6, left: 10, opacity: .6 }}>{doc("#eef")}</div></div>
      <span style={{ color: c1, fontSize: 20, fontWeight: 900 }}>→</span>{doc("#fff", "PDF")}<Lbl t="Merge" /></div>;
    if (v === 1) return <div className="qx-mk" style={{ background: "linear-gradient(160deg,#1a2440,#0f1830)", position: "relative" }}>{doc("#fff", "PDF")}
      <div style={{ position: "absolute", right: "24%", top: "50%", transform: "translateY(-50%)", textAlign: "center" }}><div style={{ color: c1, fontSize: 22, fontWeight: 900 }}>↓</div><div style={{ color: c1, fontSize: 11, fontWeight: 800 }}>−78%</div></div><Lbl t="Compress" /></div>;
    return <div className="qx-mk" style={{ background: "linear-gradient(160deg,#1a2440,#0f1830)", position: "relative", gap: 8 }}>{doc("#fff", "PDF")}<span style={{ color: c1, fontSize: 20, fontWeight: 900 }}>→</span>{doc("#fff", "W", "#2563eb")}<Lbl t="To Word" /></div>;
  }
  /* ── IMAGE: Remove BG · Upscale · Compress ── */
  if (kind === "image") {
    if (v === 0) return (
      <div className="qx-mk" style={{ position: "relative", overflow: "hidden", background: "repeating-conic-gradient(#e5e5e5 0 25%, #fafafa 0 50%) 0 0/22px 22px" }}>
        <svg viewBox="0 0 100 100" width="70%" height="90%" style={{ display: "block" }}><circle cx="50" cy="34" r="17" fill={c2} /><path d="M22 92 Q22 58 50 58 Q78 58 78 92 Z" fill={c1} /></svg>
        <Lbl t="Remove BG" />
      </div>
    );
    if (v === 1) return (
      <div className="qx-mk" style={{ background: "#0f172a", position: "relative", gap: 10 }}>
        <div style={{ width: 30, height: 30, borderRadius: 5, background: `linear-gradient(135deg,${c1},${c2})`, filter: "blur(1.5px)", imageRendering: "pixelated" }} />
        <span style={{ color: c1, fontSize: 18, fontWeight: 900 }}>→</span>
        <div style={{ width: 60, height: 60, borderRadius: 8, background: `linear-gradient(135deg,${c1},${c2})` }} />
        <span style={{ position: "absolute", top: 10, right: 10, background: c1, color: "#0b0b0b", fontSize: 10, fontWeight: 900, padding: "2px 7px", borderRadius: 99 }}>4×</span>
        <Lbl t="Upscale" />
      </div>
    );
    return (
      <div className="qx-mk" style={{ background: "#0f172a", position: "relative", flexDirection: "column", gap: 8 }}>
        <div style={{ width: 64, height: 44, borderRadius: 8, background: `linear-gradient(135deg,${c1},${c2})` }} />
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 800 }}><span style={{ color: "var(--text-faint)" }}>5 MB</span><span style={{ color: c1 }}>→</span><span style={{ color: c1 }}>0.9 MB</span></div>
        <Lbl t="Compress" />
      </div>
    );
  }
  /* ── AI: Logo Maker · Image Gen · Prompt ── */
  if (kind === "ai") {
    if (v === 0) return (
      <div className="qx-mk" style={{ background: "#0c0f1c", position: "relative", flexDirection: "column", gap: 8 }}>
        <div style={{ width: 52, height: 52, borderRadius: 15, background: `linear-gradient(135deg,${c1},${c2})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#0b0b0b", fontSize: 26, fontWeight: 900, boxShadow: `0 10px 26px -4px ${c1}` }}>Q</div>
        <div style={{ width: 60, height: 6, borderRadius: 3, background: "rgba(255,255,255,.25)" }} />
        <Lbl t="Logo Maker" />
      </div>
    );
    if (v === 1) return (
      <div className="qx-mk" style={{ background: "#0c0f1c", position: "relative", padding: 14 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, width: "78%" }}>
          {[[c1, c2], [c2, c1], ["#38bdf8", c1], [c1, "#f472b6"]].map(([a, b], i) => <div key={i} style={{ aspectRatio: "1", borderRadius: 7, background: `radial-gradient(circle at 30% 30%, ${a}, ${b})` }} />)}
        </div>
        <span style={{ position: "absolute", top: 8, left: 10, fontSize: 14 }}>✨</span>
        <Lbl t="Image Gen" />
      </div>
    );
    return (
      <div className="qx-mk" style={{ background: "#0c0f1c", position: "relative", flexDirection: "column", alignItems: "stretch", padding: 14, gap: 7 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ fontSize: 13 }}>🧠</span><span style={{ fontSize: 9, fontWeight: 700, color: "var(--text-faint)" }}>PROMPT</span></div>
        {[92, 74].map((w, i) => <div key={i} style={{ height: 6, borderRadius: 3, background: `linear-gradient(90deg, ${c1}, ${c2})`, width: `${w}%`, opacity: .85 }} />)}
        <div style={{ height: 6, width: "40%", borderRadius: 3, background: "rgba(255,255,255,.2)", position: "relative" }}><span style={{ position: "absolute", right: -4, top: -2, width: 2, height: 10, background: c1 }} /></div>
        <Lbl t="Prompt" />
      </div>
    );
  }
  /* ── 3D: Image to 3D · Preview · AR Export ── */
  if (kind === "3d") {
    const cube = (spin: boolean) => (
      <svg viewBox="0 0 100 100" width="62%" height="62%" style={spin ? { animation: "qx-float 4s ease-in-out infinite" } : undefined}>
        <polygon points="50,12 88,32 50,52 12,32" fill={c1} opacity=".9" />
        <polygon points="12,32 50,52 50,92 12,72" fill={c2} opacity=".85" />
        <polygon points="88,32 50,52 50,92 88,72" fill="#0e3a47" opacity=".9" />
        <polyline points="50,12 88,32 88,72 50,92 12,72 12,32 50,12" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1.5" />
      </svg>
    );
    if (v === 0) return (
      <div className="qx-mk" style={{ background: "#0c1220", position: "relative", gap: 6 }}>
        <div style={{ width: 34, height: 34, borderRadius: 6, background: `linear-gradient(150deg,${c1},${c2})` }} />
        <span style={{ color: "#fff", fontWeight: 900, fontSize: 16 }}>→</span>
        {cube(false)}
        <Lbl t="Image to 3D" />
      </div>
    );
    if (v === 1) return (
      <div className="qx-mk" style={{ background: "radial-gradient(ellipse at 50% 30%, #17173a, #0a0a14)", position: "relative" }}>
        {cube(true)}
        <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 4 }}>
          {["#fff", c1, c2].map((c) => <span key={c} style={{ width: 8, height: 8, borderRadius: "50%", background: c, opacity: .8 }} />)}
        </div>
        <Lbl t="3D Preview" />
      </div>
    );
    return (
      <div className="qx-mk" style={{ background: `linear-gradient(150deg, ${c1}, ${c2})`, position: "relative", flexDirection: "column", gap: 6 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", textShadow: "0 4px 12px rgba(0,0,0,.4)" }}>GLB · USDZ</span>
        <span style={{ background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 99 }}>AR ready</span>
        <Lbl t="AR Export" />
      </div>
    );
  }
  /* ── VIDEO: Compressor · Trim · GIF ── */
  if (v === 0) return (
    <div className="qx-mk" style={{ background: `linear-gradient(150deg, ${c1}, ${c2})`, position: "relative", flexDirection: "column", gap: 8 }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ width: 0, height: 0, borderLeft: "14px solid #0b0b0b", borderTop: "9px solid transparent", borderBottom: "9px solid transparent", marginLeft: 4 }} /></div>
      <span style={{ background: "rgba(0,0,0,.4)", color: "#fff", fontSize: 10, fontWeight: 900, padding: "2px 8px", borderRadius: 99 }}>−70% size</span>
      <Lbl t="Compress" />
    </div>
  );
  if (v === 1) return (
    <div className="qx-mk" style={{ background: "#111827", position: "relative", flexDirection: "column", padding: 12, gap: 8 }}>
      <div style={{ display: "flex", gap: 3, width: "88%" }}>{[c1, c2, c1, c2, c1].map((c, i) => <div key={i} style={{ flex: 1, height: 26, borderRadius: 3, background: c, opacity: .8 }} />)}</div>
      <div style={{ position: "relative", width: "88%", height: 10, borderRadius: 4, background: "rgba(255,255,255,.12)" }}>
        <div style={{ position: "absolute", left: "22%", right: "22%", top: 0, bottom: 0, background: `${c1}55`, borderLeft: `3px solid ${c1}`, borderRight: `3px solid ${c1}`, borderRadius: 3 }} />
      </div>
      <Lbl t="Trim" />
    </div>
  );
  return (
    <div className="qx-mk" style={{ background: `linear-gradient(150deg, ${c1}, ${c2})`, position: "relative" }}>
      <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-.02em", textShadow: "0 4px 12px rgba(0,0,0,.4)" }}>GIF</span>
      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, display: "flex", gap: 4 }}>{[0, 1, 2, 3].map((i) => <div key={i} style={{ flex: 1, height: 6, borderRadius: 2, background: i === (v % 4) ? "#fff" : "rgba(255,255,255,.4)" }} />)}</div>
      <Lbl t="GIF Maker" />
    </div>
  );
}

function Card({ cat, i }: { cat: Cat; i: number }) {
  const [idx, setIdx] = useState(0);
  const hov = useRef(false);
  useEffect(() => {
    const id = setInterval(() => { if (!hov.current) setIdx((n) => (n + 1) % 3); }, 3600 + i * 300);
    return () => clearInterval(id);
  }, [i]);

  return (
    <Link href={cat.href} className="qx-cs-item group"
      onMouseEnter={() => (hov.current = true)} onMouseLeave={() => (hov.current = false)}
      data-reveal={i % 2 === 0 ? "left" : "right"}
      style={{ ["--c1" as string]: cat.c1, ["--c2" as string]: cat.c2, ["--rv-delay" as string]: `${(i % 2) * 180}ms` } as React.CSSProperties}>
      {/* Jitter anatomy: a flat preview tile — one focused mock, crossfading */}
      <div className="qx-cs-stage" aria-hidden>
        {cat.count === "New" && <span className="qx-cs-new">new</span>}
        {[0, 1, 2].map((s) => (
          <div key={s} className="qx-cs-slide" data-on={s === idx}>
            <Mock kind={cat.key} v={s} c1={cat.c1} c2={cat.c2} />
          </div>
        ))}
      </div>

      {/* caption sits under the tile, on the page canvas (no card box) */}
      <div className="qx-cs-caption">
        <span className="qx-cs-dotc" aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block text-[19px] font-extrabold leading-tight" style={{ color: "var(--text)" }}>{cat.label}</span>
          <span className="block text-[13px] mt-1 truncate" style={{ color: "var(--text-muted)" }}>
            {cat.count} · {cat.chips.map((ch) => ch.label).join(" · ")}
          </span>
        </span>
        <FiArrowRight size={17} className="qx-cs-arrow shrink-0" />
      </div>
    </Link>
  );
}

export default function CategoryShowcase() {
  return (
    <section className="max-w-[1500px] mx-auto px-5 lg:px-8 pb-16 lg:pb-20" aria-label="Tool categories">
      <div className="qx-cs-grid">
        {CATS.map((c, i) => <Card key={c.key} cat={c} i={i} />)}
      </div>

      {/* features strip */}
      <div className="qx-cs-features" data-reveal>
        {FEATURES.map((f) => (
          <div key={f.title} className="flex items-start gap-3">
            <span className="qx-cs-fic">{f.icon}</span>
            <span><span className="block text-[13.5px] font-bold" style={{ color: "var(--text)" }}>{f.title}</span><span className="block text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{f.sub}</span></span>
          </div>
        ))}
      </div>

      <style>{`
        /* two big columns — cards stay large, one enters from each side */
        .qx-cs-grid { display: grid; gap: 48px 28px; grid-template-columns: repeat(1, minmax(0,1fr)); }
        @media (min-width: 768px) { .qx-cs-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }

        /* Jitter anatomy: no card box — a flat tile, caption on the canvas */
        .qx-cs-item { display: block; text-decoration: none; }
        /* stronger entrance: left column slides in from the left, right from the right */
        .qx-cs-item[data-reveal="left"]:not(.rv-in)  { transform: translateX(-72px); }
        .qx-cs-item[data-reveal="right"]:not(.rv-in) { transform: translateX(72px); }
        .qx-cs-stage {
          position: relative; aspect-ratio: 16 / 9; border-radius: 16px; overflow: hidden;
          background: #151515; transition: background .3s;
        }
        html.light .qx-cs-stage { background: #f5f5f5; }
        .qx-cs-item:hover .qx-cs-stage { background: #1a1a1a; }
        html.light .qx-cs-item:hover .qx-cs-stage { background: #eeeeee; }

        /* one focused mock, crossfading in place */
        .qx-cs-slide {
          position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
          opacity: 0; transform: scale(.96); pointer-events: none;
          transition: opacity .65s var(--ease-in-out), transform .65s var(--ease-in-out);
        }
        .qx-cs-slide[data-on="true"] { opacity: 1; transform: scale(1); }
        .qx-cs-item:hover .qx-cs-slide[data-on="true"] { transform: scale(1.035); }
        .qx-cs-slide > .qx-mk { width: 44%; height: 66%; min-width: 240px; max-width: 340px; }
        .qx-mk { border-radius: 14px; display: flex; align-items: center; justify-content: center; overflow: hidden;
          box-shadow: 0 18px 40px rgba(0,0,0,.32); }
        html.light .qx-mk { box-shadow: 0 14px 32px rgba(40,35,25,.16); }

        .qx-cs-new {
          position: absolute; top: 10px; right: 10px; z-index: 2;
          font-size: 10px; font-weight: 800; letter-spacing: .04em; padding: 3px 9px; border-radius: 7px;
          background: var(--primary-bright); color: #fff;
        }

        .qx-cs-caption { display: flex; align-items: flex-start; gap: 10px; padding: 14px 2px 0; }
        .qx-cs-dotc { width: 9px; height: 9px; border-radius: 50%; background: var(--c1); margin-top: 8px; flex-shrink: 0; }
        .qx-cs-arrow { color: var(--text-faint); opacity: 0; transform: translateX(-6px); margin-top: 3px; transition: opacity .3s, transform .3s, color .3s; }
        .qx-cs-item:hover .qx-cs-arrow { opacity: 1; transform: none; color: var(--c1); }

        .qx-cs-features { margin-top: 22px; padding: 22px 26px; border-radius: 22px; background: var(--card-bg); border: 1px solid var(--border);
          display: grid; gap: 20px 28px; grid-template-columns: repeat(1,1fr); box-shadow: 0 12px 34px rgba(0,0,0,.28); }
        @media (min-width: 640px) { .qx-cs-features { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1100px) { .qx-cs-features { grid-template-columns: repeat(5,1fr); } }
        .qx-cs-fic { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--primary-bright); background: var(--primary-dim); border: 1px solid var(--border-hover); }
      `}</style>
    </section>
  );
}
