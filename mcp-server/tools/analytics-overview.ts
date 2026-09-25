/**
 * get_analytics_overview — read-only headline metrics for a date range
 * (visitors, sessions, leads, signups, paying customers, revenue, key
 * conversion rates) compared with the preceding period of equal length.
 * Backed by getOverview() — the same service as /admin/analytics.
 */
import { getOverview } from "../../src/features/analytics/server/overview.service";
import type { MetricDelta } from "../../src/features/analytics/domain/report-types";
import { mcpAnalyticsOverviewSchema } from "../../src/lib/validations/mcp";
import type { McpToolDef, McpToolResult } from "../types";
import {
  rangeProperties,
  round1,
  runAnalyticsTool,
  somToMoney,
  toServiceRange,
  type AnalyticsToolDeps,
} from "./analytics-shared";

export const TOOL_DEF: McpToolDef = {
  name: "get_analytics_overview",
  description:
    "Read-only first-party analytics overview for a date range: visitors, sessions, page views, leads, signups, paying customers, revenue (tiyin + so'm) and conversion rates, each vs the previous period of equal length. Requires authToken.",
  inputSchema: { type: "object", properties: rangeProperties(false) },
  annotations: { readOnlyHint: true },
};

function count(delta: MetricDelta): Record<string, number | null> {
  return {
    current: delta.current,
    previous: delta.previous,
    deltaPercent: delta.deltaPercent === null ? null : round1(delta.deltaPercent),
  };
}

function ratePct(delta: MetricDelta): Record<string, number | null> {
  return {
    currentPct: round1(delta.current),
    previousPct: round1(delta.previous),
    deltaPercent: delta.deltaPercent === null ? null : round1(delta.deltaPercent),
  };
}

export async function handle(rawArgs: unknown, deps?: AnalyticsToolDeps): Promise<McpToolResult> {
  return runAnalyticsTool(rawArgs, mcpAnalyticsOverviewSchema, deps, async (repository, input) => {
    const report = await getOverview(repository, toServiceRange(input.range));
    return {
      metrics: {
        visitors: count(report.visitors),
        sessions: count(report.sessions),
        pageViews: count(report.pageViews),
        leads: count(report.leads),
        signups: count(report.signups),
        payingCustomers: count(report.payingCustomers),
      },
      revenue: {
        current: somToMoney(report.revenueUzs.current),
        previous: somToMoney(report.revenueUzs.previous),
        deltaPercent: report.revenueUzs.deltaPercent === null ? null : round1(report.revenueUzs.deltaPercent),
      },
      rates: {
        visitToLead: ratePct(report.visitToLeadRate),
        leadToSignup: ratePct(report.leadToSignupRate),
        checkoutToPaid: ratePct(report.checkoutToPaidRate),
      },
      comparedWith: "previous period of equal length",
      summary: report.summary,
    };
  });
}
