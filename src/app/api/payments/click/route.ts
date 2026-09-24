import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db, withTransactionLock } from "@/db";
import { enrollments, payments } from "@/db/schema";
import { clickAmountMatches, computeClickSign, createMerchantPrepareId, verifyClickSign } from "@/features/payments/click";
import { clickWebhookSchema, type ClickWebhookInput } from "@/lib/validations/payment";
import {
  checkRateLimit,
  getClientIp,
  PRESETS,
} from "@/lib/security/rateLimit";

type PaymentRow = typeof payments.$inferSelect;
type PaymentDatabase = Pick<typeof db, "select" | "update">;

function objectMeta(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

function providerClickId(payment: PaymentRow): number | null {
  const value = objectMeta(payment.meta).clickTransId;
  return typeof value === "number" && Number.isInteger(value) ? value : null;
}

function protocolError(note: string, status = 400) {
  return NextResponse.json({ error: -1, error_note: note }, { status });
}

async function findPayment(data: ClickWebhookInput, executor: PaymentDatabase = db) {
  if (!z.string().uuid().safeParse(data.merchant_trans_id).success) return null;
  const [payment] = await executor.select().from(payments)
    .where(and(eq(payments.id, data.merchant_trans_id), eq(payments.provider, "click")))
    .limit(1);
  return payment ?? null;
}

export async function POST(req: NextRequest) {
  const secretKey = process.env.CLICK_SECRET_KEY?.trim();
  const serviceId = process.env.CLICK_SERVICE_ID?.trim();
  if (!secretKey || !serviceId) return protocolError("Payment provider is not configured", 503);

  // Rate-limit before signature verification to blunt credential-stuffing/replay floods.
  const rl = await checkRateLimit(`click:${getClientIp(req)}`, PRESETS.WEBHOOK);
  if (!rl.success) return protocolError("Too many requests", 429);

  const formData = await req.formData().catch(() => null);
  if (!formData) return protocolError("Invalid form payload");
  const raw: Record<string, unknown> = {};
  for (const [key, value] of formData.entries()) raw[key] = typeof value === "string" ? value : undefined;

  const parsed = clickWebhookSchema.safeParse(raw);
  if (!parsed.success) return protocolError("Missing or invalid signed fields");
  const data = parsed.data;
  if (data.service_id !== serviceId) return protocolError("Unexpected service id", 401);

  const expectedSign = computeClickSign(
    data.click_trans_id, data.service_id, secretKey, data.merchant_trans_id,
    data.merchant_prepare_id, data.amount, data.action, data.sign_time
  );
  if (!verifyClickSign(data.sign_string, expectedSign)) return protocolError("SIGN CHECK FAILED", 401);

  const payment = await findPayment(data);
  if (!payment) return protocolError("Payment not found", 404);
  if (!clickAmountMatches(payment.amountSum, data.amount)) return protocolError("Amount mismatch", 400);

  const clickTransId = Number(data.click_trans_id);
  if (!Number.isSafeInteger(clickTransId) || clickTransId <= 0) return protocolError("Invalid Click transaction id");

  if (Number(data.error ?? 0) < 0) {
    await withTransactionLock(`click:${data.click_trans_id}`, async (transaction: unknown) => {
      if (!transaction) throw new Error("Payment database transaction is unavailable");
      const tx = transaction as PaymentDatabase;
      const current = await findPayment(data, tx);
      if (current && current.status === "pending") {
        await tx.update(payments).set({ providerTxnId: data.click_trans_id, status: "failed", meta: { ...objectMeta(current.meta), clickTransId, providerError: data.error } })
          .where(eq(payments.id, current.id));
      }
    });
    return protocolError("Tranzaksiya xatolik bilan yakunlandi");
  }

  if (data.action === "0") {
    const prepared = await withTransactionLock(`click:${data.click_trans_id}`, async (transaction: unknown) => {
      if (!transaction) throw new Error("Payment database transaction is unavailable");
      const tx = transaction as PaymentDatabase;
      const current = await findPayment(data, tx);
      if (!current) return null;
      const existingProviderId = providerClickId(current);
      if (existingProviderId !== null && existingProviderId !== clickTransId) return "mismatch" as const;
      if (current.status !== "pending") return "terminal" as const;
      const merchantPrepareId = createMerchantPrepareId();
      await tx.update(payments).set({ providerTxnId: data.click_trans_id, meta: { ...objectMeta(current.meta), clickTransId, merchantPrepareId, clickState: "prepared" } })
        .where(eq(payments.id, current.id));
      return merchantPrepareId;
    });
    if (prepared === "mismatch" || prepared === "terminal") return protocolError("Invalid transaction state");
    if (!prepared) return protocolError("Payment not found", 404);
    return NextResponse.json({ click_trans_id: clickTransId, merchant_trans_id: data.merchant_trans_id, merchant_prepare_id: prepared, error: 0, error_note: "Success" });
  }

  const completed = await withTransactionLock(`click:${data.click_trans_id}`, async (transaction: unknown) => {
    if (!transaction) throw new Error("Payment database transaction is unavailable");
    const tx = transaction as PaymentDatabase;
    const current = await findPayment(data, tx);
    if (!current) return null;
    const existingProviderId = providerClickId(current);
    if (existingProviderId !== null && existingProviderId !== clickTransId) return "mismatch" as const;
    const storedPrepareId = Number(objectMeta(current.meta).merchantPrepareId);
    const merchantPrepareId = Number(data.merchant_prepare_id);
    if (!Number.isSafeInteger(merchantPrepareId) || merchantPrepareId <= 0 || merchantPrepareId !== storedPrepareId) {
      return "prepare" as const;
    }
    if (current.status === "paid") {
      return { merchantConfirmId: Number(objectMeta(current.meta).merchantConfirmId) || merchantPrepareId + 1, replay: true };
    }
    if (current.status !== "pending") return "terminal" as const;
    const merchantConfirmId = merchantPrepareId + 1;
    const paidAt = new Date();
    await tx.update(payments).set({ providerTxnId: data.click_trans_id, status: "paid", paidAt, meta: { ...objectMeta(current.meta), clickTransId, merchantPrepareId, merchantConfirmId, clickState: "completed" } })
      .where(eq(payments.id, current.id));
    if (current.enrollmentId) await tx.update(enrollments).set({ status: "active" }).where(eq(enrollments.id, current.enrollmentId));
    return { merchantConfirmId, replay: false };
  });
  if (completed === "mismatch" || completed === "prepare" || completed === "terminal") return protocolError("Invalid transaction state");
  if (!completed) return protocolError("Payment not found", 404);
  return NextResponse.json({ click_trans_id: clickTransId, merchant_trans_id: data.merchant_trans_id, merchant_confirm_id: completed.merchantConfirmId, error: 0, error_note: "Success" });
}
