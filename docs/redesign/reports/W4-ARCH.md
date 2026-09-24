# W4-ARCH — Backend architecture migration (2026-09-24)

Backend-only. 4 parallel workers (B/C/D/E) + orchestrator integration. No UI files touched
(except none). No build/dev/commit/package installs. No `db:migrate`/`db:push` run.

## 1) tsc fixes (orchestrator)
- `src/__tests__/w2-biz/refund-referral.test.ts` — implicit-`any` params replaced with
  fully-typed interface-annotated fakes (no `any`, no `as` casts); later extended with `*Tx`
  variants after worker B's interface expansion. Same treatment for `checkout-providers.test.ts`.
- `src/features/payments/server/payme.service.ts` — explicit `withTransactionLock<Outcome>`
  union generics + dropped redundant `as DbExecutor | null` casts (3 fns).
- `src/features/payments/server/payments.repository.ts` — `enrollmentWithCohort` takes
  `SQL<unknown> | undefined` (matches Drizzle `and()`).

## 2) Drizzle chain (orchestrator, verified by script, NOT applied to any DB)
Problem: two files numbered `0001` — `0001_daily_tarot.sql` (hand-written, commit 53a15d5,
already on prod, never journaled) vs `0001_next_shooting_star.sql` (`db:generate`, W2-BIZ).
Fix:
- `drizzle/0001_daily_tarot.sql` kept as-is (idx 1, `when` = its commit time).
- `drizzle/0002_next_shooting_star.sql` (renamed): real W2 changes kept
  (payout_status, referrals/refund/payout tables, portfolios, blog default,
  amount_tiyin+backfill, FKs, indexes). REMOVED: `ALTER TYPE … ADD VALUE` (own migration,
  PG forbids it in a txn block) and the `leads` phone/telegram dup (would fail with
  "column already exists" on prod which has 0001 applied).
- `drizzle/0003_payment_status_cancelled.sql` (new): only the `ALTER TYPE` statement.
- `drizzle/meta/_journal.json`: linear idx 0–3; `0001_snapshot.json` → `0002_snapshot.json`.
- `db:migrate` from 0000+0001_prod now applies 0002 (all `IF NOT EXISTS`/idempotent-safe)
  then 0003. `CREATE TYPE payout_status` is new (prod lacks it). 0002 never references
  the `cancelled` value, so enum-last ordering is safe.

## 3) Referral attribution (worker B)
- `src/features/referrals/domain/referral-code.ts` (new) + `server/attribution.service.ts` (new):
  code = referrer UUID first 8 chars (uppercased); `resolveReferrerByCode` (Zod shape →
  case-insensitive prefix match); outcomes `empty|invalid|self|unresolvable|attributed`.
- Wired into `api/auth/otp/verify` NEW-USER path: user + profile + attribution in ONE
  `withTransactionLock` (new `features/auth/server/registration.repository.ts`); `ref_code`
  cookie cleared on success. Existing-user login untouched (deliberate).

## 4) Transactions (workers B/C/D)
All multi-write flows run on one `ex` from a single `withTransactionLock`: checkout
(reuse-check + insert), refund (replay-check + request + revoke), payout (check + balance +
insert), registration, profile update, password change, homework review (+audit), admin user
create/role change (+audit), blog CRUD (+audit), broadcast create, settings update,
certificate issuance path. Repositories expose `*Tx(ex, …)` variants; `DbExecutor` stays
defined in `payments.repository.ts` (type-only imports elsewhere). Read-only flows use no tx.

## 5) Fat routes → services (workers C/D + orchestrator)
- C: 13 admin routes thin (leads, cohorts, users, homework incl. review, blog, notifications,
  audit-logs, settings); new `src/features/crm/server/*` (7 repos + 7 services) and
  `src/features/crm/domain/*` (cohort/homework/notifications policy, pagination).
  Blog admin service lives in crm (public reads stay in features/blog).
- D: analytics (SQL aggregates, `period` 7d/30d/90d/1y/all, legacy keys intact),
  student activity (real enrollments/lesson/homework queries, paginated; `quizScores`
  omitted — no backing table, honesty rule), cron reminders (service + N+1 killed),
  `me` GET/PATCH + `me/password` via profile service.
- Orchestrator: `api/me/payments` → `listUserPayments` repository query.
- Shared: `src/lib/http/errors.ts` (new) — `ServiceError` + `errorResponse()` used by all
  touched routes. Zod on every query/body/param (validations extended: admin/crm/student/
  cron/payment/mcp). payme/click webhook routes keep protocol envelopes (deliberate).

## 6) mcp-server (worker E)
Split into `server.ts`, `auth.ts`, `types.ts`, `tools/{kpis,leads,cohorts,homework,broadcast,
promocode,activity}.ts` + `tools/db*.ts`; `index.ts` = 30-line bootstrap. Real read-only
Drizzle queries (lazy `import("@/db")`, never in tests); grade/broadcast are real writes
(auth-required); promocode honestly unsupported (no table). `MCP_AUTH_TOKEN` fail-closed
at boot + per-call `timingSafeEqual`. `mcp-server/README.md` added.

## Verification
- `npx tsc --noEmit`: CLEAN. `npx vitest run`: **49 files, 428 passed / 1 skipped — green**
  (61 w2-biz + 14 B + 29 D + 38 C + 18 E + rest pre-existing).
- All new/edited backend files ≤250 lines (except generated snapshot JSON). No Drizzle in
  migrated routes. No `any`/`as unknown` in new code.

## Left / risks
- Residual Drizzle-in-route (NOT in task §5 list, left for follow-up): `auth/login`,
  `auth/logout`, `auth/telegram`, `auth/otp/send`, `auth/change-password`, `quiz`,
  `ish/apply` (W2-BIZ thin already), `portfolio*`, `search`, `lms/lessons/*`, `otp/verify`
  session insert (single write, fine).
- `server-only` package is NOT installed — C's `import "server-only"` markers replaced with
  a NOTE comment (bare import crashed at runtime, verified). Recommend `npm i server-only`
  + re-adding one line per `crm/server/*.repository.ts`.
- `errorResponse` changes some error JSON shapes (`{error: code}` + 422s); frontend code
  rendering `data.error` verbatim should map codes to Uzbek copy.
- mcp-server duplicates some CRM query shapes (E struck read-only local queries instead of
  depending on mid-flight C/D services; handlers take injectable deps so a swap is easy).
- `resolveReferrerByCode` takes first 8-hex-prefix match (collision possible at scale).
- Slug-conflict pre-check TOCTOU: unique constraint backstops as 500, not 409.
- Out-of-scope touch (noted per §6): none — all edits inside assigned scope.
