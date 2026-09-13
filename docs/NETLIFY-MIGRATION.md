# Moving qrixtools.com to Netlify (free)

**Why.** The Vercel Pro subscription lapsed on an unfunded card. Once a plan
expires Vercel **removes the Downgrade control** — the billing page offers only
"Reactivate Pro" — so the free Hobby tier is unreachable without first paying
the outstanding $20. The site has been returning **HTTP 402** since. There is no
money available, so the site moves to a host whose free tier runs this stack.

**Why Netlify and not Cloudflare.** Cloudflare's adapter (`@opennextjs/cloudflare`)
requires Next `>= 16.3.3`; we are on **16.2.7**, so it would force a framework
upgrade first. Netlify's runtime supports **"Next.js 13.5 or later"** — no
upgrade — and its functions run **Node.js**, so the 58 API routes that declare
`runtime = "nodejs"`, and the one `sharp` import, keep working. On Cloudflare
Workers neither would.

**There is no downtime cost.** The site is already down. Every hour of this
migration is an hour it was going to be down anyway.

---

## What carries over unchanged

- All 853 pages, the tool registries, sitemap, robots, schema, hreflang.
- All 63 API routes (Netlify Functions run Node).
- The downloader: media bytes already stream through the **Cloudflare Worker**
  (`MEDIA_PROXY_URL`), so the host only resolves URLs and redirects. This is why
  Netlify's 100 GB/month free bandwidth is ample — the video never touches it.
- Supabase, Telegram bot webhook, GA4, Adsterra.

## What does NOT carry over — decide before switching DNS

| Thing | Effect | Plan |
|---|---|---|
| `vercel.json` **crons** (autopilot 06:00, telegram-reports 07:00, social-post 09:00) | Netlify ignores `vercel.json`; daily automation stops | Re-create as Netlify **Scheduled Functions**, or point a free external cron (cron-job.org) at the three routes with the `CRON_SECRET` header. Not user-facing — do it after the site is up. |
| `api/py-pdf2docx.py` | Netlify has **no Python runtime** | It is the **last** fallback in PDF→Word (Adobe → Aspose → CloudConvert → this). Adobe is the live path, so the tool degrades rather than breaks. |
| `@vercel/analytics`, `@vercel/speed-insights` | Go inert — no more Vercel Analytics | **GA4 already runs** (`NEXT_PUBLIC_GA_ID`), so traffic reporting survives. Yandex Webmaster and Search Console are unaffected. |
| `/api/og` (`runtime = "edge"`) | Netlify Edge Functions should run `next/og`, but this is the one thing to verify | After deploy, open `https://<site>/api/og?t=Test` — expect `200 image/png`. If it fails, drop `export const runtime = "edge"` from that route so it runs as a Node function. |

---

## Steps

### 1. Owner — create the site (5 min)
1. Sign in at **app.netlify.com** (GitHub login is simplest — the repo is already there).
2. **Add new site → Import an existing project → GitHub →** `qahharovamubinaxon-qr/QRix`.
3. Branch to deploy: **`main`**. Leave build command and publish directory as
   detected — Netlify installs its Next.js runtime automatically. `netlify.toml`
   in the repo pins Node 22 and the two header rules.
4. **Deploy.** The first build takes a few minutes.

### 2. Owner — environment variables
Netlify → **Site configuration → Environment variables**. These must be copied
across; the values live only in Vercel and in your own records — **Claude never
reads or writes secret values.**

Copy every variable currently set in Vercel. The ones the code actually reads:

```
NEXT_PUBLIC_SUPABASE_URL          SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY     AUTH_SECRET
NEXT_PUBLIC_SITE_URL              CRON_SECRET
NEXT_PUBLIC_GA_ID                 COBALT_API_URL
NEXT_PUBLIC_AI_ENGINE             MEDIA_PROXY_URL
NEXT_PUBLIC_ADSTERRA_NATIVE_SRC   MEDIA_PROXY_SECRET
NEXT_PUBLIC_ADSTERRA_BANNER_KEY
TELEGRAM_BOT_TOKEN                TELEGRAM_SECRET_TOKEN
TELEGRAM_OWNER_ID                 TELEGRAM_CHANNEL_ID
TELEGRAM_BOT_USERNAME             TELEGRAM_PUBLIC_BOT_TOKEN
TELEGRAM_PUBLIC_SECRET
ANTHROPIC_API_KEY   GEMINI_API_KEY   GROQ_API_KEY   CEREBRAS_API_KEY
OPENROUTER_API_KEY  FAL_API_KEY      MUAPI_API_KEY
CLOUDFLARE_ACCOUNT_ID  CLOUDFLARE_AI_TOKEN  CLOUDFLARE_API_KEY
ADOBE_PDF_CLIENT_ID    ADOBE_PDF_CLIENT_SECRET
ASPOSE_CLIENT_ID       ASPOSE_CLIENT_SECRET   CLOUDCONVERT_API_KEY
RESEND_API_KEY   EMAIL_DRIVER   GSC_SERVICE_ACCOUNT_JSON
```

> `CRON_SECRET` is a Vercel **Sensitive** variable — its value can no longer be
> read back. Generate a NEW random value, set it on Netlify, and remember that
> anything already signed with the old one stops validating. `MEDIA_PROXY_SECRET`
> must keep matching `MEDIA_SECRET` on the Cloudflare Worker, or every download
> returns 403.

### 3. Verify on the Netlify URL — BEFORE touching DNS
The site gets a `*.netlify.app` address. Check there first:
- homepage `200`, a tool page, `/downloader/vk`
- `/api/og?t=Test` → `200 image/png`
- a real download (paste a VK link) — it should 302 to
  `qrix-media-proxy.eduguard.workers.dev` and deliver the file
- `/sitemap.xml` and `/robots.txt`

### 4. Owner — switch DNS (Cloudflare)
Only after step 3 passes. In Cloudflare DNS for `qrixtools.com`, repoint the
apex and `www` records from Vercel to the Netlify target Netlify shows you
(Domain management → Add a domain). Keep the records proxied as they are now.

### 5. After the switch
- Re-run `npm run aeo:audit` — expect 0 P0.
- Search Console and Yandex Webmaster need **no change**: same domain, same URLs.
- Resubmit the sitemap in both, so the recovery crawl starts immediately.
- Then re-create the three crons (table above).

---

## Rollback

DNS is the only switch. If anything is wrong, point the records back at Vercel —
but note Vercel will still serve 402 until its invoice is settled, so in practice
the rollback target is "the site is down again", which is where it already is.
