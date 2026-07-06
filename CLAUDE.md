# QRIX PERMANENT DEVELOPMENT RULES

Mandatory for every future mission. Read this, not the whole repo.

## PRIMARY GOAL
Maximize implementation, minimize tokens. Spend tokens on code, not analysis.

## REPOSITORY
Repo is already correct; previous missions are done. Do NOT re-analyze the project, scan every folder, or inspect unrelated files. Only open files the current mission needs. Trust the existing architecture. Reuse existing components, utilities, hooks, services and animations.

## IMPLEMENTATION
Think briefly, implement immediately. No long reasoning, no repeating the prompt, no explaining obvious changes, no roadmaps, no plans, no requirement summaries. Write production code.

## FILES
Modify only required files. Never touch/reformat/rename/move unrelated modules. No duplicate components.

## DEPENDENCIES
Never install packages unless absolutely required. Prefer existing libs, browser APIs, lightweight solutions.

## PERFORMANCE
Optimize bundle size. Lazy-load where appropriate. Avoid unnecessary renders. Keep Lighthouse > 95.

## UI
Keep the existing design language, animations and premium quality. Never redesign unrelated pages.

## SEO (auto for every new tool)
Metadata · OpenGraph · Twitter Card · JSON-LD · FAQ · Breadcrumb · Related Tools · Internal Links · Sitemap.

## SEARCH (auto-register every new tool in)
Navigation · Search · Dashboard · Category · Sitemap · Related Tools.

## AI / VIDEO (APIs or FFmpeg unavailable)
Never skip the tool. Build full UI + architecture + upload + preview + result + download + future connector + mock/on-device processing. Do not postpone.

## OUTPUT
Short responses. Report only: Completed · Remaining · Problems.

## MISSION
Only the current mission. Ignore unrelated modules. Never restart, recreate or rebuild completed work/routes.

## TOKEN SAVER
Never scan the full repo unless absolutely required. Never verify completed modules or inspect unrelated folders. Reuse code. Minimize context. Implementation over explanation.

## PROGRESS
Keep progress.md updated: Completed Missions · Current Mission · Remaining Missions · Important Notes · Current Architecture · Next Mission. Nothing else.

---

## Architecture quick-reference (so you don't scan)
- Next.js App Router + TS + Tailwind v4. Palette = CoolM5 (neon-yellow `#e1ff04`, black, lilac `#bba9ff`); tokens in `app/globals.css`. Display font SUSE.
- **Tool platform pattern** (reuse this for any new category): `lib/<x>-tools-meta.ts` registry (slug, title, desc, emoji, grad, category, engine, status, keywords, intro, about, steps, faqs) → drives `app/<x>-tools/page.tsx` (landing) + `app/<x>-tools/[slug]/page.tsx` (SSG, `generateStaticParams`, `pageMeta`, `softwareAppLd`+`breadcrumbLd`+`faqLd`) → `components/<x>/<X>EngineRegistry.tsx` maps `engine` key to a lazy `dynamic(ssr:false)` client.
- **Shared UI primitives:** `components/ai/AiKit.tsx` (`AiDropzone` drag/click/Ctrl+V, `BeforeAfter`, `AiProcessing`, `AiResultBar`, `CloudNotice`). Motion via `data-reveal`/`data-stagger`/`data-magnetic` (see `components/MotionLayer.tsx`). SEO helpers in `lib/seo.ts` (`pageMeta`, `jsonLd`, `breadcrumbLd`, `softwareAppLd`, `faqLd`).
- **Cloud connector:** `lib/ai-connector.ts` + `app/api/ai/process/route.ts` (env-gated `NEXT_PUBLIC_AI_ENGINE`). Preview-status tools show full UI + on-device fallback and go live with env only.
- **Registration points for a new tool:** `components/TopNav.tsx` (NAV labels EN/RU/UZ + DROPDOWNS), `lib/search-index.ts`, `app/sitemap.ts`.
- **Build note:** local machine is low-RAM; `next build` may OOM at the trace step but the code is fine (Vercel builds clean). Verify with `tsc --noEmit` + preview server, not full builds.
- Commit with `git -F <file>` (heredoc quoting breaks in PowerShell). End messages with the Claude co-author trailer.
