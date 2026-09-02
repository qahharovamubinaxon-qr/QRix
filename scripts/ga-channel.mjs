/* Where does one channel's traffic actually land?
   ───────────────────────────────────────────────────────────────────────────
   ChatGPT sends this site roughly twenty times more visitors than Google, and
   nothing in growth/ mentions it. Before anything can be done about that, the
   obvious question has to be answered: which pages are those people arriving
   on, and do they get what they came for?

   Totals cannot answer it — a channel and a landing page have to be crossed.

     npm run ga:channel                     chatgpt, last 7 days
     npm run ga:channel -- --source yandex  any source substring
     npm run ga:channel -- --days 28

   Reuses the Search Console service-account key with the Analytics scope, the
   same way ga-kpi.mjs does. */
import { loadKey } from "./gsc-auth.mjs";
import crypto from "node:crypto";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const ADMIN = "https://analyticsadmin.googleapis.com/v1beta";
const DATA = "https://analyticsdata.googleapis.com/v1beta";

const args = process.argv.slice(2);
const days = Number(args[args.indexOf("--days") + 1]) || 7;
const SOURCE = args.includes("--source") ? args[args.indexOf("--source") + 1] : "chatgpt";

const key = loadKey();
const b64url = (b) => Buffer.from(b).toString("base64url");

async function token() {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email, scope: "https://www.googleapis.com/auth/analytics.readonly",
    aud: TOKEN_URL, iat: now, exp: now + 3600,
  }));
  const sig = crypto.createSign("RSA-SHA256").update(`${header}.${claim}`).sign(key.private_key);
  const r = await fetch(TOKEN_URL, {
    method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${b64url(sig)}`,
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(`token: ${JSON.stringify(j).slice(0, 200)}`);
  return j.access_token;
}

const tk = await token();
const call = async (url, init = {}) => {
  const r = await fetch(url, { ...init, headers: { authorization: `Bearer ${tk}`, "content-type": "application/json", ...(init.headers || {}) } });
  return { ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) };
};

let property = process.env.GA_PROPERTY_ID ? `properties/${process.env.GA_PROPERTY_ID}` : null;
if (!property) {
  const s = await call(`${ADMIN}/accountSummaries`);
  if (!s.ok) { console.log(`cannot list properties (${s.status}) — run \`npm run ga\` to see why`); process.exit(1); }
  const props = (s.body.accountSummaries || []).flatMap((a) => a.propertySummaries || []);
  const pick = props.find((p) => /qrix/i.test(p.displayName)) || props[0];
  if (!pick) { console.log("the key sees no properties"); process.exit(1); }
  property = pick.property;
}

const iso = (d) => d.toISOString().slice(0, 10);
const ago = (n) => { const d = new Date(); d.setUTCDate(d.getUTCDate() - n); return iso(d); };
const range = { startDate: ago(days), endDate: ago(1) };

async function report(body) {
  const r = await call(`${DATA}/${property}:runReport`, { method: "POST", body: JSON.stringify(body) });
  if (!r.ok) { console.log(`GA read failed (${r.status}): ${JSON.stringify(r.body).slice(0, 200)}`); process.exit(1); }
  return r.body;
}

/* CONTAINS, not EXACT: GA reports the source as "chatgpt.com / ai-assistant",
   and yandex arrives as yandex.ru, yandex.uz and yandex.com.tr separately. An
   exact match would silently drop most of the channel. */
const channelFilter = {
  filter: { fieldName: "sessionSource", stringFilter: { matchType: "CONTAINS", value: SOURCE, caseSensitive: false } },
};

const rows = async (dimension, limit = 12) => {
  const r = await report({
    dateRanges: [range], dimensions: [{ name: dimension }],
    metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
    dimensionFilter: channelFilter, limit,
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
  });
  return (r.rows || []).map((x) => ({
    name: x.dimensionValues[0].value,
    users: Number(x.metricValues[0].value),
    sessions: Number(x.metricValues[1].value),
    views: Number(x.metricValues[2].value),
  }));
};

const totals = await report({
  dateRanges: [range], metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
  dimensionFilter: channelFilter,
});
const t = (totals.rows?.[0]?.metricValues || []).map((m) => Number(m.value));

console.log(`\n"${SOURCE}" — ${range.startDate}…${range.endDate}`);
console.log(`  ${t[0] || 0} users · ${t[1] || 0} sessions · ${t[2] || 0} page views`);
if (!t[0]) { console.log("\n  nothing from this source in this window."); process.exit(0); }

/* Views per session is the cheap proxy for "did they stay". One view means the
   landing page was the whole visit. */
console.log(`  ${((t[2] || 0) / (t[1] || 1)).toFixed(2)} views per session\n`);

const landing = await rows("landingPage");
console.log("  where they LAND:");
for (const r of landing) console.log(`    ${String(r.users).padStart(4)} users  ${r.name}`);

const all = await rows("pagePath");
console.log("\n  every page they open:");
for (const r of all) console.log(`    ${String(r.users).padStart(4)} users  ${r.name}`);

const countries = await rows("country", 6);
console.log("\n  countries:");
for (const r of countries) console.log(`    ${String(r.users).padStart(4)} users  ${r.name}`);

/* Did they finish anything? tool_used only fires on success. */
const tools = await report({
  dateRanges: [range], dimensions: [{ name: "customEvent:tool" }],
  metrics: [{ name: "eventCount" }, { name: "totalUsers" }], limit: 10,
  dimensionFilter: {
    andGroup: { expressions: [
      channelFilter,
      { filter: { fieldName: "eventName", stringFilter: { value: "tool_used" } } },
    ] },
  },
  orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
});
console.log("\n  what they FINISHED (tool_used fires only on success):");
const tr = (tools.rows || []).filter((r) => r.dimensionValues[0].value !== "(not set)");
if (!tr.length) console.log("    nothing — they arrive and leave without completing a tool");
for (const r of tr) console.log(`    ${String(r.metricValues[0].value).padStart(4)} events  ${r.metricValues[1].value} users  ${r.dimensionValues[0].value}`);
console.log();
