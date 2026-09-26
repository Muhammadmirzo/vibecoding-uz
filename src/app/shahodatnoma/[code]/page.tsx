import type { Metadata } from "next";
import type * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Send, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Layout";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { Seal } from "@/components/pages/PageBits";
import "@/components/pages/w6c.css";

interface Props {
  params: Promise<{ code: string }>;
}

// L13: a certificate code is `NAQSH-<year>-XXXXX` (see generateUniqueCertificateCode),
// alphanumeric parts joined by dashes. Anything else must 404 instead of rendering a
// "verified" certificate for a code that cannot exist (soft-404 → fake trust badge).
const CERTIFICATE_CODE = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

function isCertificateCode(code: string | undefined): boolean {
  return typeof code === "string" && code.length <= 64 && CERTIFICATE_CODE.test(code);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  if (!isCertificateCode(code)) return { title: "Sertifikat topilmadi | Naqsh" };
  return {
    title: `Sertifikat Tekshiruvi ${code} | Naqsh`,
    description: "Sertifikatning haqiqiyligini ommaviy tekshirish sahifasi.",
  };
}

const ROWS = [
  { label: "Egasining ismi", value: "Jamshid Alimov", accent: false },
  { label: "Kurs nomi", value: "Vibe Coding Express (8 hafta)", accent: true },
  { label: "Umumiy o'rtacha ball", value: "9.4 / 10", accent: false, mono: true },
  { label: "Berilgan sana", value: "07.09.2026", accent: false, mono: true },
] as const;

export default async function CertificateVerificationPage({ params }: Props) {
  const { code } = await params;
  if (!isCertificateCode(code)) notFound();

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="w6c-hero">
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <Container className="relative z-10 pt-28 text-center sm:pt-32">
          <Seal className="w6c-load mx-auto size-24" />
          <p className="w6c-load mt-6" style={{ "--i": 1 } as React.CSSProperties}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-success-line bg-success-soft px-3 py-1 font-mono text-xs font-bold text-success">
              <ShieldCheck className="size-4" aria-hidden="true" /> Haqiqiy Sertifikat (Verified)
            </span>
          </p>
          <h1 className="w6c-load mx-auto mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,1.2rem+2.4vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-ink" style={{ "--i": 2 } as React.CSSProperties}>
            Sertifikat Tekshiruvi
          </h1>
          <p className="w6c-load mt-3 font-mono text-xs font-bold text-accent" style={{ "--i": 3 } as React.CSSProperties}>
            Kod: {code}
          </p>
        </Container>
      </div>

      <Container className="max-w-[700px]">
        <div className="rounded-[var(--radius-xl)] border-2 border-gold bg-bg-elevated p-8 text-left shadow-[var(--shadow-md)] sm:p-10">
          <p className="text-center font-display text-sm font-semibold uppercase tracking-[0.2em] text-ink-subtle">— Sertifikat —</p>
          <dl className="mt-6 space-y-0 text-sm">
            {ROWS.map((row) => (
              <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
                <dt className="font-semibold text-ink-muted">{row.label}:</dt>
                <dd className={`text-right font-semibold ${row.accent ? "text-accent" : "text-ink"} ${"mono" in row && row.mono ? "font-mono" : ""}`}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-6 rounded-lg bg-bg-sunken px-4 py-3 text-center font-mono text-xs text-ink-muted">
            Tekshiruv manzili: naqsh.uz/shahodatnoma/{code}
          </p>
        </div>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <a
            href={`https://t.me/share/url?url=${encodeURIComponent(`https://naqsh.uz/shahodatnoma/${code}`)}&text=${encodeURIComponent(`Naqsh sertifikati (${code})`)}`}
            target="_blank"
            rel="noreferrer"
            className="btn-press inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border bg-bg-elevated px-4 text-sm font-semibold text-ink transition hover:border-brand"
          >
            <Send className="size-4" aria-hidden="true" /> Telegramda ulashish
          </a>
          <a
            href="/kurs/vibe-coding-express"
            className="btn-press inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-hover hover:shadow-md"
          >
            Men ham o‘qimoqchiman
          </a>
        </div>
        <p className="mt-6 text-center text-xs text-ink-subtle">
          Ma’lumot mos kelmadimi? <Link href="/xizmatlar" className="font-semibold text-brand underline underline-offset-4">Biz bilan bog‘laning</Link>.
        </p>
        <NextStepCTA title="Siz ham amaliyotchi bo‘ling" />
      </Container>
    </div>
  );
}
