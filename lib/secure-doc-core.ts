/**
 * Pure half of the code-gated document flow: id generation and destination
 * rules. No imports at all, on purpose.
 *
 * lib/server/secure-docs.ts pulls in Supabase and lib/server/security, and that
 * chain contains syntax Node's type-stripping refuses, so a test importing it
 * dies before it reaches this code. Everything security-critical that needs no
 * database lives here, and npm run test:secure imports this file directly, so
 * what is asserted is what runs.
 *
 * The signed unlock token that used to live here is gone (2026-08-07). The
 * owner chose to redirect to the destination once the code is right rather than
 * render the document on our page, so there is no session to sign and no image
 * proxy to gate. Signing helpers with no caller are worse than absent ones —
 * they read like a protection that is still in force.
 */

/* Base62 minus the characters that get misread off a printed page: 0/O and
   1/l/I. Someone reads this id aloud over the phone. */
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function newId(len = 6): string {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/* ── destination rules ───────────────────────────────────────────────────
   The same addresses the dynamic-link endpoint refuses. They are checked twice:
   when the link is created, and again at the moment a browser is redirected, so
   a rule tightened later still applies to links made before it. Without them
   the qrixtools.com domain could be used to mask a redirect into somebody's
   private network. */
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
   The live site, which is what the short URL should be:
   https://qrixtools.com/s/kXy7Qa is 30 characters, against the 40 a scannable
   QR wants. NEXT_PUBLIC_SHORT_BASE exists only as an escape hatch if a shorter
   domain is ever pointed at this deployment; nothing needs it today. */
export const shortBase = () =>
  (process.env.NEXT_PUBLIC_SHORT_BASE || process.env.NEXT_PUBLIC_SITE_URL || "https://qrixtools.com")
    .replace(/\/+$/, "");

export const shortUrl = (id: string) => `${shortBase()}/s/${id}`;
