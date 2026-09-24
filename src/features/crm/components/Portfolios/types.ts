import type { PortfolioItem } from "@/features/portfolio/portfolioData";
import type { PortfolioStatus } from "@/lib/validations/portfolio";

export type PortfolioCategory = PortfolioItem["category"];

export type PortfolioFormData = {
  title: string;
  slug: string;
  url: string;
  domain: string;
  category: PortfolioCategory;
  description: string;
  imageUrl: string;
  coverUrl: string;
  liveUrl: string;
  repoUrl: string;
  userCount: string;
  badgeText: string;
  isFeatured: boolean;
  featuredRank: number | null;
  sortOrder: number;
  ownership: PortfolioItem["ownership"];
  status: PortfolioStatus;
  techStack: string;
  highlights: string;
  publishedAt: string;
};
