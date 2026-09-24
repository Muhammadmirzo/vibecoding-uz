import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { studentPaymentRequestSchema } from "@/lib/validations";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  PRESETS,
} from "@/lib/security/rateLimit";
import { createCheckout, checkoutInputSchema, CheckoutError } from "@/features/payments/server/checkout.service";
import { drizzlePaymentsRepository } from "@/features/payments/server/payments.repository";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(`checkout:${ip}`, PRESETS.CHECKOUT);
    if (!rl.success) return createRateLimitResponse(rl);

    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;

    const parsed = studentPaymentRequestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Ma'lumotlar noto'g'ri kiritildi" }, { status: 400 });
    }
    const input = checkoutInputSchema.safeParse(parsed.data);
    if (!input.success) {
      return NextResponse.json({ error: "Ma'lumotlar noto'g'ri kiritildi" }, { status: 400 });
    }

    const result = await createCheckout(
      drizzlePaymentsRepository,
      { ...input.data, userId: authResult.session.userId },
    );

    await drizzlePaymentsRepository.recordAudit({
      userId: authResult.session.userId,
      action: "payment.checkout_initiated",
      entityType: "payment",
      entityId: result.paymentId,
      details: { provider: input.data.provider, amountTiyin: result.amountTiyin, reused: result.reused, sandbox: result.sandbox },
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      paymentId: result.paymentId,
      checkoutUrl: result.checkoutUrl,
      sandbox: result.sandbox,
      message: result.sandbox
        ? "Development sandbox: real to'lov amalga oshirilmadi"
        : result.reused ? "Mavjud to'lov sessiyasi qaytarildi" : "To'lov sessiyasi yaratildi",
    });
  } catch (error) {
    if (error instanceof CheckoutError) {
      const status = error.code === "PROVIDER_UNAVAILABLE" ? 503 : error.code === "NOT_FOUND" ? 404 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    console.error("POST /api/payments/checkout error:", error);
    return NextResponse.json({ error: "To'lov jarayonini boshlashda xatolik yuz berdi" }, { status: 500 });
  }
}
