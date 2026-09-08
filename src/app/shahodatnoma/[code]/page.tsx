import type { Metadata } from "next";
import { ShieldCheck, Award } from "lucide-react";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Sertifikat Tekshiruvi ${code} | Mirzo Academy`,
    description: "Sertifikatning haqiqiyligini ommaviy tekshirish sahifasi.",
  };
}

export default async function CertificateVerificationPage({ params }: Props) {
  const { code } = await params;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-[var(--color-cream)]">
      <div className="mx-auto w-full max-w-[700px] px-5 md:px-8 space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-success bg-success-soft px-3 py-1 rounded-full border border-success-line">
            Haqiqiy Sertifikat (Verified)
          </span>
          <h1 className="text-3xl font-extrabold text-[var(--color-ink)]">
            Sertifikat Tekshiruvi
          </h1>
          <p className="text-xs font-mono text-[var(--color-accent)] font-bold">
            Kod: {code}
          </p>
        </div>

        <div className="bg-[var(--color-cream-warm)] border border-[var(--color-border-strong)] rounded-[var(--radius-xl)] p-8 text-left space-y-4 shadow-[var(--shadow-md)] text-xs text-[var(--color-ink-muted)]">
          <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
            <span className="font-bold text-[var(--color-ink)]">Egasining ismi:</span>
            <span className="font-semibold text-[var(--color-ink)]">Jamshid Alimov</span>
          </div>
          <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
            <span className="font-bold text-[var(--color-ink)]">Kurs nomi:</span>
            <span className="font-semibold text-[var(--color-accent)]">Vibe Coding Express (8 hafta)</span>
          </div>
          <div className="flex justify-between border-b border-[var(--color-border)] pb-3">
            <span className="font-bold text-[var(--color-ink)]">Umumiy o'rtacha ball:</span>
            <span className="font-mono font-bold text-[var(--color-ink)]">9.4 / 10</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-[var(--color-ink)]">Berilgan sana:</span>
            <span className="font-mono">07.09.2026</span>
          </div>
        </div>

      </div>
    </div>
  );
}
