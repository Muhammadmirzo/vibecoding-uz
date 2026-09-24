import { z } from "zod";
import { withTransactionLock } from "@/db";
import {
  buildClickCheckoutUrl,
  buildPaymeCheckoutUrl,
  decideCheckout,
  effectivePriceTiyin,
  isClickAvailable,
  isPaymeAvailable,
  readProviderSecrets,
  type PaymentProvider,
} from "../domain/policy";
import { tiyinToSumString } from "../domain/money";
import type { DbExecutor, PaymentsRepository } from "./payments.repository";

export const checkoutInputSchema = z.object({
  enrollmentId: z.string().uuid().optional(),
  cohortId: z.string().uuid().optional(),
  provider: z.enum(["payme", "click"]),
  installmentMonth: z.number().int().min(1).max(12).optional(),
}).superRefine((v, ctx) => {
  if (!v.enrollmentId && !v.cohortId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enrollment yoki cohort tanlanishi shart" });
  }
});

export type CheckoutInput = z.infer<typeof checkoutInputSchema> & { userId: string };

export class CheckoutError extends Error {
  constructor(public code: "PROVIDER_UNAVAILABLE" | "NOT_FOUND" | "FORBIDDEN" | "BAD_PRICE" | "BAD_TARGET", message: string) {
    super(message);
  }
}

export interface CheckoutResult {
  paymentId: string;
  amountTiyin: number;
  checkoutUrl: string | null;
  sandbox: boolean;
  reused: boolean;
}

function checkoutUrlFor(provider: PaymentProvider, paymentId: string, amountTiyin: number, secrets: ReturnType<typeof readProviderSecrets>): string {
  if (provider === "payme") return buildPaymeCheckoutUrl(secrets.paymeMerchantId!.trim(), paymentId, amountTiyin);
  return buildClickCheckoutUrl(secrets.clickServiceId!.trim(), secrets.clickMerchantId!.trim(), paymentId, amountTiyin);
}

interface CheckoutTxParams {
  enrollmentId: string;
  priceTiyin: number;
}

type CheckoutTxOutcome = { paymentId: string; amountTiyin: number; reused: boolean };

/**
 * Reuse-or-create inside one transaction: the pending-payment check and
 * the payment insert run on the same `ex`, so concurrent checkouts for
 * one enrollment cannot create duplicate pending payments.
 */
async function checkoutWithEnrollment(
  repo: PaymentsRepository,
  ex: DbExecutor,
  params: CheckoutTxParams & Pick<CheckoutInput, "userId" | "provider" | "installmentMonth">,
  now: Date,
): Promise<CheckoutTxOutcome> {
  const pending = await repo.findPendingByEnrollmentTx(ex, params.enrollmentId, params.provider);
  const decision = decideCheckout(pending?.id ?? null, params.priceTiyin);
  if (decision.action === "reuse") {
    return {
      paymentId: decision.paymentId,
      amountTiyin: pending!.amountTiyin > 0 ? pending!.amountTiyin : params.priceTiyin,
      reused: true,
    };
  }
  const created = await repo.createPaymentTx(ex, {
    userId: params.userId,
    enrollmentId: params.enrollmentId,
    provider: params.provider,
    amountSum: tiyinToSumString(decision.amountTiyin),
    amountTiyin: decision.amountTiyin,
    meta: { installmentMonth: params.installmentMonth ?? 1, initiatedAt: now.toISOString() },
  });
  return { paymentId: created.id, amountTiyin: decision.amountTiyin, reused: false };
}

function toResult(
  outcome: CheckoutTxOutcome,
  input: Pick<CheckoutInput, "provider">,
  secrets: ReturnType<typeof readProviderSecrets>,
  sandbox: boolean,
): CheckoutResult {
  return {
    paymentId: outcome.paymentId,
    amountTiyin: outcome.amountTiyin,
    checkoutUrl: sandbox ? null : checkoutUrlFor(input.provider, outcome.paymentId, outcome.amountTiyin, secrets),
    sandbox,
    reused: outcome.reused,
  };
}

export async function createCheckout(
  repo: PaymentsRepository,
  input: CheckoutInput,
  secrets = readProviderSecrets(),
  now: Date = new Date(),
): Promise<CheckoutResult> {
  const providerAvailable = input.provider === "payme" ? isPaymeAvailable(secrets) : isClickAvailable(secrets);
  const sandbox = process.env.NODE_ENV !== "production" && !providerAvailable;
  if (!providerAvailable && !sandbox) {
    throw new CheckoutError("PROVIDER_UNAVAILABLE", "To'lov tizimi vaqtincha sozlanmoqda. Telegram orqali murojaat qiling.");
  }

  // Existing enrollment path: price from the enrollment's cohort.
  if (input.enrollmentId) {
    const found = await repo.findUserEnrollment(input.userId, input.enrollmentId);
    if (!found) throw new CheckoutError("NOT_FOUND", "Enrollment topilmadi");
    const price = effectivePriceTiyin(found, now);
    const outcome = await withTransactionLock<CheckoutTxOutcome>(`checkout:${input.enrollmentId}`, async (tx: DbExecutor | null | undefined) => {
      const ex = tx ?? null;
      if (!ex) throw new Error("Payment database transaction is unavailable");
      return checkoutWithEnrollment(repo, ex, {
        userId: input.userId, enrollmentId: input.enrollmentId!, provider: input.provider,
        installmentMonth: input.installmentMonth, priceTiyin: price.tiyin,
      }, now);
    });
    return toResult(outcome, input, secrets, sandbox);
  }

  // New enrollment path: price from the cohort; the active-enrollment
  // re-check, the pending-enrollment insert, and the payment insert all
  // run inside one transaction.
  const cohort = await repo.findCohort(input.cohortId!);
  if (!cohort) throw new CheckoutError("NOT_FOUND", "Guruh topilmadi");
  const cohortPrice = effectivePriceTiyin(cohort, now).tiyin;
  const existing = await repo.findActiveUserEnrollment(input.userId, input.cohortId!);
  if (existing) {
    const price = effectivePriceTiyin(existing, now);
    const outcome = await withTransactionLock<CheckoutTxOutcome>(`checkout:${existing.enrollmentId}`, async (tx: DbExecutor | null | undefined) => {
      const ex = tx ?? null;
      if (!ex) throw new Error("Payment database transaction is unavailable");
      return checkoutWithEnrollment(repo, ex, {
        userId: input.userId, enrollmentId: existing.enrollmentId, provider: input.provider,
        installmentMonth: input.installmentMonth, priceTiyin: price.tiyin,
      }, now);
    });
    return toResult(outcome, input, secrets, sandbox);
  }

  const outcome = await withTransactionLock<CheckoutTxOutcome>(`checkout:new:${input.userId}:${input.cohortId}`, async (tx: DbExecutor | null | undefined) => {
    const ex = tx ?? null;
    if (!ex) throw new Error("Payment database transaction is unavailable");
    const rechecked = await repo.findActiveUserEnrollmentTx(ex, input.userId, input.cohortId!);
    const enrollmentId = rechecked
      ? rechecked.enrollmentId
      : (await repo.createPendingEnrollmentTx(ex, input.userId, input.cohortId!, "checkout")).id;
    const priceTiyin = rechecked ? effectivePriceTiyin(rechecked, now).tiyin : cohortPrice;
    return checkoutWithEnrollment(repo, ex, {
      userId: input.userId, enrollmentId, provider: input.provider,
      installmentMonth: input.installmentMonth, priceTiyin,
    }, now);
  });
  return toResult(outcome, input, secrets, sandbox);
}
