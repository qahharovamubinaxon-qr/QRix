# QRix Permanent Development Rules

This file is the permanent development specification for this repository.
Every future mission MUST read and follow CLAUDE.md before writing any code.

## Project Vision

QRix is a production-ready SaaS platform. It is NOT a demo. It is NOT a template.
Every feature must feel premium.

Target quality: Stripe · Linear · Vercel · Framer · Adobe Express · Canva · TinyWow · FreeConvert.

Always write production-quality code.

---

# Existing Project Rules

The repository already contains working functionality.

- Never delete working features.
- Never remove routes.
- Never remove tools.
- Never remove SEO.
- Never overwrite working code unless absolutely necessary.
- Only improve. Only extend. Only optimize.

---

# Mission Rules

- Each user request is ONE mission.
- Focus only on the current mission.
- Ignore unrelated modules.
- Never redesign unrelated pages.
- Never recreate completed work.

---

# Repository Rules

Assume previous missions are already completed.
Do NOT verify the whole repository. Do NOT scan the whole project.

Read ONLY: **CLAUDE.md** and **progress.md**.
Inspect ONLY files required for the current mission.

Reuse existing: components · hooks · utilities · animations · services · routes · SEO helpers · architecture.

---

# Token Saver Rules

- Always minimize token usage.
- Spend tokens writing production code.
- Avoid long explanations, long planning, unnecessary reasoning.
- Avoid repeating requirements.
- Avoid repository-wide analysis.
- Implement immediately.

---

# File Rules

- Modify only required files.
- Never touch unrelated modules.
- Never reformat unrelated files.
- Never rename or move files unless necessary.
- Avoid duplicate components.

---

# Dependency Rules

- Do not install packages unless absolutely necessary.
- Prefer browser-native APIs, then existing libraries.
- Keep the bundle lightweight.

---

# Architecture Rules

- Keep the project modular; use reusable components.
- Separate UI from business logic; business logic from data access.
- Follow SOLID principles. Avoid duplicated code. Keep the project scalable.

---

# UI Rules

Maintain current design language. Premium quality only:
minimal · elegant · fast · responsive · accessible · smooth.
Use lightweight animations. Maintain consistent spacing.

---

# Animation Rules

- Prefer CSS animations.
- Use IntersectionObserver.
- Use GPU transforms.
- Avoid heavy animation libraries.
- Respect `prefers-reduced-motion`.

---

# SEO Rules

Whenever creating a new page automatically include:
SEO metadata · OpenGraph · Twitter Card · Canonical · JSON-LD · Breadcrumb · FAQ · Related Tools · Internal Links · Sitemap integration.

---

# Search Rules

Whenever creating a tool automatically register it inside:
Navigation · Search · Dashboard · Categories · Related Tools · Sitemap.

---

# AI Rules

If AI APIs are unavailable — never skip the tool. Build:
complete UI · upload · preview · settings · processing · result · download · architecture · future API connector · mock processing.

---

# Video Rules

If FFmpeg is unavailable — still build:
complete UI · timeline · preview · queue · workflow · architecture · future integration.
Never postpone implementation.

---

# Image Rules

- Never remove existing Image Tools.
- Only extend. Never recreate existing tools.

---

# Performance Rules

- Target Lighthouse 95+.
- Optimize rendering. Lazy loading. Code splitting. Image optimization.
- Avoid unnecessary re-renders.

---

# Output Rules

Keep responses short. Do not explain every file. Do not describe obvious changes.

Final report should include only:
**Completed · Files Modified · Commit Hash · Remaining Work**

---

# Mandatory Git Workflow

Before finishing EVERY mission always execute:

1. `git status`
2. If there are modified or untracked files: `git add .` and create a meaningful commit. Commit all completed work.
3. If local commits have not been pushed: push them to GitHub.
4. Update progress.md.
5. Run `git status` again.

The repository must finish in a CLEAN state.
Never finish a mission with uncommitted work.

---

# Commit Strategy

If a mission becomes too large:
- Split it into logical milestones.
- Commit each completed milestone.
- Never keep a huge amount of uncommitted work.
- Always keep the repository recoverable.

---

# Progress Rules

Always update progress.md. Include:
Completed Missions · Current Mission · Remaining Missions · Current Architecture · Current Tool Count · Current Categories · Last Commit Hash · Current Git Branch · Important Notes · Known Limitations · Next Recommended Mission.

---

# Quality Rules

Everything must be: production ready · reusable · scalable · maintainable · responsive · polished.
No placeholder pages. No demo code. No temporary hacks.

---

# Final Rule

- Never restart the project.
- Never rebuild completed modules.
- Always continue from the latest repository state.
- Always preserve existing functionality.
- Always prioritize writing production code over explanations.

---

# Architecture quick-reference (so you don't scan)

- Next.js App Router + TS + Tailwind v4. Palette = CoolM5 (neon-yellow `#e1ff04`, black, lilac `#bba9ff`); tokens in `app/globals.css`. Display font SUSE.
- **Tool platform pattern** (reuse for any new category): `lib/<x>-tools-meta.ts` registry (slug, title, desc, emoji, grad, category, engine, status, keywords, intro, about, steps, faqs) → drives `app/<x>-tools/page.tsx` (landing) + `app/<x>-tools/[slug]/page.tsx` (SSG, `generateStaticParams`, `pageMeta`, `softwareAppLd`+`breadcrumbLd`+`faqLd`) → `components/<x>/<X>EngineRegistry.tsx` maps `engine` key to a lazy `dynamic(ssr:false)` client.
- **Shared UI primitives:** `components/ai/AiKit.tsx` (`AiDropzone`, `BeforeAfter`, `AiProcessing`, `AiResultBar`, `CloudNotice`). Motion via `data-reveal`/`data-stagger`/`data-magnetic` (`components/MotionLayer.tsx`). SEO helpers in `lib/seo.ts` (`pageMeta`, `jsonLd`, `breadcrumbLd`, `softwareAppLd`, `faqLd`).
- **Backend (Mission 6):** `prisma/schema.prisma` = canonical data model. `lib/server/*` = env-gated drivers with working mocks: `config` (all env switches), `db` (in-memory, Prisma-ready), `auth` (sessions/RBAC/magic-link/reset), `api` (route wrapper: validation, rate-limit, pagination, errors), `security`, `cache`, `storage` (local/S3/supabase), `queue` (jobs retry/cancel), `billing` (plans/coupons/trials/quotas), `email`, `cms`, `api-keys`, `analytics`, `providers/{ai,video,image}`. REST at `app/api/v1/**`. Admin panel: `/admin` (`components/admin/AdminPanel.tsx`).
- **Registration points for a new tool:** `components/TopNav.tsx` (NAV labels EN/RU/UZ + DROPDOWNS), `lib/search-index.ts`, `app/sitemap.ts`.
- **Client prefs:** `lib/user-prefs.ts` (localStorage pub/sub + hooks) drives favorites/history/settings UI; server mirror via `/api/v1/me/*`.
- **Build note:** local machine is low-RAM; `next build` may OOM at the trace step but the code is fine (Vercel builds clean). Verify with `tsc --noEmit` (ignore `.next/` errors) + preview server, not full builds.
- Commit with `git -F <file>` (heredoc quoting breaks in PowerShell). End messages with the Claude co-author trailer.
