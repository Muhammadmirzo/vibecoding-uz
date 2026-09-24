You are a world-class creative director + motion designer + senior frontend engineer (Awwwards / Linear / Vercel / Stripe / Apple product-page quality). Work autonomously until fully done.

FIRST read: docs/waves/PLAN.md (§3 motion contract, §5 non-negotiables), docs/CODER_AGENT_RULES.md, docs/design-system.md, docs/waves/reports/W3A-MOTION.md, src/features/motion/**, src/app/page.tsx, src/components/sections/home/**, src/app/globals.css, tailwind.config.js.
If docs/waves/reports/W6A-DESIGN-HOME.md exists, a previous run was interrupted: read it + `git log`/`git status` and CONTINUE.

OWNER FEEDBACK (verbatim meaning): "The animations are not noticeable and not surprisingly professional. The design isn't either. Make it creative, user-friendly, with scroll animations and the most modern kinds of animation people always like and never get tired of. Improve every page." This wave = the HOME PAGE only (it becomes the pattern for W6C rolling out to every other page), so make it genuinely memorable.

DIRECTION (Naqsh brand: Samarkand girih craft × code; lapis/turquoise/gold on ivory; dark mode first-class):
1. Scroll storytelling with native CSS scroll-driven animations (`animation-timeline: view()` / `scroll()`, with `@supports` fallback to the existing IntersectionObserver reveal) — GPU only, zero scroll listeners:
   - Hero → "G'oya → Prompt → Ishlaydigan ilova" sequence: as the user scrolls, a sticky stage shows the idea text morphing into a Claude Code prompt, the terminal building, then the app preview assembling (layers slide/scale in). Max ~150vh pinned; must never feel like scroll-jacking; on mobile a shorter, non-pinned version.
   - Roadmap: the 8-week path draws itself (SVG stroke tied to scroll), each week card lights up as it enters.
   - Section transitions: girih-tile mask wipe / clip-path reveals between light and dark sections.
   - Big headline "text-fill" reveal (gradient fill following scroll progress) for 1–2 key statements only.
2. Bento grid for "why us / transformation" with rich micro-interactions: 3D tilt (pointer: fine), spotlight, animated icons (SVG stroke), live mini-demos (typing prompt, toggling UI) — each tile tells one fact.
3. Micro-interactions everywhere that matters: buttons (press, magnetic primary CTA, arrow nudge), links (underline draw), inputs (focus glow), cards (lift + border light), FAQ accordion (smooth height via grid-template-rows), counters only for REAL numbers.
4. Marquee of tools/tech with depth (two rows, opposite directions, edge fade masks, pause on hover).
5. Premium polish: typographic scale & rhythm, generous whitespace, consistent 8px grid, noise/grain or subtle girih texture layers, gradient mesh glow behind hero (static CSS, no canvas), perfect dark mode.
RULES THAT KEEP PEOPLE FROM GETTING TIRED OF IT: no scroll-jacking of wheel/touch, no intro screens, UI feedback ≤ 200 ms, entrances ≤ 600 ms, nothing loops in the reading area except subtle ambient, every animation respects `prefers-reduced-motion` and the admin motion settings (`data-motion`, `data-motion-*` flags — map new effects to existing flags: scroll storytelling → scrollReveal, tilt/magnetic → pointerEffects, marquee/glow → ambient), content is fully readable with JS off.
PERFORMANCE BUDGET (hard): home First Load JS ≤ +4 kB vs now; mobile Lighthouse with `--throttling-method=devtools`: CLS 0, LCP ≤ 2.5 s. Only transform/opacity/clip-path/filter-free animations. Measure before/after and record.
QUALITY: honest copy only (no invented numbers/testimonials), Uzbek Latin with correct o'/g'. Every source file ≤ 250 lines (owner rule) — split components.
PARALLEL SAFETY: another agent works in another worktree. Run EVERY heavy command through the lock: `scripts/waves/locked.sh npm run build`, `scripts/waves/locked.sh npx playwright test ...`, `scripts/waves/locked.sh npx lighthouse ...`. Dev server: `npx next dev -p 3301` (only while needed); stop ONLY with `ss -ltnp | grep ':3301 ' | grep -o 'pid=[0-9]*' | cut -d= -f2 | xargs -r kill` — NEVER `pkill -f`. Playwright: `E2E_PORT=3301`.
VERIFY VISUALLY: take screenshots at 390 and 1440, light + dark, scrolled through the page (not only full-page shots — scroll and capture viewport frames), and review them critically; iterate until it looks world-class.
GATE: `npx tsc --noEmit`, `npx vitest run`, `scripts/waves/locked.sh npm run build`, `scripts/waves/locked.sh npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts` all green.
HANDOFF: write docs/waves/reports/W6A-DESIGN-HOME.md incrementally (design rationale, animation inventory: where / trigger / duration / flag, reusable primitives created for W6C, perf before/after, screenshots reviewed, what is left). Commit in logical chunks on your branch. Do not push.
