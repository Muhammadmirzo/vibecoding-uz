import { sumToTiyin } from "./money";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";
export type PaymentProvider = "payme" | "click" | "manual";

export interface ProviderSecrets {
  paymeMerchantId?: string;
  paymeKey?: string;
  clickServiceId?: string;
  clickMerchantId?: string;
  clickSecretKey?: string;
}

/**
 * A provider is available only when ALL its secrets are configured.
 * Merchant/service ids alone are not enough (a callback without the
 * secret cannot be verified, so checkout must not be offered).
 */
export function isPaymeAvailable(secrets: ProviderSecrets): boolean {
  return Boolean(secrets.paymeMerchantId?.trim()) && Boolean(secrets.paymeKey?.trim());
}

export function isClickAvailable(secrets: ProviderSecrets): boolean {
  return (
    Boolean(secrets.clickServiceId?.trim()) &&
    Boolean(secrets.clickMerchantId?.trim()) &&
    Boolean(secrets.clickSecretKey?.trim())
  );
}

export function readProviderSecrets(env: NodeJS.ProcessEnv = process.env): ProviderSecrets {
  return {
    paymeMerchantId: env.PAYME_MERCHANT_ID,
    paymeKey: env.PAYME_KEY,
    clickServiceId: env.CLICK_SERVICE_ID,
    clickMerchantId: env.CLICK_MERCHANT_ID,
    clickSecretKey: env.CLICK_SECRET_KEY,
  };
}

export interface CohortPriceInput {
  priceSum: string;
  earlyPriceSum?: string | null;
  earlyDeadline?: Date | null;
}

/** Trusted server-side price in tiyin (early-bird applies only before its deadline). */
export function effectivePriceTiyin(cohort: CohortPriceInput, now: Date = new Date()): { tiyin: number; isEarly: boolean } {
  const regular = sumToTiyin(cohort.priceSum);
  if (cohort.earlyPriceSum && cohort.earlyDeadline && cohort.earlyDeadline.getTime() > now.getTime()) {
    const early = sumToTiyin(cohort.earlyPriceSum);
    if (early > 0 && early < regular) return { tiyin: early, isEarly: true };
  }
  if (regular <= 0) throw new Error("Kurs narxi sozlanmagan");
  return { tiyin: regular, isEarly: false };
}

export type CheckoutDecision =
  | { action: "reuse"; paymentId: string }
  | { action: "create"; amountTiyin: number };

/** One active pending payment per enrollment: reuse it instead of duplicating. */
export function decideCheckout(existingPendingId: string | null, priceTiyin: number): CheckoutDecision {
  if (existingPendingId) return { action: "reuse", paymentId: existingPendingId };
  return { action: "create", amountTiyin: priceTiyin };
}

/** Payme protocol state for a payment status (cancelled maps to -1, never to refunded). */
export function paymeProtocolState(status: PaymentStatus): 1 | 2 | -1 {
  if (status === "paid") return 2;
  if (status === "cancelled" || status === "refunded" || status === "failed") return -1;
  return 1;
}

export interface PaymeCancelOutcome {
  /** Always "cancelled" — a provider cancel is NOT a money refund. */
  nextStatus: "cancelled";
  /** Revoke enrollment access only when this payment had granted it. */
  revokeAccess: boolean;
  /** True when the row was already terminal and nothing changes (safe replay). */
  replay: boolean;
}

/** Payme CancelTransaction: any non-terminal payment becomes "cancelled" (not "refunded"). */
export function decidePaymeCancel(current: PaymentStatus, accessGrantedByThisPayment: boolean): PaymeCancelOutcome {
  if (current === "cancelled" || current === "refunded") return { nextStatus: "cancelled", revokeAccess: false, replay: true };
  if (current === "failed") return { nextStatus: "cancelled", revokeAccess: false, replay: false };
  return { nextStatus: "cancelled", revokeAccess: accessGrantedByThisPayment, replay: false };
}

export type ClickDecision =
  | { action: "prepare" }
  | { action: "complete" }
  | { action: "fail" }
  | { action: "reject"; reason: "mismatch" | "terminal" | "prepare" };

/** Click prepare/complete state machine on the stored payment status + provider binding. */
export function decideClickTransition(input: {
  status: PaymentStatus;
  storedClickTransId: number | null;
  incomingClickTransId: number;
  storedPrepareId: number | null;
  incomingPrepareId: number | null;
  providerError: boolean;
  phase: "prepare" | "complete";
}): ClickDecision {
  const { status, storedClickTransId, incomingClickTransId, storedPrepareId, incomingPrepareId, providerError, phase } = input;
  if (storedClickTransId !== null && storedClickTransId !== incomingClickTransId) return { action: "reject", reason: "mismatch" };
  if (providerError) return status === "pending" ? { action: "fail" } : { action: "reject", reason: "terminal" };
  if (phase === "prepare") {
    return status === "pending" ? { action: "prepare" } : { action: "reject", reason: "terminal" };
  }
  if (status === "paid") return { action: "complete" };
  if (status !== "pending") return { action: "reject", reason: "terminal" };
  if (storedPrepareId === null || incomingPrepareId === null || storedPrepareId !== incomingPrepareId) {
    return { action: "reject", reason: "prepare" };
  }
  return { action: "complete" };
}

/** Checkout URL builders (pure string construction; availability is checked before use). */
export function buildPaymeCheckoutUrl(merchantId: string, paymentId: string, amountTiyin: number): string {
  const encoded = Buffer.from(`m=${merchantId};ac.order_id=${paymentId};a=${amountTiyin}`).toString("base64");
  return `https://checkout.paycom.uz/${encoded}`;
}

export function buildClickCheckoutUrl(serviceId: string, merchantId: string, paymentId: string, amountTiyin: number): string {
  const amount = (amountTiyin / 100).toFixed(2);
  const params = new URLSearchParams({
    service_id: serviceId,
    merchant_id: merchantId,
    amount,
    transaction_param: paymentId,
  });
  return `https://my.click.uz/services/pay?${params.toString()}`;
}
