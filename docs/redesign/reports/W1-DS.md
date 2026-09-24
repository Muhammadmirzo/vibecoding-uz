# W1-DS — Design system foundation

## Changed

- `src/app/globals.css`: Samarkand Modern light/dark tokens, accessible focus/selection, typography, motion/reduced-motion, radii/shadows, and temporary legacy aliases marked for W4 removal.
- `tailwind.config.js`: semantic color scales, font families, 8/14/20/28 radii, shadows, 1200px container, and motion keyframes.
- `src/app/layout.tsx`: Unbounded display font, Onest sans variable, JetBrains Mono variable rename, and two-theme provider.
- `src/components/layout/ThemeToggle.tsx`: removed the `likely` theme and made the control binary.
- `src/components/ui/`: Button, layout helpers, surfaces, GirihPattern, form primitives, Radix Accordion, animated TerminalWindow, NextStepCTA, and barrel export.
- `src/app/(dev)/design-system/page.tsx`: noindex showcase covering the primitives.
- `docs/design-system.md`: token, primitive, and usage documentation.

## Verification

- `npx tsc --noEmit` passes.

## Left / risks

- Existing pages still use legacy class names until W4 migration; aliases are intentionally retained.
- Showcase is visually inspectable at `/design-system` when the app is running. No build or dev server was started per agent rules.
