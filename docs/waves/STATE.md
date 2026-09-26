# Wave STATE — single source of truth for resuming

> **"davom et" / "continue" protocol (for any new Claude session):**
> 1. Read this file + [PLAN.md](PLAN.md). Do not re-plan; continue from the first row that is not ✅.
> 2. For a row marked 🏃 running: check `tail .orchestra/logs/<wave>.log` (last line `exit=<n>` means finished) and `git -C ../vibecoding-uz-wt/<wave> log --oneline -3`.
>    - Finished + report exists + gate green → review, merge (`git merge --no-ff wave/<wave>`), mark ✅.
>    - Died/incomplete → re-run the same command; the prompt tells the agent to continue from its report + git state.
> 3. Dispatch: `scripts/waves/dispatch.sh <wave> <model>` (run in background). Models: `muse-spark-1.3-contributor-free`, `space-bunny-free` (fallback `muse-spark-1.2-contributor-free`). Never nemotron.
> 4. After each merge: `npm install && npm run build && npx vitest run` on main (worktrees share node_modules; an agent can prune deps), update this table, commit `docs(waves): state`.
> 5. Deploy only in W5: `git push origin main && git push origin main:master`.

| Wave | Model | Status | Branch / commit | Report | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| W0 Plan | orchestrator | ✅ | main | PLAN.md | brand = Naqsh, contracts fixed |
| W1A Audit | space-bunny-free | ✅ | wave/w1a-audit (32edce9) | reports/W1A-AUDIT.md | read-only, port 3201 |
| W1B Brand | muse-spark-1.3-contributor-free | ✅ | wave/w1b-brand (f8f8052) | reports/W1B-BRAND.md | logo redrawn by orchestrator; geometry in src/components/brand/logoGeometry.ts; migration 0004 = blog author default |
| W2 Telegram | space-bunny-free | ✅ | wave/w2-telegram (3 rounds: 0458ca2 rejected → 53ba867 → aebcd4b) | reports/W2-TELEGRAM.md | migration 0005 = telegram_login_requests; bot confirm step (anti-phishing) |
| W3A Motion | muse-spark-1.3 → space-bunny | ✅ | wave/w3a-motion (ccfa473) | reports/W3A-MOTION.md | +2 kB home JS; `/` dynamic because root layout reads cookies() → W4A |
| W3B Motion admin | space-bunny-free | ✅ | wave/w3b-motion-admin (c97a880) | reports/W3B-MOTION-ADMIN.md | site_settings key "motion", cached 300s, fail-safe defaults; admin tab "Animatsiyalar" |
| W4A Perf | space-bunny-free | ✅ | wave/w4a-perf (9b08e92 + orchestrator fixes) | reports/W4A-PERF.md | JS −11…23 kB on funnel pages; mobile (devtools throttling) LCP 2.1 s, CLS 0 after orchestrator fixed font-swap + loading-skeleton shifts |
| W4B Audit fixes | space-bunny-free | ✅ | wave/w4b-fixes (auto-resumed by opencode service after reboot) | reports/W4B-FIXES.md | orchestrator rejected fail-closed rate limit (no Upstash on Vercel) + added theme-script nonce |
| W5 Final QA + deploy | space-bunny-free + orchestrator | ✅ DEPLOYED 2026-09-24 | main = master | reports/W5-FINAL.md | live smoke: all key routes 200, CSP nonce OK, 0 console errors (light/dark, 390/1440); /api/auth/telegram/start → 503 Uzbek message while DB is down |

## Phase 2 (started 2026-09-24)

### ▶ RELEASE 2026-09-26 (release-f): F1 foundations — observability, cron, Telegram dedupe, atomic writes, DB lockdown — merged + pushed
- **Shipped:** the F1 foundations slice.
  - **Migration 0014 was APPLIED LIVE BEFORE this deploy** (verified: 15 migrations, `npm run db:lockdown-check` OK): `anon`/`authenticated` Data API grants revoked on every `public` table, RLS enabled everywhere, new `telegram_updates` dedupe table, `lesson_progress` unique constraint, `homework` attempt unique constraint, legacy secret rows deleted. `db:push` is gone — migrations only.
  - `GET /api/health` (`select 1`, 5 s timeout) → 200 `{status:"ok"}` / 503 `{status:"degraded"}`; point an uptime monitor at it.
  - `x-request-id` on **every** response (middleware) + JSON-line logging via `src/lib/log.ts` with `requestId`.
  - Daily Vercel crons (`vercel.json`): `/api/cron/reminders` at 04:00 UTC (09:00 Tashkent) and `/api/cron/analytics-retention` at 22:00 UTC, both with `Authorization: Bearer $CRON_SECRET`.
  - Telegram `update_id` dedupe (no double-processing of a replayed update), atomic progress upsert, Payme lock by order id, complete `.env.example`, `scripts/ops/rotate-db-password.sh`.
- **Gates on the committed state (release agent, real output):** `npm run lessons:check` → 0 failures, 3 known debt (L13 `kabinet/kurs/[id]/dars/[lessonId]`, L13 `shahodatnoma/[code]`, L19 `chat.service.ts` 263 lines) · `npm run build` → exit 0 (shared First Load JS 103 kB) · `npx vitest run` → **103 files / 687 tests passed** (up from 97/663 at release-e).
- **Next, in order:**
  1. **URGENT — owner rotates the leaked Supabase DB password** with `scripts/ops/rotate-db-password.sh` (the password is in public git history), and rotates the **Telegram bot token**. Nothing else in this list matters as much.
  2. **E2 fix (space-bunny)**, then the owner checks the preview; Wave E continues one section per slice after that.
  3. **F2 portability kit review** (one-command portability is an accepted owner goal).
  4. **F3**: timestamptz + money in tiyin + `org_id` + `can()` permissions — only after the owner creates the `naqsh-dev` Supabase project.
  5. **Smoke after deploy:** `/`, `/api/health`, `/api/v1/me` (must be 401), Telegram webhook GET. Use the prod **alias** from `vercel inspect` → Aliases, never the per-deployment URL (L20/L22).
- **In progress:** no agent running. Nothing on a wave branch — F1 went straight to main.
- **Settled owner decisions 2026-09-26 (don't re-ask):** free nightly encrypted backups (no Supabase Pro) · a **separate dev DB project** · B2B is possible → `org_id` early · one-command portability.
- **Risks / debt:** middleware now sets `x-request-id` on every response (watch the header size/caching). The leaked DB password is still live in git history until the owner rotates it — that is the top open risk. Untracked and left alone: `scripts/db-check.ts` (owner debug script) and `.claude/worktrees/`. Carried debt from release-e still open: 121 Tailwind opacity classes on `var()` colours produce no CSS; `src/features/**` tests not in the vitest include; true 404 for unknown kurs/blog slugs; split `chat.service.ts` (263 lines); /kabinet simulated LCP 3.5 s; the BuildStory blank track in full-page screenshots. Still unverified from release-c: the first real MCP client connection end-to-end in production.
- **Resume:** open the repo, say "davom et" — a new session reads [RESUME.md](RESUME.md) and this section. Roll back: `skillkit wave status`, then `skillkit wave rollback <tag>`.

### ▶ RELEASE 2026-09-26 (release-e): Wave E slice E1 — home "Muammo" section + pinned loom star — merged + pushed
- **Shipped:** replaces ProblemShift with `HomeLoom` (reusable pinned-star wrapper: right 4 cols desktop, thin thread on phone) + `MuammoSection`, the first of the Wave E story sections on `/`. Only the square strand scrubs with scroll this slice; other strands render as a faint static guide via `LoomStar`'s `mutedStrands` prop (`/lab/naqsh` unaffected). Performance: `gsap` + `ScrollTrigger` stay out of `/` initial bundle (lazy-loaded via next/dynamic ssr:false on idle, skipped on prefers-reduced-motion). First Load JS unchanged at 129 kB on `/` (103 kB shared). Merged to main from `wave/e1-muammo` (`d61ae00`). Owner approved proceeding 2026-09-26.
- **Gates on the committed state (real output):** `npm run lessons:check` → 0 failures, 3 known debt (L13 `kabinet/kurs/[id]/dars/[lessonId]`, L13 `shahodatnoma/[code]`, L19 `chat.service.ts` 263 lines) · `npm run build` → exit 0 (shared First Load JS 103 kB) · `npx vitest run` → 97 files / 663 tests passed.
- **Migrations:** no `.sql` migrations changed since `wave/2026-09-26-w8b-mcp` → no live-DB step needed for this slice.
- **Next, in order:**
  1. **Wave E2: the home "Yechim / Qadriyat" section**, then **E3 → E6, one section per slice**; the owner checks each preview before the next slice starts.
  2. After deploy: smoke-test `https://master-2-jade.vercel.app/` (prod alias from `vercel inspect` → Aliases, never the per-deployment URL — L20/L22).
  3. `skillkit improve` (auto-actions per verdict; design in the `wave/a-fixes` STATE handoff "session B"). Measurement (`skillkit eval outcome`, `skillkit stats skills`) already exists.
  4. **Debt:** 121 Tailwind opacity classes on `var()` colours produce no CSS (fix `tailwind.config.js` with `<alpha-value>`, then a visual review of all pages); `src/features/**` tests missing from the vitest include (one CountUp test fails to parse); true 404 status for unknown kurs/blog slugs (noindex already, low priority); split `src/features/chat/server/chat.service.ts` (263 lines); /kabinet simulated LCP 3.5 s.
- **In progress:** no agent running. The `wave/e1-muammo` worktree (`../vibecoding-uz-wt/e1-muammo`) can be dropped — its content is on main.
- **Settled (carried over, still valid):** the redesign has no Samarkand/historic-city theme and the girih logo stays (concept A + C); `/lab/naqsh` stays `noindex` and unlinked; Telegram reply → site chat confirmed working; `ANTHROPIC_API_KEY` deferred (AI chat off); Supabase stays in Sydney for now; heavy commands go through `scripts/waves/locked.sh` (7.6 GB RAM).
- **Still unverified from release-c:** the first real MCP client connection is not yet tested end-to-end in production (smoke-test `/.well-known/oauth-authorization-server` + login, which reads `users.mcp_access`).
- **Resume:** open the repo, say "davom et" — a new session reads [RESUME.md](RESUME.md) and this section. Roll back: `skillkit wave status`, then `skillkit wave rollback <tag>`.

### ▶ RELEASE 2026-09-26 (release-d): Wave E slice E0 — home hero = live prompt→site demo — merged + pushed
- **Shipped:** the home hero (`/`) is now the owner-approved live prompt→site demo (from `/lab/naqsh`). SSR headline = LCP element, the demo lazy-loads after idle, static fallback renders in the SAME box → **CLS 0**. Bundle: First Load JS 125 → 129 kB on `/`. Removed the Samarkand signature text, the eyebrow and the mesh/orbit decorations, plus a duplicated cohort date. Merged to main as `10dd9ab` (branch `wave/e0-hero`, 3 commits). Owner said **"Zo'r"** on the preview 2026-09-26.
- **Gates on the committed state (release agent, real output):** `npm run lessons:check` → 0 failures, 3 known debt (L13 `kabinet/kurs/[id]/dars/[lessonId]`, L13 `shahodatnoma/[code]`, L19 `chat.service.ts` 263 lines) · `npm run build` → exit 0 (shared First Load JS 103 kB) · `npx vitest run` → 96 files / 659 tests passed.
- **Migrations:** no `.sql` migrations changed since `wave/2026-09-26-w8b-mcp` → no live-DB step was needed for this slice.
- **Owner decision (accepted, don't re-ask):** the headline is kept smaller than the art-direction clamp so the demo fits in the first screen.
- **Risks / debt:** the BuildStory scroll section shows a blank track in full-page screenshots — pre-existing, to be rebuilt in a later slice. Untracked and left alone: `scripts/db-check.ts` (owner debug script) and `.claude/worktrees/`.
- **Next, in order:**
  1. **Wave E1: the home "Muammo" section** (square strand), then **E2 → E6, one section per slice**; the owner checks each preview before the next slice starts. This is still step 1 of the release-c list below.
  2. After the E0 deploy: smoke-test `https://master-2-jade.vercel.app/` (prod alias from `vercel inspect` → Aliases, never the per-deployment URL — L20/L22) and check the hero demo hydrates (it only lazy-loads after idle) with **CLS 0**.
  3. `skillkit improve` (auto-actions per verdict; design in the `wave/a-fixes` STATE handoff "session B"). Measurement (`skillkit eval outcome`, `skillkit stats skills`) already exists.
  4. **Debt:** 121 Tailwind opacity classes on `var()` colours produce no CSS (fix `tailwind.config.js` with `<alpha-value>`, then a visual review of all pages); `src/features/**` tests missing from the vitest include (one CountUp test fails to parse); true 404 status for unknown kurs/blog slugs (noindex already, low priority); split `src/features/chat/server/chat.service.ts` (263 lines); /kabinet simulated LCP 3.5 s.
- **In progress:** no agent running. The `wave/e0-hero` worktree (`../vibecoding-uz-wt/e0-hero`) can be dropped — its content is on main. The `wave/w8b-mcp` and `release-b` worktrees from release-c can be dropped too.
- **Settled (carried over, still valid):** the redesign has no Samarkand/historic-city theme and the girih logo stays (concept A + C); `/lab/naqsh` stays `noindex` and unlinked; Telegram reply → site chat confirmed working; `ANTHROPIC_API_KEY` deferred (AI chat off); Supabase stays in Sydney for now; owner approved deploying slice 2 and W8B on 2026-09-26 — do not re-ask; heavy commands go through `scripts/waves/locked.sh` (7.6 GB RAM).
- **Still unverified from release-c:** the first real MCP client connection is not yet tested end-to-end in production (smoke-test `/.well-known/oauth-authorization-server` + login, which reads `users.mcp_access`).
- **Resume:** open the repo, say "davom et" — a new session reads [RESUME.md](RESUME.md) and this section. Roll back: `skillkit wave status`, then `skillkit wave rollback <tag>`.

### ▶ RELEASE 2026-09-26 (release-c): W8B remote MCP (OAuth 2.1 + PKCE, PATs, visual charts) + per-manager access — merged + pushed
- **Shipped:** W8B merged to main as `823796b` (from `wave/w8b-mcp`, SQL fixes in `61876a9`). Remote MCP over HTTP with OAuth 2.1 + PKCE, personal access tokens, and the visual chart tools. Plus per-manager MCP access: an admin toggles it in **Admin → MCP** ("Menejerlar uchun MCP ruhsati"); PII scope stays admin-only; turning it off revokes the manager's tokens in one transaction.
- **Migrations order respected:** 0012 + 0013 were applied on the LIVE DB **before** this deploy (verified: 14 migrations, 5 `mcp_*` tables, `users.mcp_access`). Deploying 0013's `users.mcp_access` before migrating would have broken EVERY login (`getDbSession`/`getBearerSession` select it).
- **Live-DB SQL verification caught 4 real bugs** before release (mock tests passed and were wrong): `students_list`, `student_profile`, `sales_by_course` used camelCase columns in raw SQL, and `last_used_at` updates never executed because Drizzle update builders are lazy. All fixed in `61876a9`. (Lesson L2 again — mock-only DB tests hide real SQL bugs.)
- **Gates on the committed state (release agent, real output):** `npm run lessons:check` → 0 failures, 3 known debt (L13 `kabinet/kurs/[id]/dars/[lessonId]`, L13 `shahodatnoma/[code]`, L19 `chat.service.ts` 263 lines) · `npm run build` → exit 0 · `npx vitest run` → 96 files / 659 tests passed.
- **Risk / must-do right after deploy:** the first real MCP client connection is NOT yet tested end-to-end in production. Smoke-test `https://master-2-jade.vercel.app/.well-known/oauth-authorization-server` and log in — login reads `users.mcp_access`, so a wrong/missing column shows up there first. Curl the prod **alias** from `vercel inspect` → Aliases, never the per-deployment URL (L20/L22).
- **Next, in order:**
  1. **Wave E: rebuild the home page sections 0→6 in the approved lab style** (art direction §9 step 3) — one section per slice, the owner checks each slice before the next.
  2. `skillkit improve` (auto-actions per verdict; design in the `wave/a-fixes` STATE handoff "session B"). Measurement (`skillkit eval outcome`, `skillkit stats skills`) already exists.
  3. **Debt:** 121 Tailwind opacity classes on `var()` colours produce no CSS (fix `tailwind.config.js` with `<alpha-value>`, then a visual review of all pages); `src/features/**` tests missing from the vitest include (one CountUp test fails to parse); true 404 status for unknown kurs/blog slugs (noindex already, low priority); split `src/features/chat/server/chat.service.ts` (263 lines); /kabinet simulated LCP 3.5 s.
- **In progress:** no agent running on this wave. The `wave/w8b-mcp` worktree (`../vibecoding-uz-wt/w8b-mcp`) can be dropped — its content is on main. The slice-2 worktree `../vibecoding-uz-wt/release-b` can be dropped too.
- **Owner decision 2026-09-26:** owner said "Deploy qil" for W8B. Do not re-ask.
- **Resume:** open the repo, say "davom et" — a new session reads [RESUME.md](RESUME.md) and this section. Roll back: `skillkit wave status`, then `skillkit wave rollback <tag>`.

### ▶ RELEASE 2026-09-26 (release-b): Awwwards slice 2 (hero live demo) merged + pushed
- **Shipped:** Awwwards slice 2 = the hero live prompt→site demo on `/lab/naqsh` (prompt types, girih tiles weave, site mock renders). Merged to main as `2d4057b` (from `wave/release-b` = origin/main + `wave/awwwards-slice2`). Pushed to `main` and `master`.
- **Still deliberately hidden:** `/lab/naqsh` is `noindex` and not linked from anywhere. The home page is NOT touched yet — slice 2 is a prototype route, not the home hero.
- **Owner decision 2026-09-26:** owner approved deploying slice 2. Earlier in the day the owner had said "Yo'q" to deploying; the go came later the same day, so the deploy is authorized. Do not re-ask.
- **Gates on the committed state (release agent, real output):** `lessons:check` 0 failures (3 known debt: L13 `kabinet/kurs/[id]/dars/[lessonId]`, L13 `shahodatnoma/[code]`, L19 `chat.service.ts` 262 lines) · `npm run build` exit 0 · `npx vitest run` 94 files / 648 tests passed.
- **Risk:** `/lab/naqsh` First Load JS ~189 kB (66.4 kB route + shared 103 kB) because GSAP/Lenis load only on that route. `/` is unchanged at 103 kB shared. Not a home-page regression yet; it becomes one only if the demo moves to `/` — measure before that happens.
- **Next, in order:**
  1. **W8B deploy — needs the owner's "W8B deploy qil".** Branch `wave/w8b-mcp` (934a702, reviewed + gated). Order matters: run the new OAuth/PAT/manager SQL on the LIVE DB → `npx drizzle-kit migrate` (**0012 + 0013**) → merge → gates → deploy. **0013 adds `users.mcp_access`, which every login reads: deploying before migrating breaks ALL logins.**
  2. Wave E: rebuild the home page sections 0→6 in the approved lab style (art direction §9 step 3), one section per slice, owner checks each slice.
- **In progress:** no agent running on this wave; slice-2 worktree `../vibecoding-uz-wt/release-b` can be dropped (its content is on main).
- **Resume:** open the repo, say "davom et" — a new session reads [RESUME.md](RESUME.md) and this section. Roll back: `skillkit wave status`, then `skillkit wave rollback <tag>`.

### ▶ RELEASE 2026-09-26 (release-a): Awwwards slice 1 + /kabinet LCP, deployed
- Owner approved the slice-1 loom feel on phone (2026-09-26) after the fix "phone star sticky + thicker" (8ed1289). `/lab/naqsh` is live (noindex, not linked).
- /kabinet guest view server-rendered (Lighthouse mobile 64→84, TBT 2290→290 ms; simulated LCP 3.5 s, target 2.5 s not met yet).
- Soft-404 on unknown /kurs/<slug>, /blog/<slug>: `dynamicParams=false` did NOT work (fresh build still 200) and was reverted. Next already adds `noindex` there, so nothing is indexed; a true 404 status needs root `src/app/loading.tsx` restructured (todo, low priority).
- In progress: slice 2 (hero live demo) on branch `wave/awwwards-slice2` (worktree ../vibecoding-uz-wt/slice2). W8B on `wave/w8b-mcp`: MIGRATE 0012+0013 LIVE BEFORE DEPLOY (see its STATE note).

   Run `npm run lessons:check`, commit `docs(waves): release-a handoff` with trailer `Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>`.

### ▶ HANDOFF 2026-09-25 (night): Awwwards slice 1, on branch `wave/awwwards-slice1` (NOT merged)
- Prototype `/lab/naqsh` (noindex, not linked): the loom star draws on scroll (GSAP ScrollTrigger + Lenis), 6 placeholder story sections, reduced-motion shows the finished star. Commits 43fd16c + 3873387. Route First Load JS 177 kB (GSAP only on this route; `/` unchanged at 125 kB). Screenshots: `docs/redesign/awwwards/screens/slice1-*.png`.
- **Next:** the owner opens the Vercel preview of this branch on their phone and approves the feel. Then merge into main via `skillkit release`, then slice 2 (hero live demo).
- **Found (next wave, site-wide):** Tailwind drops opacity modifiers on var() colors. 121 classes like `bg-danger/10` and `border-brand/30` generate no CSS. Fix in `tailwind.config.js` (define the token colors with `<alpha-value>`, e.g. color-mix), then do a visual review of all pages.
- Free opencode models were down on 2026-09-25 evening; this slice was built by a Claude Sonnet subagent. `skillkit dispatch` now health-probes models and falls back to `claude:haiku`.
- Agents on this machine: other terminals may be running agents on main, so check `ps -eo etimes,args | grep "opencode run"` before merging.
### ▶ HANDOFF 2026-09-25 (late night, session B, parallel to session A's `wave/awwwards-slice1`): NOT merged, NOT deployed
Branches pushed (all based on main c714bf9):
- `wave/w8b-mcp` (31272f3): W8B reviewed. Merged main, migration renumbered **0012_luxuriant_james_howlett** (5 new mcp_* tables, additive only), new /api/v1/mcp routes in OpenAPI, OAuth hardening (lead_update_status needed only analytics:read → now `leads:write`; redirect_uri scheme allowlist; rate limits on /oauth/register|token|revoke; masked DB errors; atomic refresh claim + 30 s grace). Gate in worktree: tsc 0, vitest 617/617, lessons ok. NOTE: the Gemini commit 1460d19 alone does not typecheck; 31272f3 fixes it.
  **Next:** run the new OAuth/PAT SQL on the live DB (lesson L: mock tests hid broken SQL) → `npx drizzle-kit migrate` on live (0012) → merge into main → gates → deploy. Open question: should role `manager` be allowed MCP write tools (currently scope-only)?
- `wave/a-fixes` (this branch): /kabinet guest view is server-rendered (Lighthouse mobile 64→84, TBT 2290→290 ms, simulated LCP 3.5 s, target 2.5 s NOT met; rest is shared JS 141 kB). Soft-404: `dynamicParams = false` on kurs/blog [slug] — **UNVERIFIED** (curl against a stale build still returned 200). Next: fresh build, `curl /kurs/nope-xyz` and `/blog/nope-xyz` must be 404; if still 200, the cause is root `src/app/loading.tsx`.
- `wave/lab-alt` (local only, not pushed): duplicate /lab/naqsh from this session. Session A's `wave/awwwards-slice1` is the one the owner reviews. Do not merge lab-alt.
Skillkit (`~/.skillkit`, commit 253e989): `skillkit eval outcome` measures skill uplift (with vs without skill, deterministic checks, per-version verdicts IMPROVED/REGRESSION/NO EFFECT/TOO FEW RUNS), `skillkit stats skills`, Gemini runner via `agy` (also in `skillkit dispatch`). First real run: global-lessons on file-size-split, gemini-3.8-flash-low: with 1.00 vs without 0.50.
  **Next (designed, not built):** `skillkit improve` auto-actions: TOO FEW RUNS → queue more runs; REGRESSION → confirm with 3 reruns then roll back the skill + lesson + notify; NO EFFECT → improver model proposes a SKILL.md edit, keep only if +0.10 on hidden holdout cases and no check regresses, max 3 tries, then propose hub/remove to the owner; third-party skills via overlays; every new `skillkit lesson` auto-creates an outcome case; weekly run/token budget; nightly run.
Models: Claude session limit hit 2026-09-25 ~22:00; Gemini via `agy -p ... --model gemini-3.1-pro-high|gemini-3.8-flash-high|medium` works. LESSON: Gemini reports overclaim ("all gates pass" while its commit didn't typecheck; "404 fixed" unverified) — always re-run the gate on the committed state.
Site-wide debt found by session A: 121 Tailwind opacity classes on var() colors produce no CSS (fix tailwind.config.js with <alpha-value>).
### ▶ W8B deploy order (2026-09-26): MIGRATE LIVE BEFORE DEPLOY
- Branch `wave/w8b-mcp` (bf3abe9) adds per-manager MCP access (owner decision: managers may use MCP incl. write tools only if an admin turns it on in Admin → MCP → "Menejerlar uchun MCP ruxsati"; PII scope stays admin-only; turning it off revokes the manager's tokens in one transaction).
- Migration **0013** adds `users.mcp_access`, and `getDbSession`/`getBearerSession` now select it on EVERY login check. Deploying before `0012` + `0013` are applied live breaks ALL logins. Order: run new SQL on live → `npx drizzle-kit migrate` → merge → deploy.
- Gate on bf3abe9: tsc 0, vitest 623/623, build OK.

### ▶ HANDOFF 2026-09-25 (evening), wave "Q1 quality + skills + Awwwards phase 1-2", read this first
- **Skills:** everything is managed by `skillkit` (`~/.skillkit`, private repo github.com/Muhammadmirzo/skillkit; new laptop: clone + `install.sh`).
  Dispatch agents with `skillkit dispatch <task> <model> <prompt> [dir]` (`.orchestra/run.sh` delegates to it): mandatory LESSON footer,
  model fallback, metrics, and `--standalone` (the shared opencode background service hung every request on 2026-09-25).
  Useful: `skillkit stats`, `skillkit eval`, `skillkit doctor`, `skillkit review`.
- **Lessons:** project facts go in `.claude/skills/naqsh-lessons` (L1-L19). General lessons attach to the skill that should have caught them
  (`skillkit lesson "..." --skill X`; project details are rejected by code).
- **Quality gate (new):** `npm run lessons:check` (also a pre-commit hook in `.githooks`, set by `npm prepare`) plus CI `.github/workflows/ci.yml`
  (lessons + tsc + vitest). Known debt: `scripts/lessons-baseline.json` (chat.service.ts 262 lines; 2 dynamic pages without notFound).
- **Awwwards redesign:** owner picked concept **A + C**: "Naqsh to'qiladi" loom star + a live prompt→site demo in the hero.
  No Samarkand/historic-city references; keep the girih logo. Docs: `docs/redesign/awwwards/01-research-and-concepts.md`, `02-art-direction.md`.
  **Next:** slice 1 = prototype route `/lab/naqsh` (noindex, not linked): the loom star plus the scroll scrub. The owner approves the feel before the home page is touched.
- **Owner decisions 2026-09-25:** Telegram reply → site chat **confirmed working**. `ANTHROPIC_API_KEY` is deferred (AI chat stays off, which is fine).
  Supabase region (Sydney) vs the Uzbek data-localization law: **accepted for now**; revisit when a server move is planned. Don't re-ask.
- **Owner rule:** after every big wave, run the gates, push (main + main:master), and update this handoff.

### ▶ HANDOFF 2026-09-25 — start here
0. **Chat fix branch `claude/wife-coding-rules-fixes-5ehexs`** — adds migration **0011_chat_reply_to** (`chat_messages.reply_to_id`, idempotent). Apply it on the live DB (`npx drizzle-kit migrate`) BEFORE deploying that code, otherwise every chat query fails (drizzle selects the new column). Same branch: `prepare: false` on the transaction pooler (port 6543) — local PgBouncer repro lost 9 of 12 concurrent Telegram replies with prepared statements on.
1. **Next: review W8B** (worktree ../vibecoding-uz-wt/w8b-mcp, branch wave/w8b-mcp, report reports/W8B-MCP.md). Same recipe as W7/W9: merge main into the branch → drop the wave's migration + restore main's `_journal.json` → `npx drizzle-kit generate` (becomes 0012 — 0011 is chat_reply_to) → register every new /api/v1 route in OpenAPI (import it in `src/app/api/v1/openapi.json/route.ts` AND `src/__tests__/mobile/openapi-completeness.test.ts`) → security review (OAuth: PKCE, redirect_uri allowlist, token hashing, scopes; admin-only tools) → gate → run new SQL on the live DB → merge → migrate live → deploy.
2. Every wave this phase shipped real bugs the agent's mock tests missed (W7: launcher hit the DB on every page view, Telegram reply read the wrong `from`; W9: parallel refresh logged users out). Read the risky diffs yourself.
3. Todo (small, orchestrator can do): soft 404 — unknown /kurs/<slug> and /blog/<slug> return 200 because root `src/app/loading.tsx` streams before `notFound()`; /kabinet guest LCP > 2.5 s.
4. Chat on Telegram: TELEGRAM_ADMIN_USER_IDS set in Vercel 2026-09-25 (owner's ID — do not copy it into repo/memory). Owner has NOT yet confirmed a Telegram reply reaches the site chat — ask. ANTHROPIC_API_KEY still unset → AI skipped silently (fixed bc2d6a3); conversations created before the fix may have aiMode=off.
5. `scripts/db-check.ts` is an untracked owner/debug script — leave it alone.
 — design overhaul, portfolio, chat, MCP, mobile-ready

Parallel agents allowed (max 3 since 2026-09-24 — ~4.5 GB free with 3 running; all agents read docs/waves/PHASE2-RULES.md + API-CONTRACT.md) — heavy commands serialized with `scripts/waves/locked.sh` (flock). Owner rule: every source file ≤ 250 lines.

| Wave | Model | Status | Branch | Report | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- |
| W6A Design + motion: HOME | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w6a-design-home (324c1de + orchestrator fix) | reports/W6A-DESIGN-HOME.md | 2 review rounds; orchestrator fixed rail overlap, sequential step lighting (shorthand reset animation-timeline), caret. Home 2.42 kB / 125 kB; LCP 2.3 s, CLS 0 |
| W6B Portfolio management | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w6b-portfolio (ef9f9cf + b3fe788 fixes) | reports/W6B-PORTFOLIO.md | migration 0006 applied live; live table was EMPTY → 0006 now seeds Clash Nexus (published/owner/rank1). Orchestrator fixed: admin reorder no-op, audit failure → 500, unverified-data flash in admin, /kurs used static list. `mark-unverified.ts --apply` NOT run (nothing to hide: only Clash Nexus in DB) |
| W10 Cuts + fixes | muse-spark-1.3-contributor-free | ✅ merged + deployed 2026-09-24 | wave/w10-cuts-fixes (80b1f02) | reports/W10-CUTS-FIXES.md | registry src/lib/features/closed.ts (flip flag to reopen); middleware real 404; migration 0007 rate_limit_buckets applied live; 500 messages masked; admin 'Funksiyalar' tab closed (flags never read). Owner: rotate credentials listed in report §5 |
| W6C Design rollout: all pages + cabinet | muse-spark-1.3-contributor-free | ✅ merged + deployed 2026-09-24 | wave/w6c-design-pages (5a73a7d + main merge) | reports/W6C-DESIGN-PAGES.md | orchestrator: merged main (kept W8A analytics privacy section + all data-track attrs), screenshots 390/1440 light+dark reviewed, 0 console errors, no overflow. Known: /kabinet guest shell LCP > 2.5 s. PRE-EXISTING BUG (todo): unknown /kurs/<slug> and /blog/<slug> return 200 (soft 404) — root loading.tsx streams before notFound() |
| W7 Chat centre (visitor ↔ admin ↔ AI agent, Telegram bridge) | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w7-chat (a96cc3d + orchestrator fixes) | reports/W7-CHAT.md | migration renumbered 0010 and APPLIED live; visitor send/list, admin reply, audit, analytics verified live (test rows deleted). Orchestrator fixed: launcher hit /api/v1/chat + set a 1-year cookie on EVERY page view for every visitor (now only for visitors who opened chat), public API leaked AI model/persona/caps, chat analytics events had wrong props (silently dropped), chat routes missing from OpenAPI, AI history could start with assistant turn. AI replies need ANTHROPIC_API_KEY (unset → hands off to admin). Telegram alerts need TELEGRAM_ADMIN_CHAT_ID + TELEGRAM_ADMIN_USER_IDS |
| W8A First-party analytics | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w8a-analytics (703bd7c) | reports/W8A-ANALYTICS.md | ALL 10 reports were broken on the real DB (raw Date params + camelCase columns) — agent only tested mocks. Orchestrator: global Date serializer in src/db/index.ts, SQL column fixes, after() for server events, dashboard envelope parse fix; migration 0008 APPLIED live; gate 555/555 |
| W8B World-class MCP (remote HTTP + OAuth + visual charts) | space-bunny-free | 🔍 agent done (exit=0, d8c19d4) — ORCHESTRATOR REVIEW NEXT; migration not applied | wave/w8b-mcp | reports/W8B-MCP.md | prompt prompts/w8b-mcp.md; port 3307 |
| W9 Mobile-ready API (/api/v1, bearer tokens, OpenAPI, deep links) | space-bunny-free + orchestrator | ✅ merged + deployed 2026-09-24 | wave/w9-mobile-api (f7e7597 + orchestrator fixes) | reports/W9-MOBILE-API.md | migration renumbered 0009 and APPLIED live; refresh SQL verified live. Orchestrator fixed: parallel refresh killed the device family (now atomic claim + 30 s grace), refresh ignored dead web session, logout left access tokens alive 15 min (now deletes session rows), W8A routes missing from OpenAPI. Owner env (optional): API_JWT_SECRET (falls back to SESSION_SECRET), IOS_*/ANDROID_* for deep links |

2026-09-24 perf: Vercel functions pinned to syd1 (vercel.json) next to Supabase ap-southeast-2 — login 3.5–5.4 s → ~1 s; PG rate limiter fixed (Date param) and verified writing buckets live. LESSON: agents' mock-only DB tests hide real SQL bugs — always run new SQL against the live DB before merge. Owner 2026-09-24: admin password reset done (superadmin admin@vibecoding.uz, login verified live; password given to owner in chat only — owner must change it). Owner REQUESTED W7 chat (visitor↔admin↔AI agent), W8 analytics+world-class MCP with visuals, W9 mobile-ready API — orchestrator sent issues/ideas/cuts list first; owner's go-ahead pending. Owner decided 2026-09-24: portfolio = ONLY Clash Nexus for now (Bozor bot not ready yet — add later via /admin/portfolio; other static entries stay hidden/demo). Owner 2026-09-24: 'fix all errors with parallel agents; close SpinWheel, /ish, testimonials, unbuilt features (keep /ekspertlar); run W7/W8/W9 in parallel; maximal creative, user-friendly'. Queue order when a slot frees: W7 → W6C (after W6A ✅) → W8B (after W8A ✅) → W9. Migrations from parallel waves may collide in numbering — at merge drop the wave's migration commit and re-run `npm run db:generate` on main. Still unanswered: AI provider key (ANTHROPIC_API_KEY), main domain. admin password reset (say "parolni yangila").
Done outside waves 2026-09-24: DB restored + migrations 0000–0005 recorded/applied; reveal-blur/Times-font fix + e2e/visibility.spec.ts (0366972).

⚠️ **Machine has 7.6 GB RAM: run heavy commands one at a time** — Phase 2 runs 2 agents but every build/playwright/lighthouse goes through `scripts/waves/locked.sh`.
⚠️ Stop dev servers by PID from `ss -ltnp | grep :<port>` — `lsof -t -i:<port>` misses next-server.
⚠️ After a reboot the `opencode serve --service` daemon auto-resumes old agent sessions in parallel — run `opencode service restart` first, then dispatch one wave.

Legend: ⏸ paused/killed (work kept in worktree) · ✅ merged · 🏃 running · ⏳ waiting · ❌ failed (see notes)

## ✅ All waves done — what is left is the owner's
1. Restore Supabase → update `DATABASE_URL` in Vercel if it changed → `vercel env pull .env --environment=production --yes && npm run db:migrate` (applies 0001–0005; 0004 = blog author default, 0005 = telegram_login_requests) → redeploy.
2. Test Telegram signup live: site → "Telegram orqali davom etish" → bot → share phone → "✅ Ha, bu men".
3. Rotate both bot tokens in @BotFather (they were pasted in chat) → update `TELEGRAM_BOT_TOKEN` in Vercel.
4. Optional: Upstash Redis env vars for shared rate limiting (site works without it).

## Blockers outside the code
- Supabase DB down (see docs/HANDOFF_2026-09-24.md §2.1). Signup/login can only be tested end-to-end after the owner restores it.
- After W2 deploys: in @BotFather run `/setdomain` for the production domain (only needed for the optional Login Widget).
