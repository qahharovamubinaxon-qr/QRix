/* Shared Search Console auth: a service-account JWT signed with node:crypto,
   exchanged for an access token. No dependency, and one copy for every reader
   (gsc-kpi.mjs, gsc-inspect.mjs).

   The key belongs OUTSIDE the repo — ~/.qrix/gsc.json, or GSC_SERVICE_ACCOUNT_FILE
   / GSC_SERVICE_ACCOUNT_JSON. .gitignore refuses *service-account*.json and
   gsc*.json as a second net. */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const TOKEN_URL = "https://oauth2.googleapis.com/token";
export const SCOPE = "https://www.googleapis.com/auth/webmasters.readonly";
export const API = "https://www.googleapis.com/webmasters/v3";

export function loadKey() {
  const inline = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (inline) return JSON.parse(inline);

  const candidates = [
    process.env.GSC_SERVICE_ACCOUNT_FILE,
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

export async function accessToken(key) {
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

export async function api(token, url, init = {}) {
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

/* Picking the wrong property form ("sc-domain:qrixtools.com" vs
   "https://qrixtools.com/") 404s in a way that looks like missing data rather
   than a config mistake, so resolve it from what the account can actually see. */
export async function resolveSite(token, hint = process.env.GSC_SITE || "qrixtools.com") {
  const sites = await api(token, `${API}/sites`);
  const owned = (sites.siteEntry || []).map((s) => s.siteUrl);
  const site = owned.find((s) => s === hint) || owned.find((s) => s.includes(hint)) || owned[0];
  if (!site) {
    throw new Error(
      "the service account sees no properties. Add its client_email as a user on " +
      "the property in Search Console → Settings → Users and permissions.",
    );
  }
  return site;
}

/* Every failure here is a setup mistake with one specific fix, and the message
   names it; a 40-line stack trace buries that. */
export function printErrorsPlainly() {
  for (const ev of ["uncaughtException", "unhandledRejection"]) {
    process.on(ev, (e) => {
      console.error(`\n  x ${e?.message || e}\n`);
      process.exit(1);
    });
  }
}
