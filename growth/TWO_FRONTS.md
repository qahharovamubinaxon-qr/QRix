# Two fronts — Yandex for volume, Google for money

Written 2026-08-16, after the first read of real visitor data. Supersedes nothing
in SEO_STRATEGY.md; it answers the question that file could not: **where does the
next month of work go.**

## Why two fronts and not one

The owner's argument, and it is correct: **AdSense pays for the audience, not for
the pageview.** A thousand views from the United States or Germany are worth
roughly an order of magnitude more than a thousand from Uzbekistan or Russia —
the exact multiple moves with season and niche, but the gap is not 20%, it is
closer to 10×. So:

- **Yandex is where we can win visitors soon.** Weeks to months, not years.
- **Google is where those visitors would be worth money.** Years, unless we pick
  the right corner of it.

Abandoning either is wrong. Fighting them the same way is also wrong — the two
engines reward different things, and the biggest mistake available is to keep
aiming both at "remove background", where we sit at position 89 with 0 clicks.

## What the measurements actually say

- GA4 Aug 9–15: **10 users, 0 sessions from Google organic**, 5–6 from Yandex
  properties, 3 direct. Search Console: 2 clicks.
- **638 impressions and position 84** means Google shows us and nobody clicks —
  page 8 or 9. Not a penalty, not a content problem: an authority problem.
- **1 referring domain** (AlternativeTo, approved Aug 12). iLovePDF has six
  figures of them and a sixteen-year head start. That gap is not closable by
  writing better copy.

Already in place and worth building on rather than rebuilding: Yandex Webmaster
verification is live in the layout metadata, `app/ru/**` carries real Russian
routes (barcode, convert, downloader, resize, tools), the sitemap holds 837 URLs
of which 107 are Russian, and IndexNow pings on every publish.

---

# Front 1 — Yandex (target: first page in 2–4 months)

Yandex is winnable because it weighs things we can actually change. Backlinks
matter less than on Google; **behaviour and regional relevance matter more.**

## Y1. Region assignment — the single biggest lever, and it is owner-only

In Yandex.Webmaster, a site has a **region**. Without one, Yandex treats the site
as regionless and will not favour it for Uzbek or CIS users — which is exactly
the audience we have. Setting it is a few clicks and it changes which SERP we
compete in.

**Owner action:** webmaster.yandex.ru → the site → Информация о сайте →
Региональность → set **Узбекистан / Ташкент**. Then check Диагностика for
anything red.

Until this is done, everything else on this front is fighting uphill.

## Y2. Behavioural factors are the ranking signal

Yandex leans on how people behave in the SERP and on the page far more than
Google does: click-through from the results page, whether they come back to the
SERP, how long they stay, whether they return later. Practical consequences:

- **The tool must be usable above the fold.** A visitor who lands and sees an
  explanation before a file picker is a visitor who bounces back to Yandex, and
  Yandex counts that against us. This is already true on the tool templates —
  keep it true on every new Russian page.
- **Titles and descriptions are written for the Russian SERP**, not translated
  from English. "PDF в Word онлайн — бесплатно, без регистрации" earns a click;
  a translated "Convert PDF to Word" does not.
- Speed is a behaviour multiplier, not a separate score.

## Y3. Russian pages for the queries CIS users actually type

The owner's own searches are the evidence: `пдф то ворд`, `кркод ген`,
`пдф тоолс`, `имаге тоол`, `аи тоолс` — Latin tool names typed in Cyrillic. The
SERP for those is international sites with translated pages and no regional
signal. That is a weak defence.

Order of work, highest demand first:

1. `pdf в word` / `конвертер pdf в word` — we have the 1:1 converter, which is a
   genuinely better answer than most of that SERP
2. `сжать pdf` · `объединить pdf` · `разделить pdf`
3. `удалить фон с фото` · `фон для фото` — the tool that already earns 74% of our
   Google impressions, aimed where it can actually rank
4. `фото на документы` · `фото 3х4` — with the passport-photo engine and exact
   country specs
5. `генератор qr кода` · `qr код онлайн`

Rules that decide whether these work:
- **Not machine translation.** Yandex is good at detecting it and thin
  translated pages rank worse than nothing.
- One page per intent, the working tool on it, and the answer above the fold.
- Cross-link the Russian pages to each other. 107 Russian URLs that only link
  back to English pages leak every bit of internal authority.

## Y4. Regional and commercial signals

- **Yandex Business profile** (free): an organisation card with the real name,
  region and contact. It feeds regional relevance and costs nothing.
- Contact and About pages that show a real operator in a real place. The
  E-E-A-T work from M145 already put the operator identity on the site — make
  sure the Russian pages carry it too.

## Y5. Indexation

IndexNow already pings Yandex on publish, which is the fastest indexation channel
that exists. Verify in Webmaster that pages appear within a day; if they do not,
that is a Диагностика problem, not a content one.

**Yandex front, KPI gate:** 500 Yandex impressions/week and any query on page 1
by end of October.

---

# Front 2 — Google (target: first page on the long tail, not on head terms)

At one referring domain, **"pdf to word" is unwinnable and will stay unwinnable
for years.** Position 84 on those terms is not a failure to fix; it is the
correct current answer. The Google front is therefore about two things: the
corner of the index where DR does not decide, and the authority that eventually
opens the rest.

## G1. Stop targeting head terms. Target exact specifications.

The winnable Google query has three properties: it is specific enough that few
pages answer it exactly, it has real intent behind it, and we already have the
engine. Examples of the shape:

- `passport photo 35x45 mm white background online` — not `passport photo`
- `heic to jpg without app` — not `image converter`
- `id card scan a4 both sides one page` — the document scanner does exactly this
  and almost nothing else does

**We already have the strongest asset for this and have barely used it:**
passport and ID photo specifications by country, quoted from the issuing
authority. Five countries exist. Forty would be forty pages that each answer one
exact question, each with a working tool, each nearly uncontested. This is the
programmatic play that works at DR 0 because it does not compete with anyone —
it answers a question nobody else bothered to answer precisely.

## G2. Authority, which is the only thing that unlocks the rest

The list is in DIRECTORY_KIT.md: **18 directories that are do-follow AND free**,
six of them done. Finish the remaining twelve. Then the linkable asset already at
the top of the backlog — the "we tested 20 free QR generators" methodology page,
which is a thing other people cite rather than a thing we ask them to link to.

30 referring domains is the number that starts to move position. We have 1.

**Confirmed 2026-08-29** (growth/BACKLOG.md, `npm run inspect`, 38-URL stratified
sample): this is not a hypothesis any more. 24 of 38 sampled URLs are
unindexed and every one of them is "never crawled" by Google — not "crawled
and rejected", not "indexed but unranked". Whole families (convert, resize,
pdf-tools, barcode — including the /barcode hub itself, which has real
content and 13 internal links) came back 100% never-crawled in the sample.
Zero evidence of a content or ranking problem; all the evidence is a crawl-
budget/authority problem. This is the concrete number behind "the biggest
mistake available is more pages against this bottleneck" — don't build new
programmatic families until this moves.

## G3. Topical authority in one narrow place

185 shallow tools read to Google as a directory. Forty deep pages about document
photo requirements read as an authority on document photo requirements. Pick the
second. The tools stay; the *content investment* concentrates.

**Google front, KPI gate:** 30 referring domains and 5 long-tail queries in the
top 20 by end of November.

---

# Shared foundation — pays on both fronts

1. **Measurement.** `npm run ga` and `npm run kpi` are wired; read both weekly
   and write the window with the number. Consent defaults are region-scoped as of
   2026-08-16, so GA now counts the CIS audience properly.
2. **Telegram.** The channel and the bot are live and owe nothing to either
   search engine. This is the only channel where traffic can arrive tomorrow.
   Connecting the site's tools to the bot is the next build task.
3. **Speed.** Behaviour on Yandex, Core Web Vitals on Google. One investment.
4. **Backlinks.** Yandex counts them too, just less.

# What we are deliberately NOT doing

- **Product Hunt, for now.** Its link is no-follow, so it moves no authority, and
  a launch is one-shot: spent without an audience to mobilise, it is spent for
  nothing. Revisit when the Telegram channel can carry the first hours.
- **Paying for links.** Uneed, Toolify, There's An AI and LaunchBoard all sell
  placement. The free eighteen come first, and a paid link is a rule this project
  does not break.
- **Chasing "remove background" on Google.** Keep the pages, keep improving them,
  but stop counting their position as a scoreboard.
