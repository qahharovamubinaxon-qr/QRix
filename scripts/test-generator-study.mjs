/* Assertions for lib/qr-generator-study.ts — the dataset behind
 * /free-qr-code-generator-comparison.
 *
 * Why this file exists. This page exists because /free-forever shipped an
 * invented statistic ("a test of 20 free QR generators found 14..."). The only
 * thing that stops the replacement from decaying into the same failure is a
 * machine that refuses two specific mistakes:
 *
 *   1. A verdict with no evidence behind it. In the rendered page a thin note
 *      looks identical to a thorough one — both are just grey text under a
 *      tick. So note length and source presence are asserted here.
 *   2. A number typed into JSX. The moment someone writes "13" into the page
 *      instead of reading COUNTS, the page and the dataset can disagree and
 *      nobody will notice. So the JSX is scanned for hardcoded counts.
 *
 * It imports the SHIPPED module (Node 22.18+/24 strips the types natively).
 *
 *   node scripts/test-generator-study.mjs   (or: npm run test:study)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  VENDORS, SELF, CHECK_LABELS, COUNTS, LIMITED, NO_LIMIT_FOUND, STUDY_DATE,
  hasKillSwitch, hasFrictionOnly,
} from "../lib/qr-generator-study.ts";

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

const PAGE = readFileSync(new URL("../app/free-qr-code-generator-comparison/page.tsx", import.meta.url), "utf8");
const FREE_FOREVER = readFileSync(new URL("../app/free-forever/page.tsx", import.meta.url), "utf8");
const VERDICTS = new Set(["ok", "limit", "na", "unknown"]);
const KEYS = CHECK_LABELS.map((c) => c.key);
const ALL = [...VENDORS, SELF];

/* ---- the promise the page makes in public --------------------------------
   "Every answer links to the page it came from, and says 'not stated' where
   the vendor did not answer." Both halves are enforced below. */

ok("the study covers exactly the number of vendors the page claims", () => {
  assert.equal(VENDORS.length, 20);
  assert.equal(COUNTS.total, VENDORS.length);
});

ok("every vendor answers all six questions with a known verdict", () => {
  for (const v of ALL) {
    assert.deepEqual(Object.keys(v.checks).sort(), [...KEYS].sort(), `${v.id} check keys`);
    for (const k of KEYS) {
      assert.ok(VERDICTS.has(v.checks[k].v), `${v.id}.${k} verdict "${v.checks[k].v}" is not a known verdict`);
    }
  }
});

ok("no verdict ships without evidence written next to it", () => {
  for (const v of ALL) {
    for (const k of KEYS) {
      const { v: verdict, note } = v.checks[k];
      // An `unknown` is allowed to be terse — "not stated on the page checked"
      // IS the whole finding, and padding it would only make it sound researched.
      // Everything else asserts something about a vendor and has to show why.
      const min = verdict === "unknown" ? 25 : 40;
      assert.ok(note && note.trim().length >= min,
        `${v.id}.${k} is "${verdict}" with a ${note.trim().length}-char note — a verdict this thin is an assertion, not a finding`);
      assert.ok(!/\.\.\.$|TODO|TBD/i.test(note), `${v.id}.${k} note looks unfinished`);
    }
  }
});

ok("an `unknown` verdict actually says the page did not answer", () => {
  for (const v of ALL) {
    for (const k of KEYS) {
      if (v.checks[k].v !== "unknown") continue;
      assert.match(v.checks[k].note, /not stated|not answered|does not state|not listed|not addressed|does not let/i,
        `${v.id}.${k} is unknown but its note does not say the vendor did not answer: "${v.checks[k].note}"`);
    }
  }
});

ok("every vendor links to the exact page it was read from, on its own domain", () => {
  for (const v of VENDORS) {
    assert.match(v.sourceUrl, /^https:\/\//, `${v.id} source must be an https URL`);
    const host = new URL(v.sourceUrl).hostname.replace(/^www\./, "");
    assert.ok(host.endsWith(v.host), `${v.id} source host ${host} does not match declared host ${v.host}`);
    assert.ok(v.sourceLabel.trim().length >= 3, `${v.id} needs a source label`);
  }
});

ok("every vendor carries the date its page was read, and it is not in the future", () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const v of ALL) {
    assert.match(v.checked, /^\d{4}-\d{2}-\d{2}$/, `${v.id} checked date must be ISO`);
    assert.ok(v.checked <= today, `${v.id} was read on ${v.checked}, which is in the future`);
  }
  assert.match(STUDY_DATE, /^\d{4}-\d{2}-\d{2}$/);
});

ok("vendor ids, names and hosts are unique", () => {
  for (const field of ["id", "name", "host"]) {
    const seen = new Set();
    for (const v of ALL) {
      assert.ok(!seen.has(v[field]), `duplicate ${field}: ${v[field]}`);
      seen.add(v[field]);
    }
  }
});

ok("every vendor has a headline that is a sentence, not a label", () => {
  for (const v of ALL) {
    assert.ok(v.headline.trim().length >= 60, `${v.id} headline is too short to say anything`);
    assert.match(v.headline.trim(), /\.$/, `${v.id} headline should be a full sentence`);
  }
});

/* ---- the counts, recomputed independently of the module's own helpers ---- */

ok("COUNTS matches an independent recount of the dataset", () => {
  const kill = ["permanent", "freeDynamic", "scanCap", "unbranded"];
  const limited = VENDORS.filter((v) => kill.some((k) => v.checks[k].v === "limit"));
  assert.equal(COUNTS.limited, limited.length, "limited count drifted");
  assert.equal(COUNTS.clean, VENDORS.length - limited.length, "clean count drifted");
  assert.equal(COUNTS.limited + COUNTS.clean, COUNTS.total, "limited + clean must be every vendor");
  assert.equal(COUNTS.scanCapped, VENDORS.filter((v) => v.checks.scanCap.v === "limit").length);
  assert.equal(COUNTS.branded, VENDORS.filter((v) => v.checks.unbranded.v === "limit").length);
  assert.equal(COUNTS.accountRequired, VENDORS.filter((v) => v.checks.noAccount.v === "limit").length);
  assert.equal(COUNTS.vectorPaywalled, VENDORS.filter((v) => v.checks.vector.v === "limit").length);
  assert.equal(LIMITED.length, COUNTS.limited);
  assert.equal(NO_LIMIT_FOUND.length, COUNTS.clean);
});

ok("the kill-switch and friction splits are disjoint and complete", () => {
  for (const v of VENDORS) {
    assert.ok(!(hasKillSwitch(v) && hasFrictionOnly(v)), `${v.id} counted in both buckets`);
  }
  assert.equal(COUNTS.frictionOnly, VENDORS.filter(hasFrictionOnly).length);
});

ok("the headline finding the page states in prose is true of the data", () => {
  // "All N of the static-only tools had nothing that could switch a printed code off."
  const staticOnly = VENDORS.filter((v) => v.shape === "static-only");
  assert.ok(staticOnly.length > 0, "the study needs static-only tools for the finding to exist");
  for (const v of staticOnly) {
    assert.ok(!hasKillSwitch(v),
      `${v.id} is static-only but has a kill switch — the page's central claim no longer holds and the prose must change`);
  }
  assert.equal(COUNTS.cleanAndStaticOnly, staticOnly.length);
});

/* ---- the part that keeps the page honest about itself -------------------- */

ok("QRix is graded on the same scale and does not come out spotless", () => {
  assert.deepEqual(Object.keys(SELF.checks).sort(), [...KEYS].sort());
  assert.ok(KEYS.some((k) => SELF.checks[k].v === "limit"),
    "SELF has no `limit` on any check — a comparison page that finds nothing wrong with its own product is an advert");
  assert.equal(SELF.checks.freeDynamic.v, "limit",
    "our dynamic codes depend on our redirect staying up; that row must stay a limit");
});

ok("SELF is excluded from the vendor counts", () => {
  assert.ok(!VENDORS.some((v) => v.id === SELF.id), "SELF must not be inside VENDORS or it inflates the counts");
});

/* ---- no number typed by hand -------------------------------------------- */

ok("the page renders its counts from the dataset, never as literals", () => {
  const body = PAGE.replace(/\/\*[\s\S]*?\*\//g, "");
  for (const n of [COUNTS.total, COUNTS.limited, COUNTS.clean, COUNTS.scanCapped, COUNTS.branded]) {
    const literal = new RegExp(`>\\s*${n}\\s*<|"${n}"|\\b${n} of \\d+`, "g");
    assert.ok(!literal.test(body),
      `the page hardcodes ${n} instead of reading COUNTS — the dataset and the page can now disagree silently`);
  }
  assert.ok(body.includes("COUNTS."), "the page must read COUNTS");
});

ok("/free-forever no longer carries the invented figure, and reads the dataset", () => {
  // Strip comments first: the commit that removed these ghosts also NAMES them,
  // and a scanner that cannot tell a warning from a relapse is useless.
  const ff = FREE_FOREVER.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!/test of 20 .{0,12}free.{0,12} QR generators found 14/i.test(ff),
    "the fabricated sentence is back on /free-forever");
  assert.ok(ff.includes("qr-generator-study"), "/free-forever must derive its numbers from the study");
  assert.ok(ff.includes("free-qr-code-generator-comparison"), "/free-forever must link to the study");
  // the old invented ranges
  for (const ghost of ["100–500", "7–14 day trial", "1–9"]) {
    assert.ok(!ff.includes(ghost), `/free-forever still carries the unmeasured range "${ghost}"`);
  }
});

ok("the page ships schema, a real tool and the method, not just a table", () => {
  assert.ok(PAGE.includes("breadcrumbLd") && PAGE.includes("faqLd"), "breadcrumb + FAQ schema required");
  assert.ok(PAGE.includes('"@type": "Article"'), "Article schema required");
  assert.ok(PAGE.includes("citation:"), "the Article must cite the vendor pages it was built from");
  assert.ok(PAGE.includes("QRGeneratorByType"), "quality bar: a working tool must be embedded");
  assert.ok(/rel="nofollow noopener"/.test(PAGE), "outbound vendor links must be nofollow");
});

ok("the page declares at least four FAQs", () => {
  const faqs = (PAGE.match(/^\s{2}\{\s*$/gm) || []).length;
  assert.ok(PAGE.includes("const FAQS"), "FAQS block required");
  assert.ok(faqs >= 4, `expected 4+ FAQ entries, structure suggests ${faqs}`);
});

ok("the page is registered where a new page has to be registered", () => {
  const sitemap = readFileSync(new URL("../app/sitemap.ts", import.meta.url), "utf8");
  const search = readFileSync(new URL("../lib/search-index.ts", import.meta.url), "utf8");
  const llms = readFileSync(new URL("../public/llms.txt", import.meta.url), "utf8");
  for (const [name, src] of [["sitemap", sitemap], ["search-index", search], ["llms.txt", llms]]) {
    assert.ok(src.includes("free-qr-code-generator-comparison"), `not registered in ${name}`);
  }
});

console.log(`\n  ${pass} assertions passed over ${VENDORS.length} vendors (+ self).`);
console.log(`  ${COUNTS.limited}/${COUNTS.total} attach a catch · ${COUNTS.clean} clean (${COUNTS.cleanAndStaticOnly} static-only) · read ${STUDY_DATE}\n`);
