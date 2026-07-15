import { createClient } from "@supabase/supabase-js";

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
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);