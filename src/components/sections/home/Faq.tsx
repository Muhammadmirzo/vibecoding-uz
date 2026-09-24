import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Container, Section } from "@/components/ui";
import { siteConfig } from "@/lib/siteConfig";

const faqs = [
  ...siteConfig.servicesPage.faq,
  { question: "Dasturlash tajribasi kerakmi?", answer: "Yo'q. Kurs tayyor dasturlash bilimi bo'lmaganlar uchun ham mo'ljallangan. AI vositalaridan foydalanishni 1-darsdanoq ko'rsatamiz." },
  { question: "Kurslar qanday o'tadi?", answer: `${siteConfig.sessionFormat}. Jonli sessiyalar yozib olinadi va shaxsiy kabinetingizda saqlanadi.` },
  { question: "To'lovni bo'lib to'lasam bo'ladimi?", answer: "Ha. Vibe Coding Express uchun 3 oylik to'lov rejasidan foydalanishingiz mumkin; aniq summa kurs sahifasida ko'rsatilgan." },
  { question: "Kurs qaysi tilda?", answer: "Darslar, topshiriqlar va izohlar O'zbek tilida beriladi. Texnik atamalar kerak bo'lganda tushuntiriladi." },
];

export function Faq() {
  return <Section pattern={false} className="bg-bg-sunken"><Container><div className="max-w-2xl"><p className="mb-4 text-sm font-semibold text-brand">Savol-javob</p><h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Bilishingiz kerak bo'lgan narsa.</h2></div><div className="mt-10 max-w-3xl rounded-2xl border border-border bg-bg-elevated px-5"><Accordion type="single" collapsible>{faqs.map((faq, index) => <AccordionItem key={faq.question} value={`faq-${index}`}><AccordionTrigger>{faq.question}</AccordionTrigger><AccordionContent>{faq.answer}</AccordionContent></AccordionItem>)}</Accordion></div></Container></Section>;
}
