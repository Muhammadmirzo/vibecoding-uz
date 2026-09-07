import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

import {
  clickStore,
  computeClickSign,
  ClickTransactionRecord,
} from "@/features/payments/click";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData().catch(() => new FormData());
    const clickTransId = String(formData.get("click_trans_id") || "");
    const serviceId = String(formData.get("service_id") || "");
    const merchantTransId = String(formData.get("merchant_trans_id") || "");
    const merchantPrepareIdParam = String(formData.get("merchant_prepare_id") || "");
    const amount = String(formData.get("amount") || "");
    const action = String(formData.get("action") || ""); // 0 = Prepare, 1 = Complete
    const error = formData.get("error");
    const signTime = String(formData.get("sign_time") || "");
    const signString = String(formData.get("sign_string") || "");

    const secretKey = process.env.CLICK_SECRET_KEY;
    if (secretKey && signString) {
      const expectedSign = computeClickSign(
        clickTransId,
        serviceId,
        secretKey,
        merchantTransId,
        merchantPrepareIdParam,
        amount,
        action,
        signTime
      );
      if (signString.toLowerCase() !== expectedSign.toLowerCase()) {
        return NextResponse.json({
          error: -1,
          error_note: "SIGN CHECK FAILED",
        });
      }
    }

    if (error && Number(error) < 0) {
      return NextResponse.json({
        error: -1,
        error_note: "Tranzaksiya xatolik bilan yakunlandi",
      });
    }

    const numClickTransId = Number(clickTransId) || 0;
    const storeKey = `click:${clickTransId}`;

    // Action 0: Prepare phase
    if (action === "0") {
      const existing = clickStore.get(storeKey);
      if (existing) {
        return NextResponse.json({
          click_trans_id: existing.clickTransId,
          merchant_trans_id: existing.merchantTransId,
          merchant_prepare_id: existing.merchantPrepareId,
          error: 0,
          error_note: "Success",
        });
      }

      const prepareId = Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
      const record: ClickTransactionRecord = {
        clickTransId: numClickTransId,
        merchantTransId,
        merchantPrepareId: prepareId,
        amount: Number(amount) || 0,
        status: "prepared",
        createdAt: Date.now(),
      };
      clickStore.set(storeKey, record);

      return NextResponse.json({
        click_trans_id: numClickTransId,
        merchant_trans_id: merchantTransId,
        merchant_prepare_id: prepareId,
        error: 0,
        error_note: "Success",
      });
    }

    // Action 1: Complete phase
    if (action === "1") {
      const existing = clickStore.get(storeKey);

      if (existing && existing.status === "completed") {
        // Idempotent replay for already completed transaction
        return NextResponse.json({
          click_trans_id: existing.clickTransId,
          merchant_trans_id: existing.merchantTransId,
          merchant_confirm_id: existing.merchantConfirmId || existing.merchantPrepareId,
          error: 0,
          error_note: "Success",
        });
      }

      const prepareId = existing?.merchantPrepareId || Number(merchantPrepareIdParam) || Math.floor(Date.now() / 1000);
      const confirmId = prepareId + 1;

      const record: ClickTransactionRecord = {
        clickTransId: numClickTransId,
        merchantTransId,
        merchantPrepareId: prepareId,
        merchantConfirmId: confirmId,
        amount: Number(amount) || 0,
        status: "completed",
        createdAt: existing?.createdAt || Date.now(),
      };
      clickStore.set(storeKey, record);

      return NextResponse.json({
        click_trans_id: numClickTransId,
        merchant_trans_id: merchantTransId,
        merchant_confirm_id: confirmId,
        error: 0,
        error_note: "Success",
      });
    }

    return NextResponse.json({ error: -3, error_note: "Action not found" });
  } catch (err) {
    return NextResponse.json({ error: -1, error_note: "Server error" });
  }
}

