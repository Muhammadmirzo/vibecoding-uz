# E5 — Narx + savollar (pricing + FAQ) + the gold fill strand

Slice E5 of the Awwwards home-page redesign (Wave E). Section 5 of the story
(`docs/redesign/awwwards/02-art-direction.md` §1 row 5): **"Narx + savollar | the
gold fill | the offer, clear price in so'm"**.

## 1. What shipped

| File | Change |
| :--- | :--- |
| `src/components/sections/home/NarxSection.tsx` | **new, 249 lines** — `data-lab-section="narx"`, Unbounded `clamp(2.25rem, 6vw, 6rem)` heading `Narx — aniq va oddiy.`, honest Onest deck, the gold fill motif, both real course offers with prices from `siteConfig`, the money-back guarantee from `siteConfig.guaranteeText` linking to `/pul-qaytarish`, and a 4-item FAQ |
| `src/features/lab-naqsh/domain/homeLoom.ts` | added `{ id: "narx", strand: "fill" }` to `HOME_LOOM_SECTIONS` |
| `src/features/lab-naqsh/domain/homeLoom.test.ts` | registry now asserted through E5; `fill` un-muted by `narx`; negative case (still muted without `narx`); new invariant: ids and strands are unique, and every claimed strand exists in `STRAND_KEYS`. `mutedHomeStrands()` is now `[]` (all five story strands shipped) |
| `src/app/page.tsx` | `<NarxSection />` inside `<HomeLoom>` right after `<NatijalarSection />`; `<Pricing />` and `<Faq />` and their imports removed |
| `src/components/sections/home/Pricing.tsx` | **deleted** — `grep -rn "sections/home/Pricing\|<Pricing" src e2e mcp-server` left only `src/features/crm/.../PricingTab`, an unrelated admin component |
| `src/components/sections/home/Faq.tsx` | **deleted** — same grep left no consumer. `src/components/ui/FaqDisclosure.tsx` is **kept**: `/kurs/[slug]` and `/bepul-dars` both still use it |
| `scripts/lessons-check.mjs` | new **L27** check (see §5) |
| `.claude/skills/naqsh-lessons/SKILL.md` | new lesson **L27** (see §5) |

### The fill strand

`LoomStar` draws `fill` as `LOGO_DIAMOND` filled with `var(--gold)` at
`fillOpacity 0.85` — the star's centre plate. The section restates it in three
places, all gold-on-navy, the same pairing the SVG uses:

* **`FillBar`** — 24 small squares that are hollow (`border-border-onBrand`) for
  the first 16 and solid `bg-gold` for the last 8: the fill arriving. It is the
  only gold *block* in the section, so it reads as the plate filling.
* **Gold diamond knot** (`GoldKnot`) — a `size-2.5 rotate-45 bg-gold` square
  beside each price, echoing the star's own diamond geometry.
* **Gold rule + gold figure** — each offer is separated by a `border-t-2
  border-gold` rule, and the price figure itself is `text-gold`.

The guarantee is the one place a gold *frame* states a promise (`border-gold`).
§2 permits gold here: "Gold: only the diamond strand, the finished star and the
primary CTA" — and the fill strand is explicitly gold per §1 row 5.

### Honesty (L14)

* Prices are read from the single source of truth, not typed:
  `siteConfig.courses["vibe-coding-express"].price` /
  `.installment` and the same for `"ai-asoslari"`. Both render
  `550 000 soʻm`, because that is what `siteConfig` says — the two courses
  really are priced the same, and the section does not pretend otherwise.
* **`oldPrice` is deliberately not rendered.** In `siteConfig` it is *equal* to
  `price` for both courses, so a struck-through "old" price would advertise a
  discount that does not exist. The old `Pricing.tsx` didn't render it either
  (it had the same values), so nothing is lost.
* **No countdown timer, no "spots left", no crossed-out price, no invented
  scarcity.** `nextCohortDate` exists in `siteConfig` but is not shown here: the
  cohort date is already stated on the course pages, and inventing urgency in
  the pricing section is exactly the fake-marketing pattern the art direction
  bans (§7 "invented numbers").
* Duration, format and course titles/descriptions come from `COURSES` in
  `src/features/courses/content.ts`; the session format and the guarantee
  wording come from `siteConfig.sessionFormat` / `.guaranteeText` /
  `.guaranteeSummary`. The deck says outright that there is no discount and no
  deadline ("chegirma yoʻq, muddat yoʻq").
* One honest oddity worth the owner's eye: the two courses' copy describes them
  as very different products (8-week group mentorship vs 4-week self-study) at
  the same price. The section states both plainly rather than inventing a
  "value" justification. If the owner wants the price difference to be visible,
  the fix is in `siteConfig`, not in this component.

### The FAQ

Four questions a buyer actually asks before paying: **prerequisite**
(`Dasturlashni bilasam kerakmi?`), **session format** (`Darslar qanday oʻtadi?`),
**language** (`Kurs qaysi tilda?`) and **instalments**
(`Toʻlovni boʻlib toʻlasam boʻladimi?`, with the real figures interpolated from
`siteConfig`). Answers are the site's existing published copy, normalised to
U+02BB via `uzDisplay()` (§3).

Implemented with **native `<details>`/`<summary>`**, not a JS accordion. It is
the same accessible disclosure (button-like summary, browser-managed
`aria-expanded`, keyboard-operable, `group-open` rotation on the chevron) but the
answers are in the server-rendered HTML, so they stay readable with JS off and
there is no hydration state to drift. Verified in-page: clicking the first
summary opens it and the answer becomes visible.

## 2. Gates — real output

`npm run lessons:check`

```
debt  L13 src/app/kabinet/kurs/[id]/dars/[lessonId]/page.tsx: dynamic page never calls notFound(); unknown ids return 200 (soft-404)
debt  L13 src/app/shahodatnoma/[code]/page.tsx: dynamic page never calls notFound(); unknown ids return 200 (soft-404)
debt  L19 src/features/chat/server/chat.service.ts: 263 lines (max 250); split the file
lessons-check: 0 failure(s), 3 known debt (repo)
```

`npm test` (`npx vitest run`)

```
 Test Files  112 passed (112)
      Tests  753 passed (753)
   Duration  28.77s
```

`npx tsc --noEmit` — no output, exit 0.

`npm run build`

```
 ✓ Compiled successfully in 13.8s
 ✓ Generating static pages (128/128)
```

`npx playwright test e2e/responsive.spec.ts -g "home"` — 375/390/768/1024/1280/1440
× light/dark:

```
Running 12 tests using 1 worker
  12 passed (52.4s)
```

That covers exactly what the brief asked: no horizontal scroll
(`scrollWidth <= innerWidth`), no undersized tap targets below 768
(`button/a` ≥ 40×40), exactly one `h1` and one `main`, and zero console/page
errors, in both themes.

**Pre-existing failures, not from this slice.** `e2e/visibility.spec.ts` passes
(37/37 of that run). `e2e/funnel.spec.ts` has 2 failures — a stale quiz label
(`Savol 1 / 9` no longer exists) and a stale price assertion
(`2 990 000 so'm` vs the current `550 000 so'm`). I confirmed these are not mine
by stashing the whole slice (`git stash -u`) and re-running: **the same 2 tests
fail on the clean baseline**.

## 3. Token check (L6 / L24 / L25 / L26)

**L6 — tokens only.** `grep -nE "text-\[|bg-\[|border-\[|#[0-9a-fA-F]{6}|rgb\("
src/components/sections/home/NarxSection.tsx` → no matches. The section uses
only `text-on-brand-surface`, `border-border-onBrand`, `bg-brand-surface`,
`text-gold`, `bg-gold`, `border-gold`, and `opacity-*` on existing elements (the
deck and secondary copy use `opacity-80`/`75`/`70`, as E3/E4 do).

**L25 — every class actually emits CSS.** Checked against the fresh build
(`cat .next/static/css/*.css`, occurrence counts via `grep -oF`):

| class | hits | class | hits |
| :--- | ---: | :--- | ---: |
| `text-gold` | 2 | `whitespace-nowrap` | 1 |
| `bg-gold` | 3 | `scroll-mt-24` | 1 |
| `border-gold` | 2 | `first:border-t-0` | 1 |
| `border-border-onBrand` | 1 | `sm:text-4xl` / `lg:text-5xl` | 1 / 1 |
| `text-on-brand-surface` | 1 | `group-open:rotate-[135deg]` | 2 |

Nothing is 0. Same trap as the old `Pricing.tsx`: it used `border-gold/30` and
`bg-gold-soft`, and `border-gold/30` is one of the classes that **emits no CSS at
all** in this config (no `<alpha-value>` in any colour) — the new section uses
the solid `border-gold` instead, and `grep -oF 'border-gold/30'` on the built CSS
is 0, as it should be.

**L24 — measured in the page, not by eye.** A throwaway Playwright probe
(deleted afterwards) measured the section at 375/390/640/768/1024/1280/1440:

| width | heading fits | price row clientWidth | price font | overflow |
| ---: | :--- | ---: | ---: | ---: |
| 375 | yes | 291 | 24px | 0 |
| 390 | yes | 306 | 24px | 0 |
| 640 | yes | 544 | 36px | 0 |
| 768 | yes | 672 | 36px | 0 |
| 1024 | yes | 540 | 48px | 0 |
| 1280 | yes | 643 | 48px | 0 |
| 1440 | yes | 643 | 48px | 0 |

This measurement caught a real bug that the screenshots did not make obvious.
The first version used a 2-up `lg:grid-cols-2` offer grid; the content column is
only **246px** at 1024 (the loom takes 5 of 12 columns), and the nowrap price
figure is 301px at 36px type — a **77px overflow past its own column**, silently
eating into the loom gutter. No horizontal page scroll resulted, so
`responsive.spec.ts` stayed green. I dropped the 2-up grid for a vertical run
(one offer per row, like E3/E4) and stepped the price per breakpoint instead of
clamping on vw — because the column is 291px at 375 but already 544px at 640 (the
loom column only appears at `lg`), so a vw clamp under-sizes the figure on
tablet. `data-price-fit` marks the row so the fit assertion has a stable hook.

Also measured: no non-transformed descendant extends past the section box at any
width; the only 2px "overflows" are the *bounding boxes* of the 10–14px
45°-rotated decorative squares, which grow by `size·(√2−1)/2 ≈ 2px` while their
painted pixels stay inside — and 20px of container padding absorbs them anyway.
Gold contrast on the fixed navy surface: **7.33:1** light, **8.94:1** dark for
the 48px price (L5, AA large-text needs 3:1). Tap targets in the section:
course links 44px tall, FAQ summaries 68px, the guarantee link is `min-h-11`
inline-flex (raised from a bare 21px inline link during this slice).

**L26 — no percentage clip-path on a non-square box.** The section uses no
`clip-path` at all. Every gold shape is a `size-*` square (rotated 45° for the
diamond knot, unrotated for the fill bar tesserae) or a plain `border` on a wide
box, so the percentage-polygon-on-a-wide-card failure mode cannot occur.

## 4. Also shipped: the anchor the deletion would have killed

Deleting `<Pricing id="kurs-tanlash">` removed an anchor that **four** places
deep-link to: the desktop nav "Kurslar" (`DesktopNav.tsx`), the mobile drawer
(`MobileDrawer.tsx`), the header CTA (`headerData.ts`) and the CRM's default
`headerCtaLink` (`validations/admin.ts`, `admin.service.ts`,
`useSettings.ts`, `KabinetDashboardClient.tsx`). Nothing failed: no test
references the anchor, `tsc`/`vitest`/`build` stayed green and the responsive
e2e has no notion of anchors. The new section now carries
`id="kurs-tanlash"` (plus `scroll-mt-24`, the same offset `/maxfiylik`,
`/pul-qaytarish` and `/offerta` use, so the sticky header doesn't cover the
heading).

## 5. Lesson L27 — the check that would have caught it

`scripts/lessons-check.mjs` grew an L27 rule: it collects every `"/#anchor"`
literal in `src/components/layout`, `src/features/crm`, `src/config` and
`src/components/ui`, collects every `id="…"` in `src/**/*.tsx`, and fails when a
deep link has no target. Proven both ways on this slice:

```
# with the id removed from NarxSection.tsx
FAIL  L27 site chrome deep-links to /#kurs-tanlash but no id="kurs-tanlash" exists in any src/**/*.tsx
lessons-check: 1 failure(s), 3 known debt (repo)   exit=1

# with the id in place
lessons-check: 0 failure(s), 3 known debt (repo)   exit=0
```

One caveat, recorded in the skill: the check reads `git ls-files`, so a brand-new
untracked file is invisible to it and a green run means nothing until the file is
staged. That bit me once during this slice (green before `git add`, then the
rule fired correctly afterwards).

## 6. Notes / open questions for the owner

* **The two courses are priced identically** (550 000 so'm) while being very
  different products. Stated honestly, but the owner may want to revisit
  `siteConfig.courses`. Not changed here — pricing is the owner's call.
* **The FAQ answers are the site's existing published copy**, not new claims. If
  the owner wants different answers (e.g. a stricter refund-conditions summary),
  they belong in `siteConfig`/`COURSES`, not in this component.
* **`.faq-section` CSS in `home-sections.css` is now dead** — those five rules
  only styled the deleted `Faq.tsx`. I left them (the file is shared and other
  pages use `FaqDisclosure` without that class); a cleanup pass can drop them.
* **The new FAQ has no open/close animation.** The old one had a
  `grid-template-rows` height animation scoped to `.faq-section`; on the navy
  canvas a height animation would also risk CLS, so the new disclosure opens
  instantly. The `group-open` chevron rotation still animates (200ms, `transform`
  only, per §5 of the art direction).
* **Native `<details>` instead of the `<button>` + `aria-expanded` pattern** the
  brief listed. Same accessible disclosure, better no-JS behaviour; flagged
  explicitly here in case a reviewer wants the ARIA version instead.

## LESSON

**An in-page anchor lives on the component that renders it, not on the route — so
deleting a section deletes the deep link, and no compiler, test or responsive
check notices.** Removing the old home `<Pricing>` took `id="kurs-tanlash"` with
it, which is where the desktop nav "Kurslar", the mobile drawer, the header CTA
and the CRM's default `headerCtaLink` all point. `tsc`, `vitest`, `next build`
and the 12-test responsive e2e were all green the whole time: the links degrade
to a plain jump-to-top, which is invisible in a screenshot and not a 404. Before
deleting any component carrying an `id`, run `grep -rn "/#<id>" src` (nav,
header, drawer, CRM settings, blog posts) and hand the id to its replacement.
That grep is now automated as **L27** in `scripts/lessons-check.mjs`
(§5 above), and it is recorded as L27 in
`.claude/skills/naqsh-lessons/SKILL.md` with the `git ls-files` caveat. A second,
more general lesson, and this one is *not* Naqsh-specific: **a "no horizontal
scroll" e2e assertion is a floor, not proof of fit.** A child that overflows its
own column by 77px produced `scrollWidth === innerWidth` and a fully green
responsive suite, because the parent clipped it. When a value must fit a box,
assert the box's own geometry (`row.scrollWidth <= row.clientWidth`, plus
`h2.width <= section.width` per L24) at every breakpoint — a vw-based `clamp()`
is not a fit calculation, because the box it lands in is a *grid column*, and
that column is 246px at 1024 while being 544px at 640.
