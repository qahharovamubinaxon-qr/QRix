# QRix SEO Strategy — the road to 100,000 visits/day

Owner goal: top-1 rankings in the niche, 100k visits/day. This file is the
single source of direction for every growth session. Read it at startup; pick
work that serves the CURRENT PHASE. Update the baseline block weekly (Friday
KPI snapshot). Written 2026-07-28 off the M142 seven-agent audit.

## Baseline (2026-08-16 — the first time we could count VISITORS)

`npm run ga` reads GA4 now. The question "how many people come a day" has an
answer for the first time, and it is small.

- GA4 7d (Aug 9–15): **10 users · 21 sessions · 45 page views** — ~**1.4 users a
  day**. The week before was 19 / 31 / 139.
- **Not one session came from Google organic.** The sources are: direct (3),
  yandex.ru, ya.ru, yandex.uz, tv.yandex.com, yandex/organic (5–6 between them),
  baidu/organic (1). Google contributed nothing, which agrees with Search
  Console's 2 clicks and settles a long argument: **for this site today, Yandex
  is the only search engine sending anyone at all.**
- Uzbekistan shows 2 users but 12 of the 21 sessions, and /admin and /dashboard
  each appear — that is the owner. Strip it and the outside world is under 10
  people a week.
- Most-opened after `/`: **/document-scanner** (2 users, 8 sessions). The newest
  tool is the one being looked at.
- Caveat that must ride with every one of these numbers: `analytics_storage`
  defaults to DENIED until someone accepts the cookie banner, so GA4 is
  reporting consent-mode data. These are a **floor**, not a ceiling.

**What this changes.** Every SEO decision so far optimised for Google, where the
site earns 2 clicks a week and 0 GA sessions. The only measurable search traffic
is Yandex. Sample of 10 is too small to bet the roadmap on — but it is the first
evidence we have ever had, and it points the opposite way to where the work went.

## Baseline (2026-08-12 — third read, and it corrects the second)

- GSC 7d (Aug 4–10): **638 impressions · 2 clicks · avg position 83.8** — the
  week before was 1,916 / 3 / 83.5. **Impressions fell 67%.**
- **Position did not move** (83.5 → 83.8). That is the whole story: nothing was
  demoted, Google simply stopped showing us as often. A ranking penalty moves
  position; this moved frequency. It is the shape of a new-site burst decaying —
  the 11 remove-background pages shipped Aug 7, drew a spike, and are now being
  re-evaluated at a lower rate.
- 293 distinct queries across 38 pages, down from 513 / 51.
- /image-tools/remove-bg is still the whole business: 688 of 638… i.e. the
  page-level rows sum higher than the site total because GSC drops anonymised
  queries from grouped rows. Treat grouped sums as shape, not as totals.
- **Clicks are the number that matters and it is 2 per week.** From Google, the
  site receives roughly zero visitors a day.

**Correction to the 2026-08-11 entry below.** It recorded 1,460 impressions and
read as growth. That was a genuine reading of a window ending Aug 9, taken
mid-UTC-day; the window ending Aug 10 is 638. Both are real, the trend is down,
and the earlier entry should not be quoted as evidence of improvement. Lesson for
whoever reads this next: `npm run kpi` prints the window it used — quote it with
the number, or the number means nothing.

## Baseline (2026-08-11 — second read)

- GSC 7d: **1,460 impressions · 4 clicks · avg position 85.1** — the read four
  days earlier was 1,270 / 1 / 78.8. Clicks went 1 → 4, which is still noise,
  but it is the first week with more than one.
- **513 distinct queries across 51 pages.** Pages earning an impression went
  67 → 51 while queries went 599 → 513: the long tail thinned, and what is left
  is more concentrated, not broader.
- `/image-tools/remove-bg` alone is **1,076 of 1,460 impressions (74%)** at
  position 89.2 and zero clicks; `/image-tools/passport-photo` adds 137 (9%).
  The concentration got *worse*, not better — 83% from two pages.
- Position drifting 78.8 → 85.1 is the same dilution as before: nothing lost
  rank, more deep pages started surfacing.
- USA is 335 impressions of 1,460. The RU/UZ thesis remains a **Yandex** thesis.
- First backlinks landed this week: AlternativeTo (in review) and Startup Fame
  (submitted, badge live). Neither can show in these numbers yet.

**What to watch next read:** whether remove-bg's position moves off 89 at all.
Impressions rising while position sits at 89 means Google is testing the page
and nobody is seeing it. That is a link problem, not a content problem, which
is exactly what the directory work is for.

## Baseline (2026-08-07 — first read from the API, not the UI)

`npm run kpi` reads Search Console directly now (M147c), so these are measured,
not pasted, and the weekly snapshot no longer depends on the owner.

- GSC 7d (Jul 29–Aug 4): **1,881 impressions · 3 clicks · CTR 0.16% · avg
  position 84.1** — prior 7d was 1,100 / 1 / 70.2. 28d: 3,923 / 6 / 77.4.
- Impressions +71% WoW. Average position got WORSE (70 → 84) and that is
  dilution, not decline: more pages started surfacing, all of them deep.
- **599 distinct queries, but only 67 pages earn a single impression** out of
  ~810 URLs. Coverage, not ranking, is still the first constraint.
- **Demand is concentrated in two pages that are not QR pages:**
  /image-tools/remove-bg 1,215 imp (65% of everything, pos 88.6, 0 clicks) and
  /image-tools/passport-photo 278 imp (15%, pos 84.3, 0 clicks). 79% from two.
- Top queries are all one family: "remove background" (58), "background
  remover" (39), "remove background online" (36), "passport photo online" (45)
  — every one at position 82–92, i.e. page 9. Shown, never seen.
- Countries by impressions: USA 386 · GBR 80 · PAK 64 · RUS 64 · BGD 56 ·
  TUR 50 · KEN 47 · CHE 42. Google's demand is English-first; the RU/UZ thesis
  is a **Yandex** thesis and should not be confused with this.
- The only click-earning page is `/` on the brand query "qrix" (pos 4.8).
- Referring domains: ~0. Still the binding constraint on position.

### What this first read changed

The site was built QR-first and expanded RU/UZ-first. Google's actual demand is
English background-removal and passport photos, on two tools that already work.
That is not a reason to abandon QR — Yandex and direct traffic behave
differently — but it means the demand-verified expansion (P2) has a clear first
target, and it is not where the last twenty missions went.

Head terms in that family (remove.bg, Canva, Adobe own them) are not winnable at
0 referring domains. The winnable shape is the long tail *inside* the two
families that already surface: passport/visa photo by country and size, and
background removal by subject (signature, product, logo, portrait). Both have a
real tool behind them already, which is the rule for any new page here.

## The honest math

100k/day ≈ 3M visits/month. No 800-page site ranks its way there on content
alone — every comparable free-tools property that reached this scale did it
with (a) 10k+ indexed long-tail pages, (b) real domain authority (100+
referring domains), and (c) 30–40% of traffic from NON-Google channels
(Telegram, Bing/Yandex, embeds, direct repeat use). Programmatic pages are
already our strength; authority and distribution are the gaps. Rank position
without authority plateaus at page 3–8 — exactly where we sit at position 75.

## Phases — work the current one, don't skip ahead

**P0 · Foundation (now → mid-Aug).** Everything indexed and honest.
Ship: index coverage of all 801 URLs (monitor GSC "Indexed" weekly), CWV ≥90
mobile on the 5 template types, author/entity E-E-A-T (real operator identity,
bylines, dates), the remaining M142 findings, internal-link depth ≥6 per page.
KPI gate to P1: 500+ indexed · 5k impressions/wk · CWV green.

**P1 · Authority (Aug → Sep).** Become citable.
Ship: 2–3 more linkable assets in the /qr-code-statistics mold (the "we tested
20 generators" methodology page first — it is already our boldest claim),
every free directory/catalog listing, Product Hunt launch (Aug 5 task
scheduled), embed-widget adoption (each embed = a backlink). Owner-gated:
outreach, guest posts. KPI gate: 30+ referring domains · 50k impressions/wk ·
first page-1 long-tail rankings.

**P2 · Scale what ranks (Sep → Nov).** Demand-verified expansion only.
Read GSC queries weekly; deepen ONLY families with impressions. Add ES/TR/ID
twins for families that already earn RU/UZ traffic. No new pages for keywords
nobody has searched yet. KPI gate: 5k clicks/day from search.

**P3 · Compound (Nov → Dec).** The last 10x is mostly non-Google.
Telegram bot inline loop (live), widget distribution, Bing+Yandex (IndexNow
already instant), AI-search citations (llms.txt + stats pages already strong).
Target mix at 100k/day: Google ~40k · Yandex+Bing ~20k · Telegram/direct ~25k
· AI-search/other ~15k.

## Weekly rhythm (automated by the growth worker)

- **Mon (first session):** full audit — parallel agents seo-technical,
  seo-content, seo-schema, seo-sitemap, seo-performance, seo-geo, seo-sxo over
  the live site incl. the newest shipped pages. Diff vs growth/AUDIT_LAST.md;
  new findings become ranked BACKLOG items; scores logged to DAILY_LOG.
- **Daily (first session of each UTC day):** verify pass — the 10 newest
  shipped URLs return 200 with self-canonicals; robots.txt still serves /p$;
  sitemap count sane; IndexNow any delta. One DAILY_LOG line.
- **Fri (first session):** KPI snapshot into this file's Baseline block +
  DAILY_LOG (impressions, clicks, position, indexed count if available,
  referring domains if known, visitors/day).
- **Every session:** ship the top BACKLOG item that serves the current phase.

## Standing rules (inherited, non-negotiable)

Never fake traffic, backlinks, reviews, or stats — fabrications are deleted on
sight (M143). No YouTube downloading. No paid spend — [B] items wait for the
owner. Every page ships with a working tool, unique copy, JSON-LD, sitemap +
IndexNow. Demand-verified expansion only from P2 onward.
