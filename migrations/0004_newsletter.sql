-- Migration 0004: newsletter subscribers
create table if not exists public.newsletter_subscribers (
  email      text primary key,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
-- writes go through the service role only; no public policies needed
