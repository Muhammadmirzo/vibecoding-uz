# Naqsh → Awwwards: phase 2 (art direction system)

Concept chosen by the owner: **A + C**, the "Naqsh to'qiladi" site system with a live "prompt → site" demo in the hero.
Constraints: no Samarkand/historic-city references; the girih logo is the brand core; honesty rule (no invented proof).
Skills for the build: `awwwards-craft`, `impeccable`, `motion-design`, `creative-hub` (gsap-*), `accessibility`, `core-web-vitals`, `uz-market`.

## 1. Story (one metaphor, section by section)

Building with AI = weaving a naqsh. Each section adds one strand to the logo's 8-point star. At the end, the finished
star glows gold and becomes the CTA.

| # | Section | Strand added | What the visitor learns |
| :--- | :--- | :--- | :--- |
| 0 | Hero: live demo (C) | the centre caret `>` | "You describe it, AI builds it", shown in 10 s |
| 1 | Muammo | the square (first 4 lines) | why learning to code the old way is slow |
| 2 | Usul (vibe coding) | the diamond (next 4 lines) | how the method works, in 3 steps |
| 3 | Dastur (curriculum) | the over-under weave | what you'll build week by week |
| 4 | Natijalar | the outer tessellation | **real** student projects only |
| 5 | Narx + savollar | the gold fill | the offer, clear price in so'm |
| 6 | Boshlash | the star completes and glows | CTA: "Bepul diagnostika" |

## 2. Color (from the logo only)

| Role | Token | Use |
| :--- | :--- | :--- |
| Night | `bg` (dark) | hero and story sections: the "canvas" the naqsh is woven on |
| Ivory | `bg` (light) | reading sections (curriculum, price, FAQ) |
| Brand blue | `brand` | the square strand, links, data |
| Gold | `gold` | **only** the diamond strand, the finished star and the primary CTA |
| Turquoise | `accent` | **only** the caret/cursor and focus rings |

Rule: at most 2 colors plus the neutrals on any screen. Components use tokens only, never hex (L6).

## 3. Type

- Display: **Unbounded 700**, huge and tight. Hero `clamp(3rem, 11vw, 12rem)`, tracking −0.045em, line-height 0.9.
  Section titles `clamp(2.25rem, 6vw, 6rem)`.
- Text: **Onest 400/500**, 17px / 1.65 (18px on desktop reading sections).
- Code/terminal: **JetBrains Mono 400**.
- Verified 2026-09-25: Unbounded and Onest both contain U+02BB (oʻ gʻ), U+2018 and U+02BC. Use U+02BB for the
  letters in display text so they don't fall back to another font.

## 4. Grid & spacing

- The logo is drawn on a 32-unit grid, so layout uses an 8px base (8 / 16 / 32 / 64 / 128).
- Desktop: 12 columns, 32px gutters, max width 1440px. Tablet: 8 columns. Phone: 4 columns, 16px side gutter.
- The star lives in a fixed "loom" column: the right 4 columns on desktop, a thin thread in the left margin on phone.
- Break the grid in exactly two places: the hero headline and the final star.

## 5. Motion system (see `motion-design` + `gsap-*`)

| Name | Easing | Duration | Used for |
| :--- | :--- | :--- | :--- |
| weave | none (scroll scrub) | tied to scroll | drawing the star's strands (stroke-dashoffset) |
| reveal | expo.out | 0.9 s, stagger 0.06 s | headlines (line mask), then body |
| settle | power2.inOut | 0.6 s | layout changes, the hero demo assembling (Flip) |
| tap | spring (bounce 0.2) | ≤ 0.3 s | buttons, chips, hovers |

- Nothing longer than 1.2 s. Only `transform`, `opacity`, `clip-path` and the SVG stroke are animated.
- Smooth scroll: Lenis, and it never hijacks scroll direction or speed.
- `prefers-reduced-motion`: the star is shown already complete, the demo shows its final state, reveals are off.
- The existing `data-motion` gates (off/subtle/full) stay: SSR and no-JS render the finished content.

## 6. Signature moments

**Hero demo (C).**
- A terminal shows `> ` plus three idea chips: "Onlayn do'kon", "Kurs sayti", "Telegram bot". Desktop can type a free idea.
- On choose, it types a short prompt, then girih tiles fly in (GSAP Flip) and form a mini site mock for that idea.
- The mock is labelled "namuna", a scripted demo, not real AI output (honesty rule). It must work without an API key.

**The loom (A).**
- An SVG star pinned in the loom column; ScrollTrigger scrubs each strand as its section passes.
- At section 6 the star fills gold, gently pulses once and turns into the CTA button's icon.

## 7. Remove (template look)

Eyebrow labels over every section (open question Q8, answered by this system: remove them), identical 3-card grids,
fade-up on every element, gradient blobs, emoji icons, stock photos, invented numbers.

## 8. Quality budget

- LCP < 2.5 s on mobile (LCP element = the hero headline text); CLS < 0.1; INP < 200 ms.
- Motion JS ≤ 60 KB gzipped (GSAP core + ScrollTrigger + Flip ≈ 45 KB, Lenis ≈ 4 KB). No WebGL.
- 60 fps on a mid-range Android phone. WCAG AA contrast in both themes. Keyboard users can use the demo.
- Screens to check every slice: 390, 768, 1280, 1440 px, plus a screen video (Playwright `recordVideo`).

## 9. Build plan (slices; each ends with "Siz tekshiring" steps for the owner)

1. Prototype route `/lab/naqsh` (not linked, `noindex`): the loom star plus the scroll scrub only. The owner approves the feel.
2. Hero demo prototype in the same lab route. The owner approves.
3. Replace the home page sections one by one (0 → 6) using the approved prototypes.
4. Inner pages get the same type, colors and motion rules (course page, blog, free lesson).
5. Polish pass: cursor, hovers, 404, loader, OG image. Lighthouse, a11y, real phone test. Then submit to Awwwards.
