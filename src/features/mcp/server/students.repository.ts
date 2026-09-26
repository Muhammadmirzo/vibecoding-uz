import { sql } from "drizzle-orm";
import { db } from "@/db";
import { isoValue, maskPhone, numberValue, safePage, textValue, type Page } from "./pagination";

type QueryRow = Record<string, unknown>;
const rows = (query: ReturnType<typeof sql>) => db.execute<QueryRow>(query);

export async function listStudents(query: { limit?: number; cursor?: string; search?: string }, pii: boolean): Promise<Page<Record<string, unknown>>> {
  const search = query.search?.trim() ? `%${query.search.trim()}%` : null;
  return safePage(query, async (limit, offset) => {
    const result = await rows(sql`SELECT u.id, u.full_name AS "fullName", u.phone, u.email, u.created_at AS "createdAt", count(DISTINCT e.id)::int AS enrollments, count(DISTINCT CASE WHEN e.status = 'active' THEN e.id END)::int AS active, max(lp.last_seen_at) AS "lastSeenAt" FROM users u LEFT JOIN enrollments e ON e.user_id = u.id LEFT JOIN lesson_progress lp ON lp.user_id = u.id WHERE u.role = 'student' AND (${search}::text IS NULL OR u.full_name ILIKE ${search} OR u.phone ILIKE ${search}) GROUP BY u.id ORDER BY u.created_at DESC LIMIT ${limit} OFFSET ${offset}`);
    const total = numberValue((await rows(sql`SELECT count(*)::int AS count FROM users u WHERE u.role = 'student' AND (${search}::text IS NULL OR u.full_name ILIKE ${search} OR u.phone ILIKE ${search})`))[0]?.count);
    return { rows: result.map((row) => ({ id: textValue(row.id), fullName: textValue(row.fullName), phone: maskPhone(typeof row.phone === "string" ? row.phone : null, pii), email: pii && typeof row.email === "string" ? row.email : null, enrollments: numberValue(row.enrollments), activeEnrollments: numberValue(row.active), lastSeenAt: isoValue(row.lastSeenAt), createdAt: isoValue(row.createdAt) })), total };
  });
}

export async function studentProfile(id: string, pii: boolean) {
  const [user] = await rows(sql`SELECT id, full_name AS "fullName", phone, email, created_at AS "createdAt" FROM users WHERE id = ${id} AND role = 'student' LIMIT 1`);
  if (!user) return null;
  const [enrollments, progress, homework, payments] = await Promise.all([
    rows(sql`SELECT e.id, c.title AS "courseTitle", co.name AS cohort, e.status, e.enrolled_at AS "enrolledAt" FROM enrollments e JOIN cohorts co ON co.id = e.cohort_id JOIN courses c ON c.id = co.course_id WHERE e.user_id = ${id} ORDER BY e.enrolled_at DESC LIMIT 50`),
    rows(sql`SELECT l.title, lp.completed_at AS "completedAt", lp.last_seen_at AS "lastSeenAt" FROM lesson_progress lp JOIN lessons l ON l.id = lp.lesson_id WHERE lp.user_id = ${id} ORDER BY lp.last_seen_at DESC LIMIT 100`),
    rows(sql`SELECT ha.title, hs.status, hs.submitted_at AS "submittedAt" FROM homework_submissions hs JOIN homework_assignments ha ON ha.id = hs.assignment_id WHERE hs.user_id = ${id} ORDER BY hs.submitted_at DESC LIMIT 100`),
    rows(sql`SELECT p.id, p.status, p.amount_tiyin AS "amountTiyin", p.paid_at AS "paidAt", p.provider FROM payments p WHERE p.user_id = ${id} ORDER BY p.created_at DESC LIMIT 100`),
  ]);
  const normalize = (list: QueryRow[]) => list.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value instanceof Date ? value.toISOString() : typeof value === "string" && /At$/.test(key) ? new Date(value).toISOString() : value])));
  return { id: textValue(user.id), fullName: textValue(user.fullName), phone: maskPhone(typeof user.phone === "string" ? user.phone : null, pii), email: pii && typeof user.email === "string" ? user.email : null, createdAt: isoValue(user.createdAt), enrollments: normalize(enrollments), progress: normalize(progress), homework: normalize(homework), payments: normalize(payments).map((row) => ({ ...row, amountUzs: numberValue(row.amountTiyin) / 100 })) };
}
