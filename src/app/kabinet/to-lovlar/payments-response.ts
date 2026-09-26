import type { PaymentRecord, PaymentsResponse } from "@/features/payments/format";

/** `"550 000 so'm"` / `"550000.00"` -> so'm as a number. */
export function extractAmount(value: string): number {
  const match = value.match(/[\d\s]+/);
  return match ? Number(match[0].replace(/\s/g, "")) : 0;
}

export function isPayment(value: unknown): value is PaymentRecord {
  if (typeof value !== "object" || value === null) return false;
  const row = value as Record<string, unknown>;
  return typeof row.id === "string" && typeof row.amountSum === "string" &&
    typeof row.status === "string" && typeof row.createdAt === "string" &&
    (row.provider === "payme" || row.provider === "click" || row.provider === "manual");
}

export function isPaymentsResponse(value: unknown): value is PaymentsResponse {
  if (typeof value !== "object" || value === null) return false;
  const response = value as Record<string, unknown>;
  const providers = response.providers as Record<string, unknown> | undefined;
  return Array.isArray(response.payments) && response.payments.every(isPayment) &&
    typeof providers?.payme === "boolean" && typeof providers?.click === "boolean";
}

export function sumPaidAmount(payments: PaymentRecord[]): number {
  return payments
    .filter((payment) => payment.status === "paid")
    .reduce((sum, payment) => sum + extractAmount(payment.amountSum), 0);
}

export function errorMessageFrom(body: unknown, fallback: string): string {
  return typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
    ? body.message
    : fallback;
}
