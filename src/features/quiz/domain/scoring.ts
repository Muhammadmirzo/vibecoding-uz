import { z } from "zod";
import { QUIZ_QUESTIONS, type QuizCourseSlug } from "./questions";

/** Answers keyed by question index (0-based) → selected option index. */
export const quizAnswersSchema = z.record(
  z.coerce.number().int().min(0),
  z.number().int().min(0),
);

export type QuizAnswers = Record<number, number>;

export interface QuizScores {
  express: number;
  basics: number;
  total: number;
}

export function calculateScores(answers: QuizAnswers): QuizScores {
  let express = 0;
  let basics = 0;

  for (const [questionIndex, optionIndex] of Object.entries(answers)) {
    const option =
      QUIZ_QUESTIONS[Number(questionIndex)]?.options[optionIndex];
    if (!option) continue;
    if (option.targetCourse === "vibe-coding-express") {
      express += option.weight;
    } else {
      basics += option.weight;
    }
  }

  return { express, basics, total: express + basics };
}

export function calculateRecommendation(
  answers: QuizAnswers,
): QuizCourseSlug {
  const { express, basics } = calculateScores(answers);
  return express >= basics ? "vibe-coding-express" : "ai-asoslari";
}

export interface RecommendationReason {
  questionId: number;
  question: string;
  pickedLabel: string;
  targetCourse: QuizCourseSlug;
}

/** Human-readable trace of which answers drove the recommendation. */
export function buildReasoning(answers: QuizAnswers): RecommendationReason[] {
  const reasons: RecommendationReason[] = [];

  for (const [questionIndex, optionIndex] of Object.entries(answers)) {
    const question = QUIZ_QUESTIONS[Number(questionIndex)];
    const option = question?.options[optionIndex];
    if (!question || !option) continue;
    reasons.push({
      questionId: question.id,
      question: question.question,
      pickedLabel: option.label,
      targetCourse: option.targetCourse,
    });
  }

  return reasons.sort((a, b) => a.questionId - b.questionId);
}

export function recommendationSummary(
  course: QuizCourseSlug,
  scores: QuizScores,
): string {
  if (scores.total === 0) {
    return "Javoblar topilmadi, shuning uchun boshlang'ich yo'nalish sifatida Vibe Coding Express tavsiya qilinadi.";
  }
  if (course === "vibe-coding-express") {
    return `Javoblaringizning aksariyati mahsulot qurish, MVP va mentorlik formatiga moyil (${scores.express} ball). Shuning uchun Vibe Coding Express mos keladi.`;
  }
  return `Javoblaringiz kundalik ishni avtomatlashtirish va mustaqil o'rganish formatiga moyil (${scores.basics} ball). Shuning uchun AI Asoslari mos keladi.`;
}
