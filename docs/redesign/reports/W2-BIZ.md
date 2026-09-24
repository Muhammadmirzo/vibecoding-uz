# W2-BIZ — Business logic fixes + service architecture (2026-09-24)

## What changed

**Schema (migration generated, NOT applied):** `drizzle/0001_next_shooting_star.sql` via `npm run db:generate` (no `db:migrate` per task).
- `payments.amount_tiyin integer NOT NULL DEFAULT 0` (+ backfill `UPDATE` from `amount_sum` appended by hand).
- `payment_status` enum gains `cancelled`; new `payout_status` enum (`pending/approved/paid/rejected`).
- `payments_provider_txn_uidx` unique `(provider, provider_txn_id)` — provider idempotency backstop.
- `payments_one_pending_per_enrollment` partial unique `(enrollment_id)` where `status='pending'` — one active pending payment per enrollment.
- New tables in `src/db/schema/payouts.ts`: `referrals` (attribution, `referred_user_id` unique), `referral_payouts` (unique `idempotency_key`), `refund_requests` (unique `idempotency_key`).

**Payments** (`src/features/payments/`): `domain/money.ts` (tiyin helpers), `domain/policy.ts` (secret-gated availability, tiyin pricing, reuse decision, Payme-cancel→`cancelled` + revoke rule, Click transition machine, checkout URL builders). `server/payments.repository.ts` (only Drizzle lives here), `checkout.service.ts` (trusted cohort price, pending-payment reuse, pending-enrollment creation for new students), `payme.service.ts` / `click.service.ts` (state machines moved out of routes; CancelTransaction sets `cancelled`, revokes enrollment only when this payment granted access and no other paid payment exists), `refund.service.ts` (eligibility via existing `lib/refund` + request record + access revoke, idempotent).
- Thin routes: `api/payments/checkout|payme|click` + new `api/payments/refund`. `api/me/payments` availability now requires secrets (`PAYME_KEY`, `CLICK_SECRET_KEY`), status schema gains `cancelled`.
- `src/lib/pricing.ts` re-exports tiyin helpers (single implementation); checkout no longer duplicates early-price logic.

**Referrals** (`src/features/referrals/`, new): `domain/policy.ts` (10% bonus rate constant, earned/balance math, amount checks), `server/referrals.repository.ts` + `payout.service.ts` (balance from paid referred payments; client amount capped; idempotent payout record). `POST /api/referral/claim` accepts the legacy `{amountSum}` shape, converts to tiyin, enforces balance (422 on exceed). New `GET /api/referral/balance`.

**Certificates** (`src/features/certificates/`, new): `domain/policy.ts` (paid + all lessons + all homework passed + avg score ≥ 7, no default score), repository + `certificates.service.ts` (`getMyCertificate` read model). `src/app/kabinet/sertifikat/page.tsx` is now an async server component on real data + honest empty state; new `GET /api/me/certificate` and download routes. `src/lib/certificates/service.ts` delegates to the gated service (old `9.5` default removed).

**Quiz**: new `src/features/quiz/domain/validation.ts` (strict per-question/option validation against the bank — note for W2-FUNNEL: I did **not** modify your `questions.ts`/`scoring.ts`, only added this file + `server/quiz.service.ts` which recomputes score/recommendation server-side and ignores the client hint). `POST /api/quiz` quiz-path goes through the service; `free_lesson` path unchanged.

**Jobs/leads**: `applyJobSchema` now requires UUID `jobId` or `jobSlug` (at least one); `src/features/jobs/server/apply.service.ts` resolves UUID against DB `job_openings` (must be `active`) or slug against the active static listing, dedupes same phone + same opening within 24h (409). `POST /api/ish/apply` is thin.

**Validation touched (noted, minimal):** `lib/validations/student.ts` (`cohortId` added, `amountSum` demoted to legacy hint, enrollment-or-cohort required), `lib/validations/jobs.ts` (above).

**Tests:** `src/__tests__/w2-biz/` — 4 files, 61 tests, all with mocked repositories (`@/db` lock mocked): money/policy, checkout+provider machines, refund+referral, certificate+quiz+jobs.

## Verification
- `npx tsc --noEmit`: clean for all touched files. One remaining error is **pre-existing and out of scope**: `src/features/crm/components/Homework/HomeworkReviewModal.tsx(147,17)` JSX tag mismatch from another wave's uncommitted edit.
- `npx vitest run`: **33 files, 329 passed / 1 skipped — all green** (incl. 61 new W2-BIZ tests).
- All new/edited files ≤ 250 lines. No `npm run build` / commits per MASTER_PLAN §6.

## Left / risks (for ARCH / business)
- `ALTER TYPE payment_status ADD VALUE 'cancelled'` cannot run inside a transaction block — `drizzle-kit migrate` may need it executed separately; migration also carries unrelated drift (portfolios/leads/blog defaults from unjournaled `0001_daily_tarot.sql`) — reconcile before applying to Supabase.
- Multi-write paths are advisory-lock serialized but not all single-transaction (repo writes go through `db` directly); acceptable now, ARCH can thread `tx` through.
- Business confirmations needed: 10% referral rate, 50 000 so'm min payout, 7.0 certificate threshold are **new defined constants, not inherited policy**.
- Referral attribution (`attributeReferral`) is implemented but not yet wired into registration — balance is 0 until then.
- Provider money movement for approved refunds is a manual ops step (`refund_requests.status`); payment rows are never auto-marked `refunded`.
- Old `paymeStore`/`clickStore` no-op shims kept for existing hardening tests; removable in ARCH.
