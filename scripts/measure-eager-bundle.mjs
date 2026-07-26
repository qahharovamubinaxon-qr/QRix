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

/* Strings that exist in exactly one module, so finding one in the eager set
 * proves that module is in it. */
const MARKERS = [
  ["home-i18n (homepage copy, 12 langs)", "一体化 QR 平台"],
  ["supabase auth SDK", "onAuthStateChange"],
  ["supabase auth SDK (2)", "GoTrueClient"],
  ["nav-i18n (the extracted slice)", "Herramientas de vídeo"],
  ["search catalog", "search-index"],
];

const html = await (await fetch(url, { headers: { "user-agent": "Mozilla/5.0 QRix-bundle-audit" } })).text();

const srcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((m) => m[1]);
const origin = new URL(url).origin;
const abs = [...new Set(srcs.map((s) => (s.startsWith("http") ? s : origin + s)))];

let total = 0;
let joined = "";
const rows = [];
for (const s of abs) {
  const res = await fetch(s, { headers: { "accept-encoding": "gzip, br", "user-agent": "Mozilla/5.0 QRix-bundle-audit" } });
  const body = await res.text();
  /* raw bytes; the transfer number depends on the CDN's encoding of the day, the
   * raw number is what the main thread has to parse */
  const bytes = Buffer.byteLength(body);
  total += bytes;
  joined += body;
  rows.push([s.replace(origin, ""), bytes]);
}

rows.sort((a, b) => b[1] - a[1]);
console.log(`\n${url}`);
console.log(`  ${abs.length} eager scripts, ${(total / 1024).toFixed(1)} KB raw\n`);
for (const [name, bytes] of rows.slice(0, 8)) console.log(`    ${String((bytes / 1024).toFixed(1)).padStart(8)} KB  ${name}`);
if (rows.length > 8) console.log(`    ${String(((total - rows.slice(0, 8).reduce((a, r) => a + r[1], 0)) / 1024).toFixed(1)).padStart(8)} KB  (${rows.length - 8} more)`);

console.log("\n  present in the eager set:");
for (const [label, marker] of MARKERS) {
  console.log(`    ${joined.includes(marker) ? "YES" : "no "}  ${label}`);
}
console.log();
