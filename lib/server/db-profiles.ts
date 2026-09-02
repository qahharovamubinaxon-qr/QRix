/* The users collection, backed by the `profiles` table that already exists.
   ───────────────────────────────────────────────────────────────────────────
   lib/server/db.ts ships an in-memory driver seeded with four invented users
   (alex@example.com, Sam Lee, Jo Park). On Vercel that store empties on every
   cold start, so /admin, /dashboard and the Telegram report have been
   describing a lambda's imagination rather than the site.

   Meanwhile Supabase already holds the real thing: `profiles` carries email,
   plan, credits, referral_code and the Stripe ids, and seven other parts of
   the codebase read it. Nothing had to be built — only connected.

   WHY NOT PRISMA. The Collection interface in db.ts is SYNCHRONOUS —
   `db.users.find(...)` returns a row, not a promise, and 28 files depend on
   that. Prisma and Supabase are both async, so neither can back it directly
   without rewriting every call site. Hydrating at boot and writing through in
   the background keeps those 28 files untouched.

   WHAT THIS COSTS, said plainly:
     · a write is durable only once the background push lands; a crash in that
       window loses it. Acceptable at today's two accounts, not a general
       answer.
     · two lambda instances can hold diverging copies until the next cold
       start. Reads are eventually consistent, not immediately.
   Both are strictly better than the previous behaviour, which was to lose
   every write at the end of the request.

   `profiles` and `User` are NOT the same shape, and the gaps are real:
     profiles has  credits, referral_code, referred_by, stripe_* — no User field
     User has      name, image, role, emailVerified, passwordHash, banned — no column
   So the mapping is lossy in both directions and the write-back only touches
   the columns that exist. It must never overwrite credits or the Stripe ids
   with undefined, which is why the patch is built field by field rather than
   spread wholesale. SERVER ONLY. */
import { createAdminClient } from "@/lib/supabase-admin";
import { serverConfig } from "./config";
import type { User, Plan, Role } from "./models";

type ProfileRow = {
  id: string;
  email: string | null;
  plan: string | null;
  created_at: string | null;
};

const PLANS = new Set(["FREE", "PRO", "BUSINESS", "ENTERPRISE"]);

/** `profiles.plan` is free text; `User.plan` is an enum. Anything unexpected
    becomes FREE rather than being trusted into the type. */
function toPlan(v: string | null): Plan {
  const p = (v || "").toUpperCase();
  return (PLANS.has(p) ? p : "FREE") as Plan;
}

/* Role is NOT a column — it is derived from ADMIN_EMAILS (see config.security.admins),
   which is deliberate: admin rights should not be editable by anything that can
   write to the database. */
function roleFor(email: string | null): Role {
  return email && serverConfig.security.admins.includes(email.toLowerCase())
    ? ("ADMIN" as Role)
    : ("USER" as Role);
}

function toUser(r: ProfileRow): User {
  const created = r.created_at || new Date().toISOString();
  return {
    id: r.id,
    email: r.email || "",
    name: null,
    role: roleFor(r.email),
    plan: toPlan(r.plan),
    createdAt: created,
    // `profiles` has no updated_at, and inventing "now" would make every row
    // look freshly touched on each boot. The creation time is the honest value.
    updatedAt: created,
  };
}

export function profilesConfigured(): boolean {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

/** Reads every profile. Returns null when it could not look — never an empty
    array, because "no users" and "could not reach the database" must not be
    the same value to the caller. */
export async function loadUsers(timeoutMs = 4000): Promise<User[] | null> {
  const sb = createAdminClient();
  if (!sb) return null;
  try {
    const res = await Promise.race([
      sb.from("profiles").select("id,email,plan,created_at").order("created_at", { ascending: false }).limit(2000),
      new Promise<null>((r) => setTimeout(() => r(null), timeoutMs)),
    ]);
    if (!res || res.error || !res.data) return null;
    return (res.data as ProfileRow[]).map(toUser);
  } catch {
    return null;
  }
}

/* ── write-through ──────────────────────────────────────────────────────
   Fire-and-forget on purpose: the call sites are synchronous and cannot await.
   Failures are swallowed rather than thrown, because a failed background sync
   must not break the request that triggered it — but they are logged, so a
   silently desynchronised database is at least visible in the function logs. */

const warn = (what: string, e: unknown) =>
  console.warn(`[db-profiles] ${what} failed:`, e instanceof Error ? e.message : e);

export function pushInsert(u: User): void {
  const sb = createAdminClient();
  if (!sb) return;
  void sb
    .from("profiles")
    .upsert({ id: u.id, email: u.email, plan: u.plan, created_at: u.createdAt }, { onConflict: "id" })
    .then(({ error }) => { if (error) warn("insert", error); });
}

export function pushUpdate(id: string, patch: Partial<User>): void {
  const sb = createAdminClient();
  if (!sb) return;
  /* Only columns that exist, and only the ones actually being changed. A
     wholesale spread would write undefined over credits, referral_code and the
     Stripe ids — none of which this layer knows anything about. */
  const row: Record<string, unknown> = {};
  if (patch.email !== undefined) row.email = patch.email;
  if (patch.plan !== undefined) row.plan = patch.plan;
  if (!Object.keys(row).length) return;
  void sb.from("profiles").update(row).eq("id", id)
    .then(({ error }) => { if (error) warn("update", error); });
}

export function pushDelete(id: string): void {
  const sb = createAdminClient();
  if (!sb) return;
  void sb.from("profiles").delete().eq("id", id)
    .then(({ error }) => { if (error) warn("delete", error); });
}
