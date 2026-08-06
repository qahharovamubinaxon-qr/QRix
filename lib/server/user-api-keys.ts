/**
 * API keys for real (Supabase) accounts. SERVER ONLY.
 *
 * This is deliberately NOT lib/server/api-keys.ts. That one belongs to the
 * mock platform in lib/server/db.ts, whose store is in-memory: on Vercel a key
 * created there works until the next cold start and then 401s forever, with
 * nothing in the logs to say why. These keys live in Supabase, are owned by the
 * same auth.users row the customer signs in with, and survive deploys.
 *
 * Only a sha-256 hash is stored. The plaintext is returned exactly once, at
 * creation. There is no recovery path and that is the point.
 */

import { createAdminClient } from "@/lib/supabase-admin";
import { serverConfig } from "@/lib/server/config";

const PREFIX = "qrix_live_";
export type Scope = "read" | "write";

export type PublicKey = {
  id: string;
  name: string;
  prefix: string;
  scopes: Scope[];
  createdAt: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  requestCount: number;
};

export type PlanState = {
  /** May this account mint keys? */
  allowed: boolean;
  /** 'pro' | 'free' | 'owner' — what the UI tells the person. */
  reason: "pro" | "owner" | "free";
  maxKeys: number;
};

const admin = () => {
  const c = createAdminClient();
  if (!c) throw new Error("supabase_service_role_missing");
  return c;
};

async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

const row2public = (r: Record<string, unknown>): PublicKey => ({
  id: String(r.id),
  name: String(r.name),
  prefix: String(r.prefix),
  scopes: (r.scopes as Scope[]) ?? ["read"],
  createdAt: String(r.created_at),
  lastUsedAt: (r.last_used_at as string) ?? null,
  revokedAt: (r.revoked_at as string) ?? null,
  requestCount: Number(r.request_count ?? 0),
});

/**
 * The gate. Paid accounts get keys; the site owner does too, because someone
 * has to be able to exercise the API on the live site without inventing a fake
 * subscription for themselves.
 *
 * `pro_until` is honoured as well as `plan`, so a subscription that lapsed
 * stops minting keys the moment it expires rather than whenever a webhook
 * happens to run. Existing keys are NOT revoked on expiry — that would break a
 * customer's running program on a billing hiccup; they simply cannot mint more.
 */
export async function planState(userId: string, email: string | null): Promise<PlanState> {
  if (email && serverConfig.security.admins.includes(email.toLowerCase())) {
    return { allowed: true, reason: "owner", maxKeys: 10 };
  }
  const { data } = await admin()
    .from("profiles").select("plan, pro_until").eq("id", userId).maybeSingle();

  const plan = String(data?.plan ?? "free").toLowerCase();
  const until = data?.pro_until ? Date.parse(String(data.pro_until)) : null;
  /* "business" as well as "pro": app/api/billing/webhook writes both, and a
     business customer being told to upgrade would be a paying customer denied
     the thing they pay for. Read what the writer writes. */
  const paid = (plan === "pro" || plan === "business") && (until === null || until > Date.now());
  return paid
    ? { allowed: true, reason: "pro", maxKeys: plan === "business" ? 20 : 5 }
    : { allowed: false, reason: "free", maxKeys: 0 };
}

/** Profiles are created by a trigger on signup; anyone who predates it gets one
    here rather than being told they have no plan because they have no row.
    Failure is swallowed on purpose: migration 0002 (public.profiles) had never
    been applied to production when this shipped, and a missing profile must
    degrade to "free", not to a 500 on the key manager. */
export async function ensureProfile(userId: string, email: string | null): Promise<void> {
  try {
    await admin().from("profiles").upsert({ id: userId, email }, { onConflict: "id", ignoreDuplicates: true });
  } catch { /* no profiles table yet — planState already reads a miss as free */ }
}

export async function listKeys(userId: string): Promise<PublicKey[]> {
  const { data, error } = await admin()
    .from("api_keys").select("*").eq("user_id", userId).order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []).map(row2public);
}

/** Returns the plaintext ONCE. Never stored, never logged, never recoverable. */
export async function createKey(
  userId: string, name: string, scopes: Scope[] = ["read"],
): Promise<{ key: string; record: PublicKey }> {
  const secret = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const key = `${PREFIX}${secret}`;
  const { data, error } = await admin().from("api_keys").insert({
    user_id: userId,
    name: name.slice(0, 60),
    /* Enough to recognise a key in a list, far too little to reconstruct it. */
    prefix: `${PREFIX}${secret.slice(0, 4)}`,
    key_hash: await sha256(key),
    scopes,
  }).select().single();
  if (error) throw new Error(error.message);
  return { key, record: row2public(data) };
}

export async function revokeKey(id: string, userId: string): Promise<boolean> {
  const { data, error } = await admin()
    .from("api_keys").update({ revoked_at: new Date().toISOString() })
    .eq("id", id).eq("user_id", userId).is("revoked_at", null).select("id");
  if (error) throw new Error(error.message);
  return (data ?? []).length > 0;
}

export type AuthedKey = { userId: string; keyId: string; scopes: Scope[] };

/**
 * Authenticate an inbound request. Accepts `Authorization: Bearer qrix_live_…`
 * or `x-api-key`, because half the HTTP clients in the world make one of those
 * easier than the other.
 *
 * Returns null for anything wrong — unknown, revoked, expired, insufficient
 * scope — without saying which, so this cannot be used to enumerate keys.
 */
export async function authenticateKey(req: Request, required: Scope = "read"): Promise<AuthedKey | null> {
  const header = req.headers.get("authorization");
  const raw = header?.toLowerCase().startsWith("bearer ")
    ? header.slice(7).trim()
    : req.headers.get("x-api-key")?.trim();
  if (!raw || !raw.startsWith(PREFIX)) return null;

  const { data } = await admin()
    .from("api_keys").select("id, user_id, scopes, revoked_at, expires_at, request_count")
    .eq("key_hash", await sha256(raw)).maybeSingle();
  if (!data || data.revoked_at) return null;
  if (data.expires_at && Date.parse(String(data.expires_at)) < Date.now()) return null;

  const scopes = (data.scopes as Scope[]) ?? ["read"];
  if (required === "write" && !scopes.includes("write")) return null;

  /* Usage is recorded but never awaited: a slow counter must not slow the
     customer's request, and losing one tick on a crash is not worth a round
     trip on the hot path. */
  void admin().from("api_keys")
    .update({ last_used_at: new Date().toISOString(), request_count: Number(data.request_count ?? 0) + 1 })
    .eq("id", data.id).then(() => undefined);

  return { userId: String(data.user_id), keyId: String(data.id), scopes };
}

/** One place for the shape every public endpoint returns on a bad key. */
export function unauthorized(): Response {
  return Response.json(
    { error: "invalid_api_key", message: "Send a valid key as `Authorization: Bearer qrix_live_…`. Create one at https://qrixtools.com/account/api" },
    { status: 401, headers: { "www-authenticate": "Bearer" } },
  );
}
