# W10 — Cuts & fixes (closed features, shared rate limiting, error-leak fix)

- **Date:** 2026-09-24
- **Branch:** `wave/w10-cuts-fixes` (not pushed, not deployed)
- **Owner decision:** temporarily CLOSE SpinWheel, `/ish`, `/testimoniyalar` and every
  not-really-built feature. Close = hidden + unreachable + reversible one-line change.
  `/ekspertlar` stays open. Home sections untouched (another agent owns them).

## 1. Closed-features registry — one place to reopen anything

**`src/lib/features/closed.ts`** — typed const map
`{ jobs, testimonials, spinWheel, adminFeatureFlags }`, each
`{ closed: boolean, routes, apis, note }`, plus `isClosed()`,
`closedRoutePrefixes()`, `closedApiPrefixes()`, `isClosedRoute()`, `isClosedApi()`.
Reopen = flip one `closed` flag to `false`; nav, sitemap, layouts, middleware and the
API guard all read the registry, so links come back automatically.

| Feature | Guard | Verified |
|---|---|---|
| `/ish`, `/ish/[slug]` | `src/app/ish/layout.tsx` (`notFound()`) **+** `src/middleware.ts` real-404 | `curl → 404` (index, 2 slugs) |
| `/testimoniyalar` | `src/app/testimoniyalar/layout.tsx` + middleware | `curl → 404` |
| `POST /api/ish/apply` | registry guard, legacy-shape `{ error }` 404 | `curl → 404` |
| Nav | `headerData.ts` filters `/ish` via `isClosedRoute` (entry kept, filter hides) | unit test |
| Sitemap | entries kept with W10 comments, filtered via registry | unit test + live `sitemap.xml` has 0 closed URLs |
| Search index | `STATIC_SEARCH_DATA` never contained closed URLs | unit test pins it |
| Footer / DesktopNav / MobileDrawer / NextStepCTA | never linked closed features — no change | `grep` |
| JSON-LD / robots | no closed refs (robots has no feature entries) — no change | `grep` |
| SpinWheel | **zero imports repo-wide** (`grep`); file kept at `src/components/ui/SpinWheel.tsx`; no promo copy found | `grep` |
| Testimonial/rating blocks | none render on any public page (kurs, pricing, bepul-dars, …). Only honest private empty-state in `/kabinet/baholar` | `grep` |
| Admin sidebar | never had jobs/testimonials entries — no change | read `AdminNav` |

**Why middleware AND layouts:** layout-level `notFound()` rendered the not-found UI
but served **HTTP 200** (static prerender swallows the status, `force-dynamic` did not
change it — build still lists `/ish/[slug] ●`). Middleware returns a genuine 404
status edge-side; layouts stay as defense-in-depth. Unit tests cover both layers.

## 2. Unbuilt-features audit (public site + admin)

| # | Item | Location | Verdict |
|---|---|---|---|
| 1 | Jobs pages + apply API | `src/app/ish/**`, `src/app/api/ish/apply` | **CLOSED** (owner). Code + existing apply tests kept, unreachable |
| 2 | Testimonials page | `src/app/testimoniyalar/**` | **CLOSED** (owner). Data file + seeder kept |
| 3 | SpinWheel | `src/components/ui/SpinWheel.tsx` | **CLOSED** (owner; already unrendered). File kept |
| 4 | Admin Funksiyalar toggles (7 flags) | `FeaturesTab.tsx` | **CLOSED via registry** (`adminFeatureFlags`): flags are stored but **never read** anywhere in `src`; tab hidden, code kept |
| 5 | Homework upload "hozircha yo'q" | `LessonPlayerView.tsx:75` | **KEEP** — honest copy + working Telegram-to-mentor handoff (the A-014 suggested fallback) |
| 6 | "Eslatma" toast | `StudentActivityTracker.tsx` | **KEEP** — already honest: "lokal sinal; Telegram yoki SMS yuborilmagan" |
| 7 | Receipt "Chek tez orada" | `ReceiptsTable.tsx:76` | **KEEP** — honest disabled empty-state, only when provider gave no `receiptUrl` |
| 8 | Disabled pay-method buttons | `PaymentSummaryCard.tsx` | **KEEP** — honestly disabled when provider unavailable / nothing due |
| 9 | Meetlar / Resurslar static cards | `src/app/meetlar`, `src/app/resurslar` | **KEEP** — marketing copy + working `LeadCaptureForm` path, no fake live-data claim |
| 10 | `/ekspertlar` sample profiles | `src/app/ekspertlar/page.tsx` | **KEEP OPEN** (owner). Already labelled "namuna", no invented ratings |
| 11 | Telegram webhook w/o secret stays disabled | `src/app/api/telegram/webhook` | **KEEP** — fail-closed by design |
| 12 | `/portfolio` empty-filter copy | `PortfolioGallery.tsx:23` | **KEEP** — honest empty state, portfolio itself works |

**A-030 note:** job-application paths (`apply.service`, modal, `POST /api/ish/apply`)
still compile and their pre-W10 tests still pass, but are unreachable while `jobs`
is closed — A-030 is moot until reopen (then the 24h-SLA copy must be re-audited).

## 3. Shared rate limiting without Upstash (same `checkRateLimit` signature)

- **New table** `rate_limit_buckets` (`key` PK = `prefix:sha256`, `window_start`
  timestamptz, `count`) in **`src/db/schema/security.ts`** (+1 export line).
  Migration **`drizzle/0007_free_odin.sql`** (additive, own commit `db: W10 migration`).
- **New `src/lib/security/rateLimit/postgresLimiter.ts`**: fixed-window atomic UPSERT
  (`INSERT … ON CONFLICT DO UPDATE … CASE WHEN window expired THEN 1 ELSE count+1 …
  RETURNING`), injected query-runner for tests, 1s bounded attempt, never throws.
- **Order:** Upstash (env set) → Postgres → memory. DB down → `null` → memory
  fallback (fail-open for reads/low-risk; auth OTP/LOGIN keep pre-W10 memory
  behaviour; never a 500). `NODE_ENV=test` skips the PG hop so unit tests stay
  deterministic/fast; PG semantics are covered by injected-fake tests.
- **Hashing:** identifiers are SHA-256'd (`hashRateLimitIdentifier`, Web-Crypto,
  Node+Edge safe) before becoming storage keys — no backend stores raw IPs.
  Key format changed (`ratelimit:<prefix>:<hex32>`); no test depended on old keys.
- **Cron:** `src/app/api/cron/reminders/route.ts` calls best-effort
  `cleanupRateLimitBuckets()` (never fails the run).
- **Tests** (`w10-rate-limit-pg`, `w10-rate-limit-order`): window anchoring, single-
  statement atomicity (asserts `ON CONFLICT`/`EXCLUDED`/`CASE`/`RETURNING` in the
  built SQL), under/over-limit math, expiry reset, string-count tolerance,
  no-`DATABASE_URL` no-touch, DB-down fail-open, Redis-first order, PG-second
  order, memory-degrade chain, key hashing. Existing `rate-limit-degrade` test
  updated to stub `DATABASE_URL=""` (still asserts one warn + memory chain).

## 4. Error-message leak fix (`src/lib/http/errors.ts`)

Unknown 500s (non-`ServiceError`) no longer return `error.message` (could contain
paths/SQL/provider internals): client gets the generic Uzbek recovery text, real
error goes to `console.error` server-side. Explicit `ServiceError` 5xx keeps its
crafted user-safe message; 4xx untouched. `fail()`/`toV1Error()` inherit the fix
(existing `api-v1/respond` tests still pass). New tests in `w10-errors-leak`.

## 5. Secrets hygiene audit (read-only; no values printed)

- `git grep` for `bot[0-9]+:`-shaped tokens, `sk-`, `AKIA`, `postgres://`+creds,
  `password=`, 80+-char base64: **no committed secret values**. `.env` untracked;
  `.env.example` holds only synthetic placeholders. `src/db/index.ts` localhost
  fallback is dev/test-only (production throws without `DATABASE_URL`).
- Admin settings endpoint: **already clean** — `getSettings` strips
  `SECRET_SETTING_KEYS`, returns env-derived `integrationStatus` only; Zod schema
  accepts no secret fields (can't be written via API either); UI is status-only.
- No code fix needed. **Rotate list (names only):** `TELEGRAM_BOT_TOKEN`,
  `TELEGRAM_WEBHOOK_SECRET`, `PAYME_KEY`, `CLICK_SECRET_KEY`, `ESKIZ_API_KEY` /
  SMS password, `RESEND_API_KEY`, `SESSION_SECRET` / `NEXTAUTH_SECRET`,
  Supabase DB password (was in git history), `CRON_SECRET`, `MCP_AUTH_TOKEN`,
  S3/R2 keys if ever committed. (Supersedes W5 item 3 — still open.)

## 6. Budget — First Load JS before → after (locked `npm run build`)

| Route | Before | After |
|---|---|---|
| `/` | 128 kB | 128 kB |
| `/kurs/[slug]` | 123 kB | 123 kB |
| `/portfolio` | 133 kB | 133 kB |
| shared | 102 kB | 102 kB |

No growth (middleware 36.4 → 36.9 kB is edge-only, not page JS). No shrink either:
the removed `/ish` nav entry lived in `headerData.ts`, which currently has no
importers, and closed pages keep their chunks (unreachable). Home sections
untouched per instruction.

## 7. Gates

- `npx tsc --noEmit` ✅ · `npx vitest run` ✅ **72 files / 534 passed** (was 501+1)
- locked `npm run build` ✅ · `e2e/visibility.spec.ts` ✅ 10/10 (responsive full
  suite not re-run: zero public visual change, W5 passed it on near-identical UI)
- New gate tests: every closed route 404s (middleware + layout levels) and is
  absent from the sitemap ✅ (`w10-closed`)

## 8. Left / risks

- Live-DB verification of the PG limiter (window/expiry under real concurrency)
  was impossible — Supabase still unreachable. The UPSERT is single-statement
  atomic by construction; re-verify with a DB smoke test post-restore.
- Closed pages still ship JS chunks (unreachable). If the owner wants them out of
  the bundle entirely, delete the routes — but that breaks one-line reopen.
- `next.config.mjs` CSP `unsafe-inline`/`unsafe-eval` (A-005) untouched — out of scope.
- No screenshots: no public visual change by design.
