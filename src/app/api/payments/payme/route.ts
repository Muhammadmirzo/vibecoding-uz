import { NextRequest, NextResponse } from "next/server";
import {
  createPaymeSuccessResponse,
  createPaymeErrorResponse,
  PAYME_ERRORS,
  verifyPaymeAuth,
  paymeStore,
  PaymeTransactionRecord,
} from "@/features/payments/payme";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const paymeKey = process.env.PAYME_KEY || "test_key";

    // Validate Authorization Header format "Basic <base64>" & key match
    if (!verifyPaymeAuth(authHeader, paymeKey)) {
      return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.AUTH_ERROR));
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.CANNOT_PERFORM));
    }

    const { method, params, id } = body;
    const rpcId = typeof id === "number" ? id : 0;

    if (!method || !params || typeof params !== "object") {
      return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.CANNOT_PERFORM));
    }

    // Handle Payme JSON-RPC 2.0 Methods
    switch (method) {
      case "CheckPerformTransaction": {
        const amountSum = (params.amount || 0) / 100;
        if (!params.amount || amountSum < 1000) {
          return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.INVALID_AMOUNT));
        }

        return NextResponse.json(
          createPaymeSuccessResponse(rpcId, {
            allow: true,
            detail: {
              receipt_type: 0,
              items: [
                {
                  title: "Vibecoding Kurs To'lovi",
                  price: params.amount,
                  count: 1,
                  code: "1000000000",
                  vat_percent: 0,
                },
              ],
            },
          })
        );
      }

      case "CreateTransaction": {
        const txnId = String(params.id || "");
        if (!txnId) {
          return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.CANNOT_PERFORM));
        }

        const existing = paymeStore.get(txnId);
        if (existing) {
          if (existing.state === 1) {
            return NextResponse.json(
              createPaymeSuccessResponse(rpcId, {
                create_time: existing.create_time,
                transaction: existing.id,
                state: 1,
              })
            );
          }
          return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.CANNOT_PERFORM));
        }

        const amountSum = (params.amount || 0) / 100;
        if (!params.amount || amountSum < 1000) {
          return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.INVALID_AMOUNT));
        }

        const now = Date.now();
        const newTxn: PaymeTransactionRecord = {
          id: txnId,
          time: params.time || now,
          amount: params.amount,
          account: params.account,
          create_time: now,
          perform_time: 0,
          cancel_time: 0,
          state: 1,
          reason: null,
        };

        paymeStore.set(txnId, newTxn);

        return NextResponse.json(
          createPaymeSuccessResponse(rpcId, {
            create_time: newTxn.create_time,
            transaction: newTxn.id,
            state: 1,
          })
        );
      }

      case "PerformTransaction": {
        const txnId = String(params.id || "");
        const existing = paymeStore.get(txnId);

        if (!existing) {
          return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.TRANSACTION_NOT_FOUND));
        }

        if (existing.state === 2) {
          // Idempotent replay for already performed transaction
          return NextResponse.json(
            createPaymeSuccessResponse(rpcId, {
              transaction: existing.id,
              perform_time: existing.perform_time,
              state: 2,
            })
          );
        }

        if (existing.state === 1) {
          existing.state = 2;
          existing.perform_time = Date.now();
          paymeStore.set(txnId, existing);

          return NextResponse.json(
            createPaymeSuccessResponse(rpcId, {
              transaction: existing.id,
              perform_time: existing.perform_time,
              state: 2,
            })
          );
        }

        return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.CANNOT_PERFORM));
      }

      case "CancelTransaction": {
        const txnId = String(params.id || "");
        const existing = paymeStore.get(txnId);

        if (!existing) {
          return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.TRANSACTION_NOT_FOUND));
        }

        if (existing.state === -1 || existing.state === -2) {
          // Idempotent replay for already canceled transaction
          return NextResponse.json(
            createPaymeSuccessResponse(rpcId, {
              transaction: existing.id,
              cancel_time: existing.cancel_time,
              state: existing.state,
            })
          );
        }

        const now = Date.now();
        const nextState = existing.state === 2 ? -2 : -1;
        existing.state = nextState;
        existing.cancel_time = now;
        existing.reason = params.reason ?? 1;
        paymeStore.set(txnId, existing);

        return NextResponse.json(
          createPaymeSuccessResponse(rpcId, {
            transaction: existing.id,
            cancel_time: existing.cancel_time,
            state: existing.state,
          })
        );
      }

      case "CheckTransaction": {
        const txnId = String(params.id || "");
        const existing = paymeStore.get(txnId);

        if (!existing) {
          return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.TRANSACTION_NOT_FOUND));
        }

        return NextResponse.json(
          createPaymeSuccessResponse(rpcId, {
            create_time: existing.create_time,
            perform_time: existing.perform_time,
            cancel_time: existing.cancel_time,
            transaction: existing.id,
            state: existing.state,
            reason: existing.reason,
          })
        );
      }

      default:
        return NextResponse.json(createPaymeErrorResponse(rpcId, PAYME_ERRORS.CANNOT_PERFORM));
    }
  } catch (err) {
    return NextResponse.json(createPaymeErrorResponse(0, PAYME_ERRORS.CANNOT_PERFORM));
  }
}

