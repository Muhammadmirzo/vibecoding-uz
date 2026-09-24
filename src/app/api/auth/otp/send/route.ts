import { NextResponse } from "next/server";
import { randomInt } from "crypto";
import { otpSendSchema } from "@/lib/validations";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { sendOtpSms, redactPhone } from "@/lib/sms/eskiz";
import { errorResponse } from "@/lib/http/errors";
import { drizzleOtpRepository } from "@/features/auth/server/otp.repository";
import { requestOtp } from "@/features/auth/server/otp.service";

// NOTE(W5-ARCH): `randomInt` (CSPRNG) intentionally stays in this route file —
// the W1-SEC hardening test asserts the route source uses the crypto-based
// generator. The DB insert + SMS send live in `requestOtp`.
export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const ipRlResult = await checkRateLimit(ip, PRESETS.OTP);
    if (!ipRlResult.success) {
      return createRateLimitResponse(ipRlResult);
    }

    const parsed = otpSendSchema.parse(await request.json());
    const purpose = parsed.purpose || "login";

    // Enforce strict rate limit per phone number: max 3 OTP requests per 5 minutes
    const phoneRlResult = await checkRateLimit(`phone:${parsed.phone}`, PRESETS.OTP);
    if (!phoneRlResult.success) {
      return createRateLimitResponse(phoneRlResult);
    }

    // Generate random 6-digit OTP code via CSPRNG
    const code = randomInt(100000, 1000000).toString();
    const outcome = await requestOtp(
      drizzleOtpRepository,
      { send: (input) => sendOtpSms(input) },
      {
        phone: parsed.phone,
        purpose,
        code,
        isProduction: process.env.NODE_ENV === "production",
      },
    );

    if (!outcome.ok) {
      return NextResponse.json(
        { error: "SMS xizmatida vaqtincha uzilish yuz berdi. Iltimos, keyinroq qayta urinib ko'ring." },
        { status: 503 },
      );
    }

    console.log(`[SMS OTP] Sent to ${redactPhone(parsed.phone)}`);

    return NextResponse.json({
      success: true,
      message: "SMS kod yuborildi",
      expiresAt: outcome.expiresAt.toISOString(),
      ...(process.env.NODE_ENV === "development" ? { devCode: code } : {}),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
