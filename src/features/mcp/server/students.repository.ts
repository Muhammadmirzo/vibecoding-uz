import { sql } from "drizzle-orm";
import { db } from "@/db";
import { isoValue, maskPhone, numberValue, safePage, textValue, type Page } from "./pagination";

type QueryRow = Record<string, unknown>;
const rows = (query: ReturnType<typeof sql>) => db.execute<QueryRow>(query);

export async function listStudents(query: { limit?: number; cursor?: string; search?: string }, pii: boolean): Promise<Page<Record<string, unknown>>> {
  const search = query.search?.trim() ? `%${query.search.trim()}%` : null;
  return safePage(query, async (limit, offset) => {
    const result = await rows(sql`SELECT u.id, u."fullName", u.phone, u.email, u."createdAt", count(DISTINCT e.id)::int AS enrollments, count(DISTINCT CASE WHEN e.status = 'active' THEN e.id END)::int AS active, max(lp."lastSeenAt") AS "lastSeenAt" FROM users u LEFT JOIN enrollments e ON e."userId" = u.id LEFT JOIN lesson_progress lp ON lp."userId" = u.id WHERE u.role = 'student' AND (${search}::text IS NULL OR u."fullName" ILIKE ${search} OR u.phone ILIKE ${search}) GROUP BY u.id ORDER BY u."createdAt" DESC LIMIT ${limit} OFFSET ${offset}`);
    const total = numberValue((await rows(sql`SELECT count(*)::int AS count FROM users u WHERE u.role = 'student' AND (${search}::text IS NULL OR u."fullName" ILIKE ${search} OR u.phone ILIKE ${search})`))[0]?.count);
    return { rows: result.map((row) => ({ id: textValue(row.id), fullName: textValue(row.fullName), phone: maskPhone(typeof row.phone === "string" ? row.phone : null, pii), email: pii && typeof row.email === "string" ? row.email : null, enrollments: numberValue(row.enrollments), activeEnrollments: numberValue(row.active), lastSeenAt: isoValue(row.lastSeenAt), createdAt: isoValue(row.createdAt) })), total };
  });
}

export async function studentProfile(id: string, pii: boolean) {
  const [user] = await rows(sql`SELECT id, "fullName", phone, email, "createdAt" FROM users WHERE id = ${id} AND role = 'student' LIMIT 1`);
  if (!user) return null;
  const [enrollments, progress, homework, payments] = await Promise.all([
    rows(sql`SELECT e.id, c.title AS "courseTitle", co.name AS cohort, e.status, e."enrolledAt" FROM enrollments e JOIN cohorts co ON co.id = e."cohortId" JOIN courses c ON c.id = co."courseId" WHERE e."userId" = ${id} ORDER BY e."enrolledAt" DESC LIMIT 50`),
    rows(sql`SELECT l.title, lp."completedAt", lp."lastSeenAt" FROM lesson_progress lp JOIN lessons l ON l.id = lp."lessonId" WHERE lp."userId" = ${id} ORDER BY lp."lastSeenAt" DESC LIMIT 100`),
    rows(sql`SELECT ha.title, hs.status, hs."submittedAt" FROM homework_submissions hs JOIN homework_assignments ha ON ha.id = hs."assignmentId" WHERE hs."userId" = ${id} ORDER BY hs."submittedAt" DESC LIMIT 100`),
    rows(sql`SELECT p.id, p.status, p."amountTiyin", p."paidAt", p.provider FROM payments p WHERE p."userId" = ${id} ORDER BY p."createdAt" DESC LIMIT 100`),
  ]);
  const normalize = (list: QueryRow[]) => list.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value instanceof Date ? value.toISOString() : typeof value === "string" && /At$/.test(key) ? new Date(value).toISOString() : value])));
  return { id: textValue(user.id), fullName: textValue(user.fullName), phone: maskPhone(typeof user.phone === "string" ? user.phone : null, pii), email: pii && typeof user.email === "string" ? user.email : null, createdAt: isoValue(user.createdAt), enrollments: normalize(enrollments), progress: normalize(progress), homework: normalize(homework), payments: normalize(payments).map((row) => ({ ...row, amountUzs: numberValue(row.amountTiyin) / 100 })) };
}
