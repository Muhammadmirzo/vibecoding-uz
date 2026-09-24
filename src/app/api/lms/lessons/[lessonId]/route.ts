import { NextResponse } from "next/server";
import { z } from "zod";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, courseSections, lessons } from "@/db/schema";
import { getDbSession } from "@/lib/auth/require-auth";
import { isLessonUnlocked } from "@/features/lms/drip/access";

const paramsSchema = z.object({ lessonId: z.string().uuid() });
type RouteContext = { params: Promise<{ lessonId: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Dars IDsi noto'g'ri" }, { status: 400 });
  const authSession = await getDbSession();
  if (!authSession) return NextResponse.json({ error: "Avtorizatsiyadan o'tilmagan" }, { status: 401 });

  const [row] = await db
    .select({ lesson: lessons, section: courseSections, course: courses })
    .from(lessons)
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .innerJoin(courses, eq(courseSections.courseId, courses.id))
    .where(eq(lessons.id, parsed.data.lessonId))
    .limit(1);
  if (!row) return NextResponse.json({ error: "Dars topilmadi" }, { status: 404 });

  const access = await isLessonUnlocked({ userId: authSession.userId, lessonId: parsed.data.lessonId });
  if (!access.unlocked) return NextResponse.json({ error: access.message, reason: access.reason }, { status: 403 });

  const courseLessons = await db
    .select({ id: lessons.id, title: lessons.title, sortOrder: lessons.sortOrder, durationSec: lessons.durationSec })
    .from(lessons)
    .where(eq(lessons.sectionId, row.section.id))
    .orderBy(asc(lessons.sortOrder));

  return NextResponse.json({
    course: { id: row.course.id, slug: row.course.slug, title: row.course.title },
    section: { id: row.section.id, title: row.section.title },
    lesson: { ...row.lesson, promptsJson: row.lesson.promptsJson ?? [], materialsJson: row.lesson.materialsJson ?? [] },
    lessons: courseLessons,
  });
}
