/* Guard for the crawl path into the orphaned families (M147e).

   URL Inspection found 167 URLs that Google had never crawled — every
   /convert, /resize and /barcode page, and the three hubs themselves — because
   nothing on the site linked to them. A sitemap entry was their only route in,
   and on a domain with ~0 referring domains that is not enough.

   What this asserts, and why each half matters:
     · the LINKS exist in the server HTML of pages Google already crawls. A
       client-rendered link, a link behind a hover menu, or a link that moved
       into a lazily-loaded chunk is invisible to a crawler and would silently
       recreate the orphan. That is exactly how the nav's mega-menu links
       already fail to count.
     · each HUB links DOWN to its children. A crawlable hub with no child links
       moves the orphan one level down instead of fixing it.

   Live by default against production; pass a base to check a dev server:
     npm run test:links
     npm run test:links -- http://localhost:3002 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE = process.argv.find((a) => a.startsWith("http")) || "https://qrixtools.com";

let pass = 0;
const fails = [];
const ok = (name, cond, detail = "") => {
  if (cond) pass++;
  else fails.push(`${name}${detail ? ` — ${detail}` : ""}`);
};

/* The RSC flight payload inlines the same markup inside a <script>, so any
   count taken over a raw Next response is doubled and any "is it there?" check
   passes on markup no crawler parses. Strip scripts first, always. */
const strip = (html) => html.replace(/<script[\s\S]*?<\/script>/gi, "");

async function page(pathname) {
  const res = await fetch(`${BASE}${pathname}`, { headers: { "user-agent": "QRix-link-guard" } });
  return { status: res.status, html: strip(await res.text()) };
}

const HUBS = ["/convert", "/resize", "/barcode"];

/* Sources that must carry the links. Kept explicit so that deleting the block
   from one of them fails here rather than six weeks later in a crawl report. */
const SOURCES = [
  ["app/page.tsx", HUBS],
  ["components/CategoryShowcase.tsx", ["/convert", "/resize", "/barcode"]],
  ["app/image-tools/page.tsx", HUBS],
];

for (const [file, hubs] of SOURCES) {
  const src = fs.readFileSync(path.join(root, file), "utf8");
  for (const hub of hubs) {
    ok(`source: ${file} links ${hub}`, new RegExp(`href[=:]\\s*["'\`]${hub}["'\`]`).test(src));
  }
}

/* The entry points a crawler actually reaches: the homepage is the most-crawled
   URL on the site, and /image-tools is the indexed parent of two of the three. */
for (const entry of ["/", "/image-tools"]) {
  const { status, html } = await page(entry);
  ok(`live: ${entry} is 200`, status === 200, `got ${status}`);
  for (const hub of HUBS) {
    const n = (html.match(new RegExp(`href="${hub}"`, "g")) || []).length;
    ok(`live: ${entry} links ${hub}`, n > 0, "0 occurrences in server HTML");
  }
}

/* Each hub must be reachable AND pass the crawl downward. The counts are floors
   taken from the registries (26 convert pairs, 25 resize presets, 13 barcode
   symbologies), so adding pages cannot break this and deleting the child list
   cannot pass it. */
const CHILDREN = [["/convert", "/convert/", 20], ["/resize", "/resize/", 20], ["/barcode", "/barcode/", 10]];
for (const [hub, childPrefix, floor] of CHILDREN) {
  const { status, html } = await page(hub);
  ok(`live: ${hub} is 200`, status === 200, `got ${status}`);
  const kids = new Set((html.match(new RegExp(`href="${childPrefix}[^"]+"`, "g")) || []));
  ok(`live: ${hub} links at least ${floor} children`, kids.size >= floor, `found ${kids.size}`);
}

console.log(`${pass}/${pass + fails.length} assertions passed  (base ${BASE})`);
if (fails.length) {
  console.error("FAILED:\n  " + fails.join("\n  "));
  process.exit(1);
}
