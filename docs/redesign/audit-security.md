# Security Audit — vibecoding-uz (READ-ONLY, 2026-09-24)

Scope: `src`, `mcp-server`, `scripts`, `next.config.mjs`, `src/middleware.ts`, `drizzle`. Method: static read + subagent evidence sweep, spot-verified. No source files modified.
Stack: Next.js `^15.1.7`, React 18, Drizzle/Postgres, Zod, custom HMAC-SHA256 session tokens (no jsonwebtoken/jose).

## P0 — fix before any production push

- `src/app/api/portfolio/route.ts:50-65` — Unauthenticated `POST` creates DB rows (Zod only, no session/role check; route outside middleware matcher). Fix: require admin session (`getAuthSession` + role in `superadmin/admin/manager`) or delete route if CMS-managed.
- `src/app/api/portfolio/[id]/route.ts:7-27,49-58` — Unauthenticated `PATCH`/`DELETE` on any portfolio id. Fix: same admin guard as above; add UUID validation on `id`.
- `src/app/api/admin/homework/[id]/review/route.ts:34-44` — Auth bypass: `mentorId = body.mentorId || session` with fallback to *first user in DB*; unauthenticated caller supplying `mentorId` can grade. Fix: `const s = await getAuthSession(); if (!s || !ADMIN_ROLES.includes(s.role)) return 403`; never trust `body.mentorId`, use `s.userId`.
- `src/app/api/cron/reminders/route.ts:25-27` — Fail-open: `if (!cronSecret) return true` exposes mass Telegram/SMS sender. Fix: `if (!cronSecret) return false` (deny by default) + alert; require `CRON_SECRET` in prod.
- `src/app/api/auth/otp/send/route.ts:41` — Predictable OTP: `Math.floor(100000 + Math.random()*900000)`. Fix: use `crypto.randomInt(100000, 1000000)` (cf. `src/lib/auth/otp.ts:33-41` already uses it).
- `src/lib/auth/session/validate.ts:52-68`, `src/middleware.ts:32` — Session revocation not enforced: `getAuthSession` returns `verifySessionToken(token)` only (signature+expiry), no DB `sessions` lookup; logout DB delete does not invalidate bearer token until expiry (30d). Fix: check `sessions` table (id + expiresAt + revoked) in `getAuthSession`/middleware, or shorten TTL + add refresh/rotation.
- `src/app/api/auth/logout/route.ts:24,33` — `removeSessionCookie()` return value discarded; `Set-Cookie` clear header never sent (function returns string, `cookie.ts:76-81`). Fix: `const h = createClearSessionCookieHeader(); return NextResponse.json(..., { headers: { "Set-Cookie": h } })`.
- `package.json:29` (`next ^15.1.7`) + `src/middleware.ts:18,96-98` — Next <15.2.3 is affected by CVE-2025-29927 middleware authorization bypass via `x-middleware-subrequest`; all `/api/admin/*` protection lives *only* in middleware. Fix: upgrade Next to latest 15.x (>=15.2.3, then verify), AND add in-handler `getAuthSession` + role checks on every `/api/admin/*` and `/api/kabinet/*` route (defense in depth).
- `src/app/api/admin/*` (e.g. `leads/route.ts:7`, `users/route.ts:8`, `cohorts/route.ts:78`, `blog/route.ts:51`, `settings/route.ts:68`, `notifications/route.ts:30`) — No in-handler auth; sole reliance on middleware matcher. Fix: shared `requireAdmin()` helper in each handler (same reason as above).

## P1 — high priority

- `src/lib/auth/session/cookie.ts:61,80`, `src/app/api/auth/login/route.ts:100-106`, `telegram/route.ts:116-123`, `otp/verify/route.ts:160-167` — Cookie `secure` defaults `false`; clear-cookie header (`:80`) omits `Secure` and `Path` inconsistencies. Fix: default `secure=true` in production, always emit `Secure` on clear when `NODE_ENV=production`; consider `__Host-` prefix + `Path=/`.
- `src/app/api/telegram/webhook/route.ts:4-25,35-46` — No `secret_token` verification (`X-Telegram-Bot-Api-Secret-Token`); `GET` leaks config status. Fix: compare secret header with `timingSafeEqual` against `TELEGRAM_WEBHOOK_SECRET`; remove/protect `GET` or return minimal 200.
- Rate limiting partial: enforced only on auth/quiz (`quiz/route.ts:34-37`, `auth/login:13`, `otp/send:12,35`, `otp/verify:13`, `telegram:18`); missing on `api/ish/apply`, `api/payments/*`, `api/admin/*`, `api/referral/claim`, `api/search`, `api/telegram/webhook`. `src/lib/security/rateLimit/index.ts:13-29` falls back to in-memory store (bypassed across Vercel instances). Fix: add Redis/Upstash-backed limiter; extend presets to public writes + webhooks.
- `src/db/index.ts:110-111` — Advisory lock via string interpolation (`hashtext('${safeKey}')`, quote-escape only). Fix: parameter-bind (`tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${strKey}))`))` or `postgres` params.
- `next.config.mjs:1-20` — No `headers()`, no CSP/HSTS/X-Frame-Options/X-Content-Type, no `poweredByHeader:false`; `images.remotePatterns: [{ hostname: '**' }]` allows any remote host. Fix: add security headers block + minimal CSP; pin image hosts; set `poweredByHeader:false`.
- `src/middleware.ts:84-93` — Sets `x-user-id/role/session-id` but zero security headers. Fix: add headers centrally in middleware (`Content-Security-Policy`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, etc.).
- CSRF: no tokens and no `Origin/Referer` check anywhere (only `SameSite=Lax` on session cookie). Fix: add `Origin`/`Host` check on state-changing API routes, or CSRF tokens for cookie-authenticated mutations.
- `next.config.mjs:14-16` — `serverActions.bodySizeLimit: '50mb'` with no binary upload path in repo. Fix: lower to `2mb` (or smallest needed) until uploads exist.
- Secrets hygiene: `.env` + `.env.local` exist in workspace root (gitignored per AGENTS.md but present on disk); AGENTS.md notes a DB password previously committed in `src/db/index.ts` + git history. Fix: rotate DB password, purge history (BFG/filter-repo), verify `git log -S password`; never `vercel env pull` into committed paths.
- `src/db/index.ts:5` vs `.env.example:6` — Code uses dev fallback `postgres://postgres:postgres@localhost…` instead of throwing when `DATABASE_URL` missing. Fix: throw in production if unset (match documented contract).
- `src/app/api/portfolio/route.ts:10-34` — `limit`/`category` via raw `parseInt`/in-memory filter after full `SELECT *` (NaN → `slice(0, NaN)` = empty; table-scan DoS). Fix: Zod-validate query params; push `where`/`limit` into Drizzle query.

## P2 — harden soon

- XSS: only `dangerouslySetInnerHTML` is `src/app/blog/[slug]/page.tsx:65` (JSON-LD with `JSON.stringify(...).replace(/</g,'\\u003c')`) — safe pattern, keep. `ArticleBody.tsx:53-54` avoids `innerHTML` (custom markdown→JSX). Fix: none; add test asserting `<` escaping on JSON-LD.
- Payments (good, keep): Payme Basic verify (`features/payments/payme.ts:55-70` + `route.ts:43-49`), Click MD5 verify (`click.ts:13-30` + `route.ts:49-53`), server-derived amounts (`checkout/route.ts:73-89`, `payme.ts:72-79`, `click.ts:32-37`), tx locks + idempotent replays. Notes: Click MD5 is protocol-mandated (weak by design — rely on `CLICK_SECRET_KEY` secrecy + amount/service-id checks); remove dead client `amountSum` field (`lib/validations/student.ts:41-46`, never read in checkout); add rate limiting + logging on webhook 401s.
- `src/lib/auth/session/token.ts:25-46,62-93`, `telegram/verify.ts:54-64` — Custom HMAC session + Telegram hash check use constant-time compare — good. Note: `SESSION_SECRET` ephemeral dev fallback (`constants.ts:19-24`) invalidates sessions on restart (fine for dev); ensure prod secret ≥32 random bytes via `openssl rand -base64 48`.
- `getClientIp` trust: verify it prefers Vercel/`x-forwarded-for` leftmost only from trusted proxies; otherwise IP rate-limit keys are spoofable. Fix: pin to platform header.
- MCP (`mcp-server/index.ts:466-470`): stdio-only (not network-reachable) — good; 7 tools Zod-validated but write-like tools (`grade_homework`, `broadcast_notification`, `generate_discount_promocode`) return mocked data with hardcoded PII fixtures, no authN/Z. Fix: wire to real DB + admin auth before any non-local transport; scrub fixture PII.
- Dependencies: `telegraf ^4.16.3`, `pdf-lib ^1.17.1`, `drizzle-orm ^0.36.0` have no direct auth role here; run `npm audit` + enable Dependabot; add `overrides` for CVEs after Next upgrade. `scripts/create-admin.ts:25,37-38` correctly takes password from env (min 12 chars) — avoid `--password` CLI flag (leaks via history/ps); prefer env-only + `--generate`.
- Validation detail leakage: `parseResult.error.flatten()` returned to clients on several routes. Acceptable for DX but consider generic messages in production.
- `src/app/api/auth/otp/send/route.ts:83` returns `devCode` only in development — keep; ensure `NODE_ENV` cannot be spoofed (it can't via env) and no prod build uses `development`.

## Suggested fix order

1. Upgrade Next + add `requireAdmin()` in-handler checks (kills P0 bypass class). 2. Close open writes (portfolio, homework review, cron fail-open). 3. OTP `crypto.randomInt` + logout `Set-Cookie` + session-revocation lookup. 4. Headers/CSP/image pinning + `secure` cookies + Telegram webhook secret. 5. Redis rate limits on all public writes/webhooks. 6. Advisory-lock binding + query-param Zod + secrets rotation.
