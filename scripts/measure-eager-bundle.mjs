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

/* The nav labels ship in the eager set of every page on the site — TopNav is in
 * the root layout and its labels come from lib/nav-i18n, a static import. So
 * this marker being ABSENT never means "the page got lighter", it means the
 * measurement is not looking at a QRix page. */
const CANARY = "nav labels (either catalog — these must stay)";

/* Every failure this script has produced was silent: it printed a number that
 * looked like a finding. On Aug 2 production answered 403 to non-browser clients
 * for ~20 minutes and this reported "0 eager scripts, 0.0 KB" with every marker
 * absent on three templates — three Next.js pages appearing to ship zero
 * JavaScript. That is not a result, it is an instrument reading a challenge
 * page, and the two printed identically. So: die, loudly, with the reason.
 *
 * It throws rather than calling process.exit() because exiting from inside the
 * fetch loop trips a libuv assertion on Windows and turns a clear message into
 * a crash dump with exit code 127. */
class MeasurementFailure extends Error {
  constructor(what, detail) {
    super(what);
    this.what = what;
    this.detail = detail;
  }
}
const die = (what, detail) => {
  throw new MeasurementFailure(what, detail);
};

try {
  const pageRes = await fetch(url, { headers: { "user-agent": "Mozilla/5.0 QRix-bundle-audit" } });
  if (!pageRes.ok) {
    const mitigated = pageRes.headers.get("x-vercel-mitigated");
    die(
      `the page answered ${pageRes.status}, not 200`,
      mitigated
        ? `x-vercel-mitigated: ${mitigated} — production is challenging non-browser clients, so every byte below would be the challenge page's. Wait for it to clear.`
        : `there is no page here to measure.`,
    );
  }
  const html = await pageRes.text();

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
  if (tags.length === 0) {
    die(
      "the HTML links no <script src> at all",
      `every Next.js page in this app ships a script set; ${html.length} bytes of HTML with none in it is a different page than the one you asked for.`,
    );
  }
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
    if (!res.ok) {
      die(`chunk ${s} answered ${res.status}`, `a missing chunk subtracts from the total silently, which reads as a win.`);
    }
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

  /* Checked LAST so the numbers are on screen when it fires — the canary failing
   * invalidates them, and seeing what the bad measurement claimed is how you
   * recognise the shape next time. */
  const canary = MARKERS.find(([label]) => label === CANARY);
  if (!joined.includes(canary[1])) {
    die(
      `the "${CANARY}" marker is absent`,
      `TopNav is in the root layout and imports lib/nav-i18n statically, so this string is in the eager set of every page on this site. Absent means the ${modern.length} script(s) / ${(total / 1024).toFixed(1)} KB printed above are not this app's — everything above is void.`,
    );
  }
} catch (err) {
  if (!(err instanceof MeasurementFailure)) throw err;
  console.error(`\nMEASUREMENT FAILED — ${err.what}`);
  console.error(`  ${err.detail}`);
  console.error(`  url: ${url}`);
  console.error(`  Nothing above this line was a finding.\n`);
  process.exitCode = 1;
}
