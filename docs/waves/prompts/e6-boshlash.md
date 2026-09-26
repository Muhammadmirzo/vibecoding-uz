# Wave E6: Boshlash (Final CTA + Completion) section + glow strand integration

You are a creative UI developer agent. Job: build Wave E slice E6 for the Awwwards redesign on the home page (`/`). This is the final culmination section of the 6-strand Girih star!

Read first:
- `docs/redesign/awwwards/02-art-direction.md` (§1 row 6 "Boshlash | the gold glow | clear next step (diagnostika test), no trap", §2 color tokens, §3 type, §4 grid, §7 anti-patterns)
- `docs/CODER_AGENT_RULES.md` and `.claude/skills/naqsh-lessons/SKILL.md` (L6 tokens only, L14 honest copy, L24 in-page geometry measurement, L25 theme-agnostic tokens, L26 no percentage clip-path on non-square boxes)
- Existing story sections: `src/components/sections/home/MuammoSection.tsx`, `src/components/sections/home/UsulSection.tsx`, `src/components/sections/home/DasturSection.tsx`, `src/components/sections/home/NatijalarSection.tsx`, `src/components/sections/home/NarxSection.tsx`.

Requirements:
1. Create `src/components/sections/home/BoshlashSection.tsx`:
   - `data-lab-section="boshlash"`
   - Heading: Unbounded clamp(2.25rem, 6vw, 6rem) with U+02BB for oʻ and gʻ (e.g. `Gʻoyangizni bugunoq boshlang.` or `Keyingi qadam — aniq va oddiy.`)
   - Deck: Onest text explaining the next step: 2 daqiqalik diagnostika orqali oʻzingizga mos dastur va boshlash darajasini aniqlang.
   - Glow motif: This is the completion of the Loom! The 8-pointed star radiates its gold aura (`strand: "glow"`). Per §2, Gold is strictly permitted for: "the diamond strand, the finished star and the primary CTA".
   - Clear CTA actions:
     - Primary CTA: `Bepul diagnostika` linking to `/diagnostika` (data-track="cta_diagnostic", variant default / gold-accented).
     - Secondary CTA: `Bepul darsga yozilish` linking to `/bepul-dars` (data-track="cta_free_lesson", variant "onBrand" or theme-token outline).
     - Reiterate no-risk guarantee: "14 kunlik toʻliq kafolat. Hech qanday xatarlarsiz." with link to `/pul-qaytarish`.
   - Theme tokens only: `text-on-brand-surface`, `border-border-onBrand`, `bg-brand-surface`, `text-gold`, `bg-gold`, `border-gold`. No hardcoded hex or rgb (L6).
   - Semantic accessible markup (`<section>`, `<h2>`, `<p>`, `<a>` / `<button>`).
   - File length: strictly <= 250 lines (L19).

2. Register `{ id: "boshlash", strand: "glow" }` in `HOME_LOOM_SECTIONS` in `src/features/lab-naqsh/domain/homeLoom.ts`.
   - Check `mutedHomeStrands()` behavior: when all 6 strands (square, diamond, weave, ring, fill, glow) are accounted for, what does it return? Notice in `homeLoom.ts`, `glow` was previously filtered out because it rested at 0 opacity. Review `homeLoom.ts` and make sure registering `boshlash` -> `glow` works smoothly and logically.

3. Update `src/features/lab-naqsh/domain/homeLoom.test.ts` to assert that all 6 sections are registered in `HOME_LOOM_SECTIONS` and `mutedHomeStrands()` returns empty array `[]` (all strands woven and complete!).

4. Insert `<BoshlashSection />` inside `<HomeLoom>` in `src/app/page.tsx` right after `<NarxSection />`.

5. Remove redundant `<NextStepCTA />` from `src/app/page.tsx`. Check if `<NextStepCTA>` is used in other pages (e.g. blog or course pages); if so, keep `src/components/ui/NextStepCTA.tsx`, only remove its invocation from `src/app/page.tsx`.

6. Run the gates:
   - `npm run lessons:check`
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run build`

7. Run `npx playwright test e2e/responsive.spec.ts -g "home"` to verify 375/390/768/1024/1280/1440 × light/dark layout, tap targets, and no horizontal scroll.

8. Write a report to `reports/E6-BOSHLASH.md` with:
   - What shipped
   - Gates real output
   - Token check (L24/L25)
   - LESSON line at the bottom.
