import { randomUUID } from "node:crypto";
import { z } from "zod";
import { withTransactionLock } from "@/db";
import { checkRefundEligibility } from "@/lib/refund";
import { sumToTiyin } from "../domain/money";
import type { DbExecutor, PaymentsRepository } from "./payments.repository";

export const refundRequestSchema = z.object({
  paymentId: z.string().uuid({ message: "To'lov ID si noto'g'ri" }),
  reason: z.string().max(500).optional(),
  idempotencyKey: z.string().uuid().optional(),
});

export type RefundRequestInput = z.infer<typeof refundRequestSchema> & { userId?: string };

export class RefundError extends Error {
  constructor(public code: "NOT_FOUND" | "NOT_PAID" | "INELIGIBLE", message: string) {
    super(message);
  }
}

export interface RefundOutcome {
  refundId: string;
  status: string;
  amountTiyin: number;
  replay: boolean;
}

/**
 * Refund workflow: check eligibility (7-day guarantee, <=2 modules, paid),
 * record a refund request, revoke course access. Idempotent via the
 * idempotency key: replays return the original request.
 */
export async function requestRefund(repo: PaymentsRepository, input: RefundRequestInput): Promise<RefundOutcome> {
  const key = input.idempotencyKey ?? randomUUID();
  const existing = await repo.findRefundByKey(key);
  if (existing) {
    return { refundId: existing.id, status: existing.status, amountTiyin: existing.amountTiyin, replay: true };
  }

  const payment = await repo.findPaymentById(input.paymentId, "payme").then((p) =>
    p ?? repo.findPaymentById(input.paymentId, "click").then((c) => c ?? repo.findPaymentById(input.paymentId, "manual")),
  );
  if (!payment || (input.userId && payment.userId !== input.userId)) {
    throw new RefundError("NOT_FOUND", "To'lov topilmadi");
  }
  if (payment.status !== "paid") throw new RefundError("NOT_PAID", "To'lov amalga oshirilmagan yoki kutilmoqda.");

  const enrollment = payment.enrollmentId && input.userId
    ? await repo.findUserEnrollment(input.userId, payment.enrollmentId)
    : null;
  const enrolledAt = enrollment?.enrolledAt ?? payment.paidAt ?? new Date();
  const completedModules = await repo.countCompletedModules(payment.userId);
  const eligibility = checkRefundEligibility({
    enrolledAt,
    completedModulesCount: completedModules,
    paymentStatus: "paid",
    amountSum: Number(payment.amountSum),
  });
  if (!eligibility.eligible) throw new RefundError("INELIGIBLE", eligibility.message);

  const amountTiyin = sumToTiyin(payment.amountSum);
  const created = await withTransactionLock(`refund:${key}`, async (tx: DbExecutor | null | undefined) => {
    const ex = (tx ?? null) as DbExecutor | null;
    if (!ex) throw new Error("Payment database transaction is unavailable");
    const replay = await repo.findRefundByKey(key);
    if (replay) return { id: replay.id, status: replay.status, replay: true as const };
    const row = await repo.createRefundRequest({
      userId: input.userId,
      paymentId: payment.id,
      enrollmentId: payment.enrollmentId,
      amountTiyin,
      reason: input.reason,
      idempotencyKey: key,
    });
    // Revoke access immediately; the provider-side money movement is tracked
    // via the request status (never silently marked "refunded").
    if (payment.enrollmentId) await repo.setEnrollmentStatusTx(ex, payment.enrollmentId, "paused");
    return { id: row.id, status: row.status, replay: false as const };
  });

  return { refundId: created.id, status: created.status, amountTiyin, replay: created.replay };
}
