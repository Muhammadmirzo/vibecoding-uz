"use client";

import * as React from "react";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { KabinetPageHeader, KabinetSkeleton } from "@/features/lms/components/KabinetPage";
import { siteConfig } from "@/lib/siteConfig";
import { fetchWithTimeout } from "@/lib/http/fetch";
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
      const response = await fetchWithTimeout("To'lovlar", "/api/me/payments", { cache: "no-store" }, 10_000);
      const body: unknown = await response.json();
      if (!response.ok) {
        const message = typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
          ? body.message
          : "To'lovlarni yuklab bo'lmadi";
        throw new Error(message);
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
    <div className="min-h-screen bg-bg text-ink">
      <KabinetNav />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 pb-28 pt-24 md:px-8 md:pt-28 lg:pl-80 lg:pr-8">
        <KabinetPageHeader title="To&apos;lovlar va cheklar" description="Hisobingizdagi haqiqiy to&apos;lovlar, ularning holati va mavjud cheklar." icon={CreditCard} />
        {loading ? <KabinetSkeleton label="To&apos;lovlar yuklanmoqda" rows={2} /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={loadPayments} /> : null}
        {!loading && !error && data ? (
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
        ) : null}
      </main>
    </div>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => Promise<void> }) {
  return (
    <section className="rounded-xl border border-danger bg-bg-elevated p-8 text-center" role="alert">
      <AlertCircle className="mx-auto h-8 w-8 text-danger" aria-hidden="true" />
      <h2 className="mt-3 font-display text-lg font-semibold text-ink">To&apos;lovlarni yuklab bo&apos;lmadi</h2>
      <p className="mt-2 text-base text-ink-muted">{message}</p>
      <Button onClick={() => void onRetry()} className="mt-5"><Loader2 className="h-4 w-4" aria-hidden="true" /> Qayta urinish</Button>
    </section>
  );
}
