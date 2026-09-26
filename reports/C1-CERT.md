# C1 — Real Certificate Verification & L14 Honesty

**Task:** connect `src/app/shahodatnoma/[code]/page.tsx` to the real verification service and remove the hardcoded mock student ("Jamshid Alimov").

**Date:** 2026-09-26

---

## 1. What changed (file list)

| File | Change |
| :--- | :--- |
| `src/app/shahodatnoma/[code]/page.tsx` | Real DB verification. `verifyCertificate({ code })` for every non-demo code; `notFound()` when the certificate does not exist; rows built from real student/course/score/date. `DEMO2026` renders an explicitly labelled demo (no "Verified" badge). 160 lines (L19). |
| `src/lib/certificates/service.ts` | New `loadCertificateOwner(certificate)` + `CertificateOwner` type: joins `enrollments → users` and `enrollments → cohorts → courses`, with a fallback to the values snapshotted on the certificate row at issuance. 87 lines. |
| `src/lib/certificates/index.ts` | Re-exports `loadCertificateOwner` and `CertificateOwner`. |
| `src/__tests__/c1-certificate-verify.test.ts` | **New** regression suite (4 cases + 5 parametrized format cases). |
| `src/__tests__/d1-dynamic-page-404.test.ts` | The "renders a certificate for a valid code" case now uses `DEMO2026`; a well-formed code with no DB row 404s now, so the old expectation (render truthy) is no longer honest (L13/L14). |

Behaviour matrix:

| Input | Before | After |
| :--- | :--- | :--- |
| `DEMO2026` | rendered "Haqiqiy Sertifikat (Verified)" + fake data | renders demo rows + "Demo namuna — tekshirilmagan" badge + demo note, no DB query |
| `NAQSH-2026-ABCDE` (in DB) | rendered "Jamshid Alimov", `9.4 / 10` (hardcoded) | renders `users.fullName` (fallback `users.phone` → `certificates.holder_name`), `courses.title`, server-derived score `x.x / 10`, `toLocaleDateString("uz-UZ")` date, "Verified" badge |
| `NAQSH-2026-NOPE` (not in DB) | 200 + "Verified" badge (L14 violation) | `notFound()` → 404 |
| malformed code | 404 | 404 (unchanged) |

No hex colors, no inline color styles; only theme tokens.

---

## 2. How I verified it (real command output)

### `npx tsc --noEmit`
```
tsc exit=0
```

### `npx vitest run c1-certificate-verify d1-dynamic-page-404`
```
 Test Files  2 passed (2)
      Tests  21 passed (21)
```

### Full suite `npx vitest run`
```
 Test Files  116 passed (116)
      Tests  788 passed (788)
```

### `npm run lessons:check`
```
lessons-check: 0 failure(s), 0 known debt (repo)
```

### `npm run build`
```
├ ƒ /shahodatnoma/[code]                                    190 B         107 kB
...
build exit=0
```

### L2 — the new join was executed against the live DB (`npx tsx --env-file=.env`)
```
certificates found: 0
unknown enrollment -> {
  holderName: 'h',
  phone: null,
  courseTitle: 'c',
  score: 7,
  issuedAt: 2026-09-26T11:07:16.910Z
}
```
The `enrollments → users / cohorts → courses` join compiles and runs against Supabase without error; the production `certificates` table is currently **empty**, so no real row was available to display. The fallback path (certificate's own snapshotted `holder_name` / `course_title` / `final_score`) is the one exercised above — it never renders an empty or invented field.

### L25 — every class used on the page is emitted in the built CSS
```
bg-bg-sunken: 1
border-border: 1
text-ink-muted: 1
bg-success-soft: 1
border-success-line: 1
```

### L19 — file sizes
```
$ wc -l src/app/shahodatnoma/[code]/page.tsx src/lib/certificates/service.ts
  160 src/app/shahodatnoma/[code]/page.tsx
   87 src/lib/certificates/service.ts
```

---

## 3. What's left / risks

- **`git ls-files` blind spot (L27):** the new test file is still untracked, so `lessons:check` did not read it. I did not `git add`/commit (task did not ask for it) — stage it before trusting the next green run. My change adds/removes no `id=` anchors, so L27 is unaffected either way.
- **Live `certificates` table is empty**, so an end-to-end visual check of a *real* certificate (score formatting, date formatting in `uz-UZ`) against production data was not possible. Formatting is covered by unit assertions (`8.5 / 10`).
- **E2E still valid:** `e2e/responsive.spec.ts` and `e2e/visibility.spec.ts` point at `/shahodatnoma/DEMO2026`, which still renders 200. I did not run Playwright (not in the gate list); after merge, `NAQSH-…` codes for real students will start returning content and unknown codes will return 404 — that is the intended change, but it will make any cached/screenshot baseline of a *non*-demo code invalid.
- **Out of scope:** `generateMetadata` still titles any well-formed code `Sertifikat Tekshiruvi <code>` without checking the DB, so a search engine may index a 404 title. Fixing it needs a second DB call in metadata; say the word and I will do it.
- No commit, push or deploy was performed.

---

LESSON: A public "verify this certificate" page must treat *not found* as a 404 and render the DB row — never a placeholder student, score or "Verified" badge (L14); keep one reserved demo code for e2e that is visibly labelled as a demo, and cover all three branches (demo / found / well-formed-but-absent) with a test that mocks `verifyCertificate`, since `c1-certificate-verify.test.ts` now fails if the page ever renders a hardcoded name, a 200 for an unknown code, or the badge for a demo.
