import { NextResponse } from "next/server";
import { getTelegramLoginStatus } from "@/features/auth/server/telegram-login.service";
import { createSessionToken, setSessionCookie } from "@/lib/auth/session";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { errorResponse } from "@/lib/http/errors";

function cookieValue(request: Request, id: string): string | null {
  const raw = request.headers.get("cookie") ?? "";
  const match = raw.split(";").map((part) => part.trim()).find((part) => part.startsWith(`tg_login_${id}=`));
  return match ? decodeURIComponent(match.slice(`tg_login_${id}=`.length)) : null;
}

export async function GET(request: Request) {
  try {
    const id = new URL(request.url).searchParams.get("id");
    if (!id || !/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ state: "unknown" }, { status: 400 });
    const limit = await checkRateLimit(getClientIp(request), { ...PRESETS.LOGIN, limit: 30, prefix: "telegram-status" });
    if (!limit.success) return createRateLimitResponse(limit);
    const result = await getTelegramLoginStatus(id, cookieValue(request, id), { sign: createSessionToken });
    if (result.state === "approved" && result.token && result.user) {
      const response = NextResponse.json({ state: "approved", user: result.user });
      response.headers.set("Set-Cookie", setSessionCookie(result.token, { maxAgeSeconds: 30 * 24 * 3600, path: "/", httpOnly: true, sameSite: "Lax", secure: process.env.NODE_ENV === "production" }));
      response.cookies.set(`tg_login_${id}`, "", { maxAge: 0, path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
      return response;
    }
    return NextResponse.json({ state: result.state });
  } catch (error) { return errorResponse(error); }
}
