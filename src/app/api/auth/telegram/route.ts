import { NextResponse } from "next/server";
import { telegramAuthSchema } from "@/lib/validations/telegram";
import { verifyTelegramAuth, isFresh } from "@/lib/telegram/verify";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  PRESETS,
} from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/http/errors";
import { drizzleAuthUserRepository } from "@/features/auth/server/auth-user.repository";
import { drizzleAuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import { loginWithTelegram } from "@/features/auth/server/telegram-auth.service";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rl = await checkRateLimit(ip, PRESETS.LOGIN);
    if (!rl.success) return createRateLimitResponse(rl);

    const parsed = telegramAuthSchema.parse(await request.json());
    const result = await loginWithTelegram(
      drizzleAuthUserRepository,
      drizzleAuthSessionRepository,
      { verify: verifyTelegramAuth, isFresh },
      { sign: (payload) => createSessionToken(payload) },
      process.env.TELEGRAM_BOT_TOKEN,
      {
        ...parsed,
        ip,
        userAgent: request.headers.get("user-agent") || undefined,
      },
    );

    if (!result.ok) {
      // users.phone is NOT NULL — never invent a fake phone. Client must link phone first.
      return NextResponse.json(
        {
          error: "Telefon raqamni ulash talab qilinadi",
          code: "phone_link_required",
          tgUserId: result.tgUserId,
          tgUsername: result.tgUsername,
          fullName: result.fullName,
        },
        { status: 422 },
      );
    }

    const response = NextResponse.json({ success: true, user: result.outcome.user });
    response.headers.set(
      "Set-Cookie",
      setSessionCookie(result.outcome.token, {
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
