/* What the ROOT LAYOUT is allowed to pull into the client bundle of every page.
 *
 * app/layout.tsx mounts eleven client components on all ~800 pages of the site,
 * so a single static import inside one of them is an import on every page — and
 * nothing in the type system, the linter or a Lighthouse score says so. Three
 * separate times now the biggest thing on a page turned out to be a module that
 * one layout-level component imported for a detail:
 *
 *   TopNav        -> lib/home-i18n (57 KB of homepage copy in 12 languages) for
 *                    13 nav labels, and the Supabase auth SDK for a getSession()
 *                    that cannot paint before hydration anyway.
 *   CommandSearch -> lib/search-index, which pulls every metadata registry on the
 *                    site (~245 KB raw, the single biggest download on any page)
 *                    for a palette whose only opener is Ctrl/⌘+K — a shortcut a
 *                    phone cannot press.
 *
 * Each was fixed by moving the import behind a dynamic import(). Each would come
 * back the moment someone types the obvious static import, and the page would
 * still look and behave exactly right. So the boundary is asserted here.
 *
 *   node scripts/test-eager-layout.mjs      (or: npm run test:layout)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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
/** A static `import ... from "<spec>"` that carries a VALUE — the thing that puts
 *  a module in the eager bundle. `import type` is erased before a bundler ever
 *  sees it, so it does not count; a dynamic `import("<spec>")` is what we want. */
const staticallyImports = (src, spec) =>
  new RegExp(`^\\s*import\\s+(?!type\\s)[^;]*?from\\s*["'][^"']*${spec}["']`, "m").test(src) ||
  new RegExp(`^\\s*import\\s*["'][^"']*${spec}["']`, "m").test(src);

const layout = read("app/layout.tsx");
const topnav = read("components/TopNav.tsx");
const loader = read("components/CommandSearchLoader.tsx");

/* ---- TopNav ---------------------------------------------------------------- */

ok("TopNav does not import the homepage catalog", () => {
  assert.ok(!staticallyImports(topnav, "home-i18n"), "the 57 KB homepage catalog is back on every page");
  assert.ok(staticallyImports(topnav, "nav-i18n"), "TopNav does not import the extracted nav slice");
});

ok("TopNav does not statically import the auth SDK", () => {
  assert.ok(!staticallyImports(topnav, "supabase-browser"), "the auth SDK is back in the eager bundle of every page");
  assert.ok(/import\("@\/lib\/supabase-browser"\)/.test(topnav), "TopNav no longer loads supabase-browser at all");
});

/* ---- the command palette --------------------------------------------------- */

ok("the layout mounts the loader, not the palette", () => {
  assert.ok(!staticallyImports(layout, "components/CommandSearch\"") , "layout imports CommandSearch directly again");
  assert.ok(/CommandSearchLoader/.test(layout), "layout does not mount CommandSearchLoader");
  assert.ok(!/<CommandSearch\s*\/>/.test(layout), "layout still renders <CommandSearch /> eagerly");
});

ok("the loader reaches the palette only through a dynamic import", () => {
  assert.ok(!staticallyImports(loader, "./CommandSearch"), "the loader statically imports the palette — the split does nothing");
  assert.ok(/import\("\.\/CommandSearch"\)/.test(loader), "the loader never loads the palette");
});

ok("the loader itself stays small enough to be worth it", () => {
  const bytes = Buffer.byteLength(loader);
  assert.ok(bytes < 3000, `CommandSearchLoader is ${bytes} B — it is becoming the thing it replaced`);
});

ok("the search catalog is reachable from the palette only", () => {
  assert.ok(!staticallyImports(loader, "search-index"), "the loader pulls the catalog it exists to defer");
  assert.ok(!staticallyImports(layout, "search-index"), "the layout pulls the search catalog directly");
});

/* ---- the homepage hero ----------------------------------------------------- */
/* Same catalog, other half of the problem: HeroSearch is a visible box on the
 * homepage, so unlike the palette it cannot wait for a shortcut — it waits for
 * a focus instead, which is still a whole intent ahead of the first keystroke. */

ok("the hero search bar loads the catalog on intent, not on page load", () => {
  const hero = read("components/HeroSearch.tsx");
  assert.ok(!staticallyImports(hero, "search-index"), "HeroSearch imports the search catalog for value, not just its types");
  assert.ok(/import\("@\/lib\/search-index"\)/.test(hero), "HeroSearch never loads the catalog at all");
  assert.ok(/onFocus=\{[^}]*loadIndex\(\)/.test(hero), "nothing warms the catalog on focus — the first query would stall");
});

/* ---- the homepage's below-the-fold sections -------------------------------- */
/* app/page.tsx is one giant "use client" component, so anything it imports is in
 * the homepage's eager bundle no matter how far down the page it renders. */

ok("the reviews section does not statically import the auth SDK", () => {
  const reviews = read("components/ReviewsSection.tsx");
  assert.ok(!staticallyImports(reviews, "supabase-browser"), "the SDK is eager on the homepage for a block below the fold");
  assert.ok(/import\("@\/lib\/supabase-browser"\)/.test(reviews), "ReviewsSection no longer loads the SDK at all");
});

/* ---- and the layout as a whole -------------------------------------------- */

ok("the layout imports no heavy catalog directly", () => {
  for (const spec of ["home-i18n", "search-index", "blog", "convert-pairs", "resize-presets"]) {
    assert.ok(!staticallyImports(layout, spec), `app/layout.tsx statically imports ${spec}`);
  }
});

console.log(`\n  eager-layout: ${pass}/${pass + (process.exitCode ? 1 : 0)} checks passed\n`);
