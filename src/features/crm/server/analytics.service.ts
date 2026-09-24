import type { AnalyticsPeriod } from "@/lib/validations/admin";
import { periodDays, type AnalyticsRepository } from "./analytics.repository";

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: string;
  dropOffRate: string;
  dropOffCount: number;
}

export interface AnalyticsSummary {
  success: true;
  period: AnalyticsPeriod;
  summary: {
    totalLeads: number;
    newLeadsCount: number;
    paidCount: number;
    cancelledCount: number;
    totalRevenueUzS: number;
    averageOrderValueUzS: number;
    activeStudentsCount: number;
    overallFillRate: string;
    pendingHomeworkCount: number;
    reviewedHomeworkCount: number;
  };
  funnel: FunnelStage[];
  revenueByProvider: { payme: number; click: number; manual: number };
  sources: Array<{ name: string; count: number; percentage: string }>;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Computes the WHERE cut-off for a period. `null` = unbounded ("all"). */
export function periodCutoff(period: AnalyticsPeriod, now: Date = new Date()): Date | null {
  const days = periodDays(period);
  return days === null ? null : new Date(now.getTime() - days * DAY_MS);
}

function pct(part: number, whole: number): string {
  return whole > 0 ? `${((part / whole) * 100).toFixed(1)}%` : "0%";
}

function byStatus(rows: Array<{ status: string; count: number }>, wanted: string[]): number {
  const set = new Set(wanted);
  return rows.reduce((acc, r) => (set.has(r.status) ? acc + r.count : acc), 0);
}

/**
 * Builds the backwards-compatible analytics payload from SQL aggregates.
 * Period filtering applies to leads + revenue (createdAt/paidAt); cohort
 * seats and the homework queue are point-in-time snapshots by design.
 */
export async function getAnalyticsSummary(
  repo: AnalyticsRepository,
  period: AnalyticsPeriod,
  now: Date = new Date(),
): Promise<AnalyticsSummary> {
  const since = periodCutoff(period, now);
  const [statusRows, sourceRows, revenueRows, activeStudents, totalSeats, homeworkRows] =
    await Promise.all([
      repo.countLeadsByStatus(since),
      repo.countLeadsBySource(since),
      repo.revenueByProvider(since),
      repo.countActiveEnrollments(),
      repo.totalCohortSeats(),
      repo.countHomeworkByStatus(),
    ]);

  const totalLeads = statusRows.reduce((acc, r) => acc + r.count, 0);
  const newLeadsCount = byStatus(statusRows, ["new"]);
  const contactedCount = byStatus(statusRows, ["contacted"]);
  const consultationCount = byStatus(statusRows, ["consultation"]);
  const pendingCount = byStatus(statusRows, ["pending"]);
  const paidCount = byStatus(statusRows, ["paid"]);
  const cancelledCount = byStatus(statusRows, ["cancelled", "rejected"]);

  const step1 = totalLeads;
  const step2 = contactedCount + consultationCount + pendingCount + paidCount;
  const step3 = consultationCount + pendingCount + paidCount;
  const step4 = paidCount;

  const funnel: FunnelStage[] = [
    { stage: "Yangi Leadlar", count: step1, conversionRate: "100.0%", dropOffRate: "0.0%", dropOffCount: 0 },
    {
      stage: "Bog'lanildi (Contacted)", count: step2,
      conversionRate: step1 > 0 ? pct(step2, step1) : "0%",
      dropOffRate: step1 > 0 ? pct(step1 - step2, step1) : "0%",
      dropOffCount: Math.max(0, step1 - step2),
    },
    {
      stage: "Konsultatsiya", count: step3,
      conversionRate: step1 > 0 ? pct(step3, step1) : "0%",
      dropOffRate: step2 > 0 ? pct(step2 - step3, step2) : "0%",
      dropOffCount: Math.max(0, step2 - step3),
    },
    {
      stage: "To'langan (Paid)", count: step4,
      conversionRate: step1 > 0 ? pct(step4, step1) : "0%",
      dropOffRate: step3 > 0 ? pct(step3 - step4, step3) : "0%",
      dropOffCount: Math.max(0, step3 - step4),
    },
  ];

  const revenueOf = (provider: string): { total: number; count: number } => {
    const row = revenueRows.find((r) => r.provider === provider);
    return { total: row?.totalSum ?? 0, count: row?.paidCount ?? 0 };
  };
  const totalRevenue = revenueRows.reduce((acc, r) => acc + r.totalSum, 0);
  const totalPaidCount = revenueRows.reduce((acc, r) => acc + r.paidCount, 0);

  const sources = sourceRows.map((r) => ({
    name: r.source || "manual",
    count: r.count,
    percentage: pct(r.count, totalLeads),
  }));

  const pendingHomework = byStatus(homeworkRows, ["submitted", "reviewing"]);
  const reviewedHomework = byStatus(homeworkRows, ["approved", "rejected"]);

  return {
    success: true,
    period,
    summary: {
      totalLeads,
      newLeadsCount,
      paidCount,
      cancelledCount,
      totalRevenueUzS: totalRevenue,
      averageOrderValueUzS: totalPaidCount > 0 ? Math.round(totalRevenue / totalPaidCount) : 0,
      activeStudentsCount: activeStudents,
      overallFillRate: totalSeats > 0 ? pct(activeStudents, totalSeats) : "0%",
      pendingHomeworkCount: pendingHomework,
      reviewedHomeworkCount: reviewedHomework,
    },
    funnel,
    revenueByProvider: {
      payme: revenueOf("payme").total,
      click: revenueOf("click").total,
      manual: revenueOf("manual").total,
    },
    sources,
  };
}
