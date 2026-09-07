import type { Metadata } from "next";
import { Award, CheckCircle2, Star } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";

export const metadata: Metadata = {
  title: "Baholar va Modul Reytingi | Mirzo Academy",
  description: "Talabaning har bir modul bo'yicha baholari, mentor izohlari va guruh reytingi.",
};

export default function BaholarPage() {
  const grades = [
    { module: "1-Modul: Vibe Coding va Prompt Injiniring", score: "9.5 / 10", status: "A'lo (Approved)", note: "Prompter va vazifa qo'yish mukammal" },
    { module: "2-Modul: Claude Code & Cursor sozlash", score: "9.0 / 10", status: "A'lo (Approved)", note: "Atrof-muhit to'g'ri sozlandi" },
    { module: "3-Modul: Tailwind CSS & UI Komponentlar", score: "9.8 / 10", status: "A'lo (Approved)", note: "Design system tokenlari to'g'ri qo'llanilgan" },
    { module: "4-Modul: PostgreSQL & Drizzle ORM", score: "Kutilmoqda", status: "Tekshirilmoqda", note: "Uy vazifasi topshirilgan" },
  ];

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <KabinetNav />
      <div className="mx-auto w-full max-w-[1000px] px-5 md:px-8 space-y-6">
        
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5" /> Modul Baholash Varaqasi
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-ink)]">
            Baholar va Reyting
          </h1>
        </div>

        <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-6 space-y-4 shadow-[var(--shadow-sm)]">
          <div className="flex items-center justify-between text-xs font-mono border-b border-[var(--color-border)] pb-3">
            <span>Umumiy O'rtacha Ball: <strong className="text-[var(--color-accent)]">9.4 / 10</strong></span>
            <span>Min. Sertifikat bali: 8.0</span>
          </div>

          <div className="space-y-3">
            {grades.map((g, i) => (
              <div key={i} className="p-4 rounded-[var(--radius-lg)] bg-[var(--color-cream)] border border-[var(--color-border)] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="font-bold text-[var(--color-ink)]">{g.module}</div>
                  <div className="text-[var(--color-ink-muted)]">{g.note}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-mono font-bold text-[var(--color-accent)] flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-current" /> {g.score}
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-[#27C93F]/15 text-[#27C93F] font-mono font-semibold">
                    {g.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
