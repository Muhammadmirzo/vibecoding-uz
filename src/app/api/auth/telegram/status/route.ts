import { NextResponse } from "next/server";
import { getTelegramLoginStatus } from "@/features/auth/server/telegram-login.service";
import { SESSION_COOKIE_NAME, createSessionToken } from "@/lib/auth/session";
import { errorResponse } from "@/lib/http/errors";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { telegramRequestIdSchema } from "@/lib/validations/auth";
import { clearRefCodeCookie, parseRefCodeCookie } from "@/features/referrals/domain/referral-code";

function cookieValue(request: Request, id: string): string | null {
  const name = `tg_login_${id}`;
  const match = (request.headers.get("cookie") ?? "")
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  if (!match) return null;
  try {
    return decodeURIComponent(match.slice(name.length + 1));
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    const id = telegramRequestIdSchema.safeParse(new URL(request.url).searchParams.get("id"));
    if (!id.success) return NextResponse.json({ state: "unknown" }, { status: 400 });

    const limit = await checkRateLimit(getClientIp(request), {
      ...PRESETS.LOGIN,
      limit: 30,
      prefix: "telegram-status",
    });
    if (!limit.success) return createRateLimitResponse(limit);

    const result = await getTelegramLoginStatus(
      id.data,
      cookieValue(request, id.data),
      { sign: createSessionToken },
      undefined,
      // The visitor's referral cookie rides along, exactly like phone signup.
      { refCode: parseRefCodeCookie(request.headers.get("cookie")) },
    );
    if (result.state === "approved" && result.token && result.user) {
      const secure = process.env.NODE_ENV === "production";
      const response = NextResponse.json({ state: "approved", user: result.user });
      response.cookies.set(SESSION_COOKIE_NAME, result.token, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure,
      });
      response.cookies.set(`tg_login_${id.data}`, "", {
        maxAge: 0,
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        secure,
      });
      if (result.refCodeAttributed) response.headers.append("Set-Cookie", clearRefCodeCookie());
      return response;
    }
    return NextResponse.json({ state: result.state });
  } catch (error) {
    return errorResponse(error);
  }
}
