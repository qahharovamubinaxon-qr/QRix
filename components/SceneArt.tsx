/* Mission 25 — katana-style scene artwork (pure SVG, zero deps).
   The reference (nixtio/katana) stages full-bleed art behind content:
   a samurai at the hero and a vertical sword through the stats scene.
   These are hand-built vectors tuned to the QRix palette (#ff4d1c ember). */

/** Vertical katana — red-wrapped handle on top, glowing blade running down.
    Sits centered in the stats (ember) scene; parallax handled by MotionLayer. */
export function KatanaSword({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 220 1240" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id="kw-blade" x1="92" y1="0" x2="128" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#f6f8fb" />
          <stop offset="0.45" stopColor="#dfe4ea" />
          <stop offset="0.55" stopColor="#b7bec9" />
          <stop offset="1" stopColor="#8b93a1" />
        </linearGradient>
        <linearGradient id="kw-bladefade" x1="0" y1="330" x2="0" y2="1190" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.85" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="kw-wrap" x1="0" y1="30" x2="0" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#d3301c" />
          <stop offset="1" stopColor="#a01f10" />
        </linearGradient>
        <radialGradient id="kw-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ff4d1c" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff4d1c" stopOpacity="0" />
        </radialGradient>
        <filter id="kw-blur" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <mask id="kw-fade"><rect x="0" y="0" width="220" height="1240" fill="url(#kw-bladefade)" /></mask>
      </defs>

      {/* ember aura behind the blade */}
      <ellipse cx="110" cy="640" rx="105" ry="560" fill="url(#kw-glow)" />

      <g mask="url(#kw-fade)">
        {/* blade glow copy */}
        <path d="M101 332 L119 332 L114 1120 Q110 1168 106 1120 Z"
          fill="#ff6a3a" opacity="0.6" filter="url(#kw-blur)" />
        {/* blade */}
        <path d="M100 332 L120 332 L114.5 1108 Q110 1164 105.5 1108 Z" fill="url(#kw-blade)" />
        {/* hamon temper line */}
        <path d="M110.5 340 C 108 560, 112 800, 109.5 1090" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.2" />
        {/* etched QR finder glyph, glowing like the reference's icons */}
        <g opacity="0.9">
          <rect x="102.5" y="565" width="15" height="15" rx="2" stroke="#ff8d64" strokeWidth="2" fill="none" filter="url(#kw-blur)" />
          <rect x="102.5" y="565" width="15" height="15" rx="2" stroke="#fff" strokeWidth="1.6" fill="none" />
          <rect x="107" y="569.5" width="6" height="6" rx="1" fill="#fff" />
        </g>
      </g>

      {/* habaki collar */}
      <rect x="98" y="300" width="24" height="34" rx="3" fill="#7c8290" />
      <rect x="98" y="300" width="10" height="34" rx="3" fill="#9aa1af" />
      {/* tsuba guard */}
      <ellipse cx="110" cy="296" rx="58" ry="15" fill="#191921" />
      <ellipse cx="110" cy="293" rx="58" ry="14" fill="#2a2a36" />
      <ellipse cx="110" cy="293" rx="40" ry="9" fill="#1c1c26" />
      {/* handle base */}
      <rect x="94" y="26" width="32" height="266" rx="12" fill="#160f12" />
      {/* red silk crisscross wrap */}
      <g fill="url(#kw-wrap)">
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={i}
            d={`M94 ${44 + i * 28} L126 ${64 + i * 28} L126 ${78 + i * 28} L94 ${58 + i * 28} Z`} />
        ))}
        {Array.from({ length: 9 }).map((_, i) => (
          <path key={`b${i}`}
            d={`M126 ${44 + i * 28} L94 ${64 + i * 28} L94 ${78 + i * 28} L126 ${58 + i * 28} Z`} opacity="0.82" />
        ))}
      </g>
      {/* kashira pommel */}
      <rect x="92" y="12" width="36" height="22" rx="10" fill="#23232e" />
      <rect x="92" y="12" width="36" height="10" rx="5" fill="#31313f" />
    </svg>
  );
}

/** Samurai silhouette — dark armored figure with a glowing visor, staged
    behind the hero headline exactly like the reference's warrior. */
export function SamuraiArt({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 1000 760" fill="none" xmlns="http://www.w3.org/2000/svg"
      className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id="sm-aura" cx="0.5" cy="0.42" r="0.55">
          <stop offset="0" stopColor="#ff4d1c" stopOpacity="0.34" />
          <stop offset="0.55" stopColor="#a41f0c" stopOpacity="0.16" />
          <stop offset="1" stopColor="#a41f0c" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sm-body" x1="0" y1="120" x2="0" y2="760" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#101014" />
          <stop offset="0.72" stopColor="#0b0b10" />
          <stop offset="1" stopColor="#0b0b10" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sm-rim" x1="330" y1="0" x2="680" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ff4d1c" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff7a50" stopOpacity="0.55" />
          <stop offset="1" stopColor="#ff4d1c" stopOpacity="0" />
        </linearGradient>
        <filter id="sm-soft" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <linearGradient id="sm-fadeout" x1="0" y1="430" x2="0" y2="760" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="sm-mask"><rect width="1000" height="760" fill="url(#sm-fadeout)" /></mask>
      </defs>

      {/* ember aura */}
      <ellipse cx="500" cy="330" rx="430" ry="330" fill="url(#sm-aura)" />

      <g mask="url(#sm-mask)">
        {/* kuwagata horns — crescent blades sweeping outward */}
        <path d="M452 152 C 396 140, 320 112, 268 34 C 322 62, 388 100, 458 118 Z" fill="#0c0c11" />
        <path d="M548 152 C 604 140, 680 112, 732 34 C 678 62, 612 100, 542 118 Z" fill="#0c0c11" />
        <path d="M452 152 C 396 140, 320 112, 268 34" stroke="url(#sm-rim)" strokeWidth="2.2" opacity="0.85" />
        <path d="M548 152 C 604 140, 680 112, 732 34" stroke="url(#sm-rim)" strokeWidth="2.2" opacity="0.85" />

        {/* kabuto dome */}
        <path d="M394 214 C 394 138, 440 96, 500 96 C 560 96, 606 138, 606 214 L 598 238 L 402 238 Z" fill="#0e0e13" />
        {/* maedate crest */}
        <path d="M500 78 L 516 128 L 500 118 L 484 128 Z" fill="#1a1a22" stroke="#ff7a50" strokeOpacity="0.5" strokeWidth="1.5" />
        {/* helmet rim highlight */}
        <path d="M398 212 C 400 142, 444 100, 500 100" stroke="url(#sm-rim)" strokeWidth="2.5" opacity="0.9" />

        {/* neck guard (shikoro), layered */}
        <path d="M380 238 C 380 214, 620 214, 620 238 L 636 276 C 560 258, 440 258, 364 276 Z" fill="#0c0c11" />
        <path d="M364 276 C 440 258, 560 258, 636 276 L 650 314 C 556 292, 444 292, 350 314 Z" fill="#0a0a0f" />

        {/* face plate + glowing visor */}
        <path d="M430 238 L 570 238 L 556 330 C 528 352, 472 352, 444 330 Z" fill="#08080c" />
        <g filter="url(#sm-soft)">
          <rect x="452" y="266" width="38" height="9" rx="4.5" fill="#ff4d1c" opacity="0.95" />
          <rect x="510" y="266" width="38" height="9" rx="4.5" fill="#ff4d1c" opacity="0.95" />
        </g>
        <rect x="452" y="266" width="38" height="9" rx="4.5" fill="#ffb499" />
        <rect x="510" y="266" width="38" height="9" rx="4.5" fill="#ffb499" />

        {/* shoulders: broad sode plates */}
        <path d="M228 470 C 244 380, 330 322, 414 316 L 586 316 C 670 322, 756 380, 772 470 L 748 520 C 690 424, 610 384, 500 384 C 390 384, 310 424, 252 520 Z" fill="url(#sm-body)" />
        <path d="M252 448 C 300 380, 380 344, 460 340" stroke="url(#sm-rim)" strokeWidth="2" opacity="0.55" />
        <path d="M748 448 C 700 380, 620 344, 540 340" stroke="url(#sm-rim)" strokeWidth="2" opacity="0.55" />
        {/* layered sode segments */}
        <path d="M236 470 C 262 414, 320 372, 392 356 L 380 402 C 322 418, 278 448, 254 502 Z" fill="#0d0d12" />
        <path d="M764 470 C 738 414, 680 372, 608 356 L 620 402 C 678 418, 722 448, 746 502 Z" fill="#0d0d12" />

        {/* torso (do) with lacing hint */}
        <path d="M368 392 L 632 392 L 618 630 C 548 668, 452 668, 382 630 Z" fill="url(#sm-body)" />
        <path d="M394 452 L 606 452 M388 512 L 612 512 M384 572 L 616 572" stroke="#1d1d26" strokeWidth="7" />
        <path d="M500 392 L 500 648" stroke="#16161e" strokeWidth="9" />
        {/* chest emblem: QR finder mark, ember-lit */}
        <g opacity="0.92">
          <rect x="479" y="470" width="42" height="42" rx="6" stroke="#ff4d1c" strokeWidth="3" fill="none" filter="url(#sm-soft)" />
          <rect x="479" y="470" width="42" height="42" rx="6" stroke="#ff8d64" strokeWidth="2.4" fill="none" />
          <rect x="491" y="482" width="18" height="18" rx="3" fill="#ff8d64" />
        </g>
      </g>
    </svg>
  );
}


/** Night scene of a traditional Japanese pagoda village — the statement
    section's full-bleed backdrop (katana-style ending art, QRix palette). */
export function PagodaNight({ className }: { className?: string }) {
  const tiers = [
    { y: 566, w: 152, bw: 96 },
    { y: 478, w: 134, bw: 84 },
    { y: 394, w: 116, bw: 74 },
    { y: 314, w: 98, bw: 62 },
    { y: 240, w: 82, bw: 52 },
  ];
  const cx = 1235;
  const stars = [
    [90, 80, 1.6], [210, 150, 1.1], [330, 60, 1.4], [455, 120, 1], [560, 55, 1.3],
    [660, 170, 1], [755, 90, 1.5], [905, 140, 1.1], [1010, 60, 1.4], [1120, 40, 1],
    [1330, 90, 1.3], [1435, 170, 1.1], [1520, 60, 1.5], [170, 250, 1], [1490, 260, 1.2],
    [40, 170, 1.2], [860, 40, 1], [610, 250, 0.9],
  ] as const;
  return (
    <svg viewBox="0 0 1600 700" preserveAspectRatio="xMidYMax slice" fill="none"
      xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden focusable="false">
      <defs>
        <linearGradient id="pn-sky" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#030309" />
          <stop offset="0.55" stopColor="#07070f" />
          <stop offset="0.85" stopColor="#100810" />
          <stop offset="1" stopColor="#150a0c" />
        </linearGradient>
        <radialGradient id="pn-moonglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#f4eede" stopOpacity="0.16" />
          <stop offset="1" stopColor="#f4eede" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="pn-rim" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ff4d1c" stopOpacity="0" />
          <stop offset="0.5" stopColor="#ff7a50" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff4d1c" stopOpacity="0" />
        </linearGradient>
        <filter id="pn-soft" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
        <filter id="pn-soft2" x="-120%" y="-120%" width="340%" height="340%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>

      {/* sky */}
      <rect width="1600" height="700" fill="url(#pn-sky)" />
      {stars.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#dfe6f2" opacity={0.16 + (i % 4) * 0.09} />
      ))}

      {/* moon */}
      <circle cx="1132" cy="132" r="118" fill="url(#pn-moonglow)" />
      <circle cx="1132" cy="132" r="46" fill="#efe8d8" opacity="0.92" />
      <circle cx="1119" cy="120" r="8" fill="#d9d2c2" opacity="0.5" />
      <circle cx="1146" cy="146" r="5" fill="#d9d2c2" opacity="0.4" />

      {/* Mount Fuji, far */}
      <path d="M180 700 L520 300 L575 300 L620 348 L668 320 L1020 700 Z" fill="#060610" />
      <path d="M520 300 L575 300 L620 348 L586 372 L556 350 L528 368 Z" fill="#141420" opacity="0.9" />

      {/* distant ridge */}
      <path d="M0 700 L0 520 Q200 470 420 512 Q640 552 830 520 Q1080 478 1290 516 Q1450 544 1600 522 L1600 700 Z" fill="#04040a" />

      {/* torii gate, left */}
      <g>
        <path d="M242 668 L252 520 L268 520 L276 668 Z" fill="#170708" />
        <path d="M356 668 L348 520 L364 520 L374 668 Z" fill="#170708" />
        <path d="M222 520 Q308 498 394 520 L394 504 Q308 480 222 504 Z" fill="#1c0809" />
        <rect x="240" y="546" width="136" height="12" rx="3" fill="#170708" />
        <path d="M222 512 Q308 490 394 512" stroke="url(#pn-rim)" strokeWidth="2" opacity="0.7" />
      </g>

      {/* village houses, left of pagoda */}
      {([[470, 636, 96, 44], [600, 646, 120, 52], [780, 640, 100, 46], [935, 648, 118, 50]] as const).map(([hx, hy, hw, hh], i) => (
        <g key={i}>
          <path d={`M${hx - hw / 2 - 14} ${hy - hh} Q${hx} ${hy - hh - 34} ${hx + hw / 2 + 14} ${hy - hh} L${hx + hw / 2} ${hy - hh + 10} L${hx - hw / 2} ${hy - hh + 10} Z`} fill="#0a0a12" />
          <rect x={hx - hw / 2} y={hy - hh + 10} width={hw} height={hh - 10} fill="#07070d" />
          <rect x={hx - hw / 4} y={hy - hh / 2} width="13" height="15" rx="2" fill="#ff9a5c" opacity="0.9" filter="url(#pn-soft)" />
          <rect x={hx - hw / 4} y={hy - hh / 2} width="13" height="15" rx="2" fill="#ffb98a" opacity="0.95" />
          {i % 2 === 0 && <>
            <rect x={hx + hw / 6} y={hy - hh / 2} width="12" height="14" rx="2" fill="#ff9a5c" opacity="0.75" filter="url(#pn-soft)" />
            <rect x={hx + hw / 6} y={hy - hh / 2} width="12" height="14" rx="2" fill="#ffb280" opacity="0.85" />
          </>}
        </g>
      ))}

      {/* hanging lanterns */}
      {([[540, 596], [875, 606], [1055, 616]] as const).map(([lx, ly], i) => (
        <g key={i}>
          <line x1={lx} y1={ly - 26} x2={lx} y2={ly - 10} stroke="#1a0d08" strokeWidth="2" />
          <circle cx={lx} cy={ly} r="12" fill="#ff6a3a" opacity="0.55" filter="url(#pn-soft2)" />
          <circle cx={lx} cy={ly} r="6.5" fill="#ffb280" />
        </g>
      ))}

      {/* five-story pagoda */}
      <g>
        {/* sorin spire */}
        <rect x={cx - 2.5} y="150" width="5" height="62" fill="#0d0d15" />
        {[160, 172, 184, 196].map((sy) => <circle key={sy} cx={cx} cy={sy} r="7" fill="none" stroke="#141420" strokeWidth="3" />)}
        <circle cx={cx} cy="146" r="5" fill="#1c1c2a" />
        <path d="M1228 152 L1242 152" stroke="url(#pn-rim)" strokeWidth="2" opacity="0.8" />
        {tiers.map(({ y, w, bw }, i) => (
          <g key={i}>
            {/* body between this roof and the one above */}
            <rect x={cx - bw / 2} y={y - 62} width={bw} height="64" fill="#08080f" />
            {/* lit windows */}
            <rect x={cx - 15} y={y - 46} width="12" height="16" rx="2" fill="#ff9a5c" opacity="0.85" filter="url(#pn-soft)" />
            <rect x={cx - 15} y={y - 46} width="12" height="16" rx="2" fill="#ffb98a" opacity="0.9" />
            {i < 3 && <rect x={cx + 6} y={y - 44} width="10" height="14" rx="2" fill="#ff9a5c" opacity="0.6" />}
            {/* curved roof with upturned eaves */}
            <path d={`M${cx - w} ${y} Q${cx} ${y - 30} ${cx + w} ${y} L${cx + w - 5} ${y + 6} Q${cx + w - 26} ${y + 20} ${cx + w - 42} ${y + 16} Q${cx} ${y - 4} ${cx - w + 42} ${y + 16} Q${cx - w + 26} ${y + 20} ${cx - w + 5} ${y + 6} Z`} fill="#0b0b13" />
            <path d={`M${cx - w} ${y} Q${cx} ${y - 30} ${cx + w} ${y}`} stroke="url(#pn-rim)" strokeWidth="1.8" opacity={0.75 - i * 0.09} />
          </g>
        ))}
        {/* base */}
        <rect x={cx - 108} y="620" width="216" height="52" fill="#060609" />
        <rect x={cx - 122} y="664" width="244" height="12" fill="#050508" />
        {/* entrance glow */}
        <rect x={cx - 17} y="630" width="34" height="42" rx="4" fill="#ff8a54" opacity="0.5" filter="url(#pn-soft2)" />
        <rect x={cx - 13} y="636" width="26" height="36" rx="3" fill="#ffab74" opacity="0.9" />
      </g>

      {/* ground */}
      <path d="M0 700 L0 652 Q300 632 620 648 Q980 664 1240 650 Q1440 642 1600 652 L1600 700 Z" fill="#030307" />

      {/* mist bands */}
      <ellipse cx="500" cy="654" rx="480" ry="30" fill="#0c0c16" opacity="0.5" filter="url(#pn-soft2)" />
      <ellipse cx="1200" cy="668" rx="420" ry="26" fill="#100a10" opacity="0.45" filter="url(#pn-soft2)" />

      {/* warm horizon breath behind the village */}
      <ellipse cx="820" cy="700" rx="700" ry="150" fill="#ff4d1c" opacity="0.05" filter="url(#pn-soft2)" />
    </svg>
  );
}
