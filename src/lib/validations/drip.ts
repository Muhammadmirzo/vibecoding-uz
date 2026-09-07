import { z } from "zod";

export const dripRuleTypeSchema = z.enum(["none", "after_lesson", "date"]);

export const checkLessonAccessSchema = z.object({
  userId: z.string().uuid({ message: "Foydalanuvchi ID si noto'g'ri" }),
  lessonId: z.string().uuid({ message: "Dars ID si noto'g'ri" }),
  cohortId: z.string().uuid().optional().nullable(),
});

export const dripAccessResultSchema = z.object({
  unlocked: z.boolean(),
  reason: z.enum([
    "unlocked",
    "free_preview",
    "not_enrolled",
    "scheduled_date",
    "prerequisite_required",
    "cohort_not_started",
    "lesson_not_found",
  ]),
  availableAt: z.date().optional().nullable(),
  prerequisiteLessonId: z.string().uuid().optional().nullable(),
  prerequisiteLessonTitle: z.string().optional().nullable(),
  message: z.string(),
});

export const courseDripQuerySchema = z.object({
  userId: z.string().uuid({ message: "Foydalanuvchi ID si noto'g'ri" }),
  courseId: z.string().uuid({ message: "Kurs ID si noto'g'ri" }),
  cohortId: z.string().uuid().optional().nullable(),
});

export type DripRuleType = z.infer<typeof dripRuleTypeSchema>;
export type CheckLessonAccessInput = z.infer<typeof checkLessonAccessSchema>;
export type DripAccessResult = z.infer<typeof dripAccessResultSchema>;
export type CourseDripQueryInput = z.infer<typeof courseDripQuerySchema>;
