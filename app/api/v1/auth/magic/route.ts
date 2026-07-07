import { NextResponse } from "next/server";
import { handler, ok, validate, badRequest } from "@/lib/server/api";
import { issueToken, consumeToken, loginWithProvider } from "@/lib/server/auth";
import { emails } from "@/lib/server/email";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

/** POST — request a magic sign-in link. */
export const POST = handler(async ({ req }) => {
  const body = validate<{ email: string }>(await req.json(), { email: { type: "email" } });
  const token = issueToken(body.email, "magic-link");
  await emails.magicLink(body.email, `${SITE_URL}/api/v1/auth/magic?token=${token}`);
  return ok({ sent: true });
}, { rateLimit: { max: 5 } });

/** GET ?token= — consume the link and sign in. */
export const GET = handler(async ({ req }) => {
  const token = req.nextUrl.searchParams.get("token") || "";
  const email = consumeToken(token, "magic-link");
  if (!email) throw badRequest("invalid or expired link");
  await loginWithProvider("email", email);
  return NextResponse.redirect(new URL("/dashboard", SITE_URL));
});
