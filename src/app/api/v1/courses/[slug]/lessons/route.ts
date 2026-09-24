import { z } from "zod";
import { ok } from "@/lib/api/v1/respond";
import { v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { lessonItemSchema } from "@/features/mobile/contracts-resources";
import { ServiceError } from "@/lib/http/errors";
import { isLessonUnlocked } from "@/features/lms/drip/access";
import { drizzleMobileRepository } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "get",
  path: "/api/v1/courses/{slug}/lessons",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["courses"],
  summary: "Kurs darslari (qulf holati bilan)",
  request: { params: z.object({ slug: z.string() }) },
  responses: {
    200: { description: "Darslar", content: { "application/json": { schema: z.object({ items: z.array(lessonItemSchema) }) } } },
  },
});

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(request: Request, ctx: Ctx) {
  return v1(request, async ({ session }) => {
    const { slug } = z.object({ slug: z.string().min(1) }).parse(await ctx.params);
    const repo = drizzleMobileRepository;
    const course = await repo.findCourseBySlug(slug);
    if (!course || course.status !== "published") throw new ServiceError("NOT_FOUND", "Kurs topilmadi", 404);
    const enrolled = await repo.hasActiveEnrollment(session.userId, course.id);
    const sections = await repo.listCourseSections(course.id);
    const items = [];
    for (const section of sections) {
      const lessons = await repo.listSectionLessons(section.id);
      for (const lesson of lessons) {
        let locked = !enrolled && !lesson.isFreePreview;
        if (!locked && !lesson.isFreePreview && enrolled) {
          locked = !(await isLessonUnlocked({ userId: session.userId, lessonId: lesson.id })).unlocked;
        }
        items.push({
          id: lesson.id, title: lesson.title, durationSec: lesson.durationSec,
          isFreePreview: lesson.isFreePreview, locked, sortOrder: lesson.sortOrder,
        });
      }
    }
    return ok({ items });
  });
}
