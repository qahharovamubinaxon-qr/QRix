/* URL Inspection sampler — answers the question the KPI reader raised.

   npm run kpi says 599 distinct queries but only 67 of ~810 URLs earn a single
   impression. The other ~740 are silent for one of two reasons, and they need
   opposite fixes:
     · NOT INDEXED — Google has not stored the page. Crawl/discovery/quality
       problem: internal links, sitemap, thin or duplicate content.
     · INDEXED AND NEVER SHOWN — the page is in, it just never ranks well enough
       to be displayed for anything. Demand/competition problem: the query has
       no volume, or we are nowhere near page 1 for it.
   Guessing between those wastes a mission. The URL Inspection API says which.

   Samples the live sitemap, stratified by page family so no family is missed,
   then inspects each URL. Quota is 2,000/day, so the default 30 is free.

   Usage:
     npm run inspect                 # 30 URLs, ~3 per family
     npm run inspect -- --per 5      # more per family
     npm run inspect -- --json
     npm run inspect -- <url> <url>  # inspect specific URLs */

import { loadKey, accessToken, api, resolveSite, printErrorsPlainly } from "./gsc-auth.mjs";

printErrorsPlainly();

const INSPECT = "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";
const SITEMAP = "https://qrixtools.com/sitemap.xml";

const argv = process.argv.slice(2);
const asJson = argv.includes("--json");
const per = Number(argv[argv.indexOf("--per") + 1]) || 3;
const explicit = argv.filter((a) => a.startsWith("http"));

/* One bucket per page family. The order matters only for reading the report;
   what matters is that a family with 200 URLs and a family with 1 both get
   sampled, because "which family is missing" is the actual question. */
const FAMILIES = [
  ["home", (u) => new URL(u).pathname === "/"],
  ["convert en", (u) => /^\/convert\//.test(new URL(u).pathname)],
  ["convert ru/uz", (u) => /^\/(ru|uz)\/convert\//.test(new URL(u).pathname)],
  ["resize en", (u) => /^\/resize\//.test(new URL(u).pathname)],
  ["resize ru/uz", (u) => /^\/(ru|uz)\/resize\//.test(new URL(u).pathname)],
  ["image-tools", (u) => /^\/image-tools\//.test(new URL(u).pathname)],
  ["qr-tools", (u) => /^\/qr-tools\//.test(new URL(u).pathname)],
  ["pdf-tools", (u) => /^\/pdf-tools\//.test(new URL(u).pathname)],
  ["ai-tools", (u) => /^\/ai-tools\//.test(new URL(u).pathname)],
  ["video/3d", (u) => /^\/(video-tools|3d-tools)\//.test(new URL(u).pathname)],
  ["use/<lang>", (u) => /^\/use\//.test(new URL(u).pathname)],
  ["blog", (u) => /^\/blog\//.test(new URL(u).pathname)],
  ["barcode", (u) => /^\/barcode/.test(new URL(u).pathname)],
];

async function sampleFromSitemap() {
  const xml = await (await fetch(SITEMAP)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const picked = [];
  const counts = {};

  for (const [name, match] of FAMILIES) {
    const inFamily = urls.filter((u) => { try { return match(u); } catch { return false; } });
    counts[name] = inFamily.length;
    /* Evenly spaced rather than the first N: the first N of a sorted family are
       all the same shape, and a sample that only ever sees the top of the list
       cannot notice that the tail is missing. */
    const step = Math.max(1, Math.floor(inFamily.length / per));
    for (let i = 0; i < inFamily.length && picked.filter((p) => p.family === name).length < per; i += step) {
      picked.push({ family: name, url: inFamily[i] });
    }
  }
  const other = urls.filter((u) => !FAMILIES.some(([, m]) => { try { return m(u); } catch { return false; } }));
  counts.other = other.length;
  for (let i = 0; i < other.length && i < per; i += Math.max(1, Math.floor(other.length / per))) {
    picked.push({ family: "other", url: other[i] });
  }
  return { picked, counts, total: urls.length };
}

const key = loadKey();
const token = await accessToken(key);
const site = await resolveSite(token);

const { picked, counts, total } = explicit.length
  ? { picked: explicit.map((u) => ({ family: "explicit", url: u })), counts: {}, total: explicit.length }
  : await sampleFromSitemap();

const results = [];
for (const { family, url } of picked) {
  try {
    const r = await api(token, INSPECT, {
      method: "POST",
      body: JSON.stringify({ inspectionUrl: url, siteUrl: site, languageCode: "en-US" }),
    });
    const idx = r.inspectionResult?.indexStatusResult || {};
    results.push({
      family, url,
      verdict: idx.verdict || "?",
      coverage: idx.coverageState || "?",
      robots: idx.robotsTxtState || "?",
      lastCrawl: idx.lastCrawlTime ? idx.lastCrawlTime.slice(0, 10) : null,
      /* A googleCanonical that differs from ours means Google folded this page
         into another one — it is "indexed" only in the sense that something
         else represents it, which is invisible in a coverage count. */
      userCanonical: idx.userCanonical || null,
      googleCanonical: idx.googleCanonical || null,
      folded: !!(idx.googleCanonical && idx.userCanonical && idx.googleCanonical !== idx.userCanonical),
    });
  } catch (e) {
    results.push({ family, url, verdict: "ERROR", coverage: String(e.message).slice(0, 90) });
  }
}

const indexed = results.filter((r) => r.verdict === "PASS");
const folded = results.filter((r) => r.folded);
const byCoverage = results.reduce((a, r) => ({ ...a, [r.coverage]: (a[r.coverage] || 0) + 1 }), {});

if (asJson) {
  console.log(JSON.stringify({ site, sitemapTotal: total, familySizes: counts, results }, null, 2));
} else {
  console.log(`\nURL Inspection — ${site}   (sitemap ${total} URLs, sampled ${results.length})\n`);
  for (const r of results) {
    const flag = r.verdict === "PASS" ? "IN " : r.verdict === "ERROR" ? "ERR" : "OUT";
    console.log(`  ${flag}  ${r.family.padEnd(14)} ${String(r.coverage).padEnd(42)} ${r.lastCrawl || "never crawled"}  ${r.url.replace("https://qrixtools.com", "")}`);
    if (r.folded) console.log(`       └─ folded into ${r.googleCanonical}`);
  }
  console.log(`\n  indexed ${indexed.length}/${results.length}` + (folded.length ? ` · folded into another URL: ${folded.length}` : ""));
  console.log("  coverage states:");
  for (const [k, v] of Object.entries(byCoverage).sort((a, b) => b[1] - a[1])) console.log(`    ${String(v).padStart(3)}  ${k}`);
  console.log("\n  family sizes in the sitemap:");
  for (const [k, v] of Object.entries(counts).sort((a, b) => b[1] - a[1])) console.log(`    ${String(v).padStart(4)}  ${k}`);
  console.log("");
}
