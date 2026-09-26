# P1 — `/kabinet` LCP & Server Hydration Optimization

**Date:** 2026-09-26 · **Branch/worktree:** `wave/p1-kabinet-perf` · **Scope:** `src/app/kabinet/`, `src/features/lms/{domain,server}/`, `vitest.config.ts`

---

## 1. Root cause (confirmed by measurement, not assumption)

The logged-in `/kabinet` route painted in three stages:

1. `page.tsx` called only `getAuthSession()` (cookie signature, **no DB**) and rendered
   `KabinetDashboardClient` through `next/dynamic`.
2. The client mounted with `loading: true`, so the server HTML contained **only a skeleton**
   (`aria-busy="true"`), and the `h1` was the nameless "Xush kelibsiz".
3. A `useEffect` then fired **two client-side HTTP requests** (`/api/me`, `/api/me/payments`),
   each re-doing the DB session gate server-side, before the real content could paint.

Measured baseline (warm `next start`, headless Chromium, local box): the dashboard was **still a
skeleton 4 s after load**; the real content only appeared at **LCP 2816 ms**, and both
`/api/me` and `/api/me/payments` were in the resource waterfall. That matches the reported >3.5 s.

## 2. What changed

| File | Change |
| :--- | :--- |
| `src/features/lms/domain/kabinet-dashboard.ts` (new, 20 lines) | Pure, I/O-free types (`KabinetDashboardUser`, `KabinetDashboardPayment`, `KabinetInitialData`) + `hasActiveEnrollment()`. Safe to import from a client island. |
| `src/features/lms/server/kabinet-dashboard.repository.ts` (new, 53 lines) | Drizzle reads for the dashboard: `findActiveSessionUser()` (one join of `sessions ⋈ users` that **validates the session and returns the name in a single round trip**) and `listPayments()`. |
| `src/features/lms/server/kabinet-dashboard.ts` (new, 53 lines) | `loadKabinetInitialData(sessionHint, deps?)`. Two queries issued together; returns `null` for **every** failure mode (revoked/expired session, missing user, DB unreachable) so the route can never 500. |
| `src/app/kabinet/page.tsx` (37 → 46 lines) | After the existing cookie check, prefetches and passes `initialData` to the client. Guest path is untouched and still does zero DB work. |
| `src/app/kabinet/KabinetDashboardClient.tsx` (129 → 146 lines) | New optional `initialData` prop: when present the state starts as `loading: false` with the prefetched `user`/`payments` and the fetch effect is skipped. When absent, the original fetch path runs unchanged. `hasActiveEnrollment` now comes from the shared domain rule. |
| `src/features/lms/server/kabinet-dashboard.test.ts` (new) | 8 tests: happy path, scoping of both reads, revoked session, incomplete/absent session hint, DB down on either read, `hasActiveEnrollment` truth table. |
| `src/__tests__/kabinetDashboardClient.test.ts` (new) | Server-renders the island with `react-dom/server`: asserts the first HTML contains the real dashboard and **no** `aria-busy="true"`, and that the skeleton still renders without `initialData`. |
| `vitest.config.ts` | `esbuild: { jsx: "automatic" }` — tsconfig uses `"jsx": "preserve"` (Next requirement), so esbuild fell back to the classic runtime and any test that server-renders a `.tsx` component failed with `React is not defined`. |

### Design decisions worth knowing

- **No DB call added to the guest path.** `getAuthSession()` (cookie only) still decides guest vs
  dashboard; `loadKabinetInitialData` is reached only for a signed-in visitor.
- **Authoritative auth is preserved.** The prefetch does not trust the token: `findActiveSessionUser()`
  requires an unexpired `sessions` row owned by that `users` row (`gt(sessions.expiresAt, now())`).
  A logged-out/revoked session yields `null`, so nothing is prefetched into the HTML. A malformed id
  short-circuits before the query (a bad uuid would raise Postgres `22P02`).
- **Round trips, not just latency.** `getDbSession()` + `findMe()` + `listUserPayments()` is 4
  sequential queries. The dashboard needs none of the profile columns, so the join collapses it to
  **2 parallel queries** (measured 4228 ms → 774 ms warm on this dev box).
- **The client imports only `domain/`.** An earlier draft had the island importing
  `hasActiveEnrollment` from the `server/` module, which would have pulled `@/db` into the client
  bundle. The pure rule now lives in `domain/`, and the `server/` module re-exports **types only**.

## 3. Verification (real output, not claims)

### Gates

```
$ npm run lessons:check
lessons-check: 0 failure(s), 0 known debt (repo)
exit=0

$ npx tsc --noEmit
exit=0

$ npx vitest run kabinet
 Test Files  2 passed (2)
      Tests  10 passed (10)
exit=0

$ npx vitest run            # full suite, no regressions
 Test Files  117 passed (117)
      Tests  790 passed (790)

$ npm run build
 ✓ Compiled successfully in 12.3s
├ ƒ /kabinet                                              2.86 kB         142 kB
build exit=0
```

L19 line counts (all ≤ 250): `page.tsx` 46, `KabinetDashboardClient.tsx` 146,
`domain/kabinet-dashboard.ts` 20, `server/kabinet-dashboard.ts` 53,
`server/kabinet-dashboard.repository.ts` 53, tests 82 + 33.
L6 color grep: `grep -rEn "(text|bg|border)-\[#" src` → 0 hits.
L15 secret grep: `grep -rEn "postgres://[^ ]*:[^ ]*@" src | grep -v "@localhost"` → only the test
dummies in `src/__tests__/ops/*` (already allow-listed).
New files were `git add`ed before the final `lessons:check`, because it reads `git ls-files` (L27).

### Live DB check of the new query (L2)

Run read-only against the real Supabase project with an existing unexpired session:

```
findActiveSessionUser #2: 780ms
  -> { userId: 'd312280c-…', fullName: 'Super Admin' }
  -> garbage sessionId "not-a-uuid":      null   (short-circuit, no query)
  -> wrong userId:                         null
  -> nonexistent session:                  null
  -> DB throwing:                          null   (client fallback, no 500)
loadKabinetInitialData: {"user":{"fullName":"Super Admin"},"payments":[{"enrollmentId":null,"status":"pending"}]}
```

### Browser measurement (headless Chromium, warm `next start`)

| | LCP | CLS | `/api/*` calls from the client | `h1` in first HTML | skeleton |
| :--- | ---: | ---: | :--- | :--- | :--- |
| guest — before | 364 ms | 0 | `v1/events` | "Kabinetga kirish uchun tizimga kiring" | no |
| guest — after | 216 ms | 0 | `v1/events` | "Kabinetga kirish uchun tizimga kiring" | no |
| **logged-in — before** | **2816 ms** | 0 | `me`, `me/payments`, `v1/events` | "Xush kelibsiz" (no name) | **yes** |
| **logged-in — after** | **900 ms** | 0 | `v1/events` only | "Xush kelibsiz, Super Admin" | no |

Guest TTFB 26 ms / total 27 ms (`curl`: `status=200 ttfb=0.022s total=0.027s`) — unchanged and still
with **no DB round trip**. Console errors: none introduced (see §5 for the one pre-existing 404).

**Reading the numbers honestly:** the remaining ~900 ms of LCP on this machine is almost entirely one
database round trip — a measured single query costs ~780 ms here because the dev box sits far from
the `aws-0-ap-southeast-2` pooler. In production (`syd1` Vercel function next to that same region,
L16) the two queries are tens of milliseconds, and what is actually removed is the entire
client-side waterfall: the real content now ships in the first HTML instead of after JS parse +
hydration + two authenticated round trips. A production RUM/LCP check after deploy is the last
confirmation I could not run from here.

## 4. Functionality preserved

- **Guest:** `KabinetGuestView` unchanged, still server-rendered with no DB call; LCP and TTFB
  unchanged; the loader is never invoked.
- **Revoked / expired session:** the prefetch returns `null`, the page renders the client without
  `initialData`, and the client hits `/api/me`, which answers 401 → the existing "Texnik xizmat
  vaqtincha ishlamayapti / Qayta urinish" state, exactly as before.
- **DB down:** caught in the loader, `null`, no 500, same fallback as above.
- **No layout shift:** nothing about the markup changed, only when it arrives (CLS 0 measured).
- **No new client bundle weight:** the island gained one prop and a shared pure import; `/kabinet`
  stayed at 2.86 kB / 142 kB First Load JS in the build output.

## 5. Risks / out of scope (honest notes)

1. **Pre-existing 404, unchanged by this work.** `/kabinet` logs
   `404 …/kabinet/kurs/vibe-coding-express?_rsc=…` (a Next `<Link>` prefetch) because
   `src/app/kabinet/kurs/` only contains `[id]/dars/[lessonId]`. `KabinetNav` and the `ActiveCourse`
   "Davom etish" button both link to that non-existent route. It is identical in the baseline run,
   so I did not touch it — it is a content/L13 issue, not a perf one, and it needs a decision about
   the real course URL.
2. **Two queries now run on the server render.** That is the intended trade (server DB round trip in
   one region vs. an extra client round trip + hydration). If `/kabinet` ever gets a hard latency
   budget, the next step would be a short-lived per-user cache or streaming the header first.
3. **Vitest now transforms JSX with the automatic runtime.** This only affects tests; the Next build
   is untouched (tsconfig keeps `"jsx": "preserve"`).
4. Not run: `npx playwright test e2e/responsive.spec.ts` (this change adds no responsive/layout
   styling) and any production RUM check (needs a deploy).

## 6. New lesson (for `.claude/skills/naqsh-lessons/SKILL.md` + `scripts/lessons-check.mjs`)

| # | Mistake we made | Check that prevents it |
| :--- | :--- | :--- |
| L28 | A "server prefetch" client island first imported a **value** (`hasActiveEnrollment`) from a `features/*/server/*` module. That module imports `@/db`, so the DB client would have been pulled into the browser bundle — and `src/db/index.ts` throws in production without `DATABASE_URL`, i.e. a page that used to work would break at build/runtime. Type-only imports are erased, value imports are not | Any `"use client"` file may import from `features/*/server/**` **only** through `import type`. Add to `scripts/lessons-check.mjs`: for every tracked `*.tsx` containing `"use client"`, fail if it has a non-`type` import whose path matches `/server/`. Shared pure logic belongs in `features/*/domain/` (already the documented no-I/O layer) |
| L29 | A perf fix was declared "done" on a stale server: `next start` from the previous build was still holding the port (`kill $(lsof -t -i:<port>)` silently did nothing because `lsof` could not see the socket), so the "baseline" and "after" numbers both came from the patched build. The first measurement even showed the skeleton-free HTML in the *baseline* | Before every before/after perf measurement, confirm the port is actually free — `ss -ltnp | grep <port>` and kill the `pid=` (L18's `lsof` recipe is not reliable here), and check the server log for `EADDRINUSE` before trusting a single sample. Cheap automated guard: a perf script should `curl` once after start and assert the response matches the build it claims to serve |

---

**Gates:** `lessons:check` 0/0 · `tsc --noEmit` exit 0 · `vitest run kabinet` 10/10 · `vitest run`
790/790 · `npm run build` exit 0 · measured `/kabinet` LCP 2816 ms → 900 ms, CLS 0, guest path
unchanged and DB-free.
