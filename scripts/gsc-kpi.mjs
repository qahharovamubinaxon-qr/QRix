/* Search Console KPI reader — the instrument the growth loop was missing.

   Until this existed, growth/SEO_STRATEGY.md's Baseline block could only be
   filled by the owner pasting numbers out of the GSC web UI, so the weekly KPI
   snapshot and the "expand only what already earns impressions" rule (P2) had
   no data behind them. This reads it directly.

   No dependency: a service-account JWT is signed with node:crypto and exchanged
   for an access token, which is all the Search Console API needs.

   Setup (once):
     1. Google Cloud → enable "Search Console API" → create a service account
        → download its JSON key.
     2. Search Console → the property → Settings → Users and permissions →
        add the service account's client_email as a Full user.
     3. Put the key OUTSIDE the repo and point the env at it:
          GSC_SERVICE_ACCOUNT_FILE=C:/Users/<you>/.qrix/gsc.json
        (or GSC_SERVICE_ACCOUNT_JSON with the JSON inline, for CI.)

   Usage:
     npm run kpi                 # last 7 days vs the 7 before, + top movers
     npm run kpi -- --days 28    # any window
     npm run kpi -- --json       # machine-readable, for the weekly snapshot

   The property is auto-detected from sites.list, because picking the wrong form
   ("sc-domain:qrixtools.com" vs "https://qrixtools.com/") is the classic silent
   404 here. Override with GSC_SITE if the account has several. */

import { loadKey, accessToken, api, API, resolveSite, printErrorsPlainly } from "./gsc-auth.mjs";

printErrorsPlainly();

const SITE_HINT = process.env.GSC_SITE || "qrixtools.com";
const args = process.argv.slice(2);
const asJson = args.includes("--json");
const days = Number(args[args.indexOf("--days") + 1]) || 7;

/* ── queries ─────────────────────────────────────────────────────────────── */

const iso = (d) => d.toISOString().slice(0, 10);
/* GSC data lags ~2 days; asking for yesterday returns a half-empty window that
   reads as a crash in traffic. */
const window = (endOffset, len) => {
  const end = new Date(Date.now() - (endOffset + 2) * 86400e3);
  const start = new Date(end.getTime() - (len - 1) * 86400e3);
  return { startDate: iso(start), endDate: iso(end) };
};

const query = (token, site, body) =>
  api(token, `${API}/sites/${encodeURIComponent(site)}/searchAnalytics/query`, {
    method: "POST", body: JSON.stringify(body),
  });

const totals = (rows) => {
  const r = rows?.[0];
  return {
    clicks: r?.clicks ?? 0,
    impressions: r?.impressions ?? 0,
    ctr: r ? +(r.ctr * 100).toFixed(2) : 0,
    position: r ? +r.position.toFixed(1) : 0,
  };
};

const delta = (now, before) => {
  const pct = (a, b) => (b ? `${a >= b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%` : a ? "new" : "0%");
  return {
    clicks: `${before.clicks} → ${now.clicks} (${pct(now.clicks, before.clicks)})`,
    impressions: `${before.impressions} → ${now.impressions} (${pct(now.impressions, before.impressions)})`,
    position: `${before.position} → ${now.position} (${(now.position - before.position).toFixed(1)})`,
  };
};

/* ── main ────────────────────────────────────────────────────────────────── */

const key = loadKey();
const token = await accessToken(key);

const site = await resolveSite(token, SITE_HINT);

const cur = window(0, days);
const prev = window(days, days);

/* The API sorts rows by CLICKS descending and there is no way to ask for
   impressions instead, so a small rowLimit returns whatever happens to have a
   click — at 3 clicks/week that is noise, and the pages actually earning the
   1881 impressions never appear. Pull a wide page and sort locally; this is the
   difference between "what got clicked" and "what has demand", and P2 keys off
   the second one. */
const [nowT, beforeT, queries, pages, countries] = await Promise.all([
  query(token, site, { ...cur }),
  query(token, site, { ...prev }),
  query(token, site, { ...cur, dimensions: ["query"], rowLimit: 1000 }),
  query(token, site, { ...cur, dimensions: ["page"], rowLimit: 1000 }),
  query(token, site, { ...cur, dimensions: ["country"], rowLimit: 250 }),
]);

const now = totals(nowT.rows);
const before = totals(beforeT.rows);

const rows = (r, label) => (r.rows || [])
  .map((x) => ({
    [label]: x.keys[0], clicks: x.clicks, impressions: x.impressions,
    position: +x.position.toFixed(1),
  }))
  .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);

const report = {
  site, window: cur, previous: prev,
  now, before, change: delta(now, before),
  topQueries: rows(queries, "query"),
  topPages: rows(pages, "page"),
  countries: rows(countries, "country"),
};

if (asJson) {
  console.log(JSON.stringify(report, null, 2));
} else {
  const table = (list, label, n = 10) => list.slice(0, n)
    .map((r) => `    ${String(r.impressions).padStart(6)} imp  ${String(r.clicks).padStart(4)} clk  pos ${String(r.position).padStart(5)}  ${r[label]}`)
    .join("\n") || "    (nothing yet)";

  console.log(`\nSearch Console — ${site}`);
  console.log(`window ${cur.startDate}…${cur.endDate}  (vs ${prev.startDate}…${prev.endDate})\n`);
  console.log(`  clicks       ${report.change.clicks}`);
  console.log(`  impressions  ${report.change.impressions}`);
  console.log(`  avg position ${report.change.position}   ctr ${now.ctr}%\n`);
  console.log(`  top queries by impressions — the demand we are shown for:\n${table(report.topQueries, "query", 15)}\n`);
  console.log(`  top pages by impressions — where that demand lands:\n${table(report.topPages, "page", 15)}\n`);
  console.log(`  distinct queries ${report.topQueries.length} · distinct pages ${report.topPages.length}\n`);
  console.log(`  countries:\n${table(report.countries, "country", 8)}\n`);
  console.log("  Paste into growth/SEO_STRATEGY.md → Baseline:");
  console.log(`  - GSC: ${now.impressions} impressions/${days}d, ${now.clicks} clicks, avg position ~${now.position} (was ${before.impressions}/${before.clicks}/${before.position})`);
}
