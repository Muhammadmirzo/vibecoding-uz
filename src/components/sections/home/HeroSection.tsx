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
 */
export function HeroSection() {
  return (
    <section className="relative bg-brand-surface pb-16 pt-16 sm:pb-20 sm:pt-24" aria-label="Bosh sahifa: g'oyadan saytga">
      <Container>
        <h1
          className="max-w-4xl text-balance font-display font-bold leading-[0.9] tracking-[-0.045em] text-on-brand-surface"
          style={{ fontSize: "clamp(2.75rem, 2rem + 6vw, 7.5rem)" }}
        >
          Gʻoyangizni yozing — sayt shu yerda toʻqiladi.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-on-brand-surface opacity-80 sm:text-xl">
          Kod yozishni bilmasangiz ham. AI bilan 8 hafta ichida g&apos;oyangizni ishlaydigan mahsulotga aylantirasiz.
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Button href="/diagnostika" data-track="hero_diagnostic" size="lg">
            Bepul diagnostika
          </Button>
          <Button href="/bepul-dars" data-track="hero_free_lesson" size="lg" variant="onBrand">
            Bepul darsga yozilish
          </Button>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/15 pt-5 text-sm text-on-brand-surface sm:flex-row sm:gap-7">
          <span>
            <span className="opacity-80">Keyingi guruh:</span> <strong>{siteConfig.nextCohortDate}</strong>
          </span>
          <span className="flex items-center gap-2 opacity-80">
            <ShieldCheck className="size-4 text-success" aria-hidden="true" />
            {siteConfig.guaranteeText}
          </span>
        </div>

        <div className="mt-12 sm:mt-16">
          <LazyHeroDemo />
        </div>
      </Container>
    </section>
  );
}
