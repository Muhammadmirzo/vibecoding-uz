# Wave C1: Real Certificate Verification & L14 Honesty

You are a precise full-stack security & verification agent in Naqsh (VibeCoding.uz).
Job: Connect `src/app/shahodatnoma/[code]/page.tsx` to the real certificate verification service, eliminating the hardcoded mock student ("Jamshid Alimov") while preserving honest verification badges and DEMO route compatibility.

Read first:
- `docs/CODER_AGENT_RULES.md`
- `.claude/skills/naqsh-lessons/SKILL.md` (L13 soft-404, L14 honesty rule: never fake verification, L19 max 250 lines)
- `src/lib/certificates/service.ts` (`verifyCertificate({ code })`)
- `src/app/shahodatnoma/[code]/page.tsx`

Requirements:
1. **Dynamic Real Verification in `src/app/shahodatnoma/[code]/page.tsx`:**
   - Keep `isCertificateCode(code)` validation. If invalid format, call `notFound()`.
   - Support `code === "DEMO2026"` for e2e tests (render the demo certificate with clear demo note).
   - For all other codes, call `verifyCertificate({ code })` from `src/lib/certificates/service.ts`.
   - If not found in the DB, call `notFound()`! Do NOT render a "Verified" badge for non-existent certificates (violates L14).
   - If found, load student user details and course details:
     - Egasining ismi: student's `fullName` or `phone`
     - Kurs nomi: course title
     - Umumiy o'rtacha ball: derived score formatted to 1 decimal place (e.g. `8.5 / 10`)
     - Berilgan sana: formatted date (`toLocaleDateString("uz-UZ")`)
   - Keep file under 250 lines (L19). Keep theme tokens only (no hardcoded hex).

2. **Add Regression Test Suite in `src/__tests__/c1-certificate-verify.test.ts`:**
   - Test that DEMO2026 renders cleanly.
   - Test that an invalid code format calls `notFound()`.
   - Test that a valid-formatted code that does not exist in the database calls `notFound()`.
   - Test that an existing certificate in DB renders its real data.

3. **Gates before completion:**
   - `npm run lessons:check` -> 0 failures, 0 known debt
   - `npx tsc --noEmit` -> exit 0
   - `npx vitest run c1-certificate-verify d1-dynamic-page-404` -> pass
   - `npm run build` -> exit 0

4. **Write report to `reports/C1-CERT.md`:**
   - Summary of changes, real command outputs, and final LESSON line at bottom.
