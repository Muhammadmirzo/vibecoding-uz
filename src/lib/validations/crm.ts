import { z } from "zod";
import { uzbekPhoneRegex } from "./auth";

export const leadStatusSchema = z.enum([
  "new",
  "contacted",
  "consultation",
  "pending",
  "paid",
  "rejected",
  "cancelled",
]);

export const leadSourceSchema = z.enum([
  "quiz",
  "free_lesson",
  "form",
  "telegram",
  "expert",
  "referral",
  "manual",
]);

export const createLeadSchema = z.object({
  name: z.string().min(2, { message: "Ism kamida 2 ta belgidan iborat bo'lishi kerak" }),
  phone: z.string().min(7, { message: "Telefon raqami kiritilishi shart" }),
  source: leadSourceSchema.default("manual"),
  status: leadStatusSchema.default("new"),
  recommendedCourseId: z.string().uuid().optional().nullable(),
  quizAnswers: z.record(z.unknown()).optional().nullable(),
  utm: z.record(z.unknown()).optional().nullable(),
  assignedManagerId: z.string().uuid().optional().nullable(),
  nextContactAt: z.string().optional().nullable(),
});

export const updateLeadStatusSchema = z.object({
  status: leadStatusSchema,
});

export const updateLeadSchema = createLeadSchema.partial();

export const createCohortSchema = z.object({
  courseId: z.string().uuid({ message: "Kursni tanlang" }),
  name: z.string().min(2, { message: "Guruh nomi kiritilishi kerak" }),
  startsAt: z.string().min(1, { message: "Boshlanish sanasi kiritilishi kerak" }),
  endsAt: z.string().optional().nullable(),
  seats: z.number().int().min(1, { message: "O'rinlar soni kamida 1 ta bo'lishi kerak" }).default(30),
  priceSum: z.string().min(1, { message: "Asosiy narx kiritilishi kerak" }),
  earlyPriceSum: z.string().optional().nullable(),
  earlyDeadline: z.string().optional().nullable(),
  telegramChatId: z.string().optional().nullable(),
  status: z.string().default("active"),
});

export const updateCohortSchema = createCohortSchema.partial();

export const criterionResultSchema = z.object({
  criterion: z.string(),
  score: z.number().min(0).max(10),
  maxScore: z.number().default(10),
  feedback: z.string().optional(),
});

export const gradeHomeworkSchema = z.object({
  submissionId: z.string().uuid({ message: "Topshiriq ID si noto'g'ri" }),
  mentorId: z.string().uuid().optional(),
  criteriaResults: z.array(criterionResultSchema).min(1, { message: "Kamida 1 ta mezon baholanishi kerak" }),
  score: z.number().min(0).max(100, { message: "Baho 0 dan 100 gacha bo'lishi kerak" }),
  feedbackMd: z.string().optional(),
  status: z.enum(["approved", "rejected"]),
});

export const analyticsQuerySchema = z.object({
  period: z.enum(["7d", "30d", "90d", "1y", "all"]).default("30d"),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const studentActivityFilterSchema = z.object({
  search: z.string().optional(),
  cohortId: z.string().optional(),
  status: z.enum(["all", "active", "at_risk", "completed", "inactive"]).default("all"),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(10),
});

export type LeadStatus = z.infer<typeof leadStatusSchema>;
export type LeadSource = z.infer<typeof leadSourceSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateCohortInput = z.infer<typeof createCohortSchema>;
export type UpdateCohortInput = z.infer<typeof updateCohortSchema>;
export type CriterionResult = z.infer<typeof criterionResultSchema>;
export type GradeHomeworkInput = z.infer<typeof gradeHomeworkSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type StudentActivityFilterInput = z.infer<typeof studentActivityFilterSchema>;
