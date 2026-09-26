---
name: naqsh-lessons
description: MUST load before writing, fixing or reviewing ANY code in the vibecoding-uz (Naqsh) repo. Lists the mistakes this project already paid for (layout overlap, API envelope mismatch, live-DB SQL, Telegram, secrets, fake content, races) with the check that prevents each, plus which expert skill to load for each task type.
---

# Naqsh lessons: don't repeat mistakes we already fixed

Every lesson below comes from a real `fix(...)` commit or incident in this repo. Before you say "done", run
the check for every lesson your change touches.

Project conventions (read once per task, they beat any generic skill advice):
`docs/CODER_AGENT_RULES.md` (architecture, security, definition of done) and `docs/design-system.md` (tokens, UI).

Automated: `npm run lessons:check` enforces L6, L13, L15, L16 and L19. It also runs as a pre-commit hook and in CI
(`.github/workflows/ci.yml`, together with tsc and vitest). Known debt is listed in `scripts/lessons-baseline.json`;
fixing an item there means removing it from that file. Everything else below still needs your own check.

## 1. Load the right expert skill first

| Task | Load these skills (skill tool) |
| :--- | :--- |
| Any bug, failing test, "it doesn't work" | `systematic-debugging` (find the root cause before you change anything) |
| New feature or behavior change | `brainstorming` → `writing-plans` → `test-driven-development` → `incremental-implementation` |
| Several independent tasks | `dispatching-parallel-agents` / `subagent-driven-development` |
| UI, page or component | `frontend-ui-engineering`, `vercel-react-best-practices`, `web-design-guidelines`, `accessibility` |
| Visual redesign or new look | `frontend-design`, `ui-ux-pro-max` |
| Speed / LCP / CLS | `core-web-vitals`, `performance`, `vercel-optimize` |
| SEO, meta, sitemap, 404s | `seo`, then `marketing-sales-growth` → seo-audit / schema / ai-seo |
| API route or contract | `api-and-interface-design` |
| DB schema, SQL, migration | `supabase-postgres-best-practices`, `deprecation-and-migration` |
| Auth, payments, webhooks, secrets | `security-and-hardening`, `sharp-edges`; review with `differential-review` |
| Copy, pricing, offers, funnels, Telegram nurture | `marketing-sales-growth` |
| Spec, PRD, UX copy, design critique | `product-design-hub` |
| E2E / browser checks | `webapp-testing` |
| Before saying "done" | `verification-before-completion` |
| Before merge | `requesting-code-review`, then `finishing-a-development-branch` |

## 2. Lessons (mistake → root cause → check)

| # | Mistake we made | Check that prevents it |
| :--- | :--- | :--- |
| L1 | "Done / 0 errors" claimed while build was broken | Paste the real output of `npx tsc --noEmit`, `npx vitest run` and `npm run build` in the report. No output = not done. |
| L2 | Unit tests passed on mocks, but SQL failed on the live DB (camelCase `"userId"` instead of snake_case; raw `Date` params threw `ERR_INVALID_ARG_TYPE`) | For every new `sql\`` query, run the service once against the real DB (tsx script with `.env`). Column names are snake_case. |
| L3 | Home page story/hero: overlap, padding, phone layout broke 4+ times | Screenshot 375, 768, 1024 and 1440 px (Playwright) and look at them before "done". No horizontal scroll. Check open dropdowns, drawers and modals too (`overflow-hidden` once clipped them). |
| L4 | Tablet (768–1024) had no navigation at all | Every nav or breakpoint change → check all 4 viewports, not just phone and desktop. |
| L5 | Gold CTA text and terminal label were unreadable (contrast) | WCAG AA: text ≥ 4.5:1, large text ≥ 3:1. Check in every theme. |
| L6 | 63 hard-coded hex classes after an audit said "replaced" | `grep -rEn "text-\[#\|bg-\[#\|border-\[#" src` must be empty (exceptions: WEBSITE_AUDIT_SPEC.md part 3). |
| L7 | Dashboard parsed the whole v1 envelope `{ data, meta? }` instead of `.data` → always showed an error | When you change an API response, grep every consumer (`fetch(`, hooks, admin pages) and update + test it. Response shapes live in Zod schemas. |
| L8 | New routes missing from OpenAPI; analytics events not matching the W8A contract | New `/api/v1` route → register it in OpenAPI (the completeness test fails otherwise). Events use the existing contract types. |
| L9 | Telegram admin replies ignored (sender read from the wrong field) | Telegram sender = `message.from`. Test with a real update payload fixture, not a hand-made object. |
| L10 | Missing `ANTHROPIC_API_KEY` sent an "AI failed" Telegram alert on every message | Missing optional env → degrade silently and log once. Missing security secret → fail closed. |
| L11 | Parallel token refresh killed the whole session family; chat outbox out of order | Anything that two requests can hit at once: atomic claim (single UPDATE ... WHERE ... RETURNING) or a transaction lock, plus a concurrency test. |
| L12 | Next.js 15 dynamic `params` used synchronously → build broke | `params` / `searchParams` are Promises: `const { slug } = await params`. |
| L13 | Unknown `/kurs/x`, `/blog/x` returned 200 (soft-404) | Missing entity → `notFound()`. Test the unknown-slug case. |
| L14 | Fake calculator, invented testimonials, demo OTP shipped | Honesty rule: never invent numbers, reviews, students or logos. Placeholders must look like placeholders. |
| L15 | Supabase password hard-coded in git history | Never write secrets. `grep -rEn "postgres://[^ ]*:[^ ]*@" src | grep -v "@localhost"` must be empty (the localhost dev fallback in `src/db/index.ts` is allowed). |
| L16 | Vercel functions far from DB → slow; env missing in Preview | Keep `syd1` in `vercel.json`. New env var → check `vercel env ls` for Production and Preview. |
| L17 | main/master desync; linked to a deleted duplicate Vercel project | Deploy only with `git push origin main && git push origin main:master`; project = `master-2`. |
| L18 | Agents OOM-killed; an agent killed itself with `pkill -f` | Heavy commands via `scripts/waves/locked.sh`; stop servers with `kill $(lsof -t -i:<port>)`. |
| L19 | Files grew past 300 lines, hard to review | Every file ≤ 250 lines. Check `wc -l` on changed files. |
| L20 | Release agent smoke-tested `master-2.vercel.app` (someone else's project) and reported prod 404s | Production domain is **`master-2-jade.vercel.app`**. Get it from `vercel inspect <prod deployment>` → Aliases, never guess. |
| L21 | `dynamicParams=false` "fixed" soft-404 but a fresh prod build still returned 200 | Root `loading.tsx` streams first; Next adds `noindex` on those pages. Verify status fixes with curl on a FRESH `next build` + `next start`, never on an old server. |
| L22 | Smoke-tested the per-deployment URL (`vercel inspect` → `*-<hash>-<scope>.vercel.app`): Deployment Protection answers **302 → "Redirecting..."** (15 bytes), so old and new deployment bodies compared byte-identical and it looked like the deploy never landed | Curl the production **alias** (`vercel inspect` → `Aliases` block), not the deployment URL. And check the status before comparing content: `curl -s -o /dev/null -w '%{http_code}' <url>` must be 200 before you trust a body diff. Same family as L20 — never guess or improvise the prod URL. |
| L23 | A "connecting thread" line inside a grid step (`h-full` on a child of a grid item whose parent has `items-start`) resolves to **content** height, not the row height — `align-self:stretch` is overridden by the parent's `align-items:start`, so each thread silently stopped ~45% short and the "weave" rendered as three disconnected ticks | Don't measure layout off a screenshot (it is resampled — my px-vs-CSS estimate was wrong twice). Measure in the page: compare `rail.getBoundingClientRect().height` with `li.getBoundingClientRect().height` and read `getComputedStyle(rail).alignSelf`. Simplest robust fix: draw **one** absolute thread on the list container (`absolute inset-y-0` on the `<ol>`) with per-step knots on it, instead of one segment per row. |
| L24 | A new Tailwind color class was assumed to exist because the token exists; `border-border-onBrand/20` and `bg-brand-surface/40` emit **no CSS at all** (alpha modifiers need `<alpha-value>`, which no color in this config has — `globals.css` bakes the alpha into the token instead) | After `npm run build`, grep the built CSS for **every** class the change introduced: `cat .next/static/css/*.css > /tmp/all.css && grep -cF -- 'bg-border-onBrand' /tmp/all.css` (1 = emitted, 0 = silently dead). Mind the escaping: `grep -F` for `size-1\.5`, and Tailwind writes a comma inside an arbitrary value as `\2c `, so search `font-size:clamp(...)` not the class name. Same trap for a class whose absence is the point: assert the old broken class is 0. |

## 3. After every fix: add a lesson

If you fixed a bug that a check could have caught, add a row to section 2 in the same commit:
the mistake in one line and the concrete command or test that catches it next time.
If the check is a grep or a file rule, add it to `scripts/lessons-check.mjs` as well: code beats text. Keep this file ≤ 200 lines.
If a lesson is general (not Naqsh-specific), say so in your report so the orchestrator can move it into a global skill.
