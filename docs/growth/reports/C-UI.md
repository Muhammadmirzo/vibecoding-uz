# C-UI — Public UI Audit (DIZAYNER + ZAHAR-ACCESS)

Scope: src/components/ui|layout|sections|pages, public app pages (/, kurs, bepul-dars,
diagnostika, portfolio, blog, xizmatlar, ekspertlar), chat launcher widget (src/features/chat/ui).
Read-only, no edits made.

## Findings

### Blocking a11y

- src/components/ui/Button.tsx:12 - `focus-visible:outline-none` in base `buttonVariants`, no
  variant adds a focus ring → cancels the sitewide `:focus-visible{outline:3px solid gold}`
  rule in globals.css:81 (Tailwind class specificity 0,2,0 beats the element pseudo-class
  0,1,0). Every `<Button>` on the site (hero CTAs, pricing, FAQ, footer, nav) is keyboard-focus
  invisible. → add `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
  focus-visible:ring-offset-bg` to the base classes (same pattern already used correctly in
  ChatLauncher.tsx:99), or simply remove `focus-visible:outline-none` and let the global rule apply.
- src/components/ui/search/SearchModal.tsx:40 - `Dialog.Content` has `focus:outline-none` with
  no replacement; Radix moves focus into it on open → panel focus is invisible. Add a ring or
  drop the outline-none.
- src/components/ui/search/SearchInput.tsx:30 - input `focus:outline-none`, no ring replacement.
- src/features/chat/ui/ThreadView.tsx:72 - AI-mode `<select>` `outline-none` with no ring
  (admin inbox side of the same file as the public ThreadView component; lower priority).

### UX friction

- src/components/sections/home/HeroSection.tsx:48 - app-preview label reads
  `build / nonvoyxona` — looks like leftover/garbled placeholder text (not a real word in
  context) in the hero, the first thing visitors see. → replace with a real label ("build /
  ishchi maydon" or similar).
- src/components/ui/search/SearchInput.tsx:29 - placeholder ends `...` not `…`.
- Overlay panels have no `overscroll-behavior: contain`, so background can scroll through them
  on mobile: src/features/chat/ui/ChatPanel.tsx, src/components/layout/MobileDrawer.tsx:14,
  src/components/ui/search/SearchModal.tsx:40.
- src/lib/siteConfig.ts:51,56 - prices hardcoded as plain strings ("550 000 so'm"), not
  `Intl.NumberFormat('uz-UZ')`. Low risk (owner-edited, documented at siteConfig.ts:48) but
  breaks if a currency/locale toggle is ever added.

### Polish

- Sitewide `Eyebrow` component (src/components/ui/Layout.tsx:7, its own comment literally says
  "One eyebrow style sitewide: mono, uppercase, letter-spaced") plus `.hero-signature`,
  `.hero-orbit`, `.story-kicker`, `.story-rail` (home-motion.css:16,28; home-story.css:7,29) and
  ToolStrip.tsx:31 all repeat the same tracked-out ALL-CAPS monospace label pattern above nearly
  every section/page. See uniqueness note below — this is the single biggest "generic AI
  template" tell on the site, not an accessibility bug.
- src/components/sections/home/Pricing.tsx:13 and src/components/sections/home/Comparison.tsx:11
  - entire component body on one line (no line-level readability); not a UI bug but makes
  future line-level fixes/reviews harder.

## Top 8 fixes, ranked

1. **Button focus ring is dead sitewide.** src/components/ui/Button.tsx:12 — append
   `focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
   focus-visible:ring-offset-bg` to the base string in `buttonVariants` (drop
   `focus-visible:outline-none` or keep it, ring wins either way). Single change fixes every CTA.
2. **SearchModal focus-visible.** search/SearchModal.tsx:40 — change
   `focus:outline-none` to `focus:outline-none focus-visible:ring-2 focus-visible:ring-gold`.
3. **SearchInput focus-visible.** search/SearchInput.tsx:30 — same ring treatment, or wrap
   focus styling on the parent `div` with `focus-within:ring-2`.
4. **Hero copy bug.** HeroSection.tsx:48 — replace `build / nonvoyxona` with real, intentional
   copy; it's the most-seen line on the site.
5. **Retire the sitewide eyebrow tell.** Layout.tsx `Eyebrow` — for the home page at least,
   replace the mono/uppercase eyebrow with a Naqsh-specific structural device (numbered girih
   motif, small pattern glyph, or a short Uzbek phrase in sentence case) so the page stops
   reading as templated. See uniqueness section.
6. **Ellipsis typography.** SearchInput.tsx:29 — `...` → `…`.
7. **overscroll-behavior on overlays.** Add `overscroll-behavior: contain` (or Tailwind
   `overscroll-contain`) to ChatPanel.tsx's scrollable message list, MobileDrawer.tsx:14
   `Dialog.Content`, and SearchModal.tsx:40 `Dialog.Content`.
8. **Prices through Intl.** siteConfig.ts:51,56 — store the numeric value and format with
   `new Intl.NumberFormat('uz-UZ').format(n) + " so'm"` (or a small helper) instead of a
   hand-typed string, so grouping stays correct if the amount changes.

## Uniqueness critique (home page)

The Naqsh identity is real (girih SVG lattice, `font-display`, the hero's "Samarkand naqshi ·
zamonaviy kod" signature, the Prompt/Build/Test orbit ring) — that part is distinctive and
should stay. What undercuts it: every section header uses the exact same generic device —
`font-mono text-xs uppercase tracking-[0.14em] text-accent` eyebrow label (Layout.tsx `Eyebrow`,
reused in PageHero, PageBits, and duplicated ad hoc in Pricing.tsx/Comparison.tsx/Faq.tsx as
plain `<p className="text-sm font-semibold text-brand">`). This is precisely the "tracked-out
ALL-CAPS label above every heading" default the frontend-design skill calls out as a top AI-tell,
and here it appears on nearly every section of every page, competing with (rather than
supporting) the one genuinely local motif already on the page: the girih pattern. Concrete,
token-compatible fix: replace the mono-uppercase eyebrow with a tiny inline girih glyph (a 2–3
line clipped fragment of `GirihPattern`'s star-and-octagon motif, sized ~20px, using existing
`text-brand`/`text-accent` tokens) placed before the section heading instead of a text label —
it reuses an asset already in the codebase, needs no new tokens, and reads as "this site's mark"
rather than "SaaS template kicker."
