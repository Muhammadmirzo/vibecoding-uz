import { z } from "zod";
import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { logoutRequestSchema } from "@/features/mobile/contracts-auth";
import { drizzleRefreshTokenRepository } from "@/features/mobile/server/refresh-token.repository";
import { hashRefreshToken } from "@/features/mobile/server/token.service";
import { drizzleAuthSessionRepository } from "@/features/auth/server/auth-session.repository";

registerV1Route({
  method: "post",
  path: "/api/v1/auth/logout",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["auth"],
  summary: "Mobil sessiyani yopish (bitta yoki barcha qurilma)",
  request: { body: { content: { "application/json": { schema: logoutRequestSchema } } } },
  responses: { 200: { description: "Chiqildi", content: { "application/json": { schema: z.object({ success: z.literal(true) }) } } } },
});

export async function POST(request: Request) {
  return v1(request, async ({ session }) => {
    const input = logoutRequestSchema.parse(await request.json().catch(() => ({})));
    const repo = drizzleRefreshTokenRepository;
    // Session rows back the access tokens: deleting them kills live access
    // tokens immediately instead of after their 15-minute TTL.
    const deadSessions = new Set<string>();
    if (input.allDevices) {
      for (const row of await repo.listActiveForUser(session.userId)) if (row.sessionId) deadSessions.add(row.sessionId);
      await repo.revokeAllForUser(session.userId);
    } else if (input.refreshToken) {
      const row = await repo.findByHash(hashRefreshToken(input.refreshToken));
      if (row && row.userId === session.userId) {
        await repo.revoke(row.id);
        if (row.sessionId) deadSessions.add(row.sessionId);
      }
    } else {
      const active = await repo.listActiveForUser(session.userId);
      for (const row of active.filter((r) => r.sessionId === session.sessionId)) {
        await repo.revoke(row.id);
      }
    }
    if (session.authMethod === "bearer") deadSessions.add(session.sessionId);
    for (const sid of deadSessions) await drizzleAuthSessionRepository.deleteSession(sid);
    console.info("[mobile-auth] logout", { userId: session.userId, sessionId: session.sessionId, all: input.allDevices });
    return ok({ success: true });
  });
}
