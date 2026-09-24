# Samarkand Modern design system

The shared UI layer in `src/components/ui/` is built around lapis, firuza, and saffron gold rather than a generic AI gradient. It is intentionally restrained: gold marks the next action, brand blue anchors navigation and data, and thin borders preserve a paper-and-ceramic feel.

## Tokens

Tokens are defined in `src/app/globals.css` and exposed through `tailwind.config.js`.

| Token | Purpose | Light | Dark |
| --- | --- | --- | --- |
| `bg` / `bg-elevated` / `bg-sunken` | Page, card, and recessed surfaces | ivory / white / warm paper | lapis night / elevated / deep |
| `ink` / `ink-muted` / `ink-subtle` | Primary, supporting, and quiet text | lapis-night | moon-white |
| `brand` / `brand-soft` | Lapis actions, links, and data | `#1440A0` | `#5B8CFF` |
| `accent` / `accent-soft` | Firuza highlights and focus accents | `#0FA3A3` | `#2DD4BF` |
| `gold` / `gold-soft` | Primary CTA and saffron badges | `#E8A317` | `#F5B83D` |
| `border` / `border-strong` | Structure and interaction boundaries | sand | blue-black |
| `success`, `danger`, `telegram` | Semantic status and external channel | semantic colors | accessible light equivalents |

Old `cream`, `ink`, and `accent` CSS variable names are retained as temporary aliases so pages can migrate independently. They are marked `LEGACY ALIAS — remove in W4`.

## Typography

- `font-display`: Unbounded 600/700, used for H1/H2 and expressive moments.
- `font-sans`: Onest, used for all body and UI copy at 17px / 1.65.
- `font-mono`: JetBrains Mono, used for terminal output and technical data.

## Brand — Naqsh

`Naqsh` (ornament, imprint) is the school; *vibe coding* is the discipline taught there. Never present "VibeCoding" as the school name. All user-facing brand strings come from `src/config/brand.ts` (`BRAND`).

- **Mark** (`src/components/brand/Logo.tsx` → `LogoMark`): 8-point interlaced girih star on a 32-unit grid — axis-aligned square (brand/lapis) under a 45° diamond (gold), woven over-under at alternating crossings, with a `>` prompt caret + cursor bar (accent) at the centre. `variant="mono"` renders everything in `currentColor` for single-colour use.
- **Lockup** (`Logo`): mark + lowercase `naqsh` wordmark in `font-display`, tracking −0.045em.
- **Static assets**: `public/brand/naqsh-mark.svg`, `naqsh-logo.svg`, `naqsh-mark-mono.svg`. Favicon: `src/app/icon.svg`; Apple icon: `src/app/apple-icon.tsx`; PWA PNGs: `public/icons/`; social card: `src/app/opengraph-image.tsx` (+ `twitter-image.tsx`).
- **Clear space**: at least the height of the cursor bar on all sides. **Min sizes**: mark 16px, full lockup 96px wide.
- **Don'ts**: no recolouring outside brand/accent/gold tokens (or mono `currentColor`), no stretching, no rotation, no gradients or shadows on the mark, no hard-coded hex in components — theme tokens only.

## Primitives

- `Button` — CVA variants (`primary`, `secondary`, `outline`, `ghost`, `telegram`) and sizes (`sm`, `md`, `lg`); supports `href` and Radix `asChild`.
- `Container`, `Section`, `Heading`, `Eyebrow` — page rhythm and hierarchy helpers. `Section` can add a restrained radial pattern; use `GirihPattern` for a stronger motif.
- `Card`, `Badge`, `Stat` — reusable content surfaces and compact proof points.
- `GirihPattern` — decorative, inline SVG eight-point star tiling; always hidden from assistive technology.
- `TerminalWindow` — client-only typing animation; automatically renders all lines when reduced motion is requested.
- `Accordion` — accessible Radix accordion with an animated chevron.
- `Input`, `Textarea`, `Label`, `FieldError` — form primitives; inputs expose visible keyboard focus and semantic error text.
- `NextStepCTA` — shared funnel close: `/diagnostika` in gold, `/bepul-dars` as the secondary route.

## Motion

Restrained, meaningful motion — "not too much, not too little". Final state is
always the default; animations apply only under `data-motion` gates, so SSR
and no-JS render finished content. Only `transform`/`opacity`/`filter`/
`clip-path` are animated (plus one SVG stroke-draw exception for the girih
signature). `prefers-reduced-motion: reduce` always wins.

- **Config:** `src/features/motion/domain/settings.ts` (`MotionSettings`,
  `DEFAULT_MOTION`, `motionSettingsSchema`). Server reader:
  `src/features/motion/server/motion-settings.ts` (fail-safes to defaults).
  `<html>` carries `data-motion="off|subtle|full"` + `data-motion-<flag>`
  via `MotionRoot` in `src/app/layout.tsx`. `subtle` = reveals +
  micro-interactions only (no ambient/pointer/parallax).
- **Tokens** (`globals.css` + `tailwind.config.js`): durations `instant` 120,
  `fast` 200, `base` 320, `slow` 560, `epic` 900 ms (`duration-base` …);
  easings `out-expo`, `out-quint`, `spring` (`ease-spring`, `linear()` with
  cubic fallback); distance `--motion-rise: 14px`; stagger `--motion-stagger`.
- **Primitives** (`src/features/motion/ui/`): `Reveal`/`RevealGroup`/
  `revealProps` (server, one shared observer in the `RevealRoot` island),
  `TextReveal` (word mask slide, `load`|`scroll`, SSR text intact),
  `Marquee` (CSS only, pauses on hover/focus/offscreen/hidden tab),
  `MagneticButton` (hero CTA only, pointer-fine), `ParallaxCard`,
  `Spotlight`, `CountUp` (real numbers only), `ScrollProgress` (long pages),
  `SuccessCheck` (form success draw), `GirihWeave` (hero signature),
  `useScrolled` (header condense, height never changes — CLS 0).
- **CSS helpers:** `.card-glow` (1px gradient border), `.link-underline`
  (gold wipe), `.btn-press` (press scale 0.98), `.site-header.is-scrolled`,
  `.terminal-line` (stagger via `--tl-delay`), `.hero-mark-wipe`.
  View Transitions: `@view-transition { navigation: auto }` (MPA progressive
  enhancement) + named `site-header`/`site-logo` transitions.
- **Don'ts:** no animation library, no scroll listeners without rAF/passive,
  no `will-change` except during animation, no `Reveal` above the fold (hero
  uses CSS load animations), never animate invented numbers.

## Usage

```tsx
import { Button, Card, Section, TerminalWindow } from "@/components/ui";

<Section eyebrow="Your next step" title="Build the thing you imagined.">
  <Card>
    <Button href="/diagnostika">Bepul diagnostika</Button>
  </Card>
  <TerminalWindow lines={["> Start with a clear idea", "✓ App scaffolded"]} />
</Section>
```

Keep content in Uzbek Latin, use sentence case for labels, and make the action explicit. The design showcase is available at `/design-system` and is excluded from search engines.
