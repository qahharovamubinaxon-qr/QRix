/* What is actually in the eager <script> set of a page, in bytes and in content.
 *
 * Lighthouse scores on this machine swing wildly (a second Claude session shares
 * the CPU), so "did this get lighter" needs an answer that does not depend on the
 * machine at all. This fetches the page, collects every <script src> the HTML
 * links (i.e. what the browser must download and parse before hydration), sums
 * the transfer bytes, and greps the concatenated source for marker strings that
 * can only come from a specific module.
 *
 *   node scripts/measure-eager-bundle.mjs https://qrixtools.com/qr-tools/url
 */

const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/measure-eager-bundle.mjs <url>");
  process.exit(1);
}

/* Strings that survive minification and exist in exactly ONE module, so finding
 * one in the eager set proves that module is in it. Picking these is the whole
 * trick and it is easy to get wrong: "onAuthStateChange" looks like a marker for
 * the auth SDK but every caller of the SDK contains it too, so it reported the
 * SDK as present on a page that only held TopNav's call site. Identifiers get
 * mangled and module paths disappear; data does not, so each marker below is a
 * literal string out of the module's own data. */
const MARKERS = [
  ["home-i18n (homepage copy, 12 langs)", "一体化 QR 平台"],
  ["supabase auth SDK", "GoTrueClient"],
  /* search-index's OWN literal, not one of the registries it merges: a blog
   * title reported the catalog as present on the homepage, where the title
   * actually came from LatestPosts importing lib/blog directly. */
  ["search catalog (lib/search-index)", "Image Resizer (presets)"],
  ["blog posts (lib/blog)", "WiFi QR Code: Let Guests Connect"],
  ["nav labels (either catalog — these must stay)", "Herramientas de vídeo"],
  ["QRDesignStudio (modal — click only)", "Classy R."],
];

const html = await (await fetch(url, { headers: { "user-agent": "Mozilla/5.0 QRix-bundle-audit" } })).text();

/* Next serves a legacy polyfill bundle with `noModule`, and no browser that
 * understands ES modules ever fetches it — so counting it overstates what a real
 * visitor downloads by ~110 KB. This script did count it, which is why every
 * absolute figure the CWV backlog item records is that much too high (the deltas
 * hold: the polyfill is a constant on both sides of any comparison).
 *
 * It hid because React SSR emits the attribute in camelCase — `noModule=""` —
 * so a case-sensitive grep for `nomodule` finds nothing. That is the same trap
 * that produced the hreflang false positive and the "missing" blog-index dates.
 * The tag match below is deliberately case-insensitive for exactly that reason. */
const tags = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"[^>]*>/gi)];
const legacy = new Set(
  tags.filter((t) => /\bnomodule\b/i.test(t[0])).map((t) => t[1]),
);

const origin = new URL(url).origin;
const absOf = (s) => (s.startsWith("http") ? s : origin + s);
const abs = [...new Set(tags.map((t) => t[1]))];

let total = 0;
let legacyBytes = 0;
let joined = "";
const rows = [];
for (const s of abs) {
  const res = await fetch(absOf(s), { headers: { "accept-encoding": "gzip, br", "user-agent": "Mozilla/5.0 QRix-bundle-audit" } });
  const body = await res.text();
  /* raw bytes; the transfer number depends on the CDN's encoding of the day, the
   * raw number is what the main thread has to parse */
  const bytes = Buffer.byteLength(body);
  const isLegacy = legacy.has(s);
  if (isLegacy) legacyBytes += bytes;
  else {
    total += bytes;
    /* markers describe what a real visitor parses, so the legacy bundle — which
     * contains its own copy of nothing we ship — stays out of the haystack too */
    joined += body;
  }
  rows.push([absOf(s).replace(origin, ""), bytes, isLegacy]);
}

rows.sort((a, b) => b[1] - a[1]);
const modern = rows.filter((r) => !r[2]);
console.log(`\n${url}`);
console.log(`  ${modern.length} eager scripts, ${(total / 1024).toFixed(1)} KB raw`);
if (legacy.size) console.log(`  + ${legacy.size} noModule (legacy) script(s), ${(legacyBytes / 1024).toFixed(1)} KB — NOT fetched by any module-capable browser`);
console.log();
for (const [name, bytes, isLegacy] of rows.slice(0, 9)) {
  console.log(`    ${String((bytes / 1024).toFixed(1)).padStart(8)} KB  ${name}${isLegacy ? "   [noModule — not counted]" : ""}`);
}
if (rows.length > 9) {
  const shownModern = rows.slice(0, 9).filter((r) => !r[2]).reduce((a, r) => a + r[1], 0);
  console.log(`    ${String(((total - shownModern) / 1024).toFixed(1)).padStart(8)} KB  (${rows.length - 9} more)`);
}

console.log("\n  present in the eager set:");
for (const [label, marker] of MARKERS) {
  console.log(`    ${joined.includes(marker) ? "YES" : "no "}  ${label}`);
}
console.log();
