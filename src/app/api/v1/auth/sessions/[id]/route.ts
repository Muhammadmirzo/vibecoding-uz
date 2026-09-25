import { z } from "zod";
import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { ServiceError } from "@/lib/http/errors";
import { drizzleRefreshTokenRepository } from "@/features/mobile/server/refresh-token.repository";

registerV1Route({
  method: "delete",
  path: "/api/v1/auth/sessions/{id}",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["auth"],
  summary: "Bitta qurilma sessiyasini yopish",
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: "Yopildi", content: { "application/json": { schema: z.object({ success: z.literal(true) }) } } } },
});

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, ctx: Ctx) {
  return v1(request, async ({ session }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(await ctx.params);
    const row = await drizzleRefreshTokenRepository.findOwned(id, session.userId);
    if (!row) throw new ServiceError("NOT_FOUND", "Sessiya topilmadi", 404);
    await drizzleRefreshTokenRepository.revoke(id);
    console.info("[mobile-auth] session revoked", { userId: session.userId, tokenId: id });
    return ok({ success: true });
  });
}
