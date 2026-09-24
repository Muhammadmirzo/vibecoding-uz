import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/require-auth";
import { referralClaimBonusSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { drizzleReferralsRepository } from "@/features/referrals/server/referrals.repository";
import { payoutRequestSchema, requestPayout } from "@/features/referrals/server/payout.service";
import { TIYIN_PER_SUM } from "@/features/payments/domain/money";
import { errorResponse } from "@/lib/http/errors";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(`referral:${ip}`, PRESETS.REFERRAL);
    if (!rl.success) return createRateLimitResponse(rl);

    const authResult = await requireAuth(request);
    if (!authResult.ok) return authResult.response;

    const legacy = referralClaimBonusSchema.safeParse(await request.json().catch(() => null));
    if (!legacy.success) return errorResponse(legacy.error);

    // Legacy clients send amountSum (sum); the service works in tiyin and
    // re-checks the amount against the server-computed balance.
    const parsed = payoutRequestSchema.safeParse({
      payoutMethod: legacy.data.payoutMethod,
      cardNumber: legacy.data.cardNumber,
      cardHolder: legacy.data.cardHolder,
      amountTiyin: Math.round(legacy.data.amountSum * TIYIN_PER_SUM),
    });
    if (!parsed.success) return errorResponse(parsed.error);

    const outcome = await requestPayout(drizzleReferralsRepository, {
      ...parsed.data,
      userId: authResult.session.userId,
    });

    await drizzleReferralsRepository.recordAudit({
      userId: authResult.session.userId,
      action: "referral.claim_bonus",
      entityType: "referral_payout",
      entityId: outcome.payoutId,
      details: {
        payoutMethod: parsed.data.payoutMethod,
        cardLast4: parsed.data.cardNumber ? parsed.data.cardNumber.slice(-4) : null,
        amountTiyin: outcome.amountTiyin,
      },
      ip: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      payoutId: outcome.payoutId,
      status: outcome.status,
      balanceTiyin: outcome.balanceTiyin,
      message: "So'rovingiz qabul qilindi. 24 soat ichida hisobingizga o'tkaziladi.",
    });
  } catch (error) {
    return errorResponse(error);
  }
}
