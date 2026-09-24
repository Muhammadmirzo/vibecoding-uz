/**
 * get_student_activity — read-only per-student activity from users,
 * enrollments, lesson_progress and homework_submissions.
 * Status is derived (no quiz-scores table exists): finished->completed,
 * paused/expelled/missing enrollment->inactive, active enrollment with
 * activity in the last 7 days->active, otherwise at_risk.
 */
import { mcpGetStudentActivitySchema } from "../../src/lib/validations/mcp";
import { verifyAuthToken } from "../auth";
import {
  errorResult,
  extractAuthToken,
  successResult,
  withAuthProperty,
  type McpToolDef,
  type McpToolResult,
} from "../types";
import { isUuid } from "./db";
import { queryStudentActivity, type ActivityFilter, type StudentActivityRow } from "./db-activity";

export const TOOL_DEF: McpToolDef = {
  name: "get_student_activity",
  description:
    "Read-only: student activity (progress, homework stats, derived status). Requires authToken.",
  inputSchema: {
    type: "object",
    properties: withAuthProperty({
      studentId: { type: "string", description: "Optional student user UUID" },
      email: { type: "string", description: "Optional student email filter" },
      cohortId: { type: "string", description: "Optional cohort UUID filter" },
      status: { type: "string", description: "'all', 'active', 'at_risk', 'completed', 'inactive'" },
      limit: { type: "number", description: "Max records (default 10, capped at 50)" },
    }),
  },
  annotations: { readOnlyHint: true },
};

export interface ActivityDeps {
  getActivity: (filter: ActivityFilter) => Promise<StudentActivityRow[]>;
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown error";
}

export async function handle(rawArgs: unknown, deps?: ActivityDeps): Promise<McpToolResult> {
  if (!verifyAuthToken(extractAuthToken(rawArgs))) {
    return errorResult("unauthorized", { hint: "Provide a valid authToken." });
  }
  const parsed = mcpGetStudentActivitySchema.safeParse(rawArgs ?? {});
  if (!parsed.success) {
    return errorResult("invalid_input", { issues: parsed.error.flatten() });
  }
  for (const id of [parsed.data.studentId, parsed.data.cohortId]) {
    if (id !== undefined && !isUuid(id)) {
      return errorResult("invalid_input", { message: "studentId and cohortId must be UUIDs." });
    }
  }
  try {
    const getActivity = deps?.getActivity ?? queryStudentActivity;
    const students = await getActivity({
      studentId: parsed.data.studentId,
      email: parsed.data.email,
      cohortId: parsed.data.cohortId,
      status: parsed.data.status,
      limit: parsed.data.limit,
    });
    return successResult({ ok: true, count: students.length, students });
  } catch (err: unknown) {
    return errorResult("query_failed", { message: toErrorMessage(err) });
  }
}
