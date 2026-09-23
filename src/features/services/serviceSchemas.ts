import { z } from "zod";

const nonEmptyText = z.string().trim().min(1, "Matn bo'sh bo'lmasligi kerak");

export const serviceOfferSchema = z
  .object({
    id: nonEmptyText,
    title: nonEmptyText,
    summary: nonEmptyText,
    priceRange: z.object({
      min: z.number().int().positive(),
      max: z.number().int().positive(),
    }).refine(({ min, max }) => min <= max, {
      message: "Narx diapazoni noto'g'ri",
    }),
    deliverables: z.array(nonEmptyText).min(1),
    timeline: nonEmptyText,
    suitableFor: z.array(nonEmptyText).min(1),
    notSuitableFor: z.array(nonEmptyText).min(1),
    excluded: z.array(nonEmptyText).min(1),
  })
  .strict();

export const servicesCatalogSchema = z.object({
  offers: z.array(serviceOfferSchema).length(3),
});

export const servicesPageCopySchema = z.object({
  eyebrow: nonEmptyText,
  title: nonEmptyText,
  promise: nonEmptyText,
  ctaLabel: nonEmptyText,
  telegramUrl: z.string().url(),
  portfolioLabel: nonEmptyText,
  process: z.tuple([
    z.object({ title: nonEmptyText, description: nonEmptyText }),
    z.object({ title: nonEmptyText, description: nonEmptyText }),
    z.object({ title: nonEmptyText, description: nonEmptyText }),
  ]),
  faq: z.array(z.object({ question: nonEmptyText, answer: nonEmptyText })).length(4),
  trustText: nonEmptyText,
});

export type ServiceOffer = z.infer<typeof serviceOfferSchema>;
export type ServicesCatalog = z.infer<typeof servicesCatalogSchema>;
