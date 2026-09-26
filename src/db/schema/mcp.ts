import { index, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

const scopeList = jsonb("scopes").$type<string[]>().notNull().default([]);

/** RFC 7591 clients registered by remote AI hosts. */
export const mcpClients = pgTable("mcp_clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: text("client_id").notNull().unique(),
  name: text("name").notNull(),
  redirectUris: jsonb("redirect_uris").$type<string[]>().notNull().default([]),
  scopes: scopeList,
  defaultSender: text("default_sender").notNull().default("admin"),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  revokedAt: timestamp("revoked_at"),
});

/** Single-use OAuth authorization code. Only the SHA-256 digest is persisted. */
export const mcpAuthorizationCodes = pgTable("mcp_authorization_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  codeHash: text("code_hash").notNull().unique(),
  clientId: text("client_id").notNull().references(() => mcpClients.clientId, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  redirectUri: text("redirect_uri").notNull(),
  resource: text("resource").notNull(),
  scopes: scopeList,
  codeChallenge: text("code_challenge").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  usedAt: timestamp("used_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const mcpAccessTokens = pgTable("mcp_access_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").references(() => mcpClients.clientId, { onDelete: "cascade" }),
  sender: text("sender").notNull().default("admin"),
  resource: text("resource").notNull(),
  scopes: scopeList,
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("mcp_access_principal_idx").on(table.userId, table.revokedAt)]);

/** Rotating refresh-token family. Raw token values are never stored. */
export const mcpRefreshTokens = pgTable("mcp_refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  familyId: uuid("family_id").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  clientId: text("client_id").notNull().references(() => mcpClients.clientId, { onDelete: "cascade" }),
  scopes: scopeList,
  expiresAt: timestamp("expires_at").notNull(),
  rotatedAt: timestamp("rotated_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("mcp_refresh_family_idx").on(table.familyId, table.revokedAt)]);

export const mcpPersonalAccessTokens = pgTable("mcp_personal_access_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  tokenHash: text("token_hash").notNull().unique(),
  createdBy: uuid("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  scopes: scopeList,
  sender: text("sender").notNull().default("admin"),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at"),
  revokedAt: timestamp("revoked_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [index("mcp_pat_owner_idx").on(table.createdBy, table.revokedAt)]);
