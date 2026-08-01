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
import { robotsVerdict, titleCanonicalVerdict } from "./verify-rules.mjs";

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

ok("verify:daily is registered in package.json", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(pkg.scripts["verify:daily"], "unregistered scripts do not get run");
});

console.log(`\n  ${pass} assertions passed.`);
if (failures.length) {
  console.log(`  ${failures.length} FAILED: ${failures.join(", ")}`);
  process.exit(1);
}
