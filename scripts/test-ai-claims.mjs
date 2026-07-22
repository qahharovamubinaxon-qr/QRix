/* Assertions for the privacy claims on /ai-tools/* — the trust strip variant
 * (lib/ai-connector.ts → engineProcessing) and the derived privacy FAQ
 * (lib/ai-tools-meta.ts).
 *
 * Why this file exists: the claim these pages make about where a user's file
 * goes is not written down on the page, it is COMPUTED — and the input is an
 * environment variable. Every /ai-tools page used to assert "runs in your
 * browser; files never upload" unconditionally, which is true today only
 * because NEXT_PUBLIC_AI_ENGINE is unset. Setting one env var on Vercel would
 * have turned ten pages into false privacy claims with no code change and
 * nothing to review. That failure mode is invisible in a normal test run, so
 * this suite runs the real modules TWICE — once with the engine off, once with
 * it on — in child processes, because the env is read at module load.
 *
 *   node scripts/test-ai-claims.mjs      (or: npm run test:ai)
 */

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SELF = fileURLToPath(import.meta.url);

/* The child pass: import the shipped modules under whatever env we inherited
   and print the facts the pages are built from. */
if (process.argv[2] === "--dump") {
  const { register } = await import("node:module");
  register("./alias-hooks.mjs", import.meta.url); // ai-tools-meta imports "@/lib/ai-connector"
  const { AI_CLOUD_ROUTES, engineProcessing } = await import("../lib/ai-connector.ts");
  const { AI_TOOLS } = await import("../lib/ai-tools-meta.ts");
  process.stdout.write(JSON.stringify({
    routes: AI_CLOUD_ROUTES,
    tools: AI_TOOLS.map((t) => ({
      slug: t.slug,
      engine: t.engine,
      processing: engineProcessing(t.engine),
      faqs: t.faqs,
    })),
  }));
  process.exit(0);
}

function dump(engineValue) {
  const env = { ...process.env };
  if (engineValue) env.NEXT_PUBLIC_AI_ENGINE = engineValue;
  else delete env.NEXT_PUBLIC_AI_ENGINE;
  const r = spawnSync(process.execPath, ["--disable-warning=MODULE_TYPELESS_PACKAGE_JSON", SELF, "--dump"], {
    env, encoding: "utf8",
  });
  if (r.status !== 0) throw new Error(`child failed (${r.status}):\n${r.stderr}`);
  return JSON.parse(r.stdout);
}

let pass = 0;
const fails = [];
const t = (name, fn) => {
  try { fn(); pass++; }
  catch (e) { fails.push(`${name}\n    ${e.message.split("\n").join("\n    ")}`); }
};

const OFF = dump(null);
const ON = dump("replicate");

/* Wording that asserts the work stays on the reader's machine. If any of these
   survives into a routed tool's FAQ while the engine is on, the page is lying. */
const DEVICE_CLAIM = /on your device|in your browser|never (?:upload|leave)|nothing is (?:stored or )?sent/i;

const byslug = (d, s) => d.tools.find((x) => x.slug === s);

/* ---- the table itself ------------------------------------------------ */

t("every route names a real AiTask, a sends kind and a mode", () => {
  const TASKS = new Set(["colorize", "inpaint", "describe", "translate", "transcribe", "generate-image", "improve-text"]);
  for (const [engine, r] of Object.entries(OFF.routes)) {
    assert.ok(TASKS.has(r.task), `${engine}: unknown task ${r.task}`);
    assert.ok(r.sends === "file" || r.sends === "text", `${engine}: bad sends ${r.sends}`);
    assert.ok(r.mode === "replaces" || r.mode === "adds", `${engine}: bad mode ${r.mode}`);
  }
});

t("every routed engine is actually reachable from a tool page", () => {
  const engines = new Set(OFF.tools.map((x) => x.engine));
  for (const engine of Object.keys(OFF.routes)) {
    assert.ok(engines.has(engine), `${engine} has a cloud route but no tool uses it`);
  }
});

/* ---- engine OFF: nothing changes ------------------------------------- */

t("with no engine configured every tool page is on-device", () => {
  for (const x of OFF.tools) assert.equal(x.processing, "device", `${x.slug} is ${x.processing}`);
});

t("with no engine configured the FAQs are untouched", () => {
  // The derivation must be a no-op today — production copy is unchanged.
  for (const x of OFF.tools) {
    const priv = x.faqs.find((f) => f.q === "Is my file uploaded to a server?");
    if (priv) assert.match(priv.a, /^No — processing runs on your device/, `${x.slug} FAQ drifted`);
  }
});

/* ---- engine ON: the claims invert exactly where they must ------------- */

t("with the engine on, 'replaces' tools become cloud pages", () => {
  for (const [engine, r] of Object.entries(ON.routes)) {
    if (r.mode !== "replaces") continue;
    for (const x of ON.tools.filter((y) => y.engine === engine)) {
      assert.equal(x.processing, "cloud", `${x.slug} (${engine}) stayed ${x.processing}`);
    }
  }
});

t("with the engine on, 'adds' tools become hybrid, not cloud", () => {
  for (const [engine, r] of Object.entries(ON.routes)) {
    if (r.mode !== "adds") continue;
    for (const x of ON.tools.filter((y) => y.engine === engine)) {
      assert.equal(x.processing, "hybrid", `${x.slug} (${engine}) is ${x.processing}`);
    }
  }
});

t("with the engine on, unrouted tools stay on-device", () => {
  for (const x of ON.tools) {
    if (ON.routes[x.engine]) continue;
    assert.equal(x.processing, "device", `${x.slug} (${x.engine}) drifted to ${x.processing}`);
  }
});

t("no 'replaces' tool keeps an on-device privacy answer once the engine is on", () => {
  for (const x of ON.tools) {
    const r = ON.routes[x.engine];
    if (!r || r.mode !== "replaces") continue;
    for (const f of x.faqs) {
      assert.doesNotMatch(f.a, DEVICE_CLAIM, `${x.slug}: "${f.q}" still claims on-device work`);
    }
  }
});

t("every routed tool answers the upload question once the engine is on", () => {
  for (const x of ON.tools) {
    const r = ON.routes[x.engine];
    if (!r) continue;
    const noun = r.sends === "file" ? "file" : "text";
    const q = `Is my ${noun} uploaded to a server?`;
    const f = x.faqs.find((y) => y.q === q);
    assert.ok(f, `${x.slug} has no "${q}" FAQ`);
    assert.match(f.a, /QRix cloud engine/, `${x.slug}: answer does not name the cloud engine`);
    assert.match(f.a, /discard/i, `${x.slug}: answer does not say the ${noun} is discarded`);
  }
});

t("the upload answer is asked about the thing that is actually sent", () => {
  // A text tool asking "is my file uploaded" answers a question nobody asked.
  for (const x of ON.tools) {
    const r = ON.routes[x.engine];
    if (!r) continue;
    const wrong = r.sends === "file" ? "text" : "file";
    assert.ok(!x.faqs.some((f) => f.q === `Is my ${wrong} uploaded to a server?`),
      `${x.slug} sends ${r.sends} but asks about the ${wrong}`);
  }
});

t("a 'replaces' answer is unconditional; an 'adds' answer keeps the local path", () => {
  for (const x of ON.tools) {
    const r = ON.routes[x.engine];
    if (!r) continue;
    const noun = r.sends === "file" ? "file" : "text";
    const f = x.faqs.find((y) => y.q === `Is my ${noun} uploaded to a server?`);
    if (r.mode === "replaces") assert.doesNotMatch(f.a, /^Not for/, `${x.slug} hedges on a replaces route`);
    else assert.match(f.a, /stay in your browser/, `${x.slug} drops the on-device half of a hybrid answer`);
  }
});

/* ---- the three that started this ------------------------------------- */

t("colorize, remove-objects and image-description flip together", () => {
  for (const slug of ["colorize-photo", "remove-objects", "image-description"]) {
    const off = byslug(OFF, slug), on = byslug(ON, slug);
    assert.ok(off && on, `${slug} missing`);
    assert.equal(off.processing, "device");
    assert.equal(on.processing, "cloud");
    const before = off.faqs.find((f) => f.q === "Is my file uploaded to a server?");
    assert.match(before.a, /^No —/, `${slug} did not carry the on-device answer to begin with`);
    const after = on.faqs.find((f) => f.q === "Is my file uploaded to a server?");
    assert.doesNotMatch(after.a, /^No —/, `${slug} kept "No" after the engine went live`);
  }
});

t("the background remover and OCR never flip — they are genuinely local", () => {
  for (const slug of ["background-remover", "image-to-text", "ocr"]) {
    const on = byslug(ON, slug);
    if (!on) continue;
    assert.equal(on.processing, "device", `${slug} became ${on.processing}`);
    const f = on.faqs.find((y) => y.q === "Is my file uploaded to a server?");
    if (f) assert.match(f.a, /^No —/, `${slug} lost its true on-device answer`);
  }
});

/* ---- the wiring, not just the function ------------------------------- */

t("the tool page reads processing from the connector, not a literal", () => {
  // Everything above tests engineProcessing(); none of it notices if the page
  // stops calling it, which is exactly how this claim went stale the first time.
  const src = readFileSync(new URL("../app/ai-tools/[slug]/page.tsx", import.meta.url), "utf8");
  assert.match(src, /processing=\{engineProcessing\(tool\.engine\)\}/,
    "app/ai-tools/[slug]/page.tsx no longer derives `processing` per engine");
});

t("the shell still has a distinct copy set per processing mode", () => {
  const src = readFileSync(new URL("../components/ToolPageShell.tsx", import.meta.url), "utf8");
  for (const k of ["device", "cloud", "hybrid"]) {
    assert.match(src, new RegExp(`${k}:\\s*WHY_`), `ToolPageShell has no copy set for "${k}"`);
  }
  // The on-device promise must not be what a cloud page renders.
  const cloud = src.match(/const WHY_CLOUD = \[[\s\S]*?\];/)[0];
  assert.doesNotMatch(cloud, DEVICE_CLAIM, "the cloud trust strip claims on-device work");
});

/* ---- report ---------------------------------------------------------- */

console.log(`\n  ai claims: ${pass} passed, ${fails.length} failed`);
if (fails.length) {
  console.error("\n" + fails.map((f) => `  ✗ ${f}`).join("\n\n") + "\n");
  process.exit(1);
}
console.log("  ✓ every /ai-tools privacy claim tracks the connector, engine off and on\n");
