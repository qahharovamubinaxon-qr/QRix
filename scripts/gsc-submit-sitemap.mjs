/* Ask Google to re-download the sitemap.

   The sitemaps API said lastDownloaded 2026-07-21 — seventeen days before the
   167 orphaned URLs got their first internal link (M147e), and every page
   shipped since is in a file Google has not re-read. Resubmitting is the one
   supported nudge: it is idempotent, it does not promise a crawl, and it costs
   nothing.

   This is the only writing thing in the gsc-* family, so it asks for the write
   scope explicitly rather than widening the scope the readers share.

   Usage: npm run sitemap:ping */

import crypto from "node:crypto";
import { loadKey, api, API, resolveSite, printErrorsPlainly } from "./gsc-auth.mjs";

printErrorsPlainly();

const TOKEN_URL = "https://oauth2.googleapis.com/token";
const WRITE_SCOPE = "https://www.googleapis.com/auth/webmasters";
const SITEMAP = process.env.GSC_SITEMAP || "https://qrixtools.com/sitemap.xml";

const b64url = (b) => Buffer.from(b).toString("base64url");

async function writeToken(key) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: key.client_email, scope: WRITE_SCOPE, aud: TOKEN_URL, iat: now, exp: now + 3600,
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

const key = loadKey();
const token = await writeToken(key);
const site = await resolveSite(token);
const url = `${API}/sites/${encodeURIComponent(site)}/sitemaps/${encodeURIComponent(SITEMAP)}`;

const before = await api(token, url).catch(() => null);
console.log(`\n  ${SITEMAP}`);
console.log(`  before: submitted ${(before?.lastSubmitted || "?").slice(0, 10)} · downloaded ${(before?.lastDownloaded || "never").slice(0, 10)} · ${before?.contents?.[0]?.submitted ?? "?"} URLs`);

/* PUT returns 204 with no body: it registers the submission. The re-download
   happens on Google's schedule, so "downloaded" will not move in this run. */
const res = await fetch(url, { method: "PUT", headers: { authorization: `Bearer ${token}` } });
if (!res.ok) {
  const hint = res.status === 403
    ? " — the service account needs FULL (not restricted) permission on the property to submit"
    : "";
  throw new Error(`submit failed (${res.status})${hint}: ${(await res.text()).slice(0, 200)}`);
}

const after = await api(token, url).catch(() => null);
console.log(`  after:  submitted ${(after?.lastSubmitted || "?").slice(0, 10)} · errors ${after?.errors ?? "?"} · warnings ${after?.warnings ?? "?"} · pending ${after?.isPending}`);
console.log("\n  submitted. Google re-downloads on its own schedule; check with npm run inspect in a few days.\n");
