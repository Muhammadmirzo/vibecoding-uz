import type { Metadata } from "next";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { LegalLayout } from "@/components/pages/PageBits";

export const metadata: Metadata = { title: "Ommaviy oferta", description: "Naqsh ta’lim xizmatlari bo‘yicha ommaviy oferta shartnomasi." };

const sections = [
  { id: "mavzu", title: "1. Shartnoma mavzusi", text: "Naqsh platformasi va ta’lim oluvchi o‘rtasidagi rasmiy shartnoma. Ijrochi qo‘llanma, video darslar va maslahat xizmatlarini taqdim etadi." },
  { id: "xizmatlar", title: "2. Xizmatlar", text: "Kurs dasturi va uning doirasidagi materiallar platformada joylashtiriladi. Materiallarni tashqariga ko‘chirish yoki qayta tarqatish taqiqlanadi." },
  { id: "tolov", title: "3. To‘lov tartibi", text: "To‘lov Payme, Click yoki operator orqali amalga oshiriladi. To‘lov miqdori va muddati ariza yoki sahifadagi shartlarda ko‘rsatiladi." },
  { id: "bekor", title: "4. Bekor qilish va qaytarish", text: "Bekor qilish va pul qaytarish shartlari alohida kafolat siyosatida ko‘rsatilgan." },
  { id: "aloqa", title: "5. Aloqa", text: "Shartnoma bo‘yicha savollar uchun sayt orqali yoki Telegram orqali bog‘lanish mumkin." },
];

export default function Page() {
  return (
    <div className="bg-bg">
      <LegalLayout eyebrow="Huquqiy hujjat" title="Ommaviy oferta shartnomasi" toc={sections.map(({ id, title }) => ({ id, label: title }))}>
        <p>Ushbu hujjat Naqsh platformasi va ta’lim oluvchi o‘rtasidagi rasmiy shartnoma hisoblanadi.</p>
        {sections.map((section) => (
          <section key={section.id} id={section.id} className="scroll-mt-24">
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
      </LegalLayout>
      <NextStepCTA />
    </div>
  );
}
