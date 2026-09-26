import type { CheckoutTarget } from "@/features/payments/domain/checkout-target";
import type { PaymentProvider } from "@/features/payments/format";

export interface CheckoutRequestBody {
  provider: PaymentProvider;
  installmentMonth: number;
  /** Display hint only — `checkoutInputSchema` strips it and the server prices the payment. */
  amountSum: number;
  enrollmentId?: string;
  cohortId?: string;
}

export interface BuildCheckoutRequestInput {
  provider: PaymentProvider;
  installmentMonth: number;
  target: CheckoutTarget;
  /** Outstanding amount shown on the button; never trusted by the server. */
  amountHint: number;
}

/**
 * Body for POST /api/payments/checkout.
 *
 * A new student has no enrollment, so the cohort id travels instead: the
 * server then creates the pending enrollment for that cohort. Returns null in
 * the waitlist state (no open cohort) — there is nothing to pay for.
 */
export function buildCheckoutRequestBody(
  input: BuildCheckoutRequestInput,
): CheckoutRequestBody | null {
  if (input.target.state === "waitlist") return null;
  const body: CheckoutRequestBody = {
    provider: input.provider,
    installmentMonth: input.installmentMonth,
    amountSum: input.amountHint,
  };
  if (input.target.enrollmentId) body.enrollmentId = input.target.enrollmentId;
  if (input.target.cohortId) body.cohortId = input.target.cohortId;
  return body;
}
