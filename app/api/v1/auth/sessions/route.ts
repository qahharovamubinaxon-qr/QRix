import { handler, ok, badRequest } from "@/lib/server/api";
import { listSessions, revokeSession, revokeOtherSessions } from "@/lib/server/auth";

export const runtime = "nodejs";

/** GET — active device sessions for the signed-in user. */
export const GET = handler(async ({ user }) => ok(listSessions(user!.id)), { auth: true });

/** DELETE ?id=<session> — revoke one; ?others=1 — revoke all other devices. */
export const DELETE = handler(async ({ req, user }) => {
  const id = req.nextUrl.searchParams.get("id");
  if (id) return ok({ revoked: revokeSession(user!.id, id) });
  if (req.nextUrl.searchParams.get("others")) return ok({ revoked: revokeOtherSessions(user!.id) });
  throw badRequest("id or others=1 required");
}, { auth: true, action: "session.revoke" });
