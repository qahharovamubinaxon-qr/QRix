/* Guard for /compare/[slug] — the sourced-competitor-column rule.
 *
 * Why this file exists. The three comparison pages shipped 21 head-to-head
 * cells about NAMED products with no source and no date, and three of them
 * were factually wrong: iLovePDF was accused of a daily task cap its pricing
 * page does not state, TinyWow's ad-free tier was priced at a third of what
 * its page lists, and SnapTik was credited with MP3 support its own FAQ
 * explicitly declines while its photo support was downgraded. Nobody could
 * tell, because nothing pointed at a source.
 *
 * So the rule this asserts is structural, not textual: the competitor column
 * may only come from lib/compare-sources.ts, every vendor page must carry a
 * source link and a checked date, and the page file may not reintroduce a
 * hand-typed rows array. Textual assertions alone would just be a list of the
 * three mistakes already made; this is meant to catch the fourth.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

let pass = 0;
const failures = [];
function ok(name, fn) {
  try { fn(); pass++; console.log(`  ok    ${name}`); }
  catch (e) { failures.push(name); console.log(`  FAIL  ${name}\n        ${e.message}`); }
}

const PAGE = readFileSync(new URL("../app/compare/[slug]/page.tsx", import.meta.url), "utf8");
const SRC = readFileSync(new URL("../lib/compare-sources.ts", import.meta.url), "utf8");

/* Parse the dataset out of the TS source rather than importing it — the repo
   has no TS runtime in scripts and the shape is regular enough to read. */
function slugs() {
  return [...SRC.matchAll(/^\s{2}"([a-z0-9-]+)":\s*\{/gm)].map((m) => m[1]);
}
function blockFor(slug) {
  const i = SRC.indexOf(`"${slug}": {`);
  const next = SRC.slice(i + 1).search(/^\s{2}"[a-z0-9-]+":\s*\{/m);
  return next === -1 ? SRC.slice(i) : SRC.slice(i, i + 1 + next);
}

ok("the dataset covers exactly the slugs the page renders", () => {
  const pageSlugs = [...PAGE.matchAll(/^\s{2}"(qrix-vs-[a-z0-9-]+)":\s*\{/gm)].map((m) => m[1]);
  const dataSlugs = slugs();
  assert.ok(pageSlugs.length >= 3, `expected 3+ compare pages, saw ${pageSlugs.length}`);
  for (const s of pageSlugs) {
    assert.ok(dataSlugs.includes(s), `/compare/${s} renders with no entry in lib/compare-sources.ts — its competitor column would be unsourced`);
  }
});

ok("the page file holds no hand-typed competitor rows", () => {
  // The exact shape that carried the three wrong cells: a rows: [ [..] ] array
  // of string triples living next to the marketing copy.
  assert.ok(!/rows:\s*\[\s*\[/.test(PAGE),
    "a hand-typed rows array is back in app/compare/[slug]/page.tsx — the competitor column must come from lib/compare-sources.ts");
  assert.ok(!/type Row\s*=/.test(PAGE), "the Row triple type is back; the sourced SourcedRow shape replaced it");
  assert.ok(PAGE.includes("COMPARE_SOURCES"), "the page must read the sourced dataset");
  assert.ok(PAGE.includes("src.rows.map"), "the table must render the sourced rows");
});

ok("every vendor carries a source URL and a checked date", () => {
  for (const s of slugs()) {
    const b = blockFor(s);
    const urls = [...b.matchAll(/url:\s*"(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
    const dates = [...b.matchAll(/checked:\s*(D|"[\d-]+")/g)];
    assert.ok(urls.length >= 1, `${s} has no source URL`);
    assert.ok(dates.length >= 1, `${s} has no checked date`);
    for (const u of urls) assert.ok(/^https:\/\//.test(u), `${s} source is not https: ${u}`);
  }
});

ok("source links are nofollow, like every other outbound vendor link on the site", () => {
  assert.ok(/rel="nofollow noopener"/.test(PAGE), "vendor source links must be rel=nofollow noopener");
});

ok("a cell the vendor's page does not answer is marked, not guessed", () => {
  const notStated = [...SRC.matchAll(/stated:\s*false/g)].length;
  assert.ok(notStated >= 3, `expected several "not stated" cells across three vendors, saw ${notStated} — a table where every question happens to be answered is a table that guessed`);
  assert.ok(PAGE.includes("not stated"), "the UI must render the not-stated marker");
});

/* The three specific corrections. These are regression locks: each one shipped
   wrong to production and each has a named, quotable source behind the fix. */
ok("iLovePDF is not re-accused of a daily task cap it does not state", () => {
  const b = blockFor("qrix-vs-ilovepdf");
  const pageSection = PAGE.slice(PAGE.indexOf("qrix-vs-ilovepdf"), PAGE.indexOf("qrix-vs-tinywow"));
  const hay = b + pageSection;
  /* Match the ACCUSATION form only. An earlier version of this assertion
     forbade the words outright and failed on its own fix, because the honest
     copy has to be able to say "no daily task cap is stated" — a guard that
     cannot tell a claim from its negation is the case-sensitive-grep trap
     (Jul 28) wearing a different hat. */
  for (const accusation of [
    /Limited tasks\s*\/\s*day/i,
    /limits tasks per day/i,
    /\bdaily[- ]task limits?\b(?!\s*(?:\.|,)?\s*(?:is|are) not)/i,
  ]) {
    assert.ok(!accusation.test(hay),
      `an unstated daily-task-cap claim about iLovePDF is back (${accusation}) — its pricing page states file size per task, not a task count`);
  }
  assert.ok(/Filesize per task|file size per task/i.test(b), "the real stated limit (file size per task) must be what the table reports");
});

ok("TinyWow's ad-free price is the one its page lists", () => {
  const b = blockFor("qrix-vs-tinywow");
  assert.ok(/20 US\$\/month/.test(b), "TinyWow Premium is listed at 20 US$/month on its pricing page");
  assert.ok(!/~?\$6\/month|~\$6 /.test(b + PAGE), "the unsourced ~$6/month ad-free price is back");
  assert.ok(/No advertisements/.test(b), "the ads claim must quote what its pricing page actually sells");
});

ok("SnapTik's MP3 and photo rows match what SnapTik says", () => {
  const b = blockFor("qrix-vs-snaptik");
  assert.ok(/will not provide MP3|not provide MP3/i.test(b),
    "SnapTik's own FAQ declines MP3 — the table must not credit it with MP3 support again");
  assert.ok(/intellectual property rights of the tracks/.test(b), "the MP3 row must carry the vendor's own reason, which is what makes it citable");
  assert.ok(!/"Partial"/.test(b), "the unsourced 'Partial' downgrade of SnapTik's photo support is back");
});

ok("no unverifiable ad-behaviour accusation returns", () => {
  // A fetched page cannot establish what an ad slot fills with later. These
  // were asserted for months with nothing behind them.
  const stripped = PAGE.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  // prove the stripper did not eat the file (M150: it once ate 2.3 KB of JSX)
  assert.ok(stripped.includes("COMPARES"), "comment-stripping removed the page body — the assertions below would pass vacuously");
  assert.ok(stripped.length > PAGE.length * 0.5, "comment-stripping removed more than half the file; refusing to assert on the remains");
  for (const ghost of ["pop-under", "fake Download button", "redirect chain", "ad gauntlet"]) {
    assert.ok(!stripped.toLowerCase().includes(ghost.toLowerCase()),
      `the unverifiable accusation "${ghost}" is back on a page that names a company`);
  }
});

ok("the pages are still registered and still ship schema", () => {
  assert.ok(PAGE.includes("breadcrumbLd") && PAGE.includes("faqLd"), "breadcrumb + FAQ schema required");
  assert.ok(PAGE.includes("generateStaticParams"), "compare pages are SSG");
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  assert.ok(/compare/.test(sitemap), "compare routes must be in the sitemap");
});

console.log(`\n  ${pass} assertions passed over ${slugs().length} comparison pages.`);
if (failures.length) {
  console.log(`  ${failures.length} FAILED\n`);
  process.exit(1);
}
console.log("");
