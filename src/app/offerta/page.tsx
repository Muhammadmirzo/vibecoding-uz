import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ommaviy Oferta | Mirzo Academy",
  description: "academy.mirzo.uz ta'lim xizmatlarini ko'rsatish bo'yicha ommaviy oferta shartnomasi.",
};

export default function OffertaPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[800px] px-5 md:px-8 space-y-8">
        <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">Ommaviy Oferta Shartnomasi</h1>
        <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-8 text-sm text-[var(--color-ink-muted)] leading-relaxed space-y-4">
          <p>Ushbu hujjat Mirzo Academy (academy.mirzo.uz) platformasi va ta'lim oluvchi o'rtasidagi rasmiy shartnoma hisoblanadi.</p>
          <h2 className="text-base font-bold text-[var(--color-ink)]">1. Shartnoma mavzusi</h2>
          <p>Ijrochi Buyurtmachiga sun'iy intellekt va Vibe Coding bo'yicha masofaviy ta'lim xizmatlarini taqdim etadi.</p>
          <h2 className="text-base font-bold text-[var(--color-ink)]">2. To'lov tartibi</h2>
          <p>Xizmatlar uchun to'lov Payme, Click yoki operator orqali 100% oldindan to'lov yoki kelishilgan 2 ga bo'lib to'lash sharti bilan amalga oshiriladi.</p>
        </div>
      </div>
    </div>
  );
}
