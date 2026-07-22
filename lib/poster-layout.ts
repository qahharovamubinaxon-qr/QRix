/* Layout math for the QR poster maker (components/PosterMakerClient.tsx).
 *
 * It lives outside the component for two reasons. First, every coordinate in
 * the poster used to be a literal: the heading was drawn at a fixed baseline
 * and the accent underline at a fixed y, so a heading long enough to wrap
 * dropped its second line straight through the underline and into the QR card.
 * Second, a logo has to push everything below it down, and "everything below
 * it" is only safe to move if it flows from one place.
 *
 * Nothing here touches the DOM — text measurement is injected — so the whole
 * layout is assertable in Node (npm run test:poster).
 */

export const POSTER_W = 1240;
export const POSTER_H = 1754; // A4 portrait @ ~150dpi

/* Blocks the layout flows through, top to bottom. */
const LOGO_TOP = 64;
const LOGO_MAX_W = 560;
const LOGO_MAX_H = 150;
const LOGO_GAP = 40; // logo bottom → heading cap height
const HEADING_ASCENT = 96; // cap height of the 110px display face
const HEADING_BASELINE_NO_LOGO = 250;
export const HEADING_LINE_H = 116;
const UNDERLINE_GAP = 50; // last heading baseline → underline top
export const UNDERLINE_H = 12;
const UNDERLINE_TO_QR = 130;
export const QR_MAX = 720;
export const QR_MIN = 360; // below this a printed A4 code gets unreliable
const QR_TO_PILL = 70;
export const PILL_H = 92;
const PILL_TEXT_BASELINE = 62; // from the pill top
const PILL_TO_SUB = 88; // pill bottom → first subtext baseline
export const SUB_LINE_H = 56;
const FOOTER_TOP = 1604; // nothing but the credit line may cross this
const FOOTER_BASELINE = POSTER_H - 70;

export type LogoBox = { x: number; y: number; w: number; h: number };

export type PosterLayout = {
  logo: LogoBox | null;
  headingBaseline: number;
  headingLineH: number;
  underlineY: number;
  qr: { x: number; y: number; size: number };
  pillY: number;
  pillTextBaseline: number;
  subBaseline: number;
  subLineH: number;
  footerBaseline: number;
};

/** Fit an uploaded logo into the header box, preserving its aspect ratio. */
export function fitLogo(naturalW: number, naturalH: number): LogoBox {
  const aspect = naturalW > 0 && naturalH > 0 ? naturalW / naturalH : 1;
  let h = LOGO_MAX_H;
  let w = h * aspect;
  if (w > LOGO_MAX_W) {
    w = LOGO_MAX_W;
    h = w / aspect;
  }
  return { x: (POSTER_W - w) / 2, y: LOGO_TOP, w, h };
}

/**
 * Greedy word wrap. `measure` is ctx.measureText().width in the browser and a
 * stub in the tests. A single word wider than the line is kept whole rather
 * than dropped — the caller shrinks nothing, so an overlong word bleeds, which
 * is still better than losing it.
 */
export function wrapLines(text: string, maxW: number, measure: (s: string) => number): string[] {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines: string[] = [];
  let line = words[0];
  for (const word of words.slice(1)) {
    const test = `${line} ${word}`;
    if (measure(test) > maxW) { lines.push(line); line = word; }
    else line = test;
  }
  lines.push(line);
  return lines;
}

/**
 * Resolve every y coordinate on the poster from what is actually on it. The
 * QR shrinks (never below QR_MIN) when a logo and a wrapped heading have eaten
 * the space above it, so the pill, the subtext and the credit line stay inside
 * the page instead of sliding off the bottom.
 */
export function posterLayout(input: {
  headingLines: number;
  subLines: number;
  logo?: { w: number; h: number } | null;
}): PosterLayout {
  const headingLines = Math.max(1, input.headingLines);
  const subLines = Math.max(0, input.subLines);
  const logo = input.logo ? fitLogo(input.logo.w, input.logo.h) : null;

  const headingBaseline = logo
    ? logo.y + logo.h + LOGO_GAP + HEADING_ASCENT
    : HEADING_BASELINE_NO_LOGO;
  const headingLastY = headingBaseline + (headingLines - 1) * HEADING_LINE_H;
  const underlineY = headingLastY + UNDERLINE_GAP;
  const qrY = underlineY + UNDERLINE_TO_QR;

  const below =
    QR_TO_PILL + PILL_H + (subLines ? PILL_TO_SUB + subLines * SUB_LINE_H : 0);
  const size = Math.max(QR_MIN, Math.min(QR_MAX, FOOTER_TOP - qrY - below));

  const pillY = qrY + size + QR_TO_PILL;
  return {
    logo,
    headingBaseline,
    headingLineH: HEADING_LINE_H,
    underlineY,
    qr: { x: (POSTER_W - size) / 2, y: qrY, size },
    pillY,
    pillTextBaseline: pillY + PILL_TEXT_BASELINE,
    subBaseline: pillY + PILL_H + PILL_TO_SUB,
    subLineH: SUB_LINE_H,
    footerBaseline: FOOTER_BASELINE,
  };
}
