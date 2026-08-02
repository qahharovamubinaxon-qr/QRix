/* Guard for dialog accessibility across the site (M157).

   The defect this exists to prevent is not "QRDesignStudio lacks a focus
   trap". It is that a modal is just a div with a high z-index, so a new one
   can be added — correct-looking, reviewed, shipped — with no role, no
   Escape and no focus management, and NOTHING says so. That is exactly how
   the five modals found by M157's sweep ended up with five different answers.

   So this guard does not check a hand-listed set of components. It REDOES THE
   SWEEP on every run: it scans components/ for the overlay shape itself
   (`fixed inset-0` on a non-decorative element) and requires every one it
   finds to be a real dialog wired to the shared hook. A sixth modal added
   next month fails here on the day it lands.

   That distinction is the M150 lesson: a guard that asserts over a hand-listed
   subset is what let the English-only client tool survive two localization
   passes. Enumerate, then assert over everything enumerated.

   Run: npm run test:modal-a11y */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const HOOK = path.join(root, "lib/use-modal-a11y.ts");

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* ── Files that legitimately hold an unguarded overlay ─────────────────────
   Each entry must justify itself on every run, so the allowlist cannot rot
   into a place where real modals go to hide. DesignPanel is unreachable dead
   code; the moment anything imports it, the reason evaporates and this fails. */
const ALLOW = {
  "components/DesignPanel.tsx":
    "unimported dead code — re-checked below; importing it revokes the exemption",
};

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".tsx")) out.push(p);
  }
  return out;
}

/* Scan opening JSX tags properly rather than by line regex: className values
   are template strings and style props carry nested braces, so "find the tag
   this text sits in" is not a line-oriented question. */
function openingTags(src) {
  const tags = [];
  for (let i = 0; i < src.length; i++) {
    if (src[i] !== "<" || !/[A-Za-z]/.test(src[i + 1] || "")) continue;
    let depth = 0, quote = null, j = i + 1;
    for (; j < src.length; j++) {
      const c = src[j];
      if (quote) { if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'" || c === "`") { quote = c; continue; }
      if (c === "{") depth++;
      else if (c === "}") depth--;
      else if (c === ">" && depth === 0) break;
    }
    tags.push({ text: src.slice(i, j + 1), index: i });
    i = j;
  }
  return tags;
}

/* Decoration, not a dialog: pinned behind the page or unclickable. */
const isDecoration = (t) =>
  /aria-hidden=["']true["']/.test(t) || /-z-10/.test(t) || /pointer-events-none/.test(t);

const files = walk(path.join(root, "components"));
const rel = (p) => path.relative(root, p).replace(/\\/g, "/");

/* ── 1. The hook itself ──────────────────────────────────────────────────── */
ok("hook exists", fs.existsSync(HOOK));
const hook = fs.existsSync(HOOK) ? fs.readFileSync(HOOK, "utf8") : "";

ok("hook exports useModalA11y", /export function useModalA11y\b/.test(hook));

/* Each of these is a behaviour that fails SILENTLY when removed — the modal
   still opens, still closes, still looks right, and only a keyboard user
   ever finds out. Assert the mechanism, not the comment describing it. */
ok(
  "hook captures the trigger BEFORE moving focus inside",
  (() => {
    const capture = hook.search(/const trigger\s*=\s*document\.activeElement/);
    const moves = hook.search(/\bfirst\.focus\(\)/);
    return capture !== -1 && moves !== -1 && capture < moves;
  })(),
  "restoring focus to the trigger is meaningless if it is read after the dialog focused itself",
);
ok(
  "hook restores focus only to a trigger still in the document",
  /trigger\?\.isConnected/.test(hook),
  "a dialog that navigates unmounts its own trigger",
);
ok(
  "hook stands down for keys a component already handled",
  /e\.defaultPrevented/.test(hook),
  "CommandSearch binds Tab to cycle filters; trapping it unconditionally removes that feature",
);
ok(
  "hook lets only the topmost dialog answer Escape",
  /isTopmost\(\)/.test(hook) && /openDialogs\.push/.test(hook),
  "otherwise one Escape closes a modal and whatever is stacked under it",
);
ok(
  "hook removes itself from the stack on close",
  /openDialogs\.splice/.test(hook),
  "a leaked token makes every later dialog think it is not topmost — Escape stops working site-wide",
);
ok(
  "hook measures visibility with getClientRects",
  /getClientRects\(\)\.length/.test(hook),
  "offsetParent is null for position:fixed, which every one of these overlays is",
);
ok("hook is a client module", /^"use client";/.test(hook.trimStart()));

/* ── 2. The sweep — every overlay in components/ ─────────────────────────── */
const overlays = [];
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (!src.includes("fixed inset-0")) continue;
  for (const t of openingTags(src)) {
    if (!t.text.includes("fixed inset-0") || isDecoration(t.text)) continue;
    overlays.push({ file: rel(f), tag: t.text, src });
  }
}

ok(
  "the sweep found the known overlays",
  overlays.length >= 5,
  `found ${overlays.length} — if this collapsed, the tag scanner broke and every assertion below passes vacuously`,
);

for (const o of overlays) {
  const exempt = ALLOW[o.file];
  if (exempt) continue;
  const name = `${o.file} overlay`;
  ok(`${name}: declares role="dialog"`, /role=["']dialog["']/.test(o.tag));
  ok(`${name}: declares aria-modal`, /aria-modal=["']true["']/.test(o.tag));
  ok(
    `${name}: has an accessible name`,
    /aria-label[=\s]/.test(o.tag) || /aria-labelledby/.test(o.tag),
  );
  ok(
    `${name}: carries a ref`,
    /\bref=\{/.test(o.tag),
    "the hook cannot trap focus in an element it has no handle on",
  );
  ok(
    `${o.file}: imports the shared hook`,
    /from "@\/lib\/use-modal-a11y"/.test(o.src),
    "a one-off Escape handler is how the five divergent implementations happened",
  );
  ok(
    `${o.file}: wires the ref it renders to useModalA11y`,
    (() => {
      const m = o.tag.match(/\bref=\{(\w+)\}/);
      if (!m) return false;
      return new RegExp(`const\\s+${m[1]}\\s*=\\s*useModalA11y`).test(o.src);
    })(),
    "a ref pointing at some other useRef traps nothing",
  );
}

/* ── 3. The allowlist has to keep earning it ─────────────────────────────── */
for (const [file, reason] of Object.entries(ALLOW)) {
  const base = path.basename(file, ".tsx");
  const importers = files
    .filter((f) => rel(f) !== file)
    .filter((f) => new RegExp(`\\b${base}\\b`).test(fs.readFileSync(f, "utf8")));
  const appDir = path.join(root, "app");
  const appImporters = fs.existsSync(appDir)
    ? walk(appDir).filter((f) => new RegExp(`\\b${base}\\b`).test(fs.readFileSync(f, "utf8")))
    : [];
  ok(
    `allowlist: ${file} is still unreachable`,
    importers.length === 0 && appImporters.length === 0,
    `${reason}; now referenced by ${[...importers, ...appImporters].map(rel).join(", ")}`,
  );
}

/* ── 4. No modal may re-grow its own Escape ──────────────────────────────── */
for (const o of new Map(overlays.map((o) => [o.file, o])).values()) {
  if (ALLOW[o.file]) continue;
  ok(
    `${o.file}: no private Escape handler`,
    !/key\s*===\s*["']Escape["']/.test(o.src),
    "bypasses the topmost-dialog rule the hook exists to enforce",
  );
}

console.log(`\n${pass}/${pass + fails.length} assertions passed`);
if (fails.length) {
  console.log("\nFAIL:");
  for (const f of fails) console.log(`  · ${f}`);
  process.exit(1);
}
