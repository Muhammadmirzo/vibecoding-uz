---
name: naqsh-lessons
description: MUST load before writing, fixing or reviewing ANY code in the vibecoding-uz (Naqsh) repo. Lists the mistakes this project already paid for (layout overlap, API envelope mismatch, live-DB SQL, Telegram, secrets, fake content, races) with the check that prevents each, plus which expert skill to load for each task type.
---

# Naqsh lessons: don't repeat mistakes we already fixed

Every lesson below comes from a real `fix(...)` commit or incident in this repo. Before you say "done", run
the check for every lesson your change touches.

Project conventions (read once per task, they beat any generic skill advice):
`docs/CODER_AGENT_RULES.md` (architecture, security, definition of done) and `docs/design-system.md` (tokens, UI).

Automated: `npm run lessons:check` enforces L6, L13, L15, L16, L19, L23, L27, L30, L31, L34 and L37. It also runs as a pre-commit hook and in CI
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
| L23 | Supabase Data API roles (`anon`, `authenticated`) had full grants on every public table, RLS off (fixed by migration 0014) | Every new table: `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` in the same migration (lessons-check L23 fails otherwise); after migrating run `npm run db:lockdown-check` (0 grants, RLS everywhere). Webhooks dedupe by provider event id; "check then insert" needs a unique index + upsert/retry (L11). |
| L24 | A "connecting thread" line inside a grid step (`h-full` on a child of a grid item whose parent has `items-start`) resolves to **content** height, not the row height — `align-self:stretch` is overridden by the parent's `align-items:start`, so each thread silently stopped ~45% short and the "weave" rendered as three disconnected ticks | Don't measure layout off a screenshot (it is resampled — my px-vs-CSS estimate was wrong twice). Measure in the page: compare `rail.getBoundingClientRect().height` with `li.getBoundingClientRect().height` and read `getComputedStyle(rail).alignSelf`. Simplest robust fix: draw **one** absolute thread on the list container (`absolute inset-y-0` on the `<ol>`) with per-step knots on it, instead of one segment per row. |
| L25 | A new Tailwind color class was assumed to exist because the token exists; `border-border-onBrand/20` and `bg-brand-surface/40` emit **no CSS at all** (alpha modifiers need `<alpha-value>`, which no color in this config has — `globals.css` bakes the alpha into the token instead) | After `npm run build`, grep the built CSS for **every** class the change introduced: `cat .next/static/css/*.css > /tmp/all.css && grep -cF -- 'bg-border-onBrand' /tmp/all.css` (1 = emitted, 0 = silently dead). Mind the escaping: `grep -F` for `size-1\.5`, and Tailwind writes a comma inside an arbitrary value as `\2c `, so search `font-size:clamp(...)` not the class name. Same trap for a class whose absence is the point: assert the old broken class is 0. |
| L26 | An octagonal `clip-path: polygon(28% 0, 72% 0, …)` frame was put on a wide, short card. Percentages resolve against width *and* height separately, so a 600×200 box got 168px horizontal cuts and 56px vertical ones — a lopsided shape that sliced the corner text off. It looked fine in code and only showed up in a screenshot | Never put a percentage `clip-path` polygon on a non-square box. Keep the octagon on a `size-*` (square) medallion and lay the text out beside it. Then verify by measuring, not by eye (L24): `h2.getBoundingClientRect().width <= section.getBoundingClientRect().width` and screenshot the element at 390 and 1440 in both themes. |
| L27 | Deleting the old home `<Pricing>` (which owned `id="kurs-tanlash"`) silently killed **four** deep links at once — the desktop nav "Kurslar", the mobile drawer entry, the header CTA and the CRM's default `headerCtaLink` — because the anchor lived on the component being removed, not on the route. `tsc`, `vitest`, `build` and the responsive e2e all stayed green | Before deleting any component that carries an `id`, `grep -rn "/#<id>" src` (nav, header, drawer, CRM settings, blog posts) and hand the id to whatever replaces it. Automated: `scripts/lessons-check.mjs` L27 cross-checks every `"/#anchor"` in `src/components/layout`, `src/features/crm`, `src/config`, `src/components/ui` against the `id="…"` set of all `src/**/*.tsx` and fails when a deep link has no target. It reads `git ls-files`, so an untracked new file is invisible to it — `git add` before trusting a green run |
| L28 | A "server prefetch" client island imported a value (`hasActiveEnrollment`) from `features/*/server/*`, pulling `@/db` into the client bundle and breaking runtime | Client islands (`"use client"`) must only import types (`import type`) from `features/*/server/*`. Shared pure rules belong in `features/*/domain/`. |
| L29 | Performance fix evaluated on stale server (`next start` still on port, `kill $(lsof -t -i:<port>)` silently did nothing) | Confirm port is free with `ss -ltnp | grep :<port>` and kill PID directly. Verify curl output matches new build. |
| L30 | The public `/shahodatnoma/[code]` page fell back `holderName` to `users.phone`, so an unauthenticated visitor could read a student's phone number straight from the certificate URL — the code even selected `phone` "just in case" | A **public** page must not even SELECT PII. `lessons-check` L30 fails on `users.phone` in `src/lib/certificates` / `src/app/shahodatnoma`. Test: `src/__tests__/a1-certificate-owner-pii.test.ts` asserts the select aliases are exactly `["fullName","courseTitle","enrollmentScore"]` and the returned owner has no `phone`. Ask for every field a public page will print |
| L31 | `verifyCertificate` threw when the DB was down → Next rendered a 500 (and a retry could show a 404) on the public trust page; nobody could tell "not found" from "cannot check" | A live DB read on a public page needs three outcomes: found / not found (`notFound()`) / **cannot check** (honest state, no verified badge). `lessons-check` L31 fails when the page has no `try/catch`. Test: `c1-certificate-verify.test.ts` "renders an honest unavailable state … when the DB throws". Also add `export const dynamic = "force-dynamic"` so a verified badge is never cached |
| L32 | A 401 from `/api/me` rendered the generic "Texnik xizmat vaqtincha ishlamayapti" box with a **reload** button — an infinite reload loop for an expired session, with no way to log in again | A 401 is never a retryable error: keep the HTTP status on the thrown error, classify it in a pure `features/*/domain` function, and render a login link with a redirect back. `lessons-check` cannot catch this — assert it (`a1-kabinet-session-expired.test.ts`) and never gate a 401 behind a reload button |
| L33 | `findActiveSessionUser` guarded its ids with a UUID regex, but the sibling `listPayments` in the same repository did not, so a non-UUID cookie burned a round trip and raised Postgres 22P02 | Copy the guard when you add a method to a repository, not just the first one. Test: `a1-kabinet-list-payments-uuid.test.ts` asserts `db.select` is never called for a non-UUID |
| L34 | Certificate codes used `Math.random` and had a 5-char random part (~1 B codes, guessable on a public trust page) | Security-relevant randomness is CSPRNG-only (`node:crypto` `randomInt`) — `lessons-check` L34 fails on `Math.random` in `src/lib`. Widen the random part when a code is public. Test: `a1-certificate-code.test.ts` (format, uniqueness, and that stubbing `Math.random` cannot change the output) |
| L35 | A live-DB suite (`w8b-live-sql.test.ts`) flaked on vitest's 5 s default timeout: seed + 7 inserts + several joins over a distant Supabase pooler regularly exceed it | Any test that hits the real DB needs an explicit `LIVE_TIMEOUT_MS = 20_000` (or more) on **every** `it`, not just the slow one — otherwise fixing one test just moves the flake to the next. Use a named constant, never a magic number per test |
| L36 | Refactoring `/shahodatnoma/[code]` to return `<VerificationBody …/>` instead of a flat tree made 4 pre-existing `c1-certificate-verify.test.ts` assertions fail with `expected '' to contain 'DEMO2026'` — the file's `textOf()` helper walks `props.children` and **cannot see through a component boundary**, so it silently returned an empty string (the same run also failed the demo and the "real data" case, which looked like my new code broke everything) | Either keep a page's returned element tree flat (conditionals inside one `return`), or make the test render for real — `renderToStaticMarkup(createElement(Page, …))` in a node env, as `kabinetDashboardClient.test.ts` does. If you refactor the return shape, run the **existing** tests for that file before assuming your logic is wrong |
| L37 | `notFound()` was called **inside** a `try/catch` whose `catch` re-threw only `error.digest === "NEXT_NOT_FOUND"`. In Next 15.5 `notFound()` throws digest `NEXT_HTTP_ERROR_FALLBACK;404` (see `node_modules/next/dist/client/components/http-access-fallback/http-access-fallback.js`), so the catch swallowed the 404 and a well-formed but unknown `/shahodatnoma/NAQSH-2026-XXXXX` rendered "Hozir tekshirib bo'lmadi" with a **200** — a soft-404 that L13 had just been written to prevent | Never branch on the legacy `"NEXT_NOT_FOUND"` digest. Inside the `try` do only the DB reads and set a `missing` flag; call `notFound()` **after** the `try/catch`, so only real DB errors reach the "unavailable" state. `lessons-check` L37 fails on `NEXT_NOT_FOUND` anywhere in `src/app`. Test with the **real** `next/navigation` (no `vi.mock` of it — a mock throwing a custom error is what hid this for a whole wave): assert the thrown digest starts with `NEXT_HTTP_ERROR_FALLBACK;404`, and that a rejected DB read still yields the unavailable state (`c1-certificate-verify.test.ts`) |

## 3. After every fix: add a lesson

If you fixed a bug that a check could have caught, add a row to section 2 in the same commit:
the mistake in one line and the concrete command or test that catches it next time.
If the check is a grep or a file rule, add it to `scripts/lessons-check.mjs` as well: code beats text. Keep this file ≤ 200 lines.
If a lesson is general (not Naqsh-specific), say so in your report so the orchestrator can move it into a global skill.
