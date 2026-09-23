export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentProvider = "payme" | "click" | "manual";

export interface InstallmentProgress {
  paidAmount: number;
  total: number;
  percent: number;
  paidCount: number;
  totalCount: number;
}

export interface PaymentRecord {
  id: string;
  provider: PaymentProvider;
  providerTxnId: string | null;
  amountSum: string;
  status: PaymentStatus;
  paidAt: string | null;
  receiptUrl: string | null;
  createdAt: string;
  enrollmentId: string | null;
}

export interface ProviderAvailability {
  payme: boolean;
  click: boolean;
}

export interface PaymentsResponse {
  payments: PaymentRecord[];
  providers: ProviderAvailability;
}

const dateFormatter = new Intl.DateTimeFormat("uz-UZ", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

export function formatUzs(value: number | string): string {
  const numeric = typeof value === "number" ? value : Number(value);
  const rounded = Number.isFinite(numeric) ? Math.round(numeric) : 0;
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} so'm`;
}

export function formatDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? "—" : dateFormatter.format(date);
}

export function statusLabel(status: PaymentStatus): string {
  const labels: Record<PaymentStatus, string> = {
    pending: "Kutilmoqda",
    paid: "To'langan",
    failed: "Muvaffaqiyatsiz",
    refunded: "Qaytarilgan",
  };
  return labels[status];
}

export function computeInstallmentProgress(paid: number, total: number): InstallmentProgress {
  const safeTotal = Number.isFinite(total) ? Math.max(total, 0) : 0;
  const safePaid = Number.isFinite(paid) ? Math.min(Math.max(paid, 0), safeTotal) : 0;
  const percent = safeTotal === 0 ? 0 : Math.round((safePaid / safeTotal) * 100);

  return {
    paidAmount: safePaid,
    total: safeTotal,
    percent,
    paidCount: 0,
    totalCount: 0,
  };
}
