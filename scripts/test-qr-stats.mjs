/* Assertions for lib/qr-stats.ts — the dataset behind /qr-code-statistics.
 *
 * Why this file exists: the page's entire claim to being worth citing is that
 * every number on it links to the page that number was read off, and that
 * anything weaker than a government statistic says so out loud. That promise
 * decays the moment someone adds a stat in a hurry — a missing link or a
 * blank caveat looks fine in the rendered page, because a source line that
 * isn't there simply doesn't render. So it is asserted here instead.
 *
 * It imports the SHIPPED module (Node 22.18+/24 strips the types natively).
 *
 *   node scripts/test-qr-stats.mjs      (or: npm run test:qr-stats)
 */

import assert from "node:assert/strict";
import { STAT_GROUPS, ALL_STATS, REJECTED, FTC_ALERT } from "../lib/qr-stats.ts";

let pass = 0;
const ok = (label, fn) => {
  try {
    fn();
    pass++;
  } catch (err) {
    console.error(`\n  FAIL  ${label}\n        ${err.message}\n`);
    process.exitCode = 1;
  }
};

const KINDS = new Set(["government", "analyst", "vendor-platform", "vendor-survey", "regulator"]);

/* ---- the promise the page makes in public -------------------------------- */

ok("the page carries at least 20 stats", () => {
  assert.ok(ALL_STATS.length >= 20, `only ${ALL_STATS.length} stats`);
});

ok("every stat has a source URL that is a real https link", () => {
  for (const s of ALL_STATS) {
    assert.ok(s.source, `${s.id}: no source`);
    assert.match(s.source.url, /^https:\/\/[^\s]+\.[^\s]+/, `${s.id}: bad source url "${s.source.url}"`);
  }
});

ok("every stat names its source and when that source was published", () => {
  for (const s of ALL_STATS) {
    assert.ok(s.source.name.trim().length > 8, `${s.id}: source name too thin`);
    assert.ok(s.source.published.trim().length > 3, `${s.id}: no publication date`);
  }
});

ok("every source kind is one of the five declared tiers", () => {
  for (const s of ALL_STATS) {
    assert.ok(KINDS.has(s.source.kind), `${s.id}: unknown kind "${s.source.kind}"`);
  }
});

ok("every stat that is not a government statistic carries a caveat", () => {
  for (const s of ALL_STATS) {
    if (s.source.kind === "government") continue;
    assert.ok(s.caveat && s.caveat.trim().length > 20, `${s.id}: ${s.source.kind} stat with no real caveat`);
  }
});

ok("every stat states a value, a claim and a period", () => {
  for (const s of ALL_STATS) {
    assert.ok(s.value.trim(), `${s.id}: no value`);
    assert.ok(s.claim.trim().length > 20, `${s.id}: claim too thin to survive being quoted alone`);
    assert.ok(s.period.trim(), `${s.id}: no period`);
  }
});

/* ---- structural sanity --------------------------------------------------- */

ok("stat ids are unique", () => {
  const ids = ALL_STATS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate stat id");
});

ok("group ids are unique and every group has stats and an intro", () => {
  const ids = STAT_GROUPS.map((g) => g.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate group id");
  for (const g of STAT_GROUPS) {
    assert.ok(g.stats.length > 0, `${g.id}: empty group`);
    assert.ok(g.intro.trim().length > 40, `${g.id}: intro too thin`);
    assert.ok(g.title.trim(), `${g.id}: no title`);
  }
});

ok("ALL_STATS is exactly the groups flattened", () => {
  assert.equal(ALL_STATS.length, STAT_GROUPS.reduce((n, g) => n + g.stats.length, 0));
});

/* ---- the part that makes the page worth citing --------------------------- */

ok("the rejected list is populated and each entry says what was checked", () => {
  assert.ok(REJECTED.length >= 3, "a stats page with nothing rejected did not check anything");
  for (const r of REJECTED) {
    assert.ok(r.claim.trim().length > 15, "rejected entry with no claim");
    assert.ok(r.finding.trim().length > 60, `rejected "${r.claim.slice(0, 30)}…": finding too thin to be a finding`);
  }
});

ok("more than one independent source is represented", () => {
  const hosts = new Set(ALL_STATS.map((s) => new URL(s.source.url).host));
  assert.ok(hosts.size >= 3, `only ${hosts.size} distinct source host(s) — that is one vendor's press kit, not a survey of the field`);
});

ok("at least one source is a government or regulator", () => {
  const hard = ALL_STATS.filter((s) => s.source.kind === "government" || s.source.kind === "regulator");
  assert.ok(hard.length >= 1, "no hard-tier source on the page");
});

ok("the FTC alert used in the security callout is a real ftc.gov link", () => {
  assert.equal(new URL(FTC_ALERT.url).host, "consumer.ftc.gov");
  assert.equal(FTC_ALERT.kind, "regulator");
});

/* -------------------------------------------------------------------------- */

if (process.exitCode) {
  console.error(`\n${pass} passed, suite FAILED\n`);
} else {
  console.log(`\n  qr-stats: ${pass} assertions passed over ${ALL_STATS.length} stats, ${REJECTED.length} rejected claims\n`);
}
