import { ok } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { telegramStatusRequestSchema, telegramStatusResponseSchema } from "@/features/mobile/contracts-auth";
import { getTelegramLoginStatus } from "@/features/auth/server/telegram-login.service";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { drizzleRefreshTokenRepository } from "@/features/mobile/server/refresh-token.repository";
import { issueTokenPair } from "@/features/mobile/server/token.service";

registerV1Route({
  method: "post",
  path: "/api/v1/auth/telegram/status",
  tags: ["auth"],
  summary: "Telegram login holatini so'rash (tasdiqlanganda tokenlar)",
  request: { body: { content: { "application/json": { schema: telegramStatusRequestSchema } } } },
  responses: {
    200: { description: "Holat + tasdiqlanganda tokenlar", content: { "application/json": { schema: telegramStatusResponseSchema } } },
  },
});

export async function POST(request: Request) {
  return v1Public(request, async () => {
    const limited = await checkRateLimit(getClientIp(request), { ...PRESETS.LOGIN, limit: 30, prefix: "telegram-status" });
    if (!limited.success) return createRateLimitResponse(limited);

    const input = telegramStatusRequestSchema.parse(await request.json());
    let captured: { sessionId: string; userId: string; role: string } | null = null;
    const result = await getTelegramLoginStatus(input.id, input.token, {
      sign: async (payload) => { captured = payload; return "mobile-deferred"; },
    });
    if (result.state !== "approved" || !result.user || !captured) {
      return ok({ state: result.state });
    }
    const sid = (captured as { sessionId: string }).sessionId;
    const pair = await issueTokenPair(drizzleRefreshTokenRepository, {
      userId: result.user.id, role: result.user.role, sessionId: sid,
      device: { deviceId: input.deviceId, deviceName: input.deviceName, platform: input.platform, appVersion: input.appVersion },
    });
    console.info("[mobile-auth] telegram token issued", { userId: result.user.id, deviceId: input.deviceId });
    return ok({ state: "approved" as const, tokens: { ...pair, user: result.user } });
  });
}
