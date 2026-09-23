import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db";
import { auditLogs, cohorts, enrollments, payments } from "@/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { studentPaymentRequestSchema } from "@/lib/validations";

const SUPPORT_ERROR = "To'lov tizimi vaqtincha sozlanmoqda. Telegram orqali murojaat qiling.";
const uuidSchema = z.string().uuid();

type ProviderConfig = { checkoutUrl: (paymentId: string, minorUnits: number) => string };

function getProviderConfig(provider: "payme" | "click"): ProviderConfig | null {
  if (provider === "payme") {
    const merchantId = process.env.PAYME_MERCHANT_ID?.trim();
    return merchantId ? { checkoutUrl: (paymentId: string, minorUnits: number) => {
      const encoded = Buffer.from(`m=${merchantId};ac.order_id=${paymentId};a=${minorUnits}`).toString("base64");
      return `https://checkout.paycom.uz/${encoded}`;
    } } : null;
  }

  const serviceId = process.env.CLICK_SERVICE_ID?.trim();
  const merchantId = process.env.CLICK_MERCHANT_ID?.trim();
  if (!serviceId || !merchantId) return null;
  return {
    checkoutUrl: (paymentId: string, minorUnits: number) => {
      const amount = (minorUnits / 100).toFixed(2);
      return `https://my.click.uz/services/pay?service_id=${encodeURIComponent(serviceId)}&merchant_id=${encodeURIComponent(merchantId)}&amount=${encodeURIComponent(amount)}&transaction_param=${encodeURIComponent(paymentId)}`;
    },
  };
}

export async function POST(request: Request) {
  try {
    const authSession = await getAuthSession();
    if (!authSession) {
      return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });
    }

    const parsed = studentPaymentRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Ma'lumotlar noto'g'ri kiritildi" }, { status: 400 });
    }

    const data = parsed.data;
    const enrollmentId = uuidSchema.safeParse(data.enrollmentId);
    if (!enrollmentId.success) {
      return NextResponse.json({ error: "To'lov uchun enrollment tanlanishi shart" }, { status: 400 });
    }

    const providerConfig = getProviderConfig(data.provider);
    if (!providerConfig && process.env.NODE_ENV === "production") {
      const supportUrl = process.env.PAYMENT_SUPPORT_TELEGRAM_URL?.trim();
      return NextResponse.json(
        { error: `${SUPPORT_ERROR}${supportUrl ? ` ${supportUrl}` : ""}` },
        { status: 503 }
      );
    }

    const [enrollment] = await db
      .select({ cohortId: enrollments.cohortId, cohortPrice: cohorts.priceSum, earlyPrice: cohorts.earlyPriceSum, earlyDeadline: cohorts.earlyDeadline })
      .from(enrollments)
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .where(and(eq(enrollments.id, enrollmentId.data), eq(enrollments.userId, authSession.userId)))
      .limit(1);

    if (!enrollment) {
      return NextResponse.json({ error: "Enrollment topilmadi" }, { status: 404 });
    }

    const selectedPrice = enrollment.earlyPrice && enrollment.earlyDeadline && enrollment.earlyDeadline.getTime() > Date.now()
      ? enrollment.earlyPrice
      : enrollment.cohortPrice;
    const trustedAmount = Number(selectedPrice).toFixed(2);
    if (!Number.isFinite(Number(trustedAmount)) || Number(trustedAmount) <= 0) {
      return NextResponse.json({ error: "Kurs narxi sozlanmagan" }, { status: 503 });
    }
    const [newPayment] = await db.insert(payments).values({
      userId: authSession.userId,
      enrollmentId: enrollmentId.data,
      provider: data.provider,
      amountSum: trustedAmount,
      status: "pending",
      meta: { installmentMonth: data.installmentMonth ?? 1, initiatedAt: new Date().toISOString() },
    }).returning();

    const minorUnits = Math.round(Number(trustedAmount) * 100);
    const checkoutUrl = providerConfig?.checkoutUrl(newPayment.id, minorUnits) ?? null;
    const isDevSandbox = process.env.NODE_ENV !== "production" && checkoutUrl === null;

    await db.insert(auditLogs).values({
      userId: authSession.userId,
      action: "payment.checkout_initiated",
      entityType: "payment",
      entityId: newPayment.id,
      details: { provider: data.provider, amountSum: trustedAmount, installmentMonth: data.installmentMonth, sandbox: isDevSandbox },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      paymentId: newPayment.id,
      checkoutUrl,
      sandbox: isDevSandbox,
      message: isDevSandbox ? "Development sandbox: real to'lov amalga oshirilmadi" : "To'lov sessiyasi yaratildi",
    });
  } catch (error) {
    console.error("POST /api/payments/checkout error:", error);
    return NextResponse.json({ error: "To'lov jarayonini boshlashda xatolik yuz berdi" }, { status: 500 });
  }
}
