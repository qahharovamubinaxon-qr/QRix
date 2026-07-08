# QRix — the all-in-one browser toolbox

**185+ premium tools for QR, PDF, image, video, AI and 3D — processed on your device, wrapped in a world-class SaaS platform.**

- **Tools**: 30+ QR types with design studio & dynamic links · 21 PDF tools · 72 image tools · 28 AI tools · 29 video tools · image-to-3D with GLB/OBJ/STL/USDZ export · barcode studio · link-in-bio · bulk pipelines
- **Platform**: auth (credentials/Google/GitHub/magic-link) · workspaces with roles & granular permissions · credit engine · Stripe billing with trials & coupons · public REST API + webhooks + JS SDK (`/developers`) · global ⌘K search · enterprise analytics · admin panel · owner-only Telegram admin bot
- **Design V2**: original visual identity — aurora backgrounds, orbiting hero, glass navbar, token-driven motion system, illustration language, CRO-tuned pricing

## Quick start

```bash
npm install
npm run dev          # http://localhost:3000
npm run typecheck    # tsc --noEmit
```

Everything runs with **zero configuration** on mock drivers. Add env keys to go live — see `.env.production.example` for the full catalog (PostgreSQL/Prisma, Redis/Upstash, S3/R2/B2/MinIO, Stripe, Resend/Mailgun/SMTP, 11 AI providers, Telegram bot).

## Production

```bash
# Docker (app + Postgres + Redis + MinIO)
docker compose up -d --build

# or Vercel: connect the repo, set env, done (vercel.json ships cron schedules)
npx prisma migrate deploy && npm run db:seed
```

Health: `/api/health` (liveness) · `/api/ready` (readiness) · Admin: `/admin` · API docs: `/developers` · OpenAPI: `/api/v1/openapi.json`

## Repository map

`app/` routes & API (`/api/v1/**` public REST) · `components/` UI · `lib/` client meta/registries · `lib/server/` backend (mock-first, env-gated drivers) · `prisma/` schema & seed · `CLAUDE.md` development rules · `progress.md` mission log · `CHANGELOG.md` releases

---
© QRix. All rights reserved.
