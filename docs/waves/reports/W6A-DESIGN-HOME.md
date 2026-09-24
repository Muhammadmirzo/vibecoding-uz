# W6A — Home page design + scroll storytelling

- **Started:** 2026-09-24
- **Scope:** home page, home-only motion primitives, shared motion CSS needed as the W6C pattern, and the requested verification/handoff artifacts.
- **Branch:** `wave/w6a-design-home`
- **Push/deploy:** not allowed; none will be performed.

## Design rationale

Naqsh should feel like a Samarkand workshop translated into a product interface: lapis structure, turquoise process light, gold action, ivory paper / first-class dark mode. The memorable moment is a native scroll-driven transformation from a plain idea to an AI prompt to an assembled working app. The rest of the page uses the same craft vocabulary—girih masks, precise rails, bento “workbench” tiles, and real process demos—without turning every card into a neon dashboard.

The desktop composition stays left-aligned and editorial; the single high-contrast moment is the sticky build stage. Mobile preserves the story as a short static/non-pinned sequence so touch scrolling remains natural. No wheel/touch interception or new animation dependency is planned.

## Baseline

- Fresh locked pre-change build on this branch: home route size **5.82 kB**, First Load JS **128 kB**, shared First Load JS **102 kB**.
- Last verified production baseline (W4A orchestrator pass): mobile devtools-throttled LCP **2.1 s**, CLS **0**. A fresh pre-change Lighthouse run will be recorded before final acceptance.

## Animation contract and implementation notes

- `scrollReveal`: scroll-driven sticky storytelling, roadmap SVG draw, section mask wipes, and one/few headline progress-fill statements.
- `pointerEffects`: fine-pointer tilt/spotlight and primary CTA magnetic response.
- `ambient`: two-row tool depth marquee and subtle static mesh/girih atmosphere.
- `heroIntro`: the initial hero entrance only; the story itself follows `scrollReveal`.
- Final state is server-rendered. Unsupported browsers retain readable content and the existing IntersectionObserver reveal fallback.
- All stage motion will use `transform`, `opacity`, and `clip-path` (plus the explicitly requested SVG path draw). No layout-property or infinite reading-area animation.

## Reusable primitives planned for W6C

- `SectionTransition` / girih clip reveal surface.
- `ScrollStoryStage` and isolated story layers.
- `BentoTile` interaction wrapper and process-demo panels.
- Dual-direction tool marquee with edge masks.
- Progress text-fill primitive for one or two statements.

## Performance, verification, and screenshots

Pending implementation. Required final evidence: pre/post build route JS, devtools-throttled Lighthouse at 390 and 1440, viewport scroll frames in light and dark, TypeScript, Vitest, build, responsive, and visibility gates.
