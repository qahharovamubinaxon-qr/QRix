/* Resolution hook so the test scripts can import the SHIPPED modules even when
 * those use the project's "@/*" path alias (tsconfig paths → repo root).
 * Node's type stripping handles the TypeScript; it just doesn't know the alias.
 *
 * Registered at runtime by the suite that needs it:
 *   import { register } from "node:module";
 *   register("./alias-hooks.mjs", import.meta.url);
 */

import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const EXTS = ["", ".ts", ".tsx", ".mjs", ".js", ".jsx", "/index.ts", "/index.tsx"];

export function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    const base = join(ROOT, specifier.slice(2));
    for (const ext of EXTS) {
      if (existsSync(base + ext)) return { url: pathToFileURL(base + ext).href, shortCircuit: true };
    }
    throw new Error(`alias-hooks: cannot resolve ${specifier} (tried ${base}{${EXTS.join(",")}})`);
  }
  return next(specifier, context);
}
