import { z } from "zod";

export const MCP_SCOPES = [
  "analytics:read", "students:read", "sales:read", "chat:read", "chat:write", "content:write", "leads:write",
] as const;
export const MCP_PII_SCOPE = "students:read:pii" as const;
export const ALL_MCP_SCOPES = [...MCP_SCOPES, MCP_PII_SCOPE] as const;
export const mcpScopeSchema = z.enum(ALL_MCP_SCOPES);
export type McpScope = z.infer<typeof mcpScopeSchema>;
export type McpSender = "ai" | "admin";

const isoDate = z.string().datetime({ offset: true });
export const dateRangeShape = {
  from: isoDate, to: isoDate,
  granularity: z.enum(["day", "week"]).default("day"),
};
export const dateRangeInputSchema = z.object(dateRangeShape).refine((value) => new Date(value.from) < new Date(value.to), { message: "from va to tartibi noto'g'ri" })
  .refine((value) => new Date(value.to).getTime() - new Date(value.from).getTime() <= 366 * 86_400_000, { message: "Davr 366 kundan oshmasligi kerak" });

export const cursorShape = {
  limit: z.number().int().min(1).max(100).default(20),
  cursor: z.string().max(256).optional(),
};
export const cursorInputSchema = z.object(cursorShape);
export const uuidInputSchema = z.object({ id: z.string().uuid() });

export const createPatSchema = z.object({
  name: z.string().trim().min(2).max(80),
  scopes: z.array(mcpScopeSchema).min(1).max(ALL_MCP_SCOPES.length),
  expiresInDays: z.number().int().min(1).max(365).default(90),
  sender: z.enum(["ai", "admin"]).default("admin"),
});
export type CreatePatInput = z.infer<typeof createPatSchema>;

const BLOCKED_SCHEMES = new Set(["javascript:", "data:", "vbscript:", "file:", "blob:", "about:", "filesystem:"]);
const LOOPBACK_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);
/** OAuth 2.1 redirect URI rule: https, loopback http or a native-app scheme; never script-capable schemes, fragments or credentials. */
export function isSafeRedirectUri(value: string): boolean {
  let url: URL;
  try { url = new URL(value); } catch { return false; }
  if (url.hash || url.username || url.password || BLOCKED_SCHEMES.has(url.protocol)) return false;
  if (url.protocol === "http:") return LOOPBACK_HOSTS.has(url.hostname);
  return true; // https or a native-app scheme (RFC 8252), e.g. cursor://
}
export const redirectUriSchema = z.string().max(2048).refine(isSafeRedirectUri, { message: "Redirect URI xavfsiz emas" });

export const registerClientSchema = z.object({
  client_name: z.string().trim().min(2).max(100),
  redirect_uris: z.array(redirectUriSchema).min(1).max(10),
  client_uri: z.string().url().max(2048).optional(),
  scope: z.string().max(1000).optional(),
  token_endpoint_auth_method: z.literal("none").default("none"),
});
export const authorizeQuerySchema = z.object({
  response_type: z.literal("code"), client_id: z.string().min(3).max(200),
  redirect_uri: redirectUriSchema, code_challenge: z.string().min(43).max(128),
  code_challenge_method: z.literal("S256"), state: z.string().min(8).max(512),
  // Clients may omit scope: default to read-only scopes (the admin still sees them on the consent page).
  scope: z.string().max(1000).default("analytics:read students:read sales:read chat:read"), resource: z.string().url().max(2048),
});
export const consentSchema = authorizeQuerySchema.extend({ decision: z.literal("allow") });
export const tokenRequestSchema = z.object({
  grant_type: z.enum(["authorization_code", "refresh_token"]), code: z.string().optional(),
  redirect_uri: z.string().url().optional(), code_verifier: z.string().min(43).max(128).optional(),
  refresh_token: z.string().optional(), resource: z.string().url(),
}).refine((v) => v.grant_type !== "authorization_code" || Boolean(v.code && v.code_verifier), { message: "code va code_verifier talab qilinadi" })
  .refine((v) => v.grant_type !== "refresh_token" || Boolean(v.refresh_token), { message: "refresh_token talab qilinadi" });
export type TokenRequest = z.infer<typeof tokenRequestSchema>;

export const toolResultSchema = z.object({
  summary: z.string(), data: z.unknown(), markdown: z.string().nullable(),
  chartSpec: z.record(z.unknown()).nullable(), nextCursor: z.string().nullable(),
});
export type ToolResultData = z.infer<typeof toolResultSchema>;
