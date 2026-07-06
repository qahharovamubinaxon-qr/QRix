# QRix Progress

## Completed Missions
- **Core platform** — QR Tools (30+ types + decoder/scanner), PDF Tools (21), Image Tools (7), Barcode Studio (10 formats), Link-in-Bio (themes/patterns/photo+bg upload/iPhone mockup), QR Poster Maker, Dashboard, Pricing, Legal.
- **Monetization** — Referral system (Supabase profiles/referrals, migration 0002), Stripe Pro billing (checkout/webhook/portal, migration 0003, env-gated), AdSense slots (env-gated), Newsletter (migration 0004).
- **SEO** — 54 blog articles, sitemap, robots, RSS, per-page metadata + JSON-LD, generated icons/OG.
- **Premium SaaS layer** — CoolM5 reskin, MotionLayer (scroll-reveal/stagger/magnetic/spotlight), Cmd+K CommandSearch, TrustedBy marquee, HomeFaq, LatestPosts, Newsletter, route transitions, loading bar.
- **Mission 1 — AI Tools** (`e184f18`): 28 tools at `/ai-tools`, config-driven, on-device engines + cloud connector.
- **Mission 2 — Video Tools** (`48911ab`): 29 tools at `/video-tools`, canvas→MediaRecorder pipeline + gifenc + Web Speech + connector.

## Current Mission
None — awaiting next mission.

## Remaining Missions
- Connect real cloud AI/video engine (env only: AI colorize/inpaint/translate/imagegen, video MP4 export/long reverse/SRT auto-translate).
- Add "Video Tools" + "AI Tools" cards to Homepage category section.
- Blog articles for AI + Video tools.
- Dashboard integration (recent files, favorites).
- i18n localized URLs.
- Deploy to Vercel.

## Important Notes
- Local machine low-RAM: `next build` may OOM at trace step; code is fine, verify via `tsc --noEmit` + preview server. Vercel builds clean.
- Preview/connector-status tools are fully built UI; activate with env vars only.
- Env to go live: `SUPABASE_SERVICE_ROLE_KEY`, Stripe keys + `NEXT_PUBLIC_BILLING_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `AI_ENGINE_URL`/`AI_ENGINE_KEY` + `NEXT_PUBLIC_AI_ENGINE`. Run migrations 0002–0004.

## Current Architecture
Next.js App Router + TS + Tailwind v4, CoolM5 palette. Tool categories follow one pattern: `lib/<x>-tools-meta.ts` registry → `app/<x>-tools/page.tsx` landing + `[slug]/page.tsx` SSG → `components/<x>/<X>EngineRegistry.tsx` lazy-maps engine keys to clients. Shared primitives in `components/ai/AiKit.tsx`; SEO in `lib/seo.ts`; motion via `data-reveal`/`data-magnetic`. Register new tools in TopNav + search-index + sitemap. Supabase backend, Stripe billing, all env-gated.

## Next Mission
Awaiting instruction.
