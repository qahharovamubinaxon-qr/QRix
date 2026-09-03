# QRix AEO playbook

The rules a new page follows so it can be found, understood and quoted — by
Google and by answer engines like ChatGPT Search. Written from what the codebase
already does well, so most of this is "keep doing it", not "start doing it".

---

## What a new tool inherits automatically

Add an entry to the family's registry (`lib/{qr,image,ai,video,three}-tools-meta.ts`)
and render it through `ToolPageShell`, and the page gets, without further work:

- title, description, canonical, OpenGraph and Twitter card — via `pageMeta()`
- a per-page social image at `/api/og?t=<title>`
- **BreadcrumbList** — emitted by `ToolPageShell` from `category`, `categoryHref`, `title`
- the visible breadcrumb, the trust strip, related tools, share buttons
- a sitemap entry — `app/sitemap.ts` reads the registries

**Never hand-build this per page.** If you find yourself writing metadata by
hand for a tool, the registry entry is missing something.

## What you still write per tool

| Field | What it is for |
|---|---|
| `title` | The task, not the brand. "Compress Images Online — Free JPG, PNG & WebP Compressor", not "QRix Compressor" |
| `desc` | One sentence a search result can show whole |
| `intro` | The direct answer, above the fold: what it does, what formats, what it costs, where the file goes |
| `about` | Two or three sentences of real explanation |
| `steps` | The actual steps, in order |
| `faqs` | Questions people actually ask. Four is plenty |

### The direct answer is the AEO surface

An answer engine quotes the first clear statement that answers the question. Put
it in `intro`, and make it specific:

> Remove the background from any image automatically with AI — right in your
> browser. Nothing is uploaded; the model runs on your device.

Not:

> The best free background remover for all your image needs.

## Claims must be true

The trust strip changes with `processing`:

- `device` — "files never upload". Only for tools that genuinely never send the file.
- `cloud` — "sent over HTTPS, then discarded". For anything that POSTs the file.
- `hybrid` — local by default, with an optional cloud step that says so first.

Getting this wrong is not an SEO mistake, it is a lie to someone deciding
whether to hand over a passport photo. The same rule killed the phrase "no ads"
from six places the day advertising went live.

## Schema rules

- One `BreadcrumbList` per page. If a page builds its own `jsonLd([...])`, pass
  `breadcrumbSchema={false}` to the shell.
- `WebApplication` for tools, `Article` for blog posts, `FAQPage` only where real
  FAQs are rendered on the page.
- Never invent `aggregateRating`, `review`, `offers` or an author who does not exist.
- **The schema and the component that renders it must live in the same file, or
  one of them will be forgotten.** `/qr-tools/*` shipped two breadcrumbs for
  exactly this reason.

## Indexability

| Index | Do not index |
|---|---|
| homepage, category hubs, tool pages, guides, use-case pages, docs, legal | `/admin`, `/dashboard`, `/login`, `/register`, `/settings`, `/account`, `/history`, `/favorites`, `/workspace`, `/api/*`, short links (`/r/`, `/s/`, `/p$`, `/pin`) |

`/api/og` is the exception inside `/api/` and must stay allowed — it serves
every page's preview image.

## URLs

Never rename a live URL without a 301, an internal-link sweep, a canonical
update and a sitemap update. `/ru/split`'s English twin is `/pdf-tools/split` —
URL shapes legitimately differ between languages, and hreflang is what ties them
together, not the path.

## Do not

- Generate hundreds of near-identical pages for keywords. Fewer, better pages.
- Pad a page to hit a word count.
- Write "ChatGPT recommends QRix" or anything like it.
- Add hidden text, fake citations, fake reviews, or schema that describes a page
  the visitor does not get.

## Before shipping

```
npx tsc --noEmit
npm run build
npm run aeo:audit
```

`aeo:audit` exits non-zero on P0. It checks status, title, one H1, description,
canonical, valid and non-duplicated JSON-LD, breadcrumbs, prose length,
duplicate titles and descriptions across the site, and orphans.

## Measure the channel, not the theory

`npm run ga:channel` crosses a traffic source with landing pages. It is how the
largest thing about this site was found: ChatGPT sends more visitors than
Google, and 89% of them land on one page, `/downloader/vk`. Before optimising
for a search engine, check which one is actually sending people.
