import { NextResponse } from "next/server";
import { db } from "@/db";
import { otpCodes } from "@/db/schema";
import { otpSendSchema } from "@/lib/validations";
import { normalizePhone, hashOtpCode } from "@/lib/auth/password";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { sendOtpSms, redactPhone } from "@/lib/sms/eskiz";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipRlResult = await checkRateLimit(ip, PRESETS.OTP);
    if (!ipRlResult.success) {
      return createRateLimitResponse(ipRlResult);
    }

    const body = await request.json();
    const parseResult = otpSendSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Ma'lumotlar noto'g'ri kiritildi",
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const phone = parseResult.data.phone;
    const purpose = parseResult.data.purpose || "login";
    const normalizedPhone = normalizePhone(phone);

    // Enforce strict rate limit per phone number: max 3 OTP requests per 5 minutes
    const phoneRlResult = await checkRateLimit(`phone:${normalizedPhone}`, PRESETS.OTP);
    if (!phoneRlResult.success) {
      return createRateLimitResponse(phoneRlResult);
    }

    // Generate random 6-digit OTP code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const codeHash = hashOtpCode(code);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiration

    await db.insert(otpCodes).values({
      phone: normalizedPhone,
      codeHash,
      purpose,
      expiresAt,
    });

    // Send SMS via Eskiz.uz API or mock provider fallback
    const smsResult = await sendOtpSms({
      phone: normalizedPhone,
      code,
    });

    const isProd = process.env.NODE_ENV === "production";

    // Fail closed in production mode if provider fails or mock mode is active
    if (isProd) {
      if (!smsResult.success || smsResult.mock) {
        return NextResponse.json(
          { error: "SMS xizmatida vaqtincha uzilish yuz berdi. Iltimos, keyinroq qayta urinib ko'ring." },
          { status: 503 }
        );
      }
    } else {
      if (!smsResult.success) {
        return NextResponse.json(
          { error: smsResult.error || "SMS yuborishda xatolik yuz berdi." },
          { status: 500 }
        );
      }
    }

    console.log(`[SMS OTP] Sent to ${redactPhone(normalizedPhone)} (Mock: ${Boolean(smsResult.mock)})`);

    return NextResponse.json({
      success: true,
      message: "SMS kod yuborildi",
      expiresAt: expiresAt.toISOString(),
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    });
  } catch (error) {
    console.error("OTP send error:", error);
    return NextResponse.json(
      { error: "SMS kod yuborishda xatolik yuz berdi." },
      { status: 500 }
    );
  }
}
