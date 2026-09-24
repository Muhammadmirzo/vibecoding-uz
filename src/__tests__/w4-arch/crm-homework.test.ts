import { describe, expect, it, vi } from "vitest";
import { homeworkAdminQuerySchema } from "@/lib/validations/crm";
import { reviewHomeworkBodySchema } from "@/features/crm/domain/homework-policy";
import { listSubmissions, reviewSubmission } from "@/features/crm/server/homework.service";
import type {
  HomeworkRepository,
  ReviewRow,
  SubmissionListItem,
  SubmissionRow,
} from "@/features/crm/server/homework.repository";

vi.mock("@/db", () => ({
  withTransactionLock: async (_key: string, fn: (tx: unknown) => Promise<unknown>) => fn({}),
}));

const SUBMISSION_ID = "55555555-5555-4555-8555-555555555555";
const MENTOR_ID = "66666666-6666-4666-8666-666666666666";

function makeSubmission(overrides: Partial<SubmissionRow> = {}): SubmissionRow {
  return {
    id: SUBMISSION_ID,
    assignmentId: "77777777-7777-4777-8777-777777777777",
    userId: "88888888-8888-4888-8888-888888888888",
    attemptNo: 1,
    payload: {},
    status: "submitted",
    submittedAt: new Date("2026-01-01T00:00:00Z"),
    ...overrides,
  };
}

function makeReview(overrides: Partial<ReviewRow> = {}): ReviewRow {
  return {
    id: "99999999-9999-4999-8999-999999999999",
    submissionId: SUBMISSION_ID,
    mentorId: MENTOR_ID,
    criteriaResults: [],
    score: "85.00",
    feedbackMd: "Yaxshi",
    reviewedAt: new Date("2026-01-02T00:00:00Z"),
    ...overrides,
  };
}

function makeItem(overrides: Partial<SubmissionListItem> = {}): SubmissionListItem {
  return {
    id: SUBMISSION_ID,
    assignmentId: "77777777-7777-4777-8777-777777777777",
    assignmentTitle: "Assignment",
    assignmentDescription: null,
    acceptanceCriteria: [],
    lessonId: null,
    lessonTitle: null,
    studentId: "88888888-8888-4888-8888-888888888888",
    studentName: "Student",
    studentPhone: null,
    studentAvatar: null,
    attemptNo: 1,
    payload: {},
    status: "submitted",
    submittedAt: new Date("2026-01-01T00:00:00Z"),
    review: null,
    ...overrides,
  };
}

const reviewInput = {
  submissionId: SUBMISSION_ID,
  reviewerId: MENTOR_ID,
  reviewerRole: "mentor",
  criteriaResults: [{ criterion: "correctness", score: 8, maxScore: 10 }],
  score: 85,
  feedbackMd: "Yaxshi ish",
  status: "approved" as const,
  ip: "1.1.1.1",
};

function baseRepo(overrides: Partial<HomeworkRepository> = {}): HomeworkRepository {
  const fake: HomeworkRepository = {
    listSubmissions: async () => [],
    findSubmissionByIdTx: async (_ex, id) => (id === SUBMISSION_ID ? makeSubmission() : null),
    setSubmissionStatusTx: async (_ex, id, status) => (id === SUBMISSION_ID ? makeSubmission({ status }) : null),
    findReviewBySubmissionTx: async () => null,
    updateReviewTx: async (_ex, _id, input) => makeReview({ ...input }),
    insertReviewTx: async (_ex, _id, input) => makeReview({ ...input }),
    recordAuditTx: async () => undefined,
    ...overrides,
  };
  return fake;
}

describe("homework review service", () => {
  it("rejects reviewers without a mentor role", async () => {
    const repo = baseRepo();
    await expect(reviewSubmission(repo, { ...reviewInput, reviewerRole: "student" })).rejects.toMatchObject({
      code: "FORBIDDEN",
      status: 403,
    });
  });

  it("returns NOT_FOUND for a missing submission", async () => {
    const repo = baseRepo({ findSubmissionByIdTx: async () => null });
    await expect(reviewSubmission(repo, reviewInput)).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("inserts a review, updates status, and writes an audit record", async () => {
    const audits: string[] = [];
    const inserted: string[] = [];
    const repo = baseRepo({
      insertReviewTx: async (_ex, _id, input) => {
        inserted.push(input.score);
        return makeReview({ ...input });
      },
      recordAuditTx: async (_ex, input) => {
        audits.push(input.action);
      },
    });
    const { submission, review } = await reviewSubmission(repo, reviewInput);
    expect(submission.status).toBe("approved");
    expect(review.mentorId).toBe(MENTOR_ID);
    expect(inserted).toEqual(["85.00"]);
    expect(audits).toEqual(["homework.review"]);
  });

  it("updates an existing review instead of inserting", async () => {
    const updated: string[] = [];
    const inserted: string[] = [];
    const repo = baseRepo({
      findReviewBySubmissionTx: async () => makeReview(),
      updateReviewTx: async (_ex, _id, input) => {
        updated.push(input.score);
        return makeReview({ ...input });
      },
      insertReviewTx: async (_ex, _id, input) => {
        inserted.push(input.score);
        return makeReview({ ...input });
      },
    });
    await reviewSubmission(repo, { ...reviewInput, status: "rejected" });
    expect(updated).toEqual(["85.00"]);
    expect(inserted).toEqual([]);
  });

  it("filters submissions by status and paginates", async () => {
    const repo = baseRepo({
      listSubmissions: async () => [
        makeItem({ id: "s-1", status: "submitted" }),
        makeItem({ id: "s-2", status: "approved" }),
        makeItem({ id: "s-3", status: "approved" }),
      ],
    });
    const filtered = await listSubmissions(repo, { status: "approved", page: 1, limit: 100 });
    expect(filtered.submissions.map((s) => s.id)).toEqual(["s-2", "s-3"]);
    const paged = await listSubmissions(repo, { status: "all", page: 2, limit: 2 });
    expect(paged.submissions.map((s) => s.id)).toEqual(["s-3"]);
    expect(paged.total).toBe(3);
  });

  it("validates the review body and list query", () => {
    expect(reviewHomeworkBodySchema.safeParse({ criteriaResults: [], score: 200, status: "approved" }).success).toBe(false);
    expect(
      reviewHomeworkBodySchema.safeParse({ criteriaResults: [{ criterion: "c", score: 5 }], score: 50, status: "approved" })
        .success,
    ).toBe(true);
    expect(homeworkAdminQuerySchema.parse({})).toMatchObject({ status: "all", page: 1, limit: 100 });
  });
});
