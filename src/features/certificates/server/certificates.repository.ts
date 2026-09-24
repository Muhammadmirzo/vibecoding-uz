import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  certificates, cohorts, courseSections, courses, enrollments,
  homeworkAssignments, homeworkReviews, homeworkSubmissions,
  lessonProgress, lessons, payments, users,
} from "@/db/schema";

export interface CertificateProgress {
  enrollmentId: string;
  userId: string;
  fullName: string;
  courseTitle: string;
  enrolledAt: Date;
  isPaid: boolean;
  requiredLessons: number;
  completedLessons: number;
  assignmentsTotal: number;
  assignmentsPassed: number;
  averageScore: number | null;
  existingCode: string | null;
  existingIssuedAt: Date | null;
}

export interface CertificatesRepository {
  loadProgress(userId: string, enrollmentId?: string): Promise<CertificateProgress | null>;
  saveCertificate(input: { enrollmentId: string; code: string; holderName: string; courseTitle: string; finalScore: string; pdfUrl: string }): Promise<typeof certificates.$inferSelect>;
  markEnrollmentFinished(enrollmentId: string, code: string, finalScore: string): Promise<void>;
}

export const drizzleCertificatesRepository: CertificatesRepository = {
  async loadProgress(userId, enrollmentId) {
    const where = enrollmentId
      ? and(eq(enrollments.id, enrollmentId), eq(enrollments.userId, userId))
      : eq(enrollments.userId, userId);
    const [row] = await db.select({
      enrollment: enrollments, user: users, cohort: cohorts, course: courses,
    }).from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .innerJoin(courses, eq(cohorts.courseId, courses.id))
      .where(where)
      .orderBy(enrollments.enrolledAt)
      .limit(1);
    if (!row) return null;

    const courseId = row.course.id;
    const [paid] = await db.select({ id: payments.id }).from(payments)
      .where(and(eq(payments.userId, userId), eq(payments.status, "paid"))).limit(1);

    const courseLessons = await db.select({ id: lessons.id }).from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(eq(courseSections.courseId, courseId));
    const lessonIds = courseLessons.map((l) => l.id);
    let completed = 0;
    if (lessonIds.length > 0) {
      const done = await db.select({ lessonId: lessonProgress.lessonId }).from(lessonProgress)
        .where(and(eq(lessonProgress.userId, userId), sql`${lessonProgress.completedAt} IS NOT NULL`));
      const doneSet = new Set(done.map((d) => d.lessonId));
      completed = lessonIds.filter((id) => doneSet.has(id)).length;
    }

    const assignments = lessonIds.length > 0
      ? await db.select({ id: homeworkAssignments.id }).from(homeworkAssignments)
        .where(sql`${homeworkAssignments.lessonId} IN (${sql.join(lessonIds.map((id) => sql`${id}`), sql`, `)})`)
      : [];
    const assignmentIds = assignments.map((a) => a.id);
    let passed = 0;
    let average: number | null = null;
    if (assignmentIds.length > 0) {
      const approved = await db.select({ assignmentId: homeworkSubmissions.assignmentId }).from(homeworkSubmissions)
        .where(and(eq(homeworkSubmissions.userId, userId), eq(homeworkSubmissions.status, "approved")));
      passed = new Set(approved.filter((s) => assignmentIds.includes(s.assignmentId)).map((s) => s.assignmentId)).size;
      const scores = await db.select({ score: homeworkReviews.score }).from(homeworkReviews)
        .innerJoin(homeworkSubmissions, eq(homeworkReviews.submissionId, homeworkSubmissions.id))
        .where(eq(homeworkSubmissions.userId, userId));
      const nums = scores.map((s) => Number(s.score)).filter((n) => Number.isFinite(n));
      average = nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    }

    const [existing] = await db.select().from(certificates).where(eq(certificates.enrollmentId, row.enrollment.id)).limit(1);

    return {
      enrollmentId: row.enrollment.id,
      userId,
      fullName: row.user.fullName,
      courseTitle: row.course.title,
      enrolledAt: row.enrollment.enrolledAt,
      isPaid: Boolean(paid),
      requiredLessons: lessonIds.length,
      completedLessons: completed,
      assignmentsTotal: assignmentIds.length,
      assignmentsPassed: passed,
      averageScore: average,
      existingCode: existing?.code ?? null,
      existingIssuedAt: existing?.issuedAt ?? null,
    };
  },
  async saveCertificate(input) {
    const [existing] = await db.select().from(certificates).where(eq(certificates.enrollmentId, input.enrollmentId)).limit(1);
    if (existing) {
      const [updated] = await db.update(certificates).set({
        holderName: input.holderName, courseTitle: input.courseTitle,
        finalScore: input.finalScore, pdfUrl: input.pdfUrl,
      }).where(eq(certificates.id, existing.id)).returning();
      return updated;
    }
    const [inserted] = await db.insert(certificates).values({
      enrollmentId: input.enrollmentId, code: input.code, holderName: input.holderName,
      courseTitle: input.courseTitle, finalScore: input.finalScore, pdfUrl: input.pdfUrl,
    }).returning();
    return inserted;
  },
  async markEnrollmentFinished(enrollmentId, code, finalScore) {
    await db.update(enrollments).set({ certificateCode: code, finalScore, status: "finished" }).where(eq(enrollments.id, enrollmentId));
  },
};
