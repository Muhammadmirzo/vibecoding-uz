import type { AnalyticsRange, DimensionsReport, RealtimeReport, SalesReport, StudentsReport } from "../domain/report-types";
import { analyticsCacheKey, cachedAnalytics } from "./analytics-cache";
import type { AnalyticsRepository } from "./analytics.repository";

export async function getStudents(repository: AnalyticsRepository, range: AnalyticsRange): Promise<StudentsReport> {
  return cachedAnalytics(analyticsCacheKey("students", range), async () => {
    const data = await repository.students(range);
    return {
      ...data,
      attendanceDefinition: "Kurs haftasida lesson_start yozilgan talaba qatnashgan hisoblanadi.",
      summary: `${data.activeStudents} faol talaba, ${data.newEnrollments} yangi yozildi; uy vazifasi topshirish ulushi ${data.homeworkSubmissionRate.toFixed(1)}%.`,
    };
  });
}

export async function getSales(repository: AnalyticsRepository, range: AnalyticsRange): Promise<SalesReport> {
  return cachedAnalytics(analyticsCacheKey("sales", range), async () => {
    const data = await repository.sales(range);
    return { ...data, summary: `${data.revenueByDay.reduce((sum, row) => sum + row.revenueUzs, 0).toLocaleString("uz-UZ")} so'm savdo, o'rtacha to'lov ${data.averageOrderUzs.toLocaleString("uz-UZ")} so'm.` };
  });
}

export async function getDimensions(repository: AnalyticsRepository, range: AnalyticsRange, dimension: "device" | "country"): Promise<DimensionsReport> {
  return cachedAnalytics(analyticsCacheKey(`dimensions:${dimension}`, range), async () => {
    const rows = await repository.dimensions(range, dimension);
    const name = dimension === "country" ? "davlat" : "qurilma";
    return { dimension, rows, summary: rows[0] ? `Eng ko'p faollik ${rows[0].name} ${name}da qayd etilgan.` : `${name} bo'yicha ma'lumot hali yetarli emas.` };
  });
}

export async function getRealtime(repository: AnalyticsRepository, range: AnalyticsRange): Promise<RealtimeReport> {
  return cachedAnalytics(analyticsCacheKey("realtime", { ...range, to: new Date() }), async () => {
    const activeVisitors = await repository.realtime({ ...range, to: new Date() });
    return { activeVisitors, windowMinutes: 5, summary: `Oxirgi 5 daqiqada ${activeVisitors} faol tashrifchi bor.` };
  });
}
