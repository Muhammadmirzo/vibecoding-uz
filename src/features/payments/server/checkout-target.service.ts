import {
  resolveCheckoutTarget,
  type CheckoutTarget,
} from "../domain/checkout-target";
import { effectivePriceTiyin } from "../domain/policy";
import {
  findActiveEnrollmentId,
  findNextOpenCohortForCourse,
} from "./checkout-target.repository";

export interface CheckoutTargetResult extends CheckoutTarget {
  courseSlug: string;
  cohortStartsAt: Date | null;
  /**
   * Trusted amount in tiyin for this cohort — the same value
   * `createCheckout` recomputes server-side. The client amount is never used.
   */
  amountTiyin: number | null;
}

/**
 * Resolve what a student pays for on /kabinet/to-lovlar: the next open cohort
 * of the chosen course and, when they already have one, their enrollment in it.
 * A new student gets `state: "cohort"` (the server creates the pending
 * enrollment); no open cohort gives the honest waitlist state.
 */
export async function resolveCheckoutTargetForCourse(input: {
  userId: string;
  courseSlug: string;
  now?: Date;
}): Promise<CheckoutTargetResult> {
  const now = input.now ?? new Date();
  const cohort = await findNextOpenCohortForCourse(input.courseSlug, now);
  if (!cohort) {
    return {
      courseSlug: input.courseSlug,
      state: "waitlist",
      enrollmentId: null,
      cohortId: null,
      cohortStartsAt: null,
      amountTiyin: null,
    };
  }

  let amountTiyin: number;
  try {
    amountTiyin = effectivePriceTiyin(cohort, now).tiyin;
  } catch {
    // A cohort without a usable price is not sellable: no pay button, no
    // invented number — the page shows the waitlist state instead.
    return {
      courseSlug: input.courseSlug,
      state: "waitlist",
      enrollmentId: null,
      cohortId: null,
      cohortStartsAt: null,
      amountTiyin: null,
    };
  }

  const enrollmentId = await findActiveEnrollmentId(input.userId, cohort.cohortId);
  const target: CheckoutTarget = resolveCheckoutTarget({
    enrollmentId,
    cohortId: cohort.cohortId,
  });
  return {
    courseSlug: input.courseSlug,
    ...target,
    cohortStartsAt: cohort.startsAt,
    amountTiyin,
  };
}
