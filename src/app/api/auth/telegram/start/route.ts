import { NextResponse } from "next/server";
import { BRAND } from "@/config/brand";
import { startTelegramLogin } from "@/features/auth/server/telegram-login.service";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/http/errors";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = await checkRateLimit(ip, { ...PRESETS.LOGIN, limit: 8, prefix: "telegram-start" });
    if (!limit.success) return createRateLimitResponse(limit);
    const result = await startTelegramLogin({ ip, userAgent: request.headers.get("user-agent") ?? undefined }, BRAND.telegramBot);
    const response = NextResponse.json({ id: result.id, deepLink: result.deepLink, expiresAt: result.expiresAt.toISOString() });
    response.headers.set("Set-Cookie", `tg_login_${result.id}=${encodeURIComponent(result.token)}; Max-Age=300; Path=/; HttpOnly; SameSite=Lax; Secure=${process.env.NODE_ENV === "production"}`);
    return response;
  } catch (error) { return errorResponse(error); }
}
