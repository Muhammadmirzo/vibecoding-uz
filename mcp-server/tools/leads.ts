/** query_leads_pipeline — read-only lead list from the leads table. */
import { mcpQueryLeadsPipelineSchema } from "../../src/lib/validations/mcp";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  successResult,
  withAuthProperty,
  type McpToolDef,
  type McpToolResult,
} from "../types";
import { queryLeadRows, type LeadRow } from "./db";

export const TOOL_DEF: McpToolDef = {
  name: "query_leads_pipeline",
  description:
    "Read-only: fetch leads filtered by status (new, contacted, consultation, pending, paid, rejected, cancelled, all). Requires authToken.",
  inputSchema: {
    type: "object",
    properties: withAuthProperty({
      status: { type: "string", description: "Lead status filter (default 'new', 'all' for no filter)" },
      limit: { type: "number", description: "Max records to return (default 10, capped at 100)" },
    }),
  },
  annotations: { readOnlyHint: true },
};

export interface LeadsDeps {
  listLeads: (status: string, limit: number) => Promise<LeadRow[]>;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export async function handle(rawArgs: unknown, deps?: LeadsDeps): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = mcpQueryLeadsPipelineSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  try {
    const listLeads = deps?.listLeads ?? queryLeadRows;
    const leads = await listLeads(parsed.data.status, parsed.data.limit);
    return successResult({ ok: true, filter: parsed.data.status, count: leads.length, leads });
  } catch (err: unknown) {
    return errorResult("query_failed", { message: toErrorMessage(err) });
  }
}
