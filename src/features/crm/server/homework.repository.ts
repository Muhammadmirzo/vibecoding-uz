// NOTE(W4-ARCH): `import "server-only"` intentionally omitted — the package is not
// installed and the bare import crashes at runtime. Re-add once `server-only` is a dependency.
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, homeworkAssignments, homeworkReviews, homeworkSubmissions, lessons, users } from "@/db/schema";
import type { CriterionResult } from "@/lib/validations/crm";

export type DbExecutor = Pick<typeof db, "select" | "update" | "insert" | "delete">;

export interface SubmissionListItem {
  id: string;
  assignmentId: string;
  assignmentTitle: string | null;
  assignmentDescription: string | null;
  acceptanceCriteria: unknown;
  lessonId: string | null;
  lessonTitle: string | null;
  studentId: string;
  studentName: string | null;
  studentPhone: string | null;
  studentAvatar: string | null;
  attemptNo: number;
  payload: unknown;
  status: string;
  submittedAt: Date;
  review: {
    id: string;
    score: string | null;
    feedbackMd: string | null;
    criteriaResults: unknown;
    reviewedAt: Date;
  } | null;
}

export type SubmissionRow = typeof homeworkSubmissions.$inferSelect;
export type ReviewRow = typeof homeworkReviews.$inferSelect;

export interface UpsertReviewInput {
  mentorId: string;
  criteriaResults: CriterionResult[];
  score: string;
  feedbackMd: string;
}

export interface HomeworkRepository {
  listSubmissions(): Promise<SubmissionListItem[]>;
  findSubmissionByIdTx(ex: DbExecutor, id: string): Promise<SubmissionRow | null>;
  setSubmissionStatusTx(ex: DbExecutor, id: string, status: "approved" | "rejected"): Promise<SubmissionRow | null>;
  findReviewBySubmissionTx(ex: DbExecutor, submissionId: string): Promise<ReviewRow | null>;
  updateReviewTx(ex: DbExecutor, submissionId: string, input: UpsertReviewInput): Promise<ReviewRow>;
  insertReviewTx(ex: DbExecutor, submissionId: string, input: UpsertReviewInput): Promise<ReviewRow>;
  recordAuditTx(
    ex: DbExecutor,
    input: { action: string; entityType: string; entityId?: string; details: Record<string, unknown>; ip: string },
  ): Promise<void>;
}

export const drizzleHomeworkRepository: HomeworkRepository = {
  async listSubmissions() {
    const rows = await db
      .select({
        id: homeworkSubmissions.id,
        assignmentId: homeworkSubmissions.assignmentId,
        assignmentTitle: homeworkAssignments.title,
        assignmentDescription: homeworkAssignments.descriptionMd,
        acceptanceCriteria: homeworkAssignments.acceptanceCriteria,
        lessonId: homeworkAssignments.lessonId,
        lessonTitle: lessons.title,
        studentId: homeworkSubmissions.userId,
        studentName: users.fullName,
        studentPhone: users.phone,
        studentAvatar: users.avatarUrl,
        attemptNo: homeworkSubmissions.attemptNo,
        payload: homeworkSubmissions.payload,
        status: homeworkSubmissions.status,
        submittedAt: homeworkSubmissions.submittedAt,
        review: {
          id: homeworkReviews.id,
          score: homeworkReviews.score,
          feedbackMd: homeworkReviews.feedbackMd,
          criteriaResults: homeworkReviews.criteriaResults,
          reviewedAt: homeworkReviews.reviewedAt,
        },
      })
      .from(homeworkSubmissions)
      .leftJoin(homeworkAssignments, eq(homeworkSubmissions.assignmentId, homeworkAssignments.id))
      .leftJoin(lessons, eq(homeworkAssignments.lessonId, lessons.id))
      .leftJoin(users, eq(homeworkSubmissions.userId, users.id))
      .leftJoin(homeworkReviews, eq(homeworkReviews.submissionId, homeworkSubmissions.id))
      .orderBy(desc(homeworkSubmissions.submittedAt));
    return rows.map((r) => ({ ...r, review: r.review?.id ? r.review : null }));
  },
  async findSubmissionByIdTx(ex, id) {
    const [row] = await ex.select().from(homeworkSubmissions).where(eq(homeworkSubmissions.id, id)).limit(1);
    return row ?? null;
  },
  async setSubmissionStatusTx(ex, id, status) {
    const [row] = await ex
      .update(homeworkSubmissions)
      .set({ status })
      .where(eq(homeworkSubmissions.id, id))
      .returning();
    return row ?? null;
  },
  async findReviewBySubmissionTx(ex, submissionId) {
    const [row] = await ex.select().from(homeworkReviews).where(eq(homeworkReviews.submissionId, submissionId));
    return row ?? null;
  },
  async updateReviewTx(ex, submissionId, input) {
    const [row] = await ex
      .update(homeworkReviews)
      .set({ mentorId: input.mentorId, criteriaResults: input.criteriaResults, score: input.score, feedbackMd: input.feedbackMd, reviewedAt: new Date() })
      .where(eq(homeworkReviews.submissionId, submissionId))
      .returning();
    return row;
  },
  async insertReviewTx(ex, submissionId, input) {
    const [row] = await ex
      .insert(homeworkReviews)
      .values({ submissionId, mentorId: input.mentorId, criteriaResults: input.criteriaResults, score: input.score, feedbackMd: input.feedbackMd })
      .returning();
    return row;
  },
  async recordAuditTx(ex, input) {
    await ex.insert(auditLogs).values({
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      details: input.details,
      ipAddress: input.ip,
    });
  },
};
