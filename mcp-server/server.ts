/**
 * Shared MCP runner: tool registry + dispatch.
 * index.ts (stdio transport) stays thin; tests import tool handlers
 * directly and never touch this transport wiring.
 */
import { errorResult, type McpToolDef, type McpToolResult, type ToolHandler } from "./types";
import { handle as handleActivity, TOOL_DEF as activityDef } from "./tools/activity";
import { handle as handleBroadcast, TOOL_DEF as broadcastDef } from "./tools/broadcast";
import { handle as handleCohorts, TOOL_DEF as cohortsDef } from "./tools/cohorts";
import { handle as handleHomework, TOOL_DEF as homeworkDef } from "./tools/homework";
import { handle as handleKpis, TOOL_DEF as kpisDef } from "./tools/kpis";
import { handle as handleLeads, TOOL_DEF as leadsDef } from "./tools/leads";
import { handle as handlePromocode, TOOL_DEF as promocodeDef } from "./tools/promocode";

export interface ToolEntry {
  def: McpToolDef;
  handle: ToolHandler;
}

export const toolRegistry: ToolEntry[] = [
  { def: kpisDef, handle: handleKpis },
  { def: leadsDef, handle: handleLeads },
  { def: cohortsDef, handle: handleCohorts },
  { def: homeworkDef, handle: handleHomework },
  { def: broadcastDef, handle: handleBroadcast },
  { def: promocodeDef, handle: handlePromocode },
  { def: activityDef, handle: handleActivity },
];

export function listToolDefs(): McpToolDef[] {
  return toolRegistry.map((entry) => entry.def);
}

export async function dispatchTool(name: string, args: unknown): Promise<McpToolResult> {
  const entry = toolRegistry.find((candidate) => candidate.def.name === name);
  if (entry === undefined) {
    return errorResult("unknown_tool", { tool: name });
  }
  return entry.handle(args);
}
