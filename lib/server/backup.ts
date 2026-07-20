/* Weekly database backup — SERVER ONLY.
   Supabase's free tier has no automatic backups, so every Sunday the autopilot
   cron also dumps the four persistent tables to a private "backups" storage
   bucket as dated JSON. Restoring = downloading the file and re-inserting.
   Env-gated on SUPABASE_SERVICE_ROLE_KEY (same as the rest of the backend). */

import { createClient } from "@supabase/supabase-js";

const TABLES = ["dynamic_links", "qr_scans", "reviews", "autopilot_posts"] as const;
const BUCKET = "backups";

export async function backupDatabase(): Promise<{ ok: boolean; file?: string; rows?: number; reason?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return { ok: false, reason: "supabase_not_configured" };

  const client = createClient(url, key);
  const dump: Record<string, unknown> = { backed_up_at: new Date().toISOString() };
  let rows = 0;
  for (const t of TABLES) {
    const { data, error } = await client.from(t).select("*").limit(50_000);
    dump[t] = error ? { error: error.message } : data;
    rows += Array.isArray(data) ? data.length : 0;
  }

  const auth = { Authorization: `Bearer ${key}` };
  // idempotent: creating an existing bucket just errors quietly
  await fetch(`${url}/storage/v1/bucket`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json" },
    body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
  }).catch(() => null);

  const file = `qrix-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const up = await fetch(`${url}/storage/v1/object/${BUCKET}/${file}`, {
    method: "POST",
    headers: { ...auth, "Content-Type": "application/json", "x-upsert": "true" },
    body: JSON.stringify(dump),
  }).catch(() => null);
  if (!up?.ok) return { ok: false, reason: `upload_${up?.status ?? "failed"}` };
  return { ok: true, file, rows };
}
