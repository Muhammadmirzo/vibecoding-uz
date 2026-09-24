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

## Primitives

- `Button` — CVA variants (`primary`, `secondary`, `outline`, `ghost`, `telegram`) and sizes (`sm`, `md`, `lg`); supports `href` and Radix `asChild`.
- `Container`, `Section`, `Heading`, `Eyebrow` — page rhythm and hierarchy helpers. `Section` can add a restrained radial pattern; use `GirihPattern` for a stronger motif.
- `Card`, `Badge`, `Stat` — reusable content surfaces and compact proof points.
- `GirihPattern` — decorative, inline SVG eight-point star tiling; always hidden from assistive technology.
- `TerminalWindow` — client-only typing animation; automatically renders all lines when reduced motion is requested.
- `Accordion` — accessible Radix accordion with an animated chevron.
- `Input`, `Textarea`, `Label`, `FieldError` — form primitives; inputs expose visible keyboard focus and semantic error text.
- `NextStepCTA` — shared funnel close: `/diagnostika` in gold, `/bepul-dars` as the secondary route.

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
