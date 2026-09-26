# ZAHAR-FUNNEL Audit — Naqsh conversion funnel

Scope: home, `/diagnostika`, `/bepul-dars`, `/kurs`, `/kurs/[slug]`, checkout/signup, `NextStepCTA`,
header/nav, `siteConfig.ts`, `brand.ts`. Lens: first-time visitor from Telegram/Instagram on a phone.
Read-only audit — no files changed.

**Overall**: the codebase is unusually disciplined about honesty (real countdown, disclaimers on
portfolio numbers, no fake logos/testimonials, "Halol ogohlantirish" sections). The funnel structure
(Hero → Problem → Transformation → Roadmap → Projects → Mentor → Pricing → Comparison → FAQ →
NextStepCTA) is sound. Most of the value here is fixing friction and message-match bugs, not adding
proof.

---

## 1. Top 10 findings (ranked by impact ÷ effort)

### 1. Primary CTA is invisible on phones — the exact audience this funnel targets
**File**: `src/components/layout/Header.tsx:19`
```tsx
<Button href="/diagnostika" data-track="header_diagnostic" size="sm" className="hidden sm:inline-flex">
```
`hidden sm:inline-flex` hides the header's gold "Bepul diagnostika" button below 640px — i.e. on
every phone. A visitor from Telegram/Instagram sees only a theme toggle, user icon and a hamburger
(`src/components/layout/HeaderControls.tsx:21-28`). The CTA only exists inside the drawer, at the
bottom, behind an extra tap (`src/components/layout/MobileDrawer.tsx:14`).
**Why it hurts**: BJ Fogg / Hick's Law — every extra tap between attention and the CTA loses people;
for a mobile-only audience this removes the primary conversion path from the one screen state
(header) that persists through scroll.
**Fix (safe, engineer, today)**: drop `hidden sm:` (keep it compact at `size="sm"` on phones,
e.g. `inline-flex sm:inline-flex` with shorter label `"Diagnostika"` under 400px if width is tight).
No copy change needed.

### 2. "100% pul qaytarish kafolati" oversells a guarantee that actually has conditions
**Files**: `src/lib/siteConfig.ts:14` (`guaranteeText: "7 kunlik 100% pul qaytarish kafolati"`) vs.
`src/app/pul-qaytarish/page.tsx:24` — refund requires "birinchi 2 modulni yakunlab amaliy foyda
ko'rmagan bo'lsangiz" (must finish the first 2 modules and show no practical benefit).
**Why it hurts**: the `offers` skill flags "'100% guaranteed' without specifying conditions" as
legally and brand-wise risky; the `marketing-psychology` skill's Regret Aversion / trust model
depends on the promise matching reality — a student who assumes "100%, no questions asked" and then
hits the 2-module condition at refund time is more distrustful than one who never saw "100%."
**Fix (safe, copy-only, today)** — replace everywhere `guaranteeText` is shown standalone
(Hero, Pricing, CourseCheckoutCard):
- Current: `7 kunlik 100% pul qaytarish kafolati`
- Replace with: `7 kunlik pul qaytarish kafolati — sababli, shartlarsiz emas` is too negative; better:
  `**7 kunlik pul qaytarish kafolati.** Birinchi 2 modulni tugatib, foyda ko'rmasangiz — pulingiz
  qaytadi.` (this is literally `siteConfig.guaranteeSummary`, already written correctly — the fix is
  to stop showing the bare `guaranteeText` string alone near the Hero/CTA and always pair it with
  `guaranteeSummary`, which the Pricing section already does at `Pricing.tsx:13` but the Hero at
  `HeroSection.tsx:40` does not.)

### 3. Homepage FAQ silently reuses the done-for-you *services* FAQ, confusing course buyers
**File**: `src/components/sections/home/Faq.tsx:6-11`
```tsx
const faqs = [
  ...siteConfig.servicesPage.faq,
  ...
```
`siteConfig.servicesPage.faq` (`src/lib/siteConfig.ts:57-62`) contains service-specific Q&A like
*"Mendan nima kerak bo'ladi? — Muqova, Telegram orqali muloqot, zarur kirish ma'lumotlari va
muddatga mos bo'lish."* and *"Nima kirmaydi? — Uzoq muddatli qo'llab-quvvatlash... kirmaydi."* Those
answer questions about the `/xizmatlar` done-for-you package, not the course — but they render on
the homepage FAQ, right before the final CTA, under a heading that only talks about the course.
**Why it hurts**: message-market mismatch (Curse of Knowledge / clarity principle) — a visitor
reading "what's not included" expecting course info gets service-contract language. Confusing
copy at the exact point where objections should be resolved, not created.
**Fix (safe, engineer, today)**: on the homepage, use only the course-specific FAQ array
(the 4 entries starting at `Faq.tsx:7`) and drop the `...siteConfig.servicesPage.faq` spread; keep
that array for `/xizmatlar` only.

### 4. No real urgency (cohort countdown) anywhere above the fold, though it already exists in code
**Files**: `src/components/pages/CohortCountdown.tsx` (already built, honest — parses the real
`siteConfig.nextCohortDate`) is used only on `src/app/kurs/[slug]/page.tsx:69`. The Hero
(`HeroSection.tsx:39`) and homepage Pricing (`Pricing.tsx`) show the date as flat text: `Keyingi
guruh: 15-Oktyabr, 2026`.
**Why it hurts**: Loss Aversion / Scarcity Heuristic — a real, ticking day-count ("Keyingi guruhgacha
20 kun qoldi") converts better than a static date, and it costs nothing to add since the date is
real and the component already exists.
**Fix (safe, engineer, today)**: render `<CohortCountdown date={siteConfig.nextCohortDate} />` next
to the date line in `HeroSection.tsx:39` and in `Pricing.tsx`'s course cards.

### 5. `/bepul-dars` promises a "video dars" but never shows or auto-delivers a video
**Files**: `src/app/bepul-dars/page.tsx:65` (`eyebrow="Bepul video dars · 30 daqiqa"`),
`src/app/bepul-dars/LeadSection.tsx:9-17`, `src/features/leads/ui/LeadCaptureForm.tsx:106-120`.
The actual flow: visitor fills name+phone → "So'rov saqlandi" → must click a second button
("Telegram orqali davom etish") to go message a bot, which is expected to hand them the video link.
No video plays or is linked directly on the site.
**Why it hurts**: `signup` skill — "Show value before asking for commitment" / "Remove uncertainty."
The page's promise ("30 daqiqada... ko'ring") sets an expectation of instant video access; the real
flow is a two-hop handoff to an external channel with no guaranteed timing. This is a real trust and
completion-rate risk, not a copy nit — worth a product decision (see §3 below).
**Fix (needs owner decision on delivery mechanism)** — options, cheapest first:
  a. If the video is recorded and hosted anywhere (YouTube unlisted, Vimeo, Supabase storage):
     embed it directly on `/bepul-dars` after lead capture, no Telegram hop required.
  b. If delivery must stay bot-based, reword the page so the promise matches reality — e.g. change
     the hero eyebrow from `"Bepul video dars · 30 daqiqa"` to `"Bepul dars — Telegram orqali
     olasiz"` and the lead form description
     (`LeadSection.tsx:13`) to make the Telegram step explicit *before* the visitor submits their
     phone number, not after.

### 6. "Kursni band qilish" (reserve the course) wording implies a reservation/scarcity mechanic that doesn't exist
**File**: `src/app/kurs/CourseCheckoutButton.tsx:27`
**Why it hurts**: "band qilish" primes the visitor to expect seat scarcity (Scarcity Heuristic); if
clicking through reveals plain checkout with no seat counter, the promise/reality gap creates the
same Regret Aversion problem as finding #2, just smaller. There's no seat-cap data in the codebase
(`siteConfig.ts` has no `seatsLeft`/`maxSeats` field) so "band qilish" is currently unsupported.
**Fix (safe, copy, today) — pick one that's true**: replace with `"Kursga yozilish"` (enroll) if
there's no real cap, or if the owner confirms a real per-cohort seat limit, keep "band qilish" *and*
show the real number (see §2 in Offer Improvements below — this is an owner decision).

### 7. Diagnostic quiz gates the result behind a contact form with no partial payoff
**File**: `src/features/quiz/ui/DiagnosticQuiz.tsx:21,52-53` — `phase` goes `quiz → contact →
result`; `goNext()` forces `contact` before `result` is ever rendered.
**Why it hurts**: this is a deliberate (and generally effective) Zeigarnik/Commitment-and-Consistency
pattern — finishing 6 questions creates a strong pull to see the payoff, and losing that pull to a
contact-info wall is a known conversion cost in quiz funnels. Not necessarily wrong, but it's the
single biggest unvalidated assumption in the funnel.
**Fix**: **test idea, not a direct fix** — A/B test showing a one-line teaser of the result
("Sizga mos: Vibe Coding Express") before the contact form, then gate the *detailed reasoning* card
behind the form. Use the `ab-testing` skill to size this properly before shipping either variant.

### 8. Hero and Pricing repeat the same two CTAs everywhere with no page-specific variation
**File**: `src/components/ui/NextStepCTA.tsx:7` — every page importing `<NextStepCTA />` without
props gets the identical default title/subtitle ("G'oyangizni keyingi qadamga olib chiqing" / "Avval
2 daqiqalik diagnostikani o'ting...") — used as-is on `/pul-qaytarish`, `/kurs/[slug]` (overridden
there, good), and most other pages.
**Why it hurts**: minor — generic copy at the final CTA misses a chance to recap the specific
objection just addressed on that page (e.g. after the refund-policy page, the CTA should reference
the guarantee, not repeat "diagnostikadan o'ting").
**Fix (safe, copy, low priority)**: pass page-specific `title`/`subtitle` props on high-traffic pages
(`/pul-qaytarish`, `/xizmatlar`) the way `kurs/[slug]/page.tsx:207-210` already does.

### 9. Both course cards show the identical price with no anchor, weakening the "Tavsiya" (recommended) card
**File**: `src/lib/siteConfig.ts:44-53` — `vibe-coding-express` and `ai-asoslari` are both
`"550 000 so'm"`, `oldPrice === price` (so no strikethrough shows, correctly — that part is honest).
**Why it hurts**: not a bug — it's honest. But the Price Relativity / Decoy Effect principle in
`marketing-psychology` notes a middle/anchor option helps people choose faster; with two identical
prices, "Tavsiya" badge (`Pricing.tsx:13`, `index === 0`) is the only differentiator, which is thin.
**This is an owner decision** (see §2 below) — not a code fix, since it would require a real price
or packaging change.

### 10. `/bepul-dars` and `/diagnostika` cross-links create a soft loop but no single obvious "if you're ready now" path for return visitors
**Files**: `src/app/diagnostika/page.tsx:40-55` (post-quiz-abandon card offers `/bepul-dars` and
`/kurs/vibe-coding-express`), `src/app/kurs/[slug]/page.tsx:65` (course page offers `/diagnostika`
and `/bepul-dars` again). A visitor who already knows they want to buy has to actively scroll past
both lead-gen offers to find the buy button/`CourseCheckoutCard`, which is only in the sticky aside
on desktop and the `StickyBuyBar` on mobile (`src/app/kurs/[slug]/StickyBuyBar.tsx`).
**Why it hurts**: minor — the buy path does exist and is reasonably prominent (sticky bar), so this
is a lower-priority polish item, not a blocker.
**Fix (low priority, test idea)**: for return visitors (e.g. `localStorage` flag set after visiting
`/kurs/[slug]` once), consider defaulting `kurs/[slug]/page.tsx:65`'s primary action to "Sotib olish"
instead of "Mosligini tekshirish." Needs `ab-testing` sizing before shipping.

---

## 2. Offer improvements that need NO fake proof

These use levers already available honestly in the codebase, or are explicit owner decisions:

- **Guarantee reframe (safe, code)**: pair `guaranteeText` with `guaranteeSummary` everywhere it's
  shown standalone (finding #2). Zero new data needed — the honest condition already exists in
  `siteConfig.ts`.
- **Real countdown everywhere (safe, code)**: reuse `CohortCountdown` in Hero + Pricing (finding #4).
  Uses the real `nextCohortDate` already in `siteConfig.ts` — no invented scarcity.
- **Seat scarcity — OWNER DECISION**: `siteConfig.ts` has no seat cap field. If the first cohort
  genuinely has a capacity limit (mentor bandwidth for homework review implies one exists), add a
  real `maxSeats`/`seatsLeft` field and show it next to "Kursni band qilish." Do **not** add a
  seat counter without a real number — that's exactly the "fake countdown timer" pattern the
  `offers` skill bans.
- **Bonus stack — OWNER DECISION**: the `offers` skill's playbook for cohort courses suggests a
  genuine, deliverable bonus (e.g. "birinchi 10 ta ro'yxatdan o'tuvchiga 1-hafta homework'ini
  shaxsan Mirzo tekshiradi" or an extra 1:1 15-daqiqalik maslahat) — only if the owner (Mirzo) can
  actually deliver it at cohort scale. This is currently absent from `CourseCheckoutCard.tsx` and
  would raise the "Dream Outcome" / "Perceived Likelihood" levers in the Value Equation without
  fabricating anything.
- **Payment plan framing (safe, copy)**: `installment: "183 334 so'm / oyiga (3 oy)"` is real data
  already in `siteConfig.ts:45`. Mental Accounting principle — show it as the lead price on mobile
  cards (`"183 334 so'm/oy dan boshlab"`) with the full price secondary, since a phone visitor scans
  the smaller number first. Pure reframing of real numbers, no new proof needed.
- **Video-delivery decision (OWNER DECISION, ties to finding #5)**: decide whether `/bepul-dars`
  gets a real embedded video or keeps the Telegram-bot handoff — and make the page copy match
  whichever is true.

---

## 3. Safe now vs. owner-decision

**Safe code/copy changes an engineer can ship today (no new facts needed):**
1. Un-hide the header CTA on mobile (`Header.tsx:19`) — finding #1
2. Pair `guaranteeText` with `guaranteeSummary` in the Hero (`HeroSection.tsx:38-41`) — finding #2
3. Remove `...siteConfig.servicesPage.faq` from the homepage FAQ (`Faq.tsx:6`) — finding #3
4. Add `<CohortCountdown />` to Hero + Pricing — finding #4
5. Reword `/bepul-dars` copy to match the actual Telegram-hop delivery, *if* the owner isn't ready
   to embed a real video yet — finding #5 option (b)
6. Rename "Kursni band qilish" → "Kursga yozilish" unless a real seat cap is confirmed — finding #6
7. Pass page-specific `NextStepCTA` props on `/pul-qaytarish` and other non-course pages — finding #8
8. Lead with the installment price on mobile course cards — §2 payment-plan framing

**Needs the owner's (Mirzo's) decision — do not fabricate data to unblock these:**
1. Whether `/bepul-dars` gets a real hosted video vs. keeps the Telegram-bot handoff — finding #5
2. Whether there is a real per-cohort seat cap to show as scarcity — finding #6, §2
3. Whether a genuine, deliverable bonus can be added to the course offer — §2 bonus stack
4. Whether pricing between the two courses should differentiate (real discount/anchor) — finding #9
5. A/B tests on the quiz result-gating and the post-purchase-intent CTA ordering — findings #7, #10
   (run through the `ab-testing` skill before shipping either variant)
