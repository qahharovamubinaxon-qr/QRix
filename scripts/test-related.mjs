/* Guard for the related-tools links on the tool page template (M166).
 *
 * The defect this exists to prevent is INVISIBLE ON THE PAGE: a related-tools
 * block that renders six links looks correct whether those links are the same
 * six on every page in the family, whether one of them points at the page
 * itself, or whether half the family is never linked from anywhere. Only
 * enumerating every real call site answers that, so this reads the actual
 * `categoryHref=`/`title=` pairs out of app/ rather than inventing fixtures.
 */

import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

let pass = 0;
const failures = [];
function ok(name, fn) {
  try { fn(); pass++; console.log(`  ok    ${name}`); }
  catch (e) { failures.push(name); console.log(`  FAIL  ${name}\n        ${e.message}`); }
}

/* ---- load the module under test through a tiny TS shim ---------------------
   These are .ts files with @/ aliases and type annotations; rather than pull in
   a compiler, re-implement nothing and instead drive the logic through the
   real data by importing the compiled-equivalent JS the build produces. We
   cannot, so the honest alternative is to assert on SOURCE properties that the
   defect would violate, plus a self-contained port of the rotation maths that
   is pinned to the source. Anything stronger needs a bundler. */

const SRC = readFileSync(join(ROOT, "lib/related-tools.ts"), "utf8");
const SHELL = readFileSync(join(ROOT, "components/ToolPageShell.tsx"), "utf8");

ok("the shell renders the related block and links every entry", () => {
  assert.match(SHELL, /relatedTools\(categoryHref, title\)/,
    "the shell stopped calling the resolver");
  assert.match(SHELL, /related\.map\(/, "the entries are not rendered");
  /* `\s` before href, not a bare substring: `data-href={r.href}` CONTAINS
     `href={r.href}`, so the loose form survived its own mutation — the same
     substring trap that let `/setAttempt/` match `setAttemptX` in M155. */
  assert.match(SHELL, /<Link\s+[\s\S]{0,120}\shref=\{r\.href\}/,
    "entries must be real <Link href> anchors — a crawler cannot click a div");
});

ok("the rotation is deterministic", () => {
  /* SSG regenerates these pages on every build. A random or time-based window
     makes each build emit a different internal link graph, which is churn a
     crawler reads as instability — and it would make this very test flaky. */
  /* Strip comments first. The first draft of this assertion failed on the
     source's OWN comment explaining why Math.random is not used — a guard
     tripping over prose about itself, which this repo has now hit in
     test-verify (M165), the M150 comment-stripper and here. Match code. */
  const code = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!/Math\.random|Date\.now|new Date\(/.test(code),
    "a nondeterministic window breaks static regeneration");
  assert.match(SRC, /hash\(seed\)\s*%/, "the window is no longer seeded");
  assert.match(SRC, /take\(siblings\.map\(plain\), limit, title\)/,
    "the window is no longer seeded by the PAGE — every page in a family would share one link set");
});

ok("the registry stays on the server", () => {
  /* M160: the defect is a registry crossing the client boundary. buildSearchIndex
     pulls every registry on the site (~245 KB, M138). */
  const stripped = SRC.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!/^\s*["']use client["']/m.test(stripped), "related-tools went client");
  const shellStripped = SHELL.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "");
  assert.ok(!/^\s*["']use client["']/m.test(shellStripped),
    "ToolPageShell went client — it now ships the whole search catalog to 46 routes");
});

/* ---- every real call site, read out of app/ -------------------------------- */

function walk(dir, out = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) { if (e !== "node_modules" && e !== ".next") walk(p, out); }
    else if (e.endsWith(".tsx")) out.push(p);
  }
  return out;
}

const CALLS = [];
for (const f of walk(join(ROOT, "app"))) {
  const src = readFileSync(f, "utf8");
  if (!/<ToolPageShell/.test(src)) continue;
  const cat = src.match(/categoryHref=\{?["']([^"'}]+)["']\}?/);
  const title = src.match(/title=["']([^"']+)["']/);
  if (cat) CALLS.push({ file: relative(ROOT, f), categoryHref: cat[1], title: title ? title[1] : null });
}

ok("the template's call sites were found at all", () => {
  /* If this regex ever stops matching, every assertion below passes vacuously
     over an empty list — the exact failure mode M154's sitemap floor exists for. */
  assert.ok(CALLS.length >= 30, `only ${CALLS.length} <ToolPageShell> call sites found`);
});

ok("every call site passes a family root the resolver understands", () => {
  const FAMILIES = new Set(["/qr-tools", "/pdf-tools", "/image-tools", "/ai-tools", "/video-tools", "/3d-tools"]);
  const bad = CALLS.filter((c) => !FAMILIES.has(c.categoryHref));
  assert.equal(bad.length, 0,
    `unknown family root — these pages would render an empty related block:\n        ` +
      bad.map((b) => `${b.file} -> ${b.categoryHref}`).join("\n        "));
});

/* ---- the rotation, ported and pinned to the source ------------------------- */

function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

ok("the ported hash matches the one in the source", () => {
  /* A port that has drifted from its original proves nothing about the site.
     Pin the constants rather than trusting they were copied correctly. */
  assert.match(SRC, /h = 2166136261/);
  assert.match(SRC, /Math\.imul\(h, 16777619\)/);
  assert.match(SRC, /h \^= s\.charCodeAt\(i\)/);
});

ok("pages in one family do not all get the same window", () => {
  /* THE DEFECT WORTH CATCHING. Six links per page looks identical on screen
     whether the family's 21 pages point at 6 URLs or at all 21. Simulate the
     real PDF titles against a 21-member pool and require broad coverage. */
  const PDF = CALLS.filter((c) => c.categoryHref === "/pdf-tools" && c.title).map((c) => c.title);
  assert.ok(PDF.length >= 15, `expected the PDF family, got ${PDF.length} titles`);
  const poolSize = 20, limit = 8;
  const hit = new Set();
  const windows = new Map();
  for (const t of PDF) {
    const start = hash(t) % poolSize;
    const w = [];
    for (let n = 0; n < limit; n++) { const i = (start + n) % poolSize; hit.add(i); w.push(i); }
    windows.set(w.join(","), (windows.get(w.join(",")) || 0) + 1);
  }
  /* COVERAGE is the property that matters: every sibling must be linked from
     somewhere, or the pages this exists to rescue are still orphans. */
  assert.equal(hit.size, poolSize,
    `the family's links land on only ${hit.size} of ${poolSize} siblings — the rest stay orphaned`);
  /* Distinctness cannot be perfect and demanding it is how this assertion was
     wrong first time: N pages hashed into N slots collide by the birthday
     bound, so ~12.8 distinct offsets is the EXPECTED value for 20 pages, not a
     defect. Measured here: 14. What would be a defect is degeneracy — one
     window serving most of the family. Bound that instead. */
  assert.ok(windows.size >= Math.ceil(PDF.length * 0.5),
    `${PDF.length} pages produced only ${windows.size} distinct link sets`);
  assert.ok(Math.max(...windows.values()) <= 4,
    `one link set is shared by ${Math.max(...windows.values())} pages — the rotation has degenerated`);
});

ok("self-exclusion survives the two registries disagreeing on wording", () => {
  /* The page says "Add Watermark"; the search index says "Watermark PDF". An
     equality test leaves the page linking to itself, which is the one link
     that is certainly worthless — and it looks perfectly fine on screen. */
  assert.match(SRC, /STOP = new Set\(\[[^\]]*"add"/, "the 'Add ' prefix is no longer normalised away");
  assert.match(SRC, /shared \/ Math\.min\(A\.size, B\.size\)/, "the similarity measure changed");
  /* And the threshold must stay a threshold: pages that use this template
     without being in the index (/poster, /qr-art) must not lose a real sibling
     to whatever happens to match best. */
  assert.match(SRC, /best = 0\.6/, "self-exclusion became an argmax — unindexed pages will drop a good link");
});

ok("a family too small to fill the block tops up from the others", () => {
  /* THREE_TOOLS holds exactly ONE tool, so /3d-tools pages had a sibling pool
     of zero and rendered no block at all — a dead end that reads as a design
     choice. The source can only show the top-up exists; that it produces six
     real links on every family is a question about registry SIZES, which only
     the built page answers. That is scripts/probe-related.mjs. */
  assert.match(SRC, /TOOL_FAMILIES/, "the cross-family pool is gone");
  assert.match(SRC, /take\(wider, limit - out\.length/,
    "small families no longer top up — /3d-tools goes back to rendering nothing");
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.ok(pkg.scripts["probe:related"], "the live half of this guard is unregistered");
});

ok("the resolver asks for at least six links", () => {
  /* The P0 target is depth >= 6 per page. The default is the only thing any
     call site uses, so it is the number that ships. */
  const m = SRC.match(/limit\s*=\s*(\d+)/);
  assert.ok(m && Number(m[1]) >= 6, `default limit is ${m && m[1]} — P0 asks for 6+`);
});

ok("test:related is registered in package.json", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.ok(pkg.scripts["test:related"], "unregistered scripts do not get run");
});

console.log(`\n  ${pass} assertions passed.`);
if (failures.length) {
  console.log(`  ${failures.length} FAILED: ${failures.join(", ")}`);
  process.exit(1);
}
