import { eq } from "drizzle-orm";
import { db } from "@/db";
import { courses, leads } from "@/db/schema";
import { recomputeQuizResult, validateQuizAnswers, type ServerQuizResult } from "../domain/validation";

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
};

/**
 * Quiz submission use case: validates contact + answers, recomputes the
 * score and recommendation server-side, then stores the lead. The client's
 * `recommendedCourseId` is ignored for scoring (kept only as a hint).
 */
export async function submitQuizLead(repo: QuizRepository, input: QuizLeadInput): Promise<QuizLeadOutcome> {
  const checked = validateQuizAnswers(input.quizAnswers);
  if (!checked.ok) throw new QuizError("INVALID_ANSWERS", checked.message);
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
