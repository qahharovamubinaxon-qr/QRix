# Growth backlog — ranked by ROI. Top unblocked item = next action.
Statuses: [ ] todo · [~] in progress · [x] done (move to Done) · [B] blocked.

> WORKTREE NOTE (Jul 26, M138). The scheduled task file still names
> `.claude/worktrees/relaxed-turing-bbc58e` as this worker's checkout on
> design-v2. It is NOT: another Claude session checked it out to branch
> `claude/relaxed-turing-bbc58e` at 03:49 local on Jul 27, so `growth/` does not
> exist there and `growth/.lock` reads empty — which looks exactly like "no
> session is running" whether or not one is. Do NOT switch that worktree's
> branch back; a second session works in it live (see the standing note about
> never running `git add -A` there). M138 ran from a fresh worktree instead:
>
>     git worktree add .claude/worktrees/growth-v2 design-v2
>     npm install            # ~1.7 GB, several minutes; copying node_modules is slower
>     cp <any-other-worktree>/.env.local .env.local
>
> `growth-v2` should still exist and be usable as-is. If the owner ever repoints
> the task file, this note can go.

## NOW (this week)
- [B] "AI Image Upscaler" is not AI — ImageUpscaleClient is canvas bicubic plus
  an unsharp mask (drawImage at high smoothing + a 3x3 unsharp mask; no model,
  no weights, nothing learned). M120 made the RU/UZ body copy honest; the tool
  name and the EN title still say AI. Escalated from [ ] to [B] on Jul 22
  because BOTH branches are owner calls, not engineering ones:
    (a) Rename to "Image Upscaler / Enlarge & Sharpen". Free, honest, ~1h,
        but it surrenders "улучшить фото ии" and the EN "ai image upscaler"
        head term — the traffic reason the page exists.
    (b) Ship a real model. onnxruntime-web (~11 MB wasm) + Real-ESRGAN x4
        weights (~64 MB, or ~4 MB for a small anime/photo variant) served from
        our own origin or a CDN. No cash cost, but it breaks CLAUDE.md's
        "do not install packages unless absolutely necessary / keep the bundle
        lightweight", needs a WebGPU-with-WASM-fallback path, and OOMs on
        low-end mobile above ~2 MP unless tiled. Realistically a 1-2 day
        mission with a real chance of shipping something slower and worse
        than the bicubic path on the median phone.
    (c) Middle: keep the name, add a visible "how this works" line on the page
        stating it is a sharpening upscaler, not a generative model. Keeps the
        keyword, kills the deception, costs ~1h — but the H1 still says AI, so
        it is a partial fix and the owner should say whether that is enough.
  Recommendation: (c) now, (b) only if the page proves it earns traffic worth
  a 75 MB download. Needs the owner to pick. Nothing here is blocked on code.
- [B] Wire aiProcess() into the five "replaces" tools (colorize, inpaint,
  describe, translate, imagegen). The connector has been dead code since it
  was written and NEXT_PUBLIC_AI_ENGINE is set on Vercel doing nothing. Needs
  a paid provider (Replicate/Stability), so owner-gated. When a route is
  wired, flip its `wired` in AI_CLOUD_ROUTES — the trust strip, privacy FAQ
  and CloudNotice follow automatically (M131) — and rewrite that tool's
  intro/about/desc, which still promise the cloud engine in the future tense.
- [~] CWV audit — Lighthouse on 5 template types; fix to 95+ mobile. (M135)
  Lighthouse mobile against production, measured (not estimated):
    baseline   home 36 · qr-tools/url 51 · image-tools/compress 41 ·
               convert/png-to-jpg 45 · qr-code-statistics 46
    after 7a073dd  home 55 · 87 · 87 · 80 · 83
  The whole first tranche was one cause: DotDistortionBackground, mounted by
  layout on every page, repainting a full-screen screen-blended canvas forever.
  It produced back-to-back ~200 ms long tasks and TBT of 5.9-9.2 s on the tool
  templates; TBT is now 120-540 ms. Deferring the loop and cheapening the
  frame (bdc463d) did NOT fix it — only not running a canvas at all on devices
  with no cursor did (7a073dd).
  Second tranche (708e617, 8d5ec27) closed the element render delay. Both of
  the suspects above were WRONG — the font and the CSS chunk were never the
  cause. lcp-breakdown names the LCP node, and on every template it was not
  page content at all: it was the cookie consent banner's paragraph, a 354x81
  text block pinned to the bottom of the viewport, i.e. the biggest contentful
  paint on the page. It started at show=false and flipped in an effect, so LCP
  waited for the JS bundle. It now ships in the server HTML, hidden by CSS
  unless the pre-paint script in layout <head> finds no stored choice.
  Measured twice each side: observed LCP minus observed FCP went 532 ms -> 0 ms,
  i.e. the LCP element now paints with first paint. (The 2251 ms lcp-breakdown
  quoted for it was Lantern's simulated attribution, not observed; on a phone
  where hydration takes seconds the real gap is much closer to the simulated
  one, which is the case this fixes.)
  Painting it early cost 0.091 CLS — bottom-anchored box, Bricolage swaps in,
  text re-wraps, box grows, banner moves. Fixed by rendering the banner in the
  system stack (8d5ec27); CLS back to 0 on both re-runs.
  Also fixed in passing: the <head> script read the consent value with
  JSON.parse, but the banner writes a plain string and JSON.parse("granted")
  throws — so the catch reset every returning visitor to denied while the
  banner (raw string compare) stayed hidden and never re-issued the update.
  Accepted consent died silently after one page view. Verified live in all
  three states: fresh -> data-consent="pending" + banner visible; accept ->
  stored granted, attribute dropped, banner unmounts, gtag update granted;
  reload -> Consent Mode boots ad_storage/analytics_storage GRANTED (it booted
  denied before this commit) with the banner display:none, no flash.
  Third tranche (86f0781, 3599eaf) is the HOME LCP, and it turned out to be
  cheap — the element is img.qx-hm-img, the hero mascot, on every run. Two of
  its three fixable subparts collapsed, measured twice per side on production:
    resourceLoadDelay    1241 / 259 ms  ->   87 / 128 ms   (fetchPriority high;
      the browser had been waiting for layout to prove the image was in view)
    resourceLoadDuration 1884 / 972 ms  ->  430 / 821 ms   (the file was 186 KB
      of badly-encoded webp; re-encoded to 103 KB at identical 613x1876,
      PSNR 44.4 dB, nothing visible changed)
    elementRenderDelay   2444 / 1798 ms -> 2383 / 2491 ms  (UNCHANGED)
  The render delay is the interesting one. The CSS reveal (.qx-smoke--auto,
  which 7a073dd had shipped as dead CSS and 86f0781 finally wired) does run
  before hydration exactly as designed — but it animated FROM opacity 0, and
  Chrome will not accept an opacity:0 element as a contentful paint. So the
  frame painted at FCP did not count and the next frame the main thread could
  spare came ~1.2 s later. 3599eaf starts the keyframe at 0.26 instead, and
  that was the whole thing — measured twice more on production:
    elementRenderDelay 2383 / 2491 ms -> 673 / 934 ms
    observed LCP - FCP  1230 / 1313 ms ->  50 / 266 ms
    observed LCP        3519 / 4040 ms -> 1746 / 2050 ms
  Home end to end this session: obsLCP 6395 / 3791 -> 1746 / 2050 ms,
  score 33 / 36 -> 52 / 56. It is still not 95 and the reason is TBT, not
  paint — see the homepage note below, which is unchanged.
  Fourth tranche (M137, ce0c162 + add02aa) took the first bite of TBT on the
  tool templates. ToolPageShell — the wrapper on all 46 tool routes — was a
  client component for two lines: a usePathname() call and a scrollTo onClick.
  Both are gone (ToolFavorite.tsx, and href="#top" with the
  scroll-padding-top add02aa adds for the sticky nav), and QRToolClient, which
  had "use client" for nothing at all, is the server component QRToolView, so
  the 40 QR tool routes no longer hydrate the shell either. Measured twice per
  side on /qr-tools/url:
    TBT               2233 / 644 ms -> 245 / 460 ms
    hydration chunk    948 / 1849 ms scripting -> 483 / 862 ms
    perf score           49 / 65    -> 77 / 72
    script transfer   564.3 KB      -> 562.1 KB   (bytes were never the point)
  Verified interactively in real headless Chrome, which is the only surface
  that works: typing in the URL field re-renders the QR canvas, the input
  carries a React fiber, the favorite star writes
  {"href":"/qr-tools/url",...} so usePathname still resolves from its new
  home, and there are zero page errors. See the measurement notes below for
  why the in-app pane cannot answer this.
  Fifth tranche (M138) took the root layout, and the lever turned out not to be
  hydration at all — it was three modules that layout-level components imported
  for a detail, each one therefore an import on all ~800 pages:
    HOME_I18N        TopNav read 13 nav labels per language out of 57 KB of
                     homepage copy. Extracted to lib/nav-i18n.ts (3.9 KB).
    the auth SDK     TopNav statically imported supabaseBrowser for a
                     getSession() that cannot paint before hydration anyway.
                     Now import()ed inside the effect.
    the search       CommandSearch pulls lib/search-index, which pulls every
    catalog          metadata registry on the site — tool tables, the whole
                     blog, 40 convert pairs, 25 resize presets. Its ONLY opener
                     is Ctrl/⌘+K; there is no search button in the chrome. So a
                     phone downloaded the catalog on every page view for a
                     feature it cannot reach. CommandSearchLoader is the ~30
                     lines that listen for the shortcut; the palette arrives
                     through a dynamic import when it fires, warmed at idle only
                     where (pointer: fine) matches.
  Measured on production as BYTES, not as a score — see the CAUTION below for
  why scores are worthless on this machine. /qr-tools/url eager <script> set:
    19 scripts, 1405.2 KB raw  ->  18 scripts, 790.0 KB raw   (-615.2 KB, -44%)
  and the three markers went YES/YES/YES -> no/no/no while the nav labels stayed.
  scripts/measure-eager-bundle.mjs is that measurement; it fetches a URL,
  collects every <script src> the HTML links and greps them for strings that can
  only come from one module. Picking those markers is the trick and it is easy
  to get wrong: "onAuthStateChange" reported the SDK as present on a page that
  held only TopNav's CALL SITE. Use literal strings out of the module's data.
  Driven on production in real headless Chrome, zero page errors: nav labels
  render, header hydrated, Ctrl+K opens the palette, "merge pdf" returns 9 rows
  incl. the merge hit (so the catalog loads on demand), Escape closes and a
  second Ctrl+K re-opens (so the palette's own listener took over from the
  loader), the account menu opens with Sign in/Sign up and all six account
  links, and the SDK now lives in chunk 0zrey3cxfzgvi.js — absent from the
  HTML's script set, still requested after load. Moved, not dropped.
  npm run test:layout is the guard, and it is the point: every one of these
  regressions LOOKS correct. A static import in a layout-level component is an
  import on every page and nothing in the type system, the linter or a
  Lighthouse score says so. 8 assertions, 6 mutations verified. It ignores
  `import type`, which is erased before a bundler sees it — without that it
  flagged HeroSearch for an import that costs nothing.
  The homepage needed its own half, because HeroSearch is a VISIBLE box and so
  cannot wait for a shortcut — it waits for a focus instead (06c1d67), which is
  a whole intent ahead of the first keystroke, and the 110 ms debounce already
  there covers the rest. Homepage eager set 22 scripts / 1539.9 KB -> 21 /
  1281.3 KB (-258.6 KB). Driven on production: "jpg to pdf" returns JPG to PDF
  first, and the Cyrillic transliteration path ("жпг то пдф") returns the same
  row, so the on-demand catalog serves both. Zero page errors.
  Sixth tranche, same session (8173b05 + f212ba2): ReviewsSection was the last
  eager importer of the auth SDK on the homepage — app/page.tsx:6 imports it and
  renders it at line 817, below the fold in the "dusk" scene, and app/page.tsx
  is one giant "use client" component so depth on the page buys nothing. Nothing
  it paints needs the SDK (it renders from SEED until the query answers), so
  both call sites went through the same dynamic import. Homepage 21 scripts /
  1281.3 KB -> 20 / 1044.7 KB. End to end this session the homepage eager set is
  1539.9 -> 1044.7 KB (-32%). Verified on production: chunk 0zrey3cxfzgvi.js is
  absent from the HTML's script set, still requested after load, and the real
  query still fires (a REST call to /rest/v1/reviews), zero page errors.
  Deferring introduced a failure mode a static import cannot have — a chunk
  fetch can fail — so both call sites now take the localStorage path a query
  error already took (f212ba2). Worth remembering on every one of these.
  Seventh tranche (M139, 66400a3) took lib/blog — the last of the three still
  eager on the homepage, via LatestPosts. The note here used to say it needed a
  VIEWPORT-driven deferral because it feeds what the section paints. Checked
  before building it, and that shape was wrong: those three cards are the only
  /blog/* links in the homepage's server HTML (curl says exactly 3, all from
  LatestPosts), so keying them on an IntersectionObserver removes the site's only
  crawlable path from the root into the blog — a crawler does not scroll. Inlined
  the four painted fields (slug/title/category/readMins × 3) in lib/home-posts.ts
  instead: ~300 B, links unchanged in the HTML, no skeleton and no chunk that can
  fail. Generalisable: defer on INTENT, inline on PAINT — if a crawler must see
  it, a dynamic import is a downgrade however far below the fold it sits.
  Measured on production: homepage eager set 20 scripts / 1044.7 KB -> 19 /
  970.4 KB (-74.3 KB), the marker went YES -> no, and the 74.6 KB chunk that
  carried the catalog 404s — it is not deferred, it is gone from the page's graph
  entirely. Driven in real headless Chrome: all three cards render with their
  right title, category and read time, carry React fibers, the three /blog/ links
  are still in the HTML and all three 200. Zero page errors. No sitemap change,
  so no IndexNow.
  Two guards, because inlining pays in drift: npm run test:home-posts (5
  assertions — the list vs allPostsSorted(), and it PRINTS the corrected block to
  paste on failure; plus every slug must resolve, since these render as
  /blog/<slug> on the most crawled page) and test:layout, now 10, holding the
  import boundary. 4 mutations verified, incl. appending a newer post to lib/blog.
  RUN test:home-posts WHENEVER A POST IS ADDED — a stale list looks perfectly
  correct on the page, which is the whole reason the guard exists.
  next: the remaining hydration weight in the ROOT LAYOUT (below) — TopNav's
  markup split is the biggest separable one, same shape as the M137 ToolPageShell
  split. HOME_I18N stays; app/page.tsx genuinely uses it.
  After that, the remaining hydration weight in the ROOT
  LAYOUT, which mounts eleven client components on every page in the site:
  TopNav (400 lines), DotDistortionBackground (393), CommandSearch (234),
  MotionLayer (196), CookieConsent (80), ErrorMonitor (59), Toaster (49),
  PwaVitals (43), HtmlLangSync (34), GoogleAnalytics (26), ReferralCapture
  (23). CommandSearch is off that list as of M138 (it is CommandSearchLoader
  now, and only arrives on ⌘K). TopNav is still the one worth taking first for
  HYDRATION — M138 only took its imports, not its markup: it is mostly static
  nav links and its interactive parts (mobile menu, dropdowns, language and
  account menus) are separable islands, same shape as the ToolPageShell split
  that worked in M137. Note the constraint before starting: the labels come from
  localStorage via setLang, so the server cannot know the language and a naive
  "make it a server component" will not work — the label-bearing parts have to
  stay client, and what moves is the static link markup around them.
  gtag.js is the other 695 ms / 581 ms in 3 long tasks at 5.5-6.4 s; it is
  already lazyOnload, so the only lever left is first-interaction loading with
  a timeout fallback, which trades away page_views for bounced sessions —
  price it before shipping.
  The search catalog note that used to sit here said "do NOT start with it —
  it costs bandwidth and ~0 main thread, a real but separate LCP/bandwidth win".
  That was accurate and it is now SHIPPED (M138): 244.6 KB off every page,
  because the palette it belonged to could only ever be opened with a keyboard
  shortcut. The lesson worth keeping is that bootup-time is a TBT instrument and
  says nothing about download weight — check both, they find different things.
  CAUTION on scores: two back-to-back runs of an identical build scored 49 and
  65 with simTBT 2233 vs 645 ms. Absolute scores are worthless while a second
  Claude session shares this machine; only deltas measured twice per side are
  trustworthy, and TBT specifically needs both post-runs to sit below both
  pre-runs before you believe it.
  Home is a separate mission, do not fold it in: app/page.tsx is one giant
  "use client" component, so the entire homepage hydrates on the client. Its
  TBT variance across runs was 625-5628 ms, so single-run comparisons there
  are worthless — take a median of 3. Fixing it means splitting the page into
  server components, which is a mission of its own, and it is now the biggest
  single CWV item left.
  Measurement notes: the in-app preview pane cannot composite (screenshots time
  out), so verify CSS structurally via computed styles, not screenshots. It
  also cannot verify hydration AT ALL: innerWidth/innerHeight report 0 and
  resize_window does not fix it, and with no viewport React never attaches to
  anything below the root layout. Proof it is the pane and not the page: on the
  homepage — which is one giant "use client" component — 0 of 1880 elements
  under <main> carry a __reactFiber$ key, while <header> does. Do not read that
  as a regression. To actually drive the page, launch real headless Chrome from
  the lighthouse npx cache, which has puppeteer-core and chrome-launcher:
    cd "$(npm config get cache)/_npx/0f94ee7615faf582" && node -e "
      const p=require('puppeteer-core'), {Launcher}=require('chrome-launcher');
      ... p.launch({executablePath:Launcher.getFirstInstallation(), headless:'new'})"
  Set a viewport explicitly; that is the whole difference.
  Also: the preview server runs from the PRIMARY checkout, not this worktree —
  localhost:3000 serves D:\Projects\QRix's older components even though the
  route and metadata look right, so a worktree change appears not to have taken
  effect. Verify on production instead.
  PSI's API 429s without a key; drive `npx lighthouse` against the live URL.
  Deploys: production builds have been taking 25-30 min (the design-v2 preview
  goes READY in ~2). If a poll seems stuck, check the real state — the repo is
  public, so `curl -s api.github.com/repos/qahharovamubinaxon-qr/QRix/commits/
  <sha>/status` answers it, and the Vercel MCP works with projectId "q-rix" +
  teamId team_Ymbc9KJNvDDWkr2X0FzvzoSE (list_projects returns empty; go
  straight to list_deployments).
- [ ] /qr-code-statistics follow-ups, ranked: (1) an /embed-able "stat card"
  so a blogger quoting a figure links back — the actual backlink mechanism,
  which the page currently only invites in prose; (2) re-check the four
  sources each quarter, since two are annual reports that will move (a
  `published` date older than ~14 months should fail test:qr-stats); (3) RU/UZ
  twins once the EN page shows impressions in GSC — not before, the copy is
  argumentative and expensive to translate well.

## NEXT (2-4 weeks)
- [ ] Metric-matched @font-face fallback for Bricolage Grotesque
  (size-adjust / ascent-override / descent-override on a `local("Arial")`
  face, the trick next/font's adjustFontFallback does). Every text block on
  the site re-wraps when the 75 KB webfont swaps in; the consent banner is
  just the one place it was measurable, because it is bottom-anchored, and
  M135 bought that one back by dropping the brand font there. A matched
  fallback would let it keep the face and would cut swap reflow everywhere.
  Needs the font's real metrics — @capsizecss/metrics has them, or measure
  empirically in the browser; do NOT guess the numbers.
- [ ] Multi-file for the engines that still take one file. The old "batch
  conversion for real" item was written against a gap that has since closed:
  ImageConvertClient (convert:/social:/resize: — the /convert pages the item
  named) already queues a whole selection, applies the same settings to each
  and zips them, and ImageBatchClient covers the batch: presets. What is still
  single-file: fx: (filters), tf: (rotate/flip/crop), meta: (EXIF remover),
  overlay:. The real user story left is "strip EXIF from 40 photos" —
  meta: first, then tf:, then fx:. Re-scoped Jul 22.
- [ ] Poster maker: template-aware defaults for the logo slot — a logo makes
  the "Custom" template's empty subtitle look unbalanced, and the menu/review
  templates could offer a logo-left layout instead of centred. Follows M133;
  moved out of NOW because it is subjective polish on a tool that shipped the
  same day and no user has hit it.
- [ ] Spanish (es) downloader + top-tools pages (copy RU pattern).
- [ ] Turkish (tr), Indonesian (id) — same.
- [ ] PDF converter-pair pages (word-to-pdf, excel-to-pdf, ppt-to-pdf…).
- [ ] Blog autopilot: +20 topics from GSC impressions data (weekly review).
- [ ] Internal-links pass: every tool page links 6+ related pages.
- [ ] Image alt-text + OG images per tool category.
- [ ] search_miss report → build the top-3 requested missing tools.

## LATER (quarter)
- [ ] Embeddable QR-generator widget (2nd widget) + /widgets update.
- [ ] Developer API public launch content (docs SEO: "qr code api").
- [ ] Guest-post/backlink outreach batch 1 (10 targets list in PLAYBOOK).
- [ ] AdSense apply when >500 organic/day; Ezoic compare at >5k/day.
- [ ] 10-language expansion (hi, ar, de, fr, pt…) for proven families.
- [ ] Premium plan launch after Lemon Squeezy bank connect.

## OWNER-GATED (needs human)
- [B] AlternativeTo submit — account age unlocks Jul 27 (reminder set).
- [B] Product Hunt launch — prep starts Aug 5 (reminder set).
- [B] Reddit/HN posts — human account required.
- [B] VK/Reddit/Vimeo unlock — ~$3/mo residential proxy for cobalt
  (API_EXTERNAL_PROXY) — owner decision.

## Done
- [x] Jul 22: /qr-code-statistics — 26 stats, every one openable (M134). The
  category is a citation loop: the headline numbers ("over 2 billion scans a
  day", a worldwide scan count given to the single digit) have no study under
  them and contradict the annual totals printed on the same pages. So the page
  inverts the format — fewer figures, each carrying its source's own
  publication date, a visible tier badge (government / analyst / vendor
  platform / vendor survey / regulator) and a written caveat naming what it
  does not prove. Juniper on payment value ($5.4tn 2025 → >$8tn 2029), NPCI's
  UPI volumes via a Government of India release (21.63bn transactions in Dec
  2025, +29% YoY) as the only official-statistic tier, Bitly platform data on
  regional scans (Europe: +7% codes created, +53% scans — the installed base
  being used harder, not replaced), and a Bitly marketer survey labelled as a
  vendor polling its own buyers. Where a source contradicts itself the page
  prints both figures and says the text doesn't resolve it. The rejected list
  is the reason to link here: four of the most-quoted QR numbers appear only
  as failures, incl. the quishing percentages, traced by reading the roundup
  they come from — 69 statistics, 3-4 attributed. No quishing number is quoted;
  the security section cites the FTC's own alert and says the numbers don't
  exist. lib/qr-stats.ts is the single source for the cards, the JSON-LD
  citation array and the CSS bar chart. npm run test:qr-stats = 13 assertions
  (no stat without an https source + name + date; no non-government stat
  without a caveat; ≥3 distinct source hosts so it can't decay into one
  vendor's press kit; FTC link pinned to consumer.ftc.gov), 6 mutations
  verified. First deploy 404'd for 20 min: the page passed QR_TYPES.url —
  which carries a build() function — from a Server Component into a Client
  Component, which Next refuses at build time, so Vercel kept serving the old
  build. Fixed with a client wrapper, same shape as QRToolClient. Live and
  verified: 200, canonical, all 5 source hosts in the HTML, Article JSON-LD
  with 4 citations + FAQPage(6) + BreadcrumbList, sitemap + llms.txt carry it,
  IndexNow 200. Generator embed renders a real QR; its interactivity could not
  be driven in the preview pane, but /qr-tools/url behaves identically there,
  so that is the pane, not the page.
- [x] Jul 22: poster maker logo upload + a removable credit (M133). The
  review-poster landing answered "Can I add my logo?" with "not yet" in 15
  languages and promised "no watermark on the printable poster" in the same
  breath, while PosterMakerClient drew "Made with QRix" into every export.
  Logo upload (PNG/JPG/WebP/GIF/AVIF/SVG, FileReader → data URL, never leaves
  the browser, aspect-preserved into a 560x150 header box, 0x0 SVGs rejected
  with a message) and a credit checkbox now make both answers true. Neither
  could ship without fixing the layout first: every y was a literal, so a
  heading that wrapped drew its second line through the accent underline into
  the QR card. lib/poster-layout.ts resolves the page from its own content and
  shrinks the QR — never under 360px — when the blocks above eat the room; a
  default poster is pixel-identical (underline still at y=300, asserted live).
  npm run test:poster = 18 assertions incl. all 36 heading×subtitle×logo
  combinations, 5 mutations verified. Driven on production: uploading a 400x200
  logo moved the underline 300 → 400 exactly as the module predicts, the
  exported PNG (184 KB, valid magic, 1240x1754) carries the logo and, with the
  box unchecked, zero ink in the footer band; the only request the page made
  was /api/v1/track. IndexNow 200 for 17 URLs.
- [x] Jul 22: the AI health check asserted a flag, not a capability (M132).
  envValidation() reported NEXT_PUBLIC_AI_ENGINE being unset as a production
  issue — a check that never fired (the var is set) and that, if acted on,
  would have changed nothing (aiProcess has no callers). It now reads
  AI_CLOUD_ROUTES and reports whichever half is actually missing; /api/ready
  says the real state out loud. test:ai holds monitor.ts to the route table.
- [x] Jul 22: the AI tool pages' processing flag derives from the connector
  (M131). The item assumed isAiEngineLive() was false in production and the
  work was preventative. It is not: NEXT_PUBLIC_AI_ENGINE is SET on Vercel
  (proved by deploying the env-keyed version and watching /ai-tools/colorize-
  photo flip to the cloud strip on production), while aiProcess() has zero
  callers anywhere in the app. So the flag was already true and meant nothing.
  lib/ai-connector.ts now holds AI_CLOUD_ROUTES: per engine, the AiTask it
  routes to, whether it sends a file or text, whether the cloud replaces the
  tool's main action or only adds a mode, and `wired` — false until that
  engine's client actually calls aiProcess(). engineProcessing() reads all
  four, so setting the env var alone changes nothing on any page. Ten engines
  listed, each only where the tool's own copy already promises the cloud will
  do that work. ToolPageShell gained a hybrid copy set (speech-to-text is
  neither: the tool is local, only the optional step would upload), the
  privacy FAQ is rewritten from the same table, and the four CloudNotice
  banners that make a where-it-runs claim now swap promise for disclosure.
  npm run test:ai — 19 assertions across three child processes (env unset,
  env set, env set + routed), scanning every .ts/.tsx for aiProcess() call
  sites so `wired` cannot drift from the source in either direction. Seven
  mutations verified.
- [x] Jul 22: internal links off the /url-qr and /vcard-qr 308s (M130). The
  item named the four use-case CTAs; the same two dead paths were also linked
  from the homepage, dashboard, sidebar, PDF and image category pages, the
  category showcase and /free-forever — 18 links, each a redirect hop. The
  config redirects stay for external links; nothing inside the site should hit
  one. Blog slugs containing "vcard-qr-code-..." untouched.
- [x] Jul 22: vCard and MECARD payload escaping (M129) — the half M126 left.
  Worse than the WiFi bug it matched: vCard's N and ADR are structured, so an
  unescaped `;` inside a value shifts every later component up a slot rather
  than truncating ("Berg; Jr" moved the given name into additional-names), and
  a comma in ORG made "Acme, Inc." import as two organisations. Blank
  properties are now omitted instead of emitted empty, and the decoder reads
  through the escapes so it stops showing users their own backslashes.
  test:qr 31 assertions (was 21), mutation-verified; round trip driven in the
  browser through the real generator and the real decode page.
- [x] Jul 22: the trust strip claimed "files never upload" on tools that upload
  (M128). ToolPageShell hardcoded six trust points on every tool page; two are
  claims about where the work happens and neither was derived from anything.
  Now a `processing` prop picks between a device and a cloud variant, with the
  four always-true claims shared. /pdf-tools/pdf-to-word and
  /3d-tools/image-to-3d switched to cloud (both send the user's file), the
  RU/UZ localized badge got the same three-segment drop via LocTool.onDevice,
  and the downloader FAQ's "Everything runs in your browser" was corrected
  against its own Privacy note two paragraphs below it.
- [x] Jul 22: PDF compression moved into the browser (M127) — the tool can now
  do the job its funnel page is built to sell. lib/pdf-compress.ts walks the
  indirect objects and re-encodes each DCTDecode image XObject through an
  injected encoder, rewriting /Length /Width /Height /ColorSpace /Filter and
  dropping /Decode + /DecodeParms; text, vectors, links and form fields are
  untouched. Skips /ImageMask stencils, non-lone-DCTDecode filters, images
  under 3 KB and any ref used as an /SMask; keeps the original whenever the
  re-encode is not smaller or its SOF header is not 1 or 3 components.
  The encoder is an argument, so the same shipped code runs against canvas in
  the browser and sharp in `npm run test:pdf` (26 assertions, output validated
  by pdf.js, every re-encoded image decoded again to prove its dict matches its
  bytes). The route stayed but now runs that code instead of splicing JPEGs
  into raw bytes and leaving every later xref offset wrong.
  Driven end to end in the pane: 0.58 MB → 0.09 MB (85%), output re-parses,
  second pass correctly reports "Already optimized", zero network requests.
  M126's honesty rewrite reverse-applied — 98 translated strings across 14
  languages back to on-device, EN rewritten to keep what M126 got right, plus
  the tool page (which had no JSON-LD and no FAQ at all) and the RU/UZ twins.
- [x] Jul 22: audited usecase-content.i18n.ts — 3 false claims across 15
  languages, and the audit turned up a silent data-corruption bug (M126).
  The file is 9,228 lines of generated copy for 14 use cases × 15 languages,
  so it was audited by checking every claim against the engine it describes
  rather than by reading it end to end.
  (1) compress-pdf-for-email promised on-device processing four separate ways
  (metaDescription, intro, a benefit, a step, and "Is my document uploaded to
  a server?" → "No"). CompressPdfClient POSTs to /api/pdf/compress with no
  client-side path at all. The tool's own page was already honest — only the
  pages that rank lied. Rewritten, and the shared "Free · on-device · no
  signup" badge now drops its middle segment for server-side tools (all 15
  localizations are three ` · ` segments, so no new translation was needed).
  (2) Measured against production while checking the "only your device's
  memory" limit answer: 4.19 MB uploads fine, 4.4 MB returns 413 at the edge.
  A 413 body isn't JSON, so the user got a bare "Compression failed" — on the
  page whose whole promise is beating Gmail's 25 MB limit. Pre-upload guard +
  inline warning + honest FAQ; the real fix is queued in NOW.
  (3) The review-poster page promised a logo upload PosterMakerClient does not
  have. Answered honestly, pointed at the QR generator, follow-up queued.
  The WiFi page claimed hidden-SSID support that did not exist, and checking
  it exposed the real prize: both WiFi builders interpolated raw, so a
  password containing ; : , \ or " truncated at the delimiter — the code scans
  perfectly and just fails to connect. QRix's own decoder read /P:([^;]*)/ and
  truncated identically, so the round trip was self-consistently wrong. Now
  escaped per spec, with H:true shipped, open networks omitting the password,
  and the calendar payload given the description field and real times its copy
  had promised (plus RFC 5545 escaping and VALUE=DATE for all-day events).
  lib/qr-payload.ts + npm run test:qr — 21 assertions, mutation-verified:
  removing the escaping fails 4, removing H:true fails 2.
  Claims checked and left alone because they hold: remove-bg is genuinely
  on-device (@imgly) and does offer white backgrounds, SVG export exists,
  vCard carries title/URL/org, Instagram takes a username, fill-and-sign never
  touches the network, and all 14 CTAs resolve.
- [x] Jul 22: localized the sizing controls the RU/UZ copy names (M125) — the
  copy said "switch to «вписать»" and that «to'ldirish» crops the sides (8 RU
  and 13 UZ mentions across 50+ pages) while the buttons rendered English
  fill/fit, so the copy pointed at a control that wasn't on the page.
  ImageEngineRegistry threads an optional `lang` into the sizing/convert engine
  only — the one client whose controls the copy names out loud. Labels are
  display-only; mode values stay "fit"/"fill", so lib/image-output and its 30
  assertions are untouched. Background aria-label, quality label and the
  primary action localized too.
  Verified in a real browser on PRODUCTION, not just locally: qrixtools.com
  /ru/resize/1080x1080 renders Заполнить · Вписать · Изменить размер and the
  uz twin renders To'ldirish · Sig'dirish · O'lchamni o'zgartirish. Note the
  engine chunk is dynamic(ssr:false), so it is absent from the initial HTML —
  grepping HTML-linked chunks cannot verify it; drive the page instead.
- [x] Jul 22: two silent format rewrites + engine-derived format FAQ (M124) —
  found by driving batch-compress in the pane that M123 unblocked, which is
  the tooling paying for itself on its first use.
  batch:resize converted every image to WebP: `fmt` defaults to "webp" and its
  picker only renders for convert, so resize read a value never meant for it —
  the exact M120 bug, fixed then in ImageConvertClient and missed here.
  meta:remove/meta:exif hardcoded image/png, so a JPEG came back a much larger
  PNG — the M122 ExifCleanerClient bug, missed in its registry twin. Both now
  go through keepFormat() + flattensToWhite().
  Verified live by magic bytes in the real ZIP, not by reading code:
  logo.png -> 89 50 4e 47, photo.jpg -> ff d8 ff e0. Both were .webp before.
  The FMT answer is derived once from each tool's engine instead of one shared
  constant repeated at 30 call sites, so a new tool can't inherit a false
  claim; FAQ JSON-LD follows automatically. npm run test:image 30/30 (was 23),
  and the 7 new assertions fail 4 when fmtAnswer is reverted to always-PNG.
  Live on 5 spot-checked URLs, IndexNow 200 for all 82 tool pages.
- [x] Jul 22: registry-backed canvas engines are drivable in the preview pane
  (M123) — the item open since M120, and the lazy chunk was never the cause.
  Two independent traps, both found by instrumenting rather than guessing;
  `dynamicParams=false` was hypothesised and **refuted** by experiment first.
  (1) `preview_start` serves the PRIMARY checkout, not this worktree. The
  primary has no app/convert, app/resize, app/downloader, app/image-tools/
  [slug] and no lib/image-tools-meta.ts at all, so every design-v2 route 404s
  locally while 200ing in production — and it *does* carry a stale untracked
  app/image-tools/exif-remover/, which is precisely why that lone page seemed
  drivable and every registry page looked broken. The port-3001 worktree
  launch config was added in M120 but never actually exercised; it works.
  Proved by neither generateStaticParams nor the page body ever executing.
  (2) The pane runs the tab `visibilityState:"hidden"`, so requestAnimation-
  Frame never fires (timers do). React 19 gates its streaming-Suspense reveal
  on rAF — `$RC` won't reveal until `typeof $RT === "number"`, and `$RT` is
  only ever set inside a rAF callback. So every route slow enough to flush the
  loading.tsx fallback deadlocks forever: content parked in <div hidden
  id="S:0">, engines never mounted, and body.innerText pinned at ~126 chars
  whatever the page held — the M122 "126-char mystery", explained.
  Unblock (polyfill rAF → seed $RT → flush $RB) documented in
  growth/PREVIEW_VERIFICATION.md. Measured on /image-tools/batch-compress and
  reproduced on /convert/png-to-webp: scrollHeight 900→2081/2099, file inputs
  0→1, innerText 126→1710/2770, fallback gone. Then driven end to end — a
  DataTransfer file surfaced the real Quality + "Process 1 → ZIP" controls and
  produced a genuine application/zip (PK magic, 918 B). No production code
  changed: a real user's tab is visible, so this is pane-only.
  Found while driving it: baseFaq() promises PNG output but compress emits
  JPG (new NOW item).
- [x] Jul 22: canvas output rules made testable (M122) — the [~] item open
  since M120. (b) is fully done; (a) is partly fixed and honestly scoped:
  (a) The 0x0-viewport trap has a fix, and it is not the preset:
  `resize_window {preset:"desktop"}` answers "reset to NATIVE size", and on a
  worktree dev server native IS 0x0, so the preset is a silent no-op — that is
  why it kept looking unfixable. `resize_window {width:1280, height:900}` sets
  a real viewport and React hydrates. Proven on /image-tools/exif-remover:
  vw:0 with only ["EN","Sign up"] became vw:1280 with the real file input and
  the "Remove metadata & download" control.
  LIMIT, measured not assumed — this is NOT enough for engine-registry pages.
  On /image-tools/batch-compress the page hydrates at 1280 (the "Loading the
  image workspace…" fallback is in the DOM, so React is alive) but the
  `dynamic(ssr:false)` chunk never resolves in the pane, so the canvas engine
  still never mounts. Directly-imported clients (exif) are drivable;
  registry-backed ones (convert/resize/batch/upscale) are not yet.
  Also: `document.body.innerText` returns ~126 chars in the hidden pane no
  matter what the page contains — assert against the DOM, never innerText.
  (b) The decision logic no longer depends on a browser at all: keepFormat,
  keepsAlpha, paintsBackground, flattensToWhite and drawRect moved to
  lib/image-output.ts, asserted by scripts/test-image-output.mjs
  (`npm run test:image`, 23 assertions against the SHIPPED module — Node 24
  strips the types, so there is no copy to drift). Proven able to fail by
  mutation: the original always-jpeg bug fails 6, fill-mode alpha flattening
  fails 2, fit/fill swapped fails 3.
  The real drawImage/toBlob half was verified in the browser pane rather than
  jsdom (which has no true codec): a transparent source drawn fill-mode into
  1080x1080 keeps centre alpha [0,0,0,0] through a real PNG encode+decode
  round-trip while the corner stays opaque red, painting the frame first
  reproduces the M120 white flattening, and toBlob returns genuine
  image/png / image/webp / image/jpeg.
  Found and fixed while extracting: ExifCleanerClient had the same bug class
  independently — it hardcoded png-or-jpeg, so a WebP dropped into the EXIF
  remover came back as a JPG, and a transparent source encoded black because
  nothing painted the frame. It now shares the same helpers.
- [x] Jul 22: claim audit across every localized template (M120) — the last
  four surfaces the audit item named. Fixed, each verified against the code:
  PDF compress claimed "без потери качества" (the route re-encodes JPEGs at
  q42–82 and downscales to 900–1600px) and "файлы не загружаются на сервер"
  (CompressPdfClient POSTs to /api/pdf/compress — a false privacy promise);
  PDF→Word claimed in-browser conversion (it runs the server provider chain);
  the upscaler claimed detail restoration (bicubic + unsharp mask can't);
  OCR claimed 100+ languages (the picker has four options) in the localized
  copy, the autopilot blog seed and the social-post cron; and the EN/RU/UZ
  downloader templates promised "video, audio or image" on all 16 platforms,
  though Twitch and Dailymotion never yield an image and SoundCloud never a
  video — new deliverables()/formatPhrase() helpers derive the sentence from
  each platform's real kinds. Verified true and left alone: barcode batch
  mode, OK.ru in-browser MP3 extraction, TikTok's "HD (no watermark)" label,
  pdf-to-jpg zip-all, merge/jpg-to-pdf browser-only, bg remover resolution,
  and all the resize-preset print/ID copy (which already disclaims what it
  doesn't check).
- [x] Jul 22: resize stopped silently rewriting file formats (M120) — the
  /resize/<preset> and social-resizer pages fell through to fmtKey "jpeg", so
  every resize returned a JPG and a transparent PNG came back flattened onto
  white, while two pieces of copy claimed the format was preserved. Fixed the
  code, not the copy: PNG→PNG, WebP→WebP, everything else→JPG, and fill mode
  no longer paints the background when the output carries alpha. Deployed;
  the copy is verified live by curl, the canvas behaviour is typecheck-only
  (see the verification item in NOW).
- [x] Jul 21: unknown params now 404 instead of soft-404ing with 200 (M118) —
  found while verifying M117: /ru/barcode answered 200 before the hub existed.
  Without `dynamicParams = false`, Next renders params outside
  generateStaticParams on demand and the empty result is prerendered and
  cached as a 200, so /ru/anything, /convert/nonsense, /resize/9999x9999,
  /downloader/nonsense and /blog/nonsense were all indexable empty pages —
  an unbounded crawlable URL space competing with the ~800 real ones for
  crawl budget. Barcode was the only family already correct (M116 set it).
  Flag added to all 20 registry-backed dynamic routes; deliberately NOT to
  /pin, /dashboard/analytics, /r and /p, which resolve user records at
  request time. Safe because every patched route enumerates a static in-repo
  registry — no runtime CMS, so a new entry already needs a deploy.
- [x] Jul 21: RU/UZ hub for /barcode + 3-level breadcrumbs (M117) — the 26
  M116 pages had an EN-only parent. BARCODE_HUB copy in lib/hub-i18n.ts is
  written as a chooser, not a link list: the children each own a narrow
  query ("генератор pdf417") but none can own the head term ("генератор
  штрих кодов") or the "which symbology do I even need" intent that brings
  most of the traffic, so sections are grouped by where the code is used.
  LocalizedHub took a third kind via a HUB_COPY/SECTIONS lookup instead of a
  widening ternary, families unioned with BARCODE_FAMILIES so a new family
  is appended not dropped. Child breadcrumbs (visible + JSON-LD) now read
  Home › Штрих-коды › Type and point at the localized hub. Claims checked
  against BarcodeClient before writing: batch mode is real, and the FAQ
  states exactly which four symbologies auto-append a check digit.
  Verified live: both hubs localized title/h1/canonical, 4-way hreflang,
  ItemList+Breadcrumb+FAQ JSON-LD, 13 child links each, sitemap 801.
- [x] Jul 21: RU/UZ twins for all 13 barcode symbologies (M116) — 26 pages at
  /ru|/uz/barcode/<type> on the real BarcodeClient. lib/barcode-types-i18n.ts
  carries written facts per format in both languages (Aztec's centre bullseye
  is why it needs no quiet zone; PDF417's 17-module codeword is why it looks
  like a ladder; an EAN prefix marks where the number was registered, not
  where the goods were made) plus 2 own FAQs each + 3 shared trust FAQs.
  Caught before shipping: the composed numeric "what to type" step promised
  an automatic check digit, but only EAN-13/EAN-8/UPC-A/ITF-14 carry fixedLen
  in BarcodeClient — ITF, MSI and Pharmacode get none, so that step is now
  split in two (the M114 false-claim trap, this time caught pre-deploy).
  LOC_BARCODE_TYPES is derived by filtering BARCODE_TYPES through the copy
  table, so an unwritten symbology can't be routed or sitemapped to a 404.
  4-way hreflang reciprocal, sitemap 799 verified live, tsc clean.
  Follow-up: /barcode has no RU/UZ hub, so these 26 pages have an EN-only
  parent and their breadcrumbs are 2-level.
- [x] Jul 21: RU/UZ hubs for /resize and /convert (M115) — the 50 localized
  resize presets and 40 localized converter pairs had an EN-only parent that
  dropped RU/UZ visitors into English on every breadcrumb and "all sizes"
  path. Four hubs off one shared LocalizedHub, each carrying the head term
  its children can't target ("конвертер изображений", "rasm o'lchamini
  o'zgartirish"), copy written for RU/UZ intent (document-photo and print
  queries) rather than translated. Convert sections self-defend against a
  forgotten target format; cards link only LOC_* entries so a pair without
  localized copy can't be linked to a 404; child breadcrumbs now name and
  point at the hub for a real 3-level trail. Live on all four URLs.
- [x] Jul 21: TIFF converter pairs + client-side TIFF decoder (M114) — 6 EN
  pairs (tiff-to-png/jpg/webp, png/jpg/webp-to-tiff) with RU/UZ twins = 18
  new URLs, sitemap 769. The work was the decoder: no browser can load a
  .tiff into an <img>, so lib/tiff-decode.ts adds UTIF (MIT, dynamically
  imported — confirmed absent from every eager chunk, so non-TIFF users pay
  nothing). Critically it refuses what UTIF gets wrong: JPEG-in-TIFF,
  WebP-in-TIFF, tiled layouts, CCITT Huffman and Adobe Deflate all decode to
  garbage or black rather than failing, so compression/layout tags are
  checked against an allowlist verified pixel-exact against libtiff and
  anything else gets an error naming the codec. Multi-page scans get a page
  selector. Verified: 29-assertion Node suite (LZW/Deflate/PackBits/none/
  CCITT-G4/multi-strip/odd-width/RGBA/16-bit/grayscale all maxErr=0; every
  unsupported form refused; multi-page IFD chains correct), tsc clean, all
  18 URLs 200 live with 4-way hreflang + SoftwareApp/Breadcrumb/HowTo/FAQ
  JSON-LD, TIFF code confirmed present in the deployed chunk, IndexNow 200
  for all 769. Also fixed: the /convert hub's hardcoded ORDER had no TIFF,
  which would have orphaned the three *-to-tiff pages (now self-defending),
  and the RU/UZ template's false batch-conversion promise on 40 live pages.
- [x] Jul 21: RU/UZ twins for /resize/<preset> (M111) — 50 localized pages
  at /ru/resize/<size> and /uz/resize/<size> on the same real
  ImageConvertClient (resize:WxH engine) via components/LocalizedResizePage.
  lib/resize-presets-i18n.ts holds written per-size copy for all 25 presets
  in both languages: what the size is, its caveat, and 2 size-specific FAQs
  each, composed with an orientation-aware fill/fit line + 3 shared FAQs.
  3-way hreflang made reciprocal (EN page now declares ru/uz), sitemap 738
  URLs, 4 localized search-index entries. Verified live: localized titles,
  4-way hreflang, correct canonical, unique body, SoftwareApp+Breadcrumb+
  HowTo+FAQ JSON-LD. IndexNow 200 for all 738.
  Follow-up: the /resize hub is EN-only — RU/UZ hub twins would give these
  50 pages a proper localized parent (small, high-ROI).
- [x] Jul 21: premium tool-control surfaces for QR Art + Promo Video makers
  (shared .qx-tool-card/.qx-tool-in/.qx-chip2 classes, light mode included).
- [x] Jul 21: resize presets batch 2 (M110) — 9 more sizes, 25 presets /
  26 URLs total. 1080x1920 vertical, 1600x900, 1920x1200, 1024x1024,
  2048x2048, 300x300, and 300-DPI print 8x10in / A5 / A3. Copy-only —
  hub, sitemap, search and JSON-LD picked them up automatically.
- [x] Jul 21: resize-preset pages (M109) — `/resize` hub + 16
  `/resize/<size>` SSG pages on the real ImageConvertClient via a new
  generic `resize:<w>x<h>` engine (no second preset table). Displays,
  web/OG, 300-DPI print and ID/passport groups; unique copy + HowTo/FAQ/
  SoftwareApp/Breadcrumb JSON-LD, sitemap (17 URLs) + search index +
  TopNav + llms.txt. Targets size-intent queries the platform-named
  social pages don't serve. ID pages state they set dimensions only.
- [x] Jul 21: real baseline TIFF encoder (M108) — `/image-tools/convert-to-tiff`
  was handing users PNG bytes named .tiff (canvas.toBlob has no image/tiff
  codec, same bug class as BMP/ICO). Now emits a real little-endian baseline
  TIFF: 8-bit, single strip, uncompressed, RGB when opaque / RGBA +
  ExtraSamples=2 when transparent. Verified by running the shipped function
  against sharp+libtiff — exact pixel round-trip at 3x2 (odd width), 4x4
  alpha and 640x480, plus direct IFD tag-order/compression/strip asserts.
  Confirmed live in the deployed chunk. No sitemap change (no IndexNow).
- [x] RU/UZ converter pages — 40 pages, 3-way hreflang, IndexNow (M107).
- [x] Jul 21: converter-pair pages — /convert hub + 20 `/convert/[pair]`
  SSG pages (png/jpg/webp/avif/bmp/gif/ico) on the real ImageConvertClient,
  unique copy + HowTo/FAQ/SoftwareApp/Breadcrumb JSON-LD, sitemap (21 URLs)
  + search index + TopNav + llms.txt, all verified 200 live, IndexNow 200.
  Also fixed silently-broken BMP/ICO encoders (canvas.toBlob returned PNG
  bytes with a lying extension) — now real 24-bit BMP + real ICO container.
- [x] Jul 19-21: downloader (16 platforms + bot + channel), RU/UZ pages
  (downloader + 8 tools), comparison pages, embed widget, viral QR footer,
  IndexNow automation, GA4, brand film v2, weekly backups, GSC/Bing/Yandex.
