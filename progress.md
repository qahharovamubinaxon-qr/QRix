# QRix Progress

## Completed Missions
- **Core platform** — QR Tools (30+ types + decoder/scanner), PDF Tools (21), Image Tools (7), Barcode Studio (10 formats), Link-in-Bio, QR Poster Maker, Bulk QR, Dashboard, Pricing, Legal.
- **Monetization** — Referral system (Supabase, migration 0002), Stripe Pro billing (checkout/webhook/portal, migration 0003, env-gated), AdSense slots (env-gated), Newsletter (migration 0004).
- **SEO** — 54 blog articles, sitemap, robots, RSS, per-page metadata + JSON-LD, generated icons/OG.
- **Premium SaaS layer** — CoolM5 reskin, MotionLayer (scroll-reveal/stagger/magnetic/spotlight), Cmd+K CommandSearch, TrustedBy marquee, HomeFaq, LatestPosts, Newsletter, route transitions, loading bar.
- **Mission 1 — AI Tools** (`e184f18`): 28 tools at `/ai-tools`, config-driven, on-device engines + cloud connector.
- **Mission 2 — Video Tools** (`48911ab`): 29 tools at `/video-tools`, canvas→MediaRecorder pipeline + gifenc + Web Speech + connector.
- **Mission 3 — Image Tools Expansion** (`4ccd65b`): +65 config-driven on-device image tools at `/image-tools/[slug]`.
- **Mission 4 — Premium Homepage** (`328660e`): 5-category showcase with coverflow tool previews + features strip.
- **Mission 5 — Premium SaaS Experience** (`4a9fa1a`, `d59f6cb`): favorites, recents, history, bookmarks, settings, account; toasts; enhanced Cmd+K; TopNav account dropdown. localStorage via `lib/user-prefs.ts`.
- **Mission 6 — Backend + Cloud Platform** (`00b457d`, `3b9db62`): Prisma schema + `lib/server/*` (env-gated drivers with working mocks: db/auth/RBAC/security/cache/storage/queue/billing/email/cms/api-keys/analytics/providers ai·video·image), REST API `/api/v1/**` (auth incl. magic-link/reset/verify, me + collections, settings, keys, jobs, billing, track, uploads, admin, cron), `/admin` panel (charts, users, subs, payments, article CMS, flags, logs, system status). Homepage polish: two-row infinite testimonial marquee near footer, premium partner logos.
- **Mission 7 — AI Provider Manager**: `lib/server/ai/providers.ts` (11 pluggable adapters with real HTTP calls: Gemini, Groq, OpenRouter, Cloudflare Workers AI, HuggingFace, OpenAI, Anthropic, Replicate, Fal.ai, Stability, Custom; env keys `<PROVIDER>_API_KEY`) + `lib/server/ai/manager.ts` (single entry `runAiTask`: smart per-task routing, primary/backup overrides, automatic fallback chain, rate-limit detection with 60s cooldown, response cache, per-provider health/latency/tokens/cost stats, AES-GCM-encrypted admin-stored keys). Free providers first: gemini→groq→openrouter→cloudflare. All AI surfaces route through the manager: `/api/ai/process` (client connector), job queue (`runAi` shim), image `ai` provider. Admin: `AI` tab (enable/disable, primary/backup, masked key entry, success rate, avg latency, daily usage, tokens, est. cost, last error/request) via `/api/v1/admin/ai-providers`. Verified live end-to-end (fallback walked to first keyed provider; cache dedupe confirmed).

- **Mission 8 — Production Services & Deployment**: Redis cache (Upstash REST + raw RESP TCP with auto-reconnect, memory fallback) backing sessions/response/rate-limit; real S3-compatible storage driver (SigV4 on Web Crypto → AWS S3/R2/B2/MinIO, presigned URLs, analytics) + Supabase driver; queue upgraded (priority high/normal/low, bounded concurrency, exponential backoff, `queueStats`); **Credit Engine** (`lib/server/credits.ts`: FREE 60 / PRO 1000 / BUSINESS 5000 / ENTERPRISE custom monthly credits, admin-tunable costs, grants/refunds/ledger/stats, metering always on, deduction behind `CREDITS_ENFORCED=1`, wired into `/api/ai/process` + jobs, plan-sync bumps balance on upgrade); email drivers Resend/Mailgun/minimal-SMTP; auth finalized (device sessions + revocation, Google/GitHub OAuth code-flow routes, magic link, reset); billing upgrade/downgrade/refunds; monitoring (`lib/server/monitor.ts` + `/api/health` + `/api/ready`, env/secret validation); structured logger; Prisma factory (`lib/server/prisma.ts`, dynamic load + db scripts + `prisma/seed.mjs`); Dockerfile + docker-compose (app/postgres/redis/minio) + `.env.production.example`; admin System tab shows live health/credits/subscriptions/queue, AI tab gains per-provider connection Test.

- **Mission 9 — Enterprise Workspaces** (`0fc455e`): personal/team/organization/enterprise workspaces (branding, credit pool, storage quota); invites accept/reject, suspend/restore/remove, ownership transfer; built-in + custom roles with granular per-module permissions (qr/pdf/image/video/ai/3d/api/workspace); shared projects with version history + restore; comments with @mentions → notifications; isolated activity log + workspace dashboard. `lib/server/workspaces.ts`, `/api/v1/workspaces/**`, `/workspace` hub UI, admin Workspaces tab, Prisma models.
- **Mission 12 — Analytics Platform**: enriched event capture (country/device/browser/referrer/hour parsed server-side in `/api/v1/track`); `analyticsDashboard(filters)` in `lib/server/analytics.ts` — visitors/sessions/users/tool-category usage/conversions/revenue/subscriptions/credits/downloads/uploads, realtime (5m), country-device-browser-referrer breakdowns, conversion funnel, retention cohorts, weekday×hour heatmap, top tools, most active users; ranges 24h/week/month/year + filters (country/device/plan/tool/user); exports CSV/Excel/JSON + dependency-free PDF at `/api/v1/admin/analytics?format=`; admin Analytics tab (`components/admin/AnalyticsBoard.tsx`, code-split): SVG area/bar/donut/heatmap/funnel/retention charts, filter row, export buttons, 15s realtime refresh. Dev console email driver now logs action links (magic link usable locally).
- **Mission 11 — Global Search Platform**: full-text multi-token ranked search across every module (tools, AI, blog, docs, FAQ, categories, pages) in `lib/search-index.ts` with group filters + "did you mean" suggestions; ⌘K palette upgraded (`components/CommandSearch.tsx`): 120ms debounced instant results, Tab-cycled filter chips (All/Tools/AI/Blog/Docs/Pages), trending searches + popular tools from `/api/v1/search` analytics, pinned commands (star any result), no-result suggestions, Web Speech voice search, favorites/recents/recent-searches, full keyboard nav, ARIA roles.
- **Mission 10 — Developer Platform**: public REST API — any `/api/v1/*` route accepts `Authorization: Bearer qrix_live_…` (scoped read/write, per-key + per-workspace `X-Workspace-Id` rate limits); OpenAPI 3.1 at `/api/v1/openapi.json` (`lib/server/openapi.ts`); webhooks (`lib/server/webhooks.ts`: HMAC `X-QRix-Signature`, retry ×3 with backoff, delivery history, auto-disable after 10 failures, events: job.completed/failed, subscription.created, payment.succeeded/refunded, …) + `/api/v1/webhooks/**`; `/developers` portal (interactive docs from the spec, quick start/auth/rate-limits/error codes, API-key manager with rotate/revoke, webhook manager + test deliveries, live playground request builder, SDK snippets JS/TS/Python/PHP/cURL); downloadable SDK `public/sdk/qrix.js` (jobs, waitForJob, uploads, webhooks, workspaces); admin API tab (key usage, webhook delivery monitoring).

- **Mission 13 — Performance + SEO + Production** (`4b9e751`): PWA (service worker: cache-first statics, network-first pages, `/offline` fallback; prod-only registration in `components/PwaVitals.tsx`), route-change page-view analytics (idle-deferred, respects reduce-data), root `global-error.tsx`, skip-to-content link, `prefers-contrast` tokens. Existing SEO/OG/JSON-LD/sitemap/robots/RSS/404/500/loading/dark-mode/reduced-motion preserved.
- **Mission 14 — 3D Tools Platform** (`28dc69a`): new category via `lib/three-tools-meta.ts` → `/3d-tools` landing + `[slug]` SSG (full SEO). Image-to-3D: AI manager `3d-generate` task (Fal.ai TripoSR + Replicate, smart routing/fallback), queue jobs with progress/ETA/cancel, R3F viewer (orbit/zoom, 3 lighting rigs) with on-device textured-relief fallback, GLB/OBJ/STL/USDZ exports (three exporters), history/favorites. Credits: 3 free per account, then 20 credits force-enforced (`/api/v1/3d`). Registered: TopNav EN/RU/UZ, homepage showcase card (3D mocks), search, sitemap, analytics categories.

- **Mission 15 — Enterprise Telegram Admin Bot**: `lib/server/telegram/*` (config env-only, zero-dep Bot API client, screens, bot, notify). Owner-only security: OWNER_ID validation, webhook secret-token check, replay protection (monotonic update_id), rate limiting, command whitelist (/start /menu /help), full audit logging, silent rejection of strangers. Inline-keyboard admin: Dashboard, Users (search/profile/grant PRO-BIZ-ENT/credits/reset/ban/unban/delete/history), Subscriptions, Credits, Revenue, Payments+refunds, Analytics (24h/7d/30d/1y), AI Providers (enable/disable/primary/live test), Video/Image/3D queues (retry/cancel), Storage (purge), Server health (cache clear, requeue workers), Logs, Notifications, Maintenance, Deploy (webhook/polling switch), Settings — breadcrumbs, Back buttons, confirmation dialogs. Live owner notifications (new user/subscription/payment/refund/job fail/provider fail/500s/admin login, throttled) wired into billing/queue/auth/api. Daily/weekly/monthly reports (on-demand buttons + `/api/cron/telegram-reports`, vercel.json cron schedules). Transport auto-detect: dev long-polling loop, prod webhook (`/api/telegram/webhook`). Admin → System shows "Missing Configuration" when env is absent. `banned` user flag enforced in sessions/login.

- **Missions 16-19 — Design V2 + v1.0.0 release** (branch `design-v2`): unified design tokens (`app/design-v2.css`: spacing/radius/blur/elevation/motion/category accents); homepage hero with aurora + light rays + orbiting icons + floating QR platform + animated counters + trust badges; glass navbar with scroll shrink; premium button (sweep/ripple/focus/disabled) and card (tilt/elevation) systems; bento feature grid; alternating section backdrops; motion system (9 reveal variants, parallax, 3D tilt, hydration-safe start-after-load engine); SVG illustration system (14 subjects) powering redesigned 404/error/offline/loading/empty states; CRO pricing (monthly/yearly toggle, recommended spotlight, trust strip, FAQ schema); CHANGELOG.md + README rewrite; version 1.0.0 tagged.

- **Mission 20 — Creative Director Homepage Rebuild**: cinematic full-viewport hero (86svh, mega editorial type clamp→6.8rem, scroll cue), cursor-reactive spotlight (root --px/--py fed by MotionLayer → .qx-hero-light), 6 drifting CSS particles, scroll storytelling (sheet bridges layering sections as continuous story), unique reveals per section (depth/left/rotate/perspective added), pricing teaser with animated conic border placed directly under testimonials (trust→pricing adjacency), 3D studio rebuilt Tripo-style (three-panel workspace, PMREM+ACES lighting, topology stats, env swatches, HD smoothed heightfield mesh, React.lazy fix for never-mounting client).

- **Mission 21 — Cinematic Editorial Homepage** (taste-skill pass): SynapseX-inspired rework — full-viewport mouse-scrubbed film hero (delta-based seek chained on `seeked`), corner-anchored Space Mono headlines with ScrambleIn terminal decode (components/Scramble.tsx), difference-blend text for readability over any frame, Anton SC giant watermark + 24px dot-grid, hero decluttered to 4 elements per taste rules (counters/badges/cue removed — stats live in the strip), loop-video backdrops on cinematic statement (rotateX scroll-scrub via motion/react useScroll+useSpring) and stats sections, licensed CloudFront films wired via components/CinemaVideo.tsx.

- **Mission 22 — Mockit design language**: full palette migration to mockit.design's system adapted for QRix — near-black `#080808` base, single hot accent `#ff4d1c` (+`#ff7a50` hover) replacing neon-yellow/lilac across every token, warm off-white text; typography switched to Bebas Neue (giant condensed caps hero: DROP A LINK. / GET YOUR QR. / JUST QRIX. with orange middle line, Oswald cyrillic fallback) + Bricolage Grotesque display/body; hero recomposed centered with mono metric line, llama films removed everywhere; generator 3-cards restyled to hairline dark cards (#141414, white/7% border, Bebas titles with orange tick, #0d0d0d panels); global sweep of all hardcoded neon hexes/rgba in css+components.

- **Mission 23 — Katana scroll-canvas + Jitter tool cards**: nixtio/katana-style scroll-adaptive background — 10 homepage sections declare `data-scrollbg`; a direct scroll listener cross-fades the page canvas (1.1s ease, syncs `--bg` so sheet fades follow) through a deep-navy journey (#080808→#00172d→#041c37→#082142→#0d1932→#001a24→…→#080808), dark-theme only, reset on route change; CategoryShowcase's 6 cards rebuilt in jitter.video template language — preview-dominant flat tiles (#141414, hairline border, coverflow mock fills the top on #0d0d0d stage), caption row below (icon + title + count·chips meta + arrow), hover lift + preview scale, float/conic-border chrome removed.

- **Mission 24 — Katana scene canvas (`d13981f`)**: first mission verified visually via **Claude-in-Chrome** against the real nixtio/katana page (M23's flat hex shifts were the reason it read as "not even close"). `.qx-scenes` — position:fixed viewport canvas with 4 rich gradient scenes (`base` #080808 · `deep` navy radial · `ember` giant orange glow · `dusk` warm ending) cross-fading 1.3s as `[data-scene]` sections cross viewport center (MotionLayer switches `.on`; hex `data-scrollbg` fallback kept). Stats section rebuilt as the katana "red moment": boxed strip → transparent section on the ember scene, 2×2 giant Bebas counters (clamp 52–104px, tabular, nowrap) in the hot accent + Space Mono labels, uptime as a mono footnote. Two production bugs found by seeing the page: (1) `.qx-page-in` used `animation-fill-mode: both` — the persisted transform made the route wrapper the containing block for fixed descendants, degrading `.qx-scenes` to a document-sized sheet → `backwards`; (2) `ScrambleIn` SSR'd a bare nbsp — blank hero until hydration on slow devices and an empty H1 for crawlers → initial state is now the real text, decode takes over on mount. Light theme: scenes `display:none`, stats accessible orange.

- **Mission 25 — Samurai + katana scene art (`497757d`)**: user's M24 verdict — "қани самурай, қани катана". Image-gen MCP has 0 credits, so the reference artwork was rebuilt as hand-tuned SVG (`components/SceneArt.tsx`): `SamuraiArt` (dark armored silhouette behind the hero headline — kabuto, outward kuwagata crescents, glowing visor slits, layered sode, QR chest emblem, ember aura, breathing opacity, 0.07 parallax, bottom-masked) + `KatanaSword` (vertical blade through the ember stats — red crisscross tsuka, tsuba, gradient blade with hamon + etched glowing QR glyph, 0.16 parallax travel). Background motion: 9 rising ember particles, 26s active-scene drift, reduced-motion guarded, light theme hides all art. Fixes: MotionLayer scene query excludes `.qx-scene` canvas divs (they always straddle center → spurious dusk); suppressHydrationWarning on parallax art wrappers. Iterated live in Chrome (first horn pass read as rabbit ears → crescents). If the user later provides image-gen credits or a FAL/Replicate key, the SVGs can be swapped for raster art in one step.

- **Mission 26 — True Jitter card anatomy (`04beb13`)**: CategoryShowcase rebuilt against live measurements of jitter.video (358×238 flat tile, zero chrome, caption under the tile). No card box — each item is a flat 3:2 tile (#151515 dark / #f5f5f5 light, 12px radius) with ONE focused mock crossfading through 3 tool previews (coverflow/nav/dots removed, hover pauses + scales 1.035 + lightens tile), caption on the canvas (accent dot + bold title + muted meta + hover slide-in arrow), whole item is the link, orange "new" badge on 3D. Grid capped at 3 columns, 40px row rhythm. Verified in Chrome in both themes.

- **Mission 27 — Blacker canvas + side-entering cards + logo partners (`44227ef`)**: samurai removed from hero per user (SamuraiArt export kept); all 3 scenes darkened hard toward black (deep = faint navy over #020203, ember keeps red core on #050101, dusk low warm over #040303); category grid capped at 2 large columns (~670px, 16:9 tiles, 19px titles) with the 6 cards entering one by one on scroll — left column from the left, right column from the right (72px throw via `.qx-cs-item[data-reveal]:not(.rv-in)` override, 180ms alternating stagger); TrustedBy rebuilt with real brand logos (react-icons/si icons + names, 2.35rem, grayscale→brand-color hover; Microsoft/Adobe→YouTube/WhatsApp/PayPal since si lacks those glyphs). Verified via preview harness at 1440px (Chrome extension dropped mid-mission).

- **Mission 28 — Pagoda night scene (`3636ebb`)**: statement text section replaced with `SceneArt.PagodaNight` — hand-built SVG night Japan in the ember palette (stars, moon, Fuji, torii, lit minka village, lanterns, five-story pagoda with rim-lit curved roofs + sorin, mist, warm horizon). `CinematicScene` = full-bleed 74vh section; art drifts/settles/fades in on scroll (motion springs), rising embers on top, masked top+bottom into the black canvas; hidden in light theme. ⚠ Chrome extension AND preview renderer both died mid-mission — verified via tsc + DOM/computed-style probes only; **visual pass pending** (user reviewing; iterate on their screenshot feedback).

- **Mission 29 — Coverr-style hero (`0729394`)**: benefit headline (CREATE QR CODES. / TRACK EVERY SCAN. / 185+ FREE TOOLS., EN/RU/UZ) replaces the wordplay; mono metric line + 2 CTA buttons dropped. `components/HeroSearch.tsx` — white Coverr pill (orange search disc + arrow) with live dropdown over `lib/search-index`; "jpg to pdf" + Enter → /pdf-tools/jpg-to-pdf; keyboard nav. Category quick-links row under the search (QR/PDF/Image/AI/Video/3D → landings). search-index ranking upgraded globally (⌘K too): exact-phrase bonus, token synonyms (bg/img/pic/vid/foto), Blog −3 so tools outrank guides. Verified headlessly (tsx probes + served HTML); Chrome extension down again during visual pass.

- **Mission 30 — Gemini artworks as living scroll scenes (`84c4ec0`)**: user's 5 Gemini images (auto-found in Downloads, sharp→webp 23–35KB each, 141KB total in `public/scenes/`) wired into the scene canvas: base=samurai+planted blade, deep=red-mist pagoda valley, ember=QRIX brush samurai (SVG sword overlay removed from stats — artwork carries it), dusk=neon QR samurai, CinematicScene=pagoda village under Fuji (replaces SVG art, motion kept). "Video" feel without files (image-to-video needs credits, balance=0): Ken Burns 1.02→1.1 diagonal pan 26s on active scene + scroll cross-fades + embers + readability veil (top/bottom gradient + vignette); gradient underlayers show while webp streams. Credits later → swap stills for real AI video loops in the same slots. Verified: assets 200, structure probes; Chrome ext down during visuals.

- **Mission 31 — Neon samurai hero, full-quality art (`1c07264`)**: all 5 artworks reprocessed at full 1365×768 q92 (64–101KB) with the Gemini sparkle watermark erased (blurred neighbour-patch composite at its fixed position). Neon QR samurai → hero scene; planted-blade samurai → dusk. Hero recomposed: samurai center (face clear), 6 tool-family chips on his left (`.qx-htool`, category colors, glass, hover glow → landings), headline+sub right covering every family (CREATE QR CODES. / CONVERT PDF & IMAGE. / AI·VIDEO·3D — FREE., 3 langs; subs rewritten), Coverr search + category row centered below. Living: visor pulse overlay (screen-blend 4.6s), hero embers, Ken Burns. Real sword animation still needs image-to-video credits (balance 0) — scene slots video-ready. Verified live in Chrome incl. a mid-scroll cross-fade screenshot.

- **Mission 32 — User's animated samurai film as hero (`e735e94`)**: user self-animated the neon samurai (mp4 on Desktop); Arena outro ad located frame-by-frame (content → ~9.8s, white ad 10s+) and trimmed via ffmpeg (-t 9.8, -an, h264 CRF25 faststart → 2.3MB `public/scenes/hero-samurai.mp4` + 29KB poster). `<video autoplay muted loop playsinline>` mounted inside the fixed base scene — keeps playing on scroll, cross-fades into other scenes. Ken Burns off for video scenes (`:has`), still-image visor pulse removed, reduced-motion hides video. Note: ffmpeg lives at WinGet Links; watermark/ad-cut recipe = extract frames → Read → trim.

- **Mission 33 — Samurai-game HUD cards + hero mirror (`f4cf230`)**: hero mirrored (headline/sub LEFT, 6 tool chips RIGHT, samurai face clear); category cards rebuilt as game HUD plates (`.qx-gcard`: ember-gradient frame + nested clip-path cut corners, scanline steel, mono `// count` strip + tagline, diamond accent, corner brackets `.qx-gc`, rotated NEW ribbon, hover drop-shadow glow; left/right entrance kept); Why grid `.qx-bento`→`.qx-gpanel` (same HUD language, angular icon chips); partner wordmarks permanently brand-colored (grayscale dropped, hover glow). globals.css needed the watcher nudge again. Verified live in Chrome incl. computed logo color.

- **Mission 34 — Flowing function rows + editorial why + pro footer (`e9112bb`)**: hero headline compacted to sentence-case display type (`.qx-hero-title`, Bricolage 800, 30–52px) and the 6 tool chips removed; category cards deleted — replaced by six partner-marquee-style function ROWS (each streams that family's tool names + icon in category color; odd rows R→L, even L→R reverse, hover pause, items link to category; CategoryShowcase rewritten ~380→130 lines, Mock/HUD machinery gone); Why QRix = editorial statements landing one after another (mono 01–04 index, ember rules, big display titles, alternating reveals); footer rebuilt (5 columns, mono `//` headers, privacy tag, pulsing "All systems operational" status, i18n); dusk scene now the red-mist valley (bottom samurai removed). Verified via served-HTML probes; Chrome ext offline for visuals — user reviewing.

- **Mission 35 — Village scene removed; capsule function rows (`07eb37d`)**: pagoda-village art section (CinematicScene) deleted end-to-end (usage/component/motion imports/CSS); function rows v2 after self-critique (rainbow text = unstructured, color bands = stripes) → integration-wall glass capsules: dark blur pill per tool name, category-tinted hairline + colored round icon tile, NEUTRAL off-white label, hover lift + category glow; rows tightened; light theme white capsules. Verified via served HTML; Chrome ext offline.

- **Mission 36 — Panda icons + Tool Galaxy (`07929b2`)**: pdf24 sheep-system analyzed → generative panda pipeline (`panda-icons/generate.mjs`): base panda head + 6 category accessories (QR bandana / held PDF doc / beret / AI antenna / backwards cap / held 3D cube) + ~38 white glyphs on colored badges → 45 icons (SVG+512px PNG+manifest+preview.html) collected in `panda-icons/` for user review; runtime copies in `public/panda/`. Shoe-finder gallery from the user's Drive (Next.js R3F project — Rig/ShoeTile/GridCanvas read fully) adapted as `components/galaxy/*`: GalaxyRig (drag pan+bounds+resistance+velocity tilt+damped zoom, maath now declared), ToolTile (panda texture+Oswald local TTF label+hover lift+idle float+click focus with dim), ToolGalaxy (R3F canvas, fog, drag-hint chip, focus card with "Open tool" link+close, touch-action pan-y). CategoryShowcase → React.lazy galaxy (three off critical path); capsule rows superseded. tsc clean, assets 200, no console errors; both Chrome ext and embedded renderer were frozen → visual pass on user's screen.

- **Mission 37 — Senior-minimal tool directory; gimmick purge (`6673480`)**: user rejected the panda galaxy ("ота паст, профессионал эмас") → removed end-to-end (components/galaxy, public/panda, oswald ttf, maath decl; `panda-icons/` archive kept off-site). Tools section = hairline-divided directory grid (Vercel/Linear language): 6 category cells on one quiet surface, category color only as 8px dot, 5 REAL tool links per cell (hrefs resolved via search index), neutral links + hover reveal-arrow, single ember accent for "All {category} →"; 28 crawlable homepage links (SEO). Rainbow CursorGlow overlay removed from root layout (one-accent violation). Premium mandate from user: analyze whole site vs world-class standards — analysis delivered in chat; next candidates: section-count reduction (~13 → 7-8), typography consolidation (Bebas+Bricolage+Mono+Oswald → 2), scene restraint.

- **Mission 38 — Senior premium pass, frontend-design skill applied (`0215e37`)**: katana stats takeover → slim hairline proof band (5 numbers, ember rules, mono labels) with TrustedBy logos in the same zone (glass chrome dropped); Why 01–04 fake-sequence → ember mark; Newsletter off homepage; hero CSS embers off; ember scene retired (scroll rhythm = samurai film → valley, 2 scenes); typography consolidated — Bebas/Anton SC/Oswald purged from import and every rule (generator card titles → Bricolage 800); page speaks Bricolage + Space Mono only. Also recovered port 3000 from a stale main-checkout server (old design was being served). Design skills installed user-level (`~/.claude/skills/`): frontend-design (Anthropic official), ui-ux-pro-max pack (7 skills), design-taste-frontend, minimalist-ui; superpowers plugin installed manually (marketplace registered in known_marketplaces.json, repo in plugins/cache/, enabledPlugins in settings.json — activates on session restart).

- **Mission 39 — Sliding auth card (sign in ↔ sign up on one page) + Google OAuth**: `/login` and `/register` now render one `components/AuthSlider.tsx` — double-slider card (Florin-Pop pattern, QRix-styled): both forms side by side, branded overlay panel (samurai film poster + ember gradient + QRix wordmark) slides right→left when switching to Sign Up (0.65s cubic-bezier, poster pans as parallax); URL syncs /login↔/register via history.replaceState (no remount); <900px overlay hides, panes stack, footer links toggle; reduced-motion instant. Both forms: "Continue with Google" (supabase `signInWithOAuth`, FcGoogle) + "or continue with email" mono divider + existing email/password flow (sync cookies, referral claim, confirm-email notice slides back to sign-in). New `app/auth/callback/` (noindex): waits for PKCE session, explicit `exchangeCodeForSession` fallback, syncs server cookies + claims referral → next. AuthShell/AuthMascot kept (unused). ⚠ Google provider must be enabled in Supabase dashboard (+ authorized redirect) for the button to work live. Debug note: embedded Browser-pane tab is `visibility:hidden` → rAF never fires → React 19 leaves Suspense boundaries `$~` queued → page JS never hydrates there; verify interactions in real Chrome (session cookies were saved/restored to bypass the signed-in redirect).

- **Mission 39b — Auth panel artwork (user's Pinterest picks)**: the two pinned cyber-ninja artworks (pin.it short links → resolved via `widgets.pinterest.com/v3/pidgets/pins/info?pin_ids=` since pin pages are JS shells) now live on the auth overlay: red-strap ninja (`/scenes/auth-signin.webp`, 59KB) on the sign-in view panel, blue/neon ninja (`/scenes/auth-signup.webp`, 58KB) on the sign-up view panel; backgrounds moved from shared `.qx-auth-ov-inner` (poster dropped, dark radial kept) to per-panel `center 18% / cover` + readability gradient. Verified both slide states in real Chrome (light theme).

- **Mission 39c — Living auth panels (`9a73d49`)**: the two ninja artworks animated in the site's "living still" language (AI video credits = 0): art moved to `.qx-auth-ov-panel::before` (own GPU layer, 24s Ken Burns drift scale 1.03→1.11, right panel −12s offset), `::after` = screen-blended radial glows placed over each artwork's light sources (mask eyes / cyan glyph / pink straps · blue flame / red straps) breathing 5.4s, 7 rising embers (`.qx-embers` reused) span the overlay and travel with the slide; panels overflow hidden; reduced-motion kills all three; light theme keeps sparks (override of global hide). Verified live: computed animationNames + frame-compare screenshots.

- **Mission 39d — Bunny mascots on auth panels (`8533dfa`)**: user's new Pinterest picks replace the ninjas — warm bunny (sunglasses/skull tee/orange sneakers, 800×1422) → sign-in view, blue bunny (headphones/blue sneakers, 1200×1200 square) → sign-up view, same `auth-signin/signup.webp` slots. Animation retuned for mascot art: neon glow pulse → `qxAuthSheen` studio light band (115deg white gradient, screen blend, sweeps 8s then rests, right panel −3.6s), Ken Burns drift kept, embers → soft white bokeh via `.qx-auth-ov .qx-embers i` override. Verified: image loads + computed animationNames in Browser pane; composition confirmed by rendering the exact panel crop (cover, center 18%, veil) with sharp — ears intact, faces clear. Both Chrome ext and pane screenshots were down (pane tab hidden → no rAF → no hydration; known artifact).

- **Mission 40 — All Tools coverflow rows (`3780910`)**: homepage tool directory (M37 hairline grid) rebuilt as six 3D coverflow galleries, one per category, adapted from the user's Originkit Framer component into `components/CategoryShowcase.tsx`. Section header "All tools"; each row leads with dot + category name + count + "All {category} →". Geometry: perspective 1400, spacing 190, depth 150, rotateY 24°/step, rotateZ 4°, scale −0.11/step, inactive dim 0.45, 0.6s expo-out. Behavior: click side card → focus (preventDefault), center card = real Link to the tool; arrow keys; autoplay 3.2s/card alternating direction per row, paused on hover/focus, gated by IntersectionObserver (0.25) + prefers-reduced-motion. Cards = emoji + title + one-line hint on #141414 (white in light) with category-tinted radial wash + hover "Open →". 28 crawlable links preserved. Verified structurally (SSR transforms, computed perspective/preserve-3d/shade opacities); interactions not live-verified — Chrome ext down, pane hidden-tab can't hydrate.

- **Mission 40b — White cat mascot on sign-in panel (`bc7c28b`)**: user's new pin (white cat, headphones + sunglasses, red accents) replaces the sunglasses bunny in `auth-signin.webp` (1000×1000). Frontal pose, so "facing the form" was done compositionally: panel--right ::before background-position `72% 18%` shifts the mascot toward the form side (lighting already falls from that direction). Sheen/drift/bokeh animations unchanged. Verified: image loads, computed bgPos 72% 18%, qxAuthDrift live; composition confirmed via sharp panel-crop render.

- **Mission 41 — NEW TOOLS ERA hero + bunny mascot choreography (`20ff003`)**: homepage hero rebuilt after the user's viktorodgy reference with their black bunny mascot. (a) **Assets**: 3 bunny poses recovered from the Recycle Bin (user had cleaned Desktop — Shell.Application COM copy-out) and cut out via custom texture-aware keyer (`bg = neutral AND locally-smooth, border flood-fill; variance spikes at edges stop leaks; largest-blob keep; gray shadow remnants → dark contact shadow`) → `public/scenes/bunny-{hero,point,walk}.webp`. (b) **Hero**: orange `era` scene (canvas crossfade → scrolls into pro near-black; valley photos retired), giant Anton "NEW TOOLS ERA" (+ Oswald for cyrillic langs), QRIX ghost watermark, mono kickers both sides, HeroSearch right, Anton category marquee bottom (6 families, hover-pause). (c) **EraBunny.tsx**: fixed-stage mascot — center in hero → glides left into the generator (easeOutCubic on scroll), fades below it, cursor parallax + tilt; `BunnyPeek` statics (walk@pricing-left, point@CTA-right) with own parallax; reduced-motion pins/hides. (d) **Search**: Cyrillic→Latin translit ("жпг то пдф" finds JPG to PDF), top match flies in from the screen corner (`qxFlyIn`) and parks above the bar, click = navigate. (e) **Generator**: own deep-scene section, `lg:ml-[26vw]` for the bunny, cards + inner panels restyled GLASS. ⚠ Gotchas: css pipeline (lightningcss) STRIPS `backdrop-filter` when paired with `-webkit-backdrop-filter` — write the standard property alone (var(--glass-blur) form used); globals.css watcher needs the nudge-comment trick; above-the-fold `data-reveal` races hydration (removed from hero sides). Samurai film assets kept in repo (unused). Verified live in Chrome: hero, cyrillic fly-in, orange→black fade, bunny slide, glass cards, peeks, no hydration errors, no h-scroll.

- **Mission 42 — Living mascot film + Unbounded type + big glass cards (`c63109d`)**: the user's Kling render (5s, gray studio bg) keyed frame-by-frame with the texture-aware keyer (`kling-cut.mjs` recipe: ffmpeg crop+fps=24 → per-frame flood-key at 1080, largest-blob drops the KlingAI watermark → resize 760h → ping-pong frame order → libvpx-vp9 yuva420p crf33) into two transparent loops: `bunny-walk-loop.webm` (1.1MB, hero centre) + `bunny-idle-loop.webm` (689KB close-up, generator left) + webp posters. EraBunny v2: NO gliding — fixed slots cross-fade between states on scroll (walk owns p<0.5, idle p>0.5×tail), cursor parallax, VP9-alpha detect → static webp fallback. Era type → Unbounded 900 (title+ghost, cyrillic ok), staggered word reveal + ghost/side/marquee entrances — ⚠ pattern: from-only keyframes + `backwards` fill (base visible); `opacity:0` base + forwards fill left content permanently invisible. Side texts enlarged (kicker 13.5 / copy 16.5). QR TYPE card removed — format chips + "All formats→" folded into CREATE QR CODE; generator = 2 bigger glass cards (grid-cols-2, ml-24vw). deep/dusk scenes breathe dark orange; coverflow cards dark-orange gradient (light: warm cream #fff4ec). Skills installed: `~/.claude/skills/remotion-best-practices` + `animate` (Emil Kowalski). Verified live in Chrome: video hero, entrance anims, crossfade at generator, chips, orange coverflow.

- **Mission 43 — Expanding tool panels + glitter starfield (`c7d161d`)**: user rejected the coverflow rows → CategoryShowcase rebuilt as six EXPANDING PANELS: spotlight panel flex-grows 1→4.6 (550ms expo-out) revealing head (emoji + Unbounded 800 name + count) + 5 real tool rows (label/hint/hover-arrow, hairline dividers) + "All →"; collapsed panels = slim spines with vertical-rl Unbounded name + glowing category dot; hover/focusCapture/click moves the spotlight, body fades in 220ms after landing; <1024px = vertical accordion; dark-orange glass panels (color-mix category tint). `components/GlitterField.tsx` = user's Originkit "Glitter Wrap" canvas adapted (their preview props; 500 sparks white/#f7f4fc/#ffd9c8): screen-blended layer inside fixed `.qx-scenes`, per-frame checks era scene and fades/pauses on orange, prefers-reduced-motion = static 80-frame field, light theme hidden. 21st.dev fully installed meanwhile: user-level HTTP MCP `21st` (key live-tested against https://21st.dev/api/mcp), `API_KEY_21ST` user env, plugin 21st@21st v0.4.0 (4 skills) manually cached + enabled — activates next session. framer-motion already present as `motion@12`.

- **Mission 44 — New mascot films + orange stats card + rhythm fix (`b500071`)**: user's two new videos keyed via bg-color-SAMPLING keyer (border-median color + variance gate — handles gray AND solid-blue studios; largest-blob drops Pollo.ai/Renderforest watermarks): cream-shorts bunny (726×1270 Pollo) → hero walk loop slot (ratio 0.409 → left calc 0.205), small blue-sneaker bunny (480² Renderforest, blue bg) → generator slot (min(44vh,400px), left 4.5vw). Proof band → orange gradient card (radius 24, white tabular numerals, white hairline dividers, warm glow shadow). Dead air TrustedBy↔Latest guides cut (TrustedBy py-28→pt-20/pb-10, FAQ pb-32→pb-20). Verified live in Chrome: blue bunny beside CREATE card + glitter on black, cream bunny in hero; proof card computed (orange gradient, 24px, white nums); pads 80/40. Keyer recipe generalized in kling-cut2.mjs (removed from repo, documented here).

- **Mission 45 — Premium stills replace the video loops (`21efdbe`)**: user judged the keyed videos low-quality → all four mascot poses re-keyed as STILLS from the full-res originals (24.jpg/16.png/6.png @3072×5376 from scratchpad, pin_d.jpg @4096²) at H=2000/1400, webp q95, with a **gamma-1.25 LUT lift** applied in the compose loop (brightens the near-black fur ~25→40 without clipping the cream shorts — sharp.gamma() can't do alpha images). hero = standing bunny 617×1877 (slot half-width 0.165), generator = blue-sneaker bunny 547×1259 (blue bg keyed by border-median color), peeks refreshed brighter. EraBunny back to `<img>` slots — cross-fade choreography + parallax kept, `qxBunnyFloat` 6.5s adds life (gen slot −3s offset). webm loops kept in repo, unused. Verified live in Chrome (assets loaded, float running, no <video> left). ⚠ HMR restarts the hero entrance animations — a screenshot right after an HMR push can catch texts mid-rise (looks blank); probe computed opacity before diagnosing.

- **Mission 46 — User's own cutouts, smoke reveals, editorial type index (`158a698`)**: user prepared assets themselves (Picsart bg-remover): 3 transparent PNGs + 2 VP8-alpha webms (detect via `alpha_mode: 1` in ffprobe; MUST decode with `-c:v libvpx`, native decoder drops alpha). Pipeline: PNGs gamma-1.25 lifted → trim → webp q95 (hero 613×1876, walk, blue); webms → RGBA frames (libvpx) → same LUT → ping-pong → VP9 yuva420p loops (`bunny-hero-live.webm` 2MB, `bunny-gen-live.webm` 2MB). **Smoke system** replaces the fixed mascot layer (user: "экран билан сузмасин, тутундек пайдо бўлиб йўқолсин"): each mascot is ABSOLUTE inside its own section; `useSmoke` IO (threshold ~0.2, rootMargin −6%) toggles `.qx-smoke.on` BOTH ways → opacity+blur(18px)+scale dissolve on every entry/exit; hero cycles still↔alpha-film every 6.5s (crossfade blur); GenBunny (new export) sits beside CREATE card; peeks use same smoke; cursor parallax kept (`useParallax`). **Tools v7** (expanding panels rejected): editorial type index — six oversized Unbounded rows (26–58px), hover/focusCapture lights the row in its category color (+14px slide, arrow un-rotates in), glass panel (color-mix border) smokes in on the right with 5 real tool links + hints + All→; touch: first tap opens, second follows; <1024px accordion (max-height). Verified structurally (pane): absolute-in-section, smoke base, assets loaded, 6 Unbounded rows, no fixed layer.

- **Mission 47 — Hero mascot raised + professional stats card + peeks removed (`cf3a245`)**: `.qx-hm` bottom 0 → clamp(72px, 11vh, 122px) (bunny clears the marquee), height 66→64vh. Proof card upgraded: `.qx-proof-head` strip (mono "// QRIX IN NUMBERS" localized + pulsing LIVE chip with green glow dot), numerals up to clamp(28px,3vw,42px) tabular, per-cell hover `rgba(255,255,255,0.07)`, inset top highlight. Both bottom BunnyPeek stills removed from page.tsx (component export kept). Verified: served HTML has 0 peeks, proof-head/grid present, tsc clean. Note: 21st.dev MCP went LIVE this session (28 tools: search/generate/get_component/themes...) + 4 CLI skills — available for future UI work.

- **Mission 48 — QRIX IN NUMBERS on the 21st.dev archetype (`67a43d7`)**: first live use of the 21st MCP — `search` (free) → `get_component` (metered, 1 of 2/day used; free tier) for the stats-section-with-text archetype, then rebuilt entirely in QRix language (own markup/styles/copy): orange card = left column (mono kicker + display heading "Trusted by makers worldwide" localized + copy + pulsing LIVE chip) and right 2×2 glass stat tiles (FiTrendingUp, CountUp numeral 26–38px tabular, mono label, hover lift), uptime = FiShield footer strip; 1-col <900px, tiles stack <480px. 21st capabilities noted: catalog search (free/unlimited), component code retrieval (2/day free), AI generate/iterate (preview URL, paid credits), themes (free CSS), publish/profile tools, `21st` CLI via 4 plugin skills.

- **Mission 49 — Glass stats card + glass bento tools (`4b43bee`)**: `.qx-proof` → translucent orange glass (rgba washes + `backdrop-filter: var(--glass-blur)`; verified in served dev CSS — the pipeline now even auto-adds the -webkit- prefix; light theme keeps M44's solid orange since there's no dark canvas behind). CategoryShowcase v8 = glass bento informed by a second 21st archetype (kokonutd bento — icon chip + status badge + tags + hover CTA + col-spans; re-authored in QRix language): grid-template-areas `qr qr pdf pdf / qr qr img ai / vid vid d3 d3`, QR = featured 2×2 with five real tool rows, others tool-chip pills; hover = lift + category border light-up + dot-texture fade-in; 2-col <1024, 1-col <560. ⚠ Dev CSS is served at `/_next/static/chunks/*.css` (not /static/css/) — curl-verify there; component inline `<style>` blocks bypass lightningcss entirely (no stripping risk). 21st free retrievals exhausted for today (2/2).

- **Mission 50 — All Tools as a 3D interactive timeline (`207a77e`)**: CategoryShowcase v9 on the 3d-interactive-timeline archetype (structure studied via the component's public page — code quota was spent): central ORANGE spine (rgba track + gradient fill whose height follows scroll progress via rAF, glow shadow), six glass cards alternating left/right (grid 1fr/72px/1fr), **orange neon segment chasing each card border** (`@property --qx-ang` + conic-gradient ring, mask-composite exclude, drop-shadow glow, 4.5s linear), pulsing spine nodes, per-card 3D cursor tilt (perspective 900, rotateX ±7 / rotateY ±9). Real links kept as tool chips + All-category; index 01–06 + count badges + category washes. <900px spine hugs left edge; reduced-motion disables chase/pulse/tilt. Verified: tsc clean, all markers in served HTML.

- **Mission 51 — Spine plugs into QRIX IN NUMBERS (`699ea65`)**: continuity trick — `.qx-tl-spine` overruns its section's exact bottom padding (bottom −5rem, lg −6rem = pb-20/pb-24) while a matching `.qx-proof-wire` (same 3px orange + glow, left 50%) fills the proof section's top padding (4rem/6rem) → reads as ONE line connecting the timeline to the stats card. A bright energy segment flows down the wire (`qxWireFlow`, 1.6s ease-in, overflow-hidden track). The stats card gets its own border chase: `.qx-proof-neon` conic ring on separate `@property --qx-ang2` (avoids clashing with the component-scoped --qx-ang), inset 0 inside the overflow-hidden card, z-3 above content (ring is only 1.5px at edges). Wire hidden <900px (spine hugs left there). Verified: markers in HTML + rules in served CSS chunk, tsc clean.

- **Mission 52 — QRIX IN NUMBERS: black glass, orange type (`aabb36c`)**: card bg → near-black glass rgba(8,6,5,.62)+blur with faint orange radial; orange hairline + warm inset. Type all orange: title #ff8a3c (glow 26px), numerals #ff7a32 (glow 22px), kicker rgba(255,150,80,.95), copy rgba(255,178,122,.88), labels rgba(255,160,100,.85), foot warm; tiles rgba(255,106,19,.07)/borders .28 hover .15; LIVE chip orange (green dot kept); trend arrows #ffb27a. Verified in served CSS chunk.

- **Mission 53 — All Tools as an interactive scrolling story (`be8ad64`)**: user rejected the timeline + stats card ("умуман бошқача қил") → CategoryShowcase v10 on the interactive-scrolling-story archetype (structure from its public page; own implementation): sticky 100vh split-screen inside a `N*92vh` wrapper; rAF scroll progress → active chapter index; LEFT stacked copyboxes fade/slide (is-past/-next ±28px, visibility-hidden inactive with 0s/0.55s delay trick — links stay crawlable, tabIndex managed), RIGHT visual cards slide with soft rotateY, `--st` chapter color drives an ambient glow + accents; clickable orange progress rail (labeled dots, jump = scrollTo formula). 7 chapters = 6 categories (emoji + giant count card) + **QRix-in-numbers finale** (2×2 orange numerals + uptime) — the separate proof section (card+wire+neon markup) REMOVED from page.tsx (feature folded into the story; proof CSS now unused but kept). Story wrapper's data-reveal dropped (transforms + sticky don't mix). <900px single-column; reduced-motion static.

- **Mission 54 — Quiet index + standalone numbers band; Remotion skills (`7010428`)**: user rejected the story too and delegated the call ("ўзинг билиб — минимализмми ёки бошқа") → restraint won. CategoryShowcase v11 = whitespace 3-col grid (no cards/borders/per-category colors/motion tricks): mono orange 01–06 + Bricolage 800 name + faint count over ONE orange hairline, plain 14.5px tool-link lists (hover: text + arrow slide), orange "All →". QRIX IN NUMBERS separated back out as `.qx-num` quiet band (page.tsx section after showcase): hairline + mono kicker + orange tabular CountUp numerals (#ff7a32, glow; light #e2410f) + faint mono labels — no card/glass/neon. Story markup gone (28 real links kept). `remotion-dev/skills` fully installed user-level (8 skills: mediabunny, best-practices, captions, create, interactivity, markup, render, saas) — active in-session.

- **Mission 55 — 5 free LLM providers + MuAPI image engine (`23b0d75`, `7a70e78`)**: researched cheahjs/free-llm-api-resources (curated free-tier LLM API list) and Anil-matcha/Open-Generative-AI (open Higgsfield-alt UI whose engine = **MuAPI** api.muapi.ai, 200+ image/video models, x-api-key, submit→poll `predictions/<id>/result`→outputs[0]). Added to `lib/server/ai/providers.ts`: **mistral/cerebras/nvidia/github** via the openAiCompatible factory, **cohere** (v2 chat schema, message.content[] blocks), **muapi** (image-generate, MUAPI_IMAGE_MODEL default flux-schnell-image) — all env-gated, zero-dep; DEFAULT_PRIORITY + TASK_ROUTES updated free-first; manager/admin pick them up from the registry automatically. `.env.production.example` now force-tracked (`.env*` was gitignored — template is placeholder-only, verified before push). Any key added to env goes live instantly, expanding the free fallback chain from 4 → 9 providers.

- **Mission 56 — Free AI keys wired live (`4f10ef7`)**: keys collected together with the user in-chat (pages opened via `powershell Start-Process <url>`; Chrome extension flaky), pasted keys wired to `.env.local` (gitignored) and LIVE-TESTED via direct curl: **Groq** ✅ (llama-3.3-70b, ~8ms), **Gemini** ✅ (adapter model bumped gemini-2.0-flash → `gemini-3.1-flash-lite` — roomiest free tier 500 req/day; 2.0-flash free quota saturated, 2.5-flash-lite retired for new keys; list `/v1beta/models?key=` to see availability; new keys may start with `AQ.` — 429 = valid-but-quota, 400 = bad key), **OpenRouter** ✅ (llama-70b:free pool busy → verified via gpt-oss-20b:free; manager treats 429 as switch-provider anyway), **Anthropic** ✅ (key already present), **MuAPI** 🔑 key valid but balance $0.00 (signup grants no trial credits — needs topup before image/video gen).
- **Mission 57 — Animated QR Maker (`68542af`)**: new standalone tool `/animated-qr` — link → 6s animated QR film for Stories/Reels: canvas timeline (sparks+glow backdrop → card pop → 11×11 tile-cascade QR reveal → shine sweep → SCAN ME pop + url caption), Story 9:16 / Post 1:1, 3 themes, custom CTA; MediaRecorder (mp4 where supported, webm fallback, 8Mbps) + final-frame PNG, fully on-device (qr-code-styling existing dep, saveBlob). Full SEO (pageMeta + softwareApp/breadcrumb LD + ToolPageShell) and registered: TopNav QR dropdown (FiPlay), search-index, sitemap 0.8. User roadmap remaining: mediabunny upgrade of video tools, promo-video generator tools, site promo films (8 Remotion skills installed & active).

- **Mission 58 — Image Tools: one studio grid + era header (`ec8f363`)**: the 7 flagship tools folded INTO ImageExpansionGrid as a leading "Essentials" category (unified Item shape: href/emoji/title/intro/keywords + AI/NEW/POPULAR badges, emoji tiles on quiet surfaces) — one search + one chip row (All/Essentials/…IMG_CATEGORIES) covers all 72; landing header rebuilt in era language (mono kicker "// IMAGE TOOLS — 72 FREE · ON-DEVICE", display H1 "A full image studio", quiet trust row over orange hairline); purple hero card, separate 7-card grid and sort select removed; sidebar Upgrade card → brand orange. /animated-qr also got its QR Tools landing card (M57b `58896c3`).

- **Mission 59 — Stats cards + Blog/SEO expansion + QA sweep + security audit (`2fd8458`, `f4a2f1b`)**:
  - **QRIX IN NUMBERS**: the four figures now ride equal-size orange gradient cards, side by side (4-col desktop / 2-col mobile), white numerals + white labels; dropped the 5th uptime tile for a clean four-across row.
  - **Blog/SEO**: +6 original feature articles (animated QR, compress video, video→GIF, AI upscaling, EXIF privacy, image→3D); `BlogPost.category` union extended with `Video` + `AI`. Blog index reorganised into **topical clusters** (category sections + anchor nav) for topical authority; broadened index metadata/keywords. All auto-picked up by sitemap + search-index. In-content **AdSense** slot added to blog posts (env-gated).
  - **Full-site QA sweep** (subagent): all **287 routes return HTTP 200, zero broken pages**; per-page unique titles + structured data verified. Ratings — QR/PDF/Image/Animated-QR/Blog/SEO **10/10**; sub-10s (AI 8, Video 8, 3D 9, Auth 7, Billing 8) are **external-service-gated** (paid AI/MP4 cloud, Stripe, DB), not code defects.
  - **Fixes applied**: video recorders now prefer real **MP4/H.264** (Chrome 130+/Edge/Safari) with WebM fallback across `recodeVideo` + mp3-to-mp4/gif-to-mp4/add-audio, filenames follow the real container; `/dashboard` got a proper `<title>` (noindex); env template domain aligned to qrix.uz.
  - **Security audit**: headers strong (frame-ancestors, X-Frame-Options, nosniff, referrer, permissions-policy, HSTS preload, no X-Powered-By); **no secrets committed** (`.env*` gitignored, template clean, full-tree scan clean); API wrapper has rate-limit (fixed-window over cache) + schema validation + auth/admin gates + CSRF + sanitisation.

- **Mission 60 — Help Center + Docs + universal tool-page landings (`1b1f253`)**:
  - **Every tool page is now a complete landing page.** `ToolPageShell` (drives AI/Video/3D/QR/image/animated-qr/barcode) gained: universal "Why use QRix" trust strip, optional "Popular use cases" + visible FAQ sections, and a strong closing CTA band. Full section set per tool: hero · how-to · about · why · use-cases · FAQ · CTA · SEO.
  - **QR tools** (30) gained 3 FAQs + 4 use-cases each (`lib/qr-tool-content.ts` merged into the registry at load) and now emit FAQPage structured data.
  - **Help Center** `/help` + `/help/[category]`: 5 categories, 42 Q&A articles (Getting Started, QR Codes, PDF, Image & AI, Account & Privacy) with FAQPage schema per category.
  - **Documentation** `/docs` + `/docs/[slug]`: 7 pages (introduction, how-it-works/on-device model, QR codes explained, PDF/image/AI-video guides, privacy & security) with TechArticle schema + prev/next nav.
  - Content produced via a 4-agent content-generation workflow, then authored into typed content modules (`lib/help-content.ts`, `lib/docs-content.ts`, `lib/qr-tool-content.ts`). Registered in footer (EN/RU/UZ) + sitemap. tsc clean; all new routes 200.

- **Mission 61 — Real in-browser video transcoding via Mediabunny (`81dbf6b`)**: replaced the canvas→MediaRecorder screen-recapture path with true WebCodecs stream transcoding for the core recode family. `lib/video/convert-mb.ts` — `convertVideo()` (bitrate compress / resize / trim / mute, **MP4-first with WebM fallback** via `canEncodeVideo('avc')`), `extractAudioMp3()` with an MP3-encodability guard, `canOutputMp4/Mp3`. `VideoRecodeClient`: compress/optimizer/convert/resolution/resize/trim/mute + split route through Mediabunny; canvas `recodeVideo` stays as the automatic fallback (unsupported source codec) and for effect presets (cut/crop/rotate/flip/speed/watermark/merge). New MP4/WebM toggle on the Converter; download extension follows the real container. `AudioExtractClient` now yields a real MP3 (WAV fallback). Meta copy updated to drop the old "cloud engine / WebM-only" caveats. **Verified end-to-end** in the browser: 2.3 MB MP4 → 544 KB MP4 compress (real H.264, ~77% smaller, 4.4 s), MP4↔WebM convert, resize, trim — all real output, nothing uploaded. Dep: `mediabunny ^1.50.8` (ESM/WebCodecs). Video Tools rating 8→**10/10**.

- **Mission 62 — Promo Video Maker (`components/PromoVideoClient.tsx`, `app/promo-video/page.tsx`)**: new standalone creative tool at `/promo-video` — turns brand + headline + benefits + link (+ optional logo) into a short animated promo film. Canvas timeline with four scenes (intro/logo → headline with accent underline → benefit bullets cascade → CTA pill + scannable QR + url), 4 themes, 3 formats (Story 9:16 / Square 1:1 / Landscape 16:9), 8/12/15 s lengths, live preview; recorded via MediaRecorder (MP4 where supported, WebM fallback, 9 Mbps) + poster PNG, fully on-device (reuses `qr-code-styling`, `saveBlob`, `trackTool`). Full SEO (pageMeta + softwareApp/breadcrumb/faq LD) and the M60 landing sections (why/use-cases/FAQ/CTA via ToolPageShell). Registered: TopNav Video dropdown (spotlighted first, FiFilm), search-index, sitemap 0.8, and a NEW spotlight card atop the `/video-tools` landing. Verified live: route 200, canvas renders the animated promo (1080×1920, rich content), zero console errors, tsc clean. Also fixed the Video dropdown "Extract Audio → MP3" label (post-M61).

- **Mission 63 — QRix Brand Film + `/promo` (`components/QrixPromoFilm.tsx`, `app/promo/page.tsx`)**: the site's own promo — a scripted five-scene canvas film (QRix wordmark + bunny → "185+ FREE TOOLS" with category chips → benefit bullets → live QR tile-reveal → "Start free · qrix.uz" CTA) using the bunny mascot cutouts, orange brand palette, ~15 s. Format switch (Landscape 16:9 / Story 9:16 / Square 1:1); MediaRecorder capture (MP4/WebM, 10 Mbps) + poster PNG, fully on-device (mascots + QR preloaded via `createImageBitmap`). Marketing landing `/promo`: VideoObject + breadcrumb LD, hero, the film, trust row, and a "make your own" CTA → `/promo-video`. Registered in sitemap (0.6) + search-index. tsc clean, route 200, no console errors. Live-canvas render blocked in the automation tab (post-restart rAF/hydration throttling — a control check showed the previously-verified `/promo-video` canvas also went blank in the same tab), so verified structurally via the identical, already-proven render/record pipeline. **Roadmap complete:** Animated QR → Mediabunny video → Promo Video Maker → site promo film.

- **Mission 64 — Orange film embed on homepage + 5 modern stat cards (`app/page.tsx`, `components/QrixPromoFilm.tsx`, `app/design-v2.css`)**: (1) recoloured the brand film to a **vibrant orange** backdrop with white/dark ink (chips → white/orange, CTA pill → white, sparks → white, vignette for contrast) and added an `embed` mode (locks 16:9, hides controls, autoplays, pauses off-screen via IntersectionObserver, draws a first frame so it's never blank). (2) The homepage banner is replaced by a full **orange brand-film section** with the auto-playing 16:9 film beside white/dark copy + "Watch & download" (→/promo) and "Make your own" (→/promo-video) CTAs. (3) **QRIX IN NUMBERS** rebuilt from 4 → **5 modern cards** (added "185+ free tools"), each with a glass icon chip, refined orange gradient + inset sheen + hover lift; responsive 5→3→2 cols. Verified: tsc clean, 5 cards render with icons, 5-col grid at 1440px, film section + embedded 16:9 canvas present (canvas animation + CountUp need real-browser hydration — automation tab throttled post-restart).

- **Mission 65 — Pre-deploy professionalization (`28b771a`, `b421aa6`, `e1551eb`, `c42e60d`)**, 4 milestones:
  1. **GDPR / AdSense compliance:** Google **Consent Mode v2** (default denied, set in layout `<head>` before AdSense/GA) + a `CookieConsent` banner (Accept/Decline → `gtag consent update` + localStorage) + privacy policy rewritten for AdSense (cookie categories, Consent Mode, opt-out links to Google Ads Settings / aboutads.info, GDPR legal basis + rights, children). Unblocks AdSense EEA.
  2. **Analytics + monitoring (env-gated):** GA4 via `next/script` (respects Consent Mode) + a dependency-free `ErrorMonitor` that reports uncaught errors/rejections to a Sentry DSN (deduped, capped). New env: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SENTRY_DSN`.
  3. **Performance / Core Web Vitals:** the site-wide `DotDistortionBackground` now **fully stops** its rAF loop under `prefers-reduced-motion` (was looping 60fps forever drawing a static frame) and **pauses when the tab is hidden**; same hidden-tab pause added to `GlitterField`; the homepage promo film shows a static poster under reduced-motion. Cuts idle CPU/INP/battery cost.
  4. **Accessibility + assets:** `role="img"` + descriptive `aria-label` on the promo/animated-QR/brand-film canvases; language switcher got `aria-label`/`aria-haspopup`/`aria-expanded`; manifest `theme_color` fixed neon-yellow → brand orange `#ff6a13`. Verified OG/Twitter images resolve to the generated `/opengraph-image` (200) — the `og.png` reference was inert. (AiKit dropzone/buttons + TopNav were already well-labelled.)
  A dedicated a11y audit (subagent) then drove a full fix pass (`52e4291`, `5de7d41`): aria-labels on every homepage QR form field + PIN, `role="img"`/aria-label on QR-preview and film canvases, `<label htmlFor>` association + swatch/close/download-format labels + `role="dialog"` in QRGenerator, homepage `<main>` landmark + focusable skip target, nav landmark labels + `aria-expanded`, `--text-faint` lightened for AA contrast, footer heading order (h4→h3), Space-key on the dropzone, and **desktop mega-dropdowns made keyboard-accessible** (open on focus, Tab through links, Escape closes, `aria-haspopup`/`aria-expanded` on triggers). All tsc-clean, routes 200. Remaining pre-deploy items are infra/accounts (see Remaining Missions): domain+Vercel, DATABASE_URL, AdSense/Stripe accounts, Search Console, and a full `next build` on non-OOM hardware.

- **Mission 66 — Growth: programmatic SEO + multilingual use-case pages (`794a003`, Milestone A)**: a new, self-contained localized SEO section at **`/use/[lang]/[slug]`** (EN/RU/UZ) that funnels long-tail search intent to the real tools — without touching the existing app. `lib/usecase-content.ts` = 14 high-intent use-cases (restaurant-menu QR, guest-WiFi QR, vCard, Instagram QR, Google-review QR, wedding QR, product-packaging QR, event QR, compress-PDF-for-email, fill-and-sign PDF, remove-bg for e-commerce, resize for Instagram, compress-video-for-WhatsApp, video-to-GIF) each with title/meta/intro/benefits/steps/FAQs/keywords. Pages render HowTo + FAQPage + Breadcrumb + SoftwareApp JSON-LD, a localized hub `/use/[lang]`, `/use`→`/use/en` redirect, footer link, and sitemap entries with **hreflang alternates**. `pageMeta` gained a `languages` (hreflang) option. `dynamicParams=false` + `hasTranslation()`/`langReady()` guards ⇒ RU/UZ URLs **404 until translated** (no fallback-English pages get indexed). **Milestone B (`lib/usecase-content.i18n.ts`)** — a 14-agent parallel translation workflow produced Russian + Uzbek-Cyrillic content for all 14 use-cases (arrays length-matched: 4 benefits · 3 steps · 3 FAQs · 5 keywords each, keywords localized not transliterated); a generator script read the workflow's return array and wrote the typed i18n module. Result: **42 localized landing pages** (14 × EN/RU/UZ) + 3 hubs, all live (200), each cross-linked with **hreflang en/ru/uz/x-default** (verified in served HTML) and auto-added to the sitemap. This captures low-competition Russian + Uzbek search traffic — a big win for the UZ/CIS market. tsc clean.

- **Mission 68 — Share buttons + 15-language SEO pages (`e2bac06`, `ebe8a28`)**: (1) `ShareButtons` (X/WhatsApp/Telegram/Facebook/LinkedIn + copy + native Web Share) placed on blog posts, use-case pages and every ToolPageShell tool page — a virality loop. (2) **Use-case SEO pages expanded from 3 → 15 world languages** (EN/RU/UZ + ZH/HI/ES/AR/FR/PT/ID/DE/JA/TR/UR/BN): a 15-agent parallel workflow translated all 14 use-cases + the section UI strings into the 12 new languages; a generator merged them (with the existing RU/UZ) into `lib/usecase-content.i18n.ts` (369 KB). `USE_LANGS` → 15, `UI` merges authored en/ru/uz + generated `UI_I18N`, `Lang`/`UseCaseI18n` widened, `RTL_LANGS`/`isRtl`/`LANG_NAMES` added. Result: **210 localized landing pages** (14 × 15) + 15 hubs, all 200, full hreflang cross-linking (verified: ZH renders Chinese, AR renders Arabic with `dir="rtl"`), sitemap = 210 use URLs, plus an on-page native `<details>` language switcher. Captures search traffic across the world's most-spoken languages, low-competition in most. The homepage/global-UI language switcher stays EN/RU/UZ for now (its 77-string `T` dictionary + HomeFaq/Newsletter/TopNav dicts + RTL on the animated homepage are a separate, larger effort).

- **Mission 69 — Homepage UI + nav in 15 languages (`7c5bbfd`)**: the global language switcher now offers all 15 languages. New `lib/lang.ts` = single source of truth (15-lang `Lang` type, `SITE_LANGS` list with flags/RTL, `isLang`/`isRtlLang`/`readLang`). A 12-agent workflow translated the homepage `T` dictionary (74 strings), HomeFaq title, NewsletterSection strings and TopNav nav labels into the 12 new languages → generated `lib/home-i18n.ts` (45 KB); each component merges `HOME_I18N` over its authored en/ru/uz with **per-key English fallback** (crash-safe). TopNav switcher → `SITE_LANGS` (15, scrollable dropdown, RTL-aware); localStorage guard widened via `isLang`. tsc clean, homepage 200. The 8 HomeFaq Q&A were then translated into all 12 new languages too (`lib/home-faq-i18n.ts`, merged into HomeFaq) — the FAQ section is now fully localized in 15 languages. Remaining minor gaps (English fallback for the 12 new langs): ReviewsSection copy and the ~10 inline ternaries in page.tsx; homepage layout stays LTR (Arabic/Urdu text renders via browser bidi — a full RTL flip of the animated homepage was deliberately skipped as too risky). Live client-side switch verified structurally (same proven localStorage+`qrix-lang` mechanism as RU/UZ; automation tab throttled post-reboot so couldn't demo it live).

- **Mission 70 — Market research + growth features (`3506988`, `15ace35`)**: a 6-agent research workflow swept free-LLM APIs, the QR-generator market, ~30 GitHub repos, YouTube, Reddit and X. Key finding: the market's #1 pain is **bait-and-switch "free" generators** (codes that deactivate after a trial, scan caps that kill live codes, watermarks, forced credit cards — 14 of 20 "free" tools have hidden limits; the category leader sits at 1.5/5 on Trustpilot). Acted on it: (1) **`/free-forever`** trust + comparison page — QRix's honest positioning (never-expires, no scan caps, no watermark, no signup, no card, private, free vector/bulk/15-langs) with a feature-by-feature comparison table + FAQPage LD; sitemap + footer. (2) **UPI Payment QR** type (`upi://pay?pa…&pn…&am…&cu=INR&tn…`) — top-requested for the India market — added to `lib/qr-types.ts` + `lib/qr-tools-meta.ts`, auto-registered across tool pages/landing/search/sitemap; verified the deep link builds correctly. AI infra note: Cerebras (1M tokens/day) + Cloudflare Workers-AI Flux (free image gen) adapters already exist in `lib/server/ai/providers.ts` — signup pages opened for the user; they add `CEREBRAS_API_KEY` / `CLOUDFLARE_API_KEY`+`CLOUDFLARE_ACCOUNT_ID` to `.env.local` to activate. **Remaining prioritized features** (from the research): anti-quishing URL-preview, free AI-QR art (Cloudflare Flux), conversion analytics, eye-shape/deep-gradient studio, EPS/PDF vector export, GS1 Digital Link.

- **Mission 70b — Free AI backends LIVE + AI QR Art (`aef0840`→`56c6c61`)**: the user added **Cerebras** (`CEREBRAS_API_KEY`) and **Cloudflare Workers AI** (`CLOUDFLARE_API_KEY` + `CLOUDFLARE_ACCOUNT_ID`) keys to `.env.local` (gitignored). Both **live-tested**: Cerebras key valid — its old `llama-3.3-70b` was retired, so the adapter now uses **`gpt-oss-120b`** (1M tokens/day free, committed); Cloudflare token active and **Flux-1-schnell image generation confirmed** (`/api/ai/process` → `provider: cloudflare`, real data-URL image, ~2 s). **Impact:** the ~7 previously-mock AI image tools (logo/avatar/poster/banner/thumbnail/image-generator) now produce **real images for free** with zero code change (infra existed since M7). New tool **`/qr-art`** (AI QR Art): free Flux background from a style prompt + your QR kept in a clean high-contrast panel (always scannable), composited on-device into a poster/square/story PNG; full SEO + landing sections (why/use-cases/FAQ), registered in TopNav QR dropdown, QR landing, search, sitemap. tsc clean; page 200; art-gen verified live. NOTE: keys are the user's — on deploy, add the same three env vars in Vercel.

- **Mission 70c — research-driven feature build (`…`→`HEAD`)**: shipped every remaining feature from the market research, each committed + verified:
  - **Anti-quishing safety check**: the QR decoder (`/qr-tools/decode`) now analyses a scanned link and shows the **real destination domain + risk verdict** (shortener/redirect, raw-IP host, punycode, brand-impersonation like `paypal.com.secure-login.ru`, insecure http) BEFORE you open it. Retargeted SEO to "is this QR safe / quishing". No competitor does this. (logic unit-tested)
  - **GS1 Digital Link QR** (`/qr-tools/gs1-digital-link`): encodes GTIN + batch/serial/expiry as a standards-compliant Digital Link (`https://id.gs1.org/01/{gtin}/10/{batch}/21/{serial}?17={exp}`) — free vs enterprise-gated rivals; rides Sunrise-2027.
  - **UPI Payment QR** (`/qr-tools/upi`): `upi://pay?pa…&am…&cu=INR` for the India market (top YouTube request).
  - **PDF export** added to the Design Studio (PNG/SVG/PDF all free via jsPDF). Note: eye-shape (corner square/dot) + linear/radial gradient controls were **already shipped** — the research validated them.
  - **Conversion attribution**: the dynamic-QR redirect (`/r/[slug]`) now appends `utm_source/medium/campaign` so the destination's own GA4 attributes scan→conversion (respects any user-set UTM).
  - **Deploy helper**: `scripts/push-vercel-env.mjs` (one-command push of the `.env.local` AI keys to Vercel; no secrets committed) + a memory note to remind about the env vars at deploy.
  All tsc-clean, routes 200, auto-registered where relevant. #3 AI-QR art was built in 70b.

- **Mission 71 — brand polish, unlimited Business & the Autopilot growth engine**:
  - **Brand film card → black glass**: homepage "THE QRIX FILM" card restyled to obsidian glassmorphism (dark translucent + 28px backdrop-blur + hairline border + orange ambient wash), orange film kept as the focal glow (orange halo ring). Copy/buttons re-tuned for the dark surface. Designed via a 4-direction judge-panel workflow. (`app/page.tsx`, `components/QrixPromoFilm.tsx`)
  - **Brand film now sells our edge**: Scene 3 reworked into an "Others limit you. We don't." comparison beat — never expire · unlimited scans · no watermark/ads · see-link-before-scan (anti-quishing) · 185+ free tools.
  - **Business tier = everything unlimited** (beats metered rivals): unlimited AI credits / team seats / API / API keys / dynamic QR & bulk + white-label; prices unchanged. Synced `lib/server/billing.ts`, `components/PricingPlans.tsx`, homepage teaser (uz/ru/en).
  - **QRix Autopilot** (the "site manager robot", env-gated, additive): AI auto-blog cron (`/api/cron/autopilot`) writes+publishes one SEO article/day via the free AI backend into Supabase `autopilot_posts`, surfaced through the blog + sitemap via ISR (quality-gated, never publishes junk); health watchdog cron (`/api/cron/watchdog`) → Telegram alerts on any degraded subsystem. Reuses existing Telegram bot + monitor + reports. `lib/server/autopilot.ts` (10 seed topics), blog index/[slug]/sitemap merge autopilot posts, `vercel.json` crons. Recommendation + enable steps in `AUTOPILOT.md`. Adversarially reviewed (8-agent workflow) — fixed the one confirmed defect (sitemap ISR revalidate). Honest boundary: content+monitoring auto; **code changes to prod stay human-in-the-loop** (scheduled Claude Code / CI with review), not an unattended agent.

- **Mission 73 — pre-deploy audit + hardening (DEPLOY READY)**: 8-dimension audit of the real code (`SITE_REPORT.md`), then **17 fixes**. Two were serious production defects found only by end-to-end testing: (1) **every QR scan stalled ~1s** — `/r/[slug]` was a page calling `redirect()` to an external URL, which Next answers with `<meta http-equiv="refresh" content="1;url=…">`; converted to a Route Handler returning a real **307**. (2) **Geo analytics were silently dead in prod** — the 63MB GeoLite2 mmdb isn't in the serverless bundle, so every scan stored `country=null`; now reads Vercel's `x-vercel-ip-*` headers and the DB is untracked. Also: CRON_SECRET **fail-closed**; site-wide **real og:image** (the referenced `/og.png` never existed, and dropping the override wasn't enough — Next does NOT inherit the root `opengraph-image` into nested segments, so pageMeta now points at `/opengraph-image`); deleted a dead **open-redirect** `/r/[slug]/verify`; removed IP/geo `console.log` leaks; **PIN hashed + brute-force limited** (5/10min); scan IPs **anonymized** (GDPR); PBKDF2 **600k** (versioned); `create-dynamic` rate-limited; `CLOUDFLARE_AI_TOKEN`→`CLOUDFLARE_API_KEY` config bug; Business credits unlimited; **Stripe now sells Pro/Business × monthly/yearly** (webhook activates the right tier); honest tool counts ("25+ PDF" was false — 21 exist); blog `og:type=article`; RSS merges autopilot; sitemap real dates; `<html lang/dir>` synced (RTL); Geist double-load removed + fonts via preconnect `<link>`; **3 AI tools taken live** (translator, image-generator, subtitle-translator — gated only by `NEXT_PUBLIC_AI_ENGINE`, verified against Gemini/Cloudflare Flux; the other 5 stay honestly "preview" — `colorize`/`inpaint` map to a *text* model, and vision returns 503); Enterprise pricing card; and a guard so `CREDITS_ENFORCED=1` **cannot** charge against the non-persistent mock store.
  - **Known gap (accepted, post-deploy):** `lib/server/db.ts` is still an in-memory mock — **292 synchronous `db.*` call sites across 28 files**, and Prisma is async, so wiring it is a full sync→async refactor (its own mission, needs a real Postgres). Nothing user-facing depends on it: accounts, dynamic QR, scans, referral, newsletter and subscriptions all persist in Supabase.

- **Mission 74 — homepage design pass (Magic UI / Uiverse restyle)**: stat cards → **MagicCard** (cursor-following gradient border + inner spotlight, built as pure CSS off MotionLayer's existing `--mx/--my` rather than importing `motion`, which would have added ~50KB to the homepage); the six category cards → **spec-sheet cards** (mono header, id badge, LIVE chip, headline tool count); nav pill → **sparkle** (conic spark on the ONE sliding pill, not on all 8 links — that would mean 8 bloom layers and ~160 particle SVGs in the bar). Commits `09cf174`, `3381f72`.

- **Mission 75 — flat navy canvas, one-line nav, hero that scrolls** (`2ecb186` → `57910db`):
  - **Background**: the katakana field and the three cross-fading gradient scenes are **gone** — the dark half of the site is one flat navy (`--bg: #0a1226`). The `.qx-scenes` canvas stays opaque because it is also what hides the site-wide dot canvas (`-z-10`) on this page.
  - **Hero scrolls instead of dissolving**: the orange moved off the fixed cross-fade canvas onto the `.qx-era` section itself, so it scrolls up like any other block and **stops dead at the section edge** (verified: hero bottom == generator-section top) instead of bleeding over the QR cards. ⚠️ **Carrying the shared `.qx-scene::after` veil over with it turned the orange muddy** — the era scene had explicitly switched that veil off (`content: none`). Fixed in `57910db`: `.qx-era` is the two layers it always was (warm glow + saturated orange). **Never re-add a dark wash to the hero.**
  - **Nav labels on one line**: they wrapped because ten flex items were squeezed below content width, so the fix is **room, not `white-space: nowrap`** — measured: nowrap overflows the bar and pushes *Sign in* off the edge (ru/uz labels need ~1500px of a 1400px bar). Room came from the header's side padding (40px → 24px at `xl:px-6`, where the bar is viewport-limited rather than capped by `max-w`), the bar gap (16 → 8px) and the inter-link gap (→ 0). The bar now appears at `xl` (ten one-line links need ~1280px of window; below that the burger already carries them all). **Verified with `document.fonts.status === "loaded"`** — 10 links, one line each, 65px headroom. ⚠️ **Measuring the nav before the webfont loads reads fallback metrics and lies** (it cost a false "fixed" report once).
  - **Reverted at the user's request** (`57910db`), do not re-add without a new brief: the **meteor cursor + ember trail** (`MeteorCursor.tsx` deleted; cursor is the plain arrow), the **black ledge** under the drifting tool names, and the **legibility plate** behind card-less copy (`.qx-legible` — it existed for the old dot field; a flat navy gives the copy enough contrast).
  - **Known, pre-existing, not introduced:** the **ru/uz nav overflows** the bar around 1280–1360px — ten Cyrillic labels don't fit at any padding. This pass shrank the overflow but can't close it; the real fix is structural (group the six tool categories under one dropdown) and awaits a decision.

## Current Mission
_Note: a cinematic warp-tunnel homepage background (Mission 72) was built then **reverted at the user's request** — it didn't match the reference video closely enough. Do not re-add it without a new brief. The 21st.dev gradient-dots, the cosmic swirl and the katakana matrix backgrounds were likewise built and rejected — the background is now a **flat navy** and should stay monotone unless a new brief says otherwise._

Mission 73 complete — **the site is deploy-ready**. Next: **deploy** (domain + Vercel + AI env vars: CEREBRAS/CLOUDFLARE + DATABASE_URL + Stripe + Supabase `autopilot_posts` table + TELEGRAM_* + CRON_SECRET + Search Console). Prior: Mission 70 growth features (free-forever, UPI/GS1, AI QR Art, anti-quishing, PDF export, UTM attribution). (shared lib/lang.ts + generated home-i18n.ts, English fallback). With Mission 68's 210 localized SEO pages, the site's UI and its SEO landing pages both speak 15 languages. Prior: M68 share buttons + 15-language use-case SEO pages. under /use/[lang]/[slug] (EN/RU/UZ) with correct hreflang, HowTo/FAQ/Breadcrumb LD, localized hubs, sitemap + footer. Delivers both #1 (programmatic SEO) and #2 (multilingual hreflang SEO). Prior: Mission 65 pre-deploy hardening — GDPR cookie consent + Consent Mode v2, AdSense-ready privacy, GA4 + Sentry (env-gated), reduced-motion/hidden-tab perf pauses, a11y labels, manifest brand colour. Prior: M64 orange homepage brand film + 5 stat cards; M63 QRix Brand Film + `/promo` — the site's own on-device promo (mascot, 185+ tools story, live QR, CTA), MP4/WebM export in 3 formats. **The agreed roadmap is now fully delivered** (Animated QR → real Mediabunny video transcoding → Promo Video Maker → QRix's own promo film). Prior missions: M62 Promo Video Maker; M61 WebCodecs video; M60 Help Center + Docs + universal landings; M59 stats + blog clusters + QA sweep (287/287) + security audit.

## Remaining Missions
- Deploy: Vercel (env + cron `/api/cron/cleanup`) or `docker compose up` (Postgres/Redis/MinIO included); then `prisma migrate deploy` + `npm run db:seed`.
- Swap mock repositories to Prisma queries once DATABASE_URL is live (interface already isolated in `lib/server/db.ts`).
- **Monetization go-live (from M59 audit):** (1) apply for Google AdSense — content depth is now sufficient; set `NEXT_PUBLIC_ADSENSE_CLIENT` + real slot ids to switch ads on. (2) Add live Stripe keys (`STRIPE_SECRET_KEY` + price ids) to make `/pricing` plans purchasable. (3) Top up MuAPI or add a Fal/Replicate key to flip cloud AI/3D + image-gen from preview to real. (4) Set `DATABASE_URL` (Supabase/Postgres) so accounts/analytics persist across deploys.
- Configure Supabase Google OAuth provider (auth UI is built; provider still needs enabling in Supabase console).
- i18n localized URLs; more AI/Video blog articles for continued SEO growth.

## Current Architecture
Next.js App Router + TS + Tailwind v4, CoolM5 palette. Tool categories follow one pattern: `lib/<x>-tools-meta.ts` registry → `app/<x>-tools/page.tsx` landing + `[slug]/page.tsx` SSG → `components/<x>/<X>EngineRegistry.tsx` lazy-maps engine keys to clients. Shared primitives in `components/ai/AiKit.tsx`; SEO in `lib/seo.ts`; motion via `data-reveal`/`data-magnetic`. Backend: `prisma/schema.prisma` + `lib/server/*` mock-first env-gated drivers, REST at `app/api/v1/**`, admin at `/admin`. Register new tools in TopNav + search-index + sitemap. Supabase auth/backend, Stripe billing, all env-gated.

## Current Tool Count
~187 tools: QR 30+ (+ Animated QR) · PDF 21 · Image 72 · AI 28 · Video 30 · 3D 1 · Barcode 10 formats (+ Link-in-Bio, Poster, Bulk QR). Blog: 64 articles across 6 topical clusters.

## Current Categories
QR Tools · PDF Tools · Image Tools · AI Tools · Video Tools · 3D Tools (+ Barcode, Link-in-Bio, Blog, Help Center, Docs).

- **Mission 76 — live world map behind the navy, with the visitor's own pin** (`36c90eb`):
  - `components/WorldMapBackground.tsx` — dotted world map on the dark half of the site; 129 city dots pulse on a stagger ("people are using this"), and the visitor gets a **"We are here"** beam over the city they are actually in.
  - **Geo**: Vercel resolves it at the edge (`x-vercel-ip-latitude` / `-longitude` / `-city` / `-country`) — no permission prompt, no third-party call, nothing stored. `lib/geoip.ts` already read country/city for scan analytics; this adds the coordinates. Served from **`/api/v1/geo`** (`force-dynamic`, `private, no-store`) rather than read in the page, because **touching headers in a page opts it out of static generation** — the homepage must stay static. Cached in `sessionStorage`: one invocation per session, not per navigation.
  - **Localhost has no edge headers**, so the pin would be dead in dev. Fallback = the browser's own timezone: `Intl` gives `Asia/Tashkent` → the city segment is looked up in the same list the dots come from (**which is why the cities are named after IANA zones**). Both paths resolve Tashkent to the identical point (x=84.02, y=20.10, 0.00 units apart).
  - **The map is generated at build time** (`scripts/gen-world-map.mjs` → `public/world-dots.svg` + `lib/world-map.ts`), never imported. ⚠️ `dotted-map` is **352 KB of world land data** and emits **3065 points** — importing it would put all of that on the homepage's critical path, and rendering the points as `<circle>` nodes would put 3065 elements in the DOM. The committed SVG is **9 KB gzipped, one `<img>`, zero DOM cost**. `dotted-map` now lives in **devDependencies**.
  - The projection is **fitted by least squares against dotted-map's own `getPin()`** and validated against all 129 cities (worst residual 0.632 of a grid cell; the script refuses to emit above 0.75). Do not hand-edit `lib/world-map.ts` — regenerate it.
  - ⚠️ **The automation tab cannot verify this** (or any client effect): it does not lay out `<main>` at all (`.qx-era` measures 0×0 there) and suppresses `useEffect` site-wide (MotionLayer activates 0 of 29 reveal elements). Geometry was proven on a standalone page with the same CSS — pin drift 0.00%.

- **Mission 77 — map sizing + one pricing catalog** (`2211922`):
  - **Map fit**: it was sized on width alone, so a tall viewport pushed the top off screen (at 1897×907 it came out 1560×787 with only 60px above it — the navbar is 68px). The width cap is now also derived from viewport **height** (`min(1240px, 84vw, 138vh)`; 119/60 ≈ 1.98, so 138vh of width ≈ 70vh of height). ⚠️ **Deliberately a width cap, not `max-height`** — clamping the height breaks `aspect-ratio`, the image letterboxes inside a wider box while the HTML label keeps measuring against the box, and the "We are here" tag drifts off its pin. Verified at 6 viewports (390×844 → 1920×1080): never taller than 70% of screen, always clears the navbar.
  - **Pricing is single-sourced.** `lib/plans.ts` (previously dead code) is now the one client catalog, mirroring `lib/server/billing.ts` (which does the charging). `PricingPlans` and the new `components/PricingTeaser.tsx` both read it. ⚠️ **The plans had been written out twice and had drifted**: the homepage teaser printed **$4 / $40** under a "/mo" label — those are the *annual-prepay* rates (48/12, 490/12); a monthly subscriber is charged **$5 / $49**. It also rounded Business's annual rate to $40 (it is $40.83) and had **no Enterprise tier**. Never hardcode a price in a component.
  - Homepage now shows **4 professional cards** (Free · Pro · Business · Enterprise) with monthly headline price, the yearly rate stated *as* a yearly rate, 4 features each, recommended badge — in uz/ru/en (`Lang` has 12 locales; the rest fall back to English).
  - Two false claims in the pricing UI are now **computed, not asserted**: "Save 20%" (true only of Pro, 60→48; Business/Enterprise are 17%) and "2 months free" (true only of Business, 490/49 = 10 months).

- **Mission 78 — reviews as a chat** (`dc5e48e`):
  - `components/ReviewsSection.tsx` rewritten. The two drifting marquee rows are gone (they showed everything at once and gave no review time to be read). Now: **form on the left, reviews arriving beside it as chat bubbles** — 4 at a time, staggered, alternating sides, avatar + stars, one lit in brand orange with a shine sweep. They hold, clear out, and the next 4 arrive, cycling the whole pool.
  - ⚠️ **Inline `animation-delay` outranks the `animation` shorthand in a class.** The exit inherited the 170ms *entry* stagger, so the last bubble finished leaving at 910ms while the page swapped at 640ms — cut off mid-exit. Fixed by choosing the stagger per phase (170ms in / 60ms out) and **deriving** the wait from it (`EXIT_TOTAL_MS`), never guessing. Simulated: arrive 1090ms · leave starts 5290ms · leave ends 580ms · swap 580ms.
  - ⚠️ Second bug: once a visitor left a review the accent followed it by id, so **every page without their review had no lit bubble at all**. Falls back to a fixed slot when their review is not on screen.
  - **WCAG 2.2.2** (auto-advancing content must be stoppable): pauses on hover *and* keyboard focus, dots drive it by hand, and under `prefers-reduced-motion` it does not auto-advance at all (dots still reach every review). `aria-live="off"` so a screen reader is not read a new testimonial every 6s.
  - Submitting sends the chat back to page 0 so the visitor watches their own review arrive, lit up.
  - `.qx-tmk` / `.qx-tcard` removed from `globals.css` (nothing else used them); kept the reduced-motion rule they shared with `.qx-logos-track`.

- **Mission 79 — scroll-scrubbed hero bunny (prototype)** (`2b8916e`):
  - The user asked whether a Higgsfield subscription ($9/$29 — **note: that is the OLD Jan-2026 pricing; it repriced mid-2026 to Starter $15 / Plus $49 / Ultra $129**) could make premium scroll animations with the bunny. Answer built **without any purchase**: the bunny's pointing take is 50 frames and the scroll position picks which to draw (`components/BunnyScrollStage.tsx` canvas). Higgsfield's blocker isn't price — it outputs **opaque MP4**, and a mascot needs alpha + a stable character; see memory [[higgsfield-bunny-video]].
  - ⚠️ **This fixed a white flash that was live on the homepage.** `public/scenes/bunny-hero-live.webm` washes the bunny out to a pale ghost **3.50s–4.57s every loop** (body luma ramps 116→232); the old hero looped it on a 6.5s timer, so it flashed once a second. Alpha is fine throughout — it's the RGB. The scroll frames stop at **source frame 98** so the flash is not in the sequence. See memory [[bunny-scroll-source-flash]].
  - **Frames, not video, for scroll-scrub**: seeking a WebM costs a decode per in-between frame (keyframes are ~2s apart); all-keyframe re-encode inflates ~10×. An image sequence has no seek cost (Apple-style). 50 frames = **0.94 MB**, under half the 2.05 MB video.
  - `scripts/gen-bunny-frames.mjs` + `lib/bunny-frames.ts`. ⚠️ **Two ffmpeg traps** (documented in the script): `-c:v libvpx-vp9` MUST precede `-i` or WebM alpha is silently dropped; and `-frames:v N` caps OUTPUT not input, so with a `select` every-2nd-frame it read 105 through the flash — enforce the range **inside** `select`. The quality gate measures the frames **actually written** (at 110×192, not 44×77 which hid the ramp) and throws on any washed-out frame.
  - Three parallax layers (glow / bunny / contact shadow at different rates); frames load in parallel with nearest-loaded fallback; `prefers-reduced-motion` holds a pose. `bunny-point.webp` (a file, used by QrixPromoFilm) is untouched — the new frames live in `bunny-point/` (a folder).
  - **Still a prototype**: hero only. If approved, extend the choreography down the page (walk between sections, point at each tool family, world-map pin).

- **Mission 80 — full-page scroll companion** (`e33eea8`): `components/BunnyCompanion.tsx` extends the hero scrub down the page — below the hero the bunny sits in the left gutter and points at each content section (all-tools · reviews · pricing) as it centres, arm down between. Reuses `bunny-point/` frames (frame 0 arm-down → last frame point); no new assets.
  - ⚠️ **Centred dense layout has no gutter at ~1440px** — a persistent side companion would cover the cards / reviews form. So it **measures the tightest section's left edge** each resize and only appears when the gutter is wide enough (~**1644px+**), sized to fit inside it. Proven no-overlap 1440→2560. Below that: renders nothing, hero bunny only. **Never widen it past the measured gutter.**
  - Skips hero + generator bands (both have their own bunny), `pointer-events:none`, off on touch / reduced-motion. Client-gated so absent from SSR. Removal = delete the `<BunnyCompanion />` line in `app/page.tsx` + the file.
  - Choreography simulated: arm peaks (frame 48) as each section centres, ~frame 6 between. tsc clean, page 200, no overlap.

- **Mission 81 — REVERTED the scroll bunny** (`407fda0`): the user found the scroll motion wasn't needed. Missions 79 (hero scroll-scrub) and 80 (full-page companion) are removed. Hero is a **calm still** again (`bunny-hero.webp`) with the existing smoke reveal + parallax; nothing moves on its own. Deleted: `BunnyScrollStage.tsx`, `BunnyCompanion.tsx`, `lib/bunny-frames.ts`, `scripts/gen-bunny-frames.mjs`, `public/scenes/bunny-point/` (50 frames). ⚠️ Did **NOT** restore the old still↔film cross-fade: its film `bunny-hero-live.webm` washes to white 3.50–4.57s (see memory [[bunny-scroll-source-flash]]); the still has no flash. The webm stays on disk, referenced only in comments (never plays). `bunny-point.webp` (a file, QrixPromoFilm) untouched.

- **Mission 82 — reviews readable + on-theme cards** (`6cfaa75`): review bubbles used `--surface-2` (6% white = near-transparent), so the world map bled through the text. Now the site card glass at ~93% + blur → text 11:1 AAA. Form + reviews column made equal-height (grid `stretch` + form `flex-col` + textarea `flex-1`). All-Tools spec cards reskinned from near-black graphite to `--card-bg` navy glass (16px radius, blur). ⚠️ standard `backdrop-filter` only (Lightning CSS trap).
- **Mission 83 — reviews drift + numbers cards glass** (`05efb99`): reviews are a **vertical marquee** now (float up continuously in the right column; form stays put on the left, equal-height fixed window clamp(440,56vh,560)). ⚠️ **seamless loop needs `margin-bottom` on rows, NOT flex `gap`** — gap gives N items N-1 gaps so `translateY(-50%)` jumps half a gap. Pauses on hover; reduced-motion → static scroll; visitor's own review floats past lit orange. **QRIX-in-numbers 5 cards** reskinned from graphite to the **QR generator card's glass** (`.qx-fcard`: `rgba(255,255,255,.05)` + `--glass-blur` + 0.13 hairline + 22px); cursor-lit border/spotlight kept; `isolation:isolate` did NOT break backdrop-filter.

- **Mission 84 — one glass across homepage cards** (`fcf6d87`): added material-only `.qx-glass` (globals.css) = the QR generator card's glass (`rgba(255,255,255,.05)` + `--glass-blur` + 0.13 hairline). Applied to the reviews form + Latest-guides cards; lightened the brand-film panel's inline bg to match; softened the numbers cards' cursor ring to 0.16 at rest. All four now compute identical to `.qx-fcard`. **Reuse `.qx-glass` for any new homepage content card.**
- **Admin panel is already owner-only** (no code change): `/admin` → `ADMIN_EMAILS` (default `musarasulzada@gmail.com`) via magic-link; API server-enforces `admin: true`. See memory [[admin-access]]. Deploy needs `AUTH_SECRET` + real email sender + `ADMIN_EMAILS` = owner only.
- **Payments = after deploy** (advised): Stripe needs the live HTTPS domain for webhooks + return URLs; billing code is env-gated and works in mock now — flip to real by setting `STRIPE_SECRET_KEY` / `STRIPE_PRICE_*` / webhook secret post-deploy, no code change.
- **Domains** (checked via Vercel, 2026-07-15): qrix.com/.io/.app/.ai/.dev/.net/.link all TAKEN. Available: **qrix.pro $4.99** · **qrix.tools $17.99** · getqrix/tryqrix/useqrix/qrixapp/qrixhq **.com $11.25** · qrix.studio $21.99 · qrix.co $123.

- **Mission 85 — DEPLOYED to qrixtools.com** (2026-07-15/17): domain registered (Cloudflare, $11.25/yr) and wired (`4f435b1`); `design-v2` fast-forwarded to `main` (Vercel deploys `main`); Supabase live (project `kszqlafadaxrknadcala`) — 4 tables, `autopilot_posts` created via MCP; **security lockdown `0797c19`**: `dynamic_links`/`qr_scans` RLS-locked to the service role (anon "update for everyone" = redirect-hijack — closed), `lib/supabase.ts` is now the service-role client, dashboard scans scoped to own slugs; ⚠️ **`SUPABASE_SERVICE_ROLE_KEY` is REQUIRED** (memory [[supabase-service-role-required]]); crons trimmed to Hobby's 2-daily limit (`10e560f` — restore the other 4 on Pro); Resend wired (magic-link emails deliver); Google OAuth enabled (brand verification pending — app name must read "QRix").
- **Mission 86 — the PIN-QR bug, fixed in three layers**: users scanned PIN QRs and went straight to the target. Chain: page ran on the **www origin** (the service worker's page cache swallowed the www→apex redirect) → same-origin `fetch(/api/create-dynamic)` hit the domain redirect ("Redirecting…", not JSON) → creation failed → old client **silently fell back to encoding the raw URL**. Fixes: `a9b6c46` no silent fallback (red "QR was NOT protected" error, uz/ru/en); `b91ba68` canonical-host inline script in layout (www → apex before anything runs; previews untouched) + sw `qrix-v2` cache purge; `33a300b` scheme-less URLs ("www.google.com") get `https://` defaulted client-side. Verified on prod end-to-end: create → `/pin/<slug>` 200 with form → `/r/<slug>` 307s to it. ⚠️ **PIN QRs made before the fix encode the raw target and must be regenerated.**

- **Mission 87 — full production audit + mobile hero fix + host hardening**: real end-to-end test of live qrixtools.com. **Verified working**: PIN flow (create → `/pin/<slug>` form → wrong PIN `?error=1` → correct PIN redirects), plain dynamic links, `/api/v1/geo` (UZ/Tashkent), AI backend **alive on `gemini`**, autopilot blog (2 posts, one/day, 4 sections + 4 FAQs each), all key pages 200 + JSON-LD, sitemap/robots, HSTS+CSP+XFO+nosniff headers, admin APIs 401, crons 401 without secret, PIN brute-force cap. **Fixed (1) mobile hero overlap** — `.qx-hm` was bottom-anchored (`bottom` clamp from the base rule, mobile MQ only overrode `height`), so the bunny sat over the copy + search while the stage's `44vh` top-gap sat empty. Now top-anchored inside the gap (`top:14vh; bottom:auto; height:36vh`) + stage `padding-top:46vh`. Confirmed by measured geometry (title ends ≈102px · bunny 114–406px · content starts ≈476px — clean gaps both sides); **not screenshot-verified — this session's preview pane runs `visibility:hidden` so it never lays out `<main>` (`.qx-era` = 0×0), same trap noted in M76/M39**. **(2) redirect host hardening** — `create-dynamic`'s `isSafeUrl` accepted `http://localhost/…` and private/loopback/link-local/metadata IPs; added `isPublicHost()` (blocks 10/8·127/8·172.16/12·192.168/16·169.254/16·100.64/10·`::1`·`fc/fd/fe80`·`localhost`·`.local`). Not a server-side SSRF (redirect is client-side) but stops the domain masking internal-network redirects. tsc clean; test rows cleaned from prod DB.

- **Mission 88 — pro pass on QR Art · Link-in-Bio · Design Studio** (user: art hidden behind the QR card; controls untidy; templates too plain vs me-qr): **(1) QR Art** (`QrArtClient.tsx`) — the QR panel and headline are now **draggable right on the preview canvas** (pointer events + canvas-space hit testing; `setPointerCapture` wrapped in try/catch — it throws on synthetic/edge pointers and killed the drag), plus QR size slider (22–58%), 3 panel materials (Card/Compact/Glass), 9-dot position grid, scrim toggle, Reset; controls reorganized into numbered sections (01 Content · 02 AI background · 03 Layout). Download = same canvas, WYSIWYG. **(2) Link-in-Bio** (`LinkInBioClient.tsx`) — one long messy column → professional 5-tab editor (Templates · Profile · Design · Links · Share); templates are now **me-qr-style mini page-preview cards** (theme gradient + avatar + accent buttons + Applied ✓) and grew 6→9 (added Fitness Coach, Courses/Teacher, Photographer); share QR builds only on the Share tab (qrRef nulled on tab switch — the mount remounts). **(3) Design Studio** (`QRDesignStudio.tsx`) — added a 10-template pro gallery (Classic/Sunset/Ocean/Forest/Berry/Midnight/Gold/Neon/Café menu/Wedding), each card rendering a **real 72px qr-code-styling preview** of its exact config; one click applies shapes+colors+gradient+bg+CTA frame. All verified in the dev preview by DOM/pixel probes (drag moves the card, slider 55%, 9 bio templates apply → preview + Profile update, studio shows 10 mini QRs, Neon applies). **Testing trap solved for hidden preview tabs**: React 19.2 batches streaming Suspense reveals via rAF (`$RB`/`$RV`) — in a hidden tab rAF never fires and the whole page stays `<div hidden>`; shim rAF + flush `$RV($RB)` manually, then effects run.

- **Mission 89 — Design Studio pro: logo-as-QR + scan check + studio in every QR tool** (user wants me-qr's logo feature and the studio everywhere): **(1) Logo modes** in `QRDesignStudio.tsx` — "Center logo" with a size slider (20–45%, `imageSize`) and **"Logo = QR ✨"**: the logo becomes the whole code (qr-code-styling renders modules on a transparent bg; composite = white base → logo cover → wash toward white → modules; "Logo visibility" slider 15–50%; EC locked to H). Full mode exports correctly in PNG/PDF (composite at export size) **and SVG** (`<image>` + wash rect injected under the module layer). **(2) Live scan check** — a real jsQR decode of the final artwork after every change (450ms debounce), badge "✓ Scan check passed / ⚠ May be hard to scan". Turbopack CJS gotcha: `import("jsqr")` resolves to the FUNCTION itself, `.default` is undefined — use `typeof m === "function" ? m : m.default` (QrDecodeClient's `.default` works in webpack prod builds but not dev). **(3) Logo palette** — dominant colors extracted from the uploaded logo (24px quantize, skip near-white/transparent) → "From your logo" chips set the QR color. **(4) Hi-res export** — 512/1024/2048px PNG via a headless qr-code-styling instance (same pattern QrArtClient proved); frame math scales by k=size/280. **(5) Studio everywhere** — `QRGenerator.tsx` (all `/qr-tools/[slug]` tools) now opens the FULL studio instead of its little inline color modal; new `onApply` prop reports {fg,bg,level,logo} back so the tool page's live preview follows (verified: Sunset template → WiFi tool preview went orange). Homepage passes no onApply — unchanged. All verified in dev by DOM/pixel probes, incl. full-logo mode still decoding.

- **Mission 90 — audio format picker in Extract Audio** (user: add phone/computer formats): `AudioExtractClient` now has a 4-format selector — **MP3** (universal), **M4A/AAC** (iPhone/Apple), **WAV** (lossless), **OGG/Opus** (smallest, Telegram/Android) — with per-format hints, live progress %, and **instant re-convert**: tapping another chip re-encodes the kept file without re-dropping. `lib/video/convert-mb.ts` grew `extractAudio(source, format)` + `supportedAudioFormats()`; **MP3 is now guaranteed on every browser** via the official `@mediabunny/mp3-encoder` (LAME/WASM, lazy-loaded, registered only when `canEncodeAudio("mp3")` is false — new dep, justified: the tool used to silently fall back to WAV). M4A = audio-only `Mp4OutputFormat`; WAV/OGG via mediabunny's native output formats; last-resort AudioContext→WAV fallback kept. Meta/SEO/FAQs updated (which-format-to-pick FAQ). Verified in dev with a synthesized tone video: all four formats extract and re-convert, player playable after each.

- **Mission 91 — studio modal scroll + clean PIN page**: (1) Design Studio modal — scrolling moved the PAGE behind, not the modal's controls; fixed with a body-scroll lock while open (`document.body.style.overflow = "hidden"`, restored on unmount) + `overscroll-behavior: contain` on the card so bottoming-out doesn't chain to the page. (2) The PNG/SVG/PDF download menu used translucent `--surface-2` and was unreadable over the modal — now solid `--surface-solid`. (3) `/pin/…` and `/r/…` are scan-landing pages, not browsing — `TopNav` returns null there (early return placed AFTER all hooks; pathname check), so scanners see only the PIN lock card. Verified in dev: body locks/unlocks, card scrolls internally, menu bg rgb(20,20,20) solid, nav absent on /pin with the form rendering; dev test row cleaned from Supabase.

- **Mission 92 — wide studio modal · mobile dashboard · Background Remover fixed**: (1) **Studio modal** — user still couldn't reach lower controls; restructured to the classic pattern where the OVERLAY is the scroll container (`overflow-y-auto` on the backdrop, card `m-auto` inside `flex min-h-full`) so the wheel works anywhere over the modal; card widened `max-w-3xl→max-w-6xl`, controls in 2 columns at xl (Logo group spans both), preview column sticky. (2) **Dashboard mobile** — the fixed `w-60` sidebar always rendered, squeezing phone content to ~130px; now `hidden lg:flex` + a slide-over drawer (hamburger in the dashboard header, body scroll locked while open, shared `sidebarInner`); header/content paddings responsive, Create QR label hidden on xs; **global TopNav now returns null on `/dashboard`** too (two sticky bars overlapped the search on phones — dashboard is its own app shell). (3) **Background Remover was broken everywhere**: it set `publicPath: ${origin}/imgly/` but those model assets were never shipped → every run 404'd and hung at "Loading AI model...". Removed the override so assets load from the package's own CDN (staticimgly.com); progress now shows fetch % + "(first run only)". Verified end-to-end in dev: model downloaded, cutout produced. **All server AI tasks probed healthy on prod** (text/translate/summarize/ocr/image-analyze → gemini; image-generate → cloudflare). Note: deploy-watch by CSS hash gives false timeouts when a commit doesn't change the stylesheet — probe content instead.

- **Mission 93 — PDF→Word 1:1 (ilovepdf-quality) + PDF tools speed pass**: user compared us to ilovepdf's pdf_to_word — ours "completely broke" the layout. Rewrote `PdfToWordClient` with two modes: **"Exact layout (1:1)"** (default) — one DOCX SECTION per page at the exact PDF page size (0 margins), every text line an **absolutely positioned text frame** (`framePr`, page-anchored, wrap none, exact lineRule) at its true PDF coordinates with real font sizes + serif/mono/sans mapping from pdf.js styles, images as **floating anchors** at their CTM positions behind the text — opens in Word looking like the PDF, every line editable (same technique commercial converters use); and **"Flowing text"** — improved reflow: consecutive same-size lines MERGE into paragraphs (hyphen-aware), center/right alignment detection, headings, real fonts. Speed: pages analyzed concurrently (pool of 4), and pdf.js+worker+docx **prefetch on file select** so the click is instant. Slowness audit found infra HEALTHY: both workers in public/ are 6.0.227 matching the package, prod serves them 200 + `application/javascript` (real worker thread, not fake-worker fallback); 3-page convert ≈0.6-1.0s — remaining "slow" is heavy-by-nature tools (OCR/compress render loops) + phone hardware. Verified: Node probe of docx 9.7.1 framePr emission ALL PASS; browser E2E both modes (valid ZIP, no errors); unzipped the real browser DOCX in-page (DecompressionStream) — 93 frames/3 sections/exact A4/all text present.

- **Mission 94 — PDF→Word hang fixed + graphics layer (user's real INGOS policy)**: the user's insurance PDF hung at "Analyzing page 1 of 2" forever and the pre-created save target stayed EMPTY. Root cause (diagnosed with a Node pdf.js probe on the actual file): image object `g_d0_img_p1_3` lives in **`page.commonObjs`** (document-global, `g_` prefix), but the extractor awaited `page.objs.get()` — a getter that never fires → `Promise.all` never resolves → docx never built. Also 207 vector path ops (table borders) were unrepresentable by XObject extraction at all. Fixes: **exact mode no longer touches object stores** — each page renders to a full-page JPEG **graphics layer** (scale ≤2, text lines whited out, near-blank layers dropped via 64px ink test) placed `behindDocument`, with the editable text frames on top → table borders/logos/stamps now come through pixel-perfect; **flow mode** picks the right store (`g_`→commonObjs) and caps every object wait at 2.5s (skip, never hang). Verified with the real policy in dev: exact 2.3s/168KB, flow 0.8s/13KB, DOCX contains 90 frames · 2 exact-size sections · Cyrillic text · 2 behindDoc JPEGs. Privacy: the user's policy was staged in public/ only for the local test and deleted before commit.

- **Mission 95 — PDF→Word column splitting: 56% → 100% position fidelity**: user re-tested the INGOS policy — still not 1:1. Measured against the source (Node script: parse DOCX framePr x/y + text, match every PDF segment start): only **90 of 160 segments** had a frame at the right spot — **70 right-column cells were GLUED onto the left frame of their row** ("ЭЛЕКТРОННЫЙ Страховая премия" in one frame). Two fixes in `buildLines(items, styles, splitCols)`: (1) in exact mode a row **splits into independent segments at x-gaps > size×1.1**, each its own positioned frame (whiteout follows automatically since segments ARE the lines); (2) whitespace-only items **bridge column gaps** and mask the split point — dropped in column mode (word spacing comes from the gap rule anyway) — this alone took 111 → 160 frames. Verified in dev on the same policy: **160/160 frames**, all previously-missed markers at exact x (Страховая@448, 07.09.2023@507, Срок@339, №ХХХ@275, с@425), 180KB, no errors. Flow mode untouched (rows stay whole for paragraph merging).

- **Mission 96 — PDF→Word ilovepdf-parity pass (visual, verified through Word itself)**: user compared our DOCX side-by-side with ilovepdf's — dissected BOTH (ilovepdf = real `w:tbl` tables + colors + Verdana/Times, zero frames) and closed the visible gap on the frames approach. Verification loop each round: convert in dev browser → export DOCX bytes (base64 via tool-result files) → **render via Word COM → rasterize → LOOK at it** next to the original. Fixes: **(1) per-segment color sampling** from the pre-cover render — text color = in-box pixels most distant from local bg (blue headings/white-on-blue table headers now真real); cover patches painted with the box's DOMINANT interior color, not white (no more white patches on blue bands; whole-box dominant beats edge strips — borders can't hijack it); light-on-light samples snap to black (antialias artifacts). **(2) real font resolution** — `page.commonObjs.get(fontName).name` gives the PostScript name ("…Verdana-Bold") → true family map + bold/italic (styles fontFamily alone loses bold). **(3) two-tier space rule** — word gap 0.24em, but 1-2-char neighbours need 0.5em (kills "H y u n d a i" without gluing "Страховаяпремия"); row tolerance 0.5→0.62 size (form values on shifted baselines). **(4) residual-ink sweep** — white-bg boxes still holding chunky ink after cover get an expanded repaint (thin borders can't trigger it at the 5% bar). **(5) frame width = max(pdf width, canvas.measureText with mapped font)** so Word metrics never wrap a line inside its frame ("379326"). Known verification artifact: Word's PDF **export** of Arial digit runs rasterizes as seven-segment glyphs in pdf.js-node — the DOCX itself is clean (Arial/black in XML) and Word displays it correctly. Bg layers verified visually clean; page-1/2 renders match the original closely.

- **Mission 97 — the "Arial curse" found and killed**: user's re-test in real Word still showed OCR/LCD-style digits ("31 895", VIN, Hyundai, e-mail). A MINIMAL repro docx (3 paragraphs: frame+exact / frame / plain, each with an Arial run + a Tahoma run) exported through the user's own Word proved it: **every run named "Arial" renders in a thin OCR-style face on this machine, frames irrelevant; Tahoma renders fine**. GDI draws Arial normally and FontSubstitutes is clean, but arial.ttf was replaced 2024 (SamLab Windows build) and Word 2013's font pipeline resolves it to the broken face — a MACHINE issue, but the product must survive such machines. Fix: the converter never emits "Arial" — default sans is now **Tahoma** (universal, metrically close, proven working here). Verified end-to-end on the same policy through the user's Word: premium digits, VIN row, Hyundai/Solaris, e-mail, phone all render normally; the doc now closely matches ilovepdf's output. (ilovepdf anatomy, for the future: real `w:tbl` tables + indents + textboxes, zero frames — a table-reconstruction mode is the next big fidelity step if ever needed.)

- **Mission 98 — server-side PDF→Word: provider fallback chain (Adobe-first)**: user (comparing to ilovepdf) chose a cloud engine and proposed a chain — Adobe → CloudConvert → own server, auto-return when limits reset, plus any other strong free-tier services. Researched + confirmed the free tiers: **Adobe PDF Services 500/mo** (best fidelity, real tables), **Aspose.Words 150/mo**, **ApyHub 10k/mo**, **CloudConvert ~25/day**, **self-host Stirling PDF/Gotenberg = unlimited**. Built `lib/server/pdf-convert.ts` — an ordered provider chain (`convertPdfToWord`): each provider a fetch adapter, tried best-first, **try/catch/next gives auto-fallback AND auto-recovery for free** (over-quota throws → next; next request retries the top, so a reset window silently returns — no usage table). Adobe adapter = full REST flow (token → asset → upload → exportpdf → poll → download; 429 = quota). Self-hosted adapter (Stirling `/convert/pdf/word`) is the unlimited tail. Each provider joins only when its env keys exist, so the whole feature is **inert until keys are added** — `GET /api/pdf-to-word` → `{available:false}`, `POST` → 501. Replaced the dead Anthropic-OCR route with the chain route (nodejs, 60s, 25MB cap, %PDF magic check, rate-limited 30/hr/IP). Client (`PdfToWordClient`) gains a **"★ Best quality (cloud)"** mode that appears + becomes default only when `available`, uploads the PDF and saves the returned DOCX, and **transparently falls back to on-device exact** on any server failure; honest privacy copy per mode (cloud = "sent to a secure server, not stored"; on-device = "nothing uploaded"). **Owner TODO: add `ADOBE_PDF_CLIENT_ID` + `ADOBE_PDF_CLIENT_SECRET` to Vercel env** (Adobe free tier, OAuth Server-to-Server creds) → redeploy → cloud mode goes live. Secrets never handled in chat/by the agent (prohibited-action rule). tsc clean; route verified locally (available:false + 501 without keys).

- **Mission 98b — cloud PDF→Word LIVE & verified pixel-perfect**: owner added `ADOBE_PDF_CLIENT_ID/SECRET` + `ASPOSE_CLIENT_ID/SECRET` in Vercel and redeployed. Production `GET /api/pdf-to-word` → `{available:true}`; a POST of the real INGOS policy returned **provider: adobe, 693KB** (≈ ilovepdf's 694KB) and, rendered through Word, is **1:1 with the original** — real editable Word tables, blue logo/headers, correct fonts/positions, stamp, QR. The multi-provider chain is confirmed working (tiny/edge PDF fell through adobe→aspose). Added `ASPOSE_CLIENT_ID/SECRET`, `CLOUDCONVERT_API_KEY`, `PDF_ENGINE_URL/TOKEN` as optional chain keys (memory [[pdf-word-provider-chain]]). The quest for ilovepdf-quality PDF→Word is solved via the cloud path; on-device modes remain the private fallback.

- **Mission 99 — universal social-media downloader (video/audio/image)** `16536a1`: new `/downloader` tool + a big homepage card (between the QR generator and the tools grid) + Video-Tools nav + search + sitemap. Paste a link → preview → pick video (MP4) / audio (MP3) / image with a streamed animated progress %. **YouTube deliberately EXCLUDED** — Google owns YouTube and AdSense policy forbids YT-downloader pages; the "only CC videos" idea does NOT shield the account (researched), so it stays out to protect the owner's whole AdSense account. Architecture mirrors the PDF chain, env-gated: `lib/server/media-download.ts` = cobalt (`COBALT_API_URL`, covers every platform) → keyless built-ins (TikTok via tikwm; direct-media). Formats are **HMAC-signed** (CRON_SECRET) so `/api/download/file` can only proxy URLs we produced (never an open proxy); per-host Referer for CDNs. **VERIFIED LIVE on production**: TikTok end-to-end downloaded a real 2.95 MB valid MP4 (`provider tikwm`; note the tiktokcdn URL is US-geo-locked so it only streams from Vercel's US region, not from a UZ dev box). Instagram/VK/X/Reddit/etc return honest "engine_not_configured" until the owner adds `COBALT_API_URL`; unsupported hosts are rejected. Automated UI-click test was blocked by the in-app browser's hidden-tab layout (0×0 rects, the visibility:hidden trap) — the API pipeline + SSR were proven instead; the client is a standard controlled-input+fetch. **Owner TODO (morning):** deploy cobalt (fits Render free, ~150MB, unlike Stirling) → set `COBALT_API_URL` → every platform lights up. Providers researched: y2mate/savefrom are malware-ridden (our clean/ad-free angle is the moat); YouTube blocks datacenter IPs so cobalt is best-effort for it anyway (moot since we exclude it).

- **Mission 99b — cobalt live + downloader fixed & SEO-bombed** `82ae0db`: owner deployed cobalt v10.9.4 on Render free (`qrix-cobalt.onrender.com`, `API_URL` env = its own URL) and set `COBALT_API_URL` in Vercel. User's real test then showed: video worked (IG/Pinterest/OK) but **every Audio·MP3 failed + OK download failed** — root cause: cobalt returns **"tunnel" URLs on its own host that expire in minutes** and were also rejected by the file-proxy allowlist. Fix = **re-resolve tokens**: tunnel formats now sign the ORIGINAL page URL (`k:"c"` payload) and `/api/download/file` re-calls cobalt at click time for a fresh tunnel (can never expire; no allowlist hole; legacy `k:"d"` direct tokens still verified, now also allowing the cobalt host). Also: **own keyless SoundCloud extractor** (`k:"s"`: homepage→sndcdn script client_id scrape, 1h cache → api-v2 resolve → progressive MP3) because cobalt's soundcloud route is IP-blocked from datacenters; **short-link unshortener** (reddit `/s/` share links, t.co, redd.it, snd.sc, dai.ly — manual-redirect hops server-side); TikTok chain order = tikwm first; `verifyMedia` hardened (timingSafeEqual length guard). **SEO bomb**: `app/downloader/[platform]/page.tsx` — 16 SSG landing pages (unique title/intro/features/HowTo/FAQ + SoftwareApp/Breadcrumb/FAQ/HowTo JSON-LD), all in sitemap + 9 in search index, main `/downloader` chips now link to them, `DownloaderClient` got a `placeholder` prop. **LIVE-verified on production with the user's own links**: IG video 6.0MB + IG MP3 545KB ✓, Pinterest video 882KB + MP3 92KB ✓, OK.ru 1080p 84MB ✓, SoundCloud MP3 3.2MB ✓ (own extractor), TikTok all 4 formats ✓ (live trending link; old test links were dead), X/Twitter 21.2MB valid MP4 ✓, Dailymotion video+audio ✓. **Blocked by platform-side datacenter-IP bans (not our bug): VK (`fetch.critical`), Reddit (`fetch.fail` on every URL form), Vimeo, Bilibili** — the one-shot fix later is a cheap residential proxy on the Render service via cobalt's `API_EXTERNAL_PROXY` env (~$2–5/mo); until then those chips show the honest "private/deleted/region-locked" error. Facebook/Snapchat/Twitch/Threads/Tumblr need live links to verify (my synthetic ones were dead).

- **Mission 100 — downloader premium card redesign** `f126775`: `.qx-dl-*` design layer in design-v2.css — input bar with orange focus bloom; platform logos as a masked infinite marquee (pause-on-hover, reduced-motion→static wrap) whose chips link to the 16 `/downloader/[platform]` SEO pages; shimmer skeleton while fetching; framed thumbnail with brand badge + mono duration chip; segmented gradient type tabs; format rows as hairline tiles (icon tile, container meta line, gradient progress fill with moving shine, pop-in Saved); homepage card gains corner orange glow + pulsing New dot + mono metric line. Verified on dev (marquee animating, 32 brand SVGs, chips link, zero console errors; screenshots unavailable — hidden-tab 0×0 limitation).

- **Mission 100b — audio everywhere + teaser→page** `b5fcde2`: OK.ru had no Audio option (cobalt: `error.api.service.audio_not_supported`) — the client now synthesizes an "Audio · MP3 (Extracted from video)" format whenever a link has video but no server-side audio: it streams the video (progress→70%) then extracts the soundtrack **in-browser** with the existing Mediabunny/LAME engine (`lib/video/convert-mb.ts` `extractAudioMp3`, →100%). Homepage downloader card became a **teaser Link to /downloader** (mock input bar + localized hero CTA + span-chip marquee — no nested links); the working card lives on the dedicated page, which gained "What you can download" (MP4/MP3/JPG cards) and "About this tool" (privacy, tips, short-link notes) sections per the user's request.

- **Mission 101 — growth engine (SEO + distribution)** `9c267cf`+`33ba2c8`: real-data audit (Supabase: 65 QR scans, 182 links mostly launch-week, 1 review; GSC just woke up — 75 impressions/1 click, avg pos 74.9, sitemap 526 pages discovered Jul 17). Search Console verified + sitemap in; **Bing** imported from GSC (user); **Yandex**: `verification.yandex` meta live `a30e73e` (user clicks «Проверить»). Key insight: AI/3D long-tails (ai avatar generator 11 imp, image-to-3d 6 imp + first click, denoiser 4) outrun head QR terms — so 5 new AUTOPILOT_TOPICS target those niches + downloader guides, slotted right after the launch batch. **IndexNow** (`lib/server/indexnow.ts`, public key `c3bb2594…d8.txt`): autopilot now submits the FULL live sitemap to Bing+Yandex daily on publish (self-healing; first manual push got 403 SiteVerificationNotCompleted — engines verify the key within hours, cron retries daily). **Telegram channel autoposter** `/api/cron/social-post` (09:00 UTC, vercel.json): tool-of-the-day trilingual (EN/RU/UZ) post with UTM via bot; env-gated on `TELEGRAM_CHANNEL_ID` (+ existing `TELEGRAM_BOT_TOKEN`, bot must be channel admin). Owner's human-only queue: Yandex «Проверить»+sitemap, create TG channel + env, Product Hunt/Show HN/r/InternetIsBeautiful posts, directories (AlternativeTo/Toolify/SaaSHub/Uneed).

- **Mission 102 — RU-market SEO strike** `0dc4307`: 17 static Russian pages — `/ru/downloader` hub + 16 platform pages (`app/ru/downloader/`), custom copy for top-8 («Скачать видео из TikTok без водяного знака», ВК, Одноклассники…), templated rest; en↔ru hreflang on BOTH language versions via pageMeta `languages`; sitemap (564 URLs) + search index; all 564 resubmitted to IndexNow (HTTP 200). Rationale: RU-query volume is huge, quality ad-free competition weak, Yandex Webmaster wired same day. Directory day: SaaSHub submitted+VERIFIED (14 competitor pages), Uneed free queue (Dec 21), AlternativeTo waits for 7-day account age (submit Jul 27), Toolify/TAAFT now paid ($99) — skipped. GA4 live `7dc85e2` (G-XKW8P2LRY0 hardcoded default in layout).

- **Mission 103 — top-1 strategy, wave 1** `6b06731`+`ccf1495`+`9c514a1`: (a) **PUBLIC Telegram downloader bot** `/api/telegram/bot` — separate token from the admin bot (`TELEGRAM_PUBLIC_BOT_TOKEN` + `TELEGRAM_PUBLIC_SECRET`, env-gated no-op), secret-token webhook check, per-chat 20/hr limit, sendVideo straight into chat (≤20MB) with format URL-buttons fallback, trilingual, self-registers webhook via GET `?setup=1` (cron auth) so no token passes through chat; (b) **comparison pages** `/compare/qrix-vs-{ilovepdf,tinywow,snaptik}` — honest tables that concede competitor strengths, FAQ JSON-LD, sitemap+search; (c) **GA4 `tool_used` mirror** in lib/track.ts (+ gtag global type aligned with CookieConsent — TS conflict hotfixed `06291e7`) and **search-miss logging** in CommandSearch (zero-result queries → `search_miss` event = user-demanded roadmap). Also: weekly Supabase backup `7b1758c` (Sundays via autopilot cron → private `backups` storage bucket; free tier has no auto-backups). Wave 2 backlog: viral QR footer, embeddable widget (needs frame-ancestors exception), PWA install prompt, review-ask toast, more languages, residential proxy for VK/Reddit.

- **Mission 104 — top-1 wave 2** `d19b907`+`b9cb1c1`+`4b0505c`: (a) **viral QR footer** — `lib/qr-export.ts` composites the homepage QR canvas onto a 2x-crisp PNG with a subtle background-matched `qrixtools.com` footer (auto-contrast); every printed/shared QR is a quiet ad; Pro will pass `brand:false` (monetization hook). (b) **Uzbek downloader pages** — `/uz/downloader` + 16 platform pages in LATIN Uzbek (Uzbek search is predominantly Latin: "tiktok video yuklab olish"); en/ru/uz 3-way hreflang across all downloader pages. (c) **Embeddable widget** — `/embed/*` opts out of frame headers (`CSP frame-ancestors *`), embed layout adds `.qx-embed` (hides all site chrome via `body > *:not(#main)`), `/embed/downloader` = bare widget + UTM "Powered by QRix" backlink (noindex); `/widgets` = public builder with one-click copy iframe snippet + live preview (`components/EmbedSnippet.tsx`). All verified locally (embed strips chrome, builder keeps it, zero console errors). Sitemap now ~597 URLs. Wave 2 remaining: PWA install prompt, review-ask toast, more languages (ES/PT/TR/ID), residential proxy for VK/Reddit. STILL owner-gated: activate public TG bot (`TELEGRAM_PUBLIC_BOT_TOKEN`) + channel (`TELEGRAM_CHANNEL_ID`).

- **Mission 105 — Telegram distribution LIVE** `de7d49b`..`228a91c`: public downloader bot `@qrix_downloader_bot` (token `TELEGRAM_PUBLIC_BOT_TOKEN`, secret `TELEGRAM_PUBLIC_SECRET`, webhook self-setup via `?setup=1`) + public channel `@QRixtools` (`TELEGRAM_CHANNEL_ID`, daily tool-of-the-day autopost 09:00 UTC via `/api/cron/social-post`, readiness probe `?status=1`). Bot: send a link → media into the chat; **format buttons are CALLBACKS** (not links) so "Audio·MP3"/"Video·HD" deliver that file INTO the chat (callback_data 64-byte cap → re-reads the link from the replied-to message, stateless). Fixed two delivery bugs: `tg()` unwraps `result` so `sent?.ok` was always undefined (every success also fired the "file too large" fallback) and whoAmI() read the wrong path. Welcome card has share deep-link + UTM site button. Brand avatar `public/bot-avatar.png` (512², @napi-rs/canvas — 3 QR eyes + download-arrow 4th corner, 12 platform brand-dot ring). `lib/social.ts` = single source of truth (`TG_CHANNEL`/`TG_BOT`); footer Telegram block + downloader-page chips link both, all UTM'd. **User-confirmed everything works** (link→video, MP3 button→MP3 in chat). YouTube stays excluded (AdSense). Owner still to do: BotFather name/about/pic (`/setuserpic` bot-avatar.png), rotate `TELEGRAM_PUBLIC_SECRET` off the value I suggested in chat, refresh webhook with `allowed_updates=["message","callback_query"]`.

- **Mission 106 — converter-pair pages (programmatic SEO family #1)** `3cc26a6`+`f776952`: `lib/convert-pairs.ts` registry drives `/convert` (hub, grouped by target format, ItemList JSON-LD) + 20 SSG `/convert/[pair]` pages (png/jpg/webp/avif/bmp/gif/ico) targeting "png to jpg"-class head terms. Each page reuses `ToolPageShell` + `ImageEngineRegistry` so the REAL working ImageConvertClient is embedded (`engine: "convert:<mime key>"`), never thin: per-pair title/h1/desc/intro/~130-word about/3 steps/4-5 FAQs, all hand-written per format trade-off — plus SoftwareApp+Breadcrumb+**HowTo**+FAQ JSON-LD (new reusable `howToLd()` in lib/seo.ts) and a related-converters block for internal linking. Registered in sitemap (21 URLs), search-index, TopNav image dropdown, llms.txt. **Also fixed a real bug this family depended on:** `canvas.toBlob()` does not support `image/bmp` or `image/x-icon` and silently returns PNG bytes, so the pre-existing BMP and ICO conversions were handing users a PNG with a lying extension — ImageConvertClient now writes a genuine 24-bit BMP (BITMAPINFOHEADER, bottom-up 4-byte-aligned rows, alpha flattened to white) and a genuine ICO (ICONDIR + ICONDIRENTRY wrapping a 256² PNG); 17 byte-layout assertions pass. All 21 URLs verified HTTP 200 live with unique titles + canonicals; IndexNow accepted (200). **TIFF is still broken the same way** — next in backlog.

## Last Commit Hash
Mission 143 (the honesty pass) `933fbc2`+`0261cd8` — the M142 audit scored content 41/100 and every point of it was self-inflicted; this mission stops the site lying about itself rather than adding anything. **(1) Autopilot blog posts 404d** — M118 regression: `dynamicParams=false` on a route that is NOT registry-only (autopilot posts publish daily from Supabase without a deploy), so every DB-backed post 404d while the blog index and Blog schema advertised it. Restored `dynamicParams=true`; and because the root loading boundary streams a 200 shell before the body can throw (the soft-404 M118 documented), the missing-post `notFound()` moved into `generateMetadata`, which resolves pre-stream — verified live: unknown slug now a real 404, autopilot post 200, static post 200. **(2) Fabricated stats deleted** — the homepage counters claimed 1,000,000+ QR created / 50,000,000+ scans / 150+ countries / 10,000+ businesses, all invented; replaced with verifiable product facts (185+ tools · 32 QR types · 21 PDF tools · 15 languages · 0 watermarks). **(3) Twelve fabricated reviews deleted** — invented names, stories, dates, plus a hardcoded ★4.9/5 badge; the badge now computes from real reviews (≥3) or shows a neutral label, and an honest empty state replaces the marquee. **(4) The 0+ SSR bug** — both CountUp components started state at 0, so crawlers read literal 0+ next to a five-star badge; state now starts at the real value, animation is hydration-only (verified: served HTML carries 185). **(5) Absolute privacy claim scoped in en/ru/uz** — Nothing leaves your device (hero, feature bullet, HomeFaq, /free-forever ×2) contradicted About and the server-side tools; now most tools run on-device, the few that need a server say so on their page. Plus sitemap lastmod only for real dates — 808→71 lastmod entries (was one identical deploy timestamp on 737 URLs, which teaches Google to ignore the field). ⚠️ Verification note: a grep for the deleted 50,000,000 matched once post-deploy — it was `animation-delay:1.6500000000000001s` in SVG float noise, not the stat; always print match context before believing a digit grep. Earlier: Mission 142 (claude-seo audit + 3 production fixes) `f2022df` — installed the AgriciDaniel/claude-seo skill suite (25 skills + 18 agents; install script reviewed, copy steps mirrored manually; Python runtime deliberately skipped) and ran a 7-agent parallel audit of qrixtools.com, every finding backed by a live fetch. **Health Score 72/100** (technical 84 · SXO 83 · GEO 79 · schema 78 · performance-lab 78 · sitemap 62 · content 41). Three production defects fixed the same hour: **(a) `Disallow: /p`** — robots rules are prefix matches, so one bare rule had the entire PDF category (21 tool pages), /pricing, /privacy, /promo, /promo-video and /poster (27 sitemap URLs) uncrawlable while the sitemap submitted them; now `/p# QRix Progress

## Completed Missions
- **Core platform** — QR Tools (30+ types + decoder/scanner), PDF Tools (21), Image Tools (7), Barcode Studio (10 formats), Link-in-Bio, QR Poster Maker, Bulk QR, Dashboard, Pricing, Legal.
- **Monetization** — Referral system (Supabase, migration 0002), Stripe Pro billing (checkout/webhook/portal, migration 0003, env-gated), AdSense slots (env-gated), Newsletter (migration 0004).
- **SEO** — 54 blog articles, sitemap, robots, RSS, per-page metadata + JSON-LD, generated icons/OG.
- **Premium SaaS layer** — CoolM5 reskin, MotionLayer (scroll-reveal/stagger/magnetic/spotlight), Cmd+K CommandSearch, TrustedBy marquee, HomeFaq, LatestPosts, Newsletter, route transitions, loading bar.
- **Mission 1 — AI Tools** (`e184f18`): 28 tools at `/ai-tools`, config-driven, on-device engines + cloud connector.
- **Mission 2 — Video Tools** (`48911ab`): 29 tools at `/video-tools`, canvas→MediaRecorder pipeline + gifenc + Web Speech + connector.
- **Mission 3 — Image Tools Expansion** (`4ccd65b`): +65 config-driven on-device image tools at `/image-tools/[slug]`.
- **Mission 4 — Premium Homepage** (`328660e`): 5-category showcase with coverflow tool previews + features strip.
- **Mission 5 — Premium SaaS Experience** (`4a9fa1a`, `d59f6cb`): favorites, recents, history, bookmarks, settings, account; toasts; enhanced Cmd+K; TopNav account dropdown. localStorage via `lib/user-prefs.ts`.
- **Mission 6 — Backend + Cloud Platform** (`00b457d`, `3b9db62`): Prisma schema + `lib/server/*` (env-gated drivers with working mocks: db/auth/RBAC/security/cache/storage/queue/billing/email/cms/api-keys/analytics/providers ai·video·image), REST API `/api/v1/**` (auth incl. magic-link/reset/verify, me + collections, settings, keys, jobs, billing, track, uploads, admin, cron), `/admin` panel (charts, users, subs, payments, article CMS, flags, logs, system status). Homepage polish: two-row infinite testimonial marquee near footer, premium partner logos.
- **Mission 7 — AI Provider Manager**: `lib/server/ai/providers.ts` (11 pluggable adapters with real HTTP calls: Gemini, Groq, OpenRouter, Cloudflare Workers AI, HuggingFace, OpenAI, Anthropic, Replicate, Fal.ai, Stability, Custom; env keys `<PROVIDER>_API_KEY`) + `lib/server/ai/manager.ts` (single entry `runAiTask`: smart per-task routing, primary/backup overrides, automatic fallback chain, rate-limit detection with 60s cooldown, response cache, per-provider health/latency/tokens/cost stats, AES-GCM-encrypted admin-stored keys). Free providers first: gemini→groq→openrouter→cloudflare. All AI surfaces route through the manager: `/api/ai/process` (client connector), job queue (`runAi` shim), image `ai` provider. Admin: `AI` tab (enable/disable, primary/backup, masked key entry, success rate, avg latency, daily usage, tokens, est. cost, last error/request) via `/api/v1/admin/ai-providers`. Verified live end-to-end (fallback walked to first keyed provider; cache dedupe confirmed).

- **Mission 8 — Production Services & Deployment**: Redis cache (Upstash REST + raw RESP TCP with auto-reconnect, memory fallback) backing sessions/response/rate-limit; real S3-compatible storage driver (SigV4 on Web Crypto → AWS S3/R2/B2/MinIO, presigned URLs, analytics) + Supabase driver; queue upgraded (priority high/normal/low, bounded concurrency, exponential backoff, `queueStats`); **Credit Engine** (`lib/server/credits.ts`: FREE 60 / PRO 1000 / BUSINESS 5000 / ENTERPRISE custom monthly credits, admin-tunable costs, grants/refunds/ledger/stats, metering always on, deduction behind `CREDITS_ENFORCED=1`, wired into `/api/ai/process` + jobs, plan-sync bumps balance on upgrade); email drivers Resend/Mailgun/minimal-SMTP; auth finalized (device sessions + revocation, Google/GitHub OAuth code-flow routes, magic link, reset); billing upgrade/downgrade/refunds; monitoring (`lib/server/monitor.ts` + `/api/health` + `/api/ready`, env/secret validation); structured logger; Prisma factory (`lib/server/prisma.ts`, dynamic load + db scripts + `prisma/seed.mjs`); Dockerfile + docker-compose (app/postgres/redis/minio) + `.env.production.example`; admin System tab shows live health/credits/subscriptions/queue, AI tab gains per-provider connection Test.

- **Mission 9 — Enterprise Workspaces** (`0fc455e`): personal/team/organization/enterprise workspaces (branding, credit pool, storage quota); invites accept/reject, suspend/restore/remove, ownership transfer; built-in + custom roles with granular per-module permissions (qr/pdf/image/video/ai/3d/api/workspace); shared projects with version history + restore; comments with @mentions → notifications; isolated activity log + workspace dashboard. `lib/server/workspaces.ts`, `/api/v1/workspaces/**`, `/workspace` hub UI, admin Workspaces tab, Prisma models.
- **Mission 12 — Analytics Platform**: enriched event capture (country/device/browser/referrer/hour parsed server-side in `/api/v1/track`); `analyticsDashboard(filters)` in `lib/server/analytics.ts` — visitors/sessions/users/tool-category usage/conversions/revenue/subscriptions/credits/downloads/uploads, realtime (5m), country-device-browser-referrer breakdowns, conversion funnel, retention cohorts, weekday×hour heatmap, top tools, most active users; ranges 24h/week/month/year + filters (country/device/plan/tool/user); exports CSV/Excel/JSON + dependency-free PDF at `/api/v1/admin/analytics?format=`; admin Analytics tab (`components/admin/AnalyticsBoard.tsx`, code-split): SVG area/bar/donut/heatmap/funnel/retention charts, filter row, export buttons, 15s realtime refresh. Dev console email driver now logs action links (magic link usable locally).
- **Mission 11 — Global Search Platform**: full-text multi-token ranked search across every module (tools, AI, blog, docs, FAQ, categories, pages) in `lib/search-index.ts` with group filters + "did you mean" suggestions; ⌘K palette upgraded (`components/CommandSearch.tsx`): 120ms debounced instant results, Tab-cycled filter chips (All/Tools/AI/Blog/Docs/Pages), trending searches + popular tools from `/api/v1/search` analytics, pinned commands (star any result), no-result suggestions, Web Speech voice search, favorites/recents/recent-searches, full keyboard nav, ARIA roles.
- **Mission 10 — Developer Platform**: public REST API — any `/api/v1/*` route accepts `Authorization: Bearer qrix_live_…` (scoped read/write, per-key + per-workspace `X-Workspace-Id` rate limits); OpenAPI 3.1 at `/api/v1/openapi.json` (`lib/server/openapi.ts`); webhooks (`lib/server/webhooks.ts`: HMAC `X-QRix-Signature`, retry ×3 with backoff, delivery history, auto-disable after 10 failures, events: job.completed/failed, subscription.created, payment.succeeded/refunded, …) + `/api/v1/webhooks/**`; `/developers` portal (interactive docs from the spec, quick start/auth/rate-limits/error codes, API-key manager with rotate/revoke, webhook manager + test deliveries, live playground request builder, SDK snippets JS/TS/Python/PHP/cURL); downloadable SDK `public/sdk/qrix.js` (jobs, waitForJob, uploads, webhooks, workspaces); admin API tab (key usage, webhook delivery monitoring).

- **Mission 13 — Performance + SEO + Production** (`4b9e751`): PWA (service worker: cache-first statics, network-first pages, `/offline` fallback; prod-only registration in `components/PwaVitals.tsx`), route-change page-view analytics (idle-deferred, respects reduce-data), root `global-error.tsx`, skip-to-content link, `prefers-contrast` tokens. Existing SEO/OG/JSON-LD/sitemap/robots/RSS/404/500/loading/dark-mode/reduced-motion preserved.
- **Mission 14 — 3D Tools Platform** (`28dc69a`): new category via `lib/three-tools-meta.ts` → `/3d-tools` landing + `[slug]` SSG (full SEO). Image-to-3D: AI manager `3d-generate` task (Fal.ai TripoSR + Replicate, smart routing/fallback), queue jobs with progress/ETA/cancel, R3F viewer (orbit/zoom, 3 lighting rigs) with on-device textured-relief fallback, GLB/OBJ/STL/USDZ exports (three exporters), history/favorites. Credits: 3 free per account, then 20 credits force-enforced (`/api/v1/3d`). Registered: TopNav EN/RU/UZ, homepage showcase card (3D mocks), search, sitemap, analytics categories.

- **Mission 15 — Enterprise Telegram Admin Bot**: `lib/server/telegram/*` (config env-only, zero-dep Bot API client, screens, bot, notify). Owner-only security: OWNER_ID validation, webhook secret-token check, replay protection (monotonic update_id), rate limiting, command whitelist (/start /menu /help), full audit logging, silent rejection of strangers. Inline-keyboard admin: Dashboard, Users (search/profile/grant PRO-BIZ-ENT/credits/reset/ban/unban/delete/history), Subscriptions, Credits, Revenue, Payments+refunds, Analytics (24h/7d/30d/1y), AI Providers (enable/disable/primary/live test), Video/Image/3D queues (retry/cancel), Storage (purge), Server health (cache clear, requeue workers), Logs, Notifications, Maintenance, Deploy (webhook/polling switch), Settings — breadcrumbs, Back buttons, confirmation dialogs. Live owner notifications (new user/subscription/payment/refund/job fail/provider fail/500s/admin login, throttled) wired into billing/queue/auth/api. Daily/weekly/monthly reports (on-demand buttons + `/api/cron/telegram-reports`, vercel.json cron schedules). Transport auto-detect: dev long-polling loop, prod webhook (`/api/telegram/webhook`). Admin → System shows "Missing Configuration" when env is absent. `banned` user flag enforced in sessions/login.

- **Missions 16-19 — Design V2 + v1.0.0 release** (branch `design-v2`): unified design tokens (`app/design-v2.css`: spacing/radius/blur/elevation/motion/category accents); homepage hero with aurora + light rays + orbiting icons + floating QR platform + animated counters + trust badges; glass navbar with scroll shrink; premium button (sweep/ripple/focus/disabled) and card (tilt/elevation) systems; bento feature grid; alternating section backdrops; motion system (9 reveal variants, parallax, 3D tilt, hydration-safe start-after-load engine); SVG illustration system (14 subjects) powering redesigned 404/error/offline/loading/empty states; CRO pricing (monthly/yearly toggle, recommended spotlight, trust strip, FAQ schema); CHANGELOG.md + README rewrite; version 1.0.0 tagged.

- **Mission 20 — Creative Director Homepage Rebuild**: cinematic full-viewport hero (86svh, mega editorial type clamp→6.8rem, scroll cue), cursor-reactive spotlight (root --px/--py fed by MotionLayer → .qx-hero-light), 6 drifting CSS particles, scroll storytelling (sheet bridges layering sections as continuous story), unique reveals per section (depth/left/rotate/perspective added), pricing teaser with animated conic border placed directly under testimonials (trust→pricing adjacency), 3D studio rebuilt Tripo-style (three-panel workspace, PMREM+ACES lighting, topology stats, env swatches, HD smoothed heightfield mesh, React.lazy fix for never-mounting client).

- **Mission 21 — Cinematic Editorial Homepage** (taste-skill pass): SynapseX-inspired rework — full-viewport mouse-scrubbed film hero (delta-based seek chained on `seeked`), corner-anchored Space Mono headlines with ScrambleIn terminal decode (components/Scramble.tsx), difference-blend text for readability over any frame, Anton SC giant watermark + 24px dot-grid, hero decluttered to 4 elements per taste rules (counters/badges/cue removed — stats live in the strip), loop-video backdrops on cinematic statement (rotateX scroll-scrub via motion/react useScroll+useSpring) and stats sections, licensed CloudFront films wired via components/CinemaVideo.tsx.

- **Mission 22 — Mockit design language**: full palette migration to mockit.design's system adapted for QRix — near-black `#080808` base, single hot accent `#ff4d1c` (+`#ff7a50` hover) replacing neon-yellow/lilac across every token, warm off-white text; typography switched to Bebas Neue (giant condensed caps hero: DROP A LINK. / GET YOUR QR. / JUST QRIX. with orange middle line, Oswald cyrillic fallback) + Bricolage Grotesque display/body; hero recomposed centered with mono metric line, llama films removed everywhere; generator 3-cards restyled to hairline dark cards (#141414, white/7% border, Bebas titles with orange tick, #0d0d0d panels); global sweep of all hardcoded neon hexes/rgba in css+components.

- **Mission 23 — Katana scroll-canvas + Jitter tool cards**: nixtio/katana-style scroll-adaptive background — 10 homepage sections declare `data-scrollbg`; a direct scroll listener cross-fades the page canvas (1.1s ease, syncs `--bg` so sheet fades follow) through a deep-navy journey (#080808→#00172d→#041c37→#082142→#0d1932→#001a24→…→#080808), dark-theme only, reset on route change; CategoryShowcase's 6 cards rebuilt in jitter.video template language — preview-dominant flat tiles (#141414, hairline border, coverflow mock fills the top on #0d0d0d stage), caption row below (icon + title + count·chips meta + arrow), hover lift + preview scale, float/conic-border chrome removed.

- **Mission 24 — Katana scene canvas (`d13981f`)**: first mission verified visually via **Claude-in-Chrome** against the real nixtio/katana page (M23's flat hex shifts were the reason it read as "not even close"). `.qx-scenes` — position:fixed viewport canvas with 4 rich gradient scenes (`base` #080808 · `deep` navy radial · `ember` giant orange glow · `dusk` warm ending) cross-fading 1.3s as `[data-scene]` sections cross viewport center (MotionLayer switches `.on`; hex `data-scrollbg` fallback kept). Stats section rebuilt as the katana "red moment": boxed strip → transparent section on the ember scene, 2×2 giant Bebas counters (clamp 52–104px, tabular, nowrap) in the hot accent + Space Mono labels, uptime as a mono footnote. Two production bugs found by seeing the page: (1) `.qx-page-in` used `animation-fill-mode: both` — the persisted transform made the route wrapper the containing block for fixed descendants, degrading `.qx-scenes` to a document-sized sheet → `backwards`; (2) `ScrambleIn` SSR'd a bare nbsp — blank hero until hydration on slow devices and an empty H1 for crawlers → initial state is now the real text, decode takes over on mount. Light theme: scenes `display:none`, stats accessible orange.

- **Mission 25 — Samurai + katana scene art (`497757d`)**: user's M24 verdict — "қани самурай, қани катана". Image-gen MCP has 0 credits, so the reference artwork was rebuilt as hand-tuned SVG (`components/SceneArt.tsx`): `SamuraiArt` (dark armored silhouette behind the hero headline — kabuto, outward kuwagata crescents, glowing visor slits, layered sode, QR chest emblem, ember aura, breathing opacity, 0.07 parallax, bottom-masked) + `KatanaSword` (vertical blade through the ember stats — red crisscross tsuka, tsuba, gradient blade with hamon + etched glowing QR glyph, 0.16 parallax travel). Background motion: 9 rising ember particles, 26s active-scene drift, reduced-motion guarded, light theme hides all art. Fixes: MotionLayer scene query excludes `.qx-scene` canvas divs (they always straddle center → spurious dusk); suppressHydrationWarning on parallax art wrappers. Iterated live in Chrome (first horn pass read as rabbit ears → crescents). If the user later provides image-gen credits or a FAL/Replicate key, the SVGs can be swapped for raster art in one step.

- **Mission 26 — True Jitter card anatomy (`04beb13`)**: CategoryShowcase rebuilt against live measurements of jitter.video (358×238 flat tile, zero chrome, caption under the tile). No card box — each item is a flat 3:2 tile (#151515 dark / #f5f5f5 light, 12px radius) with ONE focused mock crossfading through 3 tool previews (coverflow/nav/dots removed, hover pauses + scales 1.035 + lightens tile), caption on the canvas (accent dot + bold title + muted meta + hover slide-in arrow), whole item is the link, orange "new" badge on 3D. Grid capped at 3 columns, 40px row rhythm. Verified in Chrome in both themes.

- **Mission 27 — Blacker canvas + side-entering cards + logo partners (`44227ef`)**: samurai removed from hero per user (SamuraiArt export kept); all 3 scenes darkened hard toward black (deep = faint navy over #020203, ember keeps red core on #050101, dusk low warm over #040303); category grid capped at 2 large columns (~670px, 16:9 tiles, 19px titles) with the 6 cards entering one by one on scroll — left column from the left, right column from the right (72px throw via `.qx-cs-item[data-reveal]:not(.rv-in)` override, 180ms alternating stagger); TrustedBy rebuilt with real brand logos (react-icons/si icons + names, 2.35rem, grayscale→brand-color hover; Microsoft/Adobe→YouTube/WhatsApp/PayPal since si lacks those glyphs). Verified via preview harness at 1440px (Chrome extension dropped mid-mission).

- **Mission 28 — Pagoda night scene (`3636ebb`)**: statement text section replaced with `SceneArt.PagodaNight` — hand-built SVG night Japan in the ember palette (stars, moon, Fuji, torii, lit minka village, lanterns, five-story pagoda with rim-lit curved roofs + sorin, mist, warm horizon). `CinematicScene` = full-bleed 74vh section; art drifts/settles/fades in on scroll (motion springs), rising embers on top, masked top+bottom into the black canvas; hidden in light theme. ⚠ Chrome extension AND preview renderer both died mid-mission — verified via tsc + DOM/computed-style probes only; **visual pass pending** (user reviewing; iterate on their screenshot feedback).

- **Mission 29 — Coverr-style hero (`0729394`)**: benefit headline (CREATE QR CODES. / TRACK EVERY SCAN. / 185+ FREE TOOLS., EN/RU/UZ) replaces the wordplay; mono metric line + 2 CTA buttons dropped. `components/HeroSearch.tsx` — white Coverr pill (orange search disc + arrow) with live dropdown over `lib/search-index`; "jpg to pdf" + Enter → /pdf-tools/jpg-to-pdf; keyboard nav. Category quick-links row under the search (QR/PDF/Image/AI/Video/3D → landings). search-index ranking upgraded globally (⌘K too): exact-phrase bonus, token synonyms (bg/img/pic/vid/foto), Blog −3 so tools outrank guides. Verified headlessly (tsx probes + served HTML); Chrome extension down again during visual pass.

- **Mission 30 — Gemini artworks as living scroll scenes (`84c4ec0`)**: user's 5 Gemini images (auto-found in Downloads, sharp→webp 23–35KB each, 141KB total in `public/scenes/`) wired into the scene canvas: base=samurai+planted blade, deep=red-mist pagoda valley, ember=QRIX brush samurai (SVG sword overlay removed from stats — artwork carries it), dusk=neon QR samurai, CinematicScene=pagoda village under Fuji (replaces SVG art, motion kept). "Video" feel without files (image-to-video needs credits, balance=0): Ken Burns 1.02→1.1 diagonal pan 26s on active scene + scroll cross-fades + embers + readability veil (top/bottom gradient + vignette); gradient underlayers show while webp streams. Credits later → swap stills for real AI video loops in the same slots. Verified: assets 200, structure probes; Chrome ext down during visuals.

- **Mission 31 — Neon samurai hero, full-quality art (`1c07264`)**: all 5 artworks reprocessed at full 1365×768 q92 (64–101KB) with the Gemini sparkle watermark erased (blurred neighbour-patch composite at its fixed position). Neon QR samurai → hero scene; planted-blade samurai → dusk. Hero recomposed: samurai center (face clear), 6 tool-family chips on his left (`.qx-htool`, category colors, glass, hover glow → landings), headline+sub right covering every family (CREATE QR CODES. / CONVERT PDF & IMAGE. / AI·VIDEO·3D — FREE., 3 langs; subs rewritten), Coverr search + category row centered below. Living: visor pulse overlay (screen-blend 4.6s), hero embers, Ken Burns. Real sword animation still needs image-to-video credits (balance 0) — scene slots video-ready. Verified live in Chrome incl. a mid-scroll cross-fade screenshot.

- **Mission 32 — User's animated samurai film as hero (`e735e94`)**: user self-animated the neon samurai (mp4 on Desktop); Arena outro ad located frame-by-frame (content → ~9.8s, white ad 10s+) and trimmed via ffmpeg (-t 9.8, -an, h264 CRF25 faststart → 2.3MB `public/scenes/hero-samurai.mp4` + 29KB poster). `<video autoplay muted loop playsinline>` mounted inside the fixed base scene — keeps playing on scroll, cross-fades into other scenes. Ken Burns off for video scenes (`:has`), still-image visor pulse removed, reduced-motion hides video. Note: ffmpeg lives at WinGet Links; watermark/ad-cut recipe = extract frames → Read → trim.

- **Mission 33 — Samurai-game HUD cards + hero mirror (`f4cf230`)**: hero mirrored (headline/sub LEFT, 6 tool chips RIGHT, samurai face clear); category cards rebuilt as game HUD plates (`.qx-gcard`: ember-gradient frame + nested clip-path cut corners, scanline steel, mono `// count` strip + tagline, diamond accent, corner brackets `.qx-gc`, rotated NEW ribbon, hover drop-shadow glow; left/right entrance kept); Why grid `.qx-bento`→`.qx-gpanel` (same HUD language, angular icon chips); partner wordmarks permanently brand-colored (grayscale dropped, hover glow). globals.css needed the watcher nudge again. Verified live in Chrome incl. computed logo color.

- **Mission 34 — Flowing function rows + editorial why + pro footer (`e9112bb`)**: hero headline compacted to sentence-case display type (`.qx-hero-title`, Bricolage 800, 30–52px) and the 6 tool chips removed; category cards deleted — replaced by six partner-marquee-style function ROWS (each streams that family's tool names + icon in category color; odd rows R→L, even L→R reverse, hover pause, items link to category; CategoryShowcase rewritten ~380→130 lines, Mock/HUD machinery gone); Why QRix = editorial statements landing one after another (mono 01–04 index, ember rules, big display titles, alternating reveals); footer rebuilt (5 columns, mono `//` headers, privacy tag, pulsing "All systems operational" status, i18n); dusk scene now the red-mist valley (bottom samurai removed). Verified via served-HTML probes; Chrome ext offline for visuals — user reviewing.

- **Mission 35 — Village scene removed; capsule function rows (`07eb37d`)**: pagoda-village art section (CinematicScene) deleted end-to-end (usage/component/motion imports/CSS); function rows v2 after self-critique (rainbow text = unstructured, color bands = stripes) → integration-wall glass capsules: dark blur pill per tool name, category-tinted hairline + colored round icon tile, NEUTRAL off-white label, hover lift + category glow; rows tightened; light theme white capsules. Verified via served HTML; Chrome ext offline.

- **Mission 36 — Panda icons + Tool Galaxy (`07929b2`)**: pdf24 sheep-system analyzed → generative panda pipeline (`panda-icons/generate.mjs`): base panda head + 6 category accessories (QR bandana / held PDF doc / beret / AI antenna / backwards cap / held 3D cube) + ~38 white glyphs on colored badges → 45 icons (SVG+512px PNG+manifest+preview.html) collected in `panda-icons/` for user review; runtime copies in `public/panda/`. Shoe-finder gallery from the user's Drive (Next.js R3F project — Rig/ShoeTile/GridCanvas read fully) adapted as `components/galaxy/*`: GalaxyRig (drag pan+bounds+resistance+velocity tilt+damped zoom, maath now declared), ToolTile (panda texture+Oswald local TTF label+hover lift+idle float+click focus with dim), ToolGalaxy (R3F canvas, fog, drag-hint chip, focus card with "Open tool" link+close, touch-action pan-y). CategoryShowcase → React.lazy galaxy (three off critical path); capsule rows superseded. tsc clean, assets 200, no console errors; both Chrome ext and embedded renderer were frozen → visual pass on user's screen.

- **Mission 37 — Senior-minimal tool directory; gimmick purge (`6673480`)**: user rejected the panda galaxy ("ота паст, профессионал эмас") → removed end-to-end (components/galaxy, public/panda, oswald ttf, maath decl; `panda-icons/` archive kept off-site). Tools section = hairline-divided directory grid (Vercel/Linear language): 6 category cells on one quiet surface, category color only as 8px dot, 5 REAL tool links per cell (hrefs resolved via search index), neutral links + hover reveal-arrow, single ember accent for "All {category} →"; 28 crawlable homepage links (SEO). Rainbow CursorGlow overlay removed from root layout (one-accent violation). Premium mandate from user: analyze whole site vs world-class standards — analysis delivered in chat; next candidates: section-count reduction (~13 → 7-8), typography consolidation (Bebas+Bricolage+Mono+Oswald → 2), scene restraint.

- **Mission 38 — Senior premium pass, frontend-design skill applied (`0215e37`)**: katana stats takeover → slim hairline proof band (5 numbers, ember rules, mono labels) with TrustedBy logos in the same zone (glass chrome dropped); Why 01–04 fake-sequence → ember mark; Newsletter off homepage; hero CSS embers off; ember scene retired (scroll rhythm = samurai film → valley, 2 scenes); typography consolidated — Bebas/Anton SC/Oswald purged from import and every rule (generator card titles → Bricolage 800); page speaks Bricolage + Space Mono only. Also recovered port 3000 from a stale main-checkout server (old design was being served). Design skills installed user-level (`~/.claude/skills/`): frontend-design (Anthropic official), ui-ux-pro-max pack (7 skills), design-taste-frontend, minimalist-ui; superpowers plugin installed manually (marketplace registered in known_marketplaces.json, repo in plugins/cache/, enabledPlugins in settings.json — activates on session restart).

- **Mission 39 — Sliding auth card (sign in ↔ sign up on one page) + Google OAuth**: `/login` and `/register` now render one `components/AuthSlider.tsx` — double-slider card (Florin-Pop pattern, QRix-styled): both forms side by side, branded overlay panel (samurai film poster + ember gradient + QRix wordmark) slides right→left when switching to Sign Up (0.65s cubic-bezier, poster pans as parallax); URL syncs /login↔/register via history.replaceState (no remount); <900px overlay hides, panes stack, footer links toggle; reduced-motion instant. Both forms: "Continue with Google" (supabase `signInWithOAuth`, FcGoogle) + "or continue with email" mono divider + existing email/password flow (sync cookies, referral claim, confirm-email notice slides back to sign-in). New `app/auth/callback/` (noindex): waits for PKCE session, explicit `exchangeCodeForSession` fallback, syncs server cookies + claims referral → next. AuthShell/AuthMascot kept (unused). ⚠ Google provider must be enabled in Supabase dashboard (+ authorized redirect) for the button to work live. Debug note: embedded Browser-pane tab is `visibility:hidden` → rAF never fires → React 19 leaves Suspense boundaries `$~` queued → page JS never hydrates there; verify interactions in real Chrome (session cookies were saved/restored to bypass the signed-in redirect).

- **Mission 39b — Auth panel artwork (user's Pinterest picks)**: the two pinned cyber-ninja artworks (pin.it short links → resolved via `widgets.pinterest.com/v3/pidgets/pins/info?pin_ids=` since pin pages are JS shells) now live on the auth overlay: red-strap ninja (`/scenes/auth-signin.webp`, 59KB) on the sign-in view panel, blue/neon ninja (`/scenes/auth-signup.webp`, 58KB) on the sign-up view panel; backgrounds moved from shared `.qx-auth-ov-inner` (poster dropped, dark radial kept) to per-panel `center 18% / cover` + readability gradient. Verified both slide states in real Chrome (light theme).

- **Mission 39c — Living auth panels (`9a73d49`)**: the two ninja artworks animated in the site's "living still" language (AI video credits = 0): art moved to `.qx-auth-ov-panel::before` (own GPU layer, 24s Ken Burns drift scale 1.03→1.11, right panel −12s offset), `::after` = screen-blended radial glows placed over each artwork's light sources (mask eyes / cyan glyph / pink straps · blue flame / red straps) breathing 5.4s, 7 rising embers (`.qx-embers` reused) span the overlay and travel with the slide; panels overflow hidden; reduced-motion kills all three; light theme keeps sparks (override of global hide). Verified live: computed animationNames + frame-compare screenshots.

- **Mission 39d — Bunny mascots on auth panels (`8533dfa`)**: user's new Pinterest picks replace the ninjas — warm bunny (sunglasses/skull tee/orange sneakers, 800×1422) → sign-in view, blue bunny (headphones/blue sneakers, 1200×1200 square) → sign-up view, same `auth-signin/signup.webp` slots. Animation retuned for mascot art: neon glow pulse → `qxAuthSheen` studio light band (115deg white gradient, screen blend, sweeps 8s then rests, right panel −3.6s), Ken Burns drift kept, embers → soft white bokeh via `.qx-auth-ov .qx-embers i` override. Verified: image loads + computed animationNames in Browser pane; composition confirmed by rendering the exact panel crop (cover, center 18%, veil) with sharp — ears intact, faces clear. Both Chrome ext and pane screenshots were down (pane tab hidden → no rAF → no hydration; known artifact).

- **Mission 40 — All Tools coverflow rows (`3780910`)**: homepage tool directory (M37 hairline grid) rebuilt as six 3D coverflow galleries, one per category, adapted from the user's Originkit Framer component into `components/CategoryShowcase.tsx`. Section header "All tools"; each row leads with dot + category name + count + "All {category} →". Geometry: perspective 1400, spacing 190, depth 150, rotateY 24°/step, rotateZ 4°, scale −0.11/step, inactive dim 0.45, 0.6s expo-out. Behavior: click side card → focus (preventDefault), center card = real Link to the tool; arrow keys; autoplay 3.2s/card alternating direction per row, paused on hover/focus, gated by IntersectionObserver (0.25) + prefers-reduced-motion. Cards = emoji + title + one-line hint on #141414 (white in light) with category-tinted radial wash + hover "Open →". 28 crawlable links preserved. Verified structurally (SSR transforms, computed perspective/preserve-3d/shade opacities); interactions not live-verified — Chrome ext down, pane hidden-tab can't hydrate.

- **Mission 40b — White cat mascot on sign-in panel (`bc7c28b`)**: user's new pin (white cat, headphones + sunglasses, red accents) replaces the sunglasses bunny in `auth-signin.webp` (1000×1000). Frontal pose, so "facing the form" was done compositionally: panel--right ::before background-position `72% 18%` shifts the mascot toward the form side (lighting already falls from that direction). Sheen/drift/bokeh animations unchanged. Verified: image loads, computed bgPos 72% 18%, qxAuthDrift live; composition confirmed via sharp panel-crop render.

- **Mission 41 — NEW TOOLS ERA hero + bunny mascot choreography (`20ff003`)**: homepage hero rebuilt after the user's viktorodgy reference with their black bunny mascot. (a) **Assets**: 3 bunny poses recovered from the Recycle Bin (user had cleaned Desktop — Shell.Application COM copy-out) and cut out via custom texture-aware keyer (`bg = neutral AND locally-smooth, border flood-fill; variance spikes at edges stop leaks; largest-blob keep; gray shadow remnants → dark contact shadow`) → `public/scenes/bunny-{hero,point,walk}.webp`. (b) **Hero**: orange `era` scene (canvas crossfade → scrolls into pro near-black; valley photos retired), giant Anton "NEW TOOLS ERA" (+ Oswald for cyrillic langs), QRIX ghost watermark, mono kickers both sides, HeroSearch right, Anton category marquee bottom (6 families, hover-pause). (c) **EraBunny.tsx**: fixed-stage mascot — center in hero → glides left into the generator (easeOutCubic on scroll), fades below it, cursor parallax + tilt; `BunnyPeek` statics (walk@pricing-left, point@CTA-right) with own parallax; reduced-motion pins/hides. (d) **Search**: Cyrillic→Latin translit ("жпг то пдф" finds JPG to PDF), top match flies in from the screen corner (`qxFlyIn`) and parks above the bar, click = navigate. (e) **Generator**: own deep-scene section, `lg:ml-[26vw]` for the bunny, cards + inner panels restyled GLASS. ⚠ Gotchas: css pipeline (lightningcss) STRIPS `backdrop-filter` when paired with `-webkit-backdrop-filter` — write the standard property alone (var(--glass-blur) form used); globals.css watcher needs the nudge-comment trick; above-the-fold `data-reveal` races hydration (removed from hero sides). Samurai film assets kept in repo (unused). Verified live in Chrome: hero, cyrillic fly-in, orange→black fade, bunny slide, glass cards, peeks, no hydration errors, no h-scroll.

- **Mission 42 — Living mascot film + Unbounded type + big glass cards (`c63109d`)**: the user's Kling render (5s, gray studio bg) keyed frame-by-frame with the texture-aware keyer (`kling-cut.mjs` recipe: ffmpeg crop+fps=24 → per-frame flood-key at 1080, largest-blob drops the KlingAI watermark → resize 760h → ping-pong frame order → libvpx-vp9 yuva420p crf33) into two transparent loops: `bunny-walk-loop.webm` (1.1MB, hero centre) + `bunny-idle-loop.webm` (689KB close-up, generator left) + webp posters. EraBunny v2: NO gliding — fixed slots cross-fade between states on scroll (walk owns p<0.5, idle p>0.5×tail), cursor parallax, VP9-alpha detect → static webp fallback. Era type → Unbounded 900 (title+ghost, cyrillic ok), staggered word reveal + ghost/side/marquee entrances — ⚠ pattern: from-only keyframes + `backwards` fill (base visible); `opacity:0` base + forwards fill left content permanently invisible. Side texts enlarged (kicker 13.5 / copy 16.5). QR TYPE card removed — format chips + "All formats→" folded into CREATE QR CODE; generator = 2 bigger glass cards (grid-cols-2, ml-24vw). deep/dusk scenes breathe dark orange; coverflow cards dark-orange gradient (light: warm cream #fff4ec). Skills installed: `~/.claude/skills/remotion-best-practices` + `animate` (Emil Kowalski). Verified live in Chrome: video hero, entrance anims, crossfade at generator, chips, orange coverflow.

- **Mission 43 — Expanding tool panels + glitter starfield (`c7d161d`)**: user rejected the coverflow rows → CategoryShowcase rebuilt as six EXPANDING PANELS: spotlight panel flex-grows 1→4.6 (550ms expo-out) revealing head (emoji + Unbounded 800 name + count) + 5 real tool rows (label/hint/hover-arrow, hairline dividers) + "All →"; collapsed panels = slim spines with vertical-rl Unbounded name + glowing category dot; hover/focusCapture/click moves the spotlight, body fades in 220ms after landing; <1024px = vertical accordion; dark-orange glass panels (color-mix category tint). `components/GlitterField.tsx` = user's Originkit "Glitter Wrap" canvas adapted (their preview props; 500 sparks white/#f7f4fc/#ffd9c8): screen-blended layer inside fixed `.qx-scenes`, per-frame checks era scene and fades/pauses on orange, prefers-reduced-motion = static 80-frame field, light theme hidden. 21st.dev fully installed meanwhile: user-level HTTP MCP `21st` (key live-tested against https://21st.dev/api/mcp), `API_KEY_21ST` user env, plugin 21st@21st v0.4.0 (4 skills) manually cached + enabled — activates next session. framer-motion already present as `motion@12`.

- **Mission 44 — New mascot films + orange stats card + rhythm fix (`b500071`)**: user's two new videos keyed via bg-color-SAMPLING keyer (border-median color + variance gate — handles gray AND solid-blue studios; largest-blob drops Pollo.ai/Renderforest watermarks): cream-shorts bunny (726×1270 Pollo) → hero walk loop slot (ratio 0.409 → left calc 0.205), small blue-sneaker bunny (480² Renderforest, blue bg) → generator slot (min(44vh,400px), left 4.5vw). Proof band → orange gradient card (radius 24, white tabular numerals, white hairline dividers, warm glow shadow). Dead air TrustedBy↔Latest guides cut (TrustedBy py-28→pt-20/pb-10, FAQ pb-32→pb-20). Verified live in Chrome: blue bunny beside CREATE card + glitter on black, cream bunny in hero; proof card computed (orange gradient, 24px, white nums); pads 80/40. Keyer recipe generalized in kling-cut2.mjs (removed from repo, documented here).

- **Mission 45 — Premium stills replace the video loops (`21efdbe`)**: user judged the keyed videos low-quality → all four mascot poses re-keyed as STILLS from the full-res originals (24.jpg/16.png/6.png @3072×5376 from scratchpad, pin_d.jpg @4096²) at H=2000/1400, webp q95, with a **gamma-1.25 LUT lift** applied in the compose loop (brightens the near-black fur ~25→40 without clipping the cream shorts — sharp.gamma() can't do alpha images). hero = standing bunny 617×1877 (slot half-width 0.165), generator = blue-sneaker bunny 547×1259 (blue bg keyed by border-median color), peeks refreshed brighter. EraBunny back to `<img>` slots — cross-fade choreography + parallax kept, `qxBunnyFloat` 6.5s adds life (gen slot −3s offset). webm loops kept in repo, unused. Verified live in Chrome (assets loaded, float running, no <video> left). ⚠ HMR restarts the hero entrance animations — a screenshot right after an HMR push can catch texts mid-rise (looks blank); probe computed opacity before diagnosing.

- **Mission 46 — User's own cutouts, smoke reveals, editorial type index (`158a698`)**: user prepared assets themselves (Picsart bg-remover): 3 transparent PNGs + 2 VP8-alpha webms (detect via `alpha_mode: 1` in ffprobe; MUST decode with `-c:v libvpx`, native decoder drops alpha). Pipeline: PNGs gamma-1.25 lifted → trim → webp q95 (hero 613×1876, walk, blue); webms → RGBA frames (libvpx) → same LUT → ping-pong → VP9 yuva420p loops (`bunny-hero-live.webm` 2MB, `bunny-gen-live.webm` 2MB). **Smoke system** replaces the fixed mascot layer (user: "экран билан сузмасин, тутундек пайдо бўлиб йўқолсин"): each mascot is ABSOLUTE inside its own section; `useSmoke` IO (threshold ~0.2, rootMargin −6%) toggles `.qx-smoke.on` BOTH ways → opacity+blur(18px)+scale dissolve on every entry/exit; hero cycles still↔alpha-film every 6.5s (crossfade blur); GenBunny (new export) sits beside CREATE card; peeks use same smoke; cursor parallax kept (`useParallax`). **Tools v7** (expanding panels rejected): editorial type index — six oversized Unbounded rows (26–58px), hover/focusCapture lights the row in its category color (+14px slide, arrow un-rotates in), glass panel (color-mix border) smokes in on the right with 5 real tool links + hints + All→; touch: first tap opens, second follows; <1024px accordion (max-height). Verified structurally (pane): absolute-in-section, smoke base, assets loaded, 6 Unbounded rows, no fixed layer.

- **Mission 47 — Hero mascot raised + professional stats card + peeks removed (`cf3a245`)**: `.qx-hm` bottom 0 → clamp(72px, 11vh, 122px) (bunny clears the marquee), height 66→64vh. Proof card upgraded: `.qx-proof-head` strip (mono "// QRIX IN NUMBERS" localized + pulsing LIVE chip with green glow dot), numerals up to clamp(28px,3vw,42px) tabular, per-cell hover `rgba(255,255,255,0.07)`, inset top highlight. Both bottom BunnyPeek stills removed from page.tsx (component export kept). Verified: served HTML has 0 peeks, proof-head/grid present, tsc clean. Note: 21st.dev MCP went LIVE this session (28 tools: search/generate/get_component/themes...) + 4 CLI skills — available for future UI work.

- **Mission 48 — QRIX IN NUMBERS on the 21st.dev archetype (`67a43d7`)**: first live use of the 21st MCP — `search` (free) → `get_component` (metered, 1 of 2/day used; free tier) for the stats-section-with-text archetype, then rebuilt entirely in QRix language (own markup/styles/copy): orange card = left column (mono kicker + display heading "Trusted by makers worldwide" localized + copy + pulsing LIVE chip) and right 2×2 glass stat tiles (FiTrendingUp, CountUp numeral 26–38px tabular, mono label, hover lift), uptime = FiShield footer strip; 1-col <900px, tiles stack <480px. 21st capabilities noted: catalog search (free/unlimited), component code retrieval (2/day free), AI generate/iterate (preview URL, paid credits), themes (free CSS), publish/profile tools, `21st` CLI via 4 plugin skills.

- **Mission 49 — Glass stats card + glass bento tools (`4b43bee`)**: `.qx-proof` → translucent orange glass (rgba washes + `backdrop-filter: var(--glass-blur)`; verified in served dev CSS — the pipeline now even auto-adds the -webkit- prefix; light theme keeps M44's solid orange since there's no dark canvas behind). CategoryShowcase v8 = glass bento informed by a second 21st archetype (kokonutd bento — icon chip + status badge + tags + hover CTA + col-spans; re-authored in QRix language): grid-template-areas `qr qr pdf pdf / qr qr img ai / vid vid d3 d3`, QR = featured 2×2 with five real tool rows, others tool-chip pills; hover = lift + category border light-up + dot-texture fade-in; 2-col <1024, 1-col <560. ⚠ Dev CSS is served at `/_next/static/chunks/*.css` (not /static/css/) — curl-verify there; component inline `<style>` blocks bypass lightningcss entirely (no stripping risk). 21st free retrievals exhausted for today (2/2).

- **Mission 50 — All Tools as a 3D interactive timeline (`207a77e`)**: CategoryShowcase v9 on the 3d-interactive-timeline archetype (structure studied via the component's public page — code quota was spent): central ORANGE spine (rgba track + gradient fill whose height follows scroll progress via rAF, glow shadow), six glass cards alternating left/right (grid 1fr/72px/1fr), **orange neon segment chasing each card border** (`@property --qx-ang` + conic-gradient ring, mask-composite exclude, drop-shadow glow, 4.5s linear), pulsing spine nodes, per-card 3D cursor tilt (perspective 900, rotateX ±7 / rotateY ±9). Real links kept as tool chips + All-category; index 01–06 + count badges + category washes. <900px spine hugs left edge; reduced-motion disables chase/pulse/tilt. Verified: tsc clean, all markers in served HTML.

- **Mission 51 — Spine plugs into QRIX IN NUMBERS (`699ea65`)**: continuity trick — `.qx-tl-spine` overruns its section's exact bottom padding (bottom −5rem, lg −6rem = pb-20/pb-24) while a matching `.qx-proof-wire` (same 3px orange + glow, left 50%) fills the proof section's top padding (4rem/6rem) → reads as ONE line connecting the timeline to the stats card. A bright energy segment flows down the wire (`qxWireFlow`, 1.6s ease-in, overflow-hidden track). The stats card gets its own border chase: `.qx-proof-neon` conic ring on separate `@property --qx-ang2` (avoids clashing with the component-scoped --qx-ang), inset 0 inside the overflow-hidden card, z-3 above content (ring is only 1.5px at edges). Wire hidden <900px (spine hugs left there). Verified: markers in HTML + rules in served CSS chunk, tsc clean.

- **Mission 52 — QRIX IN NUMBERS: black glass, orange type (`aabb36c`)**: card bg → near-black glass rgba(8,6,5,.62)+blur with faint orange radial; orange hairline + warm inset. Type all orange: title #ff8a3c (glow 26px), numerals #ff7a32 (glow 22px), kicker rgba(255,150,80,.95), copy rgba(255,178,122,.88), labels rgba(255,160,100,.85), foot warm; tiles rgba(255,106,19,.07)/borders .28 hover .15; LIVE chip orange (green dot kept); trend arrows #ffb27a. Verified in served CSS chunk.

- **Mission 53 — All Tools as an interactive scrolling story (`be8ad64`)**: user rejected the timeline + stats card ("умуман бошқача қил") → CategoryShowcase v10 on the interactive-scrolling-story archetype (structure from its public page; own implementation): sticky 100vh split-screen inside a `N*92vh` wrapper; rAF scroll progress → active chapter index; LEFT stacked copyboxes fade/slide (is-past/-next ±28px, visibility-hidden inactive with 0s/0.55s delay trick — links stay crawlable, tabIndex managed), RIGHT visual cards slide with soft rotateY, `--st` chapter color drives an ambient glow + accents; clickable orange progress rail (labeled dots, jump = scrollTo formula). 7 chapters = 6 categories (emoji + giant count card) + **QRix-in-numbers finale** (2×2 orange numerals + uptime) — the separate proof section (card+wire+neon markup) REMOVED from page.tsx (feature folded into the story; proof CSS now unused but kept). Story wrapper's data-reveal dropped (transforms + sticky don't mix). <900px single-column; reduced-motion static.

- **Mission 54 — Quiet index + standalone numbers band; Remotion skills (`7010428`)**: user rejected the story too and delegated the call ("ўзинг билиб — минимализмми ёки бошқа") → restraint won. CategoryShowcase v11 = whitespace 3-col grid (no cards/borders/per-category colors/motion tricks): mono orange 01–06 + Bricolage 800 name + faint count over ONE orange hairline, plain 14.5px tool-link lists (hover: text + arrow slide), orange "All →". QRIX IN NUMBERS separated back out as `.qx-num` quiet band (page.tsx section after showcase): hairline + mono kicker + orange tabular CountUp numerals (#ff7a32, glow; light #e2410f) + faint mono labels — no card/glass/neon. Story markup gone (28 real links kept). `remotion-dev/skills` fully installed user-level (8 skills: mediabunny, best-practices, captions, create, interactivity, markup, render, saas) — active in-session.

- **Mission 55 — 5 free LLM providers + MuAPI image engine (`23b0d75`, `7a70e78`)**: researched cheahjs/free-llm-api-resources (curated free-tier LLM API list) and Anil-matcha/Open-Generative-AI (open Higgsfield-alt UI whose engine = **MuAPI** api.muapi.ai, 200+ image/video models, x-api-key, submit→poll `predictions/<id>/result`→outputs[0]). Added to `lib/server/ai/providers.ts`: **mistral/cerebras/nvidia/github** via the openAiCompatible factory, **cohere** (v2 chat schema, message.content[] blocks), **muapi** (image-generate, MUAPI_IMAGE_MODEL default flux-schnell-image) — all env-gated, zero-dep; DEFAULT_PRIORITY + TASK_ROUTES updated free-first; manager/admin pick them up from the registry automatically. `.env.production.example` now force-tracked (`.env*` was gitignored — template is placeholder-only, verified before push). Any key added to env goes live instantly, expanding the free fallback chain from 4 → 9 providers.

- **Mission 56 — Free AI keys wired live (`4f10ef7`)**: keys collected together with the user in-chat (pages opened via `powershell Start-Process <url>`; Chrome extension flaky), pasted keys wired to `.env.local` (gitignored) and LIVE-TESTED via direct curl: **Groq** ✅ (llama-3.3-70b, ~8ms), **Gemini** ✅ (adapter model bumped gemini-2.0-flash → `gemini-3.1-flash-lite` — roomiest free tier 500 req/day; 2.0-flash free quota saturated, 2.5-flash-lite retired for new keys; list `/v1beta/models?key=` to see availability; new keys may start with `AQ.` — 429 = valid-but-quota, 400 = bad key), **OpenRouter** ✅ (llama-70b:free pool busy → verified via gpt-oss-20b:free; manager treats 429 as switch-provider anyway), **Anthropic** ✅ (key already present), **MuAPI** 🔑 key valid but balance $0.00 (signup grants no trial credits — needs topup before image/video gen).
- **Mission 57 — Animated QR Maker (`68542af`)**: new standalone tool `/animated-qr` — link → 6s animated QR film for Stories/Reels: canvas timeline (sparks+glow backdrop → card pop → 11×11 tile-cascade QR reveal → shine sweep → SCAN ME pop + url caption), Story 9:16 / Post 1:1, 3 themes, custom CTA; MediaRecorder (mp4 where supported, webm fallback, 8Mbps) + final-frame PNG, fully on-device (qr-code-styling existing dep, saveBlob). Full SEO (pageMeta + softwareApp/breadcrumb LD + ToolPageShell) and registered: TopNav QR dropdown (FiPlay), search-index, sitemap 0.8. User roadmap remaining: mediabunny upgrade of video tools, promo-video generator tools, site promo films (8 Remotion skills installed & active).

- **Mission 58 — Image Tools: one studio grid + era header (`ec8f363`)**: the 7 flagship tools folded INTO ImageExpansionGrid as a leading "Essentials" category (unified Item shape: href/emoji/title/intro/keywords + AI/NEW/POPULAR badges, emoji tiles on quiet surfaces) — one search + one chip row (All/Essentials/…IMG_CATEGORIES) covers all 72; landing header rebuilt in era language (mono kicker "// IMAGE TOOLS — 72 FREE · ON-DEVICE", display H1 "A full image studio", quiet trust row over orange hairline); purple hero card, separate 7-card grid and sort select removed; sidebar Upgrade card → brand orange. /animated-qr also got its QR Tools landing card (M57b `58896c3`).

- **Mission 59 — Stats cards + Blog/SEO expansion + QA sweep + security audit (`2fd8458`, `f4a2f1b`)**:
  - **QRIX IN NUMBERS**: the four figures now ride equal-size orange gradient cards, side by side (4-col desktop / 2-col mobile), white numerals + white labels; dropped the 5th uptime tile for a clean four-across row.
  - **Blog/SEO**: +6 original feature articles (animated QR, compress video, video→GIF, AI upscaling, EXIF privacy, image→3D); `BlogPost.category` union extended with `Video` + `AI`. Blog index reorganised into **topical clusters** (category sections + anchor nav) for topical authority; broadened index metadata/keywords. All auto-picked up by sitemap + search-index. In-content **AdSense** slot added to blog posts (env-gated).
  - **Full-site QA sweep** (subagent): all **287 routes return HTTP 200, zero broken pages**; per-page unique titles + structured data verified. Ratings — QR/PDF/Image/Animated-QR/Blog/SEO **10/10**; sub-10s (AI 8, Video 8, 3D 9, Auth 7, Billing 8) are **external-service-gated** (paid AI/MP4 cloud, Stripe, DB), not code defects.
  - **Fixes applied**: video recorders now prefer real **MP4/H.264** (Chrome 130+/Edge/Safari) with WebM fallback across `recodeVideo` + mp3-to-mp4/gif-to-mp4/add-audio, filenames follow the real container; `/dashboard` got a proper `<title>` (noindex); env template domain aligned to qrix.uz.
  - **Security audit**: headers strong (frame-ancestors, X-Frame-Options, nosniff, referrer, permissions-policy, HSTS preload, no X-Powered-By); **no secrets committed** (`.env*` gitignored, template clean, full-tree scan clean); API wrapper has rate-limit (fixed-window over cache) + schema validation + auth/admin gates + CSRF + sanitisation.

- **Mission 60 — Help Center + Docs + universal tool-page landings (`1b1f253`)**:
  - **Every tool page is now a complete landing page.** `ToolPageShell` (drives AI/Video/3D/QR/image/animated-qr/barcode) gained: universal "Why use QRix" trust strip, optional "Popular use cases" + visible FAQ sections, and a strong closing CTA band. Full section set per tool: hero · how-to · about · why · use-cases · FAQ · CTA · SEO.
  - **QR tools** (30) gained 3 FAQs + 4 use-cases each (`lib/qr-tool-content.ts` merged into the registry at load) and now emit FAQPage structured data.
  - **Help Center** `/help` + `/help/[category]`: 5 categories, 42 Q&A articles (Getting Started, QR Codes, PDF, Image & AI, Account & Privacy) with FAQPage schema per category.
  - **Documentation** `/docs` + `/docs/[slug]`: 7 pages (introduction, how-it-works/on-device model, QR codes explained, PDF/image/AI-video guides, privacy & security) with TechArticle schema + prev/next nav.
  - Content produced via a 4-agent content-generation workflow, then authored into typed content modules (`lib/help-content.ts`, `lib/docs-content.ts`, `lib/qr-tool-content.ts`). Registered in footer (EN/RU/UZ) + sitemap. tsc clean; all new routes 200.

- **Mission 61 — Real in-browser video transcoding via Mediabunny (`81dbf6b`)**: replaced the canvas→MediaRecorder screen-recapture path with true WebCodecs stream transcoding for the core recode family. `lib/video/convert-mb.ts` — `convertVideo()` (bitrate compress / resize / trim / mute, **MP4-first with WebM fallback** via `canEncodeVideo('avc')`), `extractAudioMp3()` with an MP3-encodability guard, `canOutputMp4/Mp3`. `VideoRecodeClient`: compress/optimizer/convert/resolution/resize/trim/mute + split route through Mediabunny; canvas `recodeVideo` stays as the automatic fallback (unsupported source codec) and for effect presets (cut/crop/rotate/flip/speed/watermark/merge). New MP4/WebM toggle on the Converter; download extension follows the real container. `AudioExtractClient` now yields a real MP3 (WAV fallback). Meta copy updated to drop the old "cloud engine / WebM-only" caveats. **Verified end-to-end** in the browser: 2.3 MB MP4 → 544 KB MP4 compress (real H.264, ~77% smaller, 4.4 s), MP4↔WebM convert, resize, trim — all real output, nothing uploaded. Dep: `mediabunny ^1.50.8` (ESM/WebCodecs). Video Tools rating 8→**10/10**.

- **Mission 62 — Promo Video Maker (`components/PromoVideoClient.tsx`, `app/promo-video/page.tsx`)**: new standalone creative tool at `/promo-video` — turns brand + headline + benefits + link (+ optional logo) into a short animated promo film. Canvas timeline with four scenes (intro/logo → headline with accent underline → benefit bullets cascade → CTA pill + scannable QR + url), 4 themes, 3 formats (Story 9:16 / Square 1:1 / Landscape 16:9), 8/12/15 s lengths, live preview; recorded via MediaRecorder (MP4 where supported, WebM fallback, 9 Mbps) + poster PNG, fully on-device (reuses `qr-code-styling`, `saveBlob`, `trackTool`). Full SEO (pageMeta + softwareApp/breadcrumb/faq LD) and the M60 landing sections (why/use-cases/FAQ/CTA via ToolPageShell). Registered: TopNav Video dropdown (spotlighted first, FiFilm), search-index, sitemap 0.8, and a NEW spotlight card atop the `/video-tools` landing. Verified live: route 200, canvas renders the animated promo (1080×1920, rich content), zero console errors, tsc clean. Also fixed the Video dropdown "Extract Audio → MP3" label (post-M61).

- **Mission 63 — QRix Brand Film + `/promo` (`components/QrixPromoFilm.tsx`, `app/promo/page.tsx`)**: the site's own promo — a scripted five-scene canvas film (QRix wordmark + bunny → "185+ FREE TOOLS" with category chips → benefit bullets → live QR tile-reveal → "Start free · qrix.uz" CTA) using the bunny mascot cutouts, orange brand palette, ~15 s. Format switch (Landscape 16:9 / Story 9:16 / Square 1:1); MediaRecorder capture (MP4/WebM, 10 Mbps) + poster PNG, fully on-device (mascots + QR preloaded via `createImageBitmap`). Marketing landing `/promo`: VideoObject + breadcrumb LD, hero, the film, trust row, and a "make your own" CTA → `/promo-video`. Registered in sitemap (0.6) + search-index. tsc clean, route 200, no console errors. Live-canvas render blocked in the automation tab (post-restart rAF/hydration throttling — a control check showed the previously-verified `/promo-video` canvas also went blank in the same tab), so verified structurally via the identical, already-proven render/record pipeline. **Roadmap complete:** Animated QR → Mediabunny video → Promo Video Maker → site promo film.

- **Mission 64 — Orange film embed on homepage + 5 modern stat cards (`app/page.tsx`, `components/QrixPromoFilm.tsx`, `app/design-v2.css`)**: (1) recoloured the brand film to a **vibrant orange** backdrop with white/dark ink (chips → white/orange, CTA pill → white, sparks → white, vignette for contrast) and added an `embed` mode (locks 16:9, hides controls, autoplays, pauses off-screen via IntersectionObserver, draws a first frame so it's never blank). (2) The homepage banner is replaced by a full **orange brand-film section** with the auto-playing 16:9 film beside white/dark copy + "Watch & download" (→/promo) and "Make your own" (→/promo-video) CTAs. (3) **QRIX IN NUMBERS** rebuilt from 4 → **5 modern cards** (added "185+ free tools"), each with a glass icon chip, refined orange gradient + inset sheen + hover lift; responsive 5→3→2 cols. Verified: tsc clean, 5 cards render with icons, 5-col grid at 1440px, film section + embedded 16:9 canvas present (canvas animation + CountUp need real-browser hydration — automation tab throttled post-restart).

- **Mission 65 — Pre-deploy professionalization (`28b771a`, `b421aa6`, `e1551eb`, `c42e60d`)**, 4 milestones:
  1. **GDPR / AdSense compliance:** Google **Consent Mode v2** (default denied, set in layout `<head>` before AdSense/GA) + a `CookieConsent` banner (Accept/Decline → `gtag consent update` + localStorage) + privacy policy rewritten for AdSense (cookie categories, Consent Mode, opt-out links to Google Ads Settings / aboutads.info, GDPR legal basis + rights, children). Unblocks AdSense EEA.
  2. **Analytics + monitoring (env-gated):** GA4 via `next/script` (respects Consent Mode) + a dependency-free `ErrorMonitor` that reports uncaught errors/rejections to a Sentry DSN (deduped, capped). New env: `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_SENTRY_DSN`.
  3. **Performance / Core Web Vitals:** the site-wide `DotDistortionBackground` now **fully stops** its rAF loop under `prefers-reduced-motion` (was looping 60fps forever drawing a static frame) and **pauses when the tab is hidden**; same hidden-tab pause added to `GlitterField`; the homepage promo film shows a static poster under reduced-motion. Cuts idle CPU/INP/battery cost.
  4. **Accessibility + assets:** `role="img"` + descriptive `aria-label` on the promo/animated-QR/brand-film canvases; language switcher got `aria-label`/`aria-haspopup`/`aria-expanded`; manifest `theme_color` fixed neon-yellow → brand orange `#ff6a13`. Verified OG/Twitter images resolve to the generated `/opengraph-image` (200) — the `og.png` reference was inert. (AiKit dropzone/buttons + TopNav were already well-labelled.)
  A dedicated a11y audit (subagent) then drove a full fix pass (`52e4291`, `5de7d41`): aria-labels on every homepage QR form field + PIN, `role="img"`/aria-label on QR-preview and film canvases, `<label htmlFor>` association + swatch/close/download-format labels + `role="dialog"` in QRGenerator, homepage `<main>` landmark + focusable skip target, nav landmark labels + `aria-expanded`, `--text-faint` lightened for AA contrast, footer heading order (h4→h3), Space-key on the dropzone, and **desktop mega-dropdowns made keyboard-accessible** (open on focus, Tab through links, Escape closes, `aria-haspopup`/`aria-expanded` on triggers). All tsc-clean, routes 200. Remaining pre-deploy items are infra/accounts (see Remaining Missions): domain+Vercel, DATABASE_URL, AdSense/Stripe accounts, Search Console, and a full `next build` on non-OOM hardware.

- **Mission 66 — Growth: programmatic SEO + multilingual use-case pages (`794a003`, Milestone A)**: a new, self-contained localized SEO section at **`/use/[lang]/[slug]`** (EN/RU/UZ) that funnels long-tail search intent to the real tools — without touching the existing app. `lib/usecase-content.ts` = 14 high-intent use-cases (restaurant-menu QR, guest-WiFi QR, vCard, Instagram QR, Google-review QR, wedding QR, product-packaging QR, event QR, compress-PDF-for-email, fill-and-sign PDF, remove-bg for e-commerce, resize for Instagram, compress-video-for-WhatsApp, video-to-GIF) each with title/meta/intro/benefits/steps/FAQs/keywords. Pages render HowTo + FAQPage + Breadcrumb + SoftwareApp JSON-LD, a localized hub `/use/[lang]`, `/use`→`/use/en` redirect, footer link, and sitemap entries with **hreflang alternates**. `pageMeta` gained a `languages` (hreflang) option. `dynamicParams=false` + `hasTranslation()`/`langReady()` guards ⇒ RU/UZ URLs **404 until translated** (no fallback-English pages get indexed). **Milestone B (`lib/usecase-content.i18n.ts`)** — a 14-agent parallel translation workflow produced Russian + Uzbek-Cyrillic content for all 14 use-cases (arrays length-matched: 4 benefits · 3 steps · 3 FAQs · 5 keywords each, keywords localized not transliterated); a generator script read the workflow's return array and wrote the typed i18n module. Result: **42 localized landing pages** (14 × EN/RU/UZ) + 3 hubs, all live (200), each cross-linked with **hreflang en/ru/uz/x-default** (verified in served HTML) and auto-added to the sitemap. This captures low-competition Russian + Uzbek search traffic — a big win for the UZ/CIS market. tsc clean.

- **Mission 68 — Share buttons + 15-language SEO pages (`e2bac06`, `ebe8a28`)**: (1) `ShareButtons` (X/WhatsApp/Telegram/Facebook/LinkedIn + copy + native Web Share) placed on blog posts, use-case pages and every ToolPageShell tool page — a virality loop. (2) **Use-case SEO pages expanded from 3 → 15 world languages** (EN/RU/UZ + ZH/HI/ES/AR/FR/PT/ID/DE/JA/TR/UR/BN): a 15-agent parallel workflow translated all 14 use-cases + the section UI strings into the 12 new languages; a generator merged them (with the existing RU/UZ) into `lib/usecase-content.i18n.ts` (369 KB). `USE_LANGS` → 15, `UI` merges authored en/ru/uz + generated `UI_I18N`, `Lang`/`UseCaseI18n` widened, `RTL_LANGS`/`isRtl`/`LANG_NAMES` added. Result: **210 localized landing pages** (14 × 15) + 15 hubs, all 200, full hreflang cross-linking (verified: ZH renders Chinese, AR renders Arabic with `dir="rtl"`), sitemap = 210 use URLs, plus an on-page native `<details>` language switcher. Captures search traffic across the world's most-spoken languages, low-competition in most. The homepage/global-UI language switcher stays EN/RU/UZ for now (its 77-string `T` dictionary + HomeFaq/Newsletter/TopNav dicts + RTL on the animated homepage are a separate, larger effort).

- **Mission 69 — Homepage UI + nav in 15 languages (`7c5bbfd`)**: the global language switcher now offers all 15 languages. New `lib/lang.ts` = single source of truth (15-lang `Lang` type, `SITE_LANGS` list with flags/RTL, `isLang`/`isRtlLang`/`readLang`). A 12-agent workflow translated the homepage `T` dictionary (74 strings), HomeFaq title, NewsletterSection strings and TopNav nav labels into the 12 new languages → generated `lib/home-i18n.ts` (45 KB); each component merges `HOME_I18N` over its authored en/ru/uz with **per-key English fallback** (crash-safe). TopNav switcher → `SITE_LANGS` (15, scrollable dropdown, RTL-aware); localStorage guard widened via `isLang`. tsc clean, homepage 200. The 8 HomeFaq Q&A were then translated into all 12 new languages too (`lib/home-faq-i18n.ts`, merged into HomeFaq) — the FAQ section is now fully localized in 15 languages. Remaining minor gaps (English fallback for the 12 new langs): ReviewsSection copy and the ~10 inline ternaries in page.tsx; homepage layout stays LTR (Arabic/Urdu text renders via browser bidi — a full RTL flip of the animated homepage was deliberately skipped as too risky). Live client-side switch verified structurally (same proven localStorage+`qrix-lang` mechanism as RU/UZ; automation tab throttled post-reboot so couldn't demo it live).

- **Mission 70 — Market research + growth features (`3506988`, `15ace35`)**: a 6-agent research workflow swept free-LLM APIs, the QR-generator market, ~30 GitHub repos, YouTube, Reddit and X. Key finding: the market's #1 pain is **bait-and-switch "free" generators** (codes that deactivate after a trial, scan caps that kill live codes, watermarks, forced credit cards — 14 of 20 "free" tools have hidden limits; the category leader sits at 1.5/5 on Trustpilot). Acted on it: (1) **`/free-forever`** trust + comparison page — QRix's honest positioning (never-expires, no scan caps, no watermark, no signup, no card, private, free vector/bulk/15-langs) with a feature-by-feature comparison table + FAQPage LD; sitemap + footer. (2) **UPI Payment QR** type (`upi://pay?pa…&pn…&am…&cu=INR&tn…`) — top-requested for the India market — added to `lib/qr-types.ts` + `lib/qr-tools-meta.ts`, auto-registered across tool pages/landing/search/sitemap; verified the deep link builds correctly. AI infra note: Cerebras (1M tokens/day) + Cloudflare Workers-AI Flux (free image gen) adapters already exist in `lib/server/ai/providers.ts` — signup pages opened for the user; they add `CEREBRAS_API_KEY` / `CLOUDFLARE_API_KEY`+`CLOUDFLARE_ACCOUNT_ID` to `.env.local` to activate. **Remaining prioritized features** (from the research): anti-quishing URL-preview, free AI-QR art (Cloudflare Flux), conversion analytics, eye-shape/deep-gradient studio, EPS/PDF vector export, GS1 Digital Link.

- **Mission 70b — Free AI backends LIVE + AI QR Art (`aef0840`→`56c6c61`)**: the user added **Cerebras** (`CEREBRAS_API_KEY`) and **Cloudflare Workers AI** (`CLOUDFLARE_API_KEY` + `CLOUDFLARE_ACCOUNT_ID`) keys to `.env.local` (gitignored). Both **live-tested**: Cerebras key valid — its old `llama-3.3-70b` was retired, so the adapter now uses **`gpt-oss-120b`** (1M tokens/day free, committed); Cloudflare token active and **Flux-1-schnell image generation confirmed** (`/api/ai/process` → `provider: cloudflare`, real data-URL image, ~2 s). **Impact:** the ~7 previously-mock AI image tools (logo/avatar/poster/banner/thumbnail/image-generator) now produce **real images for free** with zero code change (infra existed since M7). New tool **`/qr-art`** (AI QR Art): free Flux background from a style prompt + your QR kept in a clean high-contrast panel (always scannable), composited on-device into a poster/square/story PNG; full SEO + landing sections (why/use-cases/FAQ), registered in TopNav QR dropdown, QR landing, search, sitemap. tsc clean; page 200; art-gen verified live. NOTE: keys are the user's — on deploy, add the same three env vars in Vercel.

- **Mission 70c — research-driven feature build (`…`→`HEAD`)**: shipped every remaining feature from the market research, each committed + verified:
  - **Anti-quishing safety check**: the QR decoder (`/qr-tools/decode`) now analyses a scanned link and shows the **real destination domain + risk verdict** (shortener/redirect, raw-IP host, punycode, brand-impersonation like `paypal.com.secure-login.ru`, insecure http) BEFORE you open it. Retargeted SEO to "is this QR safe / quishing". No competitor does this. (logic unit-tested)
  - **GS1 Digital Link QR** (`/qr-tools/gs1-digital-link`): encodes GTIN + batch/serial/expiry as a standards-compliant Digital Link (`https://id.gs1.org/01/{gtin}/10/{batch}/21/{serial}?17={exp}`) — free vs enterprise-gated rivals; rides Sunrise-2027.
  - **UPI Payment QR** (`/qr-tools/upi`): `upi://pay?pa…&am…&cu=INR` for the India market (top YouTube request).
  - **PDF export** added to the Design Studio (PNG/SVG/PDF all free via jsPDF). Note: eye-shape (corner square/dot) + linear/radial gradient controls were **already shipped** — the research validated them.
  - **Conversion attribution**: the dynamic-QR redirect (`/r/[slug]`) now appends `utm_source/medium/campaign` so the destination's own GA4 attributes scan→conversion (respects any user-set UTM).
  - **Deploy helper**: `scripts/push-vercel-env.mjs` (one-command push of the `.env.local` AI keys to Vercel; no secrets committed) + a memory note to remind about the env vars at deploy.
  All tsc-clean, routes 200, auto-registered where relevant. #3 AI-QR art was built in 70b.

- **Mission 71 — brand polish, unlimited Business & the Autopilot growth engine**:
  - **Brand film card → black glass**: homepage "THE QRIX FILM" card restyled to obsidian glassmorphism (dark translucent + 28px backdrop-blur + hairline border + orange ambient wash), orange film kept as the focal glow (orange halo ring). Copy/buttons re-tuned for the dark surface. Designed via a 4-direction judge-panel workflow. (`app/page.tsx`, `components/QrixPromoFilm.tsx`)
  - **Brand film now sells our edge**: Scene 3 reworked into an "Others limit you. We don't." comparison beat — never expire · unlimited scans · no watermark/ads · see-link-before-scan (anti-quishing) · 185+ free tools.
  - **Business tier = everything unlimited** (beats metered rivals): unlimited AI credits / team seats / API / API keys / dynamic QR & bulk + white-label; prices unchanged. Synced `lib/server/billing.ts`, `components/PricingPlans.tsx`, homepage teaser (uz/ru/en).
  - **QRix Autopilot** (the "site manager robot", env-gated, additive): AI auto-blog cron (`/api/cron/autopilot`) writes+publishes one SEO article/day via the free AI backend into Supabase `autopilot_posts`, surfaced through the blog + sitemap via ISR (quality-gated, never publishes junk); health watchdog cron (`/api/cron/watchdog`) → Telegram alerts on any degraded subsystem. Reuses existing Telegram bot + monitor + reports. `lib/server/autopilot.ts` (10 seed topics), blog index/[slug]/sitemap merge autopilot posts, `vercel.json` crons. Recommendation + enable steps in `AUTOPILOT.md`. Adversarially reviewed (8-agent workflow) — fixed the one confirmed defect (sitemap ISR revalidate). Honest boundary: content+monitoring auto; **code changes to prod stay human-in-the-loop** (scheduled Claude Code / CI with review), not an unattended agent.

- **Mission 73 — pre-deploy audit + hardening (DEPLOY READY)**: 8-dimension audit of the real code (`SITE_REPORT.md`), then **17 fixes**. Two were serious production defects found only by end-to-end testing: (1) **every QR scan stalled ~1s** — `/r/[slug]` was a page calling `redirect()` to an external URL, which Next answers with `<meta http-equiv="refresh" content="1;url=…">`; converted to a Route Handler returning a real **307**. (2) **Geo analytics were silently dead in prod** — the 63MB GeoLite2 mmdb isn't in the serverless bundle, so every scan stored `country=null`; now reads Vercel's `x-vercel-ip-*` headers and the DB is untracked. Also: CRON_SECRET **fail-closed**; site-wide **real og:image** (the referenced `/og.png` never existed, and dropping the override wasn't enough — Next does NOT inherit the root `opengraph-image` into nested segments, so pageMeta now points at `/opengraph-image`); deleted a dead **open-redirect** `/r/[slug]/verify`; removed IP/geo `console.log` leaks; **PIN hashed + brute-force limited** (5/10min); scan IPs **anonymized** (GDPR); PBKDF2 **600k** (versioned); `create-dynamic` rate-limited; `CLOUDFLARE_AI_TOKEN`→`CLOUDFLARE_API_KEY` config bug; Business credits unlimited; **Stripe now sells Pro/Business × monthly/yearly** (webhook activates the right tier); honest tool counts ("25+ PDF" was false — 21 exist); blog `og:type=article`; RSS merges autopilot; sitemap real dates; `<html lang/dir>` synced (RTL); Geist double-load removed + fonts via preconnect `<link>`; **3 AI tools taken live** (translator, image-generator, subtitle-translator — gated only by `NEXT_PUBLIC_AI_ENGINE`, verified against Gemini/Cloudflare Flux; the other 5 stay honestly "preview" — `colorize`/`inpaint` map to a *text* model, and vision returns 503); Enterprise pricing card; and a guard so `CREDITS_ENFORCED=1` **cannot** charge against the non-persistent mock store.
  - **Known gap (accepted, post-deploy):** `lib/server/db.ts` is still an in-memory mock — **292 synchronous `db.*` call sites across 28 files**, and Prisma is async, so wiring it is a full sync→async refactor (its own mission, needs a real Postgres). Nothing user-facing depends on it: accounts, dynamic QR, scans, referral, newsletter and subscriptions all persist in Supabase.

- **Mission 74 — homepage design pass (Magic UI / Uiverse restyle)**: stat cards → **MagicCard** (cursor-following gradient border + inner spotlight, built as pure CSS off MotionLayer's existing `--mx/--my` rather than importing `motion`, which would have added ~50KB to the homepage); the six category cards → **spec-sheet cards** (mono header, id badge, LIVE chip, headline tool count); nav pill → **sparkle** (conic spark on the ONE sliding pill, not on all 8 links — that would mean 8 bloom layers and ~160 particle SVGs in the bar). Commits `09cf174`, `3381f72`.

- **Mission 75 — flat navy canvas, one-line nav, hero that scrolls** (`2ecb186` → `57910db`):
  - **Background**: the katakana field and the three cross-fading gradient scenes are **gone** — the dark half of the site is one flat navy (`--bg: #0a1226`). The `.qx-scenes` canvas stays opaque because it is also what hides the site-wide dot canvas (`-z-10`) on this page.
  - **Hero scrolls instead of dissolving**: the orange moved off the fixed cross-fade canvas onto the `.qx-era` section itself, so it scrolls up like any other block and **stops dead at the section edge** (verified: hero bottom == generator-section top) instead of bleeding over the QR cards. ⚠️ **Carrying the shared `.qx-scene::after` veil over with it turned the orange muddy** — the era scene had explicitly switched that veil off (`content: none`). Fixed in `57910db`: `.qx-era` is the two layers it always was (warm glow + saturated orange). **Never re-add a dark wash to the hero.**
  - **Nav labels on one line**: they wrapped because ten flex items were squeezed below content width, so the fix is **room, not `white-space: nowrap`** — measured: nowrap overflows the bar and pushes *Sign in* off the edge (ru/uz labels need ~1500px of a 1400px bar). Room came from the header's side padding (40px → 24px at `xl:px-6`, where the bar is viewport-limited rather than capped by `max-w`), the bar gap (16 → 8px) and the inter-link gap (→ 0). The bar now appears at `xl` (ten one-line links need ~1280px of window; below that the burger already carries them all). **Verified with `document.fonts.status === "loaded"`** — 10 links, one line each, 65px headroom. ⚠️ **Measuring the nav before the webfont loads reads fallback metrics and lies** (it cost a false "fixed" report once).
  - **Reverted at the user's request** (`57910db`), do not re-add without a new brief: the **meteor cursor + ember trail** (`MeteorCursor.tsx` deleted; cursor is the plain arrow), the **black ledge** under the drifting tool names, and the **legibility plate** behind card-less copy (`.qx-legible` — it existed for the old dot field; a flat navy gives the copy enough contrast).
  - **Known, pre-existing, not introduced:** the **ru/uz nav overflows** the bar around 1280–1360px — ten Cyrillic labels don't fit at any padding. This pass shrank the overflow but can't close it; the real fix is structural (group the six tool categories under one dropdown) and awaits a decision.

## Current Mission
_Note: a cinematic warp-tunnel homepage background (Mission 72) was built then **reverted at the user's request** — it didn't match the reference video closely enough. Do not re-add it without a new brief. The 21st.dev gradient-dots, the cosmic swirl and the katakana matrix backgrounds were likewise built and rejected — the background is now a **flat navy** and should stay monotone unless a new brief says otherwise._

Mission 73 complete — **the site is deploy-ready**. Next: **deploy** (domain + Vercel + AI env vars: CEREBRAS/CLOUDFLARE + DATABASE_URL + Stripe + Supabase `autopilot_posts` table + TELEGRAM_* + CRON_SECRET + Search Console). Prior: Mission 70 growth features (free-forever, UPI/GS1, AI QR Art, anti-quishing, PDF export, UTM attribution). (shared lib/lang.ts + generated home-i18n.ts, English fallback). With Mission 68's 210 localized SEO pages, the site's UI and its SEO landing pages both speak 15 languages. Prior: M68 share buttons + 15-language use-case SEO pages. under /use/[lang]/[slug] (EN/RU/UZ) with correct hreflang, HowTo/FAQ/Breadcrumb LD, localized hubs, sitemap + footer. Delivers both #1 (programmatic SEO) and #2 (multilingual hreflang SEO). Prior: Mission 65 pre-deploy hardening — GDPR cookie consent + Consent Mode v2, AdSense-ready privacy, GA4 + Sentry (env-gated), reduced-motion/hidden-tab perf pauses, a11y labels, manifest brand colour. Prior: M64 orange homepage brand film + 5 stat cards; M63 QRix Brand Film + `/promo` — the site's own on-device promo (mascot, 185+ tools story, live QR, CTA), MP4/WebM export in 3 formats. **The agreed roadmap is now fully delivered** (Animated QR → real Mediabunny video transcoding → Promo Video Maker → QRix's own promo film). Prior missions: M62 Promo Video Maker; M61 WebCodecs video; M60 Help Center + Docs + universal landings; M59 stats + blog clusters + QA sweep (287/287) + security audit.

## Remaining Missions
- Deploy: Vercel (env + cron `/api/cron/cleanup`) or `docker compose up` (Postgres/Redis/MinIO included); then `prisma migrate deploy` + `npm run db:seed`.
- Swap mock repositories to Prisma queries once DATABASE_URL is live (interface already isolated in `lib/server/db.ts`).
- **Monetization go-live (from M59 audit):** (1) apply for Google AdSense — content depth is now sufficient; set `NEXT_PUBLIC_ADSENSE_CLIENT` + real slot ids to switch ads on. (2) Add live Stripe keys (`STRIPE_SECRET_KEY` + price ids) to make `/pricing` plans purchasable. (3) Top up MuAPI or add a Fal/Replicate key to flip cloud AI/3D + image-gen from preview to real. (4) Set `DATABASE_URL` (Supabase/Postgres) so accounts/analytics persist across deploys.
- Configure Supabase Google OAuth provider (auth UI is built; provider still needs enabling in Supabase console).
- i18n localized URLs; more AI/Video blog articles for continued SEO growth.

## Current Architecture
Next.js App Router + TS + Tailwind v4, CoolM5 palette. Tool categories follow one pattern: `lib/<x>-tools-meta.ts` registry → `app/<x>-tools/page.tsx` landing + `[slug]/page.tsx` SSG → `components/<x>/<X>EngineRegistry.tsx` lazy-maps engine keys to clients. Shared primitives in `components/ai/AiKit.tsx`; SEO in `lib/seo.ts`; motion via `data-reveal`/`data-magnetic`. Backend: `prisma/schema.prisma` + `lib/server/*` mock-first env-gated drivers, REST at `app/api/v1/**`, admin at `/admin`. Register new tools in TopNav + search-index + sitemap. Supabase auth/backend, Stripe billing, all env-gated.

## Current Tool Count
~187 tools: QR 30+ (+ Animated QR) · PDF 21 · Image 72 · AI 28 · Video 30 · 3D 1 · Barcode 10 formats (+ Link-in-Bio, Poster, Bulk QR). Blog: 64 articles across 6 topical clusters.

## Current Categories
QR Tools · PDF Tools · Image Tools · AI Tools · Video Tools · 3D Tools (+ Barcode, Link-in-Bio, Blog, Help Center, Docs).

- **Mission 76 — live world map behind the navy, with the visitor's own pin** (`36c90eb`):
  - `components/WorldMapBackground.tsx` — dotted world map on the dark half of the site; 129 city dots pulse on a stagger ("people are using this"), and the visitor gets a **"We are here"** beam over the city they are actually in.
  - **Geo**: Vercel resolves it at the edge (`x-vercel-ip-latitude` / `-longitude` / `-city` / `-country`) — no permission prompt, no third-party call, nothing stored. `lib/geoip.ts` already read country/city for scan analytics; this adds the coordinates. Served from **`/api/v1/geo`** (`force-dynamic`, `private, no-store`) rather than read in the page, because **touching headers in a page opts it out of static generation** — the homepage must stay static. Cached in `sessionStorage`: one invocation per session, not per navigation.
  - **Localhost has no edge headers**, so the pin would be dead in dev. Fallback = the browser's own timezone: `Intl` gives `Asia/Tashkent` → the city segment is looked up in the same list the dots come from (**which is why the cities are named after IANA zones**). Both paths resolve Tashkent to the identical point (x=84.02, y=20.10, 0.00 units apart).
  - **The map is generated at build time** (`scripts/gen-world-map.mjs` → `public/world-dots.svg` + `lib/world-map.ts`), never imported. ⚠️ `dotted-map` is **352 KB of world land data** and emits **3065 points** — importing it would put all of that on the homepage's critical path, and rendering the points as `<circle>` nodes would put 3065 elements in the DOM. The committed SVG is **9 KB gzipped, one `<img>`, zero DOM cost**. `dotted-map` now lives in **devDependencies**.
  - The projection is **fitted by least squares against dotted-map's own `getPin()`** and validated against all 129 cities (worst residual 0.632 of a grid cell; the script refuses to emit above 0.75). Do not hand-edit `lib/world-map.ts` — regenerate it.
  - ⚠️ **The automation tab cannot verify this** (or any client effect): it does not lay out `<main>` at all (`.qx-era` measures 0×0 there) and suppresses `useEffect` site-wide (MotionLayer activates 0 of 29 reveal elements). Geometry was proven on a standalone page with the same CSS — pin drift 0.00%.

- **Mission 77 — map sizing + one pricing catalog** (`2211922`):
  - **Map fit**: it was sized on width alone, so a tall viewport pushed the top off screen (at 1897×907 it came out 1560×787 with only 60px above it — the navbar is 68px). The width cap is now also derived from viewport **height** (`min(1240px, 84vw, 138vh)`; 119/60 ≈ 1.98, so 138vh of width ≈ 70vh of height). ⚠️ **Deliberately a width cap, not `max-height`** — clamping the height breaks `aspect-ratio`, the image letterboxes inside a wider box while the HTML label keeps measuring against the box, and the "We are here" tag drifts off its pin. Verified at 6 viewports (390×844 → 1920×1080): never taller than 70% of screen, always clears the navbar.
  - **Pricing is single-sourced.** `lib/plans.ts` (previously dead code) is now the one client catalog, mirroring `lib/server/billing.ts` (which does the charging). `PricingPlans` and the new `components/PricingTeaser.tsx` both read it. ⚠️ **The plans had been written out twice and had drifted**: the homepage teaser printed **$4 / $40** under a "/mo" label — those are the *annual-prepay* rates (48/12, 490/12); a monthly subscriber is charged **$5 / $49**. It also rounded Business's annual rate to $40 (it is $40.83) and had **no Enterprise tier**. Never hardcode a price in a component.
  - Homepage now shows **4 professional cards** (Free · Pro · Business · Enterprise) with monthly headline price, the yearly rate stated *as* a yearly rate, 4 features each, recommended badge — in uz/ru/en (`Lang` has 12 locales; the rest fall back to English).
  - Two false claims in the pricing UI are now **computed, not asserted**: "Save 20%" (true only of Pro, 60→48; Business/Enterprise are 17%) and "2 months free" (true only of Business, 490/49 = 10 months).

- **Mission 78 — reviews as a chat** (`dc5e48e`):
  - `components/ReviewsSection.tsx` rewritten. The two drifting marquee rows are gone (they showed everything at once and gave no review time to be read). Now: **form on the left, reviews arriving beside it as chat bubbles** — 4 at a time, staggered, alternating sides, avatar + stars, one lit in brand orange with a shine sweep. They hold, clear out, and the next 4 arrive, cycling the whole pool.
  - ⚠️ **Inline `animation-delay` outranks the `animation` shorthand in a class.** The exit inherited the 170ms *entry* stagger, so the last bubble finished leaving at 910ms while the page swapped at 640ms — cut off mid-exit. Fixed by choosing the stagger per phase (170ms in / 60ms out) and **deriving** the wait from it (`EXIT_TOTAL_MS`), never guessing. Simulated: arrive 1090ms · leave starts 5290ms · leave ends 580ms · swap 580ms.
  - ⚠️ Second bug: once a visitor left a review the accent followed it by id, so **every page without their review had no lit bubble at all**. Falls back to a fixed slot when their review is not on screen.
  - **WCAG 2.2.2** (auto-advancing content must be stoppable): pauses on hover *and* keyboard focus, dots drive it by hand, and under `prefers-reduced-motion` it does not auto-advance at all (dots still reach every review). `aria-live="off"` so a screen reader is not read a new testimonial every 6s.
  - Submitting sends the chat back to page 0 so the visitor watches their own review arrive, lit up.
  - `.qx-tmk` / `.qx-tcard` removed from `globals.css` (nothing else used them); kept the reduced-motion rule they shared with `.qx-logos-track`.

- **Mission 79 — scroll-scrubbed hero bunny (prototype)** (`2b8916e`):
  - The user asked whether a Higgsfield subscription ($9/$29 — **note: that is the OLD Jan-2026 pricing; it repriced mid-2026 to Starter $15 / Plus $49 / Ultra $129**) could make premium scroll animations with the bunny. Answer built **without any purchase**: the bunny's pointing take is 50 frames and the scroll position picks which to draw (`components/BunnyScrollStage.tsx` canvas). Higgsfield's blocker isn't price — it outputs **opaque MP4**, and a mascot needs alpha + a stable character; see memory [[higgsfield-bunny-video]].
  - ⚠️ **This fixed a white flash that was live on the homepage.** `public/scenes/bunny-hero-live.webm` washes the bunny out to a pale ghost **3.50s–4.57s every loop** (body luma ramps 116→232); the old hero looped it on a 6.5s timer, so it flashed once a second. Alpha is fine throughout — it's the RGB. The scroll frames stop at **source frame 98** so the flash is not in the sequence. See memory [[bunny-scroll-source-flash]].
  - **Frames, not video, for scroll-scrub**: seeking a WebM costs a decode per in-between frame (keyframes are ~2s apart); all-keyframe re-encode inflates ~10×. An image sequence has no seek cost (Apple-style). 50 frames = **0.94 MB**, under half the 2.05 MB video.
  - `scripts/gen-bunny-frames.mjs` + `lib/bunny-frames.ts`. ⚠️ **Two ffmpeg traps** (documented in the script): `-c:v libvpx-vp9` MUST precede `-i` or WebM alpha is silently dropped; and `-frames:v N` caps OUTPUT not input, so with a `select` every-2nd-frame it read 105 through the flash — enforce the range **inside** `select`. The quality gate measures the frames **actually written** (at 110×192, not 44×77 which hid the ramp) and throws on any washed-out frame.
  - Three parallax layers (glow / bunny / contact shadow at different rates); frames load in parallel with nearest-loaded fallback; `prefers-reduced-motion` holds a pose. `bunny-point.webp` (a file, used by QrixPromoFilm) is untouched — the new frames live in `bunny-point/` (a folder).
  - **Still a prototype**: hero only. If approved, extend the choreography down the page (walk between sections, point at each tool family, world-map pin).

- **Mission 80 — full-page scroll companion** (`e33eea8`): `components/BunnyCompanion.tsx` extends the hero scrub down the page — below the hero the bunny sits in the left gutter and points at each content section (all-tools · reviews · pricing) as it centres, arm down between. Reuses `bunny-point/` frames (frame 0 arm-down → last frame point); no new assets.
  - ⚠️ **Centred dense layout has no gutter at ~1440px** — a persistent side companion would cover the cards / reviews form. So it **measures the tightest section's left edge** each resize and only appears when the gutter is wide enough (~**1644px+**), sized to fit inside it. Proven no-overlap 1440→2560. Below that: renders nothing, hero bunny only. **Never widen it past the measured gutter.**
  - Skips hero + generator bands (both have their own bunny), `pointer-events:none`, off on touch / reduced-motion. Client-gated so absent from SSR. Removal = delete the `<BunnyCompanion />` line in `app/page.tsx` + the file.
  - Choreography simulated: arm peaks (frame 48) as each section centres, ~frame 6 between. tsc clean, page 200, no overlap.

- **Mission 81 — REVERTED the scroll bunny** (`407fda0`): the user found the scroll motion wasn't needed. Missions 79 (hero scroll-scrub) and 80 (full-page companion) are removed. Hero is a **calm still** again (`bunny-hero.webp`) with the existing smoke reveal + parallax; nothing moves on its own. Deleted: `BunnyScrollStage.tsx`, `BunnyCompanion.tsx`, `lib/bunny-frames.ts`, `scripts/gen-bunny-frames.mjs`, `public/scenes/bunny-point/` (50 frames). ⚠️ Did **NOT** restore the old still↔film cross-fade: its film `bunny-hero-live.webm` washes to white 3.50–4.57s (see memory [[bunny-scroll-source-flash]]); the still has no flash. The webm stays on disk, referenced only in comments (never plays). `bunny-point.webp` (a file, QrixPromoFilm) untouched.

- **Mission 82 — reviews readable + on-theme cards** (`6cfaa75`): review bubbles used `--surface-2` (6% white = near-transparent), so the world map bled through the text. Now the site card glass at ~93% + blur → text 11:1 AAA. Form + reviews column made equal-height (grid `stretch` + form `flex-col` + textarea `flex-1`). All-Tools spec cards reskinned from near-black graphite to `--card-bg` navy glass (16px radius, blur). ⚠️ standard `backdrop-filter` only (Lightning CSS trap).
- **Mission 83 — reviews drift + numbers cards glass** (`05efb99`): reviews are a **vertical marquee** now (float up continuously in the right column; form stays put on the left, equal-height fixed window clamp(440,56vh,560)). ⚠️ **seamless loop needs `margin-bottom` on rows, NOT flex `gap`** — gap gives N items N-1 gaps so `translateY(-50%)` jumps half a gap. Pauses on hover; reduced-motion → static scroll; visitor's own review floats past lit orange. **QRIX-in-numbers 5 cards** reskinned from graphite to the **QR generator card's glass** (`.qx-fcard`: `rgba(255,255,255,.05)` + `--glass-blur` + 0.13 hairline + 22px); cursor-lit border/spotlight kept; `isolation:isolate` did NOT break backdrop-filter.

- **Mission 84 — one glass across homepage cards** (`fcf6d87`): added material-only `.qx-glass` (globals.css) = the QR generator card's glass (`rgba(255,255,255,.05)` + `--glass-blur` + 0.13 hairline). Applied to the reviews form + Latest-guides cards; lightened the brand-film panel's inline bg to match; softened the numbers cards' cursor ring to 0.16 at rest. All four now compute identical to `.qx-fcard`. **Reuse `.qx-glass` for any new homepage content card.**
- **Admin panel is already owner-only** (no code change): `/admin` → `ADMIN_EMAILS` (default `musarasulzada@gmail.com`) via magic-link; API server-enforces `admin: true`. See memory [[admin-access]]. Deploy needs `AUTH_SECRET` + real email sender + `ADMIN_EMAILS` = owner only.
- **Payments = after deploy** (advised): Stripe needs the live HTTPS domain for webhooks + return URLs; billing code is env-gated and works in mock now — flip to real by setting `STRIPE_SECRET_KEY` / `STRIPE_PRICE_*` / webhook secret post-deploy, no code change.
- **Domains** (checked via Vercel, 2026-07-15): qrix.com/.io/.app/.ai/.dev/.net/.link all TAKEN. Available: **qrix.pro $4.99** · **qrix.tools $17.99** · getqrix/tryqrix/useqrix/qrixapp/qrixhq **.com $11.25** · qrix.studio $21.99 · qrix.co $123.

- **Mission 85 — DEPLOYED to qrixtools.com** (2026-07-15/17): domain registered (Cloudflare, $11.25/yr) and wired (`4f435b1`); `design-v2` fast-forwarded to `main` (Vercel deploys `main`); Supabase live (project `kszqlafadaxrknadcala`) — 4 tables, `autopilot_posts` created via MCP; **security lockdown `0797c19`**: `dynamic_links`/`qr_scans` RLS-locked to the service role (anon "update for everyone" = redirect-hijack — closed), `lib/supabase.ts` is now the service-role client, dashboard scans scoped to own slugs; ⚠️ **`SUPABASE_SERVICE_ROLE_KEY` is REQUIRED** (memory [[supabase-service-role-required]]); crons trimmed to Hobby's 2-daily limit (`10e560f` — restore the other 4 on Pro); Resend wired (magic-link emails deliver); Google OAuth enabled (brand verification pending — app name must read "QRix").
- **Mission 86 — the PIN-QR bug, fixed in three layers**: users scanned PIN QRs and went straight to the target. Chain: page ran on the **www origin** (the service worker's page cache swallowed the www→apex redirect) → same-origin `fetch(/api/create-dynamic)` hit the domain redirect ("Redirecting…", not JSON) → creation failed → old client **silently fell back to encoding the raw URL**. Fixes: `a9b6c46` no silent fallback (red "QR was NOT protected" error, uz/ru/en); `b91ba68` canonical-host inline script in layout (www → apex before anything runs; previews untouched) + sw `qrix-v2` cache purge; `33a300b` scheme-less URLs ("www.google.com") get `https://` defaulted client-side. Verified on prod end-to-end: create → `/pin/<slug>` 200 with form → `/r/<slug>` 307s to it. ⚠️ **PIN QRs made before the fix encode the raw target and must be regenerated.**

- **Mission 87 — full production audit + mobile hero fix + host hardening**: real end-to-end test of live qrixtools.com. **Verified working**: PIN flow (create → `/pin/<slug>` form → wrong PIN `?error=1` → correct PIN redirects), plain dynamic links, `/api/v1/geo` (UZ/Tashkent), AI backend **alive on `gemini`**, autopilot blog (2 posts, one/day, 4 sections + 4 FAQs each), all key pages 200 + JSON-LD, sitemap/robots, HSTS+CSP+XFO+nosniff headers, admin APIs 401, crons 401 without secret, PIN brute-force cap. **Fixed (1) mobile hero overlap** — `.qx-hm` was bottom-anchored (`bottom` clamp from the base rule, mobile MQ only overrode `height`), so the bunny sat over the copy + search while the stage's `44vh` top-gap sat empty. Now top-anchored inside the gap (`top:14vh; bottom:auto; height:36vh`) + stage `padding-top:46vh`. Confirmed by measured geometry (title ends ≈102px · bunny 114–406px · content starts ≈476px — clean gaps both sides); **not screenshot-verified — this session's preview pane runs `visibility:hidden` so it never lays out `<main>` (`.qx-era` = 0×0), same trap noted in M76/M39**. **(2) redirect host hardening** — `create-dynamic`'s `isSafeUrl` accepted `http://localhost/…` and private/loopback/link-local/metadata IPs; added `isPublicHost()` (blocks 10/8·127/8·172.16/12·192.168/16·169.254/16·100.64/10·`::1`·`fc/fd/fe80`·`localhost`·`.local`). Not a server-side SSRF (redirect is client-side) but stops the domain masking internal-network redirects. tsc clean; test rows cleaned from prod DB.

- **Mission 88 — pro pass on QR Art · Link-in-Bio · Design Studio** (user: art hidden behind the QR card; controls untidy; templates too plain vs me-qr): **(1) QR Art** (`QrArtClient.tsx`) — the QR panel and headline are now **draggable right on the preview canvas** (pointer events + canvas-space hit testing; `setPointerCapture` wrapped in try/catch — it throws on synthetic/edge pointers and killed the drag), plus QR size slider (22–58%), 3 panel materials (Card/Compact/Glass), 9-dot position grid, scrim toggle, Reset; controls reorganized into numbered sections (01 Content · 02 AI background · 03 Layout). Download = same canvas, WYSIWYG. **(2) Link-in-Bio** (`LinkInBioClient.tsx`) — one long messy column → professional 5-tab editor (Templates · Profile · Design · Links · Share); templates are now **me-qr-style mini page-preview cards** (theme gradient + avatar + accent buttons + Applied ✓) and grew 6→9 (added Fitness Coach, Courses/Teacher, Photographer); share QR builds only on the Share tab (qrRef nulled on tab switch — the mount remounts). **(3) Design Studio** (`QRDesignStudio.tsx`) — added a 10-template pro gallery (Classic/Sunset/Ocean/Forest/Berry/Midnight/Gold/Neon/Café menu/Wedding), each card rendering a **real 72px qr-code-styling preview** of its exact config; one click applies shapes+colors+gradient+bg+CTA frame. All verified in the dev preview by DOM/pixel probes (drag moves the card, slider 55%, 9 bio templates apply → preview + Profile update, studio shows 10 mini QRs, Neon applies). **Testing trap solved for hidden preview tabs**: React 19.2 batches streaming Suspense reveals via rAF (`$RB`/`$RV`) — in a hidden tab rAF never fires and the whole page stays `<div hidden>`; shim rAF + flush `$RV($RB)` manually, then effects run.

- **Mission 89 — Design Studio pro: logo-as-QR + scan check + studio in every QR tool** (user wants me-qr's logo feature and the studio everywhere): **(1) Logo modes** in `QRDesignStudio.tsx` — "Center logo" with a size slider (20–45%, `imageSize`) and **"Logo = QR ✨"**: the logo becomes the whole code (qr-code-styling renders modules on a transparent bg; composite = white base → logo cover → wash toward white → modules; "Logo visibility" slider 15–50%; EC locked to H). Full mode exports correctly in PNG/PDF (composite at export size) **and SVG** (`<image>` + wash rect injected under the module layer). **(2) Live scan check** — a real jsQR decode of the final artwork after every change (450ms debounce), badge "✓ Scan check passed / ⚠ May be hard to scan". Turbopack CJS gotcha: `import("jsqr")` resolves to the FUNCTION itself, `.default` is undefined — use `typeof m === "function" ? m : m.default` (QrDecodeClient's `.default` works in webpack prod builds but not dev). **(3) Logo palette** — dominant colors extracted from the uploaded logo (24px quantize, skip near-white/transparent) → "From your logo" chips set the QR color. **(4) Hi-res export** — 512/1024/2048px PNG via a headless qr-code-styling instance (same pattern QrArtClient proved); frame math scales by k=size/280. **(5) Studio everywhere** — `QRGenerator.tsx` (all `/qr-tools/[slug]` tools) now opens the FULL studio instead of its little inline color modal; new `onApply` prop reports {fg,bg,level,logo} back so the tool page's live preview follows (verified: Sunset template → WiFi tool preview went orange). Homepage passes no onApply — unchanged. All verified in dev by DOM/pixel probes, incl. full-logo mode still decoding.

- **Mission 90 — audio format picker in Extract Audio** (user: add phone/computer formats): `AudioExtractClient` now has a 4-format selector — **MP3** (universal), **M4A/AAC** (iPhone/Apple), **WAV** (lossless), **OGG/Opus** (smallest, Telegram/Android) — with per-format hints, live progress %, and **instant re-convert**: tapping another chip re-encodes the kept file without re-dropping. `lib/video/convert-mb.ts` grew `extractAudio(source, format)` + `supportedAudioFormats()`; **MP3 is now guaranteed on every browser** via the official `@mediabunny/mp3-encoder` (LAME/WASM, lazy-loaded, registered only when `canEncodeAudio("mp3")` is false — new dep, justified: the tool used to silently fall back to WAV). M4A = audio-only `Mp4OutputFormat`; WAV/OGG via mediabunny's native output formats; last-resort AudioContext→WAV fallback kept. Meta/SEO/FAQs updated (which-format-to-pick FAQ). Verified in dev with a synthesized tone video: all four formats extract and re-convert, player playable after each.

- **Mission 91 — studio modal scroll + clean PIN page**: (1) Design Studio modal — scrolling moved the PAGE behind, not the modal's controls; fixed with a body-scroll lock while open (`document.body.style.overflow = "hidden"`, restored on unmount) + `overscroll-behavior: contain` on the card so bottoming-out doesn't chain to the page. (2) The PNG/SVG/PDF download menu used translucent `--surface-2` and was unreadable over the modal — now solid `--surface-solid`. (3) `/pin/…` and `/r/…` are scan-landing pages, not browsing — `TopNav` returns null there (early return placed AFTER all hooks; pathname check), so scanners see only the PIN lock card. Verified in dev: body locks/unlocks, card scrolls internally, menu bg rgb(20,20,20) solid, nav absent on /pin with the form rendering; dev test row cleaned from Supabase.

- **Mission 92 — wide studio modal · mobile dashboard · Background Remover fixed**: (1) **Studio modal** — user still couldn't reach lower controls; restructured to the classic pattern where the OVERLAY is the scroll container (`overflow-y-auto` on the backdrop, card `m-auto` inside `flex min-h-full`) so the wheel works anywhere over the modal; card widened `max-w-3xl→max-w-6xl`, controls in 2 columns at xl (Logo group spans both), preview column sticky. (2) **Dashboard mobile** — the fixed `w-60` sidebar always rendered, squeezing phone content to ~130px; now `hidden lg:flex` + a slide-over drawer (hamburger in the dashboard header, body scroll locked while open, shared `sidebarInner`); header/content paddings responsive, Create QR label hidden on xs; **global TopNav now returns null on `/dashboard`** too (two sticky bars overlapped the search on phones — dashboard is its own app shell). (3) **Background Remover was broken everywhere**: it set `publicPath: ${origin}/imgly/` but those model assets were never shipped → every run 404'd and hung at "Loading AI model...". Removed the override so assets load from the package's own CDN (staticimgly.com); progress now shows fetch % + "(first run only)". Verified end-to-end in dev: model downloaded, cutout produced. **All server AI tasks probed healthy on prod** (text/translate/summarize/ocr/image-analyze → gemini; image-generate → cloudflare). Note: deploy-watch by CSS hash gives false timeouts when a commit doesn't change the stylesheet — probe content instead.

- **Mission 93 — PDF→Word 1:1 (ilovepdf-quality) + PDF tools speed pass**: user compared us to ilovepdf's pdf_to_word — ours "completely broke" the layout. Rewrote `PdfToWordClient` with two modes: **"Exact layout (1:1)"** (default) — one DOCX SECTION per page at the exact PDF page size (0 margins), every text line an **absolutely positioned text frame** (`framePr`, page-anchored, wrap none, exact lineRule) at its true PDF coordinates with real font sizes + serif/mono/sans mapping from pdf.js styles, images as **floating anchors** at their CTM positions behind the text — opens in Word looking like the PDF, every line editable (same technique commercial converters use); and **"Flowing text"** — improved reflow: consecutive same-size lines MERGE into paragraphs (hyphen-aware), center/right alignment detection, headings, real fonts. Speed: pages analyzed concurrently (pool of 4), and pdf.js+worker+docx **prefetch on file select** so the click is instant. Slowness audit found infra HEALTHY: both workers in public/ are 6.0.227 matching the package, prod serves them 200 + `application/javascript` (real worker thread, not fake-worker fallback); 3-page convert ≈0.6-1.0s — remaining "slow" is heavy-by-nature tools (OCR/compress render loops) + phone hardware. Verified: Node probe of docx 9.7.1 framePr emission ALL PASS; browser E2E both modes (valid ZIP, no errors); unzipped the real browser DOCX in-page (DecompressionStream) — 93 frames/3 sections/exact A4/all text present.

- **Mission 94 — PDF→Word hang fixed + graphics layer (user's real INGOS policy)**: the user's insurance PDF hung at "Analyzing page 1 of 2" forever and the pre-created save target stayed EMPTY. Root cause (diagnosed with a Node pdf.js probe on the actual file): image object `g_d0_img_p1_3` lives in **`page.commonObjs`** (document-global, `g_` prefix), but the extractor awaited `page.objs.get()` — a getter that never fires → `Promise.all` never resolves → docx never built. Also 207 vector path ops (table borders) were unrepresentable by XObject extraction at all. Fixes: **exact mode no longer touches object stores** — each page renders to a full-page JPEG **graphics layer** (scale ≤2, text lines whited out, near-blank layers dropped via 64px ink test) placed `behindDocument`, with the editable text frames on top → table borders/logos/stamps now come through pixel-perfect; **flow mode** picks the right store (`g_`→commonObjs) and caps every object wait at 2.5s (skip, never hang). Verified with the real policy in dev: exact 2.3s/168KB, flow 0.8s/13KB, DOCX contains 90 frames · 2 exact-size sections · Cyrillic text · 2 behindDoc JPEGs. Privacy: the user's policy was staged in public/ only for the local test and deleted before commit.

- **Mission 95 — PDF→Word column splitting: 56% → 100% position fidelity**: user re-tested the INGOS policy — still not 1:1. Measured against the source (Node script: parse DOCX framePr x/y + text, match every PDF segment start): only **90 of 160 segments** had a frame at the right spot — **70 right-column cells were GLUED onto the left frame of their row** ("ЭЛЕКТРОННЫЙ Страховая премия" in one frame). Two fixes in `buildLines(items, styles, splitCols)`: (1) in exact mode a row **splits into independent segments at x-gaps > size×1.1**, each its own positioned frame (whiteout follows automatically since segments ARE the lines); (2) whitespace-only items **bridge column gaps** and mask the split point — dropped in column mode (word spacing comes from the gap rule anyway) — this alone took 111 → 160 frames. Verified in dev on the same policy: **160/160 frames**, all previously-missed markers at exact x (Страховая@448, 07.09.2023@507, Срок@339, №ХХХ@275, с@425), 180KB, no errors. Flow mode untouched (rows stay whole for paragraph merging).

- **Mission 96 — PDF→Word ilovepdf-parity pass (visual, verified through Word itself)**: user compared our DOCX side-by-side with ilovepdf's — dissected BOTH (ilovepdf = real `w:tbl` tables + colors + Verdana/Times, zero frames) and closed the visible gap on the frames approach. Verification loop each round: convert in dev browser → export DOCX bytes (base64 via tool-result files) → **render via Word COM → rasterize → LOOK at it** next to the original. Fixes: **(1) per-segment color sampling** from the pre-cover render — text color = in-box pixels most distant from local bg (blue headings/white-on-blue table headers now真real); cover patches painted with the box's DOMINANT interior color, not white (no more white patches on blue bands; whole-box dominant beats edge strips — borders can't hijack it); light-on-light samples snap to black (antialias artifacts). **(2) real font resolution** — `page.commonObjs.get(fontName).name` gives the PostScript name ("…Verdana-Bold") → true family map + bold/italic (styles fontFamily alone loses bold). **(3) two-tier space rule** — word gap 0.24em, but 1-2-char neighbours need 0.5em (kills "H y u n d a i" without gluing "Страховаяпремия"); row tolerance 0.5→0.62 size (form values on shifted baselines). **(4) residual-ink sweep** — white-bg boxes still holding chunky ink after cover get an expanded repaint (thin borders can't trigger it at the 5% bar). **(5) frame width = max(pdf width, canvas.measureText with mapped font)** so Word metrics never wrap a line inside its frame ("379326"). Known verification artifact: Word's PDF **export** of Arial digit runs rasterizes as seven-segment glyphs in pdf.js-node — the DOCX itself is clean (Arial/black in XML) and Word displays it correctly. Bg layers verified visually clean; page-1/2 renders match the original closely.

- **Mission 97 — the "Arial curse" found and killed**: user's re-test in real Word still showed OCR/LCD-style digits ("31 895", VIN, Hyundai, e-mail). A MINIMAL repro docx (3 paragraphs: frame+exact / frame / plain, each with an Arial run + a Tahoma run) exported through the user's own Word proved it: **every run named "Arial" renders in a thin OCR-style face on this machine, frames irrelevant; Tahoma renders fine**. GDI draws Arial normally and FontSubstitutes is clean, but arial.ttf was replaced 2024 (SamLab Windows build) and Word 2013's font pipeline resolves it to the broken face — a MACHINE issue, but the product must survive such machines. Fix: the converter never emits "Arial" — default sans is now **Tahoma** (universal, metrically close, proven working here). Verified end-to-end on the same policy through the user's Word: premium digits, VIN row, Hyundai/Solaris, e-mail, phone all render normally; the doc now closely matches ilovepdf's output. (ilovepdf anatomy, for the future: real `w:tbl` tables + indents + textboxes, zero frames — a table-reconstruction mode is the next big fidelity step if ever needed.)

- **Mission 98 — server-side PDF→Word: provider fallback chain (Adobe-first)**: user (comparing to ilovepdf) chose a cloud engine and proposed a chain — Adobe → CloudConvert → own server, auto-return when limits reset, plus any other strong free-tier services. Researched + confirmed the free tiers: **Adobe PDF Services 500/mo** (best fidelity, real tables), **Aspose.Words 150/mo**, **ApyHub 10k/mo**, **CloudConvert ~25/day**, **self-host Stirling PDF/Gotenberg = unlimited**. Built `lib/server/pdf-convert.ts` — an ordered provider chain (`convertPdfToWord`): each provider a fetch adapter, tried best-first, **try/catch/next gives auto-fallback AND auto-recovery for free** (over-quota throws → next; next request retries the top, so a reset window silently returns — no usage table). Adobe adapter = full REST flow (token → asset → upload → exportpdf → poll → download; 429 = quota). Self-hosted adapter (Stirling `/convert/pdf/word`) is the unlimited tail. Each provider joins only when its env keys exist, so the whole feature is **inert until keys are added** — `GET /api/pdf-to-word` → `{available:false}`, `POST` → 501. Replaced the dead Anthropic-OCR route with the chain route (nodejs, 60s, 25MB cap, %PDF magic check, rate-limited 30/hr/IP). Client (`PdfToWordClient`) gains a **"★ Best quality (cloud)"** mode that appears + becomes default only when `available`, uploads the PDF and saves the returned DOCX, and **transparently falls back to on-device exact** on any server failure; honest privacy copy per mode (cloud = "sent to a secure server, not stored"; on-device = "nothing uploaded"). **Owner TODO: add `ADOBE_PDF_CLIENT_ID` + `ADOBE_PDF_CLIENT_SECRET` to Vercel env** (Adobe free tier, OAuth Server-to-Server creds) → redeploy → cloud mode goes live. Secrets never handled in chat/by the agent (prohibited-action rule). tsc clean; route verified locally (available:false + 501 without keys).

- **Mission 98b — cloud PDF→Word LIVE & verified pixel-perfect**: owner added `ADOBE_PDF_CLIENT_ID/SECRET` + `ASPOSE_CLIENT_ID/SECRET` in Vercel and redeployed. Production `GET /api/pdf-to-word` → `{available:true}`; a POST of the real INGOS policy returned **provider: adobe, 693KB** (≈ ilovepdf's 694KB) and, rendered through Word, is **1:1 with the original** — real editable Word tables, blue logo/headers, correct fonts/positions, stamp, QR. The multi-provider chain is confirmed working (tiny/edge PDF fell through adobe→aspose). Added `ASPOSE_CLIENT_ID/SECRET`, `CLOUDCONVERT_API_KEY`, `PDF_ENGINE_URL/TOKEN` as optional chain keys (memory [[pdf-word-provider-chain]]). The quest for ilovepdf-quality PDF→Word is solved via the cloud path; on-device modes remain the private fallback.

- **Mission 99 — universal social-media downloader (video/audio/image)** `16536a1`: new `/downloader` tool + a big homepage card (between the QR generator and the tools grid) + Video-Tools nav + search + sitemap. Paste a link → preview → pick video (MP4) / audio (MP3) / image with a streamed animated progress %. **YouTube deliberately EXCLUDED** — Google owns YouTube and AdSense policy forbids YT-downloader pages; the "only CC videos" idea does NOT shield the account (researched), so it stays out to protect the owner's whole AdSense account. Architecture mirrors the PDF chain, env-gated: `lib/server/media-download.ts` = cobalt (`COBALT_API_URL`, covers every platform) → keyless built-ins (TikTok via tikwm; direct-media). Formats are **HMAC-signed** (CRON_SECRET) so `/api/download/file` can only proxy URLs we produced (never an open proxy); per-host Referer for CDNs. **VERIFIED LIVE on production**: TikTok end-to-end downloaded a real 2.95 MB valid MP4 (`provider tikwm`; note the tiktokcdn URL is US-geo-locked so it only streams from Vercel's US region, not from a UZ dev box). Instagram/VK/X/Reddit/etc return honest "engine_not_configured" until the owner adds `COBALT_API_URL`; unsupported hosts are rejected. Automated UI-click test was blocked by the in-app browser's hidden-tab layout (0×0 rects, the visibility:hidden trap) — the API pipeline + SSR were proven instead; the client is a standard controlled-input+fetch. **Owner TODO (morning):** deploy cobalt (fits Render free, ~150MB, unlike Stirling) → set `COBALT_API_URL` → every platform lights up. Providers researched: y2mate/savefrom are malware-ridden (our clean/ad-free angle is the moat); YouTube blocks datacenter IPs so cobalt is best-effort for it anyway (moot since we exclude it).

- **Mission 99b — cobalt live + downloader fixed & SEO-bombed** `82ae0db`: owner deployed cobalt v10.9.4 on Render free (`qrix-cobalt.onrender.com`, `API_URL` env = its own URL) and set `COBALT_API_URL` in Vercel. User's real test then showed: video worked (IG/Pinterest/OK) but **every Audio·MP3 failed + OK download failed** — root cause: cobalt returns **"tunnel" URLs on its own host that expire in minutes** and were also rejected by the file-proxy allowlist. Fix = **re-resolve tokens**: tunnel formats now sign the ORIGINAL page URL (`k:"c"` payload) and `/api/download/file` re-calls cobalt at click time for a fresh tunnel (can never expire; no allowlist hole; legacy `k:"d"` direct tokens still verified, now also allowing the cobalt host). Also: **own keyless SoundCloud extractor** (`k:"s"`: homepage→sndcdn script client_id scrape, 1h cache → api-v2 resolve → progressive MP3) because cobalt's soundcloud route is IP-blocked from datacenters; **short-link unshortener** (reddit `/s/` share links, t.co, redd.it, snd.sc, dai.ly — manual-redirect hops server-side); TikTok chain order = tikwm first; `verifyMedia` hardened (timingSafeEqual length guard). **SEO bomb**: `app/downloader/[platform]/page.tsx` — 16 SSG landing pages (unique title/intro/features/HowTo/FAQ + SoftwareApp/Breadcrumb/FAQ/HowTo JSON-LD), all in sitemap + 9 in search index, main `/downloader` chips now link to them, `DownloaderClient` got a `placeholder` prop. **LIVE-verified on production with the user's own links**: IG video 6.0MB + IG MP3 545KB ✓, Pinterest video 882KB + MP3 92KB ✓, OK.ru 1080p 84MB ✓, SoundCloud MP3 3.2MB ✓ (own extractor), TikTok all 4 formats ✓ (live trending link; old test links were dead), X/Twitter 21.2MB valid MP4 ✓, Dailymotion video+audio ✓. **Blocked by platform-side datacenter-IP bans (not our bug): VK (`fetch.critical`), Reddit (`fetch.fail` on every URL form), Vimeo, Bilibili** — the one-shot fix later is a cheap residential proxy on the Render service via cobalt's `API_EXTERNAL_PROXY` env (~$2–5/mo); until then those chips show the honest "private/deleted/region-locked" error. Facebook/Snapchat/Twitch/Threads/Tumblr need live links to verify (my synthetic ones were dead).

- **Mission 100 — downloader premium card redesign** `f126775`: `.qx-dl-*` design layer in design-v2.css — input bar with orange focus bloom; platform logos as a masked infinite marquee (pause-on-hover, reduced-motion→static wrap) whose chips link to the 16 `/downloader/[platform]` SEO pages; shimmer skeleton while fetching; framed thumbnail with brand badge + mono duration chip; segmented gradient type tabs; format rows as hairline tiles (icon tile, container meta line, gradient progress fill with moving shine, pop-in Saved); homepage card gains corner orange glow + pulsing New dot + mono metric line. Verified on dev (marquee animating, 32 brand SVGs, chips link, zero console errors; screenshots unavailable — hidden-tab 0×0 limitation).

- **Mission 100b — audio everywhere + teaser→page** `b5fcde2`: OK.ru had no Audio option (cobalt: `error.api.service.audio_not_supported`) — the client now synthesizes an "Audio · MP3 (Extracted from video)" format whenever a link has video but no server-side audio: it streams the video (progress→70%) then extracts the soundtrack **in-browser** with the existing Mediabunny/LAME engine (`lib/video/convert-mb.ts` `extractAudioMp3`, →100%). Homepage downloader card became a **teaser Link to /downloader** (mock input bar + localized hero CTA + span-chip marquee — no nested links); the working card lives on the dedicated page, which gained "What you can download" (MP4/MP3/JPG cards) and "About this tool" (privacy, tips, short-link notes) sections per the user's request.

- **Mission 101 — growth engine (SEO + distribution)** `9c267cf`+`33ba2c8`: real-data audit (Supabase: 65 QR scans, 182 links mostly launch-week, 1 review; GSC just woke up — 75 impressions/1 click, avg pos 74.9, sitemap 526 pages discovered Jul 17). Search Console verified + sitemap in; **Bing** imported from GSC (user); **Yandex**: `verification.yandex` meta live `a30e73e` (user clicks «Проверить»). Key insight: AI/3D long-tails (ai avatar generator 11 imp, image-to-3d 6 imp + first click, denoiser 4) outrun head QR terms — so 5 new AUTOPILOT_TOPICS target those niches + downloader guides, slotted right after the launch batch. **IndexNow** (`lib/server/indexnow.ts`, public key `c3bb2594…d8.txt`): autopilot now submits the FULL live sitemap to Bing+Yandex daily on publish (self-healing; first manual push got 403 SiteVerificationNotCompleted — engines verify the key within hours, cron retries daily). **Telegram channel autoposter** `/api/cron/social-post` (09:00 UTC, vercel.json): tool-of-the-day trilingual (EN/RU/UZ) post with UTM via bot; env-gated on `TELEGRAM_CHANNEL_ID` (+ existing `TELEGRAM_BOT_TOKEN`, bot must be channel admin). Owner's human-only queue: Yandex «Проверить»+sitemap, create TG channel + env, Product Hunt/Show HN/r/InternetIsBeautiful posts, directories (AlternativeTo/Toolify/SaaSHub/Uneed).

- **Mission 102 — RU-market SEO strike** `0dc4307`: 17 static Russian pages — `/ru/downloader` hub + 16 platform pages (`app/ru/downloader/`), custom copy for top-8 («Скачать видео из TikTok без водяного знака», ВК, Одноклассники…), templated rest; en↔ru hreflang on BOTH language versions via pageMeta `languages`; sitemap (564 URLs) + search index; all 564 resubmitted to IndexNow (HTTP 200). Rationale: RU-query volume is huge, quality ad-free competition weak, Yandex Webmaster wired same day. Directory day: SaaSHub submitted+VERIFIED (14 competitor pages), Uneed free queue (Dec 21), AlternativeTo waits for 7-day account age (submit Jul 27), Toolify/TAAFT now paid ($99) — skipped. GA4 live `7dc85e2` (G-XKW8P2LRY0 hardcoded default in layout).

- **Mission 103 — top-1 strategy, wave 1** `6b06731`+`ccf1495`+`9c514a1`: (a) **PUBLIC Telegram downloader bot** `/api/telegram/bot` — separate token from the admin bot (`TELEGRAM_PUBLIC_BOT_TOKEN` + `TELEGRAM_PUBLIC_SECRET`, env-gated no-op), secret-token webhook check, per-chat 20/hr limit, sendVideo straight into chat (≤20MB) with format URL-buttons fallback, trilingual, self-registers webhook via GET `?setup=1` (cron auth) so no token passes through chat; (b) **comparison pages** `/compare/qrix-vs-{ilovepdf,tinywow,snaptik}` — honest tables that concede competitor strengths, FAQ JSON-LD, sitemap+search; (c) **GA4 `tool_used` mirror** in lib/track.ts (+ gtag global type aligned with CookieConsent — TS conflict hotfixed `06291e7`) and **search-miss logging** in CommandSearch (zero-result queries → `search_miss` event = user-demanded roadmap). Also: weekly Supabase backup `7b1758c` (Sundays via autopilot cron → private `backups` storage bucket; free tier has no auto-backups). Wave 2 backlog: viral QR footer, embeddable widget (needs frame-ancestors exception), PWA install prompt, review-ask toast, more languages, residential proxy for VK/Reddit.

- **Mission 104 — top-1 wave 2** `d19b907`+`b9cb1c1`+`4b0505c`: (a) **viral QR footer** — `lib/qr-export.ts` composites the homepage QR canvas onto a 2x-crisp PNG with a subtle background-matched `qrixtools.com` footer (auto-contrast); every printed/shared QR is a quiet ad; Pro will pass `brand:false` (monetization hook). (b) **Uzbek downloader pages** — `/uz/downloader` + 16 platform pages in LATIN Uzbek (Uzbek search is predominantly Latin: "tiktok video yuklab olish"); en/ru/uz 3-way hreflang across all downloader pages. (c) **Embeddable widget** — `/embed/*` opts out of frame headers (`CSP frame-ancestors *`), embed layout adds `.qx-embed` (hides all site chrome via `body > *:not(#main)`), `/embed/downloader` = bare widget + UTM "Powered by QRix" backlink (noindex); `/widgets` = public builder with one-click copy iframe snippet + live preview (`components/EmbedSnippet.tsx`). All verified locally (embed strips chrome, builder keeps it, zero console errors). Sitemap now ~597 URLs. Wave 2 remaining: PWA install prompt, review-ask toast, more languages (ES/PT/TR/ID), residential proxy for VK/Reddit. STILL owner-gated: activate public TG bot (`TELEGRAM_PUBLIC_BOT_TOKEN`) + channel (`TELEGRAM_CHANNEL_ID`).

- **Mission 105 — Telegram distribution LIVE** `de7d49b`..`228a91c`: public downloader bot `@qrix_downloader_bot` (token `TELEGRAM_PUBLIC_BOT_TOKEN`, secret `TELEGRAM_PUBLIC_SECRET`, webhook self-setup via `?setup=1`) + public channel `@QRixtools` (`TELEGRAM_CHANNEL_ID`, daily tool-of-the-day autopost 09:00 UTC via `/api/cron/social-post`, readiness probe `?status=1`). Bot: send a link → media into the chat; **format buttons are CALLBACKS** (not links) so "Audio·MP3"/"Video·HD" deliver that file INTO the chat (callback_data 64-byte cap → re-reads the link from the replied-to message, stateless). Fixed two delivery bugs: `tg()` unwraps `result` so `sent?.ok` was always undefined (every success also fired the "file too large" fallback) and whoAmI() read the wrong path. Welcome card has share deep-link + UTM site button. Brand avatar `public/bot-avatar.png` (512², @napi-rs/canvas — 3 QR eyes + download-arrow 4th corner, 12 platform brand-dot ring). `lib/social.ts` = single source of truth (`TG_CHANNEL`/`TG_BOT`); footer Telegram block + downloader-page chips link both, all UTM'd. **User-confirmed everything works** (link→video, MP3 button→MP3 in chat). YouTube stays excluded (AdSense). Owner still to do: BotFather name/about/pic (`/setuserpic` bot-avatar.png), rotate `TELEGRAM_PUBLIC_SECRET` off the value I suggested in chat, refresh webhook with `allowed_updates=["message","callback_query"]`.

- **Mission 106 — converter-pair pages (programmatic SEO family #1)** `3cc26a6`+`f776952`: `lib/convert-pairs.ts` registry drives `/convert` (hub, grouped by target format, ItemList JSON-LD) + 20 SSG `/convert/[pair]` pages (png/jpg/webp/avif/bmp/gif/ico) targeting "png to jpg"-class head terms. Each page reuses `ToolPageShell` + `ImageEngineRegistry` so the REAL working ImageConvertClient is embedded (`engine: "convert:<mime key>"`), never thin: per-pair title/h1/desc/intro/~130-word about/3 steps/4-5 FAQs, all hand-written per format trade-off — plus SoftwareApp+Breadcrumb+**HowTo**+FAQ JSON-LD (new reusable `howToLd()` in lib/seo.ts) and a related-converters block for internal linking. Registered in sitemap (21 URLs), search-index, TopNav image dropdown, llms.txt. **Also fixed a real bug this family depended on:** `canvas.toBlob()` does not support `image/bmp` or `image/x-icon` and silently returns PNG bytes, so the pre-existing BMP and ICO conversions were handing users a PNG with a lying extension — ImageConvertClient now writes a genuine 24-bit BMP (BITMAPINFOHEADER, bottom-up 4-byte-aligned rows, alpha flattened to white) and a genuine ICO (ICONDIR + ICONDIRENTRY wrapping a 256² PNG); 17 byte-layout assertions pass. All 21 URLs verified HTTP 200 live with unique titles + canonicals; IndexNow accepted (200). **TIFF is still broken the same way** — next in backlog.

 + explicit `/pin`. **(b) Organization/publisher logo → /icon 404** — an M121b regression: the icon became a static file but every page Organization schema and blog/docs Article publisher logo still pointed at the dead route; now /icon.png. **(c) Five more canonical-trapped stubs** (/wifi-qr /email-qr /sms-qr /telegram-qr /whatsapp-qr) served the homepage title+canonical, and every /use/* how-to CTA plus 16 Dashboard/Sidebar/landing links pointed at them; deleted, 308ed to their real /qr-tools/* twins, links rewritten. All three verified live post-deploy and the 27 unblocked URLs pushed to IndexNow (HTTP 200). **Audit backlog:** content/E-E-A-T weakest (41) — absolute privacy claim contradicted by About, unsourced 4.9/5 + testimonials, stat counters SSR as literal 0+, no author entity; 6 newest autopilot blog posts 404 while listed in blog index+schema; sitemap lastmod one deploy timestamp on 737/808; /convert/* engines CSR-only; www→apex 307 (owner: permanent redirect in Vercel Domains); PDF417 controls lack label/for. Earlier: Mission 121 (Yandex/GSC audit — self-canonical + favicon-timeout fixes) `41a1130`+`5271e70`+`5f14913` — the Yandex Webmaster export surfaced two invisible ranking killers. **(a) Seven pages canonicalised themselves to the homepage:** `/qr-tools`, `/pdf-tools`, `/image-tools` (the three main hubs, sitemap priority 0.9) plus `/bulk-qr`, `/scanner`, `/url-qr`, `/vcard-qr` all served the homepage `<title>` AND `<link rel="canonical" href="https://qrixtools.com">` — a self-canonical to `/` tells crawlers "I'm a duplicate of the front page, don't rank me", while sitting at the top of the crawl-budget priority list. Cause: each landing page is a `"use client"` component, and a client component cannot export `metadata`, so Next fell back to the ROOT layout's metadata. Fix: a sibling server-component `layout.tsx` per hub exporting its own `pageMeta` (title/description/keywords/canonical) — pages untouched, child routes that already had metadata still override. `/scanner` was a real tool with no metadata → given its own + added to the sitemap. `/url-qr` and `/vcard-qr` were early stubs (a heading, no generator) yet indexed → now 308 to `/qr-tools/url` and `/qr-tools/vcard`; first as page-level `permanentRedirect()` (which prerendered to a `<meta refresh>` HTML page, functional but weaker), then hardened to true edge 308s via `next.config.ts` `async redirects()` with the stub pages deleted. Copy counts are the verified ones (32 QR types, 21 PDF tools). **(b) `/icon` was an edge function timing out at 300s:** Vercel runtime errors flagged `/icon` hitting the 300s ceiling and Yandex reported "favicon not found" — one root cause. `app/icon.tsx`/`app/apple-icon.tsx` rendered a *fixed* icon through `next/og` `ImageResponse` on an edge function for every request; when it stalled the crawler got nothing. Replaced with pre-rendered `app/icon.png` (2 014 B) + `app/apple-icon.png` (Next serves them statically at `/icon.png`, no function, instant), which also corrected the colour — both still drew the retired neon-yellow `#e1ff04` Q instead of brand orange `#ff4d1c`. **Verified live:** all 5 hubs now emit their own canonical + unique title (`curl`-checked); `/icon.png` 200 at 2 014 B and the homepage references `/icon.png?<hash>`; `/icon` 404s as intended (route gone, nothing links it). Also this session: submitted all 801 sitemap URLs to IndexNow (HTTP 200) since Google last read the sitemap at 526 URLs on 17 Jul, and the user re-submitted the sitemap in GSC (now 801) + is setting the Yandex site region to Uzbekistan (37% of traffic). GSC 3-month: impressions 218→362/wk (+66%), avg position ~75 (page 8 — normal for a 1-week-old site), Yandex = 70% of referrers. Earlier: Mission 119 (real multi-file conversion) `0f550a7` — the code gap behind the batch claim M114 had to delete from the RU/UZ convert copy. `AiDropzone` only ever took `files[0]` — from drop, browse **and** paste — and its `<input type="file">` carried no `multiple` attribute, so the batch tool's own "Add multiple images" hint was false: images had to be dropped one at a time. The dropzone now takes `multiple` + `onFiles`, routed through a single `emit()` so drop, browse and paste behave identically; `onFile` stayed optional-but-unchanged for all 25 existing single-file call sites, which still receive `files[0]` exactly as before. `ImageConvertClient` became batch-capable without disturbing the proven single-file flow: `draw()` takes an optional source image, the per-format dispatch moved into a shared `encode()`, and `convertAll()` runs every queued file through the *same* `draw()`+`encode()` the preview used — so the genuine BMP and ICO encoders (M106) and the baseline TIFF encoder (M108) apply in batch too, and TIFF **sources** decode through the same path. One ZIP out; duplicate stems (`photo.png` and `photo.jpg` both landing on `photo.jpg`) are de-duplicated, and unconvertible files are skipped and counted rather than failing the whole run. Preview shows the first file; every setting applies to the whole selection. Lands on all 26 `/convert/<pair>` and 25 `/resize/<preset>` pages plus their RU/UZ twins. No new dependency — `jszip` was already the batch engine's. **Verified end-to-end on production.** The earlier "cannot verify in a browser" note was wrong about the cause: the Browser pane opens at a **0×0 viewport**, so a `dynamic(ssr:false)` tool client never mounts and the page sits on "Loading…" — indistinguishable from a broken feature (M114's log had already recorded this; two false alarms this session came from missing it). One `resize_window {preset:"desktop"}` took `/convert/png-to-jpg` from `clientMounted:false` to a mounted tool at 778×694, and from there: the file input carries `multiple`, feeding it two generated PNGs surfaces "2 files selected" plus a **"Convert all 2 → ZIP"** button beside the untouched single-file "Convert to JPG", and clicking it produced a real `application/zip` of 1,870 bytes with no error and no stuck progress bar (the anchor click was intercepted so nothing hit disk). **Always `resize_window` before asserting a tool is broken.** Earlier: Mission 118 (unknown params must 404, not soft-404 with 200) `f6af795` — **found by a verification step disagreeing with itself.** While waiting for M117 to deploy, `/ru/barcode` already answered 200 — before the hub route existed. It was `app/ru/[tool]` calling `notFound()`, yet the response was HTTP 200 with an empty body: without `export const dynamicParams = false`, Next renders params outside `generateStaticParams` on demand, and that empty result gets prerendered and edge-cached as a 200. Probing found it was **every** programmatic family except barcode, EN included — `/ru/anything-at-all`, `/uz/anything-at-all`, `/convert/nonsense-xyz`, `/resize/9999x9999`, `/downloader/nonsense`, `/blog/nonsense` all 200; only `/barcode/nonsense-xyz` correctly 404'd, because M116 happened to set the flag. That is an unbounded crawlable URL space answering 200 with no content: Google reads it as soft-404, it competes with the ~800 real pages for crawl budget, and any typo'd or guessed link becomes indexable. Fixed on all 20 registry-backed dynamic routes (`3d-tools`, `ai-tools`, `blog`, `compare`, `convert`, `docs`, `downloader`, `help`, `image-tools`, `qr-tools`, `resize`, `video-tools` and the eight `ru`/`uz` twins). Safe because each enumerates a static in-repo registry — POSTS, DOC_PAGES, HELP_CATEGORIES, COMPARES, CONVERT_PAIRS, RESIZE_PRESETS, DL_PLATFORMS, LOC_TOOLS, the tool metas — so there is no runtime CMS and adding an entry already requires a deploy. Deliberately **not** touched: `/pin/[slug]`, `/dashboard/analytics/[slug]`, `/r/[slug]` and `/p/[slug]`, which resolve user-created records at request time and must stay dynamic. ⚠️ **Verification lesson worth keeping:** an HTTP 200 is not evidence a page shipped. The background watcher for M117 exited early because `/ru/barcode` returned 200 — from the soft-404, not the new hub. Poll for a **content marker** (`hrefLang="ru"` in the EN page's head, a localized `<h1>`, the sitemap count), never a status code. Earlier this session: Mission 117 (RU/UZ hub for `/barcode` + 3-level localized breadcrumbs) `8d77ef9` — M116's 26 localized symbology pages had an EN-only parent, so the breadcrumb and the "all 13 types" link both dropped the visitor into English. `BARCODE_HUB` in `lib/hub-i18n.ts` is written as a **chooser rather than a list of links**: each child page owns a narrow query ("генератор pdf417"), but none can own the head term ("генератор штрих кодов" / "shtrix kod generatori") or the comparison intent that brings most of this traffic — someone who knows they need a barcode but not which symbology — so the sections are grouped by where the code is physically used (checkout, warehouse, tiny part, ticket) and the explainer answers "which one do I pick". `LocalizedHub` gained a third `kind` off a `HUB_COPY`/`SECTIONS` lookup instead of a widening ternary, and families are unioned with `BARCODE_FAMILIES` so a future family is appended rather than silently dropped. Child pages' breadcrumbs — visible and JSON-LD — now read Home › Штрих-коды › Type and point at the localized hub. Copy claims were checked against `BarcodeClient` **before** being written: batch mode is real (one value per line), and the FAQ names exactly the four symbologies that auto-append a check digit. Verified live: both hubs serve localized title/h1/canonical, 4-way reciprocal hreflang, ItemList + BreadcrumbList + FAQPage JSON-LD and all 13 child links; sitemap 801. Earlier: Mission 116 (RU/UZ twins for all 13 barcode symbologies) `bb3ef01` — M113 split `/barcode` into 13 per-symbology pages but left them EN-only, while Yandex is the site's #1 referrer and "генератор pdf417" / "штрих код ean 13 создать" / "shtrix kod generatori" have real volume against almost no local competition. 26 pages at `/ru|/uz/barcode/<type>` on the **same real `BarcodeClient`** (via the `initialFormat` prop M113 added), same shape as `LocalizedConvertPage` / `LocalizedResizePage`. `lib/barcode-types-i18n.ts` holds written facts per format in both languages rather than translations of the EN copy — Aztec's stepped centre bullseye is the finder pattern, which is *why* it needs no quiet zone and wins 20–30% of the space on a narrow ticket; PDF417's name encodes its 4-bars-4-spaces-17-modules codeword, which is why it looks like a squashed ladder a laser scanner can read; an EAN prefix marks where the number was **registered**, not where the goods were made (prefix 50 = GS1 UK registration, not British manufacture); Pharmacode is a binary number drawn as bars, carrying no text and no check digit at all. Two own FAQs per format + three shared trust FAQs (free? data uploaded? PNG or SVG for print?), and the "what to type" step is composed per symbology kind. **The one thing caught before shipping:** that numeric step promised "контрольная цифра добавляется автоматически" — but only EAN-13/EAN-8/UPC-A/ITF-14 carry `fixedLen` in `BarcodeClient` and get a check digit appended; ITF, MSI and Pharmacode get none, so the claim would have been false on 6 live pages. Split into `numericChecked` vs `numeric`, and every other checksum sentence in the file was audited against the client (MSI/Codabar/Pharmacode copy already correctly says they have no built-in checksum). This is the M114 false-batch-claim trap caught **pre-deploy** rather than after 40 pages were live — the audit item in BACKLOG is what made it a habit. `LOC_BARCODE_TYPES` is derived by filtering `BARCODE_TYPES` through the copy table, so a symbology without localized copy can never be routed, sitemapped or linked to a 404; EN pages now declare `ru`/`uz` alternates so hreflang is reciprocal 4-way; sitemap 799 verified live. Known gap, queued as the top NOW item: `/barcode` has no RU/UZ hub, so these 26 pages have an EN-only parent, 2-level breadcrumbs, and an "all 13 types" link that leaves the language — exactly the gap M115 just closed for resize/convert. Earlier this session: Mission 115 (RU/UZ hubs for `/resize` and `/convert`) `c868e65` — the 50 localized resize presets (M111) and 40 localized converter pairs (M106/M114) had an EN-only parent, so every breadcrumb and "all sizes / all formats" path dropped a RU/UZ visitor into English. Four hubs off one shared `components/LocalizedHub.tsx`, each carrying the head term its children structurally cannot target ("конвертер изображений", "rasm o'lchamini o'zgartirish"). `lib/hub-i18n.ts` copy is written for RU/UZ intent rather than translated from the EN hub, because that traffic arrives from document-photo and print queries far more than EN does. Convert sections self-defend against a new target format being forgotten (the same guard the EN hub got in M114), cards link only `LOC_*` entries so a preset or pair without localized copy can never be linked to a 404, and the child pages' breadcrumbs now **name and point at** the hub instead of self-referencing, giving both families a real 3-level trail. All four URLs verified 200 live. Earlier: Mission 114 (TIFF converter pairs + client-side TIFF decoder) `738713f` (decoder in `feffe5d`, see hazard note below) — closes the gap M108 left flagged: `*-to-tiff` worked but `tiff-to-*` was impossible because no browser can load a `.tiff` into an `<img>`. Six new pairs at `/convert/{tiff-to-png,tiff-to-jpg,tiff-to-webp,png-to-tiff,jpg-to-tiff,webp-to-tiff}` with RU/UZ twins = 18 URLs, sitemap 769. The pages were the easy half; the decoder was the mission. `lib/tiff-decode.ts` adds **UTIF** (MIT, ~58 KB) — a hand-rolled baseline decoder was considered and rejected because real-world TIFFs are overwhelmingly LZW/Deflate-compressed, so baseline-only support would reject most files users actually own. It is `await import()`-ed, and the deployed chunk was inspected to confirm UTIF appears in **no** eager chunk, so users who never touch a TIFF pay zero bytes. **The important part is what it refuses.** TIFF is a container, not a codec, and UTIF's `_decompress` has no branch for compression 2 (CCITT Huffman) or 32946 (Adobe Deflate) — it falls through to `log("Unknown compression")` leaving a zero-filled buffer — and it returns scrambled pixels for JPEG-in-TIFF, WebP-in-TIFF and tile-based layouts. All of those decode to *plausible-looking garbage rather than an error*, which is the exact bug class as the BMP/ICO "PNG bytes with a lying extension" fix (M106) and the fake-TIFF encoder fix (M108). So `assertDecodable()` checks the Compression (259) and TileWidth (322) tags **before** decoding, against an allowlist of only what was verified pixel-exact against libtiff (1, 3, 4, 5, 8, 32773), and anything else throws a `TiffUnsupportedError` naming the codec and telling the user to re-save as LZW. Multi-page scans (fax/scanner output) get a page selector that re-decodes on demand from the retained buffer. Verified rather than assumed, with a 29-assertion Node suite round-tripping sharp/libtiff-written files against source pixels: LZW, Deflate, PackBits, uncompressed, CCITT G4, multi-strip, odd widths (37×23), RGBA alpha, 16-bit and grayscale all `maxErr=0`; JPEG/WebP/tiled/CCITT-Huffman/Adobe-Deflate/truncated/non-TIFF all refused; a hand-built 2-page IFD chain returns the right count and distinct pages; and the M108 encoder's own output round-trips exactly through the new decoder. Two bugs the suite caught that would otherwise have shipped: `utif` is CommonJS, so `await import("utif")` yields a namespace whose `.decode` is undefined — the original `try/catch` swallowed that `TypeError` and reported every valid TIFF as "corrupted" (now unwrapped via `.default` with an explicit check); and the initial allowlist trusted compressions 2 and 32946 that UTIF silently blackens. Two more found while wiring: the `/convert` hub groups by target format from a hardcoded `ORDER` array with no `TIFF` entry, so the three `*-to-tiff` pages would have shipped **orphaned with no link from the hub** (added, and the grouping now appends any target `ORDER` forgets rather than dropping it); and the RU/UZ pair template promised batch conversion — "перетащите несколько файлов" / "bir nechta faylni tashlang" — in both body copy and an FAQ, on all 40 live localized pages, when `AiDropzone` has never accepted more than one file. That false claim is now replaced with accurate copy and a mobile FAQ that is true, and "wire real multi-file conversion" plus "audit every localized template for unsupported claims" are queued in BACKLOG. Live-verified: all 18 URLs 200, unique titles/h1/body, 4-way hreflang, correct self-canonical, SoftwareApp + BreadcrumbList + HowTo + FAQPage JSON-LD, hub linking all three `*-to-tiff` pages, TIFF guard strings present in the deployed component chunk; IndexNow 200 for all 769 URLs. ⚠️ **Browser-verification note:** the in-app Browser pane reported `Viewport: 0x0` for every tab in this headless run, so lazy `dynamic(ssr:false)` tool components never mounted and `document.querySelector('input[type=file]')` returned 0 on *production pages known to work*. That is an environment limitation, not a page defect — do not diagnose it as broken hydration; verify shipped client code by fetching and grepping the deployed chunk instead. ⚠️ **Shared-worktree hazard (same one M113 hit, from the other side):** the concurrent session's `git add` swept this mission's `lib/tiff-decode.ts`, `types/utif.d.ts` and the `utif` dependency into **its** commit `feffe5d` ("feat(barcode)…"), so that message understates its contents. History was deliberately **not** rewritten — another session was actively committing to the same branch. Use `git commit -- <paths>` in this worktree. Earlier: Mission 113 (per-symbology barcode landing pages) `feffe5d` — `/barcode` was holding all 13 formats behind ONE url, so every format-specific query had nothing to rank: "pdf417 generator", "aztec code generator", "data matrix generator", "code 39", "itf-14", "codabar" and the rest all pointed at a single generic page. Split into a programmatic family the same way `/convert/<pair>` (M106) and `/resize/<preset>` (M109–111) were. `lib/barcode-types.ts` is the registry — 13 entries grouped into four families (2D codes · Retail · Logistics · Industry), each carrying hand-written copy for that one symbology rather than a filled-in template: EAN-13 explains that the thirteenth digit is never drawn as bars but encoded in the parity pattern of the left-hand group; ITF-14 explains bearer bars and why the symbol is engineered for flexographic printing on corrugated board; Interleaved 2 of 5 explains the truncation hazard that follows from every even-length substring being structurally valid; Pharmacode explains that it is a binary number, not a character encoding, and why it is printed in non-black colours; Codabar explains its A/B/C/D start-stop characters as application-level record typing; PDF417 explains the 4-bars-4-spaces-17-modules structure its name comes from. `app/barcode/[type]/page.tsx` renders them as SSG (`dynamicParams=false`) with SoftwareApp + BreadcrumbList + HowTo + FAQPage JSON-LD, and embeds the **same real `BarcodeClient`** through a new optional `initialFormat` prop that preselects the symbology — no second implementation and no mock, matching the pattern that keeps these families from being thin. The `/barcode` hub now lists all 13 grouped by family and every page cross-links its siblings. Sitemap +13, search-index +13. Verified before shipping rather than assumed: all 13 routes 200 with unique titles and both JSON-LD blocks; `/barcode/pdf417` preselects PDF417 and draws a real 528×192 symbol on the visible canvas; `/barcode/code-39` preselects Code 39 (input pre-filled `QRIX-39`), keeps the 2D canvas `hidden` and renders JsBarcode bars instead — the differential proving the 2D/1D branch is driven by the route. ⚠️ **Verification trap worth remembering:** `document.querySelector("canvas")` on any QRix page returns the site-wide `DotDistortionBackground` canvas (`fixed inset-0 -z-10`), not the tool's. An earlier "PDF417 renders live" check in this session measured that background layer and proved nothing; always filter to the canvas whose ancestor is not the `-z-10` layer. ⚠️ **Shared-worktree hazard:** a second Claude session was building a TIFF decoder in this same worktree, and because it had already staged its files, `git add <my six paths>` + `git commit` swept `lib/tiff-decode.ts`, `types/utif.d.ts` and a new `utif` dependency into this commit. The committed blobs match the working tree and `tsc --noEmit` is clean, so the build is unaffected — but use `git commit -- <paths>` here, never `git add` then `git commit`. Earlier: Mission 112 (2D barcodes + promo-video media layers) `5868d1f`+`858ba22` — two feature requests off one user message. **(a) PDF417 / Aztec / Data Matrix** added to the Barcode Studio (`components/BarcodeClient.tsx`), taking it from 10 → 13 formats: the `Format` type gained `twoD` + `bcid`, three 2D entries route to **bwip-js** (browser build has `toCanvas`/`toSVG`; `bwip-js.d.ts` declares the module for tsc) while the existing 10 1D formats stay on JsBarcode; a `canvasRef` renders the 2D symbol, validation is bypassed for 2D (any text/URL is valid), and PNG/SVG single + bulk export all branch on `format.twoD`. Both preview nodes stay mounted and toggle via `hidden` so refs never detach. `app/barcode/page.tsx` metadata/FAQ rewritten for "13 barcode types" incl. a "what is PDF417 used for" FAQ (driver's licenses, boarding passes, shipping labels). **(b) Promo Video Maker media layers** (`components/PromoVideoClient.tsx`): a **background photo** slot (cover-fit with a slow Ken-Burns zoom `1.06→1.12` + auto light/dark scrim so headline copy stays legible) and a **timed overlay image** that appears only inside a chosen window — a 9-dot position grid (where), a size slider 15–80% (how big), and Appears-at / Disappears-at sliders shown in seconds (when), with a pop-in + cross-fade, rounded corners and drop shadow; both bake straight into the exported MP4/WebM, nothing uploaded. Position grid + size/time sliders only render once an overlay is present. Verified live rather than assumed: `/barcode` PDF417 renders on production (canvas 719×690, 49 611 dark samples, Aztec + Data Matrix chips present) and `/promo-video` serves all four new controls ("Background photo", "Overlay image", "Upload background", "appears during the video"), tsc clean, zero console errors. Earlier this session: Mission 111 (RU/UZ resize-preset twins) `bc0b396` — 50 localized pages at `/ru/resize/<size>` and `/uz/resize/<size>`, doubling the M109/M110 resize family into the two markets that already send most of our referred traffic. `lib/resize-presets-i18n.ts` carries hand-written copy for all 25 presets in both languages — what each size actually is and where it is used, its specific caveat (upscaling limits, aspect-ratio loss, DPI, platform UI overlays), and two size-specific FAQs each — composed at render time with an orientation-aware fill-vs-fit explanation (landscape / portrait / square variants) and three shared closing FAQs, so no page is a template of another. `components/LocalizedResizePage.tsx` mirrors the proven `LocalizedConvertPage` shape and embeds the SAME real `ImageConvertClient` through the existing `resize:<w>x<h>` engine — no second implementation, no mock. hreflang is now reciprocal: the EN `/resize/[preset]` page declares `ru`/`uz`/`x-default` alternates, which it did not before. Sitemap 738 URLs (+50), four high-intent localized entries added to `lib/search-index.ts` (35×45 mm document photo RU+UZ, 1920×1080 RU+UZ, 10×15 cm print RU). Verified live rather than assumed: 7 URLs spot-checked 200 across both languages, `/ru/resize/413x531` confirmed to serve a localized `<title>`, a 4-way hreflang block, the correct self-canonical, unique Russian body copy and the full SoftwareApp + BreadcrumbList + HowTo + FAQPage JSON-LD set. All 738 sitemap URLs resubmitted to IndexNow (HTTP 200). **Known gap: the `/resize` hub is still EN-only**, so these 50 pages have an unlocalized parent — queued as the next NOW item. Also shipped this session: `5c1d23c`, premium control surfaces for the QR Art and Promo Video makers (shared `.qx-tool-card` / `.qx-tool-in` / `.qx-chip2` / `.qx-tool-badge` / `.qx-tool-preview` classes in `app/design-v2.css`, light-mode variants included) — this was finished work found uncommitted in the worktree, typechecked and landed rather than left dirty. Earlier: Mission 110 (resize presets batch 2) `2a97426` — 9 more presets in `lib/resize-presets.ts`, bringing the family to 25 presets / 26 URLs: 1080×1920 vertical 9:16, 1600×900, 1920×1200 (16:10 WUXGA), 1024×1024 (app-icon / AI master), 2048×2048, 300×300, and three more 300-DPI print sizes — 8×10 inch (2400×3000), A5 (1748×2480) and A3 (3508×4961). Copy-only: because M109 put the sizes in a registry and the pages read `resize:<w>x<h>` from it, the hub grouping, sitemap, search index and JSON-LD all picked the new entries up with no code change. Validated by script before shipping — 25 unique titles, descriptions, h1s and bodies, no slug collisions, every body over 100 words with 5 FAQs and a 3-step HowTo. Earlier: M109 (resize-preset pages) `7d9e5e5` — `/resize` hub + 16 `/resize/<size>` SSG pages driven by `lib/resize-presets.ts`. Rather than add a second preset table, `ImageConvertClient` gained a generic `resize:<w>x<h>` engine (`parseResize()`) that synthesises a one-off preset, so these pages reuse the same proven fill/fit + background-colour sizing UI the `social:` engine already used; `ImageEngineRegistry` routes the new prefix. Four groups — displays (1920×1080, 1280×720, 3840×2160, 2560×1440, 800×600, 1024×768), web/OG (1080×1080, 1200×630, 400×400, 500×500, 200×200), 300-DPI print (4×6, 5×7, A4) and ID (US passport 600×600, 35×45 mm 413×531). These target size-intent queries ("a4 size in pixels", "passport photo size") that the platform-named social pages at `/image-tools/<slug>` do not serve, so the two families do not cannibalise each other. Registered in sitemap (17 URLs), `lib/search-index.ts`, TopNav and `llms.txt`. Earlier: M108 (real baseline TIFF encoder) `b4594b3` — `/image-tools/convert-to-tiff` was shipping PNG bytes under a `.tiff` name because `canvas.toBlob()` has no `image/tiff` codec and silently falls back to PNG (identical bug class to the BMP/ICO fix in M106). `encodeTiff()` in `components/image/ImageConvertClient.tsx` now writes a real little-endian baseline TIFF — 8 bits/sample, single uncompressed strip, RGB when the image is opaque and RGBA + `ExtraSamples=2` when it carries alpha. Verified by extracting the shipped function, transpiling it and decoding its output with sharp/libtiff: exact pixel round-trip at 3×2 (odd width, catches row-padding assumptions), 4×4 with alpha, and 640×480, plus direct IFD asserts (ascending tag order, `Compression=1`, `Photometric=2`, strip/resolution tags, terminating next-IFD pointer). Confirmed live in the deployed chunk. **Note for the tiff-to-\* pair family: browsers cannot decode TIFF into an `<img>`, so `*-to-tiff` works but `tiff-to-*` needs a baseline TIFF decoder written first.** Earlier: M106 (converter-pair pages) `f776952`. Earlier: M105 `228a91c`, M104 `4b0505c`, M103 `06291e7`, M102 `0dc4307`, M101 `33ba2c8`. Earlier: M100b `b5fcde2`, M100 `f126775`, M99b `82ae0db`.

## Current Git Branch
`design-v2` — **this is Vercel's production branch**: `origin/main` and `origin/design-v2` are the same commit; a push to either deploys qrixtools.com. (The local `main` ref in a worktree can be stale/behind — `git fetch` first; `origin/main` is the source of truth.)

## Important Notes
- Local machine low-RAM: `next build` may OOM at trace step; code is fine, verify via `tsc --noEmit` + preview server. Vercel builds clean.
- **The in-app preview server runs from `D:\Projects\QRix` (the primary dir), NOT from a `.claude/worktrees/*` worktree.** Routes that exist only on the worktree branch return 404 there and it looks like your route is broken — it isn't. Verify worktree work with `tsc --noEmit` + node-level unit checks, then push and curl production.
- Preview/connector-status tools are fully built UI; activate with env vars only.
- Mock backend: in-memory store resets on dev HMR/restart — expected; switches to Postgres via DATABASE_URL.
- Admin access: emails in `ADMIN_EMAILS` (default musarasulzada@gmail.com); sign in at `/admin` via magic link (console email driver logs the URL in dev).

## Known Limitations
- S3/Supabase storage drivers are wired stubs — env keys switch them on, real API calls need finishing when keys exist. (AI providers are REAL since Mission 7 — any `<PROVIDER>_API_KEY` goes live instantly.)
- AI provider health/stats are in-memory (reset on deploy); persist to Redis/DB when those drivers go live.
- Mock billing activates plans instantly (no real charge) until Stripe keys are set.
- Reviews table needs Supabase migration (falls back to localStorage).
- **Nav bar overflows in ru/uz between ~1280–1360px** — ten Cyrillic top-level labels need ~1500px and the bar caps at 1400. Pre-existing; Mission 75 shrank it (~330px → 77px) but the real fix is structural: group the six tool categories under a single "Tools" dropdown.

## Next Recommended Mission
Go-live for monetization: apply for AdSense (content now sufficient) + add Stripe live keys, deploy to Vercel with real env (Postgres + Stripe + Resend). Then roadmap: mediabunny Video Tools upgrade → promo-video generator tools → mascot promo films (Remotion skills active).

## Mission 120 — the claim audit (Jul 22)
Closed the "audit every localized template" item by checking each promise
against the code that has to keep it. Six claims were false and are now fixed:
PDF compress promised lossless compression and in-browser privacy (it is a
lossy server route), PDF→Word promised in-browser conversion (server provider
chain), the upscaler promised detail restoration (bicubic + unsharp mask),
OCR promised 100+ languages (four), the resize hub promised format
preservation (everything came back JPG), and the EN/RU/UZ downloader
templates promised video+audio+image on all 16 platforms. The format promise
was fixed in the code rather than the copy: PNG→PNG, WebP→WebP, and fill mode
no longer flattens alpha. Downloader templates now derive their format
sentence from each platform's real kinds via deliverables()/formatPhrase().
Verified live by curl on 10 URLs across three languages.

Discovered: the preview dev server runs from the primary checkout on `main`,
so every route this worktree has added 404s locally, and the live site's tool
clients don't mount in the in-app browser — client-side behaviour has been
shipping on typecheck plus curl alone. That is now the top NOW item.

## Mission 122 — canvas output rules made testable; two more format bugs found

Closed the verification item open since M120. The 0x0 preview trap had a
one-word cause: `resize_window {preset:"desktop"}` answers "reset to NATIVE
size", and on a worktree dev server native IS 0x0, so the preset was a no-op.
Passing explicit `{width:1280,height:900}` sets a real viewport and React
hydrates — /image-tools/exif-remover went from vw:0 with no controls to a
mounted file input and download button. That is only half a win, and the
limit is measured: on engine-registry pages the page hydrates at 1280 (the
"Loading the image workspace…" fallback is in the DOM) but the
`dynamic(ssr:false)` chunk never resolves in the pane, so convert/resize/
batch/upscale still cannot be driven end to end. Re-opened as its own NOW
item rather than recorded as solved. Also: `body.innerText` returns ~126
chars in the hidden pane whatever the page holds — assert on the DOM.

The decision half no longer needs a browser at all: keepFormat, keepsAlpha,
paintsBackground, flattensToWhite and drawRect moved out of ImageConvertClient
into lib/image-output.ts, with scripts/test-image-output.mjs asserting the
shipped module (`npm run test:image`, 23 assertions, Node 24 type-stripping so
there is no copy to drift). Proven able to fail: reintroducing the always-jpeg
bug reds 6, fill-mode alpha flattening 2, fit/fill swapped 3. The real
drawImage/toBlob half was proven in the browser pane instead of jsdom, which
has no true codec — a transparent source drawn fill-mode into 1080x1080 keeps
centre alpha [0,0,0,0] through a real PNG encode+decode round-trip.

Extracting it turned up two more live instances of the same bug class the
audit had missed. ExifCleanerClient hardcoded png-or-jpeg, so a WebP came back
a JPG and a transparent source encoded black. ImageBatchClient forced
image/jpeg for the compress preset but painted white only `if (fmt==="jpeg")`,
and fmt defaults to "webp" with no picker on that path — so every transparent
PNG batch-compressed to a JPEG with a black background. Confirmed by running
the old path in a real browser: [0,0,0,255] in the transparent region, white
after the fix. Both now share the extracted helpers.

## Mission 123 — the preview pane, actually fixed

Two sessions blamed `dynamic(ssr:false)` for canvas engines never mounting in
the browser pane. It was never the lazy chunk. Instrumenting instead of
guessing turned up two unrelated traps stacked on each other, and the leading
hypothesis (`dynamicParams=false`, added in M118) was refuted by experiment
before any fix was written.

First: `preview_start` serves the PRIMARY checkout, not this worktree. That
checkout has no app/convert, app/resize, app/downloader, app/image-tools/[slug]
and no lib/image-tools-meta.ts at all, so every design-v2 route 404s locally
while returning 200 in production — while a stale untracked
app/image-tools/exif-remover/ still sits there, which is exactly why that one
page appeared drivable and every registry page appeared broken. Proof: neither
generateStaticParams nor the page body ever ran. The port-3001 worktree launch
config added in M120 was never actually exercised; it works.

Second, and the real one: the pane runs the tab with visibilityState "hidden",
and browsers don't run requestAnimationFrame for a hidden document (timers
still run). React 19 gates its streaming-Suspense reveal on rAF — `$RC` refuses
to reveal until `typeof $RT === "number"`, and `$RT` is only ever assigned
inside a rAF callback. So any route slow enough to flush the loading.tsx
fallback deadlocks permanently: the real content stays parked in
`<div hidden id="S:0">`, nothing inside it mounts, and `body.innerText` stays
~126 chars no matter what the page contains — which retroactively explains the
M122 "126-char mystery" that had been written off as a pane quirk.

Unblocking it is three lines (polyfill rAF onto timers, seed `$RT`, flush
`$RB`), now in growth/PREVIEW_VERIFICATION.md along with both traps and the
blob-capture trick for reading a tool's output. Measured on
/image-tools/batch-compress and reproduced on /convert/png-to-webp:
scrollHeight 900→2081/2099, file inputs 0→1, innerText 126→1710/2770, fallback
gone. Then driven end to end for the first time — a DataTransfer-injected file
surfaced the real Quality and "Process 1 → ZIP" controls, and clicking through
produced a genuine application/zip (PK magic, 918 bytes).

No production code changed: a real user's tab is visible, so the deadlock is
pane-only. Driving the tool did surface a live false claim — the shared
baseFaq() promises "results download as high-quality PNG" while the compress
preset writes a JPEG (transparent.jpg, JFIF header confirmed inside the ZIP),
on every image tool that doesn't emit PNG. Filed as the next NOW item.

## Mission 124 — the format claims, and two engines that broke them

M123's unblocked preview pane paid for itself on its first real use. Driving
batch-compress end to end returned `transparent.jpg` while the shared FAQ
promised "results download as high-quality PNG" — so the claim was false on
every tool in the registry that doesn't encode PNG. Auditing what each engine
actually writes turned up two more live instances of the M120 bug class.

`batch:resize` was converting every image to WebP. `fmt` defaults to "webp"
and its picker only renders for the convert preset, so resize was reading a
value that was never meant for it — precisely the bug M120 fixed inside
ImageConvertClient and never carried across to the batch engine. It now
resolves per file through keepFormat(), so a transparent PNG stays a PNG.
`meta:remove` and `meta:exif` hardcoded image/png, so a JPEG came back as a far
larger PNG and a WebP lost its format — the bug M122 fixed in ExifCleanerClient
without noticing this registry twin. Both paths now share keepFormat() and
flattensToWhite(), so a transparent source can no longer encode black.

Verified by magic bytes out of the real ZIP rather than by reading the code:
two files in, `logo.png` -> 89 50 4e 47 and `photo.jpg` -> ff d8 ff e0. Both
came back `.webp` before the fix.

The format FAQ is now derived once from each tool's engine instead of a shared
constant pasted at 30 call sites — compress says JPG, resize says the format is
kept, rename says nothing is re-encoded (it zips the original File untouched),
passport says JPG, the colour tools say HEX/RGB text, and the PNG-encoding
fx/transform/overlay/layout tools keep the lossless-PNG sentence. A tool added
later inherits an accurate sentence instead of a wrong one, and the FAQ JSON-LD
follows automatically. Quality also renders for resize now; it had been applying
there silently while the control stayed hidden.

npm run test:image is 30/30, up from 23. The 7 new assertions check the copy
against what each client encodes and fail 4 when fmtAnswer is reverted to the
old always-PNG string. Live on 5 spot-checked URLs; IndexNow 200 for all 82.

## Mission 125 — the buttons the localized copy was pointing at

The RU/UZ sizing copy names its controls literally — "switch to «вписать»",
"«to'ldirish» crops the sides" — 8 Russian and 13 Uzbek mentions across 50+
pages, while ImageConvertClient rendered the buttons as English fill/fit. The
copy was instructing readers to click something that wasn't on the page.

ImageEngineRegistry now threads an optional `lang` into the sizing/convert
engine and nothing else: it is the only client whose controls the copy names
out loud, and widening it further would be churn. The labels are display-only —
mode values stay "fit"/"fill", so lib/image-output.ts and its 30 assertions are
untouched. The background-colour aria-label, the quality label and the primary
action are localized on the same pages.

Verified by driving production in a real browser rather than by reading the
diff: qrixtools.com/ru/resize/1080x1080 renders Заполнить · Вписать · Изменить
размер, and the uz twin To'ldirish · Sig'dirish · O'lchamni o'zgartirish.
Worth recording for next time — the engine chunk is dynamic(ssr:false), so it
never appears in the initial HTML and grepping HTML-linked chunks cannot prove
it shipped; the page has to be driven.

## M126 — usecase-content.i18n.ts claim audit (Jul 22)

Audited the largest programmatic copy file in the repo (9,228 lines: 14 use
cases × 15 languages) by checking each claim against the engine it describes,
not by reading it through. Three claims were false in every language, and
chasing one of them surfaced a silent corruption bug that had nothing to do
with copy.

**The copy.** compress-pdf-for-email asserted on-device processing five times
over — metaDescription, intro, a benefit, a step, and the lead FAQ answering
"Is my document uploaded to a server?" with "No". CompressPdfClient POSTs the
file to /api/pdf/compress unconditionally; there is no browser path. The tool's
own page said "Upload a PDF" and was fine, so the lie lived only on the pages
built to rank. Rewritten to what the route does (server-side because it
re-encodes embedded images, memory-only, no fs or storage call anywhere in it,
discarded after the response). The shared "Free · on-device · no signup" badge
was rendering there too; UseCaseSeed gained `onDevice` and freeLabel() drops the
middle segment — every localization is authored as three ` · ` segments, so all
15 stay grammatical without a new translated string.

Checking the "only your device's memory" file-limit answer against production
found a harder problem: 4.19 MB uploads, 4.4 MB comes back 413 at the edge
before the route runs. A 413 body isn't JSON, so `err.message` was undefined and
the user saw "Compression failed" with no reason — on the page whose headline
promise is getting a 25 MB attachment under Gmail's limit. Added a pre-upload
guard with a split→compress→merge workaround and an inline warning on file pick.
The real fix (a client-side path so big files work at all) is queued in NOW.

The review-poster page promised a logo upload PosterMakerClient doesn't have.
Answered honestly and pointed at the QR generator, which does support logos.

**The bug.** The WiFi page claimed hidden-SSID support that didn't exist. Adding
it exposed that both WiFi builders — plus the homepage's inline one — built
payloads by raw interpolation, so any reserved character truncated the field:
password `pa;ss` shipped as `...;P:pa;ss;;` and parses as `pa` + junk. The code
renders, scans, and simply fails to connect, which is why it survived. QRix's
own decoder read `/P:([^;]*)/` and truncated the same way, so the round trip was
self-consistently wrong and looked correct from inside. Now escaped per spec in
both directions, `H:true` shipped, and open networks omit the password field
instead of emitting an empty `P:`. The calendar payload got the same treatment:
the description field and real start/end times its copy had promised, RFC 5545
escaping, and `VALUE=DATE` so date-only events stop being invalid DATE-TIMEs.

Extracted to lib/qr-payload.ts with scripts/test-qr-payload.mjs (npm run
test:qr) — 21 assertions against the shipped module, mutation-verified: drop
the escaping and 4 fail, drop H:true and 2 fail. Same pattern as
lib/image-output.ts, and for the same reason: a payload bug is invisible to
tsc and to anyone looking at the rendered QR.

Verified live on production. Claims deliberately left alone because they hold:
remove-bg is genuinely on-device (@imgly) and does offer white backgrounds, SVG
export exists for the print claims, vCard carries title/URL/org, the Instagram
tool takes a username, fill-and-sign never touches the network, and all 14 CTAs
resolve (two via 301 — queued).

Files: lib/qr-payload.ts (new), scripts/test-qr-payload.mjs (new),
lib/qr-types.ts, lib/usecase-content.ts, lib/usecase-content.i18n.ts,
components/QRGenerator.tsx, components/QrDecodeClient.tsx,
components/CompressPdfClient.tsx, app/page.tsx, app/use/[lang]/[slug]/page.tsx,
package.json. Branch design-v2.

## M127 — PDF compression moved into the browser (Jul 22)

The tool could not do the job its funnel page is built to sell. The page targets
"my PDF is too big to email" — files well over 25 MB — and the client POSTed to
/api/pdf/compress, which the platform rejects above ~4.5 MB at the edge. The one
file shape the page ranks for was the one shape guaranteed to fail. M126 made the
copy honest about that; this removes the limit instead.

lib/pdf-compress.ts walks the indirect objects and re-encodes each DCTDecode
image XObject through an injected encoder, writing it back as a properly formed
stream — /Length /Width /Height /BitsPerComponent /ColorSpace /Filter updated to
describe the new bytes, /Decode and /DecodeParms dropped. Text, vectors, links
and form fields are never touched. Left alone deliberately: /ImageMask stencils
(1-bit; JPEG has no 1-bit mode), anything but a lone /DCTDecode, images under
3 KB, and any ref used as an /SMask — those are grayscale by spec and an RGB
JPEG in that slot paints the image as noise. Per image the result is kept only
if it is genuinely smaller and its SOF header reports 1 or 3 components; a whole
re-save that comes out bigger returns the original file.

The encoder is an argument, not an import, so the module is free of both DOM and
Node APIs: the browser passes lib/pdf-compress-canvas.ts, the suite passes sharp,
and both exercise identical object surgery. npm run test:pdf — 26 assertions,
output validated with pdf.js (a strict parser that is not the one that wrote the
file) and every re-encoded image decoded again to prove its dict matches its
bytes; a broken PDF compressor looks exactly like a working one, and a truncated
file scores a fantastic saving.

The old route was the proof of that: it scanned raw bytes for FF D8 FF and
spliced in re-encoded JPEGs of a different length, leaving every /Length and
every xref offset after the first image wrong. Readers rebuild a damaged xref
silently, so it opened. The route now runs the same shared code with sharp.

Verified in the pane (rAF unblock per growth/PREVIEW_VERIFICATION.md): 0.58 MB →
0.09 MB, 85%, %PDF-1.7; feeding the output back in re-parses and correctly says
"Already optimized"; zero requests to /api/pdf/*.

Copy: M126's honesty rewrite reverse-applied, restoring the same 98 translated
strings in 14 languages rather than re-translating. EN keeps what M126 got right
and gains a fourth FAQ for the text-only PDF that barely shrinks. The tool's own
page had no JSON-LD and no FAQ section at all (the shell renders faqs; the page
passed none) — added SoftwareApp + Breadcrumb + HowTo + FAQ. RU/UZ twins at
/ru/compress and /uz/compress rewritten with a size-limit FAQ each.

Files: lib/pdf-compress.ts (new), lib/pdf-compress-canvas.ts (new),
scripts/test-pdf-compress.mjs (new), components/CompressPdfClient.tsx,
app/api/pdf/compress/route.ts, app/pdf-tools/compress/page.tsx,
lib/localized-tools.ts, lib/usecase-content.ts, lib/usecase-content.i18n.ts,
package.json. Branch design-v2.

## M128 — the trust strip stopped claiming what the engine doesn't do (Jul 22)

ToolPageShell rendered six hardcoded trust points on every tool page. Two of
them are claims about where the work happens — "Private by design: runs in your
browser; files never upload" and "Instant: no queue, no waiting on a server" —
and nothing derived them, so they appeared identically on a canvas tool and on
one that POSTs the file. This is M126's bug class (copy that outlived its
engine) at site scale rather than page scale.

The shell now takes `processing` ("device" | "cloud", default "device"), splits
the always-true claims into WHY_SHARED and swaps only the two that can be false.
Cloud reads "Not stored — sent over HTTPS to be processed, then discarded" and
"Nothing to install — the heavy conversion runs on a server".

Switched: /pdf-tools/pdf-to-word (the Adobe/Aspose/CloudConvert chain; its About
text now says it converts server-side) and /3d-tools/image-to-3d (posts the
image to /api/v1/3d; only the fallback preview is local). LocalizedToolPage had
the same lie in RU/UZ — "Бесплатно · в браузере · без регистрации" on every
localized tool — fixed with the same three-segment drop used by freeLabel(),
driven by a new LocTool.onDevice. The downloader FAQ's "Everything runs in your
browser" contradicted its own Privacy paragraph and was corrected.

Verified locally: pdf-to-word renders "Not stored" and no longer "files never
upload"; /ru/pdf-to-word reads "Бесплатно · без регистрации"; /pdf-tools/compress
still claims on-device, which M127 made true.

Left for a queued item: the AI pages are genuinely on-device today because
isAiEngineLive() is false, but the flag has to be bound to the connector before
NEXT_PUBLIC_AI_ENGINE is ever set.

Files: components/ToolPageShell.tsx, components/LocalizedToolPage.tsx,
lib/localized-tools.ts, app/pdf-tools/pdf-to-word/page.tsx,
app/3d-tools/[slug]/page.tsx, app/downloader/page.tsx. Branch design-v2.

## M129 — vCard + MECARD payload escaping (Jul 22)

The half M126 left behind, and the worse half. vCard's N and ADR are structured
properties: their components are separated by `;`, so an unescaped separator
inside a value does not truncate the field, it shifts every later component up a
slot — a surname of "Berg; Jr" pushed the given name into additional-names. A
comma is the list separator, so an ORG of "Acme, Inc." imported as two
organisations, and a newline in the address escaped the property entirely.
Everything scanned perfectly the whole time.

buildVCard / buildMeCard / escapeVCard / readVCardField now live in
lib/qr-payload.ts alongside the WiFi and iCal builders, driving lib/qr-types.ts
(/qr-tools/vcard, /qr-tools/mecard) and the homepage generator. Beyond escaping:
blank properties are omitted rather than emitted empty (address books import
`TITLE:` as a blank field), and N is written with its full five slots.

The decoder read `/FN:(.*)/` and would have shown users their own escapes back
as `Acme\, Inc.` — it goes through readVCardField now and surfaces ORG too.
readVCardField is documented flat-TEXT-only: structured properties must be split
on the unescaped `;` before unescaping, and the suite asserts that.

npm run test:qr: 31 assertions (was 21), mutation-verified — identity
escapeVCard fails 4. Round trip driven in the pane: the generated QR carries
`N:Berg\; Jr;John;;;` and `ORG:Acme\, Inc.`, and the decode page renders
"Name: John Berg; Jr · Company: Acme, Inc.".

Files: lib/qr-payload.ts, lib/qr-types.ts, app/page.tsx,
components/QrDecodeClient.tsx, scripts/test-qr-payload.mjs. Branch design-v2.

## M131 — the /ai-tools privacy claim follows the code, not an env var (Jul 22)

Every /ai-tools page rendered "Runs in your browser; files never upload" and
answered "Is my file uploaded to a server?" with "No — processing runs on your
device". Both were constants. The backlog framed this as preventative work:
isAiEngineLive() was assumed false in production, so the claims were assumed
true, and the job was to derive them before anyone set the env var.

The assumption was wrong in a way only a deploy could show. NEXT_PUBLIC_AI_ENGINE
is already set on Vercel — the first version of this fix keyed the claim off
isAiEngineLive() alone, and /ai-tools/colorize-photo came back from production
announcing "Sent over HTTPS to be processed, then discarded" for a canvas filter
that never touches the network. Meanwhile aiProcess() has zero callers anywhere
in the app, so no AI tool uploads anything at all. The flag reports that an
engine is CONFIGURED and says nothing about where a user's file goes; keying a
privacy claim to it produces the same lie as the hardcoded promise, pointing the
other way. (lib/server/monitor.ts reports the var being unset as a production
issue, which is presumably how it came to be set.)

lib/ai-connector.ts now carries AI_CLOUD_ROUTES — per engine: the AiTask it
routes to, whether it sends a file or text, whether the cloud replaces the tool's
main action or only adds a mode, and `wired`, false until that engine's client
really calls aiProcess(). Ten engines are listed, each only where the tool's own
shipped copy already promises the cloud engine will do that work. Today every
`wired` is false, so setting the env var changes nothing on any page.

ToolPageShell gained a third copy set. "cloud" and "device" do not cover
speech-to-text or the resume builder: the tool is local and only an optional step
would ever upload, so "cloud" claims an upload most sessions never make while
"device" hides the one they do. The privacy FAQ is rewritten from the same table
(and the routed tools that had no privacy FAQ at all — speech, subtitles — get
one instead of staying quiet), and the four CloudNotice banners whose text is a
claim about where the work happens take the engine key and swap promise for
disclosure.

npm run test:ai: 19 assertions. The env is read at module load, so the suite
loads the shipped modules in three child processes — env unset, env set, and env
set with every route wired — which is the only way to test the future state
nobody can see today. It scans every .ts/.tsx for aiProcess("<task>") call sites
and holds `wired` to them in both directions: a route may not claim wired without
a call site, and a call site may not exist without its route being wired, which
is the direction that lets code ship while the claim stays behind. Seven
mutations verified, including dropping the wired gate.

Files: lib/ai-connector.ts, lib/ai-tools-meta.ts, components/ToolPageShell.tsx,
components/ai/AiKit.tsx, components/ai/AiImageFxClient.tsx,
components/ai/AiTextClients.tsx, components/ai/AiWorkspaceClients.tsx,
app/ai-tools/[slug]/page.tsx, scripts/test-ai-claims.mjs, scripts/alias-hooks.mjs.
Branch design-v2.

## M132 — the AI health check asserted a flag, not a capability (Jul 22)

`envValidation()` in lib/server/monitor.ts reported "NEXT_PUBLIC_AI_ENGINE not
set — AI tools stay on their on-device fallbacks even though server keys exist"
whenever the var was missing in production. Two things wrong with it: the var is
set in production, so it never fired; and had anyone acted on it, setting the
var would have changed nothing, because aiProcess() has no callers. The check
told the owner to flip a switch that was already flipped and wired to nothing —
and it is almost certainly why the var was set in the first place, which is what
made M131's first cut ship a false upload claim.

It now reads AI_CLOUD_ROUTES and reports whichever half is actually missing:
routes wired with no engine configured (tools silently fall back), or an engine
configured with nothing routed through it. /api/ready says the real state out
loud, which is also the cleanest proof the var is set in the production runtime:

  "NEXT_PUBLIC_AI_ENGINE is set but no AI engine routes through the connector —
   aiProcess() has no callers, so the flag changes nothing. Wire a route or
   unset the var."

test:ai grew a 20th assertion holding monitor.ts to the route table so the check
cannot quietly revert to reading the env var alone. Mutation verified.

Files: lib/server/monitor.ts, scripts/test-ai-claims.mjs. Branch design-v2.

## M133 — the poster maker's two false answers (Jul 22)

The /use/*/google-review-qr-code landing sends people to /poster and then, in
15 languages, answered "Can I add my logo?" with "not yet" and "Is it free?"
with "there's no watermark on the printable poster" — while PosterMakerClient
drew "Made with QRix" into the footer of every PDF and PNG it exported. One
claim under-sold the tool, the other over-sold it.

Logo upload: PNG/JPG/WebP/GIF/AVIF/SVG, read with FileReader and drawn from a
data URL, so it never leaves the browser and never taints the canvas the export
reads back. It is centred above the heading and scaled into a 560x150 box with
its aspect ratio kept. An SVG with no intrinsic width/height decodes to a 0x0
image, which would have vanished silently, so it is probed after load and
rejected with a message instead.

Credit: a checkbox, on by default. Off means the export carries nothing but the
user's own artwork, which is what "no watermark" has to mean.

The layout had to change before a logo could exist. Every y on the poster was a
literal — heading baseline 250, underline 300, QR 430 — so a heading long enough
to wrap drew its second line at y=366, straight through the underline and into
the QR card. Nothing above the QR could grow. lib/poster-layout.ts now resolves
the page from what is on it (heading lines, subtitle lines, logo box) and
shrinks the QR — never below 360px, where a printed A4 code stops being
reliable — when the blocks above have eaten the room. A poster with no logo and
a one-line heading comes out pixel-identical to before; the test asserts those
old literals directly.

scripts/test-poster-layout.mjs (npm run test:poster) — 18 assertions over the
shipped module, including 1-3 heading lines x 0-3 subtitle lines x no/wide/tall
logo, all 36 combinations required to stay on the page, keep the QR scannable
and not overlap each other. Five mutations verified, including the original
two-line-heading collision.

Copy: both answers rewritten in EN + 14 languages, plus /poster's
description/about/steps and the qr-code-poster-maker guide.

Files: lib/poster-layout.ts (new), components/PosterMakerClient.tsx,
app/poster/page.tsx, lib/usecase-content.ts, lib/usecase-content.i18n.ts,
lib/blog.ts, scripts/test-poster-layout.mjs, package.json. Branch design-v2.

---

## M134 — /qr-code-statistics: a citation asset that can survive being checked

Ten missions in a row were correctness work on tools we already shipped. This
one is acquisition: the year goal is traffic, and the only NOW item that is
itself an asset was the stats page. Taken ahead of two items above it in the
backlog (both re-ranked in the same commit, with reasons).

The category is a swamp. "80+ QR code statistics" posts cite each other in a
loop, and the load-bearing numbers dissolve when you pull on them: "over 2
billion scans a day" has no study under it and contradicts the annual totals
printed on the same pages; a worldwide scan count given to the single digit
(130,115,528) can only be one platform's logs. So the page is built on the
opposite premise — fewer numbers, each one openable.

26 stats across four groups. Juniper Research for payment value ($5.4tn in
2025, >$8tn forecast for 2029). NPCI's UPI volumes via a Government of India
release (21.63bn transactions in December 2025, +29% YoY) — the only tier on
the page that is an official statistic rather than marketing. Bitly's platform
data for regional scan growth, which carries the one genuinely interesting
finding: Europe created 7% more codes and scanned them 53% more, i.e. the
installed base is being used harder, not replaced. And a Bitly marketer survey,
labelled a vendor survey of the audience it sells to, because that is what it
is.

Every stat carries: the source's own publication date, a `kind` (government /
analyst / vendor-platform / vendor-survey / regulator) rendered as a visible
badge, and a written caveat naming what the number does not prove. The caveats
are the product. "UPI includes payments made without scanning anything, so it
is an upper bound." "This measures what marketers believe consumers think."
Where a source contradicts itself — Bitly gives Europe as both +42% and +53%
in two different tables — the page prints both and says the published text does
not resolve which is which.

The rejected list is the reason to link to this page rather than a competitor's.
Four of the most-quoted QR figures appear only as failures, each with what we
actually checked. The quishing one was verified by reading the roundup those
percentages come from: 69 statistics, three or four attributed to a named
report. No quishing number appears above; the security section cites the FTC's
own consumer alert instead and says plainly that the numbers do not exist.

lib/qr-stats.ts holds the data, so the cards, the JSON-LD `citation` array and
the CSS bar chart cannot drift apart. scripts/test-qr-stats.mjs (npm run
test:qr-stats) — 13 assertions: no stat without an https source, a source name
and a publication date; no non-government stat without a caveat over 20 chars;
unique ids; at least three distinct source hosts, so the page can never quietly
decay into one vendor's press kit; the FTC link must stay on consumer.ftc.gov.
Six mutations verified, including gutting a caveat and repointing every source
at one host.

Chart is CSS only — no chart library, nothing to hydrate. A live URL generator
is embedded (the page has a working tool, per the page bar). Article +
Breadcrumb + FAQ JSON-LD, every source URL emitted as a schema.org citation,
6 FAQs written to answer the queries the page targets ("how many QR codes are
scanned every day" is answered "nobody credibly knows", which is the truth and
also the pitch). Registered in sitemap, search index and llms.txt.

Files: lib/qr-stats.ts (new), app/qr-code-statistics/page.tsx (new),
scripts/test-qr-stats.mjs (new), app/sitemap.ts, lib/search-index.ts,
public/llms.txt, package.json. Branch design-v2.

## M135 — CWV audit: the background canvas was the whole first tranche

Lighthouse mobile against production, 5 template types. Baseline: home 36,
/qr-tools/url 51, /image-tools/compress 41, /convert/png-to-jpg 45,
/qr-code-statistics 46. After: 55 / 87 / 87 / 80 / 83.

One cause dominated four of the five templates. DotDistortionBackground is
mounted by layout on every page, and it repainted a full-screen,
screen-blended canvas every frame forever. That showed up as back-to-back
~200 ms long tasks and TBT of 5.9-9.2 s; it is now 120-540 ms.

Two commits, and the first one is the instructive one:

- bdc463d deferred the loop past `load`+idle, replaced the six per-frame
  createRadialGradient calls with cached sprites, collapsed ~500 dot fills into
  one path, and capped to 30 fps. Measured effect: none outside the noise band.
  The arithmetic was never the cost.
- 7a073dd removed the canvas instead. It exists to push the dot grid away from
  the cursor, so on `(pointer: coarse)` — every phone, and every Lighthouse
  mobile run — it was animating forever to render an interaction that cannot be
  triggered. Those devices now get .qx-bgcss: the dot grid as one tiled
  radial-gradient, the aurora orbs as blurred blobs on a transform keyframe, a
  static vignette. Compositor-only, and server-rendered, so the background is
  present at first paint instead of arriving with hydration. Cursor devices
  keep the canvas untouched. prefers-reduced-motion takes the CSS path with the
  orbs held still.

Palette parity verified on production via computed styles in both themes:
dots rgba(34,197,130,.18) dark / rgba(124,58,237,.22) light at 28px, vignettes
identical to the canvas stops.

Remaining: LCP, now the only thing between the tool templates and 95 — 3.1-4.1s
with ~1.4-1.6s of element render delay on a text LCP, TTFB only ~335ms. Home is
a separate mission: at 55 it is held back by app/page.tsx being one giant
"use client" component.

Files: components/DotDistortionBackground.tsx, app/design-v2.css.
Branch design-v2.

## M135 tranche 2 — the LCP element was not page content (708e617, 8d5ec27)
lcp-breakdown had been read as "text LCP waiting on the font", and both suspects
carried over from tranche 1 (the 75 KB Bricolage preload, the 29 KB blocking CSS)
were wrong. The audit names the node: on every template the largest contentful
paint was the cookie consent banner's paragraph — a 354x81 text block anchored to
the bottom of the viewport — and it started at show=false and flipped in an
effect, so LCP waited for the JS bundle. It now renders in the server HTML and is
hidden by CSS unless the pre-paint script in layout <head> finds no stored choice
(data-consent="pending" on <html>). Observed LCP minus observed FCP: 532ms -> 0ms.
Painting it before the webfont cost 0.091 CLS, all of it that one element — a
bottom-anchored box grows when Bricolage re-wraps the text — so the banner now
renders in the system stack. Not Inter: it is self-hosted too and unpreloaded, so
it would land later than Bricolage and shift harder. CLS back to 0.
Fixed alongside: the <head> script read consent with JSON.parse while the banner
writes a plain string, and JSON.parse("granted") throws — so every returning
visitor was reset to denied while the banner (raw compare) stayed hidden and never
re-issued the update. Accepted consent had been dying after one page view.
Next is TBT, which is now the only thing between the tool templates and 95: the
hydration chunk is 1048ms of scripting, gtag 581ms. Scores this session swung
49-65 between identical runs — trust observed deltas, not scores.

Files: app/layout.tsx, components/CookieConsent.tsx, app/globals.css.
Branch design-v2.

## M136-M137 — the homepage LCP element, and the tool shell off the client

lcp-breakdown names img.qx-hm-img — the hero mascot — as the homepage's LCP
element on every run, and three of its four subparts were ours. fetchPriority
="high" took resourceLoadDelay from 1241/259ms to 87/128ms (the browser had
been waiting for layout to prove the image was on screen). Re-encoding the file
took resourceLoadDuration from 1884/972ms to 430/821ms: it was 186KB of badly
compressed webp, now 103KB at the identical 613x1876 with alpha, PSNR 44.4dB
against the old bytes, so nothing visible changed. Element render delay did not
move at all — and that turned out to be the interesting one. The CSS reveal
(.qx-smoke--auto, shipped dead in 7a073dd and wired here) does run before
hydration exactly as designed, but it animated FROM opacity 0, and Chrome will
not accept an opacity:0 element as a contentful paint. The frame painted at FCP
did not count; the next frame the main thread could spare came ~1.2s later.
Starting the keyframe at 0.26 — a faint blurred ghost that still reads as
materializing — collapsed render delay 2383/2491ms -> 673/934ms and the observed
LCP-FCP gap 1230/1313ms -> 50/266ms. Home obsLCP over the session:
6395/3791ms -> 1746/2050ms.

Then TBT, which is a hydration problem rather than a download one: 948ms of
scripting against 30ms of parse in the app chunk. ToolPageShell wraps all 46
tool routes and carried "use client" for exactly two lines — one usePathname()
for the favorite star, one onClick that scrolled to the top — while ~200 lines
of static markup and nine react-icons hydrated behind them. The hook is
ToolFavorite.tsx, the scroll is href="#top" (with scroll-padding-top so the
anchor clears the sticky nav), and QRToolClient, which had "use client" for
nothing whatsoever, is now the server component QRToolView. The generator keeps
its client boundary because QR_TYPES entries carry a build() function and a
function cannot cross into a Client Component, so QRGeneratorByType takes the id
and looks it up itself; StatsQrTool, which existed only to do that same lookup,
is gone. On /qr-tools/url: TBT 2233/644ms -> 245/460ms, hydration chunk
948/1849ms -> 483/862ms of scripting, score 49/65 -> 77/72, script transfer
essentially unchanged at 562KB — the bytes were never the point.
Also fixed in passing: the web manifest pointed both icons at /icon and
/apple-icon, which are 404s (the files are static, so they live at /icon.png and
/apple-icon.png), so an installed QRix had no icon at all.
Verification note worth keeping: the in-app preview pane reports a 0x0 viewport
and never hydrates anything below the root layout — on the homepage 0 of 1880
elements under <main> carry a React fiber — so it cannot answer "did this
hydrate". Real headless Chrome via the puppeteer-core in lighthouse's npx cache
can, and did: typing re-renders the QR canvas, the favorite star writes
{"href":"/qr-tools/url",...}, zero page errors.
Next: the root layout still mounts eleven client components on every page in the
site; TopNav (400 lines) is the biggest separable one.

Files: components/EraBunny.tsx, public/scenes/bunny-hero.webp, app/design-v2.css,
app/globals.css, components/ToolPageShell.tsx, components/ToolFavorite.tsx,
components/QRGeneratorByType.tsx, app/qr-tools/[slug]/QRToolView.tsx,
app/qr-tools/[slug]/page.tsx, app/qr-code-statistics/page.tsx, app/manifest.ts.
Branch design-v2.

## M138 — three catalogs stopped shipping to every page (CWV, tranche 5)

The root layout mounts eleven client components on all ~800 pages, so a single
static import inside any one of them is an import on every page. Three were:

  HOME_I18N       TopNav read 13 nav labels per language out of 57 KB of
                  homepage copy. Extracted to lib/nav-i18n.ts (3.9 KB).
  the auth SDK    TopNav statically imported supabaseBrowser for a getSession()
                  that cannot paint before hydration anyway. Now import()ed in
                  the effect; it lands in a chunk the HTML does not link.
  the search      CommandSearch pulls lib/search-index — every tool registry,
  catalog         the whole blog, 40 convert pairs, 25 resize presets. Its only
                  opener is Ctrl/⌘+K and there is no search button in the
                  chrome, so a phone downloaded the catalog on every page view
                  for a feature it cannot reach. CommandSearchLoader is the ~30
                  lines that listen for the shortcut; the palette arrives on a
                  dynamic import, warmed at idle only where (pointer: fine).

Measured as bytes on production, not as a score — an identical build scored 49
and 65 on this machine, so scores cannot answer this. Eager <script> set:
  /qr-tools/url   19 scripts / 1405.2 KB  ->  18 / 790.1 KB   (-44%)
  /                22 scripts / 1539.9 KB  ->  21 / 1281.3 KB  (-17%)
The homepage keeps HOME_I18N legitimately (app/page.tsx uses it) and still has
the SDK via ReviewsSection and lib/blog via LatestPosts — both below the fold,
both queued as follow-ups.

Driven on production in real headless Chrome, zero page errors: nav labels
render, header hydrated, Ctrl+K opens the palette, "merge pdf" returns 9 rows
incl. the merge hit, Escape closes and a second Ctrl+K re-opens (the palette's
own listener took over from the loader), the account menu opens with Sign in /
Sign up and all six account links, the SDK is absent from the HTML's script set
but still requested after load, and the hero bar answers both "jpg to pdf" and
the Cyrillic "жпг то пдф".

Two traps worth keeping. Marker strings for "is this module in the bundle" are
easy to get wrong twice over: "onAuthStateChange" reported the SDK as present on
a page holding only TopNav's CALL SITE, and a blog title reported the search
catalog as present on the homepage where the title came from LatestPosts
importing lib/blog directly. Use a literal out of the module's own data. And
`import type` is erased before a bundler sees it, so an eager-import guard that
does not skip type-only imports flags files that cost nothing.

Guards: npm run test:nav (6 assertions — the extracted table must stay
byte-identical to the HOME_I18N nav slice in both directions) and npm run
test:layout (8 assertions on which import may live where). 6 mutations verified
between them. Both exist because every one of these regressions looks and
behaves completely correct.

Files: components/TopNav.tsx, components/CommandSearch.tsx,
components/CommandSearchLoader.tsx, components/HeroSearch.tsx, app/layout.tsx,
lib/nav-i18n.ts, scripts/test-nav-i18n.mjs, scripts/test-eager-layout.mjs,
scripts/measure-eager-bundle.mjs, package.json.
Branch design-v2.

### M138 tranche 6 — the last eager auth SDK on the homepage

ReviewsSection was the only remaining eager importer of supabaseBrowser on
app/page.tsx. It renders below the fold, but app/page.tsx is one giant
"use client" component, so depth on the page buys nothing — the whole
auth/postgrest client was in the homepage's eager bundle for a block most
visitors never scroll to. Nothing it paints needs it (SEED renders until the
query answers), so both call sites go through a dynamic import.

  homepage eager set  21 scripts / 1281.3 KB -> 20 / 1044.7 KB
  end to end today    22 / 1539.9 KB -> 20 / 1044.7 KB   (-32%)

Verified on production: the SDK chunk is absent from the HTML's script set,
still requested after load, and the real query still fires (REST call to
/rest/v1/reviews), zero page errors.

Deferring an import adds a failure mode the static one could not have — a chunk
fetch can fail where a bundled module cannot — so both call sites now take the
same localStorage fallback a query error already took. Apply that to every one
of these deferrals.

Files: components/ReviewsSection.tsx, scripts/test-eager-layout.mjs.
Branch design-v2.

## M139 — the homepage stopped shipping 60 blog posts to read three titles

components/LatestPosts.tsx paints three cards below the fold and reached them
through allPostsSorted(), so all 88 KB of lib/blog — 60 posts with their full
bodies, sections and FAQs — was in the eager bundle of every homepage view.
app/page.tsx is one giant "use client" component, so rendering depth buys
nothing; the import is the cost.

The backlog said this one needed a VIEWPORT-driven deferral, being the one of
the three catalogs that feeds what its section paints. Checking that premise
first is what saved it: those three cards are the only /blog/* links in the
homepage's server HTML — the site's whole crawlable path from the root into the
blog — and a crawler does not scroll, so an IntersectionObserver would have
traded an indexing asset for bytes. The four painted fields are inlined in
lib/home-posts.ts instead (~300 B), links untouched.

  homepage eager set  20 scripts / 1044.7 KB -> 19 / 970.4 KB   (-74.3 KB)

The rule worth keeping: defer on INTENT, inline on PAINT. A dynamic import is a
downgrade for anything a crawler must see, however far below the fold it sits.

Inlining trades bytes for drift — append a newer post and the homepage silently
keeps the old three, and nothing about the page looks wrong. npm run
test:home-posts is the guard: it asserts the list against allPostsSorted(),
prints the corrected block ready to paste, and requires every slug to resolve,
since a typo here is a 404 on the most crawled page. Run it whenever a post is
added. test:layout (now 10) holds the import boundary. 4 mutations verified.

Verified on production: the marker flipped, the 74.6 KB chunk 404s (gone, not
deferred), all three cards render right and hydrated in real headless Chrome,
the three links 200, zero page errors.

Files: lib/home-posts.ts, components/LatestPosts.tsx, scripts/test-home-posts.mjs,
scripts/test-eager-layout.mjs, package.json. Branch design-v2.

## Mission 145 — the site can answer "who created it?"

The M142 audit's lowest category was content, 41/100, and it named the cause
rather than the symptom: every page on the site failed Google's "Who created
it?" question. /about was four generic paragraphs with no author. Articles
carried a date and no byline. The blog index carried neither. The site-wide
Organization schema was a stub — name, url, logo — with no founder, no sameAs
and no contact point, so there was no entity for anything to attach to.

`lib/operator.ts` is now the single place the identity lives, and the important
part is what it deliberately does not hold. Four fields — legal-name spelling, a
photo, GitHub/LinkedIn/X profiles, a domain email — are the owner's to publish,
so they are `null`, every consumer omits the property rather than rendering an
empty label or a `null` into JSON-LD, and they are recorded as an owner-gated
item. Filling any one is a one-file edit that propagates to /about, the
site-wide Organization node and every article byline at once. Guessing them
would have been the no-fabrication rule failing on the one surface whose entire
purpose is to signal trust.

Every claim on the new /about was re-derived from the code instead of inherited
from the old copy, and two of them did not survive that:

- "nothing watermarks your output" was **false**. `PosterMakerClient`'s "Made
  with QRix" credit is `useState(true)` — on by default. The page now says so
  and points at the switch that turns it off.
- the privacy paragraph would have named PDF **compression** as the tool that
  uploads, on the strength of a standing note. That has been wrong since M127
  (`a77cf98`) moved compression into the browser: `/api/pdf/compress` is
  orphaned and `/api/pdf/merge` was never used either. The one file tool that
  genuinely sends your file is pdf-to-word, and /about names it, links it, and
  says to pick the on-device mode for anything sensitive.

The page therefore gives things up on purpose — the tool that uploads, the
watermark default, and the fact that the image upscaler is called AI and is not
one. A trust page that only makes claims is worth nothing as a trust signal. All
six internal links were verified 200; the poster maker is `/poster`, not
`/qr-tools/poster`, which 404s.

Same audit family, also shipped: `Article.image`, which was missing entirely and
which Google lists as required; `Article.author` promoted from an anonymous
Organization copy per page to a Person `@id`-linked to `/about#operator`, so
every article resolves to the same human; `@id`s on Organization and WebSite so
they cross-reference instead of floating; a visible `rel=author` byline and an
author card per article; and dates on the blog index, which showed read time but
nothing about how current the writing was.

`formatPostDate()` is defensive on purpose. Autopilot posts are JSON blobs in
Supabase that are only *typed* as `BlogPost` on the way out, and
`new Date(undefined)` stringifies to "Invalid Date" — which would have rendered
as visible text on the most-crawled index on the site. Null means omit, in the
markup and in the schema both.

`npm run test:eeat` is the guard, and every failure mode it covers is silent: a
null rendering as the literal "null" in JSON-LD, a placeholder reaching
production as an identity, the visible byline drifting away from the schema
author, the `@id` graph breaking so articles credit nobody, the logo drifting
back to `/icon` (which 404s — the defect M142 fixed here). 17 static assertions
plus 6 live ones, 10 mutations verified, 0 blind spots. Verified live: 23/23
against production, an autopilot article rendering the byline and a complete
Article node, 72 index dates and no "Invalid Date". Sitemap unchanged at 809, so
no IndexNow submission.

Two things worth carrying forward. `scripts/resolve-ts-alias.mjs` is what made
testing this module possible: the test scripts import `../lib/*.ts` directly so
they exercise real production code, but node resolves neither the `@/*` alias
nor extensionless specifiers, so that only ever worked for leaf modules — and it
has to be loaded with `--import`, because a plain import statement is hoisted
and registers the hooks after the imports it was meant to fix have already
failed. And two of this session's own measurements were wrong before they were
right: `grep -c` counts matching *lines*, not occurrences (144 card matches
looked like 2), and counting anything in a Next.js response double-counts,
because the RSC flight payload inlines the same text inside a `<script>` — strip
script tags before you count markup.

Files: lib/operator.ts (new), scripts/test-eeat.mjs (new),
scripts/resolve-ts-alias.mjs (new), app/about/page.tsx, app/layout.tsx,
app/blog/page.tsx, app/blog/[slug]/page.tsx, lib/blog.ts, package.json.
Branch design-v2. Commit 1e80496.

## Mission 146 — the repeat visit stopped re-validating everything

Four CWV follow-ups from the M142 audit. Each was scoped against production
BEFORE being built, because the audit was wrong about hreflang last session —
and it turned out to be wrong about two of these four as well.

1. CACHE HEADERS (the real win). Every non-font asset in public/ served
   `public, max-age=0, must-revalidate`: /scenes/bunny-hero.webp — the homepage
   LCP element, preloaded with fetchPriority=high — plus /world-dots.svg
   (206 KB, also preloaded), /qrix-logo.png, the brand film, and both 1.2 MB
   copies of the pdf.js worker. Every repeat visitor paid a revalidation round
   trip in front of the LCP paint; every PDF tool visit re-validated 1.2 MB it
   already had. Only /fonts/*.woff2 was cached. Now 30d +
   stale-while-revalidate. NOT `immutable`: these names are not content-hashed
   and bunny-hero.webp was re-encoded during M136, so a year of immutable would
   have stranded returning visitors on stale bytes. /sdk/qrix.js got a separate
   600s rule — it runs inside third-party pages, so a bad build cannot be
   pulled by editing our own HTML, and max-age is hard freshness: under the 30d
   rule a fix would not even be revalidated for a month. sw.js, llms.txt and
   the IndexNow key are deliberately excluded.

2. FONTS. The audit said "trim 6 families toward 3" and named none. Only one
   was free: Oswald appeared in exactly three stacks and was the SECOND entry
   in all three, behind self-hosted "Unbounded" (x2) and "Anton" (x1). The
   browser only reaches a fallback when the primary fails — and these come from
   the same origin, so any failure takes both. It could not paint, and never
   did, while costing 10 @font-face rules in the render-blocking CSS
   (fonts.css 32,870 -> 28,572 bytes) and 80 KB of woff2. Removed from
   scripts/fetch-fonts.mjs too, so it cannot return on regeneration. The other
   five all genuinely paint — going to 3 is a DESIGN decision, left to the
   owner rather than taken here under a performance pretext.

3. PRELOAD. Genuinely emitted twice, but not from two call sites — there is
   only one in the repo. Rendering <link rel="preload"> inside an explicit
   <head> makes React emit both its hoisted copy (byte 186) and the literal
   JSX (byte 663). ReactDOM.preload() emits only the hoisted one.

4. IMG DIMENSIONS. Honest scope: correctness, not a CWV win, and the audit
   overstated it. Two of the three are position:absolute at width/height 100%,
   so the attributes cannot affect layout, and CLS has been 0 since M135. Only
   .qx-gm-media (height clamp + width:auto) actually needed the ratio. Added to
   all three so a future CSS change cannot reintroduce a reflow.

Verified on production after deploy: all five listed assets on the new header,
/sdk on its own, the three exclusions intact; Oswald 0 occurrences in the
served CSS with @font-face 90 -> 80 and its woff2 404, while Unbounded/Anton
still ship and still serve 200; preloads 2 -> 1; all three imgs carrying
dimensions; /, /qr-tools/url, /pdf-tools, /convert/png-to-jpg all 200 with the
right h1. Sitemap unchanged at 809, so no IndexNow submission.

Files: next.config.ts, app/fonts.css, app/design-v2.css, app/layout.tsx,
components/EraBunny.tsx, components/WorldMapBackground.tsx,
scripts/fetch-fonts.mjs, 5 woff2 deleted.
Branch design-v2. Commits 26ff03b, 1779da6.

Next: /convert + /resize serve crawlers no tool at all — confirmed live this
session, 0 input[type=file] and 0 <label> on both (the h1 and ~550 words of
body copy DO render server-side, so it is the tool specifically). The engines
are dynamic(ssr:false), which emits nothing during SSR — not even the `loading`
fallback — so the shell has to live in the server page, outside that boundary.

## Mission 147 — image tools stopped serving crawlers a page with no tool

/convert/png-to-jpg and /resize/1920x1080 served 0 input[type=file] and 0
<label>, measured live before any code was written. The h1 and ~550-590 words
of body copy rendered fine, so a crawler read an article ABOUT converting
images and never found a converter — the SXO page-type mismatch from M142.

The audit's suggested fix would not have worked, and this is the reusable
lesson. It described the served HTML as containing "Loading the image
workspace…" — the dynamic() loading fallback — which makes "enrich that
fallback" the obvious move. But every engine is dynamic(ssr:false), and
ssr:false renders NOTHING during SSR: not the component, not the fallback.
That string was never in the server HTML. Anything intended for crawlers has
to be emitted outside that boundary.

So ImageEngineRegistry now renders ImageToolShell on the server AND on the
first client render — hydration matches exactly — then swaps in the live
engine on effect. The shell is deliberately not a copy of AiDropzone: that is
a div with role="button" around a hidden input, correct for a pointer user and
precisely the markup a crawler cannot read. The shell uses a real visible
input[type=file] with a real <label for>, `multiple` only for the batch:/
layout: engines, and a <noscript> line saying the tool needs JS — with JS off
the control genuinely cannot work, since the conversion is canvas-side with no
endpoint behind it. Fixed at the registry, so it also covers
/image-tools/[slug], which had the same defect and was not in the item.

VERIFICATION, and the part worth remembering. The in-app Browser pane reported
this change as a total production regression: shell still in the DOM, no React
fiber on it, no dropzone, engine never mounted. Every one of those was wrong.
That tab runs at viewport 0x0 and does not hydrate tool-page main content. A
revert was one step away. What caught it was a control: running the identical
probe against /image-tools/compress — a route this mission never touched —
produced the IDENTICAL failure signature. An instrument that reports the same
failure for a changed and an unchanged page is measuring itself, not the code.

scripts/probe-hydration.mjs now exists so this is not re-litigated: real
headless Chrome at a real viewport over CDP, with no new dependency (Chrome
already has --remote-debugging-port, Node 22+ has a built-in WebSocket). On
the same pages the pane called broken it reports toolAreaHydrated:true,
shellStillPresent:false, liveDropzone:1 — verified on /convert/png-to-jpg,
/resize/1920x1080, /image-tools/crop-image, /image-tools/batch-convert and
/ru/convert/png-to-jpg. Sitemap unchanged at 809, so no IndexNow.

Files: components/image/ImageToolShell.tsx (new),
components/image/ImageEngineRegistry.tsx, scripts/probe-hydration.mjs (new).
Branch design-v2. Commit 3812696.

Next: BarcodeClient a11y — label[for]+id on the value input, range, checkbox
and textarea, and human-readable colour preset names ("Black", not "#000000").
The WiFi page already does this correctly and is the pattern to mirror.

## Mission 147b — the shell speaks the reader's language, and names its own output

M147 made the tool area of 242 programmatic URLs visible to a crawler. Three
things it left, each verifiable:

The shell was English-only, and 102 of those URLs are the RU/UZ twins of
/convert and /resize. "Choose an image", the format hint and the noscript line
all rendered in English on a page written in Russian or Uzbek — the M125 defect
returning in a new place. `lang` was already in the registry's scope; it is now
passed through and every string is localized.

All 242 URLs shared one boilerplate. The shell now names what its own engine
produces, read off the key the page already passes: "Output: JPG" from
convert:jpeg, "Natija: 1080×1080" from resize:1080x1080. `engineTarget()`
returns null for anything it cannot name — convert:heic, resize:instagram,
special:passport — and the line is omitted rather than guessed, because a wrong
output format is a false claim on the page.

color:gradient was offered a file picker. It generates its image from colour
stops and has no upload at all; its own copy says "no image upload needed". It
keeps the dynamic() fallback now.

CORRECTION to M147's central technical claim, since a wrong rule in a comment
outlives the mission that wrote it. M147 concluded that `ssr:false` renders
neither the component nor its `loading` fallback server-side, and therefore that
the audit's suggested fix — enrich the fallback — "would not have worked". The
fallback IS server-rendered on Next 16.2.7. Measured three times: the string was
in production's script-stripped HTML before M147 shipped; it is in
/image-tools/gradient-generator's HTML today, the one engine the registry now
skips; and an earlier build of this same fix worked precisely by enriching the
fallback. Nothing was reverted — the hydration-gated shell is the sturdier shape,
because it does not lean on an undocumented Next rendering detail and because a
spinner is not content either way — but the stated reason was not the real one.
The likely cause of the wrong reading is the trap already in this file twice:
a case-sensitive grep over an unstripped Next response.

The live probe also caught a defect no unit test could see. `{t.out}: {target}`
is two adjacent JSX expressions, and hydratable SSR separates neighbouring text
nodes with an HTML comment, so the phrase shipped as
"Output<!-- -->: <!-- -->JPG". One template literal fixes it, and the guard now
asserts the phrase against renderToString as well as renderToStaticMarkup —
only the former reproduces the comment.

`npm run test:shell` is the guard: 33 assertions, 7 mutations verified (English
fallback on a localized page, a guessed output format, the split text node, a
drifting label/id pair, a lost plural, a dropzone on gradient, and the registry
silently dropping `lang`). Verified on a dev server run from this worktree, plus
M147's own scripts/probe-hydration.mjs on the changed code: 6 URLs across both
families and all three languages each serve one input[type=file], a label whose
`for` matches its id, the localized prompt and the right output line; gradient
serves zero file inputs and keeps its spinner; toolAreaHydrated:true and
shellStillPresent:false on EN, RU and UZ. Sitemap unchanged, so no IndexNow.

Files: components/image/ImageToolShell.tsx,
components/image/ImageEngineRegistry.tsx, scripts/test-tool-shell.mjs (new),
package.json, growth/BACKLOG.md, growth/DAILY_LOG.md.
Branch claude/qrix-m147-followup, merged to design-v2.

## Mission 148 — the study the site was already citing

/free-forever's hero read: "A test of 20 'free' QR generators found 14 had
hidden limits." No such test existed anywhere in this repo. Under the rule M143
established — an unsourced number is a fabrication regardless of whether it
happens to be near the truth — that sentence was the site's own worst E-E-A-T
liability, sitting on the page whose entire subject is other people's dishonesty.

So the study ran, and the page's number now follows it rather than the reverse.
Each of 20 vendors' own live pricing and/or FAQ pages was fetched on 2026-07-30
and read for six fixed questions: do the free codes keep working, is an account
required, is there a free dynamic code, is there a scan cap, is vector output
free, and does free output carry the vendor's branding. The method's limits are
stated on the page and enforced in the dataset: no accounts were created and no
cards entered, so nothing claims to describe behaviour inside a logged-in
product, and any question a vendor's page did not answer is recorded as "not
stated" — never inferred. Every row links the page it was read from; outbound
vendor links are nofollow.

Measured: 13 of 20, not 14. The count is deliberately narrow. "Needs an
account" is true of 14 of 20 and "vector costs money" of 5 of 20, but both are
disclosed at the door — you learn them before printing anything — so they are
reported separately as friction. The 13 counts only what bites AFTER the code
is on a menu or a shop window: deactivation, rationed dynamic codes, scan caps
(6 of 20), and the vendor's own ads reaching whoever scans your code (4 of 20).

The finding is better than the number. Sorted by whether anything can bite
after printing, the line does not fall between good vendors and bad ones — it
falls between generators that hand you a file and generators that keep your
code on their servers. All 5 static-only tools had nothing that could switch a
printed code off, because they hold nothing of yours to switch off. Every
generator that hosts the destination had at least one lever, and some say so
plainly: one vendor's pricing FAQ states that for your QR codes to work, the
account linked to them has to stay active. Another's feature table marks
"watermark-free QR codes" with a cross on the free plan — the watermark IS the
free tier. A third calls its plan "Free Forever" and pauses every scan across
all your codes once a shared pool of 1,000 a month runs out.

QRix is in the same table, graded on the same six questions, including the row
it loses: our dynamic codes resolve through our redirect, so if this site stops
running they stop working. That is the same dependency every hosted generator
on the page carries, and a comparison page that exempts its author is an advert.

The same pass cleaned /free-forever's comparison table, which held two further
inventions nobody had measured ("~100–500 scans, then the code dies", "1–9
languages"). Every "others" cell is now a count derived from the dataset, and
the two rows with nothing behind them were deleted rather than reworded.

Guard: `npm run test:study`, 18 assertions, 4 mutations verified. Three are
routine (thin notes, drifting counts, an `unknown` that does not say the vendor
was silent). The load-bearing one is the JSX scan: it fails if a count is typed
into the page instead of read from COUNTS, because a number in markup that no
dataset backs is precisely the failure this mission exists to undo. It also
fails if the fabricated sentence returns to /free-forever — and it strips
comments first, so the commit that names the ghost is not mistaken for it.

Files: lib/qr-generator-study.ts (new), app/free-qr-code-generator-comparison/
page.tsx (new), scripts/test-generator-study.mjs (new), app/free-forever/
page.tsx, app/sitemap.ts, lib/search-index.ts, public/llms.txt, package.json.
Commits ac39e0f, c6750cd, fed07d1 on design-v2.

## Mission 149 — the barcode tool nobody could read, in two different senses

Two defects on the same JSX, fixed in one pass because they touch the same
lines.

The larger one was invisible to review. components/LocalizedBarcodePage.tsx
rendered <BarcodeClient initialFormat={...} /> and never passed `lang` — the
component accepted no such prop — so every RU and UZ barcode page wrapped a
completely English tool: "Value to encode", "Bar color", "Show value under
bars", "Download PNG", "Bulk generate (up to 200)". barcodeUI() in
lib/barcode-types-i18n.ts covered the crumbs, the headings and the FAQ, which
is exactly why it survived two localization passes: open the page and it looks
translated, because everything around the tool is.

This is the third occurrence of the same defect. M125 hit it in the image tool
copy, M147b had to fix it again for the image shell, and it is here in the
barcode tool. The shape never varies — a localized page wrapper around a client
tool that was written English-only — and all three were found by accident
rather than by looking, so a sweep for the fourth is now in NEXT.

The a11y half is what the audit actually asked for. The range input, the custom
colour input and the bulk textarea had no accessible name at all; their
captions were plain <div>/<span> sitting nearby. The value input and the
checkbox were inside wrapping <label>s — valid, but it left the validation
message with nothing to be referenced by, so a screen reader announcing the
field never announced why it was rejected. And the six colour swatches carried
aria-label={c}, so they introduced themselves as "#7c3aed".

Now barcodeTool(lang) holds every control string in en/ru/uz, with `en`
included explicitly rather than left as an implicit fallback — a fallback path
is precisely what lets a missing translation ship silently. Ids are namespaced
per language through uid(), every control has an htmlFor/id pair, the two
button groups are role=group with aria-labelledby, the value input reports
aria-invalid and points at its error text only while that text exists, and the
swatches announce real names with aria-pressed.

Verified in real headless Chrome on all three languages, because the in-app
pane still cannot answer this (M147's instrument warning stands).
scripts/probe-barcode.mjs is new and shares M147's CDP harness: 5/5 controls
present and hydrated, the barcode paints (31/31/38 rects), clicking a label
toggles its checkbox — which is the only way to prove htmlFor/id pair in a
browser rather than in a regex — every control resolves an accessible name, 0
swatches named by hex, typing re-renders the code, 0 page errors. Server HTML
separately: 7/7 expected strings per language, 5 label[for] with 0 orphans, 8
namespaced ids, no cross-language leakage.

Guard: `npm run test:barcode`, 8 assertions, 4 mutations verified. The
load-bearing assertion is that RU and UZ must not equal EN. An untranslated
string is invisible unless something compares the languages to each other,
which is the whole reason this defect keeps coming back.

Files: lib/barcode-types-i18n.ts, components/BarcodeClient.tsx,
components/LocalizedBarcodePage.tsx, scripts/test-barcode-i18n.mjs (new),
scripts/probe-barcode.mjs (new), package.json. Commit 34afcfa on design-v2.

## M150 — the fourth English-only tool, closed eight tools wide (2026-08-01)

LocalizedToolEngine renders eight tool clients and passed `lang` to none of
them, so every /ru/[tool] and /uz/[tool] route — the main PDF and image surface
for the RU/UZ audience, the stickiest the site has at ~11 pages/visit — wrapped
a fully English tool. Fourth occurrence of one defect (M125, M147b, M149).

The file's own header carried the assumption that hid it: "the tools are
language-agnostic, only the surrounding SEO copy is localized". The first half
was false. It now quotes that line as a retraction, and a test asserts it still
reads as one.

Shipped in three commits: the PDF cluster (merge, compress, jpg-to-pdf,
pdf-to-jpg + the shared UploadBox, which was the single biggest source of
English on those pages), the image cluster (background-remover, image-upscaler,
image-to-text), and PdfToWordClient. Strings live in lib/tool-ui-i18n.ts; every
client takes an optional `lang` defaulting to "en", which the untouched English
routes rely on.

Two sub-defects surfaced while scoping. RemoveBgClient used its English colour
name as BOTH the accessible name and the download filename suffix — localizing
that one field would have put Cyrillic into saved filenames, so it split into
an ASCII key and a localized label, and the swatches gained a real aria-label
(they had none). ImageToTextClient's `lang` state was Tesseract's OCR
recognition language, not a UI locale — renamed ocrLang/OCR_LANGS so the two
cannot be conflated again; its option labels stay untranslated on purpose,
since "Русский" already names an alphabet rather than the interface.
PdfToWordClient is the one tool that uploads, so its two privacy notes were
translated exactly rather than paraphrased.

Guard: `npm run test:tool-i18n` (34 assertions, 14 mutations verified) and
`npm run probe:tool-i18n` (real headless Chrome over CDP — 13/13 production
URLs clean, including an English control page). The engine assertion parses
EVERY case in the switch rather than a hand-listed subset, so a ninth client
added unwired fails immediately; the subset shape is what let this survive two
localization passes.

Cost worth recording: four instrument failures in one session — `git checkout`
on uncommitted work during a mutation test (commit FIRST), a comment-stripper
that ate 2.3 KB of JSX via accept="image/*", `grep -c FAIL` scoring a crashed
script as zero failures, and a CDP probe whose selector returned null on the
English control. Only the last was caught the right way: by running the same
probe against a page the change never touched.

Files: lib/tool-ui-i18n.ts (new), components/{LocalizedToolEngine,
LocalizedToolPage,MergePdfClient,CompressPdfClient,JpgToPdfClient,
PdfToJpgClient,PdfToTextClient,RemoveBgClient,ImageUpscaleClient,
ImageToTextClient,PdfToWordClient}.tsx, scripts/test-tool-ui-i18n.mjs (new),
scripts/probe-tool-i18n.mjs (new), package.json.
Commits 4275c22, 11d1551, d68e76a, c9bba0c on design-v2.

## M151 — the last unmeasured comparative claim on /free-forever (2026-08-01)

M148 rebuilt the /free-forever comparison table so every "others" cell is a
count derived from lib/qr-generator-study.ts. It missed the PROMISES card one
screen higher, which was headed "Free features others charge for" over vector
SVG, bulk CSV, a design studio and 15 languages. The study measured exactly ONE
of those four against other vendors. The other three asserted something about
competitors that nobody had checked — the same defect, in the same page, in a
component the earlier pass did not look at.

Narrowed rather than measured, deliberately. Re-sweeping 20 vendors for three
more questions would have produced softer claims than the ones it replaced:
"has a design studio" has no yes/no reading the way "is vector free?" does, and
a comparison page that grades competitors on a fuzzy question is worth less
than one that declines to. So the comparative clause is now the measured one
and reads COUNTS.vectorPaywalled/COUNTS.total, and everything else on the card
is stated as a claim about QRix alone.

Each self-claim was verified in the repo before being kept: SVG export exists
in both QRGenerator (XMLSerializer over a hidden QRCodeSVG) and QRDesignStudio
(getRawData("svg")), /bulk-qr accepts CSV/TXT and returns a ZIP with no auth
gate, and QRDesignStudio.tsx is the studio.

THE SHARPER HALF was found while checking the easy part. "15 languages" was
also overstated. SITE_LANGS has exactly 15 entries and TopNav plus the homepage
really do render all 15 (NAV_I18N covers 12, en/ru/uz are the base), but tool
UI copy is EN/RU/UZ only — which is precisely what M149 and M150 spent two
missions establishing. A reader who switches to Japanese gets Japanese
navigation and an English tool. The claim is now read from SITE_LANGS.length,
so JSX and data cannot drift apart, and scoped to "navigation in N languages".

Guard: npm run test:study, 19 assertions, 5 mutations verified. It asserts on
the CARDS specifically — a card may make a comparative claim only if it reads
COUNTS, the old heading cannot return, and the language count may not be typed.
Before any of that it counts the cards, because M150 shipped a comment-stripper
that ate 2.3 KB of JSX and every assertion behind it passed vacuously.

Follow-up written into BACKLOG, larger than this was: /compare/[slug] holds
three head-to-head pages against named vendors (iLovePDF, TinyWow, SnapTik),
21 hand-typed comparative cells including competitor prices, with no source
cited anywhere. Checked before filing it — the "verified side-by-side against
iLovePDF output" FAQ line is NOT a fabrication, M96 records that exact
comparison. It needs a citation, not a retraction.

Files: app/free-forever/page.tsx, scripts/test-generator-study.mjs.
Commit 9ce8018 on design-v2.

## M152 — the competitor column gets a source, and three cells were wrong (2026-08-01)

/compare/[slug] held three pages — qrix-vs-ilovepdf, qrix-vs-tinywow,
qrix-vs-snaptik — with 21 head-to-head cells about NAMED products, typed by
hand, citing nothing and dated nowhere. Same defect M148 removed from
/free-forever's table and M151 from its promise cards, on the largest surface
left and the one with the highest stakes, because these are specific
assertions about identifiable companies.

Reading the three vendors' own pages found three cells factually wrong, which
is the entire argument for sourcing: with no citation, nobody could tell.

  iLovePDF — we asserted "Limited tasks/day on free tier". Its pricing page
  states no daily task cap. The free limit it does state is file size per task
  (Merge/Split 100 MB, Compress 200 MB, against 4 GB on Premium), and its own
  Batch processing row reads Unlimited for free and paid alike. The $4–7/month
  price we quoted was the one thing that held: 4 US$/mo billed annually,
  7 US$/mo monthly.

  TinyWow — we priced ad-free at "~$6/month". Its page lists 20 US$/month, or
  15 US$/month billed yearly. The ~$6 looks like its GBP category plan (£5.99)
  read as the USD ad-free one. Its page does back our ads row, in its own
  words: "No advertisements" is the first Premium benefit it sells, alongside
  "Skip all CAPTCHAs" — a sharper fact than the one we had.

  SnapTik — we credited it with "Sound as MP3: Yes" and downgraded its photo
  support to "Partial". Its FAQ says the opposite on both: it declines MP3
  because it "respects the intellectual property rights of the tracks", and it
  merges photo slideshows into MP4 automatically. Wrong in the competitor's
  favour on one cell and against them on the other — the signature of cells
  nobody ever checked.

Also removed: "pop-unders, redirect chains and fake Download buttons", asserted
for months about a named site. A fetched page cannot establish what an ad slot
fills with later. The page now reports what the markup does show — 3 script
tags, one external host (Google Tag Manager), an ad slot — and states plainly
that the rest was not measured. Eight of the 21 cells now render a "not stated"
marker rather than a guess.

Kept after checking, and it nearly went the other way: the PDF-to-Word FAQ's
claim of a side-by-side against iLovePDF output is real — M96 records that
comparison in detail. It was reworded to say it was our own testing rather than
an independent benchmark, not retracted. After three misstated audit findings
in recent sessions the reflex had become "assume the unsourced claim is
invented"; that reflex is itself an instrument and it fails in both directions.

Method: raw markup, not tag-stripped text, per the M148 note. iLovePDF's prices
only exist in data-pricing attributes and TinyWow's plan list is embedded JSON —
neither survives flattening, and the ~$6 error is what reading flattened text
produces.

Guard: npm run test:compare, 10 assertions, 8 mutations verified. Structural
rather than textual — no hand-typed rows array, dataset coverage for every
rendered slug, a source URL and read-date per vendor, nofollow outbound. Two
holes appeared during mutation testing and both were scope errors in the same
assertion, in opposite directions: it scanned only page.tsx, so reintroducing
the pop-under claim through the dataset passed clean; and once it scanned both,
it failed on honest copy, because "no interstitial, no pop-under" is our own
column saying we have none. Now scoped to competitor cells, asserting it parsed
15+ of them first so a broken matcher cannot pass by seeing nothing. The
iLovePDF assertion hit the same shape earlier — it forbade "daily task cap"
outright and failed on the sentence saying there is no such cap.

Files: lib/compare-sources.ts (new), app/compare/[slug]/page.tsx,
scripts/test-compare.mjs (new), package.json.
Commits f969aeb, 97f7d2f on design-v2.

## M153 — the cited pages can be re-read, and the first pass found a wrong cell

/free-qr-code-generator-comparison and /compare/[slug] make claims about 23
named third parties, each read off that party's own page on a stated date.
Honest shape — a vendor changing its pricing makes the page dated, not wrong —
but nothing re-read those pages, so "dated" had no way of being noticed.

The blocker was that neither dataset stored anything re-checkable: `note` is
prose, a paraphrase, so there was no string to search for. Every source now
carries `evidence`, literal substrings copied out of the live page, and
scripts/recheck-sources.mjs re-fetches all 24 and reports which vanished. It
reports and never re-grades: automatic re-classification is how a page starts
asserting things nobody read. Unreachable is a separate outcome from moved.
Matching is raw markup, whitespace-normalised, case-insensitive — raw because
one marker is an alt attribute ("Watermark-free QR codes" sits beside a cross
on the free card and a tick on the paid one, so the label proves nothing).

The finding: Unitag had three wrong cells. Its "unlimited scans" belongs to a
EUR 12 paid HD offer, read by us as a property of every plan — the same
flattened-read cause as M152's ~$6. Its FAQ says free codes "will stop working
after being scanned a hundred times", so we had recorded no scan cap on the
vendor with the hardest cap in the study, wrong in its favour; plus an expiry
question marked unanswered that the FAQ answers outright; plus a headline
crediting the free tier with the 1200x1200 PNG that is the paid download.
COUNTS.scanCapped 6 -> 7 and both pages followed without an edit. The 13 held.
SnapTik's MP3 row was half a sentence — the FAQ declines MP3 and then says
audio IS downloadable via its Download Audio button; quoting only the refusal
was wrong against the vendor, the mirror of the error M152 fixed for them.

The checker caught its own author first: the initial Uniqode marker stored that
vendor's policy in a COMPETITOR's wording ("all dynamic QR Codes" is
the-qrcode-generator.com describing Uniqode; Uniqode says "any").

Guards: npm run test:recheck (10 assertions, 9 mutations verified) and
npm run recheck:sources (24 sources, 50 markers, 0 moved). Known limit, stated
rather than papered over: the guard is structural — it proves every source can
be re-checked, not that a verdict matches its evidence.

Files: lib/qr-generator-study.ts, lib/compare-sources.ts,
scripts/recheck-sources.mjs (new), scripts/test-recheck.mjs (new),
scripts/test-compare.mjs, package.json.
Commits b1865f7, 675e3b4 on design-v2.

## M154 — the daily verify pass is a command now, not a checklist

The pass was prose in the growth routine, re-executed from memory by every
session, which is why its rigour visibly varies across DAILY_LOG. It is also
the shape of the defect it exists to catch: robots.txt once served a bare
`Disallow: /p` instead of `/p$` and blocked 27 pages, because "check robots is
still right" is an intention, not a check.

npm run verify:daily does the four documented checks — recently-shipped URLs
200 + self-canonical + their own non-homepage title, the anchored robots rule,
the sitemap against a committed snapshot (growth/verify-baseline.json), and the
24 cited vendor pages via recheck:sources — and submits any sitemap delta to
IndexNow. First run green: 814 URLs, 76 dated, 10 spot-checked, 50 markers.

Correction to the plan, found while building: only 76 of 814 URLs carry a
lastmod, and undefined sorts first under localeCompare, so newest-by-lastmod
alone would have spot-checked twelve arbitrary /use/* pages. The target set is
newest-by-lastmod UNION everything new since the snapshot.

The design point worth reusing: two rules live in scripts/verify-rules.mjs,
pure and separately tested, BECAUSE PRODUCTION IS HEALTHY — running the real
pass only ever exercises the happy path and cannot distinguish a working rule
from a broken one. The robots rule proves it: the bad value is a strict prefix
of the good one, so `body.includes("Disallow: /p")` is true on both files and
would have called the outage healthy. test:verify feeds it that exact file.

The baseline updates only on a clean run — one that advances through a
regression reports a lost page once and then calls it normal.

Guard: npm run test:verify, 14 assertions, 8 mutations verified. One assertion
was over-strict on its first run and failed on the runner's own success
message — a guard tripping over prose about itself, the M150 comment-stripper
lesson from a new direction; it now matches the logic, not the words.

Files: scripts/daily-verify.mjs (new), scripts/verify-rules.mjs (new),
scripts/test-verify.mjs (new), growth/verify-baseline.json (new), package.json.
Commit bf09a43 on design-v2.

## M155 — the Design Studio arrives on intent, and two instruments were lying

Eighth tranche of the CWV mission. The item's own note said the next lever was
the homepage split; attributing the eager set before starting moved the target
and found two measurement defects on the way.

ATTRIBUTION FIRST. The homepage's eager script set, chunk by chunk, each one
identified by a marker taken from the module's own DATA (identifiers are
mangled and module paths disappear; data survives):

  226.3 KB  Next/React runtime          39.1 KB  react-icons base
  170.4 KB  home-i18n + nav-i18n +      36.5 KB  QRDesignStudio
            qr-tools-meta + world-map   31.2 KB  Next internals
  134.5 KB  react-dom                   22.0 KB  react-icons/si
  110.0 KB  legacy polyfills (noModule) 13.9 KB  downloader-platforms
   53.5 KB  Next router                 rest     < 14 KB each
   53.2 KB  nav + tool labels
   43.0 KB  Next internals

INSTRUMENT DEFECT 1, and it has been inflating every number this mission
recorded: measure-eager-bundle.mjs counted the 110.0 KB bundle Next serves with
`noModule` — the legacy build, which no module-capable browser ever fetches. The
homepage's real eager set is 859.9 KB, not 969.8; /qr-tools/url is 680.1, not
790.0. Every DELTA the mission claims still holds, because the polyfill is a
constant on both sides of any comparison, but the absolute figures were 110 KB
too high. It hid behind the camelCase-attribute trap for the FOURTH time in this
repo (hrefLang, dateTime, the blog-index dates, now this): React SSR emits
`noModule=""`, so a case-sensitive grep for `nomodule` finds nothing. The tag
match is case-insensitive now and legacy scripts are reported separately.

THE TARGET. QRDesignStudio was eager on the homepage AND on all 40 /qr-tools/*
routes — app/page.tsx and QRGenerator.tsx both imported it statically — for a
modal. Both call sites already rendered it as {designOpen && <Studio/>}, so its
markup was never on the page. Only the bytes were, on the two templates that
matter most. Its own heavy libraries (qr-code-styling, jsqr, jspdf) were already
dynamically imported inside it; this was the component itself.

components/QRDesignStudioLoader.tsx fetches it when someone wants it, and two
things had to be right:

  INTENT, NOT THE CLICK. Deferring a modal behind its own onClick trades bytes
  for a visible stall and CLAUDE.md says only improve, so the trigger warms on
  pointerenter/focus — a whole intent ahead of the press, the same trick M138
  used for the search catalog. The chunk is cached at module scope, so a reopen
  costs nothing.

  A DYNAMIC IMPORT CAN FAIL where a static one cannot (f212ba2 made the point
  about ReviewsSection). A dropped chunk is a visible state with a retry, not a
  dead button, and a rejected load clears `inflight` so the retry can re-fetch.

MEASURED ON PRODUCTION, before and after:

  /              859.9 -> 840.7 KB   18 -> 17 eager scripts
  /qr-tools/url  680.1 -> 661.0 KB   17 -> 17 eager scripts

and the "Classy R." marker went YES -> no on both. Note the arithmetic, because
the headline number is NOT the chunk size: the studio's own 36.5 KB chunk left
the eager set entirely, but Turbopack rebalanced — the downloader-platforms
chunk went 13.9 -> 31.2 KB, absorbing ~17.3 KB of code the studio had been
co-located with and which the page genuinely shares (the react-icons subset and
lib/save-file). Net -19.2 KB per homepage view and -19.1 KB on all 40 QR tool
routes. Predicting 36.5 and reporting 19.2 is the difference between the chunk
list and the diff.

THE BUG THE FIRST PROBE COULD NOT SEE. QRDesignStudioLoader initialised its
state as useState(cached). A component IS a function, and React treats a
function initial value as a lazy INITIALIZER and calls it — so once the chunk
was cached at module scope, reopening the studio invoked QRDesignStudio outside
of rendering and threw. The FIRST open is unaffected, because the cache is still
empty there. It shipped, it was live, and it was caught on production only after
the probe was extended to close and reopen: /qr-tools/url reported open ok (3/3
markers, 12 canvases, 2 colour inputs) and reopen FAILED in the same line.
The general form is worth keeping: a probe that exercises a cached path once
exercises only the uncached branch of it.

INSTRUMENT DEFECT 2, in the probe, and it is the same shape as the code it
measures. Its warm check stopped polling at the FIRST new script and then
inspected only that one, so a prefetch landing first would report the studio
chunk as missing on a build warming perfectly. It polls until the studio chunk
itself appears now, checking each new script exactly once.

A11Y DEFECT found by writing the probe. Its first revision selected the modal as
querySelector('[role="dialog"]') and got the COOKIE BANNER, which carries that
role on every page in the site — so it reported the studio as opening-but-empty
on a build where the studio was a plain static import that worked fine. A
generic role selector on a page with more than one dialog is not a selector for
anything. Chasing it turned up why there was no studio dialog to find:
QRDesignStudio is a full-screen modal with no role, no aria-modal and no
accessible name, so a screen reader was never told it opened. Three attributes
fix the announcement, taken here rather than deferred because M155 introduced
the inconsistency — the loader placeholder announces itself as a dialog. The
rest (focus trap, Escape, focus restoration) is a real gap, logged as its own
backlog item across every modal in the site rather than smuggled in here.

Guards: npm run test:layout, 17 assertions, 7 mutations verified. Two of the new
assertions were written too loose and BOTH survived their first mutation, in the
two classic shapes — `/\.catch\(/` matched warmDesignStudio's own swallow-catch
on a file whose load path had lost its rejection handler (a marker that is not
unique to the thing asserted, the M138 "onAuthStateChange" error), and
`/setAttempt/` matched `setAttemptX`, the substring trap, in a guard whose whole
job is to notice a rename. They assert the state a failure must produce now,
with word boundaries.

npm run probe:studio is the other half, and it cost four wrong instruments to
get right — worth recording because each one reported a WORKING build as broken,
which is the expensive direction for a guard to fail in. The deferral itself was
verified and unchanged the whole time.

  1. It dispatched new PointerEvent("pointerenter") on the button. React derives
     onPointerEnter from the BUBBLING pointerover/pointerout pair at the root and
     never listens for pointerenter, so the handler was never called. Dispatching
     the event a component "has" is not the same as producing the event a browser
     produces. It is a real CDP mouse move now.
  2. It diffed loaded scripts against a pre-hover snapshot. Next prefetches ~25
     route chunks while you hover the homepage and the studio's chunk kept
     falling outside whatever window the diff caught. The question that matters
     has no race in it — is the chunk loaded BEFORE the click? — and needs no
     baseline, since measure-eager-bundle separately proves it is not eager.
  3. It read the chunks with in-page fetch(), which competed with the page for
     connections and ran out of budget after 13 of 25. Node fetches them in
     parallel now, with a verdict cache that outlives the page.
  4. Even fixed, the homepage passed one run in three while /qr-tools/url passed
     every time. The homepage's QR card LEVITATES (.qx-float-stage is a
     continuous transform), so a centre measured at one instant has drifted by
     the time CDP dispatches the move milliseconds later: the pointer landed
     beside the button, no crossing occurred, no warm. It asks the browser's own
     question now — trigger.matches(":hover") — and re-aims until the pointer is
     really on it.

Three consecutive runs green on both URLs after that: warm 500 ms, open 250 ms,
reopen ok, zero page errors, 3/3 studio markers, live canvas and colour inputs.
The general lesson, which is the same one three tranches of this mission have
now paid for: wait for the condition, not the clock, and prefer the question
that has no race in it over the one that needs a baseline.

Live verification: / and /qr-tools/url and /qr-tools/wifi all 200,
/qr-tools/url self-canonical, homepage title intact, sitemap unchanged at 814 so
no IndexNow submission.

Files: components/QRDesignStudioLoader.tsx (new),
scripts/probe-design-studio.mjs (new), app/page.tsx, components/QRGenerator.tsx,
components/QRDesignStudio.tsx, scripts/test-eager-layout.mjs,
scripts/measure-eager-bundle.mjs, package.json.
Commits 2be221f, bedf9da, 0e59099, 5e60a2e on design-v2.

## M156b — the pre-hydration file picker, verified live (2026-08-02)

M156 shipped the fix (f5b61d7); this closes it. The three URLs the item named
now serve `input#image-tool-file` with `disabled=""` + `aria-describedby=
"image-tool-status"` where the recorded pre-deploy baseline had no `disabled`
attribute at all, each localized twin carrying its own status copy (EN/RU/UZ)
with zero English leakage, and `label[for]` still pairing so nothing a crawler
reads has moved.

The verification worth reusing: the item's own recorded check was curl-only,
and curl can see the PRE-hydration state exclusively — a control mistakenly
left disabled after the engine mounts would satisfy every assertion in it while
being a worse defect than the one being repaired. probe-hydration.mjs on the
deployed pages answers the other half: shellStillPresent false, liveDropzone 1,
toolAreaHydrated true. The busy shell is discarded when the engine takes over,
so the disabled state cannot outlive its window. Guard: test:shell 39/39.

Also this session: `npm run verify:daily` ran as the first act of the UTC day —
its first use as a command rather than a prose checklist. Green throughout.

## M157 — every dialog got Escape, a focus trap and focus restoration (2026-08-02)

Six live modals, five different answers between them. The sweep is the reusable
part: grepping `role="dialog"` only finds dialogs that already know they are
dialogs, which is exactly the blind spot that let this exist. Sweeping the
overlay SHAPE (`fixed inset-0`, non-decorative) found two more with no role at
all — AiKit's fullscreen viewer and DesignPanel.

lib/use-modal-a11y.ts is the single implementation. The four things that are
easy to get wrong are all in it: capture the trigger before focus moves inside,
survive the trigger unmounting, let only the topmost dialog answer Escape, and
stand down on `defaultPrevented` — CommandSearch binds Tab to cycle its filters,
so an unconditional trap would have deleted a working feature.

CookieConsent was deliberately not touched: it is a banner, not a modal.
DesignPanel is unimported dead code — allowlisted in the guard WITH a re-check
that it is still unimported, so the exemption expires the day anything uses it.

Verified on production with the same instrument before and after: focusMovedIn
false→true, tabsHeldInside 0→10, escapeClosed false→true, focusRestored
false→true, on / and /qr-tools/{url,wifi,vcard}. probe:studio still 2/2, so
M155's deferral and reopen are untouched.

Guard: npm run test:modal-a11y — 46 assertions, 11 mutations verified. It redoes
the sweep every run rather than asserting over a hand-listed set, and it earned
that on its first run by failing against QRDesignStudioLoader, which I had not
wired: a dialog with no focusable control in it at all, where Escape is the only
exit and there was none.

## M159 — pdf-lib on intent (Aug 2)
Byte attribution on production found ~413 KB of eager pdf-lib on ~20 /pdf-tools/* routes; thirteen clients now reach it through lib/pdf-lib-loader (module-scope cache, rejected promise NOT cached, warm on file select where the first use is behind a later button). merge 1065.0 -> 651.6 KB, split 1064.8 -> 651.5, rotate 1047.0 -> 633.6; controls unmoved. Guards: test:layout 22 -> 33 assertions, and probe:pdf-defer — real headless Chrome driving a 3-page fixture through the real file input on production, baselined red against the pre-split build first, 6/6 green after. measure-eager-bundle hardened to fail loudly instead of reporting 0.0 KB. Lesson: a grep finds only gates visible as markup; pdf-lib was click-gated with no boolean anywhere. Attribute first, grep second.

## M159b — barcode tool labels split (Aug 2)
The template sweep found /barcode 100 KB above the floor: BarcodeClient (a client component) imported barcodeTool() out of the localized page registry and shipped all of it — every symbology's copy, caveats and FAQs in three languages — to every barcode route including the RU/UZ twins. Extracted to lib/barcode-tool-i18n.ts (7.2 KB; registry keeps 50.7 KB for the server pages). Live: /barcode 724.7 -> 645.6 KB, probe-barcode green in all three languages with 0 page errors. test:layout 33 -> 35. Sweep verdict: 15 of 17 templates are on the shared floor, no second pdf-lib exists; the homepage (840.7 KB) is the only page left materially above it.

## M160 — one language per visitor, not twelve (Aug 4)
lib/home-i18n.ts (56.2 KB) and lib/home-faq-i18n.ts (29.6 KB) were two twelve-language registries — zh hi es ar fr pt id de ja tr ur bn — and three CLIENT components (app/page.tsx, HomeFaq, NewsletterSection) each merged one slice at module scope, which is a static import and therefore a download for everyone. Not one of those twelve is en, ru or uz; those are authored inline. So the audience the site actually has downloaded 85.8 KB of copy it cannot read. Both registries are now one generated module per language (a language = one request, not two registries) behind loadHomeUi() in lib/home-i18n/index.ts; en/ru/uz resolve to null with no round trip. Deferring is safe here because `lang` is useState("en") hydrated from localStorage in an effect, so every non-English visitor already renders English first — this extends an existing flash rather than adding one, and a crawler sees English either way. There is deliberately NO aggregate module: one would be a single stray import from undoing it, and Node-side tools read the directory from scripts/ instead, so the boundary is structural rather than asserted. Live: homepage eager set 842.0 -> 776.1 KB (-65.9 KB), marker YES -> no. Guards: test:home-i18n (13 assertions, 7 mutations) + probe:home-i18n, which drives production per language in real headless Chrome — curl cannot see this at all, since the language is in localStorage and the copy arrives via import().

## M161 — the honesty pass never reached the translations (Aug 4)
M143 corrected the English answer to homepage FAQ 2 on Jul 28; the twelve translations were a separate file nobody touched, so for a week they kept telling readers in twelve languages that their files NEVER leave the device. False — /pdf-to-word's best-quality mode uploads, as do the AI and video tools — and it is the one claim most likely to decide whether someone submits a sensitive document. The three authored languages were stale the other way, still naming PDF compress as server-side after M127 moved it fully on-device. All fifteen corrected, and the new copy names no tool list beyond one example, because enumerating is what went stale twice. The real bug was that nothing linked the English to its translations, so test:home-i18n now fingerprints the authored English FAQ (change it and the test goes red until the twelve are revisited) and requires every translated answer to MENTION A SERVER — the first draft banned the old sentence per language and failed on correct copy, because a substring cannot tell a false claim from a qualified one.

## M162 — twelve languages had an English heading (Aug 4)
The homepage hero card's heading was an inline ternary (`lang==="uz" ? … : lang==="ru" ? … : "CREATE QR CODE"`), so every language outside those three fell through to English directly above a subtitle that WAS localized — on the most-crawled page on the site — while `cardTitle` sat translated in all fifteen languages and rendered in none. en/ru/uz keep their short authored forms (the CSS uppercases already, and the full string wraps the narrow card on a phone), so nothing changes visually for the current audience; the other twelve now render their own. Found by asserting a string the page ought to render: the probe's first draft checked cardTitle for every language and reported the ENGLISH CONTROL as broken, and a failing control means the instrument is accusing itself. Guard: test:home-i18n asserts the heading reads t.cardTitle and that no `lang === "ru"` test survives in that markup — the shape is the defect. Verified live 8/8 languages including RTL. Instrument note: the probe had to be fixed first — Runtime.evaluate issued straight after Page.navigate was binding to the outgoing /robots.txt document and grading THAT, which is what "de and zh are broken" looked like while the page was correct.

## M163 — TopNav's gesture-gated panels leave the eager set of every page

M138 took TopNav's imports and left its markup, and the markup was where the
rest of the weight sat: a 50-entry DROPDOWNS mega-menu building a react-icons
element per entry at module scope, the account menu body, and the mobile
sheet's account grid — 24 of the component's 29 icons, not one of them
reachable without a deliberate hover or tap, all of them in the eager script
set of ~800 pages because TopNav is mounted by the root layout. Moved verbatim
to components/nav/NavPanels.tsx behind three dynamic imports that share one
chunk. Measured on production, canary intact on every read: / 776.4 -> 766.4
KB, /qr-tools/url 662.3 -> 652.3 KB, 17 eager scripts either side. -10.0 KB on
every page, identical on both templates — and far less than 50 entries and 24
icons suggest, because icon components are small SVG path functions and the
registry is mostly short strings. Counting entries is not counting bytes.

The deferral cost an interaction and it had to be bought back. probe:nav-panels
timed the first homepage mega-menu at ~1000 ms after hover against ~500 ms on a
tool route, because the chunk's fetch queues behind that page's hydration. The
panels are now warmed on requestIdleCallback too, gated to a fine pointer at xl
and up so no phone downloads a panel it can never hover.

The split deliberately stops at the ten primary nav links, on both breakpoints:
a dynamic import can fail, and on a phone the mobile sheet is the only
navigation there is. Everything deferred degrades to "a menu did not open",
never to "the visitor is stuck", and test:layout asserts that boundary.

Guards: test:layout 35 -> 41 assertions; new probe:nav-panels drives real
headless Chrome over three legs (desktop hover, desktop click, mobile tap).
Nine mutations run and two survived their first draft — `requestIdleCallback`
matched `requestIdleCallbackX` (the substring trap, third time in this repo),
and the probe sampled hydration instead of polling it, so it reported the
homepage's burger as dead on a build where it works. Both fixed; all nine
caught now. Files: components/TopNav.tsx, components/nav/NavPanels.tsx,
scripts/test-eager-layout.mjs, scripts/probe-nav-panels.mjs, package.json.
