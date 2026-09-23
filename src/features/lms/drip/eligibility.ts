import type { DripAccessResult } from "@/lib/validations";

interface EligibilityLesson {
  dripRule: "none" | "date" | "after_lesson";
  dripValue: string | null;
}

interface EligibilityContext {
  cohortStartsAt: Date | null;
  enrolledAt: Date;
  now: Date;
}

/** Evaluates the pure cohort/date eligibility rules. */
export function evaluateEligibility(
  lesson: EligibilityLesson,
  context: EligibilityContext
): DripAccessResult | null {
  if (context.cohortStartsAt && context.cohortStartsAt > context.now) {
    return {
      unlocked: false,
      reason: "cohort_not_started",
      availableAt: context.cohortStartsAt,
      message: `Guruh darslari ${context.cohortStartsAt.toLocaleDateString("uz-UZ")} sanasidan boshlanadi.`,
    };
  }

  if (lesson.dripRule === "none") {
    return {
      unlocked: true,
      reason: "unlocked",
      message: "Dars ochiq.",
    };
  }

  if (lesson.dripRule === "date") {
    let unlockDate: Date | null = null;
    if (lesson.dripValue) {
      const parsedDate = new Date(lesson.dripValue);
      if (!isNaN(parsedDate.getTime())) {
        unlockDate = parsedDate;
      } else {
        const daysOffset = parseInt(lesson.dripValue.replace(/[^\d]/g, ""), 10);
        if (!isNaN(daysOffset)) {
          const baseDate = context.cohortStartsAt || new Date(context.enrolledAt);
          unlockDate = new Date(baseDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
        }
      }
    }

    if (unlockDate && context.now < unlockDate) {
      return {
        unlocked: false,
        reason: "scheduled_date",
        availableAt: unlockDate,
        message: `Ushbu dars ${unlockDate.toLocaleDateString("uz-UZ")} sanasida ochiladi.`,
      };
    }

    return {
      unlocked: true,
      reason: "unlocked",
      availableAt: unlockDate || undefined,
      message: "Dars ochiq.",
    };
  }

  return null;
}
