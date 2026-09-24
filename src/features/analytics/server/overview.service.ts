import type { AnalyticsRange, MetricDelta, OverviewReport } from "../domain/report-types";
import { EMPTY_OVERVIEW, type AnalyticsRepository, type OverviewTotals } from "./analytics.repository";
import { analyticsCacheKey, cachedAnalytics } from "./analytics-cache";

function rate(numerator: number, denominator: number): number {
  return denominator > 0 ? (numerator / denominator) * 100 : 0;
}

export function metricDelta(current: number, previous: number): MetricDelta {
  const deltaPercent = previous === 0 ? (current === 0 ? 0 : null) : ((current - previous) / previous) * 100;
  return { current, previous, deltaPercent };
}

function previousRange(range: AnalyticsRange): AnalyticsRange {
  const duration = range.to.getTime() - range.from.getTime();
  return { ...range, from: new Date(range.from.getTime() - duration), to: new Date(range.from.getTime()) };
}

function overview(current: OverviewTotals, previous: OverviewTotals): Omit<OverviewReport, "summary"> {
  return {
    visitors: metricDelta(current.visitors, previous.visitors),
    sessions: metricDelta(current.sessions, previous.sessions),
    pageViews: metricDelta(current.pageViews, previous.pageViews),
    leads: metricDelta(current.leads, previous.leads),
    signups: metricDelta(current.signups, previous.signups),
    payingCustomers: metricDelta(current.payingCustomers, previous.payingCustomers),
    revenueUzs: metricDelta(current.revenueUzs, previous.revenueUzs),
    visitToLeadRate: metricDelta(rate(current.leads, current.visitors), rate(previous.leads, previous.visitors)),
    leadToSignupRate: metricDelta(rate(current.signups, current.leads), rate(previous.signups, previous.leads)),
    checkoutToPaidRate: metricDelta(rate(current.payingCustomers, current.checkouts), rate(previous.payingCustomers, previous.checkouts)),
  };
}

export async function getOverview(
  repository: AnalyticsRepository,
  range: AnalyticsRange,
): Promise<OverviewReport> {
  const prior = previousRange(range);
  return cachedAnalytics(analyticsCacheKey("overview", range), async () => {
    const data = await repository.overviewTotals(range, prior);
    const result = overview(data.current ?? EMPTY_OVERVIEW, data.previous ?? EMPTY_OVERVIEW);
    return {
      ...result,
      summary: `${result.visitors.current} tashrifchi, ${result.leads.current} lead va ${result.revenueUzs.current.toLocaleString("uz-UZ")} so'm tushum kuzatildi.`,
    };
  });
}
