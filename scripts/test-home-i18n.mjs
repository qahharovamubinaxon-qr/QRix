/* Assertions for lib/home-i18n/ — the homepage copy, one module per language.
 *
 * Why this file exists: there used to be TWO twelve-language registries,
 * lib/home-i18n.ts (56.2 KB) and lib/home-faq-i18n.ts (29.6 KB), and three
 * CLIENT components each merged one slice of them at module scope. That is a
 * static import, so every visitor downloaded 85.8 KB of copy in twelve
 * languages — zh hi es ar fr pt id de ja tr ur bn — and NOT ONE of those is en,
 * ru or uz, the three languages this site actually serves and the only three
 * authored inline. The audience downloaded the whole registry to read none of
 * it. (M160, the fourth instance of: A CLIENT COMPONENT READING ONE SLICE OF A
 * CONTENT REGISTRY SHIPS THE WHOLE REGISTRY.)
 *
 * Two things can quietly undo that, and both leave a page that looks perfect:
 *   1. someone types `import de from "@/lib/home-i18n/de"` — one language back
 *      in the bundle, then two, then all twelve;
 *   2. a language file is added without a case in loadHomeUi's switch, so it
 *      silently serves English forever and nothing fails.
 * Both are asserted here.
 *
 *   node scripts/test-home-i18n.mjs      (or: npm run test:home-i18n)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readAll, languageFiles } from "./home-i18n-aggregate.mjs";

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

const read = (p) => readFileSync(new URL("../" + p, import.meta.url), "utf8");

/** A static `import ... from "<spec>"` carrying a VALUE — what puts a module in
 *  the eager bundle. `import type` is erased before a bundler sees it; a dynamic
 *  import("<spec>") is exactly what we want and must not match. */
const staticallyImports = (src, spec) =>
  new RegExp(`^\\s*import\\s+(?!type\\s)[^;]*?from\\s*["'][^"']*${spec}["']`, "m").test(src) ||
  new RegExp(`^\\s*import\\s*["'][^"']*${spec}["']`, "m").test(src);

const HOME_I18N = await readAll();
const codes = Object.keys(HOME_I18N);
const index = read("lib/home-i18n/index.ts");

/* The three languages authored inline in the components that render them. A
 * file for any of these means the copy has two homes and will drift. */
const AUTHORED = ["en", "ru", "uz"];

/* The call sites that read this data. Each may import the LOADER and nothing
 * else from lib/home-i18n. */
const CALL_SITES = [
  "app/page.tsx",
  "components/HomeFaq.tsx",
  "components/NewsletterSection.tsx",
];

/* ---- the data ------------------------------------------------------------- */

ok("no language file for a language that is authored inline", () => {
  for (const code of AUTHORED) {
    assert.ok(!codes.includes(code), `lib/home-i18n/${code}.ts exists — ${code} is authored inline, so this is a second copy that will drift`);
  }
});

ok("every language carries all five slices, none of them empty", () => {
  for (const code of codes) {
    const ui = HOME_I18N[code];
    for (const slice of ["pageT", "homeFaq", "newsletter", "nav", "faq"]) {
      assert.ok(ui[slice], `${code}.${slice} is missing`);
      assert.ok(Object.keys(ui[slice]).length > 0, `${code}.${slice} is empty`);
    }
  }
});

ok("every FAQ entry is a real question and answer", () => {
  for (const code of codes) {
    for (const [i, item] of HOME_I18N[code].faq.entries()) {
      assert.ok(item.q?.trim(), `${code}.faq[${i}].q is empty`);
      assert.ok(item.a?.trim(), `${code}.faq[${i}].a is empty`);
    }
  }
});

/* The two registries this was merged from were separate files, so a language
 * could have copy in one and not the other. It cannot now, but the counts
 * should still agree across languages or one of them was dropped in the merge. */
ok("every language has the same number of FAQ entries", () => {
  const counts = new Map(codes.map((c) => [c, HOME_I18N[c].faq.length]));
  const [first] = counts.values();
  for (const [code, n] of counts) {
    assert.equal(n, first, `${code} has ${n} FAQ entries, others have ${first} — the merge dropped some`);
  }
});

/* ---- the loader ----------------------------------------------------------- */

ok("loadHomeUi has a case for every language file, and only for those", () => {
  /* Parse EVERY case in the switch, not a hand-listed subset: a language added
   * without a case serves English silently, which is what a subset assertion
   * would miss. (Same lesson as M150's engine switch.) */
  const cases = [...index.matchAll(/case\s+"([a-z-]+)":\s*return\s*\(await import\("\.\/([a-z-]+)"\)\)/g)];
  const wired = cases.map((m) => m[1]);
  for (const m of cases) {
    assert.equal(m[1], m[2], `case "${m[1]}" imports "./${m[2]}" — a language would serve another language's copy`);
  }
  for (const code of codes) {
    assert.ok(wired.includes(code), `lib/home-i18n/${code}.ts has no case in loadHomeUi — it silently serves English`);
  }
  for (const code of wired) {
    assert.ok(codes.includes(code), `loadHomeUi has a case for "${code}" but lib/home-i18n/${code}.ts does not exist`);
  }
});

ok("EXTRA_LANGS matches the directory", () => {
  const m = index.match(/EXTRA_LANGS\s*=\s*(\[[^\]]*\])/);
  assert.ok(m, "EXTRA_LANGS is gone from lib/home-i18n/index.ts");
  assert.deepEqual(JSON.parse(m[1]).sort(), [...codes].sort(), "EXTRA_LANGS disagrees with the language files present");
});

ok("the loader reaches its languages ONLY through import()", () => {
  for (const code of codes) {
    assert.ok(!staticallyImports(index, `/${code}`), `lib/home-i18n/index.ts statically imports ./${code} — that language is eager on every page the loader touches`);
  }
});

/* ---- the boundary --------------------------------------------------------- */

ok("no call site statically imports a single language", () => {
  for (const site of CALL_SITES) {
    const src = read(site);
    for (const code of codes) {
      assert.ok(!staticallyImports(src, `home-i18n/${code}`), `${site} statically imports home-i18n/${code} — that language is back in the bundle for everyone`);
    }
  }
});

ok("no call site reaches the Node-side aggregate", () => {
  /* scripts/ is not reachable from the app by construction, so this is belt and
   * braces — but the aggregate is the one module that would hand a client every
   * language in a single import, so it is worth failing loudly. */
  for (const site of CALL_SITES) {
    assert.ok(!staticallyImports(read(site), "home-i18n-aggregate"), `${site} imports the Node-side aggregate — all twelve languages are back`);
  }
});

ok("the deleted registries have not come back", () => {
  for (const site of CALL_SITES) {
    const src = read(site);
    assert.ok(!staticallyImports(src, "home-faq-i18n"), `${site} imports lib/home-faq-i18n — the second 29.6 KB registry is back`);
    assert.ok(!/HOME_I18N|FAQ_I18N/.test(src), `${site} still references a whole-registry object`);
  }
});

ok("every call site actually CALLS the loader", () => {
  /* Match the call, not the identifier. Matching `loadHomeUi` anywhere passes on
   * a file that imports it and never calls it — which is exactly what a broken
   * call site looks like, and it is what this assertion missed when it was
   * first written. Verified by mutation: replacing the call with
   * `Promise.resolve(null)` leaves the import intact and must still fail. */
  for (const site of CALL_SITES) {
    const src = read(site).replace(/^\s*import[^;]*;/gm, "");
    assert.ok(/loadHomeUi\s*\(/.test(src), `${site} imports loadHomeUi but never calls it — that language silently serves English`);
  }
});

console.log(`\n  home-i18n: ${pass}/${pass + (process.exitCode ? 1 : 0)} checks passed (${codes.length} languages, ${codes.reduce((n, c) => n + HOME_I18N[c].faq.length, 0)} translated FAQ entries)\n`);
