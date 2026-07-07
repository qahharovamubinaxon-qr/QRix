import { handler, ok, validate, badRequest } from "@/lib/server/api";
import { issueToken, consumeToken } from "@/lib/server/auth";
import { hashPassword } from "@/lib/server/security";
import { emails } from "@/lib/server/email";
import { db, helpers } from "@/lib/server/db";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

/** POST — request a reset link (never reveals whether the email exists). */
export const POST = handler(async ({ req }) => {
  const body = validate<{ email: string }>(await req.json(), { email: { type: "email" } });
  if (db.users.find((u) => u.email === body.email.toLowerCase())) {
    const token = issueToken(body.email, "reset-password");
    await emails.resetPassword(body.email, `${SITE_URL}/reset-password?token=${token}`);
  }
  return ok({ sent: true });
}, { rateLimit: { max: 5 } });

/** PUT — confirm the reset with token + new password. */
export const PUT = handler(async ({ req }) => {
  const body = validate<{ token: string; password: string }>(await req.json(), {
    token: { type: "string", min: 10 },
    password: { type: "string", min: 8, max: 100 },
  });
  const email = consumeToken(body.token, "reset-password");
  if (!email) throw badRequest("invalid or expired token");
  const passwordHash = await hashPassword(body.password);
  db.users.update((u) => u.email === email, { passwordHash, updatedAt: helpers.now() });
  return ok({ reset: true });
});
