import { pgTable, text, timestamp, integer, boolean, jsonb, uuid, decimal, index, uniqueIndex } from "drizzle-orm/pg-core";
import { courseStatusEnum, dripRuleEnum } from "./enums";
import { users } from "./users";

export const courses = pgTable("courses", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description"),
  coverUrl: text("cover_url"),
  level: text("level").default("Boshlang'ich"),
  durationWeeks: integer("duration_weeks").default(8),
  priceSum: decimal("price_sum", { precision: 12, scale: 2 }).notNull(),
  oldPriceSum: decimal("old_price_sum", { precision: 12, scale: 2 }),
  installmentMonths: integer("installment_months").default(3),
  status: courseStatusEnum("status").default("published").notNull(),
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  index("courses_title_idx").on(table.title),
  index("courses_status_idx").on(table.status),
]);

export const courseSections = pgTable("course_sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").default(0),
});

export const lessons = pgTable("lessons", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("section_id").references(() => courseSections.id, { onDelete: "cascade" }).notNull(),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  videoUrl: text("video_url"),
  videoHlsUrl: text("video_hls_url"),
  durationSec: integer("duration_sec").default(0),
  contentMd: text("content_md"),
  promptsJson: jsonb("prompts_json"),
  materialsJson: jsonb("materials_json"),
  isFreePreview: boolean("is_free_preview").default(false).notNull(),
  dripRule: dripRuleEnum("drip_rule").default("none").notNull(),
  dripValue: text("drip_value"),
  sortOrder: integer("sort_order").default(0),
});

export const lessonProgress = pgTable("lesson_progress", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  positionSec: integer("position_sec").default(0).notNull(),
  completedAt: timestamp("completed_at"),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("lesson_progress_user_lesson_uq").on(table.userId, table.lessonId),
]);
