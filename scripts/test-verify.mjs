/* Guard for the daily verify pass.
 *
 * npm run verify:daily proves the SITE is healthy. This proves the CHECK is,
 * which is a different question and the one that has actually bitten: the
 * robots.txt rule guards against a value that is a strict prefix of the correct
 * one, so the obvious implementation (`body.includes("Disallow: /p")`) reports
 * the broken file as healthy. Production is currently correct, so running the
 * real pass can never distinguish a working rule from a broken one — the
 * failure cases have to be fed in by hand. That is what this does.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { robotsVerdict, titleCanonicalVerdict, recheckReport } from "./verify-rules.mjs";

let pass = 0;
const failures = [];
function ok(name, fn) {
  try { fn(); pass++; console.log(`  ok    ${name}`); }
  catch (e) { failures.push(name); console.log(`  FAIL  ${name}\n        ${e.message}`); }
}

const GOOD_ROBOTS = `User-Agent: *
Allow: /
Disallow: /dashboard
Disallow: /api/
Disallow: /r/
Disallow: /p$
Disallow: /pin
Disallow: /admin

Host: https://qrixtools.com
Sitemap: https://qrixtools.com/sitemap.xml`;

ok("the healthy robots.txt passes", () => {
  assert.equal(robotsVerdict(GOOD_ROBOTS), null);
});

ok("the exact robots.txt that blocked 27 pages is caught", () => {
  // The regression as it actually shipped: the anchor dropped off.
  const broken = GOOD_ROBOTS.replace("Disallow: /p$", "Disallow: /p");
  const v = robotsVerdict(broken);
  assert.ok(v, "a bare `Disallow: /p` was reported as healthy — this is the 27-page outage");
  assert.match(v, /BARE|anchored/);
});

ok("a bare /p ADDED alongside the anchored one is still caught", () => {
  // The subtler shape: both lines present. A rule that only checks the good
  // line exists passes this, and the site is still blocked.
  const broken = GOOD_ROBOTS.replace("Disallow: /p$", "Disallow: /p$\nDisallow: /p");
  assert.match(robotsVerdict(broken) || "", /BARE/);
});

ok("robots.txt losing the rule entirely is caught", () => {
  assert.match(robotsVerdict(GOOD_ROBOTS.replace("Disallow: /p$\n", "")) || "", /no longer serves/);
});

ok("CRLF line endings do not read as a missing rule", () => {
  assert.equal(robotsVerdict(GOOD_ROBOTS.replace(/\n/g, "\r\n")), null);
});

const HOME = "QRix — Free QR Code, PDF & Image Tools";
const U = "https://qrixtools.com/blog/example-post";

ok("a healthy page passes", () => {
  assert.equal(
    titleCanonicalVerdict({ url: U, canonical: U, title: "How to X | QRix", homeTitle: HOME }),
    null,
  );
});

ok("a trailing slash is not a canonical mismatch", () => {
  assert.equal(
    titleCanonicalVerdict({ url: U, canonical: U + "/", title: "How to X | QRix", homeTitle: HOME }),
    null,
  );
});

ok("a page canonicalising elsewhere is caught", () => {
  assert.match(
    titleCanonicalVerdict({ url: U, canonical: "https://qrixtools.com/", title: "How to X", homeTitle: HOME }) || "",
    /canonical ->/,
  );
});

ok("the client-page title trap is caught", () => {
  // A "use client" route with no sibling layout serves the homepage's metadata:
  // 200, canonical fine, unrankable. Title equality is how it shows from outside.
  assert.match(
    titleCanonicalVerdict({ url: U, canonical: U, title: HOME, homeTitle: HOME }) || "",
    /HOMEPAGE title/,
  );
});

ok("a missing canonical or title is caught", () => {
  assert.match(titleCanonicalVerdict({ url: U, canonical: null, title: "X", homeTitle: HOME }) || "", /no canonical/);
  assert.match(titleCanonicalVerdict({ url: U, canonical: U, title: null, homeTitle: HOME }) || "", /no title/);
});

/* ---- what the daily pass reports out of a recheck:sources run ----
   Both fixtures are real output. The QUIET one is what production produced for
   months; the ADVISORY one is 2026-08-05, the day a source aged past the notice
   threshold and the daily log silently stopped carrying the counts. */

const RECHECK_QUIET = `QRix source re-check

  ok           bitly-scans              5 markers
  ok           ftc-alert                2 markers

24 sources · 50 markers · 0 moved · 0 unreachable · 0 older than 120d
`;

const RECHECK_ADVISORY = `${RECHECK_QUIET.replace("24 sources · 50 markers", "29 sources · 73 markers")}
FYI — published over 14 months ago. Not a failure: a dated press release that still says what we quote is dated, not wrong. Worth asking
whether a newer edition exists:
  juniper                  published 10 February 2025 (~17 months)
  ftc-alert                published January 2025 (~18 months)
`;

ok("the counts survive an advisory printed after them", () => {
  const { summary } = recheckReport(RECHECK_ADVISORY);
  /* The bug exactly: `.pop()` here returns the ftc-alert row, and the daily log
     loses the one line that says how big the dataset is. */
  assert.match(summary || "", /^29 sources · 73 markers · 0 moved/,
    "the summary was not recovered — the daily log is reporting an advisory row as its counts");
});

ok("the quiet run still reports its counts", () => {
  assert.match(recheckReport(RECHECK_QUIET).summary || "", /^24 sources · 50 markers/);
  assert.equal(recheckReport(RECHECK_QUIET).notes.length, 0, "a clean run has nothing to flag");
});

ok("EVERY aged source is surfaced, not just the last one", () => {
  const { notes } = recheckReport(RECHECK_ADVISORY);
  /* Two sources aged past the threshold on 2026-08-05 and the pass named one.
     Reporting a subset of a list is worse than reporting none of it: it reads
     as the whole list. */
  assert.equal(notes.length, 2, `expected both aged rows, got ${notes.length}: ${notes.join(" | ")}`);
  assert.ok(notes.some((n) => /\bjuniper\b/.test(n)), "juniper went unreported");
  assert.ok(notes.some((n) => /\bftc-alert\b/.test(n)), "ftc-alert went unreported");
});

ok("a run with no summary at all says so instead of inventing one", () => {
  /* If recheck dies before printing the summary, the honest answer is null —
     the earlier code would have handed the daily log whatever line came last,
     which on a crash is a stack frame. */
  assert.equal(recheckReport("QRix source re-check\n  ok  bitly-scans  5 markers\n").summary, null);
  assert.equal(recheckReport("").summary, null);
});

/* ---- structural properties of the runner itself ---- */

const RUNNER = readFileSync(new URL("./daily-verify.mjs", import.meta.url), "utf8");

ok("the runner refuses to proceed on a suspiciously small sitemap", () => {
  assert.match(RUNNER, /entries\.length < 100/,
    "without a floor, a broken sitemap parse makes every check below pass vacuously");
});

ok("the baseline does not advance through a regression", () => {
  assert.match(RUNNER, /clean \|\| flag\("--update-baseline"\)/,
    "a baseline that updates after a failure reports a lost page once and then calls it normal");
});

ok("the runner uses the shared rules rather than reimplementing them", () => {
  assert.match(RUNNER, /from "\.\/verify-rules\.mjs"/);
  /* Match the LOGIC, not the word. The first version of this assertion searched
     the runner for "Disallow: /p$" and failed on the success message that says
     the check passed — a guard tripping over prose about itself, which is the
     M150 comment-stripper lesson arriving from a new direction. What must not
     reappear is a membership test against a robots directive. */
  assert.ok(!/\.includes\(\s*["'`]Disallow:/.test(RUNNER),
    "the robots rule is inlined again — the tested copy and the running copy have drifted");
  assert.ok(!/inherits the HOMEPAGE title/.test(RUNNER.replace(/^\s*\*.*$/gm, "")),
    "the title rule is inlined again");
});

ok("the runner does not go back to reading recheck's last line", () => {
  /* The SHAPE is the defect, not the value: "the last line is the summary" is
     an assumption that holds only on days nothing needs attention, which is
     most days — so this cannot be left to be noticed. Comments are stripped
     first; the one above reportRecheck describes the bug and would match. */
  const code = RUNNER.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!/\.split\([^)]*\)\s*\.pop\(\)/.test(code),
    "recheck's output is being read positionally again — advisories print after the summary");
  assert.match(code, /recheckReport\(/, "the runner stopped using the tested extractor");
});

ok("verify:daily is registered in package.json", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(pkg.scripts["verify:daily"], "unregistered scripts do not get run");
});

console.log(`\n  ${pass} assertions passed.`);
if (failures.length) {
  console.log(`  ${failures.length} FAILED: ${failures.join(", ")}`);
  process.exit(1);
}
