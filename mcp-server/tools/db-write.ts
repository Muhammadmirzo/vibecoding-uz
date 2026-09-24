/**
 * Write-path Drizzle queries for the MCP tools (grade_homework,
 * broadcast_notification). Loaded lazily so tests with injected deps
 * never touch a database.
 */
import { count, eq, inArray } from "drizzle-orm";
import {
  broadcastNotifications,
  cohorts,
  enrollments,
  homeworkReviews,
  homeworkSubmissions,
  leads,
  users,
} from "../../src/db/schema";

type DbClient = Awaited<ReturnType<typeof loadDb>>;

async function loadDb() {
  const mod = await import("../../src/db");
  return mod.db;
}

// --- grade_homework ---------------------------------------------------------

export type GradeResultStatus = "approved" | "needs_revision" | "rejected";

type SubmissionStatus = "approved" | "reviewing" | "rejected";

const SUBMISSION_STATUS: Record<GradeResultStatus, SubmissionStatus> = {
  approved: "approved",
  needs_revision: "reviewing",
  rejected: "rejected",
};

export interface GradeSubmissionInput {
  submissionId: string;
  score: number;
  feedback: string;
  resultStatus: GradeResultStatus;
  mentorId: string;
}

export interface GradedSubmission {
  submissionId: string;
  score: number;
  feedback: string;
  status: GradeResultStatus;
  submissionStatus: SubmissionStatus;
  reviewedAt: string;
}

/** Returns null when the submission does not exist. */
export async function gradeSubmissionRecord(input: GradeSubmissionInput): Promise<GradedSubmission | null> {
  const db: DbClient = await loadDb();
  const [existing] = await db
    .select({ id: homeworkSubmissions.id })
    .from(homeworkSubmissions)
    .where(eq(homeworkSubmissions.id, input.submissionId))
    .limit(1);
  if (existing === undefined) return null;

  const submissionStatus = SUBMISSION_STATUS[input.resultStatus];
  await db
    .update(homeworkSubmissions)
    .set({ status: submissionStatus })
    .where(eq(homeworkSubmissions.id, input.submissionId));

  const [prior] = await db
    .select({ id: homeworkReviews.id })
    .from(homeworkReviews)
    .where(eq(homeworkReviews.submissionId, input.submissionId))
    .limit(1);
  const scoreText = input.score.toFixed(2);
  const reviewedAt =
    prior === undefined
      ? await db
          .insert(homeworkReviews)
          .values({
            submissionId: input.submissionId,
            mentorId: input.mentorId,
            criteriaResults: [],
            score: scoreText,
            feedbackMd: input.feedback,
          })
          .returning({ reviewedAt: homeworkReviews.reviewedAt })
          .then((rows) => rows[0]?.reviewedAt ?? new Date())
      : await db
          .update(homeworkReviews)
          .set({
            mentorId: input.mentorId,
            criteriaResults: [],
            score: scoreText,
            feedbackMd: input.feedback,
            reviewedAt: new Date(),
          })
          .where(eq(homeworkReviews.submissionId, input.submissionId))
          .returning({ reviewedAt: homeworkReviews.reviewedAt })
          .then((rows) => rows[0]?.reviewedAt ?? new Date());

  return {
    submissionId: input.submissionId,
    score: input.score,
    feedback: input.feedback,
    status: input.resultStatus,
    submissionStatus,
    reviewedAt: reviewedAt.toISOString(),
  };
}

// --- broadcast_notification --------------------------------------------------

export interface BroadcastInput {
  title: string;
  channel: string;
  targetAudience: string;
  messageBody: string;
  cohortId?: string;
}

export interface QueuedBroadcast {
  id: string;
  title: string;
  channel: string;
  targetAudience: string;
  recipientsCount: number;
  status: string;
  createdAt: string;
}

async function countAudience(db: DbClient, audience: string, cohortId: string | undefined): Promise<number> {
  if (audience === "all_users") {
    const rows = await db.select({ n: count() }).from(users);
    return rows[0]?.n ?? 0;
  }
  if (audience === "active_students") {
    const rows = await db
      .select({ n: count() })
      .from(enrollments)
      .where(eq(enrollments.status, "active"));
    return rows[0]?.n ?? 0;
  }
  if (audience === "leads_new" || audience === "leads_consultation") {
    const status = audience === "leads_new" ? "new" : "consultation";
    const rows = await db.select({ n: count() }).from(leads).where(eq(leads.status, status));
    return rows[0]?.n ?? 0;
  }
  if (audience === "cohort_students") {
    if (cohortId === undefined) throw new Error("cohort_required");
    const [cohort] = await db
      .select({ id: cohorts.id })
      .from(cohorts)
      .where(eq(cohorts.id, cohortId))
      .limit(1);
    if (cohort === undefined) throw new Error("cohort_not_found");
    const rows = await db
      .select({ n: count() })
      .from(enrollments)
      .where(eq(enrollments.cohortId, cohortId));
    return rows[0]?.n ?? 0;
  }
  if (audience === "pending_homework") {
    const rows = await db
      .selectDistinct({ userId: homeworkSubmissions.userId })
      .from(homeworkSubmissions)
      .where(inArray(homeworkSubmissions.status, ["submitted", "reviewing"]));
    return rows.length;
  }
  return 0;
}

export function isCohortAudience(audience: string): boolean {
  return audience === "cohort_students";
}

/**
 * Records the broadcast as a queued row and returns the real recipient
 * count. It does NOT send anything: no sender worker exists yet, so the
 * status stays "queued" and sentAt stays null. Never reports fake delivery.
 */
export async function queueBroadcastRecord(input: BroadcastInput): Promise<QueuedBroadcast> {
  const db: DbClient = await loadDb();
  const recipientsCount = await countAudience(db, input.targetAudience, input.cohortId);
  const [row] = await db
    .insert(broadcastNotifications)
    .values({
      title: input.title,
      channel: input.channel,
      targetAudience: input.targetAudience,
      cohortId: input.cohortId,
      messageBody: input.messageBody,
      status: "queued",
      recipientsCount,
    })
    .returning({
      id: broadcastNotifications.id,
      title: broadcastNotifications.title,
      channel: broadcastNotifications.channel,
      targetAudience: broadcastNotifications.targetAudience,
      recipientsCount: broadcastNotifications.recipientsCount,
      status: broadcastNotifications.status,
      createdAt: broadcastNotifications.createdAt,
    });
  if (row === undefined) throw new Error("broadcast_insert_failed");
  return {
    id: row.id,
    title: row.title,
    channel: row.channel,
    targetAudience: row.targetAudience,
    recipientsCount: row.recipientsCount,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  };
}
