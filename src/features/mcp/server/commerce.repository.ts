import { and, desc, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { payments, refundRequests } from "@/db/schema";
import { numberValue, safePage, textValue, type Page } from "./pagination";

type QueryRow = Record<string, unknown>;

export async function paymentsList(query: { limit?: number; cursor?: string; from?: string; to?: string; status?: string }): Promise<Page<Record<string, unknown>>> {
  return safePage(query, async (limit, offset) => {
    const from = query.from ? new Date(query.from) : null; const to = query.to ? new Date(query.to) : null; const status = query.status || null;
    const where = and(status ? sql`${payments.status} = ${status}` : undefined, from ? gte(payments.createdAt, from) : undefined, to ? lte(payments.createdAt, to) : undefined);
    const [rows, totalRow] = await Promise.all([
      db.select({ id: payments.id, userId: payments.userId, provider: payments.provider, status: payments.status, amountTiyin: payments.amountTiyin, paidAt: payments.paidAt, createdAt: payments.createdAt }).from(payments).where(where).orderBy(desc(payments.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(payments).where(where),
    ]);
    return { rows: rows.map((row) => ({ ...row, amountUzs: row.amountTiyin / 100, currency: "UZS" })), total: Number(totalRow[0]?.count ?? 0) };
  });
}

export async function refundsList(query: { limit?: number; cursor?: string; status?: string }): Promise<Page<Record<string, unknown>>> {
  return safePage(query, async (limit, offset) => {
    const status = query.status || null; const where = status ? sql`${refundRequests.status} = ${status}` : undefined;
    const [rows, total] = await Promise.all([
      db.select({ id: refundRequests.id, userId: refundRequests.userId, paymentId: refundRequests.paymentId, amountTiyin: refundRequests.amountTiyin, reason: refundRequests.reason, status: refundRequests.status, createdAt: refundRequests.createdAt }).from(refundRequests).where(where).orderBy(desc(refundRequests.createdAt)).limit(limit).offset(offset),
      db.select({ count: sql<number>`count(*)::int` }).from(refundRequests).where(where),
    ]);
    return { rows: rows.map((row) => ({ ...row, amountUzs: row.amountTiyin / 100, currency: "UZS" })), total: Number(total[0]?.count ?? 0) };
  });
}

export async function salesByCourse(from: Date, to: Date) {
  const result = await db.execute<QueryRow>(sql`SELECT c.id AS "courseId", c.title AS "courseTitle", count(p.id)::int AS orders, coalesce(sum(p."amountSum"), 0)::bigint AS "revenueUzs" FROM courses c LEFT JOIN cohorts co ON co."courseId" = c.id LEFT JOIN enrollments e ON e."cohortId" = co.id LEFT JOIN payments p ON p."enrollmentId" = e.id AND p.status = 'paid' AND p."paidAt" >= ${from} AND p."paidAt" < ${to} GROUP BY c.id ORDER BY "revenueUzs" DESC LIMIT 50`);
  return result.map((row) => ({ courseId: textValue(row.courseId), courseTitle: textValue(row.courseTitle), orders: numberValue(row.orders), revenueUzs: numberValue(row.revenueUzs) }));
}
