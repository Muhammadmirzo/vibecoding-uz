# Wave D2 — CSS Alpha Tokens & Opacity Modernization

**Goal:** Resolve the 121 dead Tailwind opacity classes across the repository by adding standards-based `color-mix(in srgb, var(...) calc(<alpha-value> * 100%), transparent)` support to CSS variable tokens in `tailwind.config.js`.

Status: **done** — all gates green.

---

## 1. Problem & Root Cause (Lesson L25)

In `src/app/globals.css`, color variables are defined as hex values (e.g. `--bg: #faf7f0`, `--ink: #0e1a2b`, `--accent: #0fa3a3`).
In `tailwind.config.js`, colors were previously bound as plain strings: `DEFAULT: "var(--bg)"`, `DEFAULT: "var(--ink)"`.

Without an `<alpha-value>` placeholder, Tailwind CSS cannot process slash-opacity modifiers (e.g. `bg-ink/60`, `border-success/20`, `hover:bg-gold/90`). Across the app, 121 class references in modals, toasts, drawers, and CRM tables emitted **zero CSS rules** into the built stylesheet, leaving backdrops transparent or borders missing.

---

## 2. Solution Implemented

In `tailwind.config.js`, introduced the `alpha()` helper function:

```javascript
function alpha(variableName) {
  return ({ opacityValue }) => {
    if (opacityValue !== undefined && !opacityValue.includes("var(")) {
      return `color-mix(in srgb, var(${variableName}) calc(${opacityValue} * 100%), transparent)`;
    }
    return `var(${variableName})`;
  };
}
```

Key features:
1. When no opacity modifier is supplied (e.g. `bg-ink`), it returns pure `var(--ink)`. Zero overhead or CSS change for standard colors.
2. When an opacity modifier is supplied (e.g. `bg-ink/60`), it emits `color-mix(in srgb, var(--ink) calc(0.6 * 100%), transparent)`.
3. Fully reactive to dark mode: CSS variables are resolved dynamically at runtime by the browser.
4. Tokens that already have baked-in alpha (e.g. `--border-on-brand-surface`) remain unchanged as static variable references.

---

## 3. Verification & Evidence

### CSS Emission (via Node inspection on `.next/static/css/*.css`)
- **Total `color-mix()` rules emitted:** 58 rules (previously 0)
- Verified active selectors:
  - `bg-ink\/40`, `bg-ink\/50`, `bg-ink\/60`
  - `border-success\/20`, `border-success\/30`
  - `bg-bg-elevated\/10`, `bg-bg-elevated\/50`, `bg-bg-elevated\/60`, `bg-bg-elevated\/90`, `bg-bg-elevated\/95`
  - `border-gold\/20`, `border-gold\/30`, `border-gold\/50`
  - `border-brand\/20`, `border-brand\/30`, `border-brand\/40`
  - `bg-danger\/10`, `bg-danger\/70`, `bg-danger\/90`
  - `border-danger\/20`, `border-danger\/30`

### Sifat Darvozalari (Gates)
- **`npm run lessons:check`**: `0 failure(s), 0 known debt (repo)` (Exit 0)
- **`npx tsc --noEmit`**: 0 errors (Exit 0)
- **`npx vitest run`**: **115 test files / 780 tests passed** (Exit 0)
- **`npm run build`**: 128/128 static & dynamic pages compiled (Exit 0)
- **`npx playwright test e2e/responsive.spec.ts -g "home"`**: **12 passed (46.3s)** (Exit 0) across all viewports (375px, 390px, 768px, 1024px, 1280px, 1440px × light/dark).

---

LESSON: When mapping CSS variables into Tailwind CSS, always provide an alpha helper using `color-mix(in srgb, var(...) calc(<alpha-value> * 100%), transparent)` so that opacity slash modifiers (e.g. `/60`, `/20`) emit valid CSS rather than silently dropping rules (L25).
