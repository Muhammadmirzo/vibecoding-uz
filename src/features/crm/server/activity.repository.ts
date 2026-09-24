import { and, count, desc, eq, ilike, inArray, isNotNull, max, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import {
  cohorts, courseSections, enrollments, homeworkAssignments, homeworkSubmissions,
  lessonProgress, lessons, users,
} from "@/db/schema";

export type EnrollmentStatusFilter = "active" | "finished" | "paused" | "expelled";

export interface ActivityListQuery {
  search?: string;
  cohortId?: string;
  enrollmentStatuses?: EnrollmentStatusFilter[];
  limit: number;
  offset: number;
}

export interface EnrolledStudentRow {
  userId: string;
  fullName: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  enrollmentStatus: string;
  enrolledAt: Date;
  cohortId: string;
  cohortName: string;
  courseId: string;
}

export interface UserCount {
  userId: string;
  count: number;
}

export interface HomeworkCountRow {
  userId: string;
  status: string;
  count: number;
}

export interface LessonEventRow {
  userId: string;
  lessonId: string;
  title: string;
  at: Date | null;
}

export interface HomeworkEventRow {
  userId: string;
  submissionId: string;
  title: string;
  at: Date;
}

/** Read-only repository: enrollments + progress + homework aggregates. */
export interface ActivityRepository {
  listEnrolledStudents(query: ActivityListQuery): Promise<EnrolledStudentRow[]>;
  countEnrolledStudents(query: Omit<ActivityListQuery, "limit" | "offset">): Promise<number>;
  listEnrolledUserIds(query: Omit<ActivityListQuery, "limit" | "offset" | "enrollmentStatuses">): Promise<Array<{ userId: string; courseId: string; enrollmentStatus: string }>>;
  countLessonsByCourse(courseIds: string[]): Promise<Array<{ courseId: string; total: number }>>;
  countAssignmentsByCourse(courseIds: string[]): Promise<Array<{ courseId: string; total: number }>>;
  countCompletedByUser(userIds: string[]): Promise<UserCount[]>;
  countHomeworkByUser(userIds: string[]): Promise<HomeworkCountRow[]>;
  lastSeenByUser(userIds: string[]): Promise<Array<{ userId: string; lastSeenAt: Date | null }>>;
  recentLessonCompletions(userIds: string[], limit: number): Promise<LessonEventRow[]>;
  recentHomeworkSubmissions(userIds: string[], limit: number): Promise<HomeworkEventRow[]>;
}

type FilterQuery = Omit<ActivityListQuery, "limit" | "offset">;

function buildWhere(query: FilterQuery): SQL<unknown> | undefined {
  const conditions: Array<SQL<unknown>> = [];
  if (query.cohortId) conditions.push(eq(enrollments.cohortId, query.cohortId));
  if (query.enrollmentStatuses && query.enrollmentStatuses.length > 0) {
    conditions.push(inArray(enrollments.status, query.enrollmentStatuses));
  }
  if (query.search) {
    const pattern = `%${query.search.replace(/[%_]/g, "")}%`;
    conditions.push(
      or(ilike(users.fullName, pattern), ilike(users.phone, pattern), ilike(users.email, pattern)) as SQL<unknown>,
    );
  }
  return conditions.length > 0 ? and(...conditions) : undefined;
}

function noRows<T>(ids: string[], value: T): T {
  return ids.length === 0 ? value : (undefined as unknown as T);
}

export const drizzleActivityRepository: ActivityRepository = {
  async listEnrolledStudents(query) {
    const rows = await db
      .select({
        userId: users.id, fullName: users.fullName, phone: users.phone, email: users.email,
        avatarUrl: users.avatarUrl, lastLoginAt: users.lastLoginAt,
        enrollmentStatus: enrollments.status, enrolledAt: enrollments.enrolledAt,
        cohortId: cohorts.id, cohortName: cohorts.name, courseId: cohorts.courseId,
      })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .where(buildWhere(query))
      .orderBy(desc(enrollments.enrolledAt))
      .limit(query.limit)
      .offset(query.offset);
    return rows;
  },
  async countEnrolledStudents(query) {
    const [row] = await db
      .select({ count: count() })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .where(buildWhere(query));
    return row?.count ?? 0;
  },
  async listEnrolledUserIds(query) {
    return db
      .select({ userId: users.id, courseId: cohorts.courseId, enrollmentStatus: enrollments.status })
      .from(enrollments)
      .innerJoin(users, eq(enrollments.userId, users.id))
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .where(buildWhere(query));
  },
  async countLessonsByCourse(courseIds) {
    if (courseIds.length === 0) return noRows(courseIds, []);
    const rows = await db
      .select({ courseId: courseSections.courseId, total: count() })
      .from(lessons)
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(inArray(courseSections.courseId, courseIds))
      .groupBy(courseSections.courseId);
    return rows;
  },
  async countAssignmentsByCourse(courseIds) {
    if (courseIds.length === 0) return noRows(courseIds, []);
    const rows = await db
      .select({ courseId: courseSections.courseId, total: count() })
      .from(homeworkAssignments)
      .innerJoin(lessons, eq(homeworkAssignments.lessonId, lessons.id))
      .innerJoin(courseSections, eq(lessons.sectionId, courseSections.id))
      .where(inArray(courseSections.courseId, courseIds))
      .groupBy(courseSections.courseId);
    return rows;
  },
  async countCompletedByUser(userIds) {
    if (userIds.length === 0) return [];
    return db
      .select({ userId: lessonProgress.userId, count: count() })
      .from(lessonProgress)
      .where(and(inArray(lessonProgress.userId, userIds), isNotNull(lessonProgress.completedAt)))
      .groupBy(lessonProgress.userId);
  },
  async countHomeworkByUser(userIds) {
    if (userIds.length === 0) return [];
    return db
      .select({ userId: homeworkSubmissions.userId, status: homeworkSubmissions.status, count: count() })
      .from(homeworkSubmissions)
      .where(inArray(homeworkSubmissions.userId, userIds))
      .groupBy(homeworkSubmissions.userId, homeworkSubmissions.status);
  },
  async lastSeenByUser(userIds) {
    if (userIds.length === 0) return [];
    return db
      .select({ userId: lessonProgress.userId, lastSeenAt: max(lessonProgress.lastSeenAt) })
      .from(lessonProgress)
      .where(inArray(lessonProgress.userId, userIds))
      .groupBy(lessonProgress.userId);
  },
  async recentLessonCompletions(userIds, limit) {
    if (userIds.length === 0) return [];
    return db
      .select({ userId: lessonProgress.userId, lessonId: lessons.id, title: lessons.title, at: lessonProgress.completedAt })
      .from(lessonProgress)
      .innerJoin(lessons, eq(lessonProgress.lessonId, lessons.id))
      .where(and(inArray(lessonProgress.userId, userIds), isNotNull(lessonProgress.completedAt)))
      .orderBy(desc(lessonProgress.completedAt))
      .limit(limit);
  },
  async recentHomeworkSubmissions(userIds, limit) {
    if (userIds.length === 0) return [];
    return db
      .select({ userId: homeworkSubmissions.userId, submissionId: homeworkSubmissions.id, title: homeworkAssignments.title, at: homeworkSubmissions.submittedAt })
      .from(homeworkSubmissions)
      .innerJoin(homeworkAssignments, eq(homeworkSubmissions.assignmentId, homeworkAssignments.id))
      .where(inArray(homeworkSubmissions.userId, userIds))
      .orderBy(desc(homeworkSubmissions.submittedAt))
      .limit(limit);
  },
};
