import { z } from "zod";

export const PORTFOLIO_CATEGORIES = ["Startup MVP", "EdTech", "AI Bot", "B2B SaaS"] as const;
export const PORTFOLIO_OWNERSHIPS = ["owner", "student", "client", "demo"] as const;
export const PORTFOLIO_STATUSES = ["published", "draft", "hidden"] as const;
export const MAX_FEATURED_PORTFOLIOS = 3;
export const portfolioCategorySchema = z.enum(PORTFOLIO_CATEGORIES);
export const portfolioOwnershipSchema = z.enum(PORTFOLIO_OWNERSHIPS);
export const portfolioStatusSchema = z.enum(PORTFOLIO_STATUSES);

const optionalHttpUrl = z.union([z.string().url("Noto'g'ri URL formati"), z.literal("")]).optional();
const stringList = z.array(z.string().trim().min(1).max(120)).max(12).default([]);

export const rawPortfolioSchema = z.object({
  title: z.string().trim().min(2, "Sarlavha kamida 2 belgidan iborat bo'lishi kerak").max(120),
  slug: z.string().trim().min(2, "Slug kamida 2 belgidan iborat bo'lishi kerak").max(120)
    .regex(/^[a-z0-9-]+$/, "Slug faqat kichik harflar, raqamlar va '-' dan iborat bo'lishi kerak"),
  url: z.string().url("Noto'g'ri URL formati"),
  domain: z.string().trim().min(3, "Domen nomi kiritilishi shart").max(200),
  category: z.enum(PORTFOLIO_CATEGORIES),
  description: z.string().trim().min(5, "Tavsif kiritilishi shart").max(1200),
  imageUrl: z.string().default(""),
  coverUrl: optionalHttpUrl,
  liveUrl: optionalHttpUrl,
  repoUrl: optionalHttpUrl,
  userCount: z.string().trim().max(160).optional().nullable(),
  badgeText: z.string().trim().min(1).max(100),
  isFeatured: z.boolean(),
  featuredRank: z.number().int().min(1).max(3).nullable().optional(),
  sortOrder: z.number().int().min(0).max(100000),
  ownership: z.enum(PORTFOLIO_OWNERSHIPS),
  status: z.enum(PORTFOLIO_STATUSES),
  techStack: stringList,
  highlights: stringList,
  publishedAt: z.string().datetime().nullable().optional(),
});

export const portfolioSchema = rawPortfolioSchema.extend({
  category: z.enum(PORTFOLIO_CATEGORIES).default("Startup MVP"),
  imageUrl: z.string().default(""),
  coverUrl: optionalHttpUrl.default(""),
  liveUrl: optionalHttpUrl.default(""),
  repoUrl: optionalHttpUrl.default(""),
  badgeText: z.string().trim().min(1).max(100).default("Naqsh metodi bilan qurilgan"),
  isFeatured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(100000).default(0),
  ownership: z.enum(PORTFOLIO_OWNERSHIPS).default("owner"),
  status: z.enum(PORTFOLIO_STATUSES).default("draft"),
  techStack: stringList,
  highlights: stringList,
  publishedAt: z.string().datetime().nullable().optional(),
});

export const portfolioUpdateSchema = rawPortfolioSchema.partial();
export const portfolioListQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  ownership: z.enum(PORTFOLIO_OWNERSHIPS).optional(),
});

export const portfolioItemSchema = portfolioSchema.extend({
  id: z.string().min(1),
  sortOrder: z.number().int(),
  featuredRank: z.number().int().nullable(),
});
export const portfolioListResponseSchema = z.object({
  success: z.literal(true),
  portfolios: z.array(portfolioItemSchema),
  total: z.number().int().nonnegative(),
});
export const portfolioWriteResponseSchema = z.object({
  success: z.literal(true),
  portfolio: portfolioItemSchema.optional(),
  message: z.string().optional(),
});
export type PortfolioItemResponse = z.infer<typeof portfolioItemSchema>;


export type PortfolioInput = z.infer<typeof portfolioSchema>;
export type PortfolioUpdateInput = z.infer<typeof portfolioUpdateSchema>;
export type PortfolioOwnership = (typeof PORTFOLIO_OWNERSHIPS)[number];
export type PortfolioStatus = (typeof PORTFOLIO_STATUSES)[number];
