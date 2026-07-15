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

-- ── dynamic_links + qr_scans ────────────────────────────────────────────────
-- These carry user links and scan logs. The app currently reaches them with the
-- ANON key server-side, so the policies below permit that and the site works as
-- shipped. The trade-off: the anon key is public, so with these policies anyone
-- could read every row directly through the Supabase REST API.
--
-- HARDENING (recommended before real traffic): move the server routes that touch
-- these tables (app/r, app/pin, app/api/create-dynamic, app/dashboard) onto the
-- service-role client, then DELETE the four policies below. The service role
-- bypasses RLS, so the tables become server-only and unreadable by the public key.
-- Ask and this can be wired + tested against the live database.
drop policy if exists dynamic_links_anon on public.dynamic_links;
drop policy if exists qr_scans_anon      on public.qr_scans;
create policy dynamic_links_anon on public.dynamic_links for all using (true) with check (true);
create policy qr_scans_anon      on public.qr_scans      for all using (true) with check (true);

-- ============================================================================
-- Done. Four tables, RLS on, reviews constrained, blog public-read.
-- ============================================================================
