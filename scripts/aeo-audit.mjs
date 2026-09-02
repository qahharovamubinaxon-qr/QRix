/* AEO / SEO audit — what a crawler and an answer engine actually see.
   ───────────────────────────────────────────────────────────────────────────
   probe-sitemap.mjs answers "does it respond". This answers the harder
   question: is the page understandable to something that has to summarise or
   cite it? An answer engine needs a title it can quote, one H1, a description,
   a canonical it can trust, structured data that is valid, and internal links
   that place the page in a hierarchy.

   Written after finding that robots.txt blocked every og:image on the site —
   a fault that produced no error anywhere and would never have surfaced from
   status codes alone. This is meant to catch that class of problem.

     npm run aeo:audit                    sweep the whole sitemap
     npm run aeo:audit -- --limit 120     sample
     npm run aeo:audit -- --json out.json machine-readable

   Reports per page: status, title, H1 count, meta description, canonical,
   robots meta, JSON-LD @types, breadcrumb presence, internal link count, and
   whether the body carries enough prose to be quotable.

   Then across pages: duplicate titles, duplicate descriptions, canonical
   mismatches, and pages the sitemap lists but nothing links to.

   Exit code is the number of P0 findings, so it can gate a deploy. */

const ORIGIN = process.env.QRIX_ORIGIN || "https://qrixtools.com";
const UA = "QRixAeoAudit/1.0 (+https://qrixtools.com)";
const args = process.argv.slice(2);
const LIMIT = Number(args[args.indexOf("--limit") + 1]) || 0;
const JSON_OUT = args.includes("--json") ? args[args.indexOf("--json") + 1] : null;
const CONCURRENCY = 8;

const text = (s) => String(s || "").replace(/\s+/g, " ").trim();

function inspect(url, html) {
  const title = text((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const desc = text((html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i) || [])[1]);
  const canonical = (html.match(/rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)
    || html.match(/href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) || [])[1] || "";
  const robotsMeta = text((html.match(/<meta[^>]+name=["']robots["'][^>]+content=["']([^"']*)["']/i) || [])[1]);
  const h1s = [...html.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => text(m[1].replace(/<[^>]+>/g, "")));

  /* JSON-LD can be one object, an array, or several script blocks. Parse each
     and collect @type, because a malformed block is itself a finding — an
     answer engine that cannot parse the schema simply ignores the page's
     claims about itself. */
  const typeCount = new Map();
  let badJsonLd = 0;
  const bump = (t) => typeCount.set(t, (typeCount.get(t) || 0) + 1);
  for (const m of html.matchAll(/<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const parsed = JSON.parse(m[1]);
      for (const node of Array.isArray(parsed) ? parsed : [parsed]) {
        const t = node?.["@type"];
        if (Array.isArray(t)) t.forEach(bump);
        else if (t) bump(t);
      }
    } catch { badJsonLd++; }
  }
  const types = new Set(typeCount.keys());
  /* Counted, not just collected: emitting BreadcrumbList twice on one page is
     a real defect and a Set would hide it. This is exactly the mistake a
     shared layout plus a per-page block produces. */
  const dupSchema = [...typeCount].filter(([t, n]) => n > 1 && t !== "ListItem").map(([t, n]) => `${t}×${n}`);

  /* Prose, not markup: strip scripts, styles and tags, then measure. A tool
     page that is pure UI has nothing for an answer engine to quote. */
  const prose = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  /* Counting space-separated tokens is unfair to Chinese, Japanese and Korean,
     which write without spaces — the first run flagged three perfectly normal
     CJK pages as thin. Count CJK codepoints separately and treat roughly two
     of them as a word, which is the usual rule of thumb. */
  const clean = text(prose);
  const cjk = (clean.match(/[぀-ヿ㐀-䶿一-鿿가-힯]/g) || []).length;
  const words = clean.split(" ").filter((w) => w.length > 2).length + Math.round(cjk / 2);

  const internal = new Set();
  for (const m of html.matchAll(/href=["'](\/[^"'#?]*)["']/g)) internal.add(m[1]);

  return {
    url, title, desc, canonical, robotsMeta,
    h1: h1s.length, h1Text: h1s[0] || "",
    types: [...types], dupSchema, badJsonLd,
    breadcrumb: types.has("BreadcrumbList"),
    words, internalLinks: internal.size, links: [...internal],
  };
}

const fetchPage = async (url) => {
  try {
    const r = await fetch(url, { headers: { "user-agent": UA }, signal: AbortSignal.timeout(25_000), redirect: "manual" });
    if (r.status !== 200) return { url, status: r.status, location: r.headers.get("location") };
    return { status: 200, ...inspect(url, await r.text()) };
  } catch (e) {
    return { url, status: 0, err: e.message };
  }
};

const sm = await fetch(`${ORIGIN}/sitemap.xml`, { headers: { "user-agent": UA } });
if (!sm.ok) { console.log(`sitemap ${sm.status}`); process.exit(1); }
let urls = [...(await sm.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (LIMIT) urls = urls.slice(0, LIMIT);

console.log(`AEO audit — ${urls.length} URLs from the sitemap, ${CONCURRENCY} at a time\n`);

const pages = [];
const queue = [...urls];
let done = 0;
await Promise.all(Array.from({ length: CONCURRENCY }, async () => {
  for (;;) {
    const u = queue.pop();
    if (!u) return;
    pages.push(await fetchPage(u));
    if (++done % 100 === 0) process.stdout.write(`  …${done}/${urls.length}\n`);
  }
}));

const live = pages.filter((p) => p.status === 200);

/* ── findings ─────────────────────────────────────────────────────────── */
const P0 = [], P1 = [], P2 = [];

for (const p of pages) {
  if (p.status !== 200) { P0.push(`HTTP ${p.status || p.err} — ${p.url.replace(ORIGIN, "")}`); continue; }
  if (!p.title) P0.push(`no <title> — ${p.url.replace(ORIGIN, "")}`);
  if (p.badJsonLd) P0.push(`${p.badJsonLd} malformed JSON-LD block(s) — ${p.url.replace(ORIGIN, "")}`);
  if (p.dupSchema?.length) P1.push(`duplicate schema ${p.dupSchema.join(", ")} — ${p.url.replace(ORIGIN, "")}`);
  if (/noindex/i.test(p.robotsMeta)) P0.push(`noindex but in sitemap — ${p.url.replace(ORIGIN, "")}`);
  if (p.canonical && !p.canonical.startsWith(ORIGIN)) P0.push(`canonical points off-site (${p.canonical}) — ${p.url.replace(ORIGIN, "")}`);

  if (p.h1 === 0) P1.push(`no <h1> — ${p.url.replace(ORIGIN, "")}`);
  if (p.h1 > 1) P2.push(`${p.h1} <h1> tags — ${p.url.replace(ORIGIN, "")}`);
  if (!p.desc) P1.push(`no meta description — ${p.url.replace(ORIGIN, "")}`);
  if (!p.canonical) P1.push(`no canonical — ${p.url.replace(ORIGIN, "")}`);
  if (!p.types.length) P1.push(`no structured data — ${p.url.replace(ORIGIN, "")}`);
  if (!p.breadcrumb) P2.push(`no BreadcrumbList — ${p.url.replace(ORIGIN, "")}`);
  if (p.words < 120) P2.push(`only ~${p.words} words of prose — ${p.url.replace(ORIGIN, "")}`);
}

/* Duplicates across the site: an answer engine picking between two pages with
   the same title has no way to tell them apart, and neither has Google. */
const byTitle = new Map(), byDesc = new Map();
for (const p of live) {
  if (p.title) (byTitle.get(p.title) || byTitle.set(p.title, []).get(p.title)).push(p.url);
  if (p.desc) (byDesc.get(p.desc) || byDesc.set(p.desc, []).get(p.desc)).push(p.url);
}
const dupTitles = [...byTitle.entries()].filter(([, v]) => v.length > 1);
const dupDescs = [...byDesc.entries()].filter(([, v]) => v.length > 1);

/* Orphans: in the sitemap, but no other page in the sitemap links to them.
   A page nothing links to is a page crawlers reach only because we asked. */
const linkedTo = new Set();
for (const p of live) for (const l of p.links || []) linkedTo.add(l.replace(/\/$/, "") || "/");
const orphans = live
  .map((p) => p.url.replace(ORIGIN, "") || "/")
  .filter((path) => path !== "/" && !linkedTo.has(path.replace(/\/$/, "")));

/* ── report ───────────────────────────────────────────────────────────── */
const pct = (n) => `${Math.round((n / (live.length || 1)) * 100)}%`;
console.log(`\nchecked ${pages.length} · ${live.length} answered 200\n`);
console.log("coverage:");
console.log(`  title              ${live.filter((p) => p.title).length}/${live.length} (${pct(live.filter((p) => p.title).length)})`);
console.log(`  meta description   ${live.filter((p) => p.desc).length}/${live.length} (${pct(live.filter((p) => p.desc).length)})`);
console.log(`  canonical          ${live.filter((p) => p.canonical).length}/${live.length} (${pct(live.filter((p) => p.canonical).length)})`);
console.log(`  exactly one <h1>   ${live.filter((p) => p.h1 === 1).length}/${live.length} (${pct(live.filter((p) => p.h1 === 1).length)})`);
console.log(`  structured data    ${live.filter((p) => p.types.length).length}/${live.length} (${pct(live.filter((p) => p.types.length).length)})`);
console.log(`  BreadcrumbList     ${live.filter((p) => p.breadcrumb).length}/${live.length} (${pct(live.filter((p) => p.breadcrumb).length)})`);
console.log(`  ≥120 words prose   ${live.filter((p) => p.words >= 120).length}/${live.length} (${pct(live.filter((p) => p.words >= 120).length)})`);

const allTypes = new Map();
for (const p of live) for (const t of p.types) allTypes.set(t, (allTypes.get(t) || 0) + 1);
console.log(`\nschema types in use:`);
for (const [t, n] of [...allTypes].sort((a, b) => b[1] - a[1])) console.log(`  ${String(n).padStart(4)}  ${t}`);

const show = (label, list, cap = 15) => {
  console.log(`\n${label}: ${list.length}`);
  for (const l of list.slice(0, cap)) console.log(`   ${l}`);
  if (list.length > cap) console.log(`   … and ${list.length - cap} more`);
};
show("P0 — must fix", P0);
show("P1 — should fix", P1);
show("P2 — worth fixing", P2, 10);

console.log(`\nduplicate titles: ${dupTitles.length} group(s)`);
for (const [t, v] of dupTitles.slice(0, 8)) console.log(`   "${t.slice(0, 60)}" ×${v.length}`);
console.log(`duplicate descriptions: ${dupDescs.length} group(s)`);
for (const [, v] of dupDescs.slice(0, 5)) console.log(`   ×${v.length}  ${v[0].replace(ORIGIN, "")}`);
console.log(`\norphans (in sitemap, linked from no other sitemap page): ${orphans.length}`);
for (const o of orphans.slice(0, 15)) console.log(`   ${o}`);
if (orphans.length > 15) console.log(`   … and ${orphans.length - 15} more`);

if (JSON_OUT) {
  const fs = await import("node:fs");
  fs.writeFileSync(JSON_OUT, JSON.stringify({ generated: new Date().toISOString(), origin: ORIGIN, pages, P0, P1, P2, dupTitles, dupDescs, orphans }, null, 2));
  console.log(`\nwritten to ${JSON_OUT}`);
}

console.log(`\n${P0.length ? `${P0.length} P0 finding(s)` : "no P0 findings"}`);
process.exit(P0.length);
