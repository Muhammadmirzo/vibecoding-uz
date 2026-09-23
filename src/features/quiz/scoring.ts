import { QUIZ_QUESTIONS } from "./quizData";

export type QuizCourse = "vibe-coding-express" | "ai-asoslari";
export type QuizAnswers = Record<number, number>;

export function calculateRecommendation(answers: QuizAnswers): QuizCourse {
  let expressScore = 0;
  let basicsScore = 0;

  Object.entries(answers).forEach(([questionIndex, optionIndex]) => {
    const option = QUIZ_QUESTIONS[Number(questionIndex)]?.options[optionIndex];
    if (!option) return;

    if (option.targetCourse === "vibe-coding-express") {
      expressScore += option.weight;
    } else {
      basicsScore += option.weight;
    }
  });

  return expressScore >= basicsScore ? "vibe-coding-express" : "ai-asoslari";
}
