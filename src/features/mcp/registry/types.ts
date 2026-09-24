import type { z } from "zod";
import type { McpPrincipal, McpAuthResult } from "../server/auth.service";
import type { ToolResultData } from "../contracts";

export interface ToolContext { principal: McpPrincipal }
export interface ToolRun { result: ToolResultData; title: string; imageSvg?: string }
export interface ToolDefinition {
  name: string; title: string; description: string; scope: string; readOnly: boolean; destructive: boolean;
  inputShape: Record<string, z.ZodTypeAny>;
  handler: (input: unknown, context: ToolContext) => Promise<ToolRun>;
  ui?: "dashboard" | "line" | "bar" | "funnel" | "table" | "kpi";
}
export type Registry = readonly ToolDefinition[];
export function result(summary: string, data: unknown, markdown: string | null = null, chartSpec: Record<string, unknown> | null = null, nextCursor: string | null = null): ToolResultData { return { summary, data, markdown, chartSpec, nextCursor }; }
export function toolError(error: unknown, title: string): ToolRun { const message = error instanceof Error ? error.message : "Ma'lumotni yuklab bo'lmadi"; return { result: result(message, { error: "service_unavailable" }, null), title }; }
export function isAuthFailure(result: McpAuthResult): boolean { return !result.principal; }
