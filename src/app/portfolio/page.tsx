import type { Metadata } from "next";
import { PortfolioGallery } from "./PortfolioGallery";
import { getPublicPortfolios } from "@/features/portfolio/server/portfolio.service";

export const metadata: Metadata = {
  title: "Portfolio — AI bilan qurilgan loyihalar | Naqsh",
  description: "Tekshirilgan asosiy loyihalar, talabalar va mijozlar loyihalarini ko'rib chiqing.",
};

export default async function PortfolioPage() {
  const { portfolios } = await getPublicPortfolios();
  return <PortfolioGallery items={portfolios} />;
}
