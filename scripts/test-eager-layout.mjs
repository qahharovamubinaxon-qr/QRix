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

/* ---- TopNav's gesture-gated panels ----------------------------------------- */
/* Same shape as the palette and the studio, one layer up: the 50-entry DROPDOWNS
 * mega-menu, the account menu body and the mobile account grid can only be
 * reached by a hover or a tap, and all three shipped in the eager set of all
 * ~800 pages because they were written inline in a component the root layout
 * mounts. Nothing about the header looks wrong when they move back — the menus
 * open exactly the same — so the boundary is asserted rather than remembered. */

const panels = read("components/nav/NavPanels.tsx");

ok("TopNav reaches the nav panels only through a dynamic import", () => {
  assert.ok(
    !staticallyImports(topnav, "nav/NavPanels"),
    "TopNav imports NavPanels for value — the mega-menu is eager on every page again",
  );
  assert.ok(/import\("@\/components\/nav\/NavPanels"\)/.test(topnav), "TopNav never loads the panels at all");
});

/* The registry is the payload, and it is what a careless "just move the
 * component back" would drag along. Assert on one of its own literals rather
 * than on the identifier: a rename survives an identifier grep, and DROPDOWNS
 * has been renamed once already. */
ok("the mega-menu registry lives in the deferred module, not in TopNav", () => {
  assert.ok(!/Many QR from CSV/.test(topnav), "the DROPDOWNS registry is back inside TopNav");
  assert.ok(/Many QR from CSV/.test(panels), "NavPanels no longer holds the mega-menu registry — the marker is stale");
});

/* 29 icons went in, 5 came out. react-icons is tree-shaken per icon, so this is
 * the bulk of the win and also the easiest thing to undo by accident: adding one
 * icon to the header pulls nothing, adding a menu item's icon pulls the panel's
 * whole markup back with it. */
ok("TopNav imports only the icons that paint before a gesture", () => {
  const line = topnav.match(/import\s*\{([^}]*)\}\s*from\s*["']react-icons\/fi["']/);
  assert.ok(line, "TopNav no longer imports from react-icons/fi — this guard is reading the wrong thing");
  const icons = line[1].split(",").map((s) => s.trim()).filter(Boolean);
  assert.ok(icons.length <= 6, `TopNav imports ${icons.length} icons (${icons.join(", ")}) — the panel icons are eager again`);
});

/* Deferring behind the opening gesture itself would read as a menu that does not
 * open. Each panel is warmed by the gesture BEFORE it: entering the nav bar,
 * approaching the account button, pressing the burger. */
ok("every panel is warmed on the gesture before the one that opens it", () => {
  assert.ok(/const warmPanels = \(\) =>/.test(topnav), "nothing warms the panel chunk");
  assert.ok(/onPointerEnter=\{warmPanels\}[^>]*onFocusCapture=\{warmPanels\}/.test(topnav),
    "the desktop nav does not warm on pointer/focus — the first hover would open an empty panel");
  assert.ok(/onPointerDown=\{warmPanels\}/.test(topnav),
    "the burger does not warm on pointerdown — the mobile sheet's account grid would pop in late");
});

/* THE SAFETY PROPERTY, and the reason the split stops where it does. A dynamic
 * import can fail; the ten primary links are the only navigation a phone has, so
 * they stay in TopNav where a dropped chunk cannot reach them. If someone later
 * "finishes the job" by moving the mobile link list into NavPanels too, a failed
 * chunk becomes a phone with no way off the page. */
ok("the primary nav links are NOT deferred, on either breakpoint", () => {
  assert.ok(/aria-label="Primary"/.test(topnav), "the desktop nav markup left TopNav");
  assert.ok(/aria-label="Mobile"/.test(topnav), "the mobile sheet's nav markup left TopNav");
  assert.ok(!/aria-label="Mobile"/.test(panels), "the mobile nav list moved into the deferred chunk — a failed load strands phones");
  const mobileNav = topnav.match(/aria-label="Mobile"[\s\S]{0,900}/)?.[0] ?? "";
  assert.ok(/links\.map/.test(mobileNav), "the mobile sheet no longer renders the primary links itself");
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

/* ---- pdf-lib on the PDF tool routes ---------------------------------------- */
/* The same shape as the design studio, one template over and four times the
 * weight: pdf-lib is ~219 KB and drags @pdf-lib/standard-fonts (~152 KB of
 * base64 font metrics) behind it, and thirteen tool clients imported it for a
 * function that cannot run until the visitor has chosen a file. Measured on
 * production before the split: /pdf-tools/{merge,split,rotate} ~1050 KB eager,
 * /pdf-tools/compress (which already loaded it on demand) 652 KB, the image and
 * convert templates 634-645 KB. Nothing on the page looks wrong when the static
 * import comes back — the tool still works, it just costs 400 KB again. */

const PDF_LIB_CLIENTS = [
  "CropPdfClient", "JpgToPdfClient", "MergePdfClient", "PageNumbersClient",
  "PageSelectClient", "RedactPdfClient", "ReorderPdfClient", "RotatePdfClient",
  "SignPdfClient", "SplitPdfClient", "WatermarkClient",
  /* the encrypted-PDF fork, its own package and its own chunk */
  "ProtectPdfClient", "UnlockPdfClient",
];

for (const name of PDF_LIB_CLIENTS) {
  ok(`${name} reaches pdf-lib through the loader`, () => {
    const src = read(`components/${name}.tsx`);
    assert.ok(
      !staticallyImports(src, "pdf-lib"),
      `${name} imports pdf-lib for value — ~400 KB is eager on its route again`,
    );
    assert.ok(
      /from "@\/lib\/pdf-lib-loader"/.test(src),
      `${name} does not go through lib/pdf-lib-loader`,
    );
  });
}

const pdfLoader = read("lib/pdf-lib-loader.ts");

ok("the pdf-lib loader reaches the library only through a dynamic import", () => {
  assert.ok(!staticallyImports(pdfLoader, "pdf-lib"), "the loader statically imports pdf-lib — the split does nothing");
  assert.ok(/import\("pdf-lib"\)/.test(pdfLoader), "the loader never loads pdf-lib");
  assert.ok(/import\("@cantoo\/pdf-lib"\)/.test(pdfLoader), "the loader never loads the encrypted-PDF fork");
});

/* A static import cannot fail; a dynamic one can. One dropped request must not
 * turn every PDF tool into a permanently dead button for the rest of the visit,
 * which is exactly what caching the rejected promise would do. */
/* Anchored to the start of a line, because the first version of this assertion
 * was `/pdfLib = null;/` and it SURVIVED its mutation: commenting the line out
 * leaves `// pdfLib = null;`, which still contains the substring. Same family as
 * the `setAttemptX` trap above — assert the statement, not the characters. */
ok("a failed pdf-lib chunk is not cached as the answer", () => {
  assert.ok(/^\s*pdfLib = null;\s*$/m.test(pdfLoader), "a rejected pdf-lib import stays in the module-scope cache — one dropped chunk kills the tool until reload");
  assert.ok(/^\s*cantoo = null;\s*$/m.test(pdfLoader), "a rejected @cantoo import stays in the module-scope cache");
  assert.ok(/throw err;/.test(pdfLoader), "the loader swallows the failure, so callers destructure undefined and get a TypeError instead of the real error");
});

/* lib/pdf-compress.ts is deliberately NOT in the list above: it imports pdf-lib
 * statically and that is correct, because CompressPdfClient only ever reaches it
 * through import("@/lib/pdf-compress"). Asserting it here would forbid the very
 * pattern this whole section exists to enforce. */
ok("the compress route still reaches its engine dynamically", () => {
  const compress = read("components/CompressPdfClient.tsx");
  assert.ok(!staticallyImports(compress, "lib/pdf-compress"), "CompressPdfClient pulls the compression engine — and pdf-lib with it — eagerly");
  assert.ok(/import\("@\/lib\/pdf-compress"\)/.test(compress), "CompressPdfClient never loads the compression engine");
});

/* ---- the barcode tool's labels --------------------------------------------- */
/* The nav-i18n extraction, one template over. BarcodeClient is a client
 * component, so its import of barcodeTool() pulled lib/barcode-types-i18n — the
 * per-symbology copy, caveats and FAQs written for the SERVER pages, in three
 * languages, plus the type registry it filters — into the eager bundle of
 * /barcode and every /barcode/<type> route, EN, RU and UZ alike. Measured on
 * production: a 94.5 KB chunk no other template carries. The tool's controls
 * reach none of it. */

ok("the barcode tool reads its labels from the tool slice, not the page registry", () => {
  const client = read("components/BarcodeClient.tsx");
  assert.ok(!staticallyImports(client, "barcode-types-i18n"), "BarcodeClient pulls the localized page registry — ~94 KB is eager on every barcode route again");
  assert.ok(!staticallyImports(client, "barcode-types"), "BarcodeClient pulls the symbology registry directly");
  assert.ok(staticallyImports(client, "barcode-tool-i18n"), "BarcodeClient does not read the extracted tool slice");
});

ok("the tool slice stays free of the registries it was split from", () => {
  const slice = read("lib/barcode-tool-i18n.ts");
  for (const spec of ["barcode-types-i18n", "barcode-types"]) {
    assert.ok(!staticallyImports(slice, spec), `lib/barcode-tool-i18n imports ${spec} — the split does nothing, and the page still looks correct`);
  }
});

/* ---- and the layout as a whole -------------------------------------------- */

ok("the layout imports no heavy catalog directly", () => {
  for (const spec of ["home-i18n", "search-index", "blog", "convert-pairs", "resize-presets"]) {
    assert.ok(!staticallyImports(layout, spec), `app/layout.tsx statically imports ${spec}`);
  }
});

console.log(`\n  eager-layout: ${pass}/${pass + (process.exitCode ? 1 : 0)} checks passed\n`);
