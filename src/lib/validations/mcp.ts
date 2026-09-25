import { z } from "zod";

// Every MCP tool accepts an optional authToken argument. It is compared with
// crypto.timingSafeEqual against MCP_AUTH_TOKEN (see mcp-server/auth.ts).
// Tokens are never logged.
export const mcpAuthTokenField = z.string().min(1).optional();

export const mcpGetPlatformKpisSchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).optional().default("30d"),
  authToken: mcpAuthTokenField,
});

export const mcpQueryLeadsPipelineSchema = z.object({
  status: z.string().optional().default("new"),
  limit: z.number().int().positive().optional().default(10),
  authToken: mcpAuthTokenField,
});

export const mcpGetCohortStatusSchema = z.object({
  cohortId: z.string().optional(),
  authToken: mcpAuthTokenField,
});

export const mcpGradeHomeworkSchema = z.object({
  submissionId: z.string().min(1, { message: "Submission ID is required" }),
  score: z.number().min(0).max(100, { message: "Score must be between 0 and 100" }),
  feedback: z.string().min(1, { message: "Feedback is required" }),
  status: z.enum(["approved", "needs_revision", "rejected"]).optional(),
  // homework_reviews.mentor_id is NOT NULL: grading requires a mentor user id.
  mentorId: z.string().uuid().optional(),
  authToken: mcpAuthTokenField,
});

export const mcpBroadcastNotificationSchema = z.object({
  title: z.string().min(2, { message: "Title must be at least 2 characters" }),
  channel: z.enum(["telegram", "sms", "email", "all"]).default("telegram"),
  targetAudience: z.enum([
    "all_users",
    "active_students",
    "leads_new",
    "leads_consultation",
    "cohort_students",
    "pending_homework",
  ]).default("all_users"),
  messageBody: z.string().min(5, { message: "Message body must be at least 5 characters" }),
  cohortId: z.string().optional(),
  authToken: mcpAuthTokenField,
});

export const mcpGenerateDiscountPromocodeSchema = z.object({
  code: z.string().min(3, { message: "Promo code must be at least 3 characters" }),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.number().positive({ message: "Discount value must be positive" }),
  maxUses: z.number().int().positive().optional().default(100),
  expiresInDays: z.number().positive().optional().default(7),
  authToken: mcpAuthTokenField,
});

export const mcpGetStudentActivitySchema = z.object({
  studentId: z.string().optional(),
  email: z.string().optional(),
  cohortId: z.string().optional(),
  status: z.enum(["all", "active", "at_risk", "completed", "inactive"]).optional().default("all"),
  limit: z.number().int().positive().optional().default(10),
  authToken: mcpAuthTokenField,
});

export type McpGetPlatformKpisInput = z.infer<typeof mcpGetPlatformKpisSchema>;
export type McpQueryLeadsPipelineInput = z.infer<typeof mcpQueryLeadsPipelineSchema>;
export type McpGetCohortStatusInput = z.infer<typeof mcpGetCohortStatusSchema>;
export type McpGradeHomeworkInput = z.infer<typeof mcpGradeHomeworkSchema>;
export type McpBroadcastNotificationInput = z.infer<typeof mcpBroadcastNotificationSchema>;
export type McpGenerateDiscountPromocodeInput = z.infer<typeof mcpGenerateDiscountPromocodeSchema>;
export type McpGetStudentActivityInput = z.infer<typeof mcpGetStudentActivitySchema>;

// --- Read-only analytics tools ---------------------------------------------
// Accepts "YYYY-MM-DD" or a full ISO-8601 datetime. A date-only `to` is
// inclusive (it covers that whole UTC day); defaults: to = now,
// from = to - 30 days. Range must satisfy from <= to and span <= 366 days.
const DAY_MS = 86_400_000;
export const MCP_ANALYTICS_DEFAULT_DAYS = 30;
export const MCP_ANALYTICS_MAX_DAYS = 366;

const mcpIsoDateField = z
  .union([z.string().date(), z.string().datetime({ offset: true })], {
    errorMap: () => ({ message: "Use an ISO date (YYYY-MM-DD) or ISO datetime" }),
  })
  .optional();

const mcpAnalyticsRangeShape = {
  from: mcpIsoDateField,
  to: mcpIsoDateField,
  authToken: mcpAuthTokenField,
};

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

function resolveMcpRange(input: { from?: string; to?: string }, now: Date): { from: Date; to: Date } {
  const to =
    input.to === undefined
      ? now
      : DATE_ONLY.test(input.to)
        ? new Date(new Date(`${input.to}T00:00:00Z`).getTime() + DAY_MS)
        : new Date(input.to);
  const from =
    input.from === undefined
      ? new Date(to.getTime() - MCP_ANALYTICS_DEFAULT_DAYS * DAY_MS)
      : new Date(DATE_ONLY.test(input.from) ? `${input.from}T00:00:00Z` : input.from);
  return { from, to };
}

function withResolvedRange<T extends z.ZodRawShape>(shape: T) {
  return z
    .object({ ...mcpAnalyticsRangeShape, ...shape })
    .transform((value, context) => {
      const range = resolveMcpRange(value, new Date());
      if (range.from.getTime() > range.to.getTime()) {
        context.addIssue({ code: "custom", path: ["from"], message: "from must be on or before to" });
        return z.NEVER;
      }
      if (range.to.getTime() - range.from.getTime() > MCP_ANALYTICS_MAX_DAYS * DAY_MS) {
        context.addIssue({ code: "custom", path: ["from"], message: `Range must not exceed ${MCP_ANALYTICS_MAX_DAYS} days` });
        return z.NEVER;
      }
      return { ...value, range };
    });
}

const mcpListLimitField = z.number().int().min(1).max(50).optional().default(10);

export const mcpAnalyticsOverviewSchema = withResolvedRange({});
export const mcpTrafficSourcesSchema = withResolvedRange({ limit: mcpListLimitField });
export const mcpConversionFunnelSchema = withResolvedRange({});
export const mcpLandingPagesSchema = withResolvedRange({ limit: mcpListLimitField });
export const mcpSalesReportSchema = withResolvedRange({ limit: mcpListLimitField });
export const mcpStudentProgressSchema = withResolvedRange({ limit: mcpListLimitField });

export type McpAnalyticsOverviewInput = z.infer<typeof mcpAnalyticsOverviewSchema>;
export type McpTrafficSourcesInput = z.infer<typeof mcpTrafficSourcesSchema>;
export type McpLandingPagesInput = z.infer<typeof mcpLandingPagesSchema>;
export type McpSalesReportInput = z.infer<typeof mcpSalesReportSchema>;
export type McpStudentProgressInput = z.infer<typeof mcpStudentProgressSchema>;
