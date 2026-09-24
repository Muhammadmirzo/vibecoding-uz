import type { AnalyticsMetric, AnalyticsRange } from "../domain/report-types";
import type { AnalyticsRepository } from "./analytics.repository";
import { getOverview } from "./overview.service";
import { getTimeseries } from "./timeseries.service";
import { getAcquisition, getBehaviour, getFunnel } from "./traffic.service";
import { getSales, getStudents, getDimensions, getRealtime } from "./business.service";

export { getOverview, getTimeseries, getAcquisition, getBehaviour, getFunnel, getStudents, getSales, getDimensions, getRealtime };

export async function getAnalyticsReport(
  repository: AnalyticsRepository,
  report: string,
  range: AnalyticsRange,
): Promise<unknown> {
  const metric = (range.metric ?? "visitors") as AnalyticsMetric;
  switch (report) {
    case "overview": return getOverview(repository, range);
    case "timeseries": return getTimeseries(repository, range, metric);
    case "acquisition": return getAcquisition(repository, range);
    case "behaviour": return getBehaviour(repository, range);
    case "funnel": return getFunnel(repository, range);
    case "students": return getStudents(repository, range);
    case "sales": return getSales(repository, range);
    case "devices": return getDimensions(repository, range, "device");
    case "countries": return getDimensions(repository, range, "country");
    case "realtime": return getRealtime(repository, range);
    default: throw new Error(`Noma'lum analitika hisoboti: ${report}`);
  }
}
