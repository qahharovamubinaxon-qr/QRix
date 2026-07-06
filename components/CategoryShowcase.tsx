"use client";

/* Homepage — five premium category cards, reference-grade:
   header (icon+title+arrow) · big coverflow preview carousel (auto + arrows +
   dots) with a themed mock per slide · 3 highlighted tool chips · count·tagline
   · description · Explore CTA · a features strip below. Glass + gradient border
   + float + hover lift; mouse spotlight from MotionLayer. Zero deps. */

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  FiArrowRight, FiChevronLeft, FiChevronRight, FiZap, FiShield, FiGift, FiGlobe,
  FiGrid, FiFileText, FiImage, FiVideo, FiCpu, FiCheckCircle,
} from "react-icons/fi";

type ChipT = { label: string; icon: React.ReactNode };
type Cat = {
  key: "qr" | "pdf" | "image" | "ai" | "video";
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
];

const BADGES = [
  { icon: <FiZap size={11} />, label: "Fast" }, { icon: <FiShield size={11} />, label: "Secure" },
  { icon: <FiGift size={11} />, label: "Free" }, { icon: <FiGlobe size={11} />, label: "Browser" },
];

const FEATURES = [
  { icon: <FiGift size={18} />, title: "100% Free", sub: "Most tools completely free to use." },
  { icon: <FiZap size={18} />, title: "No Sign Up", sub: "Start instantly without registration." },
  { icon: <FiShield size={18} />, title: "Secure & Private", sub: "Files stay on your device." },
  { icon: <FiCheckCircle size={18} />, title: "Fast & Reliable", sub: "Lightning-fast on-device processing." },
  { icon: <FiGlobe size={18} />, title: "Works Everywhere", sub: "All devices and browsers." },
];

/* ── themed preview mocks ─────────────────────────────────── */
function Mock({ kind, v, c1, c2 }: { kind: Cat["key"]; v: number; c1: string; c2: string }) {
  if (kind === "qr") {
    const cells = [];
    for (let y = 0; y < 11; y++) for (let x = 0; x < 11; x++) {
      const finder = (x < 3 && y < 3) || (x > 7 && y < 3) || (x < 3 && y > 7);
      if (finder) continue;
      if ((x * 7 + y * 13 + v * 17) % 3 === 0) cells.push(<rect key={`${x}-${y}`} x={x * 8 + 6} y={y * 8 + 6} width="6" height="6" rx="1.5" fill="#0e0e0e" />);
    }
    return (
      <div className="qx-mk" style={{ background: "#fff" }}>
        <svg viewBox="0 0 100 100" width="72%" height="72%">
          {[[6, 6], [70, 6], [6, 70]].map(([fx, fy], i) => (
            <g key={i}><rect x={fx} y={fy} width="24" height="24" rx="5" fill="none" stroke="#0e0e0e" strokeWidth="5" /><rect x={fx + 8} y={fy + 8} width="8" height="8" rx="2" fill={c1} /></g>
          ))}
          {cells}
        </svg>
      </div>
    );
  }
  if (kind === "pdf") {
    return (
      <div className="qx-mk" style={{ background: "linear-gradient(160deg,#1a2440,#0f1830)" }}>
        <div style={{ width: "54%", background: "#fff", borderRadius: 10, padding: "14px 12px", boxShadow: "0 12px 30px rgba(0,0,0,.4)", position: "relative" }}>
          <span style={{ position: "absolute", top: 10, right: 10, background: "#e0392b", color: "#fff", fontSize: 8, fontWeight: 800, padding: "2px 6px", borderRadius: 4 }}>PDF</span>
          {[70, 90, 60, 82].map((w, i) => <div key={i} style={{ height: 5, borderRadius: 3, background: "#d5dae5", width: `${w}%`, marginBottom: 6 }} />)}
        </div>
      </div>
    );
  }
  if (kind === "image") {
    return (
      <div className="qx-mk" style={{ position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg,#334155,#0f172a)", filter: "grayscale(1)" }} />
        <div style={{ position: "absolute", inset: 0, clipPath: "inset(0 0 0 52%)", background: `linear-gradient(160deg, ${c1}, ${c2})` }} />
        <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ position: "absolute", bottom: 0, width: "100%", height: "55%" }}>
          <polygon points="0,60 25,25 45,60" fill="rgba(0,0,0,.35)" /><polygon points="30,60 60,15 90,60" fill="rgba(0,0,0,.28)" />
        </svg>
        <div style={{ position: "absolute", inset: 0, left: "52%", width: 2, background: c1, boxShadow: `0 0 10px ${c1}` }} />
        <div style={{ position: "absolute", top: "50%", left: "52%", transform: "translate(-50%,-50%)", width: 22, height: 22, borderRadius: "50%", background: c1, display: "flex", alignItems: "center", justifyContent: "center", color: "#0b0b0b", fontSize: 12, fontWeight: 900 }}>↔</div>
      </div>
    );
  }
  if (kind === "ai") {
    return (
      <div className="qx-mk" style={{ background: "#0c0f1c", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)", backgroundSize: "12px 12px" }} />
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: `radial-gradient(circle at 35% 30%, ${c1}, ${c2} 70%)`, boxShadow: `0 0 40px -6px ${c1}`, position: "relative" }}>
          <span style={{ position: "absolute", top: -6, right: -6, fontSize: 18 }}>✨</span>
        </div>
      </div>
    );
  }
  // video
  return (
    <div className="qx-mk" style={{ background: `linear-gradient(150deg, ${c1}, ${c2})`, position: "relative" }}>
      <div style={{ width: 46, height: 46, borderRadius: "50%", background: "rgba(255,255,255,.92)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 24px rgba(0,0,0,.4)" }}>
        <div style={{ width: 0, height: 0, borderLeft: "16px solid #0b0b0b", borderTop: "10px solid transparent", borderBottom: "10px solid transparent", marginLeft: 4 }} />
      </div>
      <div style={{ position: "absolute", bottom: 12, left: 14, right: 14, height: 4, borderRadius: 3, background: "rgba(255,255,255,.35)" }}><div style={{ width: `${34 + v * 22}%`, height: "100%", borderRadius: 3, background: "#fff" }} /></div>
    </div>
  );
}

function Card({ cat, i }: { cat: Cat; i: number }) {
  const [idx, setIdx] = useState(0);
  const hov = useRef(false);
  useEffect(() => {
    const id = setInterval(() => { if (!hov.current) setIdx((n) => (n + 1) % 3); }, 3200 + i * 250);
    return () => clearInterval(id);
  }, [i]);
  const go = (d: number) => setIdx((n) => (n + d + 3) % 3);

  return (
    <div className="qx-cs-card qx-card group" onMouseEnter={() => (hov.current = true)} onMouseLeave={() => (hov.current = false)}
      data-reveal style={{ ["--c1" as string]: cat.c1, ["--c2" as string]: cat.c2, ["--rv-delay" as string]: `${i * 100}ms`, ["--float" as string]: `${i * -0.6}s` } as React.CSSProperties}>
      {/* header */}
      <Link href={cat.href} className="flex items-center justify-between mb-4 relative z-[2]">
        <span className="flex items-center gap-3"><span className="qx-cs-icon">{cat.icon}</span><span className="font-display text-[20px] font-extrabold" style={{ color: "var(--text)" }}>{cat.label}</span></span>
        <FiArrowRight size={18} className="qx-cs-arrow" />
      </Link>

      {/* coverflow preview */}
      <div className="qx-cs-stage relative z-[2]" aria-hidden>
        {[0, 1, 2].map((s) => {
          let pos = s - idx; if (pos > 1) pos -= 3; if (pos < -1) pos += 3;
          const st: React.CSSProperties = pos === 0
            ? { transform: "translateX(-50%) scale(1)", opacity: 1, zIndex: 3, filter: "none" }
            : { transform: `translateX(${pos < 0 ? "-105%" : "5%"}) scale(.8) rotateY(${pos < 0 ? 20 : -20}deg)`, opacity: .4, zIndex: 1, filter: "blur(.5px)" };
          return <div key={s} className="qx-cs-slide" style={st}><Mock kind={cat.key} v={s} c1={cat.c1} c2={cat.c2} /></div>;
        })}
        <button className="qx-cs-nav left-1.5" onClick={() => go(-1)} aria-label="Previous"><FiChevronLeft size={15} /></button>
        <button className="qx-cs-nav right-1.5" onClick={() => go(1)} aria-label="Next"><FiChevronRight size={15} /></button>
        <div className="qx-cs-dots">{[0, 1, 2].map((d) => <button key={d} onClick={() => setIdx(d)} className="qx-cs-dot" data-on={d === idx} aria-label={`Slide ${d + 1}`} />)}</div>
      </div>

      {/* highlighted tools */}
      <div className="grid grid-cols-3 gap-2 relative z-[2] mt-4">
        {cat.chips.map((ch) => (
          <span key={ch.label} className="qx-cs-hi"><span className="qx-cs-hi-ic">{ch.icon}</span>{ch.label}</span>
        ))}
      </div>

      {/* meta */}
      <div className="flex items-center gap-2 mt-4 text-[13px] font-bold relative z-[2]">
        <span style={{ color: "var(--c1)" }}>{cat.count}</span>
        <span style={{ opacity: .4, color: "var(--text-muted)" }}>•</span>
        <span style={{ color: "var(--text-muted)" }}>{cat.tagline}</span>
      </div>
      <p className="text-[12.5px] leading-relaxed mt-2 relative z-[2]" style={{ color: "var(--text-muted)" }}>{cat.desc}</p>

      <div className="flex flex-wrap gap-1.5 mt-3 relative z-[2]">
        {BADGES.map((b) => <span key={b.label} className="qx-cs-badge">{b.icon}{b.label}</span>)}
      </div>

      {/* CTA */}
      <Link href={cat.href} className="qx-cs-cta relative z-[2]">Explore {cat.label} <FiArrowRight size={14} /></Link>
    </div>
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
        .qx-cs-grid { display: grid; gap: 20px; grid-template-columns: repeat(1, minmax(0,1fr)); }
        @media (min-width: 640px) { .qx-cs-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (min-width: 1100px) { .qx-cs-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (min-width: 1360px) { .qx-cs-grid { grid-template-columns: repeat(5, minmax(0,1fr)); } }

        .qx-cs-card {
          position: relative; padding: 20px 18px 22px; border-radius: 24px; overflow: hidden; isolation: isolate;
          border: 1px solid color-mix(in srgb, var(--c1) 26%, var(--border));
          background: radial-gradient(120% 70% at 50% -10%, color-mix(in srgb, var(--c1) 14%, transparent), transparent 60%), var(--card-bg);
          box-shadow: 0 14px 40px rgba(0,0,0,.4);
          transition: transform .4s cubic-bezier(.22,.9,.3,1.1), box-shadow .35s, border-color .35s;
          animation: qxFloat 6s ease-in-out infinite; animation-delay: var(--float);
        }
        html.light .qx-cs-card { box-shadow: 0 12px 34px rgba(60,50,30,.12); }
        .qx-cs-card::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; z-index: 1;
          background: conic-gradient(from 0deg, transparent, var(--c1), color-mix(in srgb,var(--c1) 40%,#fff), var(--c2), transparent 60%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude;
          opacity: 0; transition: opacity .35s; animation: qxSpin 4s linear infinite;
        }
        .qx-cs-card:hover { transform: translateY(-10px); border-color: transparent; box-shadow: 0 30px 60px rgba(0,0,0,.5), 0 0 44px -10px color-mix(in srgb, var(--c1) 60%, transparent); }
        .qx-cs-card:hover::after { opacity: 1; }
        @keyframes qxSpin { to { transform: rotate(360deg); } }
        @keyframes qxFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -7px; } }
        @media (prefers-reduced-motion: reduce) { .qx-cs-card { animation: none; } .qx-cs-card::after { animation: none; } }

        .qx-cs-icon { width: 44px; height: 44px; border-radius: 13px; display: flex; align-items: center; justify-content: center; color: #fff; background: linear-gradient(135deg, var(--c1), var(--c2)); box-shadow: 0 8px 22px color-mix(in srgb, var(--c1) 45%, transparent); transition: transform .35s cubic-bezier(.22,.9,.3,1.2); }
        .qx-cs-card:hover .qx-cs-icon { transform: translateY(-3px) scale(1.06) rotate(-4deg); }
        .qx-cs-arrow { color: var(--text-faint); transition: transform .3s, color .3s; }
        .qx-cs-card:hover .qx-cs-arrow { color: var(--c1); transform: translate(4px,-4px); }

        /* coverflow stage */
        .qx-cs-stage { height: 176px; perspective: 900px; margin-top: 6px; }
        .qx-cs-slide {
          position: absolute; top: 8px; left: 50%; width: 62%; height: 150px;
          transform-style: preserve-3d; transition: transform .5s cubic-bezier(.4,0,.2,1), opacity .5s, filter .5s; will-change: transform;
        }
        .qx-mk { width: 100%; height: 100%; border-radius: 16px; display: flex; align-items: center; justify-content: center; overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--c1) 30%, transparent); box-shadow: 0 16px 34px rgba(0,0,0,.45); }
        .qx-cs-nav {
          position: absolute; top: 50%; transform: translateY(-50%); z-index: 4; width: 28px; height: 28px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center; color: var(--text);
          background: color-mix(in srgb, var(--surface-solid) 80%, transparent); border: 1px solid var(--border-glass);
          backdrop-filter: blur(6px); opacity: 0; transition: opacity .3s, background .2s;
        }
        .qx-cs-card:hover .qx-cs-nav { opacity: 1; }
        .qx-cs-nav:hover { background: linear-gradient(135deg, var(--c1), var(--c2)); color: #0b0b0b; }
        .qx-cs-dots { position: absolute; bottom: -2px; left: 0; right: 0; display: flex; justify-content: center; gap: 6px; z-index: 4; }
        .qx-cs-dot { width: 7px; height: 7px; border-radius: 99px; background: var(--border-glass); transition: width .3s, background .3s; }
        .qx-cs-dot[data-on="true"] { width: 18px; background: var(--c1); }

        .qx-cs-hi { display: flex; flex-direction: column; align-items: center; gap: 5px; text-align: center; font-size: 10.5px; font-weight: 700;
          padding: 9px 4px; border-radius: 12px; color: var(--text);
          background: color-mix(in srgb, var(--c1) 8%, var(--surface-2)); border: 1px solid color-mix(in srgb, var(--c1) 22%, transparent);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap; transition: transform .25s, background .25s; }
        .qx-cs-card:hover .qx-cs-hi { transform: translateY(-2px); }
        .qx-cs-hi-ic { color: var(--c1); display: flex; }
        .qx-cs-badge { display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 99px; color: var(--text-muted); background: var(--surface); border: 1px solid var(--border); }
        .qx-cs-cta { display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 16px; padding: 11px; border-radius: 14px; font-size: 13px; font-weight: 800; color: var(--c1); text-decoration: none; background: color-mix(in srgb, var(--c1) 10%, transparent); border: 1px solid color-mix(in srgb, var(--c1) 30%, transparent); transition: background .3s, gap .3s, color .3s; }
        .qx-cs-card:hover .qx-cs-cta { background: linear-gradient(135deg, var(--c1), var(--c2)); color: #0b0b0b; gap: 10px; }

        .qx-cs-features { margin-top: 22px; padding: 22px 26px; border-radius: 22px; background: var(--card-bg); border: 1px solid var(--border);
          display: grid; gap: 20px 28px; grid-template-columns: repeat(1,1fr); box-shadow: 0 12px 34px rgba(0,0,0,.28); }
        @media (min-width: 640px) { .qx-cs-features { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1100px) { .qx-cs-features { grid-template-columns: repeat(5,1fr); } }
        .qx-cs-fic { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--primary-bright); background: var(--primary-dim); border: 1px solid var(--border-hover); }
      `}</style>
    </section>
  );
}
