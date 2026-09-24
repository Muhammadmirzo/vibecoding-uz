import { z } from "zod";
import { cached, v1 } from "@/lib/api/v1/with-v1";
import { registerV1Route } from "@/lib/api/v1/registry";
import { courseDetailSchema } from "@/features/mobile/contracts-resources";
import { ServiceError } from "@/lib/http/errors";
import { isLessonUnlocked } from "@/features/lms/drip/access";
import { drizzleMobileRepository } from "@/features/mobile/server/mobile.repository";

registerV1Route({
  method: "get",
  path: "/api/v1/courses/{slug}",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["courses"],
  summary: "Kurs tafsiloti (qulf holati bilan)",
  request: { params: z.object({ slug: z.string() }) },
  responses: {
    200: { description: "Kurs", content: { "application/json": { schema: courseDetailSchema } } },
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
    const detail = await Promise.all(sections.map(async (section) => {
      const lessons = await repo.listSectionLessons(section.id);
      const items = await Promise.all(lessons.map(async (lesson) => {
        let locked = !enrolled && !lesson.isFreePreview;
        if (!locked && !lesson.isFreePreview && enrolled) {
          const gate = await isLessonUnlocked({ userId: session.userId, lessonId: lesson.id });
          locked = !gate.unlocked;
        }
        return {
          id: lesson.id, title: lesson.title, durationSec: lesson.durationSec,
          isFreePreview: lesson.isFreePreview, locked, sortOrder: lesson.sortOrder,
        };
      }));
      return { id: section.id, title: section.title, lessons: items };
    }));
    return cached({
      id: course.id, slug: course.slug, title: course.title, subtitle: course.subtitle,
      coverUrl: course.coverUrl, level: course.level, durationWeeks: course.durationWeeks,
      priceSum: String(course.priceSum), oldPriceSum: course.oldPriceSum ? String(course.oldPriceSum) : null,
      enrolled, description: course.description, sections: detail,
    }, undefined, 120);
  });
}
