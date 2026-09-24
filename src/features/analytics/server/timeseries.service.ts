import type { AnalyticsMetric, AnalyticsRange, TimeseriesReport } from "../domain/report-types";
import { analyticsCacheKey, cachedAnalytics } from "./analytics-cache";
import type { AnalyticsRepository } from "./analytics.repository";

const labels: Record<AnalyticsMetric, string> = {
  visitors: "tashrifchi", sessions: "sessiya", page_views: "sahifa ko'rish", leads: "lead",
  signups: "ro'yxatdan o'tish", paying_customers: "to'lovchi", revenue_uzs: "tushum",
};

export async function getTimeseries(
  repository: AnalyticsRepository,
  range: AnalyticsRange,
  metric: AnalyticsMetric,
): Promise<TimeseriesReport> {
  const granularity = range.granularity ?? "day";
  return cachedAnalytics(analyticsCacheKey(`timeseries:${metric}:${granularity}`, range), async () => {
    const points = await repository.timeseries(range, metric);
    const total = points.reduce((sum, point) => sum + point.value, 0);
    return {
      metric,
      granularity,
      points,
      summary: `${granularity === "week" ? "Haftalik" : "Kunlik"} ko'rsatkich bo'yicha jami ${total.toLocaleString("uz-UZ")} ${labels[metric]} qayd etildi.`,
    };
  });
}
