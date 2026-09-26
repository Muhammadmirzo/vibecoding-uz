/**
 * Home page loom section 2 "Usul" (Wave E, slice E2), per
 * docs/redesign/awwwards/02-art-direction.md §1 row 2 and §2 (night canvas).
 * Renders inside <HomeLoom>, which supplies the dark bg-brand-surface canvas
 * and the sticky star; `data-lab-section="usul"` is what HomeLoomMotion
 * targets to scrub the star's diamond strand as this section scrolls by.
 *
 * Copy is real, not placeholder: explains the 3-step vibe coding method
 * where the creator architects and decides, while AI handles the syntax.
 */
export function UsulSection() {
  const steps = [
    {
      num: "01",
      title: "Muammoni aniqlash",
      desc: "Katta gʻoyani kichik, darhol sinab koʻrish mumkin boʻlgan aniq vazifaga boʻlamiz.",
    },
    {
      num: "02",
      title: "AI bilan tezkor iteratsiya",
      desc: "Claude Code va AI vositalarida sintaksis bilan vaqt yoʻqotmay, soniyalar ichida ishlaydigan prototip quramiz.",
    },
    {
      num: "03",
      title: "Qaror va sifat nazorati",
      desc: "AI variant taklif qiladi, lekin arxitektura, xavfsizlik va yakuniy qaror toʻliq sizning qoʻlingizda boʻladi.",
    },
  ];

  return (
    <section
      data-lab-section="usul"
      className="relative flex min-h-[100vh] flex-col justify-center py-24 sm:min-h-[110vh]"
    >
      <h2
        className="max-w-2xl text-balance font-display font-bold leading-[0.95] tracking-[-0.045em] text-on-brand-surface"
        style={{ fontSize: "clamp(2.25rem, 6vw, 6rem)" }}
      >
        Vibe coding: 3 ta qadamda natijaga.
      </h2>
      <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80">
        Sintaksis yodlash shart emas. Siz arxitektor va yoʻnaltiruvchisiz, AI esa tezkor ijrochi.
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.num}
            className="flex flex-col rounded-xl border border-border-onBrand/20 bg-brand-surface/40 p-6 backdrop-blur-sm"
          >
            <span className="font-mono text-sm font-semibold text-accent">{step.num}</span>
            <h3 className="mt-3 font-display text-lg font-bold text-on-brand-surface">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-on-brand-surface opacity-75">{step.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
