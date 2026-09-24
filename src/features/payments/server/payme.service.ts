import { withTransactionLock } from "@/db";
import { sumMatchesTiyin } from "../domain/money";
import { decidePaymeCancel, paymeProtocolState } from "../domain/policy";
import type { DbExecutor, PaymentRecord, PaymentsRepository } from "./payments.repository";

export type PaymeResult =
  | { ok: true; result: Record<string, unknown> }
  | { ok: false; code: number };

const INVALID_AMOUNT = -31001;
const TRANSACTION_NOT_FOUND = -31003;
const CANNOT_PERFORM = -31008;

function metaOf(payment: PaymentRecord): Record<string, unknown> {
  return payment.meta ?? {};
}

function numMeta(payment: PaymentRecord, key: string): number {
  const value = metaOf(payment)[key];
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

export async function checkPerform(repo: PaymentsRepository, orderId: string, amountTiyin: number): Promise<PaymeResult> {
  const payment = await repo.findPaymentById(orderId, "payme");
  if (!payment || !sumMatchesTiyin(payment.amountSum, amountTiyin)) return { ok: false, code: INVALID_AMOUNT };
  return {
    ok: true,
    result: {
      allow: true,
      detail: {
        receipt_type: 0,
        items: [{ title: "Vibecoding kurs to'lovi", price: amountTiyin, count: 1, code: "1000000000", vat_percent: 0 }],
      },
    },
  };
}

export async function createTransaction(
  repo: PaymentsRepository,
  orderId: string,
  providerTxnId: string,
  amountTiyin: number,
  createTime: number,
): Promise<PaymeResult> {
  const outcome = await withTransactionLock(`payme:${providerTxnId}`, async (tx: DbExecutor | null | undefined) => {
    const ex = (tx ?? null) as DbExecutor | null;
    if (!ex) throw new Error("Payment database transaction is unavailable");
    const payment = await repo.findPaymentByIdTx(ex, orderId, "payme");
    if (!payment || !sumMatchesTiyin(payment.amountSum, amountTiyin)) return { error: INVALID_AMOUNT };
    if (payment.providerTxnId && payment.providerTxnId !== providerTxnId) return { error: CANNOT_PERFORM };
    if (payment.status === "paid" || payment.status === "refunded" || payment.status === "failed" || payment.status === "cancelled") {
      return { terminal: true };
    }
    await repo.setPaymentTx(ex, payment.id, {
      providerTxnId,
      meta: { ...metaOf(payment), paymeState: 1, createTime },
    });
    return { created: true, createTime };
  });

  if ("error" in outcome) return { ok: false, code: outcome.error };
  if ("created" in outcome) {
    return { ok: true, result: { create_time: outcome.createTime, transaction: providerTxnId, state: 1 } };
  }
  const existing = await repo.findByProviderTxnId("payme", providerTxnId);
  if (existing?.status === "paid") {
    return { ok: true, result: { create_time: numMeta(existing, "createTime"), transaction: providerTxnId, state: 2 } };
  }
  return { ok: false, code: CANNOT_PERFORM };
}

export async function performTransaction(repo: PaymentsRepository, providerTxnId: string): Promise<PaymeResult> {
  const outcome = await withTransactionLock(`payme:${providerTxnId}`, async (tx: DbExecutor | null | undefined) => {
    const ex = (tx ?? null) as DbExecutor | null;
    if (!ex) throw new Error("Payment database transaction is unavailable");
    const payment = await repo.findByProviderTxnIdTx(ex, "payme", providerTxnId);
    if (!payment) return { error: TRANSACTION_NOT_FOUND };
    if (payment.status === "paid") return { replay: true, performTime: numMeta(payment, "performTime") };
    if (payment.status !== "pending") return { error: CANNOT_PERFORM };
    const performTime = Date.now();
    await repo.setPaymentTx(ex, payment.id, {
      status: "paid",
      paidAt: new Date(performTime),
      meta: { ...metaOf(payment), paymeState: 2, performTime },
    });
    if (payment.enrollmentId) await repo.setEnrollmentStatusTx(ex, payment.enrollmentId, "active");
    return { replay: false, performTime };
  });
  if ("error" in outcome) return { ok: false, code: outcome.error };
  return { ok: true, result: { transaction: providerTxnId, perform_time: outcome.performTime, state: 2 } };
}

export async function cancelTransaction(repo: PaymentsRepository, providerTxnId: string, reason: unknown): Promise<PaymeResult> {
  const outcome = await withTransactionLock(`payme:${providerTxnId}`, async (tx: DbExecutor | null | undefined) => {
    const ex = (tx ?? null) as DbExecutor | null;
    if (!ex) throw new Error("Payment database transaction is unavailable");
    const payment = await repo.findByProviderTxnIdTx(ex, "payme", providerTxnId);
    if (!payment) return { error: TRANSACTION_NOT_FOUND };
    // Access counts as granted by this payment when it is paid and no other
    // paid payment keeps the enrollment active.
    let granted = payment.status === "paid";
    if (granted && payment.enrollmentId) {
      const others = await repo.countOtherPaidPaymentsTx(ex, payment.enrollmentId, payment.id);
      granted = others === 0;
    }
    const decision = decidePaymeCancel(payment.status, granted);
    const cancelTime = Date.now();
    if (!decision.replay) {
      await repo.setPaymentTx(ex, payment.id, {
        status: decision.nextStatus,
        meta: { ...metaOf(payment), paymeState: -1, cancelTime, reason: reason ?? 1 },
      });
      if (decision.revokeAccess && payment.enrollmentId) {
        await repo.setEnrollmentStatusTx(ex, payment.enrollmentId, "paused");
      }
    }
    return { cancelTime };
  });
  if ("error" in outcome) return { ok: false, code: outcome.error };
  return { ok: true, result: { transaction: providerTxnId, cancel_time: outcome.cancelTime, state: -1 } };
}

export async function checkTransaction(repo: PaymentsRepository, providerTxnId: string): Promise<PaymeResult> {
  const payment = await repo.findByProviderTxnId("payme", providerTxnId);
  if (!payment) return { ok: false, code: TRANSACTION_NOT_FOUND };
  return {
    ok: true,
    result: {
      create_time: numMeta(payment, "createTime"),
      perform_time: payment.paidAt?.getTime() ?? 0,
      cancel_time: numMeta(payment, "cancelTime"),
      transaction: providerTxnId,
      state: paymeProtocolState(payment.status),
      reason: metaOf(payment).reason ?? null,
    },
  };
}
