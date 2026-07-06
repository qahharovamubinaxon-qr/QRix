"use client";

/* Homepage — five premium category cards with infinite mini tool carousels.
   Glass + animated gradient border + float + hover lift. Mouse spotlight comes
   from the global MotionLayer (.qx-card ::before). Zero deps. */

import Link from "next/link";
import {
  FiArrowRight, FiZap, FiShield, FiGift, FiGlobe,
  FiGrid, FiFileText, FiImage, FiVideo,
} from "react-icons/fi";

type Cat = {
  key: string; label: string; href: string; count: string; tagline: string; desc: string;
  icon: React.ReactNode; c1: string; c2: string; highlights: string[]; chips: string[];
};

const CATS: Cat[] = [
  {
    key: "qr", label: "QR Tools", href: "/qr-tools", count: "30+ Tools", tagline: "Instant Results",
    desc: "Create, customize and track QR codes with powerful advanced options.",
    icon: <FiGrid size={22} />, c1: "#22c55e", c2: "#16a34a",
    highlights: ["QR Generator", "Dynamic QR", "Barcode"],
    chips: ["QR Generator", "Dynamic QR", "WiFi QR", "vCard QR", "WhatsApp QR", "Telegram QR", "Business QR", "Barcode", "Bulk QR", "QR Scanner"],
  },
  {
    key: "pdf", label: "PDF Tools", href: "/pdf-tools", count: "21+ Tools", tagline: "Secure & Private",
    desc: "Edit, convert, merge and secure your PDF files with ease — in your browser.",
    icon: <FiFileText size={22} />, c1: "#60a5fa", c2: "#2563eb",
    highlights: ["Merge PDF", "Compress", "PDF to Word"],
    chips: ["Merge PDF", "Split PDF", "Compress PDF", "Protect PDF", "Unlock PDF", "PDF to Word", "PDF to JPG", "Rotate PDF", "Watermark", "OCR PDF"],
  },
  {
    key: "image", label: "Image Tools", href: "/image-tools", count: "70+ Tools", tagline: "High Quality",
    desc: "Edit, convert and enhance images like a pro — right in your browser.",
    icon: <FiImage size={22} />, c1: "#c084fc", c2: "#7c3aed",
    highlights: ["Remove BG", "Upscale", "Crop"],
    chips: ["Remove Background", "Upscale", "Compress", "Resize", "OCR", "Blur", "Crop", "Convert", "Watermark", "Enhancer"],
  },
  {
    key: "ai", label: "AI Tools", href: "/ai-tools", count: "28+ Tools", tagline: "Smart & Fast",
    desc: "AI-powered tools to write, generate and automate your creative tasks.",
    icon: <FiZap size={22} />, c1: "#fbbf24", c2: "#d97706",
    highlights: ["Logo Maker", "Prompt Builder", "Resume"],
    chips: ["Logo Generator", "Image Generator", "Prompt Builder", "Caption Generator", "Translator", "AI OCR", "Resume Builder", "Avatar Maker", "Speech to Text", "Background Remover"],
  },
  {
    key: "video", label: "Video Tools", href: "/video-tools", count: "29+ Tools", tagline: "No Watermark",
    desc: "Edit, convert, compress and enhance videos online — free and private.",
    icon: <FiVideo size={22} />, c1: "#f472b6", c2: "#db2777",
    highlights: ["Compress", "Trim", "GIF Maker"],
    chips: ["Video Compressor", "Trim", "Crop", "Convert", "Subtitles", "GIF Maker", "Thumbnail", "Merge", "Extract Audio", "Video Speed"],
  },
];

const BADGES = [
  { icon: <FiZap size={11} />, label: "Fast" }, { icon: <FiShield size={11} />, label: "Secure" },
  { icon: <FiGift size={11} />, label: "Free" }, { icon: <FiGlobe size={11} />, label: "Browser" },
];

function Card({ cat, i }: { cat: Cat; i: number }) {
  const chips = [...cat.chips, ...cat.chips];
  return (
    <Link href={cat.href}
      className="qx-cs-card qx-card group"
      data-reveal style={{ ["--c1" as string]: cat.c1, ["--c2" as string]: cat.c2, ["--rv-delay" as string]: `${i * 110}ms`, ["--float" as string]: `${i * -0.6}s` } as React.CSSProperties}>
      {/* header */}
      <div className="flex items-center justify-between mb-4 relative z-[2]">
        <span className="qx-cs-icon">{cat.icon}</span>
        <FiArrowRight size={18} className="qx-cs-arrow" />
      </div>
      <h3 className="font-display text-[22px] font-extrabold relative z-[2]" style={{ color: "var(--text)" }}>{cat.label}</h3>

      {/* infinite mini carousel */}
      <div className="qx-cs-rail relative z-[2]" aria-hidden>
        <div className="qx-cs-track">
          {chips.map((ch, k) => <span key={k} className="qx-cs-chip">{ch}</span>)}
        </div>
      </div>

      {/* highlights */}
      <div className="grid grid-cols-3 gap-2 relative z-[2]">
        {cat.highlights.map((h) => (
          <span key={h} className="qx-cs-hi">{h}</span>
        ))}
      </div>

      {/* meta */}
      <div className="flex items-center gap-2 mt-4 text-[12.5px] font-bold relative z-[2]">
        <span style={{ color: "var(--c1)" }}>{cat.count}</span>
        <span style={{ opacity: .4, color: "var(--text-muted)" }}>•</span>
        <span style={{ color: "var(--text-muted)" }}>{cat.tagline}</span>
      </div>
      <p className="text-[12.5px] leading-relaxed mt-2 relative z-[2]" style={{ color: "var(--text-muted)" }}>{cat.desc}</p>

      {/* badges */}
      <div className="flex flex-wrap gap-1.5 mt-3 relative z-[2]">
        {BADGES.map((b) => (
          <span key={b.label} className="qx-cs-badge">{b.icon}{b.label}</span>
        ))}
      </div>

      {/* CTA */}
      <span className="qx-cs-cta relative z-[2]">Explore {cat.label} <FiArrowRight size={14} /></span>
    </Link>
  );
}

export default function CategoryShowcase() {
  return (
    <section className="max-w-[1500px] mx-auto px-5 lg:px-8 pb-24 lg:pb-32" aria-label="Tool categories">
      <div className="qx-cs-grid">
        {CATS.map((c, i) => <Card key={c.key} cat={c} i={i} />)}
      </div>

      <style>{`
        .qx-cs-grid { display: grid; gap: 20px; grid-template-columns: repeat(1, minmax(0,1fr)); }
        @media (min-width: 640px) { .qx-cs-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
        @media (min-width: 1100px) { .qx-cs-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
        @media (min-width: 1360px) { .qx-cs-grid { grid-template-columns: repeat(5, minmax(0,1fr)); } }

        .qx-cs-card {
          position: relative; display: block; padding: 22px 20px 24px; border-radius: 24px;
          text-decoration: none; overflow: hidden; isolation: isolate;
          border: 1px solid color-mix(in srgb, var(--c1) 26%, var(--border));
          background:
            radial-gradient(120% 80% at 50% -10%, color-mix(in srgb, var(--c1) 15%, transparent), transparent 60%),
            var(--card-bg);
          box-shadow: 0 14px 40px rgba(0,0,0,.4), 0 0 0 1px rgba(255,255,255,.02) inset;
          transition: transform .4s cubic-bezier(.22,.9,.3,1.1), box-shadow .35s ease, border-color .35s ease;
          animation: qxFloat 6s ease-in-out infinite; animation-delay: var(--float);
        }
        html.light .qx-cs-card { box-shadow: 0 12px 34px rgba(60,50,30,.12); }
        /* animated gradient border ring on hover */
        .qx-cs-card::after {
          content: ""; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; z-index: 1;
          background: conic-gradient(from 0deg, transparent, var(--c1), color-mix(in srgb,var(--c1) 40%,#fff), var(--c2), transparent 60%);
          -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor;
          mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude;
          opacity: 0; transition: opacity .35s ease; animation: qxSpin 4s linear infinite;
        }
        .qx-cs-card:hover { transform: translateY(-10px); border-color: transparent; box-shadow: 0 30px 60px rgba(0,0,0,.5), 0 0 44px -10px color-mix(in srgb, var(--c1) 60%, transparent); }
        .qx-cs-card:hover::after { opacity: 1; }
        @keyframes qxSpin { to { transform: rotate(360deg); } }
        @keyframes qxFloat { 0%,100% { translate: 0 0; } 50% { translate: 0 -7px; } }
        @media (prefers-reduced-motion: reduce) { .qx-cs-card { animation: none; } .qx-cs-card::after { animation: none; } }

        .qx-cs-icon {
          width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff;
          background: linear-gradient(135deg, var(--c1), var(--c2)); box-shadow: 0 8px 22px color-mix(in srgb, var(--c1) 45%, transparent);
          transition: transform .35s cubic-bezier(.22,.9,.3,1.2);
        }
        .qx-cs-card:hover .qx-cs-icon { transform: translateY(-3px) scale(1.06) rotate(-4deg); }
        .qx-cs-arrow { color: var(--text-faint); transition: transform .3s, color .3s; }
        .qx-cs-card:hover .qx-cs-arrow { color: var(--c1); transform: translate(4px,-4px); }

        .qx-cs-rail {
          margin: 14px 0 14px; overflow: hidden; border-radius: 12px; padding: 8px 0;
          background: color-mix(in srgb, var(--c1) 7%, transparent); border: 1px solid color-mix(in srgb, var(--c1) 16%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
          mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
        }
        .qx-cs-track { display: flex; gap: 8px; width: max-content; animation: qxRail 22s linear infinite; }
        .qx-cs-card:hover .qx-cs-track { animation-play-state: paused; }
        @keyframes qxRail { to { transform: translateX(-50%); } }
        .qx-cs-chip {
          white-space: nowrap; font-size: 11px; font-weight: 700; padding: 5px 11px; border-radius: 99px;
          color: var(--text); background: var(--surface-2); border: 1px solid var(--border);
        }

        .qx-cs-hi {
          text-align: center; font-size: 10.5px; font-weight: 700; padding: 8px 4px; border-radius: 10px;
          color: var(--text); background: color-mix(in srgb, var(--c1) 9%, var(--surface-2)); border: 1px solid color-mix(in srgb, var(--c1) 22%, transparent);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
        }
        .qx-cs-badge {
          display: inline-flex; align-items: center; gap: 3px; font-size: 10px; font-weight: 700; padding: 3px 8px; border-radius: 99px;
          color: var(--text-muted); background: var(--surface); border: 1px solid var(--border);
        }
        .qx-cs-cta {
          display: flex; align-items: center; justify-content: center; gap: 6px; margin-top: 16px; padding: 11px; border-radius: 14px;
          font-size: 13px; font-weight: 800; color: var(--c1);
          background: color-mix(in srgb, var(--c1) 10%, transparent); border: 1px solid color-mix(in srgb, var(--c1) 30%, transparent);
          transition: background .3s, gap .3s, color .3s;
        }
        .qx-cs-card:hover .qx-cs-cta { background: linear-gradient(135deg, var(--c1), var(--c2)); color: #0b0b0b; gap: 10px; }
      `}</style>
    </section>
  );
}
