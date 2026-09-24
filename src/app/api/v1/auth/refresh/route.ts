import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { ok } from "@/lib/api/v1/respond";
import { v1Public } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { refreshRequestSchema, tokenResponseSchema } from "@/features/mobile/contracts-auth";
import { checkRateLimit, createRateLimitResponse, getClientIp, PRESETS } from "@/lib/security/rateLimit";
import { drizzleRefreshTokenRepository } from "@/features/mobile/server/refresh-token.repository";
import { rotateRefreshToken } from "@/features/mobile/server/token.service";
import { toPublicUser } from "@/features/auth/server/password-auth.service";
import { drizzleAuthUserRepository } from "@/features/auth/server/auth-user.repository";

registerV1Route({
  method: "post",
  path: "/api/v1/auth/refresh",
  tags: ["auth"],
  summary: "Refresh token rotatsiyasi (reuse → oila revoke)",
  request: { body: { content: { "application/json": { schema: refreshRequestSchema } } } },
  responses: {
    200: { description: "Yangi token juftligi", content: { "application/json": { schema: tokenResponseSchema } } },
  },
});

export async function POST(request: Request) {
  return v1Public(request, async () => {
    const limited = await checkRateLimit(getClientIp(request), { ...PRESETS.LOGIN, limit: 30, prefix: "mobile-refresh" });
    if (!limited.success) return createRateLimitResponse(limited);

    const input = refreshRequestSchema.parse(await request.json());
    const outcome = await rotateRefreshToken(
      drizzleRefreshTokenRepository,
      { findRole: async (userId) => (await db.select({ role: users.role }).from(users).where(eq(users.id, userId)).limit(1))[0]?.role ?? null },
      input.refreshToken,
    );
    const user = await drizzleAuthUserRepository.findById(outcome.userId);
    console.info("[mobile-auth] token rotated", { userId: outcome.userId, sessionId: outcome.sessionId });
    return ok({ ...outcome.pair, user: user ? toPublicUser(user) : { id: outcome.userId, role: outcome.role } });
  });
}
