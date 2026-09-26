/**
 * Pure rules for the student pay page (/kabinet/to-lovlar).
 *
 * No I/O here: the cohort lookup happens server-side in
 * `server/checkout-target.service.ts`, this module only decides WHICH
 * course is offered and WHAT the checkout request targets.
 */

/** The course sold by default (the primary/flagship course in siteConfig). */
export const PRIMARY_COURSE_SLUG = "vibe-coding-express";

export interface CourseOffer {
  slug: string;
  title: string;
  /** Price text, straight from siteConfig — never a number typed in a component. */
  price: string;
  installment: string;
}

export type CheckoutTargetState = "enrollment" | "cohort" | "waitlist";

export interface CheckoutTarget {
  state: CheckoutTargetState;
  enrollmentId: string | null;
  cohortId: string | null;
}

export const WAITLIST_TARGET: CheckoutTarget = {
  state: "waitlist",
  enrollmentId: null,
  cohortId: null,
};

/**
 * The pay page link for a course. The slug travels in the query so the page
 * can show the chosen course; logged-out visitors are sent through login with
 * the same URL as the redirect target.
 */
export function buildCheckoutHref(courseSlug: string): string {
  return `/kabinet/to-lovlar?course=${encodeURIComponent(courseSlug)}`;
}

/**
 * Resolve the requested course to a real offer. An unknown or missing slug
 * falls back to the primary course instead of rendering an empty pay box.
 */
export function resolveCourseOffer(
  requestedSlug: string | null | undefined,
  offers: CourseOffer[],
): CourseOffer {
  const requested = offers.find((offer) => offer.slug === requestedSlug);
  if (requested) return requested;
  const primary = offers.find((offer) => offer.slug === PRIMARY_COURSE_SLUG) ?? offers[0];
  if (!primary) throw new Error("Kurslar ro'yxati bo'sh");
  return primary;
}

/**
 * A new student has no enrollment, so checkout must carry the cohort id:
 * the server then creates the pending enrollment and prices the payment from
 * that cohort (checkout.service.ts). With no open cohort there is nothing
 * payable — the honest waitlist state, never a pay button.
 */
export function resolveCheckoutTarget(input: {
  enrollmentId: string | null;
  cohortId: string | null;
}): CheckoutTarget {
  if (input.enrollmentId) {
    return { state: "enrollment", enrollmentId: input.enrollmentId, cohortId: input.cohortId };
  }
  if (input.cohortId) {
    return { state: "cohort", enrollmentId: null, cohortId: input.cohortId };
  }
  return WAITLIST_TARGET;
}
