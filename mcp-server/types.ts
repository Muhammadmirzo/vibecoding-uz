/**
 * Shared MCP tool plumbing: result envelope + tool definition types.
 * Every tool returns McpToolResult (never throws raw); invalid input and
 * auth failures are structured errors with isError: true.
 */
import { z } from "zod";

export interface McpTextContent {
  type: "text";
  text: string;
}

export interface McpToolResult {
  content: McpTextContent[];
  isError?: boolean;
}

export interface McpInputSchema {
  type: "object";
  properties?: Record<string, object>;
  required?: string[];
  [key: string]: unknown;
}

export interface McpToolDef {
  name: string;
  description: string;
  inputSchema: McpInputSchema;
  annotations?: {
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
  };
}

export type ToolHandler = (rawArgs: unknown) => Promise<McpToolResult>;

const AUTH_TOKEN_PROPERTY: Record<string, object> = {
  authToken: {
    type: "string",
    description: "MCP auth token (must match the server's MCP_AUTH_TOKEN env var)",
  },
};

export function withAuthProperty(properties: Record<string, object>): Record<string, object> {
  return { ...properties, ...AUTH_TOKEN_PROPERTY };
}

export function successResult(payload: Record<string, unknown>): McpToolResult {
  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

export function errorResult(error: string, details?: Record<string, unknown>): McpToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify({ ok: false, error, ...details }, null, 2) }],
    isError: true,
  };
}

const authTokenExtractor = z.object({ authToken: z.string().min(1).optional() });

/** Extracts the optional authToken string from raw tool arguments. */
export function extractAuthToken(rawArgs: unknown): string | undefined {
  const parsed = authTokenExtractor.safeParse(rawArgs);
  if (!parsed.success) return undefined;
  return parsed.data.authToken;
}
