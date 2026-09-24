import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { drizzlePaymentsRepository } from "@/features/payments/server/payments.repository";
import { refundRequestSchema, requestRefund } from "@/features/payments/server/refund.service";
import { errorResponse } from "@/lib/http/errors";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(`refund:${ip}`, PRESETS.REFERRAL);
    if (!rl.success) return createRateLimitResponse(rl);

    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;

    const parsed = refundRequestSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) return errorResponse(parsed.error);

    const outcome = await requestRefund(drizzlePaymentsRepository, {
      ...parsed.data,
      userId: authResult.session.userId,
    });

    await drizzlePaymentsRepository.recordAudit({
      userId: authResult.session.userId,
      action: "payment.refund_requested",
      entityType: "refund_request",
      entityId: outcome.refundId,
      details: { paymentId: parsed.data.paymentId, amountTiyin: outcome.amountTiyin, replay: outcome.replay },
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      refundId: outcome.refundId,
      status: outcome.status,
      message: "Pulni qaytarish so'rovi qabul qilindi. Kursga kirish to'xtatildi.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
