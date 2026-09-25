import { ArrowDownRight, ArrowRight, CirclePlay, ShieldCheck } from "lucide-react";
import { Button, Container, GirihPattern } from "@/components/ui";
import { MagneticButton } from "@/features/motion/ui/MagneticButton";
import { TextReveal } from "@/features/motion/ui/TextReveal";
import { GirihWeave } from "@/features/motion/ui/GirihWeave";
import { CohortCountdown } from "@/components/pages/CohortCountdown";
import { siteConfig } from "@/lib/siteConfig";
import { AppPreview } from "./AppPreview";

export function HeroSection() {
  return (
    <section className="hero-section relative isolate overflow-hidden bg-bg pb-20 pt-16 sm:pb-28 sm:pt-24 lg:min-h-[760px] lg:pb-32 lg:pt-28">
      <GirihPattern className="absolute inset-0 -z-20 h-full w-full text-brand opacity-[0.055]" aria-hidden="true" />
      <div className="hero-mesh absolute inset-0 -z-10" aria-hidden="true" />
      <GirihWeave className="pointer-events-none absolute -right-32 top-20 -z-10 hidden h-[560px] w-[560px] text-brand opacity-[0.09] lg:block dark:opacity-[0.14]" />

      <Container className="grid items-center gap-14 lg:grid-cols-[1.08fr_.92fr] lg:gap-16">
        <div className="relative z-10">
          <div className="hero-signature mb-7"><span>✦</span><span>Samarkand naqshi · zamonaviy kod</span></div>
          <h1 className="max-w-4xl font-display text-[clamp(2.55rem,1.15rem+4.4vw,4.85rem)] font-semibold leading-[1.01] tracking-[-0.055em] text-ink">
            <TextReveal text="G'oyangizni" mode="load" />
            <br />
            <span className="hero-accent-line"><TextReveal text="ishlaydigan ilovaga" mode="load" baseDelay={80} /></span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
            Kod yozishni bilmasangiz ham. AI bilan 8 hafta ichida g'oyangizni muhokama qilinadigan, tekshiriladigan va e'lon qilishga tayyor mahsulotga aylantiring.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <MagneticButton strength={7}>
              <Button href="/diagnostika" data-track="hero_diagnostic" size="lg" className="hero-cta group">
                Bepul diagnostika — 2 daqiqa
                <ArrowRight className="hero-arrow size-5" aria-hidden="true" />
              </Button>
            </MagneticButton>
            <Button href="/bepul-dars" data-track="hero_free_lesson" size="lg" variant="outline" className="group">
              <CirclePlay className="size-5" aria-hidden="true" />Bepul darsga yozilish
            </Button>
          </div>
          <div className="mt-8 flex flex-col gap-3 border-t border-border pt-5 text-sm text-ink-muted sm:flex-row sm:flex-wrap sm:items-center sm:gap-7">
            <span>Keyingi guruh: <strong className="text-ink">{siteConfig.nextCohortDate}</strong></span>
            <span className="inline-flex min-h-8 items-center">
              <CohortCountdown date={siteConfig.nextCohortDate} />
            </span>
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-success" aria-hidden="true" />{siteConfig.guaranteeText}</span>
          </div>
        </div>

        <div className="hero-workbench relative mx-auto w-full max-w-xl lg:max-w-none">
          <div className="hero-orbit" aria-hidden="true"><span>Prompt</span><span>Build</span><span>Test</span></div>
          <div className="hero-app-frame">
            <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
              <div><span className="block font-mono text-[10px] uppercase text-accent">build / nonvoyxona</span><span className="mt-1 block text-sm font-semibold text-ink">Bir g'oya, to'liq foydali oqim</span></div>
              <ArrowDownRight className="size-5 text-gold" aria-hidden="true" />
            </div>
            <AppPreview compact />
          </div>
          <div className="hero-proof">
            <span className="size-2 rounded-full bg-accent" />
            <span><strong>Siz boshqarasiz</strong><small>AI tezlashtiradi, qaror sizniki</small></span>
          </div>
        </div>
      </Container>

      <a href="#goya-prompt-ilova" className="hero-scroll-cue mx-auto mt-16 flex w-fit items-center gap-2 text-xs text-ink-subtle lg:mt-10">
        <span>G'oyani ko'ring</span><ArrowDownRight className="size-4 motion-safe:animate-bounce" aria-hidden="true" />
      </a>
    </section>
  );
}
