"use client";

import { useEffect, useRef, useState } from "react";

/* ============================================================
   QRix — текис (flat) неон дунё харитаси фон.
   - dotted-map нуқталари: бутун дунё нуқталар билан чизилади.
   - Курсор реакцияси: курсор атрофидаги нуқталар ёрқин ёнади
     (radial mask курсорни кузатади) + енгил parallax.
   - Шаҳарлар орасида оқувчи неон уланиш чизиқлари (arcs).
   - Тема: кундузги (.light) → пурпле/бинафша, тунги → кўк-яшил.
   ============================================================ */

type Pt = { x: number; y: number };

const CITIES: [number, number][] = [
  [40.71, -74.0], [34.05, -118.24], [19.43, -99.13], [-23.55, -46.63],
  [51.51, -0.13], [48.85, 2.35], [55.75, 37.62], [41.0, 28.98],
  [30.04, 31.24], [6.52, 3.38], [-26.2, 28.04], [25.2, 55.27],
  [28.61, 77.21], [41.31, 69.24], [39.91, 116.4], [35.68, 139.69],
  [1.35, 103.82], [-6.21, 106.85], [-33.87, 151.21], [37.77, -122.42],
];

export default function WorldMapBackground() {
  const [dots, setDots] = useState<Pt[]>([]);
  const [arcs, setArcs] = useState<string[]>([]);
  const [vb, setVb] = useState("0 0 119 60");
  const wrapRef = useRef<HTMLDivElement>(null);

  // нуқталарни бир марта ҳисоблаш
  useEffect(() => {
    let dead = false;
    (async () => {
      const DottedMap = (await import("dotted-map")).default;
      const map = new DottedMap({ height: 60, grid: "diagonal" });
      if (dead) return;
      const pts = map.getPoints().map((p) => ({ x: p.x, y: p.y }));
      const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
      const minX = Math.min(...xs), maxX = Math.max(...xs);
      const minY = Math.min(...ys), maxY = Math.max(...ys);
      setVb(`${minX - 1} ${minY - 1} ${maxX - minX + 2} ${maxY - minY + 2}`);
      setDots(pts);

      // шаҳар координаталари → arcs
      const pins = CITIES.map(([lat, lng]) => map.getPin({ lat, lng })).filter(Boolean) as Pt[];
      const pairs: [number, number][] = [
        [0, 4], [4, 6], [6, 14], [14, 15], [3, 0], [9, 5],
        [11, 12], [12, 14], [13, 14], [19, 0], [16, 18], [7, 8],
      ];
      const paths: string[] = [];
      for (const [a, b] of pairs) {
        if (!pins[a] || !pins[b]) continue;
        const p1 = pins[a], p2 = pins[b];
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2 - Math.hypot(p2.x - p1.x, p2.y - p1.y) * 0.32;
        paths.push(`M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}`);
      }
      setArcs(paths);
    })();
    return () => { dead = true; };
  }, []);

  // курсорни кузатиш (mask + parallax)
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const onMove = (e: PointerEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      wrap.style.setProperty("--mx", `${x}%`);
      wrap.style.setProperty("--my", `${y}%`);
      const px = (e.clientX / window.innerWidth - 0.5) * 2;
      const py = (e.clientY / window.innerHeight - 0.5) * 2;
      wrap.style.setProperty("--px", `${px * 10}px`);
      wrap.style.setProperty("--py", `${py * 6}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="qx-wm pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ ["--mx" as string]: "50%", ["--my" as string]: "40%" }}
    >
      {/* база нуқталар (хира) */}
      <svg className="qx-wm-svg qx-wm-base" viewBox={vb} preserveAspectRatio="xMidYMid slice">
        {dots.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={0.42} />
        ))}
      </svg>

      {/* ёрқин нуқталар — курсор атрофида очилади (mask) */}
      <div className="qx-wm-glow">
        <svg className="qx-wm-svg qx-wm-bright" viewBox={vb} preserveAspectRatio="xMidYMid slice">
          {dots.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={0.55} />
          ))}
        </svg>
      </div>

      {/* уланиш чизиқлари */}
      <svg className="qx-wm-svg qx-wm-arcs" viewBox={vb} preserveAspectRatio="xMidYMid slice">
        {arcs.map((d, i) => (
          <path key={i} d={d} className="qx-wm-arc" style={{ animationDelay: `${i * 0.5}s` }} />
        ))}
      </svg>

      <style>{`
        .qx-wm {
          --wm-dim: rgba(34,211,238,0.16);
          --wm-bright: rgba(90,240,205,0.95);
          --wm-arc: rgba(45,230,200,0.85);
          background:
            radial-gradient(120% 90% at 50% 0%, rgba(34,211,238,.06), transparent 60%),
            transparent;
        }
        html.light .qx-wm {
          --wm-dim: rgba(124,58,237,0.18);
          --wm-bright: rgba(180,110,255,0.95);
          --wm-arc: rgba(150,90,255,0.85);
          background:
            radial-gradient(120% 90% at 50% 0%, rgba(124,58,237,.06), transparent 60%),
            transparent;
        }
        .qx-wm-svg {
          position: absolute; inset: 0;
          width: 100%; height: 100%;
          transform: translate(var(--px,0), var(--py,0));
          transition: transform .25s ease-out;
        }
        .qx-wm-base circle { fill: var(--wm-dim); }
        .qx-wm-bright circle { fill: var(--wm-bright); }
        .qx-wm-glow {
          position: absolute; inset: 0;
          -webkit-mask-image: radial-gradient(circle 220px at var(--mx) var(--my), #000 0%, rgba(0,0,0,.4) 45%, transparent 72%);
                  mask-image: radial-gradient(circle 220px at var(--mx) var(--my), #000 0%, rgba(0,0,0,.4) 45%, transparent 72%);
          filter: drop-shadow(0 0 4px var(--wm-bright));
        }
        .qx-wm-arc {
          fill: none;
          stroke: var(--wm-arc);
          stroke-width: 0.28;
          stroke-linecap: round;
          stroke-dasharray: 6 60;
          filter: drop-shadow(0 0 1.5px var(--wm-arc));
          animation: qxWmFlow 5s linear infinite;
          opacity: .85;
        }
        @keyframes qxWmFlow { to { stroke-dashoffset: -66; } }
        @media (prefers-reduced-motion: reduce) {
          .qx-wm-arc { animation: none; }
          .qx-wm-svg { transition: none; }
        }
      `}</style>
    </div>
  );
}
