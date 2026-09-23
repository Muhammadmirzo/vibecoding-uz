import type { Metadata } from "next";
import { ShieldCheck, XCircle } from "lucide-react";
import { siteConfig } from "@/lib/siteConfig";

export const metadata: Metadata = {
  title: `${siteConfig.guaranteeDays} Kunlik Pul Qaytarish Kafolati | Mirzo Academy`,
  description: "academy.mirzo.uz platformasining 100% pul qaytarish shartlari va siyosati.",
};

export default function PulQaytarishPage() {
  const guaranteeWindow = `${siteConfig.guaranteeDays} kun ichida`;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[800px] px-5 md:px-8 space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold"><ShieldCheck className="w-4 h-4" /> 100% Kafolat</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">Pul Qaytarish Siyosati (Refund Policy)</h1>
          <p className="text-xs font-mono text-[var(--color-ink-subtle)]">Oxirgi yangilanish: 2026-yil 7-sentyabr</p>
        </div>
        <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-8 space-y-6 text-sm text-[var(--color-ink-muted)] leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">1. Kafolat shartlari</h2>
            <p>Mirzo Academy (academy.mirzo.uz) platformasida ta&apos;lim sifatiga 100% ishonamiz. {siteConfig.guaranteeText}. Agar siz kursga yozilib, birinchi 2 modulni to&apos;liq yakunlasangiz, barcha uy vazifalarini topshirsangiz va shunda ham amaliy foyda ko&apos;rmaganingizni his qilsangiz — kurs kirish havolasi ochilganidan keyin <strong>{guaranteeWindow}</strong> to&apos;lagan pulingizni 100% qaytarib beramiz.</p>
          </section>
          <section className="space-y-2">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">2. Pulni qaytarish tartibi</h2>
            <p>Pulni qaytarish bo&apos;yicha arizangizni Telegram orqali operatsiyalar bo&apos;limiga yuborishingiz kifoya. Arizangiz 24 soat ichida ko&apos;rib chiqiladi va to&apos;lov Click, Payme yoki bank kartangizga 3 bank kuni ichida qaytariladi.</p>
          </section>
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-[var(--color-ink)]">3. Qanday hollarda qaytarilmaydi</h2>
            <ul className="space-y-2">
              {["Muddat o'tgan holatlar.", "2 tadan ortiq modul o'zlashtirilgan holatlar.", "Kurs qoidalariga zid ravishda uy vazifalari topshirilmagan holatlar."].map((item) => <li key={item} className="flex items-start gap-2"><XCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--color-accent)]" />{item}</li>)}
            </ul>
          </section>
          <LinkToTerms />
        </div>
      </div>
    </div>
  );
}

function LinkToTerms() {
  return <a href={siteConfig.guaranteeTermsUrl} className="inline-flex text-xs font-semibold text-[var(--color-accent)] underline underline-offset-4">Kafolat shartlarini to&apos;liq o&apos;qish</a>;
}
