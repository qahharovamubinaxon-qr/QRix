import { NextResponse } from "next/server";
import { handler, ok, validate, badRequest } from "@/lib/server/api";
import { issueToken, consumeToken } from "@/lib/server/auth";
import { emails } from "@/lib/server/email";
import { db, helpers } from "@/lib/server/db";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

/** POST — (re)send the verification email. */
export const POST = handler(async ({ req }) => {
  const body = validate<{ email: string }>(await req.json(), { email: { type: "email" } });
  const token = issueToken(body.email, "verify-email");
  await emails.verify(body.email, `${SITE_URL}/api/v1/auth/verify?token=${token}`);
  return ok({ sent: true });
}, { rateLimit: { max: 5 } });

/** GET ?token= — confirm the address. */
export const GET = handler(async ({ req }) => {
  const token = req.nextUrl.searchParams.get("token") || "";
  const email = consumeToken(token, "verify-email");
  if (!email) throw badRequest("invalid or expired token");
  db.users.update((u) => u.email === email, { emailVerified: helpers.now() });
  return NextResponse.redirect(new URL("/account?verified=1", SITE_URL));
});
