-- Migration 0003: Stripe billing columns on profiles
-- Run after 0002. Safe to re-run.

alter table public.profiles
  add column if not exists stripe_customer_id     text unique,
  add column if not exists stripe_subscription_id text;

create index if not exists profiles_stripe_customer_idx
  on public.profiles (stripe_customer_id);
