import { NextResponse } from "next/server";
import { BRAND } from "@/config/brand";
import { startTelegramLogin } from "@/features/auth/server/telegram-login.service";
import { errorResponse } from "@/lib/http/errors";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(ip, { ...PRESETS.LOGIN, limit: 8, prefix: "telegram-start" });
    if (!limit.success) return createRateLimitResponse(limit);

    const result = await startTelegramLogin(
      { ip, userAgent: request.headers.get("user-agent") ?? undefined },
      BRAND.telegramBot,
    );
    const response = NextResponse.json({
      id: result.id,
      deepLink: result.deepLink,
      expiresAt: result.expiresAt.toISOString(),
    });
    response.cookies.set(`tg_login_${result.id}`, result.token, {
      maxAge: 5 * 60,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
