import { and, asc, desc, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cohorts, courses, courseSections, enrollments, homeworkAssignments,
  homeworkReviews, homeworkSubmissions, lessons, lessonProgress, pushDevices,
} from "@/db/schema";

export interface MobileRepository {
  listPublishedCourses(userId: string): Promise<(typeof courses.$inferSelect & { enrolled: boolean })[]>;
  findCourseBySlug(slug: string): Promise<typeof courses.$inferSelect | null>;
  listCourseSections(courseId: string): Promise<(typeof courseSections.$inferSelect)[]>;
  listSectionLessons(sectionId: string): Promise<(typeof lessons.$inferSelect)[]>;
  listMyEnrollments(userId: string): Promise<{ enrollment: typeof enrollments.$inferSelect; course: typeof courses.$inferSelect; cohort: typeof cohorts.$inferSelect }[]>;
  hasActiveEnrollment(userId: string, courseId: string): Promise<boolean>;
  getProgress(userId: string, lessonId: string): Promise<{ positionSec: number; completed: boolean }>;
  saveProgress(userId: string, lessonId: string, positionSec: number, completed: boolean): Promise<void>;
}

async function enrolledCourseIds(userId: string): Promise<Set<string>> {
  const rows = await db.select({ courseId: cohorts.courseId })
    .from(enrollments).innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .where(and(eq(enrollments.userId, userId), eq(enrollments.status, "active")));
  return new Set(rows.map((r) => r.courseId));
}

export const drizzleMobileRepository: MobileRepository = {
  async listPublishedCourses(userId) {
    const rows = await db.select().from(courses)
      .where(eq(courses.status, "published")).orderBy(asc(courses.sortOrder));
    const enrolled = await enrolledCourseIds(userId);
    return rows.map((c) => ({ ...c, enrolled: enrolled.has(c.id) }));
  },
  async findCourseBySlug(slug) {
    const [row] = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
    return row ?? null;
  },
  async listCourseSections(courseId) {
    return db.select().from(courseSections)
      .where(eq(courseSections.courseId, courseId)).orderBy(asc(courseSections.sortOrder));
  },
  async listSectionLessons(sectionId) {
    return db.select().from(lessons)
      .where(eq(lessons.sectionId, sectionId)).orderBy(asc(lessons.sortOrder));
  },
  async listMyEnrollments(userId) {
    return db.select({ enrollment: enrollments, course: courses, cohort: cohorts })
      .from(enrollments)
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .innerJoin(courses, eq(cohorts.courseId, courses.id))
      .where(eq(enrollments.userId, userId))
      .orderBy(desc(enrollments.enrolledAt));
  },
  async hasActiveEnrollment(userId, courseId) {
    const rows = await db.select({ id: enrollments.id }).from(enrollments)
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .where(and(eq(enrollments.userId, userId), eq(cohorts.courseId, courseId), eq(enrollments.status, "active")))
      .limit(1);
    return rows.length > 0;
  },
  async getProgress(userId, lessonId) {
    const [row] = await db.select().from(lessonProgress)
      .where(and(eq(lessonProgress.userId, userId), eq(lessonProgress.lessonId, lessonId))).limit(1);
    if (!row) return { positionSec: 0, completed: false };
    return { positionSec: row.positionSec ?? 0, completed: row.completedAt !== null };
  },
  async saveProgress(userId, lessonId, positionSec, completed) {
    await upsertLessonProgress(db, userId, lessonId, positionSec, completed);
  },
};

type DbExecutor = Pick<typeof db, "select" | "insert">;

/**
 * One atomic upsert on the (user_id, lesson_id) unique index: two parallel saves can no longer
 * both miss a SELECT and insert duplicates. The first completion time is kept (COALESCE).
 */
export async function upsertLessonProgress(
  ex: DbExecutor, userId: string, lessonId: string, positionSec: number, completed: boolean,
): Promise<void> {
  const now = new Date();
  await ex.insert(lessonProgress).values({
    userId, lessonId, positionSec, completedAt: completed ? now : null, lastSeenAt: now,
  }).onConflictDoUpdate({
    target: [lessonProgress.userId, lessonProgress.lessonId],
    set: {
      positionSec, lastSeenAt: now,
      ...(completed ? { completedAt: sql`COALESCE(${lessonProgress.completedAt}, excluded.completed_at)` } : {}),
    },
  });
}

export interface HomeworkRow {
  id: string; assignmentId: string; assignmentTitle: string; lessonTitle: string | null;
  status: string; score: string | null; feedbackMd: string | null; submittedAt: Date; attemptNo: number;
}

export async function listMyHomework(userId: string, limit: number): Promise<HomeworkRow[]> {
  const rows = await db.select({
    id: homeworkSubmissions.id, assignmentId: homeworkSubmissions.assignmentId,
    status: homeworkSubmissions.status, submittedAt: homeworkSubmissions.submittedAt,
    attemptNo: homeworkSubmissions.attemptNo, title: homeworkAssignments.title,
    lessonId: homeworkAssignments.lessonId, score: homeworkReviews.score,
    feedbackMd: homeworkReviews.feedbackMd, lessonTitle: lessons.title,
  }).from(homeworkSubmissions)
    .innerJoin(homeworkAssignments, eq(homeworkSubmissions.assignmentId, homeworkAssignments.id))
    .leftJoin(homeworkReviews, eq(homeworkReviews.submissionId, homeworkSubmissions.id))
    .leftJoin(lessons, eq(homeworkAssignments.lessonId, lessons.id))
    .where(eq(homeworkSubmissions.userId, userId))
    .orderBy(desc(homeworkSubmissions.submittedAt)).limit(limit);
  return rows.map((r) => ({
    id: r.id, assignmentId: r.assignmentId, assignmentTitle: r.title,
    lessonTitle: r.lessonTitle, status: r.status, score: r.score,
    feedbackMd: r.feedbackMd, submittedAt: r.submittedAt, attemptNo: r.attemptNo ?? 1,
  }));
}

export async function submitHomework(
  userId: string, input: { assignmentId: string; fileUrls: string[]; githubUrl?: string | null; note?: string | null },
): Promise<{ id: string }> {
  const [assignment] = await db.select({ id: homeworkAssignments.id }).from(homeworkAssignments)
    .where(eq(homeworkAssignments.id, input.assignmentId)).limit(1);
  if (!assignment) {
    const { ServiceError } = await import("@/lib/http/errors");
    throw new ServiceError("NOT_FOUND", "Topshiriq topilmadi", 404);
  }
  const payload = { fileUrls: input.fileUrls, githubUrl: input.githubUrl ?? undefined, note: input.note ?? undefined };
  // Parallel double-submit → one INSERT hits the (assignment_id, user_id, attempt_no) unique index
  // (23505) and we retry with the next number.
  for (let attempt = 0; attempt < MAX_ATTEMPT_NO_RETRIES; attempt++) {
    try {
      return await insertNextAttempt(db, userId, input.assignmentId, payload);
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error("Homework submit failed: attempt number conflict");
}

/** attempt_no = max + 1, then INSERT; the unique index rejects a parallel duplicate with 23505. */
export async function insertNextAttempt(
  ex: DbExecutor, userId: string, assignmentId: string, payload: Record<string, unknown>,
): Promise<{ id: string; attemptNo: number }> {
  const prior = await ex.select({ attemptNo: homeworkSubmissions.attemptNo }).from(homeworkSubmissions)
    .where(and(eq(homeworkSubmissions.userId, userId), eq(homeworkSubmissions.assignmentId, assignmentId)))
    .orderBy(desc(homeworkSubmissions.attemptNo)).limit(1);
  const attemptNo = (prior[0]?.attemptNo ?? 0) + 1;
  const [row] = await ex.insert(homeworkSubmissions).values({
    assignmentId, userId, attemptNo, payload, status: "submitted",
  }).returning({ id: homeworkSubmissions.id });
  if (!row) throw new Error("Homework submit failed");
  return { id: row.id, attemptNo };
}

const MAX_ATTEMPT_NO_RETRIES = 3;

/** Postgres unique_violation (23505); drizzle may wrap the driver error in `cause`. */
export function isUniqueViolation(error: unknown): boolean {
  for (let current: unknown = error, depth = 0; current && depth < 3; depth++) {
    if (typeof current === "object" && (current as { code?: unknown }).code === "23505") return true;
    current = typeof current === "object" ? (current as { cause?: unknown }).cause : undefined;
  }
  return false;
}

export async function registerPushDevice(input: {
  userId: string; platform: string; pushToken: string; appVersion?: string; locale: string;
}): Promise<{ id: string }> {
  const [existing] = await db.select({ id: pushDevices.id }).from(pushDevices)
    .where(eq(pushDevices.pushToken, input.pushToken)).limit(1);
  if (existing) {
    await db.update(pushDevices).set({
      userId: input.userId, platform: input.platform, appVersion: input.appVersion,
      locale: input.locale, lastSeen: new Date(), disabledAt: null,
    }).where(eq(pushDevices.id, existing.id));
    return { id: existing.id };
  }
  const [row] = await db.insert(pushDevices).values({
    userId: input.userId, platform: input.platform, pushToken: input.pushToken,
    appVersion: input.appVersion, locale: input.locale, lastSeen: new Date(),
  }).returning({ id: pushDevices.id });
  if (!row) throw new Error("Push register failed");
  return { id: row.id };
}

export async function disablePushDevice(id: string, userId: string): Promise<boolean> {
  const rows = await db.update(pushDevices).set({ disabledAt: new Date() })
    .where(and(eq(pushDevices.id, id), eq(pushDevices.userId, userId), isNull(pushDevices.disabledAt)))
    .returning({ id: pushDevices.id });
  return rows.length > 0;
}
