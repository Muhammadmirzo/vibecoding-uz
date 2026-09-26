import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { users, courses, courseSections, lessons, cohorts, enrollments, payments } from "@/db/schema";
import { listStudents, studentProfile } from "@/features/mcp/server/students.repository";
import { salesByCourse } from "@/features/mcp/server/commerce.repository";
import { authenticateMcp } from "@/features/mcp/server/auth.service";
import { createPat } from "@/features/mcp/server/oauth.service";

// Regression for the L2 lesson: raw `sql` queries here used quoted camelCase identifiers
// ("userId", "courseId", ...) that do not exist in Postgres (columns are snake_case).
// Mocked/unit tests never caught it because they never hit real SQL. This suite only runs
// against a real DB, same convention as src/__tests__/hardening/db.test.ts.
const TAG = `zz_w8b_live_${Date.now()}`;
const cleanupIds = { userIds: [] as string[], courseIds: [] as string[], sectionIds: [] as string[], lessonIds: [] as string[], cohortIds: [] as string[], enrollmentIds: [] as string[], paymentIds: [] as string[] };

async function seed() {
  const [student] = await db.insert(users).values({ phone: `+998909${Date.now() % 1000000}`, fullName: `${TAG} student`, role: "student" }).returning();
  const [course] = await db.insert(courses).values({ slug: `${TAG}-course`, title: `${TAG} course`, priceSum: "500000" }).returning();
  const [section] = await db.insert(courseSections).values({ courseId: course.id, title: `${TAG} section` }).returning();
  const [lesson] = await db.insert(lessons).values({ sectionId: section.id, slug: `${TAG}-lesson`, title: `${TAG} lesson` }).returning();
  const [cohort] = await db.insert(cohorts).values({ courseId: course.id, name: `${TAG} cohort`, startsAt: new Date(), priceSum: "500000" }).returning();
  const [enrollment] = await db.insert(enrollments).values({ userId: student.id, cohortId: cohort.id, status: "active" }).returning();
  const [payment] = await db.insert(payments).values({ userId: student.id, enrollmentId: enrollment.id, provider: "click", amountSum: "500000", amountTiyin: 50000000, status: "paid", paidAt: new Date() }).returning();
  cleanupIds.userIds.push(student.id);
  cleanupIds.courseIds.push(course.id);
  cleanupIds.sectionIds.push(section.id);
  cleanupIds.lessonIds.push(lesson.id);
  cleanupIds.cohortIds.push(cohort.id);
  cleanupIds.enrollmentIds.push(enrollment.id);
  cleanupIds.paymentIds.push(payment.id);
  return { student, course };
}

afterAll(async () => {
  if (!process.env.DATABASE_URL) return;
  if (cleanupIds.paymentIds.length) await db.delete(payments).where(inArray(payments.id, cleanupIds.paymentIds));
  if (cleanupIds.enrollmentIds.length) await db.delete(enrollments).where(inArray(enrollments.id, cleanupIds.enrollmentIds));
  if (cleanupIds.cohortIds.length) await db.delete(cohorts).where(inArray(cohorts.id, cleanupIds.cohortIds));
  if (cleanupIds.lessonIds.length) await db.delete(lessons).where(inArray(lessons.id, cleanupIds.lessonIds));
  if (cleanupIds.sectionIds.length) await db.delete(courseSections).where(inArray(courseSections.id, cleanupIds.sectionIds));
  if (cleanupIds.courseIds.length) await db.delete(courses).where(inArray(courses.id, cleanupIds.courseIds));
  if (cleanupIds.userIds.length) await db.delete(users).where(inArray(users.id, cleanupIds.userIds));
});

describe.skipIf(!process.env.DATABASE_URL)("W8B MCP live SQL (real Postgres only)", () => {
  let seeded: Awaited<ReturnType<typeof seed>>;
  beforeAll(async () => { seeded = await seed(); });

  it("listStudents runs without a snake_case/camelCase column error", async () => {
    const page = await listStudents({ limit: 20, search: TAG.slice(0, 6) }, false);
    expect(page.rows.find((r: any) => r.id === seeded.student.id)).toBeTruthy();
  });

  it("studentProfile joins enrollments/lessons/homework/payments without column errors", async () => {
    const profile = await studentProfile(seeded.student.id, true);
    expect(profile?.enrollments.length).toBeGreaterThan(0);
    expect(profile?.payments[0]?.amountUzs).toBe(500000);
  });

  it("salesByCourse joins cohorts/enrollments/payments without column errors", async () => {
    const from = new Date(Date.now() - 3600_000);
    const to = new Date(Date.now() + 3600_000);
    const rows = await salesByCourse(from, to);
    const row = rows.find((r) => r.courseId === seeded.course.id);
    expect(row?.revenueUzs).toBe(500000);
  });

  it("access token and PAT last_used_at actually persist (not a lost fire-and-forget)", async () => {
    const [admin] = await db.insert(users).values({ phone: `+998908${Date.now() % 1000000}`, fullName: `${TAG} admin`, role: "superadmin", mcpAccess: true }).returning();
    cleanupIds.userIds.push(admin.id);
    const pat = await createPat({ name: `${TAG} pat`, scopes: ["analytics:read"], expiresInDays: 30, sender: "admin" }, admin.id);
    const auth = await authenticateMcp(`Bearer ${pat.token}`, "analytics:read");
    expect(auth.principal).toBeTruthy();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const { mcpPersonalAccessTokens } = await import("@/db/schema");
    const [row] = await db.select({ lastUsedAt: mcpPersonalAccessTokens.lastUsedAt }).from(mcpPersonalAccessTokens).where(eq(mcpPersonalAccessTokens.id, pat.id)).limit(1);
    expect(row.lastUsedAt).toBeTruthy();
    await db.delete(mcpPersonalAccessTokens).where(eq(mcpPersonalAccessTokens.id, pat.id));
  }, 15000);
});
