/**
 * Pure half of the code-gated document flow: id generation, destination rules,
 * and the unlock token. No imports at all, on purpose.
 *
 * lib/server/secure-docs.ts pulls in Supabase and lib/server/security, and that
 * chain contains syntax Node's type-stripping refuses, so a test importing it
 * dies before it reaches the crypto — which is precisely the part that must be
 * tested. Everything security-critical that needs no database lives here, and
 * npm run test:secure imports this file directly, so the code asserted is the
 * code that runs.
 */

/* Base62 minus the characters that get misread off a printed page: 0/O and
   1/l/I. Someone reads this id aloud over the phone. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function newId(len = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/* ── destination rules ───────────────────────────────────────────────────
   The same addresses the dynamic-link endpoint refuses, and they matter more
   here: this URL is fetched BY OUR SERVER, so a private address would turn the
   feature into a way to read things only our server can reach. */
function isPublicHost(hostname: string): boolean {
  const h = hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local")) return false;
  if (h === "::1" || h === "0.0.0.0") return false;
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const a = Number(m[1]), b = Number(m[2]);
    if (a === 0 || a === 10 || a === 127) return false;
    if (a === 172 && b >= 16 && b <= 31) return false;
    if (a === 192 && b === 168) return false;
    if (a === 169 && b === 254) return false;   // cloud metadata lives here
    if (a === 100 && b >= 64 && b <= 127) return false;
  }
  if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return false;
  return true;
}

export function isSafeTarget(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) return false;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return isPublicHost(u.hostname);
  } catch { return false; }
}

/* ── short url ───────────────────────────────────────────────────────────
   qrix.tools did not exist when this shipped (NXDOMAIN, 2026-08-07). Point it
   at this deployment and set NEXT_PUBLIC_SHORT_BASE=https://qrix.tools; every
   new link uses it and the API contract does not change. */
export const shortBase = () =>
  (process.env.NEXT_PUBLIC_SHORT_BASE || process.env.NEXT_PUBLIC_SITE_URL || "https://qrixtools.com")
    .replace(/\/+$/, "");

export const shortUrl = (id: string) => `${shortBase()}/s/${id}`;

/* ── unlock token ────────────────────────────────────────────────────────
   Signed rather than stored: unlocking costs no write, and two people can hold
   a valid session for the same document at once.

   AUTH_SECRET is preferred, but its fallback in lib/server/config.ts is the
   literal "dev-insecure-secret-change-me" — signing with a string printed in
   the source would let anyone mint their own unlock and walk past the code. So
   the key comes from whichever real secret exists, and if neither does this
   throws rather than pretending to be secure. */
function signingKey(): string {
  const explicit = process.env.AUTH_SECRET;
  if (explicit && explicit.length >= 16 && !explicit.startsWith("dev-insecure")) return explicit;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (service && service.length >= 32) return service;
  throw new Error("no_signing_secret");
}

async function hmac(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw", new TextEncoder().encode(signingKey()),
    { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload)));
  /* base64url by hand: Buffer is not available in every runtime this could end
     up in, and the alphabet has to be URL-safe because this lives in a cookie. */
  let bin = "";
  for (const b of sig) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const COOKIE = (id: string) => `qxs_${id}`;
const TTL_MS = 20 * 60_000;

export async function mintUnlock(id: string): Promise<{ value: string; maxAge: number }> {
  const exp = Date.now() + TTL_MS;
  return { value: `${exp}.${await hmac(`${id}.${exp}`)}`, maxAge: Math.floor(TTL_MS / 1000) };
}

export async function unlockValid(id: string, cookie: string | undefined): Promise<boolean> {
  if (!cookie) return false;
  const [expRaw, sig] = cookie.split(".");
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp < Date.now() || !sig) return false;
  const expected = await hmac(`${id}.${exp}`);
  /* Constant-time. A timing oracle on a 32-byte tag is not a realistic attack
     here, but `===` in auth code is how the habit gets lost. */
  if (sig.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < sig.length; i++) diff |= sig.charCodeAt(i) ^ expected.charCodeAt(i);
  return diff === 0;
}
