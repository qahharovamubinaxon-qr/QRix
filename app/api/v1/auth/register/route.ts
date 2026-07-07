import { handler, ok, validate } from "@/lib/server/api";
import { registerWithPassword, loginWithPassword, issueToken } from "@/lib/server/auth";
import { emails } from "@/lib/server/email";
import { track } from "@/lib/server/analytics";
import { SITE_URL } from "@/lib/seo";

export const runtime = "nodejs";

export const POST = handler(async ({ req }) => {
  const body = validate<{ email: string; password: string; name?: string }>(await req.json(), {
    email: { type: "email" },
    password: { type: "string", min: 8, max: 100 },
    name: { type: "string", optional: true, max: 60 },
  });
  const user = await registerWithPassword(body.email, body.password, body.name);
  const token = issueToken(user.email, "verify-email");
  await emails.welcome(user.email, user.name ?? undefined);
  await emails.verify(user.email, `${SITE_URL}/api/v1/auth/verify?token=${token}`);
  track("signup", { userId: user.id });
  await loginWithPassword(body.email, body.password, true);
  return ok({ id: user.id, email: user.email });
}, { rateLimit: { max: 10 } });
