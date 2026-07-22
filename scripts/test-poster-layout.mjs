/* Assertions for lib/poster-layout.ts — the flow behind /poster.
 *
 * Why this file exists: the poster is drawn to an offscreen canvas and only
 * ever seen as a 420px-wide preview, so a block that lands on top of another
 * block looks like a design choice at preview size and only becomes obvious on
 * A4 paper. Before M133 every y was a literal: a heading that wrapped to two
 * lines drew its second line through the accent underline and into the QR
 * card, and there was no logo at all. Both are layout arithmetic, which means
 * they are assertable without a browser.
 *
 * It imports the SHIPPED module (Node 22.18+/24 strips the types natively).
 *
 *   node scripts/test-poster-layout.mjs      (or: npm run test:poster)
 */

import assert from "node:assert/strict";
import {
  POSTER_W,
  POSTER_H,
  QR_MAX,
  QR_MIN,
  PILL_H,
  UNDERLINE_H,
  SUB_LINE_H,
  fitLogo,
  wrapLines,
  posterLayout,
} from "../lib/poster-layout.ts";

let pass = 0;
const fails = [];
const t = (name, fn) => {
  try { fn(); pass++; }
  catch (e) { fails.push(`${name}\n    ${e.message.split("\n").join("\n    ")}`); }
};

/* A stub for ctx.measureText: every glyph is 60px wide, close enough to the
 * 110px display face the heading actually uses. */
const measure = (s) => s.length * 60;

/* ---- word wrap ------------------------------------------------------- */

t("a short heading stays on one line", () => {
  assert.deepEqual(wrapLines("SCAN ME", 1080, measure), ["SCAN ME"]);
});

t("a long heading wraps instead of overflowing", () => {
  const lines = wrapLines("SCAN FOR OUR FULL DINNER MENU", 1080, measure);
  assert.ok(lines.length > 1, "expected more than one line");
  for (const line of lines) assert.ok(measure(line) <= 1080, `line too wide: ${line}`);
});

t("wrapping never drops a word", () => {
  const text = "LEAVE A REVIEW AND HELP US GROW";
  assert.equal(wrapLines(text, 700, measure).join(" "), text);
});

t("a single unbreakable word is kept whole, not dropped", () => {
  assert.deepEqual(wrapLines("SUPERCALIFRAGILISTIC", 300, measure), ["SUPERCALIFRAGILISTIC"]);
});

t("empty and whitespace-only text produce no lines", () => {
  assert.deepEqual(wrapLines("", 1080, measure), []);
  assert.deepEqual(wrapLines("   \n  ", 1080, measure), []);
});

/* ---- logo box -------------------------------------------------------- */

t("a wide logo is capped by width and keeps its aspect ratio", () => {
  const box = fitLogo(2000, 500); // 4:1
  assert.ok(box.w <= 560, `w=${box.w}`);
  assert.ok(box.h <= 150, `h=${box.h}`);
  assert.ok(Math.abs(box.w / box.h - 4) < 0.001, "aspect ratio drifted");
});

t("a tall logo is capped by height and keeps its aspect ratio", () => {
  const box = fitLogo(300, 900); // 1:3
  assert.equal(box.h, 150);
  assert.ok(Math.abs(box.w / box.h - 1 / 3) < 0.001, "aspect ratio drifted");
});

t("the logo is horizontally centred", () => {
  const box = fitLogo(800, 400);
  assert.equal(box.x + box.w / 2, POSTER_W / 2);
});

t("a zero-sized image does not produce NaN coordinates", () => {
  const box = fitLogo(0, 0);
  for (const [k, v] of Object.entries(box)) assert.ok(Number.isFinite(v), `${k} is ${v}`);
});

/* ---- the layout the poster is drawn from ----------------------------- */

const plain = posterLayout({ headingLines: 1, subLines: 1 });

t("the default poster is unchanged by the refactor", () => {
  // the literals the component drew before M133
  assert.equal(plain.headingBaseline, 250);
  assert.equal(plain.underlineY, 300);
  assert.equal(plain.qr.y, 430);
  assert.equal(plain.qr.size, QR_MAX);
  assert.equal(plain.pillY, 430 + 720 + 70);
  assert.equal(plain.pillTextBaseline, 430 + 720 + 132);
  assert.equal(plain.subBaseline, 430 + 720 + 250);
  assert.equal(plain.footerBaseline, POSTER_H - 70);
  assert.equal(plain.logo, null);
});

t("the QR stays centred at every size", () => {
  for (const l of [plain, posterLayout({ headingLines: 3, subLines: 3, logo: { w: 600, h: 200 } })]) {
    assert.equal(l.qr.x + l.qr.size / 2, POSTER_W / 2);
  }
});

/* The bug this file was written for. */
t("a two-line heading does not draw through the underline", () => {
  const l = posterLayout({ headingLines: 2, subLines: 1 });
  const lastHeadingBaseline = l.headingBaseline + l.headingLineH;
  assert.ok(l.underlineY > lastHeadingBaseline, `underline ${l.underlineY} <= heading ${lastHeadingBaseline}`);
});

t("a three-line heading does not push the QR card over the underline", () => {
  const l = posterLayout({ headingLines: 3, subLines: 2 });
  assert.ok(l.qr.y - 36 > l.underlineY + UNDERLINE_H, "QR card overlaps the underline");
});

t("a logo pushes the heading down and the heading still clears it", () => {
  const l = posterLayout({ headingLines: 1, subLines: 1, logo: { w: 600, h: 200 } });
  assert.ok(l.logo, "no logo box");
  assert.ok(l.headingBaseline > plain.headingBaseline, "heading did not move");
  assert.ok(l.headingBaseline - 96 > l.logo.y + l.logo.h, "heading cap height overlaps the logo");
});

t("no logo means no logo box, whatever else is set", () => {
  assert.equal(posterLayout({ headingLines: 2, subLines: 2, logo: null }).logo, null);
});

/* Every combination has to stay on the page — that is the whole point of a
 * flow layout. The worst case is a logo, a wrapped heading and a wrapped
 * subtitle at once. */
t("nothing runs off the bottom of the page in any combination", () => {
  for (const headingLines of [1, 2, 3]) {
    for (const subLines of [0, 1, 2, 3]) {
      for (const logo of [null, { w: 600, h: 200 }, { w: 200, h: 600 }]) {
        const l = posterLayout({ headingLines, subLines, logo });
        const where = `h=${headingLines} s=${subLines} logo=${logo ? `${logo.w}x${logo.h}` : "none"}`;
        const lastSub = subLines ? l.subBaseline + (subLines - 1) * SUB_LINE_H : l.pillY + PILL_H;
        assert.ok(lastSub < l.footerBaseline - 28, `${where}: content (${lastSub}) collides with the credit line`);
        assert.ok(l.footerBaseline < POSTER_H - 26, `${where}: credit line sits on the bottom band`);
        assert.ok(l.qr.size >= QR_MIN, `${where}: QR shrank to ${l.qr.size}`);
        assert.ok(l.qr.size <= QR_MAX, `${where}: QR grew to ${l.qr.size}`);
        assert.ok(l.qr.y > l.underlineY, `${where}: QR above the underline`);
        assert.ok(l.pillY > l.qr.y + l.qr.size, `${where}: pill overlaps the QR`);
        if (subLines) assert.ok(l.subBaseline > l.pillY + PILL_H, `${where}: subtext overlaps the pill`);
      }
    }
  }
});

t("the QR only shrinks when the space above it has actually been eaten", () => {
  assert.equal(posterLayout({ headingLines: 1, subLines: 0 }).qr.size, QR_MAX);
  const crowded = posterLayout({ headingLines: 3, subLines: 3, logo: { w: 600, h: 200 } });
  assert.ok(crowded.qr.size < QR_MAX, "a crowded poster kept a full-size QR");
});

t("odd input does not produce NaN or a negative QR", () => {
  for (const l of [
    posterLayout({ headingLines: 0, subLines: -2 }),
    posterLayout({ headingLines: 99, subLines: 99 }),
  ]) {
    assert.ok(Number.isFinite(l.qr.size) && l.qr.size >= QR_MIN, `size=${l.qr.size}`);
    assert.ok(Number.isFinite(l.subBaseline), "subBaseline is NaN");
  }
});

/* ---- report ---------------------------------------------------------- */

if (fails.length) {
  console.error(`\n✗ ${fails.length} failed, ${pass} passed\n`);
  for (const f of fails) console.error(`  ✗ ${f}\n`);
  process.exit(1);
}
console.log(`✓ poster layout: ${pass} assertions passed`);
