/* The rules in the daily verify pass that cannot be proved against
 * production, kept pure so they can be.
 *
 * The live site is correct, which is the problem: driving these through the
 * network only ever exercises the happy path, and a rule that has never seen
 * its own failure case is a rule nobody has tested. scripts/test-verify.mjs
 * feeds them the broken variants by hand — including the exact robots.txt that
 * once blocked 27 pages.
 */

/** null when robots.txt is fine, else the reason it is not. */
export function robotsVerdict(body) {
  const lines = body.split(/\r?\n/).map((l) => l.trim());
  /* Anchored line membership, never a substring test. "Disallow: /p" is a
     PREFIX of "Disallow: /p$", so `body.includes("Disallow: /p")` is true on
     the fixed file AND the broken one — a substring check would have reported
     the 27-page outage as healthy. That is the whole reason this is a function
     with a test rather than two lines inline. */
  if (!lines.includes("Disallow: /p$")) {
    return "robots.txt no longer serves the anchored `Disallow: /p$`";
  }
  if (lines.includes("Disallow: /p")) {
    return "robots.txt serves a BARE `Disallow: /p` — this blocked 27 pages once";
  }
  return null;
}

/** null when the page's title/canonical are fine, else why they are not. */
export function titleCanonicalVerdict({ url, canonical, title, homeTitle }) {
  const bad = [];
  if (!canonical) bad.push("no canonical");
  else if (trimSlash(canonical) !== trimSlash(url)) bad.push(`canonical -> ${canonical}`);
  if (!title) bad.push("no title");
  /* A "use client" route with no sibling layout inherits the homepage's
     metadata wholesale — it 200s, it looks fine, and it cannot rank. Comparing
     against the homepage title is the cheapest way to see it from outside. */
  else if (homeTitle && title === homeTitle) bad.push("inherits the HOMEPAGE title (client-page canonical trap)");
  return bad.length ? bad.join(" · ") : null;
}

/* Pull the parts of a recheck:sources run that the daily pass reports.
 *
 * The daily pass used to print `out.split("\n").pop()` — the LAST line — on the
 * assumption that recheck's summary is the last thing it writes. It is not:
 * anything advisory (a source aged past PUBLISHED_STALE_MONTHS, a read older
 * than STALE_DAYS) prints AFTER the summary, so the moment one fires, the daily
 * log stops carrying the counts and carries one arbitrary advisory row instead.
 * That is how 2026-08-05 logged `ftc-alert … (~18 months)` where every earlier
 * day logged `N sources · M markers · …`, and it hid a real change — the
 * datasets had gone 24 -> 29 sources and 50 -> 73 markers with nothing saying so.
 *
 * Same reason robotsVerdict lives here: production is healthy, so the happy path
 * has no advisory at all and prints the summary correctly. The bug is only
 * reachable through output the network will not produce on demand.
 */
export function recheckReport(stdout) {
  const lines = String(stdout).split(/\r?\n/).map((l) => l.replace(/\s+$/, ""));
  /* Anchored on the summary's own shape, not on its position. */
  const summary = lines.find((l) => /^\d+ sources · /.test(l.trim()))?.trim() || null;
  /* Every advisory row, so the log carries ALL of them rather than the last. */
  const notes = lines
    .filter((l) => /\(~\d+ months?\)\s*$/.test(l) || /— read \d+ days ago/.test(l))
    .map((l) => l.trim().replace(/\s{2,}/g, " "));
  return { summary, notes };
}

const trimSlash = (s) => String(s).replace(/\/+$/, "");
