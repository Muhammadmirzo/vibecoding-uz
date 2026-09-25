import { Container, Section } from "@/components/ui/Layout";
import { FaqDisclosure } from "@/components/ui/FaqDisclosure";
import { siteConfig } from "@/lib/siteConfig";

const faqs = [
  { question: "Dasturlash tajribasi kerakmi?", answer: "Yo'q. Kurs tayyor dasturlash bilimi bo'lmaganlar uchun ham mo'ljallangan. AI vositalaridan foydalanishni 1-darsdanoq ko'rsatamiz." },
  { question: "Kurslar qanday o'tadi?", answer: `${siteConfig.sessionFormat}. Jonli sessiyalar yozib olinadi va shaxsiy kabinetingizda saqlanadi.` },
  { question: "To'lovni bo'lib to'lasam bo'ladimi?", answer: "Ha. Vibe Coding Express uchun 3 oylik to'lov rejasidan foydalanishingiz mumkin; aniq summa kurs sahifasida ko'rsatiladi." },
  { question: "Kurs qaysi tilda?", answer: "Darslar, topshiriqlar va izohlar O'zbek tilida beriladi. Texnik atamalar kerak bo'lganda tushuntiriladi." },
];

export function Faq() {
  return (
    <Section pattern={false} className="faq-section bg-bg-sunken">
      <Container>
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-semibold text-brand">Savol-javob</p>
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Bilishingiz kerak bo'lgan narsa.</h2>
        </div>
        <FaqDisclosure items={faqs} />
      </Container>
    </Section>
  );
}
