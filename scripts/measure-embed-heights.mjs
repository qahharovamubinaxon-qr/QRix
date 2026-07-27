/* The browser half of the embed guard: does every stat card actually FIT the
 * iframe height lib/qr-stats.ts hands the embedder?
 *
 * test:qr-stats can only check the height formula against itself. It cannot see
 * text wrapping, and that is where this went wrong: the first version of
 * embedHeight() was short on all 26 cards — by 30 to 102 px — so every embedded
 * card cut off its footer, and the longest ones cut into the caveat, which is
 * the one part of the card that must survive being quoted. Nothing on our own
 * site looked wrong, because the clipping only happens inside someone else's
 * iframe (M141).
 *
 * Run it after touching the card's CSS, the height formula, or any stat's copy:
 *
 *   node scripts/measure-embed-heights.mjs                    (production)
 *   node scripts/measure-embed-heights.mjs http://localhost:3199
 *
 * It drives real headless Chrome, which this repo does not depend on — it
 * borrows puppeteer-core and chrome-launcher out of the lighthouse npx cache,
 * and says so plainly if they are not there.
 */

import { execSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { register, createRequire } from "node:module";

register("./alias-hooks.mjs", import.meta.url);
const { ALL_STATS, embedHeight, EMBED_WIDTH_BASIS } = await import("../lib/qr-stats.ts");

const BASE = process.argv[2] || "https://qrixtools.com";

/* puppeteer-core lives in whichever _npx/<hash> lighthouse was installed into.
   Resolve its entry FILE, not its directory — a bare directory import is not a
   thing in ESM. */
function findNpxPackage(name) {
  const npx = join(execSync("npm config get cache").toString().trim(), "_npx");
  if (!existsSync(npx)) return null;
  for (const dir of readdirSync(npx)) {
    const home = join(npx, dir);
    if (!existsSync(join(home, "node_modules", name))) continue;
    try {
      return pathToFileURL(createRequire(join(home, "index.js")).resolve(name)).href;
    } catch {
      /* a half-installed cache entry — keep looking */
    }
  }
  return null;
}

const puppeteerPath = findNpxPackage("puppeteer-core");
const launcherPath = findNpxPackage("chrome-launcher");
if (!puppeteerPath || !launcherPath) {
  console.error(
    "\n  Needs puppeteer-core + chrome-launcher, which this repo does not depend on.\n" +
      "  Run `npx lighthouse --version` once to populate the npx cache, then re-run.\n",
  );
  process.exit(2);
}
const { default: puppeteer } = await import(puppeteerPath);
const { Launcher } = await import(launcherPath);

const browser = await puppeteer.launch({ executablePath: Launcher.getFirstInstallation(), headless: "new" });
const rows = [];

for (const s of ALL_STATS) {
  const given = embedHeight(s);
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  /* the narrow column the height is calibrated for — the worst case in a blog body */
  await page.setViewport({ width: EMBED_WIDTH_BASIS, height: given });
  await page.goto(`${BASE}/embed/qr-stat/${s.id}`, { waitUntil: "networkidle0" });
  const m = await page.evaluate(() => {
    const card = document.querySelector("article");
    return {
      needed: card ? Math.ceil(card.getBoundingClientRect().height) + 28 : 0, // + body padding
      scripts: document.querySelectorAll("script").length,
      caveat: !!document.querySelector(".cv"),
    };
  });
  rows.push({ id: s.id, given, ...m, errors: errors.length });
  await page.close();
}
await browser.close();

const clipped = rows.filter((r) => r.needed > r.given);
const scripted = rows.filter((r) => r.scripts > 0);
const broken = rows.filter((r) => !r.needed || r.errors);
const slack = rows.map((r) => r.given - r.needed);

for (const r of clipped) console.error(`  CLIPS  ${r.id}: needs ${r.needed}px, the snippet gives ${r.given}px`);
for (const r of scripted) console.error(`  SCRIPT ${r.id}: ${r.scripts} script tag(s) — the card is a page again (M141)`);
for (const r of broken) console.error(`  BROKEN ${r.id}: no card rendered or ${r.errors} page error(s)`);

console.log(
  `\n  ${BASE} — ${rows.length} cards at ${EMBED_WIDTH_BASIS}px: ` +
    `${clipped.length} clipping, ${scripted.length} with script, ` +
    `${rows.filter((r) => r.caveat).length} rendering a caveat, ` +
    `slack ${Math.min(...slack)}..${Math.max(...slack)}px\n`,
);

if (clipped.length || scripted.length || broken.length) process.exitCode = 1;
