import { ZodError, type z } from "zod";
import { ServiceError } from "@/lib/http/errors";
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
/** Only validation and ServiceError texts are user-safe; DB/driver errors (SQL, hosts) never reach the model. */
export function toolError(error: unknown, title: string): ToolRun {
  if (error instanceof ZodError) return { result: result("Kiritilgan ma'lumot yaroqsiz.", { error: "validation_error", issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message })) }), title };
  if (error instanceof ServiceError) return { result: result(error.message, { error: error.code }), title };
  return { result: result("Ma'lumotni yuklab bo'lmadi. Keyinroq urinib ko'ring.", { error: "service_unavailable" }), title };
}
export function isAuthFailure(result: McpAuthResult): boolean { return !result.principal; }
