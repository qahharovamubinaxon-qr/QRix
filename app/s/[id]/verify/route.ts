import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/server/security";
import { getDoc, checkCode, countView, isSafeTarget } from "@/lib/server/secure-docs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Code check, then straight to the document.
   A plain form POST, so it works with JavaScript disabled and on whatever
   browser the phone's camera app opened.

   The owner chose the redirect over rendering the document here (2026-08-07).
   The trade is real and worth stating: once the browser follows the redirect,
   the destination is in the address bar, in history and in anything shared from
   the share sheet, so the code protects the FIRST opening rather than the
   document forever. What it still buys is that the URL is not guessable from
   the QR alone — the short link carries no destination. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const back = (q = "") => NextResponse.redirect(new URL(`/s/${id}${q}`, req.url), 303);

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  /* Four digits is ten thousand possibilities: a script walks that in seconds.
     Capped BEFORE the comparison, so a rate-limited attempt costs no hash and
     cannot be timed, and keyed per (document, IP) so one guesser cannot lock a
     document for the clerk who needs it. */
  const rl = await rateLimit(`sdoc:${id}:${ip}`, { max: 8, windowMs: 600_000 });
  if (!rl.ok) return back("?error=rate");

  const doc = await getDoc(id);
  if (!doc) return back();

  const form = await req.formData().catch(() => null);
  const code = String(form?.get("code") ?? "");
  if (!/^\d{4}$/.test(code) || !(await checkCode(doc, code))) return back("?error=1");

  /* Re-checked at redirect time, not only at creation: the rules could tighten,
     and this is the moment a browser is sent somewhere. */
  if (!isSafeTarget(doc.target_url)) return back();

  void countView(id, doc.views);

  return NextResponse.redirect(doc.target_url, 303);
}
