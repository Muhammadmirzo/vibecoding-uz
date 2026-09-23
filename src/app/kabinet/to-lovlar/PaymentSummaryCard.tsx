"use client";

import * as React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  computeInstallmentProgress,
  formatUzs,
  type PaymentProvider,
  type ProviderAvailability,
} from "@/features/payments/format";

interface PaymentSummaryCardProps {
  paidAmount: number;
  coursePrice: number;
  courseTitle: string;
  installmentText: string;
  guaranteeText: string;
  providers: ProviderAvailability;
  enrollmentId: string | null;
}

function isCheckoutResponse(value: unknown): value is {
  checkoutUrl?: string;
  error?: string;
} {
  return typeof value === "object" && value !== null;
}

export function PaymentSummaryCard({
  paidAmount,
  coursePrice,
  courseTitle,
  installmentText,
  guaranteeText,
  providers,
  enrollmentId,
}: PaymentSummaryCardProps) {
  const firstAvailable = providers.payme ? "payme" : providers.click ? "click" : "payme";
  const [provider, setProvider] = React.useState<PaymentProvider>(firstAvailable);
  const [paying, setPaying] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const progress = computeInstallmentProgress(paidAmount, coursePrice);
  const outstanding = Math.max(coursePrice - paidAmount, 0);
  const anyProviderAvailable = providers.payme || providers.click;

  async function handlePay(): Promise<void> {
    setPaying(true);
    setMessage("To'lov oynasi tayyorlanmoqda...");
    try {
      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          amountSum: outstanding,
          installmentMonth: 1,
          ...(enrollmentId ? { enrollmentId } : {}),
        }),
      });
      const data: unknown = await response.json();
      if (!response.ok || !isCheckoutResponse(data) || !data.checkoutUrl) {
        const errorText = typeof data === "object" && data !== null
          ? (data as Record<string, unknown>).error
          : undefined;
        throw new Error(typeof errorText === "string"
          ? errorText
          : "To'lov jarayonini boshlashda xatolik");
      }
      window.location.assign(data.checkoutUrl);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Tarmoq xatosi yuz berdi");
      setPaying(false);
    }
  }

  const providerOptions: Array<{ id: "payme" | "click"; label: string }> = [
    { id: "payme", label: "Payme" },
    { id: "click", label: "Click" },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      <section className="rounded-2xl border border-border-strong bg-cream-warm p-6 shadow-sm md:p-8">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
          <div>
            <p className="font-mono text-xs font-bold uppercase text-accent">Kurs</p>
            <h2 className="mt-1 text-xl font-bold text-ink">{courseTitle}</h2>
          </div>
          <span className="rounded-full bg-accent-soft px-3 py-1 font-mono text-xs font-bold text-accent">
            {progress.percent}% to'langan
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between gap-3 font-mono text-xs text-ink-muted">
            <span>To'langan: <strong className="text-ink">{formatUzs(progress.paidAmount)}</strong></span>
            <span>Jami: <strong className="text-ink">{formatUzs(progress.total)}</strong></span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-cream-deep" role="progressbar"
            aria-label="To'lov progressi" aria-valuenow={progress.percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${progress.percent}%` }} />
          </div>
          <p className="text-xs text-ink-muted">Bo'lib to'lash: {installmentText}</p>
        </div>

        <fieldset className="mt-6 space-y-3">
          <legend className="mb-2 text-xs font-semibold text-ink">To'lov tizimini tanlang</legend>
          <div className="grid grid-cols-2 gap-3">
            {providerOptions.map((option) => {
              const available = providers[option.id];
              const selected = provider === option.id;
              return (
                <button key={option.id} type="button" disabled={!available}
                  aria-pressed={selected} onClick={() => setProvider(option.id)}
                  className={`rounded-xl border p-3 text-left disabled:cursor-not-allowed disabled:opacity-50 ${
                    selected ? "border-accent bg-accent-soft text-accent" : "border-border bg-cream text-ink-muted"
                  }`}>
                  <strong className="block text-sm">{option.label}</strong>
                  <span className="text-[10px]">{available ? "Mavjud" : "Hozircha mavjud emas"}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-4 min-h-5" aria-live="polite" aria-atomic="true">
          {message && <p className="text-xs text-ink">{message}</p>}
        </div>
        <button type="button" onClick={handlePay} disabled={paying || !anyProviderAvailable || outstanding <= 0}
          className="btn-primary mt-2 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50">
          {paying ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <CreditCard className="h-4 w-4" aria-hidden="true" />}
          {outstanding <= 0 ? "Kurs to'langan" : paying ? "To'lov tizimi ochilmoqda..." : `${formatUzs(outstanding)} to'lash`}
        </button>
      </section>

      <aside className="flex flex-col justify-between rounded-2xl border border-border-strong bg-cream-warm p-6 shadow-sm">
        <div className="space-y-3">
          <ShieldCheck className="h-8 w-8 text-success" aria-hidden="true" />
          <h3 className="font-bold text-ink">Pul qaytarish kafolati</h3>
          <p className="text-xs leading-relaxed text-ink-muted">{guaranteeText}</p>
        </div>
        <Link href="/pul-qaytarish" className="mt-6 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
          Kafolat shartlari <ArrowRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </aside>
    </div>
  );
}
