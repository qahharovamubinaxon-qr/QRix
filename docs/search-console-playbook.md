# QRix — Search Console playbook

A weekly workflow for turning Search Console + GA into action. It reuses the
scripts already in the repo — no new tooling, no dashboards to babysit.

---

## The scripts you already have

| Command | Reads | Use for |
|---|---|---|
| `npm run kpi` | GSC Search Analytics (`scripts/gsc-kpi.mjs`) | impressions, clicks, CTR, avg position — the weekly numbers |
| `npm run inspect` | GSC URL Inspection (`scripts/gsc-inspect.mjs`) | is a specific URL indexed / why not |
| `npm run sitemap:ping` | GSC Sitemaps | resubmit the sitemap after a big change |
| `npm run ga:channel` | GA4 | which source lands on which page (found ChatGPT > Google) |
| `npm run aeo:audit` | live crawl | on-page regressions before they cost rankings |

## Weekly routine (~15 min)

1. **`npm run kpi`** — pull the week. Note total impressions, clicks, CTR, avg
   position. Compare to last week.
2. **Find the opportunities** — the four patterns worth acting on, in priority order:
   - **High impressions + low CTR** → the page ranks but the title/description do
     not earn the click. Rewrite the `title`/`desc` in the tool's registry entry.
   - **Position 4–20** → one page off the money. A stronger intro / FAQ / an internal
     link or two can push it onto page one. These are the best ROI.
   - **High impressions + position 8–15** → real demand, page too weak. Improve the
     on-page answer (the `intro` direct-answer block).
   - **Declining page** → was ranking, now slipping. Check for a regression with
     `npm run aeo:audit` and `npm run inspect <url>`.
3. **Fix at the source.** Titles/descriptions/FAQs live in the registries
   (`lib/*-tools-meta.ts`), not per-page. Edit the registry, the page and sitemap
   update together.
4. **Re-verify** — `npm run aeo:audit` before commit; `npm run sitemap:ping` after a
   structural change.

## Standing watch-items

- **Geo mismatch (open question).** Impressions skew to Philippines / India /
  Indonesia while the audience is Russia / Uzbekistan / Kazakhstan. hreflang and the
  language switcher were both ruled out. Next: read the *queries* those impressions
  come from in GSC — the query text will say whether it is wrong-country demand or
  wrong-intent matching.
- **Yandex.** Not connected. Yandex reportedly sends ~6× Google's traffic to this
  audience with zero optimisation. Connecting Yandex Webmaster is the single largest
  unclaimed measurement — it needs the owner's Yandex account.
- **AI referral.** Tag and watch `utm_source=chatgpt.com` in GA. It is currently the
  largest real channel; if it grows, weight AI-answer citability over Google tweaks.

## What NOT to do

- Do not chase every query. Act on the four patterns above; ignore the long tail of
  1-impression queries.
- Do not rewrite a page that ranks 1–3 — you can only lose.
- Do not add pages to "cover" a query the site already ranks for on an existing page.
