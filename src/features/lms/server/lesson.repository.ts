// NOTE(W5-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, courseSections, lessons } from "@/db/schema";

export type LessonRow = typeof lessons.$inferSelect;
export type SectionRow = typeof courseSections.$inferSelect;
export type CourseRow = typeof courses.$inferSelect;

export interface LessonWithContext {
  lesson: LessonRow;
  section: SectionRow;
  course: CourseRow;
}

export interface SectionLessonItem {
  id: string;
  title: string;
  sortOrder: number | null;
  durationSec: number | null;
}

export interface LessonRepository {
  findLessonWithContext(lessonId: string): Promise<LessonWithContext | null>;
  listSectionLessons(sectionId: string): Promise<SectionLessonItem[]>;
}

export const drizzleLessonRepository: LessonRepository = {
  async findLessonWithContext(lessonId) {
    const [row] = await db
      .select({ lesson: lessons, section: courseSections, course: courses })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .innerJoin(courses, eq(courseSections.courseId, courses.id))
      .where(eq(lessons.id, lessonId))
      .limit(1);
    return row ?? null;
  },
  async listSectionLessons(sectionId) {
    return db
      .select({
        id: lessons.id,
        title: lessons.title,
        sortOrder: lessons.sortOrder,
        durationSec: lessons.durationSec,
      })
      .from(lessons)
      .where(eq(lessons.sectionId, sectionId))
      .orderBy(asc(lessons.sortOrder));
  },
};
