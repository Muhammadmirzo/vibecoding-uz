import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, index } from "drizzle-orm/pg-core";
import { users } from "./users";
import { cohorts } from "./commercial";

export const broadcastNotifications = pgTable("broadcast_notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  channel: text("channel").default("telegram").notNull(),
  targetAudience: text("target_audience").default("all_users").notNull(),
  cohortId: uuid("cohort_id").references(() => cohorts.id, { onDelete: "set null" }),
  messageBody: text("message_body").notNull(),
  status: text("status").default("draft").notNull(),
  recipientsCount: integer("recipients_count").default(0).notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userEmail: text("user_email"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  details: jsonb("details"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const faqs = pgTable("faqs", {
  id: uuid("id").primaryKey().defaultRandom(),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  category: text("category").default("Umumiy").notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const jobOpenings = pgTable("job_openings", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  department: text("department").notNull(),
  location: text("location").default("Toshkent / Masofaviy").notNull(),
  type: text("type").default("To'liq stavka").notNull(),
  descriptionMd: text("description_md").notNull(),
  requirements: jsonb("requirements"),
  status: text("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const portfolios = pgTable("portfolios", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  url: text("url").notNull(),
  domain: text("domain").notNull(),
  category: text("category").default("Startup MVP").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  userCount: text("user_count"),
  badgeText: text("badge_text").default("Shu metod bilan qurilgan").notNull(),
  isFeatured: boolean("is_featured").default(true).notNull(),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("portfolios_slug_idx").on(table.slug),
  index("portfolios_cat_idx").on(table.category),
]);
