import { z } from "zod";

export const siteConfigSchema = z.object({
  nextCohortDate: z.string(),
  nextCohortShortDate: z.string(),
  guaranteeDays: z.number(),
  guaranteeText: z.string(),
  sessionFormat: z.string(),
  stats: z.object({
    studentsCount: z.string(),
    yearsExperience: z.number(),
    yearsExperienceLabel: z.string(),
    liveStartupsCount: z.string(),
    projectsCount: z.string(),
  }),
  courses: z.record(
    z.object({
      price: z.string(),
      oldPrice: z.string(),
      installment: z.string(),
    })
  ),
});

export type SiteConfig = z.infer<typeof siteConfigSchema>;

export const siteConfig: SiteConfig = siteConfigSchema.parse({
  nextCohortDate: "15-Oktyabr, 2026",
  nextCohortShortDate: "15-Oktyabr",
  guaranteeDays: 7,
  guaranteeText: "7 kunlik 100% pul qaytarish kafolati",
  sessionFormat: "8 haftalik jonli sessiyalar va yozuvlar",
  // Fakt: 1 jonli loyiha (Clash Nexus). Talaba soni birinchi guruhdan keyin yangilanadi.
  stats: {
    studentsCount: "Birinchi guruh",
    yearsExperience: 0,
    yearsExperienceLabel: "Yangi",
    liveStartupsCount: "1",
    projectsCount: "1",
  },
  courses: {
    "vibe-coding-express": {
      price: "2 990 000 so'm",
      oldPrice: "3 990 000 so'm",
      installment: "996 000 so'm / oyiga (3 oy)",
    },
    "ai-asoslari": {
      price: "990 000 so'm",
      oldPrice: "1 490 000 so'm",
      installment: "495 000 so'm / oyiga (2 oy)",
    },
  },
});
