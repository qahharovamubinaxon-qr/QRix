import { NextResponse } from "next/server";
import { authenticateKey } from "@/lib/server/user-api-keys";
import { createDoc, isSafeTarget, shortUrl } from "@/lib/server/secure-docs";

/**
 * POST /api/v1/links — the OFIS contract.
 *
 *   Authorization: Bearer <API_KEY>
 *   { "target_url": "...", "code": "3255", "title": "..." }
 *   → 200 { "id": "kXy7Qa", "short_url": "https://…/s/kXy7Qa" }
 *
 * Errors are always JSON with an `error` string: 401 for a key problem, 400 for
 * a request problem. Nothing else is emitted, because the caller is a program
 * that has to branch on this and an HTML error page would be unparseable.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bad = (message: string, status = 400) =>
  NextResponse.json({ error: message }, { status });

export async function POST(req: Request) {
  /* Write scope: this creates a resource. A read-only key gets a 401 that says
     so, rather than the generic one — a program author staring at "invalid key"
     while holding a valid key is a support ticket that should not exist. */
  const auth = await authenticateKey(req, "write");
  if (!auth) {
    const anyScope = await authenticateKey(req, "read");
    return bad(anyScope
      ? "this API key is read-only; create one with write access at /account/api"
      : "invalid API key — send it as `Authorization: Bearer qrix_live_…`", 401);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return bad("body must be JSON");
  }

  const target = body.target_url ?? body.url;
  if (!isSafeTarget(target)) {
    return bad("target_url must be a public http(s) URL of at most 2048 characters");
  }

  /* Exactly four digits. Accepting "12" or "abcd" here would produce a document
     nobody can open, and the program would only find out when a worker did. */
  const code = String(body.code ?? "");
  if (!/^\d{4}$/.test(code)) {
    return bad("code must be exactly 4 digits");
  }

  const title = body.title == null ? null : String(body.title).slice(0, 200);

  try {
    const { id } = await createDoc({ userId: auth.userId, targetUrl: target, code, title });
    return NextResponse.json({ id, short_url: shortUrl(id) }, {
      status: 200,
      headers: { "cache-control": "no-store" },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "error";
    if (msg === "id_collision") return bad("could not allocate an id, retry", 503);
    return bad("could not create the link", 500);
  }
}

/* A program that GETs this by mistake should be told what to do, in the same
   JSON shape as every other answer here. */
export function GET() {
  return NextResponse.json({
    error: "use POST with { target_url, code, title } and an Authorization: Bearer key",
  }, { status: 405 });
}
