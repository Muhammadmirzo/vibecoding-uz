import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { lessons, courseSections, cohorts, enrollments } from "@/db/schema";
import {
  checkLessonAccessSchema,
  type CheckLessonAccessInput,
  type DripAccessResult,
} from "@/lib/validations";
import { evaluateEligibility } from "./eligibility";
import { evaluatePrerequisite } from "./prerequisites";

/** Checks whether a specific lesson is unlocked. */
export async function isLessonUnlocked(
  input: CheckLessonAccessInput
): Promise<DripAccessResult> {
  const { userId, lessonId, cohortId } = checkLessonAccessSchema.parse(input);
  const lessonRows = await db
    .select({ lesson: lessons, section: courseSections })
    .from(lessons)
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .where(eq(lessons.id, lessonId))
    .limit(1);

  if (lessonRows.length === 0) {
    return {
      unlocked: false,
      reason: "lesson_not_found",
      message: "Dars topilmadi.",
    };
  }

  const { lesson, section } = lessonRows[0];
  if (lesson.isFreePreview) {
    return {
      unlocked: true,
      reason: "free_preview",
      message: "Bepul dars barchaga ochiq.",
    };
  }

  const userEnrollments = await db
    .select({ enrollment: enrollments, cohort: cohorts })
    .from(enrollments)
    .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .where(and(
      eq(enrollments.userId, userId),
      eq(cohorts.courseId, section.courseId),
      eq(enrollments.status, "active")
    ));

  if (userEnrollments.length === 0) {
    return {
      unlocked: false,
      reason: "not_enrolled",
      message: "Ushbu darsni ko'rish uchun kursga a'zo bo'ling.",
    };
  }

  const activeEnrollment = cohortId
    ? userEnrollments.find((item) => item.cohort.id === cohortId) || userEnrollments[0]
    : userEnrollments[0];
  const cohort = activeEnrollment.cohort;
  const eligibilityResult = evaluateEligibility(lesson, {
    cohortStartsAt: cohort.startsAt ? new Date(cohort.startsAt) : null,
    enrolledAt: activeEnrollment.enrollment.enrolledAt,
    now: new Date(),
  });

  if (eligibilityResult) return eligibilityResult;
  if (lesson.dripRule === "after_lesson") {
    return evaluatePrerequisite({ lesson, section, userId });
  }
  return { unlocked: true, reason: "unlocked", message: "Dars ochiq." };
}
