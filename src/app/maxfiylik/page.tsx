import type { Metadata } from "next";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { LegalLayout } from "@/components/pages/PageBits";

export const metadata: Metadata = { title: "Maxfiylik siyosati", description: "Naqsh foydalanuvchilarining ma’lumotlari va ularni qanday qo‘llanishiga oid siyosat." };

const toc = [
  { id: "yigiladigan", label: "1. Yig‘iladigan ma’lumotlar" },
  { id: "foydalanish", label: "2. Foydalanish va himoya" },
  { id: "uchinchi", label: "3. Uchinchi shaxslar" },
  { id: "analitika", label: "4. Birinchi tomon analitikasi" },
  { id: "boglanish", label: "5. Bog‘lanish" },
];

export default function Page() {
  return (
    <div className="bg-bg">
      <LegalLayout eyebrow="Maxfiylik" title="Maxfiylik siyosati" toc={toc}>
        <p>Biz foydalanuvchilar ma’lumotlarini qadrlaymiz. Bu siyosat qanday ma’lumot yig‘ilishi va ishlatilishini tushuntiradi.</p>
        <section id="yigiladigan" className="scroll-mt-24">
          <h2>1. Yig‘iladigan ma’lumotlar</h2>
          <p>Ism, telefon raqami, Telegram foydalanuvchi nomi va diagnostika javoblari ta’lim xizmatlarini ko‘rsatish hamda aloqa uchun saqlanadi.</p>
        </section>
        <section id="foydalanish" className="scroll-mt-24">
          <h2>2. Foydalanish va himoya</h2>
          <p>Ma’lumotlar faqat xizmat sifatini yaxshilash, texnik muammolarni bartaraf etish va qonuniy majburlarni bajarish uchun ishlatiladi. Ular maxfiylikni ta’minlash choralari bilan saqlanadi.</p>
        </section>
        <section id="uchinchi" className="scroll-mt-24">
          <h2>3. Uchinchi shaxslar</h2>
          <p>Biz ma’lumotni ruxsatsiz sotmaymiz yoki marketing uchun uchinchi shaxslarga bermaymiz. Qonun hujjatlarida ko‘rsatilgan holatlar bundan mustasno.</p>
        </section>
        <section id="analitika" className="scroll-mt-24">
          <h2>4. Birinchi tomon analitikasi</h2>
          <p>Saytning birinchi tomon analitikasi sahifa ko‘rilishi, sessiya, manba va konversiya hodisalarini o‘lchaydi. Biz IP, telefon yoki emailni analitika hodisalariga yozmaymiz; tashrifchi cookie tokeni faqat SHA-256 ko‘rinishida saqlanadi. Uchinchi tomon analitika skriptlari ishlatilmaydi. Brauzeringizning Do Not Track yoki Global Privacy Control sozlamasi yoqiqsa, tracker hech narsa yubormaydi.</p>
        </section>
        <section id="boglanish" className="scroll-mt-24">
          <h2>5. Bog‘lanish</h2>
          <p>Savollaringiz uchun sayt orqali yoki Telegram orqali biz bilan bog‘lanishingiz mumkin.</p>
        </section>
      </LegalLayout>
      <NextStepCTA />
    </div>
  );
}
