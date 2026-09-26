# Wave D1 — Repo Debt Cleanup (0 known debt)

**Goal:** clear all 3 entries of `scripts/lessons-baseline.json` (L13 × 2, L19 × 1) and reach
`lessons-check: 0 failure(s), 0 known debt`.

Status: **done** — all gates green (real output below).

---

## 1. Files changed

| File | Before | After | Change |
| :--- | ---: | ---: | :--- |
| `src/features/chat/server/chat.service.ts` | 263 lines | **224 lines** | L19: helpers + cursor constant extracted, no behaviour change |
| `src/features/chat/server/chat-helpers.ts` | — | **48 lines** | new: `audit()`, `messageDtos()`, `requireConversation()`, `CURSOR_OVERLAP_MS`, `ConversationRow` / `MessageRow` types |
| `src/app/kabinet/kurs/[id]/dars/[lessonId]/page.tsx` | 8 lines | **13 lines** | L13: `notFound()` on empty / non-UUID `id` or `lessonId` |
| `src/app/shahodatnoma/[code]/page.tsx` | 92 lines | **104 lines** | L13: `notFound()` on a code that cannot be a certificate code; `generateMetadata` titles unknown codes "topilmadi" |
| `scripts/lessons-baseline.json` | 3 debt items | `{}` | all known debt resolved |
| `src/__tests__/d1-dynamic-page-404.test.ts` | — | **64 lines** (13 tests) | new regression test for both L13 fixes (unknown-slug case) |

### L19 — chat service split

`chat.service.ts` kept only the use cases. Moved verbatim (same types, same queries, same
comments): `audit()`, `messageDtos()`, `requireConversation()`, `CURSOR_OVERLAP_MS` and the two
row types, plus the now-unused `inArray` import which moved with `messageDtos`.
`224 ≤ 240` as required (L19 hard limit is 250).

### L13 — validation details

* Lesson player: `courses.id` and `lessons.id` are `uuid(...).primaryKey()` in
  `src/db/schema/courses.ts:5` and `:36`, and `GET /api/lms/lessons/[lessonId]` already validates
  `z.string().uuid()`. The page now applies the same UUID rule *before* rendering, so
  `/kabinet/kurs/abc/dars/def` 404s instead of rendering a player that can only fail client-side.
* Certificate: real codes are `NAQSH-<year>-XXXXX` (`generateUniqueCertificateCode`,
  `src/lib/certificates/template.ts:12`) and `verifyCertificateSchema` requires ≥ 3 chars.
  Accepted format: `/^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/`, max 64 chars — keeps the existing e2e
  route `/shahodatnoma/DEMO2026` (`e2e/responsive.spec.ts:19`, `e2e/visibility.spec.ts:28`) working
  and rejects empty, spaces, punctuation, trailing dashes and path traversal.
* `notFound()` is called *after* `await params`, i.e. in the page body — not `dynamicParams=false`
  (L21: that "fix" did not work on a fresh prod build).

---

## 2. Verification (real output)

### `npm run lessons:check`

```
> node scripts/lessons-check.mjs

lessons-check: 0 failure(s), 0 known debt (repo)
```
exit 0.

> Note: the new `chat-helpers.ts` and the new test were `git add`ed first — the check reads
> `git ls-files`, so an untracked file is invisible to it (L27 note).

### `npx tsc --noEmit`

```
tsc exit=0
```
(no output, zero errors)

### `npx vitest run chat`

```
 ✓ src/__tests__/w7-chat-agent.test.ts (3 tests) 19ms
 ✓ src/__tests__/w7-chat-telegram.test.ts (11 tests) 20ms
 ✓ src/__tests__/chat-reply-infra.test.ts (4 tests) 13ms
 ✓ src/__tests__/w7-chat-service.test.ts (4 tests) 18ms
 ✓ src/__tests__/w7-chat-routes.test.ts (11 tests) 47ms
 ✓ src/__tests__/w7-chat-domain.test.ts (5 tests) 27ms

 Test Files  6 passed (6)
      Tests  38 passed (38)
```

### `npx vitest run`

```
 Test Files  113 passed (113)
      Tests  770 passed (770)
   Duration  29.46s
exit=0
```

> One earlier run failed `src/__tests__/mcp/w8b-live-sql.test.ts > "studentProfile joins
> enrollments/lessons/homework/payments without column errors"`. That is a **live-DB** test
> (`w8b-live-sql`) and it passed on both subsequent full runs; it is flaky under parallel DB load,
> unrelated to this refactor (it touches no chat or page file). Reported honestly rather than
> hidden.

### `npm run build`

```
 ✓ Compiled successfully in 102s
 ✓ Generating static pages (128/128)
├ ƒ /kabinet/kurs/[id]/dars/[lessonId]                    10.7 kB         145 kB
├ ƒ /shahodatnoma/[code]                                    189 B         107 kB
exit=0
```

### Runtime 404 check (fresh `next build` + `next start`, L21)

```
/shahodatnoma/NAQSH-2026-ABCDE -> 200   (certificate page, 69491 B)
/shahodatnoma/DEMO2026         -> 200   (e2e route still works)
/shahodatnoma/bad%20code%21    -> 200   body = 404 page, contains "404" + <meta name="robots" content="noindex">, 51811 B
/kabinet/kurs/abc/dars/def     -> 307   middleware sends anonymous users to /?auth=1&redirect=…
```

The bad code serves the **404 page body with `noindex`** while the header is still 200 — that is
the documented L21 behaviour of this repo (root `src/app/loading.tsx` streams first, so Next.js
cannot set a 404 status on the streamed response). The fix is what L13 asks for: the page calls
`notFound()`, the not-found UI is rendered and the page is de-indexed, instead of a "Verified"
certificate badge for a code that cannot exist. The lesson player route is auth-gated, so its 404
is covered by the unit test instead (no session available to curl).

### New regression test

`npx vitest run d1-dynamic-page-404`

```
 ✓ src/__tests__/d1-dynamic-page-404.test.ts (13 tests) 12ms

 Test Files  1 passed (1)
      Tests  13 passed (13)
```

Covers: valid course/lesson pair renders; empty, blank and non-UUID ids 404; valid
`NAQSH-2026-ABCDE` and `DEMO2026` render; empty, space, punctuation, trailing-dash and
traversal codes 404; metadata titles.

---

## 3. Notes / risks

* `npm run lint` is **not** a usable gate here: `next lint` is deprecated and, with no ESLint
  config in the repo, it drops into an interactive setup prompt. Not run to completion.
* Out of scope but worth a follow-up wave: `src/app/shahodatnoma/[code]/page.tsx` still renders a
  **static, hardcoded** `ROWS` (holder "Jamshid Alimov", score 9.4) instead of calling
  `verifyCertificate()` from `src/lib/certificates/service.ts`. Format validation is not
  verification — a well-formed but non-existent code still shows a "Verified" badge, which touches
  the L14 honesty rule. Fixing it means a DB call in a public page; left for a separate wave.
* Nothing was committed, pushed or deployed; new files are only `git add`ed (staged) because
  `lessons-check` reads `git ls-files`.

---

LESSON: before believing a `notFound()` fix, check the response **body and `noindex`**, not only
`%{http_code}` — with a root `loading.tsx` a 404 renders with status 200 (L21), so the real proof
is the 404 body plus de-indexing, verified on a fresh `next build && next start`; and `git add` a
new source file before trusting a green `lessons-check`, because it reads `git ls-files`.
