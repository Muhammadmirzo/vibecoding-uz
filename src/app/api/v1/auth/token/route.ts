import { verifyPassword } from "@/lib/auth/password";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { fail, created } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { tokenRequestSchema, tokenResponseSchema } from "@/features/mobile/contracts-auth";
import { errorEnvelopeSchema } from "@/features/mobile/contracts-resources";
import { drizzleAuthUserRepository } from "@/features/auth/server/auth-user.repository";
import { drizzleAuthSessionRepository } from "@/features/auth/server/auth-session.repository";
import { loginWithPassword } from "@/features/auth/server/password-auth.service";
import { drizzleRefreshTokenRepository } from "@/features/mobile/server/refresh-token.repository";
import { issueTokenPair } from "@/features/mobile/server/token.service";

registerV1Route({
  method: "post",
  path: "/api/v1/auth/token",
  tags: ["auth"],
  summary: "Telefon + parol orqali mobil tokenlar olish",
  request: { body: { content: { "application/json": { schema: tokenRequestSchema } } } },
  responses: {
    201: { description: "Access + refresh tokenlar", content: { "application/json": { schema: tokenResponseSchema } } },
    429: { description: "Juda ko'p urinish", content: { "application/json": { schema: errorEnvelopeSchema } } },
  },
});

export async function POST(request: Request) {
  return v1Public(request, async () => {
    const ip = getClientIp(request);
    const limited = await checkRateLimit(ip, PRESETS.LOGIN);
    if (!limited.success) return createRateLimitResponse(limited);

    const input = tokenRequestSchema.parse(await request.json());
    let captured: { sessionId: string; userId: string; role: string } | null = null;
    const outcome = await loginWithPassword(
      drizzleAuthUserRepository,
      drizzleAuthSessionRepository,
      { verify: verifyPassword },
      { sign: async (payload) => { captured = payload; return "mobile-deferred"; } },
      { identity: input.phone, password: input.password, ip, userAgent: request.headers.get("user-agent") ?? undefined },
    );
    if (!captured) return fail(new Error("Sessiya yaratilmadi"));
    const pair = await issueTokenPair(drizzleRefreshTokenRepository, {
      userId: outcome.user.id, role: outcome.user.role,
      sessionId: (captured as { sessionId: string }).sessionId,
      device: { deviceId: input.deviceId, deviceName: input.deviceName, platform: input.platform, appVersion: input.appVersion },
    });
    console.info("[mobile-auth] token issued", { userId: outcome.user.id, deviceId: input.deviceId, platform: input.platform });
    return created({ ...pair, user: outcome.user });
  });
}
