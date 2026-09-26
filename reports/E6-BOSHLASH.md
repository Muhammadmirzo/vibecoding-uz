# E6 — Boshlash (Final CTA + Completion) section + glow strand integration

Wave E, slice E6. Scope: home page `/` only. Owner slice of the 6-strand Girih star
(`docs/redesign/awwwards/02-art-direction.md` §1 row 6: "Boshlash | the gold glow | clear
next step (diagnostika test), no trap").

## What shipped

| File | Change |
| :--- | :--- |
| `src/components/sections/home/BoshlashSection.tsx` | **New** (156 lines ≤ 250, L19). `data-lab-section="boshlash"`, Unbounded 700 `clamp(2.25rem, 6vw, 6rem)` heading with U+02BB, Onest deck, glow motif, primary + secondary CTA, guarantee block. |
| `src/features/lab-naqsh/domain/homeLoom.ts` | Registered `{ id: "boshlash", strand: "glow" }`; removed the `strand !== "glow"` special case in `mutedHomeStrands()` (see below). |
| `src/features/lab-naqsh/domain/homeLoom.test.ts` | All 6 sections asserted, `mutedHomeStrands()` → `[]`, plus the new glow claims. 17 tests. |
| `src/app/page.tsx` | `<BoshlashSection />` inside `<HomeLoom>` right after `<NarxSection />`; `<NextStepCTA />` invocation and import removed. |
| `src/components/sections/home/HomeLoomMotionImpl.tsx` | `glow` added to `HIDDEN_VARS`/`DRAWN_VARS` so the registered glow strand actually scrubs (before: the `continue` guard made the entry dead). |
| `reports/E6-BOSHLASH.md` | This report. |

`NextStepCTA` itself is **kept** — 20 other pages/feature components still render it
(`blog`, `blog/[slug]`, `kurs/[slug]`, `portfolio`, `ish/*`, `meetlar`, `ekspertlar`,
`resurslar`, `atamalar`, `pul-qaytarish`, `maxfiylik`, `offerta`, `not-found`,
`xizmatlar`, `shahodatnoma/[code]`, `testimoniyalar`, `(dev)/design-system`). Only the
home-page invocation was removed, so the two CTAs are no longer duplicated.

### `mutedHomeStrands()` review
Before, `glow` was hard-excluded from the muted set because nothing claimed it and it rests
at `opacity 0` in `LoomStar` (so muting it was a no-op). Now that `boshlash` claims it, the
exception is dead weight and the registry can be the single source of truth:
`mutedHomeStrands()` is now a plain `STRAND_KEYS.filter(...)` over unregistered strands and
returns `[]` — the star is fully woven, nothing is a faint guide. Note `LoomStar`'s glow
circle never had `className={muted("glow")}`, so the old special case never affected the
rendered star either way; the behaviour change is confined to the domain function and its tests.

### Copy decisions (L14 honesty)
- Heading `Gʻoyangizni bugunoq boshlang.`, deck "2 daqiqalik diagnostika orqali oʻzingizga mos
  dastur va boshlash darajasini aniqlang…". No invented scarcity, no countdown, no discount.
- **The guarantee day count is NOT hardcoded to "14 kun" as the brief suggested.** `siteConfig`
  — the single source of truth, also used by `NarxSection`, `/pul-qaytarish` and the checkout —
  says `guaranteeText: "7 kunlik 100% pul qaytarish kafolati"`, `guaranteeDays: 7`. Writing
  "14 kunlik toʻliq kafolat" here would make the final CTA promise a **double** the real refund
  window. The section renders `siteConfig.guaranteeText` + `guaranteeSummary` and links to
  `siteConfig.guaranteeTermsUrl` (`/pul-qaytarish`), so it can never drift from the offer. If 14
  days is the intended new policy, change `siteConfig` (one place) and the section follows.
- Primary CTA `/diagnostika` `data-track="cta_diagnostic"`; secondary `/bepul-dars`
  `data-track="cta_free_lesson"` (`variant="onBrand"`). `data-track` ids are free-form strings
  consumed by `src/features/analytics/client/tracker.ts` (`cta_click` event), matching the
  existing `hero_*` / `header_*` / `next_*` convention.

### Glow motif
A square medallion (`size-40 sm:size-56`) carrying the real 8-point mark — `LOGO_DIAMOND` +
`LOGO_SQUARE_SEGMENTS` from `src/components/brand/logoGeometry.ts`, the same geometry
`LoomStar` draws — inside a hollow gold octagon aura ring, with the 8 weave knots as a run of
gold diamonds. Gold appears here only as §2 permits (the finished star + the primary CTA);
the CTA pill is the only other gold element on the screen. §4's second allowed grid break
("the final star") is used: the medallion is centred on phone, left-aligned in the content
column on desktop.

## Gates — real output

```
$ npm run lessons:check
debt  L13 src/app/kabinet/kurs/[id]/dars/[lessonId]/page.tsx: dynamic page never calls notFound(); unknown ids return 200 (soft-404)
debt  L13 src/app/shahodatnoma/[code]/page.tsx: dynamic page never calls notFound(); unknown ids return 200 (soft-404)
debt  L19 src/features/chat/server/chat.service.ts: 263 lines (max 250); split the file
lessons-check: 0 failure(s), 3 known debt (repo)
```
(3 pre-existing baseline items, none in this slice. `git add`ed before running, because
`lessons-check` L27 reads `git ls-files` and would not see the new untracked file.)

```
$ npm test
 Test Files  112 passed (112)
      Tests  757 passed (757)
   Duration  28.76s

$ npx vitest run src/features/lab-naqsh/domain/homeLoom.test.ts
 Test Files  1 passed (1)
      Tests  17 passed (17)

$ npx tsc --noEmit
(no output, exit 0)

$ npm run build
Compiled successfully — route table emitted (full output in the run log; `/` prerendered, 103 kB shared First Load JS)

$ npx playwright test e2e/responsive.spec.ts -g "home" --reporter=line
Running 12 tests using 1 worker
[1/12] home › 375px light   … [12/12] home › 1440px dark
  12 passed (55.5s)
```
12/12 = 375/390/768/1024/1280/1440 × light+dark: single `h1`, single `main`, no horizontal
scroll, no undersized tap targets (≥40px) at ≤768, zero console/page errors, full-page
screenshots written to `e2e/screenshots/home-*.png` (gitignored).

## In-page geometry measurement (L24/L26) — measured, not eyeballed

Measured in a live page at 390 and 1440, both themes (probe script run, then deleted; dev
server on :3111 stopped with `kill $(lsof -t -i:3111)`):

| Measure | 390px | 1440px |
| :--- | :--- | :--- |
| `section` width | 306px | 643px |
| `h2` width (must be ≤ section) | 306px ✅ | 643px ✅ |
| `h2` computed font-size | 36px | 86.4px |
| primary CTA box | 198×44 | 198×52 |
| secondary CTA box | 227×44 | 227×52 |
| guarantee link box | 256×56 | 261×44 |
| `scrollWidth − innerWidth` | 0 | 0 |
| `[data-strand="glow"]` computed opacity | 0.275 | 0.275 |
| `data-track` values | `cta_diagnostic`, `cta_free_lesson` | same |

The glow opacity of 0.275 is the scrub caught mid-progress (end value 0.55, resting 0) — proof
the newly registered glow strand is actually being driven by `HomeLoomMotionImpl`.
Screenshots reviewed: `e2e/screenshots/e6-boshlash-{390,1440}-{light,dark}.png` (heading wraps
to 2 lines, medallion regular, no clipped corner text, gold-on-navy contrast readable).

## Token check (L6 / L25)

- `grep -rEn "text-\[#|bg-\[#|border-\[#" src` → no new hits; the new file contains **no** hex/rgb.
  Only `text-on-brand-surface`, `border-border-onBrand`, `bg-brand-surface`, `text-gold`,
  `bg-gold`, `border-gold`, plus `var(--gold)` / `var(--brand)` SVG strokes inside the medallion,
  exactly as `LoomStar` does.
- No Tailwind alpha modifier on a `var()` colour (the L25 trap: `bg-brand-surface/40` would emit
  nothing). Grepped the built CSS after `npm run build` (`cat .next/static/css/*.css > /tmp/all.css`):
  `bg-gold` 1, `border-gold` 1, `text-gold` 1, `text-on-brand-surface` 1, `border-border-onBrand` 1,
  `bg-brand-surface` 1, `size-40` 1, `size-56` 1, `size-2.5` 1, `min-h-11` 1, `gap-3` 1,
  `inset-\[18\%\]` 1, and the octagon utility emitted as
  `.\[clip-path\:polygon\(28\%_0\2c …\)\]{clip-path:polygon(28% 0,72% 0,…)}` — every class
  introduced by this slice is present in the built CSS (1 = emitted, 0 = silently dead).
- L26: the percentage `clip-path` octagon is used **only** on square boxes (`size-40/56`,
  `inset-[18%]`), never on the wide CTA row or the guarantee box. The heading and the guarantee
  sit in normal flow boxes; the geometry assertion above confirms the `h2` never exceeds its column.

## Semantics / a11y
`<section aria-labelledby="boshlash-title">` → `<h2 id="boshlash-title">` → `<p>` decks →
two real `<a>` CTAs (rendered by `Button` as `next/link`) → `<aside>` with an `<h3>` guarantee
heading. Semantic, no ARIA tricks, no `dangerouslySetInnerHTML`, decorative geometry is
`aria-hidden`. The guarantee link carries an `sr-only` suffix naming its destination, the same
pattern as `NarxSection`.

## What's left / risks

1. **The brief's "14 kunlik kafolat" is not what the site promises** (siteConfig says 7). I
   shipped the honest 7-day text from `siteConfig`. Owner decision needed if 14 is the new policy —
   change it in `src/lib/siteConfig.ts`, not in this component.
2. **Home no longer ends with `<NextStepCTA />`**, so the last block on `/` is `<Comparison />`
   (a comparison table with no CTA of its own) followed by the footer. `docs/CODER_AGENT_RULES.md`
   §4 says "every page ends with a next step — no dead ends". The final CTA now lives earlier in
   the page (inside the loom) rather than at the very bottom. If the owner wants both, the fix is
   to give `Comparison` a CTA row or re-add a slim `NextStepCTA` after it — deliberately not done
   here, since the task said to remove the invocation.
3. `mutedHomeStrands()`'s contract changed (glow is no longer special-cased). Only
   `HomeLoom`/`LoomStar`/`homeLoom.test.ts` consume it, all updated; `LoomStar` never applied the
   muted class to the glow circle, so the rendered star is unaffected.
4. `HomeLoomMotionImpl` glow end opacity 0.55 is copied from the `/lab/naqsh` prototype
   (`useLoomMotion.ts`) so both surfaces pulse identically; easy to tune in one place.
5. Not committed — the task did not ask for a commit/push/deploy. Changes are staged
   (`git add -A` was needed for `lessons:check` L27 to see the new file).

LESSON: A section that claims the last strand must also be wired into the motion layer — registering `{ id, strand }` alone is silently dead code if `HIDDEN_VARS`/`DRAWN_VARS` has no entry for that strand (the `continue` guard drops it, and no test notices). Check `HIDDEN_VARS[key]` exists for every strand you register, and verify the effect by reading `getComputedStyle` on `[data-strand="…"]` in the page (L24) — plus: never hardcode a commercial term (guarantee days) in a section; read it from `siteConfig`, or the final CTA will promise a better deal than the offer page (L14).
