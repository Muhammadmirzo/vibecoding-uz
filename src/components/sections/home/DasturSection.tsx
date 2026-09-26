/**
 * Home page loom section 3 "Dastur" (Wave E, slice E3), per
 * docs/redesign/awwwards/02-art-direction.md §1 row 3 (the over-under weave,
 * "what you'll build week by week"), §3 (Unbounded 700 section titles at
 * clamp(2.25rem, 6vw, 6rem), U+02BB for oʻ/gʻ) and §7 (no identical 3-card
 * grid, no eyebrow label). Renders inside <HomeLoom>, which supplies the
 * bg-brand-surface canvas and the sticky star; `data-lab-section="dastur"` is
 * what HomeLoomMotion targets to scrub the star's weave strand as this
 * section scrolls by.
 *
 * The weave: each block of two weeks is one weft row. The thread line is drawn
 * explicitly per row (never as a `border` we then have to interrupt) and the
 * knot alternates over/under — over rows get a solid knot on an unbroken
 * line, under rows get a hollow knot with the line broken around it. That
 * alternation is the whole motif, so it lives in one place (`isOver`) rather
 * than being faked per row.
 *
 * Copy is honest (L14): the weeks come from the published Vibe Coding Express
 * roadmap via src/features/lab-naqsh/domain/curriculum.ts — no invented
 * numbers or projects. Tokens only (L6): text-on-brand-surface,
 * border-border-onBrand, the canvas from HomeLoom. No gold here — §2 gives
 * gold to the diamond strand, the finished star and the CTA only.
 */
import { DASTUR_BLOCKS } from "@/features/lab-naqsh/domain/curriculum";

/** Over-under alternation for the weft rows: even rows are on top. */
function isOver(index: number): boolean {
  return index % 2 === 0;
}

export function DasturSection() {
  return (
    <section
      data-lab-section="dastur"
      aria-labelledby="dastur-title"
      className="relative flex min-h-[100vh] flex-col justify-center py-24 sm:min-h-[110vh]"
    >
      <h2
        id="dastur-title"
        className="max-w-3xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        8 hafta. Har hafta — bitta yangi qatlam.
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80">
        Dastur ikki haftalik toʻrt qatlamdan iborat. Har qatlamda oʻz
        natijangizni qoʻlda qoʻyib chiqasiz — oxirida ular bitta jonli
        mahsulotga aylanadi.
      </p>

      <ol className="mt-12 sm:mt-16">
        {DASTUR_BLOCKS.map((block, index) => {
          const over = isOver(index);
          return (
            <li key={block.id} className="relative pt-8 sm:pt-10">
              {/* the weft thread: two segments with a gap at the knot when the
                  row passes *under*, one continuous run when it passes *over* */}
              {over ? (
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-border-onBrand" />
              ) : (
                <>
                  <span aria-hidden="true" className="absolute left-0 right-9 top-0 h-px bg-border-onBrand" />
                  <span aria-hidden="true" className="absolute right-0 top-0 w-9 h-px bg-border-onBrand" />
                </>
              )}
              {/* the knot itself: solid when the row is on top, hollow when
                  the thread is hidden behind it */}
              <span
                aria-hidden="true"
                className={
                  over
                    ? "absolute -top-[5px] left-0 size-2.5 bg-on-brand-surface"
                    : "absolute -top-[5px] left-0 size-2.5 border border-on-brand-surface bg-brand-surface"
                }
              />

              <div className="grid gap-x-6 gap-y-3 sm:grid-cols-[9rem_1fr]">
                <h3 className="font-mono text-sm font-semibold uppercase tracking-[0.08em] text-on-brand-surface sm:pt-0.5">
                  {block.label}
                </h3>

                <div>
                  <p className="font-display text-xl font-bold leading-snug tracking-[-0.02em] text-on-brand-surface sm:text-2xl">
                    {block.topics.map((topic) => topic.title).join(" · ")}
                  </p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {block.topics.map((topic) => (
                      <li
                        key={topic.weekNumber}
                        className="border border-border-onBrand px-3 py-1.5 text-sm text-on-brand-surface opacity-80"
                      >
                        {topic.project}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
