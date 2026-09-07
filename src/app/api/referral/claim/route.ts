import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";
import { getAuthSession } from "@/lib/auth/session";
import { referralClaimBonusSchema } from "@/lib/validations";

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
    const parseResult = referralClaimBonusSchema.safeParse(body);

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

    // Log referral bonus withdrawal request
    await db.insert(auditLogs).values({
      userId: authSession.userId,
      action: "referral.claim_bonus",
      entityType: "referral_payout",
      details: {
        payoutMethod: data.payoutMethod,
        cardNumber: data.cardNumber ? data.cardNumber.slice(0, 4) + " **** **** " + data.cardNumber.slice(-4) : null,
        amountSum: data.amountSum,
        requestedAt: new Date().toISOString(),
      },
      ipAddress: request.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return NextResponse.json({
      success: true,
      message: `${data.amountSum.toLocaleString("uz-UZ")} UZS miqdoridagi referral bonusi bo'yicha so'rovingiz qabul qilindi. 24 soat ichida hisobingizga o'tkaziladi.`,
    });
  } catch (error) {
    console.error("POST /api/referral/claim error:", error);
    return NextResponse.json(
      { error: "So'rovni yuborishda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
