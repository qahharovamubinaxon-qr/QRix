-- Migration 0005: API keys for paid accounts
-- Run after 0002 (needs public.profiles for the plan gate). Safe to re-run.
--
-- Why this table and not lib/server/db.ts: that store is in-memory. On Vercel a
-- key created there survives until the next cold start, which is minutes — the
-- customer's program would authenticate once and then start getting 401s with
-- nothing in the logs to explain it. Keys have to be persistent to be real.
--
-- Only a sha-256 hash of the key is stored. The plaintext is shown to the owner
-- exactly once, at creation, and cannot be recovered afterwards — a leak of this
-- table does not leak anyone's credentials.

create table if not exists public.api_keys (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references auth.users(id) on delete cascade,
  name         text        not null,
  prefix       text        not null,               -- "qrix_live_ab12…" — display only
  key_hash     text        not null unique,        -- sha-256 of the full key
  scopes       text[]      not null default '{read}',
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz,
  expires_at   timestamptz
);

create index if not exists api_keys_user_idx on public.api_keys (user_id);
create index if not exists api_keys_hash_idx on public.api_keys (key_hash);

-- RLS on, and NO policies: every path goes through the service role in
-- lib/server/user-api-keys.ts. The same shape dynamic_links uses. A browser
-- holding an anon key can read nothing here, not even its own rows, because the
-- rows are credentials and the API returns only the safe projection.
alter table public.api_keys enable row level security;

-- Per-key request counter, incremented on authentication. Kept on the row
-- rather than in a separate table: one UPDATE on a hot path, no join to read.
alter table public.api_keys
  add column if not exists request_count bigint not null default 0;
