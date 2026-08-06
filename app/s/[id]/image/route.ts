import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getDoc, unlockValid, isSafeTarget, countView, COOKIE } from "@/lib/server/secure-docs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* The document itself, streamed by this server.
   This route is the reason the code means anything: the viewer's browser never
   learns the destination, so the link cannot be forwarded, bookmarked or read
   out of history by the next person holding the phone. */

const MAX_BYTES = 25 * 1024 * 1024;

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const unlocked = await unlockValid(id, (await cookies()).get(COOKIE(id))?.value);
  if (!unlocked) return NextResponse.json({ error: "locked" }, { status: 403 });

  const doc = await getDoc(id);
  if (!doc) return NextResponse.json({ error: "not_found" }, { status: 404 });

  /* Re-validated at fetch time, not only at creation: the rules could tighten,
     and this is the moment our server makes the outbound request. */
  if (!isSafeTarget(doc.target_url)) {
    return NextResponse.json({ error: "unsafe_target" }, { status: 502 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(doc.target_url, {
      /* No redirect following: a host that 302s to 169.254.169.254 would
         otherwise walk straight past the address checks above. */
      redirect: "manual",
      signal: AbortSignal.timeout(9_000),
      headers: { accept: "image/*,application/pdf;q=0.8,*/*;q=0.5" },
    });
  } catch {
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 504 });
  }

  if (upstream.status >= 300 && upstream.status < 400) {
    return NextResponse.json({ error: "upstream_redirected" }, { status: 502 });
  }
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "upstream_error" }, { status: 502 });
  }

  const type = (upstream.headers.get("content-type") || "").split(";")[0].trim().toLowerCase();
  if (!type.startsWith("image/") && type !== "application/pdf") {
    return NextResponse.json({ error: "not_a_document" }, { status: 415 });
  }
  const declared = Number(upstream.headers.get("content-length") || 0);
  if (declared > MAX_BYTES) {
    return NextResponse.json({ error: "too_large" }, { status: 413 });
  }

  void countView(id, doc.views);

  return new NextResponse(upstream.body, {
    headers: {
      "content-type": type,
      /* private + no-store so a shared or corporate proxy never holds a copy
         that outlives the unlock. */
      "cache-control": "private, no-store",
      "content-disposition": "inline",
      /* Nothing here should ever be framed by another site or sniffed into
         something executable. */
      "x-content-type-options": "nosniff",
      "content-security-policy": "default-src 'none'; sandbox",
    },
  });
}
