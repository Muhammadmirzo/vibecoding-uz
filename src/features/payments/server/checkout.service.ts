import { z } from "zod";
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
import type { PaymentsRepository } from "./payments.repository";

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

  // Resolve the enrollment: existing one, or create a pending one for a new student.
  let enrollmentId = input.enrollmentId ?? null;
  let price: { tiyin: number };
  if (enrollmentId) {
    const found = await repo.findUserEnrollment(input.userId, enrollmentId);
    if (!found) throw new CheckoutError("NOT_FOUND", "Enrollment topilmadi");
    price = effectivePriceTiyin(found, now);
  } else {
    const cohort = await repo.findCohort(input.cohortId!);
    if (!cohort) throw new CheckoutError("NOT_FOUND", "Guruh topilmadi");
    price = effectivePriceTiyin(cohort, now);
    const existing = await repo.findActiveUserEnrollment(input.userId, input.cohortId!);
    if (existing) {
      enrollmentId = existing.enrollmentId;
      price = effectivePriceTiyin(existing, now);
    } else {
      const created = await repo.createPendingEnrollment(input.userId, input.cohortId!, "checkout");
      enrollmentId = created.id;
    }
  }

  // One active pending payment per enrollment: reuse it instead of duplicating.
  const pending = await repo.findPendingByEnrollment(enrollmentId!, input.provider);
  const decision = decideCheckout(pending?.id ?? null, price.tiyin);

  let paymentId: string;
  let reused = false;
  let amountTiyin = price.tiyin;
  if (decision.action === "reuse") {
    paymentId = decision.paymentId;
    reused = true;
    amountTiyin = pending!.amountTiyin > 0 ? pending!.amountTiyin : price.tiyin;
  } else {
    const created = await repo.createPayment({
      userId: input.userId,
      enrollmentId: enrollmentId!,
      provider: input.provider,
      amountSum: tiyinToSumString(decision.amountTiyin),
      amountTiyin: decision.amountTiyin,
      meta: { installmentMonth: input.installmentMonth ?? 1, initiatedAt: now.toISOString() },
    });
    paymentId = created.id;
  }

  return {
    paymentId,
    amountTiyin,
    checkoutUrl: sandbox ? null : checkoutUrlFor(input.provider, paymentId, amountTiyin, secrets),
    sandbox,
    reused,
  };
}
