import { eq, and, asc, lte, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import {
  lessons,
  courseSections,
  cohorts,
  enrollments,
  homeworkAssignments,
  homeworkSubmissions,
  lessonProgress,
} from "@/db/schema";
import {
  checkLessonAccessSchema,
  courseDripQuerySchema,
  DripAccessResult,
  CheckLessonAccessInput,
  CourseDripQueryInput,
} from "@/lib/validations";

/**
 * Checks if a specific lesson is unlocked for a user based on cohort start date OR previous homework approval.
 */
export async function isLessonUnlocked(
  input: CheckLessonAccessInput
): Promise<DripAccessResult> {
  const validated = checkLessonAccessSchema.parse(input);
  const { userId, lessonId, cohortId } = validated;

  // 1. Fetch lesson details along with section
  const lessonRows = await db
    .select({
      lesson: lessons,
      section: courseSections,
    })
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

  // 2. Free preview lessons are accessible to everyone
  if (lesson.isFreePreview) {
    return {
      unlocked: true,
      reason: "free_preview",
      message: "Bepul dars barchaga ochiq.",
    };
  }

  // 3. Find user enrollment for course or cohort
  const userEnrollments = await db
    .select({
      enrollment: enrollments,
      cohort: cohorts,
    })
    .from(enrollments)
    .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(cohorts.courseId, section.courseId),
        eq(enrollments.status, "active")
      )
    );

  if (userEnrollments.length === 0) {
    return {
      unlocked: false,
      reason: "not_enrolled",
      message: "Ushbu darsni ko'rish uchun kursga a'zo bo'ling.",
    };
  }

  const activeEnrollment = cohortId
    ? userEnrollments.find((e) => e.cohort.id === cohortId) || userEnrollments[0]
    : userEnrollments[0];

  const cohort = activeEnrollment.cohort;

  // 4. Check if Cohort has started
  const now = new Date();
  if (cohort.startsAt && new Date(cohort.startsAt) > now) {
    const startDate = new Date(cohort.startsAt);
    return {
      unlocked: false,
      reason: "cohort_not_started",
      availableAt: startDate,
      message: `Guruh darslari ${startDate.toLocaleDateString("uz-UZ")} sanasidan boshlanadi.`,
    };
  }

  // 5. Evaluate Drip Rules
  if (lesson.dripRule === "none") {
    return {
      unlocked: true,
      reason: "unlocked",
      message: "Dars ochiq.",
    };
  }

  if (lesson.dripRule === "date") {
    let unlockDate: Date | null = null;

    if (lesson.dripValue) {
      // Check if dripValue is ISO date string or relative days count
      const parsedDate = new Date(lesson.dripValue);
      if (!isNaN(parsedDate.getTime())) {
        unlockDate = parsedDate;
      } else {
        // Assume integer or format "+7d", "7"
        const daysOffset = parseInt(lesson.dripValue.replace(/[^\d]/g, ""), 10);
        if (!isNaN(daysOffset)) {
          const baseDate = cohort.startsAt
            ? new Date(cohort.startsAt)
            : new Date(activeEnrollment.enrollment.enrolledAt);
          unlockDate = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        }
      }
    }

    if (unlockDate && now < unlockDate) {
      return {
        unlocked: false,
        reason: "scheduled_date",
        availableAt: unlockDate,
        message: `Ushbu dars ${unlockDate.toLocaleDateString("uz-UZ")} sanasida ochiladi.`,
      };
    }

    return {
      unlocked: true,
      reason: "unlocked",
      availableAt: unlockDate || undefined,
      message: "Dars ochiq.",
    };
  }

  if (lesson.dripRule === "after_lesson") {
    let prereqLessonId = lesson.dripValue;
    let prereqTitle: string | undefined = undefined;

    // If no explicit prerequisite ID, find previous lesson in section / course
    if (!prereqLessonId) {
      const prevLessons = await db
        .select({
          id: lessons.id,
          title: lessons.title,
        })
        .from(lessons)
        .where(
          and(
            eq(lessons.sectionId, section.id),
            lte(lessons.sortOrder, lesson.sortOrder ?? 0)
          )
        )
        .orderBy(asc(lessons.sortOrder));

      const currentIndex = prevLessons.findIndex((l) => l.id === lesson.id);
      if (currentIndex > 0) {
        prereqLessonId = prevLessons[currentIndex - 1].id;
        prereqTitle = prevLessons[currentIndex - 1].title;
      }
    }

    if (prereqLessonId) {
      if (!prereqTitle) {
        const prereqLesson = await db
          .select({ title: lessons.title })
          .from(lessons)
          .where(eq(lessons.id, prereqLessonId))
          .limit(1);
        if (prereqLesson.length > 0) {
          prereqTitle = prereqLesson[0].title;
        }
      }

      // Check 1: Is previous lesson marked as completed in lessonProgress?
      const progress = await db
        .select()
        .from(lessonProgress)
        .where(
          and(
            eq(lessonProgress.userId, userId),
            eq(lessonProgress.lessonId, prereqLessonId),
            isNotNull(lessonProgress.completedAt)
          )
        )
        .limit(1);

      if (progress.length > 0) {
        return {
          unlocked: true,
          reason: "unlocked",
          message: "Dars ochiq.",
        };
      }

      // Check 2: Has user received an APPROVED homework submission for the prerequisite lesson?
      const prereqAssignments = await db
        .select({ id: homeworkAssignments.id })
        .from(homeworkAssignments)
        .where(eq(homeworkAssignments.lessonId, prereqLessonId));

      if (prereqAssignments.length > 0) {
        const assignmentIds = prereqAssignments.map((a) => a.id);
        const approvedSubmissions = await db
          .select()
          .from(homeworkSubmissions)
          .where(
            and(
              eq(homeworkSubmissions.userId, userId),
              eq(homeworkSubmissions.status, "approved")
            )
          );

        const hasApprovedHomework = approvedSubmissions.some((s) =>
          assignmentIds.includes(s.assignmentId)
        );

        if (hasApprovedHomework) {
          return {
            unlocked: true,
            reason: "unlocked",
            message: "Dars ochiq.",
          };
        }
      }

      return {
        unlocked: false,
        reason: "prerequisite_required",
        prerequisiteLessonId: prereqLessonId,
        prerequisiteLessonTitle: prereqTitle,
        message: `Ushbu darsni ochish uchun avval "${prereqTitle || "oldingi dars"}" topshiriqlarini bajarishingiz kerak.`,
      };
    }

    return {
      unlocked: true,
      reason: "unlocked",
      message: "Dars ochiq.",
    };
  }

  return {
    unlocked: true,
    reason: "unlocked",
    message: "Dars ochiq.",
  };
}

/**
 * Returns drip unlock status for all lessons in a course for a user.
 */
export async function getCourseDripStatus(
  input: CourseDripQueryInput
): Promise<Array<{ lessonId: string; lessonTitle: string; result: DripAccessResult }>> {
  const validated = courseDripQuerySchema.parse(input);
  const { userId, courseId, cohortId } = validated;

  // Fetch all sections and lessons for the course
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

  const results = await Promise.all(
    allLessons.map(async (l) => {
      const result = await isLessonUnlocked({
        userId,
        lessonId: l.id,
        cohortId,
      });
      return {
        lessonId: l.id,
        lessonTitle: l.title,
        result,
      };
    })
  );

  return results;
}
