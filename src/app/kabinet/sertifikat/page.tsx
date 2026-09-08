import type { Metadata } from "next";
import Link from "next/link";
import { Award, Download, ExternalLink, ShieldCheck } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";

export const metadata: Metadata = {
  title: "Mening Sertifikatim | Mirzo Academy",
  description: "Vibe Coding Express kursini muvaffaqiyatli yakunlaganlik to'g'risidagi rasmiy sertifikat.",
};

export default function SertifikatPage() {
  const certificateCode = "VC-2026-89412";

  return (
    <div className="pt-24 pb-16 min-h-screen bg-cream">
      <KabinetNav />
      <div className="mx-auto w-full max-w-[900px] px-5 md:px-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5" /> Rasmiy Sertifikat
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-ink)]">
            Mirzo Academy Sertifikati
          </h1>
          <p className="text-xs text-[var(--color-ink-muted)]">
            Noyob kodi: <strong className="font-mono text-[var(--color-accent)]">{certificateCode}</strong>
          </p>
        </div>

        {/* Certificate Preview Card */}
        <div className="bg-[var(--color-cream-warm)] border-4 border-[var(--color-accent-line)] rounded-[var(--radius-xl)] p-8 md:p-12 text-center space-y-6 shadow-[var(--shadow-lg)] relative overflow-hidden">
          <div className="absolute top-4 right-4 text-xs font-mono text-[var(--color-ink-subtle)] flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-success" /> Verified PDF
          </div>

          <div className="font-mono text-xs font-bold text-[var(--color-accent)] uppercase tracking-widest">
            — SERTIFIKAT —
          </div>

          <div className="space-y-2">
            <div className="text-xs text-[var(--color-ink-muted)]">Ushbu sertifikat tasdiqlaydiki,</div>
            <div className="text-2xl md:text-4xl font-extrabold text-[var(--color-ink)]">
              Jamshid Alimov
            </div>
            <div className="text-xs text-[var(--color-ink-muted)]">
              "Vibe Coding Express (8 hafta)" intensiv mentorlik kursini <strong className="text-[var(--color-accent)]">9.4 / 10</strong> umumiy ball bilan muvaffaqiyatli yakunladi.
            </div>
          </div>

          <div className="pt-6 border-t border-[var(--color-border)] flex items-center justify-between text-xs font-mono text-[var(--color-ink-subtle)]">
            <div>Berilgan sana: 07.09.2026</div>
            <div>Instruktor: Mirzo</div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button className="btn-primary h-12 px-6 rounded-[var(--radius-md)] text-xs font-semibold inline-flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> PDF formatida yuklab olish
          </button>
          <Link href={`/shahodatnoma/${certificateCode}`}>
            <button className="btn-secondary h-12 px-6 rounded-[var(--radius-md)] text-xs font-semibold inline-flex items-center justify-center gap-2 w-full sm:w-auto">
              <ExternalLink className="w-4 h-4 text-[var(--color-accent)]" /> Ommaviy tekshiruv havolasi
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
