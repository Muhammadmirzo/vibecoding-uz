import { NextResponse } from "next/server";
import { db } from "@/db";
import { users, sessions, otpCodes, userProfiles } from "@/db/schema";
import { eq, and, isNull, gte, lt, desc } from "drizzle-orm";
import { otpVerifySchema } from "@/lib/validations";
import { normalizePhone, verifyOtpCode } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/security/rateLimit";

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
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          phone: normalizedPhone,
          fullName: fullName || "Foydalanuvchi",
          role: "student",
          lastLoginAt: new Date(),
        })
        .returning();

      user = newUser;

      // Create user profile
      await db
        .insert(userProfiles)
        .values({ userId: user.id })
        .onConflictDoNothing();
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

    await setSessionCookie(token, expiresAt);

    return NextResponse.json({
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
  } catch (error) {
    console.error("OTP verify error:", error);
    return NextResponse.json(
      { error: "Kodni tekshirishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
