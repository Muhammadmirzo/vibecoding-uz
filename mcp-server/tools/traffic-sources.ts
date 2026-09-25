/**
 * get_traffic_sources — read-only acquisition report: traffic sources
 * (utm_source, else referrer host, else "direct") and UTM campaigns with
 * visitors, leads and lead conversion. Backed by getAcquisition().
 */
import { getAcquisition } from "../../src/features/analytics/server/traffic.service";
import { mcpTrafficSourcesSchema } from "../../src/lib/validations/mcp";
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
  name: "get_traffic_sources",
  description:
    "Read-only traffic sources and UTM campaigns for a date range: visitors, leads and visit->lead conversion per source (utm_source, else referrer, else direct) and per utm_campaign (with attributed revenue). Requires authToken.",
  inputSchema: { type: "object", properties: rangeProperties(true) },
  annotations: { readOnlyHint: true },
};

export async function handle(rawArgs: unknown, deps?: AnalyticsToolDeps): Promise<McpToolResult> {
  return runAnalyticsTool(rawArgs, mcpTrafficSourcesSchema, deps, async (repository, input) => {
    const report = await getAcquisition(repository, toServiceRange(input.range));
    const topByLeads = [...report.sources].sort((a, b) => b.leads - a.leads)[0];
    return {
      limit: input.limit,
      totalSources: report.sources.length,
      totalCampaigns: report.campaigns.length,
      topSourceByLeads: topByLeads && topByLeads.leads > 0 ? topByLeads.source : null,
      sources: report.sources.slice(0, input.limit).map((row) => ({
        source: row.source,
        visitors: row.visitors,
        leads: row.leads,
        conversionPct: round1(row.conversionRate),
      })),
      campaigns: report.campaigns.slice(0, input.limit).map((row) => ({
        campaign: row.campaign,
        visitors: row.visitors,
        leads: row.leads,
        conversionPct: row.visitors > 0 ? round1((row.leads / row.visitors) * 100) : 0,
        revenue: somToMoney(row.revenueUzs),
      })),
      notes: "Sources are ordered by visitors. 'direct' = no UTM and no referrer; 'campaignsiz' = no utm_campaign.",
      summary: report.summary,
    };
  });
}
