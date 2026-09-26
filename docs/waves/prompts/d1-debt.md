# Wave D1: Repo Debt Cleanup (0 known debt goal)

You are a precise refactoring agent. Job: eliminate all 3 known repository debts in `scripts/lessons-baseline.json` and achieve 0 failures + 0 known debt on `npm run lessons:check`.

Read first:
- `docs/CODER_AGENT_RULES.md` and `.claude/skills/naqsh-lessons/SKILL.md` (L13 dynamic page soft-404, L19 single responsibility / max 250 lines)
- `scripts/lessons-check.mjs` and `scripts/lessons-baseline.json`

Requirements:

1. **Fix L19 in `src/features/chat/server/chat.service.ts` (currently 263 lines, max 250):**
   - Create `src/features/chat/server/chat-helpers.ts`:
     - Move helper functions like `audit()`, `messageDtos()`, `requireConversation()`, or cursor constants there.
     - Keep exact types and behaviors intact.
   - Import them in `chat.service.ts` so `chat.service.ts` is strictly <= 240 lines.
   - Ensure all existing chat tests (`npx vitest run chat`) pass.

2. **Fix L13 in `src/app/kabinet/kurs/[id]/dars/[lessonId]/page.tsx`:**
   - Import `notFound` from `next/navigation`.
   - Validate that `id` and `lessonId` exist and are non-empty strings. If invalid, call `notFound()`.
   - Note: dynamic page must have `notFound()` or `redirect()` to satisfy L13 check in `scripts/lessons-check.mjs`.

3. **Fix L13 in `src/app/shahodatnoma/[code]/page.tsx`:**
   - Import `notFound` from `next/navigation`.
   - Validate the `code` format: if code is empty or does not match a valid certificate code format (e.g. alphanumeric/hex code), call `notFound()`.
   - Note: dynamic page must have `notFound()` or `redirect()` to satisfy L13 check in `scripts/lessons-check.mjs`.

4. **Update `scripts/lessons-baseline.json`:**
   - Since all 3 known debt items are resolved, update `scripts/lessons-baseline.json` to `{}`.
   - Run `npm run lessons:check`:
     Must output: `lessons-check: 0 failure(s), 0 known debt` with exit 0!

5. **Run all verification gates:**
   - `npm run lessons:check`
   - `npx tsc --noEmit`
   - `npx vitest run`
   - `npm run build`

6. **Write report to `reports/D1-DEBT.md`:**
   - Files changed and line counts
   - Real command outputs
   - Final `lessons-check` output
   - LESSON line at the bottom
