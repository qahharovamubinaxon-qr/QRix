// QRix panda icon generator — pdf24-sheep-system analysis applied:
// one lovable mascot, themed per function via (a) a category accessory on the
// panda and (b) a colored function badge with a white glyph.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const ROOT = "D:/Projects/QRix/.claude/worktrees/relaxed-turing-bbc58e";
const OUT = path.join(ROOT, "panda-icons");
mkdirSync(path.join(OUT, "svg"), { recursive: true });
mkdirSync(path.join(OUT, "png"), { recursive: true });

const INK = "#1c1a1a";

/* ── base panda head (240×240) ── */
function pandaBase() {
  return `
  <!-- ears -->
  <circle cx="62" cy="66" r="31" fill="${INK}"/>
  <circle cx="178" cy="66" r="31" fill="${INK}"/>
  <circle cx="66" cy="70" r="14" fill="#4a4644"/>
  <circle cx="174" cy="70" r="14" fill="#4a4644"/>
  <!-- head -->
  <circle cx="120" cy="130" r="80" fill="#ffffff" stroke="${INK}" stroke-width="7"/>
  <!-- eye patches -->
  <ellipse cx="87" cy="122" rx="23" ry="29" fill="${INK}" transform="rotate(-16 87 122)"/>
  <ellipse cx="153" cy="122" rx="23" ry="29" fill="${INK}" transform="rotate(16 153 122)"/>
  <!-- eyes -->
  <circle cx="91" cy="118" r="9.5" fill="#fff"/>
  <circle cx="149" cy="118" r="9.5" fill="#fff"/>
  <circle cx="93" cy="119" r="4.6" fill="${INK}"/>
  <circle cx="147" cy="119" r="4.6" fill="${INK}"/>
  <circle cx="94.6" cy="117" r="1.7" fill="#fff"/>
  <circle cx="148.6" cy="117" r="1.7" fill="#fff"/>
  <!-- cheeks -->
  <circle cx="66" cy="152" r="9" fill="#ffb9c4" opacity="0.85"/>
  <circle cx="174" cy="152" r="9" fill="#ffb9c4" opacity="0.85"/>
  <!-- nose + mouth -->
  <path d="M112 148 Q120 142 128 148 Q124 158 120 158 Q116 158 112 148 Z" fill="${INK}"/>
  <path d="M120 158 L120 165 M120 165 Q112 173 105 167 M120 165 Q128 173 135 167"
    stroke="${INK}" stroke-width="4.6" stroke-linecap="round" fill="none"/>`;
}

/* ── category accessories ── */
const ACC = {
  qr: (c) => `
    <path d="M48 92 Q120 62 192 92 L188 106 Q120 78 52 106 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="108" y="80" width="9" height="9" fill="#fff"/><rect x="122" y="84" width="7" height="7" fill="#fff"/><rect x="96" y="86" width="6" height="6" fill="#fff"/>`,
  pdf: (c) => `
    <g transform="rotate(-9 60 196)">
      <rect x="30" y="168" width="58" height="66" rx="7" fill="${c}" stroke="${INK}" stroke-width="5.5"/>
      <path d="M70 168 L88 186 L70 186 Z" fill="#fff" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M42 196 H74 M42 208 H74 M42 220 H62" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    </g>
    <circle cx="88" cy="176" r="12" fill="#ffffff" stroke="${INK}" stroke-width="5"/>`,
  image: (c) => `
    <g transform="rotate(-10 62 52)">
      <ellipse cx="66" cy="52" rx="40" ry="17" fill="${c}" stroke="${INK}" stroke-width="5"/>
      <path d="M66 35 Q70 26 80 28" stroke="${INK}" stroke-width="6" stroke-linecap="round" fill="none"/>
    </g>`,
  ai: (c) => `
    <path d="M120 50 L120 22" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
    <circle cx="120" cy="16" r="10" fill="${c}" stroke="${INK}" stroke-width="5"/>
    <path d="M141 20 l3 -7 3 7 7 3 -7 3 -3 7 -3 -7 -7 -3 Z" fill="${c}"/>
    <path d="M96 12 l2 -5 2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 Z" fill="${c}" opacity="0.85"/>`,
  video: (c) => `
    <path d="M52 76 Q120 40 188 76 L184 92 Q120 60 56 92 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M184 84 L216 76 L214 92 L182 96 Z" fill="${c}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="120" cy="70" r="6" fill="#fff"/>`,
  three: (c) => `
    <g transform="rotate(-8 62 196)">
      <path d="M34 190 L62 176 L90 190 L90 216 L62 230 L34 216 Z" fill="${c}" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M34 190 L62 204 L90 190 M62 204 L62 230" stroke="${INK}" stroke-width="5" stroke-linejoin="round" fill="none"/>
    </g>
    <circle cx="88" cy="178" r="12" fill="#ffffff" stroke="${INK}" stroke-width="5"/>`,
};

/* ── function glyphs (drawn in a 44×44 box centered at 0,0; white strokes) ── */
const S = 'stroke="#fff" stroke-linecap="round" stroke-linejoin="round" fill="none"';
const GLYPH = {
  qrgrid: `<path d="M-16 -16 h12 v12 h-12 Z M4 -16 h12 v12 h-12 Z M-16 4 h12 v12 h-12 Z" ${S}/><rect x="6" y="6" width="9" height="9" fill="#fff"/>`,
  refresh: `<path d="M13 -6 A14 14 0 1 0 15 6" ${S}/><path d="M13 -14 L13 -5 L4 -5" ${S}/>`,
  wifi: `<path d="M-15 -4 Q0 -18 15 -4 M-9 3 Q0 -5 9 3" ${S}/><circle cx="0" cy="12" r="3.6" fill="#fff"/>`,
  card: `<rect x="-17" y="-12" width="34" height="24" rx="4" ${S}/><circle cx="-8" cy="-2" r="4" fill="#fff"/><path d="M2 -4 H12 M2 4 H12 M-14 10 H14" ${S} stroke-width="3.6"/>`,
  stack: `<rect x="-14" y="-16" width="24" height="20" rx="3" ${S}/><path d="M-8 8 H14 M-2 14 H16" ${S}/>`,
  scan: `<path d="M-16 -9 V-16 H-9 M9 -16 H16 V-9 M16 9 V16 H9 M-9 16 H-16 V9" ${S}/><path d="M-12 0 H12" ${S}/>`,
  frame: `<path d="M-16 -9 V-16 H-9 M9 -16 H16 V-9 M16 9 V16 H9 M-9 16 H-16 V9" ${S}/><rect x="-6" y="-6" width="12" height="12" fill="#fff"/>`,
  chart: `<path d="M-14 14 V2 M-4 14 V-8 M6 14 V-2 M16 14 V-14" ${S}/>`,
  merge: `<path d="M-16 -12 Q-2 -12 2 0 M-16 12 Q-2 12 2 0 M2 0 H16" ${S}/><path d="M10 -6 L17 0 L10 6" ${S}/>`,
  compress: `<path d="M0 -17 L0 -5 M-5 -10 L0 -5 L5 -10 M0 17 L0 5 M-5 10 L0 5 L5 10 M-13 0 H13" ${S}/>`,
  docword: `<rect x="-13" y="-16" width="26" height="32" rx="4" ${S}/><path d="M-7 -2 L-3 8 L0 0 L3 8 L7 -2" ${S} stroke-width="3.8"/>`,
  img2doc: `<rect x="-17" y="-12" width="16" height="14" rx="2" ${S}/><circle cx="-13" cy="-8" r="1.8" fill="#fff"/><path d="M-16 0 L-11 -5 L-4 1" ${S} stroke-width="3.6"/><path d="M3 -4 L10 -4 M10 -4 L10 14 M3 14 H10" ${S}/><path d="M-1 5 H7 M4 2 L7 5 L4 8" ${S} stroke-width="3.6"/>`,
  scissors: `<circle cx="-10" cy="-10" r="5" ${S}/><circle cx="-10" cy="10" r="5" ${S}/><path d="M-6 -7 L16 10 M-6 7 L16 -10" ${S}/>`,
  eye: `<path d="M-16 0 Q0 -14 16 0 Q0 14 -16 0 Z" ${S}/><circle cx="0" cy="0" r="4.4" fill="#fff"/>`,
  crop: `<path d="M-10 -16 V10 H16 M-16 -10 H10 V16" ${S}/>`,
  doc2img: `<path d="M-10 -14 H-3 M-3 -14 V4 M-10 4 H-3" ${S}/><rect x="1" y="-2" width="16" height="14" rx="2" ${S}/><circle cx="5" cy="2" r="1.8" fill="#fff"/><path d="M2 9 L7 4 L14 10" ${S} stroke-width="3.6"/>`,
  personcut: `<circle cx="0" cy="-7" r="6" ${S}/><path d="M-11 14 Q-11 2 0 2 Q11 2 11 14" ${S}/><path d="M-17 -14 L-11 -8 M17 -14 L11 -8" ${S} stroke-dasharray="4 4"/>`,
  expand: `<path d="M-6 -6 L-15 -15 M-15 -15 H-7 M-15 -15 V-7 M6 6 L15 15 M15 15 H7 M15 15 V7 M6 -6 L15 -15 M15 -15 H7 M15 -15 V-7 M-6 6 L-15 15 M-15 15 H-7 M-15 15 V7" ${S} stroke-width="3.8"/>`,
  resize: `<rect x="-16" y="-16" width="20" height="20" rx="3" ${S}/><path d="M2 2 L15 15 M15 15 H6 M15 15 V6" ${S}/>`,
  swap: `<path d="M-14 -6 H10 M4 -12 L10 -6 L4 0 M14 8 H-10 M-4 2 L-10 8 L-4 14" ${S}/>`,
  pen: `<path d="M-14 14 L-10 2 L8 -16 L16 -8 L-2 10 Z" ${S}/><path d="M-14 14 L-10 2 L2 4 Z" fill="#fff"/>`,
  drop: `<path d="M0 -15 Q13 2 13 8 A13 13 0 1 1 -13 8 Q-13 2 0 -15 Z" ${S}/>`,
  info: `<circle cx="0" cy="0" r="15" ${S}/><path d="M0 -2 V9" ${S}/><circle cx="0" cy="-8" r="2.6" fill="#fff"/>`,
  star: `<path d="M0 -16 L4.7 -5 L16 -4 L7.5 4 L10 15.5 L0 9.5 L-10 15.5 L-7.5 4 L-16 -4 L-4.7 -5 Z" ${S}/>`,
  sparkle: `<path d="M0 -16 L3.5 -3.5 L16 0 L3.5 3.5 L0 16 L-3.5 3.5 L-16 0 L-3.5 -3.5 Z" fill="#fff"/><path d="M12 -12 l1.6 -4 1.6 4 4 1.6 -4 1.6 -1.6 4 -1.6 -4 -4 -1.6 Z" fill="#fff"/>`,
  bubble: `<path d="M-16 -12 H16 V8 H-4 L-12 15 V8 H-16 Z" ${S}/><path d="M-9 -5 H9 M-9 2 H4" ${S} stroke-width="3.6"/>`,
  person: `<circle cx="0" cy="-8" r="6.4" ${S}/><path d="M-12 14 Q-12 1 0 1 Q12 1 12 14" ${S}/>`,
  translate: `<path d="M-16 -12 H-2 M-9 -16 V-12 M-13 -12 Q-11 -2 -3 2 M-5 -12 Q-7 -2 -15 2" ${S} stroke-width="3.8"/><path d="M2 14 L9 -4 L16 14 M4.5 8 H13.5" ${S} stroke-width="3.8"/>`,
  shrink: `<path d="M-14 -10 H14 M-14 -2 H8 M-14 6 H2 M-14 14 H-4" ${S}/>`,
  playzip: `<path d="M-10 -12 L8 0 L-10 12 Z" ${S}/><path d="M12 -14 V14 M8 -8 L16 -8 M8 0 L16 0 M8 8 L16 8" ${S} stroke-width="3.4"/>`,
  note: `<path d="M-4 12 V-13 L14 -16 V8" ${S}/><ellipse cx="-9" cy="12" rx="5.5" ry="4.5" fill="#fff"/><ellipse cx="9" cy="8" rx="5.5" ry="4.5" fill="#fff"/>`,
  mute: `<path d="M-16 -5 H-9 L0 -13 V13 L-9 5 H-16 Z" ${S}/><path d="M7 -7 L17 3 M17 -7 L7 3" ${S}/>`,
  speed: `<path d="M-15 -10 L-3 0 L-15 10 Z M1 -10 L13 0 L1 10 Z" ${S}/>`,
  rewind: `<path d="M15 -10 L3 0 L15 10 Z M-1 -10 L-13 0 L-1 10 Z" ${S}/>`,
  rotate: `<path d="M14 0 A14 14 0 1 1 0 -14" ${S}/><path d="M-1 -21 L1 -13 L-7 -11" ${S}/>`,
  cube: `<path d="M0 -16 L14 -8 V8 L0 16 L-14 8 V-8 Z M-14 -8 L0 0 L14 -8 M0 0 V16" ${S}/>`,
  argrid: `<path d="M-16 -9 V-16 H-9 M9 -16 H16 V-9 M16 9 V16 H9 M-9 16 H-16 V9" ${S}/><path d="M0 -8 L7 -4 V4 L0 8 L-7 4 V-4 Z" ${S} stroke-width="3.8"/>`,
  printer: `<path d="M-10 -6 V-15 H10 V-6" ${S}/><rect x="-15" y="-6" width="30" height="14" rx="3" ${S}/><rect x="-8" y="4" width="16" height="11" ${S}/>`,
  export: `<path d="M0 6 V-14 M-6 -8 L0 -14 L6 -8" ${S}/><path d="M-14 2 V14 H14 V2" ${S}/>`,
};

/* ── tool map: [slug, name, category, glyph] ── */
const CATS = { qr: "#22c55e", pdf: "#60a5fa", image: "#c084fc", ai: "#fbbf24", video: "#f472b6", three: "#22d3ee" };
const TOOLS = [
  ["qr-generator", "QR Generator", "qr", "qrgrid"],
  ["dynamic-qr", "Dynamic QR", "qr", "refresh"],
  ["wifi-qr", "WiFi QR", "qr", "wifi"],
  ["vcard-qr", "vCard QR", "qr", "card"],
  ["bulk-qr", "Bulk QR", "qr", "stack"],
  ["qr-scanner", "QR Scanner", "qr", "scan"],
  ["scan-me-frames", "SCAN ME Frames", "qr", "frame"],
  ["utm-builder", "UTM Builder", "qr", "chart"],
  ["merge-pdf", "Merge PDF", "pdf", "merge"],
  ["compress-pdf", "Compress PDF", "pdf", "compress"],
  ["pdf-to-word", "PDF to Word", "pdf", "docword"],
  ["jpg-to-pdf", "JPG to PDF", "pdf", "img2doc"],
  ["split-pdf", "Split PDF", "pdf", "scissors"],
  ["ocr-pdf", "OCR PDF", "pdf", "eye"],
  ["crop-pdf", "Crop PDF", "pdf", "crop"],
  ["pdf-to-png", "PDF to PNG", "pdf", "doc2img"],
  ["remove-bg", "Remove BG", "image", "personcut"],
  ["upscale", "Upscale 4x", "image", "expand"],
  ["compress-image", "Compress Image", "image", "compress"],
  ["resize", "Resize", "image", "resize"],
  ["convert", "Convert", "image", "swap"],
  ["photo-editor", "Photo Editor", "image", "pen"],
  ["watermark", "Watermark", "image", "drop"],
  ["exif-remover", "EXIF Remover", "image", "info"],
  ["logo-maker", "Logo Maker", "ai", "star"],
  ["image-generator", "Image Generator", "ai", "sparkle"],
  ["prompt-writer", "Prompt Writer", "ai", "bubble"],
  ["resume-builder", "Resume Builder", "ai", "person"],
  ["translator", "Translator", "ai", "translate"],
  ["summarizer", "Summarizer", "ai", "shrink"],
  ["ai-bg-remover", "AI BG Remover", "ai", "personcut"],
  ["compress-video", "Compress Video", "video", "playzip"],
  ["trim-video", "Trim Video", "video", "scissors"],
  ["gif-maker", "GIF Maker", "video", "sparkle"],
  ["video-to-mp3", "Video to MP3", "video", "note"],
  ["mute-video", "Mute Video", "video", "mute"],
  ["speed-changer", "Speed Changer", "video", "speed"],
  ["reverse-video", "Reverse", "video", "rewind"],
  ["rotate-video", "Rotate", "video", "rotate"],
  ["image-to-3d", "Image to 3D", "three", "cube"],
  ["3d-viewer", "3D Viewer", "three", "eye"],
  ["glb-export", "GLB Export", "three", "export"],
  ["usdz-ar", "USDZ - AR", "three", "argrid"],
  ["stl-print", "STL for Print", "three", "printer"],
  ["obj-export", "OBJ Export", "three", "cube"],
];

function iconSvg(cat, glyphId) {
  const c = CATS[cat];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 240">
  <g>${pandaBase()}${ACC[cat](c)}</g>
  <circle cx="188" cy="192" r="37" fill="${c}" stroke="#ffffff" stroke-width="6"/>
  <g transform="translate(188 192)" stroke-width="4.6">${GLYPH[glyphId]}</g>
</svg>`;
}

const manifest = [];
for (const [slug, name, cat, glyph] of TOOLS) {
  const svg = iconSvg(cat, glyph);
  const file = `${cat}-${slug}`;
  writeFileSync(path.join(OUT, "svg", `${file}.svg`), svg);
  manifest.push({ slug, name, cat, color: CATS[cat], file: `${file}.png` });
}
writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

// rasterize
for (const [slug, , cat] of TOOLS) {
  const file = `${cat}-${slug}`;
  await sharp(path.join(OUT, "svg", `${file}.svg`), { density: 300 })
    .resize(512, 512)
    .png()
    .toFile(path.join(OUT, "png", `${file}.png`));
}

// contact sheet
const cells = manifest.map((m) =>
  `<div class="c"><img src="png/${m.file}"/><span>${m.name}</span></div>`).join("");
writeFileSync(path.join(OUT, "preview.html"), `<!DOCTYPE html><html><head><meta charset="utf-8"><title>QRix Panda Icons</title>
<style>body{background:#0d0b0a;font-family:sans-serif;padding:30px}h1{color:#ff7a50}
.g{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:18px}
.c{background:#171412;border:1px solid #2c2624;border-radius:16px;padding:14px;text-align:center}
.c img{width:100%;height:auto}.c span{color:#eae6e0;font-size:12.5px;font-weight:600}</style></head>
<body><h1>QRix Panda Icons — ${manifest.length} functions</h1><div class="g">${cells}</div></body></html>`);
console.log("generated", manifest.length, "icons");
