import { and, desc, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, mcpAccessTokens, mcpAuthorizationCodes, mcpClients, mcpPersonalAccessTokens, mcpRefreshTokens } from "@/db/schema";
import { ServiceError } from "@/lib/http/errors";
import { ALL_MCP_SCOPES, mcpScopeSchema, type CreatePatInput, type McpScope, type McpSender, type TokenRequest } from "../contracts";
import { ACCESS_TTL_MS, AUTH_CODE_TTL_MS, REFRESH_TTL_MS, pkceS256, randomOpaqueToken, safeDigestEqual, safeHashEqual, tokenHash } from "./tokens";

const REFRESH_REUSE_GRACE_MS = 30_000;

function scopes(value: string | undefined): McpScope[] {
  const valid = new Set<string>(ALL_MCP_SCOPES);
  return [...new Set((value ?? "").split(/\s+/).filter((item) => valid.has(item) && mcpScopeSchema.safeParse(item).success))].map((item) => mcpScopeSchema.parse(item));
}

export async function registerOAuthClient(input: { clientName: string; redirectUris: string[]; scope?: string; createdBy?: string }) {
  const [row] = await db.insert(mcpClients).values({ clientId: randomOpaqueToken("code").replace("code", "client"), name: input.clientName, redirectUris: input.redirectUris, scopes: scopes(input.scope), createdBy: input.createdBy }).returning();
  return { client_id: row.clientId, client_name: row.name, redirect_uris: row.redirectUris, grant_types: ["authorization_code", "refresh_token"], response_types: ["code"], token_endpoint_auth_method: "none" as const };
}

export async function getOAuthClient(clientId: string) {
  const [row] = await db.select({ clientId: mcpClients.clientId, name: mcpClients.name, redirectUris: mcpClients.redirectUris, scopes: mcpClients.scopes }).from(mcpClients).where(and(eq(mcpClients.clientId, clientId), isNull(mcpClients.revokedAt))).limit(1);
  if (!row) throw new ServiceError("invalid_client", "MCP mijoz topilmadi", 404);
  return row;
}

export async function issueAuthorizationCode(input: { clientId: string; userId: string; redirectUri: string; resource: string; requestedScopes: string; state: string; challenge: string }) {
  const [client] = await db.select().from(mcpClients).where(and(eq(mcpClients.clientId, input.clientId), isNull(mcpClients.revokedAt))).limit(1);
  if (!client) throw new ServiceError("invalid_client", "MCP mijoz topilmadi", 400);
  if (!client.redirectUris.includes(input.redirectUri)) throw new ServiceError("invalid_redirect_uri", "Redirect URI ruxsat etilmagan", 400);
  const requested = scopes(input.requestedScopes);
  if (!requested.length) throw new ServiceError("invalid_scope", "Kamida bitta ruxsat tanlang", 400);
  const code = randomOpaqueToken("code");
  await db.insert(mcpAuthorizationCodes).values({ codeHash: tokenHash(code), clientId: client.clientId, userId: input.userId, redirectUri: input.redirectUri, resource: input.resource, scopes: requested, codeChallenge: input.challenge, expiresAt: new Date(Date.now() + AUTH_CODE_TTL_MS) });
  return { code, state: input.state, redirectUri: input.redirectUri };
}

async function issuePair(input: { userId: string; clientId: string; scopes: McpScope[]; sender: McpSender; resource: string; familyId?: string }) {
  const access = randomOpaqueToken("at"); const refresh = randomOpaqueToken("rt"); const familyId = input.familyId ?? crypto.randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(mcpAccessTokens).values({ tokenHash: tokenHash(access), userId: input.userId, clientId: input.clientId, sender: input.sender, resource: input.resource, scopes: input.scopes, expiresAt: new Date(Date.now() + ACCESS_TTL_MS) });
    await tx.insert(mcpRefreshTokens).values({ familyId, tokenHash: tokenHash(refresh), userId: input.userId, clientId: input.clientId, scopes: input.scopes, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) });
  });
  return { access_token: access, token_type: "Bearer", expires_in: ACCESS_TTL_MS / 1000, refresh_token: refresh, scope: input.scopes.join(" ") };
}

export async function exchangeToken(input: TokenRequest, expectedResource: string) {
  if (input.resource !== expectedResource) throw new ServiceError("invalid_target", "Resource mos emas", 400);
  if (input.grant_type === "authorization_code" && input.code && input.code_verifier) {
    const [code] = await db.select().from(mcpAuthorizationCodes).where(and(eq(mcpAuthorizationCodes.codeHash, tokenHash(input.code)), gt(mcpAuthorizationCodes.expiresAt, new Date()), isNull(mcpAuthorizationCodes.usedAt))).limit(1);
    if (!code || !safeHashEqual(input.code, code.codeHash) || code.redirectUri !== (input.redirect_uri ?? "") || !safeDigestEqual(pkceS256(input.code_verifier), code.codeChallenge)) throw new ServiceError("invalid_grant", "Authorization code yaroqsiz", 400);
    const [client] = await db.select().from(mcpClients).where(eq(mcpClients.clientId, code.clientId)).limit(1);
    if (!client) throw new ServiceError("invalid_client", "MCP mijoz topilmadi", 400);
    const [used] = await db.update(mcpAuthorizationCodes).set({ usedAt: new Date() }).where(and(eq(mcpAuthorizationCodes.id, code.id), isNull(mcpAuthorizationCodes.usedAt))).returning({ id: mcpAuthorizationCodes.id });
    if (!used) throw new ServiceError("invalid_grant", "Authorization code ishlatilgan", 400);
    return issuePair({ userId: code.userId, clientId: code.clientId, scopes: scopes(code.scopes.join(" ")), sender: client.defaultSender === "ai" ? "ai" : "admin", resource: code.resource });
  }
  if (!input.refresh_token) throw new ServiceError("invalid_grant", "Refresh token talab qilinadi", 400);
  const refreshToken = input.refresh_token;
  const [presented] = await db.select().from(mcpRefreshTokens).where(eq(mcpRefreshTokens.tokenHash, tokenHash(refreshToken))).limit(1);
  // Reuse of an already rotated token means it leaked: kill the whole family. This runs outside the
  // rotation transaction on purpose, a throw inside it would roll the revocation back.
  // A 30 s grace (L11) keeps a client's own parallel refresh from logging it out.
  if (presented?.rotatedAt && Date.now() - presented.rotatedAt.getTime() < REFRESH_REUSE_GRACE_MS) throw new ServiceError("invalid_grant", "Refresh token allaqachon aylantirilgan", 400);
  if (presented?.rotatedAt) {
    await db.update(mcpRefreshTokens).set({ revokedAt: new Date() }).where(and(eq(mcpRefreshTokens.familyId, presented.familyId), isNull(mcpRefreshTokens.revokedAt)));
    throw new ServiceError("invalid_grant", "Token oilasi bekor qilindi", 400);
  }
  if (!presented || presented.expiresAt <= new Date() || presented.revokedAt) throw new ServiceError("invalid_grant", "Refresh token yaroqsiz", 400);
  return db.transaction(async (tx) => {
    // Atomic claim: of two parallel refreshes with the same token only one wins.
    const [old] = await tx.update(mcpRefreshTokens).set({ rotatedAt: new Date(), revokedAt: new Date() })
      .where(and(eq(mcpRefreshTokens.id, presented.id), isNull(mcpRefreshTokens.rotatedAt), isNull(mcpRefreshTokens.revokedAt))).returning();
    if (!old) throw new ServiceError("invalid_grant", "Refresh token allaqachon aylantirilgan", 400);
    const [client] = await tx.select().from(mcpClients).where(and(eq(mcpClients.clientId, old.clientId), isNull(mcpClients.revokedAt))).limit(1);
    if (!client) throw new ServiceError("invalid_client", "MCP mijoz topilmadi", 400);
    const freshAccess = randomOpaqueToken("at"); const freshRefresh = randomOpaqueToken("rt");
    await tx.insert(mcpAccessTokens).values({ tokenHash: tokenHash(freshAccess), userId: old.userId, clientId: old.clientId, sender: client.defaultSender === "ai" ? "ai" : "admin", resource: expectedResource, scopes: old.scopes, expiresAt: new Date(Date.now() + ACCESS_TTL_MS) });
    await tx.insert(mcpRefreshTokens).values({ familyId: old.familyId, tokenHash: tokenHash(freshRefresh), userId: old.userId, clientId: old.clientId, scopes: old.scopes, expiresAt: new Date(Date.now() + REFRESH_TTL_MS) });
    return { access_token: freshAccess, token_type: "Bearer", expires_in: ACCESS_TTL_MS / 1000, refresh_token: freshRefresh, scope: old.scopes.join(" ") };
  });
}

export async function revokeOAuthToken(value: string): Promise<void> {
  const digest = tokenHash(value);
  await db.update(mcpAccessTokens).set({ revokedAt: new Date() }).where(eq(mcpAccessTokens.tokenHash, digest));
  await db.update(mcpRefreshTokens).set({ revokedAt: new Date() }).where(eq(mcpRefreshTokens.tokenHash, digest));
}

export async function createPat(input: CreatePatInput, userId: string) {
  const value = randomOpaqueToken("pat");
  const [row] = await db.insert(mcpPersonalAccessTokens).values({ name: input.name, tokenHash: tokenHash(value), createdBy: userId, scopes: input.scopes, sender: input.sender, expiresAt: new Date(Date.now() + input.expiresInDays * 86_400_000) }).returning({ id: mcpPersonalAccessTokens.id, name: mcpPersonalAccessTokens.name, scopes: mcpPersonalAccessTokens.scopes, sender: mcpPersonalAccessTokens.sender, expiresAt: mcpPersonalAccessTokens.expiresAt, lastUsedAt: mcpPersonalAccessTokens.lastUsedAt, createdAt: mcpPersonalAccessTokens.createdAt });
  await db.insert(auditLogs).values({ userId, action: "mcp.pat.create", entityType: "mcp_personal_access_token", entityId: row.id, details: { name: row.name, scopes: row.scopes } });
  return { ...row, token: value };
}

export async function listPats(userId: string) { return db.select({ id: mcpPersonalAccessTokens.id, name: mcpPersonalAccessTokens.name, scopes: mcpPersonalAccessTokens.scopes, sender: mcpPersonalAccessTokens.sender, expiresAt: mcpPersonalAccessTokens.expiresAt, lastUsedAt: mcpPersonalAccessTokens.lastUsedAt, revokedAt: mcpPersonalAccessTokens.revokedAt, createdAt: mcpPersonalAccessTokens.createdAt }).from(mcpPersonalAccessTokens).where(eq(mcpPersonalAccessTokens.createdBy, userId)).orderBy(desc(mcpPersonalAccessTokens.createdAt)).limit(100); }

export async function revokeCredential(userId: string, id: string) {
  const [pat] = await db.update(mcpPersonalAccessTokens).set({ revokedAt: new Date() }).where(and(eq(mcpPersonalAccessTokens.id, id), eq(mcpPersonalAccessTokens.createdBy, userId))).returning({ id: mcpPersonalAccessTokens.id });
  if (!pat) throw new ServiceError("NOT_FOUND", "Token topilmadi", 404);
  await db.insert(auditLogs).values({ userId, action: "mcp.pat.revoke", entityType: "mcp_personal_access_token", entityId: id });
}
