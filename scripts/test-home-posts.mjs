/* The homepage's three blog cards are inlined, so they can go stale. This is the
 * guard that says so out loud.
 *
 * components/LatestPosts.tsx used to call allPostsSorted(), which put all 88 KB of
 * lib/blog in the eager bundle of every homepage view to read four fields off the
 * top three posts. The data is inlined in lib/home-posts.ts instead — see that
 * file for why deferring it was the wrong shape (the three links are the only
 * crawlable path from the root into the blog, and a crawler does not scroll).
 *
 * Inlining buys bytes and pays in drift: append a newer post to lib/blog and the
 * homepage silently keeps showing the previous three. Nothing about the page
 * LOOKS wrong when that happens, which is exactly the failure this file exists to
 * catch. On failure it prints the corrected block ready to paste.
 *
 *   node scripts/test-home-posts.mjs      (or: npm run test:home-posts)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { allPostsSorted, getPost } from "../lib/blog.ts";
import { HOME_POSTS } from "../lib/home-posts.ts";

let pass = 0;
let failed = 0;
const ok = (label, fn) => {
  try {
    fn();
    pass++;
  } catch (err) {
    console.error(`\n  FAIL  ${label}\n        ${err.message}\n`);
    failed++;
    process.exitCode = 1;
  }
};

const FIELDS = ["slug", "title", "category", "readMins"];
const card = (p) => Object.fromEntries(FIELDS.map((f) => [f, p[f]]));
const latest = allPostsSorted().slice(0, 3).map(card);

/** What lib/home-posts.ts should contain right now, ready to paste. */
const block = () =>
  "export const HOME_POSTS: HomePostCard[] = [\n" +
  latest
    .map(
      (p) =>
        "  {\n" +
        `    slug: ${JSON.stringify(p.slug)},\n` +
        `    title: ${JSON.stringify(p.title)},\n` +
        `    category: ${JSON.stringify(p.category)},\n` +
        `    readMins: ${p.readMins},\n` +
        "  },",
    )
    .join("\n") +
  "\n];";

/* ---- the list is the real latest three ------------------------------------- */

ok("the homepage shows the three most recent posts", () => {
  assert.deepEqual(
    HOME_POSTS.map(card),
    latest,
    "HOME_POSTS has drifted from lib/blog — the homepage is showing stale cards.\n" +
      "        Paste this into lib/home-posts.ts:\n\n" +
      block() +
      "\n",
  );
});

ok("it shows exactly three, because the section is a three-column grid", () => {
  assert.equal(HOME_POSTS.length, 3, `HOME_POSTS has ${HOME_POSTS.length} entries; the grid lays out 3`);
});

/* ---- and every card points somewhere real ---------------------------------- */
/* These slugs are rendered as /blog/<slug> into the homepage's server HTML, so a
 * typo here is a 404 on the site's most crawled page — not a broken build. */

ok("every card links to a post that exists", () => {
  for (const p of HOME_POSTS) {
    assert.ok(getPost(p.slug), `/blog/${p.slug} is linked from the homepage but no such post exists`);
  }
});

ok("no card is missing a field the section paints", () => {
  for (const p of HOME_POSTS) {
    for (const f of FIELDS) {
      assert.ok(p[f] !== undefined && p[f] !== "", `${p.slug} has no ${f}`);
    }
    assert.ok(Number.isInteger(p.readMins) && p.readMins > 0, `${p.slug} has a nonsense readMins: ${p.readMins}`);
  }
});

/* ---- the import boundary that made this file necessary --------------------- */

ok("LatestPosts does not reach back into the post catalog", () => {
  const src = readFileSync(new URL("../components/LatestPosts.tsx", import.meta.url), "utf8");
  assert.ok(
    !/^\s*import\s+(?!type\s)[^;]*?from\s*["'][^"']*\/blog["']/m.test(src),
    "LatestPosts imports lib/blog again — the 88 KB catalog is back on every homepage view",
  );
  assert.ok(/HOME_POSTS/.test(src), "LatestPosts no longer reads the inlined cards");
});

console.log(`\n  home-posts: ${pass}/${pass + failed} checks passed\n`);
