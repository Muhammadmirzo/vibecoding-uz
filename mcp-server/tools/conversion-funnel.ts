/**
 * get_conversion_funnel — read-only session funnel: visit -> diagnostic ->
 * lead -> signup -> checkout -> paid, with step-to-step and from-visit
 * conversion. Backed by getFunnel().
 */
import { getFunnel } from "../../src/features/analytics/server/traffic.service";
import { mcpConversionFunnelSchema } from "../../src/lib/validations/mcp";
import type { McpToolDef, McpToolResult } from "../types";
import {
  rangeProperties,
  round1,
  runAnalyticsTool,
  toServiceRange,
  type AnalyticsToolDeps,
} from "./analytics-shared";

export const TOOL_DEF: McpToolDef = {
  name: "get_conversion_funnel",
  description:
    "Read-only conversion funnel for a date range (distinct sessions): visit -> diagnostic -> lead -> signup -> checkout -> paid, with conversion from the previous step and from visit, and the biggest drop-off step. Requires authToken.",
  inputSchema: { type: "object", properties: rangeProperties(false) },
  annotations: { readOnlyHint: true },
};

export async function handle(rawArgs: unknown, deps?: AnalyticsToolDeps): Promise<McpToolResult> {
  return runAnalyticsTool(rawArgs, mcpConversionFunnelSchema, deps, async (repository, input) => {
    const report = await getFunnel(repository, toServiceRange(input.range));
    const steps = report.steps.map((step) => ({
      key: step.key,
      label: step.label,
      sessions: step.count,
      fromPreviousPct: round1(step.conversionFromPrevious),
      fromVisitPct: round1(step.conversionFromVisit),
    }));
    const drops = steps.slice(1).filter((_, index) => (steps[index]?.sessions ?? 0) > 0);
    const worst = drops.sort((a, b) => a.fromPreviousPct - b.fromPreviousPct)[0];
    return {
      unit: "distinct sessions",
      steps,
      biggestDropOff: worst ? { intoStep: worst.key, label: worst.label, fromPreviousPct: worst.fromPreviousPct } : null,
      summary: report.summary,
    };
  });
}
