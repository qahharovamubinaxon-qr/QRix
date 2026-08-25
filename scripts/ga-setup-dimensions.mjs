/* Register the event parameters the site already sends as GA4 custom dimensions.
   ───────────────────────────────────────────────────────────────────────────
   lib/track.ts has been sending tool_used with `tool`, `action` and `platform`
   for months, and DownloaderClient fires it twice on purpose — once when a link
   RESOLVES and once when DOWNLOAD is pressed. GA4 stores those parameters, but
   the Data API cannot see them until each is registered as a custom dimension.
   So "did the VK visitors actually download anything" was unanswerable while the
   answer sat in the property untouched.

   Registration is NOT retroactive. It starts collection when it runs, which is
   the whole argument against putting it off another week.

   Idempotent: lists first, creates only what is missing, safe to re-run.
   Needs the analytics.edit scope AND an Editor role on the property — Viewer can
   list these but cannot create them, which is the failure this script explains.

     node scripts/ga-setup-dimensions.mjs            create what is missing
     node scripts/ga-setup-dimensions.mjs --dry-run  list only  */
import { loadKey } from "./gsc-auth.mjs";
import crypto from "node:crypto";

const PROPERTY = process.env.GA_PROPERTY_ID || "546171464";
const DRY = process.argv.includes("--dry-run");
const WANT = [
  { parameterName: "tool", displayName: "Tool", description: "Which tool fired tool_used (downloader, img-passport, ...)" },
  { parameterName: "action", displayName: "Action", description: "Step within the tool, e.g. download - this is what makes a funnel" },
  { parameterName: "platform", displayName: "Platform", description: "Downloader source platform - vk, ok, instagram, ..." },
];

const key = loadKey();
const b64 = (x) => Buffer.from(x).toString("base64url");
const now = Math.floor(Date.now() / 1000);
const header = b64(JSON.stringify({ alg: "RS256", typ: "JWT" }));
const claim = b64(JSON.stringify({
  iss: key.client_email,
  scope: "https://www.googleapis.com/auth/analytics.edit",
  aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
}));
const sig = crypto.createSign("RSA-SHA256").update(header + "." + claim).sign(key.private_key);
const tokRes = await fetch("https://oauth2.googleapis.com/token", {
  method: "POST",
  headers: { "content-type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion: header + "." + claim + "." + b64(sig),
  }),
});
const tok = await tokRes.json();
if (!tok.access_token) { console.error("token exchange failed:", JSON.stringify(tok).slice(0, 300)); process.exit(1); }

const BASE = "https://analyticsadmin.googleapis.com/v1beta/properties/" + PROPERTY + "/customDimensions";
const call = async (url, init = {}) => {
  const r = await fetch(url, {
    ...init,
    headers: { authorization: "Bearer " + tok.access_token, "content-type": "application/json", ...(init.headers || {}) },
  });
  return { ok: r.ok, status: r.status, body: await r.json().catch(() => ({})) };
};

const needsEditor = [
  "",
  "  Reading worked, writing did not. That is a ROLE, not a scope.",
  "",
  "  The service account is a Viewer on this property, and creating a custom",
  "  dimension needs Editor:",
  "",
  "    analytics.google.com -> Admin -> Property access management",
  "    -> " + key.client_email + " -> change Viewer to Editor -> Save",
  "",
  "  Then run this again. It creates three definitions and touches nothing else;",
  "  Viewer can be restored afterwards.",
  "",
].join("\n");

const list = await call(BASE);
if (!list.ok) {
  console.error("\ncannot list custom dimensions (" + list.status + ")");
  console.error(list.status === 403 ? needsEditor : "  " + String(list.body?.error?.message || "").slice(0, 300));
  process.exit(1);
}

const existing = (list.body.customDimensions || []).map((d) => d.parameterName);
console.log("\nGA4 property " + PROPERTY + " - " + existing.length + " custom dimension(s) already registered"
  + (existing.length ? ": " + existing.join(", ") : ""));

let created = 0;
const failed = [];
for (const d of WANT) {
  if (existing.includes(d.parameterName)) { console.log("  same    " + d.parameterName); continue; }
  if (DRY) { console.log("  would create  " + d.parameterName); continue; }
  const r = await call(BASE, { method: "POST", body: JSON.stringify({ ...d, scope: "EVENT" }) });
  if (r.ok) { console.log("  created " + d.parameterName); created++; }
  else {
    failed.push(r.status);
    console.log("  FAILED  " + d.parameterName + " (" + r.status + ") " + String(r.body?.error?.message || "").slice(0, 120));
  }
}

/* The permission problem surfaces HERE, not on the list call: a Viewer can read
   these definitions and cannot write them. An earlier version only explained
   itself when the LIST failed — the path that never happens — so the real one
   printed three bare 403s and no instructions. */
if (failed.length && failed.every((s) => s === 403)) { console.error(needsEditor); process.exit(1); }

console.log("\n" + (DRY ? "dry run" : created + " created") + " - collection starts now and is NOT backdated.\n");
