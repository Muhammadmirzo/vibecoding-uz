You are continuing wave W6A (home page design + scroll storytelling) in this worktree, branch `wave/w6a-design-home`. Read `docs/waves/prompts/w6a-design-home.md` (original brief — all its RULES, PERFORMANCE BUDGET, PARALLEL SAFETY, GATE still apply) and your report `docs/waves/reports/W6A-DESIGN-HOME.md`. The orchestrator already merged `main` (W6B portfolio) into this branch — do not undo that; `Projects.tsx` now reads from the DB via `getPublicPortfolios()` and keeps your `girih-transition` class.

ROUND 2 — ORCHESTRATOR REVIEW. The hero is excellent; keep it. Fix exactly these defects, found in your own screenshots:

1. BuildStory sticky stage (1440, `w6a-home-1440-*-story-{entry,pinned,late}.png`) looks EMPTY and BROKEN:
   - About two thirds of the pinned viewport is blank. The active state must fill the stage: content block roughly 70–85% of stage height, visually centered, with the section title + one line of explanation visible while pinned.
   - The prompt terminal is hard-cut in the middle (`w6a-home-1440-dark-story-pinned.png`: card clipped at ~x=668, text cut mid-word). A line-by-line build must reveal whole lines (per-line clip/opacity with stagger), never a half-width card with a vertical hard edge.
   - The "Ilova" end state is mostly faded skeleton bars. The finished app preview must be crisp and full-opacity at the end of the range, with real-looking demo content (menu items, cart, "Telegram orqali buyurtma" button) — still labelled "Demo interfeys".
   - The G'OYA / PROMPT / ILOVA progress labels never become active. Tie them to the same timeline: the current step gets accent color + a filled dot, a progress line between them fills as you scroll.
   - Keep: native `view()`/named timelines only, ≤150vh track, mobile non-pinned, reduced-motion = complete static vertical sequence, `@supports` fallback.

2. `ScrollFillText` ("G'oyadan — ishlaydigan mahsulotgacha.") renders as a DOUBLED, OFFSET, BLURRY heading (`w6a-home-1440-light-bento.png`). Cause: `.scroll-fill-base` is `position:absolute; inset:0` inside a `display:inline` span, so on a multi-line heading the overlay is laid out against the first line box, not the text. Fix: stack both copies in the same grid cell (`.scroll-fill-text { display:grid }` and both children `grid-area: 1 / 1`), identical font metrics, so the gradient copy sits exactly on the base copy at every width and line count. Also make the finished state read as ONE clean gradient (brand → accent, gold only as a small final accent), not a muddy three-color mix. Verify at 390, 768, 1440.

3. Bento prompt demo (`ProcessDemo kind="prompt"`, `.demo-typing`) wraps to 2–3 lines while a horizontal `clip-path` types it, so letters are cut in half on every line (390 and 1440). Make the typing text a single line (`white-space: nowrap`, shorter Uzbek sentence that fits at 320px, or `text-overflow: ellipsis`), with a blinking caret, so the typing reads naturally. Motion `off`/reduced motion = full static sentence.

4. Minor: bento tile 01 has a large empty gap between its icon and its title at 1440. Balance it (for example a small illustrative visual, or bottom-align with less empty space). Honest content only.

DO NOT change: the hero, copy meaning, the performance budget (home First Load JS ≤ +4 kB vs the W6A start), motion flags mapping, file-size rule (every source file ≤ 250 lines).

VERIFY VISUALLY (mandatory): re-take the viewport screenshots listed in your report at 390 and 1440, light + dark, INCLUDING at least 5 frames scrolled through the story stage (0%, 25%, 50%, 75%, 100% of its range) at 1440, and the bento. Look at every frame critically: no empty stage, no half-cut cards, no doubled text, no cut letters. Iterate until clean.

GATE: `npx tsc --noEmit`, `npx vitest run`, `scripts/waves/locked.sh npm run build`, `scripts/waves/locked.sh env E2E_PORT=3301 npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts`, and one Lighthouse mobile run with `--throttling-method=devtools` through the lock (CLS 0, LCP ≤ 2.5 s).

HANDOFF: add a "Round 2" section to `docs/waves/reports/W6A-DESIGN-HOME.md` (each defect → what changed → which screenshot proves it; perf numbers). Commit on the branch. Do not push. Dev server only on port 3301, stop it by PID (never `pkill -f`).
