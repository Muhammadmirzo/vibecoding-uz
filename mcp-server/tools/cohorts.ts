/** get_cohort_status — read-only cohorts + live enrollment counts. */
import { mcpGetCohortStatusSchema } from "../../src/lib/validations/mcp";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  successResult,
  withAuthProperty,
  type McpToolDef,
  type McpToolResult,
} from "../types";
import { isUuid, queryCohortRows, type CohortRow } from "./db";

export const TOOL_DEF: McpToolDef = {
  name: "get_cohort_status",
  description:
    "Read-only: cohorts with seat capacity and live enrollment counts. Requires authToken.",
  inputSchema: {
    type: "object",
    properties: withAuthProperty({
      cohortId: { type: "string", description: "Optional cohort UUID (omit for all cohorts)" },
    }),
  },
  annotations: { readOnlyHint: true },
};

export interface CohortsDeps {
  listCohorts: (cohortId: string | undefined) => Promise<CohortRow[]>;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export async function handle(rawArgs: unknown, deps?: CohortsDeps): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = mcpGetCohortStatusSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  if (parsed.data.cohortId !== undefined && !isUuid(parsed.data.cohortId)) {
    return errorResult("invalid_input", { message: "cohortId must be a UUID." });
  }
  try {
    const listCohorts = deps?.listCohorts ?? queryCohortRows;
    const cohorts = await listCohorts(parsed.data.cohortId);
    return successResult({
      ok: true,
      requestedCohortId: parsed.data.cohortId ?? "all",
      count: cohorts.length,
      cohorts,
    });
  } catch (err: unknown) {
    return errorResult("query_failed", { message: toErrorMessage(err) });
  }
}
