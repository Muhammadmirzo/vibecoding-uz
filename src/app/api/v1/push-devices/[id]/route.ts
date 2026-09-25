import { z } from "zod";
import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { ServiceError } from "@/lib/http/errors";
import { disablePushDevice } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "delete",
  path: "/api/v1/push-devices/{id}",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["devices"],
  summary: "Push qurilmani o'chirish",
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: { 200: { description: "O'chirildi", content: { "application/json": { schema: z.object({ success: z.literal(true) }) } } } },
});

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(request: Request, ctx: Ctx) {
  return v1(request, async ({ session }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(await ctx.params);
    const removed = await disablePushDevice(id, session.userId);
    // Boshqaning qurilmasini o'chirishga urinish ham 404 qaytaradi (oracle yo'q).
    if (!removed) throw new ServiceError("NOT_FOUND", "Qurilma topilmadi", 404);
    return ok({ success: true });
  });
}
