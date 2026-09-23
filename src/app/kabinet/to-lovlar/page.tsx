"use client";

import * as React from "react";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { siteConfig } from "@/lib/siteConfig";
import type { PaymentRecord, PaymentsResponse } from "@/features/payments/format";
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import { PaymentHistorySection } from "./PaymentHistorySection";

const course = siteConfig.courses["vibe-coding-express"];

function extractAmount(value: string): number {
  const match = value.match(/[\d\s]+/);
  return match ? Number(match[0].replace(/\s/g, "")) : 0;
}

function isPayment(value: unknown): value is PaymentRecord {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.amountSum === "string" &&
    typeof row.status === "string" && typeof row.createdAt === "string" &&
    (row.provider === "payme" || row.provider === "click" || row.provider === "manual");
}

function isPaymentsResponse(value: unknown): value is PaymentsResponse {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  const providers = response.providers as Record<string, unknown> | undefined;
  return Array.isArray(response.payments) && response.payments.every(isPayment) &&
    typeof providers?.payme === "boolean" && typeof providers?.click === "boolean";
}

export default function ToLovlarPage() {
  const [data, setData] = React.useState<PaymentsResponse | null>(null);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(true);

  const loadPayments = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/me/payments", { cache: "no-store" });
      const body: unknown = await response.json();
      if (!response.ok) {
        throw new Error(typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
          ? body.error
          : "To'lovlarni yuklab bo'lmadi");
      }
      if (!isPaymentsResponse(body)) throw new Error("To'lovlar javobi noto'g'ri");
      setData(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "To'lovlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { void loadPayments(); }, [loadPayments]);

  const paidAmount = data?.payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + extractAmount(payment.amountSum), 0) ?? 0;
  const enrollmentId = data?.payments.find((payment) => payment.enrollmentId)?.enrollmentId ?? null;

  return (
    <main className="min-h-screen bg-cream pb-16 pt-24">
      <KabinetNav />
      <div className="mx-auto w-full max-w-[1100px] space-y-8 px-5 md:px-8">
        <header className="space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-soft px-3 py-1 font-mono text-xs font-bold text-accent">
            <CreditCard className="h-3.5 w-3.5" aria-hidden="true" /> Moliya markazi
          </span>
          <h1 className="text-2xl font-extrabold text-ink md:text-3xl">To'lovlar va cheklar</h1>
          <p className="text-xs text-ink-muted">Faqat hisobingizdagi haqiqiy to'lovlar va ularning holati.</p>
        </header>

        {loading && <LoadingState />}
        {!loading && error && <ErrorState message={error} onRetry={loadPayments} />}
        {!loading && !error && data && (
          <>
            <PaymentSummaryCard
              paidAmount={paidAmount}
              coursePrice={extractAmount(course.price)}
              courseTitle="Vibe Coding Express"
              installmentText={course.installment}
              guaranteeText={siteConfig.guaranteeText}
              providers={data.providers}
              enrollmentId={enrollmentId}
            />
            <PaymentHistorySection payments={data.payments} />
          </>
        )}
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true" aria-label="To'lovlar yuklanmoqda">
      <div className="h-72 animate-pulse rounded-2xl bg-cream-warm" />
      <div className="h-64 animate-pulse rounded-2xl bg-cream-warm" />
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => Promise<void> }) {
  return (
    <section className="rounded-2xl border border-border-strong bg-cream-warm p-8 text-center" role="alert">
      <AlertCircle className="mx-auto h-8 w-8 text-accent" aria-hidden="true" />
      <h2 className="mt-3 font-bold text-ink">Ma'lumotni yuklab bo'lmadi</h2>
      <p className="mt-2 text-sm text-ink-muted">{message}</p>
      <button type="button" onClick={() => void onRetry()} className="btn-primary mt-5 inline-flex h-10 items-center gap-2 rounded-xl px-5 text-xs font-semibold">
        <Loader2 className="h-4 w-4" aria-hidden="true" /> Qayta urinish
      </button>
    </section>
  );
}
