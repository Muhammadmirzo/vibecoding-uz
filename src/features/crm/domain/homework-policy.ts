import { z } from "zod";
import { criterionResultSchema } from "@/lib/validations/crm";

/** Roles allowed to grade homework (mirrors MENTOR_ROLES in require-auth). */
export const REVIEWER_ROLES = ["superadmin", "admin", "manager", "mentor"] as const;

/** Submission statuses a review may be written against. */
export const REVIEWABLE_STATUSES = ["submitted", "reviewing", "approved", "rejected"] as const;

export function assertReviewerRole(role: string): void {
  if (!(REVIEWER_ROLES as readonly string[]).includes(role)) {
    const error = new Error("Baholash huquqi yo'q (Forbidden)") as Error & { code: string; status: number };
    error.code = "FORBIDDEN";
    error.status = 403;
    throw error;
  }
}

export function isReviewableStatus(status: string): boolean {
  return (REVIEWABLE_STATUSES as readonly string[]).includes(status);
}

/** Service-level input for a homework review (reviewer comes from the session, never the body). */
export const reviewHomeworkServiceSchema = z.object({
  submissionId: z.string().uuid({ message: "Topshiriq ID si noto'g'ri" }),
  reviewerId: z.string().uuid(),
  reviewerRole: z.string(),
  criteriaResults: z.array(criterionResultSchema).min(1, { message: "Kamida 1 ta mezon baholanishi kerak" }),
  score: z.number().min(0).max(100, { message: "Baho 0 dan 100 gacha bo'lishi kerak" }),
  feedbackMd: z.string().optional(),
  status: z.enum(["approved", "rejected"]),
  ip: z.string().default("127.0.0.1"),
});

export type ReviewHomeworkServiceInput = z.infer<typeof reviewHomeworkServiceSchema>;

/** Body schema for the review route (id comes from the URL, reviewer from the session). */
export const reviewHomeworkBodySchema = z.object({
  criteriaResults: z.array(criterionResultSchema).min(1, { message: "Kamida 1 ta mezon baholanishi kerak" }),
  score: z.number().min(0).max(100, { message: "Baho 0 dan 100 gacha bo'lishi kerak" }),
  feedbackMd: z.string().optional(),
  status: z.enum(["approved", "rejected"]),
});

export type ReviewHomeworkBodyInput = z.infer<typeof reviewHomeworkBodySchema>;
