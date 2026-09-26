import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createPaymeErrorResponse,
  createPaymeSuccessResponse,
  getPaymeOrderId,
  getPaymeTransactionId,
  PAYME_ERRORS,
  verifyPaymeAuth,
} from "@/features/payments/payme";
import { drizzlePaymentsRepository } from "@/features/payments/server/payments.repository";
import {
  cancelTransaction,
  checkPerform,
  checkTransaction,
  createTransaction,
  performTransaction,
} from "@/features/payments/server/payme.service";
import { paymeRpcRequestSchema } from "@/lib/validations/payment";
import { checkRateLimit, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { errorFields, requestLogger } from "@/lib/log";

const repo = drizzlePaymentsRepository;

export async function POST(req: NextRequest) {
  const paymeKey = process.env.PAYME_KEY?.trim();
  if (!paymeKey) {
    return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.AUTH_ERROR), { status: 503 });
  }
  try {
    const rl = await checkRateLimit(`payme:${getClientIp(req)}`, PRESETS.WEBHOOK);
  if (!rl.success) {
    return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.AUTH_ERROR), { status: 429 });
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
  const ok = (result: Record<string, unknown>) => NextResponse.json(createPaymeSuccessResponse(rpcId, result));
  const fail = (code = PAYME_ERRORS.CANNOT_PERFORM) => NextResponse.json(createPaymeErrorResponse(rpcId, code));
  const toResult = (outcome: { ok: true; result: Record<string, unknown> } | { ok: false; code: number }) =>
    outcome.ok ? ok(outcome.result) : fail(codeFor(outcome.code));

  if (method === "CheckPerformTransaction") {
    const orderId = getPaymeOrderId(params);
    if (!z.string().uuid().safeParse(orderId).success || !params.amount) return fail(PAYME_ERRORS.INVALID_AMOUNT);
    return toResult(await checkPerform(repo, orderId, params.amount));
  }

  if (method === "CreateTransaction") {
    const providerTxnId = getPaymeTransactionId(params.id);
    const orderId = getPaymeOrderId(params);
    if (!providerTxnId || !z.string().uuid().safeParse(orderId).success || !params.amount) return fail();
    return toResult(await createTransaction(repo, orderId, providerTxnId, params.amount, params.time ?? Date.now()));
  }

  const providerTxnId = getPaymeTransactionId(params.id);
  if (!providerTxnId) return fail();

  if (method === "PerformTransaction") return toResult(await performTransaction(repo, providerTxnId));
  if (method === "CancelTransaction") return toResult(await cancelTransaction(repo, providerTxnId, params.reason));
  if (method === "CheckTransaction") return toResult(await checkTransaction(repo, providerTxnId));
  return fail();
  } catch (error) {
    requestLogger(req, "/api/payments/payme").error("payment_webhook_failed", { provider: "payme", ...errorFields(error) });
    return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.CANNOT_PERFORM), { status: 503 });
  }
}

function codeFor(code: number) {
  if (code === PAYME_ERRORS.INVALID_AMOUNT.code) return PAYME_ERRORS.INVALID_AMOUNT;
  if (code === PAYME_ERRORS.TRANSACTION_NOT_FOUND.code) return PAYME_ERRORS.TRANSACTION_NOT_FOUND;
  return PAYME_ERRORS.CANNOT_PERFORM;
}
