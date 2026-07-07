import { handler, ok, validate, forbidden } from "@/lib/server/api";
import { createApiKey, listApiKeys, publicKey, type Scope } from "@/lib/server/api-keys";
import { planLimits } from "@/lib/server/billing";

export const runtime = "nodejs";

export const GET = handler(async ({ user }) => ok(listApiKeys(user!.id).map(publicKey)), { auth: true });

/** POST — create a key. Plaintext key is returned exactly once. */
export const POST = handler(async ({ req, user }) => {
  const body = validate<{ name: string; scopes?: string; expiresInDays?: number }>(await req.json(), {
    name: { type: "string", min: 1, max: 60 },
    scopes: { type: "string", optional: true },
    expiresInDays: { type: "number", optional: true, min: 1 },
  });
  const existing = listApiKeys(user!.id).filter((k) => !k.revoked).length;
  if (existing >= planLimits(user!.plan).apiKeys) throw forbidden(`plan limit: ${planLimits(user!.plan).apiKeys} keys`);
  const scopes = (body.scopes?.split(",").map((s) => s.trim()).filter((s) => ["read", "write", "admin"].includes(s)) as Scope[]) || ["read"];
  const { key, record } = await createApiKey(user!.id, body.name, scopes.length ? scopes : ["read"], body.expiresInDays);
  return ok({ key, record: publicKey(record) });
}, { auth: true, action: "apikey.create" });
