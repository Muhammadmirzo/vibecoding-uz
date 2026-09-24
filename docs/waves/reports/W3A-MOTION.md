# W3A — Motion system and signature animations

- **Date:** 2026-09-24
- **Scope:** motion foundation and UI motion only; W3B storage/admin controls remain out of scope.
- **Baseline:** `docs/waves/reports/W1A-AUDIT.md` recorded home First Load JS at **126 kB** and shared First Load JS at **102 kB**.

## What shipped

- Zod-validated motion contract, defaults, effective-level resolution, and server-friendly `<html>` attributes (`data-motion` plus `data-motion-*` flags).
- CSS duration/easing/distance tokens and reduced-motion/off/subtle gates.
- SSR-safe primitives: shared-observer reveals, `useInView`, magnetic CTA, spotlight, real-number count-up, marquee, text mask reveal, scroll progress, success check, girih weave, and parallax.
- Signature hero choreography, terminal timing, card glow, logo/header/button/link micro-interactions, quiz feedback, and View Transitions progressive enhancement.
- W1A W3A fixes: mobile course page reserves bottom space for the sticky buy bar (including safe-area inset); Radix drawer retains focus trapping and Escape close, and all motion is reduced-motion safe.

## Animation inventory

| Where | Trigger | Duration | Controlling flag |
| --- | --- | ---: | --- |
| Hero headline words | First paint | 320ms + 55ms/word | `heroIntro` (full only) |
| Hero terminal lines | First paint | 320ms + 180ms/line | `heroIntro` (full only) |
| Hero girih tile draw | First paint | 900ms + 140ms/line | `heroIntro` (full only) |
| Girih shimmer | Ambient loop | 7s | `ambient` (full only) |
| Hero gold mark wipe | First paint | 320ms | `heroIntro` (full only) |
| Hero CTA magnetic pull | Fine pointer move | 560ms spring release | `pointerEffects` (full only) |
| Hero preview parallax | Fine pointer move | rAF transform | `pointerEffects` (full only) |
| Section/card reveals | IntersectionObserver | 320ms + 70ms/child | `scrollReveal` (full/subtle) |
| Scroll headline words | Ancestor reveal | 320ms + 55ms/word | `scrollReveal` (full/subtle) |
| Tool marquee | Ambient loop | 28s | `ambient` (full only) |
| Card spotlight/glow | Hover/focus | 320ms opacity / CSS vars | `pointerEffects`; glow is full/subtle |
| Buttons | Press | 200ms transform scale .98 | non-off motion |
| Links | Hover/focus-visible | 320ms underline wipe | full/subtle |
| Logo mark | First paint | 600–1100ms | non-off/reduced-motion guard |
| Header condense | Scroll > 8px | 200–320ms | decorative, no layout shift |
| Scroll progress | Scroll/resize | rAF transform | long-page component, off hides it |
| Quiz answer | Selection | 200ms scale pulse | full/subtle |
| Quiz result reveal | Result render | 320ms | `scrollReveal` |
| Form success check | Success render | 560ms circle + 320ms check | full/subtle |
| View transition | Navigation | browser-defined | `pageTransitions` (full only) |

Ambient marquee and girih shimmer are paused by the shared observer when offscreen and when `document.hidden`. All pointer effects are rAF-throttled, fine-pointer only. `prefers-reduced-motion: reduce` forces the static state and disables the islands.

## Performance

| Route | Baseline First Load JS | After | Increase |
| --- | ---: | ---: | ---: |
| `/` | 126 kB | 128 kB | **+2 kB** (within ≤3 kB) |
| Shared JS | 102 kB | 102 kB | **+0 kB** |

`npm run build` completed successfully after the motion changes. The home route remains `ƒ` because the pre-existing root layout reads `cookies()` for initial user state; motion settings are synchronous defaults in W3A and do not add a DB read or opt the route into dynamic rendering. W3B should replace the default reader with its cached storage reader.

## Verification

- `npx tsc --noEmit` — pass.
- `npx vitest run` — **465 passed, 1 skipped** across 58 files.
- `npm run build` — pass.
- `E2E_PORT=3204 npx playwright test e2e/responsive.spec.ts` — **132 passed** on the final CI/retry run. Home light/dark 375/390/768/1024/1280/1440 and course mobile overlap checks were covered and reviewed. An earlier non-CI run hit a transient Next dev issue-overlay tap-target warning on one route; the isolated rerun and final retry run passed.
- Home mobile and desktop screenshots were reviewed; no sticky-bar overlap or horizontal overflow was observed. Motion does not remove or defer SSR content.
