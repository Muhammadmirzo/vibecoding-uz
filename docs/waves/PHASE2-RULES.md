# Phase 2 — rules every wave agent follows (read FIRST)

Up to 3 agents work at the same time, each in its own git worktree on its own branch. The orchestrator reviews, merges and deploys. Owner direction: **"maximal creative, user-friendly, world-class, flawless"**.

## Read before coding
`docs/CODER_AGENT_RULES.md`, `docs/waves/PLAN.md` §5, `docs/waves/API-CONTRACT.md`, and your own report file if it exists. If the report exists, a previous run was interrupted: read it plus `git log`/`git status` and CONTINUE. Do not start over.

## Non-negotiables
1. **Every source file ≤ 250 lines** (owner rule). Split components/services early.
2. **Theme tokens only** (no raw hex/rgb in components). Light and dark are both first-class. Mobile-first, 390 px is the main viewport.
3. **Honest Uzbek Latin copy** with correct o'/g'. No invented numbers, testimonials, partners or promises.
4. **Antifragile.** If DB, Redis/Upstash, Telegram or the AI provider is down, the feature degrades with a clear Uzbek message. It never throws a 500 page and never loses the user's input.
5. **Security.** Zod on every input. Auth via `requireAuth`/`requireAdmin` (`src/lib/auth/require-auth.ts`). CSRF on cookie mutations. `checkRateLimit` on public writes. `auditLogs` on admin writes. Secrets only from env, and never logged or returned.
6. **Architecture.** Business logic lives in `src/features/<feature>/server/*.service.ts` (pure, testable, repository-injected). Route handlers stay thin: parse → auth → rate limit → service → `errorResponse`. Services are reused by web, admin, MCP and the future mobile app.
7. **Performance.** Public First Load JS must not grow more than the budget given in your prompt. Lazy-load heavy client islands. CLS stays 0.

## Database / migrations (parallel-safe)
- Put NEW tables in a NEW schema file `src/db/schema/<feature>.ts` and add ONE export line to `src/db/schema/index.ts`.
- Migrations must be additive only. Generate with `npm run db:generate` and commit the migration **in its own commit** named `db: <wave> migration` (the orchestrator may drop and regenerate it at merge to fix numbering).
- **Never apply migrations to the live DB.** Never run destructive SQL. Tests use mocks/injected repositories.

## Machine safety (7.6 GB RAM, shared with other agents)
- Heavy commands ALWAYS through the lock: `scripts/waves/locked.sh npm run build`, `scripts/waves/locked.sh env E2E_PORT=<port> npx playwright test ...`, `scripts/waves/locked.sh npx lighthouse ...`.
- Dev server only on YOUR port (given in your prompt), only while needed. Stop it with `ss -ltnp | grep ':<port> ' | grep -o 'pid=[0-9]*' | cut -d= -f2 | xargs -r kill`. **Never `pkill -f`, never `npm install` of new major versions without need.** If you add a dependency, keep it small and say why in the report.

## Definition of done
- `npx tsc --noEmit`, `npx vitest run`, `scripts/waves/locked.sh npm run build` are green. For UI, also `scripts/waves/locked.sh env E2E_PORT=<port> npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts`.
- Add new unit/route tests for every service and route (auth 401/403, validation 400, degrade path).
- UI: viewport screenshots at 390 and 1440, light and dark. Review them critically and iterate until they look world-class.
- Report `docs/waves/reports/<WAVE>.md`, written incrementally: what shipped, decisions, API endpoints, env vars the owner must set, tests, screenshots, what is left.
- Commit in logical chunks on your branch. **Do not push, do not deploy.**
