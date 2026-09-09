import { z } from "zod";

export const PORTFOLIO_CATEGORIES = [
  "Startup MVP",
  "EdTech",
  "AI Bot",
  "B2B SaaS",
] as const;

export const portfolioSchema = z.object({
  title: z.string().min(2, "Sarlavha kamida 2 belgidan iborat bo'lishi kerak"),
  slug: z
    .string()
    .min(2, "Slug kamida 2 belgidan iborat bo'lishi kerak")
    .regex(/^[a-z0-9-]+$/, "Slug faqat kichik harflar, raqamlar va '-' dan iborat bo'lishi kerak"),
  url: z.string().url("Noto'g'ri URL formati"),
  domain: z.string().min(3, "Domen nomi kiritilishi shart"),
  category: z.enum(PORTFOLIO_CATEGORIES).default("Startup MVP"),
  description: z.string().min(5, "Tavsif kiritilishi shart"),
  imageUrl: z.string().min(1, "Rasm havolasi ko'rsatilishi shart"),
  userCount: z.string().optional().nullable(),
  badgeText: z.string().default("Shu metod bilan qurilgan"),
  isFeatured: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export const portfolioUpdateSchema = portfolioSchema.partial();

export type PortfolioInput = z.infer<typeof portfolioSchema>;
export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;
