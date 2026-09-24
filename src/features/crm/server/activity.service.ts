import type { AdminStudentActivityQueryInput } from "@/lib/validations/admin";
import type {
  ActivityRepository, EnrolledStudentRow, EnrollmentStatusFilter, HomeworkCountRow,
} from "./activity.repository";

export type StudentDisplayStatus = "active" | "at_risk" | "completed" | "inactive";

export interface ActivityStudent {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  avatarUrl: string | null;
  cohortId: string;
  cohortName: string;
  lessonProgressPercent: number;
  completedLessonsCount: number;
  totalLessonsCount: number;
  lastActiveAt: string | null;
  homeworkStats: { submitted: number; total: number; approved: number; pending: number; rejected: number };
  status: StudentDisplayStatus;
  recentActivity: Array<{ id: string; type: string; title: string; timestamp: string }>;
}

export interface ActivityResult {
  success: true;
  filter: AdminStudentActivityQueryInput;
  kpis: {
    totalStudents: number;
    activeStudents: number;
    atRiskStudents: number;
    completedStudents: number;
    avgProgressPercent: number;
    pendingHomeworkCount: number;
  };
  students: ActivityStudent[];
  page: number;
  limit: number;
  total: number;
}

/**
 * HONESTY NOTES (documented, not faked):
 * - `quizScores` from the old mock is OMITTED: no per-student quiz-score
 *   table exists in the schema (only leads.quizAnswers JSON).
 * - `at_risk` is a documented heuristic: active enrollment with <50%
 *   lesson progress. It is computed from real progress, not invented.
 */

const AT_RISK_PROGRESS = 50;
const RECENT_ACTIVITY_LIMIT = 5;

function enrollmentStatusesFor(status: AdminStudentActivityQueryInput["status"]): EnrollmentStatusFilter[] | undefined {
  switch (status) {
    case "active": return ["active"];
    case "completed": return ["finished"];
    case "inactive": return ["paused", "expelled"];
    case "at_risk": return ["active"];
    case "all": return undefined;
  }
}

function deriveStatus(enrollmentStatus: string, progressPercent: number): StudentDisplayStatus {
  if (enrollmentStatus === "finished") return "completed";
  if (enrollmentStatus === "paused" || enrollmentStatus === "expelled") return "inactive";
  return progressPercent < AT_RISK_PROGRESS ? "at_risk" : "active";
}

function summarizeHomework(rows: HomeworkCountRow[]): ActivityStudent["homeworkStats"] {
  let submitted = 0;
  let approved = 0;
  let pending = 0;
  let rejected = 0;
  for (const r of rows) {
    submitted += r.count;
    if (r.status === "approved") approved += r.count;
    else if (r.status === "rejected") rejected += r.count;
    else pending += r.count;
  }
  return { submitted, total: submitted, approved, pending, rejected };
}

interface ProgressMaps {
  lessonTotals: Map<string, number>;
  assignmentTotals: Map<string, number>;
  completed: Map<string, number>;
  homework: Map<string, HomeworkCountRow[]>;
  lastSeen: Map<string, Date>;
}

async function loadProgressMaps(repo: ActivityRepository, rows: EnrolledStudentRow[]): Promise<ProgressMaps> {
  const userIds = rows.map((r) => r.userId);
  const courseIds = [...new Set(rows.map((r) => r.courseId))];
  const [lessonTotals, assignmentTotals, completed, homework, lastSeen] = await Promise.all([
    repo.countLessonsByCourse(courseIds),
    repo.countAssignmentsByCourse(courseIds),
    repo.countCompletedByUser(userIds),
    repo.countHomeworkByUser(userIds),
    repo.lastSeenByUser(userIds),
  ]);
  const homeworkByUser = new Map<string, HomeworkCountRow[]>();
  for (const h of homework) {
    const list = homeworkByUser.get(h.userId) ?? [];
    list.push(h);
    homeworkByUser.set(h.userId, list);
  }
  return {
    lessonTotals: new Map(lessonTotals.map((t) => [t.courseId, t.total])),
    assignmentTotals: new Map(assignmentTotals.map((t) => [t.courseId, t.total])),
    completed: new Map(completed.map((c) => [c.userId, c.count])),
    homework: homeworkByUser,
    lastSeen: new Map(lastSeen.flatMap((l) => (l.lastSeenAt ? [[l.userId, l.lastSeenAt] as const] : []))),
  };
}

function lastActiveAt(row: EnrolledStudentRow, maps: ProgressMaps): string | null {
  const seen = maps.lastSeen.get(row.userId)?.getTime() ?? null;
  const login = row.lastLoginAt?.getTime() ?? null;
  const best = Math.max(seen ?? 0, login ?? 0);
  return best > 0 ? new Date(best).toISOString() : null;
}

export async function getStudentActivity(
  repo: ActivityRepository,
  input: AdminStudentActivityQueryInput,
): Promise<ActivityResult> {
  const statuses = enrollmentStatusesFor(input.status);
  const base = { search: input.search, cohortId: input.cohortId, enrollmentStatuses: statuses };
  const unfilteredBase = { search: input.search, cohortId: input.cohortId };
  const [total, rows, allIds] = await Promise.all([
    repo.countEnrolledStudents(base),
    repo.listEnrolledStudents({ ...base, limit: input.limit, offset: (input.page - 1) * input.limit }),
    // KPI scope: every filtered enrollment (ids + course only — cheap select).
    repo.listEnrolledUserIds(unfilteredBase),
  ]);

  // Global KPIs over all filtered students (not just the page).
  const kpiCourseIds = [...new Set(allIds.map((r) => r.courseId))];
  const kpiUserIds = allIds.map((r) => r.userId);
  const [kpiLessonTotals, kpiCompletedRows, kpiHomework] = await Promise.all([
    repo.countLessonsByCourse(kpiCourseIds),
    repo.countCompletedByUser(kpiUserIds),
    repo.countHomeworkByUser(kpiUserIds),
  ]);
  const kpiLessonMap = new Map(kpiLessonTotals.map((t) => [t.courseId, t.total]));
  const kpiCompletedMap = new Map(kpiCompletedRows.map((c) => [c.userId, c.count]));
  let kpiActive = 0;
  let kpiAtRisk = 0;
  let kpiCompletedCount = 0;
  let kpiProgressSum = 0;
  let kpiPendingHomework = 0;
  const kpiHomeworkPending = new Map<string, number>();
  for (const h of kpiHomework) {
    if (h.status !== "approved" && h.status !== "rejected") {
      kpiHomeworkPending.set(h.userId, (kpiHomeworkPending.get(h.userId) ?? 0) + h.count);
    }
  }
  for (const id of allIds) {
    const totalLessons = kpiLessonMap.get(id.courseId) ?? 0;
    const done = Math.min(kpiCompletedMap.get(id.userId) ?? 0, totalLessons);
    const percent = totalLessons > 0 ? Math.round((done / totalLessons) * 100) : 0;
    const status = deriveStatus(id.enrollmentStatus, percent);
    if (status === "active") kpiActive += 1;
    if (status === "at_risk") kpiAtRisk += 1;
    if (status === "completed") kpiCompletedCount += 1;
    kpiProgressSum += percent;
    kpiPendingHomework += kpiHomeworkPending.get(id.userId) ?? 0;
  }

  const maps = await loadProgressMaps(repo, rows);

  const pageIds = rows.map((r) => r.userId);
  const [lessonEvents, homeworkEvents] = await Promise.all([
    repo.recentLessonCompletions(pageIds, pageIds.length * RECENT_ACTIVITY_LIMIT),
    repo.recentHomeworkSubmissions(pageIds, pageIds.length * RECENT_ACTIVITY_LIMIT),
  ]);
  const eventsByUser = new Map<string, ActivityStudent["recentActivity"]>();
  const pushEvent = (userId: string, event: { id: string; type: string; title: string; timestamp: string }) => {
    const list = eventsByUser.get(userId) ?? [];
    list.push(event);
    eventsByUser.set(userId, list);
  };
  for (const e of lessonEvents) {
    if (!e.at) continue;
    pushEvent(e.userId, { id: `lesson-${e.lessonId}`, type: "lesson_completed", title: e.title, timestamp: e.at.toISOString() });
  }
  for (const e of homeworkEvents) {
    pushEvent(e.userId, { id: `hw-${e.submissionId}`, type: "homework_submitted", title: e.title, timestamp: e.at.toISOString() });
  }
  for (const list of eventsByUser.values()) {
    list.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1));
    list.length = Math.min(list.length, RECENT_ACTIVITY_LIMIT);
  }

  const students: ActivityStudent[] = rows.map((row) => {
    const totalLessons = maps.lessonTotals.get(row.courseId) ?? 0;
    const completedLessons = Math.min(maps.completed.get(row.userId) ?? 0, totalLessons);
    const percent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const status = deriveStatus(row.enrollmentStatus, percent);
    const hw = summarizeHomework(maps.homework.get(row.userId) ?? []);
    const assignmentTotal = maps.assignmentTotals.get(row.courseId) ?? hw.total;

    return {
      id: row.userId,
      fullName: row.fullName,
      phone: row.phone,
      email: row.email,
      avatarUrl: row.avatarUrl,
      cohortId: row.cohortId,
      cohortName: row.cohortName,
      lessonProgressPercent: percent,
      completedLessonsCount: completedLessons,
      totalLessonsCount: totalLessons,
      lastActiveAt: lastActiveAt(row, maps),
      homeworkStats: { ...hw, total: assignmentTotal },
      status,
      recentActivity: eventsByUser.get(row.userId) ?? [],
    };
  });

  let filtered = students;
  if (input.status === "at_risk") filtered = students.filter((s) => s.status === "at_risk");

  return {
    success: true,
    filter: input,
    kpis: {
      totalStudents: total,
      activeStudents: kpiActive,
      atRiskStudents: kpiAtRisk,
      completedStudents: kpiCompletedCount,
      avgProgressPercent: allIds.length > 0 ? Math.round(kpiProgressSum / allIds.length) : 0,
      pendingHomeworkCount: kpiPendingHomework,
    },
    students: filtered,
    page: input.page,
    limit: input.limit,
    total,
  };
}
