import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { logoutRequestSchema } from "@/features/mobile/contracts-auth";
import { drizzleRefreshTokenRepository } from "@/features/mobile/server/refresh-token.repository";
import { hashRefreshToken } from "@/features/mobile/server/token.service";

registerV1Route({
  method: "post",
  path: "/api/v1/auth/logout",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["auth"],
  summary: "Mobil sessiyani yopish (bitta yoki barcha qurilma)",
  request: { body: { content: { "application/json": { schema: logoutRequestSchema } } } },
  responses: { 200: { description: "Chiqildi" } },
});

export async function POST(request: Request) {
  return v1(request, async ({ session }) => {
    const input = logoutRequestSchema.parse(await request.json().catch(() => ({})));
    const repo = drizzleRefreshTokenRepository;
    if (input.allDevices) {
      await repo.revokeAllForUser(session.userId);
    } else if (input.refreshToken) {
      const row = await repo.findByHash(hashRefreshToken(input.refreshToken));
      if (row && row.userId === session.userId) await repo.revoke(row.id);
    } else {
      const active = await repo.listActiveForUser(session.userId);
      for (const row of active.filter((r) => r.sessionId === session.sessionId)) {
        await repo.revoke(row.id);
      }
    }
    console.info("[mobile-auth] logout", { userId: session.userId, sessionId: session.sessionId, all: input.allDevices });
    return ok({ success: true });
  });
}
