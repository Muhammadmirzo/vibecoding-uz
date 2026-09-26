/**
 * Home page loom section 2 "Usul" (Wave E, slice E2), per
 * docs/redesign/awwwards/02-art-direction.md §1 row 2, §2 (night canvas) and
 * §7 ("identical 3-card grids" are on the remove list). Renders inside
 * <HomeLoom>, which supplies the dark bg-brand-surface canvas and the sticky
 * star; `data-lab-section="usul"` is what HomeLoomMotion targets to scrub the
 * star's diamond strand as this section scrolls by.
 *
 * The three steps are a vertical numbered sequence — a thin thread down the
 * left with a gold diamond knot per step — not three identical boxed cards.
 * Text only: no card, no border, no backdrop-blur.
 *
 * Copy is honest (L14): no invented numbers, no "soniyalar ichida"-style speed
 * claims we can't prove. Display text uses U+02BB (oʻ/gʻ) so the letters stay
 * in Unbounded/Onest instead of falling back (§3).
 */
const STEPS = [
  {
    num: "01",
    title: "Muammoni kichraytirish",
    desc: "Katta gʻoyani darhal koʻrinadigan va tekshiriladigan vazifaga boʻlamiz.",
  },
  {
    num: "02",
    title: "AI bilan tez iteratsiya",
    desc: "Claude Code yordamida sintaksisga sarflanadigan vaqt oʻrniga yoʻnaltirishga ketadi.",
  },
  {
    num: "03",
    title: "Qaror sizning",
    desc: "AI variantlar taklif qiladi. Arxitektura, xavfsizlik va yakuniy qaror sizga qoladi.",
  },
] as const;

export function UsulSection() {
  return (
    <section
      data-lab-section="usul"
      className="relative flex min-h-[100vh] flex-col justify-center py-24 sm:min-h-[110vh]"
    >
      <h2
        className="max-w-2xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        Avval gʻoya, keyin sintaksis.
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80">
        Sintaksisni yodlash shart emas. Siz arxitektor va yoʻnaltiruvchisiz, AI esa tezkor ijrochi — uch qadam
        bor.
      </p>

      <ol className="relative mt-12 sm:mt-16">
        {/* one continuous thread down the whole list, with a gold diamond knot
            per step sitting on it (the strand this section claims, §1 row 2) */}
        <span aria-hidden="true" className="absolute inset-y-0 left-[10px] w-px bg-border-onBrand sm:left-[12px]" />

        {STEPS.map((step) => (
          <li
            key={step.num}
            className="grid grid-cols-[1.25rem_1fr] items-start gap-x-4 pb-10 last:pb-0 sm:grid-cols-[1.5rem_auto_1fr] sm:gap-x-6"
          >
            <span aria-hidden="true" className="row-span-2 flex flex-col items-center pt-2.5 sm:row-span-1 sm:pt-4">
              <span className="size-1.5 shrink-0 rotate-45 bg-gold" />
            </span>

            <span
              aria-hidden="true"
              className="col-start-2 row-start-1 font-display text-[clamp(2.5rem,8vw,3.25rem)] font-bold leading-[0.85] tracking-[-0.05em] text-on-brand-surface opacity-70"
            >
              {step.num}
            </span>

            <div className="col-start-2 row-start-2 mt-1 max-w-xl sm:col-start-3 sm:row-start-1 sm:mt-0 sm:pt-2">
              <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-on-brand-surface sm:text-2xl">
                {step.title}
              </h3>
              <p className="mt-2 text-base leading-relaxed text-on-brand-surface opacity-75">{step.desc}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
