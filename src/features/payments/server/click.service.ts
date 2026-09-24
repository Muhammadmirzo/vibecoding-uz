import { withTransactionLock } from "@/db";
import { sumMatchesTiyin, sumToTiyin } from "../domain/money";
import { decideClickTransition } from "../domain/policy";
import type { DbExecutor, PaymentRecord, PaymentsRepository } from "./payments.repository";
import type { ClickWebhookInput } from "@/lib/validations/payment";

export type ClickResult =
  | { ok: true; body: Record<string, unknown> }
  | { ok: false; note: string; status: number };

function metaOf(payment: PaymentRecord): Record<string, unknown> {
  return payment.meta ?? {};
}

function storedClickId(payment: PaymentRecord): number | null {
  const value = metaOf(payment).clickTransId;
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function storedPrepareId(payment: PaymentRecord): number | null {
  const value = metaOf(payment).merchantPrepareId;
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function fail(note: string, status = 400): ClickResult {
  return { ok: false, note, status };
}

export async function handleClickWebhook(
  repo: PaymentsRepository,
  data: ClickWebhookInput,
  createPrepareId: () => number,
): Promise<ClickResult> {
  const clickTransId = Number(data.click_trans_id);
  if (!Number.isSafeInteger(clickTransId) || clickTransId <= 0) return fail("Invalid Click transaction id");

  const payment = await repo.findPaymentById(data.merchant_trans_id, "click");
  if (!payment) return fail("Payment not found", 404);
  if (!sumMatchesTiyin(payment.amountSum, sumToTiyin(data.amount))) return fail("Amount mismatch");

  const providerError = Number(data.error ?? 0) < 0;
  const phase = data.action === "0" ? "prepare" : "complete";
  const decision = decideClickTransition({
    status: payment.status,
    storedClickTransId: storedClickId(payment),
    incomingClickTransId: clickTransId,
    storedPrepareId: storedPrepareId(payment),
    incomingPrepareId: phase === "complete" && data.merchant_prepare_id ? Number(data.merchant_prepare_id) : null,
    providerError,
    phase,
  });

  if (decision.action === "reject") return fail("Invalid transaction state");
  if (decision.action === "fail") {
    await withTransactionLock(`click:${data.click_trans_id}`, async (tx: DbExecutor | null | undefined) => {
      const ex = tx ?? null;
      if (!ex) throw new Error("Payment database transaction is unavailable");
      const current = await repo.findPaymentByIdTx(ex, payment.id, "click");
      if (current && current.status === "pending") {
        await repo.setPaymentTx(ex, current.id, {
          providerTxnId: data.click_trans_id,
          status: "failed",
          meta: { ...metaOf(current), clickTransId, providerError: data.error },
        });
      }
    });
    return fail("Tranzaksiya xatolik bilan yakunlandi");
  }

  if (decision.action === "prepare") {
    const merchantPrepareId = await withTransactionLock(`click:${data.click_trans_id}`, async (tx: DbExecutor | null | undefined) => {
      const ex = tx ?? null;
      if (!ex) throw new Error("Payment database transaction is unavailable");
      const current = await repo.findPaymentByIdTx(ex, payment.id, "click");
      if (!current || current.status !== "pending") return null;
      if (storedClickId(current) !== null && storedClickId(current) !== clickTransId) return null;
      const prepareId = createPrepareId();
      await repo.setPaymentTx(ex, current.id, {
        providerTxnId: data.click_trans_id,
        meta: { ...metaOf(current), clickTransId, merchantPrepareId: prepareId, clickState: "prepared" },
      });
      return prepareId;
    });
    if (!merchantPrepareId) return fail("Invalid transaction state");
    return { ok: true, body: { click_trans_id: clickTransId, merchant_trans_id: data.merchant_trans_id, merchant_prepare_id: merchantPrepareId, error: 0, error_note: "Success" } };
  }

  // Complete (idempotent: replaying a paid payment returns the stored confirm id).
  const completed = await withTransactionLock(`click:${data.click_trans_id}`, async (tx: DbExecutor | null | undefined) => {
    const ex = tx ?? null;
    if (!ex) throw new Error("Payment database transaction is unavailable");
    const current = await repo.findPaymentByIdTx(ex, payment.id, "click");
    if (!current) return null;
    if (storedClickId(current) !== null && storedClickId(current) !== clickTransId) return null;
    const storedPrepare = storedPrepareId(current);
    const incomingPrepare = Number(data.merchant_prepare_id);
    const existingConfirm = metaOf(current).merchantConfirmId;
    if (current.status === "paid") {
      return typeof existingConfirm === "number" ? existingConfirm : null;
    }
    if (current.status !== "pending") return null;
    if (!Number.isSafeInteger(incomingPrepare) || incomingPrepare <= 0 || incomingPrepare !== storedPrepare) return null;
    const merchantConfirmId = incomingPrepare + 1;
    await repo.setPaymentTx(ex, current.id, {
      providerTxnId: data.click_trans_id,
      status: "paid",
      paidAt: new Date(),
      meta: { ...metaOf(current), clickTransId, merchantPrepareId: incomingPrepare, merchantConfirmId, clickState: "completed" },
    });
    if (current.enrollmentId) await repo.setEnrollmentStatusTx(ex, current.enrollmentId, "active");
    return merchantConfirmId;
  });
  if (completed === null) return fail("Invalid transaction state");
  return { ok: true, body: { click_trans_id: clickTransId, merchant_trans_id: data.merchant_trans_id, merchant_confirm_id: completed, error: 0, error_note: "Success" } };
}
