import { siteConfig } from "@/lib/siteConfig";
import type { CourseOffer } from "@/features/payments/domain/checkout-target";
import { COURSES } from "./content";

/**
 * Every course that has a price in siteConfig — the single price source.
 * The title comes from the course content (siteConfig holds prices only),
 * so the pay page never repeats a hardcoded course name.
 */
export function listCourseOffers(): CourseOffer[] {
  return Object.keys(siteConfig.courses).map((slug) => {
    const pricing = siteConfig.courses[slug as keyof typeof siteConfig.courses];
    const content = COURSES[slug];
    return {
      slug,
      title: content?.title ?? slug,
      price: pricing.price,
      installment: pricing.installment,
    };
  });
}
