# QRix Autopilot — the site's autonomous growth engine

**Short answer: yes, it's possible — and most of it is now built.** But a robot that
_writes code and deploys to production by itself every day_ is a bad idea, and no
serious team does it. Below is what we automate safely, what we deliberately keep
human-in-the-loop, and how to turn it on.

---

## What runs automatically (safe to fully automate)

| Pillar | What it does | Where |
|--------|--------------|-------|
| **Auto-blog** | Writes one genuinely useful, keyword-targeted SEO article per day with the free AI backend and publishes it to `/blog`. Refuses to publish thin/low-quality output (quality gate). | `lib/server/autopilot.ts` → `app/api/cron/autopilot` |
| **Health watchdog** | Every ~6h checks DB, cache, storage, queue, AI providers, billing, email, Telegram + config, and pings you on Telegram the moment anything degrades. | `app/api/cron/watchdog` |
| **Owner alerts** | Live pushes for new users, payments, failed jobs, 500s, AI-provider failures, security warnings — throttled so floods collapse into one message. | `lib/server/telegram/notify.ts` (already existed) |
| **Scheduled reports** | Daily / weekly / monthly business report to Telegram (users, revenue, top tools, errors, MRR/ARR). | `app/api/cron/telegram-reports` (already existed) |

The auto-blog is **additive and env-gated**: with no Supabase configured,
`getAutopilotPosts()` returns `[]` and the blog is byte-for-byte unchanged.
Published articles are stored in Supabase and surfaced through the existing blog
via ISR (`revalidate = 3600`) — no rebuild or redeploy needed. New slugs are added
to the sitemap automatically.

## What we deliberately do **not** automate (and why)

- **Writing code / fixing bugs and deploying to prod unattended.** An AI committing
  unreviewed code to a live SaaS is how you ship an outage or a security hole at 3am
  with nobody watching. The right pattern is _human-in-the-loop_:
  - Run **Claude Code on a schedule** (or a GitHub Action that invokes it) to open a
    **pull request** with the proposed change — tests run, you glance, you merge.
  - The watchdog already tells you _what_ needs attention; approving the fix stays a
    one-click human decision.
- **Irreversible actions** (deletes, access/permission changes, payments): always
  surfaced for approval, never executed by the robot.

So the honest recommendation: **automate content + monitoring + alerting now
(done), and drive code changes through review-gated Claude Code / CI — not through
an unattended agent.**

---

## Enable it (deploy checklist)

1. **AI keys** (already in `.env.local` locally — add to Vercel): `CEREBRAS_API_KEY`,
   `CLOUDFLARE_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`. Without these the auto-blog skips.
2. **Supabase** (already used for dynamic QR): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `SUPABASE_SERVICE_ROLE_KEY` for writes).
   Create the table:
   ```sql
   create table if not exists autopilot_posts (
     slug text primary key,
     data jsonb not null,
     created_at timestamptz not null default now()
   );
   -- allow the app to read/insert (mirror your dynamic_links/qr_scans policy)
   alter table autopilot_posts enable row level security;
   create policy "autopilot read"  on autopilot_posts for select using (true);
   create policy "autopilot write" on autopilot_posts for insert with check (true);
   ```
3. **Telegram** (for alerts/reports): `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_ID`,
   `TELEGRAM_BOT_USERNAME`, `TELEGRAM_SECRET_TOKEN`.
4. **Cron auth**: set `CRON_SECRET` on Vercel; the cron routes reject calls without it.
5. **Crons** are already declared in `vercel.json` (autopilot daily 06:00, watchdog
   every 6h). Vercel picks them up on deploy.

## Grow the content engine

Add topics to `AUTOPILOT_TOPICS` in `lib/server/autopilot.ts` — each is a
`{ slug, title, keywords, category, toolHref, angle }`. The autopilot publishes the
first topic that isn't live yet, so ordering = priority. Ships with 10 high-intent
topics (quishing safety, never-expiring codes, AI QR art, UPI, GS1, bulk, analytics,
vCard, SVG-for-print, Instagram) — all tied to real QRix tools.
