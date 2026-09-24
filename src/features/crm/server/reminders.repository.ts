import { and, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cohorts, courseSections, enrollments, homeworkAssignments,
  homeworkSubmissions, lessons, users,
} from "@/db/schema";

export interface DripEnrollment {
  userEmail: string | null;
  userFullName: string;
  tgUserId: string | null;
  cohortStartsAt: Date | null;
  courseId: string;
}

export interface DripLesson {
  title: string;
  dripValue: string | null;
}

export interface HomeworkAssignment {
  assignmentId: string;
  assignmentTitle: string;
  courseId: string;
}

export interface ActiveStudent {
  userId: string;
  fullName: string;
  tgUserId: string | null;
}

export interface InactiveUser {
  fullName: string;
  phone: string | null;
  tgUserId: string | null;
  lastLoginAt: Date | null;
}

export interface ReminderDetails {
  dripNotifications: string[];
  homeworkAlerts: string[];
  inactivityNudges: string[];
}

/** Drizzle-only reminder queries. Services orchestrate; routes stay thin. */
export interface RemindersRepository {
  findActiveDripEnrollments(): Promise<DripEnrollment[]>;
  findDateLessons(courseId: string): Promise<DripLesson[]>;
  findHomeworkAssignments(): Promise<HomeworkAssignment[]>;
  findActiveStudents(courseId: string): Promise<ActiveStudent[]>;
  /** Bulk submitted-user lookup per assignment (avoids N+1 checks). */
  findSubmittedUserIds(assignmentId: string): Promise<string[]>;
  findInactiveUsers(threshold: Date): Promise<InactiveUser[]>;
}

export const drizzleRemindersRepository: RemindersRepository = {
  async findActiveDripEnrollments() {
    return db
      .select({
        userEmail: users.email, userFullName: users.fullName, tgUserId: users.tgUserId,
        cohortStartsAt: cohorts.startsAt, courseId: cohorts.courseId,
      })
      .from(enrollments)
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(eq(enrollments.status, "active"));
  },
  async findDateLessons(courseId) {
    return db
      .select({ title: lessons.title, dripValue: lessons.dripValue })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(and(eq(courseSections.courseId, courseId), eq(lessons.dripRule, "date")));
  },
  async findHomeworkAssignments() {
    return db
      .select({
        assignmentId: homeworkAssignments.id, assignmentTitle: homeworkAssignments.title,
        courseId: courseSections.courseId,
      })
      .from(homeworkAssignments)
      .innerJoin(lessons, eq(homeworkAssignments.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id));
  },
  async findActiveStudents(courseId) {
    return db
      .select({ userId: users.id, fullName: users.fullName, tgUserId: users.tgUserId })
      .from(enrollments)
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(and(eq(cohorts.courseId, courseId), eq(enrollments.status, "active")));
  },
  async findSubmittedUserIds(assignmentId) {
    const rows = await db
      .select({ userId: homeworkSubmissions.userId })
      .from(homeworkSubmissions)
      .where(eq(homeworkSubmissions.assignmentId, assignmentId));
    return [...new Set(rows.map((r) => r.userId))];
  },
  async findInactiveUsers(threshold) {
    return db
      .select({ fullName: users.fullName, phone: users.phone, tgUserId: users.tgUserId, lastLoginAt: users.lastLoginAt })
      .from(users)
      .where(and(eq(users.role, "student"), sql`${users.lastLoginAt} < ${threshold} OR ${users.lastLoginAt} IS NULL`))
      .limit(50);
  },
};
