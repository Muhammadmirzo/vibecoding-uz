import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { sessionListResponseSchema } from "@/features/mobile/contracts-auth";
import { drizzleRefreshTokenRepository } from "@/features/mobile/server/refresh-token.repository";

registerV1Route({
  method: "get",
  path: "/api/v1/auth/sessions",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["auth"],
  summary: "Faol qurilma sessiyalari ro'yxati",
  responses: {
    200: { description: "Sessiyalar", content: { "application/json": { schema: sessionListResponseSchema } } },
  },
});

export async function GET(request: Request) {
  return v1(request, async ({ session }) => {
    const rows = await drizzleRefreshTokenRepository.listActiveForUser(session.userId);
    const live = rows.filter((r) => r.expiresAt.getTime() > Date.now());
    return ok({
      sessions: live.map((r) => ({
        id: r.id, deviceId: r.deviceId, deviceName: r.deviceName,
        platform: r.platform, appVersion: r.appVersion,
        lastUsedAt: r.lastUsedAt.toISOString(), createdAt: r.createdAt.toISOString(),
        current: r.sessionId === session.sessionId,
      })),
    });
  });
}
