/* Assertions for the tool CLIENTS behind LocalizedToolEngine — lib/tool-ui-i18n.ts
 * and how each client consumes it (M150).
 *
 * Why this file exists. This is the FOURTH occurrence of one defect: a
 * localized page wrapper renders a client tool that was written English-only,
 * and nobody notices because the surrounding page IS translated. M125 hit it,
 * M147b hit it on the image shell, M149 hit it on the barcode tool — and the
 * sweep that followed M149 found LocalizedToolEngine rendering EIGHT clients
 * and passing `lang` to none of them. That is every /ru/[tool] and /uz/[tool]
 * route: the main PDF and image surface for the stickiest audience the site
 * has.
 *
 * Two things are asserted that a human reviewer reliably misses:
 *   1. Every language defines every key, and RU/UZ do not simply repeat the
 *      English string. An untranslated entry is THE failure mode here, and it
 *      is invisible unless something compares the languages to each other.
 *   2. Each client reads its labels rather than carrying literals, and the
 *      engine actually threads `lang` down. The bug was never a missing
 *      translation; it was a prop that was never passed.
 *
 * Note on instrument choice: all eight clients are dynamic(ssr:false) here, so
 * their UI is NOT in the server HTML and curl can see neither the defect nor
 * the fix. These are static assertions; the live proof is scripts/probe-tool-i18n.mjs
 * (real headless Chrome over CDP), the same instrument M147/M149 proved necessary.
 *
 *   node scripts/test-tool-ui-i18n.mjs      (or: npm run test:tool-i18n)
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { register } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
const { toolUI } = await import("../lib/tool-ui-i18n.ts");

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

const read = (p) => readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

// Strips comments so prose ABOUT a string does not count as that string being
// hardcoded — but ONLY comments that actually open a line. A naive
// block-comment regex is wrong on this codebase: the literal in
// accept="image/[star]" opens a match that runs to the next real
// close-comment token, deleting all the JSX between.
// (Written as line comments on purpose — the earlier block-comment version of
// this note contained a close-comment token inside backticks, which ended the
// comment early and made the whole file a syntax error.)
const stripComments = (src) =>
  src
    .replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, "")   // {/* JSX comment */}
    .replace(/^[ \t]*\/\*[\s\S]*?\*\//gm, "")     // block comment opening a line
    .replace(/^\s*\/\/.*$/gm, "");                // line comment
const LANGS = ["en", "ru", "uz"];
const T = Object.fromEntries(LANGS.map((l) => [l, toolUI(l)]));

const ENGINE = read("components/LocalizedToolEngine.tsx");
const PAGE = read("components/LocalizedToolPage.tsx");

/* Values that are legitimately identical across languages: file-format names
   and paper sizes are not words. "A4" is "A4" in Russian too. */
const SHARED_OK = new Set([
  "common.imgFormats",
  "jpgToPdf.formats",
  "jpgToPdf.sizes.a4",
  "jpgToPdf.sizes.letter",
]);

/* Each wired client: its file, the dict section it must read, and English
   strings that must no longer appear as literals in its JSX. */
const CLIENTS = [
  {
    file: "components/MergePdfClient.tsx",
    section: "merge",
    ghosts: ["Drop PDFs or", "2 or more PDF files", "Merge PDF", "Merging…", "No PDFs yet", "Add at least 2 PDFs.", "Merge failed: ", "drag to set merge order"],
  },
  {
    file: "components/CompressPdfClient.tsx",
    section: "compress",
    ghosts: ["Compression level", "Compress PDF", "Compressing…", "Already optimized", "Compression failed: ", "Keeps photo detail", "Best balance", "Smallest file", "Original size:"],
  },
  {
    file: "components/JpgToPdfClient.tsx",
    section: "jpgToPdf",
    ghosts: ["Drop images or", "Page size", "Convert to PDF", "Creating PDF…", "No images yet", "Selected images", "Conversion failed: ", "drag to reorder"],
  },
  {
    file: "components/PdfToJpgClient.tsx",
    section: "pdfToJpg",
    ghosts: ["Convert to JPG (ZIP)", "Converting…", "Each page becomes a high-quality JPG", "Conversion failed: "],
  },
];

/* Walks the dict so a nested section (compress.levels.low.label) is compared
   too — the flat-key version of this test would have missed exactly those. */
function* leaves(obj, prefix = "") {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "object" && v !== null && !Array.isArray(v)) yield* leaves(v, path);
    else yield [path, v];
  }
}

// Sample args wide enough that no interpolating string collapses to the same
// text in two languages by accident.
const call = (fn) => fn(7, 3, 21, 9);

ok("every language defines every key, nothing empty", () => {
  const keys = [...leaves(T.en)].map(([k]) => k).sort();
  assert.ok(keys.length >= 70, `expected a full strings block, got ${keys.length} keys`);
  for (const l of LANGS) {
    assert.deepEqual([...leaves(T[l])].map(([k]) => k).sort(), keys, `${l} is missing or has extra keys`);
    for (const [k, v] of leaves(T[l])) {
      const s = typeof v === "function" ? call(v) : v;
      assert.ok(s !== undefined && s !== null && s !== "", `${l}.${k} is empty`);
    }
  }
});

ok("RU and UZ actually translate, rather than repeating the English", () => {
  const en = Object.fromEntries([...leaves(T.en)]);
  for (const l of ["ru", "uz"]) {
    for (const [k, v] of leaves(T[l])) {
      if (SHARED_OK.has(k)) continue;
      const a = typeof en[k] === "function" ? call(en[k]) : en[k];
      const b = typeof v === "function" ? call(v) : v;
      assert.notEqual(b, a, `${l}.${k} is identical to English ("${a}") — untranslated`);
    }
  }
});

ok("RU and UZ differ from each other too", () => {
  // Catches a copy-paste of the whole RU block into UZ, which passes the test
  // above while leaving one of the two languages wrong.
  const ru = Object.fromEntries([...leaves(T.ru)]);
  let same = 0;
  for (const [k, v] of leaves(T.uz)) {
    if (SHARED_OK.has(k)) continue;
    const a = typeof ru[k] === "function" ? call(ru[k]) : ru[k];
    const b = typeof v === "function" ? call(v) : v;
    if (a === b) same++;
  }
  assert.ok(same <= 2, `${same} UZ strings are byte-identical to RU — a block was copied, not translated`);
});

ok("the interpolating strings actually interpolate", () => {
  for (const l of LANGS) {
    assert.match(T[l].compress.smaller(42), /42/, `${l}.compress.smaller drops its percentage`);
    assert.match(T[l].jpgToPdf.margin(24), /24/, `${l}.jpgToPdf.margin drops its value`);
    assert.match(T[l].upscale.strength(60), /60/, `${l}.upscale.strength drops its value`);
    assert.match(T[l].removeBg.processingPct(55), /55/, `${l}.removeBg.processingPct drops its value`);
    const d = T[l].upscale.dims(800, 600, 1600, 1200);
    for (const n of ["800", "600", "1600", "1200"]) {
      assert.match(d, new RegExp(n), `${l}.upscale.dims drops ${n}`);
    }
    assert.match(T[l].upscale.enhancedTo(1600, 1200, 2, true), /1600/, `${l}.upscale.enhancedTo drops its width`);
    // The ", sharpened" clause must appear only when sharpening ran.
    const on = T[l].upscale.enhancedTo(1600, 1200, 2, true);
    const off = T[l].upscale.enhancedTo(1600, 1200, 2, false);
    assert.notEqual(on, off, `${l}.upscale.enhancedTo ignores the sharpened flag`);
    assert.ok(on.length > off.length, `${l}.upscale.enhancedTo drops the sharpened clause the wrong way round`);
  }
});

for (const { file, section, ghosts } of CLIENTS) {
  const src = read(file);
  const name = file.split("/").pop();

  ok(`${name} carries no hardcoded English UI text`, () => {
    const jsx = stripComments(src);
    // Guard on the guard. The first version of this stripper used a naive
    // /\*[\s\S]*?\*\// and `accept="image/*"` opened a comment that ran to the
    // next real `*/` — it silently ate 2.3 KB of JpgToPdfClient's JSX, which
    // made a genuinely re-hardcoded "Page size" pass. A ghost check that has
    // quietly deleted the code it searches reports clean either way.
    assert.ok(jsx.length > src.length * 0.8,
      `comment stripping removed ${src.length - jsx.length} of ${src.length} chars of ${name} — the ghost check is searching a gutted file`);
    for (const ghost of ghosts) {
      assert.ok(!jsx.includes(ghost), `${name} still hardcodes "${ghost}" — RU/UZ readers see it`);
    }
    assert.ok(jsx.includes("toolUI("), `${name} must read its labels from toolUI()`);
    assert.match(jsx, new RegExp(`t\\.${section}\\.`), `${name} must read the ${section} section`);
  });

  ok(`${name} accepts lang and defaults to en`, () => {
    assert.match(src, /lang\s*=\s*"en"\s*\}\s*:\s*\{\s*lang\?\s*:\s*ToolLang\s*\}/,
      `${name} must take an optional lang defaulting to "en" — the English routes render it with no prop`);
  });

  ok(`the engine threads lang into ${name.replace("Client.tsx", "Client")}`, () => {
    const comp = name.replace(".tsx", "");
    assert.match(ENGINE, new RegExp(`<${comp}\\s+lang=\\{lang\\}`),
      `LocalizedToolEngine renders ${comp} without lang — the exact bug M150 fixes`);
  });
}

ok("the localized page threads lang into the engine", () => {
  assert.match(PAGE, /<LocalizedToolEngine[^>]*lang=\{lang\}/,
    "LocalizedToolPage renders the engine without lang, so nothing downstream can be localized");
  assert.match(ENGINE, /lang\s*=\s*"en"/, "the engine must default lang to en for the English routes");
});

ok("the shared UploadBox is localized too", () => {
  // Three of the four PDF clients render it; it was the single biggest source
  // of English text on the RU/UZ pages ("Drop your file here or browse").
  const box = read("components/PdfToTextClient.tsx");
  assert.ok(!box.includes("Drop your file here or"), "UploadBox still hardcodes its prompt");
  assert.ok(!/>\s*selected</.test(box) && !box.includes("</b> selected"), "UploadBox still hardcodes 'selected'");
  assert.match(box, /lang\?\s*:\s*ToolLang/, "UploadBox must accept a lang");
  for (const f of ["components/CompressPdfClient.tsx", "components/PdfToJpgClient.tsx"]) {
    // NOT [^>]* — CompressPdfClient's setFile prop is an arrow function, so a
    // `>` sits between the tag name and the lang prop. That false failure is
    // the same class as the case-sensitive-attribute trap from Jul 28.
    assert.match(read(f), /<UploadBox[\s\S]{0,240}?lang=\{lang\}/, `${f} renders UploadBox without lang`);
  }
});

ok("the engine's header records the assumption that hid this, as a correction", () => {
  // Deliberately NOT "the phrase must be absent": the phrase is worth keeping,
  // quoted, so the next reader knows what was believed and why it was wrong.
  // What must be true is that it reads as a retraction, not as a claim.
  const flat = ENGINE.replace(/\s+/g, " ");
  assert.match(flat, /language-agnostic/, "the engine should quote the assumption it used to make");
  assert.match(flat, /That was false|is false/, "the quoted assumption must be marked as false, not left standing");
  assert.ok(flat.indexOf("That was false") > flat.indexOf("language-agnostic"),
    "the retraction must follow the quote it retracts");
});

console.log(`\n  ${pass} assertions passed across ${LANGS.length} languages and ${CLIENTS.length} wired clients.\n`);
