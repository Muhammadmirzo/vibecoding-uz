import { describe, expect, it } from "vitest";
import type {
  ActivityRepository, EnrolledStudentRow,
} from "@/features/crm/server/activity.repository";
import { getStudentActivity } from "@/features/crm/server/activity.service";
import type { AdminStudentActivityQueryInput } from "@/lib/validations/admin";

const ROWS: EnrolledStudentRow[] = [
  {
    userId: "u-active", fullName: "Ali Valiyev", phone: "+998901111111",
    email: "ali@example.com", avatarUrl: null, lastLoginAt: new Date("2026-09-24T10:00:00Z"),
    enrollmentStatus: "active", enrolledAt: new Date("2026-09-01T00:00:00Z"),
    cohortId: "c-1", cohortName: "Express", courseId: "course-1",
  },
  {
    userId: "u-risk", fullName: "Laylo Karimova", phone: "+998902222222",
    email: null, avatarUrl: null, lastLoginAt: new Date("2026-08-01T00:00:00Z"),
    enrollmentStatus: "active", enrolledAt: new Date("2026-09-01T00:00:00Z"),
    cohortId: "c-1", cohortName: "Express", courseId: "course-1",
  },
  {
    userId: "u-done", fullName: "Otabek Nazarov", phone: "+998903333333",
    email: null, avatarUrl: null, lastLoginAt: null,
    enrollmentStatus: "finished", enrolledAt: new Date("2026-07-01T00:00:00Z"),
    cohortId: "c-1", cohortName: "Express", courseId: "course-1",
  },
];

function repo(): ActivityRepository {
  return {
    listEnrolledStudents: async (q) => ROWS.slice(q.offset, q.offset + q.limit),
    countEnrolledStudents: async () => ROWS.length,
    listEnrolledUserIds: async () => ROWS.map((r) => ({
      userId: r.userId, courseId: r.courseId, enrollmentStatus: r.enrollmentStatus,
    })),
    countLessonsByCourse: async () => [{ courseId: "course-1", total: 10 }],
    countAssignmentsByCourse: async () => [{ courseId: "course-1", total: 4 }],
    countCompletedByUser: async (ids) => ids.flatMap((id) => {
      if (id === "u-active") return [{ userId: id, count: 8 }];
      if (id === "u-done") return [{ userId: id, count: 10 }];
      return [{ userId: id, count: 2 }];
    }),
    countHomeworkByUser: async () => [
      { userId: "u-active", status: "approved", count: 3 },
      { userId: "u-active", status: "submitted", count: 1 },
      { userId: "u-risk", status: "rejected", count: 1 },
    ],
    lastSeenByUser: async () => [{ userId: "u-active", lastSeenAt: new Date("2026-09-24T11:00:00Z") }],
    recentLessonCompletions: async () => [
      { userId: "u-active", lessonId: "l-8", title: "8-Dars", at: new Date("2026-09-24T09:00:00Z") },
    ],
    recentHomeworkSubmissions: async () => [
      { userId: "u-active", submissionId: "s-1", title: "Vazifa 7", at: new Date("2026-09-24T08:00:00Z") },
    ],
  };
}

const BASE: AdminStudentActivityQueryInput = { status: "all", page: 1, limit: 20 };

describe("student activity mapping", () => {
  it("derives progress, status and homework from real aggregates", async () => {
    const out = await getStudentActivity(repo(), BASE);
    const active = out.students.find((s) => s.id === "u-active");
    const risk = out.students.find((s) => s.id === "u-risk");
    const done = out.students.find((s) => s.id === "u-done");
    expect(active).toMatchObject({ lessonProgressPercent: 80, status: "active", totalLessonsCount: 10 });
    expect(active?.homeworkStats).toEqual({ submitted: 4, total: 4, approved: 3, pending: 1, rejected: 0 });
    expect(risk?.status).toBe("at_risk");
    expect(done?.status).toBe("completed");
  });
  it("omits quizScores: no quiz-score table exists in the schema", async () => {
    const out = await getStudentActivity(repo(), BASE);
    for (const student of out.students) {
      expect(student).not.toHaveProperty("quizScores");
    }
  });
  it("merges lesson + homework events newest-first with a cap", async () => {
    const out = await getStudentActivity(repo(), BASE);
    const active = out.students.find((s) => s.id === "u-active");
    expect(active?.recentActivity.map((e) => e.type)).toEqual(["lesson_completed", "homework_submitted"]);
    expect(active?.recentActivity.every((e) => typeof e.timestamp === "string")).toBe(true);
  });
  it("prefers the freshest last-active signal", async () => {
    const out = await getStudentActivity(repo(), BASE);
    const active = out.students.find((s) => s.id === "u-active");
    expect(active?.lastActiveAt).toBe("2026-09-24T11:00:00.000Z");
    expect(out.students.find((s) => s.id === "u-done")?.lastActiveAt).toBe(null);
  });
  it("filters at_risk to the documented heuristic subset", async () => {
    const out = await getStudentActivity(repo(), { ...BASE, status: "at_risk" });
    expect(out.students.map((s) => s.id)).toEqual(["u-risk"]);
    expect(out.kpis.atRiskStudents).toBe(1);
    expect(out.kpis.activeStudents).toBe(1);
    expect(out.kpis.completedStudents).toBe(1);
    expect(out.kpis.totalStudents).toBe(3);
    expect(out.kpis.avgProgressPercent).toBe(67);
    expect(out.kpis.pendingHomeworkCount).toBe(1);
  });
  it("echoes pagination alongside the legacy keys", async () => {
    const out = await getStudentActivity(repo(), { ...BASE, page: 2, limit: 1 });
    expect(out.page).toBe(2);
    expect(out.limit).toBe(1);
    expect(out.total).toBe(3);
    expect(out.filter).toMatchObject({ page: 2, limit: 1 });
  });
});
