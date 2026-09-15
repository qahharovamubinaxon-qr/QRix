import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client for the dynamic-link tables (dynamic_links, qr_scans).
 * It uses the SERVICE-ROLE key, which bypasses RLS, so those tables can be locked
 * against the public anon key — the previous "select/update for everyone" policies
 * let anyone with the public key read every link and REPOINT any QR code (a
 * redirect-hijack). Every server path that touches those tables imports this client.
 *
 * Falls back to the anon key only when the service key is absent (local without it).
 * Never import into a client component — but the service key is NOT NEXT_PUBLIC, so
 * it can never be inlined into a browser bundle even by mistake (it would resolve to
 * undefined on the client and fall back to anon).
 */
/* Built on FIRST USE, not on import.
   ───────────────────────────────────────────────────────────────────────────
   This used to call createClient() at module scope. Next imports every route
   module while collecting page data, so an absent NEXT_PUBLIC_SUPABASE_URL made
   `supabase-js` throw "supabaseUrl is required" and the whole production build
   died on /api/create-dynamic — a build that needs a database URL to compile
   static pages it never queries. It never surfaced on Vercel because the env was
   always set there; it stopped the first Netlify build dead.

   Deferring construction keeps the build portable to any host and turns a
   missing env from "nothing compiles" into "this one route errors at runtime",
   which is the failure that can actually be diagnosed. Same lesson as the
   NEXT_PHASE guard in lib/server/db.ts: do not reach for a database while
   building. The Proxy preserves the existing `supabase.from(...)` call sites. */
let _client: SupabaseClient | null = null;

function client(): SupabaseClient {
  if (_client) return _client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured — set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY).",
    );
  }
  _client = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop, receiver) {
    const c = client();
    const value = Reflect.get(c as object, prop, receiver);
    return typeof value === "function" ? value.bind(c) : value;
  },
});