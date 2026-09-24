/**
 * get_platform_kpis — read-only aggregate metrics (Drizzle counts).
 * NOTE: src/features/crm/server/analytics.* now exists (parallel worker)
 * and duplicates this shape — swap the default deps to that service once
 * its API stabilises. Handlers take injectable deps so the swap is local.
 */
import { mcpGetPlatformKpisSchema } from "../../src/lib/validations/mcp";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  successResult,
  withAuthProperty,
  type McpToolDef,
  type McpToolResult,
} from "../types";
import { queryKpiCounts, type KpiCounts } from "./db";

export const TOOL_DEF: McpToolDef = {
  name: "get_platform_kpis",
  description:
    "Read-only platform metrics (leads, active students, homework backlog, paid revenue). Requires authToken.",
  inputSchema: {
    type: "object",
    properties: withAuthProperty({
      period: {
        type: "string",
        description: "Analytics period: '7d', '30d', '90d', '1y', 'all' (default: '30d')",
      },
    }),
  },
  annotations: { readOnlyHint: true },
};

export interface KpisDeps {
  getKpis: (since: Date | null) => Promise<KpiCounts>;
}

const PERIOD_DAYS: Record<string, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90,
  "1y": 365,
};

function periodToSince(period: string): Date | null {
  if (period === "all") return null;
  const days = PERIOD_DAYS[period];
  if (days === undefined) return null;
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export async function handle(rawArgs: unknown, deps?: KpisDeps): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = mcpGetPlatformKpisSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  try {
    const getKpis = deps?.getKpis ?? queryKpiCounts;
    const kpis = await getKpis(periodToSince(parsed.data.period));
    return successResult({ ok: true, period: parsed.data.period, kpis });
  } catch (err: unknown) {
    return errorResult("query_failed", { message: toErrorMessage(err) });
  }
}
