import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, leads } from "@/db/schema";
import { ServiceError } from "@/lib/http/errors";
import { recomputeQuizResult, validateQuizAnswers, type ServerQuizResult } from "../domain/validation";

/** Legacy error class (kept for compatibility; services now throw {@link ServiceError}). */
export class QuizError extends Error {
  constructor(public code: "INVALID_ANSWERS" | "INVALID_CONTACT", message: string) {
    super(message);
  }
}

export interface QuizLeadInput {
  name: string;
  phone: string;
  quizAnswers: unknown;
  utm?: Record<string, unknown> | null;
  recommendedCourseId?: string | null;
}

export interface QuizLeadOutcome {
  leadId: string;
  result: ServerQuizResult;
}

export interface QuizRepository {
  insertLead(input: { name: string; phone: string; quizAnswers: Record<string, unknown>; recommendedCourseId: string | null; utm: Record<string, unknown> | null }): Promise<{ id: string }>;
  insertFreeLessonLead(input: { name: string; phone: string | null; telegram: string | null; status: FreeLessonLeadInput["status"]; recommendedCourseId: string | null; quizAnswers: Record<string, unknown> | null; utm: Record<string, unknown> | null }): Promise<{ id: string }>;
  findCourseIdBySlug(slug: string): Promise<string | null>;
}

export const drizzleQuizRepository: QuizRepository = {
  async insertLead(input) {
    const [row] = await db.insert(leads).values({
      name: input.name,
      phone: input.phone,
      source: "quiz",
      status: "new",
      recommendedCourseId: input.recommendedCourseId,
      quizAnswers: input.quizAnswers,
      utm: input.utm,
    }).returning({ id: leads.id });
    return row;
  },
  async findCourseIdBySlug(slug) {
    const [row] = await db.select({ id: courses.id }).from(courses).where(eq(courses.slug, slug)).limit(1);
    return row?.id ?? null;
  },
  async insertFreeLessonLead(input) {
    const [row] = await db.insert(leads).values({
      name: input.name,
      phone: input.phone,
      telegram: input.telegram,
      source: "free_lesson",
      status: input.status ?? "new",
      recommendedCourseId: input.recommendedCourseId,
      quizAnswers: input.quizAnswers,
      utm: input.utm,
    }).returning({ id: leads.id });
    return row;
  },
};

/**
 * Normalizes a raw contact value exactly like the legacy quiz route did:
 * @usernames pass through, digit strings become +998… numbers.
 */
export function normalizeQuizContact(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (trimmed.startsWith("@")) return trimmed;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.length === 9) return `+998${digits}`;
  return digits ? `+${digits}` : trimmed;
}

export interface FreeLessonLeadInput {
  name: string;
  phone?: string | null;
  telegram?: string | null;
  source?: "free_lesson";
  status?: "new" | "contacted" | "consultation" | "pending" | "paid" | "rejected" | "cancelled";
  recommendedCourseId?: string | null;
  quizAnswers?: Record<string, unknown> | null;
  utm?: Record<string, unknown> | null;
}

export interface FreeLessonLeadOutcome {
  leadId: string;
}

/**
 * Free-lesson lead capture (single insert, no transaction needed).
 * Contact-shape validation stays in the route's Zod schema; the service
 * only persists the already-validated payload.
 */
export async function submitFreeLessonLead(
  repo: QuizRepository,
  input: FreeLessonLeadInput,
): Promise<FreeLessonLeadOutcome> {
  const stored = await repo.insertFreeLessonLead({
    name: input.name,
    phone: input.phone || null,
    telegram: input.telegram || null,
    status: input.status ?? "new",
    recommendedCourseId: input.recommendedCourseId || null,
    quizAnswers: input.quizAnswers || null,
    utm: input.utm || null,
  });
  return { leadId: stored.id };
}

/**
 * Quiz submission use case: validates contact + answers, recomputes the
 * score and recommendation server-side, then stores the lead. The client's
 * `recommendedCourseId` is ignored for scoring (kept only as a hint).
 */
export async function submitQuizLead(repo: QuizRepository, input: QuizLeadInput): Promise<QuizLeadOutcome> {
  const checked = validateQuizAnswers(input.quizAnswers);
  if (!checked.ok) throw new ServiceError("INVALID_ANSWERS", checked.message, 400);
  const result = recomputeQuizResult(checked.answers);
  const recommendedCourseId = await repo.findCourseIdBySlug(result.recommendedCourse);
  const stored = await repo.insertLead({
    name: input.name,
    phone: input.phone,
    quizAnswers: {
      answers: result.answers,
      scores: result.scores,
      recommendedCourse: result.recommendedCourse,
      clientHint: input.recommendedCourseId ?? null,
    },
    recommendedCourseId,
    utm: input.utm ?? null,
  });
  return { leadId: stored.id, result };
}
