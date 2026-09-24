You are a world-class product designer + front-end engineer (Awwwards-level craft, and accessibility-first). Work autonomously until fully done.

FIRST read `docs/waves/PHASE2-RULES.md` (mandatory rules), then `docs/waves/reports/W6A-DESIGN-HOME.md` IN FULL (design rationale, animation inventory, "Reusable patterns for W6C", Round 2 notes), `docs/waves/prompts/w6a-design-home.md` (the owner's design brief and motion rules; they apply here too), `src/components/sections/home/**`, `src/features/motion/**`, `src/components/ui/**`, `src/app/globals.css`.
Wave id: W6C. Branch `wave/w6c-design-pages`. Your dev port: **3306**. Report: `docs/waves/reports/W6C-DESIGN-PAGES.md`.

OWNER: loved the new home page (W6A). Now "improve EVERY page" to the same level: maximal creative, user-friendly, modern scroll animations people never get tired of, with a professional, memorable design. Consistency with the home page is the goal. Do not copy it.

PAGES (every public page and the student cabinet; the admin panel is NOT in this wave):
- Conversion pages first: `/kurs/[slug]`, `/diagnostika`, `/bepul-dars`, `/xizmatlar`, `/portfolio`.
- Content pages: `/blog`, `/blog/[slug]` (reading experience: progress bar, beautiful typography, code blocks, table of contents on desktop), `/resurslar`, `/atamalar` (searchable glossary with instant filter), `/ekspertlar`, `/meetlar`.
- Trust and legal: `/maxfiylik`, `/offerta`, `/pul-qaytarish` (calm, readable long-form layout with a sticky TOC), `/shahodatnoma/[code]` (certificate verification page that looks official and shareable).
- Cabinet `/kabinet/**`: dashboard, lesson player page, grades, referral, certificates, payments, settings. Aim for app-like polish: clear progress, next-lesson CTA, empty states, skeletons without CLS.
- Also `not-found`, `error`, `loading`, the header (desktop + mobile menu), and the footer.

Other agents close some pages right now (`/ish`, `/testimoniyalar`). Skip them. Keep the header/footer link lists as data-driven as they are, because the orchestrator merges link removals.

DESIGN SYSTEM WORK (do this first, then roll it out):
1. Extract the W6A patterns into reusable primitives where not already done:
   - page hero variants (editorial / compact / dark);
   - `ScrollFillText`, `Tilt` + `Spotlight`, section girih-wipe transitions;
   - bento grid, stat/fact tiles (REAL numbers only), process steps with a scroll-drawn path;
   - sticky TOC, reading progress, marquee, FAQ collapse, empty state, skeleton.
   Document them on `/(dev)/design-system`.
2. For each page pick the ONE memorable moment that fits its content, e.g.:
   - course page: an 8-week curriculum path that draws on scroll and a sticky price card with a live cohort countdown (real date from `siteConfig`);
   - diagnostika: a delightful step-by-step quiz with progress and a result reveal;
   - portfolio: cover cards with hover depth and a filter transition via the View Transitions API;
   - blog: reading progress and a pull-quote text-fill;
   - certificate: a seal draw animation.
   Everything else stays calm and readable. **Never animate long-form reading text.**

RULES (from the W6A brief):
- No scroll-jacking. Entrances ≤ 600 ms. UI feedback ≤ 200 ms.
- Respect `prefers-reduced-motion` and the admin motion flags (`data-motion`, `data-motion-*`). Content is complete with JS off. Native CSS scroll-driven animations with `@supports` fallback.
- Only transform, opacity and clip-path animations.
- Honest Uzbek copy: do not invent numbers or testimonials. Keep existing copy meaning; you may tighten wording.
- PRESERVE these attributes wherever they exist: `data-track`, `data-chat-open`, `id` anchors, form field names, and test ids. Other waves (analytics, chat) depend on them.

PERFORMANCE BUDGET (hard, per page): First Load JS grows ≤ +3 kB vs main at your start. Record a before/after table for every route from `npm run build` output. Lighthouse mobile (`--throttling-method=devtools`, through the lock) on `/kurs/vibe-coding-express`, `/diagnostika`, `/blog/<any>`, and `/kabinet` (if reachable without login, otherwise its public shell): CLS 0, LCP ≤ 2.5 s.

VERIFY VISUALLY: viewport screenshots (scrolled through, not only full-page) at 390 and 1440, light + dark, for every page. Review each critically: no empty areas, no cut text, no doubled layers, no low contrast, no horizontal overflow. Iterate until world-class. Name them `e2e/screenshots/w6c-<route>-<width>-<theme>-<n>.png`.

GATE: see PHASE2-RULES "Definition of done". The Playwright responsive + visibility specs must cover every page you touched; add routes to them if missing.
Work page group by page group (conversion → content → legal → cabinet → chrome). Commit after each group and update the report after each group, so an interrupted run can resume.
