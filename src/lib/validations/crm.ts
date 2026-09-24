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

const telegramUsernameSchema = z.string().regex(/^@[A-Za-z0-9_]{3,}$/, {
  message: "Telegram username @ bilan, min 4 belgi bo'lishi kerak",
});

export const quizLeadSchema = createLeadSchema.extend({
  phone: z.string().regex(uzbekPhoneRegex, {
    message: "Quiz uchun +998 telefon raqami kiritilishi shart",
  }),
  source: z.literal("quiz"),
});

export const freeLessonLeadSchema = createLeadSchema
  .omit({ phone: true, source: true })
  .extend({
    phone: z.string().regex(uzbekPhoneRegex).optional().nullable(),
    telegram: telegramUsernameSchema.optional().nullable(),
    source: z.literal("free_lesson"),
  })
  .superRefine((value, context) => {
    if (!value.phone && !value.telegram) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["phone"], message: "Telefon yoki Telegram username kiritish shart" });
    }
    if (value.phone && value.telegram) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["telegram"], message: "Faqat bitta aloqa usulini kiriting" });
    }
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

// --- Admin list query schemas (W4-ARCH-C: every admin route query is Zod-validated) ---

const pageSchema = z.coerce.number().int().positive().default(1);
const limitSchema = z.coerce.number().int().positive().max(200).default(100);

export const leadsAdminQuerySchema = z.object({
  status: z.string().default("all"),
  q: z.string().optional(),
  page: pageSchema,
  limit: limitSchema,
});

export const homeworkAdminQuerySchema = z.object({
  status: z.string().default("all"),
  page: pageSchema,
  limit: limitSchema,
});

export const usersAdminQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().default("all"),
  page: pageSchema,
  limit: limitSchema,
});

export type LeadsAdminQuery = z.infer<typeof leadsAdminQuerySchema>;
export type HomeworkAdminQuery = z.infer<typeof homeworkAdminQuerySchema>;
export type UsersAdminQuery = z.infer<typeof usersAdminQuerySchema>;
