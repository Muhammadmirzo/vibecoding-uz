import { z } from "zod";
import { NextResponse } from "next/server";
import { fail, ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { lessonDetailSchema } from "@/features/mobile/contracts-resources";
import { isLessonUnlocked } from "@/features/lms/drip/access";
import { drizzleLessonRepository } from "@/features/lms/server/lesson.repository";
import { getLessonDetail } from "@/features/lms/server/lesson.service";
import { drizzleMobileRepository } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "get",
  path: "/api/v1/lessons/{id}",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["courses"],
  summary: "Dars tafsiloti + video (web player bilan bir xil)",
  request: { params: z.object({ id: z.string().uuid() }) },
  responses: {
    200: { description: "Dars", content: { "application/json": { schema: lessonDetailSchema } } },
  },
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(request: Request, ctx: Ctx) {
  return v1(request, async ({ session }) => {
    const { id } = z.object({ id: z.string().uuid() }).parse(await ctx.params);
    const outcome = await getLessonDetail(
      drizzleLessonRepository,
      { check: (input) => isLessonUnlocked(input) },
      { userId: session.userId, lessonId: id },
    );
    if (!outcome.ok) {
      return fail(NextResponse.json({ error: outcome.message }, { status: 403 }));
    }
    const progress = await drizzleMobileRepository.getProgress(session.userId, id);
    const { detail } = outcome;
    return ok({
      course: detail.course, section: detail.section,
      lesson: {
        id: detail.lesson.id, title: detail.lesson.title,
        videoUrl: detail.lesson.videoUrl, videoHlsUrl: detail.lesson.videoHlsUrl,
        durationSec: detail.lesson.durationSec, contentMd: detail.lesson.contentMd,
        materialsJson: detail.lesson.materialsJson ?? [],
        isFreePreview: detail.lesson.isFreePreview,
      },
      positionSec: progress.positionSec, completed: progress.completed,
    });
  });
}
