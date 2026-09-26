# Wave E5: Narx + savollar (Pricing + FAQ) section + fill strand integration

You are a creative UI developer agent. Job: build Wave E slice E5 for the Awwwards redesign on the home page (`/`).

Read first:
- `docs/redesign/awwwards/02-art-direction.md` (§1 row 5 "Narx + savollar | the gold fill | the offer, clear price in so'm", §2 color tokens, §3 type, §4 grid, §7 anti-patterns)
- `docs/CODER_AGENT_RULES.md` and `.claude/skills/naqsh-lessons/SKILL.md` (L6 tokens only, L14 honest copy / real course pricing, L24 in-page geometry measurement, L25 theme-agnostic tokens, L26 no percentage clip-path on non-square boxes)
- Existing story sections: `src/components/sections/home/MuammoSection.tsx`, `src/components/sections/home/UsulSection.tsx`, `src/components/sections/home/DasturSection.tsx`, `src/components/sections/home/NatijalarSection.tsx`.

Requirements:
1. Create `src/components/sections/home/NarxSection.tsx`:
   - `data-lab-section="narx"`
   - Heading: Unbounded clamp(2.25rem, 6vw, 6rem) with U+02BB for oʻ and gʻ (e.g. `Narx — aniq va oddiy.`)
   - Deck: Onest text explaining the offer with full honesty (L14).
   - The fill strand motif: the gold fill of the girih star (`fill` strand) — gold is strictly permitted here per §2 ("Gold: only the diamond strand, the finished star and the primary CTA").
   - Pricing cards / offer:
     - Derive exact prices from `siteConfig.courses["vibe-coding-express"]` and `siteConfig.courses["ai-asoslari"]` in `src/lib/siteConfig.ts` (e.g. price and installment). No invented discounts or fake countdown timers.
     - Include money-back guarantee notice from `siteConfig.guaranteeText` with link to `/pul-qaytarish`.
   - Clear FAQ list (essential questions about prerequisite, session format, language).
   - Theme tokens only: `text-on-brand-surface`, `border-border-onBrand`, `bg-brand-surface`, `text-gold`, `bg-gold`, `border-gold`. No hardcoded hex or rgb (L6).
   - Semantic accessible markup (`<section>`, `<h2>`, `<article>`, `<h3>`, `<button>` / `<a>`, accessible disclosure/accordion).
2. Register `{ id: "narx", strand: "fill" }` in `HOME_LOOM_SECTIONS` in `src/features/lab-naqsh/domain/homeLoom.ts`.
3. Update `src/features/lab-naqsh/domain/homeLoom.test.ts` to assert that `HOME_LOOM_SECTIONS` includes `narx` and `mutedHomeStrands` un-mutes `fill`.
4. Insert `<NarxSection />` inside `<HomeLoom>` in `src/app/page.tsx` right after `<NatijalarSection />`.
5. Remove redundant `<Pricing />` and `<Faq />` from `src/app/page.tsx` and delete the old unused components (`Pricing.tsx`, `Faq.tsx`) if they have no other consumers in `src/`.
6. Run the gates:
   - `npm run lessons:check`
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run build`
7. Run `npx playwright test e2e/responsive.spec.ts -g "home"` to verify 375/390/768/1024/1280/1440 × light/dark layout, tap targets, and no horizontal scroll.
8. Write a report to `reports/E5-NARX.md` with:
   - What shipped
   - Gates real output
   - Token check (L24/L25)
   - LESSON line at the bottom.
