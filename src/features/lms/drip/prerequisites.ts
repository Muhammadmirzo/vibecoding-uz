import { and, asc, eq, isNotNull, lte } from "drizzle-orm";
import { db } from "@/db";
import {
  lessons,
  courseSections,
  homeworkAssignments,
  homeworkSubmissions,
  lessonProgress,
} from "@/db/schema";
import type { DripAccessResult } from "@/lib/validations";

interface PrerequisiteContext {
  lesson: typeof lessons.$inferSelect;
  section: typeof courseSections.$inferSelect;
  userId: string;
}

/** Resolves a prerequisite and checks completion/approval evidence. */
export async function evaluatePrerequisite(
  context: PrerequisiteContext
): Promise<DripAccessResult> {
  const { lesson, section, userId } = context;
  let prerequisiteLessonId = lesson.dripValue;
  let prerequisiteTitle: string | undefined = undefined;

  if (!prerequisiteLessonId) {
    const previousLessons = await db
      .select({ id: lessons.id, title: lessons.title })
      .from(lessons)
      .where(and(
        eq(lessons.sectionId, section.id),
        // Include the current lesson to preserve the original index selection.
        lte(lessons.sortOrder, lesson.sortOrder ?? 0)
      ))
      .orderBy(asc(lessons.sortOrder));

    const currentIndex = previousLessons.findIndex((item) => item.id === lesson.id);
    if (currentIndex > 0) {
      prerequisiteLessonId = previousLessons[currentIndex - 1].id;
      prerequisiteTitle = previousLessons[currentIndex - 1].title;
    }
  }

  if (!prerequisiteLessonId) {
    return { unlocked: true, reason: "unlocked", message: "Dars ochiq." };
  }

  if (!prerequisiteTitle) {
    const prerequisiteLesson = await db
      .select({ title: lessons.title })
      .from(lessons)
      .where(eq(lessons.id, prerequisiteLessonId))
      .limit(1);
    if (prerequisiteLesson.length > 0) {
      prerequisiteTitle = prerequisiteLesson[0].title;
    }
  }

  const progress = await db
    .select()
    .from(lessonProgress)
    .where(and(
      eq(lessonProgress.userId, userId),
      eq(lessonProgress.lessonId, prerequisiteLessonId),
      isNotNull(lessonProgress.completedAt)
    ))
    .limit(1);

  if (progress.length > 0) {
    return { unlocked: true, reason: "unlocked", message: "Dars ochiq." };
  }

  const prerequisiteAssignments = await db
    .select({ id: homeworkAssignments.id })
    .from(homeworkAssignments)
    .where(eq(homeworkAssignments.lessonId, prerequisiteLessonId));

  if (prerequisiteAssignments.length > 0) {
    const assignmentIds = prerequisiteAssignments.map((assignment) => assignment.id);
    const approvedSubmissions = await db
      .select()
      .from(homeworkSubmissions)
      .where(and(
        eq(homeworkSubmissions.userId, userId),
        eq(homeworkSubmissions.status, "approved")
      ));

    const hasApprovedHomework = approvedSubmissions.some((submission) =>
      assignmentIds.includes(submission.assignmentId)
    );
    if (hasApprovedHomework) {
      return { unlocked: true, reason: "unlocked", message: "Dars ochiq." };
    }
  }

  return {
    unlocked: false,
    reason: "prerequisite_required",
    prerequisiteLessonId,
    prerequisiteLessonTitle: prerequisiteTitle,
    message: `Ushbu darsni ochish uchun avval "${prerequisiteTitle || "oldingi dars"}" topshiriqlarini bajarishingiz kerak.`,
  };
}
