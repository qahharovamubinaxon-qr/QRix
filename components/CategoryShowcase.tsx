"use client";

/* Homepage — six tool families as flowing function marquees (partner-logo
   language): each row streams that category's tool names with its icon in the
   category color; odd rows drift right→left, even rows left→right. No cards —
   just type. Every item links to the category. Features strip below. */

import Link from "next/link";
import {
  FiGrid, FiFileText, FiImage, FiCpu, FiVideo, FiBox,
  FiZap, FiShield, FiGift, FiGlobe, FiCheckCircle,
} from "react-icons/fi";

type Row = { href: string; color: string; icon: React.ReactNode; items: string[] };

const ROWS: Row[] = [
  {
    href: "/qr-tools", color: "#22c55e", icon: <FiGrid size={20} />,
    items: ["QR Generator", "Dynamic QR", "WiFi QR", "vCard QR", "Bulk QR", "QR Scanner", "SCAN ME Frames", "UTM Builder"],
  },
  {
    href: "/pdf-tools", color: "#60a5fa", icon: <FiFileText size={20} />,
    items: ["Merge PDF", "Compress PDF", "PDF to Word", "JPG to PDF", "Split PDF", "OCR PDF", "Crop PDF", "PDF to PNG"],
  },
  {
    href: "/image-tools", color: "#c084fc", icon: <FiImage size={20} />,
    items: ["Remove BG", "Upscale 4×", "Compress Image", "Resize", "Convert", "Photo Editor", "Watermark", "EXIF Remover"],
  },
  {
    href: "/ai-tools", color: "#fbbf24", icon: <FiCpu size={20} />,
    items: ["Logo Maker", "Image Generator", "Prompt Writer", "Resume Builder", "Translator", "Summarizer", "AI Background Remover"],
  },
  {
    href: "/video-tools", color: "#f472b6", icon: <FiVideo size={20} />,
    items: ["Compress Video", "Trim Video", "GIF Maker", "Video to MP3", "Mute Video", "Speed Changer", "Reverse", "Rotate"],
  },
  {
    href: "/3d-tools", color: "#22d3ee", icon: <FiBox size={20} />,
    items: ["Image to 3D Model", "3D Viewer", "GLB Export", "USDZ · AR Ready", "STL for Print", "OBJ Export"],
  },
];

const FEATURES = [
  { icon: <FiGift size={18} />, title: "100% Free", sub: "Most tools completely free to use." },
  { icon: <FiZap size={18} />, title: "No Sign Up", sub: "Start instantly without registration." },
  { icon: <FiShield size={18} />, title: "Secure & Private", sub: "Files stay on your device." },
  { icon: <FiCheckCircle size={18} />, title: "Fast & Reliable", sub: "Lightning-fast on-device processing." },
  { icon: <FiGlobe size={18} />, title: "Works Everywhere", sub: "All devices and browsers." },
];

export default function CategoryShowcase() {
  return (
    <section className="pb-16 lg:pb-20" aria-label="Tool categories">
      <div className="space-y-1.5">
        {ROWS.map((row, i) => (
          <div key={row.href} className="qx-fn-mask" data-reveal={i % 2 ? "right" : "left"}
            style={{ ["--rv-delay" as string]: `${i * 90}ms` } as React.CSSProperties}>
            <div className="qx-fn-track"
              style={{ ["--dur" as string]: `${36 + i * 5}s`, animationDirection: i % 2 ? "reverse" : "normal" } as React.CSSProperties}>
              {[...row.items, ...row.items].map((name, j) => (
                <Link key={`${name}-${j}`} href={row.href} className="qx-fn-item" aria-hidden={j >= row.items.length}
                  tabIndex={j >= row.items.length ? -1 : undefined}
                  style={{ ["--fc" as string]: row.color } as React.CSSProperties}>
                  <span className="qx-fn-ic" aria-hidden>{row.icon}</span>{name}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* features strip */}
      <div className="max-w-[1400px] mx-auto px-5 lg:px-8">
        <div className="qx-cs-features" data-reveal>
          {FEATURES.map((f) => (
            <div key={f.title} className="flex items-start gap-3">
              <span className="qx-cs-fic">{f.icon}</span>
              <span><span className="block text-[13.5px] font-bold" style={{ color: "var(--text)" }}>{f.title}</span><span className="block text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>{f.sub}</span></span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        /* flowing function rows — partner-marquee language, category colors */
        .qx-fn-mask {
          overflow: hidden; padding-block: 10px;
          -webkit-mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent);
                  mask-image: linear-gradient(to right, transparent, #000 7%, #000 93%, transparent);
        }
        .qx-fn-track {
          display: flex; gap: 3.4rem; width: max-content;
          animation: qxFnFlow var(--dur, 38s) linear infinite;
          will-change: transform;
        }
        .qx-fn-mask:hover .qx-fn-track { animation-play-state: paused; }
        @keyframes qxFnFlow { to { transform: translateX(-50%); } }
        .qx-fn-item {
          display: inline-flex; align-items: center; gap: .6rem; white-space: nowrap; text-decoration: none;
          font-family: var(--font-display); font-weight: 800; letter-spacing: -.02em;
          font-size: clamp(1.35rem, 2.3vw, 2rem);
          color: var(--fc, var(--text)); opacity: .92;
          transition: opacity .3s, transform .3s cubic-bezier(.22,.6,.28,1), filter .3s;
        }
        .qx-fn-item:hover {
          opacity: 1; transform: translateY(-2px) scale(1.03);
          filter: drop-shadow(0 6px 18px color-mix(in srgb, var(--fc, #fff) 50%, transparent));
        }
        .qx-fn-ic { display: flex; opacity: .9; }
        @media (max-width: 640px) { .qx-fn-track { gap: 2.2rem; } }
        @media (prefers-reduced-motion: reduce) { .qx-fn-track { animation: none; flex-wrap: wrap; width: auto; } }
        html.qx-perf .qx-fn-track { animation: none; }

        .qx-cs-features { margin-top: 34px; padding: 22px 26px; border-radius: 22px; background: var(--card-bg); border: 1px solid var(--border);
          display: grid; gap: 20px 28px; grid-template-columns: repeat(1,1fr); box-shadow: 0 12px 34px rgba(0,0,0,.28); }
        @media (min-width: 640px) { .qx-cs-features { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1100px) { .qx-cs-features { grid-template-columns: repeat(5,1fr); } }
        .qx-cs-fic { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--primary-bright); background: var(--primary-dim); border: 1px solid var(--border-hover); }
      `}</style>
    </section>
  );
}
