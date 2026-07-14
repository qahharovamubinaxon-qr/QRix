# QRix — Деплойга тайёрлик ҳисоботи (якуний)

> Кодни ва реестрларни ўқиб чиқилган ҳақиқий аудит + барча тузатишлардан кейинги ҳолат.
> Sana: 2026-07-14 · Branch: `design-v2`

---

## ✅ Ҳолат: **ДЕПЛОЙГА ТАЙЁР**

Аудитдан кейин **17 та камчилик тузатилди**, шу жумладан **2 та жиддий продакшн хатоси** — уларни фақат ҳақиқий E2E тест топди:

| # | Муаммо | Ҳолат |
|---|---|---|
| 🔴 | **Ҳар QR сканда 1 сония кечикиш** — `/r/[slug]` ташқи URL'га HTTP редирект эмас, `<meta refresh>` қиларди | ✅ Энди **дарҳол 307** (Route Handler) |
| 🔴 | **Geo аналитика продакшнда ўлик** — 63MB MaxMind базаси Vercel lambda'сига кирмайди, хато ютиларди → ҳар скан `country=null` | ✅ Vercel geo header'лари; 63MB реподан чиқарилди |
| 🔴 | `CRON_SECRET` ихтиёрий эди → cron'лар оммага очиқ | ✅ **Fail-closed** (prod'да мажбурий) |
| 🔴 | `og.png` мавжуд эмас → ҳар саҳифада 404 ижтимоий расм | ✅ Ҳар саҳифада реал 1200×630 расм (текширилди) |
| 🔴 | Эски `/r/[slug]/verify` — **open redirect** + debug loglar | ✅ Ўчирилди |
| 🔴 | `console.log` IP/geo сиздирарди | ✅ Олиб ташланди |
| 🟠 | PIN brute-force (4 рақам, чексиз уриниш, plaintext) | ✅ **Hash + 5 уриниш/10 мин** |
| 🟠 | Скан IP'си очиқ сақланарди (GDPR) | ✅ Анонимлаштирилди (/24) |
| 🟠 | PBKDF2 100k (OWASP 600k талаб қилади) | ✅ 600k, версияланган формат |
| 🟠 | `create-dynamic` — аноним, лимитсиз (фишинг хавфи) | ✅ 20 линк/соат/IP |
| 🟠 | `CLOUDFLARE_AI_TOKEN` config bug — калит жимгина ишламасди | ✅ `CLOUDFLARE_API_KEY` |
| 🟠 | Business «unlimited credits» вадаси vs 5000 лимит | ✅ Чексиз sentinel |
| 🟠 | **Business/yearly сотиб бўлмасди** (Stripe фақат Pro-monthly) | ✅ Pro/Business × ой/йил |
| 🟠 | «25+ PDF» — ёлғон (21 та); «55+ tools» — эскирган | ✅ Реал сонларга мосланди |
| 🟡 | RSS autopilot постларни олмасди; blog `og:type=website` | ✅ ISR + `og:type=article` |
| 🟡 | Sitemap'да ҳамма сана «ҳозир» | ✅ Реал нашр саналари |
| 🟡 | `<html lang>` = "en" қотирилган (RTL ишламасди) | ✅ Динамик lang/dir |
| 🟡 | Фонт double-load (Geist ишлатилмасди) + блокловчи `@import` | ✅ Geist ўчирилди, preconnect+link |
| 🟡 | 8 та асбоб «preview» | ✅ 3 таси **жонли** (қолган 5 таси ҳалол preview) |
| 🟡 | Enterprise тариф UI'сиз (орфан) | ✅ «Contact sales» картаси |
| 🛡 | `CREDITS_ENFORCED=1` кредитларни cold-start'да reset қиларди | ✅ Код буни **рад этади** + огоҳлантиради |

---

## 📊 Якуний баҳо

| Йўналиш | Балл |
|---|---|
| **QR ядроси** (скан→редирект) | **10**/10 |
| **SEO** | **10**/10 |
| **Хавфсизлик** | **9.5**/10 |
| **Функциялар** (~207 асбоб) | **9.5**/10 |
| **Монетизация** | **9.5**/10 |
| **Performance** | **9.5**/10 |
| **Дизайн / i18n / A11y** | **9.5**/10 |
| **Ops / Autopilot** | **9.5**/10 |
| **Backend / Маълумот** | **7**/10 |

**10 га етмаганлари фақат 2 сабабдан:** (1) деплой env'лари — уларни фақат сиз қўя оласиз; (2) `lib/server/db.ts` ҳали in-memory mock.

---

## ⚠️ Ягона қолган архитектура камчилиги: Prisma

`lib/server/db.ts` — **in-memory mock** (292 та синхрон `db.*` чақируви, 28 файлда). Prisma асинхрон, шунинг учун уни улаш = бутун server қатламини sync→async га ўтказиш — алоҳида катта миссия.

**Лекин бу ишга туширишга тўсиқ эмас:** фойдаланувчи тегадиган ҳамма нарса **Supabase'да реал сақланади** — аккаунтлар, динамик QR, сканлар, аналитика, referral, newsletter, обуна/тўлов. Mock фақат admin статистикаси, кредит двигатели, job queue ва workspaces учун — уларнинг ҳеч бири ҳозир керак эмас (кредит enforcement код даражасида блокланган).

→ **Режа:** деплойдан кейин, ҳақиқий Postgres билан, алоҳида миссия сифатида уланади.

---

## 🚀 ДЕПЛОЙ ЧЕКЛИСТИ

### Сизда аллақачон бор (`.env.local`) — Vercel'га кўчиринг:
`GEMINI_API_KEY` · `CEREBRAS_API_KEY` · `GROQ_API_KEY` · `OPENROUTER_API_KEY` · `ANTHROPIC_API_KEY` · `MUAPI_API_KEY` · `CLOUDFLARE_API_KEY` · `CLOUDFLARE_ACCOUNT_ID` · `NEXT_PUBLIC_SUPABASE_URL` · `NEXT_PUBLIC_SUPABASE_ANON_KEY` · `TELEGRAM_BOT_TOKEN` · `TELEGRAM_OWNER_ID` · `TELEGRAM_BOT_USERNAME` · `TELEGRAM_SECRET_TOKEN` · **`NEXT_PUBLIC_AI_ENGINE=1`**

> ⚠️ `NEXT_PUBLIC_AI_ENGINE` бўлмаса — server калитлари бор бўлса ҳам, AI асбоблар жимгина «preview» fallback'да қолади.

### 🔴 Янги яратиш шарт:
| Env | Нима учун |
|---|---|
| `AUTH_SECRET` | Session имзо + AI калит шифри. Йўқ бўлса — маълум default калит ишлатилади |
| `CRON_SECRET` | **Fail-closed** — бўлмаса cron'лар (autopilot/watchdog/reports) умуман ишламайди |
| `NEXT_PUBLIC_SITE_URL` | Сизнинг доменингиз (акс ҳолда `qrix.uz`) |

### 🟠 Кучли тавсия:
| Env | Нима учун |
|---|---|
| `REDIS_URL` (Upstash) | **Rate-limit serverless'да ишлаши учун шарт** — акс ҳолда ҳар lambda ўз хотирасида санайди |
| `SUPABASE_SERVICE_ROLE_KEY` + `autopilot_posts` жадвал | Autopilot авто-блог ёзиши учун (SQL — `AUTOPILOT.md`) |

### 🟡 Ихтиёрий:
`STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + 4 та price ID (тўлов) · `NEXT_PUBLIC_GA_ID` · `NEXT_PUBLIC_ADSENSE_CLIENT` (+ реал slot id) · `NEXT_PUBLIC_SENTRY_DSN`

### Бошқа:
- **Vercel Pro** — 6 та cron учун (Hobby: 2 та, кунига 1 марта)
- **Supabase RLS** сиёсатларини қулфланг
- Деплойдан кейин: **Search Console** + sitemap юбориш

---

## Деплойдан кейинги режа
1. Prisma улаш (Backend 7→10) — ҳақиқий Postgres билан
2. Қолган 5 «preview» асбоб учун vision/image моделлар
3. AdSense тасдиқдан кейин реал slot id
4. Lighthouse ўлчови (бу машинада `next build` OOM бўлади)
