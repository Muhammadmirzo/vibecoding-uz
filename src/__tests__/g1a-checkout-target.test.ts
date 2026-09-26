import { describe, expect, it, vi } from "vitest";
import { listCourseOffers } from "@/features/courses/offers";
import { siteConfig } from "@/lib/siteConfig";
import { buildCheckoutHref, PRIMARY_COURSE_SLUG, resolveCheckoutTarget, resolveCourseOffer, WAITLIST_TARGET } from "@/features/payments/domain/checkout-target";
import { checkoutInputSchema } from "@/features/payments/server/checkout.service";

const COHORT_ID = "11111111-1111-4111-8111-111111111111";
const ENROLLMENT_ID = "22222222-2222-4222-8222-222222222222";
const NOW = new Date("2026-09-26T00:00:00Z");

describe("G1a: course offers come from siteConfig", () => {
  it("offers every priced course with a real title", () => {
    const offers = listCourseOffers();
    const express = offers.find((offer) => offer.slug === PRIMARY_COURSE_SLUG)!;
    expect(express.title).toBe("Vibe Coding Express");
    expect(express.price).toBe(siteConfig.courses[PRIMARY_COURSE_SLUG].price);
    expect(express.installment).toBe(siteConfig.courses[PRIMARY_COURSE_SLUG].installment);
    expect(offers.map((offer) => offer.slug)).toEqual(Object.keys(siteConfig.courses));
  });

  it("keeps the primary course as the default and follows a chosen slug", () => {
    const offers = listCourseOffers();
    expect(resolveCourseOffer(undefined, offers).slug).toBe(PRIMARY_COURSE_SLUG);
    expect(resolveCourseOffer("nope-not-a-course", offers).slug).toBe(PRIMARY_COURSE_SLUG);
    const basics = resolveCourseOffer("ai-asoslari", offers);
    expect(basics.slug).toBe("ai-asoslari");
    expect(basics.price).toBe(siteConfig.courses["ai-asoslari"].price);
  });
});

describe("G1a: checkout href carries the course slug", () => {
  it("builds the pay-page link for a course", () => {
    expect(buildCheckoutHref("ai-asoslari")).toBe("/kabinet/to-lovlar?course=ai-asoslari");
    expect(buildCheckoutHref(PRIMARY_COURSE_SLUG)).toBe(
      "/kabinet/to-lovlar?course=vibe-coding-express",
    );
  });
});

describe("G1a: checkout target for a new student", () => {
  it("targets the cohort when there is no enrollment", () => {
    expect(resolveCheckoutTarget({ enrollmentId: null, cohortId: COHORT_ID })).toEqual({
      state: "cohort",
      enrollmentId: null,
      cohortId: COHORT_ID,
    });
  });

  it("prefers an existing enrollment", () => {
    expect(resolveCheckoutTarget({ enrollmentId: ENROLLMENT_ID, cohortId: COHORT_ID }).state).toBe(
      "enrollment",
    );
  });

  it("falls back to the waitlist state with no open cohort", () => {
    expect(resolveCheckoutTarget({ enrollmentId: null, cohortId: null })).toEqual(WAITLIST_TARGET);
  });
});

describe("G1a: server-side cohort resolution", () => {
  it("returns the next open cohort and the student's own enrollment", async () => {
    vi.resetModules();
    vi.doMock("@/features/payments/server/checkout-target.repository", () => ({
      findNextOpenCohortForCourse: vi.fn(async () => ({
        cohortId: COHORT_ID,
        startsAt: new Date("2026-10-15T00:00:00Z"),
        priceSum: "550000.00",
      })),
      findActiveEnrollmentId: vi.fn(async () => null),
    }));
    const { resolveCheckoutTargetForCourse } = await import(
      "@/features/payments/server/checkout-target.service"
    );
    const result = await resolveCheckoutTargetForCourse({
      userId: "user-1",
      courseSlug: PRIMARY_COURSE_SLUG,
      now: NOW,
    });
    expect(result).toMatchObject({
      state: "cohort",
      cohortId: COHORT_ID,
      enrollmentId: null,
      amountTiyin: 55_000_000,
    });
    vi.doUnmock("@/features/payments/server/checkout-target.repository");
    vi.resetModules();
  });

  it("reports the waitlist state when the course has no open cohort", async () => {
    vi.resetModules();
    vi.doMock("@/features/payments/server/checkout-target.repository", () => ({
      findNextOpenCohortForCourse: vi.fn(async () => null),
      findActiveEnrollmentId: vi.fn(async () => null),
    }));
    const { resolveCheckoutTargetForCourse } = await import(
      "@/features/payments/server/checkout-target.service"
    );
    const result = await resolveCheckoutTargetForCourse({
      userId: "user-1",
      courseSlug: PRIMARY_COURSE_SLUG,
      now: NOW,
    });
    expect(result).toMatchObject({ state: "waitlist", cohortId: null, amountTiyin: null });
    vi.doUnmock("@/features/payments/server/checkout-target.repository");
    vi.resetModules();
  });

  it("refuses to sell a cohort whose price is not set", async () => {
    vi.resetModules();
    vi.doMock("@/features/payments/server/checkout-target.repository", () => ({
      findNextOpenCohortForCourse: vi.fn(async () => ({
        cohortId: COHORT_ID,
        startsAt: new Date("2026-10-15T00:00:00Z"),
        priceSum: "0.00",
      })),
      findActiveEnrollmentId: vi.fn(async () => null),
    }));
    const { resolveCheckoutTargetForCourse } = await import(
      "@/features/payments/server/checkout-target.service"
    );
    const result = await resolveCheckoutTargetForCourse({
      userId: "user-1",
      courseSlug: PRIMARY_COURSE_SLUG,
      now: NOW,
    });
    expect(result.state).toBe("waitlist");
    expect(result.amountTiyin).toBeNull();
    vi.doUnmock("@/features/payments/server/checkout-target.repository");
    vi.resetModules();
  });
});

describe("G1a: the client amount never reaches the charge", () => {
  it("strips a tampered amountSum at the checkout boundary", () => {
    const parsed = checkoutInputSchema.safeParse({
      provider: "payme",
      cohortId: COHORT_ID,
      installmentMonth: 1,
      amountSum: 1,
    });
    expect(parsed.success).toBe(true);
    if (!parsed.success) return;
    expect("amountSum" in parsed.data).toBe(false);
    expect(parsed.data.cohortId).toBe(COHORT_ID);
  });

  it("still requires an enrollment or a cohort", () => {
    const parsed = checkoutInputSchema.safeParse({ provider: "payme", amountSum: 1 });
    expect(parsed.success).toBe(false);
  });
});
