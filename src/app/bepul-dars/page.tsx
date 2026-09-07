import type { Metadata } from "next";
import { Check, ShieldCheck, Sparkles } from "lucide-react";
import { FreeLessonForm } from "./FreeLessonForm";

export const metadata: Metadata = {
  title: "Bepul Dars — AI bilan 30 Daqiqada Mahsulot Qurish | Vibecoding.uz",
  description: "Claude Code va Cursor yordamida dasturchilarsiz ilova va botlar qurish metodikasi bilan tanishing.",
};

export default function BepulDarsPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Lesson Details */}
          <div className="space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold">
              <Sparkles className="w-4 h-4" /> Exclusive Bepul Video Dars
            </span>

            <h1 className="text-3xl md:text-5xl font-extrabold text-[var(--color-ink)] leading-tight">
              AI bilan 30 daqiqada <span className="accent-serif">haqiqiy loyiha</span> qurish metodikasi.
            </h1>

            <p className="text-base text-[var(--color-ink-muted)] leading-relaxed">
              Ushbu 30 daqiqalik intensiv darsda Ibrohim Qodirov dasturchilarsiz, faqat sun'iy intellekt agentlariga to'g mezoniy ko'rsatma berib mahsulot yaratish sir-asrorlarini ko'rsatib beradi.
            </p>

            <div className="space-y-3 pt-2">
              {[
                "Dasturchisiz MVP va Telegram bot qurishning 5 bosqichi",
                "Claude Code va Cursor bilan ishlashda eng ko'p yo'l qo'yiladigan 3 xato",
                "Kod yozmasdan to'lov tizimlarini ulayotgan real misollar",
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm font-semibold text-[var(--color-ink)]">
                  <Check className="w-5 h-5 text-[#27C93F] flex-shrink-0 mt-0.5" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-[var(--color-accent)] flex-shrink-0" />
              <div className="text-xs text-[var(--color-ink-muted)]">
                Dars to'liq bepul. Ma'lumotlaringiz xavfsiz saqlanadi va spam yuborilmaydi.
              </div>
            </div>
          </div>

          {/* Right Column: Lead Form Card / Video Preview */}
          <FreeLessonForm />

        </div>

      </div>
    </div>
  );
}
