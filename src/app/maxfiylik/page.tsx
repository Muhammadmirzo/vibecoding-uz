import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Maxfiylik Siyosati | Vibecoding.uz",
  description: "Foydalanuvchilarning shaxsiy ma'lumotlarini himoya qilish siyosati.",
};

export default function MaxfiylikPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[800px] px-5 md:px-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">Maxfiylik Siyosati (Privacy Policy)</h1>
        <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-8 text-sm text-[var(--color-ink-muted)] leading-relaxed space-y-4">
          <p>Biz sizning shaxsiy ma'lumotlaringiz maxfiyligini qadrlaymiz. Ushbu siyosat qanday ma'lumotlar yig'ilishi va ishlatilishini tushuntiradi.</p>
          <h2 className="text-base font-bold text-[var(--color-ink)]">1. Yig'iladigan ma'lumotlar</h2>
          <p>Ismingiz, telefon raqamingiz, Telegram foydalanuvchi nomingiz va kviz javoblaringiz faqat ta'lim xizmatlarini ko'rsatish va aloqa uchun saqlanadi.</p>
          <h2 className="text-base font-bold text-[var(--color-ink)]">2. Uchinchi shaxslarga berilmaslik</h2>
          <p>Ma'lumotlaringiz hech qachon uchinchi shaxslarga sotilmaydi yoki topshirilmaydi.</p>
        </div>
      </div>
    </div>
  );
}
