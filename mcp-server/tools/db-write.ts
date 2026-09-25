/**
 * Write-path Drizzle queries for the MCP tools (grade_homework here,
 * broadcast_notification in db-write-broadcast.ts). The DB module is
 * loaded lazily so tests with injected deps never touch a database.
 * Every write + its audit_logs row run in ONE transaction (same advisory
 * lock key as the admin reviewSubmission service), so a failed audit
 * insert rolls the write back.
 */
import { eq } from "drizzle-orm";
import { homeworkReviews, homeworkSubmissions } from "../../src/db/schema";
import { recordMcpAudit, type DbExecutor } from "./db-audit";

async function loadDbModule() {
  return import("../../src/db");
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

/** Returns null when the submission does not exist (nothing is written). */
export async function gradeSubmissionRecord(input: GradeSubmissionInput): Promise<GradedSubmission | null> {
  const { withTransactionLock } = await loadDbModule();
  return withTransactionLock(`homework-review:${input.submissionId}`, async (tx) => {
    if (!tx) throw new Error("transaction_unavailable");
    return gradeInTransaction(tx, input);
  });
}

async function gradeInTransaction(ex: DbExecutor, input: GradeSubmissionInput): Promise<GradedSubmission | null> {
  const [existing] = await ex
    .select({ id: homeworkSubmissions.id })
    .from(homeworkSubmissions)
    .where(eq(homeworkSubmissions.id, input.submissionId))
    .limit(1);
  if (existing === undefined) return null;

  const submissionStatus = SUBMISSION_STATUS[input.resultStatus];
  await ex
    .update(homeworkSubmissions)
    .set({ status: submissionStatus })
    .where(eq(homeworkSubmissions.id, input.submissionId));

  const [prior] = await ex
    .select({ id: homeworkReviews.id })
    .from(homeworkReviews)
    .where(eq(homeworkReviews.submissionId, input.submissionId))
    .limit(1);
  const review = {
    mentorId: input.mentorId,
    criteriaResults: [],
    score: input.score.toFixed(2),
    feedbackMd: input.feedback,
  };
  const rows =
    prior === undefined
      ? await ex
          .insert(homeworkReviews)
          .values({ submissionId: input.submissionId, ...review })
          .returning({ reviewedAt: homeworkReviews.reviewedAt })
      : await ex
          .update(homeworkReviews)
          .set({ ...review, reviewedAt: new Date() })
          .where(eq(homeworkReviews.submissionId, input.submissionId))
          .returning({ reviewedAt: homeworkReviews.reviewedAt });
  const reviewedAt = rows[0]?.reviewedAt ?? new Date();

  await recordMcpAudit(ex, {
    action: "homework.review",
    entityType: "homework_submission",
    entityId: input.submissionId,
    details: {
      status: input.resultStatus,
      submissionStatus,
      score: input.score,
      mentorId: input.mentorId,
      reviewUpdated: prior !== undefined,
    },
  });

  return {
    submissionId: input.submissionId,
    score: input.score,
    feedback: input.feedback,
    status: input.resultStatus,
    submissionStatus,
    reviewedAt: reviewedAt.toISOString(),
  };
}

export * from "./db-write-broadcast";
