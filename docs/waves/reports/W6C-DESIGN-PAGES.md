# W6C — Every-page design rollout (W6A patterns everywhere)

- **Status:** in progress (groups 1–5 code-complete: conversion → content → legal → cabinet → chrome; verification pending)
- **Scope:** all public pages + student cabinet + header/footer/chrome. NOT in scope: `/ish`, `/testimoniyalar` (other agents), admin panel.
- **Branch:** `wave/w6c-design-pages`
- **Push/deploy:** not performed.

## Design rationale

W6A made home a Samarkand craft workshop; W6C spreads the same craft
language to every route without copying home's giant sticky stage. Each
page got exactly ONE memorable moment that fits its content; everything
else stays calm and readable, and long-form reading text is never
animated:

| Page | Memorable moment |
| --- | --- |
| `/kurs/[slug]` | 8-week curriculum path draws on scroll (`w6c-path`); sticky price card with live cohort countdown from real `siteConfig.nextCohortDate` |
| `/diagnostika` | Step dots + transform-only progress bar, result reveal (`w6c-result`) |
| `/bepul-dars` | 30-minute agenda as a scroll-drawn timeline |
| `/xizmatlar` | Editorial hero + offer cards with border-light hover |
| `/portfolio` | Dark gallery hero; filter transitions via View Transitions API |
| `/blog` | Hero mesh + VT filter transitions on cards |
| `/blog/[slug]` | Reading progress (existing) + pull-quote scroll text-fill |
| `/atamalar` | Instant filter with live count + shared empty state |
| `/ekspertlar` | Tilt + spotlight cards (fine pointers only) |
| `/meetlar` | Live pulse on the upcoming meet |
| `/maxfiylik`, `/offerta`, `/pul-qaytarish` | Calm `LegalLayout`: prose card + sticky desktop TOC |
| `/shahodatnoma/[code]` | Official gold-seal card with stroke-draw + share button |
| `/kabinet` | Progress band with next-lesson CTA; player gains next-lesson button |
| `not-found` / `error` / `loading` | Craft hero 404, calm error card, CLS-safe skeleton |

## What shipped (shared primitives, `src/components/pages/`)

- `PageHero.tsx` (server, zero JS) — variants `editorial` / `compact` / `dark`; mesh glow + grain, gated load entrance (`w6c-load` + `--i`).
- `PageBits.tsx` — `TocNav`, `Seal` (stroke-draw), `EmptyState`, `PageSkeleton` (fixed heights, opacity-only pulse), `LegalLayout`.
- `CohortCountdown.tsx` — tiny client island parsing the REAL Uzbek date string from `siteConfig`; renders nothing until mounted, hides when past/unparseable.
- `w6c.css` — route-scoped contracts: hero, girih wipe (`w6c-wipe`), scroll-drawn path (`w6c-path`), TOC, prose, seal, quiz bar/result, VT cover names, skeleton. All gated on `data-motion` + `@supports (animation-timeline: view())`; reduced-motion and `off` render complete static content.
- `scroll-fill-text` contract duplicated from home into `w6c.css` so `ScrollFillText` works on every route.
- `/(dev)/design-system` documents all primitives with live demos.

Per-page changes preserve copy meaning, form field names, anchors/ids and
test ids; header/footer link lists untouched (data-driven, orchestrator merges).
No new dependencies. No invented numbers/testimonials.

## Animation inventory (all transform/opacity/clip-path only)

| Where | Trigger | Duration | Flag |
| --- | --- | --- | --- |
| Page hero load stagger | First paint | 320ms + 70ms/step | `heroIntro` |
| Curriculum/agenda path draw | Native `view()` | scroll-linked | `scrollReveal` |
| Step dot/card lighting | Native per-step `view()` | scroll-linked | `scrollReveal` |
| Girih section wipe | Native section `view()` | 560ms visual | `scrollReveal` |
| ScrollFillText (1 per page) | Native heading `view()` | scroll-linked | `scrollReveal` |
| Quiz dots/bar | Answer / step change | 200–320ms | non-off |
| Quiz result | Result phase | 560ms | non-off |
| Card lift + border light | Hover/focus | 320ms | non-off |
| Tilt + spotlight (ekspertlar) | Fine pointer | 320–560ms | `pointerEffects` |
| Seal stroke draw | First paint | 900ms | non-off |
| Portfolio/blog filter | Filter change (VT API) | 200ms | `pageTransitions` |
| Live pulse dots | Ambient | 2s ping | `ambient` |
| Mobile drawer | Open | 500ms fade-up | non-off |

## Performance (before/after First Load JS, `npm run build`)

(TBD — before-build running; after-build captured.)

## Verification (TBD)

- `npx tsc --noEmit` — pass (2026-09-24).
- `npx vitest run` — 512 passed, 68 files (2026-09-24).
- Locked build — pass, AFTER sizes captured; BEFORE pending.
- Playwright responsive + visibility (extended with kabinet + shahodatnoma routes) — pending.
- Viewport screenshots 390/1440 light/dark — pending.
- Lighthouse mobile on `/kurs/vibe-coding-express`, `/diagnostika`, `/blog/<any>`, `/kabinet` shell — pending.

## Remaining

1. Fill perf table + run Playwright + screenshots + Lighthouse.
2. Critically review screenshots, iterate until world-class.
3. Commit report + final verification; no push/deploy.
