import { HeroDemoPanel } from "./HeroDemoPanel";

/**
 * AWWWARDS slice 2: the hero live demo. `> ` prompt + 3 idea chips (+ a
 * free-text idea on desktop) → a short typed prompt → girih tiles fly in
 * (GSAP Flip) and assemble into a "namuna" (scripted, not real AI output)
 * mini site mock. See docs/redesign/awwwards/02-art-direction.md §6.
 *
 * SSR/no-JS renders the initial state directly: the "Onlayn do'kon" mock
 * already assembled, no animation classes involved. The interactive part
 * lives in HeroDemoPanel, shared with the home hero (see LazyHeroDemo.tsx).
 */
export function HeroDemo() {
  return (
    <section className="border-b border-white/10 py-16 sm:py-20" aria-label="Jonli namuna: g'oyadan saytga">
      <div className="mx-auto max-w-container px-5 sm:px-8">
        <h1
          className="mt-4 max-w-2xl text-balance font-display font-bold leading-[0.98] tracking-[-0.035em] text-on-brand-surface"
          style={{ fontSize: "clamp(1.75rem, 4vw, 3.5rem)" }}
        >
          Gʻoyangizni yozing — sayt shu yerda toʻqiladi.
        </h1>

        <div className="mt-10">
          <HeroDemoPanel />
        </div>
      </div>
    </section>
  );
}
