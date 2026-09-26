# ZAHAR-FUNNEL — implementation report

Worktree: `/home/user/wt/funnel`, branch `wave/funnel`, commit `16ae347e5d8a1330c3e00fd694627fb87c7fc420`.
Audit source: `A-FUNNEL.md`. All 6 requested items verified in code first, then implemented. No files
touched outside the ones listed below; no `next build`/`next dev` run.

## 1. Header CTA hidden on phones — `src/components/layout/Header.tsx`
Verified: `Button ... size="sm" className="hidden sm:inline-flex"` — confirmed the gold CTA was
`display:none` below 640px, leaving only ThemeToggle (44px), UserMenu (hidden below `md` unless
logged in) and the hamburger (44px) visible on phones.

Before:
```tsx
<Button href="/diagnostika" data-track="header_diagnostic" size="sm" className="hidden sm:inline-flex">
  Bepul diagnostika
</Button>
```
After:
```tsx
<Button href="/diagnostika" data-track="header_diagnostic" size="sm" className="px-3.5 sm:px-4">
  <span className="sm:hidden">Diagnostika</span>
  <span className="hidden sm:inline">Bepul diagnostika</span>
</Button>
```
- Always visible now; shows the shorter "Diagnostika" label below `sm` (640px) so it fits next to the
  44px theme toggle + 44px hamburger inside the 375px viewport, full "Bepul diagnostika" from `sm` up.
- Tap target unchanged: `size="sm"` = `min-h-10` (40px), meeting the "≥40px" requirement from the task.
  Slightly tightened horizontal padding (`px-3.5` vs base `px-4`) only below `sm` via `twMerge`, to
  give the row a bit more breathing room at 375px; not required by the 44px rule since size="sm" was
  already the header's chosen size sitewide.

## 2. Guarantee honesty — `src/lib/siteConfig.ts`
Verified: `guaranteeText: "7 kunlik 100% pul qaytarish kafolati"` vs. `/pul-qaytarish` terms requiring
"birinchi 2 modulni yakunlab amaliy foyda ko'rmagan bo'lsangiz" — confirmed the mismatch.

Before: `"7 kunlik 100% pul qaytarish kafolati"`
After: `"7 kunlik pul qaytarish kafolati"`

Checked every usage (`grep -rn guaranteeText src`):
- `HeroSection.tsx`, `Pricing.tsx`, `CourseCheckoutCard.tsx`, `PaymentSummaryCard.tsx`,
  `site-facts.ts`, `content.ts` (x2), `telegram/handlers/commands.ts` — all read naturally with the
  shorter string, no punctuation issues (they either show it standalone or already append `.` /
  `. Batafsil shartlar...` after it).
- `pul-qaytarish/page.tsx:26` had a missing period between the guarantee sentence and the next one
  even before this change (`{siteConfig.guaranteeText} Kurs kirish havolasi...` — no `.`). Fixed:
  `{siteConfig.guaranteeText}. Kurs kirish havolasi ochilgandan keyin ...`.
- `src/lib/refund.ts:90` ("100% pul qaytarish kafolati amalda.") is a separate runtime message about
  the refund *outcome* (100% of the money, not the marketing headline) — left untouched, out of scope.
- `refund.test.ts` asserts "100% refund" as a monetary fraction, unrelated to `guaranteeText` — no
  change needed.
- Test/selector updated: `e2e/funnel.spec.ts:57` asserted the old `/7 kunlik 100% Pul qaytarish
  kafolati|100% Pul qaytarish kafolati/i` — updated to `/7 kunlik Pul qaytarish kafolati|Pul qaytarish
  kafolati/i`.

## 3. Homepage FAQ scope — `src/components/sections/home/Faq.tsx`
Verified: `...siteConfig.servicesPage.faq` was spread into the homepage FAQ array, pulling in
service-contract Q&A ("Mendan nima kerak bo'ladi?", "Nima kirmaydi?") that answers the `/xizmatlar`
done-for-you package, not the course.

Before:
```tsx
const faqs = [
  ...siteConfig.servicesPage.faq,
  { question: "Dasturlash tajribasi kerakmi?", ... },
  ...
];
```
After: the spread is removed; the 4 course-specific entries remain unchanged. `siteConfig` import is
still used (`siteConfig.sessionFormat` in the second entry), so no dangling import.
`/xizmatlar` page was not touched — it still owns `siteConfig.servicesPage.faq` directly (checked no
other component reuses the homepage `Faq.tsx` array).
Checked for tests asserting the old homepage FAQ content — none found (`w2-telegram` test file matched
the grep but is an unrelated Telegram-handler test).

## 4. Real urgency (CohortCountdown) in the Hero — `src/components/sections/home/HeroSection.tsx`
Verified `CohortCountdown` (`src/components/pages/CohortCountdown.tsx`): a `"use client"` component
that parses the real `siteConfig.nextCohortDate` string, returns `null` until mounted (avoids
hydration mismatch) and returns `null` if the date fails to parse or is already in the past
(`diff < 0`) — confirmed it degrades safely with no fallback text, matching the "never invent
numbers/scarcity" rule. Its only prior usage (`kurs/[slug]/page.tsx`) wraps it in
`<div className="mb-3 min-h-[46px]">` to reserve layout space.

Change — added next to the existing "Keyingi guruh: ..." line, without touching the headline or any
other hero copy:
```tsx
<span>Keyingi guruh: <strong className="text-ink">{siteConfig.nextCohortDate}</strong></span>
<span className="inline-flex min-h-8 items-center">
  <CohortCountdown date={siteConfig.nextCohortDate} />
</span>
<span className="flex items-center gap-2">...guaranteeText...</span>
```
Also added `sm:flex-wrap sm:items-center` to the parent flex row so a third item wraps cleanly at
narrow `sm`/tablet widths instead of overflowing.
- No layout shift: the wrapping `span` has `min-h-8` (32px, matching the badge's `py-2` + `text-xs`
  rendered height) regardless of whether `CohortCountdown` has mounted/returned content yet.
- Degrades correctly: if `nextCohortDate` were ever past or unparseable, the component renders
  nothing and the row just shows the date + guarantee (verified by reading the component's `days ===
  null → return null` branch — did not need to fake a past date to confirm this, the logic is
  unconditional).
- Client island: `CohortCountdown` already carries `"use client"`; importing it into the server
  component `HeroSection` is the same pattern already used in `kurs/[slug]/page.tsx`.
- Did not touch "build / nonvoyxona" (intentional demo text) or the H1/subhead.

## 5. "Kursni band qilish" → "Kursga yozilish" — `src/app/kurs/CourseCheckoutButton.tsx`
Verified the string and that `siteConfig.ts` has no `seatsLeft`/`maxSeats` field, so "band qilish"
(reserve) is currently unsupported by real data — matches the audit's finding.

Before: `(compact ? "Band qilish" : "Kursni band qilish")`
After: `(compact ? "Yozilish" : "Kursga yozilish")`

Also found and fixed the same wording in the sibling mobile sticky bar (not explicitly named in the
task, but the same honesty issue, same button, same page):
`src/app/kurs/[slug]/StickyBuyBar.tsx`: `"Band qilish"` → `"Yozilish"`.

Selectors updated:
- `e2e/funnel.spec.ts:58` — `getByRole("button", { name: /Joyni band qilish/i })` → `/Kursga
  yozilish/i`. Note: this selector was already stale before my change (it looked for "Joyni band
  qilish", a string that doesn't exist anywhere in current code — likely leftover from an earlier
  copy). Fixed it to match the current/new button text.
- No other test file references "band qilish" or `CourseCheckoutButton`'s label
  (`src/__tests__/w2-biz/checkout-providers.test.ts` tests provider logic, not button copy).

## 6. Installment visible under full price — `src/components/sections/home/Pricing.tsx`
Verified: already present and unchanged —
```tsx
<p className="font-display text-3xl font-semibold text-ink">{price.price}</p>
<p className="mt-1 text-sm text-ink-muted">yoki {price.installment}</p>
```
No code change made (nothing to fix); confirmed no prices were touched.

---

## Gate results
Run from `/home/user/wt/funnel` with `DATABASE_URL=postgres://postgres@127.0.0.1:5432/naqsh`:

- `npx tsc --noEmit` → **0 errors**.
- `npx vitest run` → **615 passed / 1 failed** (Test Files: 91 passed, 1 failed), 616 total tests.
  The 1 failure (`src/__tests__/hardening/sms-session-rate.test.ts` →
  "should strictly gate devCode exposure to development mode", expects 200 got 429) is **pre-existing
  and unrelated to this change** — confirmed by `git stash`-ing all my edits and re-running the same
  test file on unmodified `wave/funnel` (commit `840b3f1`): it fails the same way there (in fact 2
  tests fail stand-alone due to shared in-memory rate-limit state across runs). This is SMS
  OTP rate-limiter test flakiness/state-leak, nothing touched by this task.
- `next build` / `next dev` intentionally **not run** per instructions (shared `.next`, other agents
  on the machine).

## Risks / follow-ups
- The Header CTA's compact padding (`px-3.5` below `sm`) is a minor visual tweak, not verified against
  a live browser at 375px (no `next dev`/Playwright run, per instructions) — worth a quick visual
  check by whichever agent next runs `playwright test e2e/responsive.spec.ts` on this branch.
- `docs/REDESIGN_ROADMAP.md` and `docs/redesign/audit-frontend.md` still reference the old "Kursni
  band qilish" / "Joyni band qilish" copy in prose — left untouched, these are historical audit notes,
  not code or active tests.
- `StickyBuyBar.tsx` and `CourseCheckoutButton.tsx` compact label became "Yozilish" (not explicitly
  named in the task list) — flagging this beyond-scope-but-same-bug fix in case the owner wants to
  review it separately.
