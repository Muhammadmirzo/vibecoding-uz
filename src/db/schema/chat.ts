import { pgTable, text, timestamp, integer, uuid, boolean, index, uniqueIndex } from "drizzle-orm/pg-core";
import { users } from "./users";
import { leads } from "./crm";

export const chatConversations = pgTable("chat_conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  visitorTokenHash: text("visitor_token_hash").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  leadId: uuid("lead_id").references(() => leads.id, { onDelete: "set null" }),
  displayName: text("display_name").notNull(),
  contactPhone: text("contact_phone"),
  contactTelegram: text("contact_telegram"),
  status: text("status").default("open").notNull(),
  assignedAdminId: uuid("assigned_admin_id").references(() => users.id, { onDelete: "set null" }),
  aiMode: text("ai_mode").default("assist").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  unreadForAdmin: integer("unread_for_admin").default(0).notNull(),
  unreadForVisitor: integer("unread_for_visitor").default(0).notNull(),
  sourcePath: text("source_path").default("/").notNull(),
  device: text("device").default("unknown").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("chat_conversations_visitor_idx").on(table.visitorTokenHash),
  index("chat_conversations_status_idx").on(table.status, table.lastMessageAt),
]);

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversationId: uuid("conversation_id").references(() => chatConversations.id, { onDelete: "cascade" }).notNull(),
  clientId: text("client_id").notNull(),
  sender: text("sender").notNull(),
  authorUserId: uuid("author_user_id").references(() => users.id, { onDelete: "set null" }),
  body: text("body").notNull(),
  telegramMessageId: text("telegram_message_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  readAt: timestamp("read_at"),
}, (table) => [
  uniqueIndex("chat_messages_client_idx").on(table.conversationId, table.clientId),
  index("chat_messages_conversation_idx").on(table.conversationId, table.createdAt),
  index("chat_messages_telegram_idx").on(table.telegramMessageId),
]);

export type ChatConversation = typeof chatConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type ChatSettings = { enabled: boolean; welcomeText: string; officeHours: { start: number; end: number; tz: string }; offlineText: string; aiDefaultMode: "off" | "assist" | "auto"; aiModel: string; aiDailyReplyCap: number; aiPersona: string; telegramNotify: boolean; quickReplies: string[] };
