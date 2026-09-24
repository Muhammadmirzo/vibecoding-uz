import { siteConfig } from "@/lib/siteConfig";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { Container, Eyebrow, Heading, Section } from "@/components/ui";
import { Reveal, RevealGroup } from "@/features/motion/ui/Reveal";

export function ServicesProcessAndFaq() {
  const page = siteConfig.servicesPage;
  return <>
    <section className="w6c-wipe bg-brand py-20 text-white sm:py-28">
      <Container>
        <Reveal>
          <Eyebrow className="text-gold">Xavfsiz boshlash</Eyebrow>
          <Heading className="mt-3 max-w-2xl text-white">Qaror oldidan ko&apos;ramiz.</Heading>
        </Reveal>
        <RevealGroup className="mt-12 grid gap-4 md:grid-cols-3">
          {page.process.map((step, index) => (
            <article key={step.title} className="rounded-xl border border-white/20 bg-white/10 p-6 transition hover:-translate-y-1 hover:border-gold/60">
              <span className="font-mono text-sm font-bold text-gold">0{index + 1}</span>
              <h3 className="mt-10 text-xl font-bold">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-white/75">{step.description}</p>
            </article>
          ))}
        </RevealGroup>
      </Container>
    </section>
    <Section eyebrow="Ochiq savollar" title="Avval bilish kerak." subtitle="Javob topilmasa, Telegram orqali bepul savol bering.">
      <Accordion type="single" collapsible className="mt-8 max-w-3xl border-t border-border">
        {page.faq.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Section>
    <div className="sr-only">{page.trustText}</div>
  </>;
}
