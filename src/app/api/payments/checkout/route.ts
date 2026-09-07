import { NextResponse } from "next/server";
import { db } from "@/db";
import { payments, auditLogs } from "@/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { studentPaymentRequestSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const authSession = await getAuthSession();
    if (!authSession) {
      return NextResponse.json(
        { error: "Avtorizatsiyadan o'tilmagan" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parseResult = studentPaymentRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Create a pending payment record
    const [newPayment] = await db
      .insert(payments)
      .values({
        userId: authSession.userId,
        enrollmentId: data.enrollmentId || null,
        provider: data.provider,
        amountSum: data.amountSum.toFixed(2),
        status: "pending",
        meta: {
          installmentMonth: data.installmentMonth || 1,
          initiatedAt: new Date().toISOString(),
        },
      })
      .returning();

    // Generate mock/demo checkout URL for Payme or Click
    let checkoutUrl = "";
    if (data.provider === "payme") {
      const merchantId = process.env.PAYME_MERCHANT_ID || "vibecoding_demo_merchant";
      const base64Params = Buffer.from(
        `m=${merchantId};ac.order_id=${newPayment.id};a=${data.amountSum * 100}`
      ).toString("base64");
      checkoutUrl = `https://checkout.paycom.uz/${base64Params}`;
    } else {
      const serviceId = process.env.CLICK_SERVICE_ID || "12345";
      const merchantId = process.env.CLICK_MERCHANT_ID || "67890";
      checkoutUrl = `https://my.click.uz/services/pay?service_id=${serviceId}&merchant_id=${merchantId}&amount=${data.amountSum}&transaction_param=${newPayment.id}`;
    }

    await db.insert(auditLogs).values({
      userId: authSession.userId,
      action: "payment.checkout_initiated",
      entityType: "payment",
      entityId: newPayment.id,
      details: {
        provider: data.provider,
        amountSum: data.amountSum,
        installmentMonth: data.installmentMonth,
      },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      paymentId: newPayment.id,
      checkoutUrl,
      message: "To'lov sessiyasi yaratildi",
    });
  } catch (error) {
    console.error("POST /api/payments/checkout error:", error);
    return NextResponse.json(
      { error: "To'lov jarayonini boshlashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
