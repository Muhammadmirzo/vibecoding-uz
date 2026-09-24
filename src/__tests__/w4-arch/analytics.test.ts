import { describe, expect, it } from "vitest";
import {
  drizzleAnalyticsRepository,
  periodDays,
} from "@/features/crm/server/analytics.repository";
import type { AnalyticsRepository } from "@/features/crm/server/analytics.repository";
import { getAnalyticsSummary, periodCutoff } from "@/features/crm/server/analytics.service";
import type { AnalyticsPeriod } from "@/lib/validations/admin";

const NOW = new Date("2026-09-24T12:00:00.000Z");

describe("analytics period cut-off", () => {
  it("maps each period to an exact day offset", () => {
    expect(periodDays("7d")).toBe(7);
    expect(periodDays("30d")).toBe(30);
    expect(periodDays("90d")).toBe(90);
    expect(periodDays("1y")).toBe(365);
    expect(periodDays("all")).toBe(null);
  });
  it("computes the cut-off relative to now, null for all", () => {
    expect(periodCutoff("7d", NOW)?.toISOString()).toBe("2026-09-17T12:00:00.000Z");
    expect(periodCutoff("30d", NOW)?.toISOString()).toBe("2026-08-25T12:00:00.000Z");
    expect(periodCutoff("all", NOW)).toBe(null);
  });
  it("passes the cut-off into every period-scoped repository call", async () => {
    const seen: Array<Date | null> = [];
    const repo: AnalyticsRepository = {
      countLeadsByStatus: async (since) => { seen.push(since); return []; },
      countLeadsBySource: async (since) => { seen.push(since); return []; },
      revenueByProvider: async (since) => { seen.push(since); return []; },
      countActiveEnrollments: async () => 0,
      totalCohortSeats: async () => 0,
      countHomeworkByStatus: async () => [],
    };
    const period: AnalyticsPeriod = "90d";
    await getAnalyticsSummary(repo, period, NOW);
    expect(seen).toHaveLength(3);
    for (const since of seen) {
      expect(since?.toISOString()).toBe(periodCutoff(period, NOW)?.toISOString());
    }
  });
});

describe("analytics aggregate math", () => {
  const repo: AnalyticsRepository = {
    countLeadsByStatus: async () => [
      { status: "new", count: 10 }, { status: "contacted", count: 4 },
      { status: "consultation", count: 2 }, { status: "pending", count: 1 },
      { status: "paid", count: 3 }, { status: "cancelled", count: 2 },
      { status: "rejected", count: 1 },
    ],
    countLeadsBySource: async () => [
      { source: "quiz", count: 12 }, { source: "manual", count: 11 },
    ],
    revenueByProvider: async () => [
      { provider: "payme", totalSum: 6000000, paidCount: 2 },
      { provider: "click", totalSum: 3000000, paidCount: 1 },
    ],
    countActiveEnrollments: async () => 5,
    totalCohortSeats: async () => 20,
    countHomeworkByStatus: async () => [
      { status: "submitted", count: 2 }, { status: "reviewing", count: 1 },
      { status: "approved", count: 4 }, { status: "rejected", count: 1 },
    ],
  };

  it("keeps the legacy response shape and adds only the period echo", async () => {
    const out = await getAnalyticsSummary(repo, "30d", NOW);
    expect(Object.keys(out).sort()).toEqual(["funnel", "period", "revenueByProvider", "sources", "success", "summary"]);
    expect(Object.keys(out.summary).sort()).toEqual([
      "activeStudentsCount", "averageOrderValueUzS", "cancelledCount",
      "newLeadsCount", "overallFillRate", "paidCount",
      "pendingHomeworkCount", "reviewedHomeworkCount",
      "totalLeads", "totalRevenueUzS",
    ]);
    expect(out.period).toBe("30d");
  });
  it("builds funnel steps from status aggregates", async () => {
    const out = await getAnalyticsSummary(repo, "30d", NOW);
    expect(out.summary.totalLeads).toBe(23);
    expect(out.summary.newLeadsCount).toBe(10);
    expect(out.summary.paidCount).toBe(3);
    expect(out.summary.cancelledCount).toBe(3);
    expect(out.funnel.map((f) => f.count)).toEqual([23, 10, 6, 3]);
    expect(out.funnel[1]?.conversionRate).toBe("43.5%");
    expect(out.funnel[1]?.dropOffCount).toBe(13);
  });
  it("splits revenue by provider and averages the order value", async () => {
    const out = await getAnalyticsSummary(repo, "30d", NOW);
    expect(out.revenueByProvider).toEqual({ payme: 6000000, click: 3000000, manual: 0 });
    expect(out.summary.totalRevenueUzS).toBe(9000000);
    expect(out.summary.averageOrderValueUzS).toBe(3000000);
    expect(out.summary.activeStudentsCount).toBe(5);
    expect(out.summary.overallFillRate).toBe("25.0%");
    expect(out.summary.pendingHomeworkCount).toBe(3);
    expect(out.summary.reviewedHomeworkCount).toBe(5);
    expect(out.sources).toContainEqual({ name: "quiz", count: 12, percentage: "52.2%" });
  });
  it("handles empty aggregates without NaN or crashes", async () => {
    const empty: AnalyticsRepository = {
      countLeadsByStatus: async () => [],
      countLeadsBySource: async () => [],
      revenueByProvider: async () => [],
      countActiveEnrollments: async () => 0,
      totalCohortSeats: async () => 0,
      countHomeworkByStatus: async () => [],
    };
    const out = await getAnalyticsSummary(empty, "all", NOW);
    expect(out.summary.totalLeads).toBe(0);
    expect(out.summary.averageOrderValueUzS).toBe(0);
    expect(out.summary.overallFillRate).toBe("0%");
    expect(out.funnel.every((f) => f.count === 0)).toBe(true);
  });
  it("repository exposes the required aggregate surface", () => {
    expect(typeof drizzleAnalyticsRepository.countLeadsByStatus).toBe("function");
    expect(typeof drizzleAnalyticsRepository.revenueByProvider).toBe("function");
  });
});
