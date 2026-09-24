import { NextResponse } from "next/server";
import { otpVerifySchema } from "@/lib/validations";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/http/errors";
import { drizzleAuthUserRepository } from "@/features/auth/server/auth-user.repository";
import { drizzleAuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import { drizzleOtpRepository } from "@/features/auth/server/otp.repository";
import { verifyOtp } from "@/features/auth/server/otp.service";
import { drizzleRegistrationRepository } from "@/features/auth/server/registration.repository";
import { drizzleReferralsRepository } from "@/features/referrals/server/referrals.repository";
import { clearRefCodeCookie, parseRefCodeCookie } from "@/features/referrals/domain/referral-code";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const verifyRl = await checkRateLimit(ip, { limit: 10, windowSeconds: 300, prefix: "otp_verify" });
    if (!verifyRl.success) {
      return createRateLimitResponse(verifyRl);
    }

    const parsed = otpVerifySchema.parse(await request.json());
    const purpose = parsed.purpose || "login";

    const outcome = await verifyOtp(
      drizzleOtpRepository,
      drizzleAuthUserRepository,
      drizzleAuthSessionRepository,
      drizzleReferralsRepository,
      drizzleRegistrationRepository,
      { sign: (payload) => createSessionToken(payload) },
      {
        phone: parsed.phone,
        code: parsed.code,
        fullName: parsed.fullName,
        purpose,
        refCode: parseRefCodeCookie(request.headers.get("cookie")),
        ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || ip || undefined,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    );

    const response = NextResponse.json({ success: true, user: outcome.user });
    response.headers.set(
      "Set-Cookie",
      setSessionCookie(outcome.token, {
        maxAgeSeconds: 30 * 24 * 3600,
        path: "/",
        httpOnly: true,
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      }),
    );
    if (outcome.refCodeAttributed) response.headers.append("Set-Cookie", clearRefCodeCookie());
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
