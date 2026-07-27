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
import { readFileSync, existsSync } from "node:fs";
import { register } from "node:module";
import { STAT_GROUPS, ALL_STATS, REJECTED, FTC_ALERT, KIND_LABEL, KIND_TONE, embedHeight, embedSnippet, EMBED_WIDTH_BASIS } from "../lib/qr-stats.ts";

/* qr-stat-embed resolves the dataset through the "@/" alias, so the hook has to
   be registered before it loads — hence the dynamic import (same shape as
   scripts/test-ai-claims.mjs). */
register("./alias-hooks.mjs", import.meta.url);
const { renderStatEmbed, esc, toneHex, TOKEN_HEX } = await import("../lib/qr-stat-embed.ts");

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

/* ------------------------------------------------------- the embeddable card */
/* The card at /embed/qr-stat/<id> is what turns this page's "please cite us"
 * ask into a mechanism. It travels to other people's sites, so whatever it
 * carries has to be guaranteed here — nobody re-checks an iframe after it ships. */

ok("every stat can be embedded, and its id is URL-safe", () => {
  for (const s of ALL_STATS) {
    assert.match(s.id, /^[a-z0-9-]+$/, `stat id ${JSON.stringify(s.id)} would need escaping in an embed URL`);
  }
  const ids = ALL_STATS.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, "two stats share an id — one embed route would shadow the other");
});

ok("the snippet points at its own card, at the computed size", () => {
  for (const s of ALL_STATS) {
    const snip = embedSnippet(s, "https://qrixtools.com");
    assert.ok(snip.includes("/embed/qr-stat/" + s.id), s.id + ": snippet does not point at its own card");
    assert.ok(snip.includes('height="' + embedHeight(s) + '"'), s.id + ": snippet height is not the computed one");
    assert.ok(/loading="lazy"/.test(snip), s.id + ": the embed would block the host page");
    /* the claim goes into title="...", so a quote in it must not close it early */
    assert.ok(!snip.includes('title="' + s.claim + '"') || !s.claim.includes('"'), s.id + ": unescaped quote in the title attribute");
  }
});

ok("the computed height leaves room for the text it must hold", () => {
  /* Sized for a narrow (EMBED_WIDTH_BASIS) column, the worst case inside a blog
   * body. Too tall is invisible — the card centres and paints no background of
   * its own. Too short clips the caveat, which is the part that must survive. */
  assert.equal(EMBED_WIDTH_BASIS, 320, "the height estimate was calibrated at 320px; recalibrate it before changing this");
  for (const s of ALL_STATS) {
    const h = embedHeight(s);
    const text = s.claim.length + (s.caveat ? s.caveat.length : 0);
    assert.ok(h >= 150, s.id + ": " + h + "px cannot fit even the chrome");
    assert.ok(h >= 150 + text / 4, s.id + ": " + h + "px for " + text + " chars of text will clip");
    assert.ok(h <= 900, s.id + ": " + h + "px is a runaway estimate, not a card");
  }
});

ok("every tier a stat carries has a label and a colour", () => {
  for (const s of ALL_STATS) {
    assert.ok(KIND_LABEL[s.source.kind], "no label for tier " + s.source.kind + " — the embed would render a blank badge");
    assert.ok(KIND_TONE[s.source.kind], "no colour for tier " + s.source.kind);
  }
});

ok("every rendered card carries the caveat, the source and its date", () => {
  /* This page exists because these figures get quoted without their conditions.
   * An embed that dropped the caveat would industrialise exactly that.
   *
   * Asserted against the RENDERED DOCUMENT, one per stat, rather than against
   * the component source (M141). The old version of this test grepped the JSX
   * for `{s.caveat}` — which proves the expression is written, not that the
   * text reaches the page, and it could not see a stat whose caveat is missing
   * from the dataset at all. */
  for (const s of ALL_STATS) {
    const doc = renderStatEmbed(s, "https://qrixtools.com");
    const has = (needle, what) => assert.ok(doc.includes(needle), s.id + ": card does not carry " + what);

    has(esc(s.value), "its figure");
    has(esc(s.claim), "what the figure counts");
    has(esc(s.period), "the window it covers");
    has(esc(s.source.name), "its source's name");
    has(esc(s.source.published), "its source's publication date");
    has(esc(s.source.url), "a link to the source");
    has(KIND_LABEL[s.source.kind], "its tier label");
    has(toneHex(s.source.kind), "its tier colour");
    has("/qr-code-statistics?utm_source=embed", "a link back");
    has("#" + s.id, "an anchor to its own figure on the page");
    if (s.caveat) has(esc(s.caveat), "its caveat — the part that must survive being quoted");
  }
});

ok("a card is a whole document that ships no script and no CSS token", () => {
  /* It renders on a stranger's site, outside our stylesheet and outside our
   * bundle. A var(--x) here would resolve to nothing there, and a <script> is
   * the entire failure M141 fixed. */
  for (const s of ALL_STATS) {
    const doc = renderStatEmbed(s, "https://qrixtools.com");
    assert.ok(doc.startsWith("<!doctype html>"), s.id + ": card is a fragment, not a document");
    assert.ok(!/<script/i.test(doc), s.id + ": the card ships script");
    assert.ok(!doc.includes("var(--"), s.id + ": a CSS token would resolve to nothing off-site");
    assert.ok(/name="robots" content="noindex/.test(doc), s.id + ": the card is indexable and would compete with the page");
    assert.ok(doc.length < 12000, s.id + ": " + doc.length + " bytes is not a card any more");
  }
});

ok("the card escapes the dataset it interpolates", () => {
  /* The document is built by concatenation and the copy is hand-written prose
   * carrying quotes, ampersands and dashes. One unescaped angle bracket in a
   * source name is markup on someone else's page. */
  const hostile = {
    id: "x", value: '5 & "5"', period: "<b>2025</b>", claim: "<script>alert(1)</script>",
    caveat: "a < b && c > d", source: { name: 'Acme "Labs" & Co', url: "https://e.com/?a=1&b=2", kind: "analyst", published: "1 Jan 2025" },
  };
  const doc = renderStatEmbed(hostile, "https://qrixtools.com");
  assert.ok(!doc.includes("<script>alert(1)</script>"), "a claim can inject markup");
  assert.ok(!doc.includes("<b>2025</b>"), "a period can inject markup");
  assert.ok(doc.includes("&lt;script&gt;alert(1)&lt;/script&gt;"), "the claim was dropped rather than escaped");
  assert.ok(doc.includes("Acme &quot;Labs&quot; &amp; Co"), "a quote in a source name is not escaped");
  assert.ok(doc.includes("a &lt; b &amp;&amp; c &gt; d"), "the caveat is not escaped");
  /* &amp; not &amp;amp; — escaping the escape is the classic second bug here */
  assert.ok(!doc.includes("&amp;amp;"), "text is escaped twice");
});

ok("every tier resolves to a literal colour", () => {
  /* toneHex falls back to --text-faint's grey when a token is unmapped, which
   * renders a plausible-looking badge in the wrong tier colour. Caught here
   * rather than by eye on someone else's blog. */
  for (const kind of KINDS) {
    assert.ok(TOKEN_HEX[KIND_TONE[kind]], "tier " + kind + " uses " + KIND_TONE[kind] + ", which has no literal in TOKEN_HEX");
    assert.match(toneHex(kind), /^#[0-9a-f]{6}$/, "tier " + kind + " did not resolve to a hex colour");
  }
});

ok("the route serves the card itself and 404s on an unknown id", () => {
  const src = readFileSync(new URL("../app/embed/qr-stat/[id]/route.ts", import.meta.url), "utf8");
  assert.ok(/dynamicParams = false/.test(src), "unknown ids would soft-404 at 200 (M118)");
  assert.ok(/status: 404/.test(src), "the handler has no 404 path of its own");
  assert.ok(/x-robots-tag/i.test(src), "the card is indexable at the header level");
  assert.ok(/renderStatEmbed/.test(src), "the route does not render the shared card");
  /* A page under app/ is what put the whole site in the iframe. Keep it a route. */
  assert.ok(
    !existsSync(new URL("../app/embed/qr-stat/[id]/page.tsx", import.meta.url)),
    "the embed is a page again — it renders inside the root layout and ships the site (M141)",
  );
});

/* -------------------------------------------------------------------------- */

if (process.exitCode) {
  console.error(`\n${pass} passed, suite FAILED\n`);
} else {
  console.log(`\n  qr-stats: ${pass} assertions passed over ${ALL_STATS.length} stats, ${REJECTED.length} rejected claims\n`);
}
