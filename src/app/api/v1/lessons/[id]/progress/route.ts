import { z } from "zod";
import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { progressRequestSchema } from "@/features/mobile/contracts-resources";
import { isLessonUnlocked } from "@/features/lms/drip/access";
import { drizzleMobileRepository } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "post",
  path: "/api/v1/lessons/{id}/progress",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["courses"],
  summary: "Dars progressini saqlash",
  request: {
    params: z.object({ id: z.string().uuid() }),
    body: { content: { "application/json": { schema: progressRequestSchema } } },
  },
  responses: { 200: { description: "Saqlandi" } },
});

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, ctx: Ctx) {
  return v1(request, async ({ session }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(await ctx.params);
    const input = progressRequestSchema.parse(await request.json());
    const gate = await isLessonUnlocked({ userId: session.userId, lessonId: id });
    if (!gate.unlocked) {
      return fail(NextResponse.json({ error: gate.message }, { status: 403 }));
    }
    await drizzleMobileRepository.saveProgress(session.userId, id, input.positionSec, input.completed);
    const progress = await drizzleMobileRepository.getProgress(session.userId, id);
    return ok({ lessonId: id, ...progress });
  });
}
