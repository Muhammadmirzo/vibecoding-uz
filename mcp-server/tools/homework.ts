/**
 * grade_homework — WRITE tool (updates homework_submissions + upserts
 * homework_reviews). Requires authToken AND mentorId (homework_reviews.
 * mentor_id is NOT NULL, so the grader must be attributed honestly).
 * Status mapping: approved->approved, rejected->rejected,
 * needs_revision->reviewing (submission enum has no needs_revision value).
 */
import { mcpGradeHomeworkSchema } from "../../src/lib/validations/mcp";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  successResult,
  withAuthProperty,
  type McpToolDef,
  type McpToolResult,
} from "../types";
import { gradeSubmissionRecord, type GradedSubmission, type GradeSubmissionInput } from "./db-write";

export const TOOL_DEF: McpToolDef = {
  name: "grade_homework",
  description:
    "WRITE: grade a homework submission (score 0-100, feedback required, mentorId required). Writes an audit_logs row (actor 'mcp') in the same transaction. Requires authToken.",
  inputSchema: {
    type: "object",
    properties: withAuthProperty({
      submissionId: { type: "string", description: "Homework submission UUID" },
      score: { type: "number", description: "Score 0-100" },
      feedback: { type: "string", description: "Feedback for the student" },
      status: { type: "string", description: "'approved', 'needs_revision', or 'rejected'" },
      mentorId: { type: "string", description: "Grading mentor's user UUID (required)" },
    }),
    required: ["submissionId", "score", "feedback"],
  },
  annotations: { destructiveHint: true },
};

export interface HomeworkDeps {
  gradeSubmission: (input: GradeSubmissionInput) => Promise<GradedSubmission | null>;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export async function handle(rawArgs: unknown, deps?: HomeworkDeps): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = mcpGradeHomeworkSchema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  if (parsed.data.mentorId === undefined) {
    return errorResult("mentor_required", {
      message: "Grading writes a homework_reviews row that requires a mentor user id. Provide mentorId (UUID).",
    });
  }
  try {
    const gradeSubmission = deps?.gradeSubmission ?? gradeSubmissionRecord;
    const graded = await gradeSubmission({
      submissionId: parsed.data.submissionId,
      score: parsed.data.score,
      feedback: parsed.data.feedback,
      resultStatus: parsed.data.status ?? (parsed.data.score >= 60 ? "approved" : "rejected"),
      mentorId: parsed.data.mentorId,
    });
    if (graded === null) {
      return errorResult("submission_not_found", { submissionId: parsed.data.submissionId });
    }
    return successResult({ ok: true, gradedSubmission: graded });
  } catch (err: unknown) {
    return errorResult("grade_failed", { message: toErrorMessage(err) });
  }
}
