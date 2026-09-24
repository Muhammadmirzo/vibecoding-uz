import { and, count, eq, gte, sum } from "drizzle-orm";
import { db } from "@/db";
import { cohorts, enrollments, homeworkSubmissions, leads, payments } from "@/db/schema";
import type { AnalyticsPeriod } from "@/lib/validations/admin";

export interface StatusCount {
  status: string;
  count: number;
}

export interface SourceCount {
  source: string;
  count: number;
}

export interface ProviderRevenue {
  provider: string;
  totalSum: number;
  paidCount: number;
}

/** Read-only aggregate repository. No transactions needed (no writes). */
export interface AnalyticsRepository {
  countLeadsByStatus(since: Date | null): Promise<StatusCount[]>;
  countLeadsBySource(since: Date | null): Promise<SourceCount[]>;
  revenueByProvider(since: Date | null): Promise<ProviderRevenue[]>;
  countActiveEnrollments(): Promise<number>;
  totalCohortSeats(): Promise<number>;
  countHomeworkByStatus(): Promise<StatusCount[]>;
}

function sinceCondition(column: typeof leads.createdAt, since: Date | null) {
  return since ? gte(column, since) : undefined;
}

export const drizzleAnalyticsRepository: AnalyticsRepository = {
  async countLeadsByStatus(since) {
    const rows = await db
      .select({ status: leads.status, count: count() })
      .from(leads)
      .where(sinceCondition(leads.createdAt, since))
      .groupBy(leads.status);
    return rows.map((r) => ({ status: r.status, count: r.count }));
  },
  async countLeadsBySource(since) {
    const rows = await db
      .select({ source: leads.source, count: count() })
      .from(leads)
      .where(sinceCondition(leads.createdAt, since))
      .groupBy(leads.source);
    return rows.map((r) => ({ source: r.source, count: r.count }));
  },
  async revenueByProvider(since) {
    const paidOnly = eq(payments.status, "paid");
    const rows = await db
      .select({ provider: payments.provider, total: sum(payments.amountSum), paidCount: count() })
      .from(payments)
      .where(since ? and(paidOnly, gte(payments.paidAt, since)) : paidOnly)
      .groupBy(payments.provider);
    return rows.map((r) => ({
      provider: r.provider,
      totalSum: Number(r.total ?? 0),
      paidCount: r.paidCount,
    }));
  },
  async countActiveEnrollments() {
    const [row] = await db
      .select({ count: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "active"));
    return row?.count ?? 0;
  },
  async totalCohortSeats() {
    const [row] = await db.select({ total: sum(cohorts.seats) }).from(cohorts);
    return Number(row?.total ?? 0);
  },
  async countHomeworkByStatus() {
    const rows = await db
      .select({ status: homeworkSubmissions.status, count: count() })
      .from(homeworkSubmissions)
      .groupBy(homeworkSubmissions.status);
    return rows.map((r) => ({ status: r.status, count: r.count }));
  },
};

/** Period length in days; `null` means unbounded ("all"). Exported for tests. */
export function periodDays(period: AnalyticsPeriod): number | null {
  switch (period) {
    case "7d": return 7;
    case "30d": return 30;
    case "90d": return 90;
    case "1y": return 365;
    case "all": return null;
  }
}
