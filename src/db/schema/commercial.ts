import { pgTable, text, timestamp, integer, uuid, decimal, jsonb } from "drizzle-orm/pg-core";
import { enrollmentStatusEnum, paymentProviderEnum, paymentStatusEnum } from "./enums";
import { users } from "./users";
import { courses } from "./courses";

export const cohorts = pgTable("cohorts", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  startsAt: timestamp("starts_at").notNull(),
  endsAt: timestamp("ends_at"),
  seats: integer("seats").default(30).notNull(),
  priceSum: decimal("price_sum", { precision: 12, scale: 2 }).notNull(),
  earlyPriceSum: decimal("early_price_sum", { precision: 12, scale: 2 }),
  earlyDeadline: timestamp("early_deadline"),
  telegramChatId: text("telegram_chat_id"),
  status: text("status").default("active").notNull(),
});

export const enrollments = pgTable("enrollments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  cohortId: uuid("cohort_id").references(() => cohorts.id, { onDelete: "cascade" }).notNull(),
  status: enrollmentStatusEnum("status").default("active").notNull(),
  enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
  source: text("source"),
  certificateCode: text("certificate_code"),
  finalScore: decimal("final_score", { precision: 4, scale: 2 }),
});

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  enrollmentId: uuid("enrollment_id").references(() => enrollments.id),
  provider: paymentProviderEnum("provider").notNull(),
  providerTxnId: text("provider_txn_id"),
  amountSum: decimal("amount_sum", { precision: 12, scale: 2 }).notNull(),
  status: paymentStatusEnum("status").default("pending").notNull(),
  paidAt: timestamp("paid_at"),
  receiptUrl: text("receipt_url"),
  meta: jsonb("meta"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
