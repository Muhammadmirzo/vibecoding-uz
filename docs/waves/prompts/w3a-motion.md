You are a world-class motion designer + frontend performance engineer (think Linear, Vercel, Stripe, Rauno Freiberg, Emil Kowalski). Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md (§3 Motion contract, §5 Non-negotiables), docs/CODER_AGENT_RULES.md, docs/design-system.md (incl. Brand section), docs/waves/reports/W1A-AUDIT.md (visual/UX findings owned by W3A), src/app/globals.css, tailwind.config.*, src/components/ui/**, src/components/sections/**, src/app/page.tsx.
If docs/waves/reports/W3A-MOTION.md exists, a previous run was interrupted: read it + git state and CONTINUE.

MISSION: the site currently feels generic. Make it feel hand-crafted by experts through a restrained, meaningful motion language — "not too much, not too little", and ZERO performance cost.

1. Motion system (foundation):
   - `src/features/motion/domain/settings.ts` exactly per PLAN §3 (type, DEFAULT_MOTION, Zod schema `motionSettingsSchema`). W3B will build admin storage on top — for now read defaults.
   - `src/features/motion/ui/MotionRoot` (server-friendly): renders `data-motion` + `data-motion-<flag>` attributes on <html> (via layout.tsx) from settings passed in as props. `prefers-reduced-motion: reduce` forces off in CSS.
   - Tokens in globals.css/tailwind: durations (instant 120, fast 200, base 320, slow 560, epic 900 ms), easings (out-expo, out-quint, spring-ish via `linear()` with fallback), distances. Document in docs/design-system.md "Motion" section.
   - Primitives (tiny, no library): `Reveal` (IntersectionObserver, one shared observer, adds a class; content fully visible without JS — use `@supports`/`.js` class gating so no-JS and SSR show the final state; stagger via CSS var `--i`), `useInView`, `MagneticButton` (pointer: fine only, rAF, transform only), `Spotlight` card (radial gradient following pointer via CSS vars), `CountUp` (only for real numbers), `Marquee` (CSS only, pauses on hover and when offscreen), `TextReveal` for headlines (per-word mask slide, SSR text intact for SEO/a11y — aria text not split).
   - Page transitions: View Transitions API (`@view-transition { navigation: auto; }` + named transitions for header/logo) — progressive enhancement only.
2. Signature moments (make it memorable, tie to the Naqsh brand):
   - Hero: headline word-by-word mask reveal, girih pattern "weaving in" (stroke-dashoffset draw of the tile lines, then a slow ambient shimmer along the lines), terminal transcript typing already exists — sync its timing with the headline; floating app-preview card gentle parallax on pointer (desktop only).
   - Logo mark: stroke draw on first load; on hover the star rotates 45° with a spring.
   - Section reveals site-wide with a consistent rhythm (fade + 12–16px rise + slight blur-in), staggered children.
   - Cards: spotlight hover + 1px gradient border glow; buttons: press scale 0.98, magnetic primary CTA in hero only; links: animated underline.
   - Scroll progress hairline in header on long pages (blog posts, course page); header condenses on scroll (height + backdrop blur) with no layout shift.
   - Funnel moments: diagnostika answer selection micro-feedback, result reveal; checkout/lead form success check-mark draw.
   - Numbers/stats only animate if real (honesty rule).
3. Performance guardrails: only transform/opacity/filter/clip-path; `will-change` only during animation; no scroll listeners without rAF/passive; no JS on the main thread at load for decorative motion (defer with requestIdleCallback); CLS must stay 0; all decorative motion paused when offscreen (IntersectionObserver) and when `document.hidden`. Measure `npm run build` First Load JS before/after — total increase must be ≤ 3 kB gz; report numbers.
4. Respect `data-motion="off|subtle|full"` and each flag: subtle = reveals + micro-interactions only, no ambient/pointer/parallax.
SCOPE: UI/motion only (src/components/**, src/features/motion/**, src/app/** pages except api, globals.css, tailwind config, layout.tsx). Do not touch auth/business logic.
Dev server: port 3204; stop ONLY with `kill $(lsof -t -i:3204)` — NEVER `pkill -f`. Playwright: `E2E_PORT=3204 npx playwright test e2e/responsive.spec.ts` must stay green; review screenshots.
GATE: tsc, vitest, build green. Report docs/waves/reports/W3A-MOTION.md (inventory of every animation: where, trigger, duration, flag that controls it; perf numbers). Write incrementally.
Commit: `git add -A && git commit -m "feat(motion): Naqsh motion system and signature animations"`. Do not push.
