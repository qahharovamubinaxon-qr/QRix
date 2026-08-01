/* Guard for the re-checkability of both sourced datasets.
 *
 * npm run recheck:sources proves the markers still match the live pages. This
 * proves the markers are worth running: that every cited source HAS evidence,
 * that the evidence is specific enough to mean something, and that the checker
 * itself cannot pass by matching nothing.
 *
 * The failure this exists to prevent is a 24th vendor added with `evidence: []`
 * — which the checker would report as NO EVIDENCE, but only if somebody ran it.
 * That is the exact shape of the defect the whole M148/M152/M153 sequence keeps
 * finding: a claim about a named company that nothing points at a source for.
 */

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

let pass = 0;
const failures = [];
function ok(name, fn) {
  try { fn(); pass++; console.log(`  ok    ${name}`); }
  catch (e) { failures.push(name); console.log(`  FAIL  ${name}\n        ${e.message}`); }
}

const STUDY = readFileSync(new URL("../lib/qr-generator-study.ts", import.meta.url), "utf8");
const COMPARE = readFileSync(new URL("../lib/compare-sources.ts", import.meta.url), "utf8");
const CHECKER = readFileSync(new URL("./recheck-sources.mjs", import.meta.url), "utf8");

/* Same parse the checker uses. Kept as its own copy on purpose: if the two
   drift, this file fails and somebody looks, whereas a shared helper would let
   a broken parser report clean on both sides. */
function evidenceFrom(block) {
  const m = block.match(/evidence:\s*\[([\s\S]*?)\]/);
  if (!m) return null;
  const body = m[1].replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  return [...body.matchAll(/"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'/g)].map((x) =>
    (x[1] !== undefined ? x[1] : x[2]).replace(/\\(["'\\])/g, "$1"),
  );
}

function studyBlocks() {
  const starts = [...STUDY.matchAll(/^\s*id:\s*"([^"]+)",\s*$/gm)];
  return starts.map((s, i) => ({
    id: s[1],
    block: STUDY.slice(s.index, i + 1 < starts.length ? starts[i + 1].index : STUDY.length),
  }));
}
function compareBlocks() {
  const starts = [...COMPARE.matchAll(/^\s{2}"(qrix-vs-[a-z0-9-]+)":\s*\{/gm)];
  return starts.map((s, i) => ({
    id: s[1],
    block: COMPARE.slice(s.index, i + 1 < starts.length ? starts[i + 1].index : COMPARE.length),
  }));
}

const all = [...studyBlocks(), ...compareBlocks()];

ok("the parser sees every source in both datasets", () => {
  // Nothing below means anything if this is zero — the vacuous pass that let a
  // whole mutation batch measure nothing in M150.
  assert.ok(studyBlocks().length >= 20, `parsed ${studyBlocks().length} study vendors, expected 20+`);
  assert.ok(compareBlocks().length >= 3, `parsed ${compareBlocks().length} compare vendors, expected 3+`);
});

ok("every cited source carries at least one evidence marker", () => {
  for (const { id, block } of all) {
    const ev = evidenceFrom(block);
    assert.ok(ev !== null, `${id} has no evidence field — its row cannot be re-checked, so it can go stale silently`);
    assert.ok(ev.length >= 1, `${id} has an empty evidence array`);
  }
});

ok("markers are specific enough to mean something", () => {
  for (const { id, block } of all) {
    for (const m of evidenceFrom(block) || []) {
      assert.ok(
        m.length >= 14,
        `${id}: marker "${m}" is ${m.length} chars — too short to be evidence of anything; it will match boilerplate and report fresh on a page that changed`,
      );
      assert.ok(m.split(/\s+/).length >= 2, `${id}: marker "${m}" is a single token`);
    }
  }
});

ok("no marker is duplicated across vendors", () => {
  // The same string on two vendors means at least one was copied rather than
  // read — how Uniqode's policy first got stored in a competitor's wording.
  const seen = new Map();
  for (const { id, block } of all) {
    for (const m of evidenceFrom(block) || []) {
      const k = m.toLowerCase().replace(/\s+/g, " ");
      if (seen.has(k) && seen.get(k) !== id) {
        assert.fail(`"${m}" is evidence for both ${seen.get(k)} and ${id} — one of them is not the vendor's own wording`);
      }
      seen.set(k, id);
    }
  }
});

ok("every vendor with a limit verdict can prove it", () => {
  // A `limit` is an accusation about a named company. Those specifically may
  // not rest on a source with nothing quotable behind it.
  for (const { id, block } of studyBlocks()) {
    if (!/:\s*LIMIT\(/.test(block)) continue;
    const ev = evidenceFrom(block) || [];
    assert.ok(ev.length >= 1, `${id} carries a LIMIT verdict with no evidence marker`);
  }
});

ok("the checker reads raw markup and never strips tags", () => {
  assert.ok(
    !/replace\([^)]*<[^>]*>[^)]*\)/.test(CHECKER) && !/stripTags|striptags|textContent/.test(CHECKER),
    "recheck-sources.mjs looks like it strips tags — the M148/M152 rule is that a claim about a named third party may not rest on flattened HTML",
  );
  assert.ok(/replace\(\/\\s\+\/g, " "\)/.test(CHECKER), "the checker must whitespace-normalise, or a re-indent reads as a moved verdict");
});

ok("at least one marker is an HTML attribute, and survives the matcher", () => {
  // The-QR-Code-Generator's watermark row is only decidable from alt text: the
  // same label sits next to a tick on the paid card. If a future refactor makes
  // markers tag-free, this is the assertion that notices.
  const attrMarkers = all.flatMap(({ block }) => (evidenceFrom(block) || []).filter((m) => /\w+="/.test(m)));
  assert.ok(attrMarkers.length >= 1, "no attribute-bearing marker left — tag-stripping would now go unnoticed");
});

ok("the checker separates unreachable from moved", () => {
  assert.ok(/UNREACHABLE/.test(CHECKER) && /MOVED/.test(CHECKER),
    "a blocked fetch and a stale reading are different problems; conflating them trains everyone to ignore the output");
});

ok("the checker reports rather than re-grades", () => {
  assert.ok(!/checks\s*[.[]|verdict\s*=/.test(CHECKER),
    "recheck-sources.mjs must not touch verdicts — automatic re-classification is how a page starts asserting things nobody read");
});

ok("recheck:sources is registered in package.json", () => {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.ok(pkg.scripts["recheck:sources"], "unregistered scripts do not get run");
});

console.log(`\n  ${pass} assertions passed over ${all.length} cited sources.`);
if (failures.length) {
  console.log(`  ${failures.length} FAILED: ${failures.join(", ")}`);
  process.exit(1);
}
