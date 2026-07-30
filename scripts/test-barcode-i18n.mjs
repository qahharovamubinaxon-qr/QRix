/* Assertions for the barcode tool's labels — lib/barcode-types-i18n.ts's
 * barcodeTool() and how components/BarcodeClient.tsx consumes it.
 *
 * Why this file exists. The defect M149 fixed has now happened three times in
 * this repo: a localized page wrapper renders a client tool that was written
 * English-only, and nobody notices because the surrounding page IS translated.
 * M125 hit it, M147b hit it again on the image shell, and this pass found the
 * barcode pages serving "Value to encode" and "Download PNG" to every RU and
 * UZ reader. The rendered page looks fine in review; only the strings differ.
 *
 * So two things are asserted that a human reviewer reliably misses:
 *   1. Every language defines every key, and RU/UZ do not simply repeat the
 *      English string — an untranslated entry is the failure mode, and it is
 *      invisible unless something compares the languages to each other.
 *   2. The component reads its labels rather than carrying literals, and the
 *      localized wrapper actually passes `lang`. The bug was never a missing
 *      translation; it was a prop that was never threaded.
 *
 *   node scripts/test-barcode-i18n.mjs      (or: npm run test:barcode)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";

/* barcode-types-i18n imports lib/barcode-types through the "@/" alias, so the
   hook has to be registered before it loads — hence the dynamic import (same
   shape as scripts/test-qr-stats.mjs). */
register("./alias-hooks.mjs", import.meta.url);
const { barcodeTool } = await import("../lib/barcode-types-i18n.ts");

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

const CLIENT = readFileSync(new URL("../components/BarcodeClient.tsx", import.meta.url), "utf8");
const WRAPPER = readFileSync(new URL("../components/LocalizedBarcodePage.tsx", import.meta.url), "utf8");
const LANGS = ["en", "ru", "uz"];
const T = Object.fromEntries(LANGS.map((l) => [l, barcodeTool(l)]));

/* Values that are legitimately identical across languages: "SVG" is a file
   format, not a word, and the placeholder's sample digits are digits. */
const SHARED_OK = new Set(["downloadSvg", "bulkPlaceholder"]);

ok("every language defines every key", () => {
  const keys = Object.keys(T.en);
  assert.ok(keys.length >= 20, `expected a full strings block, got ${keys.length} keys`);
  for (const l of LANGS) {
    assert.deepEqual(Object.keys(T[l]).sort(), keys.sort(), `${l} is missing or has extra keys`);
    for (const k of keys) {
      const v = T[l][k];
      assert.ok(v !== undefined && v !== null && v !== "", `${l}.${k} is empty`);
    }
  }
});

ok("RU and UZ actually translate, rather than repeating the English", () => {
  for (const k of Object.keys(T.en)) {
    if (SHARED_OK.has(k)) continue;
    const en = typeof T.en[k] === "function" ? T.en[k](3, 1) : T.en[k];
    for (const l of ["ru", "uz"]) {
      const v = typeof T[l][k] === "function" ? T[l][k](3, 1) : T[l][k];
      if (Array.isArray(en)) {
        assert.notDeepEqual(v, en, `${l}.${k} is identical to English — untranslated`);
        continue;
      }
      assert.notEqual(v, en, `${l}.${k} is identical to English ("${en}") — untranslated`);
    }
  }
});

ok("the colour presets have a human name per swatch, in every language", () => {
  const n = T.en.colorNames.length;
  const presets = (CLIENT.match(/const PRESET_COLORS = \[([^\]]*)\]/) || [, ""])[1].split(",").filter((s) => s.trim());
  assert.equal(presets.length, n, `${presets.length} swatches but ${n} names — a swatch would announce its hex`);
  for (const l of LANGS) {
    assert.equal(T[l].colorNames.length, n, `${l} has ${T[l].colorNames.length} colour names for ${n} swatches`);
    for (const name of T[l].colorNames) {
      assert.ok(!/^#/.test(name), `${l} colour name "${name}" is a hex value, which is not a name`);
      assert.ok(name.length >= 3, `${l} colour name "${name}" is too short to be a name`);
    }
  }
});

ok("the interpolating strings actually interpolate", () => {
  for (const l of LANGS) {
    assert.match(T[l].typeLabel(13), /13/, `${l}.typeLabel drops its count`);
    assert.match(T[l].height(90), /90/, `${l}.height drops its value`);
    assert.match(T[l].fixedLen("8 / 13"), /8 \/ 13/, `${l}.fixedLen drops its lengths`);
    assert.match(T[l].bulkResult(7, 0), /7/, `${l}.bulkResult drops its count`);
    assert.match(T[l].bulkResult(7, 2), /2/, `${l}.bulkResult drops its failure count`);
    assert.doesNotMatch(T[l].bulkResult(7, 0), /0/, `${l}.bulkResult shows a zero failure count`);
  }
});

ok("the component carries no hardcoded English UI text", () => {
  const jsx = CLIENT.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  for (const ghost of [
    "Value to encode", "Bar color", "Show value under bars", "Download PNG",
    "Copy value", "Bulk generate", "Enter a value", "Barcode type (",
    "This format accepts digits only", "Generating…", "Download ZIP",
  ]) {
    assert.ok(!jsx.includes(ghost), `BarcodeClient still hardcodes "${ghost}" — RU/UZ readers see it`);
  }
  assert.ok(jsx.includes("barcodeTool("), "the component must read its labels from barcodeTool()");
});

ok("the localized wrapper threads lang into the tool", () => {
  assert.match(WRAPPER, /<BarcodeClient[^>]*lang=\{lang\}/,
    "LocalizedBarcodePage renders BarcodeClient without lang — the exact bug M149 fixed");
  assert.match(CLIENT, /lang\s*=\s*"en"/, "BarcodeClient must accept a lang prop and default to en");
});

ok("every interactive control has an accessible name", () => {
  // Each of these ids must exist on a control AND be pointed at by a label.
  for (const part of ["value", "height", "showtext", "color", "bulk"]) {
    const id = new RegExp(`id=\\{uid\\("${part}"\\)\\}`);
    const htmlFor = new RegExp(`htmlFor=\\{uid\\("${part}"\\)\\}`);
    assert.match(CLIENT, id, `no control carries uid("${part}")`);
    assert.match(CLIENT, htmlFor, `nothing labels uid("${part}") — the control has no accessible name`);
  }
  // The two button groups are not form controls, so they need a labelled group.
  for (const part of ["type-label", "color-label"]) {
    assert.match(CLIENT, new RegExp(`aria-labelledby=\\{uid\\("${part}"\\)\\}`), `group ${part} is unlabelled`);
    assert.match(CLIENT, new RegExp(`id=\\{uid\\("${part}"\\)\\}`), `group label ${part} has no id to point at`);
  }
  assert.ok(!/aria-label=\{c\}/.test(CLIENT), "a swatch still announces its hex value as its name");
});

ok("the invalid-value message is wired to the input it describes", () => {
  assert.match(CLIENT, /aria-invalid=/, "the value input must report validity");
  assert.match(CLIENT, /aria-describedby=\{validationMsg \|\| !valid \? uid\("value-err"\) : undefined\}/,
    "the error text must be referenced only while it exists, or it points at nothing");
  assert.match(CLIENT, /id=\{uid\("value-err"\)\}/, "the error text needs the id it is referenced by");
});

console.log(`\n  ${pass} assertions passed across ${LANGS.length} languages.\n`);
