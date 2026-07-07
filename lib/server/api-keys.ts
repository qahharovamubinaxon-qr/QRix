/** API-key system: create / regenerate / revoke, scoped permissions, expiry and
    usage tracking. Full keys are shown once; only a sha-256 hash is stored. */
import { db, uid, helpers } from "./db";
import { sha256, randomToken } from "./security";
import type { ApiKey } from "./models";

export type Scope = "read" | "write" | "admin";
const PREFIX = "qrix_live_";

/** Create a key. Returns the plaintext ONCE plus the stored record. */
export async function createApiKey(userId: string, name: string, scopes: Scope[] = ["read"], expiresInDays?: number): Promise<{ key: string; record: ApiKey }> {
  const secret = randomToken(24);
  const key = `${PREFIX}${secret}`;
  const record: ApiKey = {
    id: uid("key"), userId, name: name.slice(0, 60),
    prefix: `${PREFIX}${secret.slice(0, 4)}`, hash: await sha256(key),
    scopes, lastUsedAt: null, requests: 0, revoked: false,
    expiresAt: expiresInDays ? helpers.daysAhead(expiresInDays) : null,
    createdAt: helpers.now(),
  };
  db.apiKeys.insert(record);
  return { key, record };
}

export function listApiKeys(userId: string): ApiKey[] {
  return db.apiKeys.filter((k) => k.userId === userId);
}

export async function regenerateApiKey(id: string, userId: string): Promise<{ key: string; record: ApiKey } | null> {
  const existing = db.apiKeys.find((k) => k.id === id && k.userId === userId);
  if (!existing) return null;
  db.apiKeys.remove((k) => k.id === id);
  return createApiKey(userId, existing.name, existing.scopes as Scope[], existing.expiresAt ? 30 : undefined);
}

export function revokeApiKey(id: string, userId: string): boolean {
  return !!db.apiKeys.update((k) => k.id === id && k.userId === userId, { revoked: true });
}

export function deleteApiKey(id: string, userId: string): boolean {
  return db.apiKeys.remove((k) => k.id === id && k.userId === userId) > 0;
}

/** Authenticate an inbound API request by its raw key; records usage. */
export async function authenticateApiKey(rawKey: string, required: Scope = "read"): Promise<ApiKey | null> {
  if (!rawKey?.startsWith(PREFIX)) return null;
  const hash = await sha256(rawKey);
  const key = db.apiKeys.find((k) => k.hash === hash);
  if (!key || key.revoked) return null;
  if (key.expiresAt && key.expiresAt < helpers.now()) return null;
  if (!key.scopes.includes(required) && !key.scopes.includes("admin")) return null;
  db.apiKeys.update((k) => k.id === key.id, { lastUsedAt: helpers.now(), requests: key.requests + 1 });
  return key;
}

/** Never expose the hash to clients. */
export const publicKey = (k: ApiKey) => ({
  id: k.id, name: k.name, prefix: k.prefix, scopes: k.scopes,
  lastUsedAt: k.lastUsedAt, expiresAt: k.expiresAt, requests: k.requests,
  revoked: k.revoked, createdAt: k.createdAt,
});
