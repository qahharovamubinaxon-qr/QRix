/* Does every URL in the sitemap actually answer?
   ───────────────────────────────────────────────────────────────────────────
   verify:daily spot-checks around fifteen recently-shipped pages, which is the
   right shape for a daily gate but says nothing about the other eight hundred.
   A sitemap that lists a 404 spends crawl budget on nothing and teaches Google
   the site is unreliable — and with impressions already going to the wrong
   countries at position ~85, crawl budget is not something to waste.

   Checks status, and for 200s whether the page carries a <title> and an <h1>:
   a page that responds but renders nothing is worse than one that 404s,
   because nothing reports it.

     npm run probe:sitemap
     npm run probe:sitemap -- --limit 100     sample instead of sweeping

   Exit code is the number of bad URLs. */

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
const UA = "QRixSitemapProbe/1.0 (+https://qrixtools.com)";
const args = process.argv.slice(2);
const LIMIT = Number(args[args.indexOf("--limit") + 1]) || 0;
const CONCURRENCY = 8;

const head = async (url) => {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25_000), redirect: "manual" });
    if (r.status !== 200) return { status: r.status, location: r.headers.get("location") };
    const body = await r.text();
    return {
      status: 200,
      title: (body.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]?.trim() || "",
      h1: /<h1[\s>]/i.test(body),
      bytes: body.length,
    };
  } catch (e) {
    return { status: 0, err: e.message };
  }
};

const sm = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { "user-agent": UA } });
if (!sm.ok) { console.log(`sitemap ${sm.status}`); process.exit(1); }
let urls = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (LIMIT) urls = urls.slice(0, LIMIT);

console.log(`sweeping ${urls.length} URLs at ${CONCURRENCY} at a time…\n`);

const bad = [];
let done = 0, thin = 0;

/* A simple worker pool. Firing 849 requests at once would look like an attack
   to our own edge and produce timeouts that are our fault, not the site's. */
async function worker(queue) {
  for (;;) {
    const url = queue.pop();
    if (!url) return;
    const r = await head(url);
    done++;
    if (r.status !== 200) {
      bad.push({ url, why: `HTTP ${r.status || r.err}${r.location ? ` -> ${r.location}` : ""}` });
    } else if (!r.title || !r.h1) {
      /* Counted separately: it responded, so no monitor would ever notice. */
      thin++;
      bad.push({ url, why: `200 but ${!r.title ? "no <title>" : ""}${!r.title && !r.h1 ? " and " : ""}${!r.h1 ? "no <h1>" : ""}` });
    }
    if (done % 100 === 0) process.stdout.write(`  …${done}/${urls.length}\n`);
  }
}

const queue = [...urls];
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)));

console.log(`\nchecked ${done} · ${done - bad.length} healthy · ${bad.length} problem(s)${thin ? ` (${thin} of them answer 200 but render thin)` : ""}\n`);
for (const b of bad.slice(0, 40)) console.log(`  ${b.why.padEnd(34)} ${b.url.replace(ORIGIN, "")}`);
if (bad.length > 40) console.log(`  … and ${bad.length - 40} more`);

process.exit(bad.length);
