/* Every homepage language at once, for NODE-SIDE TOOLS ONLY (tests, generators).
 *
 * This lives in scripts/ on purpose. lib/home-i18n/ deliberately ships no
 * aggregate module: one is all it would take for a client component to import
 * every language again and undo M160, and an assertion saying "nobody imports
 * all.ts" is a weaker guarantee than there being no all.ts to import. Nothing a
 * browser loads can reach scripts/, so the boundary holds by construction.
 *
 * Reads the directory rather than a hand-listed set, so a thirteenth language
 * dropped in by the generator is covered without editing this file.
 */

import { readdirSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "home-i18n");

/* types.ts is the shared type (erased at runtime, exports no data) and index.ts
 * is the client loader — neither is a language. */
const NOT_A_LANGUAGE = new Set(["types.ts", "index.ts"]);

export function languageFiles() {
  return readdirSync(DIR)
    .filter((f) => f.endsWith(".ts") && !NOT_A_LANGUAGE.has(f))
    .sort();
}

/** @returns {Promise<Record<string, import("../lib/home-i18n/types.ts").HomeUi>>} */
export async function readAll() {
  const out = {};
  for (const file of languageFiles()) {
    const mod = await import(pathToFileURL(join(DIR, file)).href);
    out[file.replace(/\.ts$/, "")] = mod.default;
  }
  return out;
}
