/* Google Analytics 4 — the answer to "how many people came today".
   ───────────────────────────────────────────────────────────────────────────
   Search Console only sees Google search. It cannot see direct visits, Telegram,
   Yandex, or anyone who typed the address. For months the honest answer to the
   owner's question was "I don't know", and that is what this fixes.

   GA4 was already installed — app/layout.tsx renders <GoogleAnalytics> with
   NEXT_PUBLIC_GA_ID (falling back to G-XKW8P2LRY0). Nothing was ever READ back,
   because reading needs the service account to be a viewer on the property, and
   that is a grant only the owner can make.

   Reuses the Search Console key (~/.qrix/gsc.json) with a different scope. Same
   no-dependency JWT: node:crypto signs it, one fetch exchanges it.

     npm run ga                    last 7 days vs the 7 before
     npm run ga -- --days 28       any window
     GA_PROPERTY_ID=123456789 …    skip discovery

   If the account cannot see the property yet, this prints the exact email to add
   and where — a wrong answer here looks identical to "no traffic", which is the
   most expensive confusion available. */
import { loadKey } from "./gsc-auth.mjs";
import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const ADMIN = "https://analyticsadmin.googleapis.com/v1beta";
const DATA = "https://analyticsdata.googleapis.com/v1beta";

const args = process.argv.slice(2);
const days = Number(args[args.indexOf("--days") + 1]) || 7;

const key = loadKey();

const b64url = (buf) => Buffer.from(buf).toString("base64url");
async function accessToken() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email, scope: SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600,
  }));
  const sig = crypto.createSign("RSA-SHA256").update(`${header}.${claim}`).sign(key.private_key);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${b64url(sig)}`,
    }),
  });
  const body = await res.json();
  if (!res.ok) throw new Error(`token exchange failed (${res.status}): ${JSON.stringify(body)}`);
  return body.access_token;
}

async function call(token, url, init = {}) {
  const res = await fetch(url, {
    ...init,
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json", ...(init.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, body };
}

/* A 403 here has two completely different causes and one wrong-looking symptom.
   Either the API is switched off on the Cloud project, or the service account is
   not a viewer on the property. Both return PERMISSION_DENIED; only the message
   distinguishes them, and telling the owner to click the wrong thing costs a day.
   So read `reason` and say precisely which one it is. */
function explain403(body, fallback = "") {
  const err = body?.error || {};
  const reason = (err.details || []).find((d) => d.reason)?.reason || "";
  const project = (err.details || []).find((d) => d.metadata?.consumer)?.metadata?.consumer?.split("/")[1];

  if (reason === "SERVICE_DISABLED" || /has not been used in project|is disabled/i.test(err.message || "")) {
    console.log(`
  The API is switched OFF, which is not the same as missing permission.

  Google Cloud project ${project || "(see below)"} needs two APIs enabled:

    https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com?project=${project || ""}
    https://console.cloud.google.com/apis/library/analyticsdata.googleapis.com?project=${project || ""}

  Enable both, wait a minute, run this again. If it then says the account cannot
  see the property, that is the SECOND step and this script will say so.
`);
    return;
  }

  console.log(`
  The API is reachable but this key cannot see the property.${fallback}

  ONE grant, by the owner, in the Google Analytics admin:

    1. analytics.google.com → Admin → Property access management
    2. Add user:  ${key.client_email}
    3. Role: Viewer   (Analyst is not needed — this only reads)

  Then run this again. Nothing needs to change in the site's code.
`);
}

const token = await accessToken();

/* Discovery rather than a pasted number: the measurement ID in the page
   (G-XKW8P2LRY0) is NOT the property id the API wants, and pasting the wrong one
   returns an empty report that reads exactly like zero traffic. */
let property = process.env.GA_PROPERTY_ID ? `properties/${process.env.GA_PROPERTY_ID}` : null;
if (!property) {
  const sum = await call(token, `${ADMIN}/accountSummaries`);
  if (!sum.ok) {
    console.log(`\nGoogle Analytics — cannot list properties (${sum.status})`);
    explain403(sum.body, sum.status === 403 ? "" : ` API said: ${JSON.stringify(sum.body).slice(0, 200)}`);
    process.exit(1);
  }
  const props = (sum.body.accountSummaries || []).flatMap((a) =>
    (a.propertySummaries || []).map((p) => ({ name: p.property, display: p.displayName, account: a.displayName })));
  if (!props.length) { console.log("\nGoogle Analytics — the key authenticates, but sees no properties."); explain403({}); process.exit(1); }
  const pick = props.find((p) => /qrix/i.test(p.display)) || props[0];
  property = pick.name;
  console.log(`\nGoogle Analytics — ${pick.display}  (${property})${props.length > 1 ? `  [${props.length} visible]` : ""}`);
}

const iso = (d) => d.toISOString().slice(0, 10);
const dayAgo = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return iso(d); };
const cur = { startDate: dayAgo(days), endDate: dayAgo(1) };
const prev = { startDate: dayAgo(days * 2), endDate: dayAgo(days + 1) };

async function report(body) {
  const r = await call(token, `${DATA}/${property}:runReport`, { method: "POST", body: JSON.stringify(body) });
  if (!r.ok) {
    console.log(`\ncannot read the property (${r.status})`);
    explain403(r.body, r.status === 403 ? "" : ` API said: ${JSON.stringify(r.body).slice(0, 200)}`);
    process.exit(1);
  }
  return r.body;
}

const totals = await report({
  dateRanges: [cur, prev],
  metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
});

const pick = (i) => {
  const row = (totals.rows || []).find((r) => r.dimensionValues?.[0]?.value === `date_range_${i}`)
    || (totals.rows || [])[i];
  const v = row?.metricValues?.map((m) => Number(m.value)) || [0, 0, 0];
  return { users: v[0], sessions: v[1], views: v[2] };
};
const now = pick(0), before = pick(1);
const delta = (a, b) => (b ? `${a > b ? "+" : ""}${Math.round(((a - b) / b) * 100)}%` : a ? "new" : "0%");

console.log(`window ${cur.startDate}…${cur.endDate}  (vs ${prev.startDate}…${prev.endDate})\n`);
console.log(`  users        ${before.users} → ${now.users} (${delta(now.users, before.users)})   ~${(now.users / days).toFixed(1)}/day`);
console.log(`  sessions     ${before.sessions} → ${now.sessions} (${delta(now.sessions, before.sessions)})`);
console.log(`  page views   ${before.views} → ${now.views} (${delta(now.views, before.views)})`);

const table = async (label, dim, limit = 8) => {
  const r = await report({ dateRanges: [cur], dimensions: [{ name: dim }], metrics: [{ name: "activeUsers" }, { name: "sessions" }], limit,
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }] });
  console.log(`\n  ${label}:`);
  for (const row of r.rows || []) {
    console.log(`      ${String(row.metricValues[0].value).padStart(6)} users  ${String(row.metricValues[1].value).padStart(5)} sess  ${row.dimensionValues[0].value}`);
  }
  if (!r.rows?.length) console.log("      (nothing in this window)");
};

await table("where they came from", "sessionSourceMedium");
await table("what they opened", "pagePath");
await table("countries", "country");

/* The funnel — the only thing that answers "did they SUCCEED".
   DownloaderClient fires tool_used twice on purpose: once when the link
   RESOLVES and once when DOWNLOAD is pressed, so `action` separates intent from
   result. These dimensions were registered on 2026-08-24 and GA4 custom
   dimensions are NOT retroactive, so any window before that reports "(not set)"
   no matter how the query is written. That is a data boundary, not a bug. */
const funnel = async (label, dim, limit = 10) => {
  const r = await report({
    dateRanges: [cur], dimensions: [{ name: dim }],
    metrics: [{ name: "eventCount" }, { name: "totalUsers" }], limit,
    dimensionFilter: { filter: { fieldName: "eventName", stringFilter: { value: "tool_used" } } },
    orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
  });
  console.log("\n  " + label + ":");
  for (const row of r.rows || []) {
    const v = row.dimensionValues[0].value;
    const note = v === "(not set)" ? "(recorded before 24 Aug - dimension did not exist yet)" : v;
    console.log("      " + String(row.metricValues[0].value).padStart(6) + " events "
      + String(row.metricValues[1].value).padStart(5) + " users  " + note);
  }
  if (!(r.rows || []).length) console.log("      (no tool_used events in this window)");
};
await funnel("which tool was used", "customEvent:tool");
await funnel("which step - resolve vs download", "customEvent:action");
await funnel("downloader platform", "customEvent:platform");

console.log(`\n  Paste into growth/SEO_STRATEGY.md → Baseline:`);
console.log(`  - GA4: ${now.users} users/${days}d (~${(now.users / days).toFixed(1)}/day), ${now.sessions} sessions, ${now.views} views (was ${before.users}/${before.sessions}/${before.views})`);
console.log(`\n  Note: analytics_storage defaults to DENIED until someone accepts the cookie`);
console.log(`  banner, so these are consent-mode numbers and undercount. They are a floor,`);
console.log(`  not a ceiling — but they are measured, which is more than we had.\n`);
