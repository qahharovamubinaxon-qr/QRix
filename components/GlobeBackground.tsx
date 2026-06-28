"use client";

import { useEffect, useRef } from "react";
import type { COBEOptions, Marker } from "cobe";

/* ============================================================
   QRix — интерактив 3D глобус фон (cobe + космос юлдузлар).
   - Нуқтали ёнувчи дунё харитаси: маркерлар = бутун дунё
     фойдаланувчилари.
   - Секин ўзи айланади; курсорга реакция (parallax).
   - Бўш жойда босиб тортсангиз — ғалтакдек айланади.
   - Бўш жойни бир марта боссангиз — ўша томонга яқинлашади,
     сўнг ўз ҳолига қайтади.
   - Тема: кундузги (.light) → пурпле/бинафша,
           тунги (dark)      → кўк-яшил.
   - Атрофида юлдузлар (космос эффект).
   - UI (тугма/линк/инпут) билан аралашмайди — сайт ишлайверади.
   ============================================================ */

// Бутун дунё бўйлаб шаҳарлар (фойдаланувчилар)
const CITIES: [number, number][] = [
  [40.71, -74.0],   // New York
  [34.05, -118.24], // Los Angeles
  [41.88, -87.63],  // Chicago
  [19.43, -99.13],  // Mexico City
  [-23.55, -46.63], // São Paulo
  [-34.6, -58.38],  // Buenos Aires
  [4.71, -74.07],   // Bogotá
  [51.51, -0.13],   // London
  [48.85, 2.35],    // Paris
  [52.52, 13.4],    // Berlin
  [40.42, -3.7],    // Madrid
  [41.0, 28.98],    // Istanbul
  [55.75, 37.62],   // Moscow
  [59.33, 18.07],   // Stockholm
  [52.37, 4.9],     // Amsterdam
  [41.39, 2.17],    // Barcelona
  [30.04, 31.24],   // Cairo
  [6.52, 3.38],     // Lagos
  [-1.29, 36.82],   // Nairobi
  [-26.2, 28.04],   // Johannesburg
  [25.2, 55.27],    // Dubai
  [24.71, 46.68],   // Riyadh
  [28.61, 77.21],   // Delhi
  [19.08, 72.88],   // Mumbai
  [41.31, 69.24],   // Tashkent
  [39.91, 116.4],   // Beijing
  [31.23, 121.47],  // Shanghai
  [22.32, 114.17],  // Hong Kong
  [37.57, 126.98],  // Seoul
  [35.68, 139.69],  // Tokyo
  [1.35, 103.82],   // Singapore
  [13.76, 100.5],   // Bangkok
  [-6.21, 106.85],  // Jakarta
  [14.6, 120.98],   // Manila
  [-33.87, 151.21], // Sydney
  [-37.81, 144.96], // Melbourne
  [-36.85, 174.76], // Auckland
  [43.65, -79.38],  // Toronto
  [49.28, -123.12], // Vancouver
  [37.77, -122.42], // San Francisco
];

type RenderState = { phi?: number; theta?: number; scale?: number; width?: number; height?: number };
type COBEOptionsExt = Omit<COBEOptions, "width" | "height"> & {
  width: number; height: number;
  onRender?: (state: RenderState) => void;
};

export default function GlobeBackground({ opacity = 0.85 }: { opacity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const starCanvas = starRef.current;
    if (!canvas || !starCanvas) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let disposed = false;
    let cleanup = () => {};

    (async () => {
      const createGlobe = (await import("cobe")).default;
      if (disposed) return;

      const isLight = () => document.documentElement.classList.contains("light");

      // тема ранглари (cobe [r,g,b] 0..1) — ёрқин неон
      const theme = () =>
        isLight()
          ? {
              base: [0.42, 0.22, 0.62] as [number, number, number],
              marker: [0.9, 0.5, 1] as [number, number, number],
              glow: [0.7, 0.45, 1] as [number, number, number],
              arc: [0.8, 0.5, 1] as [number, number, number],
              dark: 0.85,
            }
          : {
              base: [0.1, 0.42, 0.5] as [number, number, number],
              marker: [0.25, 1, 0.78] as [number, number, number],
              glow: [0.2, 0.95, 1] as [number, number, number],
              arc: [0.3, 1, 0.85] as [number, number, number],
              dark: 1,
            };

      // ===== Глобус ўлчами ва жойлашуви =====
      const sizeOf = () => {
        const vw = window.innerWidth, vh = window.innerHeight;
        return Math.min(Math.max(vw, vh) * 0.95, 1100);
      };
      let size = sizeOf();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      // ===== Айланиш/зум ҳолати =====
      let phi = 0;
      let theta = 0.18;
      let autoSpeed = reduce ? 0 : 0.0024;
      let scaleCur = 1, scaleTarget = 1;
      let pointerX = 0, pointerY = 0;        // -1..1 (parallax)
      let dragging = false, lastX = 0, lastY = 0, dragDX = 0;
      let focusPhi = 0, focusTheta = 0;       // босилганда силжиш
      let focusPhiTarget = 0, focusThetaTarget = 0;

      const markers: Marker[] = CITIES.map((loc, i) => ({
        location: loc,
        size: 0.04 + (i % 4 === 0 ? 0.06 : 0.025),
      }));

      // шаҳарлар орасида уланиш чизиқлари (дунё тармоғи ҳисси)
      const arcPairs: [number, number][] = [
        [0, 7], [7, 24], [24, 25], [25, 29], [29, 34],
        [0, 4], [3, 16], [20, 28], [12, 22], [37, 0],
        [8, 26], [30, 34], [4, 32], [10, 20], [2, 38],
      ];
      const buildArcs = (col: [number, number, number]) =>
        arcPairs
          .filter(([a, b]) => a < CITIES.length && b < CITIES.length)
          .map(([a, b]) => ({ from: CITIES[a], to: CITIES[b], color: col }));

      let globe: { update: (s: Partial<COBEOptions>) => void; destroy: () => void } | null = null;

      const makeOpts = (): COBEOptionsExt => {
        const tc = theme();
        return {
          devicePixelRatio: dpr,
          width: size * dpr,
          height: size * dpr,
          phi: 0,
          theta: theta,
          dark: tc.dark,
          diffuse: 1.1,
          mapSamples: 18000,
          mapBrightness: 9,
          baseColor: tc.base,
          markerColor: tc.marker,
          glowColor: tc.glow,
          markers,
          arcs: buildArcs(tc.arc),
          arcColor: tc.arc,
          arcWidth: 0.6,
          arcHeight: 0.4,
          scale: 1,
          opacity: 1,
          onRender: (state: RenderState) => {
            if (!dragging && !reduce) phi += autoSpeed;
            // босиш фокуси ва зум — юмшоқ қайтиш
            focusPhi += (focusPhiTarget - focusPhi) * 0.07;
            focusTheta += (focusThetaTarget - focusTheta) * 0.07;
            scaleCur += (scaleTarget - scaleCur) * 0.08;

            state.phi = phi + focusPhi + pointerX * 0.35;
            state.theta = Math.max(-0.6, Math.min(0.6, theta + focusTheta + pointerY * 0.3));
            state.scale = scaleCur;
            state.width = size * dpr;
            state.height = size * dpr;
          },
        };
      };

      const build = () => {
        globe?.destroy();
        canvas.style.width = `${size}px`;
        canvas.style.height = `${size}px`;
        globe = createGlobe(canvas, makeOpts() as unknown as COBEOptions);
      };
      build();

      // ===== Юлдузлар (космос фон) =====
      const sctx = starCanvas.getContext("2d")!;
      type Star = { x: number; y: number; r: number; tw: number; sp: number };
      let stars: Star[] = [];
      const seedStars = () => {
        const W = window.innerWidth, Hh = window.innerHeight;
        starCanvas.width = W * dpr;
        starCanvas.height = Hh * dpr;
        starCanvas.style.width = `${W}px`;
        starCanvas.style.height = `${Hh}px`;
        sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const n = Math.round((W * Hh) / 7000);
        stars = Array.from({ length: n }, () => ({
          x: Math.random() * W, y: Math.random() * Hh,
          r: Math.random() * 1.3 + 0.2,
          tw: Math.random() * Math.PI * 2,
          sp: 0.6 + Math.random() * 1.6,
        }));
      };
      seedStars();

      let raf = 0;
      let starT = 0;
      const drawStars = () => {
        if (disposed) return;
        const W = window.innerWidth, Hh = window.innerHeight;
        sctx.clearRect(0, 0, W, Hh);
        starT += 0.016;
        const light = isLight();
        for (const s of stars) {
          const a = light
            ? 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(starT * s.sp + s.tw))
            : 0.35 + 0.5 * (0.5 + 0.5 * Math.sin(starT * s.sp + s.tw));
          sctx.beginPath();
          sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          sctx.fillStyle = light ? `rgba(124,58,237,${a})` : `rgba(180,235,255,${a})`;
          sctx.fill();
        }
        raf = requestAnimationFrame(drawStars);
      };
      if (!reduce) drawStars();
      else { // битта статик кадр
        const W = window.innerWidth, Hh = window.innerHeight;
        for (const s of stars) {
          sctx.beginPath(); sctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
          sctx.fillStyle = isLight() ? "rgba(124,58,237,.4)" : "rgba(180,235,255,.5)";
          sctx.fill();
        }
      }

      // ===== Интерактив (UI билан аралашмайди) =====
      const isUI = (t: EventTarget | null) =>
        t instanceof Element &&
        !!t.closest('a,button,input,textarea,select,label,[role="button"],[contenteditable]');

      const onPointerMove = (e: PointerEvent) => {
        // parallax — доим (UI устида ҳам зарарсиз)
        pointerX = (e.clientX / window.innerWidth - 0.5) * 2;
        pointerY = (e.clientY / window.innerHeight - 0.5) * 2;
        if (dragging) {
          const dx = e.clientX - lastX;
          const dy = e.clientY - lastY;
          phi += dx * 0.005;
          theta = Math.max(-0.5, Math.min(0.5, theta + dy * 0.004));
          dragDX += Math.abs(dx) + Math.abs(dy);
          lastX = e.clientX; lastY = e.clientY;
        }
      };
      const onPointerDown = (e: PointerEvent) => {
        if (isUI(e.target)) return; // тугма/линк — глобусга тегмаймиз
        dragging = true; dragDX = 0;
        lastX = e.clientX; lastY = e.clientY;
        autoSpeed = reduce ? 0 : 0.0006;
      };
      const onPointerUp = (e: PointerEvent) => {
        if (!dragging) return;
        dragging = false;
        autoSpeed = reduce ? 0 : 0.0024;
        // деярли силжимаган бўлса — "клик": ўша томонга яқинлашиб қайтади
        if (dragDX < 6 && !isUI(e.target)) {
          const nx = (e.clientX / window.innerWidth - 0.5) * 2;
          const ny = (e.clientY / window.innerHeight - 0.5) * 2;
          focusPhiTarget = nx * 0.6;
          focusThetaTarget = -ny * 0.4;
          scaleTarget = 1.7;
          window.setTimeout(() => {
            focusPhiTarget = 0; focusThetaTarget = 0; scaleTarget = 1;
          }, 1100);
        }
      };
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("pointerup", onPointerUp, { passive: true });

      // ===== Resize + тема =====
      const onResize = () => { size = sizeOf(); seedStars(); build(); };
      window.addEventListener("resize", onResize);

      const themeObs = new MutationObserver(() => { build(); }); // ранглар янги темада
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

      cleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointerup", onPointerUp);
        window.removeEventListener("resize", onResize);
        themeObs.disconnect();
        globe?.destroy();
      };
    })();

    return () => { disposed = true; cleanup(); };
  }, []);

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* юлдузлар (космос) */}
      <canvas ref={starRef} className="absolute inset-0 w-full h-full" />
      {/* глобус — марказда */}
      <div className="absolute inset-0 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ opacity, maxWidth: "100%", aspectRatio: "1 / 1" }}
        />
      </div>
    </div>
  );
}
