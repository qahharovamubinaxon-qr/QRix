/* The two rules in the daily verify pass that cannot be proved against
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

const trimSlash = (s) => String(s).replace(/\/+$/, "");
