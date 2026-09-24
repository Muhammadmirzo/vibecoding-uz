import { BRAND } from "@/config/brand";
import { created } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { telegramStartResponseSchema } from "@/features/mobile/contracts-auth";
import { errorEnvelopeSchema } from "@/features/mobile/contracts-resources";
import { startTelegramLogin } from "@/features/auth/server/telegram-login.service";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";

registerV1Route({
  method: "post",
  path: "/api/v1/auth/telegram/start",
  tags: ["auth"],
  summary: "Telegram deep-link login boshlash (mobil)",
  responses: {
    200: { description: "Deep link + claim token", content: { "application/json": { schema: telegramStartResponseSchema } } },
    429: { description: "Juda ko'p urinish", content: { "application/json": { schema: errorEnvelopeSchema } } },
  },
});

export async function POST(request: Request) {
  return v1Public(request, async () => {
    const ip = getClientIp(request);
    const limited = await checkRateLimit(ip, { ...PRESETS.LOGIN, limit: 8, prefix: "telegram-start" });
    if (!limited.success) return createRateLimitResponse(limited);
    const result = await startTelegramLogin(
      { ip, userAgent: request.headers.get("user-agent") ?? undefined },
      BRAND.telegramBot,
    );
    // Cookie o'rniga token body'da qaytadi — app uni Keychain'da 5 daqiqa saqlaydi.
    return created({
      id: result.id, deepLink: result.deepLink,
      token: result.token, expiresAt: result.expiresAt.toISOString(),
    });
  });
}
