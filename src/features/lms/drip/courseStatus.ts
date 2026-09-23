import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons, courseSections } from "@/db/schema";
import {
  courseDripQuerySchema,
  type CourseDripQueryInput,
  type DripAccessResult,
} from "@/lib/validations";
import { isLessonUnlocked } from "./access";

export async function getCourseDripStatus(
  input: CourseDripQueryInput
): Promise<Array<{ lessonId: string; lessonTitle: string; result: DripAccessResult }>> {
  const { userId, courseId, cohortId } = courseDripQuerySchema.parse(input);
  const allLessons = await db
    .select({
      id: lessons.id,
      title: lessons.title,
      sectionId: lessons.sectionId,
      sortOrder: lessons.sortOrder,
    })
    .from(lessons)
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .where(eq(courseSections.courseId, courseId))
    .orderBy(asc(courseSections.sortOrder), asc(lessons.sortOrder));

  return Promise.all(allLessons.map(async (lesson) => ({
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    result: await isLessonUnlocked({ userId, lessonId: lesson.id, cohortId }),
  })));
}
