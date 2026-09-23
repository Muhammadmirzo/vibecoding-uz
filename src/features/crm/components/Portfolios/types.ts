import type { PortfolioItem } from "@/features/portfolio/portfolioData";

export type PortfolioCategory = PortfolioItem["category"];

export type PortfolioFormData = {
  title: string;
  slug: string;
  url: string;
  domain: string;
  category: PortfolioCategory;
  description: string;
  imageUrl: string;
  userCount: string;
  badgeText: string;
  isFeatured: boolean;
  sortOrder: number;
};
