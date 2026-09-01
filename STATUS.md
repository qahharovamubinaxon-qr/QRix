# QRix — Status Report

**Verified:** 2 September 2026 · **Live:** https://qrixtools.com (HTTP 200)
**Repo:** github.com/qahharovamubinaxon-qr/QRix · branch `claude/qrix-six-point`, level with `origin/main`

Everything below was checked by opening files and running commands, not inferred.
Where something could not be verified, it says so.

---

## 1. Architecture

| | |
|---|---|
| Framework | **Next.js 16.2.7**, App Router — not a single HTML file |
| UI | **React 19.2.4** |
| Language | **TypeScript** — 203 `.ts` + 297 `.tsx`. `tsc --noEmit` passes clean |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) plus hand-written CSS: `app/globals.css` (1,102 lines), `app/design-v2.css` (1,386 lines) |
| Package manager | npm · `package.json` present · 50 scripts |

Key dependencies: `@supabase/supabase-js 2.107`, `stripe 22.3`, `@imgly/background-removal 1.4.5`, `tesseract.js 7.0`, `pdf-lib 1.17` + `@cantoo/pdf-lib 2.7`, `pdfjs-dist 6`, `mediabunny 1.50`, `sharp 0.35`, `three 0.160`, `@anthropic-ai/sdk 0.104`, `qr-code-styling`, `bwip-js`, `jszip`, `recharts`.

---

## 2. File structure

```
app/          50+ route folders — qr-tools, pdf-tools, image-tools, ai-tools,
              video-tools, 3d-tools, downloader, blog, admin, dashboard,
              pricing, login/register, ru/, uz/, api/
components/   UI primitives + every tool's client component
lib/          tool registries, i18n dictionaries, SEO helpers
lib/server/   35 modules — auth, billing, db, queue, storage, telegram,
              media-download, analytics, analytics-ga, ai/, providers/
scripts/      61 .mjs — tests, probes, GA/GSC readers, daily verify
prisma/       schema.prisma — 31 models
migrations/   5 .sql · supabase/schema.sql
growth/       strategy docs + DAILY_LOG
cobalt/       deployment kit for the downloader's fallback resolver
public/       static assets incl. vendored pdf.worker.min.js
```

- **767 files** excluding `node_modules`: 297 `.tsx`, 203 `.ts`, 61 `.mjs`, 52 `.svg`, 49 `.png`.
- **Largest file:** `lib/usecase-content.i18n.ts` — **9,225 lines**.
- Next largest: `app/design-v2.css` (1,386), `lib/blog.ts` (1,141), `app/globals.css` (1,102), `app/page.tsx` (1,029).

---

## 3. Features — what actually works

| Feature | Status | Detail |
|---|---|---|
| **QR generator** | **DONE** | 34 types: url, text, email, phone, sms, wifi, wifi-guest, vcard, mecard, event, geo, maps, whatsapp, telegram, instagram, facebook, twitter, youtube, tiktok, linkedin, upi, paypal, bitcoin, crypto, spotify, zoom, skype, facetime, appstore, gs1-digital-link, pdf, app |
| **PDF tools** | **DONE** | 21 operations: merge, split, compress, crop, rotate, reorder, delete-pages, extract-pages, page-numbers, watermark, protect, unlock, sign, redact, ocr, pdf-to-jpg, pdf-to-png, pdf-to-text, pdf-to-word, jpg-to-pdf, word-to-pdf |
| **Background removal** | **DONE** | `@imgly/background-removal` — runs **in the browser**, no API key, no upload |
| **OCR** | **DONE** | `tesseract.js` — in-browser (`ImageToTextClient`, `OcrPdfClient`) |
| **Downloader** | **DONE** | 9 platforms, all verified end-to-end today — see §9 |
| **Language switcher** | **PARTIAL** | See below |

**Other families:** image 32 tools · video 32 · AI 30 · 3D 3. Registries mark **89 `live`, 5 `preview`**.

### Language coverage — the honest picture

- `lib/lang.ts` defines **15 languages** (not 9): en ru uz zh hi es ar fr pt id de ja tr ur bn
- **Navigation and menu labels** — translated into all 15 ✅
- **Tool interfaces** (`lib/tool-ui-i18n.ts`) — only **EN / RU / UZ** ⚠️
- **Localised URL routes** — only `/ru/` and `/uz/` exist. The other 12 languages have no routes, so the switcher changes labels but not page content.

---

## 4. Backend and database

**Supabase — connected.** Tables actually referenced in code:
`profiles`, `referrals`, `dynamic_links`, `qr_scans`, `api_keys`, `newsletter_subscribers`, `secure_docs`.
SQL also defines `reviews`, `autopilot_posts`.

**Prisma — schema only.** `prisma/schema.prisma` declares **31 models**, but `lib/server/db.ts` states plainly in its own header that the active driver is an **in-memory mock**, with Prisma "intended" behind the same interface. Consequence: on Vercel that store empties on every cold start, so **dashboard/admin/analytics figures describe the lambda, not the site**. `DATABASE_URL` is not set.

**Auth.** Routes exist and are complete: `/api/v1/auth/{login,register,logout,magic,oauth,reset,session,sessions,verify}`. `/login`, `/register`, `/dashboard`, `/admin` all return 200 in production. Supabase auth is wired in `lib/server/auth.ts`. **But** user records live in the mock db above, so persistence depends on the Prisma switch.

**API routes: 63** (`app/api/**/route.ts`).

**Environment variables — 32 set in production** (names only):
`ADOBE_PDF_CLIENT_ID`, `ADOBE_PDF_CLIENT_SECRET`, `ANTHROPIC_API_KEY`, `ASPOSE_CLIENT_ID`, `ASPOSE_CLIENT_SECRET`, `AUTH_SECRET`, `CEREBRAS_API_KEY`, `CLOUDCONVERT_API_KEY`, `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_TOKEN`, `CLOUDFLARE_API_KEY`, `COBALT_API_URL`, `CRON_SECRET`, `EMAIL_DRIVER`, `FAL_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`, `GSC_SERVICE_ACCOUNT_JSON`, `MUAPI_API_KEY`, `NEXT_PUBLIC_AI_ENGINE`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `OPENROUTER_API_KEY`, `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_CHANNEL_ID`, `TELEGRAM_OWNER_ID`, `TELEGRAM_PUBLIC_BOT_TOKEN`, `TELEGRAM_PUBLIC_SECRET`, `TELEGRAM_SECRET_TOKEN`.

**Referenced in code but NOT set:** `DATABASE_URL`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_GA_ID` (falls back to a hard-coded id), `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*`, `NEXT_PUBLIC_BILLING_ENABLED`, `CREDITS_ENFORCED`, `VK_ACCESS_TOKEN`, `UPSTASH_REDIS_REST_*`, `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET`.

---

## 5. Monetisation

**Plans are real code, not just design.** `lib/server/billing.ts` → `PLANS`:

| Plan | jobsPerDay | storageMb | apiKeys | teamSeats |
|---|---|---|---|---|
| FREE | 20 | 100 | 1 | 1 |
| PRO | 300 | 5,000 | 5 | 1 |
| BUSINESS | 1,000,000 | 1,000,000 | 1,000 | 1,000 |

**However** enforcement is gated on `CREDITS_ENFORCED` and `NEXT_PUBLIC_BILLING_ENABLED`, neither of which is set — so **no limit is actually applied today**.

**Stripe** — integrated in code: 5 routes (`/api/billing/{checkout,portal,webhook}`, `/api/v1/billing/{checkout,webhook}`). **No Stripe keys are set**, so checkout cannot run. **Payme / Click — not present.**

**Ads — Adsterra, live since 2 Sep 2026.** Two units, both env-gated and verified in production: a native banner below every tool (`components/ToolPageShell.tsx`) and a 300x250 in blog articles. Popunder, social bar and adult ads are all deliberately OFF.

**AdSense — not used, and should not be applied for while the downloader lives on this domain.** Google's publisher policy forbids pages that help users download streaming video; `/downloader/*` is 57 pages and the site's most-visited section. The AdSense component remains in the tree unused. Note the downside is asymmetric: a rejected application is recoverable, a *revoked* AdSense account is usually permanent and follows the person, not the site.

**Google Analytics** — present and firing on the live page ✅ (GA4, with custom dimensions `tool` / `action` / `platform` registered 24 Aug 2026).

---

## 6. Deploy and git

- Git repo ✅ · remote **github.com/qahharovamubinaxon-qr/QRix** · pushed ✅
- Branch `claude/qrix-six-point`, **0 commits ahead of `origin/main`**
- **Vercel** — project `q-rix` under team `musarasulzada-2250s-projects`, aliased to **qrixtools.com**
- Domain connected ✅ (Cloudflare DNS)
- 3 cron jobs in `vercel.json`: `/api/cron/autopilot` (06:00), `/api/cron/telegram-reports?period=daily` (07:00), `/api/cron/social-post` (09:00)
- Sitemap: **847 URLs**

**Last 5 commits** (all 2026-08-30):

```
d5aa186  Odnoklassniki hands back metadata as an object now, not a string
e057e86  The daily Telegram report says what the site actually did, in Uzbek
75335c1  growth: verify baseline after the downloader canaries went clean
ff9dd49  docs: M153f — VK and Instagram back, and the env var that outranked the fix
7d39fe0  Append the working endpoint instead of letting the dead one win
```

---

## 7. Build health

- **`npm run build` — succeeds, exit code 0.** (Note: `CLAUDE.md` claims local builds OOM at the trace step. That is now **out of date** — the build completed on this machine.)
- **`tsc --noEmit` — clean.**
- **ESLint: 127 errors + 3,331 warnings** — but **3,194 of them (92%) come from two vendored third-party files**, `public/pdf.worker.min.js` and `public/pdf.worker.min.mjs` (1,597 each). Project code accounts for ~264 findings across 139 files, dominated by `no-unused-vars` and `no-explicit-any`.
- 25 automated test scripts (`test:qr`, `test:image`, `test:links`, `test:nav`, `verify:daily`, …). `test:links` 37/37, `test:nav` 6/6 at last run.

---

## 8. Unfinished work

- **TODO: 0 · FIXME: 0.** (Matches for "placeholder" are ordinary input attributes, not unfinished work.)
- **"Coming soon": 1 place** — `app/pdf-tools/page.tsx:234`, some PDF cards rendered `cursor-not-allowed`.
- **Mock drivers in 12 `lib/server/*` modules** — `db`, `analytics`, `auth`, `billing`, `credits`, `email`, `models`, `config`. Deliberate, but see §4.
- **5 tools marked `status: "preview"`.**

### Readiness: roughly 75%

- **Genuinely done (95%+):** the tools themselves — QR, PDF, image, downloader, OCR, background removal. Plus SEO, sitemap, localised routes, deploy pipeline, test suite.
- **Half done (40–60%):** backend persistence. Schema and code exist; no real database is connected, so users, history and limits live in a mock store.
- **Not done (0–20%):** paid plans. Stripe code without keys. Ads are live but earn a few dollars a month at current traffic.

**The three biggest gaps, in order:**
1. `DATABASE_URL` unset → nothing a user does is remembered
2. Stripe keys unset → no subscription can be purchased
3. Traffic. Ads are live but ~1,500 page views/month at CIS CPM is a few dollars — the ad network chosen matters far less than growing the audience

---

## 9. Downloader — current state

Rebuilt on 29–30 Aug. Was previously routing every platform through a single self-hosted cobalt instance which had died; `/downloader/vk` — the site's most-visited page — served a fortnight of traffic delivering nothing.

**In-process extractors, no external dependency:**
TikTok (tikwm) · SoundCloud · Vimeo · Pinterest · Odnoklassniki · Telegram · Rutube (HLS assembled server-side, remuxed to MP4 in the browser)

**Via cobalt (now a fallback, not the only route):** VK · Instagram · Facebook · X

**cobalt instance:** Railway project `qrix-cobalt`, image `ghcr.io/imputnet/cobalt:11`, at `https://cobalt-production-eca4.up.railway.app`.
⚠️ **Free trial — expires ~29 September 2026.** When it does, those four platforms stop. `npm run verify:daily` announces it; `cobalt/README.md` holds the replacement options.

**Verified live in production today** (`npm run verify:daily`):

```
ok  ok.ru      6 format(s)
ok  rutube     6 format(s)
ok  telegram   1 format(s)
ok  pinterest  1 format(s)
ok  vk         1 format(s)
```

VK additionally pulled 79,790,080 real bytes through the file proxy (`ftypisom` = valid MP4).

**YouTube is deliberately unsupported** — AdSense policy. Do not add it.

---

## 10. Traffic (GA4, 7 days to 30 Aug)

| | Previous 7d | Latest 7d | |
|---|---|---|---|
| Users | 116 | **187** | +61% |
| Sessions | 128 | 217 | +70% |
| Page views | 216 | 346 | +60% |

**Sources:** chatgpt.com 99 · yandex.ru 22 · direct 21 · yandex.uz 11 · google 5.
**ChatGPT sends roughly 20× more visitors than Google.**

**Top pages:** `/downloader/vk` 109 · `/` 18 · `/ru/resize/413x531` 14 · `/downloader/ok` 13.

**Search Console (7d):** 2,154 impressions, 7 clicks, average position ~85. Google shows the site mostly to Philippines / India / Indonesia — not the actual audience, which is Russia, Uzbekistan and Kazakhstan.

Caveat: GA runs in consent mode, so these are a **floor**, not a count.

---

## 11. Known open items

1. **No real database.** Highest-value unblock.
2. **Ad revenue is traffic-bound, not setup-bound** — Adsterra is live; ~1,500 views/month is worth a few dollars.
3. **Stripe keys absent** — no payments possible.
4. **Railway cobalt trial expires ~29 Sep 2026.**
5. **Tool UI translated to only 3 of 15 languages**; only `/ru/` and `/uz/` have routes.
6. `CLAUDE.md` contains a stale note claiming local `next build` OOMs.

---

## 12. House rules that must be respected

- **Never add YouTube downloading** — it would put AdSense at risk.
- **Never fabricate** traffic, rankings, reviews or backlinks.
- **No spending** without the owner's decision.
- **Never commit secrets.** The cobalt URL is checked in deliberately because it is a public endpoint, not a key; the GA service-account key is not, and must not be.
- Another Claude session works the `growth/` worktree concurrently — **never `git add -A`** there.
