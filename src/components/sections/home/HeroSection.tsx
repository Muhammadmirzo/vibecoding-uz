import { ShieldCheck } from "lucide-react";
import { Button, Container } from "@/components/ui";
import { LazyHeroDemo } from "@/features/lab-naqsh/ui/LazyHeroDemo";
import { siteConfig } from "@/lib/siteConfig";

/**
 * Home hero (Wave E, slice E0): the owner-approved lab demo
 * ("g'oyadan saytga") on the night canvas, per
 * docs/redesign/awwwards/02-art-direction.md §1 row 0 and §6.
 *
 * The headline/subline/CTA below are plain SSR markup — no client component,
 * no motion class, nothing to hydrate before they paint, so the headline
 * (the LCP element) never waits on JS. The demo itself is loaded lazily by
 * LazyHeroDemo, which also reserves its own box size to keep CLS at 0.
 *
 * Single column, kept deliberately compact (smaller headline clamp, no
 * duplicate cohort line) so the demo's idea chips land inside the first
 * screen at 1280x800 and 1440x900, per the owner's row-0 requirement — the
 * visitor must see "you describe it, AI builds it" without scrolling. A
 * 2-column split was tried and rejected: it forces the already-owner-
 * approved DemoTerminal/DemoSiteMock 2-col split (lg:grid-cols-2, shared
 * with /lab/naqsh) into a half-width column, which crowds the chips.
 */
export function HeroSection() {
  return (
    <section className="relative bg-brand-surface pb-16 pt-14 sm:pb-20 sm:pt-16" aria-label="Bosh sahifa: g'oyadan saytga">
      <Container>
        <h1
          className="max-w-4xl text-balance font-display font-bold leading-[0.95] tracking-[-0.03em] text-on-brand-surface"
          style={{ fontSize: "clamp(2.25rem, 1.5rem + 3.6vw, 4rem)" }}
        >
          Gʻoyangizni yozing — sayt shu yerda toʻqiladi.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-on-brand-surface opacity-80 sm:text-lg">
          Kod yozishni bilmasangiz ham. AI bilan 8 hafta ichida gʻoyangizni ishlaydigan mahsulotga aylantirasiz.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button href="/diagnostika" data-track="hero_diagnostic" size="lg">
            Bepul diagnostika
          </Button>
          <Button href="/bepul-dars" data-track="hero_free_lesson" size="lg" variant="onBrand">
            Bepul darsga yozilish
          </Button>
        </div>

        <div className="mt-5 flex items-center gap-2 border-t border-border-onBrand pt-4 text-sm text-on-brand-surface opacity-80">
          <ShieldCheck className="size-4 text-success" aria-hidden="true" />
          {siteConfig.guaranteeText}
        </div>

        <div className="mt-8 sm:mt-10">
          <LazyHeroDemo />
        </div>
      </Container>
    </section>
  );
}
