# QRix — SEO / AEO roadmap

**Written 13 Sep 2026 from Google Search Console, Yandex Webmaster and Vercel
Analytics — not from assumptions.** Companion documents:
[SEO_KEYWORD_MAP.md](SEO_KEYWORD_MAP.md) (every query with its real position),
[SEO_CHANGELOG.md](SEO_CHANGELOG.md), and the earlier
[aeo-audit.md](aeo-audit.md) / [AEO-PLAYBOOK.md](AEO-PLAYBOOK.md).

---

## Executive summary

**What was already right.** The technical layer is not the problem and has not
been for weeks: 851 URLs, 0 P0 and 0 P1 findings, title/description/canonical/
structured data on every page, correct reciprocal hreflang, a registry-driven
sitemap, `/api/og` unblocked, one BreadcrumbList per page, `llms.txt` current.
That work is done and verified live.

**What is actually wrong.** Google shows QRix 13,600 times and sends 35 clicks.
Average position **82.6**. Outside the brand term the site has **nothing between
positions 11 and 30** — the band every "quick win" playbook targets. The largest
impression cluster (background remover, ~1,100 impressions) sits at position
85–97 against remove.bg, Canva and Adobe, and has produced one click in two
months.

**So the diagnosis is not "SEO needs improving".** On-page quality stopped being
the binding constraint some time ago. The binding constraint is that **nothing
outside this domain references it** — no citations, no listings, no links — so
Google has no reason to promote any page past page 8. That is a distribution
problem, and it cannot be fixed by editing pages.

**Where the site does work.** Yandex converts roughly 30× better per impression,
on a tight CIS cluster (Russian passport photos, OK.ru/VK downloads), and
ChatGPT is the single largest referrer in Vercel Analytics. The audience QRix
actually serves is CIS/Russian-speaking and AI-referred, not English Google.

---

## Scores, before → after

Honest ranges, not invented precision.

| | Before | After | Why |
|---|---|---|---|
| Technical SEO | 9/10 | 9/10 | Already clean; nothing to fix this round |
| On-page (tool pages) | 8/10 | 8.5/10 | `/bulk-qr` was the outlier and is fixed |
| AEO / answer-engine readiness | 8/10 | 8.5/10 | +7 FAQ answers, HowTo, WebApplication on `/bulk-qr` |
| **Off-site authority** | **2/10** | **2/10** | **Unchanged — and this is the whole problem** |
| Search performance (Google) | 1/10 | 1/10 | 35 clicks / 13.6K impressions; will not move from code |

The only score that matters right now is the one no code change can raise.

---

## What changed this round

### `/bulk-qr` — rebuilt (`docs/SEO_CHANGELOG.md` has the diff)

Chosen on evidence, not taste: GSC puts it at **position 70.3 on "bulk qr code
generator" (45 impressions)** and 68.6 on "bulk qr code" — its best reachable
non-brand target — while it was simultaneously the site's **thinnest page**.

| | Before | After |
|---|---|---|
| H1 | "Bulk QR **Generator**" | "Bulk QR **Code** Generator" — the words the query uses |
| Words | 479 | 1,442 |
| H2 sections | 0 | 5 |
| FAQ | none | 7 real questions, rendered *and* in `FAQPage` |
| Structured data | none | WebApplication + BreadcrumbList + HowTo(4) + FAQPage(7) |
| Internal links out | 1 ("Back to home") | 6 contextual QR links |

Every claim is checked against the code: 512×512 PNG, error-correction level H,
five dot styles, colour, zipped client-side. The tool still renders first; the
prose sits below it.

---

## The plan, in priority order

### 1. Off-site authority — the only thing that moves Google now
Nothing else on this list matters as much. Concrete, already drafted in
[outreach-copy.md](outreach-copy.md):
- **Product Hunt launch** — the one Tier-1 channel still open (AlternativeTo,
  SaaSHub and Yandex Webmaster are already done — verified, not assumed).
- A few more AlternativeTo "alternative to" relations on high-traffic pages
  (TinyPNG, remove.bg, QRCode Monkey).
- A genuine Habr / VC.ru write-up for the CIS audience.
Owner-gated: these need accounts and a human submitting them.

### 2. Serve the audience that already converts
Yandex + ChatGPT, not English Google. The Russian passport-photo page
(`/ru/passport-photo/russia`, shipped 11 Sep) is the template: a real query,
a sourced answer, in the language it is typed in.

### 3. One missing page worth building
**Contactless menu QR** — position 49.5 on 17 impressions with *no dedicated
page*. The only clear content gap in the data; everything else has a page.

### 4. Leave the background-remover cluster alone
1,100 impressions at position 85–97. It looks like the biggest opportunity and
is the biggest trap: the gap to page 1 is authority against remove.bg and Adobe,
not copy. Revisit once #1 has produced results.

### 5. `pdf to word` is not the flagship
It draws **zero impressions** — it is not in the top 1,000 queries. The page is
good; the demand has not arrived. Optimising it further is effort spent on a
keyword Google does not yet associate with this site.

---

## Measurement

- **Google:** Search Console → Performance → add the *Position* metric. The
  number to watch is average position on the QR cluster, not total impressions.
- **Yandex:** Webmaster → Сводка → Популярные запросы. Currently the honest
  growth signal.
- **AI referrals:** Vercel Analytics → Referrers (`chatgpt.com` is #1 today).
- **Re-run:** `npm run aeo:audit` before any deploy; it exits non-zero on P0.

## Risks, stated plainly

- **No guarantee of rankings.** Position depends on competition, backlinks and
  domain history. The honest goal is raising the probability, not promising a
  place.
- **Authority work is slow.** Directory listings and a Product Hunt launch move
  the needle over months, not days.
- **Downtime is the biggest measurable enemy so far.** Two outages in September
  cost ~65 % of weekly visitors and made Yandex drop 16 pages; keeping the site
  up beats every optimisation on this page.
