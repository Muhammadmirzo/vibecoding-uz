"use client";

import * as React from "react";
import { AlertCircle, CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { KabinetNav } from "@/features/lms/components/KabinetNav";
import { KabinetPageHeader, KabinetSkeleton } from "@/features/lms/components/KabinetPage";
import type { CourseOffer, CheckoutTarget } from "@/features/payments/domain/checkout-target";
import type { PaymentsResponse } from "@/features/payments/format";
import { fetchWithTimeout } from "@/lib/http/fetch";
import { siteConfig } from "@/lib/siteConfig";
import { NoOpenCohortState } from "./NoOpenCohortState";
import { PaymentHistorySection } from "./PaymentHistorySection";
import { PaymentSummaryCard } from "./PaymentSummaryCard";
import {
  errorMessageFrom,
  extractAmount,
  isPaymentsResponse,
  sumPaidAmount,
} from "./payments-response";

export interface PaymentsClientProps {
  offer: CourseOffer;
  target: CheckoutTarget;
  /** Trusted cohort amount in so'm; null when there is nothing payable yet. */
  payableAmount: number | null;
  targetError: boolean;
  /** Server-prefetched feed; null falls back to the client fetch. */
  initialData?: PaymentsResponse | null;
}

export function PaymentsClient({ offer, target, payableAmount, targetError, initialData = null }: PaymentsClientProps) {
  const [data, setData] = React.useState<PaymentsResponse | null>(initialData);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(initialData === null);

  const loadPayments = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchWithTimeout("To'lovlar", "/api/me/payments", { cache: "no-store" }, 10_000);
      const body: unknown = await response.json();
      if (!response.ok) throw new Error(errorMessageFrom(body, "To'lovlarni yuklab bo'lmadi"));
      if (!isPaymentsResponse(body)) throw new Error("To'lovlar javobi noto'g'ri");
      setData(body);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "To'lovlarni yuklab bo'lmadi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (initialData === null) void loadPayments();
  }, [initialData, loadPayments]);

  const paidAmount = data ? sumPaidAmount(data.payments) : 0;
  const payable = payableAmount ?? extractAmount(offer.price);

  return (
    <div className="min-h-screen bg-bg text-ink">
      <KabinetNav />
      <main className="mx-auto w-full max-w-6xl space-y-8 px-5 pb-28 pt-24 md:px-8 md:pt-28 lg:pl-80 lg:pr-8">
        <KabinetPageHeader
          title="To&apos;lovlar va cheklar"
          description="Hisobingizdagi haqiqiy to&apos;lovlar, ularning holati va mavjud cheklar."
          icon={CreditCard}
        />
        {loading ? <KabinetSkeleton label="To&apos;lovlar yuklanmoqda" rows={2} /> : null}
        {!loading && error ? <ErrorState message={error} onRetry={loadPayments} /> : null}
        {!loading && !error && data ? (
          <>
            {targetError || target.state === "waitlist" ? (
              <NoOpenCohortState
                courseTitle={offer.title}
                courseSlug={offer.slug}
                reason={targetError ? "unavailable" : "no-cohort"}
                nextCohortDate={siteConfig.nextCohortDate}
              />
            ) : (
              <PaymentSummaryCard
                paidAmount={paidAmount}
                coursePrice={extractAmount(offer.price)}
                payableAmount={payable}
                courseTitle={offer.title}
                installmentText={offer.installment}
                guaranteeText={siteConfig.guaranteeText}
                providers={data.providers}
                target={target}
              />
            )}
            <PaymentHistorySection payments={data.payments} courseSlug={offer.slug} />
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
