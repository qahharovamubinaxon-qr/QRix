/* Assertions for lib/nav-i18n.ts — the nav labels TopNav renders.
 *
 * Why this file exists: TopNav is mounted by the root layout, so every module it
 * imports lands in the client bundle of every page on the site. It used to read
 * its 13 labels per language out of HOME_I18N — 57 KB of homepage copy in 12
 * languages, shipped to ~800 pages that have no homepage on them. lib/nav-i18n.ts
 * is that slice, extracted (3.9 KB).
 *
 * The cost of a copy is drift: someone fixes a translation in HOME_I18N, the nav
 * keeps the old string, and nothing anywhere fails — the header just quietly
 * disagrees with the page under it in a language nobody on the team reads. So the
 * two are asserted equal here, in BOTH directions, and it imports the SHIPPED
 * modules (Node 22.18+/24 strips the types natively) so there is no third copy.
 *
 *   node scripts/test-nav-i18n.mjs      (or: npm run test:nav)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { readAll, languageFiles } from "./home-i18n-aggregate.mjs";
import { NAV_I18N } from "../lib/nav-i18n.ts";

/* Every language at once, read from lib/home-i18n/ — which since M160 is one
 * module per language with no aggregate of its own, precisely so no client
 * component can import all twelve. This is a Node-side reader; nothing a
 * browser loads can reach it. */
const HOME_I18N = await readAll();

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

/* The 13 keys TopNav's NavStrings type declares. A generated language that is
 * missing one falls back to English, which is fine; a language carrying a key
 * TopNav does not render is dead weight, which is not. */
const KEYS = ["home", "qr", "pdf", "image", "dashboard", "pricing", "blog", "ai", "video", "three", "signin", "signout", "signup"];

/* ---- the copy has to be the same copy ------------------------------------ */

ok("every language in HOME_I18N has a nav entry", () => {
  for (const code of Object.keys(HOME_I18N)) {
    assert.ok(NAV_I18N[code], `${code}: in HOME_I18N but not in NAV_I18N — regenerate`);
  }
});

ok("no language in NAV_I18N that HOME_I18N does not have", () => {
  for (const code of Object.keys(NAV_I18N)) {
    assert.ok(HOME_I18N[code], `${code}: in NAV_I18N but not in HOME_I18N — stale`);
  }
});

ok("every label is byte-identical to the HOME_I18N nav slice", () => {
  for (const [code, nav] of Object.entries(NAV_I18N)) {
    const src = HOME_I18N[code].nav;
    for (const key of KEYS) {
      assert.equal(nav[key], src[key], `${code}.${key}: "${nav[key]}" != "${src[key]}"`);
    }
  }
});

ok("no key in NAV_I18N that TopNav does not render", () => {
  for (const [code, nav] of Object.entries(NAV_I18N)) {
    for (const key of Object.keys(nav)) {
      assert.ok(KEYS.includes(key), `${code}.${key} is not a NavStrings key`);
    }
  }
});

ok("every language actually carries all 13 labels (no silent English)", () => {
  for (const [code, nav] of Object.entries(NAV_I18N)) {
    for (const key of KEYS) {
      assert.ok(typeof nav[key] === "string" && nav[key].length > 0, `${code}.${key} is empty`);
    }
  }
});

/* ---- and the point of the split has to hold ------------------------------ */
/* (which import lands in whose bundle is asserted in test-eager-layout.mjs) */

ok("nav-i18n is a fraction of the catalog it was cut from", () => {
  const nav = readFileSync(new URL("../lib/nav-i18n.ts", import.meta.url)).length;
  /* M160 turned lib/home-i18n.ts into lib/home-i18n/<code>.ts, so the thing
   * nav-i18n was cut from is now the sum of those files, not one file. */
  const home = languageFiles().reduce(
    (n, f) => n + readFileSync(new URL(`../lib/home-i18n/${f}`, import.meta.url)).length,
    0,
  );
  assert.ok(nav * 5 < home, `nav-i18n ${nav} B vs home-i18n/ ${home} B — the split stopped paying`);
});

console.log(`\n  nav-i18n: ${pass}/${pass + (process.exitCode ? 1 : 0)} checks passed (${Object.keys(NAV_I18N).length} languages × ${KEYS.length} labels)\n`);
