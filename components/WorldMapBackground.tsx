"use client";

/* ============================================================================
   QRix — the live world map behind the dark half of the site.

   Three layers, all sharing one coordinate space (the map's own viewBox), so a
   latitude/longitude lands in the same place on every one of them:

     1. the land        — public/world-dots.svg, a single <img>. The dots are
                          generated at build time by scripts/gen-world-map.mjs;
                          `dotted-map` is 352 KB of world data and 3065 points, and
                          neither the bytes nor the DOM nodes belong on a homepage.
     2. the field       — one dot per real city (129 of them). A rotating handful
                          pulse at any moment, so the map reads as people using the
                          site rather than as a static decoration.
     3. the visitor     — "We are here": a beam, a bloom, and the city they are
                          actually in.

   The visitor's location comes from /api/v1/geo (Vercel resolves it at the edge —
   no permission prompt, no third-party call, nothing stored). On localhost there
   are no such headers, so we fall back to the browser's own timezone: Intl gives
   "Asia/Tashkent", and the city segment is looked up in the same list the dots are
   drawn from. If neither resolves, the map simply shows no pin.
   ============================================================================ */

import { useEffect, useRef, useState } from "react";
import { CITIES, VIEW_BOX, VIEW_W, VIEW_H, project } from "@/lib/world-map";

type Pin = { x: number; y: number; city: string | null; country: string | null };

/** ISO code → the visitor's own language ("UZ" → "Ўзбекистон"). Browser-native. */
function countryName(code: string | null): string | null {
  if (!code) return null;
  if (!/^[A-Za-z]{2}$/.test(code)) return code; // the dev fallback already gives a name
  try {
    return new Intl.DisplayNames(undefined, { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

/** No geo headers (localhost, or a plan without them) — ask the browser instead. */
function pinFromTimezone(): Pin | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // "Asia/Tashkent"
    const name = tz.split("/").pop()?.replace(/_/g, " ").toLowerCase();
    if (!name) return null;
    const hit = CITIES.find((c) => c.n.toLowerCase() === name);
    if (!hit) return null;
    return { x: hit.x, y: hit.y, city: hit.n, country: hit.c };
  } catch {
    return null;
  }
}

export default function WorldMapBackground() {
  const [pin, setPin] = useState<Pin | null>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  /* ── where is the visitor? ───────────────────────────────────────────────── */
  useEffect(() => {
    let dead = false;
    const CACHE = "qx-geo-pin";

    // The visitor does not move between page views. Resolving once per session
    // keeps this to a single function invocation instead of one per navigation.
    try {
      const cached = sessionStorage.getItem(CACHE);
      if (cached) { setPin(JSON.parse(cached) as Pin); return; }
    } catch { /* private mode — just resolve it again */ }

    (async () => {
      const resolve = async (): Promise<Pin | null> => {
        try {
          const res = await fetch("/api/v1/geo", { cache: "no-store" });
          if (!res.ok) throw new Error(String(res.status));
          const geo = (await res.json()) as {
            country: string | null; city: string | null; lat: number | null; lon: number | null;
          };

          if (typeof geo.lat === "number" && typeof geo.lon === "number") {
            const { x, y } = project(geo.lat, geo.lon);
            // Guard against a bogus coordinate throwing the pin off the canvas.
            if (x >= 0 && x <= VIEW_W && y >= 0 && y <= VIEW_H) {
              return { x, y, city: geo.city, country: geo.country };
            }
          }
        } catch { /* offline, blocked, or no geo — the timezone still knows */ }

        // No coordinates from the edge (localhost, or a plan without them).
        return pinFromTimezone();
      };

      const next = await resolve();
      if (dead || !next) return;
      setPin(next);
      try { sessionStorage.setItem(CACHE, JSON.stringify(next)); } catch { /* ignore */ }
    })();

    return () => { dead = true; };
  }, []);

  /* ── the map belongs to the dark half: invisible over the orange hero ────── */
  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const vh = window.innerHeight;
        // 0 while the orange hero owns the screen, 1 once the navy does.
        const t = (window.scrollY - vh * 0.55) / (vh * 0.45);
        layer.style.opacity = String(Math.min(1, Math.max(0, t)));
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const pct = (v: number, span: number) => `${(v / span) * 100}%`;

  return (
    <div ref={layerRef} className="qx-wm" aria-hidden style={{ opacity: 0 }}>
      <div className="qx-wm-stage">
        {/* 1 — the land. One node; the 3065 dots are inside the image. */}
        <img src="/world-dots.svg" alt="" className="qx-wm-land" draggable={false}
          width={119} height={60} />

        {/* 2 — the field: someone, somewhere, is using this */}
        <svg className="qx-wm-svg" viewBox={VIEW_BOX} preserveAspectRatio="xMidYMid meet">
          {CITIES.map((c, i) => (
            <circle key={c.n + i} className="qx-wm-user" cx={c.x} cy={c.y} r={0.42}
              style={{ animationDelay: `${(i % 17) * 0.55}s` }} />
          ))}

          {/* 3 — the visitor */}
          {pin && (
            <g className="qx-wm-me">
              <line x1={pin.x} y1={pin.y} x2={pin.x} y2={Math.max(1.5, pin.y - 9)} className="qx-wm-beam" />
              <circle cx={pin.x} cy={pin.y} r={3.2} className="qx-wm-bloom" />
              <circle cx={pin.x} cy={pin.y} r={0.75} className="qx-wm-core" />
              <circle cx={pin.x} cy={pin.y} r={0.75} className="qx-wm-ping" />
            </g>
          )}
        </svg>

        {/* the label is HTML, not SVG: real fonts, real text rendering */}
        {pin && (
          <div className="qx-wm-tag" style={{ left: pct(pin.x, VIEW_W), top: pct(pin.y - 10.5, VIEW_H) }}>
            <span className="qx-wm-tag-title">We are here</span>
            {(pin.city || pin.country) && (
              <span className="qx-wm-tag-place">
                {[pin.city, countryName(pin.country)].filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        )}
      </div>

      <style>{`
        .qx-wm {
          position: absolute; inset: 0;
          display: grid; place-items: center;
          pointer-events: none;
          transition: opacity .5s var(--ease-out, ease-out);
          will-change: opacity;
        }
        /* One box, one aspect ratio, one coordinate space: the image, the dots and
           the label all measure themselves against the same 119x60 frame, so a
           city cannot drift away from the landmass it sits on.

           The third term in the min() is what keeps the whole map on screen. Sizing
           on width alone let a tall viewport push the map past the top and bottom
           edges. Deriving a width cap from the viewport HEIGHT instead
           (${VIEW_W}/${VIEW_H} ≈ 1.98, so 138vh of width ≈ 70vh of height) bounds
           the map vertically without ever clamping the aspect-ratio — which matters
           because a clamped ratio would letterbox the image inside a wider box while
           the HTML label kept measuring against the box, and the label would drift
           off its pin. */
        .qx-wm-stage {
          position: relative;
          width: min(1240px, 84vw, 138vh);
          aspect-ratio: ${VIEW_W} / ${VIEW_H};
        }
        .qx-wm-land {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          object-fit: contain;
          opacity: .85;
          user-select: none;
        }
        .qx-wm-svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }

        /* ── the field ──
           Scale, not the SVG r attribute: r only became animatable as a CSS
           property in Safari 17.4, and this project ships to safari >= 16.4. */
        .qx-wm-user {
          fill: #38bdf8;
          opacity: .22;
          transform-origin: center;
          transform-box: fill-box;
          animation: qx-wm-live 6.5s ease-in-out infinite;
        }
        @keyframes qx-wm-live {
          0%, 88%, 100% { opacity: .2; transform: scale(1); }
          92%           { opacity: 1;  transform: scale(1.5); }
        }

        /* ── the visitor ── */
        .qx-wm-beam {
          stroke: #7dd3fc;
          stroke-width: .28;
          opacity: .5;
          filter: drop-shadow(0 0 1.2px #38bdf8);
        }
        .qx-wm-bloom {
          fill: #38bdf8;
          opacity: .16;
          filter: blur(1.4px);
          animation: qx-wm-breathe 3.4s ease-in-out infinite;
        }
        @keyframes qx-wm-breathe {
          0%, 100% { opacity: .12; }
          50%      { opacity: .3; }
        }
        .qx-wm-core {
          fill: #e0f2fe;
          filter: drop-shadow(0 0 2px #38bdf8) drop-shadow(0 0 5px #0ea5e9);
        }
        .qx-wm-ping {
          fill: none;
          stroke: #7dd3fc;
          stroke-width: .3;
          transform-origin: center;
          transform-box: fill-box;
          animation: qx-wm-ping 2.6s cubic-bezier(0, .55, .45, 1) infinite;
        }
        @keyframes qx-wm-ping {
          0%        { transform: scale(1);   opacity: .9; }
          70%, 100% { transform: scale(5.5); opacity: 0; }
        }

        /* ── the label ── */
        .qx-wm-tag {
          position: absolute;
          transform: translate(-50%, -100%);
          display: flex; flex-direction: column; align-items: center; gap: 1px;
          padding: 7px 13px;
          border-radius: 10px;
          background: rgba(10, 18, 38, .92);
          border: 1px solid rgba(125, 211, 252, .3);
          box-shadow: 0 8px 26px rgba(0, 0, 0, .55), 0 0 22px rgba(56, 189, 248, .18);
          white-space: nowrap;
          animation: qx-wm-tag-in .7s cubic-bezier(.22, 1, .36, 1) backwards;
        }
        @keyframes qx-wm-tag-in {
          from { opacity: 0; transform: translate(-50%, calc(-100% + 8px)); }
        }
        .qx-wm-tag-title {
          font-size: 12.5px; font-weight: 600; letter-spacing: .01em;
          color: #f1f5f9;
        }
        .qx-wm-tag-place {
          font-family: "Space Mono", ui-monospace, monospace;
          font-size: 10px; letter-spacing: .06em; text-transform: uppercase;
          color: #7dd3fc;
        }

        @media (max-width: 640px) {
          .qx-wm-tag { padding: 5px 9px; border-radius: 8px; }
          .qx-wm-tag-title { font-size: 11px; }
          .qx-wm-tag-place { font-size: 9px; }
        }

        /* Motion is the whole point of the field, but it is decoration, not
           information — the map and the pin stay, the pulsing stops. */
        @media (prefers-reduced-motion: reduce) {
          .qx-wm-user, .qx-wm-bloom, .qx-wm-tag { animation: none; }
          .qx-wm-ping { display: none; }
          .qx-wm-user { opacity: .3; }
          .qx-wm { transition: none; }
        }
      `}</style>
    </div>
  );
}
