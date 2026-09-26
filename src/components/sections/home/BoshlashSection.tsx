/**
 * Home page loom section 6 "Boshlash" (Wave E, slice E6) — the completion of
 * the star, per docs/redesign/awwwards/02-art-direction.md §1 row 6 ("Boshlash |
 * the gold glow | clear next step (diagnostika test), no trap"), §2 (Gold is
 * permitted for exactly three things, and this is one of them: "the diamond
 * strand, the finished star and the primary CTA"), §3 (Unbounded 700 section
 * title at clamp(2.25rem, 6vw, 6rem), U+02BB for oʻ/gʻ) and §7 (no eyebrow
 * label, no invented numbers, no gradient blobs).
 *
 * Renders inside <HomeLoom>, which supplies the bg-brand-surface canvas and the
 * sticky star. `data-lab-section="boshlash"` is what HomeLoomMotion targets to
 * raise the star's gold halo (`data-strand="glow"`) as this section scrolls by;
 * { id: "boshlash", strand: "glow" } in HOME_LOOM_SECTIONS is what completes
 * the registry, so `mutedHomeStrands()` returns [] — the star is fully woven
 * and nothing is left as a faint guide.
 *
 * The motif: the finished star's aura, restated as geometry. A square medallion
 * carries the 8-point star (the same girih polygon LoomStar draws) inside two
 * concentric gold octagon rings, with the 8 weave knots as a run of small gold
 * diamonds around it. §4 allows exactly two grid breaks — the hero headline and
 * this final star — so the medallion is centred and the star is allowed to be
 * larger than the text column.
 *
 * L26: the octagon `clip-path` polygons live only on the square medallion and
 * the square knot boxes. Nothing percentage-clipped is ever placed on a wide,
 * short box (the two CTA pills are pills, not polygons).
 *
 * Tokens only (L6/L25): text-on-brand-surface, border-border-onBrand,
 * bg-brand-surface, text-gold, bg-gold, border-gold, and the SVG star's
 * `var(--gold)` / `var(--brand)` strokes as in LoomStar. No hex, no rgb, and no
 * Tailwind alpha modifier on a var() colour.
 *
 * Honest copy (L14): the guarantee is read from `siteConfig` — the same single
 * source of truth NarxSection uses — instead of a hand-typed day count, so
 * this section can never promise a window the offer page contradicts. The
 * primary CTA is the real free diagnostic, the secondary is the real free
 * lesson; neither is a dead end and no discount or scarcity is invented.
 */
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LOGO_DIAMOND, LOGO_SQUARE_SEGMENTS, LOGO_VIEWBOX } from "@/components/brand/logoGeometry";
import { cn } from "@/components/ui/utils";
import { siteConfig } from "@/lib/siteConfig";

/** Cut-corner square = regular octagon. Underscores are Tailwind's for spaces. */
const OCTAGON =
  "[clip-path:polygon(28%_0,72%_0,100%_28%,100%_72%,72%_100%,28%_100%,0_72%,0_28%)]";

/**
 * The completed star: the 8-point girih mark (square segments + diamond, the
 * single source of truth in logoGeometry) inside a gold aura. Purely decorative
 * (`aria-hidden`), and drawn with SVG stroke tokens exactly like LoomStar so it
 * reads as the same mark the loom column has been weaving.
 */
function GlowMedallion() {
  return (
    <div aria-hidden="true" className="relative flex justify-center lg:justify-start">
      <div className="relative size-40 sm:size-56">
        {/* outer aura ring — a hollow octagon, offset so both rings stay visible */}
        <div className={cn("absolute inset-0 p-px bg-gold", OCTAGON)}>
          <div className={cn("h-full w-full p-px bg-brand-surface", OCTAGON)} />
        </div>
        {/* inner solid plate the star sits on */}
        <div
          className={cn(
            "absolute inset-[18%] flex items-center justify-center bg-gold",
            OCTAGON
          )}
        >
          <div className={cn("flex h-full w-full items-center justify-center bg-brand-surface", OCTAGON)}>
            <svg viewBox={LOGO_VIEWBOX} width="76%" height="76%" fill="none" focusable="false">
              <path d={LOGO_DIAMOND} fill="var(--gold)" fillOpacity="0.85" />
              <path d={LOGO_DIAMOND} stroke="var(--gold)" strokeWidth={0.6} strokeLinejoin="miter" />
              <g stroke="var(--brand)" strokeWidth={0.6} strokeLinejoin="miter">
                {LOGO_SQUARE_SEGMENTS.map((points) => (
                  <polyline key={points} points={points} />
                ))}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

/** The 8 weave knots of the finished star, as a run of gold diamonds. */
function GlowKnots() {
  return (
    <span aria-hidden="true" className="mt-10 flex flex-wrap items-center gap-2 sm:mt-14 sm:gap-3">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} className="block size-2.5 shrink-0 rotate-45 bg-gold" />
      ))}
    </span>
  );
}

export function BoshlashSection() {
  return (
    <section
      data-lab-section="boshlash"
      aria-labelledby="boshlash-title"
      className="relative flex min-h-[100vh] flex-col justify-center py-24 sm:min-h-[110vh]"
    >
      <h2
        id="boshlash-title"
        className="max-w-3xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        Gʻoyangizni bugunoq boshlang.
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80">
        2 daqiqalik diagnostika orqali oʻzingizga mos dastur va boshlash darajasini aniqlang.
        Hech narsa yuklamaysdi: savollarga javob berasiz, natija va keyingi qadam
        esa oʻzingizga koʻrinib turadi.
      </p>

      <div className="mt-12 sm:mt-16">
        <GlowMedallion />
        <GlowKnots />
      </div>

      {/* §1 row 6: the clear next step, no trap. The primary CTA is the one gold
          action on the page (§2), the secondary is a real, equally free path. */}
      <div className="mt-12 flex flex-col items-start gap-4 sm:mt-16 sm:flex-row sm:flex-wrap sm:items-center sm:gap-6">
        <Button href="/diagnostika" data-track="cta_diagnostic" size="lg">
          Bepul diagnostika
        </Button>
        <Button href="/bepul-dars" data-track="cta_free_lesson" size="lg" variant="onBrand">
          Bepul darsga yozilish
        </Button>
      </div>

      {/* the no-risk guarantee, straight from siteConfig so the day count can
          never drift from the offer page and /pul-qaytarish (L14) */}
      <aside className="mt-14 max-w-2xl border border-border-onBrand p-6 sm:mt-16 sm:p-8">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="block size-2.5 shrink-0 rotate-45 bg-gold" />
          <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-gold sm:text-2xl">
            {siteConfig.guaranteeText}
          </h3>
        </div>
        <p className="mt-4 text-base leading-relaxed text-on-brand-surface opacity-80">
          {siteConfig.guaranteeSummary}
        </p>
        <Link
          href={siteConfig.guaranteeTermsUrl}
          className="link-underline mt-2 inline-flex min-h-11 items-center font-semibold text-on-brand-surface decoration-1 underline-offset-4 hover:underline"
        >
          Kafolat shartlarini oʻqib chiqing
          <span className="sr-only"> — pul qaytarish kafolati shartlari sahifasi</span>
        </Link>
      </aside>
    </section>
  );
}
