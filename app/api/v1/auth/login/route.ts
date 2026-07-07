import { handler, ok, validate, unauthorized } from "@/lib/server/api";
import { loginWithPassword } from "@/lib/server/auth";

export const runtime = "nodejs";

export const POST = handler(async ({ req }) => {
  const body = validate<{ email: string; password: string; rememberMe?: boolean }>(await req.json(), {
    email: { type: "email" },
    password: { type: "string", min: 1 },
    rememberMe: { type: "boolean", optional: true },
  });
  try {
    const user = await loginWithPassword(body.email, body.password, body.rememberMe ?? false);
    return ok(user);
  } catch {
    throw unauthorized("invalid credentials");
  }
}, { rateLimit: { max: 15 } });
