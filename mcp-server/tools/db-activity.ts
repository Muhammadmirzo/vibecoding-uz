/**
 * Read-only student-activity query for get_student_activity.
 * Split from db.ts (keeps files small). Same lazy-DB pattern: the client
 * is loaded dynamically so unit tests with injected deps never touch a DB.
 * NOTE: src/features/crm/server/activity.* now exists (parallel worker);
 * this local query duplicates its shape — prefer reusing that service
 * once its API stabilises.
 */
import { and, desc, eq, isNotNull, type SQL } from "drizzle-orm";
import {
  cohorts,
  enrollments,
  homeworkSubmissions,
  lessonProgress,
  users,
} from "../../src/db/schema";

type DbClient = Awaited<ReturnType<typeof loadDb>>;

async function loadDb() {
  const mod = await import("../../src/db");
  return mod.db;
}

export interface ActivityFilter {
  studentId?: string;
  email?: string;
  cohortId?: string;
  status: string;
  limit: number;
}

export interface StudentActivityRow {
  studentId: string;
  fullName: string;
  phone: string;
  email: string | null;
  cohortId: string | null;
  cohortName: string | null;
  enrollmentStatus: string | null;
  lastActiveAt: string | null;
  completedLessons: number;
  submittedHomework: number;
  approvedHomework: number;
  pendingHomework: number;
  status: string;
}

const RECENT_MS = 7 * 24 * 3600 * 1000;

function deriveStatus(enrollmentStatus: string | null, lastActive: Date | null): string {
  if (enrollmentStatus === "finished") return "completed";
  if (enrollmentStatus === "expelled" || enrollmentStatus === "paused") return "inactive";
  if (enrollmentStatus !== "active") return "inactive";
  if (lastActive && Date.now() - lastActive.getTime() <= RECENT_MS) return "active";
  return "at_risk";
}

export async function queryStudentActivity(filter: ActivityFilter): Promise<StudentActivityRow[]> {
  const db: DbClient = await loadDb();
  const capped = Math.max(1, Math.min(filter.limit, 50));
  const conds: SQL<unknown>[] = [];
  if (filter.studentId !== undefined) conds.push(eq(users.id, filter.studentId));
  if (filter.email !== undefined) conds.push(eq(users.email, filter.email));
  const userRows = await db
    .select({
      id: users.id,
      fullName: users.fullName,
      phone: users.phone,
      email: users.email,
      lastLoginAt: users.lastLoginAt,
    })
    .from(users)
    .where(conds.length > 0 ? and(...conds) : undefined)
    .limit(capped);

  const out: StudentActivityRow[] = [];
  for (const u of userRows) {
    const enrollmentRows = await db
      .select({
        status: enrollments.status,
        cohortId: cohorts.id,
        cohortName: cohorts.name,
      })
      .from(enrollments)
      .innerJoin(cohorts, eq(enrollments.cohortId, cohorts.id))
      .where(eq(enrollments.userId, u.id))
      .limit(10);
    const enrollment =
      filter.cohortId !== undefined
        ? enrollmentRows.find((e) => e.cohortId === filter.cohortId)
        : enrollmentRows[0];
    if (filter.cohortId !== undefined && enrollment === undefined) continue;

    const [progressRows, homeworkRows, seenRows] = await Promise.all([
      db
        .select({ lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .where(and(eq(lessonProgress.userId, u.id), isNotNull(lessonProgress.completedAt))),
      db
        .select({ status: homeworkSubmissions.status })
        .from(homeworkSubmissions)
        .where(eq(homeworkSubmissions.userId, u.id)),
      db
        .select({ lastSeen: lessonProgress.lastSeenAt })
        .from(lessonProgress)
        .where(eq(lessonProgress.userId, u.id))
        .orderBy(desc(lessonProgress.lastSeenAt))
        .limit(1),
    ]);
    const lastSeen = seenRows[0]?.lastSeen ?? null;
    const lastActive =
      u.lastLoginAt && lastSeen
        ? new Date(Math.max(u.lastLoginAt.getTime(), lastSeen.getTime()))
        : (u.lastLoginAt ?? lastSeen);
    const status = deriveStatus(enrollment?.status ?? null, lastActive);
    if (filter.status !== "all" && status !== filter.status) continue;
    out.push({
      studentId: u.id,
      fullName: u.fullName,
      phone: u.phone,
      email: u.email,
      cohortId: enrollment?.cohortId ?? null,
      cohortName: enrollment?.cohortName ?? null,
      enrollmentStatus: enrollment?.status ?? null,
      lastActiveAt: lastActive ? lastActive.toISOString() : null,
      completedLessons: new Set(progressRows.map((p) => p.lessonId)).size,
      submittedHomework: homeworkRows.length,
      approvedHomework: homeworkRows.filter((h) => h.status === "approved").length,
      pendingHomework: homeworkRows.filter((h) => h.status === "submitted" || h.status === "reviewing").length,
      status,
    });
  }
  return out;
}
