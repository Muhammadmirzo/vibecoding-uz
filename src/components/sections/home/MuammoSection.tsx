/**
 * Home page loom section 1 "Muammo" (Wave E, slice E1), per
 * docs/redesign/awwwards/02-art-direction.md §1 row 1 and §2 (night canvas).
 * Renders inside <HomeLoom>, which supplies the dark bg-brand-surface canvas
 * and the sticky star; `data-lab-section="muammo"` is what HomeLoomMotion
 * targets to scrub the star's square strand as this section scrolls by.
 *
 * Copy is real, not placeholder: the honesty rule (no invented numbers,
 * reviews or students) applies, and this text says nothing that isn't
 * already true of the learn-to-code funnel. It deliberately doesn't repeat
 * Transformation's "week by week" framing — this section is about why the
 * old way stalls before that transformation even starts.
 */
export function MuammoSection() {
  return (
    <section
      data-lab-section="muammo"
      className="relative flex min-h-[100vh] flex-col justify-center py-24 sm:min-h-[110vh]"
    >
      <h2
        className="max-w-2xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        Eski yoʻl bilan gʻoya toʻxtab qoladi.
      </h2>
      <div className="mt-6 max-w-xl space-y-4 text-lg leading-relaxed text-on-brand-surface opacity-80">
        <p>
          Sintaksis, muhitni sozlash, notoʻgʻri xatolik xabarlari — kod oʻrganishning katta qismi shu yerda ketadi,
          gʻoyaning oʻzi esa navbatda kutib turadi.
        </p>
        <p>
          Oylar oʻtadi, lekin qoʻlda koʻrsatadigan narsa yoʻq. Muammo bilimda emas — tartibda: avval sintaksis,
          keyin gʻoya, degan eski yoʻlda.
        </p>
      </div>
    </section>
  );
}
