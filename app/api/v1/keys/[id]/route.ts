import { handler, ok, notFound } from "@/lib/server/api";
import { regenerateApiKey, revokeApiKey, deleteApiKey, publicKey } from "@/lib/server/api-keys";

export const runtime = "nodejs";

/** PUT — regenerate (returns fresh plaintext once). */
export const PUT = handler(async ({ user, params }) => {
  const res = await regenerateApiKey(params.id, user!.id);
  if (!res) throw notFound("key not found");
  return ok({ key: res.key, record: publicKey(res.record) });
}, { auth: true, action: "apikey.regenerate" });

/** PATCH — revoke without deleting (audit trail stays). */
export const PATCH = handler(async ({ user, params }) => {
  if (!revokeApiKey(params.id, user!.id)) throw notFound("key not found");
  return ok({ revoked: true });
}, { auth: true, action: "apikey.revoke" });

export const DELETE = handler(async ({ user, params }) => {
  if (!deleteApiKey(params.id, user!.id)) throw notFound("key not found");
  return ok({ deleted: true });
}, { auth: true, action: "apikey.delete" });
