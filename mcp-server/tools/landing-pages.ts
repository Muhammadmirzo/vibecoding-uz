/**
 * get_landing_page_performance — read-only page performance: per-path
 * visitors/leads/conversion, entry pages (first page of a session) and
 * exit pages with exit rate, plus average engagement. Backed by
 * getAcquisition().landingPages and getBehaviour().
 */
import { getAcquisition, getBehaviour } from "../../src/features/analytics/server/traffic.service";
import { mcpLandingPagesSchema } from "../../src/lib/validations/mcp";
import type { McpToolDef, McpToolResult } from "../types";
import {
  rangeProperties,
  round1,
  runAnalyticsTool,
  toServiceRange,
  type AnalyticsToolDeps,
} from "./analytics-shared";

export const TOOL_DEF: McpToolDef = {
  name: "get_landing_page_performance",
  description:
    "Read-only landing/page performance for a date range: visitors, leads and visit->lead conversion per page path, top entry pages, top exit pages with exit rate, average engaged time and scroll depth. Requires authToken.",
  inputSchema: { type: "object", properties: rangeProperties(true) },
  annotations: { readOnlyHint: true },
};

export async function handle(rawArgs: unknown, deps?: AnalyticsToolDeps): Promise<McpToolResult> {
  return runAnalyticsTool(rawArgs, mcpLandingPagesSchema, deps, async (repository, input) => {
    const range = toServiceRange(input.range);
    const [acquisition, behaviour] = await Promise.all([
      getAcquisition(repository, range),
      getBehaviour(repository, range),
    ]);
    return {
      limit: input.limit,
      pages: acquisition.landingPages.slice(0, input.limit).map((row) => ({
        path: row.path,
        visitors: row.visitors,
        leads: row.leads,
        conversionPct: round1(row.conversionRate),
      })),
      entryPages: behaviour.entryPages.slice(0, input.limit).map((row) => ({
        path: row.path,
        sessionsStarted: row.visitors,
      })),
      exitPages: behaviour.exitPages.slice(0, input.limit).map((row) => ({
        path: row.path,
        exits: row.exits,
        exitRatePct: round1(row.exitRate),
      })),
      engagement: {
        averageEngagedSeconds: Math.round(behaviour.averageEngagedMs / 1000),
        averageScrollDepthPct: Math.round(behaviour.averageScrollDepth),
      },
      notes: "'pages' counts every event on a path (ordered by visitors); 'entryPages' is the first page_view of each session.",
      summary: behaviour.summary,
    };
  });
}
