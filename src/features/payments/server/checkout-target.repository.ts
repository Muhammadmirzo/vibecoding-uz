// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime.
import { and, asc, eq, gte } from "drizzle-orm";
import { db } from "@/db";
import { cohorts, courses, enrollments } from "@/db/schema";

export interface OpenCohortRow {
  cohortId: string;
  startsAt: Date;
  priceSum: string;
}

/**
 * The next cohort a student can still join: `status = 'active'`, start date
 * not in the past, earliest first. Returns null when the course has no open
 * cohort — the pay page then shows the honest waitlist state.
 */
export async function findNextOpenCohortForCourse(
  courseSlug: string,
  now: Date = new Date(),
): Promise<OpenCohortRow | null> {
  const [row] = await db
    .select({
      cohortId: cohorts.id,
      startsAt: cohorts.startsAt,
      priceSum: cohorts.priceSum,
    })
    .from(cohorts)
    .innerJoin(courses, eq(cohorts.courseId, courses.id))
    .where(and(eq(courses.slug, courseSlug), eq(cohorts.status, "active"), gte(cohorts.startsAt, now)))
    .orderBy(asc(cohorts.startsAt))
    .limit(1);
  return row ?? null;
}

/** The student's own active enrollment in a cohort, if they already have one. */
export async function findActiveEnrollmentId(
  userId: string,
  cohortId: string,
): Promise<string | null> {
  const [row] = await db
    .select({ id: enrollments.id })
    .from(enrollments)
    .where(
      and(
        eq(enrollments.userId, userId),
        eq(enrollments.cohortId, cohortId),
        eq(enrollments.status, "active"),
      ),
    )
    .limit(1);
  return row?.id ?? null;
}
