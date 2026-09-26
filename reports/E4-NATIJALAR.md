# E4 — Natijalar (Portfolio / Student Projects) + ring strand

Slice E4 of the Awwwards home-page redesign (Wave E). Section 4 of the story
(`docs/redesign/awwwards/02-art-direction.md` §1 row 4): **"Natijalar | the outer
tessellation (ring) | real student projects only"**.

## 1. What shipped

| File | Change |
| :--- | :--- |
| `src/components/sections/home/NatijalarSection.tsx` | **new** — `data-lab-section="natijalar"`, Unbounded `clamp(2.25rem, 6vw, 6rem)` heading `Sertifikat emas, ochiladigan mahsulotlar.`, honest Onest deck, octagonal "ring" showcase driven by `VERIFIED_PORTFOLIO_FALLBACK`, honest-figures note, `/portfolio` link with an explicit `aria-label` |
| `src/features/lab-naqsh/domain/homeLoom.ts` | added `{ id: "natijalar", strand: "ring" }` to `HOME_LOOM_SECTIONS` |
| `src/features/lab-naqsh/domain/homeLoom.test.ts` | asserts the registry contains `natijalar → ring` and that `mutedHomeStrands()` un-mutes `ring` (plus a negative case: still muted without it) |
| `src/app/page.tsx` | `<NatijalarSection />` inside `<HomeLoom>` right after `<DasturSection />`; `<Projects />` and its import removed |
| `src/components/sections/home/Projects.tsx` | **deleted** — `git grep` showed `src/app/page.tsx` was the only consumer (the other `Projects` hits are `completedProjects` in `src/db/seeders/experts.ts` and a comment in `src/features/lab-naqsh/domain/curriculum.ts`) |
| `.claude/skills/naqsh-lessons/SKILL.md` | new lesson **L26** (see §5) |

### The ring motif

The strand this section claims is `ring` — `LoomStar` draws it as a dashed outer
circle on `data-strand="ring"`. The section restates it in 8-sided geometry:

* **Project medallion** — a square (`size-24 sm:size-36`) octagonal frame built
  as a real two-layer `clip-path` polygon (1px `bg-border-onBrand` border over a
  `bg-brand-surface` panel), with a dashed `var(--accent)` octagon inside it,
  echoing the star's own ring. Numbered `01`, `02`, … in mono beneath.
* **Tessellation run** — 26 small octagonal tesserae above the list, alternating
  solid/hollow, i.e. the over-under alternation of the `weave` strand restated
  as the outer ring (§1 row 4 "the outer tessellation").
* Text sits **beside** the medallion, not inside the cut corners — see L26.

### Honesty (L14)

* Data source is the static `VERIFIED_PORTFOLIO_FALLBACK`, which filters
  `ownership === "owner" && status === "published"`. That currently resolves to
  **exactly one** project: **Clash Nexus** (`Startup MVP`).
* The task brief mentioned "featured items like Clash Nexus, **EduBaza**".
  EduBaza is **not** in the verified fallback — `VERIFIED_METADATA` marks it
  `ownership: "demo"`, `status: "hidden"` with the comment *"Unverified inserted
  examples. They stay available for migration/audit, never public."* Rendering it
  would be exactly the L14 violation the honesty rule forbids, so it is **not**
  shown. Same for Chatla, ImkonDay, EduBaza Bot, VibeResume, FastForm, Legal
  Helper, ShopSpeed. The list is written generically (`.map`), so those appear
  automatically the day the owner verifies them in `VERIFIED_METADATA`.
* No invented numbers: no follower counts, no testimonials, no student names, no
  "soniyalar ichida" claims. The fallback has no `userCount`, so the section
  renders **zero** numeric claims. The `userCount` branch exists but only ever
  prints the figure together with its own `note` (the site's public claim, not an
  independent audit), and the standing note under the list says so.
* Verified in the SSR HTML: `27 000` and `500+` (the hidden demo entries'
  figures) do **not** appear.

### Semantics / a11y

`<section aria-labelledby="natijalar-title">` → `<h2>` → `<ol>` → `<li>` →
`<article>` → `<h3>` → `<a>`. External link carries `target="_blank"
rel="noreferrer"` plus an `sr-only` "— jonli saytni yangi oynada ochish
(<domain>)" so the new-tab behaviour is announced. The `/portfolio` link is a
`next/link` with `min-h-11` (44px) and an `aria-label`
(*"Portfolio boʻlimini ochish — tekshirilgan loyihalar toʻliq roʻyxati"*).
Decorative octagons are `aria-hidden` + `focusable="false"`. Global focus ring
(`globals.css:85`, `outline: 3px solid var(--gold)`) applies unchanged.

## 2. Gates — real output

```
$ npm run lessons:check
debt  L13 src/app/kabinet/kurs/[id]/dars/[lessonId]/page.tsx: dynamic page never calls notFound(); …
debt  L13 src/app/shahodatnoma/[code]/page.tsx: dynamic page never calls notFound(); …
debt  L19 src/features/chat/server/chat.service.ts: 263 lines (max 250); split the file
lessons-check: 0 failure(s), 3 known debt (repo)
```
(The 3 items are pre-existing baselined debt in `scripts/lessons-baseline.json`,
untouched by this slice.)

```
$ npx tsc --noEmit
tsc: 0 errors        # exit 0, no output

$ npm test
 Test Files  112 passed (112)
      Tests  748 passed (748)
   Duration  28.08s
   # includes src/features/lab-naqsh/domain/homeLoom.test.ts (8 tests) — was 5

$ npm run build
 ✓ Compiled successfully in 11.9s
 ✓ Generating static pages (128/128)
```
No TS errors, no build warnings, 128/128 static pages.

**One honest caveat about the build:** the *first* `npm run build` of this slice
failed with

```
Failed to compile.
src/app/layout.tsx
An error occurred in `next/font`.
TypeError: Cannot read properties of null (reading '1')
  at …/@next/font/dist/google/loader.js:122:78
```

This is **not** caused by the change: it reproduces on a clean `git stash -u`
baseline and it is a transient Google Fonts fetch failure (the same run logged
`⨯ Failed to download 'JetBrains Mono' from Google Fonts. Using fallback font
instead.`). Every retry passed. See §5.

## 3. Responsive / no horizontal scroll

```
$ npx playwright test e2e/responsive.spec.ts -g "home"
Running 12 tests using 1 worker
[1/12] home › 375px light      [7/12] home › 1024px light
[2/12] home › 375px dark       [8/12] home › 1024px dark
[3/12] home › 390px light      [9/12] home › 1280px light
[4/12] home › 390px dark      [10/12] home › 1280px dark
[5/12] home › 768px light     [11/12] home › 1440px light
[6/12] home › 768px dark      [12/12] home › 1440px dark
  12 passed (59.2s)
```

Full-page screenshots for all 12 combinations are in `e2e/screenshots/home-*.png`.
The spec asserts, per width: exactly one `h1`, exactly one `main`,
`document.scrollingElement.scrollWidth <= window.innerWidth`, tap targets ≥ 40px
on ≤ 768px, and zero console errors.

Additionally measured in the page (L24 — do not eyeball layout off a
resampled screenshot), against a fresh `next build` + `next start`:

```
375 : section x=64 w=291 | h2 x=64 w=291 | h2OverflowsSection=false | scrollWidth 375 = innerWidth
768 : section x=64 w=672 | h2 x=64 w=672 | h2OverflowsSection=false | scrollWidth 768 = innerWidth
1440: section x=152 w=643| h2 x=152 w=643| h2OverflowsSection=false | scrollWidth 1440 = innerWidth
```

Element screenshots of the section at 390/1440 × light/dark were reviewed (the
crop starts exactly at the section box, so the first glyph sits flush against the
left edge — that is the crop, not clipped text; the measurement above proves
`h2.left === section.left`).

## 4. Token check (L6 / L24 / L25)

No hardcoded color anywhere:

```
$ grep -rEn "text-\[#|bg-\[#|border-\[#" src | wc -l
0
$ grep -nE "#[0-9a-fA-F]{3,6}|rgba?\(" src/components/sections/home/NatijalarSection.tsx
(no output)
```

The only `style=` in the new file is the §3-mandated clamp:
`style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}` — the same single inline
style the E2/E3 sections use.

Colors used: `text-on-brand-surface`, `border-border-onBrand`,
`bg-border-onBrand`, `bg-on-brand-surface`, `bg-brand-surface` (Tailwind
tokens) plus `stroke="var(--accent)"` in the decorative SVG, which is exactly
what `LoomStar` already does for its `ring` strand. No `gold` in this section
(§2 reserves gold for the diamond strand, the finished star and the CTA).

L25 — every class the slice introduced is actually emitted in the production CSS
(`cat .next/static/css/*.css > /tmp/all.css`, 1 = emitted):

```
bg-border-onBrand 1   bg-brand-surface 1   text-on-brand-surface 1
border-on-brand-surface 1   clip-path:polygon 1   size-36 1   size-24 1
min-h-11 1   sr-only 1   text-[0.65rem] 1
```

And the octagon resolves to a real declaration (Tailwind's comma escaping noted
in L25 — search the declaration, not the class name):

```
clip-path:polygon(28% 0,72% 0,100% 28%,100% 72%,72% 100%,28% 100%,0 72%,0 28%)
```

Files stay within L19: `NatijalarSection.tsx` 171 lines, `homeLoom.test.ts` 69.

## 5. What's left / risks

* **One project on the home page.** Honest, but visually thin. The owner should
  either verify more entries in `VERIFIED_METADATA` (`ownership: "owner"`,
  `status: "published"`) or accept it. Nothing to code — the `.map` picks them up.
* **Tessellation run wraps to 2 rows at 375/390.** Intentional (it reads as a
  tessellation), but if the owner dislikes it, drop `length: 26` to 13.
* **Focus ring is gold** on this section's links, inherited from
  `globals.css:85`. §2 says gold belongs to the diamond strand / CTA only, but
  the ring is a *site-wide* rule already shared by the other loom sections; I did
  not change it unilaterally. Flag for the wave owner.
* **Lesson not yet codified as a check.** L26 is a rule, not a grep, so per §3 of
  the skill it is not in `scripts/lessons-check.mjs` — it is enforced by the
  screenshot step (L3/L24) instead.

## LESSON

A percentage `clip-path` polygon is **not** scale-invariant: the same
`polygon(28% 0, 72% 0, 100% 28%, …)` is a regular octagon on a square and a
lopsided, text-eating wedge on a wide, short card (600×200 → 168px horizontal
cuts vs 56px vertical ones), and nothing in the code or in `tsc`/vitest/build
catches it. **Check:** keep percentage-clip octagons on `size-*` squares only and
lay the copy beside them; then confirm in-page instead of by eye (L24) —
`h2.getBoundingClientRect().width <= section.getBoundingClientRect().width` at
375/768/1440 — and screenshot the element at 390 and 1440 in light **and** dark.
Recorded as **L26** in `.claude/skills/naqsh-lessons/SKILL.md`. A second, more
general lesson: **`next/font` build failures are usually transient** — a
`Cannot read properties of null (reading '1')` from
`@next/font/dist/google/loader.js` with a `Failed to download '<font>' from Google
Fonts` warning is a network flake, not a code error. Reproduce it on a clean
`git stash -u` baseline and retry before touching any code; a build that fails
once and passes on a retry is not a regression, and claiming either way without
the retry is exactly the L1 mistake.
