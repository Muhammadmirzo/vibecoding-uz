import { NextResponse } from "next/server";
import { z } from "zod";
import { getDbSession } from "@/lib/auth/require-auth";
import { errorResponse } from "@/lib/http/errors";
import { isLessonUnlocked } from "@/features/lms/drip/access";
import { drizzleLessonRepository } from "@/features/lms/server/lesson.repository";
import { getLessonDetail } from "@/features/lms/server/lesson.service";
import { trackServerEvent } from "@/features/analytics/server/track";

const paramsSchema = z.object({ lessonId: z.string().uuid() });
type RouteContext = { params: Promise<{ lessonId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { lessonId } = paramsSchema.parse(await context.params);
    const authSession = await getDbSession();
    if (!authSession) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

    const outcome = await getLessonDetail(
      drizzleLessonRepository,
      { check: (input) => isLessonUnlocked(input) },
      { userId: authSession.userId, lessonId },
    );
    if (!outcome.ok) {
      return NextResponse.json({ error: outcome.message, reason: outcome.reason }, { status: 403 });
    }
    void trackServerEvent({
      type: "lesson_start",
      userId: authSession.userId,
      path: `/kabinet/darslar/${lessonId}`,
      props: { lessonId, courseId: outcome.detail.course.id },
    });
    return NextResponse.json(outcome.detail);
  } catch (error) {
    return errorResponse(error);
  }
}
