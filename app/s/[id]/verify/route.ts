import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { rateLimit } from "@/lib/server/security";
import { getDoc, checkCode, mintUnlock, COOKIE } from "@/lib/server/secure-docs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/* Code check. A plain form POST, so it works with JavaScript disabled and on
   whatever browser is on the phone that scanned the QR. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const back = (q = "") => NextResponse.redirect(new URL(`/s/${id}${q}`, req.url), 303);

  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";

  /* Four digits is ten thousand possibilities: a script would walk that in
     seconds. Capped BEFORE the comparison so a rate-limited attempt costs no
     hash and cannot be timed, and keyed per (document, IP) so one person
     guessing cannot lock a document for everyone else. */
  const rl = await rateLimit(`sdoc:${id}:${ip}`, { max: 8, windowMs: 600_000 });
  if (!rl.ok) return back("?error=rate");

  const doc = await getDoc(id);
  if (!doc) return back();

  const form = await req.formData().catch(() => null);
  const code = String(form?.get("code") ?? "");
  if (!/^\d{4}$/.test(code) || !(await checkCode(doc, code))) return back("?error=1");

  const { value, maxAge } = await mintUnlock(id);
  const res = back();
  res.cookies.set(COOKIE(id), value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    /* Scoped to this document: unlocking one tells the browser nothing about
       any other, so a shared phone does not leak the last person's document. */
    path: `/s/${id}`,
    maxAge,
  });
  return res;
}
