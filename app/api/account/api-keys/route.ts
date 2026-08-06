import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { createKey, listKeys, planState, ensureProfile, type Scope } from "@/lib/server/user-api-keys";

/* The account's own key manager. Authenticated by the SITE session (the
   Supabase cookie the person signs in with), never by an API key — a key must
   not be able to mint more keys. */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function me() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function GET() {
  const user = await me();
  if (!user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });

  await ensureProfile(user.id, user.email ?? null);
  const [plan, keys] = await Promise.all([
    planState(user.id, user.email ?? null),
    listKeys(user.id),
  ]);
  return NextResponse.json({ plan, keys }, { headers: { "cache-control": "private, no-store" } });
}

export async function POST(req: Request) {
  const user = await me();
  if (!user) return NextResponse.json({ error: "not_signed_in" }, { status: 401 });

  await ensureProfile(user.id, user.email ?? null);
  const plan = await planState(user.id, user.email ?? null);
  if (!plan.allowed) {
    return NextResponse.json({
      error: "plan_required",
      message: "API keys are part of the Pro plan.",
      upgrade: "/pricing",
    }, { status: 402 });
  }

  let body: { name?: string; scopes?: Scope[] } = {};
  try { body = await req.json(); } catch { /* an empty body is a fine default */ }

  const name = (body.name || "").trim() || "Default key";
  /* Anything not on this list is dropped rather than rejected: a client sending
     "admin" gets a read key, not an error it cannot act on. */
  const scopes = (body.scopes || ["read"]).filter((s): s is Scope => s === "read" || s === "write");

  const existing = (await listKeys(user.id)).filter((k) => !k.revokedAt).length;
  if (existing >= plan.maxKeys) {
    return NextResponse.json({
      error: "key_limit",
      message: `This plan allows ${plan.maxKeys} active keys. Revoke one first.`,
    }, { status: 409 });
  }

  const { key, record } = await createKey(user.id, name, scopes.length ? scopes : ["read"]);
  /* `key` appears in this response and nowhere else, ever. */
  return NextResponse.json({ key, record }, { status: 201, headers: { "cache-control": "private, no-store" } });
}
