# W5-ARCH — Finish the W4 "Left / risks" Drizzle-in-route list (2026-09-24)

Backend-only. No UI files touched. No build/dev/commit/package installs. No `db:migrate`/`db:push` run.
Scope kept to `src/app/api/**`, `src/features/*/server|domain`, `src/lib/**` (untouched), `src/__tests__/**`.

## 1) What changed

### Auth (`src/features/auth/server/` — 4 new repositories, 5 new services)
- `auth-user.repository.ts` (new) — `AuthUserRepository`: `findByPhoneOrEmail/ById/ByPhone/ByEmail/ByTgId`
  reads plus `ensureProfileTx`, `updateLoginFieldsTx`, `updateCredentialsTx`, `insertAuthAuditTx`.
- `auth-session.repository.ts` (new) — `AuthSessionRepository`: `createSession` (single write, `db`),
  `createSessionTx` (transactional), `deleteSession` (single `db.delete(...).where(...)` chain).
- `otp.repository.ts` (new) — `OtpRepository`: `findActiveOtp` (active/unused/unexpired/attempts<5,
  newest first), `bumpAttempts`, `markUsed`, `insertOtp` (deliberately no `.returning()`).
- `password-auth.service.ts` (new) — `loginWithPassword`: user lookup → verify → **one
  `withTransactionLock` (profile-ensure + session insert + last-login touch)** → sign token.
- `session.service.ts` (new) — `logoutSession`: best-effort revoke, never throws for missing/invalid
  tokens (route still always clears the cookie, even on DB failure — legacy semantics).
- `telegram-auth.service.ts` (new) — `loginWithTelegram`: bot-token fail-closed → hash verify →
  freshness → user lookup; unknown tg-id returned as `phone_link_required` **data** (never invents
  a phone — `users.phone` is NOT NULL); profile/session update in one transaction.
- `otp.service.ts` (new) — `requestOtp` (insert hash → send SMS; prod fail-closed returned as
  `{ok:false}` data, not thrown) and `verifyOtp` (attempts accounting + single-use marking as
  before; new-user registration user+profile+referral-attribution in one transaction via injected
  `RegistrationRepository`; session insert stays a single write per W4 note).
- `change-password.service.ts` (new) — `changeCredentials`: old-password check (skipped for
  passwordless accounts), phone/email uniqueness pre-checks, then **user update + audit row in one
  transaction**.

### Quiz / Portfolio / Search / LMS
- `features/quiz/server/quiz.service.ts` — extended `QuizRepository` with `insertFreeLessonLead`,
  added `submitFreeLessonLead` (preserves client-set `status`, was `data.status` in legacy) and
  exported `normalizeQuizContact` (byte-identical normalization, moved out of the route).
  `submitQuizLead` now throws `ServiceError(INVALID_ANSWERS, 400)` instead of `QuizError`
  (`QuizError` class kept, no longer thrown).
- `features/portfolio/server/` (new) — `portfolio.repository.ts` + `portfolio.service.ts`
  (`listPortfolios` incl. the deliberate static-seed fallback on empty/unreachable table,
  `createPortfolio`, `updatePortfolio`/`deletePortfolio` with `NOT_FOUND` 404).
- `features/search/` (new) — `domain/search.ts` (pure helpers moved verbatim out of the route) +
  `server/search.repository.ts` + `server/search.service.ts` (`globalSearch`, per-source
  try/catch degradation to the static index). `src/app/api/search/searchIndex.ts` is now a
  thin re-export shim.
- `features/lms/server/` (new) — `lesson.repository.ts` (`findLessonWithContext`,
  `listSectionLessons`) + `lesson.service.ts` (`getLessonDetail`; locked lessons returned as
  `{ok:false, reason, message}` data so the 403 `{error, reason}` contract is byte-identical).

### Routes (all thin: Zod `.parse()` → rate-limit/auth → service → `errorResponse`)
`api/auth/login`, `api/auth/logout`, `api/auth/telegram`, `api/auth/otp/send`,
`api/auth/otp/verify` (+ `verify-otp` re-export untouched), `api/auth/change-password`,
`api/quiz`, `api/portfolio` (+ `[id]`), `api/search`, `api/lms/lessons/[lessonId]`.
Zero Drizzle/`@/db` imports remain in any of them (verified by grep).

### Tests (`src/__tests__/w5-arch/`, 9 files, 37 tests, all mocked repositories)
password-auth, session, telegram-auth, otp (send + verify incl. registration/attribution),
change-password, quiz-free-lesson, portfolio, search, lesson.

## 2) Verification
- `npx tsc --noEmit`: CLEAN.
- `npx vitest run`: **58 files, 465 passed / 1 skipped — green** (49 W4 files + 9 new W5 files).
- All new/edited backend files ≤ 250 lines. No `any` / `as unknown` in new code.

## 3) Contract notes (success payloads, statuses, side effects identical)
- Error envelopes on migrated routes now follow the W4 pattern (`{error: code, message}`,
  Zod → `validation_error` 400); status codes and success bodies/cookies/headers unchanged.
  Three legacy shapes were deliberately preserved where pinned by existing tests or client needs:
  otp/send prod 503 sentence-body (hardening test), logout always-success + clear-cookie
  (logout test), telegram 422 `phone_link_required` + `tgUserId/tgUsername/fullName`, lesson 403
  `{error, reason}`, `randomInt` staying in the otp/send route file (source-grep test).
- Ordering deviation from "parse → auth": admin-gated portfolio writes run `requireAdmin` FIRST
  (W1-SEC test pins 401-before-validation).

## 4) What's left / risks
- `features/lms/drip/access.ts` still queries via `db` directly — it is feature-layer (not a route
  handler) and is covered by drip tests, so it was left as the injectable seam (`LessonAccessChecker`)
  instead of being rewritten. Follow-up: give it a repository + `*Tx` variants like the rest.
- `server-only` still not installed — new `server/*` files carry the same NOTE comment as W4.
- Same accepted W4 caveats still apply: `errorResponse` code-vs-sentence error bodies (frontend
  should map codes to Uzbek copy); `resolveReferrerByCode` 8-hex-prefix collision at scale.
- Out-of-scope touch (noted per §6): none — all edits inside assigned scope.
