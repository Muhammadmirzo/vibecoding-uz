import { COURSES } from "@/features/courses/content";
import { siteConfig } from "@/lib/siteConfig";

export function buildSiteFacts(): string {
  const courses = Object.values(COURSES).map((course) => {
    const pricing = siteConfig.courses[course.slug];
    const faq = course.faqs.map((item) => `Q: ${item.question} A: ${item.answer}`).join("\n");
    return [
      `Kurs: ${course.title}`,
      `Slug: /kurs/${course.slug}`,
      `Davomiyligi: ${course.duration}`,
      `Narxi: ${pricing.price}`,
      `Bo'lib to'lash: ${pricing.installment}`,
      `Keyingi guruh: ${siteConfig.nextCohortDate}`,
      `Tavsif: ${course.description}`,
      faq,
    ].join("\n");
  });
  return [
    `Maktab: Naqsh — ${siteConfig.servicesPage.eyebrow}`,
    `Kafolat: ${siteConfig.guaranteeText}. Shartlar: ${siteConfig.guaranteeTermsUrl}`,
    `Sessiya formati: ${siteConfig.sessionFormat}`,
    ...courses,
  ].join("\n\n---\n\n");
}
