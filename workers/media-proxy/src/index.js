/* QRix media-proxy Worker
   ───────────────────────────────────────────────────────────────────────────
   Streams a downloaded video/audio/image so the bytes never pass through Vercel.
   Vercel's /api/download/file resolves the real media URL, signs it (HMAC-SHA256
   with the shared secret), and 302-redirects the browser here. This Worker
   verifies the signature, fetches the URL with the Referer that CDN needs, and
   streams it back as an attachment.

   WHY THIS EXISTS: proxying video through a Vercel function counted every byte
   as Fast Origin Transfer, which blew the 10 GB Hobby limit and paused the site
   (HTTP 402). Cloudflare Workers have no egress charge, so the heavy transfer
   lives here for free while Vercel keeps only the (cheap) resolve step.

   SECURITY: the `p` param is `base64url(json).base64url(hmac)`, signed by Vercel
   with MEDIA_SECRET (= the same CRON_SECRET Vercel uses). Without a valid, live
   signature this returns 403 — so it can only ever stream a URL Vercel just
   resolved, never an arbitrary host. It is NOT an open proxy.

   Deploy: see README.md. Secret: `wrangler secret put MEDIA_SECRET`. */

// Must match MEDIA_UA in lib/server/media-download.ts — some CDNs check it.
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36";

function unb64url(s) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  const bin = atob(s);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function b64url(bytes) {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

// Recreate exactly what lib/server/media-download.ts signPayload() produces:
// b64url(HMAC_SHA256(base64url-payload-string, secret)).
async function expectedSig(payload, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(mac));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default {
  async fetch(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("method not allowed", { status: 405 });
    }
    const secret = env.MEDIA_SECRET;
    if (!secret) return new Response("misconfigured: MEDIA_SECRET not set", { status: 500 });

    const p = new URL(request.url).searchParams.get("p") || "";
    const dot = p.indexOf(".");
    if (dot < 1) return new Response("bad request", { status: 400 });
    const payload = p.slice(0, dot);
    const sig = p.slice(dot + 1);

    if (!timingSafeEqual(await expectedSig(payload, secret), sig)) {
      return new Response("forbidden", { status: 403 });
    }

    let data;
    try {
      data = JSON.parse(new TextDecoder().decode(unb64url(payload)));
    } catch {
      return new Response("bad payload", { status: 400 });
    }
    if (!data.pu || typeof data.e !== "number" || Date.now() > data.e) {
      return new Response("expired", { status: 403 });
    }

    let upstream;
    try {
      upstream = await fetch(data.pu, {
        headers: { "User-Agent": UA, Accept: "*/*", ...(data.r ? { Referer: data.r } : {}) },
        redirect: "follow",
      });
    } catch {
      return new Response("fetch failed", { status: 502 });
    }
    if (!upstream.ok || !upstream.body) {
      return new Response("upstream " + upstream.status, { status: 502 });
    }

    const headers = new Headers();
    headers.set("Content-Type", data.m || "application/octet-stream");
    headers.set(
      "Content-Disposition",
      `attachment; filename="${String(data.f || "download").replace(/"/g, "")}"`,
    );
    const len = upstream.headers.get("content-length");
    if (len) headers.set("Content-Length", len);
    headers.set("Cache-Control", "no-store");
    headers.set("X-Content-Type-Options", "nosniff");
    headers.set("Access-Control-Allow-Origin", "*");

    return new Response(request.method === "HEAD" ? null : upstream.body, { status: 200, headers });
  },
};
