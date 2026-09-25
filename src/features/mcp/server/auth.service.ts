import { createHash } from "node:crypto";
import { and, desc, eq, gt, isNull, sql } from "drizzle-orm";
import { db } from "@/db";
import { mcpAccessTokens, mcpClients, mcpPersonalAccessTokens, users } from "@/db/schema";
import { ALL_MCP_SCOPES, type McpScope, type McpSender } from "../contracts";

export interface McpPrincipal {
  userId: string; role: string; scopes: McpScope[]; clientId: string | null;
  sender: McpSender; tokenId: string; tokenType: "oauth" | "pat";
}
export interface McpAuthResult { principal: McpPrincipal | null; status: 401 | 403 | 429; retryAfter?: number }

function parseBearer(value: string | null): string | null {
  const match = value?.match(/^Bearer\s+([^\s]+)$/i);
  return match?.[1] ?? null;
}

function scopeList(value: string[]): McpScope[] {
  const allowed = new Set<string>(ALL_MCP_SCOPES);
  return value.filter((scope): scope is McpScope => allowed.has(scope));
}

export async function authenticateMcp(value: string | null, requiredScope?: string, expectedResource?: string): Promise<McpAuthResult> {
  const token = parseBearer(value);
  if (!token) return { principal: null, status: 401 };
  const digest = createHash("sha256").update(token).digest("hex");
  const [access] = await db.select({ row: mcpAccessTokens, role: users.role }).from(mcpAccessTokens)
    .innerJoin(users, eq(users.id, mcpAccessTokens.userId))
    .where(and(eq(mcpAccessTokens.tokenHash, digest), gt(mcpAccessTokens.expiresAt, new Date()), isNull(mcpAccessTokens.revokedAt))).limit(1);
  if (access) {
    if (expectedResource && access.row.resource !== expectedResource) return { principal: null, status: 401 };
    if (!["superadmin", "admin", "manager"].includes(access.role)) return { principal: null, status: 403 };
    const scopes = scopeList(access.row.scopes);
    if (requiredScope && !scopes.some((scope) => scope === requiredScope)) return { principal: null, status: 403 };
    void db.update(mcpAccessTokens).set({ lastUsedAt: new Date() }).where(eq(mcpAccessTokens.id, access.row.id));
    return { principal: { userId: access.row.userId, role: access.role, scopes, clientId: access.row.clientId, sender: access.row.sender === "ai" ? "ai" : "admin", tokenId: access.row.id, tokenType: "oauth" }, status: 401 };
  }
  const [pat] = await db.select({ row: mcpPersonalAccessTokens, role: users.role }).from(mcpPersonalAccessTokens)
    .innerJoin(users, eq(users.id, mcpPersonalAccessTokens.createdBy))
    .where(and(eq(mcpPersonalAccessTokens.tokenHash, digest), gt(mcpPersonalAccessTokens.expiresAt, new Date()), isNull(mcpPersonalAccessTokens.revokedAt))).limit(1);
  if (!pat) return { principal: null, status: 401 };
  if (!["superadmin", "admin", "manager"].includes(pat.role)) return { principal: null, status: 403 };
  const scopes = scopeList(pat.row.scopes);
  if (requiredScope && !scopes.some((scope) => scope === requiredScope)) return { principal: null, status: 403 };
  void db.update(mcpPersonalAccessTokens).set({ lastUsedAt: new Date() }).where(eq(mcpPersonalAccessTokens.id, pat.row.id));
  return { principal: { userId: pat.row.createdBy, role: pat.role, scopes, clientId: null, sender: pat.row.sender === "ai" ? "ai" : "admin", tokenId: pat.row.id, tokenType: "pat" }, status: 401 };
}

export async function consumeMcpRateLimit(principal: McpPrincipal, limit = 120): Promise<boolean> {
  const key = `mcp:${principal.tokenId}`;
  const rows = await db.execute(sql`INSERT INTO rate_limit_buckets (key, window_start, count) VALUES (${key}, now(), 1) ON CONFLICT (key) DO UPDATE SET count = CASE WHEN rate_limit_buckets.window_start < now() - interval '1 minute' THEN 1 ELSE rate_limit_buckets.count + 1 END, window_start = CASE WHEN rate_limit_buckets.window_start < now() - interval '1 minute' THEN now() ELSE rate_limit_buckets.window_start END RETURNING count`);
  const first = rows[0] && typeof rows[0] === "object" ? Object.fromEntries(Object.entries(rows[0])) : {}; return Number(first.count ?? 1) <= limit;
}

export async function listConnectedClients() {
  return db.select({ id: mcpAccessTokens.id, clientId: mcpAccessTokens.clientId, clientName: mcpClients.name, scopes: mcpAccessTokens.scopes, lastUsedAt: mcpAccessTokens.lastUsedAt, createdAt: mcpAccessTokens.createdAt, expiresAt: mcpAccessTokens.expiresAt }).from(mcpAccessTokens).leftJoin(mcpClients, eq(mcpClients.clientId, mcpAccessTokens.clientId)).where(sql`${mcpAccessTokens.revokedAt} is null`).orderBy(desc(mcpAccessTokens.lastUsedAt)).limit(100);
}
