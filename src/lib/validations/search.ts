import { z } from "zod";

export const searchCategoryEnum = z.enum(["all", "courses", "glossary", "resources", "blog"]);

export type SearchCategory = z.infer<typeof searchCategoryEnum>;

export const searchQuerySchema = z.object({
  q: z.string().min(1, "Qidiruv so'zi kiritilishi kerak"),
  category: searchCategoryEnum.default("all"),
  limit: z.number().int().min(1).max(50).default(20),
});

export type SearchQueryInput = z.infer<typeof searchQuerySchema>;

export const searchItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(["course", "glossary", "resource", "blog"]),
  url: z.string(),
  badge: z.string().optional(),
  icon: z.string().optional(),
});

export type SearchItem = z.infer<typeof searchItemSchema>;
