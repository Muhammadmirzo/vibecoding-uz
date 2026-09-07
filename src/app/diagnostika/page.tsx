import { DiagnosticQuiz } from "@/features/quiz/DiagnosticQuiz";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "2-Daqiqalik Diagnostika Kvizi | Mirzo Academy",
  description: "9 ta tezkor savol orqali maqsadingizga mos keluvchi AI va Vibe Coding kursini aniqlang.",
};

export default function DiagnostikaPage() {
  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[1360px] px-5 md:px-8 lg:px-10">
        
        <div className="text-center max-w-[640px] mx-auto mb-10 space-y-3">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--radius-md)] border border-[var(--color-accent-line)] bg-[var(--color-cream-warm)] text-[12px] tracking-wider text-[var(--color-accent)] uppercase font-mono font-bold">
            2 daqiqalik test · 9 savol · bepul
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--color-ink)]">
            Qaysi kurs maqsadingizga <span className="accent-serif">mos keladi?</span>
          </h1>
          <p className="text-sm text-[var(--color-ink-muted)]">
            To'g'ri ta'lim yo'nalishini aniqlash uchun quyidagi savollarga samimiy javob bering.
          </p>
        </div>

        <DiagnosticQuiz />

      </div>
    </div>
  );
}
