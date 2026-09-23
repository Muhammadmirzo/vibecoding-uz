import { pgTable, text, timestamp, varchar, jsonb, uuid } from "drizzle-orm/pg-core";
import { leadSourceEnum, leadStatusEnum } from "./enums";
import { users } from "./users";
import { courses } from "./courses";

export const leads = pgTable("leads", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  phone: varchar("phone", { length: 20 }),
  telegram: varchar("telegram", { length: 64 }),
  source: leadSourceEnum("source").default("form").notNull(),
  quizAnswers: jsonb("quiz_answers"),
  recommendedCourseId: uuid("recommended_course_id").references(() => courses.id),
  utm: jsonb("utm"),
  status: leadStatusEnum("status").default("new").notNull(),
  assignedManagerId: uuid("assigned_manager_id").references(() => users.id),
  nextContactAt: timestamp("next_contact_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
