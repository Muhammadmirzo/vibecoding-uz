import { ArrowUpRight, Check } from "lucide-react";
import { servicesCatalog } from "./servicesCatalog";
import { ServicesProcessAndFaq } from "./ServicesProcessAndFaq";
import { siteConfig } from "@/lib/siteConfig";
import { LeadCaptureForm } from "@/features/leads/ui/LeadCaptureForm";
import { Card } from "@/components/ui/Surfaces";
import { Button, Heading, Section, Container, Eyebrow } from "@/components/ui";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { PageHero } from "@/components/pages/PageHero";
import { Reveal, RevealGroup } from "@/features/motion/ui/Reveal";

function sum(value: number) { return new Intl.NumberFormat("uz-UZ").format(value) + " so'm"; }

export function ServicesPageContent() {
  const page = siteConfig.servicesPage;
  return <div className="bg-bg text-ink">
    <PageHero
      eyebrow="Agentlik xizmatlari"
      title="G'oyangizni ishlaydigan mahsulotga aylantiramiz."
      lede={page.promise}
      actions={<Button href="#taklif" size="lg">Taklif olish <ArrowUpRight className="size-4" aria-hidden="true" /></Button>}
    />
    <section className="w6c-wipe border-y border-border bg-bg-elevated">
      <Container className="py-20 sm:py-28">
        <Reveal>
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div><Eyebrow>Uch xizmat</Eyebrow><Heading className="mt-3">Nimadan boshlash mumkin?</Heading></div>
            <p className="max-w-md text-sm leading-relaxed text-ink-muted">Narxlar boshlang&apos;ich diapazon. Aniq taklif mijoz vazifasi va hajmi ko&apos;rsatilgach beriladi.</p>
          </div>
        </Reveal>
        <RevealGroup className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {servicesCatalog.offers.map((offer, index) => (
            <Card key={offer.id} className="card-glow flex flex-col">
              <div className="flex justify-between font-mono text-sm text-ink-subtle"><span>0{index + 1}</span><span>{offer.timeline}</span></div>
              <Heading as="h3" className="mt-8 text-2xl">{offer.title}</Heading>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{offer.summary}</p>
              <p className="my-6 border-y border-border py-4 font-mono text-lg font-semibold text-brand">{sum(offer.priceRange.min)}–{sum(offer.priceRange.max)}</p>
              <ul className="space-y-3 text-sm">{offer.deliverables.map(item => <li key={item} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden="true" />{item}</li>)}</ul>
              <details className="mt-auto pt-7 text-xs leading-relaxed text-ink-muted">
                <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-ink">Nima kirmaydi?</summary>
                <p className="mt-2">Mos emas: {offer.notSuitableFor.join("; ")}. Taklifga kirmaydi: {offer.excluded.join("; ")}.</p>
              </details>
            </Card>
          ))}
        </RevealGroup>
      </Container>
    </section>
    <ServicesProcessAndFaq />
    <section id="taklif" className="bg-bg-sunken">
      <Container className="grid gap-10 py-16 sm:py-24 md:grid-cols-2 md:items-center">
        <Reveal>
          <div>
            <Eyebrow>Aniq taklif</Eyebrow>
            <Heading className="mt-3">Vazifangizni birgalikda aniqlaymiz.</Heading>
            <p className="mt-4 max-w-xl text-ink-muted">Ma&apos;lumotlaringizni qoldiring, muhokama qilish uchun bog&apos;lanamiz. Telegram havolasi shundan keyin ochiladi.</p>
            <Button className="mt-8" href="#lead-form" size="lg">Bog&apos;lanish</Button>
          </div>
        </Reveal>
        <Reveal>
          <Card id="lead-form" className="scroll-mt-24">
            <LeadCaptureForm source="xizmatlar" ctaLabel="Taklif so'rash" title="Xizmat uchun aloqa qoldiring" description="Sizga mos ish hajmini muhokama qilamiz." revealUrl={page.telegramUrl} revealText="Telegram orqali davom eting." />
          </Card>
        </Reveal>
      </Container>
    </section>
    <NextStepCTA />
  </div>;
}
