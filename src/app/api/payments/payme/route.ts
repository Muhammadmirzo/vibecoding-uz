import { and, eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db, withTransactionLock } from "@/db";
import { enrollments, payments } from "@/db/schema";
import {
  amountMatches,
  createPaymeErrorResponse,
  createPaymeSuccessResponse,
  getPaymeOrderId,
  getPaymeTransactionId,
  PAYME_ERRORS,
  verifyPaymeAuth,
} from "@/features/payments/payme";
import { paymeRpcRequestSchema, type PaymeRpcParams } from "@/lib/validations/payment";

type PaymentRow = typeof payments.$inferSelect;
type PaymentDatabase = Pick<typeof db, "select" | "update">;

function objectMeta(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? { ...value } : {};
}

function timestampMeta(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

async function markPaid(payment: PaymentRow, providerTxnId: string, performTime: number, executor: PaymentDatabase) {
  const changes: Partial<typeof payments.$inferInsert> = {
    providerTxnId,
    status: "paid",
    paidAt: new Date(performTime),
    meta: { ...objectMeta(payment.meta), paymeState: 2, performTime },
  };
  await executor.update(payments).set(changes).where(eq(payments.id, payment.id));
  if (payment.enrollmentId) {
    await executor.update(enrollments).set({ status: "active" }).where(eq(enrollments.id, payment.enrollmentId));
  }
}

export async function POST(req: NextRequest) {
  const paymeKey = process.env.PAYME_KEY?.trim();
  if (!paymeKey) {
    return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.AUTH_ERROR), { status: 503 });
  }
  if (!verifyPaymeAuth(req.headers.get("authorization"), paymeKey)) {
    return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.AUTH_ERROR), { status: 401 });
  }

  const parsed = paymeRpcRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.CANNOT_PERFORM), { status: 400 });
  }

  const { method, params } = parsed.data;
  const rpcId = typeof parsed.data.id === "string" && /^\d+$/.test(parsed.data.id) ? Number(parsed.data.id) : parsed.data.id;
  const error = (code = PAYME_ERRORS.CANNOT_PERFORM) =>
    NextResponse.json(createPaymeErrorResponse(rpcId, code));

  if (method === "CheckPerformTransaction") {
    const orderId = getPaymeOrderId(params);
    if (!z.string().uuid().safeParse(orderId).success) return error(PAYME_ERRORS.CANNOT_PERFORM);
    const [payment] = await db.select().from(payments).where(and(eq(payments.id, orderId), eq(payments.provider, "payme"))).limit(1);
    if (!payment || !params.amount || !amountMatches(payment.amountSum, params.amount)) {
      return error(PAYME_ERRORS.INVALID_AMOUNT);
    }
    return NextResponse.json(createPaymeSuccessResponse(rpcId, {
      allow: true,
      detail: { receipt_type: 0, items: [{ title: "Vibecoding kurs to'lovi", price: params.amount, count: 1, code: "1000000000", vat_percent: 0 }] },
    }));
  }

  if (method === "CreateTransaction") {
    const providerTxnId = getPaymeTransactionId(params.id);
    const orderId = getPaymeOrderId(params);
    if (!providerTxnId || !z.string().uuid().safeParse(orderId).success) return error();
    const result = await withTransactionLock(`payme:${providerTxnId}`, async (transaction: unknown) => {
      if (!transaction) throw new Error("Payment database transaction is unavailable");
      const tx = transaction as PaymentDatabase;
      const [payment] = await tx.select().from(payments).where(and(eq(payments.id, orderId), eq(payments.provider, "payme"))).limit(1);
      if (!payment || !params.amount || !amountMatches(payment.amountSum, params.amount)) return PAYME_ERRORS.INVALID_AMOUNT;
      if (payment.providerTxnId && payment.providerTxnId !== providerTxnId) return PAYME_ERRORS.CANNOT_PERFORM;
      if (payment.status === "paid" || payment.status === "refunded" || payment.status === "failed") return null;
      const createTime = params.time ?? Date.now();
      await tx.update(payments).set({ providerTxnId, meta: { ...objectMeta(payment.meta), paymeState: 1, createTime } })
        .where(eq(payments.id, payment.id));
      return { createTime, state: 1 };
    });
    if (result && "createTime" in result) {
      return NextResponse.json(createPaymeSuccessResponse(rpcId, { create_time: result.createTime, transaction: providerTxnId, state: 1 }));
    }
    const [paid] = await db.select().from(payments).where(and(eq(payments.id, orderId), eq(payments.providerTxnId, providerTxnId))).limit(1);
    if (paid?.status === "paid") {
      const meta = objectMeta(paid.meta);
      return NextResponse.json(createPaymeSuccessResponse(rpcId, { create_time: timestampMeta(meta.createTime), transaction: providerTxnId, state: 2 }));
    }
    return error();
  }

  const providerTxnId = getPaymeTransactionId(params.id);
  if (!providerTxnId) return error();

  if (method === "PerformTransaction") {
    const result = await withTransactionLock(`payme:${providerTxnId}`, async (transaction: unknown) => {
      if (!transaction) throw new Error("Payment database transaction is unavailable");
      const tx = transaction as PaymentDatabase;
      const [payment] = await tx.select().from(payments).where(and(eq(payments.provider, "payme"), eq(payments.providerTxnId, providerTxnId))).limit(1);
      if (!payment) return PAYME_ERRORS.TRANSACTION_NOT_FOUND;
      if (payment.status === "paid") return { performTime: timestampMeta(objectMeta(payment.meta).performTime), replay: true };
      if (payment.status !== "pending") return PAYME_ERRORS.CANNOT_PERFORM;
      const performTime = Date.now();
      await markPaid(payment, providerTxnId, performTime, tx);
      return { performTime, replay: false };
    });
    if ("code" in result) return error(result);
    return NextResponse.json(createPaymeSuccessResponse(rpcId, { transaction: providerTxnId, perform_time: result.performTime, state: 2 }));
  }

  if (method === "CancelTransaction") {
    const result = await withTransactionLock(`payme:${providerTxnId}`, async (transaction: unknown) => {
      if (!transaction) throw new Error("Payment database transaction is unavailable");
      const tx = transaction as PaymentDatabase;
      const [payment] = await tx.select().from(payments).where(and(eq(payments.provider, "payme"), eq(payments.providerTxnId, providerTxnId))).limit(1);
      if (!payment) return PAYME_ERRORS.TRANSACTION_NOT_FOUND;
      const cancelTime = Date.now();
      if (payment.status !== "refunded") {
        await tx.update(payments).set({ status: "refunded", meta: { ...objectMeta(payment.meta), paymeState: -1, cancelTime, reason: params.reason ?? 1 } })
          .where(eq(payments.id, payment.id));
      }
      return { cancelTime };
    });
    if ("code" in result) return error(result);
    return NextResponse.json(createPaymeSuccessResponse(rpcId, { transaction: providerTxnId, cancel_time: result.cancelTime, state: -1 }));
  }

  if (method === "CheckTransaction") {
    const [payment] = await db.select().from(payments).where(and(eq(payments.provider, "payme"), eq(payments.providerTxnId, providerTxnId))).limit(1);
    if (!payment) return error(PAYME_ERRORS.TRANSACTION_NOT_FOUND);
    const meta = objectMeta(payment.meta);
    const state = payment.status === "paid" ? 2 : payment.status === "refunded" ? -1 : 1;
    return NextResponse.json(createPaymeSuccessResponse(rpcId, {
      create_time: timestampMeta(meta.createTime), perform_time: payment.paidAt?.getTime() ?? 0,
      cancel_time: timestampMeta(meta.cancelTime), transaction: providerTxnId, state, reason: meta.reason ?? null,
    }));
  }

  return error();
}
