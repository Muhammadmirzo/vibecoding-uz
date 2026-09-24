# W6A — Home page design + scroll storytelling

- **Completed:** 2026-09-24
- **Scope:** home page and reusable home/motion patterns for the later W6C rollout.
- **Branch:** `wave/w6a-design-home`
- **Push/deploy:** not performed.

## Design rationale

The home page now treats Naqsh as a **Samarkand craft workshop translated into a product interface**, not a generic AI SaaS template. Lapis supplies structure, turquoise marks active process, and gold is reserved for action. The memorable moment is the native scroll-linked transformation **G'oya → Prompt → Ilova**. Supporting sections stay disciplined: a real-process bento, an eight-week map with outputs, a dark proof gallery, and restrained girih section transitions.

Desktop uses an asymmetric editorial hero and a 150vh native sticky stage. Mobile keeps all three story states as a shorter, non-pinned vertical sequence. No wheel/touch interception, scroll-jacking, new animation dependency, canvas, invented metric, testimonial, or partner claim was added.

## What shipped

- Rebuilt hero as a high-contrast craft/workbench composition with token mesh glow, fine grain, static girih geometry, honest CTA hierarchy, magnetic primary CTA, and a truthful app-demo frame.
- Added `BuildStory` with native `view()` timelines: idea exits, Claude-style prompt builds line-by-line, then the app layers assemble. Desktop pinning is capped at a 150vh track; mobile is static/non-pinned; reduced motion returns to a complete vertical document.
- Replaced the old client tab roadmap with a server-rendered 8-week map: scroll-drawn SVG route, four staggered output cards, and no route JS.
- Rebuilt transformation as a four-tile bento with fine-pointer 3D tilt, spotlight, SVG stroke draw, an ambient prompt demo, and a meaningful approval toggle.
- Added opposite-direction, edge-faded, pause-on-hover/focus two-row tool marquee.
- Added one scroll-progress gradient text fill, girih clip wipes, card lift/border light, icon draw, CTA arrow/press feedback, and grid-row FAQ height animation.
- Improved every home section's composition while retaining the established honest order and copy.
- Shared FAQ markup now uses a collapse wrapper; home CSS animates `grid-template-rows: 0fr → 1fr` without JS.

## Animation inventory

| Where | Trigger / range | Duration | Flag |
| --- | --- | ---: | --- |
| Hero headline words | First paint | 320ms + 55ms/word | `heroIntro` |
| Hero CTA magnetic / press / arrow | Fine pointer / press | 200–560ms | `pointerEffects` |
| Hero orbit labels | Ambient | 28s | `ambient` |
| Idea → prompt → app stage | Native `view()` cover timeline, desktop ≥1024 | scroll-linked over 150vh | `scrollReveal` |
| Prompt lines / terminal clip | Named story timeline | scroll-linked | `scrollReveal` |
| App preview assembly | Named story timeline | scroll-linked | `scrollReveal` |
| Bento/card reveals | Shared IntersectionObserver | 320ms + stagger | `scrollReveal` |
| Bento icon stroke | Enter | 560ms | `scrollReveal` |
| Bento tilt / spotlight | Fine pointer | 320–560ms | `pointerEffects` |
| Prompt demo typing | Ambient, offscreen/tab aware | 6s | `ambient` |
| Approval toggle | Click | 200ms | non-off |
| Roadmap path | Native section view timeline | scroll-linked | `scrollReveal` |
| Roadmap card lighting | Native card view timeline | scroll-linked | `scrollReveal` |
| Gradient statement fill | Native heading view timeline | scroll-linked | `scrollReveal` |
| Girih section wipe | Native section view timeline | 560ms visual token | `scrollReveal` |
| Tool marquee rows | Ambient | 34s / 39s opposite | `ambient` |
| FAQ height/copy | Open/close | 320ms | non-off |
| View transitions | Navigation | browser-defined | `pageTransitions` |

All timed entrances are ≤600ms except the intentionally ambient orbit/marquee. All new effects honor `data-motion`, `data-motion-*`, and `prefers-reduced-motion`. Unsupported scroll-timeline browsers render the complete vertical story. Admin `subtle` keeps scroll storytelling/reveals but disables pointer and ambient slices; `off` is static.

## Reusable patterns for W6C

- `ScrollFillText` for one or two key statements per page.
- `Tilt` + existing `Spotlight` for process/fact bento tiles.
- `ProcessDemo` for compact prompt/UI examples.
- `AppPreview` layer vocabulary for build/result stories.
- CSS contracts in `home-story.css` and `home-sections.css`: named stage, line build, layer assembly, SVG path draw, text fill, girih wipe, dual marquee.
- FAQ collapse wrapper for native, JS-free height animation.

W6C should copy the **pattern**, not duplicate the home's giant stage: route pages should use one 80–120vh sequence only where the content genuinely has before/after stages.

## Performance

Fresh locked builds on this branch:

| Route metric | Before | After | Change |
| --- | ---: | ---: | ---: |
| `/` route size | 5.82 kB | **2.46 kB** | **-3.36 kB** |
| `/` First Load JS | 128 kB | **125 kB** | **-3 kB** |
| Shared First Load JS | 102 kB | **102 kB** | 0 kB |

The JS reduction comes from replacing the client roadmap tabs with semantic server markup; the small tilt/demo islands fit inside the saved budget.

Fresh Lighthouse 13.5 production run, mobile, `--throttling-method=devtools`:

| Metric | Result | Budget |
| --- | ---: | ---: |
| Performance | 86 | — |
| FCP | 1.733s | — |
| LCP | **2.293s** | ≤2.5s |
| CLS | **0** | 0 |
| TBT | 470ms | — |
| Speed Index | 2.216s | — |

Historical same-throttling W4A baseline was LCP 2.1s / CLS 0; the fresh post-change run remains inside the hard LCP/CLS budget. Metrics vary with machine load, so the full raw report is `/tmp/w6a-lighthouse-mobile.json` on the worker and is not committed.

## Screenshots reviewed

Viewport frames (not only full-page) were captured and reviewed in light and dark at 390 and 1440:

- `e2e/screenshots/w6a-home-1440-{light,dark}-hero.png`
- `e2e/screenshots/w6a-home-1440-{light,dark}-story-{entry,pinned,late}.png`
- `e2e/screenshots/w6a-home-1440-{light,dark}-bento.png`
- `e2e/screenshots/w6a-home-1440-{light,dark}-projects.png`
- `e2e/screenshots/w6a-home-1440-{light,dark}-pricing.png`
- `e2e/screenshots/w6a-home-390-{light,dark}-hero.png`
- `e2e/screenshots/w6a-home-390-{light,dark}-story-{idea,prompt,app}.png`
- `e2e/screenshots/w6a-home-390-{light,dark}-bento.png`
- `e2e/screenshots/w6a-home-390-{light,dark}-pricing.png`
- `e2e/screenshots/w6a-home-1440-light-story-reduced.png`

Critical review: hero hierarchy and CTA are immediately legible; dark mode keeps hierarchy without neon wash; story states are distinct but not frantic; bento remains factual; roadmap output is visible without hover; mobile avoids pinning; the girih wipe is decorative and does not hide content. A reduced-motion audit confirmed all three story layers are `position: relative`, opacity 1, vertically separated, with zero horizontal overflow.

## Verification

- `npx tsc --noEmit` — pass.
- `npx vitest run` — **502 passed across 66 files**.
- `scripts/waves/locked.sh npm run build` — pass, 90 pages; home 2.46 kB route / 125 kB First Load JS.
- `scripts/waves/locked.sh env E2E_PORT=3301 npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts` — **142 passed** (final full run).
- Lighthouse mobile production run — performance 86, LCP 2.293s, CLS 0.
- Browser/console review — no unexpected console/page errors and no horizontal overflow at 390 or 1440.

## Remaining / rollout notes

- W6C should reuse the primitives selectively and avoid placing a 150vh narrative on every route.
- Native scroll-driven animation is Chromium-progressive enhancement; Firefox/Safari users receive the complete static sequence and existing IO reveals, not broken content.
- Motion `off`, `subtle`, and reduced-motion layouts were explicitly guarded; W6C must preserve those gates.
- No push or deployment performed.

## Round 2 — Orchestrator review fixes

### Defects corrected

- **Empty/broken sticky story:** the pinned stage now has a persistent section title and explanation, a centered 25vh–88vh stage, and full-width active content. The native `--story` named timeline now covers the complete sticky range without the previous cover-range mismatch. Five 1440px frames at 0%, 25%, 50%, 75%, and 100% show a continuous idea → prompt → app sequence with no empty transition: `e2e/screenshots/w6a-home-1440-{light,dark}-story-{000,025,050,075,100}.png`.
- **Clipped terminal/card:** the horizontal terminal/card wipe was removed. Individual prompt rows reveal as whole lines with opacity/transform and staggered ranges, so no card edge or word is cut in half. Proven by the 25% and 50% frames above, especially `w6a-home-1440-dark-story-025.png`.
- **Faded Ilova skeleton:** the story now uses a separate detailed demo preview with real menu rows, cart quantity controls, a Telegram order button, and the unchanged “Demo interfeys · real buyurtma emas” label. It is full opacity at 100%: `w6a-home-1440-{light,dark}-story-100.png` and `w6a-home-390-{light,dark}-story-app.png`.
- **Inactive story rail:** G'OYA, PROMPT, and ILOVA are tied to the same named timeline; the connecting line fills and the step dots/labels are accent-filled. Proven across the 000/025/050/075/100 frame set.
- **Doubled gradient heading:** `ScrollFillText` now uses a shared grid cell for both text copies (`display: inline-grid`, both children `grid-area: 1 / 1`), with identical inherited metrics. The final gradient is brand → accent with only a small gold endpoint. Verified at 390, 768, and 1440 in `w6a-home-{390,768,1440}-{light,dark}-fill.png`; bento composition screenshots are `w6a-home-{390,1440}-{light,dark}-bento.png`.
- **Cut prompt demo letters:** the bento prompt is now one nowrap line, “Vazifani aniq yozing.”, with a separate blinking caret; motion off/reduced motion renders the complete static sentence. Proven by the 390px and 1440px bento frames.
- **Bento tile 01 gap:** added an honest three-part visual cue (Muammo / Foydalanuvchi / Natija) to balance the icon/title spacing without changing the meaning. Proven by `w6a-home-1440-light-bento.png` and `w6a-home-390-light-bento.png`.

### Round 2 performance and verification

- `npx tsc --noEmit` — pass.
- `npx vitest run` — pass: **506 tests across 67 files**.
- `scripts/waves/locked.sh npm run build` — pass, 90 pages; home **2.44 kB route / 125 kB First Load JS** (still within the W6A budget; shared JS remains 102 kB).
- `scripts/waves/locked.sh env E2E_PORT=3301 npx playwright test e2e/responsive.spec.ts e2e/visibility.spec.ts` — **142 passed**. The first attempt was interrupted by the command timeout while the dev server was compiling; the complete rerun passed.
- Final locked Lighthouse mobile production run with `--throttling-method=devtools` — performance **79**, FCP **1.7s**, LCP **2.3s**, CLS **0**, TBT 770ms, Speed Index 2.2s. The required LCP ≤2.5s and CLS 0 budgets pass. Raw report: `/tmp/opencode/w6a-round2-lighthouse-final.json` (not committed).
- Visual review covered light/dark at 390 and 1440, the five-frame 1440 story range, the bento, 390/768/1440 fill states, mobile story states, and the unchanged hero. No horizontal overflow, doubled heading, half-cut prompt card, cut demo letters, empty pinned stage, or faded final app state remained.
- All changed source files remain under 250 lines. Dev server was stopped by PID; no push or deployment performed.
