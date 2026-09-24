import { withTransactionLock } from "@/db";
import { ServiceError } from "@/lib/http/errors";
import type { HomeworkAdminQuery } from "@/lib/validations/crm";
import { assertReviewerRole, type ReviewHomeworkServiceInput } from "../domain/homework-policy";
import { paginate, type PageResult } from "../domain/pagination";
import type { DbExecutor, HomeworkRepository, ReviewRow, SubmissionListItem, SubmissionRow } from "./homework.repository";

export async function listSubmissions(
  repo: HomeworkRepository,
  query: HomeworkAdminQuery,
): Promise<PageResult<SubmissionListItem> & { submissions: SubmissionListItem[] }> {
  const all = await repo.listSubmissions();
  const filtered = query.status && query.status !== "all" ? all.filter((s) => s.status === query.status) : all;
  const page = paginate(filtered, query.page, query.limit);
  return { ...page, submissions: page.items };
}

export interface ReviewOutcome {
  submission: SubmissionRow;
  review: ReviewRow;
}

/**
 * Grades a submission. The status update + review upsert + audit insert
 * run in ONE transaction. The reviewer identity comes from the session
 * (service takes reviewerId/reviewerRole params — never trusts the body).
 */
export async function reviewSubmission(
  repo: HomeworkRepository,
  input: ReviewHomeworkServiceInput,
): Promise<ReviewOutcome> {
  assertReviewerRole(input.reviewerRole);
  return withTransactionLock(`homework-review:${input.submissionId}`, async (tx) => {
    const ex = tx as DbExecutor;
    if (!ex) throw new ServiceError("PROVIDER_UNAVAILABLE", "Baza tranzaksiyasi mavjud emas", 503);
    const existing = await repo.findSubmissionByIdTx(ex, input.submissionId);
    if (!existing) throw new ServiceError("NOT_FOUND", "Topshiriq topilmadi", 404);
    const updated = await repo.setSubmissionStatusTx(ex, input.submissionId, input.status);
    if (!updated) throw new ServiceError("NOT_FOUND", "Topshiriq topilmadi", 404);
    const reviewInput = {
      mentorId: input.reviewerId,
      criteriaResults: input.criteriaResults,
      score: input.score.toFixed(2),
      feedbackMd: input.feedbackMd || "",
    };
    const previous = await repo.findReviewBySubmissionTx(ex, input.submissionId);
    const review = previous
      ? await repo.updateReviewTx(ex, input.submissionId, reviewInput)
      : await repo.insertReviewTx(ex, input.submissionId, reviewInput);
    await repo.recordAuditTx(ex, {
      action: "homework.review",
      entityType: "homework_submission",
      entityId: input.submissionId,
      details: { status: input.status, score: input.score, mentorId: input.reviewerId },
      ip: input.ip,
    });
    return { submission: updated, review };
  });
}
