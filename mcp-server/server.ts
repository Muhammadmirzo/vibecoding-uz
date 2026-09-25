/**
 * Shared MCP runner: tool registry + dispatch + server factory.
 * index.ts (stdio transport) and src/app/api/mcp/route.ts (Streamable HTTP
 * transport) both call createMcpServer() so tool wiring lives in one place;
 * tests import tool handlers directly and never touch transport wiring.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
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

export interface CreateMcpServerDeps {
  /**
   * When the *transport* already authenticated the caller (e.g. the HTTP
   * route's Bearer check), pass the verified token here so every tool call
   * carries it automatically — tools still gate on `authToken` themselves
   * (defense in depth), so callers over HTTP don't also have to repeat the
   * token inside every tool call's arguments. Stdio omits this and keeps
   * requiring the per-call `authToken` argument exactly as before.
   */
  injectAuthToken?: string;
}

/**
 * Builds a fresh MCP `Server` wired to the shared tool registry. Each
 * transport (stdio for the local CLI, Streamable HTTP for the remote
 * connector) gets its own instance connected to its own transport — the
 * tool code itself is never duplicated.
 */
export function createMcpServer(deps: CreateMcpServerDeps = {}): Server {
  const server = new Server(
    { name: "naqsh-mcp-server", version: "2.0.0" },
    { capabilities: { tools: {} } }
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: listToolDefs(),
  }));
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const rawArgs = request.params.arguments ?? {};
    const args =
      deps.injectAuthToken !== undefined && typeof rawArgs === "object" && rawArgs !== null
        ? { ...rawArgs, authToken: deps.injectAuthToken }
        : rawArgs;
    const result = await dispatchTool(request.params.name, args);
    return { content: result.content, isError: result.isError ?? false };
  });
  return server;
}
