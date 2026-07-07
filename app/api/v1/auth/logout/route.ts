import { handler, ok } from "@/lib/server/api";
import { logout } from "@/lib/server/auth";

export const runtime = "nodejs";

export const POST = handler(async () => {
  await logout();
  return ok({ signedOut: true });
});
