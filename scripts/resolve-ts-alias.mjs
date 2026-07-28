/* Lets the test scripts import app modules the way the app writes them.
 *
 * node can strip TypeScript types on its own now, so scripts/*.mjs import
 * ../lib/*.ts directly and test real production code rather than a copy. That
 * worked only for LEAF modules: node's resolver knows nothing about the "@/*"
 * tsconfig path alias and, unlike a bundler, requires explicit file extensions.
 * So the moment a lib module imported another one — which lib/operator.ts does,
 * for SITE_URL and the Telegram links — the import threw ERR_MODULE_NOT_FOUND
 * and the only ways out were to contort the production import style or to stop
 * testing that module.
 *
 * Two rules, applied in order:
 *   "@/lib/seo"  -> <repo>/lib/seo.ts        (the tsconfig "@/*": ["./*"] alias)
 *   "./social"   -> <repo>/lib/social.ts     (extensionless relative specifier)
 *
 * Load it with node's --import flag, NOT with a plain import statement. Static
 * imports are hoisted and the whole module graph is linked before any module
 * body runs, so `import "./resolve-ts-alias.mjs"` at the top of a test file
 * registers the hooks strictly after the imports it was meant to fix have
 * already failed. --import runs this before the main module is loaded:
 *
 *   node --import ./scripts/resolve-ts-alias.mjs scripts/test-eeat.mjs
 */

import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, resolve as resolvePath } from "node:path";

const REPO = resolvePath(dirname(fileURLToPath(import.meta.url)), "..");

/** Try the specifier as-is, then with each extension a bundler would add. */
function firstExisting(base) {
  const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}.mts`, `${base}.js`, `${base}/index.ts`, `${base}/index.tsx`];
  return candidates.find((c) => existsSync(c) && !c.endsWith("/"));
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    // The tsconfig alias: "@/*" maps to the repo root.
    if (specifier.startsWith("@/")) {
      const hit = firstExisting(resolvePath(REPO, specifier.slice(2)));
      if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
    }

    // Extensionless relative specifiers, resolved against the importing file.
    if (specifier.startsWith(".") && context.parentURL?.startsWith("file:")) {
      const hit = firstExisting(resolvePath(dirname(fileURLToPath(context.parentURL)), specifier));
      if (hit) return { url: pathToFileURL(hit).href, shortCircuit: true };
    }

    return nextResolve(specifier, context);
  },
});
