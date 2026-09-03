# AEO implementation report

**2–3 September 2026.** Everything below was measured against production. Where
something was not verified, it says so.

---

## Before

The site was in far better AEO shape than an audit brief would assume, and the
honest headline is that most of the work had already been done by previous
missions: `pageMeta()` covering every page, registry-driven sitemap, JSON-LD
helpers, localised routes with reciprocal hreflang.

What was actually wrong:

| | |
|---|---|
| **Every social and AI preview image was blocked** | `og:image` → `/api/og?t=…`, and robots.txt disallowed `/api/` |
| **Six tool pages had no BreadcrumbList** | including `/image-tools/remove-bg`, the highest-impression page on the site |
| No automated AEO check existed | `verify:daily` spot-checked ~15 recently-shipped URLs and was silent about the other 835 |
| 1 orphan, 3 thin pages, 1 double-`<h1>` | minor, listed in `aeo-audit.md` |

Not wrong, despite being on the brief's list:

- 850/850 pages already had title, description, canonical and structured data
- zero duplicate titles, zero duplicate descriptions, zero malformed JSON-LD
- all 850 URLs answered 200
- 109 of 110 localised originals already declared hreflang

---

## After

| | |
|---|---|
| `/api/og` allowed in robots.txt | every page's preview card is fetchable again — `7607a40` |
| BreadcrumbList emitted by `ToolPageShell` | six pages fixed, and every future tool inherits it — `bcc3ef5` |
| Duplicate breadcrumbs on `/qr-tools/*` removed | the fix above broke 29 pages; caught and repaired within the hour — `444a427` |
| `npm run aeo:audit` | sweeps all 850 URLs, exits non-zero on P0 |
| `npm run probe:hreflang` | reciprocal-twin check |
| `npm run probe:sitemap` | status + title + H1 across the sitemap |
| `npm run ga:channel` | crosses a traffic source with its landing pages |
| `docs/aeo-audit.md`, `docs/AEO-PLAYBOOK.md` | findings, and the rules for future pages |

Final audit: **0 P0, 0 P1**, 14 P2 (all listed and each deliberately left).

---

## Two mistakes made during this work

Recorded because both are the same shape, and the shape is worth recognising.

**I nearly shipped a wrong hreflang.** The first probe derived the English
original by stripping `/ru/`, which manufactured nine fake problems and one
real-looking gap on `/passport-photo`. Acting on it would have left two English
pages claiming the same Russian twin — worse than the gap. The fix was to ask
each localised page which English page it points at.

**I broke 29 pages while fixing 6.** Moving BreadcrumbList into the shell
duplicated it wherever the page's own schema lives in a different file from the
shell. The audit caught it because it had just been taught to count schema
types rather than collect them into a Set.

Both were caught by measurement rather than by review, which is the argument for
the scripts existing at all.

---

## One measurement error worth flagging

At one point this report almost said the breadcrumb fix had failed in
production. It had not: `grep -c` counts matching *lines*, and the minified HTML
put the schema across two of them. Counting occurrences with `grep -o` showed
exactly one per page, and the audit — which parses the JSON — agreed.

The site was fine; the ruler was wrong. That is the same failure as quoting a
number without its window.

---

## What was deliberately not done

| | Why |
|---|---|
| Remove 12 languages from the switcher | The brief assumed they harm SEO. They have no URLs — the sitemap holds only `/ru/` and `/uz/`. Removing them deletes a working feature for no gain. |
| Fix the "coming soon" cards | No tool is flagged `soon: true`. The code path exists and is never taken. |
| Hide the 5 `preview` tools | All five answer 200 and their engines are wired. "Preview" is already an honest label. |
| Split `lib/usecase-content.i18n.ts` (9,225 lines) | It is imported only by server components and the sitemap. It never reaches the browser. |
| Add breadcrumbs to `/contact`, `/terms`, `/privacy` | Top-level pages. A one-hop breadcrumb is noise. |
| Generate use-case or comparison pages at scale | The brief says fewer good pages beat many thin ones, and the site already has 850. Nothing here needed more URLs. |

---

## Remaining work, for whoever picks this up

1. ~~`/widgets` is an orphan~~ — FIXED 3 Sep 2026: `/downloader` links it. Live.
2. ~~`/link-in-bio` has two `<h1>`~~ — FIXED 3 Sep 2026: one `<h1>` now. Live.
3. ~~Yandex Webmaster is not connected~~ — **WRONG, it was already connected.**
   Verified in the panel 4 Sep 2026: qrixtools.com is added, indexed and earning
   clicks (Mission 102 wired it; this report never checked). The real Yandex
   queries are the useful find — see #4.
4. **The geo "problem" was a Google artifact, now explained.** Google shows the
   site to the Philippines/India/Indonesia, but that channel barely matters. The
   real audience is on **Yandex**, and its top queries (read from the panel
   4 Sep) are a tight CIS cluster: Russian passport photos ("сделать фото
   413x531", "как обрезать фото 413х531", "размер фото 413 на 531") and OK.ru/VK
   video downloads ("ok.ru video downloader", "vk ok ru videos"). Nothing was
   broken — the audience is CIS/Russian and Yandex serves it correctly. Double
   down on the passport-photo (413×531 = 35×45 mm) and OK.ru/VK clusters, in
   Russian, not on Google.
5. **Ads are live but the inventory is poor** — gambling and pirated-streaming creatives on a site used for passport photos. Adsterra category blocking, a different network, or no ads until traffic justifies one. Owner's decision.

---

## What this does and does not claim

The implementation improves QRix's technical accessibility, semantic clarity and
eligibility for discovery by search and AI answer engines. It does not
guarantee rankings, citations or traffic, and none of it can be evaluated except
by measuring after deployment.

The single most useful measurement available today is `npm run ga:channel`: it
showed that ChatGPT already sends this site more visitors than Google, and that
89% of them arrive on one page.
