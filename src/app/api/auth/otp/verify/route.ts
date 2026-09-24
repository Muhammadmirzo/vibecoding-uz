import { NextResponse } from "next/server";
import { db, withTransactionLock } from "@/db";
import { users, sessions, otpCodes } from "@/db/schema";
import { eq, and, isNull, gte, lt, desc } from "drizzle-orm";
import { otpVerifySchema } from "@/lib/validations";
import { normalizePhone, verifyOtpCode } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/security/rateLimit";
import { drizzleRegistrationRepository } from "@/features/auth/server/registration.repository";
import { drizzleReferralsRepository } from "@/features/referrals/server/referrals.repository";
import { attributeReferralFromCookieTx } from "@/features/referrals/server/attribution.service";
import { clearRefCodeCookie, parseRefCodeCookie } from "@/features/referrals/domain/referral-code";
import type { DbExecutor } from "@/features/payments/server/payments.repository";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const verifyRl = await checkRateLimit(ip, { limit: 10, windowSeconds: 300, prefix: "otp_verify" });
    if (!verifyRl.success) {
      return createRateLimitResponse(verifyRl);
    }

    const body = await request.json();
    const parseResult = otpVerifySchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { phone, code, fullName } = parseResult.data;
    const purpose = parseResult.data.purpose || "login";
    const normalizedPhone = normalizePhone(phone);

    // Fetch active non-expired unused OTP code record
    const [otpRecord] = await db
      .select()
      .from(otpCodes)
      .where(
        and(
          eq(otpCodes.phone, normalizedPhone),
          eq(otpCodes.purpose, purpose),
          isNull(otpCodes.usedAt),
          gte(otpCodes.expiresAt, new Date()),
          lt(otpCodes.attempts, 5)
        )
      )
      .orderBy(desc(otpCodes.createdAt))
      .limit(1);

    if (!otpRecord) {
      return NextResponse.json(
        { error: "SMS kod topilmadi, muddati o'tgan yoki urinishlar soni tugagan" },
        { status: 400 }
      );
    }

    // Increment attempts
    await db
      .update(otpCodes)
      .set({ attempts: otpRecord.attempts + 1 })
      .where(eq(otpCodes.id, otpRecord.id));

    // Verify OTP code hash
    const isCodeValid = verifyOtpCode(code, otpRecord.codeHash);
    if (!isCodeValid) {
      return NextResponse.json(
        { error: "SMS kod noto'g'ri" },
        { status: 400 }
      );
    }

    // Mark OTP code as used
    await db
      .update(otpCodes)
      .set({ usedAt: new Date() })
      .where(eq(otpCodes.id, otpRecord.id));

    // Check or create user
    let refCodeAttributed = false;
    let [user] = await db
      .select()
      .from(users)
      .where(eq(users.phone, normalizedPhone))
      .limit(1);

    if (user) {
      // Update last login timestamp and name if provided
      const updatePayload: { lastLoginAt: Date; fullName?: string } = {
        lastLoginAt: new Date(),
      };
      if (fullName && (user.fullName === "Foydalanuvchi" || !user.fullName)) {
        updatePayload.fullName = fullName;
      }

      await db
        .update(users)
        .set(updatePayload)
        .where(eq(users.id, user.id));

      // Refresh local reference
      if (updatePayload.fullName) {
        user.fullName = updatePayload.fullName;
      }
    } else {
      // New-user registration: user + profile + referral attribution run
      // inside one transaction. Attribution only happens here — existing
      // users keep their (possibly absent) referrer untouched.
      const refCode = parseRefCodeCookie(request.headers.get("cookie"));
      type RegistrationTxOutcome = { user: typeof users.$inferSelect; attributed: boolean };
      const registration = await withTransactionLock<RegistrationTxOutcome>(
        `registration:${normalizedPhone}`,
        async (tx: DbExecutor | null | undefined) => {
          const ex = tx ?? null;
          if (!ex) throw new Error("Registration database transaction is unavailable");
          const created = await drizzleRegistrationRepository.createUserTx(ex, {
            phone: normalizedPhone,
            fullName: fullName || "Foydalanuvchi",
          });
          await drizzleRegistrationRepository.createProfileTx(ex, created.id);
          const attribution = await attributeReferralFromCookieTx(drizzleReferralsRepository, ex, {
            code: refCode,
            referredUserId: created.id,
          });
          return { user: created, attributed: attribution.attributed };
        },
      );

      user = registration.user;
      if (registration.attributed) refCodeAttributed = true;
    }

    // Create session record
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    const userAgent = request.headers.get("user-agent") || undefined;
    const clientIpHeader = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ip || undefined;

    const [session] = await db
      .insert(sessions)
      .values({
        userId: user.id,
        expiresAt,
        userAgent,
        ip: clientIpHeader,
      })
      .returning();

    // Generate token and set HTTP-only cookie
    const token = await createSessionToken({
      sessionId: session.id,
      userId: user.id,
      role: user.role,
      expiresAt: expiresAt.getTime(),
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
      },
    });

    const cookieHeader = setSessionCookie(token, {
      maxAgeSeconds: 30 * 24 * 3600,
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
      secure: process.env.NODE_ENV === "production",
    });
    response.headers.set("Set-Cookie", cookieHeader);
    if (refCodeAttributed) response.headers.append("Set-Cookie", clearRefCodeCookie());

    return response;
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Kodni tekshirishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
