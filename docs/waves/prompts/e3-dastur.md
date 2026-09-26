# Wave E3: Dastur (Curriculum) section + weave strand integration

You are a creative UI developer agent. Job: build Wave E slice E3 for the Awwwards redesign on the home page (`/`).

Read first:
- `docs/redesign/awwwards/02-art-direction.md` (§1 row 3, §2 color tokens, §3 type, §4 grid)
- `docs/CODER_AGENT_RULES.md` and `.claude/skills/naqsh-lessons/SKILL.md` (L6 tokens only, L24 verify token classes, L25 theme-agnostic tokens)
- Existing story sections: `src/components/sections/home/MuammoSection.tsx` and `src/components/sections/home/UsulSection.tsx`

Requirements:
1. Create `src/components/sections/home/DasturSection.tsx`:
   - `data-lab-section="dastur"`
   - Heading: Unbounded clamp(2.25rem, 6vw, 6rem) with U+02BB for oʻ and gʻ (e.g. `8 hafta. Har hafta — bitta yangi qatlam.`)
   - Content: Honest 8-week curriculum breakdown showing what the student builds week by week (e.g., Hafta 1-2: AI bilan ishlash asoslari va prompt muhandisligi, Hafta 3-4: Foydalanuvchi interfeysi va komponentlar, Hafta 5-6: Ma'lumotlar bazasi va server logikasi, Hafta 7-8: To'lovlar, xavfsizlik va jonli deploy).
   - Theme tokens only: `text-on-brand-surface`, `border-border-onBrand`, `bg-brand-surface` (never hardcode hex or rgb).
   - Semantic accessible markup.
2. Register `{ id: "dastur", strand: "weave" }` in `HOME_LOOM_SECTIONS` in `src/features/lab-naqsh/domain/homeLoom.ts`.
3. Update `src/features/lab-naqsh/domain/homeLoom.test.ts` to assert that `HOME_LOOM_SECTIONS` includes `dastur` and `mutedHomeStrands` un-mutes `weave`.
4. Insert `<DasturSection />` inside `<HomeLoom>` in `src/app/page.tsx` right after `<UsulSection />`.
5. Run the gates:
   - `npm run lessons:check`
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run build`
6. Take screenshots across 390 and 1440 viewports in dark/light mode using playwright if available, or confirm layout.
7. Write a report to `reports/E3-DASTUR.md` with:
   - What shipped
   - Gates real output
   - Token check (L24/L25)
   - LESSON line at the bottom.
