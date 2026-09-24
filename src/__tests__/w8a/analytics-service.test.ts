import { describe, expect, it } from "vitest";
import { getAcquisition, getBehaviour, getDimensions, getFunnel, getOverview, getRealtime, getSales, getStudents, getTimeseries } from "@/features/analytics/server/analytics.service";
import type { AnalyticsRepository } from "@/features/analytics/server/analytics.repository";
import type { AnalyticsRange } from "@/features/analytics/domain/report-types";

const range: AnalyticsRange = { from: new Date("2026-09-01T00:00:00Z"), to: new Date("2026-09-08T00:00:00Z"), compare: true };
const totals = { visitors: 10, sessions: 8, pageViews: 20, leads: 4, signups: 2, payingCustomers: 1, revenueUzs: 500_000, checkouts: 3 };
const repository: AnalyticsRepository = {
  overviewTotals: async () => ({ current: totals, previous: { ...totals, visitors: 5, leads: 2, revenueUzs: 400_000 } }),
  timeseries: async () => [{ timestamp: "2026-09-01T00:00:00.000Z", value: 10 }],
  sources: async () => [{ source: "direct", visitors: 10, leads: 4, conversionRate: 40 }],
  campaigns: async () => [{ campaign: "spring", visitors: 5, leads: 2, revenueUzs: 100_000 }],
  landingPages: async () => [{ path: "/", visitors: 10, leads: 4, conversionRate: 40 }],
  behaviour: async () => ({ topPages: [], entryPages: [], exitPages: [], averageEngagedMs: 42_000, averageScrollDepth: 60 }),
  funnel: async () => [{ key: "visit", label: "Tashrif", count: 10, conversionFromPrevious: 0, conversionFromVisit: 0 }, { key: "paid", label: "To‘lov", count: 2, conversionFromPrevious: 0, conversionFromVisit: 0 }],
  students: async () => ({ activeStudents: 12, newEnrollments: 3, courses: [{ courseId: "c", courseTitle: "Kurs", started: 10, completed: 5, completionRate: 50, dropOffLesson: "3-dars", dropOffCount: 2 }], homeworkSubmissionRate: 70, cohortAttendanceRate: 80 }),
  sales: async () => ({ revenueByDay: [{ date: "2026-09-01", revenueUzs: 500_000, orders: 1 }], revenueByCourse: [], averageOrderUzs: 500_000, refundsCount: 0, refundsUzs: 0, topReferrers: [] }),
  dimensions: async (_input, dimension) => [{ name: dimension === "country" ? "UZ" : "mobile", count: 10 }],
  realtime: async () => 3,
};

describe("analytics service", () => {
  it("returns typed overview with previous-period deltas and Uzbek summary", async () => {
    const result = await getOverview(repository, range);
    expect(result.visitors.deltaPercent).toBe(100);
    expect(result.revenueUzs.current).toBe(500_000);
    expect(result.summary).toContain("tashrifchi");
  });
  it("returns timeseries, acquisition, behaviour and funnel reports", async () => {
    const [series, acquisition, behaviour, funnel] = await Promise.all([getTimeseries(repository, range, "visitors"), getAcquisition(repository, range), getBehaviour(repository, range), getFunnel(repository, range)]);
    expect(series.points).toHaveLength(1); expect(acquisition.sources[0].source).toBe("direct"); expect(behaviour.averageEngagedMs).toBe(42_000); expect(funnel.steps[1].conversionFromVisit).toBe(20);
  });
  it("returns students, sales, dimensions and realtime reports", async () => {
    const [students, sales, devices, countries, realtime] = await Promise.all([getStudents(repository, range), getSales(repository, range), getDimensions(repository, range, "device"), getDimensions(repository, range, "country"), getRealtime(repository, range)]);
    expect(students.courses[0].completionRate).toBe(50); expect(sales.averageOrderUzs).toBe(500_000); expect(devices.rows[0].name).toBe("mobile"); expect(countries.rows[0].name).toBe("UZ"); expect(realtime.activeVisitors).toBe(3);
  });
});
