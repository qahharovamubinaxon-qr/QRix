-- ============================================================================
-- QRix — Supabase schema
-- Run once in the Supabase dashboard → SQL Editor → New query → paste → Run.
-- Safe to re-run: every statement is idempotent (IF NOT EXISTS / drop-then-create).
-- ============================================================================

-- ── 1. dynamic_links ────────────────────────────────────────────────────────
-- One row per dynamic QR. /r/<slug> reads target_url and redirects (307); the
-- scan counter is bumped on each hit. `pin` is a PBKDF2 hash when the link is
-- protected, never plaintext. user_id is the owner (null for anonymous links).
create table if not exists public.dynamic_links (
  slug        text primary key,
  target_url  text not null,
  pin         text,
  user_id     uuid,
  scans       integer not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists dynamic_links_user_id_idx on public.dynamic_links (user_id);

-- ── 2. qr_scans ─────────────────────────────────────────────────────────────
-- One row per scan. The IP is anonymised (/24 for IPv4) BEFORE it is written, so
-- no raw IP is ever stored. Deleting a link removes its scans (cascade).
create table if not exists public.qr_scans (
  id          bigint generated always as identity primary key,
  slug        text not null references public.dynamic_links (slug) on delete cascade,
  user_agent  text,
  ip          text,
  browser     text,
  os          text,
  device      text,
  country     text,
  city        text,
  scanned_at  timestamptz not null default now()
);
create index if not exists qr_scans_slug_idx        on public.qr_scans (slug);
create index if not exists qr_scans_scanned_at_idx  on public.qr_scans (scanned_at desc);

-- ── 3. reviews ──────────────────────────────────────────────────────────────
-- The public testimonial wall. Submitted straight from the browser with the anon
-- key, so the CHECK constraints are the real guard rails: a bad rating or an
-- oversized name/comment is rejected by the database, not merely by the UI.
create table if not exists public.reviews (
  id          bigint generated always as identity primary key,
  name        text     not null check (char_length(name)    between 1 and 60),
  rating      smallint not null check (rating between 1 and 5),
  comment     text     not null check (char_length(comment) between 1 and 600),
  created_at  timestamptz not null default now()
);
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);

-- ── 4. autopilot_posts ──────────────────────────────────────────────────────
-- Articles the SEO autopilot publishes. The whole BlogPost is stored as jsonb in
-- `data`; the blog reads it back and renders it. Written only by the cron, which
-- must use the service-role key (see the RLS section).
create table if not exists public.autopilot_posts (
  slug        text primary key,
  data        jsonb not null,
  created_at  timestamptz not null default now()
);
create index if not exists autopilot_posts_created_at_idx on public.autopilot_posts (created_at desc);


-- ============================================================================
-- Row Level Security
-- RLS is ON for every table. Without a matching policy, the public anon key can
-- do nothing — which is the point.
-- ============================================================================
alter table public.dynamic_links   enable row level security;
alter table public.qr_scans        enable row level security;
alter table public.reviews         enable row level security;
alter table public.autopilot_posts enable row level security;

-- ── reviews: the public wall ──
-- Anyone may read the reviews and submit one (the CHECK constraints above keep
-- submissions sane). No one may edit or delete via the anon key.
drop policy if exists reviews_read   on public.reviews;
drop policy if exists reviews_insert on public.reviews;
create policy reviews_read   on public.reviews for select using (true);
create policy reviews_insert on public.reviews for insert with check (true);

-- ── autopilot_posts: public blog content ──
-- Anyone may read published articles. Writing is NOT allowed to the anon key —
-- the cron writes with the service-role key, which bypasses RLS entirely. So set
-- SUPABASE_SERVICE_ROLE_KEY or the autopilot cannot publish.
drop policy if exists autopilot_read on public.autopilot_posts;
create policy autopilot_read on public.autopilot_posts for select using (true);

-- ── dynamic_links + qr_scans: LOCKED to the server ──────────────────────────
-- These carry user links and scan logs. Every server path that touches them uses
-- the SERVICE-ROLE key (bypasses RLS) — the redirect, PIN verify, the dashboard and
-- the create/update/delete routes all import lib/supabase.ts, which is service-role.
-- So the public anon key gets NOTHING here. This is what closes the holes the old
-- "for everyone" policies opened: anyone with the public key could otherwise read
-- every link (and PIN hash), read all scans, and — worst — REPOINT any QR code.
--
-- The only policies kept are the authenticated, owner-scoped ones, for the case
-- where a signed-in user's browser reaches the table directly (auth.uid()=user_id).
-- Requires SUPABASE_SERVICE_ROLE_KEY to be set, or the server cannot read these.

-- dynamic_links
drop policy if exists "Allow select for everyone" on public.dynamic_links;
drop policy if exists "Allow update for everyone" on public.dynamic_links;
drop policy if exists "Allow insert for everyone" on public.dynamic_links;
drop policy if exists "Users can view own links"   on public.dynamic_links;
drop policy if exists "Users can insert own links" on public.dynamic_links;
drop policy if exists "Users can update own links" on public.dynamic_links;
drop policy if exists "Users can delete own links" on public.dynamic_links;
create policy "Users can view own links"   on public.dynamic_links for select to authenticated using      (auth.uid() = user_id);
create policy "Users can insert own links" on public.dynamic_links for insert to authenticated with check (auth.uid() = user_id);
create policy "Users can update own links" on public.dynamic_links for update to authenticated using      (auth.uid() = user_id);
create policy "Users can delete own links" on public.dynamic_links for delete to authenticated using      (auth.uid() = user_id);

-- qr_scans: service-role only, no anon/authenticated policies at all.
drop policy if exists "Allow read scan"   on public.qr_scans;
drop policy if exists "Allow insert scan" on public.qr_scans;

-- ============================================================================
-- Done. Four tables, RLS on, reviews constrained, blog public-read.
-- ============================================================================
