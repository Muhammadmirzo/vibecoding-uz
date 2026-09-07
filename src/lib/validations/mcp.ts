import { z } from "zod";

export const mcpGetPlatformKpisSchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).optional().default("30d"),
});

export const mcpQueryLeadsPipelineSchema = z.object({
  status: z.string().optional().default("new"),
  limit: z.number().int().positive().optional().default(10),
});

export const mcpGetCohortStatusSchema = z.object({
  cohortId: z.string().optional(),
});

export const mcpGradeHomeworkSchema = z.object({
  submissionId: z.string().min(1, { message: "Submission ID is required" }),
  score: z.number().min(0).max(100, { message: "Score must be between 0 and 100" }),
  feedback: z.string().min(1, { message: "Feedback is required" }),
  status: z.enum(["approved", "needs_revision", "rejected"]).optional(),
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
});

export const mcpGenerateDiscountPromocodeSchema = z.object({
  code: z.string().min(3, { message: "Promo code must be at least 3 characters" }),
  discountType: z.enum(["percentage", "fixed_amount"]),
  discountValue: z.number().positive({ message: "Discount value must be positive" }),
  maxUses: z.number().int().positive().optional().default(100),
  expiresInDays: z.number().positive().optional().default(7),
});

export const mcpGetStudentActivitySchema = z.object({
  studentId: z.string().optional(),
  email: z.string().optional(),
  cohortId: z.string().optional(),
  status: z.enum(["all", "active", "at_risk", "completed", "inactive"]).optional().default("all"),
  limit: z.number().int().positive().optional().default(10),
});

export type McpGetPlatformKpisInput = z.infer<typeof mcpGetPlatformKpisSchema>;
export type McpQueryLeadsPipelineInput = z.infer<typeof mcpQueryLeadsPipelineSchema>;
export type McpGetCohortStatusInput = z.infer<typeof mcpGetCohortStatusSchema>;
export type McpGradeHomeworkInput = z.infer<typeof mcpGradeHomeworkSchema>;
export type McpBroadcastNotificationInput = z.infer<typeof mcpBroadcastNotificationSchema>;
export type McpGenerateDiscountPromocodeInput = z.infer<typeof mcpGenerateDiscountPromocodeSchema>;
export type McpGetStudentActivityInput = z.infer<typeof mcpGetStudentActivitySchema>;
