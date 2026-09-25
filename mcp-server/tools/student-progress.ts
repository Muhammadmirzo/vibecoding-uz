/**
 * get_student_progress_report — read-only learning report: active
 * students, new enrollments, homework submission rate, cohort attendance
 * and per-course completion with the biggest drop-off lesson.
 * Backed by getStudents().
 */
import { getStudents } from "../../src/features/analytics/server/business.service";
import { mcpStudentProgressSchema } from "../../src/lib/validations/mcp";
import type { McpToolDef, McpToolResult } from "../types";
import {
  rangeProperties,
  round1,
  runAnalyticsTool,
  toServiceRange,
  type AnalyticsToolDeps,
} from "./analytics-shared";

export const TOOL_DEF: McpToolDef = {
  name: "get_student_progress_report",
  description:
    "Read-only student progress report for a date range: active students (lesson_start), new enrollments, homework submission rate, cohort attendance, and per-course started/completed/completion rate with the lesson where most students drop off. Requires authToken.",
  inputSchema: { type: "object", properties: rangeProperties(true) },
  annotations: { readOnlyHint: true },
};

export async function handle(rawArgs: unknown, deps?: AnalyticsToolDeps): Promise<McpToolResult> {
  return runAnalyticsTool(rawArgs, mcpStudentProgressSchema, deps, async (repository, input) => {
    const report = await getStudents(repository, toServiceRange(input.range));
    return {
      limit: input.limit,
      activeStudents: report.activeStudents,
      newEnrollments: report.newEnrollments,
      homeworkSubmissionRatePct: round1(report.homeworkSubmissionRate),
      cohortAttendanceRatePct: round1(report.cohortAttendanceRate),
      totalCourses: report.courses.length,
      courses: report.courses.slice(0, input.limit).map((course) => ({
        courseId: course.courseId,
        courseTitle: course.courseTitle,
        started: course.started,
        completed: course.completed,
        completionRatePct: round1(course.completionRate),
        dropOffLesson: course.dropOffLesson,
        dropOffCount: course.dropOffCount,
      })),
      definitions: {
        activeStudent: "distinct user with a lesson_start event in the range",
        attendance: report.attendanceDefinition,
        homeworkSubmissionRate: "homework submissions in range / (active enrollments x 8 expected assignments)",
      },
      summary: report.summary,
    };
  });
}
