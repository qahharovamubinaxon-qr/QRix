# Changelog

## v1.0.0 — World-Class Release (2026-07-08)

The first complete QRix release: 19 missions from tool platform to enterprise SaaS.

### Design V2 (Missions 16–19)
- **Design system**: unified tokens (spacing/radius/blur/elevation/motion durations & easings, category accent hues) in `app/design-v2.css`
- **Homepage**: aurora + light-ray living background, orbiting tool icons, floating QR platform with reflection & cursor tilt, animated counters, trust badges, bento feature grid, alternating section backdrops
- **Motion**: 9 reveal variants (fade/left/right/scale/blur/mask/perspective/rotate/depth), scroll parallax, 3D card tilt, button ripple + light sweep, glass navbar shrink, hydration-safe engine, full reduced-motion support
- **Identity**: SVG illustration system (14 subjects, one grammar) powering redesigned 404/500/offline/loading/empty states
- **CRO**: pricing rebuilt — monthly/yearly toggle (save 20%), recommended Pro spotlight, trust strip, pricing FAQ with schema

### Platform (Missions 1–15)
- **Tools**: 30+ QR types + design studio + dynamic/PIN links · 21 PDF · 72 image · 28 AI · 29 video · image-to-3D (GLB/OBJ/STL/USDZ, R3F viewer, 3 free then 20 credits) · barcode · link-in-bio · bulk QR
- **Backend**: mock-first env-gated drivers — PostgreSQL/Prisma, Redis (Upstash REST + RESP TCP), S3-compatible storage (SigV4: AWS/R2/B2/MinIO) with presigned URLs, priority job queue with retries, Resend/Mailgun/SMTP email
- **AI Provider Manager**: 11 pluggable providers (Gemini, Groq, OpenRouter, Cloudflare, HuggingFace, OpenAI, Anthropic, Replicate, Fal, Stability, custom), smart per-task routing, automatic fallback, rate-limit cooldowns, response cache, AES-GCM-encrypted keys, per-provider analytics
- **Monetization**: Stripe billing (4 plans, trials, coupons, refunds, upgrade/downgrade) + credit engine (plan allowances, admin-tunable costs, metering→enforcement flag)
- **Collaboration**: workspaces (personal→enterprise) with invites, built-in + custom roles, granular per-module permissions, shared projects with version history, comments with @mentions, activity log
- **Developer platform**: whole `/api/v1` doubles as public API via scoped keys, OpenAPI 3.1, HMAC webhooks with retries, `/developers` portal (docs, playground, key/webhook managers), downloadable JS SDK
- **Search**: ⌘K palette — full-text across tools/blog/docs/FAQ, filters, trending, pins, voice input, did-you-mean
- **Analytics**: filterable dashboard (countries/devices/browsers/referrers, funnel, retention, heatmap, realtime) with CSV/Excel/JSON/PDF exports
- **Ops**: health/readiness probes, env validation, structured logging, Docker + docker-compose, Vercel crons, PWA with offline page
- **Admin**: 12-tab web panel + owner-only Telegram admin bot (inline-keyboard control, live notifications, daily/weekly/monthly reports, webhook/polling auto-detect)

### Security
Owner/RBAC enforcement, per-key & per-workspace rate limits, CSRF/XSS protections, CSP + security headers, AES-GCM secret storage, device sessions with revocation, banned-account enforcement.
