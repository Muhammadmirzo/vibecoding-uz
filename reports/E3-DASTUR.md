# E3 — Dastur (curriculum) section + weave strand integration

Wave E, slice E3. Home page (`/`), loom section 3, per
`docs/redesign/awwwards/02-art-direction.md` §1 row 3, §2, §3, §4, §7.

## 1. What shipped

| File | Change |
| :--- | :--- |
| `src/components/sections/home/DasturSection.tsx` | **new** (104 lines). `data-lab-section="dastur"`, `aria-labelledby` → `h2` at `clamp(2.25rem, 6vw, 6rem)` Unbounded 700 / `leading-[0.95]` / `tracking-[-0.045em]`, heading `8 hafta. Har hafta — bitta yangi qatlam.`, an honest 4-row week-by-week breakdown rendered as an **over-under weave** (§1 row 3). |
| `src/features/lab-naqsh/domain/curriculum.ts` | **new** (86 lines, pure). Groups the published Vibe Coding Express 8-week roadmap into 4 two-week `WeaveBlock`s. No I/O, no React. |
| `src/features/lab-naqsh/domain/curriculum.test.ts` | **new** (5 tests). |
| `src/features/lab-naqsh/domain/uzText.ts` | **new** (26 lines, pure). `uzDisplay()` maps ASCII `'` → U+02BB so course copy renders in Unbounded/Onest without a font fallback (§3). |
| `src/features/lab-naqsh/domain/uzText.test.ts` | **new** (3 tests). |
| `src/features/lab-naqsh/domain/homeLoom.ts` | added `{ id: "dastur", strand: "weave" }` to `HOME_LOOM_SECTIONS`. |
| `src/features/lab-naqsh/domain/homeLoom.test.ts` | asserts the 3-entry registry, that `mutedHomeStrands()` no longer mutes `weave`, and that `weave` **is** still muted without the dastur entry. |
| `src/app/page.tsx` | imports `DasturSection` and renders `<DasturSection />` inside `<HomeLoom>` directly after `<UsulSection />`. |

### The weave motif
Each two-week block is one weft row. The thread is drawn with explicit
absolutely-positioned segments (never a `border` that later has to be
interrupted), and the knot alternates:

- even row (**over**): one continuous line, solid white knot sitting on it;
- odd row (**under**): the line is split into two segments with a gap at the
  knot, and the knot is hollow (canvas-coloured fill + white border) so the
  thread visibly passes behind it.

Deliberately no gold here — §2 reserves gold for the diamond strand, the
finished star and the primary CTA only. No eyebrow label (§7), no identical
3-card grid (§7).

### Honesty (L14)
No week, project or number is written in the component. The copy is grouped
from `COURSES["vibe-coding-express"].roadmap` in
`src/features/courses/content.ts` — the same source the course page and
checkout render — so the home page cannot promise weeks the course doesn't
teach. `curriculum.test.ts` asserts every week 1..8 appears exactly once, in
order, and that the block titles equal the published roadmap entries.

### U+02BB note
The specified heading string ("8 hafta. Har hafta — bitta yangi qatlam.")
contains no oʻ/gʻ letter, so the U+02BB rule (§3) is exercised by the rest of
the section's display text instead: the deck (`toʻrt`, `oʻz`, `qoʻlda`) and the
imported week titles, normalised through `uzDisplay()` ("Ma'lumotlar" →
"Maʻlumotlar"). Asserted in `curriculum.test.ts` and `uzText.test.ts`, and
visible in the screenshots below.

## 2. Gates — real output

```
$ npm run lessons:check
debt  L13 src/app/kabinet/kurs/[id]/dars/[lessonId]/page.tsx: dynamic page never calls notFound(); unknown ids return 200 (soft-404)
debt  L13 src/app/shahodatnoma/[code]/page.tsx: dynamic page never calls notFound(); unknown ids return 200 (soft-404)
debt  L19 src/features/chat/server/chat.service.ts: 263 lines (max 250); split the file
lessons-check: 0 failure(s), 3 known debt (repo)
```
(3 known debt items are pre-existing, listed in `scripts/lessons-baseline.json`,
none in files I touched.)

```
$ npm test
 ✓ src/features/lab-naqsh/domain/curriculum.test.ts (5 tests) 10ms
 ✓ src/features/lab-naqsh/domain/uzText.test.ts (3 tests) 4ms
 ✓ src/features/lab-naqsh/domain/homeLoom.test.ts (5 tests) 7ms
 Test Files  112 passed (112)
      Tests  745 passed (745)
   Duration  27.60s
```

```
$ npx tsc --noEmit
(no output — zero errors)
```

```
$ npm run build
   ▲ Next.js 15.5.26
 ✓ Compiled successfully in 11.7s
Route (app) ... /
+ First Load JS shared by all  103 kB
(exit code 0; full table printed, home route present)
```

```
$ npx playwright test e2e/responsive.spec.ts -g "home" --reporter=line
  12 passed (50.8s)
```
Covers 375/390/768/1024/1280/1440 × light+dark, and asserts per viewport: one
`h1`, one `main`, **no horizontal scroll**, tap targets ≥ 40 px at ≤ 768, and
zero console/page errors. Screenshots land in `e2e/screenshots/home-<w>[-dark].png`.
Note: on the *first* run of this command `home 375px light` failed on a console
error; it passed on re-run and in the full 12-test run above. That was a cold
`next dev` first-compile artifact, not a layout failure — the same test also
passed standalone (`1 passed (13.4s)`). Not fixed, just reported.

## 3. Token check (L24 / L25)

L6 (no hardcoded colours) in the new/changed files:
```
$ grep -rEn "text-\[|bg-\[|border-\[|rgb\(|rgba\(" DasturSection.tsx curriculum.ts uzText.ts
L6 clean: no hardcoded colors
```

L25 — every new Tailwind colour class verified as **emitted** in the built CSS
(`cat .next/static/css/*.css > /tmp/all.css`):
```
bg-border-onBrand        -> 1
border-border-onBrand    -> 1
bg-on-brand-surface      -> 1
border-on-brand-surface  -> 1
bg-brand-surface         -> 1
text-on-brand-surface    -> 1
font-display             -> 1
```
The L25 alpha trap was avoided by construction: no `/opacity` modifier is used
on any colour token (the tokens already bake the alpha in
`--border-on-brand-surface: rgba(255,255,255,0.15)`), so there is no class that
can silently emit no CSS.

L24 — the weave geometry was **measured in the page**, not judged from a
screenshot. Per row, every drawn element's top is `0` (the knot `-5`, i.e.
10 px square centred on the 1 px line) relative to the row box, rows are
150–235 px tall, and the segments count alternates 2 / 3 / 2 / 3 exactly as the
over-under rule requires. No stretched ticks: the lines are `top-0` on a
`relative` row, not `inset-y-0` children of an `items-start` grid.

L25/L24 measured values from the running page (Chromium):
```
1440 dark/light: h2 font-size 86.4px (6vw), canvas rgb(13,31,77) in BOTH themes,
                 text rgb(255,255,255), docScrollWidth 1440 == innerWidth
390  dark/light: canvas + text identical, docScrollWidth 390 == innerWidth
rows: 4 · segments [2,3,2,3] · lineTops [0,0,-5] · knot 10px
```

## 4. Screenshots (L3)

`/tmp/opencode/e3/dastur-{390,1440}-{dark,light}.png` — element crops of
`[data-lab-section="dastur"]` (light and dark are pixel-identical apart from the
global sticky nav, which proves the section is theme-agnostic: it inherits
`bg-brand-surface` from `<HomeLoom>` and only uses on-brand tokens).
Full-page captures for all six viewports are in `e2e/screenshots/`.
Reviewed: heading wraps cleanly at 390 (3 lines) and 1440, no overlap between
the deck, the first weft line or the knots at any width, no horizontal scroll.

## 5. What's left / risks

- **Out of scope, not touched:** the older `Roadmap` section still renders the
  same 8-week arc further down the page with 4 hand-written stages. It is not
  in `<HomeLoom>` and is now partly redundant with the Dastur section; removing
  or refactoring it is a follow-up decision for the orchestrator (it carries the
  `roadmap-*` CSS in `home-sections.css`).
- The section is static (no client JS). The weave strand scrub itself is
  `HomeLoomMotion`'s job; it works off `HOME_LOOM_SECTIONS` only, so the new
  entry picked it up with no motion change. `prefers-reduced-motion` is
  unaffected — there is nothing to reduce.
- The chat bubble / sticky nav / "til kontentga o'tish" pill overlap the heading
  **in element screenshots only**; they are fixed overlays and the full-page
  captures show the normal scrolled layout.
- The one flaky `home 375px light` console-error failure on a cold dev compile
  is worth watching across waves; if it recurs on a warm server it needs a real
  fix (likely a candidate for the `lessons-check`/CI gate).

LESSON: When a new loom section has to show week-by-week curriculum, don't
retype it — derive the copy from the published course data
(`src/features/courses/content.ts`) in a pure, unit-tested domain module and
normalise the apostrophes to U+02BB at render time (`uzDisplay`). Two checks
catch the regressions: assert in a test that every published week appears exactly
once and that display titles contain U+02BB and no ASCII `'`; and after
`npm run build`, `grep -cF` every new colour class in `.next/static/css/*.css`
(L25) plus an in-page measurement that each weft segment's `top` is `0`
relative to its row (L24) — never a pixel estimate off a screenshot.
