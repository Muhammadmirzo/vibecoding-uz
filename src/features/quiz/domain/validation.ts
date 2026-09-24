import { z } from "zod";
import { QUIZ_QUESTIONS } from "./questions";
import { buildReasoning, calculateRecommendation, calculateScores, type QuizAnswers } from "./scoring";

/**
 * Strict server-side answer validation: every question must be answered
 * exactly once and each option index must exist. Client-computed scores
 * and recommendations are never trusted.
 */
export function validateQuizAnswers(value: unknown): { ok: true; answers: QuizAnswers } | { ok: false; message: string } {
  if (typeof value !== "object" || value === null) {
    return { ok: false, message: "Javoblar to'liq emas" };
  }
  const record = value as Record<string, unknown>;
  const answers: QuizAnswers = {};
  for (let index = 0; index < QUIZ_QUESTIONS.length; index += 1) {
    const question = QUIZ_QUESTIONS[index];
    const raw = record[String(index)] ?? record[String(question.id)];
    const optionIndex = typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : raw;
    if (typeof optionIndex !== "number" || !Number.isInteger(optionIndex) || optionIndex < 0 || optionIndex >= question.options.length) {
      return { ok: false, message: `Savol ${question.id} uchun javob noto'g'ri` };
    }
    answers[index] = optionIndex;
  }
  return { ok: true, answers };
}

export const quizSubmissionSchema = z.object({
  name: z.string(),
  phone: z.string(),
  source: z.literal("quiz").default("quiz"),
  quizAnswers: z.record(z.unknown()),
  utm: z.record(z.unknown()).optional().nullable(),
});

export interface ServerQuizResult {
  answers: QuizAnswers;
  scores: { express: number; basics: number; total: number };
  recommendedCourse: "vibe-coding-express" | "ai-asoslari";
  reasoning: ReturnType<typeof buildReasoning>;
}

/** Recomputes score + recommendation purely from validated answers. */
export function recomputeQuizResult(answers: QuizAnswers): ServerQuizResult {
  const scores = calculateScores(answers);
  const recommendedCourse = calculateRecommendation(answers);
  return { answers, scores, recommendedCourse, reasoning: buildReasoning(answers) };
}
