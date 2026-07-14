# QRix — Деплойдан олдинги тўлиқ ҳисобот (Pre-Deploy Audit)

> 8 йўналиш бўйича кодни ва реестрларни ўқиб чиқилган **ҳақиқий** аудит (progress.md эмас, кодниг ўзидан). Sana: 2026-07-14. Branch: `design-v2`.

---

## 0. Умумий хулоса

QRix — **жуда етук, production даражасидаги** платформа: ~207 та ишлайдиган асбоб, чуқур SEO (471 sitemap URL, 15 тил), мустаҳкам хавфсизлик қатлами, autopilot ўсиш двигатели. **Асосий қиймат (браузерда ишлайдиган on-device асбоблар) деплойга тайёр.**

Лекин деплойдан олдин **бир нечта муҳим нарса** бор: (1) `AUTH_SECRET` ва `CRON_SECRET` мажбурий ўрнатилиши шарт, (2) битта бузуқ `og.png` (SEO расм) бутун сайтда 404, (3) эски `verify` route'да open-redirect + debug loglar, (4) маълумотлар қатлами ҳозирча mock (Supabase бор жойлар реал). Буларни тузатсак — тўлиқ тайёр.

**Тавсия:** аввал қуйидаги «🔴 Критик» рўйхатни тузатамиз (~1 иш куни), кейин деплой. Ёки хоҳласангиз ҳозир деплой қилиб, параллел тузатамиз.

---

## 1. 🧰 Асбоблар инвентари (ҳақиқий санаб чиқилган)

| Категория | Сони | Изоҳ |
|---|---|---|
| **QR турлари** (payload) | **32** | url, wifi, vcard, upi, gs1, paypal, bitcoin, event… |
| **QR генератор саҳифалари** | **31** | `/qr-tools/[slug]` (SSG) |
| **AI асбоблар** | **28** | 23 live · 5 preview |
| **Видео асбоблар** | **30** | 28 live · 2 preview |
| **Расм асбоблар** | **89** | 7 асосий + 82 kengaytma |
| **PDF асбоблар** | **21** | merge/split/ocr/sign/redact… |
| **3D асбоб** | **1** | image-to-3d (GLB/OBJ/STL/USDZ) |
| **Barcode** | **1 асбоб / 9 формат** | CODE128, EAN13, UPC… |
| **Алоҳида QR асбоблар** | **6 (+scanner=7)** | bulk-qr, animated-qr, qr-art, decode, poster, link-in-bio |
| **🎯 ЖАМИ** | **~207 (scanner билан 208)** | |

**Preview (мок) асбоблар — 8 та:** 5 AI (colorize-photo, remove-objects, image-description, translator, image-generator), 2 видео (reverse-video, subtitle-translator), 1 расм (remove-watermark). Қолгани тўлиқ ишлайди (on-device).

---

## 2. 🔳 QR имкониятлари (рақобатчилардан устун)

- **Динамик QR + redirect** (`/r/[slug]`): Supabase `dynamic_links`, скан ҳисоблагич, http(s) хавфсизлик текшируви.
- **Скан аналитикаси**: ҳар сканда 8 майдон — user-agent, IP, браузер, OS, қурилма, давлат, шаҳар (MaxMind GeoLite2, 65MB).
- **Аналитика dashboard**: жами скан, давлатлар, қурилма/браузер тақсимоти, кун бўйича график, охирги сканлар.
- **PIN ҳимоя**: 4–10 рақамли PIN, ҳимояланган динамик ссилка.
- **Design Studio**: 6 dot услуб, 3+2 кўз-шакл, linear/radial градиент, лого, L/M/Q/H — **PNG/SVG/PDF** экспорт.
- **SCAN-ME frame** (CTA), **Bulk CSV** (JSZip), **AI QR Art** (Cloudflare Flux, 6 услуб, 3 формат).
- **Anti-quishing decoder**: линкни очишдан олдин 7 хавф текшируви (14 shortener, 12 бренд-сохта, IP-host, punycode…) — **ҳеч кимда йўқ**.
- **GS1 Digital Link + UPI** QR, **конверсия UTM attribution**.

---

## 3. 🏗️ Backend ва архитектура

- **32 та `lib/server` модул**: config, db, auth, api, security, cache, storage, queue, billing, credits, email, cms, api-keys, analytics, webhooks, workspaces, monitor, autopilot, providers/{ai,video,image}, telegram/*.
- **53 route файл / 81 HTTP handler**; `/api/v1/**` (60) + эски route'лар (21) + 4 cron.
- **Prisma схема**: 31 модел, 6 enum (PostgreSQL учун тайёр).
- **Admin панел** (`/admin`): 16 GET бўлими (users, subs, payments, posts, credits, workspaces, status…).
- **AI Provider Manager**: 17 адаптер (11 бепул), бепул fallback занжири (gemini→groq→openrouter→cloudflare→cerebras…), rate-limit cooldown, response cache, per-provider health/cost, AES-GCM калит шифрлаш.

---

## 4. 🔒 Хавфсизлик

**Кучли томонлар:** dual auth (Supabase/mock), 4 provider (credentials+google+github+magic-link), PBKDF2 паролллар, RBAC (5 роль × 8 модул × 5 амал), rate-limiting (12 override), 7 хавфсизлик header (HSTS, CSP, X-Frame…), 3 webhook имзо механизми (Stripe/Telegram/outbound HMAC), GDPR Consent Mode v2 (4 сигнал = denied), API калитлар (SHA-256 hash, scope). **Жуда яхши қатланган.**

**⚠️ Деплойдан олдин эътибор:**
- 🔴 `AUTH_SECRET` ўрнатилмаса — public default `dev-insecure-secret-change-me` ишлатилади (session имзо + AI калит шифри шу маълум калитдан). **Мажбурий кучли қиймат керак.**
- 🔴 `CRON_SECRET` ихтиёрий (`if(secret && …)`) — ўрнатилмаса ҳамма cron (autopilot/cleanup/watchdog) оммага очиқ. **Мажбурий қилиш керак.**
- 🟠 PIN brute-force: rate-limit йўқ, PIN plaintext сақланади, 4 рақам = 10k комбинация.
- 🟠 Эски `app/r/[slug]/verify/route.ts` — **open-redirect** (http(s) текшируви йўқ) + debug loglar. **Ўчириш керак.**
- 🟠 `console.log`лар prod йўлларда IP/geo сиздиради (`/r`, `/pin/verify`).
- 🟠 `create-dynamic` аноним ссилка яратишга рухсат беради (фишинг redirect qrix доменида) + rate-limit йўқ.
- 🟡 Serverless'да in-memory rate-limit lambda'лар аро бўлинмайди → Redis керак.
- 🟡 Supabase RLS сиёсатлари қулфланганини тасдиқланг (anon client `qr_scans`/`dynamic_links`га ёзади).

---

## 5. 🔍 SEO

- **471 sitemap URL** (Supabase off): 225 use-case + 61 blog + 185 асбоб/hub/legal/help/docs.
- **60 static blog** пост + **autopilot AI auto-blog** (10 мавзу, кунига 1).
- **210 локализация саҳифа** (14 мавзу × 15 тил) + 15 hub — тўлиқ hreflang, HowTo/FAQ/Breadcrumb LD.
- pageMeta: canonical + OpenGraph + Twitter + robots; 8 хил JSON-LD; RSS; generated OG/icon/manifest.

**⚠️ Тузатиш:**
- 🔴 **Бузуқ `og.png` бутун сайтда**: `pageMeta()` `${SITE_URL}/og.png`га ишора қилади, лекин `public/og.png` **йўқ** → ҳар асбоб/blog/use-case саҳифа 404 og:image рекламалайди. **Осон тузатилади** (override олиб ташлаш ёки реал og.png қўшиш).
- 🟠 **Эскирган асбоб сонлари**: metadata'да "25+ PDF", "55+ tools", "187 tools", "72 image" — ҳеч бири реал эмас (реал: 32 QR, 21 PDF, 89 расм, 28 AI, 30 видео). Бир хиллаштириш керак.
- 🟡 RSS autopilot постларни ўз ичига олмайди; blog OG `type=website` (article эмас).

---

## 6. 💰 Монетизация

- **4 тариф** (server): Free $0 · Pro $5/$48 · **Business $49/$490 (энди ЧЕКСИЗ)** · Enterprise $199/$1990.
- **Credit engine**: Free 60 / Pro 1000 / Business 5000 / Ent 50000 (кунлик; `CREDITS_ENFORCED` off = фақат ҳисоблаш).
- **Referral** (реал, Supabase): ҳар томонга 50 кредит. **Newsletter** (реал). AdSense (env-gated, 2 жой).

**⚠️ Тузатиш:**
- 🟠 Реал Stripe checkout **фақат Pro-monthly** сотади — yearly ва Business/Enterprise сотиб бўлмайди. Business CTA `/register`га link, checkout'га эмас.
- 🟠 Stripe webhook фақат `pro`/`free` беради — Business/Enterprise'ни ҳеч қачон фаоллаштирмайди.
- 🟡 Business "чексиз AI кредит" деб рекламаланади, лекин `PLAN_CREDITS.BUSINESS=5000` (enforcement ёқилса зид келади).
- 🟡 AdSense placeholder slot `0000000000` — тасдиқдан кейин реал slot id қўйиш.

---

## 7. 🌍 Тиллар / UX / Performance

- **15 тил** UI (`SITE_LANGS`), 2 RTL (ar, ur); SEO ҳам 15 тил.
- Дизайн токенлар (globals.css + design-v2.css), **реал палитра оранж #ff4d1c / қора / яшил** (CLAUDE.md'даги "neon-yellow" эскирган).
- MotionLayer (GPU, zero-dep), **prefers-reduced-motion 3 қатламда**, 123 aria-label, "performance mode" тугмаси, 45 lazy `dynamic()` engine.

**⚠️ Тузатиш:**
- 🟡 Эски `lib/i18n.ts` дрейф қилган: ko/it ортиқча, 6 реал тил (hi, pt, id, tr, ur, bn) йўқ.
- 🟡 `<html lang="en">` қотириб қўйилган; фонтлар икки марта юкланади (Geist next/font + 8 Google @import) — Lighthouse'га зарар. Керакмас фонтларни (SUSE) олиб ташлаш.
- 🟢 CLAUDE.md'ни янгилаш (палитра + display font = Bricolage Grotesque).

---

## 8. 🤖 Autopilot / Ops

- **Auto-blog** (`/api/cron/autopilot`): 10 мавзу, кунига 1 SEO мақола, сифат назорати (≥3 бўлим, ≥2 FAQ), Supabase → blog/sitemap ISR.
- **Health watchdog** (`/api/cron/watchdog`, 6 соатда) → Telegram огоҳлантириш.
- **Telegram** (5 модул): owner бот, кунлик/ҳафталик/ойлик ҳисобот. **Monitoring**: 8 тизим, `/api/health` + `/api/ready`.
- **6 Vercel cron** (`vercel.json`).

**⚠️ Config bug:** `config.ts` `CLOUDFLARE_AI_TOKEN`ни ўқийди, лекин реал адаптер `CLOUDFLARE_API_KEY`ни ишлатади — мослаш керак.

---

## 9. 🚀 ДЕПЛОЙ ЧЕКЛИСТ (Vercel env)

| Env | Нима учун | Йўқ бўлса |
|---|---|---|
| 🔴 `AUTH_SECRET` | Session + AI калит шифри | Хавфсизлик тешиги; `/api/ready` 503 |
| 🔴 `CRON_SECRET` | Cron ҳимояси | Cron'лар оммага очиқ |
| 🔴 `NEXT_PUBLIC_SUPABASE_URL` + `ANON_KEY` | Динамик QR, auth, referral, autopilot | Аккаунт/аналитика/autopilot ишламайди |
| 🟠 `CEREBRAS_API_KEY` · `CLOUDFLARE_API_KEY` · `CLOUDFLARE_ACCOUNT_ID` | Бепул AI (auto-blog + AI расм) | AI асбоблар mock'га тушади |
| 🟠 `SUPABASE_SERVICE_ROLE_KEY` + `autopilot_posts` жадвал | Auto-blog ёзиш | Autopilot ҳеч нима чоп этмайди |
| 🟠 `TELEGRAM_BOT_TOKEN`/`OWNER_ID`/`USERNAME`/`SECRET_TOKEN` | Огоҳлантириш + ҳисобот | Alert/report jim |
| 🟡 `DATABASE_URL` | Доимий маълумот (Prisma) | In-memory mock (cold-start'да reset) |
| 🟡 `STRIPE_SECRET_KEY` + `WEBHOOK_SECRET` + price id'лар | Реал тўлов | Mock billing |
| 🟢 `NEXT_PUBLIC_GA_ID` · `ADSENSE_CLIENT` · `SENTRY_DSN` | Аналитика/реклама/хато | Уйқуда (зарар йўқ) |

**Vercel плани:** 6 та sub-daily cron **Vercel Pro** талаб қилади (Hobby: 2 cron, кунига 1). Pro бўлмаса — ташқи scheduler.

---

## 10. ⚠️ ДЕПЛОЙДАН ОЛДИН ТУЗАТИШ (устувор)

**🔴 Критик (деплойдан олдин):**
1. `AUTH_SECRET` + `CRON_SECRET` — мажбурий (fail-closed) қилиш + Vercel'да ўрнатиш.
2. Бузуқ `og.png` — тузатиш (pageMeta override олиб ташлаш ёки реал расм).
3. Эски `app/r/[slug]/verify/route.ts` — ўчириш (open-redirect + debug log).
4. Prod йўллардаги `console.log`ларни (IP/geo) олиб ташлаш.

**🟠 Тавсия (тезда):**
5. Эскирган асбоб сонларини бир хиллаштириш (real: ~207).
6. `create-dynamic`'га rate-limit + (керак бўлса) аноним ссилкани чеклаш.
7. `CLOUDFLARE_AI_TOKEN` → `CLOUDFLARE_API_KEY` config'ни мослаш.
8. Business "unlimited credits" вадаси vs 5000 — мослаш (yoki чексиз белги).

**🟡 Кейинроқ:**
9. Real DB (Prisma repository'ларни ulash) — доимийлик учун.
10. Stripe: Business/yearly checkout'ни улаш.
11. Эски `lib/i18n.ts` тозалаш; фонт double-load; `<html lang>` динамик.

---

## Хулоса

Сайт **90% деплойга тайёр**. On-device асбоблар, SEO, дизайн, autopilot — ҳаммаси кучли. Юқоридаги **🔴 4 та критик** нарса тузатилса ва деплой env'лари ўрнатилса — ишончли ишга туширса бўлади. Қолган 🟠/🟡 лар деплойдан кейин ҳам тузатилиши мумкин.
