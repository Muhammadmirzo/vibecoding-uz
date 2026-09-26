import { bigint, index, pgTable, uuid, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const telegramLoginRequests = pgTable("telegram_login_requests", {
  id: uuid("id").primaryKey().defaultRandom(),
  nonceHash: text("nonce_hash").notNull().unique(),
  status: text("status").default("pending").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  tgUserId: text("tg_user_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  approvedAt: timestamp("approved_at"),
  consumedAt: timestamp("consumed_at"),
  ip: text("ip"),
  userAgent: text("user_agent"),
}, (table) => [
  index("telegram_login_requests_tg_pending_idx").on(table.tgUserId, table.status, table.expiresAt),
]);

/** Telegram retries a webhook until it gets 200; insert-first on update_id makes processing idempotent. */
export const telegramUpdates = pgTable("telegram_updates", {
  updateId: bigint("update_id", { mode: "number" }).primaryKey(),
  receivedAt: timestamp("received_at", { withTimezone: true }).defaultNow().notNull(),
});
