# W1-SEC Report — P0/P1 Security Fixes (2026-09-24)

## What changed

**New shared security modules (all in assigned scope):**
- `src/lib/auth/require-auth.ts` — DB-backed `getDbSession()` / `requireAuth()` / `requireAdmin()` / `requireMentor()`. Verifies the HMAC token, then checks the `sessions` row (expiry + existence, so logout/revocation is immediate) and reads the role fresh from `users` (never trusted from the token). State-changing requests also pass an Origin/Referer CSRF check. Injectable `SessionDeps` make every gate unit-testable.
- `src/lib/telegram/linkToken.ts` — short-lived (15 min), HMAC-signed, single-use link tokens replacing `/start <user-UUID>` deep links. Edge-compatible (Web Crypto only).
- `src/lib/security/headers.ts` — shared `SECURITY_HEADERS` (CSP incl. next/font + Telegram widget sources, HSTS, `X-Frame-Options: DENY`, Referrer-Policy, Permissions-Policy, X-Content-Type-Options), `passesCsrfCheck`/`isOriginAllowed`, constant-time `verifyWebhookSecret`. Edge-safe (no Node imports).
- `src/lib/security/cron.ts` — `isCronAuthorized()` fail-closed helper.

**Fixes per audit item:**
- Portfolio open writes → `requireAdmin(request)` on POST/PATCH/DELETE; UUID `id` validation; GET query params Zod-validated (`limit` 1–100) and pushed into the Drizzle query (`src/app/api/portfolio/**`).
- Homework review bypass → `requireMentor(request)`; `body.mentorId` and first-user-in-DB fallback removed, reviewer is always `session.userId`; UUID `id` validation.
- Cron fail-open → `isCronAuthorized` returns `false` when `CRON_SECRET` is unset.
- OTP predictability → `crypto.randomInt(100000, 1000000)` in `auth/otp/send`.
- Session revocation → all protected handlers use DB-backed gates: `me`, `me/password`, `me/payments`, `lms/lessons/[lessonId]`, `payments/checkout`, `referral/claim`, `auth/change-password`; every `/api/admin/*` handler + portfolio writes. `getAuthSession` (token-only) is now unused by handlers.
- Logout → returns `Set-Cookie` clear header on both success and error paths.
- Next upgrade → `next ^15.5.26` (CVE-2025-29927 fixed, `x-middleware-subrequest` bypass class closed) + in-handler checks on every admin/kabinet route as defense in depth.
- Cookies → `Secure` defaults on in production for set + clear headers.
- Telegram webhook → requires `X-Telegram-Bot-Api-Secret-Token` (fail-closed when unconfigured), Zod-validated update object, WEBHOOK rate limit, GET reduced to minimal `{ ok: true }` (no config leak).
- Telegram takeover → `contact.user_id === ctx.from.id` ownership check (`isContactOwnedBySender`); deep-link payloads only redeem via signed single-use tokens in `linkAccount.ts` (+ phone-prefix legacy branch removed).
- Rate limiting → new presets `PUBLIC_WRITE`/`WEBHOOK`/`CHECKOUT`/`REFERRAL`/`SEARCH`; enforced on `ish/apply`, `payments/checkout`, `payments/payme`, `payments/click`, `referral/claim`, `search`, `telegram/webhook` (auth/OTP/quiz already had limits; Redis-backed limiter with memory fallback already existed).
- Config → `next.config.mjs`: `headers()` with CSP/HSTS/X-Frame-Options/Referrer-Policy/Permissions-Policy/X-Content-Type-Options, `poweredByHeader: false`, pinned `images.remotePatterns` (was `**`), `serverActions.bodySizeLimit` 50mb → 2mb. Middleware applies the same headers to all matched responses.

**Tests (vitest, all new in `src/__tests__/security/`):** `w1-sec.test.ts` (cookies, OTP CSPRNG + no-`Math.random` regression, cron fail-closed, webhook/CSRF helpers, headers/CSP, link-token lifecycle, contact ownership, presets), `w1-sec-gates.test.ts` (401/403/ok/CSRF gates with injected fakes + real-HMAC flow), `w1-sec-routes.test.ts` (unauthenticated 401s on admin/portfolio/review/webhook routes), `w1-sec-logout.test.ts` (Set-Cookie clear header).

**Verification:** `npx tsc --noEmit` clean; `npx vitest run` → 29 files, 268 passed / 1 skipped. No `npm run build` / `next dev` per MASTER_PLAN §6. No commits.

## What's left / out of scope (noted, not done)
- `src/db/index.ts` advisory-lock string interpolation + `DATABASE_URL` production throw: outside W1-SEC file scope (`src/db/**` not listed) — recommend to ARCH/BIZ wave.
- `src/app/admin/**/page.tsx` server-page guards: pages are presentational client-hook shells; page-level protection stays in `src/middleware.ts` matcher (redirect to `/admin/login`). Moving `/admin/login` out of the admin layout for a layout-level guard is a routing change left for APP wave.
- Legacy `getAuthSession` (token-only) kept for Edge/middleware use with a warning comment; handlers no longer call it.
- `TELEGRAM_WEBHOOK_SECRET` and `TELEGRAM_LINK_SECRET` must be set in production env (fail-closed until then); existing `/start <UUID>` deep links in the wild stop working by design — clients must mint tokens via `createTelegramLinkToken`.
- Rate limiting is Upstash-Redis-backed when configured, in-memory fallback otherwise (multi-instance note kept in code).

## Risks
- CSRF Origin check only triggers when Origin/Referer is present; non-browser clients without those headers still rely on SameSite=Lax + auth gates (documented in code).
- CSP uses `unsafe-inline`/`unsafe-eval` for scripts (required by Next.js runtime); tightened via source allowlists otherwise.
- Parallel waves are editing UI files in the same tree (`src/app/*`, `src/components/*`, `src/features/*` show as modified/deleted in `git status`); W1-SEC did not touch any of them.
