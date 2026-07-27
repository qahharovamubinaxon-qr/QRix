/* The embeddable stat card, rendered as a COMPLETE standalone HTML document.
 *
 * Why a string and not a React page (M141). /embed/qr-stat/<id> shipped as a
 * page under app/, which means it renders inside the root layout: 15 eager
 * scripts, 727.1 KB, TopNav, the cookie banner and GoogleAnalytics — all of it
 * hidden with `display:none` and every byte of it still downloaded, on someone
 * else's page. A widget that costs an embedder a second of load gets removed,
 * which takes the backlink with it. A Route Handler is not nested in any
 * layout, so this document is the whole response: no scripts, no webfont, no
 * analytics, ~4 KB.
 *
 * The card is dark on purpose and paints a SOLID background. The page's
 * --surface is rgba(255,255,255,0.04) over a dark --bg; composited onto a
 * white blog it is white, and --text (#ecebe7) on white is invisible. So the
 * tokens are resolved here to the colours they ACTUALLY produce on the page
 * (#141b2f is that 4% white over #0a1226), not to the translucent values.
 */

import { ALL_STATS, KIND_LABEL, KIND_TONE, type Stat, type SourceKind } from "@/lib/qr-stats";

/** Every colour token the card uses, resolved to what it composites to on the
 *  card's own solid surface. Keyed by the token string in KIND_TONE so the tier
 *  colours stay derived from the page's map rather than a second opinion of it;
 *  scripts/test-qr-stats.mjs fails if a tier ever names a token missing here.
 *
 *  --success is the one deliberate divergence. #467434 on #141b2f is 3.1:1,
 *  which a 9px badge fails; #6fae54 is the same hue at 6.4:1. The page can
 *  afford the darker green on its own surface, an embed at 9px cannot. */
export const TOKEN_HEX: Record<string, string> = {
  "var(--success)": "#6fae54",
  "var(--primary-bright)": "#ff4d1c",
  "var(--text-faint)": "#8a857c",
};

const SURFACE = "#141b2f"; // rgba(255,255,255,0.04) over --bg #0a1226
const BORDER = "#272d40"; // rgba(255,255,255,0.08) over that surface
const TEXT = "#ecebe7";
const TEXT_MUTED = "#9a968f";
const TEXT_FAINT = "#8a857c";

/** Text → HTML. The dataset is prose written by hand — it carries quotes, an
 *  ampersand and typographic dashes — and this file builds markup by
 *  concatenation, so nothing may reach it unescaped. Attribute values go
 *  through the same function, hence both quote forms. */
export function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** The tier badge colour for a stat, as a literal. */
export function toneHex(kind: SourceKind): string {
  return TOKEN_HEX[KIND_TONE[kind]] || TEXT_FAINT;
}

/* Sizes are the ones the React card shipped with, because lib/qr-stats.ts's
   embedHeight() was calibrated against those at a 320px column. Change one and
   re-measure all 26 heights before shipping. */
const STYLE = `*{box-sizing:border-box}
html,body{margin:0;background:transparent}
body{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:14px;
font-family:system-ui,-apple-system,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}
.c{width:100%;max-width:560px;background:${SURFACE};border:1px solid ${BORDER};border-radius:16px;padding:16px}
.v{font-size:clamp(1.4rem,5vw,2rem);font-weight:800;line-height:1;letter-spacing:-.02em;color:#ff4d1c;margin:0 0 8px}
.cl{font-size:13px;line-height:1.625;color:${TEXT};margin:0 0 12px}
.m{border-top:1px solid ${BORDER};padding-top:10px;display:flex;flex-direction:column;gap:6px}
.r{display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.b{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;text-transform:uppercase;
letter-spacing:.08em;padding:2px 6px;border-radius:999px;border:1px solid currentColor;white-space:nowrap}
.p{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:9px;color:${TEXT_FAINT}}
.s{display:flex;align-items:flex-start;gap:6px;font-size:11px;line-height:1.375;color:${TEXT_MUTED};text-decoration:none}
.s:hover{text-decoration:underline;text-underline-offset:2px}
.s svg{flex:0 0 auto;margin-top:2px}
.d{color:${TEXT_FAINT}}
.cv{font-size:10px;line-height:1.625;color:${TEXT_FAINT};margin:0}
.f{padding-top:4px}
.f a{font-size:10px;font-weight:600;color:${TEXT_FAINT};text-decoration:none}
.f a:hover{text-decoration:underline;text-underline-offset:2px}
.f b{color:#ff4d1c;font-weight:600}
@media (prefers-reduced-motion:no-preference){.s,.f a{transition:color .15s ease}}`;

/* 10px external-link glyph, inline: react-icons would have meant a bundle. */
const LINK_ICON =
  '<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
  'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
  '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>' +
  '<polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>';

/** The full document for one stat's card. */
export function renderStatEmbed(s: Stat, siteUrl: string): string {
  const tone = toneHex(s.source.kind);
  const back = `${siteUrl}/qr-code-statistics?utm_source=embed&utm_medium=widget#${s.id}`;

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="color-scheme" content="dark">
<title>${esc(s.value)} — QR code statistic | QRix</title>
<link rel="canonical" href="${esc(back)}">
<style>${STYLE}</style></head>
<body><article class="c">
<div class="v">${esc(s.value)}</div>
<p class="cl">${esc(s.claim)}</p>
<div class="m">
<div class="r"><span class="b" style="color:${tone}">${esc(KIND_LABEL[s.source.kind])}</span><span class="p">${esc(s.period)}</span></div>
<a class="s" href="${esc(s.source.url)}" target="_blank" rel="noopener noreferrer">${LINK_ICON}<span>${esc(
    s.source.name,
  )} <span class="d">· ${esc(s.source.published)}</span></span></a>
${s.caveat ? `<p class="cv"><strong>What it doesn&rsquo;t prove:</strong> ${esc(s.caveat)}</p>\n` : ""}<div class="f"><a href="${esc(
    back,
  )}" target="_blank" rel="noopener">Source: <b>QRix QR code statistics</b></a></div>
</div></article></body></html>`;
}

/** Enumerated for the route's generateStaticParams and for the tests. */
export const EMBEDDABLE_IDS = ALL_STATS.map((s) => s.id);
