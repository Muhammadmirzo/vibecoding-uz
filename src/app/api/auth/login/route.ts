import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validations";
import { verifyPassword } from "@/lib/auth/password";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, getClientIp, createRateLimitResponse, PRESETS } from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/http/errors";
import { drizzleAuthUserRepository } from "@/features/auth/server/auth-user.repository";
import { drizzleAuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import { loginWithPassword } from "@/features/auth/server/password-auth.service";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rlResult = await checkRateLimit(ip, PRESETS.LOGIN);
    if (!rlResult.success) {
      return createRateLimitResponse(rlResult);
    }

    const { phone, password = "" } = loginSchema.parse(await request.json());
    const outcome = await loginWithPassword(
      drizzleAuthUserRepository,
      drizzleAuthSessionRepository,
      { verify: verifyPassword },
      { sign: (payload) => createSessionToken(payload) },
      {
        identity: phone,
        password,
        ip,
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
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
