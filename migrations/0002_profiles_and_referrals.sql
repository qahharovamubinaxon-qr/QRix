-- Migration 0002: monetization + referral foundation
-- Run this in the Supabase SQL editor (or via `supabase db push`).
--
-- Creates:
--   * profiles       — one row per auth user: plan, Pro expiry, credits, referral code
--   * referrals      — ledger of who invited whom + the reward granted
--   * a trigger that auto-provisions a profile (with a unique referral code) on signup
--   * RLS so each user can read only their own profile

-- ── profiles ──────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text,
  plan          text        not null default 'free',      -- 'free' | 'pro'
  pro_until     timestamptz,                               -- when Pro access ends (null = not pro)
  credits       integer     not null default 0,            -- reward credits
  referral_code text        unique,                        -- this user's shareable code
  referred_by   uuid        references public.profiles(id),-- who invited them
  created_at    timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ── referrals ─────────────────────────────────────────────────────────────
create table if not exists public.referrals (
  id             uuid primary key default gen_random_uuid(),
  referrer_id    uuid not null references public.profiles(id) on delete cascade,
  referred_id    uuid not null references public.profiles(id) on delete cascade,
  reward_credits integer not null default 0,
  created_at     timestamptz not null default now(),
  unique (referred_id)                                     -- a user can only be referred once
);

alter table public.referrals enable row level security;

drop policy if exists "referrals_select_own" on public.referrals;
create policy "referrals_select_own" on public.referrals
  for select using (auth.uid() = referrer_id or auth.uid() = referred_id);

-- ── unique short referral code generator ──────────────────────────────────
create or replace function public.gen_referral_code()
returns text language plpgsql as $$
declare
  code text;
begin
  loop
    -- 8-char base36-ish code, lowercase
    code := lower(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));
    exit when not exists (select 1 from public.profiles where referral_code = code);
  end loop;
  return code;
end;
$$;

-- ── atomic credit increment (called by the referral claim API) ────────────
create or replace function public.increment_credits(uid uuid, amount integer)
returns void language sql security definer set search_path = public as $$
  update public.profiles set credits = credits + amount where id = uid;
$$;

-- ── auto-provision a profile on signup ────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, referral_code)
  values (new.id, new.email, public.gen_referral_code())
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill profiles for any users that already exist
insert into public.profiles (id, email, referral_code)
select u.id, u.email, public.gen_referral_code()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
