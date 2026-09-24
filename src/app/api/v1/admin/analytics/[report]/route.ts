import { z } from "zod";
import { fail, ok } from "@/lib/api/v1/respond";
import { requireAdmin } from "@/lib/auth/require-auth";
import { analyticsRangeSchema, analyticsReportSchema } from "@/features/analytics/domain/report-types";
import { getAnalyticsReport } from "@/features/analytics/server/analytics.service";
import { drizzleAnalyticsRepository } from "@/features/analytics/server/analytics.repository";
import { registerV1Route } from "@/lib/api/v1/registry";

registerV1Route({
  method: "get",
  path: "/api/v1/admin/analytics/{report}",
  security: [{ bearerAuth: [], cookieAuth: [] }],
  tags: ["admin"],
  summary: "Admin analitika hisoboti (from/to/granularity/metric/compare)",
  request: { params: z.object({ report: analyticsReportSchema }) },
  responses: { 200: { description: "Hisobot ma'lumotlari" }, 403: { description: "Faqat admin" } },
});

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
