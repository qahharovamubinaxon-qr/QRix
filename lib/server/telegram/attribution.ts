/* Where each bot user came from — so group outreach is measured, not guessed.

   Give every placement its own deep link:
     https://t.me/qrix_downloader_bot?start=g_toshkent
   Telegram delivers that payload as "/start g_toshkent" on the user's first
   message, and we record it once. First touch wins: a user who later re-opens
   the bot from another link keeps their original source, so the credit stays
   with whoever actually brought them.

   The number that matters is not how many people tapped the link — it is how
   many came BACK. `uses` answers that, which is why every delivered download
   bumps it.

   Supabase-backed, and a missing table or missing env is a silent no-op: the
   bot must never fail because analytics are unavailable.

   One-time table (run in the Supabase SQL editor):

     create table if not exists bot_users (
       tg_id      bigint primary key,
       source     text,
       lang       text,
       first_seen timestamptz not null default now(),
       last_seen  timestamptz not null default now(),
       uses       integer     not null default 0
     );
     alter table bot_users enable row level security;   -- service role only
*/

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const TABLE = "bot_users";

/** Guarded client — null when env is absent, which disables attribution silently. */
function sb(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try { return createClient(url, key); } catch { return null; }
}

export function attributionConfigured(): boolean {
  return !!sb();
}

/** A /start payload is user-supplied — keep it short and boring before storing. */
export function cleanSource(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = String(raw).trim().slice(0, 48).replace(/[^\w.-]/g, "");
  return s || null;
}

/** First contact. Records the source once; later starts only refresh last_seen. */
export async function recordStart(tgId: number, source: string | null, lang?: string): Promise<void> {
  const c = sb();
  if (!c || !tgId) return;
  try {
    const { data } = await c.from(TABLE).select("tg_id, source").eq("tg_id", tgId).maybeSingle();
    if (!data) {
      await c.from(TABLE).insert({ tg_id: tgId, source, lang: lang || null });
      return;
    }
    // Existing user: never overwrite the original source, but fill it if the
    // row predates attribution (source null) so early users aren't lost.
    await c.from(TABLE)
      .update({ last_seen: new Date().toISOString(), ...(data.source ? {} : { source }) })
      .eq("tg_id", tgId);
  } catch { /* analytics must never break the bot */ }
}

/** A real download landed — this is the retention signal. */
export async function recordUse(tgId: number, lang?: string): Promise<void> {
  const c = sb();
  if (!c || !tgId) return;
  try {
    const { data } = await c.from(TABLE).select("uses").eq("tg_id", tgId).maybeSingle();
    if (!data) {
      await c.from(TABLE).insert({ tg_id: tgId, lang: lang || null, uses: 1 });
      return;
    }
    await c.from(TABLE)
      .update({ uses: (data.uses || 0) + 1, last_seen: new Date().toISOString() })
      .eq("tg_id", tgId);
  } catch { /* ignore */ }
}

export type SourceRow = { source: string; users: number; returning: number; downloads: number };

/** Per-placement rollup: who arrived, who came back, how much they actually used it. */
export async function sourceStats(): Promise<SourceRow[]> {
  const c = sb();
  if (!c) return [];
  try {
    const { data } = await c.from(TABLE).select("source, uses").limit(10_000);
    if (!data) return [];
    const by = new Map<string, SourceRow>();
    for (const r of data as { source: string | null; uses: number | null }[]) {
      const key = r.source || "direct";
      const row = by.get(key) || { source: key, users: 0, returning: 0, downloads: 0 };
      row.users += 1;
      row.downloads += r.uses || 0;
      if ((r.uses || 0) >= 2) row.returning += 1;   // used it more than once
      by.set(key, row);
    }
    return [...by.values()].sort((a, b) => b.users - a.users);
  } catch { return []; }
}
