/* npm run recheck:sources — re-read every page the sourced datasets cite.
 *
 * WHY THIS EXISTS. /free-qr-code-generator-comparison and /compare/[slug] make
 * claims about twenty-three named third parties, each one read off that party's
 * own live page on a stated date. That shape is honest — a vendor changing its
 * pricing does not make the page wrong, it makes it dated — but nothing was
 * re-reading those pages, so "dated" had no way of ever being noticed. A study
 * that cannot go stale out loud is a study nobody is maintaining.
 *
 * WHAT IT DOES, AND DELIBERATELY DOES NOT DO. It re-fetches each source URL and
 * checks that the `evidence` markers stored beside the verdict are still in the
 * page. It does NOT re-classify anything: a missing marker means "this row's
 * evidence moved, go look", which is a human's job. Automatic re-grading is how
 * a page starts asserting things nobody read.
 *
 * MATCHING RULES, each one paid for by a mistake in this repo's history:
 *  · RAW markup, never tag-stripped. Three cells were wrong because a tick
 *    adjacent to a label is ambiguous once tags are gone (M148), and the
 *    ~$6 TinyWow price came from flattened text picking up a GBP row (M152).
 *    One marker here is literally an alt attribute for that reason.
 *  · Whitespace-normalised, so a reflow or a re-indent is not a false alarm.
 *  · Case-insensitive, because Next and friends serve attribute names in
 *    whatever case they like — the trap that produced the hreflang false
 *    positive on Jul 28.
 *  · A non-200, an empty body or a network failure is reported as UNREACHABLE,
 *    never as "evidence gone". They are different problems: one is our reading
 *    going stale, the other is a fetch being blocked, and conflating them
 *    trains everyone to ignore the output.
 *
 * Exit code is 0 when every marker is present, 1 when any marker is missing or
 * any source is unreachable, so the daily VERIFY pass can call it directly.
 */

import { readFileSync } from "node:fs";

const ORIGIN = "https://qrixtools.com";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const TIMEOUT_MS = 30_000;
/* How old a reading may get before it is worth re-reading by hand even when
   every marker still matches. Prices move quietly; markers only catch the
   sentences we happened to store. */
const STALE_DAYS = 120;

const only = process.argv.slice(2).find((a) => !a.startsWith("-"));

/* ---------------------------------------------------------------- the data.
   Parsed out of the TS sources rather than imported: scripts here run on bare
   node with no TS runtime, and both files are regular enough to read. Every
   parse below asserts it found something, because a regex that silently
   matches nothing would report a clean run over zero sources — the exact
   vacuous-pass shape that let a broken guard through in M150. */

const studySrc = readFileSync(new URL("../lib/qr-generator-study.ts", import.meta.url), "utf8");
const compareSrc = readFileSync(new URL("../lib/compare-sources.ts", import.meta.url), "utf8");
const statsSrc = readFileSync(new URL("../lib/qr-stats.ts", import.meta.url), "utf8");

/** Reads the string literals out of an `evidence: [ ... ]` block. */
function evidenceFrom(block) {
  const m = block.match(/evidence:\s*\[([\s\S]*?)\]/);
  if (!m) return [];
  const out = [];
  // Double- and single-quoted TS literals, skipping // and /* */ comments.
  const body = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  for (const lit of body.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g)) {
    const raw = lit[1] !== undefined ? lit[1] : lit[2];
    out.push(raw.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, "\\"));
  }
  return out;
}

function studySources() {
  const out = [];
  // Split on top-level entries; each vendor block starts at its id.
  const starts = [...studySrc.matchAll(/^\s*id:\s*"([^"]+)",\s*$/gm)];
  for (let i = 0; i < starts.length; i++) {
    const from = starts[i].index;
    const to = i + 1 < starts.length ? starts[i + 1].index : studySrc.length;
    const block = studySrc.slice(from, to);
    const url = block.match(/sourceUrl:\s*"([^"]+)"/);
    const checked = block.match(/checked:\s*(?:"([^"]+)"|D)/);
    if (!url) continue;
    out.push({
      dataset: "study",
      id: starts[i][1],
      url: url[1],
      checked: checked && checked[1] ? checked[1] : studyDate(),
      evidence: evidenceFrom(block),
    });
  }
  return out;
}

function studyDate() {
  const m = studySrc.match(/^const D = "([\d-]+)";/m);
  return m ? m[1] : "unknown";
}
function compareDate() {
  const m = compareSrc.match(/^const D = "([\d-]+)";/m);
  return m ? m[1] : "unknown";
}

function compareSources() {
  const out = [];
  const starts = [...compareSrc.matchAll(/^\s{2}"(qrix-vs-[a-z0-9-]+)":\s*\{/gm)];
  for (let i = 0; i < starts.length; i++) {
    const from = starts[i].index;
    const to = i + 1 < starts.length ? starts[i + 1].index : compareSrc.length;
    const block = compareSrc.slice(from, to);
    const url = block.match(/url:\s*"([^"]+)"/);
    if (!url) continue;
    out.push({
      dataset: "compare",
      id: starts[i][1],
      url: url[1],
      checked: compareDate(),
      evidence: evidenceFrom(block),
    });
  }
  return out;
}

/* /qr-code-statistics. Its five sources are `const NAME: Source = { ... }`
   blocks; several stats share one source, so the unit here is the SOURCE (one
   fetch per page) and the markers name the figures between them. Added
   2026-08-04 — until then the site's flagship citable page was the one sourced
   dataset nothing re-read. */
function statsSources() {
  const out = [];
  const starts = [...statsSrc.matchAll(/^(?:export )?const ([A-Z][A-Z0-9_]*): Source = \{/gm)];
  for (let i = 0; i < starts.length; i++) {
    const from = starts[i].index;
    const to = i + 1 < starts.length ? starts[i + 1].index : statsSrc.length;
    const block = statsSrc.slice(from, to);
    const url = block.match(/url:\s*"([^"]+)"/);
    if (!url) continue;
    const checked = block.match(/checked:\s*(?:"([^"]+)"|CHECKED)/);
    const published = block.match(/published:\s*"([^"]+)"/);
    out.push({
      dataset: "stats",
      id: starts[i][1].toLowerCase().replace(/_/g, "-"),
      url: url[1],
      checked: checked && checked[1] ? checked[1] : statsCheckedDefault(),
      published: published ? published[1] : null,
      evidence: evidenceFrom(block),
    });
  }
  return out;
}

function statsCheckedDefault() {
  const m = statsSrc.match(/^const CHECKED = "([\d-]+)";/m);
  return m ? m[1] : "unknown";
}

/* How old a source's PUBLICATION may get before it is worth asking whether a
   newer edition exists. Deliberately advisory and never a failure: two of the
   stats sources are dated press releases, and a February 2025 press release
   that still says exactly what we quote is not wrong, it is dated — which is
   what the page already prints next to it. A guard that fails on correct data
   is a guard people learn to skip. `checked` above is the one that can fail. */
const PUBLISHED_STALE_MONTHS = 14;

/** Latest instant a free-text publication date could denote: "2025" -> 31 Dec
 *  2025, "January 2025" -> 31 Jan 2025, "10 February 2025" -> that day. Most
 *  generous on purpose, so the advisory never accuses a source unfairly. */
function publishedLatest(text) {
  if (!text) return null;
  const s = text.trim();
  const MONTHS = ["january","february","march","april","may","june","july","august","september","october","november","december"];
  let m = s.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const mi = MONTHS.indexOf(m[2].toLowerCase());
    if (mi < 0) return null;
    return Date.UTC(+m[3], mi, +m[1]);
  }
  m = s.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (m) {
    const mi = MONTHS.indexOf(m[1].toLowerCase());
    if (mi < 0) return null;
    return Date.UTC(+m[2], mi + 1, 0); // day 0 of next month = last day of this
  }
  m = s.match(/^(\d{4})$/);
  if (m) return Date.UTC(+m[1], 11, 31);
  return null;
}

function monthsSince(ms) {
  if (ms === null) return null;
  return (Date.now() - ms) / (30.44 * 86_400_000);
}

/* ------------------------------------------------------------- the matching */

const norm = (s) => s.replace(/\s+/g, " ").toLowerCase();

async function fetchRaw(url) {
  const abs = url.startsWith("/") ? ORIGIN + url : url;
  const res = await fetch(abs, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: "follow",
    headers: {
      "user-agent": UA,
      accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "accept-language": "en-US,en;q=0.9",
    },
  });
  const html = await res.text();
  return { status: res.status, html };
}

function daysSince(iso) {
  const t = Date.parse(iso + "T00:00:00Z");
  if (Number.isNaN(t)) return null;
  return Math.floor((Date.now() - t) / 86_400_000);
}

/* ------------------------------------------------------------------ the run */

const sources = [...studySources(), ...compareSources(), ...statsSources()].filter(
  (s) => !only || s.id.includes(only),
);

if (!sources.length) {
  console.error(
    only
      ? `no source matches "${only}"`
      : "parsed 0 sources out of the datasets — the parser is broken, not the data",
  );
  process.exit(1);
}
/* Per-dataset floors, not one total. A total-only floor is exactly the
   vacuous-pass shape this file was built to avoid: the stats parser could
   return zero and the 24 study+compare rows would still clear a floor of 20,
   so the flagship page would silently stop being re-read while the run printed
   a clean summary. Each dataset has to show up on its own. */
if (!only) {
  /* Measured 2026-08-04: study 21 · compare 3 · stats 5. Set at or just under
     the real counts, so losing a dataset trips it and editing one does not. */
  const FLOORS = { study: 20, compare: 3, stats: 5 };
  for (const [dataset, min] of Object.entries(FLOORS)) {
    const n = sources.filter((s) => s.dataset === dataset).length;
    if (n < min) {
      console.error(`parsed only ${n} ${dataset} sources, expected >= ${min}. Parser regression in that dataset.`);
      process.exit(1);
    }
  }
}

console.log(`Re-reading ${sources.length} cited pages.\n`);

const moved = [];
const unreachable = [];
const stale = [];
let checkedMarkers = 0;

for (const s of sources) {
  let page;
  try {
    page = await fetchRaw(s.url);
  } catch (e) {
    unreachable.push({ ...s, why: String(e.message || e) });
    console.log(`  UNREACHABLE  ${s.id.padEnd(24)} ${s.url}\n               ${e.message || e}`);
    continue;
  }
  if (page.status !== 200 || !page.html.length) {
    unreachable.push({ ...s, why: `HTTP ${page.status}, ${page.html.length} bytes` });
    console.log(`  UNREACHABLE  ${s.id.padEnd(24)} HTTP ${page.status}, ${page.html.length} bytes`);
    continue;
  }

  const hay = norm(page.html);
  const missing = s.evidence.filter((m) => !hay.includes(norm(m)));
  checkedMarkers += s.evidence.length;

  const age = daysSince(s.checked);
  if (age !== null && age > STALE_DAYS) stale.push({ ...s, age });

  if (!s.evidence.length) {
    moved.push({ ...s, missing: ["(no evidence stored — this row cannot be re-checked)"] });
    console.log(`  NO EVIDENCE  ${s.id.padEnd(24)} ${s.url}`);
  } else if (missing.length) {
    moved.push({ ...s, missing });
    console.log(`  MOVED        ${s.id.padEnd(24)} ${missing.length}/${s.evidence.length} markers gone`);
    for (const m of missing) console.log(`               · ${m}`);
  } else {
    const flag = age !== null && age > STALE_DAYS ? ` (read ${age}d ago)` : "";
    console.log(`  ok           ${s.id.padEnd(24)} ${s.evidence.length} markers${flag}`);
  }
}

console.log(
  `\n${sources.length} sources · ${checkedMarkers} markers · ` +
    `${moved.length} moved · ${unreachable.length} unreachable · ${stale.length} older than ${STALE_DAYS}d`,
);

if (stale.length) {
  console.log(`\nOld enough to be worth re-reading by hand even though the markers hold:`);
  for (const s of stale) console.log(`  ${s.id} — read ${s.age} days ago (${s.checked})`);
}

/* Advisory only — never touches the exit code. See PUBLISHED_STALE_MONTHS. */
const aged = sources
  .map((s) => ({ ...s, months: monthsSince(publishedLatest(s.published)) }))
  .filter((s) => s.months !== null && s.months > PUBLISHED_STALE_MONTHS);
if (aged.length) {
  console.log(
    `\nFYI — published over ${PUBLISHED_STALE_MONTHS} months ago. Not a failure: a dated ` +
      `press release that still says what we quote is dated, not wrong. Worth asking\nwhether a newer edition exists:`,
  );
  for (const s of aged) {
    console.log(`  ${s.id.padEnd(24)} published ${s.published} (~${Math.floor(s.months)} months)`);
  }
}

if (moved.length) {
  console.log(`\nGo look at these — the sentence the verdict rests on is not on the page any more:`);
  for (const m of moved) console.log(`  ${m.url}   [${m.dataset}/${m.id}]`);
}

process.exit(moved.length || unreachable.length ? 1 : 0);
