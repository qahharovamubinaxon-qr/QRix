"use client";

/* Homepage — the Tool Galaxy: every function as a panda tile on a draggable
   3D canvas (shoe-finder interaction adapted): drag to explore, click a panda
   to zoom in and open the tool. React.lazy keeps three.js off the critical
   path (next/dynamic never mounts — see ThreeEngineRegistry). */

import { Suspense, lazy } from "react";
import {
  FiZap, FiShield, FiGift, FiGlobe, FiCheckCircle,
} from "react-icons/fi";

const ToolGalaxy = lazy(() => import("./galaxy/ToolGalaxy"));

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
      <Suspense fallback={<div className="qx-galaxy qx-galaxy-loading qx-mono">LOADING 185+ TOOLS…</div>}>
        <ToolGalaxy />
      </Suspense>

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
        /* ── Tool Galaxy shell ── */
        .qx-galaxy {
          position: relative; height: min(72vh, 720px); min-height: 480px;
          margin: 0 auto; max-width: 1600px;
        }
        .qx-galaxy canvas { border-radius: 24px; }
        .qx-galaxy-loading {
          display: flex; align-items: center; justify-content: center;
          color: var(--text-faint); font-size: 12px; letter-spacing: .3em;
        }
        .qx-galaxy-hint {
          position: absolute; top: 14px; left: 50%; transform: translateX(-50%);
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 16px; border-radius: 999px;
          font-size: 10.5px; letter-spacing: .24em; color: var(--text-muted);
          background: rgba(14, 11, 10, 0.6); border: 1px solid rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(8px); pointer-events: none;
          transition: opacity .4s;
        }
        .qx-galaxy-hint[data-hidden="true"] { opacity: 0; }
        .qx-galaxy-card {
          position: absolute; bottom: 22px; left: 50%; transform: translateX(-50%);
          display: flex; align-items: center; gap: 14px;
          padding: 12px 14px 12px 20px; border-radius: 999px;
          background: rgba(16, 13, 12, 0.86);
          border: 1px solid color-mix(in srgb, var(--gc, #fff) 45%, rgba(255,255,255,.08));
          box-shadow: 0 18px 44px -10px color-mix(in srgb, var(--gc, #000) 40%, rgba(0,0,0,.5));
          backdrop-filter: blur(10px);
          animation: qxCardIn .35s cubic-bezier(.22,.9,.3,1.1);
        }
        @keyframes qxCardIn { from { opacity: 0; transform: translateX(-50%) translateY(14px); } }
        .qx-galaxy-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--gc); box-shadow: 0 0 12px var(--gc); }
        .qx-galaxy-name { font-family: var(--font-display); font-weight: 800; font-size: 16.5px; color: #f2ece5; white-space: nowrap; }
        .qx-galaxy-open {
          display: inline-flex; align-items: center; gap: 7px; white-space: nowrap;
          padding: 9px 18px; border-radius: 999px; text-decoration: none;
          font-size: 13px; font-weight: 700; color: #16130f;
          background: var(--gc, var(--primary-bright));
          transition: transform .25s, filter .25s;
        }
        .qx-galaxy-open:hover { transform: translateY(-2px); filter: brightness(1.08); }
        .qx-galaxy-close {
          display: flex; align-items: center; justify-content: center;
          width: 34px; height: 34px; border-radius: 50%; color: var(--text-muted);
          background: rgba(255,255,255,.07); transition: background .25s, color .25s;
        }
        .qx-galaxy-close:hover { background: rgba(255,255,255,.14); color: #fff; }
        @media (max-width: 640px) {
          .qx-galaxy { height: 62vh; min-height: 420px; }
          .qx-galaxy-name { font-size: 14px; }
        }

        .qx-cs-features { margin-top: 34px; padding: 22px 26px; border-radius: 22px; background: var(--card-bg); border: 1px solid var(--border);
          display: grid; gap: 20px 28px; grid-template-columns: repeat(1,1fr); box-shadow: 0 12px 34px rgba(0,0,0,.28); }
        @media (min-width: 640px) { .qx-cs-features { grid-template-columns: repeat(2,1fr); } }
        @media (min-width: 1100px) { .qx-cs-features { grid-template-columns: repeat(5,1fr); } }
        .qx-cs-fic { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--primary-bright); background: var(--primary-dim); border: 1px solid var(--border-hover); }
      `}</style>
    </section>
  );
}
