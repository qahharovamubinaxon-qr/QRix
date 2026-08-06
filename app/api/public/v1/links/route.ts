import { NextResponse } from "next/server";
import { supabase as db } from "@/lib/supabase"; // service-role: dynamic_links is RLS-locked
import { authenticateKey, unauthorized } from "@/lib/server/user-api-keys";

/* Public API — dynamic links.
   POST creates a short link that a QR can point at and whose destination can be
   changed later without reprinting the code; GET lists the caller's links with
   their scan counts. Authenticated by an API key, so the rows belong to the
   same account the key belongs to. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://qrixtools.com";

/* Same destination rules as the browser path in /api/create-dynamic. Duplicated
   deliberately rather than imported: that file is a route module, and these
   checks are what stop the QRix domain being used to mask a redirect into a
   private network, so they must not depend on an import that could be dropped
   during a refactor of an unrelated route. */
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
    if (a === 169 && b === 254) return false;
    if (a === 100 && b >= 64 && b <= 127) return false;
  }
  if (h.startsWith("fc") || h.startsWith("fd") || h.startsWith("fe80")) return false;
  return true;
}

function isSafeUrl(raw: unknown): raw is string {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 2048) return false;
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return isPublicHost(u.hostname);
  } catch { return false; }
}

const SLUG_OK = /^[a-z0-9][a-z0-9-]{2,39}$/;
const randomSlug = () => Math.random().toString(36).slice(2, 9);

export async function GET(req: Request) {
  const auth = await authenticateKey(req, "read");
  if (!auth) return unauthorized();

  const { data, error } = await db
    .from("dynamic_links")
    .select("slug, target_url, scans, created_at")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return NextResponse.json({ error: "query_failed" }, { status: 500 });

  return NextResponse.json({
    links: (data ?? []).map((l) => ({
      slug: l.slug,
      short_url: `${SITE}/r/${l.slug}`,
      target_url: l.target_url,
      scans: l.scans ?? 0,
      created_at: l.created_at,
    })),
  }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(req: Request) {
  const auth = await authenticateKey(req, "write");
  if (!auth) return unauthorized();

  let body: { url?: string; slug?: string } = {};
  try { body = await req.json(); } catch { /* handled by the validation below */ }

  if (!isSafeUrl(body.url)) {
    return NextResponse.json({
      error: "invalid_url",
      message: "`url` must be a public http(s) URL under 2048 characters.",
    }, { status: 400 });
  }

  let slug = (body.slug || "").trim().toLowerCase();
  if (slug && !SLUG_OK.test(slug)) {
    return NextResponse.json({
      error: "invalid_slug",
      message: "`slug` must be 3-40 characters of a-z, 0-9 and hyphens, starting with a letter or digit.",
    }, { status: 400 });
  }

  /* A caller-chosen slug that is taken is a 409 they can act on. A generated
     one that collides is our problem, so retry a few times before admitting it. */
  const chosen = !!slug;
  for (let attempt = 0; attempt < (chosen ? 1 : 5); attempt++) {
    const candidate = slug || randomSlug();
    const { error } = await db.from("dynamic_links").insert({
      slug: candidate,
      target_url: body.url,
      user_id: auth.userId,
    });
    if (!error) {
      return NextResponse.json({
        slug: candidate,
        short_url: `${SITE}/r/${candidate}`,
        target_url: body.url,
        qr: `${SITE}/api/public/v1/qr?content=${encodeURIComponent(`${SITE}/r/${candidate}`)}`,
      }, { status: 201 });
    }
    if (!String(error.message).includes("duplicate")) {
      return NextResponse.json({ error: "insert_failed" }, { status: 500 });
    }
    if (chosen) return NextResponse.json({ error: "slug_taken" }, { status: 409 });
    slug = "";
  }
  return NextResponse.json({ error: "slug_collision" }, { status: 503 });
}
