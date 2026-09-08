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
  nextCohortDate: "15-Oktyabr, 2026", // TODO(mirzo): real qiymatni tasdiqlang
  nextCohortShortDate: "15-Oktyabr", // TODO(mirzo): real qiymatni tasdiqlang
  guaranteeDays: 7, // TODO(mirzo): real qiymatni tasdiqlang
  guaranteeText: "7 kunlik 100% pul qaytarish kafolati", // TODO(mirzo): real qiymatni tasdiqlang
  sessionFormat: "8 haftalik jonli sessiyalar va yozuvlar", // TODO(mirzo): real qiymatni tasdiqlang
  stats: {
    studentsCount: "250+", // TODO(mirzo): real qiymatni tasdiqlang
    yearsExperience: 7, // TODO(mirzo): real qiymatni tasdiqlang
    yearsExperienceLabel: "7 yil", // TODO(mirzo): real qiymatni tasdiqlang
    liveStartupsCount: "3", // TODO(mirzo): real qiymatni tasdiqlang
    projectsCount: "100+", // TODO(mirzo): real qiymatni tasdiqlang
  },
  courses: {
    "vibe-coding-express": {
      price: "2 990 000 so'm", // TODO(mirzo): real qiymatni tasdiqlang
      oldPrice: "3 990 000 so'm", // TODO(mirzo): real qiymatni tasdiqlang
      installment: "996 000 so'm / oyiga (3 oy)", // TODO(mirzo): real qiymatni tasdiqlang
    },
    "ai-asoslari": {
      price: "990 000 so'm", // TODO(mirzo): real qiymatni tasdiqlang
      oldPrice: "1 490 000 so'm", // TODO(mirzo): real qiymatni tasdiqlang
      installment: "495 000 so'm / oyiga (2 oy)", // TODO(mirzo): real qiymatni tasdiqlang
    },
  },
});
