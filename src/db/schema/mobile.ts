import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

/**
 * W9 mobile API. Native clients authenticate with short-lived JWT access
 * tokens + long-lived opaque refresh tokens (stored hashed, never logged).
 */
export const apiRefreshTokens = pgTable("api_refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  sessionId: uuid("session_id"),
  tokenHash: text("token_hash").notNull().unique(),
  deviceId: text("device_id").notNull().default("unknown"),
  deviceName: text("device_name"),
  platform: text("platform").notNull().default("android"),
  appVersion: text("app_version"),
  expiresAt: timestamp("expires_at").notNull(),
  lastUsedAt: timestamp("last_used_at").defaultNow().notNull(),
  revokedAt: timestamp("revoked_at"),
  rotatedFrom: uuid("rotated_from"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("api_refresh_tokens_user_idx").on(table.userId, table.revokedAt),
  index("api_refresh_tokens_device_idx").on(table.userId, table.deviceId),
]);

export const pushDevices = pgTable("push_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  platform: text("platform").notNull().default("android"),
  pushToken: text("push_token").notNull().unique(),
  appVersion: text("app_version"),
  locale: text("locale").default("uz").notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
  disabledAt: timestamp("disabled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("push_devices_user_idx").on(table.userId, table.disabledAt),
]);
