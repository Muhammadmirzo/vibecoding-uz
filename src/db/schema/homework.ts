import { pgTable, text, timestamp, integer, jsonb, uuid, decimal, uniqueIndex } from "drizzle-orm/pg-core";
import { submissionStatusEnum } from "./enums";
import { lessons } from "./courses";
import { users } from "./users";

export const homeworkAssignments = pgTable("homework_assignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  lessonId: uuid("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  descriptionMd: text("description_md").notNull(),
  acceptanceCriteria: jsonb("acceptance_criteria").notNull(), // [{ criterion: string, weight: number }]
});

export const homeworkSubmissions = pgTable("homework_submissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  assignmentId: uuid("assignment_id").references(() => homeworkAssignments.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  attemptNo: integer("attempt_no").default(1).notNull(),
  payload: jsonb("payload").notNull(), // { fileUrls: string[], githubUrl?: string, note?: string }
  status: submissionStatusEnum("status").default("submitted").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
}, (table) => [
  uniqueIndex("homework_submissions_attempt_uq").on(table.assignmentId, table.userId, table.attemptNo),
]);

export const homeworkReviews = pgTable("homework_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  submissionId: uuid("submission_id").references(() => homeworkSubmissions.id, { onDelete: "cascade" }).notNull(),
  mentorId: uuid("mentor_id").references(() => users.id).notNull(),
  criteriaResults: jsonb("criteria_results").notNull(),
  score: decimal("score", { precision: 4, scale: 2 }).notNull(),
  feedbackMd: text("feedback_md"),
  reviewedAt: timestamp("reviewed_at").defaultNow().notNull(),
});
