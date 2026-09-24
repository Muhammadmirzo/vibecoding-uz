import { describe, expect, it } from "vitest";
import {
  QUIZ_QUESTIONS,
  buildReasoning,
  calculateRecommendation,
  calculateScores,
  recommendationSummary,
} from "../features/quiz/domain";
import { quizAnswersSchema } from "../features/quiz/domain/validation";

describe("quiz domain scoring", () => {
  it("recommends vibe-coding-express when express answers dominate", () => {
    const answers = { 0: 0, 1: 1, 2: 0, 3: 0, 4: 0 };
    const scores = calculateScores(answers);
    expect(scores.express).toBeGreaterThan(scores.basics);
    expect(calculateRecommendation(answers)).toBe("vibe-coding-express");
  });

  it("recommends ai-asoslari when basics answers dominate", () => {
    const answers = { 0: 1, 1: 2, 2: 2, 3: 1, 4: 1 };
    const scores = calculateScores(answers);
    expect(scores.basics).toBeGreaterThan(scores.express);
    expect(calculateRecommendation(answers)).toBe("ai-asoslari");
  });

  it("falls back to vibe-coding-express on ties and empty answers", () => {
    expect(calculateRecommendation({})).toBe("vibe-coding-express");
    expect(calculateScores({})).toEqual({ express: 0, basics: 0, total: 0 });
  });

  it("ignores out-of-range question and option indexes", () => {
    const scores = calculateScores({ 99: 0, 0: 99 });
    expect(scores).toEqual({ express: 0, basics: 0, total: 0 });
  });

  it("sums weights correctly per course", () => {
    const scores = calculateScores({ 0: 0, 3: 1 });
    expect(scores.express).toBe(3);
    expect(scores.basics).toBe(2);
    expect(scores.total).toBe(5);
  });

  it("builds reasoning only for valid answered questions", () => {
    const reasons = buildReasoning({ 0: 0, 2: 2, 99: 0 });
    expect(reasons).toHaveLength(2);
    expect(reasons[0]).toMatchObject({ questionId: 1, targetCourse: "vibe-coding-express" });
    expect(reasons[1]).toMatchObject({ questionId: 3, targetCourse: "ai-asoslari" });
  });

  it("summarizes the recommendation with the winning score", () => {
    const summary = recommendationSummary("ai-asoslari", { express: 2, basics: 8, total: 10 });
    expect(summary).toContain("AI Asoslari");
    expect(summary).toContain("8 ball");
  });

  it("validates raw answers payloads with zod", () => {
    expect(quizAnswersSchema.safeParse({ 0: 1, 2: 0 }).success).toBe(true);
    expect(quizAnswersSchema.safeParse({ 0: -1 }).success).toBe(false);
    expect(quizAnswersSchema.safeParse("not-an-object").success).toBe(false);
  });

  it("keeps every question answerable with at least two options", () => {
    expect(QUIZ_QUESTIONS.length).toBeGreaterThanOrEqual(5);
    for (const question of QUIZ_QUESTIONS) {
      expect(question.options.length).toBeGreaterThanOrEqual(2);
    }
  });
});
