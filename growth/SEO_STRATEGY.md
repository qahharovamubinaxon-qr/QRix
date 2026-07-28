# QRix SEO Strategy — the road to 100,000 visits/day

Owner goal: top-1 rankings in the niche, 100k visits/day. This file is the
single source of direction for every growth session. Read it at startup; pick
work that serves the CURRENT PHASE. Update the baseline block weekly (Friday
KPI snapshot). Written 2026-07-28 off the M142 seven-agent audit.

## Baseline (2026-07-28 — be honest, update weekly)

- Traffic: ~13 visitors/day (Vercel Analytics, 30d: 134 visitors, half of it us)
- GSC: 362 impressions/wk (+66% WoW), 2 clicks, avg position ~75
- Yandex = 70% of referral traffic; UZ users view ~11 pages/visit (stickiest)
- 801 sitemap URLs; sitemap re-read by Google Jul 22 (was stuck at 526)
- Audit Health Score 72/100 (technical 84 · SXO 83 · GEO 79 · schema 78 ·
  perf-lab 78 · sitemap 62→fixed · content 41→M143 fixed the fabrications)
- Referring domains: ~0. This is the binding constraint on everything.

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
