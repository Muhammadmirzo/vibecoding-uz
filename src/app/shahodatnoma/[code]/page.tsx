import type { Metadata } from "next";
import type * as React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Send, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/Layout";
import { NextStepCTA } from "@/components/ui/NextStepCTA";
import { Seal } from "@/components/pages/PageBits";
import { loadCertificateOwner, verifyCertificate, type CertificateOwner } from "@/lib/certificates/service";
import { errorFields, log } from "@/lib/log";
import "@/components/pages/w6c.css";

interface Props {
  params: Promise<{ code: string }>;
}

// A certificate check is a live DB read that must never be cached or prerendered:
// a stale "verified" badge on a public trust page is worse than a slow one.
export const dynamic = "force-dynamic";

// L13: a certificate code is `NAQSH-<year>-XXXXX` (see generateUniqueCertificateCode),
// alphanumeric parts joined by dashes. Anything else must 404 instead of rendering a
// "verified" certificate for a code that cannot exist (soft-404 → fake trust badge).
const CERTIFICATE_CODE = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;

// Reserved code kept for the e2e/responsive suites (e2e/responsive.spec.ts, e2e/visibility.spec.ts).
// It is rendered as an obvious demo — never as a real, verified certificate (L14).
const DEMO_CODE = "DEMO2026";

function isCertificateCode(code: string | undefined): boolean {
  return typeof code === "string" && code.length <= 64 && CERTIFICATE_CODE.test(code);
}

const NO_INDEX: Metadata["robots"] = { index: false, follow: false };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  if (!isCertificateCode(code)) {
    return { title: "Sertifikat topilmadi | Naqsh", robots: NO_INDEX };
  }
  if (code === DEMO_CODE) {
    // The demo is a placeholder (L14) — it must never enter a search index.
    return {
      title: `Sertifikat Tekshiruvi ${code} | Naqsh`,
      description: "Sertifikatning haqiqiyligini ommaviy tekshirish sahifasi.",
      robots: NO_INDEX,
    };
  }
  return {
    title: `Sertifikat Tekshiruvi ${code} | Naqsh`,
    description: "Sertifikatning haqiqiyligini ommaviy tekshirish sahifasi.",
  };
}

interface Row {
  label: string;
  value: string;
  accent: boolean;
  mono: boolean;
}

/** Demo values are placeholders that look like placeholders (L14). */
const DEMO_ROWS: readonly Row[] = [
  { label: "Egasining ismi", value: "Demo talaba (nunamuna)", accent: false, mono: false },
  { label: "Kurs nomi", value: "Vibe Coding Express — namuna", accent: true, mono: false },
  { label: "Umumiy o'rtacha ball", value: "—", accent: false, mono: true },
  { label: "Berilgan sana", value: "—", accent: false, mono: true },
];

/** Formats the server-derived score to one decimal, e.g. `8.5 / 10`. */
function formatScore(score: number | null): string {
  if (score === null || !Number.isFinite(score)) return "—";
  return `${score.toFixed(1)} / 10`;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function toRows(owner: CertificateOwner): readonly Row[] {
  return [
    { label: "Egasining ismi", value: owner.holderName || "Ma'lumot yo'q", accent: false, mono: false },
    { label: "Kurs nomi", value: owner.courseTitle || "Ma'lumot yo'q", accent: true, mono: false },
    { label: "Umumiy o'rtacha ball", value: formatScore(owner.score), accent: false, mono: true },
    { label: "Berilgan sana", value: formatDate(owner.issuedAt), accent: false, mono: true },
  ];
}


function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && (error as { digest?: unknown }).digest === "NEXT_NOT_FOUND";
}

export default async function CertificateVerificationPage({ params }: Props) {
  const { code } = await params;
  if (!isCertificateCode(code)) notFound();

  const isDemo = code === DEMO_CODE;
  let rows: readonly Row[] = DEMO_ROWS;
  let verified = false;
  // A DB failure must render an honest "could not check" state: no verified badge,
  // no 404 (the code may well exist) and no 500.
  let unavailable = false;

  if (!isDemo) {
    try {
      // L14: the "Verified" badge may only appear for a code that really exists in the DB.
      const certificate = await verifyCertificate({ code });
      if (!certificate) notFound();
      rows = toRows(await loadCertificateOwner(certificate));
      verified = true;
    } catch (error: unknown) {
      if (isNotFound(error)) throw error;
      // errorFields() never logs the message: it can hold SQL or PII.
      log.error("certificate_verify_failed", errorFields(error));
      unavailable = true;
    }
  }

  return (
    <div className="min-h-screen bg-bg pb-20">
      <div className="w6c-hero">
        <div className="w6c-hero-mesh" aria-hidden="true" />
        <Container className="relative z-10 pt-28 text-center sm:pt-32">
          <Seal className="w6c-load mx-auto size-24" />
          <p className="w6c-load mt-6" style={{ "--i": 1 } as React.CSSProperties}>
            {verified ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-success-line bg-success-soft px-3 py-1 font-mono text-xs font-bold text-success">
                <ShieldCheck className="size-4" aria-hidden="true" /> Haqiqiy Sertifikat (Verified)
              </span>
            ) : unavailable ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-sunken px-3 py-1 font-mono text-xs font-bold text-ink-muted">
                <AlertTriangle className="size-4" aria-hidden="true" /> Tekshiruv bajarilmadi
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-bg-sunken px-3 py-1 font-mono text-xs font-bold text-ink-muted">
                <ShieldCheck className="size-4" aria-hidden="true" /> Demo namuna — tekshirilmagan
              </span>
            )}
          </p>
          <h1 className="w6c-load mx-auto mt-4 max-w-2xl text-balance font-display text-[clamp(1.9rem,1.2rem+2.4vw,2.9rem)] font-semibold leading-[1.1] tracking-[-0.04em] text-ink" style={{ "--i": 2 } as React.CSSProperties}>
            {unavailable ? "Hozir tekshirib bo&apos;lmadi" : "Sertifikat Tekshiruvi"}
          </h1>
          <p className="w6c-load mt-3 font-mono text-xs font-bold text-accent" style={{ "--i": 3 } as React.CSSProperties}>
            Kod: {code}
          </p>
        </Container>
      </div>

      <Container className="max-w-[700px]">
        {unavailable ? (
          <div className="rounded-[var(--radius-xl)] border-2 border-border bg-bg-elevated p-8 text-left shadow-[var(--shadow-md)] sm:p-10">
            <p className="text-center text-base font-semibold text-ink">
              Hozir tekshirib bo&apos;lmadi, birozdan so&apos;ng qayta urinib ko&apos;ring.
            </p>
            <p className="mt-4 rounded-lg bg-bg-sunken px-4 py-3 text-center text-xs text-ink-muted">
              Ma&apos;lumotlar bazasi vaqtincha javob bermadi. Shuning uchun bu sahifada
              hech qanday tasdiq ko&apos;rsatilmadi.
            </p>
          </div>
        ) : (
          <div className="rounded-[var(--radius-xl)] border-2 border-gold bg-bg-elevated p-8 text-left shadow-[var(--shadow-md)] sm:p-10">
            <p className="text-center font-display text-sm font-semibold uppercase tracking-[0.2em] text-ink-subtle">— Sertifikat —</p>
            <dl className="mt-6 space-y-0 text-sm">
              {rows.map((row) => (
                <div key={row.label} className="flex items-baseline justify-between gap-4 border-b border-border py-3 last:border-0">
                  <dt className="font-semibold text-ink-muted">{row.label}:</dt>
                  <dd className={`text-right font-semibold ${row.accent ? "text-accent" : "text-ink"} ${row.mono ? "font-mono" : ""}`}>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
            {isDemo && (
              <p className="mt-6 rounded-lg border border-border bg-bg-sunken px-4 py-3 text-center text-xs text-ink-muted">
                Bu demo namuna: haqiqiy ma&apos;lumot emas. Haqiqiy sertifikat kodi bilan tekshiruv
                ma&apos;lumotlar bazasidan olinadi.
              </p>
            )}
            <p className="mt-6 rounded-lg bg-bg-sunken px-4 py-3 text-center font-mono text-xs text-ink-muted">
              Tekshiruv manzili: naqsh.uz/shahodatnoma/{code}
            </p>
          </div>
        )}
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
            Men ham o&apos;qimoqchiman
          </a>
        </div>
        <p className="mt-6 text-center text-xs text-ink-subtle">
          {unavailable ? "Muammo davom etsa" : "Ma&apos;lumot mos kelmadimi?"}{" "}
          <Link href="/xizmatlar" className="font-semibold text-brand underline underline-offset-4">Biz bilan bog&apos;laning</Link>.
        </p>
        <NextStepCTA title="Siz ham amaliyotchi bo&apos;ling" />
      </Container>
    </div>
  );
}
