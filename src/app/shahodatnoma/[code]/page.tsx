import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";
import { NextStepCTA } from "@/components/ui/NextStepCTA";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  return {
    title: `Sertifikat Tekshiruvi ${code} | Naqsh`,
    description: "Sertifikatning haqiqiyligini ommaviy tekshirish sahifasi.",
  };
}

export default async function CertificateVerificationPage({ params }: Props) {
  const { code } = await params;

  return (
    <div className="pt-28 pb-20 min-h-screen bg-bg">
      <div className="mx-auto w-full max-w-[700px] px-5 md:px-8 space-y-6 text-center">
        
        <div className="w-16 h-16 rounded-full bg-success-soft text-success mx-auto flex items-center justify-center">
          <ShieldCheck className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-success bg-success-soft px-3 py-1 rounded-full border border-success-line">
            Haqiqiy Sertifikat (Verified)
          </span>
          <h1 className="text-3xl font-extrabold text-ink">
            Sertifikat Tekshiruvi
          </h1>
          <p className="text-xs font-mono text-accent font-bold">
            Kod: {code}
          </p>
        </div>

        <div className="bg-bg-elevated border border-border-strong rounded-[var(--radius-xl)] p-8 text-left space-y-4 shadow-[var(--shadow-md)] text-xs text-ink-muted">
          <div className="flex justify-between border-b border-border pb-3">
            <span className="font-bold text-ink">Egasining ismi:</span>
            <span className="font-semibold text-ink">Jamshid Alimov</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="font-bold text-ink">Kurs nomi:</span>
            <span className="font-semibold text-accent">Vibe Coding Express (8 hafta)</span>
          </div>
          <div className="flex justify-between border-b border-border pb-3">
            <span className="font-bold text-ink">Umumiy o'rtacha ball:</span>
            <span className="font-mono font-bold text-ink">9.4 / 10</span>
          </div>
          <div className="flex justify-between">
            <span className="font-bold text-ink">Berilgan sana:</span>
            <span className="font-mono">07.09.2026</span>
          </div>
        </div>
        <NextStepCTA title="Siz ham amaliyotchi bo‘ling" />
      </div>
    </div>
  );
}
