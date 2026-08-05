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
- [ ] STRATEGY: read growth/SEO_STRATEGY.md at every session start — pick work
  that serves the CURRENT PHASE (P0 Foundation until its KPI gate passes).

- [x] THE DAILY PASS WAS REPORTING AN ADVISORY ROW AS ITS COUNTS (M165, 7d2af4d).
  FOUND Aug 5 by the daily VERIFY itself, and it had already put a false
  sentence into this log before it was noticed — which is the part worth
  keeping.
  THE BUG: scripts/daily-verify.mjs printed `out.trim().split("
").pop()` of a
  recheck:sources run. recheck prints its summary FIRST and everything advisory
  AFTER it (sources published over 14 months, reads older than 120 days), so the
  last line is the summary only on the days nothing needs attention. Aug 5 was
  the first day one fired, and the pass printed
      ftc-alert   published January 2025 (~18 months)
  where every previous day printed `N sources · M markers · 0 moved · …`.
  WHAT IT COST, and it is more than cosmetics. (1) The counts vanished, and they
  had CHANGED: the datasets went 24 -> 29 sources and 50 -> 73 markers when M164
  landed, and the one line that would have said so was the line being dropped.
  (2) TWO sources are past the threshold, juniper and ftc-alert; the pass named
  ONE. A truncated list does not read as truncated — it reads as the list, and
  this session duly wrote "juniper has aged past the threshold" into DAILY_LOG
  as if it were new. Corrected in place, with the cause named.
  THE FIX is recheckReport() in scripts/verify-rules.mjs, and it belongs there
  for that module's stated reason: PRODUCTION IS HEALTHY, so a real run cannot
  produce the output that breaks the parse — the advisory path had never once
  been executed by the daily pass in the four days it has existed. It anchors on
  the summary's own shape (`/^d+ sources · /`) rather than its position,
  returns null instead of a guessed line when there is no summary (on a crash
  `.pop()` hands the log a stack frame), and returns EVERY advisory row. The
  failure branch now prints the counts too — they are what says how much of the
  dataset was reached before it gave up.
  GENERALISABLE, and this is the third form of it in this file: a reporter that
  reads its input POSITIONALLY is making a claim about the producer's output
  order that nothing checks. `.pop()`, `[0]`, `slice(-6)` — each is an unstated
  assumption. Anchor on the shape of the line you want. And note the failure
  mode: it did not throw, it did not go red, it printed something plausible.
  Guard: npm run test:verify, 14 -> 19 assertions, 5 mutations verified. Both
  fixtures are REAL output, the quiet run and the Aug 5 advisory run. One
  assertion is structural and asserts the SHAPE — no positional read of
  recheck's output may reappear in the runner — because "the last line is the
  summary" is true on most days, which is exactly why it cannot be left to be
  noticed. It strips comments first: the comment explaining the bug contains it.
  METHOD NOTE for the next session, cost ~15 min here: `sed -i` and passing
  regex literals as argv to node BOTH corrupt under Git Bash on this machine —
  MSYS path conversion rewrote `/markers/` to `C:/Program Files/Git/markers/`
  and `d` to `/d`. Write mutations as a small .mjs file with the strings
  inline. Also: these scripts are CRLF on disk, so a `
` in a match string
  finds nothing.
  next: nothing — closed.

- [x] SWEEP RESULT (Aug 4, the negative finding — recorded because it closes a
  question rather than opening one). After M160 found a SECOND twelve-language
  registry hiding behind the first, every other multi-language registry on the
  site was checked for the same shape. THERE ARE NO MORE. The remaining ones —
  lib/usecase-content.i18n.ts (510 KB, by far the largest data file in the
  repo), resize-presets-i18n (66), barcode-types-i18n (49), hub-i18n (33),
  convert-pairs-i18n (16) — are reached ONLY from server components:
  components/LocalizedHub / LocalizedResizePage / LocalizedConvertPage /
  LocalizedBarcodePage all begin `import Link from "next/link"` with no
  "use client", and the 510 KB one is imported only by lib/usecase-content.ts,
  whose consumers are app/use/[lang]/**, and app/sitemap.ts. A server component
  importing a 510 KB registry costs a visitor nothing.
  So the rule to carry forward is narrower than "big registries are bad": THE
  DEFECT IS A REGISTRY CROSSING THE CLIENT BOUNDARY, and the boundary is the
  only thing worth grepping for. Re-run this after adding a client component
  that renders localized content, not on a schedule.

- [x] RESOLVED BY M162 (below) — `cardTitle` was not merely dead copy, the heading was hard-coded to three languages. FOUND Aug 4 by M160's live
  probe, which asserted it and reported the ENGLISH CONTROL as broken — English
  never goes through the new loader, so a control failing is the instrument
  accusing itself, and the key turned out to be rendered nowhere.
  app/page.tsx defines cardTitle at lines 43/80/117 (en/ru/uz) and every
  lib/home-i18n/<code>.ts carries a translation of it; the only thing the hero
  card renders is t.cardSub (app/page.tsx:505). So fifteen translations are
  maintained for a string no visitor has ever seen.
  Cheap either way — render it as the card's heading (it reads like one, and
  the card currently has a subtitle with nothing above it, which is probably
  the actual bug) or delete the key from all fifteen. Look at the card first.
  Small, but it is the kind of thing the copy registries are full of and the
  probe is now the way to find more: assert a string, see the control fail.

- [x] M143's honesty pass never reached the translations, and twelve languages
  still tell visitors their files never leave the device. FOUND Aug 4 while
  splitting the copy registries (M160), filed rather than folded in because it
  is a CONTENT defect, not a bundle one — take it as the next item.
  THE CLAIM: lib/home-faq-i18n.ts, FAQ item 2. French reads "Non. Les outils
  PDF, image et QR fonctionnent entièrement dans votre navigateur — vos
  fichiers ne quittent jamais votre appareil." The authored English in
  HomeFaq.tsx reads "Mostly no. … The few that need a server — PDF compress and
  the best-quality PDF-to-Word mode — say so right on their page."
  THE DATES SETTLE IT: lib/home-faq-i18n.ts last changed 2026-07-14 (a6507ea);
  the English was corrected 2026-07-28 in 933fbc2, THE M143 HONESTY PASS
  ITSELF. So the twelve translations are pre-correction copies of the exact
  sentence M143 existed to delete, and they have been live for a week since.
  WHY IT MATTERS beyond tidiness: this is a PRIVACY claim, it is false for
  /pdf-to-word's cloud mode (which uploads the file) and for PDF compress, and
  it is the single claim most likely to decide whether someone uploads a
  sensitive document. "Never fake claims" covers translated claims too.
  NOT FIXED IN M160 ON PURPOSE: the fix is twelve translated sentences, and
  writing copy nobody here can proofread is how the fabrication got in. Shape
  it as: correct the sentence per language, and add an assertion that pins the
  translated item to the authored English one so the next correction cannot
  silently skip the other twelve — that missing link is the actual bug.
  Note M160 moves this data into lib/home-i18n/<code>.ts, so the fix lands in
  the per-language files, one sentence each.
  SHIPPED Aug 4 (7e4bec2), VERIFIED LIVE — the corrected answer is in the DOM in
  every language probed (8/8, including the RTL pair ar/ur).
  The three AUTHORED languages were stale too, in the opposite direction: they
  still named PDF compress as server-side, which M127 ended when compression
  moved fully into the browser (CompressPdfClient does it on-device; the file
  genuinely never leaves). So the English that M143 "corrected" was itself
  wrong by the time it shipped. Check the claim against the code, not against
  the last version of the sentence.
  The new copy names no tool list beyond one example, deliberately: enumerating
  which tools upload is what went stale BOTH times.
  Guard: two assertions in test:home-i18n, both baselined against the real
  defect. (1) a fingerprint of the authored English FAQ — change it and the
  test goes red until the twelve have been revisited, which is the link that
  was missing and therefore the actual bug. (2) every translated answer must
  MENTION A SERVER. The first draft of (2) banned the old sentence per language
  and FAILED ON THE CORRECTED COPY: several correct answers still contain that
  clause, now qualified ("most tools run in the browser, SO files do not leave
  — however some use a server"). A substring cannot tell a false claim from a
  qualified one; the presence of the exception can. Worth remembering the next
  time a content guard is written as a blocklist.
  next: nothing — closed.

- [x] Twelve languages had an English heading over a localized subtitle (M162,
  3101c94). SHIPPED + VERIFIED LIVE Aug 4, 8/8 languages.
  The hero card's heading was an inline ternary — `lang==="uz" ? … :
  lang==="ru" ? … : "CREATE QR CODE"` — so everything outside those three fell
  through to English, directly above a subtitle that WAS localized, on the
  most-crawled page on the site. `cardTitle` was translated in all fifteen
  languages and rendered in none of them.
  The three authored short forms stay: .qx-fcard-title uppercases in CSS
  already, and the full cardTitle is far longer in those languages
  ("СОЗДАЙТЕ ВАШ QR КОД" vs "СОЗДАТЬ QR") — long enough to wrap the narrow card
  on a phone. Nothing changes visually for en/ru/uz.
  HOW IT WAS FOUND, because the method generalises: probe:home-i18n's first
  draft asserted pageT.cardTitle for every language and reported the ENGLISH
  CONTROL as broken. English does not go through the copy loader, so a control
  failing means the instrument is accusing itself — and chasing that turned up
  a key translated fifteen times and rendered zero times. ASSERT WHAT SHOULD BE
  ON SCREEN, THEN READ THE CONTROL. Worth pointing at the other registries.
  Guard: test:home-i18n asserts the heading reads t.cardTitle AND that no
  `lang === "ru"` test survives in the heading markup — the SHAPE is the defect,
  since a ternary over `lang` is a language list nobody remembers to extend.
  Mutation verified by restoring the original ternary verbatim.

- [x] The homepage ships its copy in twelve languages nobody it serves can read
  (M160). TAKEN Aug 4, filed out of the capped CWV item the same way M155/M159b
  were: attributing the eager set before starting the homepage split found a
  cheaper target that does NOT need the owner-gated lang-cookie decision.
  THE FACT: lib/home-i18n.ts is a 56.2 KB registry holding zh hi es ar fr pt id
  de ja tr ur bn — 44.4 KB of JSON across twelve languages. NOT ONE OF THEM IS
  en, ru OR uz: those three are authored inline in app/page.tsx's T_BASE. So
  every visitor this site actually has (Yandex is 70% of referral, UZ users are
  the stickiest) downloads twelve languages of homepage copy, FAQ titles and
  newsletter strings, and uses exactly none of it. A single visitor needs
  2.8-5.7 KB of it at most.
  This is the M159 rule for the fourth time, and it is now the most reliable
  finding shape this worker has: A CLIENT COMPONENT READING ONE SLICE OF A
  CONTENT REGISTRY SHIPS THE WHOLE REGISTRY. Three client call sites each read
  one slice: app/page.tsx:153 (pageT), HomeFaq:52 (homeFaq),
  NewsletterSection:15 (newsletter).
  SHAPE: split into lib/home-i18n/<code>.ts, one per language, behind an
  async loadHomeUi(lang) that returns null for en/ru/uz — so the common case
  fetches NOTHING and an exotic-language visitor fetches only their own file.
  Deferring is safe here in a way it usually is not: `lang` is useState("en")
  read from localStorage in an effect, so EVERY non-English visitor already
  renders English first. The chunk fetch extends a flash that exists today; it
  does not introduce one. Crawlers see English, which is what they see now.
  KEEP the nav slice in the per-language files even though no client reads it —
  npm run test:nav asserts nav-i18n.ts equals it in both directions, and that
  guard is the only thing standing between the header and silent translation
  drift. The Node-side aggregate it needs must NOT be reachable from client
  code; that boundary needs its own assertion or this regresses in one import.
  SHIPPED Aug 4 (36b9f9c), VERIFIED LIVE. Homepage eager set 842.0 -> 776.1 KB
  (-65.9 KB, -7.8%), and the marker flipped YES -> no: the 170.4 KB data chunk
  is now 103.3 KB. The gap between 85.8 KB of source and 65.9 KB served is
  formatting the minifier was already removing — quote the served number.
  A SECOND registry turned up mid-scope and doubled the mission: HomeFaq
  imported lib/home-faq-i18n.ts (29.6 KB, the same twelve languages) as well.
  Both merged into one file per language, so a language is ONE request, not two
  registries. Look for the sibling registry before quoting a saving.
  THE AGGREGATE WAS DESIGNED OUT, not asserted away. The first cut emitted
  lib/home-i18n/all.ts for the Node-side tests; Node ESM then refused its
  extensionless sibling imports, and the fix — moving the reader to
  scripts/home-i18n-aggregate.mjs — turned out to be the better design anyway.
  No module a browser can reach exposes all twelve, so the boundary holds by
  construction and needs no guard. Prefer that to a guarded aggregate.
  Guard: npm run test:home-i18n (13 assertions after M161, 7 mutations). The
  switch assertion parses EVERY case, so a thirteenth language added without
  one fails instead of silently serving English. One mutation escaped the first
  draft and is recorded in the test: the call-site check matched the identifier
  `loadHomeUi`, which a file that imports it and never calls it still satisfies.
  Live proof: npm run probe:home-i18n drives production per language in real
  headless Chrome — en/de/ja/zh all render their own copy, header hydrated,
  0 page errors. curl cannot see any of this: the language is in localStorage
  and the copy arrives through import(), so every request looks English.
  next: nothing — closed. Follow-up filed: `cardTitle` is defined in all fifteen
  languages and rendered in none (app/page.tsx uses only cardSub).

- [x] RESOLVED, self-cleared, NO OWNER ACTION NEEDED — kept in full because the
  cause is a standing hazard for this worker's own habits, not because anything
  is outstanding. Production served a Vercel security challenge to non-browser
  clients for roughly 20 minutes on Aug 2 (M158).
  IT CLEARED BY ITSELF at 03:35 UTC after ~8 minutes with no traffic from this
  machine: /robots.txt and /sitemap.xml both 200 with no `x-vercel-mitigated`
  header. THAT IS THE DIAGNOSIS. Attack Challenge Mode is a manual toggle and
  does not expire on its own, so this was Vercel's AUTOMATIC, rate-triggered
  mitigation — which also settles the open question below in my favour: the
  owner did not enable anything at 02:41, this session's traffic tripped it.
  The `updatedAt: 02:41:13` on the project is consistent with Vercel writing
  the mitigation state itself.
  SO: nothing to change in the dashboard, and the push notification sent at
  03:26 asking the owner to check Attack Challenge Mode was premature — I
  should have waited for one quiet re-test before escalating, since a
  self-clearing condition is exactly what a 20-minute mitigation looks like.
  The original write-up follows, because the traffic lesson is the durable part.
  WHAT IT IS: every path — including /robots.txt and /sitemap.xml — answers
  403 with `X-Vercel-Mitigated: challenge`, `X-Vercel-Challenge-Token: …` and a
  "Vercel Security Checkpoint" body. It is UA-independent: plain curl, a Chrome
  UA and a spoofed Googlebot UA all get 403. (A spoofed Googlebot getting 403
  proves nothing about the real one — Vercel verifies crawlers by IP/rDNS, not
  by UA, so a fake Googlebot from a random IP SHOULD be challenged.)
  NOT just my IP: WebFetch, on a different network, is also 403.
  REAL BROWSERS ARE FINE. probe:modal-a11y and probe:studio both drove real
  headless Chrome through these same URLs at ~02:50 and got the real pages —
  Chrome solves the JS challenge transparently. So this is not an outage, and
  M157's live verification is unaffected and stands.
  TIMELINE, and it points at me: verify:daily curled 10 URLs successfully at
  01:54 UTC. The Vercel project's `updatedAt` is 02:41:13 UTC. First observed
  403 is 02:59. Between 02:40 and 02:55 this session ran three headless-Chrome
  probe sessions plus dozens of curls against the same handful of URLs. The
  most likely reading is that Vercel's automatic attack mitigation tripped on
  that burst and enabled the challenge project-wide. I cannot prove it from
  here, and the alternative (the owner toggled Attack Challenge Mode by hand at
  02:41) is not excluded.
  NOT ACTED ON DELIBERATELY: this is a security setting on the owner's Vercel
  project. Turning it off is the owner's call, not a growth worker's, and it is
  exactly the class of change this worker must not make unilaterally.
  OWNER ACTION WITHDRAWN (it self-cleared — see the resolution at the top of
  this item). What this said, and why it was wrong to send: "check Vercel →
  q-rix → Settings → Security → Attack Challenge Mode". There was nothing set
  there to find. Worth one GSC Coverage glance at the next KPI pass in case a
  crawl happened to land inside the ~20-minute window, but a gap that short is
  a retry for Googlebot, not a deindexing event.
  UNTIL IT CLEARS: verify:daily, recheck:sources, measure-eager-bundle and
  every other curl-based instrument report failures that are NOT real defects.
  Do not "fix" what they report. Re-test with
  `curl -sI https://qrixtools.com/robots.txt | grep -i x-vercel-mitigated`;
  no such header means it has cleared.
  LESSON FOR THIS WORKER, independent of who caused it: the verification habit
  this repo has built — probe production repeatedly, curl a dozen URLs per
  check, re-run three times for confidence — is itself a traffic pattern.
  Space the runs out, prefer one probe run over three where the question does
  not need three, and never point a poll loop at production at 30s intervals
  (which is what M157's deploy watcher did for 38 minutes).
- [x] The FOURTH English-only client tool, and it was eight tools wide.
  TAKEN + SHIPPED Aug 1 (M150 — 4275c22, d68e76a, c9bba0c). All eight clients
  behind LocalizedToolEngine now take `lang`; strings live in
  lib/tool-ui-i18n.ts. Verified live: 13/13 URLs via npm run probe:tool-i18n
  (real headless Chrome over CDP), including an English control page that the
  change never touched.
  Guard: npm run test:tool-i18n, 34 assertions. The engine assertion now parses
  EVERY case in the switch instead of a hand-listed subset, so a ninth client
  added unwired fails immediately — the subset version is what let this sit
  through two localization passes.
  Two sub-defects found while scoping, both fixed: RemoveBgClient used its
  English colour name as BOTH the accessible name and the download filename
  suffix (split into an ASCII key + localized label, and the swatches gained a
  real aria-label); ImageToTextClient's `lang` state was Tesseract's OCR
  language, renamed ocrLang so it cannot be mistaken for the UI locale again.

- [B] Author/entity E-E-A-T, remaining half: the contact address is still a
  gmail one and there is still no named human with verifiable profiles
  elsewhere. Both are owner calls — see the OWNER-GATED identity entry. The
  structure to hold them shipped in M145 and every field is one edit away.
  Escalated [ ] -> [B] on Jul 30: it had been sitting at the top of NOW while
  being unactionable by this worker, which makes every session step over it to
  reach real work. Nothing here is blocked on code. lib/operator.ts holds the
  nulls; filling one propagates to /about, the site-wide Organization schema
  and every byline at once.
- [B] Localise the study, or decide not to. /free-qr-code-generator-comparison
  is EN-only while /free-forever has RU/UZ readers, and the RU/UZ audience is
  the stickiest we have (11 pages/visit). The dataset is language-independent —
  only the six question labels, the six notes per vendor and the prose need
  translating, and the notes are the expensive part (~130 short strings). Worth
  doing only if the EN page earns impressions first; check GSC before starting.
  BLOCKED Aug 1 (M151) on the data it asks for. Ran `npm run kpi`: "no
  service-account key found" — the owner has not yet added the GSC service
  account as a user on the property, so there is no way to tell whether the EN
  page earns impressions, and the item's own precondition cannot be evaluated.
  Escalated [ ] -> [B] for the same reason the E-E-A-T item was on Jul 30: it
  had reached the top of NOW while being unactionable, and an unactionable item
  at the top makes every session step over it to reach real work.
  UNBLOCKS the moment `npm run kpi` returns rows. Nothing here needs code.
- [x] Re-check date on the study — both datasets, and the first pass found a
  wrong cell.
  TAKEN + SHIPPED Aug 1 (M153 — b1865f7 datasets + checker, 675e3b4 guard +
  corrections). Covers lib/qr-generator-study.ts (20 vendors + our own row) and
  lib/compare-sources.ts (3), as M152's follow-up asked.
  THE BLOCKER, solved first: neither dataset stored anything a machine could
  re-check. `note` is PROSE — a paraphrase of what the page said — so there was
  no string to look for. Every source now carries `evidence`: literal
  substrings copied out of the live page that must still be there for the
  reading to hold. 24 sources, 50 markers.
  `npm run recheck:sources` re-fetches all 24 and reports what vanished. It
  REPORTS, it never re-grades — a missing marker means "go look", and automatic
  re-classification is how a page starts asserting things nobody read.
  Unreachable is a separate outcome from moved, because a blocked fetch and a
  stale reading are different problems.
  Matching is RAW markup, whitespace-normalised, case-insensitive. Raw because
  M148 and M152 both turned on it — one marker here is literally an alt
  attribute, since "Watermark-free QR codes" sits next to a cross on the free
  card and a tick on the paid one, so the label alone proves nothing.
  THE FINDING: UNITAG had three wrong cells. Its "unlimited scans" line belongs
  to a €12 paid HD offer and we read it as a property of every plan — the same
  flattened-read cause as M152's ~$6 TinyWow price. Its FAQ, asked directly,
  says free codes "will stop working after being scanned a hundred times". So
  we had recorded NO scan cap on the vendor with the hardest cap in the study,
  wrong in its favour, plus an expiry question marked unanswered that its FAQ
  answers outright, plus a headline crediting the free tier with the 1200×1200
  PNG that is actually the paid download (free is 300px).
  COUNTS.scanCapped 6 -> 7, and /free-forever and the study page both followed
  with no edit because they read the dataset. The 13 did not move — Unitag was
  already counted, on its dynamic-code limit.
  ALSO: SnapTik's MP3 row was half a sentence. Its FAQ declines MP3 AND says
  audio is still downloadable via its Download Audio button; we quoted only the
  refusal, which reads as "no audio at all" — wrong AGAINST the vendor, the
  mirror of the error M152 fixed in their favour.
  Guard: npm run test:recheck, 10 assertions, 9 mutations verified. Two markers
  were rejected by its own length rule while being written ("Forever Free",
  "No Watermark" — marketing fragments that would match boilerplate forever).
  KNOWN LIMIT, recorded rather than papered over: the guard is STRUCTURAL. It
  proves every source can be re-checked; it cannot prove a verdict matches its
  evidence. Reverting Unitag's scanCap to `ok` today would pass every test —
  only a human re-reading the page catches that, which is what this pass was.
- [x] Wire `npm run recheck:sources` into the daily VERIFY pass (the item above
  always intended it; it is a one-line addition to the verify routine, but the
  routine lives in the scheduled-task file, which is the owner's). Cheap
  interim: run it whenever a session touches either dataset, and at minimum
  weekly — 24 fetches, well under a minute. It exits 1 on any moved marker, so
  it can be chained directly.
  TAKEN Aug 1 (M154). Scoped first, and the finding reframes the item: there is
  NO in-repo verify routine to wire into. `ls scripts/ | grep verify` returns
  nothing — the daily pass is a hand-run checklist in the owner's task file,
  re-executed from prose by each session. That is why its rigour visibly varies
  across DAILY_LOG entries, and it is the shape of the `/p` vs `/p$` trap that
  once blocked 27 pages: a check nobody can run identically twice.
  So the actionable half is `npm run verify:daily` — one command doing the four
  documented checks (10 newest URLs 200 + self-canonical + own non-homepage
  title, robots.txt serving `Disallow: /p$` and NOT bare `/p`, sitemap count
  against a stored baseline, IndexNow any delta) and chaining recheck:sources.
  The owner's file then only has to say "run it", which is a one-line change
  they can make whenever.
  Two scoping decisions made up front: the "10 newest URLs" come from sitemap
  lastmod, not a hand-kept list, because a hand-kept list is the thing that
  goes stale; and the sitemap baseline lives in a committed JSON file so
  "sane vs yesterday" is machine-checkable rather than a session's memory.
  SHIPPED Aug 1 (bf09a43). `npm run verify:daily` — first run green: 814 URLs,
  76 dated, robots anchored, 10 newest URLs 200 + self-canonical + own title,
  24 cited vendor sources / 50 markers / 0 moved. growth/verify-baseline.json
  is the committed snapshot.
  CORRECTION to the lastmod plan above, found while building: only 76 of 814
  URLs carry a lastmod (in practice the autopilot blog posts), so newest-by-
  lastmod ALONE cannot answer "recently shipped" — and `undefined` sorts first
  under localeCompare, which would have silently spot-checked twelve arbitrary
  /use/* pages. The target set is now newest-by-lastmod UNION everything new
  since the snapshot; the second half needs no lastmod and is the honest half.
  THE DESIGN POINT worth reusing: two rules live in scripts/verify-rules.mjs,
  pure and separately tested, BECAUSE PRODUCTION IS HEALTHY. Running the real
  pass only ever exercises the happy path and can never distinguish a working
  rule from a broken one. The robots rule proves it — the bad value is a strict
  prefix of the good one, so the obvious `body.includes("Disallow: /p")` is
  true on BOTH files and would have reported the 27-page outage as healthy.
  test:verify feeds it that exact file, plus the subtler shape where both lines
  are present.
  Guard: npm run test:verify, 14 assertions, 8 mutations verified. One of its
  own assertions was over-strict on the first run and failed on the runner's
  SUCCESS MESSAGE — a guard tripping over prose about itself, which is the M150
  comment-stripper lesson from a new direction; it now matches the logic
  (`.includes("Disallow:`) rather than the words.
  REMAINING, and it is the owner's: the routine in the scheduled-task file
  still describes the pass in prose. One line — "run npm run verify:daily and
  log its VERIFY line" — replaces the whole checklist. Left as [B] below.
- [B] OWNER, one line: point the daily VERIFY step in the scheduled-task file
  at `npm run verify:daily` instead of the prose checklist, and the weekly /
  dataset-touch source re-read at `npm run recheck:sources` (verify:daily
  already chains it). Nothing in the repo blocks this — the task file lives
  outside the repo, which is the only reason this is not already done. Until
  then sessions should run verify:daily by hand as the first act of each UTC
  day; it prints the exact "VERIFY: ok|issues" line the log wants.
- [x] One unmeasured comparative claim on /free-forever.
  TAKEN + SHIPPED Aug 1 (M151 — 9ce8018). The PROMISES card was headed "Free
  features others charge for" over vector SVG, bulk CSV, a design studio and 15
  languages; the study measured exactly ONE of those four against other vendors.
  Narrowed rather than measured: the three unmeasured questions are much fuzzier
  than the study's six ("a design studio" has no yes/no reading), so a 20-vendor
  re-sweep would have produced softer claims than the ones it replaced.
  The comparative clause now reads COUNTS; the rest are stated as claims about
  QRix alone, each verified in the repo first — SVG export exists in
  QRGenerator + QRDesignStudio, /bulk-qr takes CSV/TXT with no auth gate,
  QRDesignStudio.tsx is the studio.
  FOUND WHILE SCOPING, and it is the sharper half: "15 languages" was also
  overstated. SITE_LANGS is exactly 15 and TopNav + the homepage really render
  all 15 (NAV_I18N 12 + en/ru/uz base), but tool UI copy is EN/RU/UZ only
  (M149/M150) — so the claim is now read from SITE_LANGS.length AND scoped to
  "navigation". A reader in Japanese gets Japanese nav and an English tool.
  Guard: npm run test:study, 19 assertions, 5 mutations verified. It asserts on
  the CARDS specifically, because the table was cleaned by M148 while the same
  defect sat one screen higher — and it proves the comment-stripper did not eat
  the array before asserting anything, since M150 shipped a stripper that did.
- [x] /compare/[slug] — the competitor column is sourced now.
  TAKEN + SHIPPED Aug 1 (M152 — f969aeb dataset, 97f7d2f pages, plus a guard
  fix). Three pages held 21 head-to-head cells about NAMED products with no
  source and no date. Reading the three vendors' own pages found THREE of them
  factually wrong — which is the whole argument for sourcing: nobody could tell.
    iLovePDF  we claimed "Limited tasks/day on free tier". Its pricing page
              states no daily task cap at all; the limit it does state is file
              size per task (Merge/Split 100 MB, Compress 200 MB vs 4 GB) and
              its own Batch processing row reads Unlimited for free and paid
              alike. The $4-7/month price we quoted was the one thing correct
              (4 US$/mo annual, 7 US$/mo monthly).
    TinyWow   we priced ad-free at "~$6/month"; its page lists 20 US$/mo, or
              15 US$/mo billed yearly. The ~$6 looks like its GBP category
              plan (£5.99) read as the USD ad-free one. Its page DOES back our
              ads row — "No advertisements" is the first Premium benefit it
              sells, next to "Skip all CAPTCHAs".
    SnapTik   we credited it with MP3 support and downgraded its photo support
              to "Partial". Its FAQ says the opposite on both: it declines MP3
              because it "respects the intellectual property rights of the
              tracks", and it merges photo slideshows into MP4 automatically.
              Wrong in its favour on one and against it on the other — the
              signature of cells nobody checked.
  Also removed: the pop-under / fake-Download-button / ad-gauntlet language.
  A fetched page cannot establish what an ad slot fills with later, so the page
  now reports what the markup DOES show (3 script tags, one external host, an
  ad slot) and says the rest was not measured.
  Cells the vendor's page does not answer render a "not stated" marker instead
  of a guess — 8 of the 21. Every vendor carries a source link + read-date.
  KEPT, after checking: the PDF-to-Word FAQ's side-by-side-against-iLovePDF
  claim is real (progress.md M96). It was reworded to say it was OUR testing,
  not an independent benchmark, rather than retracted.
  Guard: npm run test:compare, 10 assertions, 8 mutations verified. The rule is
  structural — no hand-typed rows array, dataset coverage per rendered slug,
  source URL + date per vendor, nofollow outbound. Two holes that mutation
  testing found and closed: it scanned only page.tsx (so the accusation could
  return through the dataset), and once it scanned both it failed on honest
  copy, because "no interstitial, no pop-under" is OUR column saying we have
  none. Scoped to competitor cells, with a parsed-15+ check so a broken matcher
  cannot pass by seeing nothing.
  FOLLOW-UP worth doing: nothing re-reads these vendor pages. Same gap as the
  study's, and the "Re-check date" item above should cover BOTH datasets when
  it is taken — lib/qr-generator-study.ts and lib/compare-sources.ts.
- [x] Publish the "we tested 20 free QR generators" methodology page and link
  it from /free-forever (which cites it unsourced — its boldest claim).
  TAKEN + SHIPPED Jul 30 (M148, fed07d1) as /free-qr-code-generator-comparison.
  The unsourced claim was app/free-forever/page.tsx line 69: "A test of 20
  'free' QR generators found 14 had hidden limits". No such test existed, so
  the study ran first and the page's number followed it.
  METHOD, which bounds every claim on the page: each vendor's own live pricing
  and/or FAQ page fetched 2026-07-30 and read for six fixed questions, source
  linked per row, outbound nofollow. No accounts created and no cards entered
  — so nothing claims to describe behaviour inside a logged-in product — and
  any question a page did not answer is "not stated", never a guess.
  MEASURED: 13 of 20, not 14. The count is narrow on purpose: "needs an
  account" (14/20) and "vector costs money" (5/20) are disclosed at the door
  and are reported separately as friction; the 13 are limits that bite AFTER
  you print — deactivation, rationed dynamic codes, scan caps (6/20), and the
  vendor's ads reaching whoever scans your code (4/20).
  THE FINDING, and it is better than the number: all 5 static-only generators
  had nothing that could switch a printed code off, and every generator that
  hosts the destination had at least one lever. The catch arrives with the
  hosting, not with the company. QRix is graded on the same six questions in
  the same table including the row it loses (our dynamic codes stop resolving
  if this site stops running) — a comparison page that exempts itself is an ad.
  ALSO FIXED: /free-forever's comparison table held two more unmeasured
  inventions ("~100–500, then the code dies", "1–9 languages"). Every "others"
  cell is now a count derived from the dataset, and the rows nobody had
  measured were deleted rather than reworded.
  GUARD: `npm run test:study` — 18 assertions, 4 mutations verified (a
  static-only vendor gaining a kill switch, QRix exempting itself, a count
  hardcoded into JSX instead of read from COUNTS, and the fabricated sentence
  returning to /free-forever were each caught). The hardcode check is the
  load-bearing one: the failure this whole mission exists to prevent is a
  number in JSX that no dataset backs.
- [x] /convert/* + /resize/* engines: server-render the dropzone SHELL (real
  input[type=file] + labels) under the dynamic(ssr:false) hydration, so
  do-it-now pages stop serving "Loading the image workspace…" to crawlers and
  slow phones (SXO HIGH, audit: BAILOUT template in served HTML).
  TAKEN Jul 29 (M147). Scoped against production first, and the audit's wording
  is slightly off in a way that matters for the fix:
   · The served HTML does NOT contain "Loading the image workspace…". It
     contains NOTHING for the tool area. components/image/ImageEngineRegistry
     .tsx is itself "use client" and every engine is dynamic(ssr:false), and
     ssr:false renders neither the component NOR its `loading` fallback during
     SSR. So editing `loading` (registry line 6) would fix nothing server-side.
     The shell has to be emitted from the server page, OUTSIDE that boundary,
     and hidden/replaced once the client engine mounts.
   · Confirmed live on /convert/png-to-jpg and /resize/1920x1080: 0
     input[type=file], 0 <label>. The h1 and ~550-590 words of body copy DO
     render server-side, so this is the tool specifically, not the page.
  SHIPPED + VERIFIED LIVE Jul 30 (3812696). The registry now renders
  ImageToolShell on the server and on the first client render (so hydration
  matches), then swaps in the live engine on effect. Fixed at the registry, so
  it also covers /image-tools/[slug], which had the same defect and was not
  named in this item.
  Served HTML now carries 1 input[type=file] + 1 <label for> on
  /convert/png-to-jpg, /resize/1920x1080, /image-tools/{crop-image,
  color-picker,batch-convert,collage-maker} and the /ru/ + /uz/ twins, with
  `multiple` correctly set only for the batch:/layout: engines.
  Interactivity re-proved in REAL headless Chrome (see below): shell removed,
  live dropzone mounted, tool subtree hydrated on all of convert, resize,
  [slug] single, [slug] batch and the RU twin.
  INSTRUMENT WARNING, and this one nearly caused a bad revert: the in-app
  Browser pane reported this change as a total regression — shell stuck in the
  DOM, no React fiber, no dropzone — and it was wrong. It runs at viewport 0x0
  and does not hydrate tool-page main content. What caught it was running the
  same probe against a CONTROL page the change never touched
  (/image-tools/compress), which produced the identical failure signature. Any
  instrument that reports the same failure for a changed and an unchanged page
  is measuring itself. scripts/probe-hydration.mjs now exists for this: real
  headless Chrome over CDP, no new dependency. USE IT, not the preview tab, for
  anything hydration-shaped.
- [x] M147 FOLLOW-UP (M147b) — three gaps in the shipped shell, plus a
  correction to the reasoning above.
  · **The `ssr:false` claim in this entry is wrong**, measured three times: the
    `loading` fallback IS server-rendered on Next 16.2.7. "Loading the image
    workspace…" was in production's script-stripped HTML before M147 shipped,
    and it is still in /image-tools/gradient-generator's HTML today — the one
    engine the registry now skips. So editing `loading` would have worked. The
    shell is still the better shape (no dependency on an undocumented Next
    detail, and a spinner is not content), so nothing was reverted — but the
    stated reason was not the real one. A `grep` for this string must be
    case-insensitive AND must strip <script> first; that is how it was missed.
  · **RU/UZ**: the shell was English-only on the 102 localized twins — "Choose
    an image", the format hint and the noscript line all — which is the M125
    defect returning. `lang` was already in the registry's scope and is now
    passed through; prompt, hint, output line and noscript are localized.
  · **Per-URL copy**: all 242 URLs shared one boilerplate. The shell now names
    what its own engine produces, read off the key the page already passes:
    "Output: JPG" from convert:jpeg, "Natija: 1080×1080" from resize:1080x1080.
    `engineTarget()` returns null for anything it cannot name (convert:heic,
    resize:instagram, special:passport) so the line is omitted, never guessed.
  · **color:gradient** was offered a file picker for a tool with no upload —
    its own page copy says "no image upload needed". It now keeps the fallback.
  · **Guard**: `npm run test:shell` — 33 assertions, 7 mutations verified,
    including one that only hydratable SSR can catch (adjacent JSX text nodes
    are split by an HTML comment, so `{t.out}: {target}` shipped as
    "Output<!-- -->: <!-- -->JPG"; found by the live probe, not the unit test).
  Verified on a worktree dev server (port 3002) + probe-hydration.mjs on the
  changed code: 6 URLs across both families and all three languages, and
  toolAreaHydrated:true / shellStillPresent:false / liveDropzone:1 on EN, RU
  and UZ.
- [x] The shell's file input is real and enabled, so a tap before the engine
  chunk lands opens a picker whose selection is then dropped silently when the
  live engine replaces the subtree. Small window, but it is exactly the silent
  failure this repo removes elsewhere. Options: hand the File to the engine on
  mount, or mark the control busy until hydration. Slow phones only.
  TAKEN Aug 1 (M156). Confirmed against the file first:
  components/image/ImageToolShell.tsx:107 renders the input with no onChange and
  no disabled, and ImageEngineRegistry:45 renders that shell for every engine
  except color:gradient while `!hydrated`. So the window is real and it is
  exactly one thing wide: the shell is on screen from first paint until the
  registry's mount effect fires, and during ALL of that time nothing is
  listening to the control.
  OPTION (a) — hand the File to the engine on mount — is REJECTED, priced first.
  The shell's DOM node is discarded when the engine replaces the subtree, so the
  FileList would have to be captured at hydration into module scope and then
  read by each engine; there are 15+ engines behind the registry with different
  props and none takes a File. Until every one of them read it the file would
  still be dropped, so it is a wide refactor that is not complete until the last
  engine lands. Not worth it for a window this narrow.
  OPTION (b) — mark the control busy — is complete on its own and is what the
  file ALREADY does one layer over: its <noscript> block exists because with JS
  off "this control genuinely cannot do anything", and its comment says to say
  so "rather than leaving a file picker that silently swallows a selection".
  Pre-hydration is the same defect with a shorter clock. Same answer.
  SHIPPED f5b61d7, pushed to both branches, awaiting the production deploy.
  The input is disabled with an aria-describedby status line saying why,
  localized en/ru/uz. Crawler-facing markup unchanged: still input[type=file]
  with a matching label[for], and `disabled` is not something a crawler weighs.
  Guard: npm run test:shell, 39 assertions (was 33), 6 mutations verified.
  VERIFIED LIVE Aug 2 (M156b), against the exact check written above. All three
  URLs 200 and now serve `<input id="image-tool-file" type="file" accept=
  "image/*" disabled="" aria-describedby="image-tool-status" ...>` — the
  pre-deploy baseline recorded here was NO disabled attribute on any of them,
  so the diff is the fix and nothing else. Each twin carries its own status
  node: EN "Preparing the tool — one moment.", RU "Инструмент готовится — одну
  секунду.", UZ "Asbob tayyorlanmoqda — bir lahza."; the English string returns
  0 occurrences on both localized pages. label[for="image-tool-file"] still
  pairs on all three, so the crawler-facing shape is unchanged as intended.
  THE CHECK THE ITEM DID NOT ASK FOR, and it is the one that could have failed:
  curl can only ever see the PRE-hydration state, so a control left disabled
  after the engine mounts would look identical to a correct fix in every
  assertion above. Ran scripts/probe-hydration.mjs (real headless Chrome, CDP)
  against the same three URLs post-deploy: toolAreaHydrated true, liveDropzone
  1, hiddenFileInputs 1, loadingFallbackVisible false, and shellStillPresent
  FALSE on all three — the disabled shell is discarded entirely when the engine
  takes over, so the busy state cannot outlive the window it describes.
  Guard re-run on the deployed tree: npm run test:shell 39/39.
- [x] BarcodeClient a11y: label[for]+id on value input, range, checkbox,
  textarea; human-readable names for color presets ("Black", not "#000000").
  Mirror the WiFi page pattern, which does this correctly (audit MEDIUM).
  TAKEN Jul 30 (M149). Scoped against the file first, and it is confirmed:
  components/BarcodeClient.tsx has no id/htmlFor pair anywhere. The value input
  and the checkbox are inside wrapping <label>s (valid, but not what the audit
  asked for); the range at line 256, the <input type="color"> at 251 and the
  bulk <textarea> at 282 have NO accessible name at all — their captions are
  plain <div>/<span>. The six preset swatches carry aria-label={c}, so a screen
  reader announces "#7c3aed".
  BIGGER DEFECT FOUND WHILE SCOPING, same lines, so it is being fixed in the
  same pass rather than logged and left: components/LocalizedBarcodePage.tsx:50
  renders <BarcodeClient initialFormat={...} /> and never passes `lang`. The
  component takes no lang prop at all, so every RU and UZ barcode page serves
  an English tool — "Value to encode", "Bar color", "Show value under bars",
  "Download PNG", "Bulk generate". lib/barcode-types-i18n.ts's barcodeUI()
  covers only the page chrome (crumbs, headings, FAQ), not one tool control.
  This is precisely the M125 defect that M147b had to fix again for the image
  shell — third occurrence, and the pattern is always the same: a localized
  page wrapper around a client tool that was written English-only.
  SHIPPED Jul 30 (34afcfa). barcodeTool(lang) in lib/barcode-types-i18n.ts now
  holds every control string in en/ru/uz — `en` included explicitly so there is
  no fallback path that can swallow a missing translation — and BarcodeClient
  takes `lang`, namespaces its ids per language via uid(), gives every control
  an htmlFor/id pair, wraps the two button groups in role=group +
  aria-labelledby, reports aria-invalid on the value input with the error text
  referenced only while it exists, and names the swatches ("Чёрный", "Qora")
  with aria-pressed instead of announcing "#7c3aed".
  VERIFIED in real headless Chrome on EN/RU/UZ (scripts/probe-barcode.mjs, new,
  sharing the M147 CDP harness): 5/5 controls present and hydrated, the barcode
  paints (31/31/38 rects), a label click toggles its checkbox so htmlFor/id
  really pair, every control resolves an accessible name, 0 swatches named by
  hex, typing re-renders the code, 0 page errors. Server HTML: 7/7 expected
  strings per language, 5 label[for] with 0 orphans, 8 namespaced ids, no
  cross-language leakage.
  GUARD: `npm run test:barcode` — 8 assertions, 4 mutations verified. The
  load-bearing one asserts RU/UZ do not equal EN: an untranslated string is
  invisible to review unless something compares the languages to each other,
  which is precisely how this survived two localization passes.
  FOLLOW-UP worth doing while the lesson is fresh: this defect has now appeared
  three times (M125, M147b, M149) and the shape never changes — a localized
  page wrapper rendering a client tool that takes no lang. A repo-wide sweep
  for `<XClient` rendered from a Localized* wrapper without a lang prop would
  find the fourth before a reader does. Added to NEXT.
- [x] Blog Article schema — done in M145 (merged into it; same audit family).
- [x] hreflang on /convert — NOT A DEFECT, closed Jul 28 with evidence. The
  audit reported /convert/png-to-jpg as emitting no hreflang. It emits four, and
  so do resize, barcode and downloader (verified live, 4 each), with every
  declared twin resolving 200: /convert/png-to-jpg, /ru/…, /uz/… all 200, same
  for /resize/1920x1080 and /barcode.
  The finding was a MEASUREMENT BUG, and it is one this repo will hit again:
  React/Next SSR emits these attributes in camelCase — `hrefLang="en"`, and
  `dateTime="…"` on <time> — so `grep -o 'hreflang='` returns nothing while
  `grep -oi` returns four. HTML attribute names are ASCII case-insensitive, so
  every conformant parser (browsers, Googlebot) reads them correctly; only a
  case-sensitive regex sees a problem. This session independently tripped over
  the same thing and briefly believed the new blog-index dates had not rendered.
  ALWAYS grep -i for HTML attributes, and prefer parsing over regex. Two related
  traps that produced wrong numbers here on the same day: `grep -c` counts
  matching LINES not occurrences (144 matches read as 2 on minified HTML), and
  any count over a Next.js response double-counts because the RSC flight payload
  inlines the same text inside a <script> — strip script tags first.
  Worth a line in the Monday audit prompt: findings must be verified
  case-insensitively before being written up.
- [x] CWV follow-ups from audit: long-cache headers for /scenes/*, trim 6 font
  families toward 3, dedupe the double Bricolage preload, width/height on the
  3 hero imgs. TAKEN Jul 28 (M146) as the next tranche of the CWV mission,
  because the [~] CWV audit item's own remaining lever is owner-gated (the
  lang-cookie decision) and this one is measurable as HEADERS and BYTES, which
  the CAUTION note says is the only trustworthy instrument on this machine.
  Scoped live before starting, and item 1 is much bigger than written:
  EVERY non-font static asset serves `public, max-age=0, must-revalidate` —
  /scenes/* (~10 MB incl. bunny-hero.webp 103 KB, the homepage LCP element),
  /world-dots.svg (206 KB, preloaded as an image on the homepage) and
  /pdf.worker.min.js (1.2 MB, refetched on every PDF tool visit). Only
  /fonts/*.woff2 is immutable. next.config.ts:41 is the rule that got it right.

  ALL FOUR BUILT Jul 29, in two commits (26ff03b, 1779da6). Each was
  re-verified live first, and two of the four were NOT what the audit said:
   1. Cache headers — confirmed and shipped. 30d + stale-while-revalidate
      rather than `immutable`, because these names are not content-hashed and
      bunny-hero.webp was re-encoded in M136. /sdk/qrix.js got a separate
      600s rule: it runs in third-party pages, so a bad build cannot be pulled
      by editing our own HTML, and max-age is hard freshness — under the 30d
      rule a fix would not even be revalidated for a month. sw.js, llms.txt and
      the IndexNow key are deliberately excluded.
   2. "Trim 6 families toward 3" — only ONE family was free to remove, and the
      audit did not name it. Oswald was the 2nd entry in all three stacks it
      appeared in, behind self-hosted Unbounded (x2) and Anton (x1), so it
      could only ever be reached by a failure that would take it down too. It
      never painted. Removed: fonts.css 32,870 -> 28,572 bytes off the
      render-blocking path, 80 KB of woff2 deleted, and dropped from
      scripts/fetch-fonts.mjs so it cannot return on regeneration. The other
      five all genuinely paint (Bricolage/Inter body+display, Space Mono
      .qx-mono, Unbounded homepage h1, Anton category marquee) — going to 3 is
      a DESIGN decision and is left to the owner, not taken here.
   3. Duplicate preload — real, but there is only one call site in the repo.
      Rendering <link rel="preload"> inside an explicit <head> makes React emit
      both its hoisted copy (byte 186) and the literal JSX (byte 663).
      ReactDOM.preload() emits only the hoisted one.
   4. width/height on the 3 hero imgs — done, but honestly this is correctness,
      NOT a CWV win, and the audit overstated it: two of the three are
      position:absolute at width/height 100%, so the attributes cannot move
      layout, and CLS has been 0 since M135. Only .qx-gm-media (width:auto)
      needed the ratio.
  CLOSED Jul 29 — all four verified on production after deploy:
   · headers: /scenes/bunny-hero.webp, /world-dots.svg, /pdf.worker.min.js,
     /qrix-logo.png, /qrix-brand-film.mp4 all now
     `public, max-age=2592000, stale-while-revalidate=31536000`; /sdk/qrix.js
     on its own `max-age=600, swr=604800`; and the three deliberate exclusions
     held — /fonts/*.woff2 still `immutable`, /sw.js and /llms.txt still
     `max-age=0, must-revalidate`.
   · Oswald: 0 occurrences in the served CSS bundle, @font-face 90 -> 80,
     /fonts/oswald-normal-600-latin.woff2 now 404. The five families that do
     paint all still ship (Unbounded 17 declarations, Anton 4, Bricolage 19,
     Inter 35, Space Mono 13) and unbounded/anton woff2 still 200, so the
     homepage h1 and the category marquee are untouched.
   · preload: 2 -> 1.
   · imgs: all three now carry width/height (119x60, 613x1876, 471x1080).
   · /, /qr-tools/url, /pdf-tools, /convert/png-to-jpg all 200 with correct h1.
     Sitemap unchanged at 809, so nothing to submit to IndexNow.
  LESSON for the Monday audit: 2 of these 4 findings were misstated. "Trim 6
  families toward 3" named no family and only one was actually free; "3 hero
  imgs missing width/height" was true but inert, since two of the three are
  position:absolute at 100%/100% and CLS has been 0 since M135. Audit findings
  are leads, not work orders — scope each against production first.
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
  TopNav's markup split was scoped next and is NOT worth taking — recorded here so
  nobody scopes it twice. The M137 ToolPageShell split worked because that
  component was client for TWO lines. TopNav is client for essentially all of it:
  a moving hover pill tracked with refs and measured geometry covers every desktop
  nav link (so the links cannot be static markup), and every visible label reads
  from `lang`, which is loaded from localStorage in an effect. Between them the
  logo is about all that could move to the server. The note below about labels
  being the constraint was right but understated it — the constraint is the pill
  as much as the labels.
  EIGHTH TRANCHE TAKEN Aug 1 (M155), and it is NOT the homepage split — the
  split stays next, but attributing the eager set before starting found a
  cheaper target and an instrument bug, and both are worth taking first.
  ATTRIBUTION of the homepage's 969.8 KB eager set (chunk by chunk, markers out
  of each module's own data):
    226.3 KB  Next/React framework runtime
    170.4 KB  the site's data modules (home-i18n + nav-i18n + qr-tools-meta +
              world-map) — HOME_I18N stays, app/page.tsx genuinely uses it
    134.5 KB  react-dom
    110.0 KB  legacy polyfills — served `noModule`, SO NO MODERN BROWSER
              FETCHES IT (see the instrument note below)
     53.5 KB  Next router · 53.2 nav+tool labels · 43.0 Next internals
     39.1 KB  react-icons base · 36.5 QRDesignStudio · 31.2 Next internals
     22.0 KB  react-icons/si · 13.9 downloader-platforms · rest <14 KB
  THE INSTRUMENT BUG, and it has been inflating every number this item records:
  scripts/measure-eager-bundle.mjs counted `0cz1d0mv5g_q7.js` (110.0 KB), which
  the HTML serves with `noModule` — the legacy bundle, which every browser that
  supports modules skips. So the homepage's real eager set for a real visitor
  is 859.8 KB, not 969.8, and /qr-tools/url is 680.0, not 790.0. The deltas
  this item claims are all still correct (the polyfill is a constant on both
  sides of every comparison); the absolute figures were 110 KB too high.
  Note HOW it hid: React SSR emits the attribute as `noModule=""`, camelCase,
  so a case-sensitive grep for `nomodule` finds nothing. That is the FOURTH
  appearance of the camelCase-attribute trap (hrefLang, dateTime, the blog
  index dates, now this) — grep -i for HTML attributes, always.
  THE TARGET: QRDesignStudio is 36.5 KB raw and it is eager on the homepage AND
  on all 40 /qr-tools/* routes (app/page.tsx:16 and QRGenerator.tsx:6 both
  import it statically), i.e. on the two templates that matter most. It is a
  MODAL — `{designOpen && <QRDesignStudio/>}` at both call sites — so the only
  thing that can ever reach it is a click on "Customize Design". Textbook
  defer-on-intent, the M138/M139 shape. Its own heavy libs (qr-code-styling,
  jsqr, jspdf) are already dynamically imported inside it; the 36.5 KB is the
  component itself.
  SHIPPED AND VERIFIED LIVE. Measured on production, before and after:
    /              859.9 -> 840.7 KB   18 -> 17 eager scripts
    /qr-tools/url  680.1 -> 661.0 KB   17 -> 17 eager scripts
  and the "Classy R." marker went YES -> no on both. Note the arithmetic,
  because the headline is NOT the chunk size: the studio's own 36.5 KB chunk
  left the eager set entirely, but Turbopack rebalanced — the
  downloader-platforms chunk went 13.9 -> 31.2 KB, absorbing ~17.3 KB of code
  the studio had been co-located with and which the page genuinely shares (the
  react-icons subset, lib/save-file). Net -19.2 KB per homepage view and
  -19.1 KB on all 40 QR tool routes. Predicting 36.5 and reporting 19.2 is the
  difference between reading the chunk list and reading the diff.
  Live probe, three consecutive green runs on both URLs: warm 500 ms, open
  250 ms, reopen ok, 3/3 studio markers, live canvas + colour inputs, zero page
  errors. / + /qr-tools/url + /qr-tools/wifi all 200, self-canonical, titles
  intact. Sitemap unchanged at 814, so nothing submitted to IndexNow.
  (2be221f loader + guard + instrument, bedf9da probe + a11y, 0e59099 the
  reopen fix, 5e60a2e the probe hardening). The
  studio now arrives through components/QRDesignStudioLoader.tsx, warmed on
  pointerenter/focus of the "Customize Design" button so the click does not
  stall — deferring a modal behind its own onClick would trade bytes for a
  visible pause, and CLAUDE.md says only improve. The chunk is cached at module
  scope, so reopening is free, and a rejected fetch is a visible state with a
  retry rather than a dead button (f212ba2's point: a dynamic import can fail
  where a static one cannot).
  Guard: npm run test:layout, now 17 assertions, 7 mutations verified. TWO of
  the new assertions were written too loose and BOTH survived their first
  mutation, which is worth recording because they are the two classic shapes:
  `/\.catch\(/` matched warmDesignStudio's own swallow-catch on a file whose
  load path had lost its rejection handler (the marker was not unique to the
  thing being asserted — the same error as M138's "onAuthStateChange"), and
  `/setAttempt/` matched `setAttemptX`, the substring trap, in a guard whose
  entire job is to notice a rename. Assert the STATE a failure must produce,
  and use word boundaries.
  THE BUG THE FIRST PROBE COULD NOT SEE, and it shipped: the loader initialised
  its state as useState(cached). A component IS a function, and React treats a
  function initial value as a lazy INITIALIZER and calls it — so once the chunk
  was cached at module scope, REOPENING the studio invoked QRDesignStudio
  outside of rendering and threw. The first open is unaffected, because the
  cache is still empty there. It was live for one deploy and was caught on
  production only after the probe was extended to close and reopen. Keep the
  general form: a probe that exercises a cached path once exercises only its
  uncached branch.
  Probe: npm run probe:studio, real headless Chrome on production, because the
  byte measurement cannot tell a working deferral from a dead button — the
  studio's markup was never in the server HTML even before the split, so curl
  sees a byte-identical page. It asserts the chunk is absent on load, that
  hovering fetches it, that the chunk which arrives really is the studio (it is
  re-fetched and checked for the studio's own data markers), and that the modal
  then renders a live canvas and a colour input with zero page errors.
  A11Y DEFECT found by writing that probe, and fixed in the same pass because
  M155 introduced the inconsistency: QRDesignStudio is a full-screen modal that
  carried NO role, NO aria-modal and NO accessible name, so a screen reader was
  never told it opened — while the new loader placeholder announces itself as a
  dialog. Three attributes on the studio root close that. Found because the
  probe's first `[role="dialog"]` selector matched the COOKIE BANNER, which
  carries the role on every page: a generic role selector on a page with more
  than one dialog is not a selector for anything.
  next after this: the honest next lever is the HOMEPAGE SPLIT (app/page.tsx is one giant
  "use client" component, ~800 lines of imports at the top), which the note below
  already calls the biggest single CWV item left and a mission of its own. Take
  that, not TopNav. HOME_I18N stays; app/page.tsx genuinely uses it.
  SCOPED during M141's deploy wait (read-only, nothing changed). app/page.tsx is
  1004 lines with ~74 interactive touchpoints, and the shape of the split is set
  by ONE fact: `lang` is useState at the top of the page and is threaded down as
  a PROP into TrustedBy, HomeFaq (lang={lang}), ReviewsSection, PricingTeaser and
  LatestPosts (ternaries inline at the call site). Those five cannot move to the
  server while the language is a client state read from localStorage — the same
  constraint that killed the TopNav split, and it is worth checking BEFORE
  planning a section-by-section move. CategoryShowcase is the exception: rendered
  at line 712 with NO props, "use client" with zero hooks, so it is already
  static markup wearing a client directive, and the same is true of TrustedBy and
  LatestPosts once their heading strings are handled. Realistic shape: app/page
  becomes a server component that renders <HomeHero> (the QR generator, 20+
  useStates, genuinely client) and passes the static sections through as
  children — server components CAN be passed as children into a client component,
  which is the lever that makes this possible at all. Do NOT start by making the
  sections server components: while the page itself is "use client", every one of
  its imports is client no matter what it declares.
  RESUMED Jul 28 and the blocker is now named precisely, which turns this from
  "big refactor" into "one decision the owner owes us". The reason `lang` cannot
  move to the server is not the homepage at all — it is HOW THE LANGUAGE IS
  PERSISTED. It lives in localStorage (lib/lang.ts readLang) and has four
  writers, which split into two camps:
    TopNav:176 and Sidebar:47   setLang() + localStorage + dispatch "qrix-lang"
                                — an INSTANT in-page switch, no reload.
    CommandSearch:76            localStorage + location.reload()
    PrefsClients:136            localStorage + reload after 700 ms
  So two of the four already pay for a full reload and two do not. A server
  component cannot read localStorage, so server-rendering any localised section
  requires the value in a COOKIE — and that is the decision: the primary
  switcher (TopNav, in the chrome on every page) would go from instant to a
  server round trip. router.refresh() is the intended tool and keeps client
  state, so it is ~100-300 ms rather than a white flash, but it is still a
  visible change to a working feature and CLAUDE.md says only improve. Not a
  unilateral call — see the OWNER-GATED entry added for it.
  Worth it because the cookie unblocks TWO rejected missions, not one: the
  homepage's five lang-prop sections AND the TopNav split, which was rejected
  partly because "every visible label reads from `lang`". The moving hover pill
  is a separate reason TopNav stays client, so TopNav would only partly unlock.
  Until that is answered, this item's remaining CWV work is capped: the homepage
  can still be split around the HERO (the QR generator is genuinely client and
  ~20 useStates), which is worth doing on its own, but the five localised
  sections below the fold stay client either way.
  After that, the remaining hydration weight in the ROOT
  LAYOUT, which mounts eleven client components on every page in the site:
  TopNav (400 lines), DotDistortionBackground (393), CommandSearch (234),
  MotionLayer (196), CookieConsent (80), ErrorMonitor (59), Toaster (49),
  PwaVitals (43), HtmlLangSync (34), GoogleAnalytics (26), ReferralCapture
  (23). CommandSearch is off that list as of M138 (it is CommandSearchLoader
  now, and only arrives on ⌘K).
  Sixth tranche (M163, a2c0849) took TopNav's MARKUP, which is what M138 left
  behind: the 50-entry DROPDOWNS mega-menu (a react-icons element per entry,
  built at module scope), the account menu body and the mobile sheet's account
  grid — 24 of its 29 icons, none of them reachable without a hover or a tap,
  all of them in the eager set of ~800 pages. Now components/nav/NavPanels.tsx
  behind three dynamic imports sharing one chunk, warmed by the gesture BEFORE
  the opening one (entering the nav bar / approaching the account button /
  pressing the burger), the M155 shape. Measured on production, canary intact
  on every read: / 776.4 -> 766.4 KB, /qr-tools/url 662.3 -> 652.3 KB, 17 eager
  scripts either side. -10.0 KB on every page on the site, identical on both
  templates, which is what a root-layout component should look like — and much
  less than the entry count suggests, because icon components are small SVG path
  functions and the registry is mostly short strings. Counting entries is not
  counting bytes.
  IT COST AN INTERACTION AND THE FIRST FIX WAS WRONG: probe:nav-panels timed the
  first homepage mega-menu at ~1000 ms after hover against ~500 ms on a tool
  route, so an idle warm was added and shipped on that ONE reading. Replicated
  against the same build, the homepage read 500/1000/1250/1500/1500/1750 ms —
  median ~1375, and the 1000 ms it was meant to beat was simply a low sample of
  that spread. The idle warm bought nothing and was reverted; the mechanism says
  it never could, because requestIdleCallback cannot fire while the main thread
  is saturated and this page hydrating IS the saturation.
  This is the CAUTION note two hundred lines below, disregarded by the session
  that wrote it down: single-run comparisons on this machine are worthless, and
  that applies to interaction timings and not just Lighthouse scores. Measure
  twice per side BEFORE shipping the fix, not after.
  AND THE RE-MEASUREMENT AFTER THE REVERT UNDERCUT EVEN THAT: post-revert the
  homepage read 4000/500/500/750/500/1750 ms, median ~625, against ~1375 for the
  idle-warm sample. Read literally that makes the idle warm 2x WORSE, which is
  as unbelievable as the original claim. The instrument spans 500-4000 ms and
  its median moves 2x between sampling sessions, so it CANNOT RESOLVE the effect
  at all — the variance is this machine, not the build. The revert therefore
  rests on mechanism (an idle callback cannot fire under saturation) and cost
  (every desktop visitor fetches a chunk they may never open), both of which
  hold with no measurement. Anyone revisiting this needs a better instrument,
  not more runs of this one.
  WHAT REMAINS TRUE AND UNFIXED: the homepage first hover is ~0.6-1.4 s median
  depending on when you sample and spikes to 4 s
  (tool routes are a steady 500 ms, the account menu 500 ms, mobile 250 ms).
  Its cause is app/page.tsx being one giant "use client" tree, so it belongs to
  the homepage-hydration item below, which is already the biggest open CWV item
  — not to a second warm in TopNav. test:layout now asserts AGAINST re-adding
  one, with the numbers, so the next session has to bring evidence to undo it.
  Where the split deliberately STOPS: the ten primary nav links, on both
  breakpoints. A dynamic import can fail and on a phone the mobile sheet is the
  only navigation there is, so everything deferred degrades to "a menu did not
  open", never "the visitor is stuck". test:layout asserts that boundary (five
  new checks, 40/40, all six mutations caught) — do not "finish the job" by
  moving the link list too.
  STILL OPEN on TopNav, and it is the harder half: the component still hydrates,
  because the header markup itself is client. The constraint that blocks the
  obvious fix is unchanged — labels come from localStorage via setLang, so the
  server cannot know the language and a naive "make it a server component" will
  not work. The label-bearing parts have to stay client; what could still move
  is the static link markup around them (the ToolPageShell split of M137).
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
- [x] Modal a11y beyond the announcement, and QRDesignStudio is only the case
  that surfaced. M155 gave it role/aria-modal/aria-label because it introduced
  the inconsistency, and deliberately stopped there rather than widen a CWV
  mission: the studio still has NO focus trap, NO Escape-to-close and does not
  restore focus to the "Customize Design" button when it closes, so a keyboard
  user who opens it is left tabbing through the page behind it. Check the other
  modals in the same pass before writing anything — CommandSearch (has the role,
  unknown on the rest), the DashboardClient menu, and any dialog CookieConsent
  siblings — because a shared useModal hook is almost certainly the right answer
  and three one-off fixes is the wrong one. Cheap, no measurement needed, and it
  serves P0's "everything honest" as much as E-E-A-T does.
  TAKEN Aug 2 (M157). Taken ahead of the CWV [~] epic deliberately, and the
  reason is recorded so nobody re-litigates it: that item has been [~] across
  eight tranches by design — it is a standing epic, not a half-finished change
  — and its one unblocked lever left is the homepage split, which the item
  itself calls "a mission of its own" and whose localized half waits on the
  owner's cookie-vs-localStorage decision. Resuming it would mean opening that
  mission, not finishing this one.
  THE SWEEP, done first as the item asked, and it found a SIXTH modal plus a
  trap that would have broken a working feature.
  Grepping for role="dialog" finds only the dialogs that already know they are
  dialogs — the exact blind spot that let this item exist. Swept for the
  OVERLAY SHAPE instead (`fixed inset-0` on a non-decorative element), which
  found two more nobody had marked up at all:
    QRDesignStudio         role/aria-modal/name (M155) · no Escape/trap/restore
    QRDesignStudioLoader   role/aria-modal/name        · no Escape/trap/restore
    CommandSearch          role + Escape + autofocus   · no trap/restore
    DashboardClient drawer role/aria-modal/name        · no Escape/trap/restore
    AiKit BeforeAfter      NO ROLE AT ALL              · nothing
    DesignPanel            NO ROLE AT ALL              · nothing — DEAD CODE
    CookieConsent          role, deliberately NOT modal — left alone on purpose;
                           a focus trap on a banner that appears at page load
                           would be hostile, and it is not a modal.
  DesignPanel has ZERO importers anywhere in app/ or components/. Not deleted
  (CLAUDE.md), not fixed either — the guard allowlists it WITH a re-check that
  it is still unimported, so the exemption dies the moment anything uses it.
  THE TRAP, found by reading before writing, which is why the item said to:
  CommandSearch's input binds Tab to CYCLE ITS FILTERS and calls preventDefault.
  A focus trap that moves focus on every Tab would have silently taken that
  feature away. The hook ignores `e.defaultPrevented` for exactly this — if a
  component already handled the key, the trap does not second-guess it.
  SHIPPED c7ef0d0 (hook + 6 wirings + guard) and 8a1ca38 (probe).
  lib/use-modal-a11y.ts is the single implementation; the four things that are
  easy to get wrong are all in it: capture the trigger BEFORE focus moves
  inside, survive the trigger unmounting (isConnected), let only the TOPMOST
  dialog answer Escape (a module-level stack), and stand down on defaultPrevented.
  Guard: npm run test:modal-a11y, 46 assertions, 11 mutations verified. It
  REDOES THE SWEEP on every run rather than asserting over a hand-listed set,
  so a seventh modal added without a11y fails on the day it lands — the M150
  lesson. It earned that immediately: it FAILED on first run and the failure was
  real, QRDesignStudioLoader, which I had not wired. That dialog has no
  focusable control in it at all (it is one <p>), so Escape is the only way out
  of it and there was none.
  VERIFIED LIVE Aug 2, and every field of the probe flipped. Same instrument,
  same two URLs, before and after the production deploy:
    before  focusMovedIn FALSE · tabsHeldInside 0 (focus left on Tab #1) ·
            escapeClosed FALSE · focusRestored FALSE
    after   focusMovedIn TRUE  · tabsHeldInside 10 · escapeClosed TRUE ·
            focusRestored TRUE · 0 page errors
  Green on / and /qr-tools/{url,wifi,vcard} — the homepage included, which
  matters because its QR card levitates and M155's mouse-driven probe was
  flaky there; this one drives the keyboard, so the drift is irrelevant.
  REGRESSION CHECK, because this mission edited both studio files: npm run
  probe:studio still 2/2 — warm path, studio chunk, 3/3 markers, 12 canvases,
  2 colour inputs, REOPEN OK, 0 errors. M155's deferral is untouched.
  A NOTE ON WAITING FOR THE DEPLOY, since it cost time twice: the GitHub commit
  status reads "Deployment has completed" for the design-v2 PREVIEW, minutes
  after the push, while production is still BUILDING — and the preview is
  behind Vercel SSO (302), so it cannot be probed. Use the Vercel deployment
  list and look at `target: "production"`, not the GitHub status.
  And the fingerprint I picked to watch for the new build — the md5 of the page's
  chunk filename set — NEVER CHANGED ACROSS THE DEPLOY. Turbopack chunk names
  here are not per-build hashed, so it could not distinguish the builds at all;
  it is the same class of error as every instrument note in this log. The
  deployment API's readyState is the honest signal.
- [x] Re-audit which OTHER click-gated components ship eagerly. M155's finding
  was not that QRDesignStudio is special — it is that a modal rendered as
  {open && <X/>} looks perfectly deferred and is not, and nothing in the type
  system or a Lighthouse score says so. The attribution method is now cheap
  (scripts/measure-eager-bundle.mjs + a marker out of the module's own data),
  so sweep the tool templates for the same shape: anything behind a boolean that
  only a click can flip. Start from the PDF/image tool clients, which are the
  other 46 routes. Do NOT defer anything a crawler must see — M139's rule holds:
  defer on INTENT, inline on PAINT.
  SCOPED Aug 2 during M157's deploy wait (read-only, nothing changed), and the
  item looks SMALLER than it was filed as. Swept components/ for the
  `{flag && <Component/>}` shape. On the PUBLIC tool routes every hit is a
  PAINT gate, not an intent gate — `{!img && <AiDropzone/>}`, `{!beforeUrl &&
  <AiDropzone/>}`, `{!live && <CloudNotice>}` — i.e. the thing renders on
  arrival and disappears once you act. M139's rule says inline those, so they
  are correctly NOT deferred and there is nothing to win there.
  The one genuine intent-gate found is `{tab === "analytics" && <AnalyticsBoard
  />}` in components/admin/AdminPanel.tsx. Deprioritised, not taken: /admin is
  owner-only and noindex, so it serves no P0 KPI. (AnalyticsBoard itself does
  NOT import recharts — the three recharts importers are AnalyticsChart,
  DashboardChart and DashboardClient, all behind auth.)
  CAVEAT, and the item should not be closed on this alone: a source sweep is
  not a byte measurement. The M155 finding was that a statically imported
  module is eager no matter how it is RENDERED, so the honest version of this
  item is measure-eager-bundle attribution per template, not a grep. What the
  grep does establish is that the obvious `{open && <Heavy/>}` shape is not
  sitting unnoticed on the public tool routes.
  TAKEN then PUT BACK Aug 2 (M158), unstarted — no code touched, marker reverted
  [~] -> [ ]. The byte-attribution half cannot run: measure-eager-bundle fetches
  the page with plain HTTP and production is answering 403 to every non-browser
  client (see the challenge item at the top of NOW). It reported "0 eager
  scripts, 0.0 KB" on all three templates with every marker absent — INCLUDING
  the nav-label marker its own comment says must always be present, which is
  what gave the instrument away rather than three templates appearing to ship
  no JavaScript. Worth hardening whenever this is next taken: the script should
  fail loudly on a non-200 or a zero-script page instead of reporting 0.0 KB,
  because "measured nothing" and "there is nothing" print identically today.
  RESUME when the challenge header is gone.
  RETAKEN AND CLOSED Aug 2 (M159), and the CAVEAT above was right: the source
  sweep missed the biggest instance on the site, because it looked for the wrong
  shape. `{open && <Heavy/>}` is only ONE way to be click-gated. pdf-lib was
  gated behind a click with no boolean anywhere — the gate is that the FUNCTION
  cannot run until a file exists — so no grep for a render condition could find
  it. Byte attribution found it in one command:
    /pdf-tools/merge  1065.0 KB   /pdf-tools/split      1064.8 KB
    /pdf-tools/rotate 1047.0 KB   /pdf-tools/compress    652.6 KB
    /image-tools/compress 634.2   /convert/png-to-jpg    644.9 KB
  compress is the tell. It is the ONE PDF client that already loaded pdf-lib
  through import(), and it sat with the image and convert templates while its
  eleven siblings carried ~400 KB more: pdf-lib itself (219.0 KB) plus
  @pdf-lib/standard-fonts (151.9 KB of base64 AFM metrics it drags behind it).
  GENERALISE THIS, it is the durable half: the M155 rule was "a statically
  imported module is eager no matter how it is RENDERED". The rule is bigger —
  eager no matter how it is REACHED. A grep can only find gates that are visible
  as markup; measure-eager-bundle finds them all, and it is one command per
  template. Attribute first, grep second.
  SHIPPED: thirteen clients now go through lib/pdf-lib-loader (eleven pdf-lib,
  two the @cantoo fork for encrypted PDFs). Measured on production after deploy:
    merge 1065.0 -> 651.6 KB   split 1064.8 -> 651.5   rotate 1047.0 -> 633.6
    watermark 634.1   protect 634.2   (every PDF route now sits with the image
    and convert templates, which is where compress already was)
  ~413 KB off each of ~20 PDF tool routes. Controls unmoved: /qr-tools/url
  662.3, /image-tools/compress 634.2.
  Guards: test:layout 22 -> 33 assertions (one of the new ones SURVIVED its
  first mutation — `/pdfLib = null;/` matches `// pdfLib = null;`, the same
  substring trap as M155's setAttemptX; anchored and re-mutated three ways).
  probe:pdf-defer is the one that matters: real headless Chrome drives a 3-page
  fixture through the real file input on production and asserts pdf-lib is
  absent from the loaded scripts BEFORE the file and present after, that the
  tool renders "3 pages", and 0 page errors. Its BASELINE run against the
  pre-split build failed exactly where it should, naming both chunks — an
  instrument that cannot fail proves nothing. 6/6 routes green after deploy
  (watermark, rotate, protect, split, page-numbers, delete-pages), and protect
  pulled a DIFFERENT chunk, which is how the @cantoo path proved separately
  wired.
  Follow-up recorded, not taken: the remaining eager weight on a PDF route is
  now the same ~630 KB baseline every template carries (framework + react-dom +
  nav/tool labels + react-icons), which is the homepage-split item's territory,
  not this one's.
- [x] Attribute the eager set of every template type that has never been
  measured. Filed straight out of M159, which is the whole argument for it: the
  source sweep that preceded M159 concluded the public tool routes had nothing
  to win, and it was wrong by ~413 KB on twenty routes, because pdf-lib was
  click-gated with no boolean anywhere for a grep to find. measure-eager-bundle
  is one command per template and now fails loudly instead of lying, so the
  honest version of "what else is eager" is to run it everywhere rather than to
  reason about it. Measured so far: / 840.7 · /qr-tools/url 662.3 ·
  /image-tools/compress 634.2 · /convert/png-to-jpg 644.9 · all /pdf-tools/* now
  ~634-652. NEVER MEASURED: /pdf-tools/ocr (tesseract), /pdf-tools/pdf-to-word,
  /image-tools/{remove-bg,upscale,image-to-text}, /bulk-qr, /downloader,
  /barcode, /link-in-bio, a /blog/<post>, /qr-code-statistics. Rank by delta
  against the ~630 KB baseline every template carries; anything materially above
  it is a candidate, anything at it is the homepage-split item's territory.
  Serves P0 (CWV green on the template types).
  SWEPT Aug 2, seventeen templates, every figure measured on production. Raw
  eager KB, excluding the noModule legacy bundle no module-capable browser
  fetches:
      840.7  /                      724.7  /barcode         <- the only outlier
      680.9  /link-in-bio           662.3  /qr-tools/url
      661.7  /pdf-tools/pdf-to-word 658.0  /image-tools
      652.0  /pdf-tools/ocr         651.6  /pdf-tools/merge
      651.5  /qr-code-statistics    649.3  /image-tools/remove-bg
      649.1  /image-tools/upscale   644.9  /convert/png-to-jpg
      644.9  /resize/1920x1080      638.3  /downloader
      634.2  /image-tools/compress  633.6  /pdf-tools/rotate
      626.3  /blog/<post>           624.4  /bulk-qr
      617.1  /free-forever          617.1  /about
  THE RESULT IS MOSTLY A NEGATIVE ONE, and that is worth as much as a finding:
  fifteen of seventeen sit in a 617-662 KB band, i.e. on the shared floor
  (framework + react-dom + nav/tool labels + react-icons) with only their own
  page's code on top. tesseract (/pdf-tools/ocr), the AI image tools and the
  downloader are all already dynamic — there is no second pdf-lib hiding.
  /barcode was the one real outlier and it is fixed, see the item below.
  /link-in-bio at 680.9 is the only other page above the band; its extra is one
  28.9 KB chunk, too small for a mission of its own but worth a look for anyone
  already in that file. The homepage's 840.7 is the homepage-split item.
  CLOSED — the sweep answered its question. Re-run it after any mission that
  adds a template, not on a schedule.
- [x] /barcode's tool labels dragged the whole localized page registry (M159b,
  found by the sweep above and fixed the same session). BarcodeClient is a
  CLIENT component, so importing barcodeTool() out of lib/barcode-types-i18n put
  that entire registry — per-symbology copy, caveats and two FAQs per format in
  three languages, plus lib/barcode-types which it filters — into the eager
  bundle of /barcode AND every /barcode/<type> route in EN, RU and UZ. The
  tool's controls reach none of it: the extracted block has zero references to
  the registry, which is why it could move whole into lib/barcode-tool-i18n.ts
  (7.2 KB; the registry keeps 50.7 KB for the server pages). Exactly the
  nav-i18n extraction one template over — the third time this shape has cost
  real bytes, and the pattern is now worth stating outright: A CLIENT COMPONENT
  READING ONE SLICE OF A CONTENT REGISTRY SHIPS THE WHOLE REGISTRY. Guard:
  test:layout 33 -> 35. The assertion that matters is the second one — the slice
  must not re-import what it was split from — because that failure renders
  identically and only the bytes come back.
  VERIFIED LIVE after deploy: /barcode 724.7 -> 645.6 KB, /barcode/code-128
  645.6, /ru/barcode/code-128 634.1 — inside the 617-662 band with every other
  template. probe-barcode green in all three languages (hydrated, every control
  present AND named, bars painted, re-render on typing, 0 page errors) — "named"
  is the assertion that would have caught a lost string, and it is why the probe
  was run rather than only the byte measurement. All four routes 200,
  self-canonical, own localized titles. Sitemap unchanged at 815.
- [x] /qr-code-statistics follow-ups, ranked: (1) SHIPPED as M140 (623cd42) and
  verified live at 15:10 UTC Jul 27 by the next session — 26 cards at
  /embed/qr-stat/<id> all 200, an unknown id 404s, frame-ancestors * is set on
  /embed/* only and X-Frame-Options is dropped there, and all 26 snippets are in
  the page's server HTML inside <details>. See M141 below for what shipping it
  exposed; (2) re-check the four sources each quarter, since two are annual
  reports that will move (a `published` date older than ~14 months should fail
  test:qr-stats); (3) RU/UZ twins once the EN page shows impressions in GSC —
  not before, the copy is argumentative and expensive to translate well.
  (2) SHIPPED Aug 4 as M164 (82868f9), and scoping it found the item was filed
  one level too shallow. It asks for a 14-month rule on the `published` date;
  the actual gap was that recheck-sources.mjs read qr-generator-study.ts and
  compare-sources.ts and NEVER OPENED lib/qr-stats.ts — so the page whose whole
  pitch is "every number links to the page it was read off" was the one sourced
  dataset nothing re-read. Five sources, 23 markers, all read off the live pages
  that day; 24 -> 29 sources, 50 -> 73 markers, 0 moved, 0 unreachable.
  THE RULE THE MARKERS ARE BUILT ON, and it is verified rather than asserted: a
  marker must not survive the deletion of its own claim. On the Bitly scans page
  a bare "40%" matches a CSS GRADIENT STOP (`rgb(207,42,186) 40%`), and the same
  test showed "21%", "8%" and "+41%" also still matching once the sentence they
  guard was deleted from the fetched page — four markers that would have
  reported fresh forever. The long sentence-shaped ones correctly went false.
  Same family as M138's "onAuthStateChange" and M155's `/setAttempt/`, but this
  is the cheap way to test for it: delete the claim, re-run, see if the marker
  notices.
  PER-DATASET FLOORS replaced the single total floor, and that was the real
  vacuous-pass risk rather than a tidy-up: study+compare alone clear a floor of
  20, so statsSources() returning zero would have printed a clean run over a
  dataset it had silently stopped reading. Mutation-confirmed — renaming the
  `Source` type broke the parser and ONLY the per-dataset floor caught it.
  THE 14-MONTH RULE SHIPPED AS AN ADVISORY that never touches the exit code, and
  the reasoning is the reusable part: a February 2025 press release that still
  says exactly what we quote is DATED, NOT WRONG — and the page already prints
  that date next to the figure. A guard that fails on correct data is one people
  learn to skip, which would have cost us the 120-day `checked` signal that can
  actually fail. It flags juniper (~17mo) and ftc-alert (~18mo): exactly the two
  this item predicted would move. Whether a newer edition exists is a human call
  and the advisory is the prompt to make it.
  Guards: test:recheck 9 -> 12 assertions over 29 sources. 8 mutations verified
  (marker corruption, `Source` rename, aged `checked`, checker unwired 2 ways,
  floor removed, short-markup marker, long single-token marker).
  next on this item: (3) RU/UZ twins, still gated on EN impressions in GSC.
- [ ] THE HOMEPAGE SPLIT IS MORE BLOCKED THAN THE CWV EPIC RECORDS, and this
  is a correction to that item's own scoping rather than a new idea. Measured
  Aug 4 (read-only, nothing changed): app/page.tsx contains FIFTY inline
  `lang === "uz" ? … : lang === "ru" ? … : <english>` ternaries, and THIRTY-FOUR
  of them are BELOW the hero — the stats band (5), the downloader card (7), the
  film section (6), the CTA/footer/Telegram blocks (16).
  The epic says the blocker is "the five lang-prop sections" (TrustedBy,
  HomeFaq, ReviewsSection, PricingTeaser, LatestPosts) and that CategoryShowcase
  plus two others could move to the server "once their heading strings are
  handled". That understates it the same way the TopNav note did before M163:
  it is not five sections passing a prop, it is essentially the whole page body
  reading `lang` inline. TrustedBy's heading (:839) and LatestPosts'
  heading+cta (:850-851) ARE two of the fifty.
  CONSEQUENCE, and it is the useful part: the "split around the hero, leave the
  localised sections for later" plan does not survive contact with the file.
  Once the page stops being "use client", every one of those 34 call sites needs
  the language on the server, so the split and the cookie decision are ONE
  mission, not two — which is worth knowing before someone opens a 1043-line
  refactor expecting to land half of it. CategoryShowcase (:751, no props, zero
  hooks) remains the one genuinely clean move, and it is worth ~nothing alone.
  So the OWNER-GATED cookie item below is the true gate on the biggest open CWV
  item, and it now blocks three things, not two: the homepage split, the TopNav
  split, and the homepage's ~0.6-1.4s first mega-menu hover that M163 traced
  back here. Do not re-scope this without answering that first.

- [ ] The homepage renders ENGLISH to twelve languages nearly everywhere below
  the hero badge — same defect shape M162 fixed for ONE string, found Aug 4 by
  sweeping for that shape as M162's note said to. The fifty ternaries above are
  a language list that stops at three: zh hi es ar fr pt id de ja tr ur bn all
  fall through to the English arm.
  NOT TAKEN, and the reasoning is the point rather than the finding, because the
  cheap read ("M162 again, wire it to t.<key>") is wrong here:
  (a) THERE IS NOTHING TO WIRE. M162 worked because `cardTitle` was already
      translated fifteen times and rendered zero times. These fifty strings have
      NO KEY IN ANY LANGUAGE — pageT holds 74 keys, all of them the ones that
      went through T_BASE, and every one of these was added later at the call
      site. Fixing means AUTHORING ~600 strings of marketing copy in twelve
      languages nobody here can proofread, which is precisely the hazard M161
      recorded ("writing copy nobody here can proofread is how the fabrication
      got in"). M161's twelve sentences were a CORRECTION of an existing false
      claim; this would be net-new prose.
  (b) IT IS WORTH ZERO IN SEARCH. There is exactly one homepage URL in the
      sitemap (`https://qrixtools.com/`) — checked, not assumed. app/ru and
      app/uz are tool-family routes, there is no /de/ homepage, and language on
      / is a localStorage toggle. Google indexes the English page either way, so
      this is a UX defect for visitors who switch language, not an indexing or
      hreflang one, and it serves no P0 gate.
  WHAT WOULD MAKE IT WORTH TAKING, in order: real evidence that non-en/ru/uz
  visitors switch language on / (nothing measures this today — a counter on the
  switcher would answer it for ~10 lines), or the cookie decision landing, which
  would let these strings be server-rendered per language and turn the same work
  into something that ships localized HTML. Until one of those, the honest state
  is: recorded, understood, deliberately not fixed. Do not "quickly localize the
  homepage" without reading (a).

- [ ] /embed/downloader has the same disease and is harder: it ships the root
  layout too (TopNav, consent banner, gtag.js) but it is a real tool and has to
  hydrate, so it cannot become a Route Handler. Getting it off the root layout
  means a SECOND ROOT LAYOUT — app/(site)/layout.tsx holding the chrome, with
  /embed outside it — which is a route-group move of every page in the site,
  mechanical but wide. Price it before starting; the widget is currently one
  page, so the win is narrow unless more embeds are planned (/widgets suggests
  they are).

## NEXT (2-4 weeks)
- [x] Sweep for the fourth occurrence of the English-only client tool. DONE
  Jul 30, immediately after M149, and it found one — see the NOW item it
  produced. Method, for reuse: `ls components/Localized*.tsx`, then grep each
  for `<XClient`/`<XTool` renders and check for a `lang=` prop. Six wrappers
  exist; four render no client at all, LocalizedBarcodePage was fixed by M149,
  and LocalizedToolEngine is the hit.
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
- [B] Vercel Domains: set www.qrixtools.com -> qrixtools.com redirect to
  PERMANENT (currently 307 temporary — weakens host canonicalization).
- [B] Free Google API key for PageSpeed Insights v5 -> real CrUX field data
  for the weekly audit (no billing needed).
- [B] AlternativeTo submit — account age unlocks Jul 27 (reminder set).
- [B] Product Hunt launch — prep starts Aug 5 (reminder set).
- [B] Reddit/HN posts — human account required.
- [B] VK/Reddit/Vimeo unlock — ~$3/mo residential proxy for cobalt
  (API_EXTERNAL_PROXY) — owner decision.
- [B] Move the UI language from localStorage to a COOKIE, so server components
  can render localised sections. This is the single blocker on the last big CWV
  item (the homepage split) and on part of the TopNav split — see the M135 note.
  The cost is visible: TopNav's language switcher is instant today and would
  become a router.refresh() round trip (~100-300 ms, client state preserved, no
  white flash). Two of the four switchers already do a full location.reload(),
  so this would actually make those two FASTER and the behaviour consistent.
  Owner decides: (a) ship the cookie and accept the round trip on the switcher,
  (b) keep the instant switch and accept that below-the-fold localised sections
  stay client forever. Nothing else is blocked on code — the migration itself is
  a normal day's work (dual-read localStorage->cookie for back-compat so no
  returning visitor loses their language).
- [B] Operator identity for E-E-A-T: M145 shipped the structure and filled it
  with everything already public (the contact address, the Telegram handle, the
  channel and the bot). Four fields are the owner's to publish and were
  deliberately NOT guessed — they sit in one place, lib/operator.ts:
  legal-name spelling, a real photo/avatar URL, GitHub/LinkedIn/X profiles for
  `sameAs`, and a domain email (hello@qrixtools.com) to replace the gmail
  address. Filling any of them is a one-file edit and every consumer follows.
  Google's "Who created it?" question is answered by the page as it stands; a
  named human with verifiable profiles elsewhere is what turns it from adequate
  into strong, and only the owner can supply that.

## Done
- [x] Jul 30: image tools stopped serving crawlers a page with no tool on it
  (M147, 3812696 + the probe in a follow-up). /convert/*, /resize/* and
  /image-tools/[slug] served 0 input[type=file] and 0 <label> — the h1 and
  ~550 words of copy rendered, so a crawler read an article ABOUT converting
  images and found no converter. The audit's proposed fix (enrich the
  dynamic() `loading` fallback) could not have worked: ssr:false renders
  neither the component nor its fallback during SSR, so that string was never
  in the server HTML at all. The shell had to come from outside that boundary.
  Also shipped scripts/probe-hydration.mjs after the in-app Browser pane
  reported the change as a total regression and was wrong — see the NOW entry,
  the control-page technique there is the reusable part.
- [x] Jul 29: the repeat visit stopped re-validating everything (M146, 26ff03b
  + 1779da6). Four CWV follow-ups from the M142 audit, all verified on
  production. The real win is the first: EVERY non-font static asset served
  `max-age=0, must-revalidate`, including the homepage LCP element
  (/scenes/bunny-hero.webp, preloaded) and both 1.2 MB copies of the pdf.js
  worker — so every repeat visitor paid a revalidation round trip in front of
  the LCP paint. Now 30d + stale-while-revalidate (not `immutable`: the names
  are not content-hashed and bunny-hero.webp was re-encoded in M136), with
  /sdk/qrix.js on a 600s rule because it runs inside third-party pages, and
  sw.js/llms.txt/the IndexNow key deliberately left alone. Also: Oswald removed
  (it was 2nd in all three of its stacks behind self-hosted primaries, so it
  could never paint — 4.2 KB of render-blocking CSS and 80 KB of woff2 for a
  font nobody ever saw), the duplicate Bricolage preload deduped via
  ReactDOM.preload(), and width/height on the three hero imgs. Two of the four
  audit findings were misstated — see the NOW entry for what and why.
- [x] Jul 28: the site can answer "who created it?" (M145, 1e80496). The M142
  audit's lowest score was content at 41/100 and the cause was named: every page
  failed Google's "Who created it?" question. /about was four generic
  paragraphs, articles had a date but no byline, the index had neither, and the
  site-wide Organization schema was name+url+logo with no founder, no sameAs and
  no contactPoint.
  lib/operator.ts is the one place the identity lives now, and the part that
  matters is what it does NOT hold. Legal-name spelling, a photo,
  GitHub/LinkedIn/X, a domain email — all `null`, every consumer omits rather
  than guesses, and they are a [B] item. Inventing any of them would have been
  the fabrication rule failing on the one surface built to signal trust.
  Every /about claim was re-derived from code, and two did not survive:
    · "nothing watermarks your output" was FALSE — PosterMakerClient's "Made
      with QRix" credit is useState(true), on by default. The page now says so
      and points at the switch.
    · the privacy paragraph would have named PDF COMPRESS as the uploader, on
      the strength of a standing note. Wrong since M127 moved it in-browser
      (a77cf98): /api/pdf/compress is orphaned, /api/pdf/merge never used. The
      one file tool that really sends your file is pdf-to-word, which /about
      names, links, and tells you to avoid for sensitive documents.
  So the page gives things up on purpose — the tool that uploads, the watermark
  default, and that the image upscaler is called AI and is not one. All 6
  internal links verified 200 (the poster maker is /poster, NOT
  /qr-tools/poster, which 404s).
  Same family, also shipped: Article.image (missing entirely — Google lists it
  required, audit schema F3); Article.author promoted from an anonymous
  Organization copy per page to a Person @id-linked to /about#operator, so every
  article resolves to the same human; @ids on Organization and WebSite so they
  cross-reference; a visible rel=author byline plus an author card per article;
  dates on the blog index, which had read time but nothing about freshness.
  formatPostDate() is deliberately defensive: autopilot posts are Supabase JSON
  blobs only typed as BlogPost on the way out, and new Date(undefined) renders
  the literal "Invalid Date" — which would have been visible text on the most
  crawled index on the site. Null means omit, in the markup and in schema.
  npm run test:eeat is the guard; every failure it covers is silent (a null
  rendering as "null" in JSON-LD, a placeholder shipping as an identity, byline
  drifting from schema author, the @id graph breaking, the logo drifting back to
  /icon which 404s). 17 static assertions + 6 live, 10 mutations verified, 0
  blind spots. Verified live: 23/23 against production, Organization carries
  founder+sameAs+contactPoint on every page, an AUTOPILOT article renders the
  byline and a complete Article node, 72 index dates with zero "Invalid Date".
  Sitemap unchanged at 809, so no IndexNow.
  Two things worth carrying forward. scripts/resolve-ts-alias.mjs unblocked
  testing lib modules that import other lib modules — the scripts import
  ../lib/*.ts to exercise real production code, but node resolves neither the
  "@/*" alias nor extensionless specifiers, so the trick only ever worked for
  LEAF modules; it must be loaded with --import, because a plain import
  statement is hoisted and registers the hooks after the imports it was meant to
  fix have already failed. And two of this session's own measurements were wrong
  before they were right: `grep -c` counts LINES not occurrences (made 144 card
  matches look like 2), and counting anything in a Next response double-counts
  because the RSC flight payload inlines the same text in a <script> — strip
  script tags before counting markup.
- [x] Jul 27: the stat card stopped shipping the whole site into someone else's
  page (M141, 9baa06f). M140 had shipped /embed/qr-stat/<id> as a PAGE, so it
  rendered inside the root layout: 15 eager scripts / 727.1 KB, TopNav, the
  cookie banner and gtag.js, for a card that is static text. app/embed/layout
  hid all of it with display:none — hidden from the eye, downloaded in full, on
  a third party's site. A Route Handler is not nested in any layout, so the
  document is now the whole response. Measured live on production:
    eager scripts   15 / 727.1 KB  ->  0 / 0.0 KB   (3.3 KB of HTML, total)
  and the three costs that came with them are gone with them: the embedder's
  CWV, our analytics firing from inside an iframe on their domain, and a consent
  banner rendered where nobody could answer it.
  Verifying it found two defects that only exist inside an iframe, which is why
  neither was visible from our own site:
    · every card CLIPPED — embedHeight() was short on all 26, by 30 to 102 px,
      so each embed cut off its footer and the longest cut into the caveat: the
      one part of the card that must survive being quoted, and the reason the
      whole page exists. The function's own note claimed the heights "were
      checked in a browser at this width"; they had not been. Recalibrated
      against 26 measured cards — every term is now the CSS it comes from and
      the constant is measured (the model fits each card to ±1 px). Only line
      counts are estimated, and from the TIGHTEST packing in the dataset: a
      43-char caveat wraps onto two lines (21.5 chars/line) while a 305-char one
      fits 50.8, so sizing to the loose numbers left five still clipping. The
      last one needed a term for the FIGURE wrapping ("+0.5% codes, +41% scans"
      is two lines at 320px). Now 0/26 clip, slack 8-64 px, which is invisible.
    · the card was WHITE ON WHITE on a light blog. --surface is
      rgba(255,255,255,0.04) over a dark --bg and the embed body is transparent,
      so it composited to white on a white host with #ecebe7 text on it. The
      tokens now resolve to what they actually produce (#141b2f), and --success
      is lightened to #6fae54 because #467434 on that surface is 3.1:1 and the
      badge is 9px.
  npm run test:embed (scripts/measure-embed-heights.mjs) is the guard for the
  half a unit test cannot see: it drives real headless Chrome, takes a base URL,
  and checks clipping + script tags + caveat presence per card. It FAILED
  against the card that was live at the time (26 with script, 3 clipping) and
  passes against production now. test:qr-stats also moved its embed assertions
  off source-regex onto the rendered HTML — grepping the JSX for {s.caveat}
  proves the expression is written, not that the text reaches the page, and it
  could not see a stat whose caveat was missing from the dataset entirely.
  22 assertions, 7 mutations verified.
  Generalisable: hiding chrome is not the same as not shipping it, and an
  iframe is the one surface where nothing on our own site can show you the bug.
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
