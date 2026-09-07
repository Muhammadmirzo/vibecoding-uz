import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "7 Kunlik Pul Qaytarish Kafolati | Vibecoding.uz",
  description: "Vibecoding.uz platformasining 100% pul qaytarish shartlari va siyosati.",
};

export default function PulQaytarishPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[800px] px-5 md:px-8 space-y-8">
        
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold">
            <ShieldCheck className="w-4 h-4" /> 100% Kafolat
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">
            Pul Qaytarish Siyosati (Refund Policy)
          </h1>
          <p className="text-xs font-mono text-[var(--color-ink-subtle)]">
            Oxirgi yangilanish: 2026-yil 7-sentyabr
          </p>
        </div>

        <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-8 space-y-6 text-sm text-[var(--color-ink-muted)] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">1. Kafolat shartlari</h2>
            <p>
              Vibecoding.uz platformasida ta'lim sifatiga 100% ishonamiz. Agar siz kursga yozilib, birinchi 2 modulni to'liq yakunlasangiz, barcha uy vazifalarini topshirsangiz va shunda ham amaliy foyda ko'rmaganingizni his qilsangiz — kurs kirish havolasi ochilganidan keyin <strong>7 kun ichida</strong> to'lagan pulingizni 100% qaytarib beramiz.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">2. Pulni qaytarish tartibi</h2>
            <p>
              Pulni qaytarish bo'yicha arizangizni Telegram orqali operatsiyalar bo'limiga yuborishingiz kifoya. Arizangiz 24 soat ichida ko'rib chiqiladi va to'lov Click, Payme yoki bank kartangizga 3 bank kuni ichida qaytariladi.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">3. Istisnolar</h2>
            <p>
              7 kunlik muddat o'tgandan keyin yoki 2 tadan ortiq modul o'zlashtirilgan holatda pul qaytarilmaydi.
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
