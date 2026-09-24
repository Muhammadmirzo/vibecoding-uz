/** Certificate eligibility policy (pure, no I/O). No default scores live here. */

export const MIN_PASS_SCORE = 7;

export interface EligibilityInput {
  isPaid: boolean;
  requiredLessons: number;
  completedLessons: number;
  assignmentsTotal: number;
  assignmentsPassed: number;
  averageScore: number | null;
}

export interface EligibilityOutcome {
  eligible: boolean;
  reasons: string[];
  score: number | null;
}

const UZ = {
  unpaid: "Sertifikat uchun kurs to'lovi to'langan bo'lishi shart",
  lessons: "Barcha majburiy darslar yakunlanmagan",
  homework: "Barcha uy vazifalari qabul qilinmagan",
  score: "Umumiy ball yetarli emas (kamida 7.0)",
} as const;

/**
 * All gates must pass: settled payment, every required lesson completed,
 * every assignment passed, server-derived average score >= 7.
 */
export function evaluateEligibility(input: EligibilityInput): EligibilityOutcome {
  const reasons: string[] = [];
  if (!input.isPaid) reasons.push(UZ.unpaid);
  if (input.requiredLessons <= 0 || input.completedLessons < input.requiredLessons) reasons.push(UZ.lessons);
  if (input.assignmentsTotal <= 0 || input.assignmentsPassed < input.assignmentsTotal) reasons.push(UZ.homework);
  const score = input.averageScore !== null ? Math.round(input.averageScore * 100) / 100 : null;
  if (score === null || score < MIN_PASS_SCORE) reasons.push(UZ.score);
  return { eligible: reasons.length === 0, reasons, score: reasons.length === 0 ? score : score };
}
