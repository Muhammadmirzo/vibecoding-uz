import { siteConfig } from "@/lib/siteConfig";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion";
import { Container, Eyebrow, Heading, Section } from "@/components/ui";

export function ServicesProcessAndFaq() {
  const page = siteConfig.servicesPage;
  return <>
    <section className="bg-brand py-20 text-white sm:py-28"><Container><Eyebrow className="text-gold">Xavfsiz boshlash</Eyebrow><Heading className="mt-3 max-w-2xl text-white">Qaror oldidan ko'ramiz.</Heading><ol className="mt-12 grid gap-4 md:grid-cols-3">{page.process.map((step, index) => <li key={step.title} className="rounded-xl border border-white/20 bg-white/10 p-6"><span className="font-mono text-sm text-gold">0{index + 1}</span><h3 className="mt-10 text-xl font-bold">{step.title}</h3><p className="mt-3 text-sm leading-relaxed text-white/75">{step.description}</p></li>)}</ol></Container></section>
    <Section eyebrow="Ochiq savollar" title="Avval bilish kerak." subtitle="Javob topilmasa, Telegram orqali bepul savol bering."><Accordion type="single" collapsible className="mt-8 max-w-3xl border-t border-border">{page.faq.map((item) => <AccordionItem key={item.question} value={item.question}><AccordionTrigger>{item.question}</AccordionTrigger><AccordionContent>{item.answer}</AccordionContent></AccordionItem>)}</Accordion></Section>
    <div className="sr-only">{page.trustText}</div>
  </>;
}
