/* npm run verify:daily — the daily production verify pass, as one command.
 *
 * WHY THIS EXISTS. The pass was a prose checklist in the growth routine,
 * re-executed from memory by every session. That is why its rigour visibly
 * varies across growth/DAILY_LOG.md, and it is exactly the shape of the defect
 * it is meant to catch: robots.txt once served a bare `Disallow: /p` instead of
 * `Disallow: /p$` and blocked 27 pages, because "check robots is still right"
 * is not a check, it is an intention. A check is a command with an exit code.
 *
 * WHAT IT ASSERTS
 *  1. The recently-shipped URLs return 200, canonicalise to themselves, and
 *     carry their own title rather than inheriting the homepage's — the
 *     signature of the client-page canonical trap that makes a route unrankable.
 *  2. robots.txt still serves `Disallow: /p$` and NOT a bare `Disallow: /p`.
 *     Asserted as anchored lines, because the bad value is a PREFIX of the good
 *     one and a substring test passes happily on the broken version.
 *  3. The sitemap has not silently lost URLs, measured against a committed
 *     snapshot rather than against a session's memory of yesterday.
 *  4. Every source the two vendor datasets cite still contains the sentence its
 *     verdict rests on (scripts/recheck-sources.mjs).
 *
 * WHICH URLS. Two sources, because neither is sufficient alone: the newest
 * entries by sitemap lastmod (only 76 of 814 URLs carry one — in practice the
 * autopilot blog posts), plus everything that appeared since the last snapshot,
 * which needs no lastmod and is what actually means "recently shipped".
 *
 * THE BASELINE updates itself only on a clean run. If anything failed, it is
 * left alone on purpose: a baseline that advances through a regression reports
 * the loss once and then calls it normal.
 *
 * Exits non-zero if anything failed, so it can gate the rest of a session.
 *
 * Flags: --no-indexnow (skip submitting the delta) · --no-sources (skip the
 * 24-page vendor re-check) · --update-baseline (write the snapshot even so).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { robotsVerdict, titleCanonicalVerdict } from "./verify-rules.mjs";

const ORIGIN = "https://qrixtools.com";
const BASELINE = new URL("../growth/verify-baseline.json", import.meta.url);
const UA = "QRixGrowthVerify/1.0 (+https://qrixtools.com)";
const NEWEST_BY_LASTMOD = 10;
const MAX_SPOT_CHECKS = 15;
const INDEXNOW_KEY = "c3bb259476bd7e9b9ddf3123afc412d8";

const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);

const problems = [];
const notes = [];
const fail = (msg) => { problems.push(msg); console.log(`  FAIL  ${msg}`); };
const pass = (msg) => console.log(`  ok    ${msg}`);

async function get(url) {
  const res = await fetch(url, {
    headers: { "user-agent": UA, accept: "text/html,*/*" },
    signal: AbortSignal.timeout(30_000),
    redirect: "manual",
  });
  const body = res.status >= 300 && res.status < 400 ? "" : await res.text();
  return { status: res.status, body, location: res.headers.get("location") };
}

/* --------------------------------------------------------------- 1. sitemap */

console.log("QRix daily verify\n");

let sitemap;
try {
  sitemap = await get(`${ORIGIN}/sitemap.xml`);
} catch (e) {
  console.log(`  FAIL  sitemap unreachable: ${e.message}`);
  process.exit(1);
}
if (sitemap.status !== 200) {
  console.log(`  FAIL  sitemap.xml returned ${sitemap.status} — nothing else can be checked`);
  process.exit(1);
}

const entries = [...sitemap.body.matchAll(/<url>([\s\S]*?)<\/url>/g)].map((m) => ({
  loc: (m[1].match(/<loc>([^<]+)<\/loc>/) || [])[1],
  lastmod: (m[1].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] || null,
})).filter((e) => e.loc);

if (entries.length < 100) {
  // A parser that reads a handful of URLs would let every check below pass
  // vacuously. 814 today; anything under 100 is the parser, not the site.
  console.log(`  FAIL  parsed only ${entries.length} sitemap URLs — the parser is broken, not the site`);
  process.exit(1);
}
pass(`sitemap parsed: ${entries.length} URLs (${entries.filter((e) => e.lastmod).length} dated)`);

const current = entries.map((e) => e.loc);
const prior = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, "utf8")) : null;

let added = [];
let removed = [];
if (prior) {
  const was = new Set(prior.urls);
  const is = new Set(current);
  added = current.filter((u) => !was.has(u));
  removed = prior.urls.filter((u) => !is.has(u));
  if (removed.length) {
    fail(`sitemap LOST ${removed.length} URL(s) since ${prior.date}`);
    removed.slice(0, 10).forEach((u) => console.log(`        - ${u}`));
  } else {
    pass(`sitemap count ${prior.count} -> ${current.length} (+${added.length}, none lost) since ${prior.date}`);
  }
} else {
  notes.push("no baseline yet — this run establishes one, so nothing could be compared");
  console.log(`  note  first run: writing the baseline, no comparison possible`);
}

/* --------------------------------------------------------------- 2. robots */

const robots = await get(`${ORIGIN}/robots.txt`);
if (robots.status !== 200) {
  fail(`robots.txt returned ${robots.status}`);
} else {
  const verdict = robotsVerdict(robots.body);
  if (verdict) fail(verdict);
  else pass("robots.txt serves `Disallow: /p$` and not the bare `/p`");
}

/* ------------------------------------------------------- 3. the URL spot-check */

const dated = entries.filter((e) => e.lastmod).sort((a, b) => b.lastmod.localeCompare(a.lastmod));
const targets = [...new Set([...added, ...dated.slice(0, NEWEST_BY_LASTMOD).map((e) => e.loc)])].slice(0, MAX_SPOT_CHECKS);

const home = await get(`${ORIGIN}/`);
const titleOf = (html) => {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].replace(/\s+/g, " ").trim() : null;
};
const homeTitle = titleOf(home.body);
if (!homeTitle) fail("could not read the homepage title, so no page can be compared against it");

console.log(`\n  Spot-checking ${targets.length} recently-shipped URLs:`);
for (const url of targets) {
  let r;
  try {
    r = await get(url);
  } catch (e) {
    fail(`${url} — unreachable: ${e.message}`);
    continue;
  }
  if (r.status !== 200) {
    fail(`${url} — HTTP ${r.status}${r.location ? ` -> ${r.location}` : ""}`);
    continue;
  }
  // Canonical is emitted by Next in whatever attribute case it likes, hence /i.
  const canonical = (r.body.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
    r.body.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) || [])[1];
  const verdict = titleCanonicalVerdict({ url, canonical, title: titleOf(r.body), homeTitle });
  if (verdict) fail(`${url} — ${verdict}`);
  else pass(`${url.replace(ORIGIN, "")}`);
}

/* --------------------------------------------------- 4. the cited vendor pages */

if (!flag("--no-sources")) {
  console.log(`\n  Re-reading the pages the vendor datasets cite:`);
  try {
    const out = execFileSync(process.execPath, [
      "--disable-warning=MODULE_TYPELESS_PACKAGE_JSON",
      new URL("./recheck-sources.mjs", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"),
    ], { encoding: "utf8", cwd: new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1") });
    console.log("    " + (out.trim().split("\n").pop() || ""));
    pass("every cited source still contains the sentence its verdict rests on");
  } catch (e) {
    const tail = ((e.stdout || "") + (e.stderr || "")).trim().split("\n").slice(-6).join("\n    ");
    fail(`recheck:sources reported a problem:\n    ${tail}`);
  }
}

/* ------------------------------------------------------------- 5. IndexNow */

if (added.length && !flag("--no-indexnow")) {
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "qrixtools.com",
        key: INDEXNOW_KEY,
        keyLocation: `${ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList: added.slice(0, 100),
      }),
    });
    console.log(`\n  IndexNow: submitted ${added.length} new URL(s) -> HTTP ${res.status}`);
    added.slice(0, 10).forEach((u) => console.log(`        + ${u}`));
  } catch (e) {
    fail(`IndexNow submission failed: ${e.message}`);
  }
} else if (added.length) {
  console.log(`\n  IndexNow: ${added.length} new URL(s) NOT submitted (--no-indexnow)`);
}

/* -------------------------------------------------------------- the verdict */

const clean = problems.length === 0;
if (clean || flag("--update-baseline")) {
  writeFileSync(
    BASELINE,
    JSON.stringify({ date: new Date().toISOString().slice(0, 10), count: current.length, urls: current.sort() }, null, 0) + "\n",
  );
  console.log(`\n  baseline updated: ${current.length} URLs`);
} else {
  console.log(`\n  baseline NOT updated — a baseline that advances through a regression reports the loss once and then calls it normal`);
}

console.log(
  clean
    ? `\nVERIFY: ok — ${targets.length} URLs, robots, sitemap ${current.length}${added.length ? ` (+${added.length})` : ""}${flag("--no-sources") ? "" : ", vendor sources"}`
    : `\nVERIFY: issues — ${problems.length} problem(s):\n` + problems.map((p) => `  · ${p}`).join("\n"),
);
process.exit(clean ? 0 : 1);
