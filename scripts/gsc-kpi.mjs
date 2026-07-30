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

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/* Every failure here is a setup mistake with a specific fix (key misplaced,
   account not added to the property, wrong property form), and each message
   below says which. A 40-line stack trace buries that, so print the message. */
for (const ev of ["uncaughtException", "unhandledRejection"]) {
  process.on(ev, (e) => {
    console.error(`\n  x ${e?.message || e}\n`);
    process.exit(1);
  });
}

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
const API = "https://www.googleapis.com/webmasters/v3";
const SITE_HINT = process.env.GSC_SITE || "qrixtools.com";

const args = process.argv.slice(2);
const asJson = args.includes("--json");
const days = Number(args[args.indexOf("--days") + 1]) || (args.includes("--days") ? 7 : 7);

/* ── credentials ─────────────────────────────────────────────────────────── */

function loadKey() {
  const inline = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (inline) return JSON.parse(inline);

  const envPath = process.env.GSC_SERVICE_ACCOUNT_FILE;
  const candidates = [
    envPath,
    path.join(process.env.USERPROFILE || process.env.HOME || ".", ".qrix", "gsc.json"),
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf8"));
  }
  throw new Error(
    "no service-account key found. Set GSC_SERVICE_ACCOUNT_FILE to its path, " +
    `or place it at ${candidates[candidates.length - 1]}. Never commit it.`,
  );
}

const b64url = (buf) => Buffer.from(buf).toString("base64url");

async function accessToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600,
  }));
  const sig = crypto.createSign("RSA-SHA256").update(`${header}.${claim}`).sign(key.private_key);
  const assertion = `${header}.${claim}.${b64url(sig)}`;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`token exchange failed (${res.status}): ${JSON.stringify(body)}`);
  return body.access_token;
}

async function api(token, url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const hint = res.status === 403
      ? " — is the service account added as a user on this property in Search Console?"
      : "";
    throw new Error(`${res.status} ${url.replace(API, "")}${hint}: ${JSON.stringify(body).slice(0, 300)}`);
  }
  return body;
}

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

const sites = await api(token, `${API}/sites`);
const owned = (sites.siteEntry || []).map((s) => s.siteUrl);
const site = owned.find((s) => s === SITE_HINT)
  || owned.find((s) => s.includes(SITE_HINT))
  || owned[0];
if (!site) {
  throw new Error(
    `the service account (${key.client_email}) sees no properties. Add it as a user ` +
    "on the property in Search Console → Settings → Users and permissions.",
  );
}

const cur = window(0, days);
const prev = window(days, days);

const [nowT, beforeT, queries, pages, countries] = await Promise.all([
  query(token, site, { ...cur }),
  query(token, site, { ...prev }),
  query(token, site, { ...cur, dimensions: ["query"], rowLimit: 15 }),
  query(token, site, { ...cur, dimensions: ["page"], rowLimit: 15 }),
  query(token, site, { ...cur, dimensions: ["country"], rowLimit: 8 }),
]);

const now = totals(nowT.rows);
const before = totals(beforeT.rows);

const rows = (r, label) => (r.rows || []).map((x) => ({
  [label]: x.keys[0], clicks: x.clicks, impressions: x.impressions,
  position: +x.position.toFixed(1),
}));

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
  console.log(`  top queries — what people actually search for:\n${table(report.topQueries, "query")}\n`);
  console.log(`  top pages — where the impressions are:\n${table(report.topPages, "page")}\n`);
  console.log(`  countries:\n${table(report.countries, "country", 8)}\n`);
  console.log("  Paste into growth/SEO_STRATEGY.md → Baseline:");
  console.log(`  - GSC: ${now.impressions} impressions/${days}d, ${now.clicks} clicks, avg position ~${now.position} (was ${before.impressions}/${before.clicks}/${before.position})`);
}
