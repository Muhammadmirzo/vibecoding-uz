/**
 * get_sales_report — read-only sales for a date range from paid payments:
 * totals, average order, refunds, revenue by course, best days and top
 * referrers. Money is integer tiyin plus a formatted so'm string.
 * Backed by getSales().
 */
import { getSales } from "../../src/features/analytics/server/business.service";
import { mcpSalesReportSchema } from "../../src/lib/validations/mcp";
import type { McpToolDef, McpToolResult } from "../types";
import {
  rangeProperties,
  runAnalyticsTool,
  somToMoney,
  toServiceRange,
  type AnalyticsToolDeps,
} from "./analytics-shared";

export const TOOL_DEF: McpToolDef = {
  name: "get_sales_report",
  description:
    "Read-only sales report for a date range from paid payments: total revenue, orders, average order, refunds, revenue by course, best days and top traffic referrers. Money as integer tiyin plus formatted so'm. Requires authToken.",
  inputSchema: { type: "object", properties: rangeProperties(true) },
  annotations: { readOnlyHint: true },
};

export async function handle(rawArgs: unknown, deps?: AnalyticsToolDeps): Promise<McpToolResult> {
  return runAnalyticsTool(rawArgs, mcpSalesReportSchema, deps, async (repository, input) => {
    const report = await getSales(repository, toServiceRange(input.range));
    const revenueSom = report.revenueByDay.reduce((sum, row) => sum + row.revenueUzs, 0);
    const orders = report.revenueByDay.reduce((sum, row) => sum + row.orders, 0);
    const bestDays = [...report.revenueByDay].sort((a, b) => b.revenueUzs - a.revenueUzs);
    return {
      limit: input.limit,
      totals: {
        revenue: somToMoney(revenueSom),
        orders,
        averageOrder: somToMoney(orders > 0 ? report.averageOrderUzs : 0),
        daysWithSales: report.revenueByDay.length,
        refunds: { count: report.refundsCount, amount: somToMoney(report.refundsUzs) },
      },
      revenueByCourse: report.revenueByCourse.slice(0, input.limit).map((row) => ({
        courseId: row.courseId,
        courseTitle: row.courseTitle,
        orders: row.orders,
        revenue: somToMoney(row.revenueUzs),
      })),
      bestDays: bestDays.slice(0, input.limit).map((row) => ({
        date: row.date,
        orders: row.orders,
        revenue: somToMoney(row.revenueUzs),
      })),
      topReferrers: report.topReferrers.slice(0, input.limit).map((row) => ({
        source: row.source,
        visitors: row.visitors,
        leads: row.leads,
      })),
      notes: "Revenue counts payments with status 'paid' by paid_at; refunds count status 'refunded'.",
      summary: report.summary,
    };
  });
}
