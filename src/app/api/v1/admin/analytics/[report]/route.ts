import { fail, ok } from "@/lib/api/v1/respond";
import { requireAdmin } from "@/lib/auth/require-auth";
import { analyticsRangeSchema, analyticsReportSchema } from "@/features/analytics/domain/report-types";
import { getAnalyticsReport } from "@/features/analytics/server/analytics.service";
import { drizzleAnalyticsRepository } from "@/features/analytics/server/analytics.repository";

type Context = { params: Promise<{ report: string }> };

export async function GET(request: Request, context: Context) {
  try {
    const auth = await requireAdmin(request);
    if (!auth.ok) return fail(auth.response);
    const { report: rawReport } = await context.params;
    const report = analyticsReportSchema.parse(rawReport);
    const url = new URL(request.url);
    const to = url.searchParams.get("to") ?? new Date().toISOString();
    const defaultFrom = new Date(Date.now() - 30 * 86_400_000).toISOString();
    const range = analyticsRangeSchema.parse({
      from: url.searchParams.get("from") ?? defaultFrom,
      to,
      granularity: url.searchParams.get("granularity") ?? undefined,
      metric: url.searchParams.get("metric") ?? undefined,
      compare: url.searchParams.get("compare") !== "false",
    });
    return ok(await getAnalyticsReport(drizzleAnalyticsRepository, report, range));
  } catch (error) {
    return fail(error);
  }
}
