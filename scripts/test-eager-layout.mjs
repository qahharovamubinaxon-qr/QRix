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

/* The blog cards are the exception to the pattern above: they are NOT deferred,
 * because they are the only /blog/* links in the homepage's server HTML and a
 * crawler will not scroll to trigger an intersection. The 88 KB catalog stays out
 * by inlining the four fields the section paints. npm run test:home-posts is what
 * keeps that inlined copy honest; this only holds the import boundary. */

ok("the latest-posts section does not statically import the post catalog", () => {
  const latest = read("components/LatestPosts.tsx");
  assert.ok(!staticallyImports(latest, "lib/blog"), "the 88 KB post catalog is eager on every homepage view again");
  assert.ok(staticallyImports(latest, "home-posts"), "LatestPosts does not read the inlined card list");
});

/* ---- the QR design studio -------------------------------------------------- */
/* 36.5 KB raw, and it was eager on the homepage AND on all 40 /qr-tools/* routes,
 * because app/page.tsx and QRGenerator.tsx both imported it statically. It is a
 * modal: both call sites already rendered it as {designOpen && <Studio/>}, so the
 * markup was never on the page and only the bytes were. Nothing about the page
 * looks wrong when the static import comes back — which is why it is asserted. */

const studioLoader = read("components/QRDesignStudioLoader.tsx");

for (const [label, path] of [["the homepage", "app/page.tsx"], ["the QR tool template", "components/QRGenerator.tsx"]]) {
  ok(`${label} reaches the design studio through the loader`, () => {
    const src = read(path);
    assert.ok(
      !staticallyImports(src, "components/QRDesignStudio\""),
      `${path} imports QRDesignStudio directly — 36.5 KB is eager again`,
    );
    assert.ok(/QRDesignStudioLoader/.test(src), `${path} does not go through QRDesignStudioLoader`);
  });

  /* Deferring a modal behind its own onClick trades bytes for a visible stall,
   * and CLAUDE.md says only improve. The trigger warms on pointerenter/focus. */
  ok(`${label} warms the studio chunk on intent`, () => {
    const src = read(path);
    assert.ok(
      /\{\.\.\.designStudioTriggerProps\}/.test(src),
      `the "Customize Design" button in ${path} does not warm the chunk — the click would stall`,
    );
  });
}

ok("the studio loader reaches the studio only through a dynamic import", () => {
  assert.ok(!staticallyImports(studioLoader, "./QRDesignStudio"), "the loader statically imports the studio — the split does nothing");
  assert.ok(/import\("\.\/QRDesignStudio"\)/.test(studioLoader), "the loader never loads the studio");
});

ok("the studio loader stays small enough to be worth it", () => {
  const bytes = Buffer.byteLength(studioLoader);
  assert.ok(bytes < 6000, `QRDesignStudioLoader is ${bytes} B — it is becoming the thing it replaced`);
});

/* A static import cannot fail; a dynamic one can. Deferring introduces a failure
 * mode that did not exist before, and a dropped chunk must not be a dead button. */
/* Both of these were written looser on the first pass and BOTH survived their
 * mutation. `/\.catch\(/` matched warmDesignStudio's own swallow-catch on a file
 * whose load path had lost its rejection handler, and `/setAttempt/` matched
 * `setAttemptX` — the substring trap, in a guard whose whole job is to notice a
 * rename. Assert the state the failure has to produce, and use word boundaries. */
ok("a failed studio chunk is a visible state, not a dead button", () => {
  assert.ok(/setFailed\(true\)/.test(studioLoader), "a rejected chunk fetch never becomes state — the modal would hang on 'Opening…'");
  assert.ok(/inflight = null/.test(studioLoader), "a failed load is cached as in-flight, so retry can never re-fetch");
  assert.ok(/\bsetAttempt\b/.test(studioLoader), "the failure state offers no retry");
});

/* ---- and the layout as a whole -------------------------------------------- */

ok("the layout imports no heavy catalog directly", () => {
  for (const spec of ["home-i18n", "search-index", "blog", "convert-pairs", "resize-presets"]) {
    assert.ok(!staticallyImports(layout, spec), `app/layout.tsx statically imports ${spec}`);
  }
});

console.log(`\n  eager-layout: ${pass}/${pass + (process.exitCode ? 1 : 0)} checks passed\n`);
