# Wave E4: Natijalar (Portfolio / Student Projects) section + ring strand integration

You are a creative UI developer agent. Job: build Wave E slice E4 for the Awwwards redesign on the home page (`/`).

Read first:
- `docs/redesign/awwwards/02-art-direction.md` (§1 row 4 "Natijalar | the outer tessellation (ring) | real student projects only", §2 color tokens, §3 type, §4 grid, §7 anti-patterns)
- `docs/CODER_AGENT_RULES.md` and `.claude/skills/naqsh-lessons/SKILL.md` (L6 tokens only, L14 honest copy / no invented metrics, L24 verify token classes, L25 theme-agnostic tokens)
- Existing story sections: `src/components/sections/home/MuammoSection.tsx`, `src/components/sections/home/UsulSection.tsx`, `src/components/sections/home/DasturSection.tsx`.

Requirements:
1. Create `src/components/sections/home/NatijalarSection.tsx`:
   - `data-lab-section="natijalar"`
   - Heading: Unbounded clamp(2.25rem, 6vw, 6rem) with U+02BB for oʻ and gʻ (e.g. `Sertifikat emas, ochiladigan mahsulotlar.`)
   - Deck: honest explanation in Onest that projects were built using the method and are live.
   - Projects list / showcase:
     - Derive projects from `VERIFIED_PORTFOLIO_FALLBACK` in `src/features/portfolio/portfolioData.ts` (featured items like Clash Nexus, EduBaza).
     - L14 honesty: NO invented metrics, NO fake testimonials, NO fabricated follower counts.
     - Ring / outer tessellation motif: subtle geometric ring / octagonal borders or tessellated framing.
     - Each item has real link to its live URL (`target="_blank"` with `rel="noreferrer"`), real category, and real description.
     - Link to full `/portfolio` with accessible label.
   - Theme tokens only: `text-on-brand-surface`, `border-border-onBrand`, `bg-brand-surface` (never hardcode hex or rgb).
   - Semantic accessible markup (`<section>`, `<h2>`, `<article>`, `<h3>`, `<a>`).
2. Register `{ id: "natijalar", strand: "ring" }` in `HOME_LOOM_SECTIONS` in `src/features/lab-naqsh/domain/homeLoom.ts`.
3. Update `src/features/lab-naqsh/domain/homeLoom.test.ts` to assert that `HOME_LOOM_SECTIONS` includes `natijalar` and `mutedHomeStrands` un-mutes `ring`.
4. Insert `<NatijalarSection />` inside `<HomeLoom>` in `src/app/page.tsx` right after `<DasturSection />`.
5. Remove redundant `<Projects />` and its import from `src/app/page.tsx`, and delete `src/components/sections/home/Projects.tsx` if it has no other consumers (`git grep Projects src/`).
6. Run the gates:
   - `npm run lessons:check`
   - `npm test`
   - `npx tsc --noEmit`
   - `npm run build`
7. Take screenshots or run `npx playwright test e2e/responsive.spec.ts -g "home"` to verify 375/390/768/1024/1280/1440 × light/dark layout and no horizontal scroll.
8. Write a report to `reports/E4-NATIJALAR.md` with:
   - What shipped
   - Gates real output
   - Token check (L24/L25)
   - LESSON line at the bottom.
