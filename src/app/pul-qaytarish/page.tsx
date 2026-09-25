import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/siteConfig";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { LegalLayout } from "@/components/pages/PageBits";

export const metadata: Metadata = { title: `${siteConfig.guaranteeDays} kunlik pul qaytarish kafolati`, description: "Kursga qabul qilishdan keyin pul qaytarish shartlari va tartibi." };

const toc = [
  { id: "qachon", label: "1. Qachon qaytariladi?" },
  { id: "tartib", label: "2. Qaytarish tartibi" },
  { id: "istisno", label: "3. Qachon qaytarilmaydi?" },
];

export default function Page() {
  return (
    <div className="bg-bg">
      <LegalLayout
        eyebrow="Kafolat siyosati"
        title="Pul qaytarish shartlari"
        updated="Oxirgi yangilanish: 7-sentyabr 2026"
        toc={toc}
      >
        <section id="qachon" className="scroll-mt-24">
          <h2>1. Qachon qaytariladi?</h2>
          <p>{siteConfig.guaranteeText}. Kurs kirish havolasi ochilgandan keyin {siteConfig.guaranteeDays} kun ichida, birinchi 2 modulni yakunlab amaliy foyda ko‘rmagan bo‘lsangiz, ariza berishingiz mumkin.</p>
        </section>
        <section id="tartib" className="scroll-mt-24">
          <h2>2. Qaytarish tartibi</h2>
          <p>Arizangizni Telegram orqali operatsiyalar bo‘limiga yuboring. Ariza ko‘rib chiqilgach, to‘lov usuli va bank hisobingizga qaytarish tartibi tasdiqlanadi.</p>
        </section>
        <section id="istisno" className="scroll-mt-24">
          <h2>3. Qaysi holatlarda qaytarilmaydi?</h2>
          <ul>
            <li>Muddat o‘tgan holatlar.</li>
            <li>Kurs qoidalariga zid ravishda topshiriq bajarilmagan holatlar.</li>
          </ul>
        </section>
        <p><Link href="/offerta">Ommaviy ofertani o‘qish</Link></p>
      </LegalLayout>
      <NextStepCTA />
    </div>
  );
}
