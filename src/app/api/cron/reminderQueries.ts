import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cohorts,
  courseSections,
  enrollments,
  homeworkAssignments,
  homeworkSubmissions,
  lessons,
  users,
} from "@/db/schema";
import type { ActiveStudent, DripEnrollment, DripLesson, HomeworkAssignment, InactiveUser } from "./reminderTypes";

export async function findActiveDripEnrollments(): Promise<DripEnrollment[]> {
  return db
    .select({
      userEmail: users.email,
      userFullName: users.fullName,
      tgUserId: users.tgUserId,
      cohortStartsAt: cohorts.startsAt,
      courseId: cohorts.courseId,
    })
    .from(enrollments)
    .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(eq(enrollments.status, "active"));
}

export async function findDateLessons(courseId: string): Promise<DripLesson[]> {
  return db
    .select({ title: lessons.title, dripValue: lessons.dripValue })
    .from(lessons)
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
    .where(and(eq(courseSections.courseId, courseId), eq(lessons.dripRule, "date")));
}

export async function findHomeworkAssignments(): Promise<HomeworkAssignment[]> {
  return db
    .select({
      assignmentId: homeworkAssignments.id,
      assignmentTitle: homeworkAssignments.title,
      courseId: courseSections.courseId,
    })
    .from(homeworkAssignments)
    .innerJoin(lessons, eq(homeworkAssignments.lessonId, lessons.id))
    .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id));
}

export async function findActiveStudents(courseId: string): Promise<ActiveStudent[]> {
  return db
    .select({ userId: users.id, fullName: users.fullName, tgUserId: users.tgUserId })
    .from(enrollments)
    .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
    .innerJoin(users, eq(enrollments.userId, users.id))
    .where(and(eq(cohorts.courseId, courseId), eq(enrollments.status, "active")));
}

export async function hasHomeworkSubmission(assignmentId: string, userId: string): Promise<boolean> {
  const submissions = await db
    .select({ id: homeworkSubmissions.id })
    .from(homeworkSubmissions)
    .where(and(eq(homeworkSubmissions.assignmentId, assignmentId), eq(homeworkSubmissions.userId, userId)))
    .limit(1);
  return submissions.length > 0;
}

export async function findInactiveUsers(threshold: Date): Promise<InactiveUser[]> {
  return db
    .select({ fullName: users.fullName, phone: users.phone, tgUserId: users.tgUserId, lastLoginAt: users.lastLoginAt })
    .from(users)
    .where(and(eq(users.role, "student"), sql`${users.lastLoginAt} < ${threshold} OR ${users.lastLoginAt} IS NULL`))
    .limit(50);
}
